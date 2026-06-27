/**
 * Shared mapping from template slugs to their HTML file locations.
 * Used by both TemplatePreview and the storefront template-html API.
 */

// Templates with raw HTML previews extracted from reference sites (preview.html in /templates/<slug>/)
export const RAW_PREVIEW_SLUGS = new Set([
  "jewellery-elegance",
  "vegetables-market", "grocery-market",
  "makeup-beauty", "perfume-store", "cosmetics-boutique",
  "pottery-artisan", "handmade-crafts", "handmade-bags",
  "tshirts-prints", "fashion-colored", "fashion-classic",
  "pills-health",
  "tech-accessories", "tools-hardware", "electronics-hub", "hardware-pro",
  "kids-fashion", "toy-world",
  "home-decor", "retail-general",
  "wine-cellar", "drinks-store",
  "sweets-bakery",
  "food-delivery", "event-agency",
]);

// Map template slugs to the folder name where preview.html lives
export const RAW_PREVIEW_FOLDER: Record<string, string> = {
  "jewellery-elegance": "jewellery",
  "vegetables-market": "vegetables",
  "grocery-market": "grocery",
  "makeup-beauty": "makeup",
  "perfume-store": "perfumes",
  "cosmetics-boutique": "cosmetics",
  "pottery-artisan": "pottery",
  "handmade-crafts": "handmade",
  "handmade-bags": "handmade-bags",
  "tshirts-prints": "tshirts",
  "fashion-colored": "fashion-colored",
  "fashion-classic": "fashion",
  "pills-health": "pills",
  "tech-accessories": "electronics-acc",
  "tools-hardware": "tools",
  "electronics-hub": "electronics",
  "hardware-pro": "hardware",
  "kids-fashion": "kids",
  "toy-world": "toys",
  "home-decor": "decor",
  "retail-general": "retail",
  "wine-cellar": "wine",
  "drinks-store": "drinks",
  "sweets-bakery": "sweets-bakery",
  "food-delivery": "food-delivery",
  "event-agency": "event-agency",
};

// Maps template slugs to their static site folders in /templates/sites/
export const STATIC_SITE_MAP: Record<string, string> = {
  clarity: "clarity",
  arsha: "arsha",
  medicare: "medicare",
  travely: "travely",
  rival: "rival",
  workfolio: "workfolio",
  strada: "strada",
  bistro: "bistro",
  nutrio: "nutrio",
  "landing-gadget": "landing-gadget",
  "landing-health": "landing-health",
  "landing-saas-minimal": "landing-saas-minimal",
  "landing-wellness": "landing-wellness",
  "landing-artsy": "landing-artsy",
  "landing-dev-portfolio": "landing-dev-portfolio",
  "landing-kids": "landing-kids",
  "landing-tech-saas": "landing-tech-saas",
  "landing-travel": "landing-travel",
};

/**
 * Given a template slug, return the path to its HTML file (relative to /public),
 * or null if no HTML template exists.
 */
export function getTemplateHtmlPath(templateSlug: string): string | null {
  // Check raw preview templates first (e-commerce)
  if (RAW_PREVIEW_SLUGS.has(templateSlug)) {
    const folder = RAW_PREVIEW_FOLDER[templateSlug];
    if (folder) return `/templates/${folder}/preview.html`;
  }
  // Check static site templates (business/landing)
  const staticFolder = STATIC_SITE_MAP[templateSlug];
  if (staticFolder) return `/templates/sites/${staticFolder}/index.html`;
  return null;
}

/**
 * Check if a template slug has an HTML template available.
 */
export function hasTemplateHtml(templateSlug: string | null | undefined): boolean {
  if (!templateSlug) return false;
  return RAW_PREVIEW_SLUGS.has(templateSlug) || templateSlug in STATIC_SITE_MAP;
}
