export type TemplateSiteType = "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";

const ECOMMERCE_CATEGORIES = new Set([
  "restaurant",
  "bakery",
  "fashion",
  "shoes",
  "accessories",
  "children",
  "electronics",
  "beauty",
  "beverage",
  "food & grocery",
  "health",
  "artsy",
  "digital services",
  "interior design",
]);
const LANDING_CATEGORIES = new Set(["landing page"]);
const WEBSITE_CATEGORIES = new Set(["business"]);

export function getTemplateSiteType(template: { category: string; slug: string }): TemplateSiteType {
  const category = template.category.trim().toLowerCase();
  const slug = template.slug.trim().toLowerCase();

  if (LANDING_CATEGORIES.has(category) || slug.startsWith("landing-")) return "LANDING_PAGE";
  if (ECOMMERCE_CATEGORIES.has(category)) return "ECOMMERCE";
  if (WEBSITE_CATEGORIES.has(category)) return "WEBSITE";
  // Default: ecommerce templates are the most common, but if it doesn't match
  // any known ecommerce category, treat as website
  return "WEBSITE";
}

export function templateMatchesSiteType(template: { category: string; slug: string }, siteType?: string | null): boolean {
  if (!siteType) return true;
  return getTemplateSiteType(template) === siteType;
}
