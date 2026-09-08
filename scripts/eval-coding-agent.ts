/**
 * Golden-path eval harness for the AI coding agent.
 *
 * Why this exists: live testing ("seems to work when I tried it") doesn't
 * tell you the actual failure rate across your real merchant distribution,
 * and doesn't catch a quality regression when someone tweaks the system
 * prompt, swaps a model, or changes the scaffold. This runs a fixed set of
 * representative merchant requests through the real pipeline (real
 * sandbox, real AI calls, real build) every time it's invoked, so you can
 * diff today's results against last week's instead of guessing.
 *
 * Every run is tagged source: "eval" in CodingAgentRun, so these never
 * pollute real usage stats, and can be queried/excluded separately.
 *
 * HONESTY NOTE: this was written and typechecked but never actually
 * executed end-to-end - the sandbox this was built in has no network path
 * to a live Daytona instance or any AI provider's API. Review the actual
 * output of a first real run carefully rather than assuming it's correct
 * just because it typechecks.
 *
 * Usage: npx tsx scripts/eval-coding-agent.ts
 */

import { AIFailover, AICapability, type AIProviderConfig } from "@/lib/failover";
import { prisma } from "@/lib/db";
import { runCodingAgent } from "@/lib/coding-agent";
import { createProjectSandbox } from "@/lib/sandbox/scaffold";
import { stopSandbox, takeSandboxScreenshot } from "@/lib/sandbox/daytona";

// A small, representative spread of merchant business types and requests -
// not exhaustive, but enough to catch "this business type's request comes
// out badly" without needing an enormous, slow suite. Add to this as real
// merchant usage reveals categories worth covering.
const GOLDEN_CASES: { businessType: string; task: string }[] = [
  {
    businessType: "bakery",
    task: "Build a homepage for a small artisan bakery called 'Maple & Grain'. Include a hero section, a feature grid highlighting 3 signature products (sourdough, croissants, custom cakes), and a call-to-action to place an order.",
  },
  {
    businessType: "consulting",
    task: "Build a homepage for a business consulting firm called 'Ridgeline Advisory'. Include a hero section, a feature grid of 3 services (strategy, operations, growth), and a testimonials section with 2 client quotes.",
  },
  {
    businessType: "fashion",
    task: "Build a homepage for a boutique clothing brand called 'Solene'. Include a hero section with a strong visual focus, and an FAQ section covering shipping and returns.",
  },
  {
    businessType: "fitness",
    task: "Build a homepage for a personal training studio called 'Forge Fitness'. Include a hero section, a feature grid of 3 program types (strength, mobility, nutrition coaching), and a call-to-action to book a free consultation.",
  },
  {
    businessType: "general",
    task: "Build a homepage for a local hardware store called 'Pearson's Hardware'. Include a hero section and a feature grid of 3 things that make them different from a big-box store.",
  },
];

interface EvalResult {
  businessType: string;
  task: string;
  status: "passed" | "failed" | "error";
  iterations?: number;
  failedChecks?: string[];
  summary?: string;
  error?: string;
  screenshotBase64?: string;
}

function getEvalAI(): AIFailover {
  const providers: AIProviderConfig[] = [];
  if (process.env.OPENAI_API_KEY) {
    providers.push({ provider: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o", capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING] });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({ provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-sonnet-20241022", capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING] });
  }
  if (process.env.GOOGLE_AI_KEY) {
    providers.push({ provider: "google", apiKey: process.env.GOOGLE_AI_KEY, model: "gemini-2.0-flash", capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING] });
  }
  if (providers.length === 0) throw new Error("No AI provider configured (need OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY)");
  return new AIFailover({
    providers,
    priorityOrder: providers.map((p) => p.provider),
    circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
    healthCheckIntervalMs: 0,
    requestTimeoutMs: 90_000,
  });
}

/** Reuses one fixed eval site across runs instead of creating a new one every time - keeps the DB from accumulating throwaway rows on every eval run. */
async function getOrCreateEvalSite(): Promise<string> {
  const EVAL_SLUG = "internal-eval-harness-fixed";
  const existing = await prisma.site.findUnique({ where: { slug: EVAL_SLUG } });
  if (existing) return existing.id;

  const EVAL_USER_EMAIL = "eval-harness@internal.local";
  const user = await prisma.user.upsert({
    where: { email: EVAL_USER_EMAIL },
    create: { email: EVAL_USER_EMAIL, firstName: "Eval", lastName: "Harness" },
    update: {},
  });
  const workspace = await prisma.workspace.upsert({
    where: { slug: EVAL_SLUG },
    create: { name: "Eval Harness", slug: EVAL_SLUG, ownerId: user.id },
    update: {},
  });
  const site = await prisma.site.create({
    data: { workspaceId: workspace.id, name: "Eval Harness", slug: EVAL_SLUG, subdomain: EVAL_SLUG },
  });
  return site.id;
}

async function runOneCase(ai: AIFailover, siteId: string, testCase: (typeof GOLDEN_CASES)[number]): Promise<EvalResult> {
  let sandboxExternalId: string | undefined;
  try {
    const sandbox = await createProjectSandbox(siteId, testCase.businessType);
    sandboxExternalId = sandbox.externalId;

    const result = await runCodingAgent({
      ai,
      sandboxExternalId: sandbox.externalId,
      task: testCase.task,
      siteId,
      source: "eval",
      maxIterations: 20,
    });

    const failedChecks = Object.entries(result.qualityChecklist)
      .filter(([, passed]) => !passed)
      .map(([check]) => check);

    let screenshotBase64: string | undefined;
    try {
      screenshotBase64 = await takeSandboxScreenshot(sandbox.externalId, "/");
    } catch {
      // Screenshot failure shouldn't fail the whole eval case - the build/
      // checklist result is the primary signal, the screenshot is for
      // human review on top of that.
    }

    return {
      businessType: testCase.businessType,
      task: testCase.task,
      status: failedChecks.length === 0 ? "passed" : "failed",
      iterations: result.iterations,
      failedChecks: failedChecks.length > 0 ? failedChecks : undefined,
      summary: result.summary,
      screenshotBase64,
    };
  } catch (err) {
    return {
      businessType: testCase.businessType,
      task: testCase.task,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (sandboxExternalId) {
      // Always tear down - a failed eval run leaking a running sandbox
      // container is a silent, recurring cost on every invocation of this
      // script, not just a one-off.
      await stopSandbox(sandboxExternalId).catch(() => {});
    }
  }
}

async function main() {
  console.log(`Running ${GOLDEN_CASES.length} golden-path eval cases...\n`);
  const ai = getEvalAI();
  const siteId = await getOrCreateEvalSite();

  const results: EvalResult[] = [];
  for (const testCase of GOLDEN_CASES) {
    process.stdout.write(`  ${testCase.businessType}... `);
    const result = await runOneCase(ai, siteId, testCase);
    results.push(result);
    console.log(result.status === "passed" ? "PASSED" : result.status === "failed" ? `FAILED (${result.failedChecks?.join(", ")})` : `ERROR: ${result.error}`);
  }

  const passed = results.filter((r) => r.status === "passed").length;
  console.log(`\n${passed}/${results.length} passed.`);

  if (passed < results.length) {
    console.log("\nFailures:");
    for (const r of results) {
      if (r.status !== "passed") {
        console.log(`- ${r.businessType}: ${r.status === "error" ? r.error : `failed checks: ${r.failedChecks?.join(", ")}`}`);
      }
    }
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("Eval harness crashed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
