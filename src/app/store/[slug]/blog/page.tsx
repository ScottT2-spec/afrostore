import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import InteractiveTemplateBlocks from "@/components/storefront/InteractiveTemplateBlocks";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { FashionHeader, FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { ElectronicsFontLoader, ElectronicsFooter } from "@/components/storefront/ElectronicsTemplateBlocks";
import {
  HandmadeBagsHeader,
  HandmadeBagsFooter,
} from "@/components/storefront/HandmadeBagsStoreChrome";

import {
  HealthHeader,
  HealthFooterFull,
  HealthFontLoader,
} from "@/components/storefront/HealthTemplateBlocks";

import {
  RetailHeader,
  RetailFooter,
} from "@/components/storefront/RetailTemplateBlocks";

import {
  KidsHeader,
  KidsFooterFull,
  KidsFontLoader,
} from "@/components/storefront/KidsTemplateBlocks";
import {
  InteriorFontLoader,
  InteriorHeader,
  InteriorFooter,
} from "@/components/storefront/InteriorDesignTemplateBlocks";
import { AccessoriesFontLoader } from "@/components/storefront/AccessoriesTemplateBlocks";
import { CosmeticsFontLoader, CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import { ToysFontLoader } from "@/components/storefront/ToysTemplateBlocks";
import { MakeupFontLoader } from "@/components/storefront/MakeupTemplateBlocks";
import { GroceryFontLoader } from "@/components/storefront/GroceryTemplateBlocks";

import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { TShirtsPrintsFontLoader } from "@/components/storefront/TShirtsPrintsTemplateBlocks";
import { FashionFontLoader } from "@/components/storefront/FashionTemplateBlocks";
import { BlogPageClient } from "@/components/storefront/BlogPageClient";

import { buildPageBackgroundStyle } from "@/lib/site-customization";
import { mergeBespokeTemplateBlocks } from "@/lib/templates/bespoke-page-content";
import { resolveLivePageContent } from "@/lib/templates/bespoke-page-content";
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
      customizations: true,
      templates: {
        where: { isActive: true },
        include: { template: true },
      },
      pages: {
        where: { slug: "blog" },
        take: 1,
      },
      blogs: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
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

  // Resolve the saved content first; if the page is an override document,
  // materialize the saved tree from the bespoke preset resolver.
  const resolvedPage = resolveLivePageContent(templateSlug || "", "blog", blogPage.content, {
    pageSlug: "blog",
    pageTitle: blogPage.title,
    pageType: blogPage.type,
    templateSlug,
  });
  const pageNodeStyles = resolvedPage.css ? <style data-live-node-styles dangerouslySetInnerHTML={{ __html: resolvedPage.css }} /> : null;
  let blocks: TemplateBlock[] = resolvedPage.blocks.length > 0 ? resolvedPage.blocks : mergeBespokeTemplateBlocks(templateSlug || "", "blog", []);

  // Remove hardcoded posts from blog blocks to use context data instead
  blocks = blocks.map(block => {
    const props = block.props ?? {};
    if (block.type === 'fashionBlogPosts' && props.posts) {
      return { ...block, props: { ...props, posts: [] } };
    }
    if (block.type === 'healthBlogPosts' && props.posts) {
      return { ...block, props: { ...props, posts: [] } };
    }
    if (block.type === 'kidsBlogPosts' && props.posts) {
      return { ...block, props: { ...props, posts: [] } };
    }
    return block;
  });

  const customization = (store.customizations as any) || null;
  const pageSettings = resolvedPage.settings || {};

  const isTShirtsPrintsTemplate =
    templateSlug === "t-shirts-prints" ||
    slug === "t-shirts-prints" ||
    store.slug === "t-shirts-prints" ||
    store.name?.toLowerCase().includes("t-shirts");

  const isFashionTemplate =
  templateSlug === "fashion" ||
  templateSlug === "fashion-colored";

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

const isHandmadeBagsTemplate =
  templateSlug === "handmade-bags";

const isHealthTemplate =
  templateSlug === "health" ||
  templateSlug === "pills";

const isRetailTemplate =
  templateSlug === "retail" ||
  templateSlug === "decor";

const isKidsTemplate =
  templateSlug === "kids" ||
  templateSlug === "kids-world";

  const themeData: ThemeData = {

    id: isHealthTemplate ? "health-blog-page" : (isHandmadeBagsTemplate ? "handmade-bags-blog-page" : (isRetailTemplate ? "retail-blog-page" : (isKidsTemplate ? "kids-blog-page" : "tshirts-blog-page"))),
    name: isHealthTemplate ? "Health Blog Page" : (isHandmadeBagsTemplate ? "Handmade Bags Blog Page" : (isRetailTemplate ? "Retail Blog Page" : (isKidsTemplate ? "Kids Blog Page" : "T-Shirts Blog Page"))),
    slug: isHealthTemplate ? "health-blog-page" : (isHandmadeBagsTemplate ? "handmade-bags-blog-page" : (isRetailTemplate ? "retail-blog-page" : (isKidsTemplate ? "kids-blog-page" : "tshirts-blog-page"))),


    config: {
      colors: {
        primary: customization?.themeSettings?.colors?.primary || (isHealthTemplate ? "#88ad99" : (isHandmadeBagsTemplate ? "#c27843" : (isRetailTemplate ? "#2c2c2c" : (isKidsTemplate ? "#2563EB" : "#111")))),
        secondary: customization?.themeSettings?.colors?.secondary || "#333",
        accent: customization?.themeSettings?.colors?.accent || "#666",
        background: customization?.themeSettings?.colors?.background || "#ffffff",
        text: customization?.themeSettings?.colors?.text || "#242424",
      },
    },
  };

  const socialLinks = [
    ...(store.customizations as any)?.socialLinks?.facebook ? [{ platform: "facebook", url: (store.customizations as any).socialLinks.facebook }] : [],
    ...(store.customizations as any)?.socialLinks?.twitter ? [{ platform: "twitter", url: (store.customizations as any).socialLinks.twitter }] : [],
    ...(store.customizations as any)?.socialLinks?.instagram ? [{ platform: "instagram", url: (store.customizations as any).socialLinks.instagram }] : [],
    ...((store.customizations as any)?.socialLinks?.youtube ? [{ platform: "youtube", url: (store.customizations as any).socialLinks.youtube }] : []),
  ];

  if (isHandmadeBagsTemplate) {
    // Format blogs for FashionStoreContext
    const formattedBlogs = (store.blogs || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author,
      category: blog.category,
      tags: blog.tags || [],
      publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
      createdAt: blog.createdAt.toISOString(),
    }));

    return (
      <ThemeProvider theme={themeData}>
        <BlogPageClient
          storeId={store.id}
          storeSlug={slug}
          blogs={formattedBlogs}
          currency={store.currency || "NGN"}
          socialLinks={socialLinks}
        >
          <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
            <HandmadeBagsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
            <main style={buildPageBackgroundStyle(pageSettings)}>
              {pageNodeStyles}
              <RenderTemplateBlocks blocks={blocks} />
            </main>
            <HandmadeBagsFooter
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              socialLinks={socialLinks}
              description={customization?.about?.description || "Handcrafted leather goods made with passion and precision."}
            />
          </div>
        </BlogPageClient>
      </ThemeProvider>
    );
  }

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
          {pageNodeStyles}
          <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={[]} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
        </main>
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          description={store.description ?? undefined}
        />

      </ThemeProvider>
    );
  }

  if (isRetailTemplate) {
    // Format blogs for Retail template
    const formattedBlogs = (store.blogs || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author,
      category: blog.category,
      tags: blog.tags || [],
      publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
      createdAt: blog.createdAt.toISOString(),
    }));

    return (
      <ThemeProvider theme={themeData}>
        <BlogPageClient
          storeId={store.id}
          storeSlug={slug}
          blogs={formattedBlogs}
          currency={store.currency || "NGN"}
          socialLinks={socialLinks}
          template={templateSlug}
        >
          <div className="min-h-screen bg-white">
            <RetailHeader storeName={store.name} storeSlug={slug} logo={store.logo} isLanding={false} />
            <main style={buildPageBackgroundStyle(pageSettings)}>
              {pageNodeStyles}
              <RenderTemplateBlocks blocks={blocks} />
            </main>
            <RetailFooter
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              description={customization?.about?.description || store.description || undefined}
            />
          </div>
        </BlogPageClient>
      </ThemeProvider>
    );
  }

  if (isKidsTemplate) {
    // Format blogs for Kids template
    const formattedBlogs = (store.blogs || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author,
      category: blog.category,
      tags: blog.tags || [],
      publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
      createdAt: blog.createdAt.toISOString(),
    }));

    return (
      <ThemeProvider theme={themeData}>
        <BlogPageClient
          storeId={store.id}
          storeSlug={slug}
          blogs={formattedBlogs}
          currency={store.currency || "NGN"}
          socialLinks={socialLinks}
          template={templateSlug}
        >
          <div className="min-h-screen bg-white text-[#0F172A]" style={{ fontFamily: "'Quicksand', Arial, sans-serif" }}>
            <KidsFontLoader />
            <KidsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
            <main style={buildPageBackgroundStyle(pageSettings)}>
              {pageNodeStyles}
              <RenderTemplateBlocks blocks={blocks} />
            </main>
            <KidsFooterFull
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              socialLinks={socialLinks}
              description={customization?.about?.description || store.description || "A colorful kids and baby store with age categories, educational products, and safety callouts."}
            />
          </div>
        </BlogPageClient>
      </ThemeProvider>
    );
  }

  if (isHealthTemplate) {
    // Format blogs for HealthStoreContext
    const formattedBlogs = (store.blogs || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author,
      category: blog.category,
      tags: blog.tags || [],
      publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
      createdAt: blog.createdAt.toISOString(),
    }));

    return (
      <ThemeProvider theme={themeData}>
        <BlogPageClient
          storeId={store.id}
          storeSlug={slug}
          blogs={formattedBlogs}
          currency={store.currency || "NGN"}
          socialLinks={socialLinks}
          template={templateSlug}
        >
          <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
            <HealthFontLoader />
            <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
            <main style={buildPageBackgroundStyle(pageSettings)}>
              {pageNodeStyles}
              <RenderTemplateBlocks blocks={blocks} />
            </main>
            <HealthFooterFull
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              socialLinks={socialLinks}
              description={customization?.about?.description || "Your trusted source for vitamins, supplements, and wellness products."}
            />
          </div>
        </BlogPageClient>
      </ThemeProvider>
    );
  }

  // Format blogs for T-Shirts template
  const formattedBlogs = (store.blogs || []).map(blog => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    coverImage: blog.coverImage,
    author: blog.author,
    category: blog.category,
    tags: blog.tags || [],
    publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
    createdAt: blog.createdAt.toISOString(),
  }));


 /* ── T-Shirts & Prints template ── */
if (isTShirtsPrintsTemplate) {
  return (
    <ThemeProvider theme={themeData}>
      <BlogPageClient
        storeId={store.id}
        storeSlug={slug}
        blogs={formattedBlogs}
        currency={store.currency || "NGN"}
        socialLinks={socialLinks}
        template={templateSlug}
      >
        <div
          className="min-h-screen bg-white text-[#1d1d1d]"
          style={{ fontFamily: "'Manrope', Arial, sans-serif" }}
        >
          <TShirtsPrintsFontLoader />

          <TShirtsPrintsHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
          />

          <main style={buildPageBackgroundStyle(pageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks} />
          </main>

          <TShirtsPrintsFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            socialLinks={socialLinks}
          />
        </div>
      </BlogPageClient>
    </ThemeProvider>
  );
}

  /* ── Electronics template ── */
  if (isElectronicsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <ElectronicsFontLoader />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          {pageNodeStyles}
          <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
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
          {pageNodeStyles}
          <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
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
          {pageNodeStyles}
          <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
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
        {pageNodeStyles}
        <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
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
        {pageNodeStyles}
        <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
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
        {pageNodeStyles}
        <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
      </main>
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          description={store.description ?? undefined}
        />
      </ThemeProvider>
    );
  }

  const isCosmeticsTemplate =
    data.templateSlug === "cosmetics" ||
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
          <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
        </main>
        <CosmeticsFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description ?? undefined} />
      </ThemeProvider>
    );
  }


  /* ── Default/generic: render blocks with minimal chrome ── */
  return (
    <ThemeProvider theme={themeData}>
      <main style={buildPageBackgroundStyle(pageSettings)}>
        {pageNodeStyles}
        <InteractiveTemplateBlocks templateSlug={templateSlug} blocks={blocks} products={[]} blogs={formattedBlogs} currency={store.currency || "NGN"} storeId={store.id} storeSlug={slug} />
      </main>
    </ThemeProvider>
  );
}
