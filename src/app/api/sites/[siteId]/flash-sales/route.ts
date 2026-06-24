import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createFlashSaleSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const sales = await prisma.flashSale.findMany({
    where: { siteId },
    include: { products: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } } }, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
  return success({ sales });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createFlashSaleSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { productIds, startsAt, endsAt, ...rest } = parsed.data;
    const sale = await prisma.flashSale.create({
      data: { siteId, ...rest, startsAt: new Date(startsAt), endsAt: new Date(endsAt),
        products: productIds?.length ? { create: productIds.map((pid) => ({ productId: pid })) } : undefined },
      include: { _count: { select: { products: true } } },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "flash_sale", entityId: sale.id, after: sale });
    return success(sale, 201);
  } catch (err) { console.error("Create flash sale error:", err); return error("Internal server error", 500); }
}
