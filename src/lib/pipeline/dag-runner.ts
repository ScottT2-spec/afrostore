import crypto from "crypto";
import { prisma } from "@/lib/db";
import { withSlot } from "./concurrency";

/**
 * A production DAG runner for the AI generation pipeline (copy -> images ->
 * blocks/code -> sandbox), built for the specific failure modes that matter
 * at real scale rather than a generic workflow-engine abstraction:
 *
 * 1. CRASH SAFETY: every step's result is persisted to PipelineStepRun
 *    before moving on. If the process dies mid-run (deploy, OOM, crash),
 *    calling runPipeline() again with the same runId resumes from the last
 *    completed step instead of starting over and re-billing every AI call.
 *
 * 2. EDIT-AWARE RERUNS: invalidateSteps() clears a step and everything that
 *    transitively depends on it, so "regenerate just the hero image" only
 *    reruns that node plus whatever's downstream of it - not the whole
 *    pipeline, not another full LLM call for copy that didn't change.
 *
 * 3. BOUNDED EXTERNAL LOAD: each step declares a `resource` bucket (e.g.
 *    "image-gen", "llm", "sandbox") with its own concurrency limit, enforced
 *    globally across all app instances via the Redis-backed semaphore in
 *    concurrency.ts - so 500k users hammering "generate site" concurrently
 *    can't take down your Gemini/Daytona rate limits, they just queue.
 *
 * 4. FAILURE ISOLATION: a step can be marked `optional` - if it fails after
 *    retries, the run continues and its dependents receive `null` for that
 *    input instead of the whole pipeline aborting (e.g. one image failing
 *    to generate shouldn't block the entire site from finishing).
 */

export interface StepDefinition<TOutput = unknown> {
  id: string;
  dependsOn: string[];
  /** Concurrency bucket this step's execution is limited under. Steps with no shared resource run fully in parallel. */
  resource: string;
  /** Max concurrent holders of `resource`, enforced globally via Redis. */
  resourceLimit: number;
  /** Safety ceiling for the concurrency slot - should exceed timeoutMs so a legitimately-running step is never mistaken for an abandoned one. */
  maxHoldMs?: number;
  maxRetries?: number;
  timeoutMs?: number;
  /** If true, failure after retries doesn't fail the whole run - dependents get `null` for this step's output. */
  optional?: boolean;
  run: (inputs: Record<string, unknown>) => Promise<TOutput>;
}

interface PipelineStepRunRow {
  stepId: string;
  status: string;
  inputHash: string;
  output: unknown;
}

interface PipelineRunRow {
  id: string;
  steps: PipelineStepRunRow[];
}

export interface PipelineResult {
  runId: string;
  status: "completed" | "failed";
  outputs: Record<string, unknown>;
  error?: string;
}

function validateGraph(steps: StepDefinition[]): void {
  const ids = new Set(steps.map((s) => s.id));
  if (ids.size !== steps.length) throw new Error("Duplicate step ids in pipeline definition");
  for (const step of steps) {
    for (const dep of step.dependsOn) {
      if (!ids.has(dep)) throw new Error(`Step "${step.id}" depends on unknown step "${dep}"`);
    }
  }
  // Cycle detection via DFS three-color marking.
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>(steps.map((s) => [s.id, WHITE]));
  const byId = new Map(steps.map((s) => [s.id, s]));
  function visit(id: string, path: string[]): void {
    color.set(id, GRAY);
    for (const dep of byId.get(id)!.dependsOn) {
      if (color.get(dep) === GRAY) throw new Error(`Cycle detected in pipeline: ${[...path, dep].join(" -> ")}`);
      if (color.get(dep) === WHITE) visit(dep, [...path, dep]);
    }
    color.set(id, BLACK);
  }
  for (const step of steps) {
    if (color.get(step.id) === WHITE) visit(step.id, [step.id]);
  }
}

function hashInput(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Step "${label}" timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Runs a pipeline to completion (or failure), persisting progress as it
 * goes. Pass an existing `runId` to resume a crashed/incomplete run -
 * already-completed steps are skipped and their cached output reused.
 */
export async function runPipeline(
  steps: StepDefinition[],
  opts: { siteId: string; input: Record<string, unknown>; runId?: string }
): Promise<PipelineResult> {
  validateGraph(steps);

  const run: PipelineRunRow = opts.runId
    ? await prisma.pipelineRun.findUniqueOrThrow({ where: { id: opts.runId }, include: { steps: true } })
    : await prisma.pipelineRun.create({ data: { siteId: opts.siteId, input: opts.input, status: "running" }, include: { steps: true } });

  const outputs: Record<string, unknown> = {};
  const stepStatus = new Map<string, "pending" | "running" | "completed" | "failed" | "skipped">();
  for (const s of steps) stepStatus.set(s.id, "pending");

  // Seed from any already-persisted results - this is what makes resuming
  // a crashed run free instead of re-running (and re-billing) every step.
  // Each cached result's inputHash is re-checked against what its inputs
  // would hash to right now before being trusted - guards against a
  // deploy changing a step's dependencies/logic between the crash and the
  // resume, which would otherwise let a genuinely-stale cached result
  // silently flow into the rest of the run.
  //
  // Processed as a multi-pass fixed-point rather than a single loop over
  // `run.steps` (arbitrary DB row order) - a step's cached result can only
  // be validated once its dependencies have themselves already been
  // seeded, which single-pass, DB-order iteration doesn't guarantee.
  const existingById = new Map(run.steps.map((s) => [s.stepId, s]));
  let seededSomething = true;
  while (seededSomething) {
    seededSomething = false;
    for (const step of steps) {
      if (stepStatus.get(step.id) !== "pending") continue; // already seeded this pass or earlier
      const existing = existingById.get(step.id);
      if (!existing || (existing.status !== "completed" && existing.status !== "skipped")) continue;
      if (existing.status === "skipped") {
        outputs[step.id] = null;
        stepStatus.set(step.id, "skipped");
        seededSomething = true;
        continue;
      }
      // Only seed once every dependency has itself already been resolved
      // (completed/skipped) - otherwise wait for a later pass.
      if (!step.dependsOn.every((d) => stepStatus.get(d) === "completed" || stepStatus.get(d) === "skipped")) continue;
      const wouldBeInputs: Record<string, unknown> = { __input: opts.input };
      for (const dep of step.dependsOn) wouldBeInputs[dep] = outputs[dep];
      if (hashInput(wouldBeInputs) === existing.inputHash) {
        outputs[step.id] = existing.output;
        stepStatus.set(step.id, "completed");
        seededSomething = true;
      }
      // Hash mismatch: leave as "pending" so it reruns with today's real
      // inputs instead of trusting stale output from different upstream
      // conditions. Not marked as "seeded" - it falls through to the
      // normal scheduling loop below like any fresh step.
    }
  }

  let hardFailure: string | undefined;
  const inFlight = new Map<string, Promise<void>>();

  function resolveInputs(step: StepDefinition): Record<string, unknown> {
    // Every step gets the pipeline's original input under __input,
    // regardless of its dependsOn - this is what lets a step (e.g. one
    // needing the store's name for an image prompt) reach the original
    // request without a fake dependency edge on something it doesn't
    // actually need to wait on.
    const resolved: Record<string, unknown> = { __input: opts.input };
    for (const dep of step.dependsOn) resolved[dep] = outputs[dep];
    return resolved;
  }

  function isReady(step: StepDefinition): boolean {
    if (stepStatus.get(step.id) !== "pending") return false;
    return step.dependsOn.every((dep) => {
      const s = stepStatus.get(dep);
      return s === "completed" || s === "skipped";
    });
  }

  function propagateSkip(stepId: string): void {
    for (const s of steps) {
      if (s.dependsOn.includes(stepId) && stepStatus.get(s.id) === "pending") {
        stepStatus.set(s.id, "skipped");
        outputs[s.id] = null;
        propagateSkip(s.id);
      }
    }
  }

  async function runStep(step: StepDefinition): Promise<void> {
    stepStatus.set(step.id, "running");
    const resolvedInputs = resolveInputs(step);
    const inputHash = hashInput(resolvedInputs);
    const maxRetries = step.maxRetries ?? 2;
    const timeoutMs = step.timeoutMs ?? 60_000;
    const maxHoldMs = step.maxHoldMs ?? timeoutMs * 2;

    await prisma.pipelineStepRun.upsert({
      where: { runId_stepId: { runId: run.id, stepId: step.id } },
      create: { runId: run.id, stepId: step.id, status: "running", inputHash, attempts: 1, startedAt: new Date() },
      update: { status: "running", inputHash, attempts: { increment: 1 }, startedAt: new Date() },
    });

    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const output = await withSlot(step.resource, { limit: step.resourceLimit, maxHoldMs }, () =>
          withTimeout(step.run(resolvedInputs), timeoutMs, step.id)
        );
        outputs[step.id] = output;
        stepStatus.set(step.id, "completed");
        await prisma.pipelineStepRun.update({
          where: { runId_stepId: { runId: run.id, stepId: step.id } },
          data: { status: "completed", output: output as never, completedAt: new Date() },
        });
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          // Exponential backoff with jitter - avoids every failed step in
          // a large batch retrying in lockstep and re-spiking the same
          // rate limit that likely caused the failure in the first place.
          await sleep(Math.min(500 * 2 ** attempt, 8000) + Math.random() * 250);
        }
      }
    }

    const message = lastError?.message || "Unknown step failure";
    if (step.optional) {
      outputs[step.id] = null;
      stepStatus.set(step.id, "skipped");
      await prisma.pipelineStepRun.update({
        where: { runId_stepId: { runId: run.id, stepId: step.id } },
        data: { status: "skipped", error: message, completedAt: new Date() },
      });
      return;
    }

    stepStatus.set(step.id, "failed");
    hardFailure = `Step "${step.id}" failed: ${message}`;
    await prisma.pipelineStepRun.update({
      where: { runId_stepId: { runId: run.id, stepId: step.id } },
      data: { status: "failed", error: message, completedAt: new Date() },
    });
    propagateSkip(step.id);
  }

  // Main scheduling loop: repeatedly launch every currently-ready step in
  // parallel, wait for at least one to finish, repeat. Steps sharing a
  // `resource` bucket still self-limit via withSlot even though they're
  // all "launched" concurrently here - the semaphore is what actually
  // bounds real concurrent execution, not this loop.
  while (true) {
    const ready = steps.filter(isReady);
    for (const step of ready) {
      if (!inFlight.has(step.id)) {
        inFlight.set(step.id, runStep(step));
      }
    }

    const stillPending = steps.some((s) => stepStatus.get(s.id) === "pending");
    const anyRunning = [...inFlight.entries()].some(([id]) => stepStatus.get(id) === "running");
    if (!stillPending && !anyRunning) break;

    if (inFlight.size > 0) {
      await Promise.race([...inFlight.values()]);
      // Drop settled entries so completed steps whose dependents just
      // became ready get evaluated on the next loop iteration.
      for (const [id] of inFlight) {
        const s = stepStatus.get(id);
        if (s === "completed" || s === "failed" || s === "skipped") inFlight.delete(id);
      }
    } else if (stillPending) {
      // No step is ready and nothing is in flight, but steps remain
      // pending - only reachable if validateGraph() missed a cycle, which
      // it shouldn't, but this prevents a silent infinite loop if it ever
      // does.
      hardFailure = "Pipeline stalled: remaining steps are unreachable (unexpected - check for a cycle)";
      break;
    }
  }

  const finalStatus = hardFailure ? "failed" : "completed";
  await prisma.pipelineRun.update({
    where: { id: run.id },
    data: { status: finalStatus, error: hardFailure ?? null },
  });

  return { runId: run.id, status: finalStatus, outputs, error: hardFailure };
}

/**
 * Clears a step's cached result plus every step that transitively depends
 * on it, so the next runPipeline() call with the same runId only recomputes
 * what actually needs to change - the "edit just the hero image" story.
 */
export async function invalidateSteps(steps: StepDefinition[], runId: string, stepIds: string[]): Promise<void> {
  validateGraph(steps);
  const toInvalidate = new Set<string>(stepIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of steps) {
      if (!toInvalidate.has(step.id) && step.dependsOn.some((d) => toInvalidate.has(d))) {
        toInvalidate.add(step.id);
        changed = true;
      }
    }
  }
  await prisma.pipelineStepRun.deleteMany({ where: { runId, stepId: { in: [...toInvalidate] } } });
}
