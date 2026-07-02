import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";
import { THEME_PACKAGES, getInternalTemplateBySlug } from "./packages";
import { templateMatchesSiteType } from "./site-type";
import type { BusinessAnalysisInput, TemplateDefinition, TemplateRecommendation, TemplateSelectionInput, ThemeConfig } from "./types";
import { importTemplateToSite } from "./importer";

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
  await syncInternalTemplates();
  const canonical = idOrSlug.trim().toLowerCase();
  const template = await prisma.template.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }, { slug: canonical }] } });
  if (!template) return getInternalTemplateBySlug(idOrSlug);
  return toTemplateDefinition(template as unknown as TemplateDefinition);
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
