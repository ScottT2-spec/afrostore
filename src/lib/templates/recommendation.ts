import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { PageType, Prisma, Template as PrismaTemplate } from "@/generated/prisma";
import type { BuilderBlock } from "@/components/storefront/BlockRenderer";
import { INTERNAL_TEMPLATES } from "./catalog";
import { TEMPLATE_FAMILY_ALIASES, TEMPLATE_FAMILY_PAGE_SETS } from "./families";
import { getTemplateSiteType } from "./site-type";
import type {
  BusinessAnalysisInput,
  ClassificationResult,
  GeneratedTemplatePage,
  TemplateDefinition,
  TemplateRecommendation,
  TemplateSelectionInput,
  ThemeConfig,
} from "./types";

const RECOMMENDATION_MAP: Record<string, string[]> = {
  restaurant: ["Restaurant Pro", "Bakery Delight"],
  cafe: ["Bakery Delight", "Restaurant Pro"],
  bakery: ["Bakery Delight"],
  food: ["Restaurant Pro", "Bakery Delight"],
  fashion: ["Fashion Luxe", "Footwear Elite", "Commerce Pro"],
  shoes: ["Footwear Elite", "Fashion Luxe"],
  clothing: ["Fashion Luxe", "Commerce Pro"],
  accessories: ["Accessory Hub", "Commerce Pro"],
  jewelry: ["Accessory Hub"],
  children: ["Kids World"],
  kids: ["Kids World"],
  toys: ["Kids World"],
  interior: ["Interior Studio"],
  "interior design": ["Interior Studio"],
  architecture: ["Interior Studio"],
  construction: ["Interior Studio"],
  services: ["Business Services Pro"],
  consulting: ["Business Services Pro"],
  agency: ["Business Services Pro"],
  business: ["Business Services Pro", "Commerce Pro"],
  portfolio: ["Interior Studio", "Business Services Pro", "Artsy Studio"],
  commerce: ["Commerce Pro"],
  ecommerce: ["Commerce Pro"],
  // Landing page recommendations
  creative: ["Artsy Portfolio", "Developer Portfolio"],
  art: ["Artsy Portfolio"],
  artist: ["Artsy Portfolio"],
  "design studio": ["Artsy Portfolio", "Tech SaaS Pro"],
  travel: ["Travel Explorer"],
  tourism: ["Travel Explorer"],
  hospitality: ["Travel Explorer"],
  events: ["Travel Explorer"],
  marketing: ["Tech SaaS Pro", "Gadget Showcase"],
  advertising: ["Tech SaaS Pro"],
  "digital agency": ["Tech SaaS Pro"],
  branding: ["Tech SaaS Pro", "Artsy Portfolio"],
  campaign: ["Tech SaaS Pro"],
  saas: ["SaaS Minimal", "Tech SaaS Pro"],
  software: ["SaaS Minimal", "Tech SaaS Pro"],
  startup: ["SaaS Minimal", "Gadget Showcase"],
  technology: ["SaaS Minimal", "Tech SaaS Pro"],
  "online service": ["SaaS Minimal"],
  platform: ["SaaS Minimal"],
  app: ["SaaS Minimal"],
  education: ["Kids World", "Health & Advocacy"],
  school: ["Kids World"],
  training: ["Kids World"],
  university: ["Kids World"],
  courses: ["Kids World"],
  "e-learning": ["Kids World"],
  academy: ["Kids World"],
  "product launch": ["Gadget Showcase", "Wellness Tech"],
  "pre-order": ["Gadget Showcase"],
  dtc: ["Gadget Showcase"],
  crowdfunding: ["Gadget Showcase"],
  corporate: ["Tech SaaS Pro", "Health & Advocacy"],
  health: ["Health & Advocacy", "Wellness Tech"],
  nonprofit: ["Health & Advocacy"],
  wellness: ["Wellness Tech"],
  sleep: ["Wellness Tech"],
  gadget: ["Gadget Showcase"],
  electronics: ["Gadget Showcase"],
  developer: ["Developer Portfolio"],
  freelance: ["Developer Portfolio"],
};

const INDUSTRY_ALIASES: Record<string, string[]> = {
  Restaurant: ["restaurant", "cafe", "food", "dining", "menu", "catering"],
  Bakery: ["bakery", "cake", "pastry", "bread", "dessert"],
  Fashion: ["fashion", "clothing", "apparel", "boutique", "retail"],
  Shoes: ["shoes", "footwear", "sneakers"],
  Accessories: ["accessories", "jewelry", "lifestyle", "watches", "bags"],
  Children: ["children", "kids", "baby", "toys", "education"],
  Services: ["services", "consulting", "agency", "business", "legal", "accounting"],
  "Interior Design": ["interior", "architecture", "construction", "projects", "portfolio"],
  "Creative": ["creative", "art", "artist", "design studio", "portfolio", "branding"],
  "Travel": ["travel", "tourism", "hospitality", "events", "lifestyle", "experiences"],
  "Marketing": ["marketing", "advertising", "agency", "digital agency", "campaign", "branding"],
  "Technology": ["saas", "software", "startup", "technology", "app", "platform", "online service"],
  "Education": ["education", "school", "training", "university", "courses", "e-learning", "academy"],
  "Corporate": ["corporate", "business", "consulting", "professional services"],
};

let templateCache: { expiresAt: number; templates: TemplateDefinition[] } | null = null;
const TEMPLATE_CACHE_TTL_MS = 60_000;

export function invalidateTemplateCache() {
  templateCache = null;
}

function normalize(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(" ").toLowerCase();
  return String(value).toLowerCase();
}

function internalPreviewUrl(slug: string) {
  return `/template-preview/${slug}`;
}

function sanitizePreviewUrl(slug: string, previewUrl?: string | null) {
  if (!previewUrl) return internalPreviewUrl(slug);
  if (/^https?:\/\//i.test(previewUrl)) return internalPreviewUrl(slug);
  return previewUrl;
}

function tokenize(input: BusinessAnalysisInput): string[] {
  const text = [
    input.businessName,
    input.business_name,
    input.businessCategory,
    input.category,
    input.industry,
    input.description,
    input.products,
    input.services,
    input.targetAudience,
    input.target_audience,
  ].map(normalize).join(" ");

  return Array.from(new Set(text.split(/[^a-z0-9]+/).filter(Boolean)));
}

function primaryBusinessTerm(input: BusinessAnalysisInput): string {
  const explicit = normalize(input.businessCategory || input.category || input.industry);
  if (explicit) return explicit;

  const tokens = tokenize(input);
  for (const [industry, aliases] of Object.entries(INDUSTRY_ALIASES)) {
    if (aliases.some((alias) => tokens.includes(alias))) return industry.toLowerCase();
  }
  return "business";
}

function toTemplateDefinition(template: PrismaTemplate): TemplateDefinition {
  const siteType = getTemplateSiteType({ category: template.category, slug: template.slug });
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    category: template.category,
    manifest: {
      category: template.category,
      siteType,
      industry: template.category,
    },
    description: template.description || "",
    previewImage: template.previewImage || "",
    previewUrl: sanitizePreviewUrl(template.slug, template.previewUrl),
    recommendationKeywords: template.recommendationKeywords || [],
    themeConfig: template.themeConfig as unknown as ThemeConfig,
    variants: (template.variants as unknown as TemplateDefinition["variants"]) || undefined,
    active: template.active,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

export async function syncInternalTemplates() {
  const existingSlugs = new Set(
    (await prisma.template.findMany({
      select: { slug: true },
    })).map((template) => template.slug),
  );

  const missingTemplates = INTERNAL_TEMPLATES.filter((template) => !existingSlugs.has(template.slug));
  if (missingTemplates.length > 0) {
    await prisma.template.createMany({
      data: missingTemplates.map((template) => ({
        name: template.name,
        slug: template.slug,
        category: template.category,
        description: template.description,
        previewImage: template.previewImage,
        previewUrl: template.previewUrl,
        recommendationKeywords: template.recommendationKeywords,
        themeConfig: template.themeConfig as unknown as Prisma.InputJsonValue,
        variants: template.variants ? (template.variants as unknown as Prisma.InputJsonValue) : undefined,
        active: template.active,
      })),
      skipDuplicates: true,
    });
  }
  if (Object.keys(TEMPLATE_FAMILY_ALIASES).length > 0) {
    await prisma.template.updateMany({
      where: { slug: { in: Object.keys(TEMPLATE_FAMILY_ALIASES) } },
      data: { active: false },
    });
  }
  invalidateTemplateCache();
}

export async function listTemplates(options: { includeInactive?: boolean; search?: string; category?: string; siteType?: string } = {}) {
  await syncInternalTemplates();
  if (!templateCache || templateCache.expiresAt < Date.now()) {
    const templates = await prisma.template.findMany({
      orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
    });
    templateCache = {
      expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS,
      templates: templates.map(toTemplateDefinition),
    };
  }

  const search = options.search?.toLowerCase();
  const category = options.category?.toLowerCase();

  return templateCache.templates.filter((template) => {
    if (Object.prototype.hasOwnProperty.call(TEMPLATE_FAMILY_ALIASES, template.slug)) return false;
    if (!options.includeInactive && !template.active) return false;
    if (options.siteType && template.manifest?.siteType !== options.siteType) return false;
    if (category && template.category.toLowerCase() !== category && !template.recommendationKeywords.includes(category)) return false;
    if (search) {
      const text = `${template.name} ${template.category} ${template.description} ${template.recommendationKeywords.join(" ")}`.toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });
}

export async function getTemplateByIdOrSlug(idOrSlug: string) {
  await syncInternalTemplates();
  const canonicalSlug = TEMPLATE_FAMILY_ALIASES[idOrSlug] || idOrSlug;
  const template = await prisma.template.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }, { slug: canonicalSlug }] },
  });
  return template ? toTemplateDefinition(template) : null;
}

export function classifyBusiness(input: BusinessAnalysisInput): ClassificationResult {
  const tokens = tokenize(input);
  let bestIndustry = "Business";
  let bestHits = 0;

  for (const [industry, aliases] of Object.entries(INDUSTRY_ALIASES)) {
    const hits = aliases.filter((alias) => tokens.includes(alias) || normalize(input.description).includes(alias)).length;
    if (hits > bestHits) {
      bestIndustry = industry;
      bestHits = hits;
    }
  }

  const key = primaryBusinessTerm({ ...input, industry: bestIndustry });
  const mapped = RECOMMENDATION_MAP[key] || RECOMMENDATION_MAP[bestIndustry.toLowerCase()] || RECOMMENDATION_MAP.business;

  return {
    industry: bestIndustry,
    confidence: Math.min(0.95, 0.55 + bestHits * 0.13),
    recommended_templates: mapped,
  };
}

export function scoreTemplates(templates: TemplateDefinition[], input: BusinessAnalysisInput & { siteType?: string }): TemplateRecommendation[] {
  const tokens = tokenize(input);
  const tokenSet = new Set(tokens);
  const categoryTerm = normalize(input.businessCategory || input.category);
  const industryTerm = normalize(input.industry);
  const productTerms = new Set(tokenize({ products: input.products, services: input.services }));
  const mappedNames = RECOMMENDATION_MAP[primaryBusinessTerm(input)] || [];
  const isLandingPage = input.siteType === "LANDING_PAGE";

  return templates
    .map((template) => {
      let score = 0;
      const reasons: string[] = [];
      const category = template.category.toLowerCase();
      const keywords = template.recommendationKeywords.map((keyword) => keyword.toLowerCase());
      const isLandingTemplate = category === "landing page" || keywords.includes("landing");

      // Site type filtering: boost matching templates, penalize mismatches
      if (isLandingPage) {
        if (isLandingTemplate) {
          score += 30;
          reasons.push("Landing page template");
        } else {
          // Non-landing templates get heavily deprioritized for landing page sites
          return { template, score: 0, matchPercent: 0, reasons: [] };
        }
      } else if (isLandingTemplate && input.siteType) {
        // Don't show landing templates for ecommerce/website site types
        return { template, score: 0, matchPercent: 0, reasons: [] };
      }

      if (mappedNames.includes(template.name) || categoryTerm.includes(category) || keywords.some((keyword) => categoryTerm.includes(keyword))) {
        score += 50;
        reasons.push("Business category match");
      }

      const keywordHits = keywords.filter((keyword) => tokenSet.has(keyword) || normalize(input.description).includes(keyword));
      if (keywordHits.length > 0) {
        score += Math.min(20, keywordHits.length * 5);
        reasons.push("Keyword match");
      }

      if (industryTerm && (industryTerm.includes(category) || keywords.some((keyword) => industryTerm.includes(keyword)))) {
        score += 20;
        reasons.push("Industry match");
      }

      const productHits = keywords.filter((keyword) => productTerms.has(keyword));
      if (productHits.length > 0) {
        score += Math.min(10, productHits.length * 5);
        reasons.push("Product or service match");
      }

      if (score === 0 && (category === "business" || template.name === "Fabulous")) {
        score = 20;
        reasons.push("Flexible business fit");
      }

      return {
        template,
        score: Math.min(score, 100),
        matchPercent: Math.min(score, 100),
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score || a.template.name.localeCompare(b.template.name));
}

export async function recommendTemplates(input: BusinessAnalysisInput & { siteType?: string }) {
  const templates = await listTemplates({ siteType: input.siteType });
  const classification = classifyBusiness(input);
  const recommendations = scoreTemplates(templates, {
    ...input,
    industry: input.industry || classification.industry,
    siteType: input.siteType,
  });
  return { classification, recommendations };
}

// Map page titles to relevant section types from the template definition.
// so each page gets the correct sections from the template definition.
const PAGE_SECTION_MAP: Record<string, string[]> = {
  home: ["hero", "stats", "brands", "banner"],
  about: ["imageText", "stats", "brands"],
  services: ["features", "service_cards", "faq"],
  departments: ["features", "service_cards"],
  portfolio: ["gallery", "portfolio", "projects"],
  properties: ["gallery", "portfolio"],
  destinations: ["gallery"],
  packages: ["features"],
  courses: ["features", "featured_products"],
  categories: ["features"],
  team: ["team"],
  doctors: ["team"],
  agents: ["team"],
  attorneys: ["team"],
  instructors: ["team"],
  testimonials: ["testimonials"],
  reviews: ["testimonials"],
  contact: ["contactForm", "contactInfo"],
  appointment: ["contactForm", "contactInfo"],
  reservations: ["contactForm", "reservations"],
  menu: ["menu", "features"],
  gallery: ["gallery"],
  faq: ["faq"],
  pricing: ["stats"],
  "case studies": ["case_studies", "features"],
  "case results": ["stats"],
  "practice areas": ["features", "service_cards"],
};

function getSectionsForPage(pageTitle: string, allSections: BuilderBlock[]): BuilderBlock[] {
  const key = pageTitle.toLowerCase();
  const sectionTypes = PAGE_SECTION_MAP[key];
  if (!sectionTypes) return [];

  return allSections.filter((section) => sectionTypes.includes(section.type));
}

function pageTypeForTitle(pageTitle: string, isLanding: boolean): GeneratedTemplatePage["type"] {
  const key = pageTitle.toLowerCase();

  if (key === "home") return isLanding ? "LANDING" : "HOME";
  if (key === "about") return "ABOUT";
  if (key === "contact") return "CONTACT";
  if (key === "faq") return "FAQ";
  if (key === "services") return "SERVICES";
  if (key === "team" || key === "doctors" || key === "instructors" || key === "attorneys" || key === "agents") return "TEAM";
  if (key === "policy") return "POLICY";
  if (key === "landing") return "LANDING";
  if (key === "thank you" || key === "thank-you") return "THANK_YOU";

  return "CUSTOM";
}

export function generatePages(input: BusinessAnalysisInput, template: TemplateDefinition): GeneratedTemplatePage[] {
  const canonicalSlug = TEMPLATE_FAMILY_ALIASES[template.slug] || template.slug;
  const pageTitles = TEMPLATE_FAMILY_PAGE_SETS[canonicalSlug] || ["Home"];
  const sections = structuredClone(template.themeConfig.sections);
  const isLanding = input.siteType === "LANDING_PAGE" || template.category?.toLowerCase().includes("landing");

  return pageTitles.map((title, index) => {
    const content = index === 0 || title.toLowerCase() === "home"
      ? structuredClone(sections)
      : structuredClone(getSectionsForPage(title, sections));

    return {
      title,
      slug: slugify(title),
      type: pageTypeForTitle(title, isLanding),
      content,
      metaTitle: `${title} — ${template.name}`,
      metaDescription: template.description || undefined,
    };
  });
}

export function mergeBranding(themeConfig: ThemeConfig, input: TemplateSelectionInput): ThemeConfig {
  return {
    ...themeConfig,
    colors: {
      ...themeConfig.colors,
      ...input.branding?.colors,
    },
    fonts: {
      ...themeConfig.fonts,
      ...input.branding?.fonts,
    },
    branding: {
      ...themeConfig.branding,
      logo: input.branding?.logo || themeConfig.branding?.logo,
      favicon: input.branding?.favicon || themeConfig.branding?.favicon,
      storeBanner: input.branding?.storeBanner || themeConfig.branding?.storeBanner,
    },
  };
}

export function themeConfigForProvider(config: ThemeConfig) {
  return {
    colors: {
      primary: config.colors.primary,
      accent: config.colors.accent,
      headerBg: config.colors.headerBg || config.colors.background,
      headerText: config.colors.headerText || config.colors.text,
      footerBg: config.colors.footerBg || config.colors.secondary,
      footerText: config.colors.footerText || "#ffffff",
      buttonBg: config.colors.primary,
      buttonText: "#ffffff",
    },
    fonts: config.fonts,
    layout: {
      template: config.homepage_layout,
      headerStyle: config.header_style,
      cardStyle: config.product_card_style,
      maxWidth: "72rem",
      productColumns: 4,
    },
  };
}

export async function applyTemplateToSite(siteId: string, input: TemplateSelectionInput) {
  const template = input.templateId || input.templateSlug
    ? await getTemplateByIdOrSlug(input.templateId || input.templateSlug || "")
    : input.aiBuild
    ? (await recommendTemplates(input)).recommendations[0]?.template
    : null;

  if (!template) throw new Error("Template not found");

  const themeConfig = mergeBranding(template.themeConfig, input);
  const pages = generatePages(input, { ...template, themeConfig });

  await prisma.siteTemplate.updateMany({
    where: { siteId },
    data: { isActive: false },
  });

  const siteTemplate = await prisma.siteTemplate.upsert({
    where: { siteId_templateId: { siteId, templateId: template.id || "" } },
    create: {
      siteId,
      templateId: template.id || "",
      variant: input.variant || null,
      themeConfig: themeConfig as unknown as Prisma.InputJsonValue,
      pages: pages as unknown as Prisma.InputJsonValue,
      isActive: true,
    },
    update: {
      variant: input.variant || null,
      themeConfig: themeConfig as unknown as Prisma.InputJsonValue,
      pages: pages as unknown as Prisma.InputJsonValue,
      isActive: true,
    },
  });

  // Remove ALL existing pages to start fresh with template pages only.
  // All templates now define their own complete page set.
  await prisma.page.deleteMany({ where: { siteId } });

  await prisma.page.createMany({
    data: pages.map((page, position) => ({
      siteId,
      title: page.title,
      slug: page.slug,
      type: page.type as PageType,
      content: page.content as unknown as Prisma.InputJsonValue,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      template: template.slug,
      isPublished: true,
      position,
    })),
  });

  return {
    template,
    siteTemplate,
    pages,
    themeConfig,
  };
}
