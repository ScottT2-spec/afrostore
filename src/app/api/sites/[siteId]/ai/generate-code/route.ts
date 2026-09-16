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
import { runCodingAgent, CodingAgentError } from "@/lib/coding-agent";
import { runSiteGenerationAgent } from "@/lib/site-generation-agent";
import type { AIMessage } from "@/lib/failover";

type Params = { params: Promise<{ siteId: string }> };

/**
 * POST /api/sites/:siteId/ai/generate-code  { task: string, priorMessages?: AIMessage[] }
 *
 * PRIMARY: the structured, PRD-aligned site-generation agent - writes
 * directly to real Page/Product/SiteSettings rows through the existing,
 * already-correct ecommerce/block-rendering pipeline. No sandbox, no
 * generated source code.
 *
 * FALLBACK: the freeform coding agent (Daytona sandbox) - used only when
 * the structured agent hard-fails (not a clarifying question), for
 * requests too custom for its constrained tool set.
 *
 * Response `mode`: "question" (needs one clarifying detail - resend the
 * merchant's answer as `task` plus `priorMessages` from this response to
 * resume), "structured" (done - `pages` for the block preview, no
 * separate publish step needed), or "code" (fell back - existing
 * sandbox/session shape, unchanged).
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json().catch(() => ({}));
  const task = typeof body?.task === "string" ? body.task.trim() : "";
  if (!task) return error("task is required — describe what you want built or changed.", 400);
  const priorMessages: AIMessage[] | undefined = Array.isArray(body?.priorMessages) ? body.priorMessages : undefined;

  const rl = rateLimit(`ai-generate-code:${ctx.user!.id}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

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
    });

    if (result.pendingQuestion) {
      return success({
        mode: "question",
        question: result.pendingQuestion.question,
        options: result.pendingQuestion.options,
        priorMessages: result.messages,
      });
    }

    const pages = await prisma.page.findMany({
      where: { siteId },
      select: { id: true, title: true, slug: true, type: true },
      orderBy: { position: "asc" },
    });

    return success({ mode: "structured", summary: result.summary, pages });
  } catch (structuredErr) {
    console.error("Structured site generation failed, falling back to coding agent:", structuredErr);
  }

  if (!isSandboxConfigured()) {
    return error("Both generation paths are unavailable (structured agent failed, and sandbox isn't configured).", 501);
  }

  let session = await prisma.sandboxSession.findFirst({
    where: { siteId, status: { in: ["creating", "ready"] } },
    orderBy: { createdAt: "desc" },
  });

  if (session?.status === "creating") {
    return error("A sandbox is already being created for this site — try again shortly.", 409);
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
      return error(message, 500);
    }
  }

  if (!session.externalId) {
    return error("Sandbox session has no external ID — cannot run the agent against it.", 500);
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
    });

    await prisma.sandboxSession.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } });

    return success({
      mode: "code",
      session,
      summary: result.summary,
      filesChanged: result.filesChanged,
      qualityChecklist: result.qualityChecklist,
      steps: result.steps.map((s) => ({ tool: s.tool, isError: s.isError })),
      provider: result.provider,
      model: result.model,
      iterations: result.iterations,
    });
  } catch (e) {
    if (e instanceof CodingAgentError) return error(e.message, 502);
    const message = e instanceof Error ? e.message : "Coding agent failed";
    console.error("generate-code failed:", e);
    return error(message, 500);
  }
}
