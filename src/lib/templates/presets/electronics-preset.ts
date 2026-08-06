import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Electronics Template Preset
 * Default block layout + content that recreates the Prokip LTD Electronics demo.
 * Every value is a placeholder — merchants swap in their own content.
 */
export const ELECTRONICS_TEMPLATE_PRESET: EditorNode[] = [
  /* ── 1. Hero Slider ───────────────────────────────────── */
  {
    id: "electronics-hero",
    type: "electronicsHeroSlider",
          settings: {
        autoplaySpeed: 5000,
      minHeight: "500px"
      },
      elements: [
        {
          id: "electronics-hero-slide-1",
          type: "slide",
          settings:           {
            "subtitle": "TOP SMARTPHONES",
            "titleLine1": "PERFORMANCE",
            "titleLine2": "WONDERFUL",
            "description": "A ornare aliquam laoreet adipiscing vestibul integer malesuada ullamcorper suspeid.",
            "buttonText": "Buy Now",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "backgroundColor": "#f2f2f2",
            "backgroundFit": "cover",
            "textPosition": "left",
            "colorScheme": "dark"
          },
          elements: [],
        },
        {
          id: "electronics-hero-slide-2",
          type: "slide",
          settings:           {
            "subtitle": "SMART WATCHES",
            "titleLine1": "HEALTH CARE",
            "titleLine2": "MONITOR",
            "description": "A ornare aliquam laoreet adipiscing vestibul integer malesuada ullamcorper suspeid.",
            "buttonText": "Buy Now",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "backgroundColor": "#f2f2f2",
            "backgroundFit": "contain",
            "textPosition": "left",
            "colorScheme": "dark"
          },
          elements: [],
        },
        {
          id: "electronics-hero-slide-3",
          type: "slide",
          settings:           {
            "subtitle": "APPLE INNOVATION",
            "titleLine1": "HIGHER LEVEL",
            "titleLine2": "SMARTPHONE",
            "description": "A ornare aliquam laoreet adipiscing vestibul integer malesuada ullamcorper suspeid.",
            "buttonText": "Buy Now",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "backgroundColor": "#000000",
            "backgroundFit": "contain",
            "textPosition": "left",
            "colorScheme": "light"
          },
          elements: [],
        }
      ],
  },

  /* ── 2. Promo Banners ─────────────────────────────────── */
  {
    id: "electronics-promos",
    type: "electronicsPromoBanners",
    settings: {
      banners: [
        {
          image: "/prokip-logo.png",
          subtitle: "NEW TECHNOLOGIES",
          title: "WEBCAMS 2024",
          description: "Auctor litora ultrices suscipit\nmalesuada nunc a netus",
          buttonText: "Shop More",
          buttonLink: "/shop",
          colorScheme: "dark",
        },
        {
          image: "/prokip-logo.png",
          subtitle: "APPLE ACCESSORIES",
          title: "LEATHER CASES",
          description: "Condimentum curabitur vestibulum\ndapibus porttitor adipiscing",
          buttonText: "SHOP MORE",
          buttonLink: "/shop",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 3. Product Tabs ──────────────────────────────────── */
  {
    id: "electronics-products-1",
    type: "electronicsProductTabs",
    settings: {
      sectionTitle: "ELECTRONICS",
      tabs: [
        { label: "New", filter: "new" },
        { label: "Featured", filter: "featured" },
        { label: "Top Sellers", filter: "top-sellers" },
      ],
      columns: 4,
      maxProducts: 8,
    },
  },

  /* ── 4. Banner Grid ───────────────────────────────────── */
  {
    id: "electronics-banner-grid",
    type: "electronicsBannerGrid",
    settings: {
      banners: [
        {
          image: "/prokip-logo.png",
          subtitle: "Hich Tech News",
          title: "Monster Beats\nHeadphones",
          buttonText: "Read More",
          buttonLink: "/shop",
          colorScheme: "light",
        },
        {
          image: "/prokip-logo.png",
          subtitle: "Play The Dream",
          title: "Apple iPhone 7\nColor Red",
          colorScheme: "light",
        },
        {
          image: "/prokip-logo.png",
          subtitle: "Minimalism Design",
          title: "Music Makes\nFeel Better",
          colorScheme: "light",
        },
        {
          image: "/prokip-logo.png",
          subtitle: "Health & Fit",
          title: "Apple iWatch Nike Edition",
          buttonText: "Watch Demo",
          buttonLink: "/shop",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 5. Hot Deals ─────────────────────────────────────── */
  {
    id: "electronics-hot-deals",
    type: "electronicsHotDeals",
    settings: {
      sectionTitle: "TODAY HOT DEALS",
      buttonText: "View All Deals",
      buttonLink: "/shop",
      backgroundImage: "/prokip-logo.png",
      maxProducts: 6,
      columns: 3,
      filter: "sale",
    },
  },

  /* ── 6. Side Banner + Featured Products ───────────────── */
  {
    id: "electronics-side-banner",
    type: "electronicsSideBanner",
    settings: {
      bannerImage: "/prokip-logo.png",
      bannerSubtitle: "Hich Tech News",
      bannerTitle: "Google Smart Home 2024",
      bannerButtonText: "Read More",
      bannerButtonLink: "/shop",
      featuredTitle: "FEATURED PRODUCTS",
      maxFeaturedProducts: 4,
      rightSectionTitle: "ELECTRONICS",
      rightTabs: [
        { label: "New", filter: "new" },
        { label: "Featured", filter: "featured" },
        { label: "Top Sellers", filter: "top-sellers" },
      ],
      rightMaxProducts: 6,
    },
  },

  /* ── 7. Gaming CTA ────────────────────────────────────── */
  {
    id: "electronics-gaming-cta",
    type: "electronicsGamingCTA",
    settings: {
      backgroundImage: "/prokip-logo.png",
      subtitle: "GAMING COLLECTION",
      title: "Sony Playstation 4 Dualshok Controller",
      primaryButtonText: "Buy Now",
      primaryButtonLink: "/shop",
      secondaryButtonText: "Read More",
      secondaryButtonLink: "/shop",
      productImage: "/prokip-logo.png",
    },
  },

  /* ── 8. Blog Posts ────────────────────────────────────── */
  {
    id: "electronics-blog",
    type: "electronicsBlogPosts",
    settings: {
      sectionTitle: "INNOVATIVE GADGETS",
      columns: 3,
      posts: [
        {
          image: "/prokip-logo.png",
          title: "Collar brings back coffee brewing ritual",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Design trends",
          author: "S. Rogers",
          link: "#",
        },
        {
          image: "/prokip-logo.png",
          title: "Exterior ideas: 10 colored garden seats",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Inspiration",
          author: "S. Rogers",
          link: "#",
        },
        {
          image: "/prokip-logo.png",
          title: "Exploring Atlanta\u2019s modern homes",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Design trends",
          author: "S. Rogers",
          link: "#",
        },
      ],
    },
  },

  /* ── 9. Partners ──────────────────────────────────────── */
  {
    id: "electronics-partners",
    type: "electronicsPartners",
    settings: {
      sectionTitle: "OUR PARTNERS",
      videoUrl: "https://www.youtube.com/watch?v=XHOmBV4js_E",
      videoThumbnail: "/prokip-logo.png",
      logos: [
        { name: "Vitra", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "Rosenthal", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "PackIt", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "Niche", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "Magisso", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "Louis Poulsen", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "Joseph Joseph", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "Hay", logoUrl: "/prokip-logo.png", linkUrl: "#" },
        { name: "PackIt", logoUrl: "/prokip-logo.png", linkUrl: "#" },
      ],
    },
  },
  {
    id: "electronics-footer",
    type: "electronicsFooter",
    settings: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        fax: "(099) 453-1357",
      },
      recentPosts: [],
      linkColumns: [
        { title: "OUR STORES", links: [{ label: "New York", url: "#" }, { label: "London SF", url: "#" }, { label: "Edinburgh", url: "#" }, { label: "Los Angeles", url: "#" }, { label: "Chicago", url: "#" }, { label: "Las Vegas", url: "#" }] },
        { title: "USEFUL LINKS", links: [{ label: "Privacy Policy", url: "#" }, { label: "Returns", url: "#" }, { label: "Terms & Conditions", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
        { title: "FOOTER MENU", links: [{ label: "Instagram profile", url: "#" }, { label: "New Collection", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
      ],
      copyrightText: "",
      paymentIconsUrl: "/prokip-logo.png",
    },
  },
];
