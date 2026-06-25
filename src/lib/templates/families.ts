import type { BuilderBlock } from "@/components/storefront/BlockRenderer";
import type { TemplateDefinition, ThemeConfig } from "./types";

type FamilyDef = TemplateDefinition & {
  pageTitles: string[];
  legacySlugs?: string[];
};

function block(id: string, type: string, props: Record<string, unknown>): BuilderBlock {
  return { id, type, props };
}

function themeConfig(params: {
  layout: string;
  header: string;
  footer: string;
  card: string;
  colors: ThemeConfig["colors"];
  fonts: Partial<ThemeConfig["fonts"]>;
  sections: BuilderBlock[];
}): ThemeConfig {
  return {
    homepage_layout: params.layout,
    header_style: params.header,
    footer_style: params.footer,
    product_card_style: params.card,
    colors: params.colors,
    fonts: {
      heading: params.fonts.heading || "Inter",
      body: params.fonts.body || "Inter",
    },
    branding: {},
    sections: params.sections,
  };
}

function makeTemplate(template: Omit<FamilyDef, "active"> & { active?: boolean }): FamilyDef {
  return { ...template, active: template.active ?? true };
}

const restaurantHero = block("restaurant-hero", "hero", {
  badge: "Restaurant Pro",
  heading: "Elevated dining experiences",
  subheading: "A refined menu-first layout with reservations, chef storytelling, and elegant gallery sections.",
  buttonText: "View Menu",
  buttonHref: "#menu",
  secondaryButtonText: "Reserve a Table",
  secondaryButtonHref: "#reservations",
  bgStyle: "dark",
});

const bakeryHero = block("bakery-hero", "hero", {
  badge: "Bakery Delight",
  heading: "Fresh bakes, daily specials, and easy pickup",
  subheading: "Built for bakeries and cafes that need quick browsing, visible specials, and strong conversion flow.",
  buttonText: "See Specials",
  buttonHref: "#specials",
  secondaryButtonText: "Order Pickup",
  secondaryButtonHref: "#pickup",
  bgStyle: "light",
});

const fashionHero = block("fashion-hero", "hero", {
  badge: "Fashion Luxe",
  heading: "Editorial fashion with a premium runway feel",
  subheading: "Designed for storytelling, curated drops, collections, and lookbooks with a luxury storefront flow.",
  buttonText: "Shop Collections",
  buttonHref: "#collections",
  secondaryButtonText: "View Lookbook",
  secondaryButtonHref: "#lookbook",
  bgStyle: "accent",
});

const footwearHero = block("footwear-hero", "hero", {
  badge: "Footwear Elite",
  heading: "Performance browsing for shoes and variants",
  subheading: "Size-first merchandising, brand discovery, and seasonal collection navigation for footwear shops.",
  buttonText: "Shop Footwear",
  buttonHref: "#collections",
  secondaryButtonText: "Find Your Size",
  secondaryButtonHref: "#size-guide",
  bgStyle: "dark",
});

const accessoryHero = block("accessory-hero", "hero", {
  badge: "Accessory Hub",
  heading: "Giftable accessories with fast discovery",
  subheading: "Compact product discovery, bundles, and quick view friendly layouts for jewelry and lifestyle brands.",
  buttonText: "Browse Gifts",
  buttonHref: "#gifts",
  secondaryButtonText: "See Bundles",
  secondaryButtonHref: "#bundles",
  bgStyle: "light",
});

const kidsHero = block("kids-hero", "hero", {
  badge: "Kids World",
  heading: "Playful, safe, and parent-friendly shopping",
  subheading: "Age categories, safety highlights, and educational sections designed for kids and baby brands.",
  buttonText: "Shop by Age",
  buttonHref: "#age-categories",
  secondaryButtonText: "Parents Guide",
  secondaryButtonHref: "#parents",
  bgStyle: "accent",
});

const servicesHero = block("services-hero", "hero", {
  badge: "Business Services Pro",
  heading: "Lead-driven services, proof, and pricing",
  subheading: "Structured for consulting, agency, and professional businesses with clear conversion pathways.",
  buttonText: "See Services",
  buttonHref: "#services",
  secondaryButtonText: "Get a Quote",
  secondaryButtonHref: "#contact",
  bgStyle: "dark",
});

const interiorHero = block("interior-hero", "hero", {
  badge: "Interior Studio",
  heading: "Portfolio-led presentation for studios and designers",
  subheading: "Show projects, awards, services, and teams with a premium editorial feel that suits interior brands.",
  buttonText: "View Projects",
  buttonHref: "#projects",
  secondaryButtonText: "Meet the Team",
  secondaryButtonHref: "#team",
  bgStyle: "light",
});

const commerceHero = block("commerce-hero", "hero", {
  badge: "Commerce Pro",
  heading: "A high-converting ecommerce foundation",
  subheading: "Built for broad merchandising, flash sales, collections, reviews, and category-heavy product browsing.",
  buttonText: "Shop Now",
  buttonHref: "#featured",
  secondaryButtonText: "Browse Collections",
  secondaryButtonHref: "#collections",
  bgStyle: "dark",
});

export const TEMPLATE_FAMILIES: FamilyDef[] = [
  makeTemplate({
    name: "Restaurant Pro",
    slug: "restaurant-pro",
    category: "Restaurant",
    description: "A menu-first restaurant template with reservations, chef storytelling, and location support.",
    previewImage: "",
    previewUrl: "/template-preview/restaurant-pro",
    recommendationKeywords: ["restaurant", "dining", "menu", "reservations", "chef", "catering", "food"],
    variants: [{ name: "Restaurant", keywords: ["restaurant", "dining"] }, { name: "Cafe", keywords: ["cafe", "coffee"] }],
    themeConfig: themeConfig({
      layout: "restaurant_pro",
      header: "split",
      footer: "rich",
      card: "editorial",
      colors: { primary: "#8C2F39", secondary: "#1F2937", accent: "#D97706", background: "#FFF8F2", text: "#1F2937", headerBg: "#FFFDF8", footerBg: "#1F2937", footerText: "#F9FAFB" },
      fonts: { heading: "Cormorant Garamond", body: "Inter" },
      sections: [
        restaurantHero,
        block("restaurant-featured", "featured_dishes", { title: "Featured Dishes", subtitle: "Signature plates and house favorites.", limit: 6, columns: 3 }),
        block("restaurant-about", "features", { title: "About the Chef", subtitle: "A short story that builds trust and taste.", items: [] }),
        block("restaurant-menu", "menu", { title: "Menu Showcase", subtitle: "Organize starters, mains, drinks, and desserts." }),
        block("restaurant-reservations", "reservations", { title: "Reservations", subtitle: "Make it easy to book a table or request catering." }),
        block("restaurant-testimonials", "testimonials", { title: "Guest Stories", bgColor: "surface", items: [] }),
        block("restaurant-gallery", "portfolio", { title: "Gallery", subtitle: "Food, atmosphere, and event photos." }),
        block("restaurant-contact", "contactInfo", { title: "Location & Contact", subtitle: "Hours, address, and contact details." }),
      ],
    }),
    pageTitles: ["Home", "Menu", "Reservations", "Chef Story", "Gallery", "Contact"],
    legacySlugs: ["panno-restaurant"],
  }),
  makeTemplate({
    name: "Bakery Delight",
    slug: "bakery-delight",
    category: "Bakery",
    description: "A warm bakery and cafe template with daily specials and pickup-friendly shopping.",
    previewImage: "",
    previewUrl: "/template-preview/bakery-delight",
    recommendationKeywords: ["bakery", "cakes", "pastry", "coffee", "cafe", "dessert", "pickup"],
    variants: [{ name: "Bakery", keywords: ["bakery", "cakes"] }, { name: "Cafe", keywords: ["cafe", "food"] }],
    themeConfig: themeConfig({
      layout: "bakery_delight",
      header: "soft",
      footer: "simple",
      card: "rounded-photo",
      colors: { primary: "#B45309", secondary: "#7C2D12", accent: "#FDE68A", background: "#FFFDF6", text: "#2A211D", headerBg: "#FFFFFF", footerBg: "#7C2D12", footerText: "#FFF7ED" },
      fonts: { heading: "Lora", body: "Nunito" },
      sections: [
        bakeryHero,
        block("bakery-specials", "banner", { title: "Daily Specials", subtitle: "Rotate seasonal offers and best sellers." }),
        block("bakery-products", "featured_products", { title: "Featured Products", subtitle: "Fresh breads, cakes, and pastries.", limit: 8, columns: 4, showFeatured: true }),
        block("bakery-pickup", "features", { title: "Pickup Information", subtitle: "Pickup windows, ordering cutoffs, and store notes.", items: [] }),
        block("bakery-gallery", "gallery", { title: "Fresh Showcase", subtitle: "Showcase the products people want to taste." }),
        block("bakery-testimonials", "testimonials", { title: "Loved by regulars", bgColor: "surface", items: [] }),
        block("bakery-contact", "contactForm", { title: "Order or ask a question", subtitle: "Capture quick custom orders and catering requests." }),
      ],
    }),
    pageTitles: ["Home", "Daily Specials", "Products", "Pickup", "Gallery", "Contact"],
    legacySlugs: ["bakery"],
  }),
  makeTemplate({
    name: "Fashion Luxe",
    slug: "fashion-luxe",
    category: "Fashion",
    description: "An editorial fashion template for collections, lookbooks, and launch campaigns.",
    previewImage: "",
    previewUrl: "/template-preview/fashion-luxe",
    recommendationKeywords: ["fashion", "clothing", "retail", "collections", "lookbook", "style", "wishlist"],
    variants: [{ name: "Fashion", keywords: ["fashion", "style"] }, { name: "Clothing", keywords: ["clothing", "apparel"] }],
    themeConfig: themeConfig({
      layout: "fashion_luxe",
      header: "mega",
      footer: "rich",
      card: "editorial",
      colors: { primary: "#0F172A", secondary: "#334155", accent: "#DB2777", background: "#FFFFFF", text: "#111827", headerBg: "#FFFFFF", footerBg: "#111827", footerText: "#F8FAFC" },
      fonts: { heading: "Cormorant Garamond", body: "Inter" },
      sections: [
        fashionHero,
        block("fashion-collections", "portfolio", { title: "Collections", subtitle: "Curated drops, seasonal edits, and category stories." }),
        block("fashion-trending", "featured_products", { title: "Trending Products", subtitle: "Keep the most important products visible.", limit: 8, columns: 4, showFeatured: true }),
        block("fashion-lookbook", "lookbook", { title: "Lookbook", subtitle: "Editorial imagery and outfit inspiration." }),
        block("fashion-new-arrivals", "new_arrivals", { title: "New Arrivals", limit: 8, columns: 4 }),
        block("fashion-newsletter", "newsletter", { title: "Join the list", subtitle: "Announce launches and VIP drops." }),
        block("fashion-instagram", "gallery", { title: "Instagram Feed", subtitle: "Social proof and visual merchandising." }),
      ],
    }),
    pageTitles: ["Home", "Collections", "Lookbook", "New Arrivals", "Wishlist", "Contact"],
    legacySlugs: ["lusion", "fashion-workdo"],
  }),
  makeTemplate({
    name: "Footwear Elite",
    slug: "footwear-elite",
    category: "Shoes",
    description: "A product-first footwear template with sizing, brands, and seasonal discovery flows.",
    previewImage: "",
    previewUrl: "/template-preview/footwear-elite",
    recommendationKeywords: ["shoes", "footwear", "sneakers", "size guide", "brands", "retail"],
    variants: [{ name: "Shoes", keywords: ["shoes", "footwear"] }, { name: "Sneakers", keywords: ["sneakers", "streetwear"] }],
    themeConfig: themeConfig({
      layout: "footwear_elite",
      header: "centered",
      footer: "minimal",
      card: "product-focus",
      colors: { primary: "#111827", secondary: "#475569", accent: "#EF4444", background: "#F8FAFC", text: "#0F172A", headerBg: "#FFFFFF", footerBg: "#0F172A", footerText: "#E2E8F0" },
      fonts: { heading: "Inter", body: "Inter" },
      sections: [
        footwearHero,
        block("footwear-collections", "featured_products", { title: "Featured Collections", subtitle: "Seasonal stories and best sellers.", limit: 6, columns: 3 }),
        block("footwear-size-guide", "features", { title: "Size Guide", subtitle: "Help shoppers pick the right fit.", items: [] }),
        block("footwear-brand-filters", "features", { title: "Brand Filters", subtitle: "Filter by brand and style.", items: [] }),
        block("footwear-seasonal", "banner", { title: "Seasonal Collections", subtitle: "Highlight drops, sales, and campaigns." }),
        block("footwear-testimonials", "testimonials", { title: "Fit feedback", bgColor: "surface", items: [] }),
      ],
    }),
    pageTitles: ["Home", "Collections", "Size Guide", "Brand Filters", "Seasonal Drops", "Contact"],
    legacySlugs: ["nou-shoes"],
  }),
  makeTemplate({
    name: "Accessory Hub",
    slug: "accessory-hub",
    category: "Accessories",
    description: "A compact accessories template for giftable products, bundles, and quick browsing.",
    previewImage: "",
    previewUrl: "/template-preview/accessory-hub",
    recommendationKeywords: ["accessories", "jewelry", "bags", "gift", "bundles", "lifestyle"],
    variants: [{ name: "Jewelry", keywords: ["jewelry", "accessories"] }, { name: "Lifestyle", keywords: ["lifestyle", "fashion"] }],
    themeConfig: themeConfig({
      layout: "accessory_hub",
      header: "minimal",
      footer: "rich",
      card: "gallery",
      colors: { primary: "#111827", secondary: "#6B7280", accent: "#D4AF37", background: "#FFFFFF", text: "#111827", headerBg: "#FFFFFF", footerBg: "#111827", footerText: "#F9FAFB" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      sections: [
        accessoryHero,
        block("accessory-gifts", "featured_products", { title: "Gift Collections", subtitle: "Curated gifts and occasion-based products.", limit: 6, columns: 3 }),
        block("accessory-bundles", "banner", { title: "Product Bundles", subtitle: "Bundle offers and seasonal sets." }),
        block("accessory-trending", "featured_products", { title: "Trending Products", subtitle: "Fast discovery for giftable items.", limit: 6, columns: 3 }),
        block("accessory-quick-view", "features", { title: "Quick View", subtitle: "Keep discovery fast and frictionless.", items: [] }),
      ],
    }),
    pageTitles: ["Home", "Gift Collections", "Bundles", "Trending", "Contact"],
    legacySlugs: ["veppo-accessories"],
  }),
  makeTemplate({
    name: "Kids World",
    slug: "kids-world",
    category: "Children",
    description: "A colorful kids and baby template with age categories, educational products, and safety callouts.",
    previewImage: "",
    previewUrl: "/template-preview/kids-world",
    recommendationKeywords: ["children", "kids", "baby", "toys", "education", "safety", "parents"],
    variants: [{ name: "Baby", keywords: ["baby", "nursery"] }, { name: "Toys", keywords: ["toys", "kids"] }],
    themeConfig: themeConfig({
      layout: "kids_world",
      header: "colorful",
      footer: "simple",
      card: "playful",
      colors: { primary: "#2563EB", secondary: "#16A34A", accent: "#FACC15", background: "#F8FAFC", text: "#0F172A", headerBg: "#FFFFFF", footerBg: "#0F172A", footerText: "#E2E8F0" },
      fonts: { heading: "Nunito", body: "Inter" },
      sections: [
        kidsHero,
        block("kids-age", "age_categories", { title: "Age Categories", subtitle: "Guide parents to the right products." }),
        block("kids-toys", "featured_toys", { title: "Featured Toys", subtitle: "Popular toys and educational picks.", limit: 8 }),
        block("kids-parents", "features", { title: "Parents Section", subtitle: "Why families can trust your store.", items: [] }),
        block("kids-safety", "trustBadges", { title: "Safety Highlights", subtitle: "Show trust and product safety details." }),
        block("kids-testimonials", "testimonials", { title: "Parent stories", bgColor: "surface", items: [] }),
      ],
    }),
    pageTitles: ["Home", "Age Categories", "Featured Toys", "Parents", "Safety", "Contact"],
    legacySlugs: ["lilnest", "jollys"],
  }),
  makeTemplate({
    name: "Business Services Pro",
    slug: "business-services-pro",
    category: "Services",
    description: "A proof-led services template for agencies, consultants, and professional firms.",
    previewImage: "",
    previewUrl: "/template-preview/business-services-pro",
    recommendationKeywords: ["services", "consulting", "agency", "business", "pricing", "case studies"],
    variants: [{ name: "Consulting", keywords: ["consulting", "strategy"] }, { name: "Agency", keywords: ["agency", "services"] }],
    themeConfig: themeConfig({
      layout: "business_services_pro",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#1D4ED8", secondary: "#111827", accent: "#22C55E", background: "#F9FAFB", text: "#111827", headerBg: "#FFFFFF", footerBg: "#111827", footerText: "#F9FAFB" },
      fonts: { heading: "Inter", body: "Inter" },
      sections: [
        servicesHero,
        block("services-offer", "service_cards", { title: "Services", subtitle: "Clear packages and outcomes.", items: [] }),
        block("services-case-studies", "case_studies", { title: "Case Studies", subtitle: "Show measurable results and proof." }),
        block("services-pricing", "stats", { title: "Pricing", subtitle: "Simple plans and starting prices." }),
        block("services-team", "team", { title: "Team", subtitle: "Introduce expertise and credentials.", members: [] }),
        block("services-testimonials", "testimonials", { title: "Testimonials", bgColor: "surface", items: [] }),
        block("services-contact", "contactForm", { title: "Contact", subtitle: "Lead capture and quote requests." }),
      ],
    }),
    pageTitles: ["Home", "Services", "Case Studies", "Pricing", "Team", "Contact"],
    legacySlugs: ["cluum", "fabulous"],
  }),
  makeTemplate({
    name: "Interior Studio",
    slug: "interior-studio",
    category: "Interior Design",
    description: "A portfolio-led studio template for projects, awards, team profiles, and services.",
    previewImage: "",
    previewUrl: "/template-preview/interior-studio",
    recommendationKeywords: ["interior", "architecture", "construction", "projects", "portfolio", "awards"],
    variants: [{ name: "Interior Design", keywords: ["interior", "design"] }, { name: "Architecture", keywords: ["architecture", "construction"] }],
    themeConfig: themeConfig({
      layout: "interior_studio",
      header: "editorial",
      footer: "minimal",
      card: "architectural",
      colors: { primary: "#334155", secondary: "#78716C", accent: "#CA8A04", background: "#FAFAF9", text: "#1C1917", headerBg: "#FFFFFF", footerBg: "#1C1917", footerText: "#E7E5E4" },
      fonts: { heading: "Montserrat", body: "Inter" },
      sections: [
        interiorHero,
        block("interior-projects", "projects", { title: "Projects", subtitle: "Selected work and case studies." }),
        block("interior-portfolio", "portfolio", { title: "Portfolio", subtitle: "A broader body of work and styling." }),
        block("interior-services", "service_cards", { title: "Services", subtitle: "Design, planning, and execution." }),
        block("interior-awards", "stats", { title: "Awards", subtitle: "Recognition, milestones, and accolades." }),
        block("interior-testimonials", "testimonials", { title: "Testimonials", bgColor: "surface", items: [] }),
        block("interior-team", "team", { title: "Team", subtitle: "Introduce designers and collaborators.", members: [] }),
      ],
    }),
    pageTitles: ["Home", "Projects", "Portfolio", "Services", "Awards", "Contact"],
    legacySlugs: ["fabulous-interior"],
  }),
  makeTemplate({
    name: "Commerce Pro",
    slug: "commerce-pro",
    category: "Business",
    description: "A universal ecommerce template for high-volume catalog browsing, flash sales, and reviews.",
    previewImage: "",
    previewUrl: "/template-preview/commerce-pro",
    recommendationKeywords: ["commerce", "ecommerce", "products", "collections", "flash sales", "reviews"],
    variants: [{ name: "Commerce", keywords: ["commerce", "ecommerce"] }, { name: "Catalog", keywords: ["products", "retail"] }],
    themeConfig: themeConfig({
      layout: "commerce_pro",
      header: "mega",
      footer: "rich",
      card: "modern",
      colors: { primary: "#0F766E", secondary: "#334155", accent: "#F97316", background: "#F8FAFC", text: "#0F172A", headerBg: "#FFFFFF", footerBg: "#0F172A", footerText: "#CBD5E1" },
      fonts: { heading: "Inter", body: "Inter" },
      sections: [
        commerceHero,
        block("commerce-collections", "collections", { title: "Collections", subtitle: "Multi-category browsing and deep discovery." }),
        block("commerce-featured", "featured_products", { title: "Featured Products", subtitle: "Best sellers and conversion products.", limit: 8, columns: 4, showFeatured: true }),
        block("commerce-flash", "banner", { title: "Flash Sales", subtitle: "Promotions and urgent offers." }),
        block("commerce-reviews", "testimonials", { title: "Reviews", bgColor: "surface", items: [] }),
        block("commerce-categories", "features", { title: "Multi-category Support", subtitle: "Shop by category and intent.", items: [] }),
        block("commerce-newsletter", "newsletter", { title: "Stay updated", subtitle: "Capture returning visitors and offers." }),
      ],
    }),
    pageTitles: ["Home", "Collections", "Featured Products", "Flash Sales", "Reviews", "Contact"],
  }),
];

export const TEMPLATE_FAMILY_PAGE_SETS: Record<string, string[]> = Object.fromEntries(
  TEMPLATE_FAMILIES.map((family) => [family.slug, family.pageTitles]),
);

export const TEMPLATE_FAMILY_ALIASES: Record<string, string> = Object.fromEntries(
  TEMPLATE_FAMILIES.flatMap((family) => (family.legacySlugs || []).map((slug) => [slug, family.slug] as const)),
);

export const TEMPLATE_CATEGORIES = Array.from(new Set(TEMPLATE_FAMILIES.map((family) => family.category))).sort();

export function getFamilyTemplateBySlug(slug: string) {
  const canonical = TEMPLATE_FAMILY_ALIASES[slug] || slug;
  return TEMPLATE_FAMILIES.find((family) => family.slug === canonical);
}

