import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit, requireRole } from "@/lib/api-helpers";
import { setupPaymentGatewaySchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { getMonnifyAccessToken } from "@/lib/payments";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const gateways = await prisma.paymentGateway.findMany({
    where: { siteId },
    select: {
      id: true,
      provider: true,
      isEnabled: true,
      publicKey: true,
      // secretKey intentionally excluded — never sent to the client
      webhookSecret: true, // fetched only to derive a boolean below, not returned raw
      config: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Never leak the actual secret values to the client — just whether they're set,
  // so the settings UI can show "configured" state and prompt for missing ones.
  const safeGateways = gateways.map((gw: (typeof gateways)[number]) => {
    const { webhookSecret, ...rest } = gw;
    return { ...rest, hasWebhookSecret: !!webhookSecret };
  });

  return success(safeGateways);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  // Payment credentials are the single most sensitive thing a site has —
  // only admins and the owner may set or change them.
  const roleErr = requireRole(ctx, "ADMIN");
  if (roleErr) return roleErr;

  const body = await req.json();
  const parsed = setupPaymentGatewaySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  // Copy-pasted keys very commonly carry a trailing space/newline, which silently
  // breaks Basic-auth style credentials (Monnify) — strip whitespace defensively.
  parsed.data.publicKey = parsed.data.publicKey.trim();
  parsed.data.secretKey = parsed.data.secretKey.trim();
  if (parsed.data.webhookSecret) parsed.data.webhookSecret = parsed.data.webhookSecret.trim();
  if (parsed.data.config && typeof parsed.data.config === "object") {
    const cfg = parsed.data.config as Record<string, unknown>;
    if (typeof cfg.contractCode === "string") cfg.contractCode = cfg.contractCode.trim();
    if (typeof cfg.baseUrl === "string") cfg.baseUrl = cfg.baseUrl.trim();
  }

  // Monnify requires a contract code to initialize transactions — checkout
  // will fail later without it, so catch it here instead of at checkout time.
  if (parsed.data.provider === "MONNIFY") {
    const cfg = (parsed.data.config as Record<string, unknown> | undefined) || {};
    const contractCode = cfg.contractCode;
    if (!contractCode || typeof contractCode !== "string" || !contractCode.trim()) {
      return validationError({ config: ["Monnify contract code is required"] });
    }

    // Verify the key pair actually authenticates with Monnify before saving —
    // a mismatched/incorrect public+secret key pair otherwise only surfaces
    // at a customer's checkout as an opaque 401.
    const baseUrl = (typeof cfg.baseUrl === "string" && cfg.baseUrl.trim()) || "https://api.monnify.com";
    try {
      await getMonnifyAccessToken(parsed.data.publicKey, parsed.data.secretKey, baseUrl);
    } catch (authErr: any) {
      return error(
        `Could not verify Monnify credentials: ${authErr.message || "authentication failed"}. Double-check your API key and secret key.`,
        422
      );
    }
  }

  const gateway = await prisma.paymentGateway.upsert({
    where: { siteId_provider: { siteId, provider: parsed.data.provider } },
    update: {
      publicKey: parsed.data.publicKey,
      secretKey: parsed.data.secretKey,
      webhookSecret: parsed.data.webhookSecret,
      config: parsed.data.config as any,
      isEnabled: true,
    },
    create: {
      siteId,
      provider: parsed.data.provider,
      publicKey: parsed.data.publicKey,
      secretKey: parsed.data.secretKey,
      webhookSecret: parsed.data.webhookSecret,
      config: parsed.data.config as any,
      isEnabled: true,
    },
  });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "SETUP", entity: "payment_gateway", entityId: gateway.id,
    after: { provider: gateway.provider, isEnabled: gateway.isEnabled },
  });

  return success({
    id: gateway.id,
    provider: gateway.provider,
    isEnabled: gateway.isEnabled,
    publicKey: gateway.publicKey,
  }, 201);
}
