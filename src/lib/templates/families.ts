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

/* ─── Landing Page Heroes ─────────────────────────────────── */

const landingArtsyHero = block("landing-artsy-hero", "hero", {
  badge: "Artsy Studio",
  heading: "Where creativity meets digital craft",
  subheading: "A bold, visual-first landing page for artists, designers, and creative studios. Full-screen hero slider, portfolio grid, and immersive storytelling.",
  buttonText: "View Portfolio",
  buttonHref: "#portfolio",
  secondaryButtonText: "Get in Touch",
  secondaryButtonHref: "#contact",
  bgStyle: "dark",
});

const landingScenicHero = block("landing-scenic-hero", "hero", {
  badge: "Scenic Experiences",
  heading: "Discover breathtaking experiences",
  subheading: "A cinematic, full-screen landing page for travel, hospitality, and lifestyle brands. Stunning imagery, smooth scrolling, and immersive galleries.",
  buttonText: "Explore Now",
  buttonHref: "#features",
  secondaryButtonText: "View Gallery",
  secondaryButtonHref: "#gallery",
  bgStyle: "accent",
});

const landingAgencyHero = block("landing-agency-hero", "hero", {
  badge: "Agency Growth",
  heading: "We build brands that convert",
  subheading: "A high-impact landing page for advertising agencies, design studios, and digital marketing firms. Results-driven layout with case studies and clear CTAs.",
  buttonText: "Our Services",
  buttonHref: "#services",
  secondaryButtonText: "See Results",
  secondaryButtonHref: "#case-studies",
  bgStyle: "dark",
});

const landingServiceHero = block("landing-service-hero", "hero", {
  badge: "SaaS Launch",
  heading: "The smarter way to manage your business",
  subheading: "A clean, conversion-optimized landing page for SaaS products, online services, and digital tools. Feature highlights, pricing tables, and trust signals.",
  buttonText: "Get Started",
  buttonHref: "#features",
  secondaryButtonText: "See Pricing",
  secondaryButtonHref: "#pricing",
  bgStyle: "light",
});

const landingEducationHero = block("landing-education-hero", "hero", {
  badge: "Education Pro",
  heading: "Start learning from leading experts today",
  subheading: "A structured landing page for online courses, training programs, and educational institutions. Course categories, instructor profiles, and enrollment CTAs.",
  buttonText: "Browse Courses",
  buttonHref: "#courses",
  secondaryButtonText: "Learn More",
  secondaryButtonHref: "#about",
  bgStyle: "accent",
});

const landingProductHero = block("landing-product-hero", "hero", {
  badge: "Business Impact",
  heading: "One product. Infinite possibilities.",
  subheading: "A focused, single-product landing page for launches, pre-orders, and direct-to-consumer brands. Video showcase, features breakdown, and strong conversion flow.",
  buttonText: "Buy Now",
  buttonHref: "#product",
  secondaryButtonText: "Watch Demo",
  secondaryButtonHref: "#video",
  bgStyle: "dark",
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

  /* ─── Landing Page Templates ─────────────────────────────── */

  makeTemplate({
    name: "Artsy Studio",
    slug: "landing-artsy",
    category: "Landing Page",
    description: "A bold, visual-first landing page for artists, designers, and creative studios with portfolio grids and immersive storytelling.",
    previewImage: "",
    previewUrl: "/template-preview/landing-artsy",
    recommendationKeywords: ["landing", "creative", "art", "portfolio", "design", "studio", "gallery", "artist"],
    variants: [{ name: "Creative Studio", keywords: ["creative", "studio", "design"] }, { name: "Artist Portfolio", keywords: ["art", "portfolio", "gallery"] }],
    themeConfig: themeConfig({
      layout: "landing_artsy",
      header: "minimal",
      footer: "minimal",
      card: "editorial",
      colors: { primary: "#1A1A2E", secondary: "#16213E", accent: "#E94560", background: "#0F0F0F", text: "#F5F5F5", headerBg: "#0F0F0F", footerBg: "#0F0F0F", footerText: "#A0A0A0" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      sections: [
        landingArtsyHero,
        block("artsy-about", "imageText", { title: "About the Studio", text: "We are a multidisciplinary creative studio specializing in branding, digital design, and visual storytelling. Every project is a canvas.", imagePosition: "right", buttonText: "Our Story", buttonHref: "#story" }),
        block("artsy-portfolio", "gallery", { title: "Selected Works", subtitle: "A curated showcase of our finest projects and creative collaborations.", columns: 3 }),
        block("artsy-services", "features", { title: "What We Do", subtitle: "From concept to execution — branding, web design, illustration, and beyond.", items: [
          { icon: "palette", title: "Branding & Identity", description: "Logos, visual systems, and brand guidelines that stand out." },
          { icon: "globe", title: "Web Design", description: "Responsive, immersive websites built for impact." },
          { icon: "eye", title: "Illustration", description: "Custom artwork and visual storytelling for any medium." },
          { icon: "sparkles", title: "Motion & Animation", description: "Dynamic visuals that bring your brand to life." },
        ] }),
        block("artsy-stats", "stats", { title: "By the Numbers", items: [
          { value: "150+", label: "Projects Completed" },
          { value: "40+", label: "Happy Clients" },
          { value: "12", label: "Awards Won" },
          { value: "8+", label: "Years Experience" },
        ] }),
        block("artsy-testimonials", "testimonials", { title: "Client Words", subtitle: "What our collaborators say about working with us.", bgColor: "surface", items: [
          { name: "Sarah Chen", role: "Creative Director, Bloom Agency", text: "Their artistry elevated our brand beyond what we imagined. Truly world-class work." },
          { name: "Marcus Rivera", role: "Founder, Drift Co.", text: "The attention to detail and creative vision made the entire experience exceptional." },
        ] }),
        block("artsy-cta", "banner", { title: "Ready to Create Something Beautiful?", subtitle: "Let's collaborate on your next project.", buttonText: "Start a Project", buttonHref: "#contact" }),
        block("artsy-contact", "contactForm", { title: "Get in Touch", subtitle: "Tell us about your vision. We'd love to hear from you." }),
      ],
    }),
    pageTitles: ["Home", "Portfolio", "Services", "About", "Contact"],
    legacySlugs: ["artsy"],
  }),

  makeTemplate({
    name: "Scenic Experiences",
    slug: "landing-scenic",
    category: "Landing Page",
    description: "A cinematic, full-screen landing page for travel, hospitality, events, and lifestyle brands with immersive galleries.",
    previewImage: "",
    previewUrl: "/template-preview/landing-scenic",
    recommendationKeywords: ["landing", "travel", "hospitality", "scenic", "tourism", "events", "lifestyle", "experience"],
    variants: [{ name: "Travel", keywords: ["travel", "tourism", "destination"] }, { name: "Events", keywords: ["events", "hospitality", "venue"] }],
    themeConfig: themeConfig({
      layout: "landing_scenic",
      header: "editorial",
      footer: "rich",
      card: "gallery",
      colors: { primary: "#2D5016", secondary: "#1B3A0A", accent: "#D4A853", background: "#FDFCF8", text: "#1C1917", headerBg: "#FFFFFF", footerBg: "#1B3A0A", footerText: "#E7E5E4" },
      fonts: { heading: "Cormorant Garamond", body: "Nunito" },
      sections: [
        landingScenicHero,
        block("scenic-features", "features", { title: "Why Choose Us", subtitle: "Unforgettable experiences crafted with attention to every detail.", items: [
          { icon: "star", title: "Curated Experiences", description: "Hand-picked destinations and activities for every traveler." },
          { icon: "shield", title: "Trusted & Safe", description: "Licensed guides, insured trips, and 24/7 support." },
          { icon: "heart", title: "Personal Touch", description: "Customized itineraries tailored to your preferences." },
          { icon: "award", title: "Award Winning", description: "Recognized for excellence in travel and hospitality." },
        ] }),
        block("scenic-gallery", "gallery", { title: "Explore Destinations", subtitle: "Breathtaking views from our most popular experiences.", columns: 3 }),
        block("scenic-imagetext", "imageText", { title: "Your Adventure Awaits", text: "Whether it's a mountain retreat, coastal escape, or urban exploration — we create moments that last a lifetime. Our expert team ensures every detail is perfect.", imagePosition: "left", buttonText: "Plan Your Trip", buttonHref: "#contact" }),
        block("scenic-stats", "stats", { title: "Our Journey", items: [
          { value: "500+", label: "Trips Organized" },
          { value: "50+", label: "Destinations" },
          { value: "10K+", label: "Happy Travelers" },
          { value: "4.9★", label: "Average Rating" },
        ] }),
        block("scenic-testimonials", "testimonials", { title: "Traveler Stories", subtitle: "Real experiences from our adventurers.", bgColor: "surface", items: [
          { name: "Emily Watson", role: "Solo Traveler", text: "The most magical trip I've ever taken. Every moment was thoughtfully planned." },
          { name: "James & Lisa Park", role: "Couple", text: "From the accommodations to the tours, everything exceeded our expectations." },
        ] }),
        block("scenic-brands", "brands", { title: "Featured In", items: [] }),
        block("scenic-newsletter", "newsletter", { title: "Get Inspired", subtitle: "Subscribe for travel tips, exclusive deals, and destination guides." }),
        block("scenic-contact", "contactForm", { title: "Book Your Experience", subtitle: "Tell us your dream trip and we'll make it happen." }),
      ],
    }),
    pageTitles: ["Home", "Destinations", "Experiences", "Gallery", "About", "Contact"],
    legacySlugs: ["scenic", "frolic"],
  }),

  makeTemplate({
    name: "Agency Growth",
    slug: "landing-agency",
    category: "Landing Page",
    description: "A high-impact landing page for advertising agencies, design studios, and digital marketing firms with case studies and conversion CTAs.",
    previewImage: "",
    previewUrl: "/template-preview/landing-agency",
    recommendationKeywords: ["landing", "agency", "advertising", "marketing", "digital", "branding", "design agency", "campaign"],
    variants: [{ name: "Digital Agency", keywords: ["digital", "marketing", "agency"] }, { name: "Design Studio", keywords: ["design", "branding", "creative"] }],
    themeConfig: themeConfig({
      layout: "landing_agency",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#4F46E5", secondary: "#1E1B4B", accent: "#06B6D4", background: "#FFFFFF", text: "#0F172A", headerBg: "#FFFFFF", footerBg: "#0F172A", footerText: "#CBD5E1" },
      fonts: { heading: "Inter", body: "Inter" },
      sections: [
        landingAgencyHero,
        block("agency-brands", "brands", { title: "Trusted By", items: [] }),
        block("agency-services", "features", { title: "Our Services", subtitle: "Full-stack digital solutions that drive measurable growth.", items: [
          { icon: "target", title: "Digital Marketing", description: "SEO, PPC, social media, and content strategies that convert." },
          { icon: "palette", title: "Brand Design", description: "Visual identity, packaging, and brand systems built to scale." },
          { icon: "globe", title: "Web Development", description: "Fast, responsive, and conversion-optimized websites." },
          { icon: "trending-up", title: "Growth Strategy", description: "Data-driven campaigns with clear ROI and reporting." },
          { icon: "message", title: "Content Creation", description: "Compelling copy, visuals, and videos for every channel." },
          { icon: "rocket", title: "Launch Campaigns", description: "End-to-end product and brand launch execution." },
        ] }),
        block("agency-case-studies", "case_studies", { title: "Case Studies", subtitle: "Real results for real businesses.", items: [
          { icon: "trending-up", title: "E-commerce Brand — 340% Revenue Growth", description: "Rebuilt their digital presence and ad strategy, tripling revenue in 6 months." },
          { icon: "users", title: "SaaS Startup — 10K Users in 90 Days", description: "Launch campaign combining paid acquisition, content, and referral programs." },
          { icon: "award", title: "Retail Chain — Award-Winning Rebrand", description: "Complete brand overhaul across 50+ locations with unified digital experience." },
        ] }),
        block("agency-stats", "stats", { title: "Impact & Results", items: [
          { value: "200+", label: "Clients Served" },
          { value: "$50M+", label: "Revenue Generated" },
          { value: "98%", label: "Client Retention" },
          { value: "15+", label: "Industry Awards" },
        ] }),
        block("agency-process", "features", { title: "Our Process", subtitle: "How we turn ideas into results.", items: [
          { icon: "target", title: "1. Discovery", description: "Deep dive into your brand, market, and objectives." },
          { icon: "palette", title: "2. Strategy", description: "Custom roadmap with clear milestones and KPIs." },
          { icon: "rocket", title: "3. Execute", description: "Launch campaigns with precision and creative excellence." },
          { icon: "trending-up", title: "4. Optimize", description: "Continuous improvement driven by analytics and testing." },
        ] }),
        block("agency-testimonials", "testimonials", { title: "Client Testimonials", bgColor: "surface", items: [
          { name: "David Chen", role: "CEO, TechFlow", text: "They don't just deliver work — they deliver results. Our best agency partnership by far." },
          { name: "Amanda Torres", role: "CMO, GreenLeaf", text: "Strategic, creative, and always ahead of the curve. Couldn't recommend them more." },
        ] }),
        block("agency-cta", "banner", { title: "Ready to Grow Your Brand?", subtitle: "Book a free strategy call and let's discuss your goals.", buttonText: "Book a Call", buttonHref: "#contact" }),
        block("agency-contact", "contactForm", { title: "Start a Conversation", subtitle: "Tell us about your project and goals. We'll respond within 24 hours." }),
      ],
    }),
    pageTitles: ["Home", "Services", "Case Studies", "Process", "About", "Contact"],
    legacySlugs: ["designpro", "dilabs"],
  }),

  makeTemplate({
    name: "SaaS Launch",
    slug: "landing-service",
    category: "Landing Page",
    description: "A clean, conversion-optimized landing page for SaaS products, online services, and digital tools with feature highlights and pricing.",
    previewImage: "",
    previewUrl: "/template-preview/landing-service",
    recommendationKeywords: ["landing", "saas", "service", "app", "software", "tool", "online service", "subscription", "platform"],
    variants: [{ name: "SaaS", keywords: ["saas", "software", "app"] }, { name: "Online Service", keywords: ["service", "platform", "tool"] }],
    themeConfig: themeConfig({
      layout: "landing_service",
      header: "minimal",
      footer: "simple",
      card: "modern",
      colors: { primary: "#7C3AED", secondary: "#1E1B4B", accent: "#10B981", background: "#FAFAFE", text: "#111827", headerBg: "#FFFFFF", footerBg: "#111827", footerText: "#D1D5DB" },
      fonts: { heading: "Inter", body: "Inter" },
      sections: [
        landingServiceHero,
        block("service-brands", "brands", { title: "Trusted By Teams At", items: [] }),
        block("service-features", "features", { title: "Everything You Need", subtitle: "Powerful features to streamline your workflow and boost productivity.", items: [
          { icon: "zap", title: "Lightning Fast", description: "Built for speed. Load times under 100ms with global edge deployment." },
          { icon: "shield", title: "Enterprise Security", description: "SOC2 compliant, end-to-end encryption, and role-based access control." },
          { icon: "refresh", title: "Real-time Sync", description: "Changes propagate instantly across all devices and team members." },
          { icon: "sparkles", title: "AI-Powered", description: "Smart automation and suggestions that save hours of manual work." },
          { icon: "users", title: "Team Collaboration", description: "Built-in chat, comments, and real-time co-editing for teams." },
          { icon: "trending-up", title: "Advanced Analytics", description: "Deep insights and custom dashboards to track what matters." },
        ] }),
        block("service-imagetext", "imageText", { title: "How It Works", text: "Get started in minutes. Connect your existing tools, invite your team, and let our platform handle the rest. No complex setup. No learning curve. Just results.", imagePosition: "right", buttonText: "Try It Free", buttonHref: "#pricing" }),
        block("service-video", "video", { title: "See It in Action", subtitle: "Watch a 2-minute overview of how our platform transforms your workflow." }),
        block("service-stats", "stats", { title: "Built for Scale", items: [
          { value: "99.9%", label: "Uptime SLA" },
          { value: "50K+", label: "Active Users" },
          { value: "2M+", label: "Tasks Completed" },
          { value: "150+", label: "Integrations" },
        ] }),
        block("service-pricing", "features", { title: "Simple, Transparent Pricing", subtitle: "No hidden fees. No surprises. Start free and scale as you grow.", items: [
          { icon: "check", title: "Starter — Free", description: "Up to 3 users, 1GB storage, core features. Perfect for individuals." },
          { icon: "star", title: "Pro — $29/mo", description: "Unlimited users, 50GB storage, advanced analytics, priority support." },
          { icon: "rocket", title: "Enterprise — Custom", description: "Custom limits, SSO, dedicated support, SLA guarantees." },
        ] }),
        block("service-testimonials", "testimonials", { title: "Loved by Teams", subtitle: "Join thousands of teams already using our platform.", bgColor: "surface", items: [
          { name: "Rachel Kim", role: "Product Lead, Stripe", text: "This tool has completely changed how our team collaborates. We shipped 3x faster." },
          { name: "Tom Nguyen", role: "CTO, Buildify", text: "The best developer experience I've seen. Setup took 5 minutes, and it just works." },
        ] }),
        block("service-faq", "faq", { title: "Frequently Asked Questions", items: [
          { question: "Is there a free trial?", answer: "Yes! Our Starter plan is free forever. No credit card required." },
          { question: "Can I cancel anytime?", answer: "Absolutely. No contracts, no cancellation fees. You can downgrade or cancel at any time." },
          { question: "Do you offer custom integrations?", answer: "Yes, our Enterprise plan includes custom API integrations and dedicated engineering support." },
          { question: "How secure is my data?", answer: "We use end-to-end encryption, SOC2 compliance, and regular security audits to protect your data." },
        ] }),
        block("service-cta", "banner", { title: "Start Building Today", subtitle: "Join 50,000+ teams already using our platform. Free forever.", buttonText: "Get Started Free", buttonHref: "#signup" }),
      ],
    }),
    pageTitles: ["Home", "Features", "Pricing", "FAQ", "Contact"],
    legacySlugs: ["corba"],
  }),

  makeTemplate({
    name: "Education Pro",
    slug: "landing-education",
    category: "Landing Page",
    description: "A structured landing page for online courses, training programs, and educational institutions with course categories and instructor profiles.",
    previewImage: "",
    previewUrl: "/template-preview/landing-education",
    recommendationKeywords: ["landing", "education", "courses", "learning", "school", "training", "academy", "university", "instructor"],
    variants: [{ name: "Online Courses", keywords: ["courses", "online learning", "e-learning"] }, { name: "Academy", keywords: ["academy", "school", "training"] }],
    themeConfig: themeConfig({
      layout: "landing_education",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#1D4ED8", secondary: "#1E3A5F", accent: "#F59E0B", background: "#FFFFFF", text: "#111827", headerBg: "#FFFFFF", footerBg: "#1E3A5F", footerText: "#E2E8F0" },
      fonts: { heading: "Nunito", body: "Inter" },
      sections: [
        landingEducationHero,
        block("education-stats", "stats", { title: "Platform at a Glance", items: [
          { value: "5,000+", label: "Online Courses" },
          { value: "200+", label: "Expert Instructors" },
          { value: "50K+", label: "Students Enrolled" },
          { value: "4.8★", label: "Average Rating" },
        ] }),
        block("education-categories", "features", { title: "Popular Categories", subtitle: "Explore courses across top disciplines and career paths.", items: [
          { icon: "globe", title: "Web Development", description: "HTML, CSS, JavaScript, React, Node.js, and full-stack skills." },
          { icon: "palette", title: "Design & Creative", description: "UI/UX, graphic design, motion graphics, and Figma mastery." },
          { icon: "trending-up", title: "Business & Marketing", description: "Digital marketing, SEO, analytics, and business strategy." },
          { icon: "shield", title: "Cybersecurity", description: "Ethical hacking, network security, and compliance frameworks." },
          { icon: "sparkles", title: "AI & Data Science", description: "Machine learning, Python, data analysis, and AI tools." },
          { icon: "users", title: "Leadership", description: "Management, communication, team building, and career growth." },
        ] }),
        block("education-featured", "features", { title: "Featured Courses", subtitle: "Our most popular programs chosen by students worldwide.", items: [
          { icon: "rocket", title: "Complete Web Developer Bootcamp", description: "From zero to job-ready in 12 weeks. HTML, CSS, JS, React, and Node.js." },
          { icon: "palette", title: "UI/UX Design Masterclass", description: "Design thinking, wireframing, prototyping, and portfolio building." },
          { icon: "trending-up", title: "Digital Marketing Pro", description: "SEO, Google Ads, social media, email marketing, and analytics." },
        ] }),
        block("education-imagetext", "imageText", { title: "Learn From Industry Experts", text: "Our instructors are working professionals from top companies like Google, Microsoft, and Amazon. Get real-world knowledge, not just theory. Every course includes hands-on projects, mentorship, and lifetime access.", imagePosition: "left", buttonText: "Meet Instructors", buttonHref: "#instructors" }),
        block("education-offer", "banner", { title: "🎓 20% Off All Courses — Limited Time!", subtitle: "Enroll today and get instant access to premium learning materials.", buttonText: "Claim Offer", buttonHref: "#enroll" }),
        block("education-instructors", "team", { title: "Top Instructors", subtitle: "Learn from the best minds in the industry.", members: [
          { name: "Dr. Amara Obi", role: "AI & Machine Learning", bio: "Former Google AI researcher with 15+ years of industry experience." },
          { name: "Carlos Mendez", role: "Web Development", bio: "Full-stack engineer and author of 3 bestselling coding courses." },
          { name: "Lisa Thompson", role: "UX Design", bio: "Lead designer at Meta, specializing in accessible design systems." },
        ] }),
        block("education-testimonials", "testimonials", { title: "What Students Say", subtitle: "Real reviews from our learning community.", bgColor: "surface", items: [
          { name: "Priya Sharma", role: "Junior Developer", text: "This platform changed my career. I went from zero coding experience to a full-time dev job in 6 months." },
          { name: "Michael Brooks", role: "Marketing Manager", text: "The digital marketing course was incredibly practical. I applied what I learned immediately at work." },
        ] }),
        block("education-faq", "faq", { title: "Frequently Asked Questions", items: [
          { question: "Do I get a certificate?", answer: "Yes! Every course includes a verified certificate of completion you can share on LinkedIn." },
          { question: "Are courses self-paced?", answer: "Absolutely. Learn on your schedule with lifetime access to all course materials." },
          { question: "Can I get a refund?", answer: "Yes, we offer a 30-day money-back guarantee on all courses, no questions asked." },
          { question: "Is there mentorship available?", answer: "Pro and Enterprise plans include 1-on-1 mentorship with industry professionals." },
        ] }),
        block("education-newsletter", "newsletter", { title: "Stay Updated", subtitle: "Get notified about new courses, free workshops, and exclusive offers." }),
        block("education-contact", "contactForm", { title: "Contact Us", subtitle: "Have questions? Our admissions team is here to help." }),
      ],
    }),
    pageTitles: ["Home", "Courses", "Categories", "Instructors", "FAQ", "Contact"],
    legacySlugs: ["educavo"],
  }),

  makeTemplate({
    name: "Business Impact",
    slug: "landing-product",
    category: "Landing Page",
    description: "A focused single-product landing page for launches, pre-orders, and DTC brands with video showcase and strong conversion flow.",
    previewImage: "",
    previewUrl: "/template-preview/landing-product",
    recommendationKeywords: ["landing", "product", "launch", "pre-order", "dtc", "direct to consumer", "single product", "crowdfunding"],
    variants: [{ name: "Product Launch", keywords: ["launch", "product", "pre-order"] }, { name: "DTC Brand", keywords: ["dtc", "brand", "direct"] }],
    themeConfig: themeConfig({
      layout: "landing_product",
      header: "centered",
      footer: "minimal",
      card: "product-focus",
      colors: { primary: "#0F172A", secondary: "#334155", accent: "#F97316", background: "#FFFFFF", text: "#0F172A", headerBg: "#FFFFFF", footerBg: "#0F172A", footerText: "#94A3B8" },
      fonts: { heading: "Inter", body: "Inter" },
      sections: [
        landingProductHero,
        block("product-brands", "brands", { title: "As Seen In", items: [] }),
        block("product-imagetext", "imageText", { title: "Designed for Real Life", text: "Every detail has been obsessively refined. Premium materials, precision engineering, and thoughtful design that fits seamlessly into your daily routine. This isn't just a product — it's a statement.", imagePosition: "right", buttonText: "Learn More", buttonHref: "#features" }),
        block("product-video", "video", { title: "Watch It in Action", subtitle: "See how it works in a quick 60-second demo." }),
        block("product-features", "features", { title: "Why It's Different", subtitle: "Built from the ground up to solve real problems.", items: [
          { icon: "zap", title: "10x Faster", description: "Revolutionary engineering delivers performance that blows the competition away." },
          { icon: "shield", title: "Built to Last", description: "Premium materials and rigorous testing ensure years of reliable use." },
          { icon: "heart", title: "Thoughtfully Designed", description: "Every curve, texture, and interaction has been refined for delight." },
          { icon: "package", title: "All-in-One", description: "Everything you need in the box. No extras required." },
        ] }),
        block("product-stats", "stats", { title: "The Numbers Speak", items: [
          { value: "50K+", label: "Units Sold" },
          { value: "4.9★", label: "Customer Rating" },
          { value: "2 min", label: "Setup Time" },
          { value: "3 yr", label: "Warranty" },
        ] }),
        block("product-testimonials", "testimonials", { title: "What People Are Saying", bgColor: "surface", items: [
          { name: "Alex Rivera", role: "Verified Buyer", text: "Honestly blown away. This is the quality I've been looking for. Already bought two more as gifts." },
          { name: "Jordan Lee", role: "Tech Reviewer", text: "Best in class. Period. Nothing else comes close at this price point." },
        ] }),
        block("product-countdown", "countdown", { title: "Pre-order Ends Soon", subtitle: "Lock in the early bird price before it's gone.", targetDate: "" }),
        block("product-faq", "faq", { title: "Questions? We've Got Answers.", items: [
          { question: "When will it ship?", answer: "Orders placed now ship within 5-7 business days." },
          { question: "Is there a warranty?", answer: "Yes — every unit comes with a 3-year manufacturer warranty." },
          { question: "Can I return it?", answer: "Absolutely. 30-day no-questions-asked return policy." },
          { question: "Do you ship internationally?", answer: "Yes! We ship to 50+ countries with tracked delivery." },
        ] }),
        block("product-cta", "banner", { title: "Don't Miss Out", subtitle: "Limited first-run batch. Order now and be among the first.", buttonText: "Order Now", buttonHref: "#buy" }),
      ],
    }),
    pageTitles: ["Home", "Features", "Reviews", "FAQ"],
    legacySlugs: ["product-launch"],
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

