import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { runPipeline, invalidateSteps } from "@/lib/pipeline/dag-runner";
import { buildSiteGenerationPipeline } from "@/lib/pipeline/site-generation-pipeline";

type Params = { params: Promise<{ siteId: string }> };

export const maxDuration = 180; // the sandbox step alone can take minutes

// POST /api/sites/:siteId/ai/generate-site-v2  { storeName, businessType, description?, country?, currency? }
// Kicks off the full DAG-based generation pipeline and waits for it to
// finish. For a UI that wants live progress instead of one long request,
// poll GET with the returned runId while this is in flight from another
// caller, or adapt this to fire-and-return-runId-immediately - both are
// valid; this waits inline since Vercel/most hosts support a 180s
// function budget, which comfortably covers copy + parallel images.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  // The pipeline itself calls several paid external APIs per run (LLM +
  // multiple images + a sandbox) - rate-limit the whole pipeline trigger
  // tighter than any single sub-call already is.
  const rl = rateLimit(`ai-pipeline:${ctx.user!.id}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  const body = await req.json().catch(() => ({}));
  const site = ctx.site!;
  const input = {
    siteId,
    storeSlug: site.slug,
    storeName: (body.storeName as string) || site.name,
    businessType: (body.businessType as string) || site.businessType || "general",
    description: (body.description as string) || site.description || undefined,
    country: site.country || "NG",
    currency: site.currency || "NGN",
  };

  const steps = buildSiteGenerationPipeline(siteId);
  const result = await runPipeline(steps, { siteId, input });

  if (result.status === "failed") {
    return error(result.error || "Site generation pipeline failed", 502);
  }
  return success(result, 201);
}

// GET /api/sites/:siteId/ai/generate-site-v2?runId=xxx
// Poll a run's live status - each step's state, for a progress UI.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const runId = new URL(req.url).searchParams.get("runId");
  if (!runId) return error("runId query param is required", 400);

  const run = await prisma.pipelineRun.findFirst({
    where: { id: runId, siteId },
    include: { steps: true },
  });
  if (!run) return error("Run not found", 404);

  return success(run);
}

// PATCH /api/sites/:siteId/ai/generate-site-v2  { runId, stepIds: string[] }
// Invalidates the given steps (plus everything downstream of them) and
// re-runs the pipeline for that run - the "regenerate just the hero image"
// flow, without redoing copy generation or other unaffected steps.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const rl = rateLimit(`ai-pipeline:${ctx.user!.id}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  const body = await req.json().catch(() => ({}));
  const runId = typeof body?.runId === "string" ? body.runId : null;
  const stepIds = Array.isArray(body?.stepIds) ? body.stepIds.filter((s: unknown) => typeof s === "string") : [];
  if (!runId || stepIds.length === 0) return error("runId and stepIds are required", 400);

  const run = await prisma.pipelineRun.findFirst({ where: { id: runId, siteId } });
  if (!run) return error("Run not found", 404);

  const steps = buildSiteGenerationPipeline(siteId);
  await invalidateSteps(steps, runId, stepIds);
  const result = await runPipeline(steps, { siteId, input: run.input as Record<string, unknown>, runId });

  if (result.status === "failed") return error(result.error || "Rerun failed", 502);
  return success(result);
}
