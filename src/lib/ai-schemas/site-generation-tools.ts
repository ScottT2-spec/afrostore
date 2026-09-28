/**
 * Zod schemas for the site-generation agent's tool set — the PRD's §10.2
 * allowlist (create_page, update_section, set_theme, set_navigation,
 * upsert_product, remove_product, set_whatsapp, set_delivery_zones,
 * set_payment_stub, set_seo, attach_asset, ask_user, finalize_draft).
 *
 * This is deliberately NOT the coding agent's tool set. That one gives
 * the model list_files/read_file/write_file/run_command — arbitrary code
 * execution, explicitly ruled out for this PRD (NG1, FR-011: "not
 * arbitrary unmanaged code exec"; §10.3: "Forbidden: arbitrary shell").
 * Every tool below can only do exactly one specific, safe thing to the
 * site's structured data — nothing here can produce a state the
 * downstream renderer doesn't already know how to render.
 *
 * Section type vocabulary reuses ai-schemas/store-generation.ts's exact
 * enum, not a new one — that's the proven, theme-agnostic vocabulary
 * ai-layout-engine.ts already resolves into real per-theme blocks. Raw
 * per-theme block type names (e.g. "fashionHeroSlider") are NOT valid
 * here; a site's actual theme determines how these generic names render,
 * which is the whole point of keeping this vocabulary theme-agnostic.
 */

import { z } from "zod";

export const sectionTypeEnum = z.enum([
  "hero-image", "hero-minimal", "hero-split", "hero-bold",
  "products", "products-featured", "products-compact",
  "features", "stats", "testimonials", "story", "story-full",
  "newsletter", "trust", "banner", "gallery", "contact", "faq",
  "values", "team", "countdown",
]);

export const pageTypeEnum = z.enum(["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"]);

export const createPageSchema = z.object({
  type: pageTypeEnum.describe("Which kind of page — HOME must be unique per site."),
  title: z.string().min(1),
  sections: z.array(sectionTypeEnum).min(1).max(10).describe("Sections for this page, in order, from the same vocabulary set_theme/update_section use."),
});

export const updateSectionSchema = z.object({
  pageSlug: z.string().min(1).describe('Which page to edit, e.g. "home" or "about".'),
  sectionIndex: z.number().int().min(0).describe("0-based position of the section on that page — call create_page or read the current page first if unsure."),
  content: z.record(z.string(), z.unknown()).describe(
    'Field/value pairs to change on that section, e.g. {heroHeading: "New headline"}. Only include fields that are actually changing. ' +
    "For a merchant asking to restyle one specific piece of text (a caption/subtitle/subheading/title), change ONLY the matching field below — never use set_theme for a request scoped to one element, that changes the whole site's palette instead. " +
    "Every text field in every section type supports a matching '<field>Color' (hex, e.g. \"#111111\") and '<field>Italic' (boolean) pair — e.g. subheadingColor/subheadingItalic, titleColor/titleItalic, subtitleColor/subtitleItalic, headingColor/headingItalic, bodyColor/bodyItalic, itemTitleColor/itemTitleItalic, itemDescColor/itemDescItalic. Only set the pair for the exact field the merchant named. " +
    "Hero section fields: heading (+headingColor/headingItalic), subheading — the caption/subtitle text itself (+subheadingColor/subheadingItalic), textColor (overall fallback color), buttonText, buttonColor, buttonTextColor, badge. " +
    "Banner section fields: title (+titleColor/titleItalic), subtitle (+subtitleColor/subtitleItalic). " +
    "Gallery/ProductGrid/Features/Stats/Testimonials/Newsletter/Team/FAQ/ContactInfo/ContactForm sections: title (+titleColor/titleItalic), subtitle (+subtitleColor/subtitleItalic) where present. " +
    "Story/ImageText section fields: title (+headingColor/headingItalic), text (+bodyColor/bodyItalic). " +
    "Projects section fields: title (+titleColor/titleItalic), plus itemTitleColor/itemTitleItalic and itemDescColor/itemDescItalic applied to every project card's title/description. " +
    'Example — "make the hero caption italic and dark colored": {subheadingItalic: true, subheadingColor: "#1a1a1a"}. ' +
    'Example — "make the banner title italic": {titleItalic: true}.'
  ),
});

export const getSectionSchema = z.object({
  pageSlug: z.string().min(1).describe('Which page to read, e.g. "home" or "about".'),
  sectionIndex: z.number().int().min(0).optional().describe(
    "0-based position of the section. Omit to get a short outline of every section on the page (type + field paths) instead of one section in full."
  ),
});

export const sectionEditOpSchema = z.object({
  op: z.enum(["set", "remove", "insert"]).describe(
    '"set" = write a value at a path (creates the field if it does not exist yet, e.g. a new color or background image). ' +
    '"remove" = delete a field, or delete one list item. ' +
    '"insert" = add a new item into a list at an index (or at the end).'
  ),
  path: z.string().min(1).describe(
    'Dotted path INSIDE the section, exactly as get_section lists it. Lists use the item number: "heading", "buttonColor", "backgroundImage", "items.2.title", "items.0.image", "images.3". ' +
    'For "insert" the path is the LIST itself, e.g. "items".'
  ),
  value: z.unknown().optional().describe('The new value for "set" or the new item for "insert" (text, number, boolean, color hex, image URL, or an object for a whole list item). Not used by "remove".'),
  index: z.number().int().min(0).optional().describe('For "insert" only: position to insert at. Omit to append at the end.'),
  createIfMissing: z.boolean().optional().describe('Only for "set". A set on a field the section does not have is REJECTED (it is almost always a typo or a guessed name) and the error lists the real fields. Pass true only when you deliberately want to ADD a brand-new field. Color/italic/image/background style fields never need this.'),
});

export const editSectionSchema = z.object({
  pageSlug: z.string().min(1).describe('Which page to edit, e.g. "home" or "about".'),
  sectionIndex: z.number().int().min(0).describe("0-based position of the section on that page."),
  edits: z.array(sectionEditOpSchema).min(1).max(40).describe(
    "Every change to make on this section, applied together. If any one fails, none are saved and the error says which one, so fix it and resend."
  ),
});

export const findTextSchema = z.object({
  query: z.string().min(1).describe("Text to look for, exactly as the merchant wrote it (or a distinctive part of it). Case-insensitive; curly and straight quotes match each other."),
  pageSlug: z.string().optional().describe("Limit the search to one page. Omit to search every page of the site."),
});

export const replaceTextSchema = z.object({
  find: z.string().min(1).describe("The exact wording to replace, as the merchant wrote it."),
  replace: z.string().describe("The exact new wording, character for character as the merchant gave it. Do not rephrase, fix or improve it."),
  pageSlug: z.string().optional().describe("Limit to one page. Omit to replace on every page."),
  sectionIndex: z.number().int().min(0).optional().describe("Limit to one section (needs pageSlug). Use when the merchant pointed at one specific block."),
  matchCase: z.boolean().optional().describe("Default false (case-insensitive). Set true only if capitalization matters to the request."),
  wholeValue: z.boolean().optional().describe("Default false: replaces the wording anywhere inside a text. Set true to only change fields whose ENTIRE text is exactly `find` (e.g. a button that says just \"Shop\", leaving \"Shop local\" alone)."),
});

export const setThemeSchema = z.object({
  vibe: z.string().min(1).describe("One word describing the visual feel, e.g. warm, bold, minimal, elegant, playful."),
  primaryColorHint: z.string().optional().describe("Optional color name/hex hint — the theme system picks the final palette, this is a preference, not a guarantee."),
});

export const updateSiteInfoSchema = z.object({
  name: z.string().min(1).describe("The real business/store name, exactly as the merchant said it or as decided from their description. Call this as early as possible — before or alongside the first create_page — so the site's name shows up correctly in the merchant's dashboard sites list immediately, not only after Publish."),
  description: z.string().optional().describe("Optional one-line business description."),
});

export const setNavigationSchema = z.object({
  links: z.array(z.object({ label: z.string().min(1), pageSlug: z.string().min(1) })).min(1).max(8),
});

export const setPageNavVisibilitySchema = z.object({
  pageSlug: z.string().min(1).describe('Which page\'s nav link to show/hide, e.g. "contact" or "faq" — this does NOT delete or unpublish the page, it only removes its link from the nav bar. The page stays reachable by direct URL.'),
  showInNav: z.boolean().describe('false to remove this page from the nav bar (e.g. "remove the FAQ nav item" / "take contact out of the menu"), true to restore it.'),
});

export const upsertProductSchema = z.object({
  id: z.string().optional().describe("Omit to create a new product; include to update an existing one."),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
});

export const removeProductSchema = z.object({
  id: z.string().min(1),
});

// Africa-commerce defaults (FR-012, FR-060, FR-062) — the specific gap
// this agent exists to close versus the earlier generation pipeline,
// which never set either of these during generation at all.
export const setWhatsappSchema = z.object({
  number: z.string().min(8).describe("The merchant's WhatsApp number, digits and + only. Never ask for one and never invent one — the site-creation form already saved it if they gave one."),
  enabled: z.boolean().default(true),
});

export const setContactInfoSchema = z.object({
  email: z.string().email().optional().describe("The merchant's real contact email as they typed it in chat — never ask for one and never invent one."),
  phone: z.string().min(6).optional().describe("The merchant's real phone number, if different from their WhatsApp number."),
  address: z.string().optional().describe("The merchant's real business address/city, e.g. 'Lagos, Nigeria' — never invent a city the merchant hasn't stated."),
});

export const setSocialLinksSchema = z.object({
  instagram: z.string().url().optional().describe("Full Instagram profile URL, only if the merchant gave one."),
  facebook: z.string().url().optional().describe("Full Facebook page URL, only if the merchant gave one."),
  tiktok: z.string().url().optional().describe("Full TikTok profile URL, only if the merchant gave one."),
});

export const setDeliveryZonesSchema = z.object({
  zones: z.array(z.object({
    name: z.string().min(1).describe("Area name as the merchant said it, e.g. \"Gwarinpa\"."),
    fee: z.number().min(0).default(0).describe("Delivery fee in the store's currency — 0 if not specified, never guessed high."),
  })).min(1),
});

export const setPaymentStubSchema = z.object({
  mode: z.enum(["whatsapp_only", "stub", "connected"]).describe("connected requires the merchant to have already configured real gateway credentials — this tool only sets UI mode, it never enables live charging on its own."),
  preferredProvider: z.enum(["PAYSTACK", "FLUTTERWAVE", "MONNIFY"]).optional(),
});

export const setSeoSchema = z.object({
  pageSlug: z.string().min(1),
  title: z.string().min(10).max(70),
  description: z.string().min(50).max(165),
});


export const attachAssetSchema = z.object({
  pageSlug: z.string().min(1),
  sectionIndex: z.number().int().min(0),
  assetUrl: z.string().url(),
  field: z.string().min(1).describe('Which content field this image fills, e.g. "heroImage".'),
});

// The PRD's own lightweight-Plan mechanism (FR-005) — up to 3 clarifying
// questions before/during generation when a critical slot is missing
// (business name, currency/country, contact channel). Calling this ends
// the current turn and waits for the merchant's answer, same as any
// other tool call — it does not fall back to guessing.
export const askUserSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).max(4).optional().describe("Optional multiple-choice options; omit for a free-text question."),
});

export const finalizeDraftSchema = z.object({
  summary: z.string().min(1).describe("Short, merchant-facing summary of what was built."),
});

export type SectionType = z.infer<typeof sectionTypeEnum>;
export type CreatePageArgs = z.infer<typeof createPageSchema>;
export type UpdateSectionArgs = z.infer<typeof updateSectionSchema>;
export type FindTextArgs = z.infer<typeof findTextSchema>;
export type ReplaceTextArgs = z.infer<typeof replaceTextSchema>;
export type GetSectionArgs = z.infer<typeof getSectionSchema>;
export type EditSectionArgs = z.infer<typeof editSectionSchema>;
export type SetThemeArgs = z.infer<typeof setThemeSchema>;
export type SetNavigationArgs = z.infer<typeof setNavigationSchema>;
export type SetPageNavVisibilityArgs = z.infer<typeof setPageNavVisibilitySchema>;
export type UpsertProductArgs = z.infer<typeof upsertProductSchema>;
export type RemoveProductArgs = z.infer<typeof removeProductSchema>;
export type SetWhatsappArgs = z.infer<typeof setWhatsappSchema>;
export type SetSocialLinksArgs = z.infer<typeof setSocialLinksSchema>;
export type SetDeliveryZonesArgs = z.infer<typeof setDeliveryZonesSchema>;
export type SetPaymentStubArgs = z.infer<typeof setPaymentStubSchema>;
export type SetSeoArgs = z.infer<typeof setSeoSchema>;
export type AttachAssetArgs = z.infer<typeof attachAssetSchema>;
export type AskUserArgs = z.infer<typeof askUserSchema>;
export type FinalizeDraftArgs = z.infer<typeof finalizeDraftSchema>;
