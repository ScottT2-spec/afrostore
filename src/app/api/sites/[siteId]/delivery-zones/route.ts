import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError , requireRole } from "@/lib/api-helpers";
import { createDeliveryZoneSchema, updateDeliveryZoneSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const zones = await prisma.deliveryZone.findMany({
    where: { siteId },
    orderBy: { position: "asc" },
  });

  return success(zones);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "ADMIN");
  if (roleErr) return roleErr;

  const body = await req.json();
  const parsed = createDeliveryZoneSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const count = await prisma.deliveryZone.count({ where: { siteId } });

  const zone = await prisma.deliveryZone.create({
    data: { siteId, position: count, ...parsed.data },
  });

  return success(zone, 201);
}

// PATCH /api/sites/:siteId/delivery-zones — update an existing zone (id in body)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "ADMIN");
  if (roleErr) return roleErr;

  const body = await req.json();
  const { id, ...rest } = body || {};
  if (!id || typeof id !== "string") return error("Zone id is required", 400);

  const parsed = updateDeliveryZoneSchema.safeParse(rest);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.deliveryZone.findFirst({ where: { id, siteId } });
  if (!existing) return error("Delivery zone not found", 404);

  const zone = await prisma.deliveryZone.update({
    where: { id },
    data: parsed.data,
  });

  return success(zone);
}

// DELETE /api/sites/:siteId/delivery-zones?id=... — delete a zone
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "ADMIN");
  if (roleErr) return roleErr;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return error("Zone id is required", 400);

  const existing = await prisma.deliveryZone.findFirst({ where: { id, siteId } });
  if (!existing) return error("Delivery zone not found", 404);

  await prisma.deliveryZone.delete({ where: { id } });
  return success({ id });
}
