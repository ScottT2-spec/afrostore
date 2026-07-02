import { slugify } from "@/lib/utils";
import { getPackageDesign } from "./package-designs";
import type { TemplateDefinition, ThemePackageDefinition, ThemePackagePage } from "./types";

type PackageSource = {
  slug: string;
  name: string;
  category: "Ecommerce" | "Landing Page" | "Business Website";
  tags: string[];
};

const PACKAGE_SOURCES: PackageSource[] = [
  { slug: "accessories", name: "Jewellery", category: "Ecommerce", tags: ["jewelry", "gifts", "bundles", "lifestyle"] },
  { slug: "food-grocery", name: "Grocery", category: "Ecommerce", tags: ["grocery", "fresh", "market", "delivery"] },
  { slug: "beauty", name: "Beauty", category: "Ecommerce", tags: ["beauty", "skincare", "cosmetics"] },
  { slug: "arts-handmade", name: "Arts & Handmade", category: "Ecommerce", tags: ["handmade", "art", "crafts", "pottery"] },
  { slug: "fashion", name: "Fashion", category: "Ecommerce", tags: ["fashion", "apparel", "style", "lookbook"] },
  { slug: "health", name: "Health", category: "Ecommerce", tags: ["health", "wellness", "pharmacy"] },
  { slug: "electronics", name: "Electronics", category: "Ecommerce", tags: ["electronics", "gadgets", "tech"] },
  { slug: "children", name: "Children", category: "Ecommerce", tags: ["kids", "children", "toys"] },
  { slug: "interior-design", name: "Interior Design", category: "Ecommerce", tags: ["interior", "decor", "furniture"] },
  { slug: "beverage", name: "Beverage", category: "Ecommerce", tags: ["wine", "drinks", "beverage"] },
  { slug: "bakery", name: "Bakery", category: "Ecommerce", tags: ["bakery", "dessert", "pastry", "cake"] },
  { slug: "digital-services", name: "Digital Services", category: "Ecommerce", tags: ["delivery", "services", "mobile-first"] },
  { slug: "landing-gadget", name: "Landing Gadget", category: "Landing Page", tags: ["gadget", "product launch", "hardware"] },
  { slug: "aegis", name: "Aegis Health", category: "Landing Page", tags: ["health", "non-profit", "medical", "community", "hiv", "aids"] },
  { slug: "najaf-ai", name: "Najaf AI", category: "Landing Page", tags: ["ai", "automation", "software"] },
  { slug: "aurapod", name: "AuraPod", category: "Landing Page", tags: ["audio", "wellness", "subscription"] },
  { slug: "arts-portfolio", name: "Arts Portfolio", category: "Landing Page", tags: ["portfolio", "art", "creative"] },
  { slug: "developer-portfolio", name: "Developer Portfolio", category: "Landing Page", tags: ["developer", "portfolio", "code"] },
  { slug: "toybox", name: "Toybox", category: "Landing Page", tags: ["playful", "kids", "launch"] },
  { slug: "pixapage-saas", name: "PixaPage SaaS", category: "Landing Page", tags: ["saas", "pricing", "workflow"] },
  { slug: "traveler-startup", name: "Traveler Startup", category: "Landing Page", tags: ["travel", "startup", "booking"] },
  { slug: "corporate", name: "Corporate", category: "Business Website", tags: ["corporate", "consulting", "enterprise"] },
  { slug: "lawyer", name: "Lawyer", category: "Business Website", tags: ["law", "legal", "attorney"] },
  { slug: "real-estate", name: "Real Estate", category: "Business Website", tags: ["real estate", "property", "agents"] },
  { slug: "restaurant", name: "Restaurant", category: "Business Website", tags: ["restaurant", "menu", "dining"] },
  { slug: "modern-restaurant", name: "Modern Restaurant", category: "Business Website", tags: ["restaurant", "healthy", "chef"] },
  { slug: "clarity", name: "Clarity", category: "Business Website", tags: ["agency", "digital", "clarity"] },
  { slug: "agency", name: "Agency", category: "Business Website", tags: ["agency", "creative", "marketing"] },
  { slug: "portfolio", name: "Portfolio", category: "Business Website", tags: ["portfolio", "creative", "portfolio"] },
  { slug: "healthcare", name: "Healthcare", category: "Business Website", tags: ["healthcare", "medical", "clinic"] },
  { slug: "clinic", name: "Clinic", category: "Business Website", tags: ["clinic", "medical", "appointments"] },
  { slug: "travel", name: "Travel", category: "Business Website", tags: ["travel", "tourism", "booking"] },
  { slug: "education", name: "Education", category: "Business Website", tags: ["education", "academy", "courses"] },
];

function clone<T>(value: T): T {
  return structuredClone(value);
}

function pageTypeForTitle(pageTitle: string, isLanding: boolean): ThemePackagePage["type"] {
  const lower = pageTitle.toLowerCase();
  if (lower === "home") return isLanding ? "LANDING" : "HOME";
  if (lower === "about") return "ABOUT";
  if (lower === "contact") return "CONTACT";
  if (lower === "faq") return "FAQ";
  if (lower === "services") return "SERVICES";
  if (lower === "team") return "TEAM";
  if (lower === "policy") return "POLICY";
  if (lower === "landing") return "LANDING";
  if (lower === "thank you" || lower === "thank-you") return "THANK_YOU";
  return "CUSTOM";
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultThemeConfig(source: PackageSource) {
  const isLanding = source.category === "Landing Page";
  const isBusiness = source.category === "Business Website";
  return {
    homepage_layout: isLanding ? "landing-editorial" : isBusiness ? "business-showcase" : "commerce-premium",
    header_style: isLanding ? "overlay" : isBusiness ? "modern" : "shop",
    footer_style: isLanding ? "minimal" : isBusiness ? "editorial" : "commerce",
    product_card_style: source.category === "Ecommerce" ? "premium" : "standard",
    colors: {
      primary: isLanding ? "#111827" : isBusiness ? "#1F2937" : "#1B2B4B",
      secondary: isLanding ? "#0F172A" : isBusiness ? "#0B1120" : "#111827",
      accent: isLanding ? "#C084FC" : isBusiness ? "#D97706" : "#F5B731",
      background: "#ffffff",
      text: "#111827",
      headerBg: isLanding ? "rgba(15,23,42,0.72)" : "#ffffff",
      headerText: isLanding ? "#ffffff" : "#111827",
      footerBg: isLanding ? "#0F172A" : "#111827",
      footerText: "#ffffff",
    },
    fonts: {
      heading: isLanding ? "Inter" : "Plus Jakarta Sans",
      body: "Inter",
    },
  };
}

function normalizePreviewUrl(slug: string) {
  return `/template-preview/${slug}`;
}

function topLevelCategory(slug: string): TemplateDefinition["category"] {
  if (slug.startsWith("landing-") || ["aegis", "najaf-ai", "aurapod", "arts-portfolio", "developer-portfolio", "toybox", "pixapage-saas", "traveler-startup"].includes(slug)) return "Landing Page";
  if (["clarity", "agency", "portfolio", "healthcare", "clinic", "travel", "education", "corporate", "lawyer", "real-estate", "restaurant", "modern-restaurant"].includes(slug)) return "Business Website";
  return "Ecommerce";
}

function buildPackage(source: PackageSource): TemplateDefinition {
  const design = getPackageDesign(source);
  const sections = clone(design.homeSections);
  const isLanding = source.category === "Landing Page";
  const pageKeys = Object.keys(design.pages || {});
  const pageTitles = Array.from(new Set(["Home", ...pageKeys.map((key) => titleCase(key))]));
  const pages: ThemePackagePage[] = pageTitles.map((pageTitle) => {
    const key = pageTitle.toLowerCase();
    return {
      title: pageTitle,
      slug: slugify(pageTitle),
      type: pageTypeForTitle(pageTitle, isLanding),
      metaTitle: `${pageTitle} — ${source.name}`,
      metaDescription: `${source.name} website template`,
      blocks: clone(design.pages?.[key] || (key === "home" ? sections : [])),
    };
  });

  const packageDefinition: ThemePackageDefinition = {
    manifest: {
      category: source.category === "Landing Page" ? "landing" : source.category === "Business Website" ? "business" : "ecommerce",
      industry: source.name,
      siteType: isLanding ? "LANDING_PAGE" : source.category === "Ecommerce" ? "ECOMMERCE" : "WEBSITE",
      version: "1.0.0",
      tags: source.tags,
    },
    theme: defaultThemeConfig(source),
    seo: {
      homeTitle: `${source.name} Template`,
      homeDescription: `${source.name} website template`,
      defaultTitle: `${source.name}`,
      defaultDescription: `${source.name} website template`,
    },
    navigation: design.navigation || [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: design.footer || {
      columns: [
        { heading: source.name, links: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: design.menus || [
      { name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Contact", href: "/contact" }] },
    ],
    forms: design.forms || [
      { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
    ],
    media: design.media || [],
    pages,
    products: design.products || (source.category === "Ecommerce" ? [
      { name: `${source.name} Signature Item`, slug: `${source.slug}-signature-item`, price: 120, compareAtPrice: 160, stock: 18, isFeatured: true, tags: source.tags },
    ] : []),
    collections: design.collections || (source.category === "Ecommerce" ? [{ name: "Featured", slug: "featured", description: "Featured products" }] : []),
    blog: design.blog || [
      { title: `${source.name} Journal`, slug: "journal", excerpt: "Stories and updates from the imported theme package." },
    ],
  };

  return {
    id: source.slug,
    name: source.name,
    slug: source.slug,
    category: topLevelCategory(source.slug),
    description: `${source.name} website template`,
    previewImage: design.previewImage || "",
    previewUrl: normalizePreviewUrl(source.slug),
    recommendationKeywords: Array.from(new Set([...source.tags, source.name.toLowerCase(), source.category.toLowerCase()])),
    themeConfig: {
      ...defaultThemeConfig(source),
      sections,
    },
    manifest: {
      category: source.category === "Landing Page" ? "LANDING_PAGE" : source.category === "Business Website" ? "WEBSITE" : "ECOMMERCE",
      siteType: isLanding ? "LANDING_PAGE" : source.category === "Ecommerce" ? "ECOMMERCE" : "WEBSITE",
      industry: source.name,
      version: "1.0.0",
    },
    package: packageDefinition,
    variants: [{ name: source.name, keywords: source.tags }],
    active: true,
  };
}

export const THEME_PACKAGES: TemplateDefinition[] = PACKAGE_SOURCES.map((source) => buildPackage(source));

export const TEMPLATE_CATEGORIES = ["Ecommerce", "Landing Page", "Business Website"];

export function getInternalTemplateBySlug(slug: string) {
  const canonical = slug.trim().toLowerCase();
  const packageSource = PACKAGE_SOURCES.find((item) => item.slug === canonical);
  if (packageSource) return THEME_PACKAGES.find((template) => template.slug === packageSource.slug) || null;
  return null;
}
