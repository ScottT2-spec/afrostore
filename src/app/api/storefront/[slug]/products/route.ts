import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/**
 * GET /api/storefront/:slug/products — browse/list products.
 *
 * The gap this fills: search/route.ts requires a 2+ character query and
 * 400s without one, so there was no way to get "all products" or "all
 * products in category X" for a plain Shop/Collection page — only
 * keyword search and single-product-by-slug existed. Query params are
 * all optional:
 *   - category: filter by category slug
 *   - sort: "newest" (default) | "price-asc" | "price-desc" | "name"
 *   - page (default 1), limit (default 20, max 50)
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, currency: true },
  });
  if (!site) return notFound("Store not found");

  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category");
  const sort = url.searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

  let categoryId: string | undefined;
  if (categorySlug) {
    const category = await prisma.category.findFirst({
      where: { siteId: site.id, slug: categorySlug },
      select: { id: true },
    });
    if (!category) return success({ products: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    categoryId = category.id;
  }

  const orderBy =
    sort === "price-asc" ? { price: "asc" as const } :
    sort === "price-desc" ? { price: "desc" as const } :
    sort === "name" ? { name: "asc" as const } :
    { createdAt: "desc" as const };

  const where = { siteId: site.id, status: "ACTIVE" as const, ...(categoryId ? { categoryId } : {}) };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true, name: true, slug: true, description: true,
        price: true, compareAtPrice: true, currency: true,
        images: true, stock: true, trackInventory: true, isFeatured: true, tags: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  }));

  return success({
    products: data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
