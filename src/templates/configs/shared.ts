import { getInternalTemplateBySlug } from "@/lib/templates/catalog";
import { generatePages } from "@/lib/templates/recommendation";
import type { TemplateDefinition } from "@/lib/templates/types";

export function getTemplateBundle(slug: string): TemplateDefinition {
  const template = getInternalTemplateBySlug(slug);
  if (!template) {
    throw new Error(`Template not found: ${slug}`);
  }
  return template;
}

export function getTemplateConfig(slug: string) {
  return getTemplateBundle(slug);
}

export function getTemplateSections(slug: string) {
  return getTemplateBundle(slug).themeConfig.sections;
}

export function getTemplateTheme(slug: string) {
  return getTemplateBundle(slug).themeConfig;
}

export function getTemplatePages(slug: string) {
  const template = getTemplateBundle(slug);
  return generatePages(
    {
      businessName: template.name,
      businessCategory: template.category,
      industry: template.category,
      description: template.description,
    },
    template,
  );
}

export function getTemplateDemoData(slug: string) {
  const template = getTemplateBundle(slug);
  return {
    businessName: template.name,
    businessCategory: template.category,
    industry: template.category,
    description: template.description,
    products: [],
    services: [],
    targetAudience: "",
  };
}
