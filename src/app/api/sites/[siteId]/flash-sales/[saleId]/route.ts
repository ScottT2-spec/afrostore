import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateFlashSaleSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; saleId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, saleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const sale = await prisma.flashSale.findFirst({
    where: { id: saleId, siteId },
    include: { products: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } } } },
  });
  if (!sale) return error("Flash sale not found", 404);
  return success(sale);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, saleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.flashSale.findFirst({ where: { id: saleId, siteId } });
  if (!existing) return error("Flash sale not found", 404);

  try {
    const body = await req.json();
    const parsed = updateFlashSaleSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { productIds, startsAt, endsAt, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (startsAt) data.startsAt = new Date(startsAt);
    if (endsAt) data.endsAt = new Date(endsAt);

    // Replace products if provided
    if (productIds !== undefined) {
      await prisma.flashSaleProduct.deleteMany({ where: { flashSaleId: saleId } });
      if (productIds.length > 0) {
        await prisma.flashSaleProduct.createMany({ data: productIds.map((pid) => ({ flashSaleId: saleId, productId: pid })) });
      }
    }

    const sale = await prisma.flashSale.update({ where: { id: saleId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "flash_sale", entityId: saleId, before: existing, after: sale });
    return success(sale);
  } catch (err) { console.error("Update flash sale error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, saleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.flashSale.findFirst({ where: { id: saleId, siteId } });
  if (!existing) return error("Flash sale not found", 404);

  await prisma.flashSale.delete({ where: { id: saleId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "flash_sale", entityId: saleId, before: existing });
  return success({ deleted: true });
}
