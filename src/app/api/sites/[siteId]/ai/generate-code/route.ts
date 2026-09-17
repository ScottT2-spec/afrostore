import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { isSandboxConfigured, createSandboxWithFiles, getSandboxStatus } from "@/lib/sandbox/daytona";
import { getStandardScaffold } from "@/lib/sandbox/scaffold";
import { getGeneratedFiles } from "@/lib/sandbox/generated-files";
import { getDecryptedSecrets } from "@/lib/sandbox/secrets";
import { getAIFailover } from "@/lib/ai-service";
import { runCodingAgent, CodingAgentError, type CodingAgentStep } from "@/lib/coding-agent";
import { runSiteGenerationAgent, type SiteGenerationStep } from "@/lib/site-generation-agent";
import type { AIMessage } from "@/lib/failover";

type Params = { params: Promise<{ siteId: string }> };
type Ctx = Awaited<ReturnType<typeof getStoreContext>>;
type ProgressEvent = { type: "step"; tool: string; isError: boolean } | { type: "done"; body: Record<string, unknown> } | { type: "error"; message: string };

/**
 * POST /api/sites/:siteId/ai/generate-code  { task, priorMessages?, idempotencyKey? }
 *
 * PRIMARY: the structured, PRD-aligned site-generation agent - writes
 * directly to real Page/Product/SiteSettings rows through the existing
 * ecommerce/block-rendering pipeline. FALLBACK: the freeform coding
 * agent (Daytona sandbox), only on a hard structured-agent failure.
 *
 * IDEMPOTENCY: pass idempotencyKey to make a retried/duplicate submit
 * safe - a second request with the same key while the first is still
 * running gets 409; after it completes, the same key returns the
 * original cached result instead of running (and re-billing) a second
 * generation.
 *
 * STREAMING: send `Accept: text/event-stream` to get live SSE progress
 * (one `step` event per tool call, then one `done` event with the same
 * body a normal JSON response would return). Omit it for a plain JSON
 * response, unchanged from before.
 *
 * Response `mode`: "question" | "structured" | "code" — see inline
 * comments below for what each contains.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json().catch(() => ({}));
  const task = typeof body?.task === "string" ? body.task.trim() : "";
  if (!task) return error("task is required — describe what you want built or changed.", 400);
  const priorMessages: AIMessage[] | undefined = Array.isArray(body?.priorMessages) ? body.priorMessages : undefined;
  const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey : null;

  const rl = rateLimit(`ai-generate-code:${ctx.user!.id}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  // Idempotency: create the row first, racing on the (siteId, key) unique
  // constraint rather than check-then-insert, which would have a window
  // for two near-simultaneous requests with the same key to both pass a
  // "does it exist" check before either writes.
  let buildRequestId: string | null = null;
  if (idempotencyKey) {
    try {
      const created = await prisma.aiBuildRequest.create({ data: { siteId, idempotencyKey, status: "running" } });
      buildRequestId = created.id;
    } catch {
      const existing = await prisma.aiBuildRequest.findUnique({ where: { siteId_idempotencyKey: { siteId, idempotencyKey } } });
      if (existing?.status === "completed") {
        return success(existing.responseJson as Record<string, unknown>);
      }
      if (existing?.status === "running") {
        return error("A generation with this idempotency key is already in progress.", 409);
      }
      // status === "failed" (or a race we lost) - allow a genuine retry.
      if (existing) {
        await prisma.aiBuildRequest.update({ where: { id: existing.id }, data: { status: "running", responseJson: undefined } });
        buildRequestId = existing.id;
      }
    }
  }

  const wantsStream = (req.headers.get("accept") || "").includes("text/event-stream");

  async function finish(resultBody: Record<string, unknown>, failed: boolean) {
    if (buildRequestId) {
      await prisma.aiBuildRequest.update({
        where: { id: buildRequestId },
        data: { status: failed ? "failed" : "completed", responseJson: failed ? undefined : resultBody, completedAt: new Date() },
      }).catch(() => {}); // best-effort - don't fail the actual response over telemetry bookkeeping
    }
  }

  if (!wantsStream) {
    try {
      const resultBody = await runGeneration(ctx, siteId, task, priorMessages);
      await finish(resultBody, false);
      return success(resultBody);
    } catch (e) {
      await finish({}, true);
      const message = e instanceof Error ? e.message : "Generation failed";
      return error(message, 500);
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (evt: ProgressEvent) => controller.enqueue(encoder.encode(`event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`));
      try {
        const resultBody = await runGeneration(ctx, siteId, task, priorMessages, (s) => send({ type: "step", tool: s.tool, isError: s.isError }));
        await finish(resultBody, false);
        send({ type: "done", body: resultBody });
      } catch (e) {
        await finish({}, true);
        send({ type: "error", message: e instanceof Error ? e.message : "Generation failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

/**
 * The actual two-tier generation logic, extracted so both the plain-JSON
 * and SSE-streaming response paths above share exactly one implementation
 * rather than two copies that could drift.
 */
async function runGeneration(
  ctx: Ctx,
  siteId: string,
  task: string,
  priorMessages: AIMessage[] | undefined,
  onStep?: (s: SiteGenerationStep | CodingAgentStep) => void
): Promise<Record<string, unknown>> {
  try {
    const result = await runSiteGenerationAgent({
      ai: getAIFailover(),
      siteId,
      storeName: ctx.site?.name || "My Business",
      storeSlug: ctx.site?.slug || siteId,
      industry: ctx.site?.businessType || "general",
      siteType: ctx.site?.siteType || "WEBSITE",
      task,
      priorMessages,
      onStep,
    });

    if (result.pendingQuestion) {
      return {
        mode: "question",
        question: result.pendingQuestion.question,
        options: result.pendingQuestion.options,
        priorMessages: result.messages,
      };
    }

    const pages = await prisma.page.findMany({
      where: { siteId },
      select: { id: true, title: true, slug: true, type: true },
      orderBy: { position: "asc" },
    });

    return { mode: "structured", summary: result.summary, pages };
  } catch (structuredErr) {
    console.error("Structured site generation failed, falling back to coding agent:", structuredErr);
  }

  if (!isSandboxConfigured()) {
    throw new Error("Both generation paths are unavailable (structured agent failed, and sandbox isn't configured).");
  }

  let session = await prisma.sandboxSession.findFirst({
    where: { siteId, status: { in: ["creating", "ready"] } },
    orderBy: { createdAt: "desc" },
  });

  if (session?.status === "creating") {
    throw new Error("A sandbox is already being created for this site — try again shortly.");
  }

  if (session?.externalId) {
    const liveStatus = await getSandboxStatus(session.externalId);
    if (liveStatus !== "ready") session = null;
  } else {
    session = null;
  }

  if (!session) {
    session = await prisma.sandboxSession.create({ data: { siteId, status: "creating" } });
    try {
      const scaffold = getStandardScaffold(ctx.site?.businessType || "general", siteId, ctx.site?.slug || siteId);
      const persisted = await getGeneratedFiles(siteId);
      const files = { ...scaffold, ...persisted };
      const secretEnvVars = await getDecryptedSecrets(siteId);
      const { externalId, previewUrl } = await createSandboxWithFiles(files, secretEnvVars);
      session = await prisma.sandboxSession.update({
        where: { id: session.id },
        data: { externalId, previewUrl, status: "ready", lastActiveAt: new Date() },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create sandbox";
      await prisma.sandboxSession.update({ where: { id: session.id }, data: { status: "error", errorMessage: message } });
      throw new Error(message);
    }
  }

  if (!session.externalId) {
    throw new Error("Sandbox session has no external ID — cannot run the agent against it.");
  }

  const contextLine = ctx.site?.name
    ? `This is for a store called "${ctx.site.name}"${ctx.site.businessType ? ` (${ctx.site.businessType})` : ""}.`
    : "";

  try {
    const result = await runCodingAgent({
      ai: getAIFailover(),
      sandboxExternalId: session.externalId,
      task: contextLine ? `${contextLine}\n\n${task}` : task,
      siteId,
      source: "live",
      onStep,
    });

    await prisma.sandboxSession.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } });

    return {
      mode: "code",
      session,
      summary: result.summary,
      filesChanged: result.filesChanged,
      qualityChecklist: result.qualityChecklist,
      steps: result.steps.map((s) => ({ tool: s.tool, isError: s.isError })),
      provider: result.provider,
      model: result.model,
      iterations: result.iterations,
    };
  } catch (e) {
    if (e instanceof CodingAgentError) throw e;
    const message = e instanceof Error ? e.message : "Coding agent failed";
    console.error("generate-code failed:", e);
    throw new Error(message);
  }
}
