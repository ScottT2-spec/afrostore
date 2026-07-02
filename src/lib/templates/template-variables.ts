/**
 * Template Variable Substitution Engine
 * 
 * Replaces {{variable_name}} placeholders in raw HTML templates
 * with actual merchant/store data before serving.
 * 
 * Variables use double-curly-brace syntax: {{store_name}}, {{hero_title}}, etc.
 * Unresolved variables are left as-is (so defaults in the HTML remain).
 */

export interface TemplateVariables {
  // ─── Store Identity ───
  store_name: string;
  store_description: string;
  store_logo: string;
  store_slug: string;
  store_url: string;

  // ─── Branding / Theme ───
  primary_color?: string;
  accent_color?: string;

  // ─── Contact ───
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  whatsapp_number: string;
  whatsapp_link: string;

  // ─── Social ───
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_tiktok: string;
  social_youtube: string;
  social_linkedin: string;

  // ─── Hero / Landing ───
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  cta_url: string;

  // ─── About ───
  about_title: string;
  about_description: string;

  // ─── Meta ───
  meta_title: string;
  meta_description: string;
  copyright_year: string;

  // ─── Business Type ───
  business_type: string;
  industry: string;

  // ─── Misc ───
  [key: string]: string | undefined;
}

/**
 * Replace all {{variable}} placeholders in HTML with values from the variables map.
 * 
 * - Only replaces variables that have a non-empty value
 * - Variables not in the map are left as `{{variable_name}}` (preserving defaults)
 * - Supports optional default syntax: {{variable_name|Default Text}}
 */
export function substituteTemplateVariables(
  html: string,
  variables: Partial<TemplateVariables>
): string {
  return html.replace(
    /\{\{(\w+)(?:\|([^}]*))?\}\}/g,
    (_match, varName: string, defaultValue?: string) => {
      const value = variables[varName];
      if (value !== undefined && value !== "") {
        return escapeHtml(value);
      }
      // Use default value if provided, otherwise leave the placeholder
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return _match; // leave unresolved
    }
  );
}

/**
 * Build the full variables map from store/site data.
 * This is called from the API route with all available store context.
 */
export function buildTemplateVariables(data: {
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  storeSlug: string;
  whatsappNumber?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactPhone?: string;
  businessType?: string;
  industry?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  heroTitle?: string;
  heroSubtitle?: string;
  aboutDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}): Partial<TemplateVariables> {
  const whatsappClean = data.whatsappNumber?.replace(/[^0-9+]/g, "") || "";

  return {
    // Identity
    store_name: data.storeName,
    store_description: data.storeDescription || "",
    store_logo: data.storeLogo || "",
    store_slug: data.storeSlug,
    store_url: `/store/${data.storeSlug}`,

    // Contact
    contact_phone: data.contactPhone || data.whatsappNumber || "",
    contact_email: data.contactEmail || "",
    contact_address: data.contactAddress || "",
    whatsapp_number: data.whatsappNumber || "",
    whatsapp_link: whatsappClean ? `https://wa.me/${whatsappClean.replace("+", "")}` : "",

    // Social
    social_instagram: data.socialLinks?.instagram || "",
    social_facebook: data.socialLinks?.facebook || "",
    social_twitter: data.socialLinks?.twitter || "",
    social_tiktok: data.socialLinks?.tiktok || "",
    social_youtube: data.socialLinks?.youtube || "",
    social_linkedin: data.socialLinks?.linkedin || "",

    // Hero / Landing
    hero_title: data.heroTitle || data.storeName,
    hero_subtitle: data.heroSubtitle || data.storeDescription || "",
    cta_text: "Shop Now",
    cta_url: `/store/${data.storeSlug}/shop`,

    // About
    about_title: `About ${data.storeName}`,
    about_description: data.aboutDescription || data.storeDescription || "",

    // Meta
    meta_title: data.metaTitle || data.storeName,
    meta_description: data.metaDescription || data.storeDescription || "",
    copyright_year: new Date().getFullYear().toString(),

    // Business
    business_type: data.businessType || "",
    industry: data.industry || "",
  };
}

/**
 * Escape HTML special characters to prevent XSS in substituted values.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * List all {{variable}} placeholders found in an HTML string.
 * Useful for debugging / admin UI showing which variables a template uses.
 */
export function extractTemplateVariables(html: string): string[] {
  const matches = html.matchAll(/\{\{(\w+)(?:\|[^}]*)?\}\}/g);
  const vars = new Set<string>();
  for (const match of matches) {
    vars.add(match[1]);
  }
  return Array.from(vars).sort();
}
