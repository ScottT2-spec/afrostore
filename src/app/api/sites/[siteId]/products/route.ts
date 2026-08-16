import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug, logAudit , requireRole } from "@/lib/api-helpers";
import { createProductSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/products
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const brand = url.searchParams.get("brand");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (brand) where.brandId = brand;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: where as any,
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: where as any }),
  ]);

  return success({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/products
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { images, variants, ...productData } = parsed.data;

    // Cost price must be lower than regular price
    if (productData.costPrice && productData.costPrice >= productData.price) {
      return error("Cost price must be lower than the regular price", 400);
    }

    if (productData.barcode) {
      const dupe = await prisma.product.findFirst({ where: { siteId, barcode: productData.barcode } });
      if (dupe) return error(`Barcode "${productData.barcode}" is already used by another product ("${dupe.name}") in this store`, 400);
    }

    const slug = await ensureUniqueSlug(productData.name, siteId, "product");

    const product = await prisma.product.create({
      data: {
        siteId,
        slug,
        ...productData,
        images: {
          create: images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })),
        },
        variants: {
          create: variants.map((v, i) => {
            const { id: _ignoredId, ...rest } = v;
            return { ...rest, options: rest.options as any, image: rest.image || null, position: i };
          }),
        },
      },
      include: {
        images: true,
        variants: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      siteId, userId: ctx.user!.id,
      action: "CREATE", entity: "product", entityId: product.id,
      after: product,
    });

    return success(product, 201);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      const target = (err as any).meta?.target;
      if (Array.isArray(target) && target.includes("barcode")) {
        return error("That barcode is already used by another product in this store", 400);
      }
    }
    console.error("Create product error:", err);
    return error("Internal server error", 500);
  }
}
