import { getFamilyTemplateBySlug, TEMPLATE_CATEGORIES, TEMPLATE_FAMILY_ALIASES, TEMPLATE_FAMILIES } from "./families";

export { TEMPLATE_CATEGORIES, TEMPLATE_FAMILY_ALIASES };
export const INTERNAL_TEMPLATES = TEMPLATE_FAMILIES;

export function getInternalTemplateBySlug(slug: string) {
  return getFamilyTemplateBySlug(slug);
}

