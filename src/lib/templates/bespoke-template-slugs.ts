const BESPOKE_TEMPLATE_SLUGS = new Set([
  "fashion",
  "fashion-colored",
  "handmade-bags",
  "t-shirts-prints",
  "electronics",
  "electronics-accessories",
  "hardware",
  "tools",
  "bakery",
  "sweets-bakery",
  "cosmetics",
  "makeup",
  "grocery",
  "vegetables",
  "health",
  "pills",
  "interior",
  "decor",
  "retail",
  "kids",
  "toys",
  "perfumes",
]);

export function isBespokeTemplateSlug(templateSlug?: string | null): boolean {
  if (!templateSlug) return false;
  return BESPOKE_TEMPLATE_SLUGS.has(templateSlug.toLowerCase());
}

export function listBespokeTemplateSlugs(): string[] {
  return Array.from(BESPOKE_TEMPLATE_SLUGS);
}
