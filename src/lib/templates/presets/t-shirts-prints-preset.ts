import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * T-Shirts & Prints template preset — WoodMart "T-Shirts Prints" demo.
 * Black primary (#1c1c1c), print-shop / custom printing studio aesthetic.
 * Hero, feature highlights, CTA banner, products, categories, footer.
 */
export const T_SHIRTS_PRINTS_PRESET: TemplateBlock[] = [
  /* ── 1. Hero Slider ───────────────────────────────────────── */
  {
    id: "tp-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "CUSTOM PRINTING",
          titleLine1: "Bring Your Ideas",
          titleLine2: "to Life on Fabric",
          description:
            "Professional t-shirt printing with premium inks. Fast turnaround, high quality, and affordable prices.",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "left",
          backgroundImage:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=800&fit=crop",
        },
        {
          subtitle: "NEW COLLECTION",
          titleLine1: "Express Yourself",
          titleLine2: "With Unique Prints",
          description:
            "From custom designs to ready-to-wear prints. T-shirts, hoodies, caps and more.",
          buttonText: "Explore",
          buttonLink: "/shop",
          colorScheme: "light",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1920&h=800&fit=crop",
        },
      ],
      minHeight: "560px",
      autoplaySpeed: 8000,
    },
  },

  /* ── 2. Trusted Bar (Marquee) ─────────────────────────────── */
  {
    id: "tp-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Fast Order Fulfillment — 24 Hours", icon: "⚡" },
        { text: "Only Premium Ink", icon: "🎨" },
        { text: "10,000+ Satisfied Customers", icon: "★" },
        { text: "Free Shipping on Orders Over $100", icon: "📦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "#1c1c1c",
      textColor: "#ffffff",
      fontSize: "16px",
      fontWeight: "600",
      paddingY: "15px",
      marginBottom: "0px",
    },
  },

  /* ── 3. Studio Features ───────────────────────────────────── */
  {
    id: "tp-features",
    type: "fashionFeatures",
    props: {
      sectionTitle: {
        subtitle: "",
        title: "Privileges of Our Studio",
        description:
          "Extensive experience in printing your photos, inscriptions or drawings on T-shirts and professional equipment makes it possible to print on T-shirts inexpensively, with high quality and in a short time.",
      },
      columns: 3,
      marginBottom: "60px",
      features: [
        {
          number: "01",
          title: "Fast Order Fulfillment",
          description: "We fulfill urgent orders in 24 hours. Your custom prints are ready when you need them.",
          buttonText: "LEARN MORE",
          buttonLink: "#",
        },
        {
          number: "02",
          title: "Only Premium Ink",
          description: "Park of modern production equipment with premium inks that last through hundreds of washes.",
          buttonText: "LEARN MORE",
          buttonLink: "#",
        },
        {
          number: "03",
          title: "Many Satisfied Customers",
          description: "More than 10,000 satisfied customers trust us with their custom printing needs.",
          buttonText: "LEARN MORE",
          buttonLink: "#",
        },
      ],
    },
  },

  /* ── 4. CTA Banner ────────────────────────────────────────── */
  {
    id: "tp-cta",
    type: "fashionCoverBanners",
    props: {
      columns: 1,
      height: "400px",
      marginBottom: "60px",
      banners: [
        {
          image:
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1920&h=600&fit=crop",
          title: "Bring Your Brand to Life Today!",
          description:
            "We offer digital printing services. Images can be applied to T-shirts, polo shirts, long sleeves, hoodies, cups, caps and more.",
          overlayOpacity: 0.5,
        },
      ],
    },
  },

  /* ── 5. Popular Products ──────────────────────────────────── */
  {
    id: "tp-products",
    type: "fashionProductGrid",
    props: {
      filter: "featured",
      columns: 4,
      products: [],
      maxProducts: 8,
      marginBottom: "60px",
      sectionTitle: {
        subtitle: "",
        title: "Popular Products",
        description: "",
      },
      showCategory: true,
      showHoverImage: true,
    },
  },

  /* ── 6. Categories ────────────────────────────────────────── */
  {
    id: "tp-categories",
    type: "fashionCategoryCards",
    props: {
      columns: 4,
      categories: [
        {
          name: "T-Shirts",
          image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
        {
          name: "Hoodies",
          image:
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
        {
          name: "Caps & Hats",
          image:
            "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
        {
          name: "Accessories",
          image:
            "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
      ],
      marginBottom: "60px",
      sectionTitle: {
        subtitle: "",
        title: "Shop by Category",
        description: "",
      },
    },
  },

  /* ── 7. More Products ─────────────────────────────────────── */
  {
    id: "tp-products-2",
    type: "fashionProductGrid",
    props: {
      filter: "all",
      columns: 4,
      products: [],
      maxProducts: 8,
      marginBottom: "60px",
      sectionTitle: {
        subtitle: "",
        title: "New Arrivals",
        description: "",
      },
      showCategory: true,
      showHoverImage: true,
    },
  },

  /* ── 8. Newsletter ────────────────────────────────────────── */
  {
    id: "tp-newsletter",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Stay in the Loop",
      description:
        "Subscribe to our newsletter for exclusive deals, new designs, and printing tips. Get 15% off your first custom order.",
      buttonText: "Subscribe",
      backgroundColor: "#1c1c1c",
      socialLinks: [
        { platform: "instagram", url: "#" },
        { platform: "facebook", url: "#" },
        { platform: "twitter", url: "#" },
      ],
    },
  },

  /* ── 9. Footer ────────────────────────────────────────────── */
  {
    id: "tp-footer",
    type: "fashionFooter",
    props: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description:
        "Professional custom printing studio. T-shirts, hoodies, caps and more with premium quality inks and fast turnaround.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        email: "info@store.com",
      },
      recentPosts: [],
      linkColumns: [
        {
          title: "PRODUCTS",
          links: [
            { label: "T-Shirts", url: "#" },
            { label: "Hoodies", url: "#" },
            { label: "Polo Shirts", url: "#" },
            { label: "Caps & Hats", url: "#" },
            { label: "Accessories", url: "#" },
          ],
        },
        {
          title: "SERVICES",
          links: [
            { label: "Custom Printing", url: "#" },
            { label: "Bulk Orders", url: "#" },
            { label: "Design Help", url: "#" },
            { label: "Brand Merch", url: "#" },
          ],
        },
        {
          title: "SUPPORT",
          links: [
            { label: "Contact Us", url: "#" },
            { label: "Shipping Info", url: "#" },
            { label: "Returns & Refunds", url: "#" },
            { label: "FAQ", url: "#" },
          ],
        },
      ],
      copyrightText: "© 2026. ALL RIGHTS RESERVED.",
      paymentIconsUrl: "",
    },
  },
];
