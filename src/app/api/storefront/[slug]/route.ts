import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { asRecord } from "@/lib/json";
import { buildThemeDataWithCustomization, loadSiteCustomizationSafely } from "@/lib/site-customization";
import { mergeStoredTemplatePages } from "@/lib/templates/site-instance";
import type { Prisma } from "@/generated/prisma";

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
  return prisma.site.findFirst({
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
    const site = await resolveStore(slug);
    if (!site) return notFound("Store not found");

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const categorySlug = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const featured = url.searchParams.get("featured");

    // Build product filter
    const productWhere: Record<string, unknown> = {
      siteId: site.id,
      status: "ACTIVE",
    };

    if (categorySlug) {
      const category = await prisma.category.findFirst({
        where: { siteId: site.id, slug: categorySlug },
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
      activeTheme,
      activeTemplate,
      customization,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({
        where: { siteId: site.id },
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

      prisma.siteSocialLinks.findUnique({
        where: { siteId: site.id },
        select: {
          whatsapp: true,
          instagram: true,
          facebook: true,
          twitter: true,
          tiktok: true,
        },
      }),

      prisma.product.findMany({
        where: productWhere as Prisma.ProductWhereInput,
        include: {
          images: { orderBy: { position: "asc" }, take: 3 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),

      prisma.product.count({ where: productWhere as Prisma.ProductWhereInput }),

      prisma.category.findMany({
        where: { siteId: site.id },
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
        where: { siteId: site.id, isActive: true },
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
        where: { siteId: site.id, isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          content: true,
        },
        orderBy: { position: "asc" },
      }),

      prisma.siteTheme.findFirst({
        where: { siteId: site.id, isActive: true },
        include: {
          theme: {
            select: { id: true, name: true, slug: true, config: true },
          },
        },
      }),

      prisma.siteTemplate.findFirst({
        where: { siteId: site.id, isActive: true },
        select: {
          variant: true,
          themeConfig: true,
          pages: true,
          customHtml: true,
          template: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),

      loadSiteCustomizationSafely(
        prisma.siteCustomization.findUnique({
          where: { siteId: site.id },
        })
      ),
    ]);
    const resolvedCustomization = customization;

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

    const templateThemeConfig = activeTemplate?.themeConfig as unknown as
      | {
          homepage_layout?: string;
          header_style?: string;
          footer_style?: string;
          product_card_style?: string;
          colors?: Record<string, string>;
          fonts?: Record<string, string>;
        }
      | undefined;

    let resolvedTheme: ReturnType<typeof buildThemeDataWithCustomization> = null;
    try {
      resolvedTheme = buildThemeDataWithCustomization(
        activeTheme
          ? {
              id: activeTheme.theme.id,
              name: activeTheme.theme.name,
              slug: activeTheme.theme.slug,
              config: {
                ...asRecord(activeTheme.theme.config),
                ...asRecord(activeTheme.customConfig),
              },
            }
          : activeTemplate
          ? {
              id: activeTemplate.template.id,
              name: activeTemplate.template.name,
              slug: activeTemplate.template.slug,
              config: {
                colors: {
                  primary: templateThemeConfig?.colors?.primary,
                  accent: templateThemeConfig?.colors?.accent,
                  headerBg: templateThemeConfig?.colors?.headerBg || templateThemeConfig?.colors?.background,
                  headerText: templateThemeConfig?.colors?.headerText || templateThemeConfig?.colors?.text,
                  footerBg: templateThemeConfig?.colors?.footerBg || templateThemeConfig?.colors?.secondary,
                  footerText: templateThemeConfig?.colors?.footerText || "#ffffff",
                  buttonBg: templateThemeConfig?.colors?.primary,
                  buttonText: "#ffffff",
                },
                fonts: templateThemeConfig?.fonts,
                layout: {
                  template: templateThemeConfig?.homepage_layout,
                  headerStyle: templateThemeConfig?.header_style,
                  cardStyle: templateThemeConfig?.product_card_style,
                  maxWidth: "72rem",
                  productColumns: 4,
                },
              },
            }
          : null,
        resolvedCustomization
      );
    } catch (themeError) {
      console.error("Storefront theme build error:", themeError);
    }

    const publicPages = mergeStoredTemplatePages(
      pages.map((page) => ({
        ...page,
        content: page.content,
      })),
      activeTemplate?.pages
    );

    return success({
      store: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        description: site.description,
        logo: site.logo,
        coverImage: site.coverImage,
        subdomain: site.subdomain,
        customDomain: site.customDomain,
        currency: site.currency,
        country: site.country,
        businessType: site.businessType,
      },
      settings: settings || {},
      socialLinks: socialLinks || {},
      products: publicProducts,
      pagination: { page, limit, total: productTotal, pages: Math.ceil(productTotal / limit) },
      categories,
      deliveryZones,
      pages: publicPages,
      templateSlug: activeTemplate?.template?.slug || null,
      customization: resolvedCustomization,
      theme: resolvedTheme,
    });
  } catch (err) {
    console.error("Storefront fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
