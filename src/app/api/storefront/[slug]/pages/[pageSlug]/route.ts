import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { asRecord } from "@/lib/json";
import { buildThemeDataWithCustomization, loadSiteCustomizationSafely } from "@/lib/site-customization";
import { findStoredTemplatePage, mergeStoredTemplatePages } from "@/lib/templates/site-instance";

type Params = { params: Promise<{ slug: string; pageSlug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

// GET /api/storefront/:slug/pages/:pageSlug — public page content + full store context
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, pageSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug },
          { subdomain: slug },
          { customDomain: slug },
        ],
      },
    });

    if (!site) return notFound("Store not found");

    const [
      page,
      settings,
      socialLinks,
      categories,
      deliveryZones,
      allPages,
      activeTheme,
      activeTemplate,
      products,
      customization,
    ] = await Promise.all([
      prisma.page.findFirst({
        where: {
          siteId: site.id,
          slug: pageSlug,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          template: true,
          content: true,
          metaTitle: true,
          metaDescription: true,
        },
      }),

      prisma.siteSettings.findUnique({
        where: { siteId: site.id },
        select: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
          showStockCount: true,
          lowDataMode: true,
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

      prisma.category.findMany({
        where: { siteId: site.id },
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { position: "asc" },
      }),

      prisma.deliveryZone.findMany({
        where: { siteId: site.id },
        orderBy: { position: "asc" },
      }),

      prisma.page.findMany({
        where: { siteId: site.id, isPublished: true },
        select: { id: true, title: true, slug: true, type: true },
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

      prisma.product.findMany({
        where: { siteId: site.id, status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" }, take: 3 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
        take: 20,
      }),

      loadSiteCustomizationSafely(
        prisma.siteCustomization.findUnique({
          where: { siteId: site.id },
        })
      ),
    ]);
    const resolvedCustomization = customization;

    const fallbackPage = page || findStoredTemplatePage(activeTemplate?.pages, pageSlug);
    if (!fallbackPage) return notFound("Page not found");

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
      console.error("Storefront page theme build error:", themeError);
    }

    const publicPages = mergeStoredTemplatePages(
      allPages.map((item) => ({
        ...item,
        content: undefined,
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
      page: fallbackPage,
      settings: settings || {},
      socialLinks: socialLinks || {},
      products: publicProducts,
      categories,
      deliveryZones,
      pages: publicPages,
      templateSlug: activeTemplate?.template?.slug || null,
      customization: resolvedCustomization,
      theme: resolvedTheme,
    });
  } catch (err) {
    console.error("Storefront page fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
