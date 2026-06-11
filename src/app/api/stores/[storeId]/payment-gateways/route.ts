import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { setupPaymentGatewaySchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const gateways = await prisma.paymentGateway.findMany({
    where: { storeId },
    select: {
      id: true,
      provider: true,
      isEnabled: true,
      publicKey: true,
      // secretKey intentionally excluded
      config: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return success(gateways);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = setupPaymentGatewaySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const gateway = await prisma.paymentGateway.upsert({
    where: { storeId_provider: { storeId, provider: parsed.data.provider } },
    update: {
      publicKey: parsed.data.publicKey,
      secretKey: parsed.data.secretKey,
      webhookSecret: parsed.data.webhookSecret,
      config: parsed.data.config as any,
      isEnabled: true,
    },
    create: {
      storeId,
      provider: parsed.data.provider,
      publicKey: parsed.data.publicKey,
      secretKey: parsed.data.secretKey,
      webhookSecret: parsed.data.webhookSecret,
      config: parsed.data.config as any,
      isEnabled: true,
    },
  });

  await logAudit({
    storeId, userId: ctx.user!.id,
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
