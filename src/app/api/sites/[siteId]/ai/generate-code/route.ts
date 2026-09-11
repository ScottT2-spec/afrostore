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

type Params = { params: Promise<{ siteId: string }> };

/**
 * POST /api/sites/:siteId/ai/generate-code  { task: string }
 *
 * The actual "AI writes code" pathway — distinct from /ai/generate-store,
 * which only produces content for the app's own pre-built block
 * components. This wires the three pieces that existed independently
 * until now into one flow a merchant's request can actually drive:
 *
 *   1. A live sandbox, seeded from the standard scaffold on first use
 *      (reused on every later call to the same site — the agent should
 *      be editing an existing project, not starting from scratch every
 *      time someone asks for a change).
 *   2. runCodingAgent(), given that sandbox and the merchant's request in
 *      plain language — it decides which tools to call and in what order.
 *   3. The same SandboxSession model /sandbox already uses, so the
 *      existing preview UI (SandboxPreview.tsx) keeps working against
 *      whatever this endpoint produces without needing its own concept
 *      of a session.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  if (!isSandboxConfigured()) {
    return error("Sandbox isn't configured (DAYTONA_API_URL/DAYTONA_API_KEY missing).", 501);
  }

  const body = await req.json().catch(() => ({}));
  const task = typeof body?.task === "string" ? body.task.trim() : "";
  if (!task) return error("task is required — describe what you want built or changed.", 400);

  // Same cost reasoning as /sandbox's own rate limit: an agent run can
  // burn many AI calls plus a full npm install/build cycle, so this is
  // capped tighter than sandbox creation itself, not just copied from it.
  const rl = rateLimit(`ai-generate-code:${ctx.user!.id}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  // Reuse an existing ready sandbox for this site if one exists — the
  // agent should be iterating on the merchant's actual project, not a
  // fresh throwaway one on every request. Falls through to creating one
  // if none exists yet, or if the existing one errored/stopped.
  let session = await prisma.sandboxSession.findFirst({
    where: { siteId, status: { in: ["creating", "ready"] } },
    orderBy: { createdAt: "desc" },
  });

  if (session?.status === "creating") {
    // A creation from a moment ago (or another request) is still in
    // flight — refuse rather than racing a second creation for the same
    // site, same reasoning as the dedup check in /sandbox's own POST.
    return error("A sandbox is already being created for this site — try again shortly.", 409);
  }

  if (session?.externalId) {
    const liveStatus = await getSandboxStatus(session.externalId);
    if (liveStatus !== "ready") {
      // The session row said "ready" but Daytona disagrees (stopped,
      // errored, or the sandbox's own idle timeout fired) — treat as
      // if there were no reusable session rather than handing the agent
      // a sandbox that won't actually respond.
      session = null;
    }
  } else {
    session = null;
  }

  if (!session) {
    session = await prisma.sandboxSession.create({ data: { siteId, status: "creating" } });
    try {
      // If this site has generated code from a PRIOR sandbox that's since
      // gone idle/stopped/crashed, this is the actual recovery: the new
      // sandbox is seeded with everything the agent already built, not a
      // blank scaffold. Persisted files are layered on top of (and take
      // priority over) the base scaffold, since they represent this
      // site's real current state; the scaffold underneath just fills in
      // anything the agent never touched (config, layout chrome, etc.).
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

    await prisma.sandboxSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    return success({
      session,
      summary: result.summary,
      filesChanged: result.filesChanged,
      qualityChecklist: result.qualityChecklist,
      steps: result.steps.map((s) => ({ tool: s.tool, isError: s.isError })), // args/full results kept server-side only — can include file contents, not meant for the client payload
      provider: result.provider,
      model: result.model,
      iterations: result.iterations,
    });
  } catch (e) {
    if (e instanceof CodingAgentError) {
      return error(e.message, 502);
    }
    const message = e instanceof Error ? e.message : "Coding agent failed";
    console.error("generate-code failed:", e);
    return error(message, 500);
  }
}
