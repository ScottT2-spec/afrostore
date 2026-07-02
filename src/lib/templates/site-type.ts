export type TemplateSiteType = "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";

const ECOMMERCE_CATEGORIES = new Set(["ecommerce"]);
const LANDING_CATEGORIES = new Set(["landing page"]);

export function getTemplateSiteType(template: { category: string; slug: string }): TemplateSiteType {
  const category = template.category.trim().toLowerCase();
  const slug = template.slug.trim().toLowerCase();

  if (LANDING_CATEGORIES.has(category) || slug.startsWith("landing-")) return "LANDING_PAGE";
  if (ECOMMERCE_CATEGORIES.has(category)) return "ECOMMERCE";
  return "WEBSITE";
}

export function templateMatchesSiteType(template: { category: string; slug: string }, siteType?: string | null): boolean {
  if (!siteType) return true;
  return getTemplateSiteType(template) === siteType;
}
