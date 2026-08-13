import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Hardware Template Homepage Preset
 * Dark-themed gaming/PC hardware homepage matching Prokip LTD Hardware demo.
 * Source: https://prokip.xtemos.com/demo-hardware/?opt=hardware
 * Every section from the demo is represented here.
 */
export const HARDWARE_TEMPLATE_PRESET: EditorNode[] = [
  /* ── 1. Hero Slider ───────────────────────────────────── */
  {
    id: "hw-hero",
    type: "hardwareHomeHeroSlider",
          settings: {
        autoplaySpeed: 5000
      },
      elements: [
        {
          id: "hw-hero-slide-1",
          type: "slide",
          settings:           {
            "subtitleTop": "Asus Rog",
            "title": "MAXIMUS IX",
            "description": "Many desktop publishing packages and web page editors now use lorem ipsum as their default model text, and a search for lorem ipsum.",
            "buttonText": "Shop now",
            "buttonLink": "/shop",
            "price": "$499.00",
            "backgroundImage": "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "hw-hero-slide-2",
          type: "slide",
          settings:           {
            "subtitleTop": "Tensor Cores",
            "title": "NVIDIA TITAN V",
            "description": "Many desktop publishing packages and web page editors now use lorem ipsum as their default model text, and a search for lorem ipsum.",
            "buttonText": "Shop now",
            "buttonLink": "/shop",
            "secondaryButtonText": "View more",
            "secondaryButtonLink": "#",
            "backgroundImage": "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "hw-hero-slide-3",
          type: "slide",
          settings:           {
            "subtitleTop": "ATX Mid-Tower",
            "title": "NZXT H440 CASE",
            "description": "Many desktop publishing packages and web page editors now use lorem ipsum as their default model text, and a search for lorem ipsum.",
            "buttonText": "Shop now",
            "buttonLink": "/shop",
            "price": "$299.00",
            "backgroundImage": "https://images.unsplash.com/photo-1595303526913-c7037797ebe7?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        }
      ],
  },

  /* ── 2. Category Grid ─────────────────────────────────── */
  {
    id: "hw-categories",
    type: "hardwareHomeCategoryGrid",
    settings: {
      categories: [
        { name: "Clocks", productCount: 12, image: "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Lighting", productCount: 17, image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Furniture", productCount: 33, image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Accessories", productCount: 12, image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Cooking", productCount: 12, image: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Toys", productCount: 12, image: "https://images.unsplash.com/photo-1643536768014-0756fa85ca4f?w=800&q=80&auto=format&fit=crop", link: "/shop" },
      ],
    },
  },

  /* ── 3. Featured Products ─────────────────────────────── */
  {
    id: "hw-featured",
    type: "hardwareHomeFeaturedProducts",
    settings: {
      sectionSubtitle: "The Takeover Is Complete",
      sectionTitle: "FEATURED PRODUCTS",
      sectionDescription: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected.",
      columns: 4,
      maxProducts: 8,
    },
  },

  /* ── 4. Build Your NEW PC ─────────────────────────────── */
  {
    id: "hw-build-pc",
    type: "hardwareHomeBuildPC",
    settings: {
      progressPercent: 0,
      subtitle: "Build Your",
      title: "NEW PC",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised.",
      specs: [
        {
          icon: "https://images.unsplash.com/photo-1515940279136-2f419eea8051?w=800&q=80&auto=format&fit=crop",
          title: "10+ inch GPU",
          description: "Mauris blandit aliquet",
        },
        {
          icon: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80&auto=format&fit=crop",
          title: "8 RAM SLOTS",
          description: "Cras ultricies ligula sed",
        },
      ],
      primaryButtonText: "NEXT STEP",
      primaryButtonLink: "#",
      secondaryButtonText: "Choose PC-Case",
      secondaryButtonLink: "#",
    },
  },

  /* ── 5. Ready PC Builds (Pricing) ─────────────────────── */
  {
    id: "hw-pricing",
    type: "hardwareHomePricingTable",
    settings: {
      subtitle: "Play Like The Pros",
      title: "READY PC BUILDS",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected.",
      tiers: [
        {
          name: "LITE BUILD",
          price: "$ 1000",
          priceLabel: "per month",
          specs: ["i3 or Ryzen 3", "8GB RAM", "1050Ti", "120GB SSD"],
          buttonText: "BUY NOW",
          buttonLink: "/shop",
        },
        {
          name: "CORE BUILD",
          price: "$ 1800",
          priceLabel: "per month",
          specs: ["i5 or Ryzen 5", "16GB RAM", "1060", "240GB SSD"],
          buttonText: "BUY NOW",
          buttonLink: "/shop",
        },
        {
          name: "PREMIUM BUILD",
          price: "$ 2500",
          priceLabel: "per month",
          specs: ["i7 or Ryzen 7", "32GB RAM", "1070Ti", "480GB SSD"],
          buttonText: "BUY NOW",
          buttonLink: "/shop",
          highlighted: true,
        },
        {
          name: "PRO BUILD",
          price: "$ 4000",
          priceLabel: "per month",
          specs: ["i9 or Ryzen TR", "64GB RAM", "1080Ti", "1TB SSD"],
          buttonText: "BUY NOW",
          buttonLink: "/shop",
        },
      ],
    },
  },

  /* ── 6. Gear Up CTA ───────────────────────────────────── */
  {
    id: "hw-gear-up",
    type: "hardwareHomeGearUpCTA",
    settings: {
      subtitle: "Gear Up",
      title: "THROW DOWN",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage.",
      primaryButtonText: "VIEW MORE",
      primaryButtonLink: "#",
      secondaryButtonText: "GO TO SHOP",
      secondaryButtonLink: "/shop",
      image: "https://images.unsplash.com/photo-1547479117-da9abbff3fa0?w=800&q=80&auto=format&fit=crop",
      videoUrl: "http://www.youtube.com/watch?v=XHOmBV4js_E",
    },
  },

  /* ── 7. Custom Desktops ───────────────────────────────── */
  {
    id: "hw-custom-desktops",
    type: "hardwareHomeCustomDesktops",
    settings: {
      subtitle: "Light On The Wallet",
      title: "CUSTOM DESKTOPS",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected.",
      desktops: [
        {
          name: "SkyTech Omega",
          image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop",
          specs: ["GeForce GTX 1060", "Intel Core i5 7500", "16GB DDR4", "240GB SSD + 1TB HDD", "Windows 10"],
          link: "#",
        },
        {
          name: "Ava Lumos",
          image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop",
          specs: ["GeForce GTX 1070Ti", "Intel Core i5 7700k", "32GB DDR4", "480GB SSD + 2TB HDD", "Windows 10"],
          link: "#",
        },
        {
          name: "Iron Conqueror",
          image: "https://images.unsplash.com/photo-1595303526913-c7037797ebe7?w=800&q=80&auto=format&fit=crop",
          specs: ["GeForce GTX 1080Ti", "Intel Core i7 8700k", "64GB DDR4", "480GB SSD + 2TB HDD", "Windows 10"],
          link: "#",
        },
        {
          name: "Maingear Rush",
          image: "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=800&q=80&auto=format&fit=crop",
          specs: ["Radeon RX Vega", "AMD Ryzen 7 1800x", "32GB DDR4", "480GB SSD + 2TB HDD", "Windows 10"],
          link: "#",
        },
      ],
    },
  },

  /* ── 8. Gaming Setup Gallery ──────────────────────────── */
  {
    id: "hw-gallery",
    type: "hardwareHomeGamingGallery",
    settings: {
      subtitle: "Heavy On Power",
      title: "GAMING SETUP",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected.",
      images: [
        "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595303526913-c7037797ebe7?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&q=80&auto=format&fit=crop",
      ],
    },
  },

  /* ── 9. Testimonial ───────────────────────────────────── */
  {
    id: "hw-testimonial",
    type: "hardwareHomeTestimonial",
    settings: {
      subtitle: "POWER AND BEAUTY",
      title: "IN ONE CASE",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even.",
      quote: "It is a long established fact that a reader will be distracted by the readable content of a page when looking.",
      author: "Kate Abrams",
      signatureImage: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
      avatarImages: [
        "https://images.unsplash.com/photo-1643536768014-0756fa85ca4f?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515940279136-2f419eea8051?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80&auto=format&fit=crop",
      ],
    },
  },

  /* ── 10. Latest Events (Blog) ─────────────────────────── */
  {
    id: "hw-blog",
    type: "hardwareHomeLatestEvents",
    settings: {
      subtitle: "Find Out Our",
      title: "LATEST EVENTS",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected.",
      columns: 4,
      posts: [
        {
          image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
          title: "Reinterprets the classic bookshelf",
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
          date: { day: "23", month: "Jul" },
          categories: ["Design trends", "Inspiration"],
          author: "S. Rogers",
          link: "#",
          comments: 2,
        },
        {
          image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop",
          title: "Minimalist design furniture 2026",
          excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that ...",
          date: { day: "23", month: "Jul" },
          categories: ["Design trends", "Furniture"],
          author: "S. Rogers",
          link: "#",
          comments: 6,
        },
        {
          image: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&q=80&auto=format&fit=crop",
          title: "Green interior design inspiration",
          excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its ...",
          date: { day: "23", month: "Jul" },
          categories: ["Design trends", "Hand made"],
          author: "S. Rogers",
          link: "#",
          comments: 0,
        },
        {
          image: "https://images.unsplash.com/photo-1643536768014-0756fa85ca4f?w=800&q=80&auto=format&fit=crop",
          title: "Collar brings back coffee brewing ritual",
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
          date: { day: "23", month: "Jul" },
          categories: ["Design trends", "Inspiration"],
          author: "S. Rogers",
          link: "#",
          comments: 0,
        },
      ],
    },
  },

  /* ── 11. Newsletter ───────────────────────────────────── */
  {
    id: "hw-newsletter",
    type: "hardwareHomeNewsletter",
    settings: {
      subtitle: "CURABITUR ALIQUET QUAM POSUERE",
      title: "DO YOU LIKE THE THEME? SHARE WITH YOUR FRIENDS!",
      privacyText: "Will be used in accordance with our Privacy Policy",
    },
  },

];
