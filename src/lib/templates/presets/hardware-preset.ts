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
            "subtitleTop": "Built to Last",
            "title": "HEAVY-DUTY POWER TOOLS",
            "description": "Professional-grade tools trusted by contractors and DIYers alike — reliable performance, backed by our full warranty.",
            "buttonText": "Shop now",
            "buttonLink": "/shop",
            "price": "$149.00",
            "backgroundImage": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "hw-hero-slide-2",
          type: "slide",
          settings:           {
            "subtitleTop": "New Arrivals",
            "title": "COMPLETE PLUMBING SUPPLIES",
            "description": "Everything you need for repairs and installs — fittings, pipes, and fixtures in stock and ready to go.",
            "buttonText": "Shop now",
            "buttonLink": "/shop",
            "secondaryButtonText": "View more",
            "secondaryButtonLink": "#",
            "backgroundImage": "https://images.unsplash.com/photo-1607472829122-7efe654e1fbf?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "hw-hero-slide-3",
          type: "slide",
          settings:           {
            "subtitleTop": "Top Rated",
            "title": "ESSENTIAL HAND TOOL SETS",
            "description": "From wrenches to screwdrivers, get the full toolkit every home and workshop needs.",
            "buttonText": "Shop now",
            "buttonLink": "/shop",
            "price": "$79.00",
            "backgroundImage": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80&auto=format&fit=crop"
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
        { name: "Power Tools", productCount: 24, image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Hand Tools", productCount: 31, image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Plumbing", productCount: 18, image: "https://images.unsplash.com/photo-1607472829122-7efe654e1fbf?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Electrical", productCount: 22, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Paint & Supplies", productCount: 15, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Fasteners", productCount: 40, image: "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=800&q=80&auto=format&fit=crop", link: "/shop" },
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
      sectionDescription: "Trusted by contractors and homeowners alike for quality hardware at fair prices, with expert support when you need it.",
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
      description: "Our team of specialists is on hand to help you pick the right tool for the job, from small repairs to full builds.",
      specs: [
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "10+ inch GPU",
          description: "Mauris blandit aliquet",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
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
      description: "Trusted by contractors and homeowners alike for quality hardware at fair prices, with expert support when you need it.",
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
      description: "Every product we carry is tested for durability and backed by our satisfaction guarantee, so you can build with confidence.",
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
      description: "Trusted by contractors and homeowners alike for quality hardware at fair prices, with expert support when you need it.",
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
      description: "Trusted by contractors and homeowners alike for quality hardware at fair prices, with expert support when you need it.",
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
      description: "Same-day dispatch on in-stock orders, with real-time tracking so you always know when your tools will arrive.",
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
      description: "Trusted by contractors and homeowners alike for quality hardware at fair prices, with expert support when you need it.",
      columns: 4,
      posts: [
        {
          image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
          title: "How to build a workbench that actually lasts",
          excerpt: "A solid workbench is the foundation of any workshop. Here's what to look for and how to build one that holds up...",
          date: { day: "23", month: "Jul" },
          categories: ["How-To", "Workshop"],
          author: "S. Rogers",
          link: "#",
          comments: 2,
        },
        {
          image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop",
          title: "Essential safety gear for every DIY project",
          excerpt: "Gloves, goggles, and more — the safety gear that should be in every toolbox before you pick up a power tool...",
          date: { day: "23", month: "Jul" },
          categories: ["Safety", "Buying Guides"],
          author: "S. Rogers",
          link: "#",
          comments: 6,
        },
        {
          image: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&q=80&auto=format&fit=crop",
          title: "Sealants and adhesives: what actually holds",
          excerpt: "Not all adhesives are created equal. We break down which sealant or adhesive is right for each job...",
          date: { day: "23", month: "Jul" },
          categories: ["Buying Guides", "Adhesives"],
          author: "S. Rogers",
          link: "#",
          comments: 0,
        },
        {
          image: "https://images.unsplash.com/photo-1643536768014-0756fa85ca4f?w=800&q=80&auto=format&fit=crop",
          title: "Maintaining your power tools for a longer life",
          excerpt: "Regular cleaning and storage habits can double the life of your power tools. Here's how to keep yours running...",
          date: { day: "23", month: "Jul" },
          categories: ["Tips", "Power Tools"],
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
      subtitle: "STAY UP TO DATE",
      title: "DO YOU LIKE THE THEME? SHARE WITH YOUR FRIENDS!",
      privacyText: "Will be used in accordance with our Privacy Policy",
    },
  },

];
