import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { asRecord } from "@/lib/json";
import { buildThemeDataWithCustomization, loadSiteCustomizationSafely } from "@/lib/site-customization";
import { mergeStoredTemplatePages } from "@/lib/templates/site-instance";
import { ensurePerfumePages } from "@/lib/templates/perfume-pages";
import { ensureVegetablePages } from "@/lib/templates/vegetable-pages";
import { ensureTemplatePages } from "@/lib/templates/template-pages";
import { RETAIL_PROJECT_DETAIL_BLOCKS } from "@/lib/templates/presets/retail-pages";
import type { PageType, Prisma } from "@/generated/prisma";

type Params = { params: Promise<{ slug: string; pageSlug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

function buildKidsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  if (pageSlug === "about") {
    return {
      id: "kids-about",
      title: "About Us",
      slug: "about",
      type: "CUSTOM" as PageType,
      template: "kids",
      content: {
        blocks: [
          {
            id: "kids-about-announcement",
            type: "kidsAnnouncementBar",
            props: {
              text: "Sign up for our newsletter to get 30% off for the week!",
              link: "#newsletter",
              backgroundColor: "#10c349",
            },
          },
          {
            id: "kids-about-header",
            type: "kidsHeader",
            props: {
              storeName: "Kids Store",
              storeSlug: "kids",
            },
          },
          {
            id: "kids-about-hero",
            type: "kidsAboutHero",
            props: {
              subtitle: "About Us",
              title: "Discover Favorites for Every Little One",
              bodyText: [
                "Our shelves are filled with carefully selected clothing, toys, and accessories that make every day a little brighter. From newborn essentials to playful finds, every item is chosen for its quality, comfort, and lasting value.",
                "Whether you're shopping for your own child or searching for the perfect gift, you'll find something special for every stage of childhood.",
              ],
              images: [
                "/uploads/kids_images/About.webp",
                "/uploads/kids_images/Bblogz.webp",
              ],
              calloutText: "We handpick every item for its quality, safety, and playful charm, ensuring every collection meets the needs of modern parents and curious little explorers.",
              calloutLabel: "Meet the team",
            },
          },
          {
            id: "kids-about-team",
            type: "kidsTeamSection",
            props: {
              sectionTitle: {
                subtitle: "",
                title: "",
              },
              team: [
                { name: "Sally Coulibaly", role: "Director" },
                { name: "Rebecca Davina", role: "Marketing strategist" },
                { name: "Jarelle Fateh", role: "Product designer" },
                { name: "Khalisto Arielle", role: "CEO" },
              ],
            },
          },
          {
            id: "kids-about-how-we-work",
            type: "kidsTextSection",
            props: {
              sectionTitle: {
                subtitle: "Why Parents Choose Us",
                title: "What we Do",
              },
              bodyText: [
                "We carefully select every product with children and parents in mind, focusing on quality, comfort, and everyday practicality. From trendy outfits and educational toys to must-have accessories, each item is chosen to bring happiness, value, and confidence to every purchase.",
                "Our goal is to create a simple and enjoyable shopping experience from start to finish. With thoughtfully curated collections, trusted products, and friendly service, we help families find everything their little ones need in one convenient place.",
              ],
              backgroundColor: "#faf8f5",
            },
          },
          {
            id: "kids-about-faq",
            type: "kidsFaqSection",
            props: {
              sectionTitle: {
                subtitle: "What You'll Find",
                title: "Baby Love",
              },
              subtitle: "Discover a carefully curated collection of children's clothing, toys, accessories, and everyday essentials designed to make growing up more fun.",
              faqs: [
                {
                  question: "Are your products safe for children?",
                  answer: "Yes. We carefully source products from trusted manufacturers that meet recognized safety and quality standards, giving parents confidence with every purchase.",
                },
                {
                  question: "How long does shipping take?",
                  answer: "Most orders are processed quickly and shipped within a few business days. Delivery times may vary depending on your location and the shipping option you choose.",
                },
                {
                  question: "What's the best size to buy for a baby shower gift?",
                  answer: "A great choice is 3–6 months or 6–12 months, as babies often outgrow newborn sizes very quickly. These sizes give parents something practical for the months ahead while ensuring your gift gets plenty of use.",
                },
              ],
            },
          },
          {
            id: "kids-about-footer",
            type: "kidsFooterFull",
            props: {
              storeName: "Kids Store",
              storeSlug: "kids",
            },
          },
        ],
        settings: {}
      },
      metaTitle: "About Us",
      metaDescription: "About the Kids collection",
    };
  }

  if (pageSlug === "contact") {
    return {
      id: "kids-contact",
      title: "Contact Us",
      slug: "contact",
      type: "CUSTOM" as PageType,
      template: "kids",
      content: {
        blocks: [
          {
            id: "kids-contact-announcement",
            type: "kidsAnnouncementBar",
            props: {
              text: "Sign up for our newsletter to get 20% off for the week!",
              link: "#newsletter",
              backgroundColor: "#39a454",
            },
          },
          {
            id: "kids-contact-header",
            type: "kidsHeader",
            props: {
              storeName: "Kids Store",
              storeSlug: "kids",
            },
          },
          {
            id: "kids-contact-hero",
            type: "kidsContactHero",
            props: {
              address: "413 Waystreet Road, North Carolina, United States",
              showMapLink: true,
            },
          },
          {
            id: "kids-contact-info",
            type: "kidsContactInfo",
            props: {
              phone: "(097) 330-1233",
              hours: "9:00am - 5:00pm",
              days: "Monday - Friday",
              socialLinks: {
                facebook: "#",
                twitter: "#",
                instagram: "#",
                youtube: "#",
              },
              showMapLink: true,
            },
          },
          {
            id: "kids-contact-form",
            type: "kidsContactForm",
            props: {
              title: "Get in touch",
            },
          },
          {
            id: "kids-contact-hours",
            type: "kidsOpeningHours",
            props: {
              title: "Monday - Friday",
              hours: [
                { label: "Hours", value: "9:00am - 5:00pm" },
                { label: "Support", value: "(064) 332-1233" },
                { label: "Address", value: "North Carolina, MO" },
              ],
              infoText: "Technology made for Good. Prokip Africa.",
              links: [
                { label: "Visit the blog", href: "/blog" },
                { label: "Shop the collection", href: "/shop" },
              ],
              storeSlug: "kids",
            },
          },
          {
            id: "kids-contact-footer",
            type: "kidsFooterFull",
            props: {
              storeName: "Kids Store",
              storeSlug: "kids",
            },
          },
        ],
        settings: {}
      },
      metaTitle: "Contact Us",
      metaDescription: "Get in touch with the Kids collection",
    };
  }

  if (pageSlug === "blog") {
    return {
      id: "kids-blog",
      title: "Blog",
      slug: "blog",
      type: "CUSTOM" as PageType,
      template: "kids",
      content: {
        blocks: [
          {
            id: "kids-blog-announcement",
            type: "kidsAnnouncementBar",
            props: {
              text: "Sign up for our newsletter to get 45% off for the week!",
              link: "#newsletter",
              backgroundColor: "#73a97b",
            },
          },
          {
            id: "kids-blog-header",
            type: "kidsHeader",
            props: {
              storeName: "Kids Store",
              storeSlug: "kids",
            },
          },
          {
            id: "kids-blog-grid",
            type: "kidsBlogPosts",
            props: {
              columns: 3,
              sectionTitle: {
                title: "Latest Articles",
              },
              posts: [],
            },
          },
          {
            id: "kids-blog-footer",
            type: "kidsFooterFull",
            props: {
              storeName: "Kids Store",
              storeSlug: "kids",
            },
          },
        ],
        settings: {}
      },
      metaTitle: "Blog",
      metaDescription: "Latest tips and stories for parents",
    };
  }

  return null;
}

function buildCosmeticsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  const cosmeticsPages: Record<string, { title: string; type: PageType; metaDescription: string }> = {
    "home": { title: "Home", type: "HOME" as PageType, metaDescription: "Welcome to our cosmetics store" },
    "shop": { title: "Shop", type: "SHOP" as PageType, metaDescription: "Browse our cosmetics collection" },
    "blog": { title: "Blog", type: "BLOG" as PageType, metaDescription: "Latest beauty tips and trends" },
    "bestseller": { title: "Bestsellers", type: "CUSTOM" as PageType, metaDescription: "Our most loved cosmetics products" },
    "new-in": { title: "New Arrivals", type: "CUSTOM" as PageType, metaDescription: "Just arrived cosmetics and beauty products" },
    "skincare": { title: "Skincare", type: "CUSTOM" as PageType, metaDescription: "Premium skincare collection" },
    "terms": { title: "Terms and Conditions", type: "POLICY" as PageType, metaDescription: "Store terms and conditions" },
    "about-us": { title: "About Us", type: "ABOUT" as PageType, metaDescription: "About our cosmetics store" },
    "contact-us": { title: "Contact Us", type: "CONTACT" as PageType, metaDescription: "Get in touch with us" },
  };

  const pageDef = cosmeticsPages[pageSlug];
  if (!pageDef) return null;

  return {
    id: `cosmetics-${pageSlug}`,
    title: pageDef.title,
    slug: pageSlug,
    type: pageDef.type,
    template: "cosmetics",
    content: { blocks: [], settings: {} },
    metaTitle: pageDef.title,
    metaDescription: pageDef.metaDescription,
  };
}

function buildTShirtsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  if (pageSlug === "about-us") {
    return {
      id: "tshirts-about-us",
      title: "About Us",
      slug: "about-us",
      type: "CUSTOM" as PageType,
      template: "t-shirts-prints",
      content: { blocks: [], settings: {} },
      metaTitle: "About Us",
      metaDescription: "About the T-Shirts & Prints studio",
    };
  }

  if (pageSlug === "contact-us") {
    return {
      id: "tshirts-contact-us",
      title: "Contact Us",
      slug: "contact-us",
      type: "CUSTOM" as PageType,
      template: "t-shirts-prints",
      content: { blocks: [], settings: {} },
      metaTitle: "Contact Us",
      metaDescription: "Contact the T-Shirts & Prints studio",
    };
  }

  return null;
}

function buildHandmadeBagsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  const handmadeBagsPages: Record<string, { title: string; type: PageType; metaDescription: string }> = {
    "home": { title: "Home", type: "HOME" as PageType, metaDescription: "Welcome to our handcrafted leather goods store" },
    "about": { title: "About Us", type: "CUSTOM" as PageType, metaDescription: "About our handcrafted leather goods" },
    "contact": { title: "Contact Us", type: "CUSTOM" as PageType, metaDescription: "Get in touch with us" },
    "our-story": { title: "Our Story", type: "CUSTOM" as PageType, metaDescription: "Our journey in leather craftsmanship" },
    "reviews": { title: "Reviews", type: "CUSTOM" as PageType, metaDescription: "Customer reviews and testimonials" },
    "blog": { title: "Blog", type: "CUSTOM" as PageType, metaDescription: "Latest stories from our workshop" },
  };

  const pageDef = handmadeBagsPages[pageSlug];
  if (!pageDef) return null;

  return {
    id: `handmade-bags-${pageSlug}`,
    title: pageDef.title,
    slug: pageSlug,
    type: pageDef.type,
    template: "handmade-bags",
    content: { blocks: [], settings: {} },
    metaTitle: pageDef.title,
    metaDescription: pageDef.metaDescription,
  };
}

function buildRetailSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  // For project detail pages, use the preset blocks from RETAIL_PROJECT_DETAIL_BLOCKS
  if (pageSlug.startsWith("project-") && RETAIL_PROJECT_DETAIL_BLOCKS[pageSlug]) {
    const presetBlocks = RETAIL_PROJECT_DETAIL_BLOCKS[pageSlug];
    const title = pageSlug
      .replace("project-", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      id: `retail-${pageSlug}`,
      title: title,
      slug: pageSlug,
      type: "CUSTOM" as PageType,
      template: "retail",
      content: { blocks: presetBlocks, settings: {} },
      metaTitle: title,
      metaDescription: `Project details for ${title}`,
    };
  }

  // For other Retail pages, return basic synthetic pages
  const retailPages: Record<string, { title: string; type: PageType; metaDescription: string }> = {
    "about": { title: "About Us", type: "CUSTOM" as PageType, metaDescription: "About our retail store" },
    "contact": { title: "Contact Us", type: "CUSTOM" as PageType, metaDescription: "Get in touch with us" },
    "projects": { title: "Projects", type: "CUSTOM" as PageType, metaDescription: "Our latest projects" },
    "our-story": { title: "Our Story", type: "CUSTOM" as PageType, metaDescription: "Our journey" },
    "reviews": { title: "Reviews", type: "CUSTOM" as PageType, metaDescription: "Customer reviews" },
  };

  const pageDef = retailPages[pageSlug];
  if (!pageDef) return null;

  return {
    id: `retail-${pageSlug}`,
    title: pageDef.title,
    slug: pageSlug,
    type: pageDef.type,
    template: "retail",
    content: { blocks: [], settings: {} },
    metaTitle: pageDef.title,
    metaDescription: pageDef.metaDescription,
  };
}

// GET /api/storefront/:slug/pages/:pageSlug — public page content + full store context
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, pageSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
    });

    if (!site) return notFound("Store not found");

    const activeTemplate = await prisma.siteTemplate.findFirst({
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
    });

    if (activeTemplate?.template?.slug === "vegetables") {
      await ensureVegetablePages(site.id);
    }

    if (activeTemplate?.template?.slug === "perfumes") {
      await ensurePerfumePages(site.id);
    }

    // Ensure template-specific pages exist for all bespoke templates
    if (activeTemplate?.template?.slug) {
      await ensureTemplatePages(site.id, activeTemplate.template.slug);
    }

    const [
      page,
      settings,
      socialLinks,
      categories,
      deliveryZones,
      allPages,
      activeTheme,
      products,
      blogs,
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
        select: { id: true, title: true, slug: true, type: true, template: true },
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
      prisma.blog.findMany({
        where: { siteId: site.id, status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          category: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
      }),
      loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId: site.id } })),
    ]);

    const resolvedCustomization = customization;
    const templateSlug = activeTemplate?.template?.slug || "";
    const syntheticPage =
      templateSlug === "kids"
        ? buildKidsSyntheticPage(pageSlug)
        : templateSlug === "t-shirts-prints" || slug === "t-shirts-prints" || site.slug === "t-shirts-prints" || site.name?.toLowerCase().includes("t-shirts")
          ? buildTShirtsSyntheticPage(pageSlug)
        : templateSlug === "cosmetics" || templateSlug === "makeup" || slug === "cosmetics" || site.slug === "cosmetics" || site.name?.toLowerCase().includes("cosmetics") || site.name?.toLowerCase().includes("makeup")
          ? buildCosmeticsSyntheticPage(pageSlug)
        : templateSlug === "handmade-bags" || slug === "handmade-bags" || site.slug === "handmade-bags" || site.name?.toLowerCase().includes("handmade") || site.name?.toLowerCase().includes("leather")
          ? buildHandmadeBagsSyntheticPage(pageSlug)
        : templateSlug === "retail" || templateSlug === "decor" || slug === "retail" || slug === "decor" || site.slug === "retail" || site.slug === "decor" || site.name?.toLowerCase().includes("retail") || site.name?.toLowerCase().includes("decor")
          ? buildRetailSyntheticPage(pageSlug)
          : null;
    const mergedPages = mergeStoredTemplatePages(page ? [page] : syntheticPage ? [syntheticPage] : [], activeTemplate?.pages);
    const fallbackPage = mergedPages.find((item) => item.slug === pageSlug) || mergedPages[0];
    if (!fallbackPage) return notFound("Page not found");

    // Normalize content structure - handle both array and object with blocks property
    let normalizedContent = fallbackPage.content;
    if (normalizedContent && typeof normalizedContent === 'object' && !Array.isArray(normalizedContent)) {
      // Content is an object - check if it has blocks property
      if (normalizedContent.blocks && Array.isArray(normalizedContent.blocks)) {
        // Already has blocks property, use as-is
        normalizedContent = normalizedContent;
      } else {
        // Object without blocks property - wrap in blocks structure
        normalizedContent = { blocks: [], settings: normalizedContent.settings || {} };
      }
    } else if (Array.isArray(normalizedContent)) {
      // Content is a direct array - wrap in blocks structure
      normalizedContent = { blocks: normalizedContent, settings: {} };
    } else {
      // Invalid content - use empty structure
      normalizedContent = { blocks: [], settings: {} };
    }

    // Update fallbackPage with normalized content
    fallbackPage.content = normalizedContent;

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
        resolvedCustomization,
      );
    } catch (themeError) {
      console.error("Storefront page theme build error:", themeError);
    }

    const publicPages = mergeStoredTemplatePages(allPages, activeTemplate?.pages);

    const response = success({
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
      blogs: blogs || [],
      categories,
      deliveryZones,
      pages: publicPages,
      templateSlug: activeTemplate?.template?.slug || null,
      customization: resolvedCustomization,
      theme: resolvedTheme,
    });

    // Add cache headers to prevent browser caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (err) {
    console.error("Storefront page fetch error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
