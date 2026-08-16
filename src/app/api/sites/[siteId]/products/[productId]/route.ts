import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit , requireRole } from "@/lib/api-helpers";
import { updateProductSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; productId: string }> };

// GET /api/sites/:siteId/products/:productId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({
    where: { id: productId, siteId },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: true,
      brand: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { reviews: true, orderItems: true } },
    },
  });

  if (!product) return error("Product not found", 404);
  return success(product);
}

// PATCH /api/sites/:siteId/products/:productId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!existing) return error("Product not found", 404);

  const { images, variants, ...data } = parsed.data;

  // Cost price must be lower than regular price
  const effectivePrice = data.price ?? Number(existing.price);
  if (data.costPrice && data.costPrice >= effectivePrice) {
    return error("Cost price must be lower than the regular price", 400);
  }

  if (data.barcode && data.barcode !== existing.barcode) {
    const dupe = await prisma.product.findFirst({ where: { siteId, barcode: data.barcode, id: { not: productId } } });
    if (dupe) return error(`Barcode "${data.barcode}" is already used by another product ("${dupe.name}") in this store`, 400);
  }

  let product;
  try {
    product = await prisma.$transaction(async (tx) => {
    if (images) {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: images.map((img, i) => ({ productId, url: img.url, alt: img.alt, position: i })),
      });
    }

    if (variants) {
      // Upsert by id instead of delete-all-then-recreate. Deleting and
      // recreating gave every variant a brand new id on every single save —
      // any OrderItem that referenced the old variant id (a customer's past
      // purchase of that specific size/color) would lose that reference the
      // very next time the merchant edited the product, even for an
      // unrelated change like the description.
      const existingVariants = await tx.productVariant.findMany({ where: { productId }, select: { id: true } });
      const existingIds = new Set(existingVariants.map((v) => v.id));
      const incomingIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));

      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
      }

      for (let i = 0; i < variants.length; i++) {
        const { id, ...v } = variants[i];
        const variantData = { ...v, options: v.options as any, image: v.image || null, position: i };
        if (id && existingIds.has(id)) {
          await tx.productVariant.update({ where: { id }, data: variantData });
        } else {
          await tx.productVariant.create({ data: { productId, ...variantData } });
        }
      }
    }

    return tx.product.update({
      where: { id: productId },
      data,
      include: { images: true, variants: true, category: true, brand: true },
    });
  });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      const target = (err as any).meta?.target;
      if (Array.isArray(target) && target.includes("barcode")) {
        return error("That barcode is already used by another product in this store", 400);
      }
    }
    console.error("Update product error:", err);
    return error("Internal server error", 500);
  }

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "UPDATE", entity: "product", entityId: productId,
    before: existing, after: product,
  });

  return success(product);
}

// DELETE /api/sites/:siteId/products/:productId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const existing = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!existing) return error("Product not found", 404);

  await prisma.product.delete({ where: { id: productId } });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "DELETE", entity: "product", entityId: productId,
    before: existing,
  });

  return success({ deleted: true });
}
