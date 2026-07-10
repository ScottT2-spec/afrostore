import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { applyPageCustomization, buildPageBackgroundStyle, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { HANDMADE_BAGS_PRESET } from "@/lib/templates/presets/handmade-bags-preset";
import { serializeProductsForClient } from "@/lib/serialize-products";

type Props = {
  params: Promise<{ slug: string }>;
};

/* About page blocks - matching Handmade Bags template style (fallback if no custom content) */
const ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "about-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "ABOUT US",
          titleLine1: "Handcrafted",
          titleLine2: "Excellence",
          description: "Discover the artistry behind our premium leather goods and the passionate artisans who bring them to life.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "about-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Handcrafted with Love", icon: "✦" },
        { text: "Premium Leather", icon: "✦" },
        { text: "Sustainable Practices", icon: "✦" },
        { text: "Lifetime Quality", icon: "✦" },
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
    id: "about-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "WHO WE ARE",
      title: "A Legacy of Craftsmanship",
      description: "For over two decades, we have been dedicated to creating exceptional leather goods that combine traditional techniques with contemporary design. Each piece in our collection represents hours of meticulous work by skilled artisans who have mastered their craft through generations of knowledge passed down.",
      align: "center",
      maxWidth: "70%",
      marginBottom: "60px",
    },
  },
  {
    id: "about-image-section",
    type: "fashionCoverBanners",
    props: {
      columns: 2,
      height: "500px",
      marginBottom: "70px",
      banners: [
        {
          image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
          icon: "",
          title: "Our Workshop",
          description: "Where tradition meets innovation in every stitch and detail.",
          overlayOpacity: 0.3,
        },
        {
          image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=1000&fit=crop",
          icon: "",
          title: "Premium Materials",
          description: "Sourcing the finest full-grain leathers from ethical suppliers worldwide.",
          overlayOpacity: 0.3,
        },
      ],
    },
  },
  {
    id: "about-mission",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR MISSION",
      title: "Creating Timeless Pieces",
      description: "We believe that true luxury lies in quality, sustainability, and the human touch. Our mission is to create leather goods that not only serve a functional purpose but also tell a story of artistry and dedication.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "50px",
    },
  },
  {
    id: "about-values",
    type: "fashionFeatures",
    props: {
      columns: 3,
      marginBottom: "70px",
      features: [
        {
          number: "01",
          title: "Artisan Craftsmanship",
          description: "Every bag is handcrafted by master artisans with decades of experience, ensuring each piece meets our exacting standards.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "02",
          title: "Sustainable Practices",
          description: "We are committed to ethical sourcing, eco-friendly production methods, and creating products that last a lifetime.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "03",
          title: "Customer Excellence",
          description: "From design to delivery, every step is guided by our commitment to exceeding customer expectations.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "about-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Join Our Journey",
      description: "Subscribe to our newsletter for exclusive updates, new arrivals, and behind-the-scenes insights into our craft.",
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
        where: { slug: "about" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  // Auto-create About page if it doesn't exist
  if (!store.pages || store.pages.length === 0) {
    try {
      await prisma.page.create({
        data: {
          siteId: store.id,
          title: "About Us",
          slug: "about",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 10,
        },
      });
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "about" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create About page:", error);
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

export default async function AboutPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, products, blogs } = data;

  // Serialize products to convert Decimal values to plain numbers for client components
  const serializedProducts = serializeProductsForClient(products);

  const customization = normalizeSiteCustomization(store.customizations as any);
  const visiblePages = filterVisiblePages(store.pages || [], customization);
  const customizedPages = visiblePages.map((page: any) => applyPageCustomization(page, customization));
  const aboutPage = customizedPages.find((p: any) => p.slug === "about");
  
  // Use custom blocks if available, otherwise use preset
  let pageContent;
  if (aboutPage?.content) {
    const parsed = parsePageContent(aboutPage.content);
    pageContent = parsed;
  } else {
    pageContent = { blocks: ABOUT_PAGE_BLOCKS, settings: {} };
  }

  const pageSettings = aboutPage ? getResolvedPageSettings(aboutPage, pageContent.settings, customization) : {};
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
        {aboutPage?.content ? (
          <RenderBlocks blocks={pageContent.blocks as BuilderBlock[]} storeSlug={slug} products={serializedProducts} />
        ) : (
          <RenderTemplateBlocks blocks={ABOUT_PAGE_BLOCKS} />
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
