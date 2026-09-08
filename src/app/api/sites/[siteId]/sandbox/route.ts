import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { isSandboxConfigured, createSandboxWithFiles, getSandboxStatus, stopSandbox } from "@/lib/sandbox/daytona";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/sandbox
// Returns the current sandbox session for this site, if any, refreshing
// its status from Daytona first. No session -> the frontend should fall
// back to the block-based preview instead of erroring.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const session = await prisma.sandboxSession.findFirst({
    where: { siteId, status: { notIn: ["stopped", "error"] } },
    orderBy: { createdAt: "desc" },
  });
  if (!session) return success({ session: null });

  if (session.externalId && session.status !== "ready") {
    const liveStatus = await getSandboxStatus(session.externalId);
    if (liveStatus !== session.status) {
      await prisma.sandboxSession.update({
        where: { id: session.id },
        data: { status: liveStatus, lastActiveAt: new Date() },
      });
      session.status = liveStatus;
    }
  }

  return success({ session });
}

// POST /api/sites/:siteId/sandbox  { files: Record<string, string> }
// Creates a new sandbox session for AI-generated code and starts its dev
// server. If Daytona isn't configured, returns a clear "not configured"
// error rather than a confusing failure - the frontend should treat that
// the same as "no session" and fall back to the block renderer.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  if (!isSandboxConfigured()) {
    return error("Sandbox isn't configured (DAYTONA_API_URL/DAYTONA_API_KEY missing) - use the block-based preview instead.", 501);
  }

  // Spinning up a Daytona container (npm install + a running dev server)
  // is by far the most expensive operation in this app - at any real
  // scale, an unlimited-creation endpoint here is a direct compute-cost
  // bleed, not just an abuse edge case. Capped per-user, not per-site, so
  // one user can't route around it by cycling through many sites either.
  const rl = rateLimit(`sandbox-create:${ctx.user!.id}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  // One live sandbox per site at a time. Without this, double-clicking
  // "generate" (or a slow first request + impatient retry) spins up a
  // second full container for the same site while the first is still
  // starting - pure wasted compute, and at 100k users that's the
  // difference between a fleet you can actually run and one you can't.
  const existing = await prisma.sandboxSession.findFirst({
    where: { siteId, status: { in: ["creating", "ready"] } },
  });
  if (existing) {
    return success({ session: existing });
  }

  const body = await req.json().catch(() => ({}));
  const files = body?.files;
  if (!files || typeof files !== "object" || Object.keys(files).length === 0) {
    return error("files is required (a map of relative path -> file content)", 400);
  }

  const session = await prisma.sandboxSession.create({
    data: { siteId, status: "creating" },
  });

  try {
    const { externalId, previewUrl } = await createSandboxWithFiles(files);
    const updated = await prisma.sandboxSession.update({
      where: { id: session.id },
      data: { externalId, previewUrl, status: "ready", lastActiveAt: new Date() },
    });
    return success({ session: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create sandbox";
    await prisma.sandboxSession.update({
      where: { id: session.id },
      data: { status: "error", errorMessage: message },
    });
    return error(message, 500);
  }
}

// DELETE /api/sites/:siteId/sandbox?sessionId=xxx
// Tears down a sandbox session - always called when the user is done
// previewing, since idle sandboxes still cost compute even self-hosted.
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return error("sessionId query param is required", 400);

  const session = await prisma.sandboxSession.findFirst({ where: { id: sessionId, siteId } });
  if (!session) return error("Session not found", 404);

  if (session.externalId) {
    try {
      await stopSandbox(session.externalId);
    } catch {
      // Best-effort: even if Daytona's own teardown call fails (e.g. it
      // already auto-stopped from the idle timer), still mark it stopped
      // on our side so it stops showing up as an active session.
    }
  }

  await prisma.sandboxSession.update({ where: { id: session.id }, data: { status: "stopped" } });
  return success({ status: "stopped" });
}
