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
            "backgroundImage": "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop",
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
            "backgroundImage": "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop",
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
            "backgroundImage": "https://images.unsplash.com/photo-1595303526913-c7037797ebe7?w=800&q=80&auto=format&fit=crop",
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
          image: "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=800&q=80&auto=format&fit=crop",
          subtitle: "NEW TECHNOLOGIES",
          title: "WEBCAMS 2024",
          description: "Auctor litora ultrices suscipit\nmalesuada nunc a netus",
          buttonText: "Shop More",
          buttonLink: "/shop",
          colorScheme: "dark",
        },
        {
          image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
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
          image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
          subtitle: "Hich Tech News",
          title: "Monster Beats\nHeadphones",
          buttonText: "Read More",
          buttonLink: "/shop",
          colorScheme: "light",
        },
        {
          image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop",
          subtitle: "Play The Dream",
          title: "Apple iPhone 7\nColor Red",
          colorScheme: "light",
        },
        {
          image: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&q=80&auto=format&fit=crop",
          subtitle: "Minimalism Design",
          title: "Music Makes\nFeel Better",
          colorScheme: "light",
        },
        {
          image: "https://images.unsplash.com/photo-1643536768014-0756fa85ca4f?w=800&q=80&auto=format&fit=crop",
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
      backgroundImage: "https://images.unsplash.com/photo-1515940279136-2f419eea8051?w=800&q=80&auto=format&fit=crop",
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
      bannerImage: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80&auto=format&fit=crop",
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
      backgroundImage: "https://images.unsplash.com/photo-1547479117-da9abbff3fa0?w=800&q=80&auto=format&fit=crop",
      subtitle: "GAMING COLLECTION",
      title: "Sony Playstation 4 Dualshok Controller",
      primaryButtonText: "Buy Now",
      primaryButtonLink: "/shop",
      secondaryButtonText: "Read More",
      secondaryButtonLink: "/shop",
      productImage: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop",
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
          image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop",
          title: "Collar brings back coffee brewing ritual",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Design trends",
          author: "S. Rogers",
          link: "#",
        },
        {
          image: "https://images.unsplash.com/photo-1595303526913-c7037797ebe7?w=800&q=80&auto=format&fit=crop",
          title: "Exterior ideas: 10 colored garden seats",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Inspiration",
          author: "S. Rogers",
          link: "#",
        },
        {
          image: "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=800&q=80&auto=format&fit=crop",
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
      videoThumbnail: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
      logos: [
        { name: "Vitra", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EVitra%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Rosenthal", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ERosenthal%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "PackIt", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EPackIt%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Niche", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ENiche%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Magisso", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EMagisso%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Louis Poulsen", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ELouis%20Poulsen%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Joseph Joseph", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EJoseph%20Joseph%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Hay", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EHay%3C/text%3E%3C/svg%3E", linkUrl: "#" },
        { name: "Loom", logoUrl: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ELoom%3C/text%3E%3C/svg%3E", linkUrl: "#" },
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
      paymentIconsUrl: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
    },
  },
];
