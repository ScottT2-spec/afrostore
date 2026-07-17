/**
 * AI Layout Engine
 * 
 * Instead of hardcoding one block sequence for all stores, the AI decides
 * which blocks to use and in what order based on the business type and vibe.
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
  layout?: {
    sections: string[];
    vibe?: string;
    colorMood?: string;
  };
  // NEW: AI-generated dynamic content for sections
  stats?: Array<{ value: string; label: string }>;
  bannerCta?: { title: string; subtitle: string; buttonText: string };
  newsletterCopy?: { title: string; subtitle: string };
  productSectionTitle?: string;
  productSectionSubtitle?: string;
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

// Industry-specific trust badges
const INDUSTRY_TRUST: Record<string, Array<{ icon: string; label: string }>> = {
  fashion: [
    { icon: "shield", label: "Secure Checkout" },
    { icon: "truck", label: "Fast Delivery" },
    { icon: "refresh", label: "Easy Returns" },
    { icon: "headphones", label: "Style Support" },
  ],
  electronics: [
    { icon: "shield", label: "Warranty Protected" },
    { icon: "truck", label: "Insured Shipping" },
    { icon: "refresh", label: "30-Day Returns" },
    { icon: "zap", label: "Genuine Products" },
  ],
  beauty: [
    { icon: "heart", label: "Cruelty Free" },
    { icon: "shield", label: "Authentic Products" },
    { icon: "truck", label: "Careful Packaging" },
    { icon: "refresh", label: "Satisfaction Guaranteed" },
  ],
  food: [
    { icon: "heart", label: "Fresh & Quality" },
    { icon: "truck", label: "Same-Day Delivery" },
    { icon: "shield", label: "Hygiene Certified" },
    { icon: "headphones", label: "Order Support" },
  ],
  health: [
    { icon: "shield", label: "Clinically Tested" },
    { icon: "heart", label: "Natural Ingredients" },
    { icon: "truck", label: "Discreet Shipping" },
    { icon: "headphones", label: "Expert Guidance" },
  ],
  "real-estate": [
    { icon: "shield", label: "Verified Listings" },
    { icon: "award", label: "Licensed Agents" },
    { icon: "globe", label: "Virtual Tours" },
    { icon: "headphones", label: "24/7 Enquiries" },
  ],
  kids: [
    { icon: "shield", label: "Child-Safe Products" },
    { icon: "heart", label: "Parent Approved" },
    { icon: "truck", label: "Fast Delivery" },
    { icon: "refresh", label: "Easy Returns" },
  ],
  grocery: [
    { icon: "heart", label: "Farm Fresh" },
    { icon: "truck", label: "Express Delivery" },
    { icon: "shield", label: "Quality Checked" },
    { icon: "refresh", label: "Freshness Guarantee" },
  ],
  interior: [
    { icon: "shield", label: "Quality Craftsmanship" },
    { icon: "truck", label: "White Glove Delivery" },
    { icon: "award", label: "Design Consultation" },
    { icon: "refresh", label: "Satisfaction Guarantee" },
  ],
  services: [
    { icon: "shield", label: "Trusted & Verified" },
    { icon: "award", label: "Professional Team" },
    { icon: "headphones", label: "Always Available" },
    { icon: "heart", label: "Community Focused" },
  ],
};

// Industry-specific default product section titles
const PRODUCT_TITLES: Record<string, { title: string; subtitle: string }[]> = {
  fashion: [
    { title: "New Arrivals", subtitle: "Fresh styles just landed" },
    { title: "The Collection", subtitle: "Curated pieces for every occasion" },
    { title: "Trending Now", subtitle: "What everyone's wearing" },
  ],
  electronics: [
    { title: "Top Picks", subtitle: "Our most popular tech" },
    { title: "New In", subtitle: "Latest gadgets and gear" },
    { title: "Best Sellers", subtitle: "Customer favorites" },
  ],
  beauty: [
    { title: "Bestsellers", subtitle: "Most loved by our customers" },
    { title: "Shop the Collection", subtitle: "Beauty essentials curated for you" },
    { title: "New Arrivals", subtitle: "Fresh drops you'll love" },
  ],
  food: [
    { title: "Our Menu", subtitle: "Made with love, served fresh" },
    { title: "Popular Orders", subtitle: "What customers keep coming back for" },
    { title: "Today's Specials", subtitle: "Fresh picks for today" },
  ],
  "real-estate": [
    { title: "Featured Properties", subtitle: "Handpicked listings for you" },
    { title: "Available Now", subtitle: "Ready for viewing" },
    { title: "Premium Listings", subtitle: "Exclusive properties" },
  ],
  services: [
    { title: "Our Services", subtitle: "What we can do for you" },
    { title: "Popular Services", subtitle: "Most requested by our clients" },
    { title: "Explore", subtitle: "Find what you need" },
  ],
  kids: [
    { title: "Kids' Favorites", subtitle: "Top picks for little ones" },
    { title: "Shop by Age", subtitle: "Find the perfect fit" },
    { title: "New Arrivals", subtitle: "Fun new stuff just in" },
  ],
  grocery: [
    { title: "Fresh Picks", subtitle: "Handpicked for quality" },
    { title: "Weekly Essentials", subtitle: "Stock up on the basics" },
    { title: "Shop Now", subtitle: "Fresh produce and pantry staples" },
  ],
  interior: [
    { title: "Featured Pieces", subtitle: "Design-forward furniture and decor" },
    { title: "Shop the Look", subtitle: "Curated room inspirations" },
    { title: "New Collection", subtitle: "Latest arrivals in home design" },
  ],
  health: [
    { title: "Wellness Essentials", subtitle: "For your health journey" },
    { title: "Shop Now", subtitle: "Supplements, fitness, and more" },
    { title: "Most Popular", subtitle: "Trusted by thousands" },
  ],
};

function getProductTitle(ctx: LayoutContext): { title: string; subtitle: string } {
  // Use AI-generated title if available
  if (ctx.content.productSectionTitle) {
    return { title: ctx.content.productSectionTitle, subtitle: ctx.content.productSectionSubtitle || "" };
  }
  // Pick random industry-specific title
  const titles = PRODUCT_TITLES[ctx.industry] || PRODUCT_TITLES.fashion;
  return titles[Math.floor(Math.random() * titles.length)];
}

const SECTION_BUILDERS: Record<string, (ctx: LayoutContext) => BuilderBlock[]> = {
  
  // ─── Hero variants ──────────────────────────────────────
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

  "hero-bold": (ctx) => [
    block("hero", {
      heading: ctx.content.brand?.heroHeading || `${ctx.storeName}`,
      subheading: ctx.content.brand?.heroSubheading || ctx.content.brand?.tagline || "",
      buttonText: ctx.content.brand?.ctaText || "Shop Now",
      buttonHref: `/store/${ctx.storeSlug}/shop`,
      bgStyle: "image",
      backgroundImage: ctx.images.hero,
      align: "left",
    }),
  ],

  // ─── Product sections ───────────────────────────────────
  "products": (ctx) => {
    const pt = getProductTitle(ctx);
    return [
      block("spacer", { height: 56 }),
      block("productGrid", { title: pt.title, subtitle: pt.subtitle, columns: 3, limit: 6, showPrice: true, category: "" }),
    ];
  },

  "products-featured": (ctx) => {
    const pt = getProductTitle(ctx);
    return [
      block("spacer", { height: 56 }),
      block("productGrid", { title: pt.title, subtitle: pt.subtitle, columns: 4, limit: 8, showPrice: true, category: "" }),
    ];
  },

  "products-compact": (ctx) => {
    const pt = getProductTitle(ctx);
    return [
      block("spacer", { height: 48 }),
      block("productGrid", { title: pt.title, subtitle: pt.subtitle, columns: 2, limit: 4, showPrice: true, category: "" }),
    ];
  },

  // ─── Features / Why us ──────────────────────────────────
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
          : (INDUSTRY_TRUST[ctx.industry] || INDUSTRY_TRUST.fashion).map(b => ({
              icon: b.icon,
              title: b.label,
              desc: "",
            })),
      }),
    ];
  },

  // ─── Stats ──────────────────────────────────────────────
  "stats": (ctx) => {
    const defaultIcons = ["users", "package", "star", "headphones"];
    // Use AI-generated stats if available, otherwise industry-appropriate defaults
    const aiStats = ctx.content.stats;
    const items = aiStats && aiStats.length >= 3
      ? aiStats.slice(0, 4).map((s, i) => ({
          value: s.value,
          label: s.label,
          icon: defaultIcons[i % defaultIcons.length],
        }))
      : INDUSTRY_STATS[ctx.industry] || INDUSTRY_STATS.fashion;

    return [
      block("spacer", { height: 48 }),
      block("stats", { bgColor: "brand", items }),
    ];
  },

  // ─── Testimonials ───────────────────────────────────────
  "testimonials": (ctx) => {
    const testimonials = ctx.content.testimonials || [];
    if (testimonials.length === 0) return [];
    return [
      block("spacer", { height: 56 }),
      block("testimonials", {
        title: "What Our Customers Say",
        subtitle: "Real reviews from real people",
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

  // ─── Brand story ────────────────────────────────────────
  "story": (ctx) => {
    const story = ctx.content.about?.story || `${ctx.storeName} is dedicated to providing the best products and services.`;
    const parts = story.split(/\n\n+/);
    const firstHalf = parts.slice(0, Math.ceil(parts.length / 2)).join("\n\n");
    return [
      block("spacer", { height: 56 }),
      block("imageText", {
        badge: "Our Story",
        title: ctx.content.about?.headline || `Why ${ctx.storeName}?`,
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
        title: ctx.content.about?.headline || `Why ${ctx.storeName}?`,
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

  // ─── Newsletter ─────────────────────────────────────────
  "newsletter": (ctx) => {
    const copy = ctx.content.newsletterCopy;
    return [
      block("spacer", { height: 56 }),
      block("newsletter", {
        title: copy?.title || "Stay in the Loop",
        subtitle: copy?.subtitle || `Be the first to know about new arrivals and exclusive offers from ${ctx.storeName}.`,
        bgColor: "brand",
      }),
    ];
  },

  // ─── Trust badges (industry-specific) ───────────────────
  "trust": (ctx) => [
    block("spacer", { height: 40 }),
    block("trustBadges", {
      items: INDUSTRY_TRUST[ctx.industry] || INDUSTRY_TRUST.fashion,
    }),
  ],

  // ─── Banner / CTA ──────────────────────────────────────
  "banner": (ctx) => {
    const cta = ctx.content.bannerCta;
    return [
      block("spacer", { height: 56 }),
      block("banner", {
        title: cta?.title || `Discover ${ctx.storeName}`,
        subtitle: cta?.subtitle || ctx.content.brand?.tagline || "Experience something extraordinary",
        buttonText: cta?.buttonText || ctx.content.brand?.ctaText || "Shop Now",
        buttonHref: `/store/${ctx.storeSlug}/shop`,
        bgColor: "dark",
        backgroundImage: ctx.images.banner,
      }),
    ];
  },

  // ─── Gallery ────────────────────────────────────────────
  "gallery": (ctx) => [
    block("spacer", { height: 56 }),
    block("gallery", {
      title: "Gallery",
      subtitle: `A glimpse into ${ctx.storeName}`,
      images: ctx.images.showcase.slice(0, 6).map((src, i) => ({
        src,
        alt: `${ctx.storeName} - Image ${i + 1}`,
      })),
    }),
  ],

  // ─── Contact section ───────────────────────────────────
  "contact": (ctx) => [
    block("spacer", { height: 56 }),
    block("contactInfo", {
      title: ctx.content.contact?.headline || "Get in Touch",
      subtitle: ctx.content.contact?.subtitle || "",
      items: [
        { icon: "message", title: "WhatsApp", value: "Quick chat support" },
        { icon: "mail", title: "Email", value: "Send us a message" },
        { icon: "phone", title: "Phone", value: "Call during business hours" },
      ],
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
    }),
  ],

  // ─── FAQ section ────────────────────────────────────────
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

  // ─── Values section ────────────────────────────────────
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

  // ─── Team section ──────────────────────────────────────
  "team": (ctx) => {
    const team = ctx.content.about?.values || []; // reuse values as team if no team data
    return [
      block("spacer", { height: 56 }),
      block("team", {
        title: `Meet the ${ctx.storeName} Team`,
        subtitle: "The people behind the brand",
        members: team.slice(0, 4).map((v) => ({
          name: v.title,
          role: v.desc,
          image: "",
        })),
      }),
    ];
  },

  // ─── Countdown / urgency ───────────────────────────────
  "countdown": (ctx) => [
    block("spacer", { height: 48 }),
    block("countdown", {
      title: `${ctx.storeName} — Limited Time Offer`,
      subtitle: "Don't miss out on our special deals",
      bgColor: "brand",
    }),
  ],
};

// ─── Industry-Specific Default Stats ────────────────────────

const INDUSTRY_STATS: Record<string, Array<{ value: string; label: string; icon: string }>> = {
  fashion: [
    { value: "50+", label: "Styles Available", icon: "package" },
    { value: "4.8", label: "Customer Rating", icon: "star" },
    { value: "24h", label: "Fast Shipping", icon: "truck" },
    { value: "7 Days", label: "Easy Returns", icon: "refresh" },
  ],
  electronics: [
    { value: "100+", label: "Products", icon: "package" },
    { value: "1 Year", label: "Warranty", icon: "shield" },
    { value: "24h", label: "Tech Support", icon: "headphones" },
    { value: "4.9", label: "Rating", icon: "star" },
  ],
  beauty: [
    { value: "100%", label: "Authentic", icon: "shield" },
    { value: "50+", label: "Products", icon: "heart" },
    { value: "4.9", label: "Rating", icon: "star" },
    { value: "Same Day", label: "Delivery", icon: "truck" },
  ],
  food: [
    { value: "Fresh", label: "Daily Prepared", icon: "heart" },
    { value: "30 min", label: "Avg Delivery", icon: "truck" },
    { value: "4.8", label: "Rating", icon: "star" },
    { value: "100%", label: "Hygiene Certified", icon: "shield" },
  ],
  health: [
    { value: "100%", label: "Natural", icon: "heart" },
    { value: "50+", label: "Products", icon: "package" },
    { value: "Certified", label: "Quality", icon: "shield" },
    { value: "Expert", label: "Guidance", icon: "headphones" },
  ],
  "real-estate": [
    { value: "50+", label: "Active Listings", icon: "globe" },
    { value: "100+", label: "Properties Sold", icon: "award" },
    { value: "5 Star", label: "Client Rating", icon: "star" },
    { value: "24/7", label: "Enquiries", icon: "headphones" },
  ],
  kids: [
    { value: "100%", label: "Child-Safe", icon: "shield" },
    { value: "50+", label: "Products", icon: "package" },
    { value: "4.9", label: "Parent Rating", icon: "star" },
    { value: "Fast", label: "Delivery", icon: "truck" },
  ],
  grocery: [
    { value: "Farm", label: "Fresh Produce", icon: "heart" },
    { value: "200+", label: "Products", icon: "package" },
    { value: "Same Day", label: "Delivery", icon: "truck" },
    { value: "4.8", label: "Rating", icon: "star" },
  ],
  interior: [
    { value: "Handpicked", label: "Collections", icon: "award" },
    { value: "50+", label: "Pieces", icon: "package" },
    { value: "Free", label: "Design Advice", icon: "headphones" },
    { value: "4.9", label: "Rating", icon: "star" },
  ],
  services: [
    { value: "5 Star", label: "Client Rating", icon: "star" },
    { value: "100+", label: "Projects Done", icon: "award" },
    { value: "24/7", label: "Available", icon: "headphones" },
    { value: "Trusted", label: "Since Day 1", icon: "shield" },
  ],
};

// ─── Industry Layout Presets ────────────────────────────────
// Each industry has 3 layout variants. AI can override with its own.

const INDUSTRY_LAYOUTS: Record<string, string[][]> = {
  fashion: [
    ["hero-image", "stats", "products-featured", "story", "features", "testimonials", "newsletter", "trust"],
    ["hero-split", "products", "features", "gallery", "testimonials", "banner", "newsletter"],
    ["hero-bold", "features", "products", "story-full", "stats", "testimonials", "trust", "newsletter"],
  ],
  electronics: [
    ["hero-image", "products-featured", "features", "stats", "testimonials", "banner", "newsletter", "trust"],
    ["hero-minimal", "features", "products", "story", "testimonials", "newsletter", "trust"],
    ["hero-bold", "stats", "products-featured", "features", "faq", "testimonials", "newsletter"],
  ],
  beauty: [
    ["hero-image", "products", "story", "features", "gallery", "testimonials", "newsletter", "trust"],
    ["hero-split", "features", "products-featured", "testimonials", "story", "newsletter", "banner"],
    ["hero-bold", "stats", "products", "gallery", "story-full", "testimonials", "newsletter", "trust"],
  ],
  food: [
    ["hero-image", "features", "products", "story", "gallery", "testimonials", "contact", "newsletter"],
    ["hero-split", "products-featured", "story", "stats", "testimonials", "banner", "newsletter"],
    ["hero-bold", "stats", "products", "features", "testimonials", "faq", "newsletter", "trust"],
  ],
  health: [
    ["hero-image", "features", "products", "story-full", "stats", "testimonials", "faq", "newsletter", "trust"],
    ["hero-split", "stats", "products", "features", "testimonials", "story", "newsletter"],
    ["hero-bold", "values", "products-featured", "story", "testimonials", "banner", "newsletter", "trust"],
  ],
  "real-estate": [
    ["hero-image", "stats", "products-featured", "story-full", "features", "testimonials", "contact", "newsletter"],
    ["hero-split", "features", "products", "gallery", "story", "testimonials", "banner", "contact"],
    ["hero-bold", "values", "products", "stats", "story", "testimonials", "faq", "newsletter"],
  ],
  kids: [
    ["hero-image", "products-featured", "features", "story", "gallery", "testimonials", "newsletter", "trust"],
    ["hero-split", "products", "features", "testimonials", "story", "banner", "newsletter"],
    ["hero-bold", "stats", "products", "story-full", "features", "testimonials", "newsletter", "trust"],
  ],
  grocery: [
    ["hero-image", "products-featured", "features", "stats", "testimonials", "banner", "newsletter", "trust"],
    ["hero-split", "features", "products", "story", "testimonials", "newsletter"],
    ["hero-bold", "products", "features", "faq", "testimonials", "contact", "newsletter", "trust"],
  ],
  interior: [
    ["hero-image", "products-featured", "story", "gallery", "features", "testimonials", "newsletter", "trust"],
    ["hero-split", "gallery", "products", "story-full", "testimonials", "banner", "newsletter"],
    ["hero-bold", "features", "products", "story", "stats", "testimonials", "newsletter", "trust"],
  ],
  services: [
    ["hero-image", "features", "story-full", "stats", "testimonials", "faq", "contact", "newsletter"],
    ["hero-split", "values", "story", "features", "testimonials", "banner", "contact"],
    ["hero-bold", "stats", "features", "story", "team", "testimonials", "faq", "newsletter", "trust"],
  ],
};

// ─── Validation ─────────────────────────────────────────────

const VALID_SECTIONS = new Set(Object.keys(SECTION_BUILDERS));
const MIN_SECTIONS = 4; // minimum viable homepage

function validateAndFixSections(sections: string[], industry: string): string[] {
  // Filter to only valid section names
  const valid = sections.filter(s => VALID_SECTIONS.has(s));
  
  // Must start with a hero
  const hasHero = valid.some(s => s.startsWith("hero-"));
  if (!hasHero) {
    valid.unshift("hero-image");
  }

  // If too few sections after filtering, fall back to industry preset
  if (valid.length < MIN_SECTIONS) {
    const variants = INDUSTRY_LAYOUTS[industry] || INDUSTRY_LAYOUTS.fashion;
    return variants[Math.floor(Math.random() * variants.length)];
  }

  return valid;
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Build homepage blocks using AI-decided or industry-default layout.
 * If the AI provided a layout.sections array, use that (after validation).
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

  let sections: string[];

  if (content.layout?.sections && content.layout.sections.length > 0) {
    // AI explicitly decided the layout — validate it
    sections = validateAndFixSections(content.layout.sections, industry);
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
