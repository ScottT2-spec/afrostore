import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";

type Props = {
  params: Promise<{ slug: string }>;
};

/* Contact page blocks - matching Handmade Bags template style */
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
    id: "contact-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "REACH OUT",
      title: "We're Here to Help",
      description: "Our dedicated customer service team is available to assist you with any questions or concerns. We typically respond within 24 hours.",
      align: "center",
      maxWidth: "60%",
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
    },
  });

  if (!store) return null;

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

  const customization = store.customizations?.themeSettings as any || {};
  const themeData = {
    primaryColor: customization.primaryColor || "#c27843",
    secondaryColor: customization.secondaryColor || "#242424",
    accentColor: customization.accentColor || "#767676",
    backgroundColor: customization.backgroundColor || "#ffffff",
    textColor: customization.textColor || "#242424",
  };

  return (
    <ThemeProvider initialTheme={themeData}>
      <HandmadeBagsHeader
        storeName={store.name}
        storeSlug={store.slug}
        logo={store.logo}
        isLanding={false}
      />
      <RenderTemplateBlocks blocks={CONTACT_PAGE_BLOCKS} />
      <HandmadeBagsFooter
        storeName={store.name}
        storeSlug={store.slug}
        logo={store.logo}
        description={store.description}
      />
    </ThemeProvider>
  );
}
