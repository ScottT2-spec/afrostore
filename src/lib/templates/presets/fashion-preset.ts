import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Fashion Template Preset
 * Default block layout + content that recreates the WoodMart Fashion demo.
 * Every value is a placeholder — users swap in their own content.
 */
export const FASHION_TEMPLATE_PRESET: TemplateBlock[] = [
  /* ── 1. Hero Slider ───────────────────────────────────── */
  {
    id: "fashion-hero",
    type: "fashionHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "560px",
      slides: [
        {
          subtitle: "YOUR FAVOURITE STORE",
          titleLine1: "Blondes with minimalistic",
          titleLine2: "tendencies to vintage",
          description: "Discover our latest collection of handpicked fashion essentials designed for the modern wardrobe.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
          backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop",
          textPosition: "center",
          colorScheme: "dark",
        },
        {
          subtitle: "NEW ARRIVALS",
          titleLine1: "Fashionable fit trend style",
          titleLine2: "best sport man wear",
          description: "Explore trending styles curated for every occasion. Quality meets affordability.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
          backgroundImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop",
          textPosition: "center",
          colorScheme: "dark",
        },
        {
          subtitle: "SEASON COLLECTION",
          titleLine1: "Elegant and timeless",
          titleLine2: "pieces for every mood",
          description: "From casual wear to evening elegance — find your perfect look in our new collection.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
          backgroundImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop",
          textPosition: "center",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 2. Promo Banners ─────────────────────────────────── */
  {
    id: "fashion-promos",
    type: "fashionPromoBanners",
    props: {
      banners: [
        {
          image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=267&fit=crop",
          subtitle: "SUMMER NEW",
          title: "AMAZING\nFASHION",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          textAlign: "right",
        },
        {
          image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=267&fit=crop",
          subtitle: "BEST NEW",
          title: "STYLISH\nFASHION",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          textAlign: "center",
        },
        {
          image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=267&fit=crop",
          subtitle: "NEW 2024",
          title: "FASHION\nSTYLE",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          textAlign: "left",
        },
      ],
    },
  },

  /* ── 3. Featured Products ─────────────────────────────── */
  {
    id: "fashion-featured",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      showCategory: true,
      showHoverImage: true,
      marginBottom: "60px",
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "FEATURED PRODUCTS",
        description: "Handpicked items from our latest collections, curated just for you.",
      },
      products: [
        { id: "1", name: "White Bow Back Shirt", category: "Fashion", price: "$199.00", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=290&h=330&fit=crop", link: "/shop" },
        { id: "2", name: "Mint Floral Blouse", category: "Fashion", price: "$249.00", salePrice: "$199.00", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=290&h=330&fit=crop", link: "/shop", badge: "SALE" },
        { id: "3", name: "Fuller Bust Shirt", category: "Fashion", price: "$149.00", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=290&h=330&fit=crop", link: "/shop" },
        { id: "4", name: "Check Shirt with Ruffle", category: "Fashion", price: "$85.00", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=290&h=330&fit=crop", link: "/shop" },
        { id: "5", name: "Lace Insert Shirt", category: "Fashion", price: "$99.00", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=290&h=330&fit=crop", link: "/shop" },
        { id: "6", name: "Bardot Puff Sleeve", category: "Fashion", price: "$120.00", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=290&h=330&fit=crop", link: "/shop" },
        { id: "7", name: "Fluted Crop Top", category: "Fashion", price: "$66.00", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=290&h=330&fit=crop", link: "/shop" },
        { id: "8", name: "Stripe Bow Back Top", category: "Fashion", price: "$75.00", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=290&h=330&fit=crop", link: "/shop" },
      ],
    },
  },

  /* ── 4. Categories ────────────────────────────────────── */
  {
    id: "fashion-categories",
    type: "fashionCategoryCards",
    props: {
      columns: 4,
      marginBottom: "50px",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "OUR CATEGORIES",
        description: "Browse through our carefully organized collections to find exactly what you need.",
      },
      categories: [
        { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop", productCount: 24, link: "/shop" },
        { name: "Tops", image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3b2f?w=300&h=400&fit=crop", productCount: 18, link: "/shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&h=400&fit=crop", productCount: 12, link: "/shop" },
        { name: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop", productCount: 15, link: "/shop" },
      ],
    },
  },

  /* ── 5. Bestsellers (filters by "bestseller" tag, falls back to placeholder) */
  {
    id: "fashion-bestsellers",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      showCategory: true,
      showHoverImage: true,
      marginBottom: "50px",
      maxProducts: 8,
      filter: "bestseller",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "OUR BESTSELLERS",
        description: "The most loved items by our customers — tried, tested, and trending.",
      },
      products: [
        { id: "b1", name: "Contrast Collar Blouse", category: "Fashion", price: "$85.00", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=290&h=330&fit=crop", link: "/shop" },
        { id: "b2", name: "Wrap Front Top", category: "Fashion", price: "$45.00", image: "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=290&h=330&fit=crop", link: "/shop" },
        { id: "b3", name: "Floral Midi Dress", category: "Fashion", price: "$159.00", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=290&h=330&fit=crop", link: "/shop" },
        { id: "b4", name: "Classic Denim Jacket", category: "Fashion", price: "$220.00", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=290&h=330&fit=crop", link: "/shop" },
      ],
    },
  },

  /* ── 6. Testimonials ──────────────────────────────────── */
  {
    id: "fashion-testimonials",
    type: "fashionTestimonials",
    props: {
      title: "CUSTOMERS REVIEWS",
      backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=600&fit=crop",
      testimonials: [
        {
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=70&h=70&fit=crop&crop=face",
          text: "Absolutely love the quality and style of everything I've ordered. The fabrics feel premium and the fit is always perfect. This has become my go-to store for fashion essentials!",
          name: "Sarah Johnson",
          role: "Verified Buyer",
          rating: 5,
        },
        {
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=70&h=70&fit=crop&crop=face",
          text: "Fast shipping, beautiful packaging, and the clothes look exactly like the photos. Customer service was incredibly helpful when I needed to exchange a size. Highly recommend!",
          name: "Marcus Chen",
          role: "Loyal Customer",
          rating: 5,
        },
        {
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=70&h=70&fit=crop&crop=face",
          text: "I've been shopping here for months and the consistency in quality is impressive. Every piece feels like it was made with care. The new collection is absolutely stunning!",
          name: "Amara Williams",
          role: "Fashion Blogger",
          rating: 5,
        },
      ],
    },
  },

  /* ── 7. Latest News / Blog ────────────────────────────── */
  {
    id: "fashion-blog",
    type: "fashionBlogPosts",
    props: {
      columns: 2,
      marginBottom: "30px",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "OUR LATEST NEWS",
        description: "Stay updated with the latest fashion trends, style tips, and store announcements.",
      },
      posts: [
        {
          image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop",
          title: "Summer Fashion Trends You Need to Know",
          excerpt: "Discover the hottest trends this season — from bold colors to relaxed silhouettes that define modern style...",
          date: { day: "15", month: "Jun" },
          categories: ["Fashion Trends", "Style"],
          author: { name: "Style Editor" },
          link: "/blog",
          commentCount: 3,
        },
        {
          image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
          title: "How to Build a Capsule Wardrobe",
          excerpt: "Learn how to create a versatile wardrobe with just 30 essential pieces that mix and match for any occasion...",
          date: { day: "08", month: "Jun" },
          categories: ["Style Guide", "Tips"],
          author: { name: "Fashion Team" },
          link: "/blog",
          commentCount: 7,
        },
      ],
    },
  },

  /* ── 8. Newsletter ────────────────────────────────────── */
  {
    id: "fashion-newsletter",
    type: "fashionNewsletter",
    props: {
      subtitle: "STAY CONNECTED",
      title: "REGISTER FOR OUR NEWSLETTER",
      description: "Sign up for all the news about our last arrivals and get exclusive early access to sales.",
      buttonText: "Sign up",
      socialLinks: [
        { platform: "facebook", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "instagram", url: "#" },
        { platform: "youtube", url: "#" },
      ],
    },
  },
];
