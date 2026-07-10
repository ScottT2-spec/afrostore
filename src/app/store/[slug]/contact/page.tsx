import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { applyPageCustomization, buildPageBackgroundStyle, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { serializeProductsForClient } from "@/lib/serialize-products";
import { VegetableContactPage } from "@/components/storefront/VegetableTemplatePages";
import { VegetableFooter, VegetableHeader } from "@/components/storefront/VegetableStoreChrome";

type Props = {
  params: Promise<{ slug: string }>;
};

/* Contact page blocks - matching Handmade Bags template style (fallback if no custom content) */
const CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "contact-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "CONTACT US",
          titleLine1: "Get in",
          titleLine2: "Touch",
          description: "We'd love to hear from you. Whether you have a question about our products, need assistance with an order, or just want to say hello.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "contact-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "24/7 Support", icon: "✦" },
        { text: "Fast Response", icon: "✦" },
        { text: "Expert Help", icon: "✦" },
        { text: "Satisfaction Guaranteed", icon: "✦" },
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
    id: "contact-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "REACH OUT",
      title: "We're Here to Help",
      description: "Our dedicated customer service team is available to assist you with any questions or concerns. We typically respond within 24 hours.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "60px",
    },
  },
  {
    id: "contact-info",
    type: "fashionFeatures",
    props: {
      columns: 3,
      marginBottom: "70px",
      features: [
        {
          number: "📍",
          title: "Visit Our Store",
          description: "451 Wall Street, UK, London. Come visit our flagship store and experience our craftsmanship firsthand.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "📞",
          title: "Call Us",
          description: "(064) 332-1233. Our customer service team is available Monday through Friday, 9am to 6pm.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "✉️",
          title: "Email Us",
          description: "support@handmadebags.com. Send us an email anytime and we'll get back to you within 24 hours.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "contact-form-section",
    type: "fashionSectionTitle",
    props: {
      subtitle: "SEND A MESSAGE",
      title: "We'd Love to Hear From You",
      description: "Fill out the form below and we'll get back to you as soon as possible.",
      align: "center",
      maxWidth: "50%",
      marginBottom: "50px",
    },
  },
  {
    id: "contact-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "QUICK RESPONSE",
      title: "Need Immediate Assistance?",
      description: "For urgent matters, please call our customer service hotline or reach out via WhatsApp for faster response.",
      buttonText: "Call Now",
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
      socialLinks: true,
      templates: {
        include: {
          template: true,
        },
        where: {
          isActive: true,
        },
        take: 1,
      },
      pages: {
        where: { slug: "contact" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  // Auto-create Contact page if it doesn't exist
  if (!store.pages || store.pages.length === 0) {
    try {
      await prisma.page.create({
        data: {
          siteId: store.id,
          title: "Contact Us",
          slug: "contact",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 12,
        },
      });
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "contact" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create Contact page:", error);
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

export default async function ContactPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, products, blogs } = data;

  // Serialize products to convert Decimal values to plain numbers for client components
  const serializedProducts = serializeProductsForClient(products);

  const customization = normalizeSiteCustomization(store.customizations as any);
  const visiblePages = filterVisiblePages(store.pages || [], customization);
  const customizedPages = visiblePages.map((page: any) => applyPageCustomization(page, customization));
  const contactPage = customizedPages.find((p: any) => p.slug === "contact");
  
  // Use custom blocks if available, otherwise use preset
  let pageContent;
  if (contactPage?.content) {
    const parsed = parsePageContent(contactPage.content);
    pageContent = parsed;
  } else {
    pageContent = { blocks: CONTACT_PAGE_BLOCKS, settings: {} };
  }

  const pageSettings = contactPage ? getResolvedPageSettings(contactPage, pageContent.settings, customization) : {};
  const themeData = {
    primaryColor: customization?.themeSettings?.colors?.primary || "#c27843",
    secondaryColor: customization?.themeSettings?.colors?.secondary || "#242424",
    accentColor: customization?.themeSettings?.colors?.accent || "#767676",
    backgroundColor: customization?.themeSettings?.colors?.background || "#ffffff",
    textColor: customization?.themeSettings?.colors?.text || "#242424",
  };

  const activeTemplateSlug = store.templates?.[0]?.template?.slug || null;

  if (activeTemplateSlug === "vegetables") {
    const vegetableNavItems = [
      { label: "Home", href: `/store/${slug}` },
      { label: "Menu", href: `/store/${slug}/menu` },
      { label: "Recipe", href: `/store/${slug}/recipe` },
      { label: "About", href: `/store/${slug}/about` },
      { label: "Contact", href: `/store/${slug}/contact` },
    ];
    const vegetableSocialLinks: Array<{ platform: string; url: string }> = [
      ...(store.socialLinks?.facebook ? [{ platform: "facebook", url: store.socialLinks.facebook }] : []),
      ...(store.socialLinks?.instagram ? [{ platform: "instagram", url: store.socialLinks.instagram }] : []),
      ...(store.socialLinks?.twitter ? [{ platform: "twitter", url: store.socialLinks.twitter }] : []),
      ...(store.socialLinks?.tiktok ? [{ platform: "tiktok", url: store.socialLinks.tiktok }] : []),
    ];

    return (
      <div className="min-h-screen bg-[#fff9ef] text-[#243226]">
        <VegetableHeader storeName={store.name} storeSlug={slug} logo={store.logo} navItems={vegetableNavItems} reservationHref={`/store/${slug}/reservation`} />
        <main>
          <VegetableContactPage
            storeName={store.name}
            storeSlug={slug}
            currency="USD"
            socialLinks={vegetableSocialLinks}
            storeAddress={store.description || `${store.name} restaurant`}
            storePhone={undefined}
          />
        </main>
        <VegetableFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} navItems={vegetableNavItems} socialLinks={vegetableSocialLinks} />
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={themeData}>
      <HandmadeBagsHeader
        storeName={store.name}
        storeSlug={store.slug}
        logo={store.logo}
        isLanding={false}
      />
      <div style={buildPageBackgroundStyle(pageSettings)}>
        {contactPage?.content ? (
          <RenderBlocks blocks={pageContent.blocks as BuilderBlock[]} storeSlug={slug} products={serializedProducts} />
        ) : (
          <RenderTemplateBlocks blocks={CONTACT_PAGE_BLOCKS} />
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
