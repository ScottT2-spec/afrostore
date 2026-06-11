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
 * Resolve a store by slug, subdomain, or custom domain.
 * Only returns ACTIVE stores.
 */
async function resolveStore(slug: string) {
  return prisma.store.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { slug },
        { subdomain: slug },
        { customDomain: slug },
      ],
    },
  });
}

// GET /api/storefront/:slug — public store data
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const store = await resolveStore(slug);
    if (!store) return notFound("Store not found");

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const categorySlug = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const featured = url.searchParams.get("featured");

    // Build product filter
    const productWhere: Record<string, unknown> = {
      storeId: store.id,
      status: "ACTIVE",
    };

    if (categorySlug) {
      const category = await prisma.category.findFirst({
        where: { storeId: store.id, slug: categorySlug },
        select: { id: true },
      });
      if (category) productWhere.categoryId = category.id;
    }

    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (featured === "true") {
      productWhere.isFeatured = true;
    }

    // Fetch everything in parallel
    const [
      settings,
      socialLinks,
      products,
      productTotal,
      categories,
      deliveryZones,
      pages,
    ] = await Promise.all([
      prisma.storeSettings.findUnique({
        where: { storeId: store.id },
        select: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
          showStockCount: true,
          lowDataMode: true,
          language: true,
          whatsappNumber: true,
          metaTitle: true,
          metaDescription: true,
        },
      }),

      prisma.storeSocialLinks.findUnique({
        where: { storeId: store.id },
        select: {
          whatsapp: true,
          instagram: true,
          facebook: true,
          twitter: true,
          tiktok: true,
        },
      }),

      prisma.product.findMany({
        where: productWhere as any,
        include: {
          images: { orderBy: { position: "asc" }, take: 3 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),

      prisma.product.count({ where: productWhere as any }),

      prisma.category.findMany({
        where: { storeId: store.id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          parentId: true,
          position: true,
          _count: { select: { products: { where: { status: "ACTIVE" } } } },
        },
        orderBy: { position: "asc" },
      }),

      prisma.deliveryZone.findMany({
        where: { storeId: store.id, isActive: true },
        select: {
          id: true,
          name: true,
          areas: true,
          fee: true,
          freeAbove: true,
          estimatedDays: true,
        },
        orderBy: { position: "asc" },
      }),

      prisma.page.findMany({
        where: { storeId: store.id, isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
        orderBy: { position: "asc" },
      }),
    ]);

    // Clean product output — strip cost price and other merchant-only fields
    const publicProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      currency: p.currency,
      stock: settings?.showStockCount ? p.stock : undefined,
      inStock: p.stock > 0,
      isFeatured: p.isFeatured,
      tags: p.tags,
      images: p.images,
      category: p.category,
      reviewCount: p._count.reviews,
    }));

    return success({
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        coverImage: store.coverImage,
        subdomain: store.subdomain,
        customDomain: store.customDomain,
        currency: store.currency,
        country: store.country,
        businessType: store.businessType,
        plan: store.plan,
      },
      settings: settings || {},
      socialLinks: socialLinks || {},
      products: publicProducts,
      pagination: { page, limit, total: productTotal, pages: Math.ceil(productTotal / limit) },
      categories,
      deliveryZones,
      pages,
    });
  } catch (err) {
    console.error("Storefront fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
