import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";

type Props = {
  params: Promise<{ slug: string }>;
};

/* About page blocks - matching Handmade Bags template style */
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
    id: "about-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "WHO WE ARE",
      title: "A Legacy of Craftsmanship",
      description: "For over two decades, we have been dedicated to creating exceptional leather goods that combine traditional techniques with contemporary design. Each piece in our collection represents hours of meticulous work by skilled artisans who have mastered their craft through generations of knowledge passed down.",
      align: "center",
      maxWidth: "70%",
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
    id: "about-team",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR TEAM",
      title: "Meet the Artisans",
      description: "Behind every exquisite piece is a team of passionate individuals dedicated to their craft.",
      align: "center",
      maxWidth: "50%",
    },
  },
  {
    id: "about-team-images",
    type: "fashionCoverBanners",
    props: {
      columns: 4,
      height: "400px",
      marginBottom: "70px",
      banners: [
        {
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop",
          icon: "",
          title: "Master Craftsman",
          description: "25 years of leatherworking expertise",
          overlayOpacity: 0.4,
        },
        {
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop",
          icon: "",
          title: "Design Director",
          description: "Creating timeless designs since 2010",
          overlayOpacity: 0.4,
        },
        {
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop",
          icon: "",
          title: "Quality Control",
          description: "Ensuring perfection in every detail",
          overlayOpacity: 0.4,
        },
        {
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop",
          icon: "",
          title: "Customer Relations",
          description: "Your satisfaction is our priority",
          overlayOpacity: 0.4,
        },
      ],
    },
  },
  {
    id: "about-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "STAY CONNECTED",
      title: "Join Our Community",
      description: "Subscribe to receive exclusive updates, early access to new collections, and behind-the-scenes glimpses into our craft.",
      buttonText: "Subscribe Now",
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

export default async function AboutPage({ params }: Props) {
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
      <RenderTemplateBlocks blocks={ABOUT_PAGE_BLOCKS} />
      <HandmadeBagsFooter
        storeName={store.name}
        storeSlug={store.slug}
        logo={store.logo}
        description={store.description}
      />
    </ThemeProvider>
  );
}
