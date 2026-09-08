import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { encryptField } from "@/lib/field-crypto";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

type Params = { params: Promise<{ siteId: string }> };

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/; // conventional env var name shape

// GET /api/sites/:siteId/sandbox/secrets
// Lists secret KEYS only - never returns encrypted or decrypted values.
// This is how AI-generated code gets access to things like an API key
// without the value ever being visible in a response body, a log, or to
// the AI model itself: the model can write `process.env.STRIPE_SECRET_KEY`
// into generated code; the actual value only exists inside the running
// sandbox container (injected in createSandboxWithFiles's envVars).
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const secrets = await prisma.sandboxSecret.findMany({
    where: { siteId },
    select: { id: true, key: true, updatedAt: true },
    orderBy: { key: "asc" },
  });
  return success({ secrets });
}

// POST /api/sites/:siteId/sandbox/secrets  { key, value }
// Upsert - same endpoint creates a new secret or rotates an existing one's
// value, keyed on (siteId, key).
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const rl = rateLimit(`sandbox-secret-write:${ctx.user!.id}`, 30, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  const body = await req.json().catch(() => ({}));
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  const value = typeof body?.value === "string" ? body.value : "";

  if (!KEY_PATTERN.test(key)) {
    return error("key must look like an env var name (e.g. STRIPE_SECRET_KEY): uppercase letters, digits, underscores, starting with a letter", 400);
  }
  if (!value) {
    return error("value is required", 400);
  }

  const encryptedValue = encryptField(value);
  const secret = await prisma.sandboxSecret.upsert({
    where: { siteId_key: { siteId, key } },
    create: { siteId, key, encryptedValue },
    update: { encryptedValue },
    select: { id: true, key: true, updatedAt: true },
  });

  return success({ secret });
}

// DELETE /api/sites/:siteId/sandbox/secrets?key=STRIPE_SECRET_KEY
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const key = new URL(req.url).searchParams.get("key");
  if (!key) return error("key query param is required", 400);

  await prisma.sandboxSecret.deleteMany({ where: { siteId, key } });
  return success({ deleted: true });
}
