import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateStoreSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/stores/:storeId
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      settings: true,
      socialLinks: true,
      paymentGateways: { select: { id: true, provider: true, isEnabled: true, createdAt: true } },
      deliveryZones: { orderBy: { position: "asc" } },
      _count: { select: { products: true, orders: true, customers: true, pages: true } },
    },
  });

  return success(store);
}

// PATCH /api/stores/:storeId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const before = ctx.store;
  const store = await prisma.store.update({
    where: { id: storeId },
    data: parsed.data,
  });

  await logAudit({
    storeId, userId: ctx.user!.id,
    action: "UPDATE", entity: "store", entityId: storeId,
    before, after: store,
  });

  return success(store);
}

// DELETE /api/stores/:storeId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  if (ctx.store!.ownerId !== ctx.user!.id) {
    return error("Only the store owner can delete it", 403);
  }

  await prisma.store.delete({ where: { id: storeId } });

  return success({ deleted: true });
}
