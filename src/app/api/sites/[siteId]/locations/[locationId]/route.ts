import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { z } from "zod";

type Params = { params: Promise<{ siteId: string; locationId: string }> };

const updateLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/sites/:siteId/locations/:locationId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, locationId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.location.findFirst({ where: { id: locationId, siteId } });
  if (!existing) return error("Location not found", 404);

  const body = await req.json().catch(() => null);
  const parsed = updateLocationSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Invalid input", 400);

  if (parsed.data.isActive === false && existing.isDefault) {
    return error("Can't deactivate the default location — set a different location as default first", 400);
  }

  const location = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.location.updateMany({ where: { siteId, isDefault: true, id: { not: locationId } }, data: { isDefault: false } });
    }
    return tx.location.update({ where: { id: locationId }, data: parsed.data });
  });

  await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "location", entityId: locationId, before: existing, after: location });
  return success(location);
}

// DELETE /api/sites/:siteId/locations/:locationId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, locationId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.location.findFirst({ where: { id: locationId, siteId } });
  if (!existing) return error("Location not found", 404);

  const totalCount = await prisma.location.count({ where: { siteId } });
  if (totalCount <= 1) return error("Can't delete your only location", 400);
  if (existing.isDefault) return error("Can't delete the default location — set a different location as default first", 400);

  await prisma.location.delete({ where: { id: locationId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "location", entityId: locationId, before: existing });
  return success({ deleted: true });
}
