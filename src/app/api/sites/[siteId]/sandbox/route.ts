import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { isSandboxConfigured, createSandboxWithFiles, getSandboxStatus, stopSandbox } from "@/lib/sandbox/daytona";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { decryptField } from "@/lib/field-crypto";

type Params = { params: Promise<{ siteId: string }> };

// Global ceiling on simultaneously-running sandboxes, across ALL sites and
// users. Per-user rate limiting (below) stops one user from creating too
// many; this is the separate check that stops the sum of many different
// users from exceeding what the Daytona host can actually run at once.
// Override via env once real capacity is measured - this default is
// deliberately conservative for a single self-hosted Daytona instance.
const MAX_CONCURRENT_SANDBOXES = Number(process.env.SANDBOX_MAX_CONCURRENT || 50);

async function countActiveSandboxes(): Promise<number> {
  return prisma.sandboxSession.count({ where: { status: { in: ["creating", "ready"] } } });
}

// Attempts to promote the single oldest queued session into a real
// Daytona container, if there's spare capacity right now. Called
// opportunistically from GET (polling) and DELETE (freed capacity)
// instead of a cron - crons on this platform's plan only run once a day,
// far too slow for "a slot just opened up, let someone in".
async function tryPromoteNextQueued(): Promise<void> {
  const activeCount = await countActiveSandboxes();
  if (activeCount >= MAX_CONCURRENT_SANDBOXES) return;

  const next = await prisma.sandboxSession.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
  });
  if (!next || !next.files) return;

  // Claim it first (creating), so a concurrent promotion attempt from
  // another request can't also pick up the same queued session.
  const claimed = await prisma.sandboxSession.updateMany({
    where: { id: next.id, status: "queued" },
    data: { status: "creating" },
  });
  if (claimed.count === 0) return; // someone else claimed it first

  try {
    const secretEnvVars = await getDecryptedSecrets(next.siteId);
    const { externalId, previewUrl } = await createSandboxWithFiles(
      next.files as Record<string, string>,
      secretEnvVars
    );
    await prisma.sandboxSession.update({
      where: { id: next.id },
      data: { externalId, previewUrl, status: "ready", lastActiveAt: new Date() },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create sandbox";
    await prisma.sandboxSession.update({
      where: { id: next.id },
      data: { status: "error", errorMessage: message },
    });
  }
}

async function getDecryptedSecrets(siteId: string): Promise<Record<string, string>> {
  const secrets = await prisma.sandboxSecret.findMany({ where: { siteId } });
  const out: Record<string, string> = {};
  for (const s of secrets) {
    try {
      out[s.key] = decryptField(s.encryptedValue);
    } catch {
      // A secret that fails to decrypt (e.g. PROFILE_ENCRYPTION_KEY was
      // rotated) is skipped rather than crashing sandbox creation for it -
      // the generated code just won't have that one env var set.
    }
  }
  return out;
}

// GET /api/sites/:siteId/sandbox
// Returns the current sandbox session for this site, if any, refreshing
// its status from Daytona first. No session -> the frontend should fall
// back to the block-based preview instead of erroring.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  // Cheap opportunistic check - the frontend already polls this endpoint
  // while a session is starting, so this is effectively free scheduling:
  // no session anywhere is "stuck queued" longer than one poll interval
  // after capacity frees up.
  await tryPromoteNextQueued();

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
// server - or, if the global concurrency ceiling is currently full,
// queues it (status "queued") to be picked up as soon as capacity frees.
// If Daytona isn't configured, returns a clear "not configured" error
// rather than a confusing failure - the frontend should treat that the
// same as "no session" and fall back to the block renderer.
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

  // One live (or queued) sandbox per site at a time. Without this,
  // double-clicking "generate" (or a slow first request + impatient
  // retry) spins up a second full container for the same site while the
  // first is still starting - pure wasted compute, and at 100k users
  // that's the difference between a fleet you can actually run and one
  // you can't.
  const existing = await prisma.sandboxSession.findFirst({
    where: { siteId, status: { in: ["queued", "creating", "ready"] } },
  });
  if (existing) {
    return success({ session: existing });
  }

  const body = await req.json().catch(() => ({}));
  const files = body?.files;
  if (!files || typeof files !== "object" || Object.keys(files).length === 0) {
    return error("files is required (a map of relative path -> file content)", 400);
  }

  // Global concurrency ceiling: if we're already at capacity across all
  // sites/users, queue this one instead of attempting it. files is
  // persisted so a later promotion (from tryPromoteNextQueued) has
  // everything it needs without the original request still being open.
  const activeCount = await countActiveSandboxes();
  if (activeCount >= MAX_CONCURRENT_SANDBOXES) {
    const queued = await prisma.sandboxSession.create({
      data: { siteId, status: "queued", files },
    });
    return success({ session: queued, queued: true });
  }

  const session = await prisma.sandboxSession.create({
    data: { siteId, status: "creating", files },
  });

  try {
    const secretEnvVars = await getDecryptedSecrets(siteId);
    const { externalId, previewUrl } = await createSandboxWithFiles(files, secretEnvVars);
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
// Also opportunistically promotes the next queued session, since this is
// exactly the moment a concurrency slot frees up.
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
  await tryPromoteNextQueued();
  return success({ status: "stopped" });
}
