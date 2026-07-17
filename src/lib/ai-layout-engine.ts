/**
 * AI Layout Engine
 * 
 * Instead of hardcoding one block sequence for all stores, the AI decides
 * which blocks to use and in what order based on the business type and vibe.
 * 
 * Available block types (from builder/types.ts):
 * hero, features, testimonials, testimonial, productGrid, imageText, banner,
 * newsletter, stats, faq, contactForm, contactInfo, trustBadges, gallery,
 * team, brands, heading, text, spacer, divider, video, countdown, columns
 */

import type { BuilderBlock, BlockType } from "@/lib/builder/types";
import type { IndustryImageSet } from "@/lib/ai-image-pools";
import { getRandomIndustryImages, getIndustryPool } from "@/lib/ai-image-pools";

// ─── Types ──────────────────────────────────────────────────

export interface AIContent {
  brand: {
    tagline?: string;
    heroHeading?: string;
    heroSubheading?: string;
    ctaText?: string;
  };
  about?: {
    headline?: string;
    story?: string;
    values?: Array<{ title: string; desc: string }>;
  };
  features?: Array<{ title: string; desc: string }>;
  testimonials?: Array<{ name: string; text: string; role?: string }>;
  faq?: { items?: Array<{ question: string; answer: string }> };
  contact?: { headline?: string; subtitle?: string };
  policies?: { shipping?: string; returns?: string; privacy?: string };
  seo?: Record<string, string>;
  // NEW: AI-decided layout
  layout?: {
    sections: string[];
    vibe?: string;
    colorMood?: string;
  };
}

interface LayoutContext {
  storeName: string;
  storeSlug: string;
  industry: string;
  images: ReturnType<typeof getRandomIndustryImages>;
  content: AIContent;
}

// ─── Block Builders ─────────────────────────────────────────

function uid(): string { return crypto.randomUUID(); }
function block(type: BlockType, props: Record<string, unknown>): BuilderBlock {
  return { id: uid(), type, props };
}

const SECTION_BUILDERS: Record<string, (ctx: LayoutContext) => BuilderBlock[]> = {
  
  // Hero variants
  "hero-image": (ctx) => [
    block("hero", {
      heading: ctx.content.brand?.heroHeading || `Welcome to ${ctx.storeName}`,
      subheading: ctx.content.brand?.heroSubheading || "Discover what makes us different",
      buttonText: ctx.content.brand?.ctaText || "Shop Now",
      buttonHref: `/store/${ctx.storeSlug}/shop`,
      secondaryButtonText: "Learn More",
      secondaryButtonHref: `/store/${ctx.storeSlug}/about`,
      badge: ctx.content.brand?.tagline || "",
      bgStyle: "image",
      backgroundImage: ctx.images.hero,
      align: "center",
    }),
  ],

  "hero-minimal": (ctx) => [
    block("hero", {
      heading: ctx.content.brand?.heroHeading || `Welcome to ${ctx.storeName}`,
      subheading: ctx.content.brand?.heroSubheading || "",
      buttonText: ctx.content.brand?.ctaText || "Explore",
      buttonHref: `/store/${ctx.storeSlug}/shop`,
      bgStyle: "gradient",
      align: "left",
    }),
  ],

  "hero-split": (ctx) => [
    block("imageText", {
      badge: ctx.content.brand?.tagline || "",
      title: ctx.content.brand?.heroHeading || `Welcome to ${ctx.storeName}`,
      text: ctx.content.brand?.heroSubheading || "",
      image: ctx.images.hero,
      imageAlt: ctx.storeName,
      reverse: false,
      buttonText: ctx.content.brand?.ctaText || "Shop Now",
      buttonHref: `/store/${ctx.storeSlug}/shop`,
    }),
  ],

  // Product sections
  "products": (ctx) => [
    block("spacer", { height: 56 }),
    block("productGrid", {
      title: "Our Products",
      subtitle: "Handpicked just for you",
      columns: 3,
      limit: 6,
      showPrice: true,
      category: "",
    }),
  ],

  "products-featured": (ctx) => [
    block("spacer", { height: 56 }),
    block("productGrid", {
      title: "Featured Collection",
      subtitle: "Our most loved pieces",
      columns: 4,
      limit: 8,
      showPrice: true,
      category: "",
    }),
  ],

  "products-compact": (ctx) => [
    block("spacer", { height: 48 }),
    block("productGrid", {
      title: "Shop Now",
      subtitle: "",
      columns: 2,
      limit: 4,
      showPrice: true,
      category: "",
    }),
  ],

  // Features / Why us
  "features": (ctx) => {
    const featureIcons = ["truck", "shield", "headphones", "zap", "heart", "award", "globe", "rocket", "refresh", "star"];
    const features = ctx.content.features || [];
    return [
      block("spacer", { height: 56 }),
      block("features", {
        title: "Why Choose Us",
        subtitle: "Here's what makes us different",
        bgColor: "surface",
        items: features.length >= 3
          ? features.slice(0, 4).map((f, i) => ({
              icon: featureIcons[i % featureIcons.length],
              title: f.title,
              desc: f.desc,
            }))
          : [
              { icon: "truck", title: "Fast Delivery", desc: "Swift delivery across the country" },
              { icon: "shield", title: "Secure Payments", desc: "Pay with card, mobile money, or on delivery" },
              { icon: "headphones", title: "24/7 Support", desc: "Reach us anytime on WhatsApp" },
              { icon: "refresh", title: "Easy Returns", desc: "Hassle-free returns within 7 days" },
            ],
      }),
    ];
  },

  // Stats
  "stats": (ctx) => [
    block("spacer", { height: 48 }),
    block("stats", {
      bgColor: "brand",
      items: [
        { value: "1,000+", label: "Happy Customers", icon: "users" },
        { value: "500+", label: "Products", icon: "package" },
        { value: "4.9", label: "Customer Rating", icon: "star" },
        { value: "24/7", label: "Support", icon: "headphones" },
      ],
    }),
  ],

  // Testimonials
  "testimonials": (ctx) => {
    const testimonials = ctx.content.testimonials || [];
    if (testimonials.length === 0) return [];
    return [
      block("spacer", { height: 56 }),
      block("testimonials", {
        title: "What Our Customers Say",
        subtitle: "Real reviews from real customers",
        bgColor: "transparent",
        items: testimonials.slice(0, 3).map((t) => ({
          name: t.name,
          role: t.role || "Verified Buyer",
          text: t.text,
          rating: 5,
        })),
      }),
    ];
  },

  // Brand story (imageText)
  "story": (ctx) => {
    const story = ctx.content.about?.story || `${ctx.storeName} is dedicated to providing the best products and services.`;
    const parts = story.split(/\n\n+/);
    const firstHalf = parts.slice(0, Math.ceil(parts.length / 2)).join("\n\n");
    return [
      block("spacer", { height: 56 }),
      block("imageText", {
        badge: "Our Story",
        title: `Why ${ctx.storeName}?`,
        text: firstHalf,
        image: ctx.images.about,
        imageAlt: `${ctx.storeName} - Our Story`,
        reverse: false,
        buttonText: "Learn More",
        buttonHref: `/store/${ctx.storeSlug}/about`,
      }),
    ];
  },

  "story-full": (ctx) => {
    const story = ctx.content.about?.story || `${ctx.storeName} is dedicated to quality and service.`;
    const parts = story.split(/\n\n+/);
    const firstHalf = parts.slice(0, Math.ceil(parts.length / 2)).join("\n\n");
    const secondHalf = parts.slice(Math.ceil(parts.length / 2)).join("\n\n") || firstHalf;
    return [
      block("spacer", { height: 56 }),
      block("imageText", {
        badge: "Our Story",
        title: `Why ${ctx.storeName}?`,
        text: firstHalf,
        image: ctx.images.about,
        imageAlt: `${ctx.storeName} - Our Story`,
        reverse: false,
        buttonText: "",
      }),
      block("spacer", { height: 48 }),
      block("imageText", {
        badge: "Our Mission",
        title: "What Drives Us",
        text: secondHalf,
        image: ctx.images.lifestyle,
        imageAlt: `${ctx.storeName} - Our Mission`,
        reverse: true,
        buttonText: "",
      }),
    ];
  },

  // Newsletter
  "newsletter": (ctx) => [
    block("spacer", { height: 56 }),
    block("newsletter", {
      title: "Stay Updated",
      subtitle: "Get the latest offers and new arrivals straight to your inbox.",
      bgColor: "brand",
    }),
  ],

  // Trust badges
  "trust": (ctx) => [
    block("spacer", { height: 40 }),
    block("trustBadges", {
      items: [
        { icon: "shield", label: "Secure Checkout" },
        { icon: "truck", label: "Nationwide Delivery" },
        { icon: "refresh", label: "Easy Returns" },
        { icon: "headphones", label: "WhatsApp Support" },
      ],
    }),
  ],

  // Banner / CTA
  "banner": (ctx) => [
    block("spacer", { height: 56 }),
    block("banner", {
      title: "Ready to Experience the Difference?",
      subtitle: "Join thousands of happy customers today",
      buttonText: "Browse Products",
      buttonHref: `/store/${ctx.storeSlug}/shop`,
      bgColor: "dark",
      backgroundImage: ctx.images.banner,
    }),
  ],

  // Gallery
  "gallery": (ctx) => [
    block("spacer", { height: 56 }),
    block("gallery", {
      title: "Gallery",
      subtitle: "",
      images: ctx.images.showcase.slice(0, 6).map((src, i) => ({
        src,
        alt: `${ctx.storeName} - Image ${i + 1}`,
      })),
    }),
  ],

  // Contact section
  "contact": (ctx) => [
    block("spacer", { height: 56 }),
    block("contactInfo", {
      title: "Get in Touch",
      items: [
        { icon: "message", title: "WhatsApp", value: "Quick chat support" },
        { icon: "mail", title: "Email", value: "Send us a message" },
        { icon: "phone", title: "Phone", value: "Call during business hours" },
      ],
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
    }),
  ],

  // FAQ section
  "faq": (ctx) => {
    const items = ctx.content.faq?.items || [];
    if (items.length === 0) return [];
    return [
      block("spacer", { height: 56 }),
      block("faq", {
        title: "Frequently Asked Questions",
        items: items.slice(0, 4).map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
      }),
    ];
  },

  // Values section
  "values": (ctx) => {
    const values = ctx.content.about?.values || [];
    if (values.length === 0) return [];
    const icons = ["heart", "award", "globe", "shield", "target", "rocket"];
    return [
      block("spacer", { height: 56 }),
      block("features", {
        title: "Our Values",
        subtitle: "The principles that guide everything we do",
        bgColor: "surface",
        items: values.map((v, i) => ({
          icon: icons[i % icons.length],
          title: v.title,
          desc: v.desc,
        })),
      }),
    ];
  },

  // Countdown / urgency
  "countdown": (ctx) => [
    block("spacer", { height: 48 }),
    block("countdown", {
      title: "Limited Time Offer",
      subtitle: "Don't miss out on our special deals",
      bgColor: "brand",
    }),
  ],
};

// ─── Industry Layout Presets ────────────────────────────────
// Each industry has 3 layout variants. The AI can also override with its own.

const INDUSTRY_LAYOUTS: Record<string, string[][]> = {
  fashion: [
    ["hero-image", "stats", "products-featured", "story", "features", "testimonials", "newsletter", "trust"],
    ["hero-split", "products", "features", "gallery", "testimonials", "banner", "newsletter"],
    ["hero-image", "features", "products", "story-full", "stats", "testimonials", "trust", "newsletter"],
  ],
  electronics: [
    ["hero-image", "products-featured", "features", "stats", "testimonials", "banner", "newsletter", "trust"],
    ["hero-minimal", "features", "products", "story", "testimonials", "newsletter", "trust"],
    ["hero-image", "stats", "products-featured", "features", "faq", "testimonials", "newsletter"],
  ],
  beauty: [
    ["hero-image", "products", "story", "features", "gallery", "testimonials", "newsletter", "trust"],
    ["hero-split", "features", "products-featured", "testimonials", "story", "newsletter", "banner"],
    ["hero-image", "stats", "products", "gallery", "story-full", "testimonials", "newsletter", "trust"],
  ],
  food: [
    ["hero-image", "features", "products", "story", "gallery", "testimonials", "contact", "newsletter"],
    ["hero-split", "products-featured", "story", "stats", "testimonials", "banner", "newsletter"],
    ["hero-image", "stats", "products", "features", "testimonials", "faq", "newsletter", "trust"],
  ],
  health: [
    ["hero-image", "features", "products", "story-full", "stats", "testimonials", "faq", "newsletter", "trust"],
    ["hero-split", "stats", "products", "features", "testimonials", "story", "newsletter"],
    ["hero-image", "values", "products-featured", "story", "testimonials", "banner", "newsletter", "trust"],
  ],
  "real-estate": [
    ["hero-image", "stats", "products-featured", "story-full", "features", "testimonials", "contact", "newsletter"],
    ["hero-split", "features", "products", "gallery", "story", "testimonials", "banner", "contact"],
    ["hero-image", "values", "products", "stats", "story", "testimonials", "faq", "newsletter"],
  ],
  kids: [
    ["hero-image", "products-featured", "features", "story", "gallery", "testimonials", "newsletter", "trust"],
    ["hero-split", "products", "features", "testimonials", "story", "banner", "newsletter"],
    ["hero-image", "stats", "products", "story-full", "features", "testimonials", "newsletter", "trust"],
  ],
  grocery: [
    ["hero-image", "products-featured", "features", "stats", "testimonials", "banner", "newsletter", "trust"],
    ["hero-split", "features", "products", "story", "testimonials", "newsletter"],
    ["hero-image", "products", "features", "faq", "testimonials", "contact", "newsletter", "trust"],
  ],
  interior: [
    ["hero-image", "products-featured", "story", "gallery", "features", "testimonials", "newsletter", "trust"],
    ["hero-split", "gallery", "products", "story-full", "testimonials", "banner", "newsletter"],
    ["hero-image", "features", "products", "story", "stats", "testimonials", "newsletter", "trust"],
  ],
  services: [
    ["hero-image", "features", "story-full", "stats", "testimonials", "faq", "contact", "newsletter"],
    ["hero-split", "values", "story", "features", "testimonials", "banner", "contact"],
    ["hero-image", "stats", "features", "story", "testimonials", "faq", "newsletter", "trust"],
  ],
};

// ─── Public API ─────────────────────────────────────────────

/**
 * Build homepage blocks using AI-decided or industry-default layout.
 * If the AI provided a layout.sections array, use that.
 * Otherwise pick a random layout variant for the detected industry.
 */
export function buildDynamicHomePage(
  content: AIContent,
  storeName: string,
  storeSlug: string,
  industry: string,
  images: ReturnType<typeof getRandomIndustryImages>,
): BuilderBlock[] {
  const ctx: LayoutContext = { storeName, storeSlug, industry, images, content };

  // Determine section order
  let sections: string[];

  if (content.layout?.sections && content.layout.sections.length > 0) {
    // AI explicitly decided the layout
    sections = content.layout.sections;
  } else {
    // Pick a random layout variant for this industry
    const variants = INDUSTRY_LAYOUTS[industry] || INDUSTRY_LAYOUTS.fashion;
    sections = variants[Math.floor(Math.random() * variants.length)];
  }

  // Build blocks from sections
  const blocks: BuilderBlock[] = [];
  for (const section of sections) {
    const builder = SECTION_BUILDERS[section];
    if (builder) {
      blocks.push(...builder(ctx));
    }
  }

  return blocks;
}

/**
 * Get the available section names (for AI prompt).
 */
export function getAvailableSections(): string[] {
  return Object.keys(SECTION_BUILDERS);
}
