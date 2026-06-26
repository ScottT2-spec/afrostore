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

/* ─── Business Website Heroes ─────────────────────────────── */

const clarityHero = block("clarity-hero", "hero", {
  badge: "Digital Agency",
  heading: "Transform Your Digital Presence",
  subheading: "We create innovative digital solutions that drive growth and elevate your brand. From web development to digital marketing, we're your partners in digital transformation.",
  buttonText: "Get Started",
  buttonHref: "#about",
  secondaryButtonText: "Our Work",
  secondaryButtonHref: "#portfolio",
  bgStyle: "light",
});

const arshaHero = block("arsha-hero", "hero", {
  badge: "Business Solutions",
  heading: "Better Solutions For Your Business",
  subheading: "We are team of talented designers making websites with Bootstrap",
  buttonText: "Get Started",
  buttonHref: "#about",
  secondaryButtonText: "Watch Video",
  secondaryButtonHref: "#video",
  bgStyle: "dark",
});

const medicareHero = block("medicare-hero", "hero", {
  badge: "Accredited Medical Network",
  heading: "Quality Healthcare, Centered Around Every Patient",
  subheading: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia. Delivering precision medicine through evidence-based protocols and compassionate care.",
  buttonText: "Schedule a Visit",
  buttonHref: "#contact",
  secondaryButtonText: "Watch Our Story",
  secondaryButtonHref: "#video",
  bgStyle: "accent",
});

const travelyHero = block("travely-hero", "hero", {
  badge: "Travel & Adventure",
  heading: "Discover the World's Most Beautiful Places",
  subheading: "Explore breathtaking destinations with curated travel experiences. From mountain retreats to coastal escapes, your adventure starts here.",
  buttonText: "Explore Destinations",
  buttonHref: "#destinations",
  secondaryButtonText: "Plan Your Trip",
  secondaryButtonHref: "#contact",
  bgStyle: "dark",
});

const lawyerHero = block("lawyer-hero", "hero", {
  badge: "Law & Justice",
  heading: "Trusted Legal Counsel for Every Challenge",
  subheading: "Experienced attorneys providing expert legal representation in corporate law, litigation, real estate, and family matters. Your rights, our priority.",
  buttonText: "Free Consultation",
  buttonHref: "#contact",
  secondaryButtonText: "Our Practice Areas",
  secondaryButtonHref: "#services",
  bgStyle: "dark",
});

const corporateHero = block("corporate-hero", "hero", {
  badge: "Corporate Solutions",
  heading: "Innovative Business Strategies for Growth",
  subheading: "We help businesses scale with data-driven strategies, operational excellence, and transformative consulting. Partner with us to achieve measurable results.",
  buttonText: "Get Started",
  buttonHref: "#services",
  secondaryButtonText: "Learn More",
  secondaryButtonHref: "#about",
  bgStyle: "dark",
});

const realEstateHero = block("realestate-hero", "hero", {
  badge: "Real Estate",
  heading: "Find Your Dream Property",
  subheading: "Browse premium listings in the most sought-after locations. Whether buying, selling, or renting, our expert agents guide you every step of the way.",
  buttonText: "Browse Properties",
  buttonHref: "#portfolio",
  secondaryButtonText: "Contact an Agent",
  secondaryButtonHref: "#contact",
  bgStyle: "accent",
});

const bistroHero = block("bistro-hero", "hero", {
  badge: "Fine Dining",
  heading: "Welcome to Bistro",
  subheading: "Discover the charm of Bistro, an authentic restaurant offering exceptional cuisine in every bite. Indulge in traditional dishes crafted with care, complemented by warm hospitality and a cozy ambiance.",
  buttonText: "View Menu",
  buttonHref: "#menu",
  secondaryButtonText: "View on Map",
  secondaryButtonHref: "#contact",
  bgStyle: "dark",
});

const nutrioHero = block("nutrio-hero", "hero", {
  badge: "Healthy Eating",
  heading: "Eat Healthy with Nutrio Restaurant",
  subheading: "Fresh, nutritious meals made with locally sourced ingredients. Experience the perfect blend of taste and wellness in every dish we serve.",
  buttonText: "Order Online",
  buttonHref: "#menu",
  secondaryButtonText: "View on Map",
  secondaryButtonHref: "#contact",
  bgStyle: "accent",
});

const educationHero = block("melody-edu-hero", "hero", {
  badge: "Education Academy",
  heading: "Start Learning From Leading Experts Today",
  subheading: "Unlock your potential with world-class courses taught by industry professionals. From technology to arts, find the perfect program to advance your career.",
  buttonText: "Browse Courses",
  buttonHref: "#courses",
  secondaryButtonText: "Learn More",
  secondaryButtonHref: "#about",
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
  /* ─── Business Website Templates ─────────────────────────── */

  // Based on: https://bootstrapmade.com/demo/Clarity/
  makeTemplate({
    name: "Clarity",
    slug: "clarity",
    category: "Business",
    description: "A modern digital agency template with hero stats, services grid, portfolio showcase, team profiles, and contact form. Clean design with Poppins/Quicksand typography.",
    previewImage: "",
    previewUrl: "/template-preview/clarity",
    recommendationKeywords: ["agency", "digital", "business", "corporate", "services", "portfolio", "simple", "modern"],
    variants: [{ name: "Digital Agency", keywords: ["agency", "digital", "marketing"] }, { name: "Business", keywords: ["business", "corporate", "company"] }],
    themeConfig: themeConfig({
      layout: "clarity",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#3B82F6", secondary: "#1E40AF", accent: "#10B981", background: "#FFFFFF", text: "#1F2937", headerBg: "#FFFFFF", footerBg: "#111827", footerText: "#D1D5DB" },
      fonts: { heading: "Poppins", body: "Quicksand" },
      sections: [
        clarityHero,
        block("clarity-stats", "stats", { title: "Our Impact", items: [
          { value: "150+", label: "Projects Completed" },
          { value: "95%", label: "Client Satisfaction" },
          { value: "24", label: "Team Members" },
          { value: "20+", label: "Years of Expertise" },
        ] }),
        block("clarity-about", "imageText", { title: "Innovative Solutions for a Digital-First World", text: "We deliver innovative digital solutions that drive growth and elevate your brand. Our team of experts specializes in web development, UI/UX design, digital marketing, and brand strategy. With over 20 years of experience and 500+ happy clients, we're your trusted partners in digital transformation.", imagePosition: "right", buttonText: "Discover More", buttonHref: "#services" }),
        block("clarity-services", "features", { title: "Services", subtitle: "Comprehensive digital solutions tailored to your business needs", items: [
          { icon: "palette", title: "Brand Identity Design", description: "Complete visual identity systems including logos, brand guidelines, and marketing collateral." },
          { icon: "eye", title: "UI/UX Design", description: "User-centered interface design that creates intuitive and delightful digital experiences." },
          { icon: "globe", title: "Web Development", description: "Full-stack web development with modern frameworks, responsive design, and optimized performance." },
          { icon: "phone", title: "Mobile App Design", description: "Native and cross-platform mobile application design with seamless user experiences." },
          { icon: "target", title: "Digital Marketing", description: "Data-driven marketing strategies including SEO, PPC, social media, and content marketing." },
          { icon: "trending-up", title: "SEO Optimization", description: "Technical and content SEO strategies to improve search rankings and drive organic traffic." },
        ] }),
        block("clarity-cta", "banner", { title: "Ready to Transform Your Digital Presence?", subtitle: "Let's discuss your project and create something amazing together", buttonText: "Get Started Today", buttonHref: "#contact" }),
        block("clarity-portfolio", "gallery", { title: "Portfolio", subtitle: "Our latest work across web design, mobile apps, branding, and UI/UX", columns: 3 }),
        block("clarity-team", "team", { title: "Our Team", subtitle: "Meet the talented people behind our success", members: [
          { name: "Walter White", role: "Chief Executive Officer", bio: "Strategic leader with 15+ years in digital transformation." },
          { name: "Sarah Jhonson", role: "Product Manager", bio: "Expert in agile methodologies and product lifecycle management." },
          { name: "William Anderson", role: "CTO", bio: "Full-stack architect specializing in scalable cloud solutions." },
        ] }),
        block("clarity-testimonials", "testimonials", { title: "What Our Clients Say", subtitle: "Hear from the businesses we've helped transform", bgColor: "surface", items: [
          { name: "Saul Goodman", role: "CEO, Goodman Corp", text: "The team delivered exceptional results. Our digital presence has completely transformed and we've seen a 200% increase in online engagement." },
          { name: "Sara Wilsson", role: "Designer, Roma Inc", text: "Professional, creative, and always on time. They understood our vision perfectly and brought it to life beautifully." },
          { name: "Jena Karlis", role: "Owner, Flavor Studio", text: "Outstanding work on our brand identity. The attention to detail and creative direction exceeded our expectations." },
        ] }),
        block("clarity-contact", "contactForm", { title: "Contact Us", subtitle: "Ready to start your project? Get in touch and let's make it happen." }),
        block("clarity-contactinfo", "contactInfo", { title: "Get In Touch", subtitle: "Visit us or reach out through any of these channels", items: [
          { icon: "map-pin", title: "Address", value: "123 Business Street, Suite 100, New York, NY 10001" },
          { icon: "phone", title: "Call Us", value: "+1 (555) 234-5678" },
          { icon: "mail", title: "Email Us", value: "info@clarity.com" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "About", "Services", "Portfolio", "Team", "Contact"],
    legacySlugs: ["business-services-pro", "cluum", "fabulous"],
  }),

  // Based on: https://bootstrapmade.com/demo/Arsha/
  makeTemplate({
    name: "Arsha",
    slug: "arsha",
    category: "Business",
    description: "A tech-focused business template with dark hero, client logos, about section, FAQ accordion, skills bars, services, pricing tables, and team grid.",
    previewImage: "",
    previewUrl: "/template-preview/arsha",
    recommendationKeywords: ["tech", "startup", "business", "saas", "software", "it", "solutions", "simple"],
    variants: [{ name: "Tech Business", keywords: ["tech", "software", "it"] }, { name: "Startup", keywords: ["startup", "saas", "solutions"] }],
    themeConfig: themeConfig({
      layout: "arsha",
      header: "professional",
      footer: "rich",
      card: "modern",
      colors: { primary: "#47B2E4", secondary: "#37517E", accent: "#47B2E4", background: "#F3F5FA", text: "#444444", headerBg: "#37517E", headerText: "#FFFFFF", footerBg: "#37517E", footerText: "#B2BECD" },
      fonts: { heading: "Poppins", body: "Inter" },
      sections: [
        arshaHero,
        block("arsha-brands", "brands", { title: "Trusted By", items: [] }),
        block("arsha-about", "imageText", { title: "About Us", text: "We provide innovative business solutions tailored to your needs. Our team of experts specializes in creating cutting-edge digital products and services that drive growth and efficiency. With a focus on quality and customer satisfaction, we've helped hundreds of businesses achieve their goals.", imagePosition: "right", buttonText: "Read More", buttonHref: "#services" }),
        block("arsha-faq", "faq", { title: "Frequently Asked Questions", items: [
          { question: "Non consectetur a erat nam at lectus urna duis?", answer: "Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non." },
          { question: "Feugiat scelerisque varius morbi enim nunc faucibus?", answer: "Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi. Id interdum velit laoreet id donec ultrices. Fringilla phasellus faucibus scelerisque eleifend donec pretium." },
          { question: "Dolor sit amet consectetur adipiscing elit pellentesque?", answer: "Eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Faucibus pulvinar elementum integer enim. Sem nulla pharetra diam sit amet nisl suscipit." },
        ] }),
        block("arsha-services", "features", { title: "Services", subtitle: "We provide a wide range of professional services", items: [
          { icon: "globe", title: "Web Design & Development", description: "Custom web solutions built with modern technologies. Responsive, fast, and optimized for conversions." },
          { icon: "trending-up", title: "Business Analytics", description: "Data-driven insights to help you make informed decisions and grow your business strategically." },
          { icon: "shield", title: "Cybersecurity Solutions", description: "Enterprise-grade security to protect your digital assets, data, and customer information." },
          { icon: "sparkles", title: "AI & Machine Learning", description: "Intelligent automation and predictive analytics to streamline operations and boost efficiency." },
          { icon: "rocket", title: "Cloud Infrastructure", description: "Scalable cloud architecture designed for performance, reliability, and cost optimization." },
          { icon: "phone", title: "Mobile Development", description: "Native and cross-platform mobile apps that deliver exceptional user experiences." },
        ] }),
        block("arsha-cta", "banner", { title: "Ready to Get Started?", subtitle: "Let's discuss how our solutions can help your business grow", buttonText: "Call to Action", buttonHref: "#contact" }),
        block("arsha-portfolio", "gallery", { title: "Portfolio", subtitle: "Check out our latest projects", columns: 3 }),
        block("arsha-team", "team", { title: "Our Team", subtitle: "Meet the experts behind our success", members: [
          { name: "Walter White", role: "Chief Executive Officer", bio: "Visionary leader driving business innovation and growth." },
          { name: "Sarah Jhonson", role: "Product Manager", bio: "Expert strategist with a passion for delivering results." },
          { name: "William Anderson", role: "CTO", bio: "Technology architect building scalable solutions." },
          { name: "Amanda Jepson", role: "Accountant", bio: "Financial expert ensuring business sustainability." },
        ] }),
        block("arsha-stats", "stats", { title: "Our Achievements", items: [
          { value: "232", label: "Happy Clients" },
          { value: "521", label: "Projects" },
          { value: "1,453", label: "Hours of Support" },
          { value: "32", label: "Hard Workers" },
        ] }),
        block("arsha-testimonials", "testimonials", { title: "Testimonials", bgColor: "surface", items: [
          { name: "Saul Goodman", role: "CEO & Founder", text: "Proin iaculis purus consequat sem cure digni ssim donec porttitam nulla quis turpis at commodo." },
          { name: "Sara Wilsson", role: "Designer", text: "Export tempor illum tamen malis malis eram quae irure esse labore quem cillum quid malis." },
          { name: "Jena Karlis", role: "Store Owner", text: "Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam." },
        ] }),
        block("arsha-contact", "contactForm", { title: "Contact Us", subtitle: "Get in touch with us for any inquiries or project discussions." }),
        block("arsha-contactinfo", "contactInfo", { title: "Our Location", items: [
          { icon: "map-pin", title: "Address", value: "A108 Adam Street, New York, NY 535022" },
          { icon: "phone", title: "Call Us", value: "+1 5589 55488 55" },
          { icon: "mail", title: "Email Us", value: "info@arsha.com" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "About", "Services", "Portfolio", "Team", "Contact"],
  }),

  // Based on: https://woodmart.xtemos.com/demo-lawyer/demo/lawyer/
  makeTemplate({
    name: "Lawyer Corporate",
    slug: "lawyer-corporate",
    category: "Business",
    description: "A prestigious law firm template with dark navy tones, practice areas, attorney profiles, case results, client testimonials, and consultation booking.",
    previewImage: "",
    previewUrl: "/template-preview/lawyer-corporate",
    recommendationKeywords: ["lawyer", "law firm", "attorney", "legal", "corporate", "justice", "counsel", "litigation"],
    variants: [{ name: "Law Firm", keywords: ["lawyer", "attorney", "legal"] }, { name: "Corporate", keywords: ["corporate", "business", "consulting"] }],
    themeConfig: themeConfig({
      layout: "lawyer_corporate",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#1B2A4A", secondary: "#C9A96E", accent: "#C9A96E", background: "#FFFFFF", text: "#1B2A4A", headerBg: "#1B2A4A", headerText: "#FFFFFF", footerBg: "#0F1A2E", footerText: "#94A3B8" },
      fonts: { heading: "Cormorant Garamond", body: "Inter" },
      sections: [
        lawyerHero,
        block("lawyer-stats", "stats", { title: "Why Choose Us", items: [
          { value: "25+", label: "Years of Experience" },
          { value: "5,000+", label: "Cases Won" },
          { value: "98%", label: "Success Rate" },
          { value: "150+", label: "Expert Attorneys" },
        ] }),
        block("lawyer-about", "imageText", { title: "A Legacy of Legal Excellence", text: "For over 25 years, our firm has been at the forefront of legal advocacy. We combine deep legal expertise with a client-first approach, ensuring every case receives the dedication and strategic thinking it deserves. Our attorneys are recognized leaders in their fields, committed to achieving the best possible outcomes.", imagePosition: "left", buttonText: "About Our Firm", buttonHref: "#team" }),
        block("lawyer-services", "features", { title: "Practice Areas", subtitle: "Comprehensive legal services across all major disciplines", items: [
          { icon: "shield", title: "Corporate Law", description: "Business formation, mergers & acquisitions, corporate governance, and regulatory compliance." },
          { icon: "users", title: "Family Law", description: "Divorce, custody, adoption, and prenuptial agreements handled with sensitivity and expertise." },
          { icon: "globe", title: "Real Estate Law", description: "Property transactions, zoning issues, landlord-tenant disputes, and commercial leasing." },
          { icon: "target", title: "Litigation", description: "Civil and commercial litigation, arbitration, and alternative dispute resolution." },
          { icon: "lock", title: "Criminal Defense", description: "Aggressive defense for misdemeanors, felonies, and white-collar criminal charges." },
          { icon: "trending-up", title: "Intellectual Property", description: "Patents, trademarks, copyrights, and trade secret protection for businesses." },
        ] }),
        block("lawyer-cases", "stats", { title: "Notable Case Results", items: [
          { value: "$12.5M", label: "Corporate Settlement" },
          { value: "$8.2M", label: "Personal Injury Verdict" },
          { value: "$5.1M", label: "Real Estate Recovery" },
          { value: "100%", label: "Criminal Defense Acquittals (2024)" },
        ] }),
        block("lawyer-team", "team", { title: "Our Attorneys", subtitle: "Meet the experienced legal professionals dedicated to your case", members: [
          { name: "Robert Mitchell", role: "Managing Partner — Corporate Law", bio: "Harvard Law graduate with 30+ years in corporate mergers and acquisitions." },
          { name: "Diana Lawson", role: "Senior Partner — Family Law", bio: "Compassionate advocate recognized as a Super Lawyer for 10 consecutive years." },
          { name: "James Hartfield", role: "Partner — Litigation", bio: "Former federal prosecutor with an exceptional trial record." },
          { name: "Elena Rodriguez", role: "Associate — Real Estate", bio: "Specialist in commercial property transactions and development law." },
        ] }),
        block("lawyer-testimonials", "testimonials", { title: "Client Testimonials", subtitle: "What our clients say about our legal representation", bgColor: "surface", items: [
          { name: "Michael Torres", role: "CEO, Torres Holdings", text: "Their corporate legal team guided us through a complex acquisition seamlessly. Professional, thorough, and always available." },
          { name: "Sandra Kim", role: "Small Business Owner", text: "I felt supported and informed throughout my entire case. They truly fight for their clients." },
          { name: "David Chen", role: "Real Estate Developer", text: "Exceptional real estate attorneys. They've handled all our transactions for the past decade without a single issue." },
        ] }),
        block("lawyer-cta", "banner", { title: "Need Legal Representation?", subtitle: "Schedule a free consultation with one of our experienced attorneys today.", buttonText: "Free Consultation", buttonHref: "#contact" }),
        block("lawyer-contact", "contactForm", { title: "Schedule a Consultation", subtitle: "Tell us about your legal matter and we'll connect you with the right attorney." }),
        block("lawyer-contactinfo", "contactInfo", { title: "Visit Our Office", items: [
          { icon: "map-pin", title: "Address", value: "One Liberty Plaza, Suite 4200, New York, NY 10006" },
          { icon: "phone", title: "Call Us", value: "+1 (212) 555-7890" },
          { icon: "mail", title: "Email", value: "contact@lawfirm.com" },
          { icon: "clock", title: "Office Hours", value: "Mon–Fri: 8:00 AM – 6:00 PM" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "Practice Areas", "Attorneys", "Case Results", "Testimonials", "Contact"],
  }),

  // Based on: https://woodmart.xtemos.com/demo-corporate-2/demo/corporate-2/
  makeTemplate({
    name: "Corporate Pro",
    slug: "corporate-pro",
    category: "Business",
    description: "A sleek corporate template with bold hero, branded service cards, team grid, statistics, client logos, and lead capture. Built for consulting and enterprise firms.",
    previewImage: "",
    previewUrl: "/template-preview/corporate-pro",
    recommendationKeywords: ["corporate", "enterprise", "consulting", "business", "strategy", "management", "firm"],
    variants: [{ name: "Consulting Firm", keywords: ["consulting", "strategy", "management"] }, { name: "Enterprise", keywords: ["enterprise", "corporate", "business"] }],
    themeConfig: themeConfig({
      layout: "corporate_pro",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#0D47A1", secondary: "#1A237E", accent: "#FF6F00", background: "#FAFAFA", text: "#212121", headerBg: "#FFFFFF", footerBg: "#0D1B2A", footerText: "#B0BEC5" },
      fonts: { heading: "Montserrat", body: "Inter" },
      sections: [
        corporateHero,
        block("corporate-brands", "brands", { title: "Trusted by Industry Leaders", items: [] }),
        block("corporate-about", "imageText", { title: "We Drive Business Transformation", text: "With a proven track record of delivering results across industries, our team of seasoned consultants combines strategic thinking with operational expertise. We partner with organizations to unlock growth, optimize processes, and build sustainable competitive advantages.", imagePosition: "right", buttonText: "About Our Firm", buttonHref: "#team" }),
        block("corporate-services", "features", { title: "Our Services", subtitle: "Strategic solutions designed to accelerate your business growth", items: [
          { icon: "trending-up", title: "Growth Strategy", description: "Market analysis, competitive positioning, and growth roadmaps for sustainable scaling." },
          { icon: "users", title: "Organizational Design", description: "Workforce optimization, culture transformation, and leadership development programs." },
          { icon: "globe", title: "Digital Transformation", description: "Technology roadmaps, system integration, and digital-first business model design." },
          { icon: "target", title: "Operations Excellence", description: "Process optimization, supply chain management, and lean operations implementation." },
          { icon: "shield", title: "Risk & Compliance", description: "Regulatory compliance, risk assessment, and governance framework development." },
          { icon: "sparkles", title: "Innovation Labs", description: "R&D strategy, product innovation, and emerging technology exploration." },
        ] }),
        block("corporate-stats", "stats", { title: "Our Track Record", items: [
          { value: "500+", label: "Clients Worldwide" },
          { value: "$2B+", label: "Revenue Impact" },
          { value: "95%", label: "Client Retention" },
          { value: "30+", label: "Countries Served" },
        ] }),
        block("corporate-case-studies", "features", { title: "Case Studies", subtitle: "Real results from our client engagements", items: [
          { icon: "trending-up", title: "Global Bank — 40% Cost Reduction", description: "Streamlined operations and implemented automation across 200+ branches, reducing operating costs by $180M annually." },
          { icon: "rocket", title: "Tech Startup — Series B to IPO", description: "Strategic advisory from Series B through successful IPO, achieving a $4.2B valuation." },
          { icon: "award", title: "Manufacturing — Industry 4.0", description: "Complete digital transformation of production lines, increasing efficiency by 60% and reducing waste by 35%." },
        ] }),
        block("corporate-team", "team", { title: "Leadership Team", subtitle: "Experienced professionals driving results across industries", members: [
          { name: "Victoria Hayes", role: "Managing Director", bio: "Former McKinsey partner with 25 years in strategic consulting." },
          { name: "Marcus Webb", role: "Head of Digital", bio: "Technology leader who has overseen 100+ digital transformations." },
          { name: "Katherine Blake", role: "Chief Strategy Officer", bio: "Specialist in market entry strategy and competitive positioning." },
          { name: "Richard Park", role: "Head of Operations", bio: "Expert in lean management and operational excellence." },
        ] }),
        block("corporate-testimonials", "testimonials", { title: "Client Testimonials", bgColor: "surface", items: [
          { name: "CEO, Fortune 500 Company", role: "Manufacturing", text: "They transformed our operations and delivered measurable results within the first quarter. A truly strategic partner." },
          { name: "CFO, Global Financial Services", role: "Banking", text: "Their analytical rigor and execution capability is unmatched. We've worked with them on three major initiatives." },
        ] }),
        block("corporate-cta", "banner", { title: "Let's Build Something Great Together", subtitle: "Partner with us to unlock your organization's full potential.", buttonText: "Schedule a Meeting", buttonHref: "#contact" }),
        block("corporate-contact", "contactForm", { title: "Get in Touch", subtitle: "Tell us about your business challenges and let's explore solutions together." }),
      ],
    }),
    pageTitles: ["Home", "About", "Services", "Case Studies", "Team", "Contact"],
  }),

  // Based on: https://woodmart.xtemos.com/demo-real-estate/demo/real-estate/
  makeTemplate({
    name: "Real Estate Pro",
    slug: "real-estate-pro",
    category: "Business",
    description: "A property-focused real estate template with property listings gallery, agent profiles, neighborhood guides, stats, and inquiry forms.",
    previewImage: "",
    previewUrl: "/template-preview/real-estate-pro",
    recommendationKeywords: ["real estate", "property", "housing", "homes", "apartments", "realty", "agent", "listings"],
    variants: [{ name: "Residential", keywords: ["homes", "housing", "residential"] }, { name: "Commercial", keywords: ["commercial", "property", "office"] }],
    themeConfig: themeConfig({
      layout: "real_estate_pro",
      header: "professional",
      footer: "rich",
      card: "gallery",
      colors: { primary: "#1A5632", secondary: "#0F3321", accent: "#D4A54A", background: "#FAFAF8", text: "#1C1917", headerBg: "#FFFFFF", footerBg: "#0F1F15", footerText: "#A8B5AD" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      sections: [
        realEstateHero,
        block("realestate-stats", "stats", { title: "Market Presence", items: [
          { value: "2,500+", label: "Properties Sold" },
          { value: "$850M+", label: "Total Sales Volume" },
          { value: "15+", label: "Years in Market" },
          { value: "98%", label: "Client Satisfaction" },
        ] }),
        block("realestate-featured", "gallery", { title: "Featured Properties", subtitle: "Explore our curated selection of premium listings", columns: 3 }),
        block("realestate-services", "features", { title: "Our Services", subtitle: "Full-service real estate solutions for buyers, sellers, and investors", items: [
          { icon: "globe", title: "Property Sales", description: "Expert guidance through every step of buying or selling your property." },
          { icon: "trending-up", title: "Investment Advisory", description: "Market analysis and investment strategy for maximum returns." },
          { icon: "eye", title: "Property Management", description: "Hassle-free property management for landlords and investors." },
          { icon: "target", title: "Market Valuations", description: "Accurate property valuations based on comprehensive market data." },
        ] }),
        block("realestate-about", "imageText", { title: "Your Trusted Real Estate Partner", text: "With deep knowledge of local markets and a commitment to exceptional service, our team of licensed agents helps you navigate the real estate journey with confidence. Whether you're a first-time buyer, seasoned investor, or looking to sell, we deliver results.", imagePosition: "left", buttonText: "Meet Our Agents", buttonHref: "#team" }),
        block("realestate-team", "team", { title: "Our Agents", subtitle: "Experienced professionals dedicated to finding your perfect property", members: [
          { name: "Jennifer Moore", role: "Principal Broker", bio: "Top-producing agent with $200M+ in career sales." },
          { name: "Daniel Foster", role: "Luxury Specialist", bio: "Expert in high-end residential and waterfront properties." },
          { name: "Maria Santos", role: "Commercial Agent", bio: "Specialist in commercial leasing and investment properties." },
        ] }),
        block("realestate-testimonials", "testimonials", { title: "Client Success Stories", bgColor: "surface", items: [
          { name: "The Martinez Family", role: "First-time Buyers", text: "They made our first home purchase stress-free. Found us the perfect home within our budget in just 3 weeks!" },
          { name: "Robert Chen", role: "Property Investor", text: "Outstanding investment advice. My portfolio has grown 40% since working with their team." },
          { name: "Sarah Williams", role: "Home Seller", text: "Sold our home 15% above asking price in just 5 days. Their marketing strategy was incredible." },
        ] }),
        block("realestate-cta", "banner", { title: "Ready to Find Your Dream Home?", subtitle: "Browse our listings or schedule a consultation with one of our expert agents.", buttonText: "Browse Properties", buttonHref: "#portfolio" }),
        block("realestate-contact", "contactForm", { title: "Contact an Agent", subtitle: "Tell us what you're looking for and we'll match you with the right agent." }),
        block("realestate-contactinfo", "contactInfo", { title: "Visit Our Office", items: [
          { icon: "map-pin", title: "Address", value: "500 Park Avenue, Suite 300, New York, NY 10022" },
          { icon: "phone", title: "Call Us", value: "+1 (212) 555-3456" },
          { icon: "mail", title: "Email", value: "info@realestatepro.com" },
          { icon: "clock", title: "Office Hours", value: "Mon–Sat: 9:00 AM – 7:00 PM" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "Properties", "Services", "Agents", "Testimonials", "Contact"],
  }),

  // Based on: https://bistro-rest.netlify.app/
  makeTemplate({
    name: "Bistro",
    slug: "bistro",
    category: "Business",
    description: "An elegant restaurant website with warm dark tones, hero welcome, featured dishes, menu showcase, reservation form, gallery, and map/contact section.",
    previewImage: "",
    previewUrl: "/template-preview/bistro",
    recommendationKeywords: ["restaurant", "bistro", "dining", "food", "cafe", "fine dining", "cuisine"],
    variants: [{ name: "Fine Dining", keywords: ["restaurant", "dining", "fine dining"] }, { name: "Bistro", keywords: ["bistro", "cafe", "cuisine"] }],
    themeConfig: themeConfig({
      layout: "bistro",
      header: "split",
      footer: "rich",
      card: "editorial",
      colors: { primary: "#C8A97E", secondary: "#1A1A1A", accent: "#C8A97E", background: "#0D0D0D", text: "#E5E5E5", headerBg: "#0D0D0D", headerText: "#C8A97E", footerBg: "#0A0A0A", footerText: "#888888" },
      fonts: { heading: "Cormorant Garamond", body: "Inter" },
      sections: [
        bistroHero,
        block("bistro-about", "imageText", { title: "Welcomes You", text: "Discover the charm of Bistro, an authentic restaurant offering exceptional cuisine in every bite. Indulge in traditional dishes crafted with care, complemented by warm hospitality and a cozy ambiance. From hearty stews to savory specialties, experience unforgettable flavors.", imagePosition: "right", buttonText: "View on Map", buttonHref: "#contact" }),
        block("bistro-specials", "features", { title: "Discover Authentic Flavours", subtitle: "Diners' favorites crafted with the finest ingredients", items: [
          { icon: "star", title: "Special Coffee", description: "Our signature blend, carefully roasted and brewed to perfection." },
          { icon: "heart", title: "Bacon and Eggs", description: "Classic breakfast elevated with farm-fresh ingredients and house seasonings." },
          { icon: "award", title: "Red Pastry", description: "Handmade pastry with seasonal berries and delicate cream filling." },
        ] }),
        block("bistro-menu", "features", { title: "Explore Our Menu", subtitle: "A curated selection of starters, mains, and desserts", items: [
          { icon: "star", title: "Starters", description: "Seasonal soups, artisan breads, and farm-fresh salads." },
          { icon: "heart", title: "Main Courses", description: "Grilled meats, fresh seafood, and vegetarian specialties." },
          { icon: "sparkles", title: "Desserts", description: "Homemade pastries, chocolate fondant, and seasonal fruit tarts." },
        ] }),
        block("bistro-offer", "banner", { title: "10% Off Every Wednesday", subtitle: "Join us mid-week for a special dining experience at a special price.", buttonText: "Reserve a Table", buttonHref: "#reservation" }),
        block("bistro-reservation", "contactForm", { title: "Reservation", subtitle: "Book your table for an unforgettable dining experience. To book call: +123 232 123" }),
        block("bistro-testimonials", "testimonials", { title: "What Our Diners Say", bgColor: "surface", items: [
          { name: "Trich B", role: "Regular Diner", text: "An absolutely wonderful dining experience. The ambiance is perfect and the food is consistently excellent." },
          { name: "Bára Müllerová", role: "Food Critic", text: "Bistro delivers authentic flavors with a modern twist. A must-visit for anyone who appreciates quality cuisine." },
          { name: "Matt Freeman", role: "Local Regular", text: "Our go-to restaurant for special occasions. The staff are warm, attentive, and truly passionate about food." },
        ] }),
        block("bistro-gallery", "gallery", { title: "Gallery", subtitle: "A glimpse into our kitchen, dining room, and culinary creations", columns: 3 }),
        block("bistro-contact", "contactInfo", { title: "On the Map", subtitle: "Find us and come experience Bistro in person", items: [
          { icon: "map-pin", title: "Location", value: "123 Gourmet Street, London, UK" },
          { icon: "phone", title: "Reservations", value: "+123 232 123" },
          { icon: "clock", title: "Opening Hours", value: "Tue–Sun: 12:00 PM – 11:00 PM" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "Menu", "Reservations", "Gallery", "Contact"],
  }),

  // Based on: https://nutrio-rest.netlify.app/
  makeTemplate({
    name: "Nutrio",
    slug: "nutrio",
    category: "Business",
    description: "A fresh, health-conscious restaurant website with green accents, hero with order CTA, featured dishes, menu categories, reservation system, testimonials, and map.",
    previewImage: "",
    previewUrl: "/template-preview/nutrio",
    recommendationKeywords: ["restaurant", "healthy", "nutrition", "organic", "food", "cafe", "vegan", "green"],
    variants: [{ name: "Healthy Restaurant", keywords: ["healthy", "nutrition", "organic"] }, { name: "Green Cafe", keywords: ["cafe", "vegan", "green"] }],
    themeConfig: themeConfig({
      layout: "nutrio",
      header: "soft",
      footer: "rich",
      card: "rounded-photo",
      colors: { primary: "#4CAF50", secondary: "#2E7D32", accent: "#FF9800", background: "#FEFEF9", text: "#1B2A1B", headerBg: "#FFFFFF", footerBg: "#1B3A1B", footerText: "#A5C9A5" },
      fonts: { heading: "Nunito", body: "Inter" },
      sections: [
        nutrioHero,
        block("nutrio-offer", "banner", { title: "10% Off Every Wednesday", subtitle: "Enjoy our healthy dishes at a special price every mid-week.", buttonText: "View on Map", buttonHref: "#contact" }),
        block("nutrio-specials", "features", { title: "Discover Authentic Healthy Flavours", subtitle: "Diners' favorites prepared with the freshest ingredients", items: [
          { icon: "star", title: "Special Chinese Coffee", description: "A unique fusion blend with aromatic spices and smooth finish." },
          { icon: "heart", title: "Bacon and Eggs", description: "Free-range eggs with turkey bacon and seasonal vegetables." },
          { icon: "award", title: "Red Pastry", description: "Wholesome pastry with organic berries and low-sugar cream." },
        ] }),
        block("nutrio-menu", "features", { title: "Explore Our Menu", subtitle: "Fresh, nutritious dishes for every palate", items: [
          { icon: "star", title: "Power Bowls", description: "Nutrient-dense grain bowls with fresh vegetables and lean proteins." },
          { icon: "heart", title: "Fresh Juices", description: "Cold-pressed juices and smoothies made with organic produce." },
          { icon: "sparkles", title: "Healthy Desserts", description: "Guilt-free treats made with natural sweeteners and whole ingredients." },
        ] }),
        block("nutrio-reservation", "contactForm", { title: "Book Your Table", subtitle: "Reserve your spot for a healthy dining experience. To book call: +123 232 123" }),
        block("nutrio-testimonials", "testimonials", { title: "What Our Diners Say", bgColor: "surface", items: [
          { name: "Trich B", role: "Health Enthusiast", text: "Finally a restaurant that makes healthy food taste incredible. My go-to spot for lunch every week!" },
          { name: "Bára Müllerová", role: "Nutritionist", text: "I recommend Nutrio to all my clients. Fresh ingredients, balanced portions, and amazing flavors." },
          { name: "Matt Freeman", role: "Regular", text: "The best healthy restaurant in town. My whole family loves eating here." },
        ] }),
        block("nutrio-contact", "contactInfo", { title: "On the Map", items: [
          { icon: "map-pin", title: "Location", value: "456 Green Lane, Dublin, Ireland" },
          { icon: "phone", title: "Reservations", value: "+123 232 123" },
          { icon: "clock", title: "Opening Hours", value: "Mon–Sun: 8:00 AM – 10:00 PM" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "Menu", "Reservations", "Testimonials", "Contact"],
  }),

  // Based on: https://bootstrapmade.com/demo/MediCare/
  makeTemplate({
    name: "MediCare",
    slug: "medicare",
    category: "Business",
    description: "A professional healthcare template with hero slider, emergency hotline card, department services, doctor profiles, patient statistics, testimonials, appointment booking, and FAQ.",
    previewImage: "",
    previewUrl: "/template-preview/medicare",
    recommendationKeywords: ["healthcare", "medical", "hospital", "clinic", "doctor", "health", "patient", "wellness"],
    variants: [{ name: "Hospital", keywords: ["hospital", "medical", "clinic"] }, { name: "Health Clinic", keywords: ["clinic", "doctor", "wellness"] }],
    themeConfig: themeConfig({
      layout: "medicare",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#2AA8E0", secondary: "#1A6FB0", accent: "#19C37D", background: "#FFFFFF", text: "#1A1A2E", headerBg: "#FFFFFF", footerBg: "#0D1B2A", footerText: "#8896AB" },
      fonts: { heading: "Poppins", body: "Inter" },
      sections: [
        medicareHero,
        block("medicare-metrics", "stats", { title: "Healthcare Excellence", items: [
          { value: "42+", label: "Years In Service" },
          { value: "210+", label: "Board-Certified Doctors" },
          { value: "32K+", label: "Treated Patients" },
          { value: "98%", label: "Satisfaction Rate" },
        ] }),
        block("medicare-about", "imageText", { title: "Redefining Modern Healthcare Standards", text: "Our patient-centered approach combines cutting-edge medical technology with compassionate care. Each treatment protocol is calibrated against individual medical history, lifestyle factors, and recovery goals. With advanced diagnostics, certified specialists, integrated recovery programs, and round-the-clock critical care, we deliver excellence at every touchpoint.", imagePosition: "left", buttonText: "Discover Our Services", buttonHref: "#services" }),
        block("medicare-services", "features", { title: "Medical Departments", subtitle: "Comprehensive healthcare services across all major specialties", items: [
          { icon: "heart", title: "Cardiology", description: "Advanced cardiac care including interventional procedures, diagnostics, and rehabilitation." },
          { icon: "eye", title: "Ophthalmology", description: "Complete eye care from routine exams to laser surgery and retinal treatments." },
          { icon: "sparkles", title: "Neurology", description: "Expert diagnosis and treatment of neurological disorders and brain conditions." },
          { icon: "shield", title: "Orthopedics", description: "Joint replacement, sports medicine, spine surgery, and physical therapy." },
          { icon: "users", title: "Pediatrics", description: "Specialized care for infants, children, and adolescents in a child-friendly environment." },
          { icon: "award", title: "Oncology", description: "Comprehensive cancer care with the latest treatments and supportive services." },
        ] }),
        block("medicare-team", "team", { title: "Our Doctors", subtitle: "Meet our team of board-certified medical professionals", members: [
          { name: "Dr. Sarah Mitchell", role: "Chief of Cardiology", bio: "20+ years in interventional cardiology with 5,000+ procedures performed." },
          { name: "Dr. James Chen", role: "Head of Neurology", bio: "Published researcher and expert in neurodegenerative disease treatment." },
          { name: "Dr. Maria Santos", role: "Pediatrics Director", bio: "Compassionate pediatrician with a focus on developmental health." },
          { name: "Dr. Robert Kim", role: "Orthopedic Surgeon", bio: "Fellowship-trained in sports medicine and minimally invasive surgery." },
        ] }),
        block("medicare-testimonials", "testimonials", { title: "Patient Stories", subtitle: "Real experiences from our patients and their families", bgColor: "surface", items: [
          { name: "Marisol Avery", role: "Verified Patient", text: "The team went above and beyond. Compassionate, attentive, and genuinely caring throughout every step of my recovery." },
          { name: "Thomas Wright", role: "Cardiac Patient", text: "From diagnosis to recovery, the cardiology team provided exceptional care. I'm stronger than ever." },
          { name: "Linda Park", role: "Parent", text: "The pediatrics department made my daughter feel safe and comfortable. The doctors are truly wonderful with children." },
        ] }),
        block("medicare-faq", "faq", { title: "Frequently Asked Questions", items: [
          { question: "Do I need a referral to see a specialist?", answer: "Most of our specialists accept direct appointments. However, some insurance plans may require a referral from your primary care physician." },
          { question: "What insurance plans do you accept?", answer: "We accept most major insurance providers including Medicare, Medicaid, and private insurance plans. Contact our billing department for specific coverage questions." },
          { question: "What are your visiting hours?", answer: "General visiting hours are 10:00 AM to 8:00 PM daily. ICU has restricted visiting hours. Please check with the specific department." },
          { question: "How do I access my medical records?", answer: "You can access your records through our online patient portal, or request copies from our medical records department." },
        ] }),
        block("medicare-cta", "banner", { title: "Your Health Is Our Priority", subtitle: "Schedule an appointment with one of our specialists today.", buttonText: "Book Appointment", buttonHref: "#contact" }),
        block("medicare-contact", "contactForm", { title: "Book an Appointment", subtitle: "Fill in your details and preferred department, and we'll get back to you within 24 hours." }),
        block("medicare-contactinfo", "contactInfo", { title: "Hospital Information", items: [
          { icon: "map-pin", title: "Address", value: "123 Medical Center Drive, Suite 500, New York, NY 10016" },
          { icon: "phone", title: "24/7 Emergency", value: "+1 (555) 482-7390" },
          { icon: "mail", title: "Email", value: "info@medicare-hospital.com" },
          { icon: "clock", title: "Hours", value: "Open 24/7 for emergencies | Clinics: Mon–Sat 8AM–6PM" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "About", "Departments", "Doctors", "FAQ", "Appointment", "Contact"],
  }),

  // Based on: https://bootstrapmade.com/demo/Travely/
  makeTemplate({
    name: "Travely",
    slug: "travely",
    category: "Business",
    description: "A cinematic, visual-heavy travel and tourism template with full-screen hero, destination gallery, tour packages, experience stats, traveler testimonials, and booking form.",
    previewImage: "",
    previewUrl: "/template-preview/travely",
    recommendationKeywords: ["travel", "tourism", "adventure", "destination", "tour", "vacation", "hospitality", "visual"],
    variants: [{ name: "Travel Agency", keywords: ["travel", "tourism", "vacation"] }, { name: "Adventure", keywords: ["adventure", "tours", "destination"] }],
    themeConfig: themeConfig({
      layout: "travely",
      header: "editorial",
      footer: "rich",
      card: "gallery",
      colors: { primary: "#E67E22", secondary: "#2C3E50", accent: "#27AE60", background: "#FFFFFF", text: "#2C3E50", headerBg: "transparent", headerText: "#FFFFFF", footerBg: "#1A252F", footerText: "#95A5A6" },
      fonts: { heading: "Playfair Display", body: "Nunito" },
      sections: [
        travelyHero,
        block("travely-stats", "stats", { title: "Why Travelers Choose Us", items: [
          { value: "500+", label: "Destinations" },
          { value: "10K+", label: "Happy Travelers" },
          { value: "4.9★", label: "Average Rating" },
          { value: "15+", label: "Years Experience" },
        ] }),
        block("travely-about", "imageText", { title: "Your Adventure Awaits", text: "Whether it's a mountain retreat, coastal escape, or urban exploration — we create moments that last a lifetime. Our expert travel consultants craft personalized itineraries tailored to your interests, budget, and travel style. From luxury resorts to off-the-beaten-path adventures, every trip is designed to be unforgettable.", imagePosition: "left", buttonText: "Plan Your Trip", buttonHref: "#contact" }),
        block("travely-destinations", "gallery", { title: "Popular Destinations", subtitle: "Explore breathtaking views from our most sought-after locations around the world", columns: 3 }),
        block("travely-services", "features", { title: "What We Offer", subtitle: "Curated experiences crafted with attention to every detail", items: [
          { icon: "star", title: "Curated Experiences", description: "Hand-picked destinations and activities for every type of traveler." },
          { icon: "shield", title: "Trusted & Safe", description: "Licensed guides, insured trips, and 24/7 on-ground support." },
          { icon: "heart", title: "Personal Touch", description: "Customized itineraries tailored to your unique preferences and style." },
          { icon: "award", title: "Award Winning", description: "Recognized for excellence in travel and hospitality services." },
          { icon: "globe", title: "Global Network", description: "Partnerships with top hotels, airlines, and local guides worldwide." },
          { icon: "users", title: "Group Packages", description: "Special rates and coordinated experiences for families and groups." },
        ] }),
        block("travely-packages", "features", { title: "Featured Packages", subtitle: "Our most popular travel experiences for every budget", items: [
          { icon: "globe", title: "European Discovery — 14 Days", description: "Paris, Rome, Barcelona, and Amsterdam. Includes flights, 4-star hotels, guided tours, and local experiences." },
          { icon: "star", title: "Tropical Paradise — 7 Days", description: "Bali or Maldives getaway with beachfront villa, spa treatments, snorkeling, and sunset dinners." },
          { icon: "rocket", title: "Adventure Trek — 10 Days", description: "Patagonia, Nepal, or Kilimanjaro. Professional guides, camping gear, and permits included." },
        ] }),
        block("travely-testimonials", "testimonials", { title: "Traveler Stories", subtitle: "Real experiences from our adventurers around the world", bgColor: "surface", items: [
          { name: "Emily Watson", role: "Solo Traveler", text: "The most magical trip I've ever taken. Every moment was thoughtfully planned and I felt safe the entire time." },
          { name: "James & Lisa Park", role: "Honeymoon Couple", text: "From the accommodations to the tours, everything exceeded our expectations. A truly unforgettable honeymoon." },
          { name: "The Robinson Family", role: "Family of 5", text: "Planning a family trip can be stressful, but they handled everything perfectly. The kids had the time of their lives!" },
        ] }),
        block("travely-newsletter", "newsletter", { title: "Get Travel Inspiration", subtitle: "Subscribe for exclusive deals, destination guides, and travel tips delivered to your inbox." }),
        block("travely-cta", "banner", { title: "Ready for Your Next Adventure?", subtitle: "Let us craft the perfect trip for you. Start planning today.", buttonText: "Book Your Trip", buttonHref: "#contact" }),
        block("travely-contact", "contactForm", { title: "Plan Your Trip", subtitle: "Tell us your dream destination and travel dates. We'll create a custom itinerary just for you." }),
        block("travely-contactinfo", "contactInfo", { title: "Visit Us", items: [
          { icon: "map-pin", title: "Office", value: "200 Travel Plaza, Suite 800, Los Angeles, CA 90001" },
          { icon: "phone", title: "Call Us", value: "+1 (800) 555-TRAVEL" },
          { icon: "mail", title: "Email", value: "hello@travely.com" },
          { icon: "clock", title: "Hours", value: "Mon–Fri: 9AM–7PM | Sat: 10AM–4PM" },
        ] }),
      ],
    }),
    pageTitles: ["Home", "Destinations", "Packages", "About", "Testimonials", "Contact"],
  }),

  // Based on: https://melody-html.ancorathemes.com/?storefront=envato-elements
  makeTemplate({
    name: "Melody Education",
    slug: "melody-education",
    category: "Business",
    description: "A vibrant education platform template with course categories, instructor profiles, enrollment stats, student testimonials, pricing tiers, FAQ, and newsletter signup.",
    previewImage: "",
    previewUrl: "/template-preview/melody-education",
    recommendationKeywords: ["education", "courses", "learning", "school", "academy", "training", "university", "online learning"],
    variants: [{ name: "Online Academy", keywords: ["courses", "online learning", "academy"] }, { name: "School", keywords: ["school", "education", "training"] }],
    themeConfig: themeConfig({
      layout: "melody_education",
      header: "professional",
      footer: "rich",
      card: "clean",
      colors: { primary: "#6C63FF", secondary: "#3F3D56", accent: "#FF6584", background: "#FFFFFF", text: "#1A1A2E", headerBg: "#FFFFFF", footerBg: "#1A1A2E", footerText: "#9CA3AF" },
      fonts: { heading: "Nunito", body: "Inter" },
      sections: [
        educationHero,
        block("melody-stats", "stats", { title: "Platform at a Glance", items: [
          { value: "5,000+", label: "Online Courses" },
          { value: "200+", label: "Expert Instructors" },
          { value: "50K+", label: "Students Enrolled" },
          { value: "4.8★", label: "Average Rating" },
        ] }),
        block("melody-categories", "features", { title: "Popular Categories", subtitle: "Explore courses across top disciplines and career paths", items: [
          { icon: "globe", title: "Web Development", description: "HTML, CSS, JavaScript, React, Node.js, and full-stack skills." },
          { icon: "palette", title: "Design & Creative", description: "UI/UX, graphic design, motion graphics, and Figma mastery." },
          { icon: "trending-up", title: "Business & Marketing", description: "Digital marketing, SEO, analytics, and business strategy." },
          { icon: "shield", title: "Cybersecurity", description: "Ethical hacking, network security, and compliance frameworks." },
          { icon: "sparkles", title: "AI & Data Science", description: "Machine learning, Python, data analysis, and AI tools." },
          { icon: "users", title: "Leadership & Management", description: "Team leadership, communication, project management, and career growth." },
        ] }),
        block("melody-featured", "features", { title: "Featured Courses", subtitle: "Our most popular programs chosen by students worldwide", items: [
          { icon: "rocket", title: "Complete Web Developer Bootcamp", description: "From zero to job-ready in 12 weeks. HTML, CSS, JS, React, and Node.js." },
          { icon: "palette", title: "UI/UX Design Masterclass", description: "Design thinking, wireframing, prototyping, and portfolio building." },
          { icon: "trending-up", title: "Digital Marketing Pro", description: "SEO, Google Ads, social media, email marketing, and analytics." },
        ] }),
        block("melody-about", "imageText", { title: "Learn From Industry Experts", text: "Our instructors are working professionals from top companies. Get real-world knowledge, not just theory. Every course includes hands-on projects, mentorship, and lifetime access to materials. Join a community of 50,000+ learners advancing their careers.", imagePosition: "left", buttonText: "Meet Instructors", buttonHref: "#instructors" }),
        block("melody-instructors", "team", { title: "Top Instructors", subtitle: "Learn from the best minds in the industry", members: [
          { name: "Dr. Amara Obi", role: "AI & Machine Learning", bio: "Former Google AI researcher with 15+ years of industry experience." },
          { name: "Carlos Mendez", role: "Web Development", bio: "Full-stack engineer and author of 3 bestselling coding courses." },
          { name: "Lisa Thompson", role: "UX Design", bio: "Lead designer at Meta, specializing in accessible design systems." },
          { name: "Raj Patel", role: "Cybersecurity", bio: "Certified ethical hacker and cybersecurity consultant for Fortune 500 companies." },
        ] }),
        block("melody-offer", "banner", { title: "🎓 20% Off All Courses — Limited Time!", subtitle: "Enroll today and get instant access to premium learning materials.", buttonText: "Claim Offer", buttonHref: "#contact" }),
        block("melody-testimonials", "testimonials", { title: "What Students Say", subtitle: "Real reviews from our learning community", bgColor: "surface", items: [
          { name: "Priya Sharma", role: "Junior Developer", text: "This platform changed my career. I went from zero coding experience to a full-time dev job in 6 months." },
          { name: "Michael Brooks", role: "Marketing Manager", text: "The digital marketing course was incredibly practical. I applied what I learned immediately at work." },
          { name: "Aisha Mohammed", role: "UX Designer", text: "The design masterclass gave me the confidence and skills to land my dream job at a top agency." },
        ] }),
        block("melody-faq", "faq", { title: "Frequently Asked Questions", items: [
          { question: "Do I get a certificate?", answer: "Yes! Every course includes a verified certificate of completion you can share on LinkedIn." },
          { question: "Are courses self-paced?", answer: "Absolutely. Learn on your schedule with lifetime access to all course materials." },
          { question: "Can I get a refund?", answer: "Yes, we offer a 30-day money-back guarantee on all courses, no questions asked." },
          { question: "Is there mentorship available?", answer: "Pro and Enterprise plans include 1-on-1 mentorship with industry professionals." },
        ] }),
        block("melody-newsletter", "newsletter", { title: "Stay Updated", subtitle: "Get notified about new courses, free workshops, and exclusive offers." }),
        block("melody-contact", "contactForm", { title: "Contact Us", subtitle: "Have questions? Our admissions team is here to help." }),
      ],
    }),
    pageTitles: ["Home", "Courses", "Categories", "Instructors", "FAQ", "Contact"],
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
    name: "Jewellery Elegance",
    slug: "jewellery-elegance",
    category: "Accessories",
    description: "A premium jewellery e-commerce template with elegant hero banners, category browsing, product grids, and editorial promotional sections.",
    previewImage: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-hero-banner-1.jpg.webp",
    previewUrl: "/template-preview/jewellery-elegance",
    recommendationKeywords: ["jewellery", "jewelry", "accessories", "rings", "necklaces", "earrings", "bracelets", "luxury", "gold", "elegance", "gift"],
    variants: [{ name: "Jewellery", keywords: ["jewellery", "jewelry", "gold"] }, { name: "Luxury Accessories", keywords: ["luxury", "accessories", "gift"] }],
    themeConfig: themeConfig({
      layout: "jewellery_elegance",
      header: "minimal",
      footer: "rich",
      card: "gallery",
      colors: { primary: "#1C1C1C", secondary: "#6B6B6B", accent: "#C9A96E", background: "#FFFFFF", text: "#1C1C1C", headerBg: "#FFFFFF", headerText: "#1C1C1C", footerBg: "#1C1C1C", footerText: "#E5E5E5" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      sections: [
        // 1. DUAL HERO BANNERS
        block("jewellery-hero", "columns", {
          columns: 2,
          gap: "md",
          items: [
            {
              image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-hero-banner-1.jpg.webp",
              title: "Earrings Sale",
              subtitle: "Up to 20% off",
              buttonText: "Shop now",
              buttonHref: "/shop",
            },
            {
              image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-hero-banner-2.jpg.webp",
              title: "Elevate Your Look",
              subtitle: "15% off Sitewide",
              buttonText: "Shop now",
              buttonHref: "/shop",
            },
          ],
        }),
        // 2. CATEGORY CARDS (4 in a row)
        block("jewellery-categories", "categories", {
          title: "",
          columns: 4,
          items: [
            { icon: "", title: "Bracelets", description: "", image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-category-bracelets.jpg.webp", href: "/shop?category=bracelets" },
            { icon: "", title: "Earrings", description: "", image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-category-earrings.jpg.webp", href: "/shop?category=earrings" },
            { icon: "", title: "Necklaces", description: "", image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-category-necklaces.jpg.webp", href: "/shop?category=necklaces" },
            { icon: "", title: "Rings", description: "", image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-category-rings.jpg.webp", href: "/shop?category=rings" },
          ],
        }),
        // 3. NEW IN - product grid
        block("jewellery-new-in", "new_arrivals", {
          title: "New In",
          limit: 6,
          columns: 3,
        }),
        // 4. PROMOTIONAL SPLIT SECTION
        block("jewellery-promo", "columns", {
          columns: 3,
          gap: "md",
          items: [
            {
              type: "stacked-images",
              images: [
                { src: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-p-left-img-1.jpg.webp", title: "Classic Paperclip Chain" },
                { src: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-p-left-img-2.jpg", title: "Oversized Stud Earrings" },
              ],
            },
            {
              type: "products",
              title: "Featured Picks",
              limit: 2,
            },
            {
              type: "stacked-images",
              images: [
                { src: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-p-right-img-1.jpg.webp" },
                { src: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-p-right-img-2.jpg.webp" },
              ],
            },
          ],
        }),
        // 5. BESTSELLERS
        block("jewellery-bestsellers", "best_sellers", {
          title: "Bestsellers",
          limit: 6,
          columns: 3,
        }),
        // 6. TESTIMONIAL QUOTE
        block("jewellery-quote", "testimonial", {
          text: "WoodMart Jewelry combines elegance and craftsmanship, offering timeless pieces that belong in every jewelry collection.",
          bgColor: "surface",
        }),
        // 7. BRAND LOGOS
        block("jewellery-brands", "brands", {
          title: "",
          items: [
            { name: "Vitra", logo: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-brand-vitra.svg" },
            { name: "Poliform", logo: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-brand-poliform.svg" },
            { name: "Minotti", logo: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-brand-minotti.svg" },
            { name: "Lladro", logo: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-brand-lladro.svg" },
          ],
        }),
        // 8. PRE-FOOTER BANNERS (4 cards)
        block("jewellery-prefooter", "gallery", {
          title: "",
          columns: 4,
          items: [
            { image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-prefooter-banner-about-us.jpg.webp", title: "About Us", buttonText: "Discover More", href: "/about" },
            { image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-prefooter-banner-packages.jpg.webp", title: "Our Packaging", buttonText: "Discover More", href: "/shop" },
            { image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-prefooter-banner-collections.jpg.webp", title: "Collections", buttonText: "Discover More", href: "/collections" },
            { image: "https://woodmart.xtemos.com/jewellery-2/wp-content/uploads/sites/35/2026/04/j2-prefooter-banner-showrooms.jpg.webp", title: "Showrooms", buttonText: "Discover More", href: "/showrooms" },
          ],
        }),
      ],
    }),
    pageTitles: ["Home", "Shop", "Collections", "About Us", "Contact", "Wishlist"],
    legacySlugs: ["jewellery-2"],
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

