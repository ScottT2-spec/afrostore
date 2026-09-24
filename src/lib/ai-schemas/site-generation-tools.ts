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

export const setThemeSchema = z.object({
  vibe: z.string().min(1).describe("One word describing the visual feel, e.g. warm, bold, minimal, elegant, playful."),
  primaryColorHint: z.string().optional().describe("Optional color name/hex hint — the theme system picks the final palette, this is a preference, not a guarantee."),
});

export const setNavigationSchema = z.object({
  links: z.array(z.object({ label: z.string().min(1), pageSlug: z.string().min(1) })).min(1).max(8),
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
  number: z.string().min(8).describe("The merchant's WhatsApp number, digits and + only — ask_user first if the prompt didn't include one, never invent one."),
  enabled: z.boolean().default(true),
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
export type SetThemeArgs = z.infer<typeof setThemeSchema>;
export type SetNavigationArgs = z.infer<typeof setNavigationSchema>;
export type UpsertProductArgs = z.infer<typeof upsertProductSchema>;
export type RemoveProductArgs = z.infer<typeof removeProductSchema>;
export type SetWhatsappArgs = z.infer<typeof setWhatsappSchema>;
export type SetDeliveryZonesArgs = z.infer<typeof setDeliveryZonesSchema>;
export type SetPaymentStubArgs = z.infer<typeof setPaymentStubSchema>;
export type SetSeoArgs = z.infer<typeof setSeoSchema>;
export type AttachAssetArgs = z.infer<typeof attachAssetSchema>;
export type AskUserArgs = z.infer<typeof askUserSchema>;
export type FinalizeDraftArgs = z.infer<typeof finalizeDraftSchema>;
