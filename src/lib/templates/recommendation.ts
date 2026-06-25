import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { PageType, Prisma, Template as PrismaTemplate } from "@/generated/prisma";
import type { BuilderBlock } from "@/lib/builder/types";
import { INTERNAL_TEMPLATES } from "./catalog";
import { TEMPLATE_FAMILY_ALIASES, TEMPLATE_FAMILY_PAGE_SETS } from "./families";
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
  creative: ["Artsy Studio", "Agency Growth"],
  art: ["Artsy Studio"],
  artist: ["Artsy Studio"],
  "design studio": ["Artsy Studio", "Agency Growth"],
  travel: ["Scenic Experiences"],
  tourism: ["Scenic Experiences"],
  hospitality: ["Scenic Experiences"],
  events: ["Scenic Experiences"],
  marketing: ["Agency Growth", "Business Impact"],
  advertising: ["Agency Growth"],
  "digital agency": ["Agency Growth"],
  branding: ["Agency Growth", "Artsy Studio"],
  campaign: ["Agency Growth"],
  saas: ["SaaS Launch"],
  software: ["SaaS Launch"],
  startup: ["SaaS Launch", "Business Impact"],
  technology: ["SaaS Launch"],
  "online service": ["SaaS Launch"],
  platform: ["SaaS Launch"],
  app: ["SaaS Launch"],
  education: ["Education Pro", "Kids World"],
  school: ["Education Pro"],
  training: ["Education Pro"],
  university: ["Education Pro"],
  courses: ["Education Pro"],
  "e-learning": ["Education Pro"],
  academy: ["Education Pro"],
  "product launch": ["Business Impact"],
  "pre-order": ["Business Impact"],
  dtc: ["Business Impact"],
  crowdfunding: ["Business Impact"],
  corporate: ["Agency Growth", "Business Impact"],
};

function block(id: string, type: string, props: Record<string, unknown>): BuilderBlock {
  return {
    id,
    type: type as BuilderBlock["type"],
    props,
  };
}

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
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    category: template.category,
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

export async function listTemplates(options: { includeInactive?: boolean; search?: string; category?: string } = {}) {
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
  const templates = await listTemplates();
  const classification = classifyBusiness(input);
  const recommendations = scoreTemplates(templates, {
    ...input,
    industry: input.industry || classification.industry,
    siteType: input.siteType,
  });
  return { classification, recommendations };
}

function canonicalIndustry(input: BusinessAnalysisInput, template?: TemplateDefinition) {
  const templateSlug = template?.slug || "";
  const canonicalSlug = TEMPLATE_FAMILY_ALIASES[templateSlug] || templateSlug;
  if (TEMPLATE_FAMILY_PAGE_SETS[canonicalSlug]) return canonicalSlug;

  const term = primaryBusinessTerm(input);
  const canonicalTerm = TEMPLATE_FAMILY_ALIASES[term] || term;
  if (TEMPLATE_FAMILY_PAGE_SETS[canonicalTerm]) return canonicalTerm;

  const category = template?.category.toLowerCase() || "";
  if (category.includes("restaurant")) return "restaurant-pro";
  if (category.includes("bakery")) return "bakery-delight";
  if (category.includes("fashion")) return "fashion-luxe";
  if (category.includes("shoe")) return "footwear-elite";
  if (category.includes("accessories")) return "accessory-hub";
  if (category.includes("children")) return "kids-world";
  if (category.includes("consulting") || category.includes("services")) return "business-services-pro";
  if (category.includes("interior") || category.includes("architecture")) return "interior-studio";
  if (category.includes("landing") || category.includes("creative") || category.includes("portfolio")) return "landing-artsy";
  if (category.includes("travel") || category.includes("tourism")) return "landing-scenic";
  if (category.includes("marketing") || category.includes("advertising") || category.includes("agency")) return "landing-agency";
  if (category.includes("saas") || category.includes("software") || category.includes("technology")) return "landing-service";
  if (category.includes("education") || category.includes("training") || category.includes("university")) return "landing-education";
  if (category.includes("corporate")) return "landing-product";
  return "commerce-pro";
}

function sectionForPage(pageTitle: string, businessName: string, industry: string) {
  const title = pageTitle.toLowerCase();
  if (title === "home") return null;
  if (title.includes("contact")) return { id: `${slugify(pageTitle)}-contact`, type: "contactForm", props: { title: `Contact ${businessName}`, subtitle: "Tell us what you need and we will respond shortly." } };
  if (title.includes("testimonial") || title.includes("review")) return { id: `${slugify(pageTitle)}-testimonials`, type: "testimonials", props: { title: "Customer stories", bgColor: "surface", items: [] } };
  if (title.includes("team") || title.includes("instructor")) return { id: `${slugify(pageTitle)}-team`, type: "team", props: { title: pageTitle, subtitle: `Meet the people behind ${businessName}.`, members: [] } };
  if (title.includes("gallery") || title.includes("lookbook") || title.includes("portfolio") || title.includes("projects") || title.includes("destination") || title.includes("experience")) return { id: `${slugify(pageTitle)}-portfolio`, type: "portfolio", props: { title: pageTitle, subtitle: `Selected work from ${businessName}.` } };
  if (title.includes("menu")) return { id: `${slugify(pageTitle)}-menu`, type: "menu", props: { title: `${businessName} Menu`, subtitle: "Add your signature items, specials, and pricing." } };
  if (title.includes("reservation")) return { id: `${slugify(pageTitle)}-reservations`, type: "reservations", props: { title: "Reservations", subtitle: "Make it easy for customers to book a table or request catering." } };
  if (title.includes("service")) return { id: `${slugify(pageTitle)}-services`, type: "service_cards", props: { title: "Services", subtitle: `Core services from ${businessName}.` } };
  if (title.includes("case") || title.includes("process")) return { id: `${slugify(pageTitle)}-case-studies`, type: "case_studies", props: { title: pageTitle, subtitle: "Show outcomes and proof from completed work." } };
  if (title.includes("pricing")) return { id: `${slugify(pageTitle)}-pricing`, type: "stats", props: { title: "Pricing", subtitle: "Transparent plans and starting prices.", bgColor: "brand" } };
  if (title.includes("faq")) return { id: `${slugify(pageTitle)}-faq`, type: "faq", props: { title: "Frequently Asked Questions", items: [{ question: "How do I get started?", answer: "Contact us or sign up to get started." }] } };
  if (title.includes("feature")) return { id: `${slugify(pageTitle)}-features`, type: "features", props: { title: "Features", subtitle: `What makes ${businessName} special.`, items: [{ icon: "star", title: "Quality", desc: "We deliver the best." }, { icon: "zap", title: "Fast", desc: "Quick turnaround." }, { icon: "shield", title: "Reliable", desc: "Trusted by thousands." }] } };
  if (title.includes("course") || title.includes("categor")) return { id: `${slugify(pageTitle)}-grid`, type: "featured_products", props: { title: pageTitle, subtitle: `Browse ${pageTitle.toLowerCase()} from ${businessName}.`, limit: 8, columns: 4, showFeatured: true } };
  if (title.includes("about")) return { id: `${slugify(pageTitle)}-about`, type: "imageText", props: { title: `About ${businessName}`, text: "Tell your story here. What drives you, what makes you different, and why customers choose you.", badge: "Our Story", buttonText: "Get in Touch", buttonHref: "#contact" } };
  if (title.includes("collection") || title.includes("shop") || title.includes("featured")) return { id: `${slugify(pageTitle)}-products`, type: "featured_products", props: { title: pageTitle, limit: 8, columns: 4, showFeatured: true } };
  return { id: `${slugify(pageTitle)}-content`, type: "features", props: { title: pageTitle, subtitle: `A starter ${pageTitle.toLowerCase()} page for ${businessName}.`, items: [] } };
}

export function generatePages(input: BusinessAnalysisInput, template: TemplateDefinition): GeneratedTemplatePage[] {
  const businessName = input.businessName || input.business_name || "Your Business";
  const industry = canonicalIndustry(input, template);
  const pageNames = TEMPLATE_FAMILY_PAGE_SETS[industry] || TEMPLATE_FAMILY_PAGE_SETS["commerce-pro"];
  const homeSections = generateHomepageSections(input, template, industry);

  return pageNames.map((title, position) => {
    const pageSlug = title === "Home" ? "home" : slugify(title);
    const pageBlock = sectionForPage(title, businessName, industry);
    return {
      title,
      slug: pageSlug,
      type: title === "Home" ? "HOME" : title === "Contact" ? "CONTACT" : title === "About" ? "ABOUT" : title === "Services" ? "SERVICES" : title === "Team" ? "TEAM" : "CUSTOM",
      content: title === "Home" ? homeSections : pageBlock ? [pageBlock] : [],
      metaTitle: `${title} | ${businessName}`,
      metaDescription: position === 0 ? normalize(input.description) || `${businessName} ${industry} website.` : `${title} page for ${businessName}.`,
    };
  });
}

function isLandingPageTemplate(industry: string) {
  return industry.startsWith("landing-");
}

function generateHomepageSections(input: BusinessAnalysisInput, template: TemplateDefinition, industry: string) {
  const businessName = input.businessName || input.business_name || "Your Business";
  const description = input.description || `Professional ${industry.replace(/-/g, " ")} services and products built for your customers.`;
  const starter = structuredClone(template.themeConfig.sections);

  // Landing page templates define their own complete section list —
  // only personalise the hero heading/subheading, keep everything else intact.
  if (isLandingPageTemplate(industry)) {
    const hero = starter.find((section) => section.type === "hero");
    if (hero) {
      hero.props = {
        ...hero.props,
        heading: businessName !== "Your Business" ? businessName : hero.props.heading,
        subheading: description !== hero.props.subheading && input.description ? description : hero.props.subheading,
      };
    }
    return starter;
  }

  const hero = starter.find((section) => section.type === "hero");
  if (hero) {
    const isDiningFamily = industry === "restaurant-pro" || industry === "bakery-delight";
    const isServiceFamily = industry === "business-services-pro" || industry === "interior-studio";
    hero.props = {
      ...hero.props,
      badge: template.category,
      heading: businessName,
      subheading: description,
      buttonText: isDiningFamily ? "View Menu" : isServiceFamily ? "View Services" : "Shop Now",
      buttonHref: isDiningFamily ? `/store/${slugify(businessName)}/menu` : "#shop",
    };
  }

  const familySections: Record<string, BuilderBlock[]> = {
    "restaurant-pro": [
      block("restaurant-inline-menu", "menu", { title: `${businessName} Menu`, subtitle: "Scan the menu before you visit." }),
      block("restaurant-inline-reservation", "reservations", { title: "Reservations", subtitle: "Reserve a table in a couple of taps." }),
    ],
    "bakery-delight": [
      block("bakery-inline-specials", "banner", { title: "Daily Specials", subtitle: "Fresh bakes and morning offers." }),
      block("bakery-inline-pickup", "features", { title: "Pickup", subtitle: "Quick ordering and same-day pickup.", items: [] }),
    ],
    "fashion-luxe": [
      block("fashion-inline-lookbook", "lookbook", { title: "Lookbook", subtitle: "Styled collections and editorial moments." }),
      block("fashion-inline-arrivals", "new_arrivals", { title: "New Arrivals", limit: 4, columns: 4 }),
    ],
    "footwear-elite": [
      block("footwear-inline-size", "features", { title: "Size Guide", subtitle: "Help shoppers buy with confidence.", items: [] }),
      block("footwear-inline-collections", "collections", { title: "Seasonal Collections" }),
    ],
    "accessory-hub": [
      block("accessory-inline-gifts", "featured_products", { title: "Gift Collections", limit: 4, columns: 4, showFeatured: true }),
      block("accessory-inline-bundles", "banner", { title: "Product Bundles", subtitle: "Build a gift set or bundled offer." }),
    ],
    "kids-world": [
      block("kids-inline-age", "age_categories", { title: "Age Categories" }),
      block("kids-inline-safety", "trustBadges", { title: "Safety Highlights" }),
    ],
    "business-services-pro": [
      block("services-inline-cases", "case_studies", { title: "Case Studies", subtitle: "Show outcomes and proof." }),
      block("services-inline-pricing", "stats", { title: "Pricing", subtitle: "Transparent plans and starting points." }),
    ],
    "interior-studio": [
      block("interior-inline-projects", "projects", { title: "Projects", subtitle: "Selected work and design direction." }),
      block("interior-inline-awards", "stats", { title: "Awards", subtitle: "Recognition and milestones." }),
    ],
    "commerce-pro": [
      block("commerce-inline-collections", "collections", { title: "Collections" }),
      block("commerce-inline-flash", "banner", { title: "Flash Sales", subtitle: "Limited-time promotions." }),
    ],
  };

  const inserts = familySections[industry] || familySections["commerce-pro"];
  return [starter[0], ...inserts, ...starter.slice(1)];
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
    : (await recommendTemplates(input)).recommendations[0]?.template;

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

  await prisma.page.deleteMany({
    where: {
      siteId,
      OR: pages.map((page) => ({ slug: page.slug })),
    },
  });

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
