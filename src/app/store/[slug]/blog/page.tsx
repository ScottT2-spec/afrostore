import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { FashionHeader, FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { ElectronicsFontLoader, ElectronicsFooter } from "@/components/storefront/ElectronicsTemplateBlocks";
import { InteriorFontLoader, InteriorHeader, InteriorFooter } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { AccessoriesFontLoader } from "@/components/storefront/AccessoriesTemplateBlocks";
import { KidsFontLoader } from "@/components/storefront/KidsTemplateBlocks";
import { CosmeticsFontLoader, CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import { ToysFontLoader } from "@/components/storefront/ToysTemplateBlocks";
import { MakeupFontLoader } from "@/components/storefront/MakeupTemplateBlocks";
import { GroceryFontLoader } from "@/components/storefront/GroceryTemplateBlocks";
// Note: Electronics pages don't use FashionHeader - they render headerless (header handled by block content or page-level chrome)
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { TShirtsPrintsFontLoader } from "@/components/storefront/TShirtsPrintsTemplateBlocks";
import { FashionFontLoader } from "@/components/storefront/FashionTemplateBlocks";
import { buildPageBackgroundStyle } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { mergeBespokeTemplateBlocks } from "@/lib/templates/bespoke-page-content";
import { ensureTemplatePages } from "@/lib/templates/template-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getStoreData(slug: string) {
  const store = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    include: {
      templates: {
        where: { isActive: true },
        include: { template: true },
      },
      pages: {
        where: { slug: "blog" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  const activeTemplateSlug = store.templates?.[0]?.template?.slug || null;

  // Ensure template pages exist (including blog)
  if (activeTemplateSlug) {
    try {
      await ensureTemplatePages(store.id, activeTemplateSlug, false);
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "blog" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create Blog page:", error);
    }
  }

  return { store, templateSlug: activeTemplateSlug };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, templateSlug } = data;

  const blogPage = store.pages?.[0];
  if (!blogPage) notFound();

  // Parse page content and merge with template presets
  const parsedContent = blogPage.content ? parsePageContent(blogPage.content) : null;
  let blocks: TemplateBlock[] = [];

  if (parsedContent && parsedContent.blocks.length > 0) {
    blocks = parsedContent.blocks;
  } else {
    // Use template presets if no custom blocks
    const presetBlocks = mergeBespokeTemplateBlocks(templateSlug || "", "blog", []);
    blocks = presetBlocks;
  }

  const customization = (store.customizations as any) || null;
  const pageSettings = parsedContent?.settings || {};

  const isTShirtsPrintsTemplate =
    templateSlug === "t-shirts-prints" ||
    slug === "t-shirts-prints" ||
    store.slug === "t-shirts-prints" ||
    store.name?.toLowerCase().includes("t-shirts");

  const isFashionTemplate =
    templateSlug === "fashion" ||
    templateSlug === "fashion-colored" ||
    templateSlug === "handmade-bags";

  const isElectronicsTemplate =
    templateSlug === "electronics";

  const isAccessoriesTemplate =
    templateSlug === "electronics-accessories";

  const isDecorTemplate =
    templateSlug === "decor" ||
    templateSlug === "retail" ||
    templateSlug === "interior" ||
    templateSlug === "interior-design" ||
    templateSlug === "home-decor";

  const themeData: ThemeData = {
    id: "blog-page",
    name: "Blog Page",
    slug: "blog-page",
    config: {
      colors: {
        primary: customization?.themeSettings?.colors?.primary || "#111",
        secondary: customization?.themeSettings?.colors?.secondary || "#333",
        accent: customization?.themeSettings?.colors?.accent || "#666",
        background: customization?.themeSettings?.colors?.background || "#ffffff",
        text: customization?.themeSettings?.colors?.text || "#1d1d1d",
      },
    },
  };

  /* ── Fashion template ── */
  if (isFashionTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <FashionFontLoader />
        <FashionHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          isLanding={false}
        />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          description={store.description ?? undefined}
        />
      </ThemeProvider>
    );
  }

  /* ── T-Shirts & Prints template ── */
  if (isTShirtsPrintsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
          <TShirtsPrintsFontLoader />
          <TShirtsPrintsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main style={buildPageBackgroundStyle(pageSettings)}>
            <RenderTemplateBlocks blocks={blocks} />
          </main>
          <TShirtsPrintsFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            socialLinks={[
              ...(store.customizations as any)?.socialLinks?.facebook ? [{ platform: "facebook", url: (store.customizations as any).socialLinks.facebook }] : [],
              ...(store.customizations as any)?.socialLinks?.twitter ? [{ platform: "twitter", url: (store.customizations as any).socialLinks.twitter }] : [],
              ...(store.customizations as any)?.socialLinks?.instagram ? [{ platform: "instagram", url: (store.customizations as any).socialLinks.instagram }] : [],
              ...((store.customizations as any)?.socialLinks?.youtube ? [{ platform: "youtube", url: (store.customizations as any).socialLinks.youtube }] : []),
            ]}
          />
        </div>
      </ThemeProvider>
    );
  }

  /* ── Electronics template ── */
  if (isElectronicsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <ElectronicsFontLoader />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <ElectronicsFooter storeSlug={slug} />
      </ThemeProvider>
    );
  }

  /* ── Accessories template ── */
  if (isAccessoriesTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <AccessoriesFontLoader />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
      </ThemeProvider>
    );
  }

  /* ── Decor template ── */
  if (isDecorTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <InteriorFontLoader />
        <InteriorHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
        />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <InteriorFooter storeSlug={slug} />
      </ThemeProvider>
    );
  }

  /* ── Grocery template ── */
  const isGroceryTemplate = templateSlug === "grocery";

  if (isGroceryTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <GroceryFontLoader />
        <FashionHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          isLanding={false}
        />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          description={store.description ?? undefined}
        />
      </ThemeProvider>
    );
  }

  /* ── Makeup template ── */
  const isMakeupTemplate = templateSlug === "makeup";

  if (isMakeupTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <MakeupFontLoader />
        <FashionHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          isLanding={false}
        />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          description={store.description ?? undefined}
        />
      </ThemeProvider>
    );
  }

  /* ── Toys template ── */
  const isToysTemplate = templateSlug === "toys";

  if (isToysTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <ToysFontLoader />
        <FashionHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          isLanding={false}
        />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          description={store.description ?? undefined}
        />
      </ThemeProvider>
    );
  }

  /* ── Cosmetics template ── */
  const isCosmeticsTemplate =
    templateSlug === "cosmetics" ||
    slug === "stacj" ||
    slug?.toLowerCase().includes("cosmetics") ||
    slug?.toLowerCase().includes("stacj") ||
    store.name?.toLowerCase().includes("cosmetics") ||
    store.name?.toLowerCase().includes("stacj");

  if (isCosmeticsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <CosmeticsFontLoader />
        <CosmeticsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <CosmeticsFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description ?? undefined} />
      </ThemeProvider>
    );
  }

  /* ── Kids template ── */
  const isKidsTemplate =
    templateSlug === "kids" ||
    slug === "kids";

  if (isKidsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <div className="min-h-screen bg-[#fffdf7] text-[#242424]">
          <KidsFontLoader />
          <main style={buildPageBackgroundStyle(pageSettings)}>
            <RenderTemplateBlocks blocks={blocks} />
          </main>
        </div>
      </ThemeProvider>
    );
  }

  /* ── Default/generic: render blocks with minimal chrome ── */
  return (
    <ThemeProvider theme={themeData}>
      <main style={buildPageBackgroundStyle(pageSettings)}>
        <RenderTemplateBlocks blocks={blocks} />
      </main>
    </ThemeProvider>
  );
}
