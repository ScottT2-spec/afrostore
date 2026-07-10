import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { applyPageCustomization, buildPageBackgroundStyle, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { serializeProductsForClient } from "@/lib/serialize-products";

type Props = {
  params: Promise<{ slug: string }>;
};

/* Our Story page blocks - matching Handmade Bags template style (fallback if no custom content) */
const OUR_STORY_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "story-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "OUR STORY",
          titleLine1: "From Workshop",
          titleLine2: "To World-Class",
          description: "A journey of passion, dedication, and the pursuit of excellence in leather craftsmanship.",
          buttonText: "Explore Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "story-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Founded 2008", icon: "✦" },
        { text: "30+ Countries", icon: "✦" },
        { text: "100+ Artisans", icon: "✦" },
        { text: "Sustainable", icon: "✦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "28px",
      fontWeight: "600",
      paddingY: "25px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },
  {
    id: "story-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "THE BEGINNING",
      title: "A Dream in a Small Workshop",
      description: "In 2008, in a modest workshop in the heart of the city, our founder set out with a simple yet ambitious vision: to create leather goods that would stand the test of time. With just three artisans and a handful of tools, the first collection was born – five handcrafted bags that would become the foundation of everything we stand for today.",
      align: "center",
      maxWidth: "70%",
      marginBottom: "60px",
    },
  },
  {
    id: "story-timeline",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR JOURNEY",
      title: "Milestones That Shaped Us",
      description: "Every year brought new challenges, learnings, and opportunities to grow while staying true to our core values.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "50px",
    },
  },
  {
    id: "story-timeline-banners",
    type: "fashionCoverBanners",
    props: {
      columns: 3,
      height: "450px",
      marginBottom: "70px",
      banners: [
        {
          image: "https://images.unsplash.com/photo-1473188588951-1d4f0e31f5e0?w=800&h=1000&fit=crop",
          icon: "",
          title: "2008 - The Beginning",
          description: "Founded with three artisans and a vision for timeless leather craftsmanship. Our first collection of five bags sold out within weeks.",
          overlayOpacity: 0.35,
        },
        {
          image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=1000&fit=crop",
          icon: "",
          title: "2012 - First Expansion",
          description: "Opened our flagship store and expanded our workshop. Introduced our signature vegetable-tanned leather collection.",
          overlayOpacity: 0.35,
        },
        {
          image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&h=1000&fit=crop",
          icon: "",
          title: "2018 - Global Reach",
          description: "Launched internationally, reaching customers in over 30 countries. Established partnerships with ethical leather suppliers.",
          overlayOpacity: 0.35,
        },
      ],
    },
  },
  {
    id: "story-philosophy",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR PHILOSOPHY",
      title: "Craftsmanship With Purpose",
      description: "We believe that true luxury is not about labels or price tags – it's about the story behind each piece, the hands that made it, and the values it represents.",
      align: "center",
      maxWidth: "65%",
      marginBottom: "50px",
    },
  },
  {
    id: "story-values",
    type: "fashionFeatures",
    props: {
      columns: 2,
      marginBottom: "70px",
      features: [
        {
          number: "01",
          title: "Heritage Techniques",
          description: "We preserve traditional leatherworking methods passed down through generations, combining them with modern innovation for pieces that are both timeless and contemporary.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "02",
          title: "Ethical Sourcing",
          description: "Every piece of leather we use comes from suppliers who share our commitment to animal welfare, environmental sustainability, and fair labor practices.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "story-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Be Part of Our Story",
      description: "Join thousands of customers who have made our pieces part of their journey. Subscribe for exclusive updates and early access to new collections.",
      buttonText: "Subscribe",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];

async function getStoreData(slug: string) {
  const store = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { slug },
        { subdomain: slug },
        { customDomain: slug },
      ],
    },
    include: {
      customizations: true,
      pages: {
        where: { slug: "our-story" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  // Auto-create Our Story page if it doesn't exist
  if (!store.pages || store.pages.length === 0) {
    try {
      await prisma.page.create({
        data: {
          siteId: store.id,
          title: "Our Story",
          slug: "our-story",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 11,
        },
      });
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "our-story" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create Our Story page:", error);
    }
  }

  // Get products for the store
  const products = await prisma.product.findMany({
    where: { siteId: store.id, status: "ACTIVE" },
    include: {
      images: true,
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get blog posts
  const blogs = await prisma.blog.findMany({
    where: { siteId: store.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });

  return { store, products, blogs };
}

export default async function OurStoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, products, blogs } = data;

  // Serialize products to convert Decimal values to plain numbers for client components
  const serializedProducts = serializeProductsForClient(products);

  const customization = normalizeSiteCustomization(store.customizations as any);
  const visiblePages = filterVisiblePages(store.pages || [], customization);
  const customizedPages = visiblePages.map((page: any) => applyPageCustomization(page, customization));
  const ourStoryPage = customizedPages.find((p: any) => p.slug === "our-story");
  
  // Use custom blocks if available, otherwise use preset
  let pageContent;
  if (ourStoryPage?.content) {
    const parsed = parsePageContent(ourStoryPage.content);
    pageContent = parsed;
  } else {
    pageContent = { blocks: OUR_STORY_PAGE_BLOCKS, settings: {} };
  }

  const pageSettings = ourStoryPage ? getResolvedPageSettings(ourStoryPage, pageContent.settings, customization) : {};
  const themeData = {
    primaryColor: customization?.themeSettings?.colors?.primary || "#c27843",
    secondaryColor: customization?.themeSettings?.colors?.secondary || "#242424",
    accentColor: customization?.themeSettings?.colors?.accent || "#767676",
    backgroundColor: customization?.themeSettings?.colors?.background || "#ffffff",
    textColor: customization?.themeSettings?.colors?.text || "#242424",
  };

  return (
    <ThemeProvider initialTheme={themeData}>
      <HandmadeBagsHeader
        storeName={store.name}
        storeSlug={store.slug}
        logo={store.logo}
        isLanding={false}
      />
      <div style={buildPageBackgroundStyle(pageSettings)}>
        {ourStoryPage?.content ? (
          <RenderBlocks blocks={pageContent.blocks as BuilderBlock[]} storeSlug={slug} products={serializedProducts} />
        ) : (
          <RenderTemplateBlocks blocks={OUR_STORY_PAGE_BLOCKS} />
        )}
      </div>
      <HandmadeBagsFooter
        storeName={store.name}
        storeSlug={store.slug}
        logo={store.logo}
        description={store.description}
      />
    </ThemeProvider>
  );
}
