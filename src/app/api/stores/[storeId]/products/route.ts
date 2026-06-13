import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import { createProductSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/stores/:storeId/products
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { storeId };
  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
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

// POST /api/stores/:storeId/products
export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { images, variants, ...productData } = parsed.data;
    const slug = await ensureUniqueSlug(productData.name, storeId, "product");

    const product = await prisma.product.create({
      data: {
        storeId,
        slug,
        ...productData,
        images: {
          create: images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })),
        },
        variants: {
          create: variants.map((v, i) => ({ ...v, options: v.options as any, image: v.image || null, position: i })),
        },
      },
      include: {
        images: true,
        variants: true,
        category: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      storeId, userId: ctx.user!.id,
      action: "CREATE", entity: "product", entityId: product.id,
      after: product,
    });

    return success(product, 201);
  } catch (err) {
    console.error("Create product error:", err);
    return error("Internal server error", 500);
  }
}
