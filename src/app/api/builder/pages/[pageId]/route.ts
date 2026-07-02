import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { asRecord } from "@/lib/json";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { buildThemeDataWithCustomization, loadSiteCustomizationSafely } from "@/lib/site-customization";
import { mergeStoredTemplatePages } from "@/lib/templates/site-instance";
import { normalizePageContentRaw } from "@/lib/page-content";
import type { Prisma } from "@/generated/prisma";

type Params = { params: Promise<{ pageId: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { pageId } = await params;

  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        siteId: true,
        title: true,
        slug: true,
        type: true,
        template: true,
        content: true,
        isPublished: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    if (!page) return notFound("Page not found");

    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const site = await prisma.site.findUnique({
      where: { id: page.siteId },
      include: { members: true, workspace: true },
    });

    if (!site) return notFound("Site not found");

    const isWorkspaceOwner = site.workspace.ownerId === user.id;
    const isSiteMember = site.members.some((member) => member.userId === user.id);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (!isWorkspaceOwner && !isSiteMember && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const [
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
        select: { id: true, title: true, slug: true, type: true, template: true, content: true },
        orderBy: { position: "asc" },
      }),
      prisma.siteTheme.findFirst({
        where: { siteId: site.id, isActive: true },
        include: { theme: { select: { id: true, name: true, slug: true, config: true } } },
      }),
      prisma.siteTemplate.findFirst({
        where: { siteId: site.id, isActive: true },
        select: {
          variant: true,
          themeConfig: true,
          pages: true,
          customHtml: true,
          template: { select: { id: true, name: true, slug: true } },
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
      loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId: site.id } })),
    ]);

    const resolvedCustomization = customization;

    const publicProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      stock: settings?.showStockCount ? product.stock : undefined,
      inStock: product.stock > 0,
      isFeatured: product.isFeatured,
      tags: product.tags,
      images: product.images,
      category: product.category,
      reviewCount: product._count.reviews,
    }));

    const templateThemeConfig = activeTemplate?.themeConfig as
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
      console.error("Builder page theme build error:", themeError);
    }

    const publicPages = mergeStoredTemplatePages(allPages, activeTemplate?.pages);
    const mergedPages = mergeStoredTemplatePages(page ? [page] : [], activeTemplate?.pages);
    const activePage = mergedPages.find((item) => item.id === page.id) || mergedPages[0] || page;
    const normalizedPage = {
      ...activePage,
      content: normalizePageContentRaw(activePage.content),
    };

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
      page: normalizedPage,
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
    console.error("Builder page fetch error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
