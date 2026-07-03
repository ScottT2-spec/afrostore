import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { PageType, Prisma, Template as PrismaTemplate } from "@/generated/prisma";
import { INTERNAL_TEMPLATES as THEME_PACKAGES, getInternalTemplateBySlug } from "./catalog";
import { importTemplateToSite } from "./importer";
import { templateMatchesSiteType } from "./site-type";
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
  portfolio: ["Interior Studio", "Business Services Pro"],
  commerce: ["Commerce Pro"],
  ecommerce: ["Commerce Pro"],
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

function toTemplateDefinition(template: TemplateDefinition): TemplateDefinition {
  const internal = getInternalTemplateBySlug(template.slug);
  return {
    ...(internal || template),
    ...template,
    package: internal?.package || template.package,
    previewUrl: template.previewUrl || internal?.previewUrl || `/template-preview/${template.slug}`,
  };
}

export async function syncInternalTemplates() {
  const internalSlugs = new Set(THEME_PACKAGES.map((template) => template.slug));
  const existingTemplates = await prisma.template.findMany({ select: { id: true, slug: true, category: true } });
  const existingSlugs = new Set(existingTemplates.map((template) => template.slug));

  const obsoleteTemplates = existingTemplates.filter((template) => !internalSlugs.has(template.slug) && ["Landing Page", "Business Website"].includes(template.category));
  if (obsoleteTemplates.length > 0) {
    await prisma.template.deleteMany({ where: { id: { in: obsoleteTemplates.map((template) => template.id) } } });
  }

  const missingTemplates = THEME_PACKAGES.filter((template) => !existingSlugs.has(template.slug));
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

  const updates = existingTemplates.filter((template) => internalSlugs.has(template.slug)).filter((template) => {
    const internal = THEME_PACKAGES.find((item) => item.slug === template.slug);
    return Boolean(internal && template.category !== internal.category);
  });
  await Promise.all(
    updates.map((template) => {
      const internal = THEME_PACKAGES.find((item) => item.slug === template.slug);
      if (!internal) return Promise.resolve();
      return prisma.template.update({
        where: { id: template.id },
        data: {
          name: internal.name,
          category: internal.category,
          description: internal.description,
          previewImage: internal.previewImage,
          previewUrl: internal.previewUrl,
          recommendationKeywords: internal.recommendationKeywords,
          themeConfig: internal.themeConfig as unknown as Prisma.InputJsonValue,
          variants: internal.variants ? (internal.variants as unknown as Prisma.InputJsonValue) : undefined,
          active: internal.active,
        },
      });
    }),
  );

  invalidateTemplateCache();
}

export async function listTemplates(options: { includeInactive?: boolean; search?: string; category?: string; siteType?: string } = {}) {
  await syncInternalTemplates();

  if (!templateCache || templateCache.expiresAt < Date.now()) {
    const templates = await prisma.template.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
    templateCache = {
      expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS,
      templates: templates.map((template) => toTemplateDefinition(template as unknown as TemplateDefinition)),
    };
  }

  const search = options.search?.toLowerCase();
  const category = options.category?.toLowerCase();

  return templateCache.templates.filter((template) => {
    if (!options.includeInactive && !template.active) return false;
    if (options.siteType && !templateMatchesSiteType({ category: template.category, slug: template.slug }, options.siteType)) return false;
    if (category && template.category.toLowerCase() !== category && !template.recommendationKeywords.includes(category)) return false;
    if (search) {
      const text = `${template.name} ${template.category} ${template.description} ${template.recommendationKeywords.join(" ")}`.toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });
}

export async function getTemplateByIdOrSlug(idOrSlug: string) {
  const canonical = idOrSlug.trim().toLowerCase();
  try {
    await syncInternalTemplates();
    const template = await prisma.template.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }, { slug: canonical }] } });
    if (template) return toTemplateDefinition(template as unknown as TemplateDefinition);
  } catch (error) {
    console.error("[getTemplateByIdOrSlug] DB lookup failed, falling back to internal templates:", error);
  }
  return getInternalTemplateBySlug(idOrSlug);
}

export function scoreTemplates(templates: TemplateDefinition[], input: BusinessAnalysisInput & { siteType?: string }): TemplateRecommendation[] {
  const tokens = new Set(
    [
      input.businessName,
      input.businessCategory,
      input.category,
      input.industry,
      input.description,
      input.products,
      input.services,
      input.targetAudience,
    ]
      .map(normalize)
      .join(" ")
      .split(/[^a-z0-9]+/i)
      .filter(Boolean),
  );
  const searchCategory = normalize(input.businessCategory || input.category || input.industry);

  return templates
    .map((template) => {
      const keywords = template.recommendationKeywords.map((keyword) => keyword.toLowerCase());
      let score = 0;
      const reasons: string[] = [];

      if (input.siteType && !templateMatchesSiteType({ category: template.category, slug: template.slug }, input.siteType)) {
        return { template, score: 0, matchPercent: 0, reasons: [] };
      }

      if (searchCategory && (template.category.toLowerCase().includes(searchCategory) || keywords.some((keyword) => keyword.includes(searchCategory)))) {
        score += 50;
        reasons.push("Category match");
      }

      const keywordHits = keywords.filter((keyword) => tokens.has(keyword));
      if (keywordHits.length > 0) {
        score += Math.min(20, keywordHits.length * 5);
        reasons.push("Keyword match");
      }

      if (score === 0) {
        score = 10;
        reasons.push("Template package available");
      }

      return { template, score, matchPercent: Math.min(score, 100), reasons };
    })
    .sort((a, b) => b.score - a.score || a.template.name.localeCompare(b.template.name));
}

export async function recommendTemplates(input: BusinessAnalysisInput & { siteType?: string }) {
  const templates = await listTemplates({ siteType: input.siteType });
  return {
    classification: {
      industry: input.businessCategory || input.industry || "Business",
      confidence: 0.5,
      recommended_templates: templates.slice(0, 5).map((template) => template.slug),
    },
    recommendations: scoreTemplates(templates, input),
  };
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
  return importTemplateToSite(siteId, input);
}
