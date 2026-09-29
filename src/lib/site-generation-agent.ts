/**
 * The PRD's actual generation/edit mechanism (§10.2) — a tool-calling
 * loop constrained to exactly the 12 allowlisted site-mutation tools,
 * operating on the site's real structured data (Page rows, SiteSettings,
 * DeliveryZone rows, Product rows) through the existing block-rendering
 * system. This is deliberately NOT coding-agent.ts's approach: no
 * list_files/write_file/run_command, no sandbox, no generated source
 * code. NG1 rules that out explicitly for this feature; §10.3 forbids
 * "arbitrary shell, raw SQL." Every tool here can only ever do the one
 * specific, safe thing it's named for.
 *
 * The loop architecture (forced tool-calling every turn, corrective
 * retry via Zod validation, iteration cap) is the same proven pattern as
 * runCodingAgent() — that mechanism generalizes cleanly to any tool set;
 * only the tools themselves and what they're allowed to touch changes.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { parseDirectEdit, planDirectEdit, describeDirectEdit, type DirectPage } from "@/lib/direct-edit";
import { applySectionEdits, describeChanges, findTextInBlocks, replaceTextInProps, formatFlat, type TextHit } from "@/lib/section-edit";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/db";
import { loadSiteCustomizationSafely, normalizeSiteCustomization, mergeSiteCustomization } from "@/lib/site-customization";
import { AICapability } from "@/lib/failover";
import type { AIFailover, AIMessage, AITool } from "@/lib/failover";
import {
  sectionTypeEnum,
  createPageSchema,
  updateSectionSchema,
  updateSiteInfoSchema,
  setThemeSchema,
  setNavigationSchema,
  setPageNavVisibilitySchema,
  upsertProductSchema,
  removeProductSchema,
  setWhatsappSchema,
  setContactInfoSchema,
  setSocialLinksSchema,
  setDeliveryZonesSchema,
  setPaymentStubSchema,
  setSeoSchema,
  attachAssetSchema,
  getSectionSchema,
  editSectionSchema,
  findTextSchema,
  replaceTextSchema,
  askUserSchema,
  finalizeDraftSchema,
} from "@/lib/ai-schemas/site-generation-tools";
import { storeGenerationSchema } from "@/lib/ai-schemas/store-generation";
import { generateStructured, AIStructuredOutputError } from "@/lib/ai-structured-output";
import { buildDynamicHomePage } from "@/lib/ai-layout-engine";
import { getRandomIndustryImages } from "@/lib/ai-image-pools";

import { getSiteIntentRules, type SiteIntentRules } from "@/lib/site-intent";
import { detectSensitiveCategory, getGuardrailPromptRules, scanForSafetyViolations, extractTextFromContent, type SensitiveCategory } from "@/lib/site-safety";

function toToolParameters(schema: z.ZodType<unknown>): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" }) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return geminiSafe(jsonSchema) as Record<string, unknown>;
}

/** Some providers (Gemini) reject `default`, and properties with no `type`. Make every schema acceptable to all of them. */
function geminiSafe(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(geminiSafe);
  if (!node || typeof node !== "object") return node;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === "default") continue;
    out[k] = k === "properties" && v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v as Record<string, Record<string, unknown>>).map(([pk, pv]) => {
          const safe = geminiSafe(pv) as Record<string, unknown>;
          return [pk, "type" in safe || "anyOf" in safe || "enum" in safe ? safe : { ...safe, type: "string" }];
        }))
      : geminiSafe(v);
  }
  return out;
}

/** Edit turns send only the tools the request can plausibly need: every tool definition costs tokens on every call, and free-tier providers cap requests at ~8k tokens. */
const EDIT_CORE_TOOLS = ["get_section", "edit_section", "find_text", "replace_text", "ask_user", "finalize_draft"];
const EDIT_TOOL_GROUPS: Array<[RegExp, string[]]> = [
  [/\b(new page|add (a |another )?page|create (a |another )?page|page for)\b/i, ["create_page"]],
  [/\b(product|price|stock|item|sell|catalog|inventory|categor|collection)/i, ["upsert_product", "remove_product"]],
  [/\b(phone|email|address|whatsapp|contact|number|call us|location)\b/i, ["set_contact_info", "set_whatsapp"]],
  [/\b(instagram|facebook|tiktok|twitter|social|youtube)\b/i, ["set_social_links"]],
  [/\b(theme|vibe|palette|font|colou?r scheme|mood|whole site|entire site|overall look)\b/i, ["set_theme"]],
  [/\b(nav|menu|header|link|hide|remove .* page|page.*(menu|nav))\b/i, ["set_navigation", "set_page_nav_visibility"]],
  [/\b(seo|meta|google|search engine)\b/i, ["set_seo"]],
  [/\b(business name|store name|site name|rename|brand name)\b/i, ["update_site_info"]],
  [/\b(deliver|shipping|zone)\b/i, ["set_delivery_zones"]],
  [/(uploaded an image|image url|logo|photo|picture|upload)/i, ["attach_asset"]],
];
export function selectEditTools(requestText: string): AITool[] {
  const names = new Set(EDIT_CORE_TOOLS);
  for (const [re, tools] of EDIT_TOOL_GROUPS) if (re.test(requestText)) tools.forEach((t) => names.add(t));
  return TOOL_DEFS.filter((t) => names.has(t.function.name));
}

export const TOOL_DEFS: AITool[] = [
  { type: "function", function: { name: "create_page", description: "Add a new page with default sections, populated with real generated content — never a placeholder skeleton.", parameters: toToolParameters(createPageSchema) } },
  { type: "function", function: { name: "update_site_info", description: "Set the site's real business name (and optional description). Call this first, before create_page, as soon as you know the business name — this is what makes the site show up correctly in the merchant's dashboard sites list immediately, independent of Publish.", parameters: toToolParameters(updateSiteInfoSchema) } },
  { type: "function", function: { name: "update_section", description: "Change specific fields on one existing section of one page.", parameters: toToolParameters(updateSectionSchema) } },
  { type: "function", function: { name: "get_section", description: "Read a section's real content: every field as a dotted path with its current value. Omit sectionIndex for an outline of the page.", parameters: toToolParameters(getSectionSchema) } },
  { type: "function", function: { name: "edit_section", description: "Change anything on a section: any text, colors, images, button labels/links, or individual list items (set, remove, insert). Use paths from get_section.", parameters: toToolParameters(editSectionSchema) } },
  { type: "function", function: { name: "find_text", description: "Search the site (or one page) for visible text; returns page, section, block type and field path. Use first when the merchant quotes wording.", parameters: toToolParameters(findTextSchema) } },
  { type: "function", function: { name: "replace_text", description: "Exact find-and-replace of wording across the site, a page, or a section. Only visible words (never links/images/colors). Returns before to after.", parameters: toToolParameters(replaceTextSchema) } },
  { type: "function", function: { name: "set_theme", description: "Set the site's visual vibe/color direction.", parameters: toToolParameters(setThemeSchema) } },
  { type: "function", function: { name: "set_navigation", description: "Set the main nav links.", parameters: toToolParameters(setNavigationSchema) } },
  { type: "function", function: { name: "set_page_nav_visibility", description: "Show or hide a single page's link in the nav bar without deleting or unpublishing the page — use this for any request to remove/hide/take out one nav item (e.g. \"remove the FAQ from the menu\").", parameters: toToolParameters(setPageNavVisibilitySchema) } },
  { type: "function", function: { name: "upsert_product", description: "Add or update one product.", parameters: toToolParameters(upsertProductSchema) } },
  { type: "function", function: { name: "remove_product", description: "Remove one product.", parameters: toToolParameters(removeProductSchema) } },
  { type: "function", function: { name: "set_whatsapp", description: "Turn on WhatsApp ordering (and the floating WhatsApp button) with a real number. The site-creation form already saves the merchant's WhatsApp number when they gave one, so only call this if the merchant types a NEW or different number in chat. Never ask for a WhatsApp number and never invent one.", parameters: toToolParameters(setWhatsappSchema) } },
  { type: "function", function: { name: "set_contact_info", description: "Save the merchant's real contact email, phone, and/or address, and update the already-built contact page to show them. Only call this when the merchant types new or changed details in chat — the site-creation form already saves what they entered, so never ask for them and never invent an email, phone, or city.", parameters: toToolParameters(setContactInfoSchema) } },
  { type: "function", function: { name: "set_social_links", description: "Save the merchant's Instagram/Facebook/TikTok URLs so real brand icons appear in the site footer. Only pass fields the merchant actually gave you — never invent a URL.", parameters: toToolParameters(setSocialLinksSchema) } },
  { type: "function", function: { name: "set_delivery_zones", description: "Set the store's delivery areas and fees, from what the merchant actually said.", parameters: toToolParameters(setDeliveryZonesSchema) } },
  { type: "function", function: { name: "set_payment_stub", description: "Set checkout UI mode. 'connected' only takes effect if the merchant already has a real payment gateway configured — this tool cannot enable live charging on its own.", parameters: toToolParameters(setPaymentStubSchema) } },
  { type: "function", function: { name: "set_seo", description: "Set a page's SEO title/description.", parameters: toToolParameters(setSeoSchema) } },
  { type: "function", function: { name: "attach_asset", description: "Bind a merchant-uploaded (or generated) image to a specific section's image field on a specific page. Field name depends on the block type at that section: most blocks (hero, banner, features, testimonials, stats, newsletter, FAQ, team, contact, trustBadges) use \"backgroundImage\"; the imageText/story block uses \"image\"; gallery uses \"images\" (an array — pass a JSON array string of URLs, not attach_asset for a single one). Read the page's current sections first if you're not certain which index/type the merchant means.", parameters: toToolParameters(attachAssetSchema) } },
  { type: "function", function: { name: "ask_user", description: "Ask the merchant a clarifying question when a critical detail (business name or currency/country) is genuinely missing. Never use it for contact email, phone, address, or WhatsApp — those come from the site-creation form. Ends this turn and waits for their answer — never guess instead.", parameters: toToolParameters(askUserSchema) } },
  { type: "function", function: { name: "finalize_draft", description: "Call this once the site genuinely reflects what the merchant asked for. Ends the session.", parameters: toToolParameters(finalizeDraftSchema) } },
];

/** Clears Next's cache for the storefront so an AI edit shows up on the live site immediately, not after the cache expires. Never throws — a cache miss must not fail a saved edit. */
function revalidateStorefront(storeSlug: string, pageSlug: string): void {
  try {
    revalidatePath(`/store/${storeSlug}/${pageSlug}`);
    revalidatePath(`/store/${storeSlug}`);
    revalidatePath(`/store/${storeSlug}/pages/${pageSlug}`);
    revalidatePath(`/api/storefront/${storeSlug}/pages/${pageSlug}`);
    revalidatePath(`/api/storefront/${storeSlug}`);
  } catch {
    /* outside a Next request context (scripts/tests) — nothing to revalidate */
  }
}

/** True when the merchant explicitly wants a page thrown away and regenerated. Only then may create_page overwrite a page that already exists. */
const REBUILD_INTENT = /\b(rebuild|regenerate|re-generate|recreate|re-create|start over|start again|from scratch|redo the (whole|entire)|redesign the (whole|entire))\b/i;

const EDIT_MODE_RULES = `MODE: EDITING AN EXISTING, LIVE SITE. You are the merchant's site editor, not a site builder. The site is already built — your job is to change exactly what they asked for and nothing else.
- Do what the merchant said, literally and completely. If they name a piece of text (\"change 'Shop Now' to 'Order Today'\"), find that exact text and replace it with exactly what they gave you — same spelling, casing and wording, never a paraphrase or an \"improved\" version. If they describe a change (\"make the hero more elegant\", \"change the button to green\"), make that specific change to the fields that control it.
- Everything the merchant did NOT mention stays byte-for-byte the same. Never regenerate, rewrite, reorder or \"refresh\" sections, pages, products or the theme as a side effect of a small request.
- Pick the right tool for the request:
  * The merchant quotes or names wording (\"change 'Shop Now' to 'Order Today'\", \"change the line about free delivery\", \"replace our old phone number\"): call find_text to see exactly where it lives, then replace_text for a plain wording swap (add pageSlug/sectionIndex when they pointed at one spot, wholeValue when only a field that is exactly that text should change).
  * Structural or multi-field changes (colors, images, buttons, adding/removing/reordering list items, several changes in one block): call get_section for the exact paths and current values, then edit_section with ALL changes for that section in ONE call.
  * They describe a place instead of quoting text (\"the hero\", \"the 2nd testimonial\", \"the section under products\"): match it to the CURRENT SITE STATE list; if you can't tell which section, call get_section without sectionIndex to outline the page rather than guessing.
- Use the merchant's words exactly. The replacement text goes in character for character as they gave it — don't fix their spelling, don't polish, don't shorten. Only write new copy yourself when they ask you to (\"make it sound more premium\"), and then keep it in the site's existing voice and length.
- Colors: convert any color name or description to a hex value yourself (\"forest green\" -> #228B22, \"black\" -> #111111, \"white\" -> #FFFFFF). Keep text readable: don't put dark text on a dark background or light on light — if you change a background, check the text color fields with get_section and adjust them too. A text field's color lives in its own <field>Color key (headingColor, subheadingColor, buttonTextColor...).
- Images: use exactly the URL the merchant uploaded (see the rule about uploaded images below); never invent an image URL.
- A field the section doesn't have is rejected with a list of the fields it does have. Read that list, pick the right field, and retry; only use createIfMissing when you truly mean to add something new.
- After every write, read the before \u2192 after lines in the tool result and confirm they match what was asked. If a line is wrong, fix it with another call before you finish. If find_text finds nothing, try a shorter part of the wording or another page before telling the merchant it doesn't exist; footer text, the menu, social links, the WhatsApp number and product names/prices are not page sections and have their own tools.
- If the same text appears in several places and the merchant said \"everywhere\", \"all\" or didn't say where, change every occurrence. If they pointed at one specific place, change only that one.
- NEVER call create_page for a page that already exists, and never rebuild the site. Adding a genuinely NEW page or section the merchant asked for is fine. The build-from-scratch rules (minimum pages/products, starter catalog) do NOT apply to edits — do not add pages or products the merchant didn't ask for.
- Never say a change was made unless edit_section (or another tool) returned success in this session. If a call fails, read the error, fix the path or value, and retry. If something truly can't be located after checking get_section, say exactly what you looked for and ask one short question.
- When finished, call finalize_draft with a short, natural summary that names what you changed and where (e.g. \"Changed the hero heading to 'Fresh Bakes Daily' and turned the button green.\"). Sound like a sharp human assistant, not a template.`;

function buildEditSystemPrompt(safetyCategory: SensitiveCategory | null, summary: string, knownInfo?: string): string {
  const cap = (t: string, n: number) => (t.length > n ? t.slice(0, n) + "\n\u2026(more sections \u2014 use get_section to see them)" : t);
  return `MODE: EDITING AN EXISTING, LIVE SITE. You are the merchant's site editor. Change exactly what they ask, using the tools, and nothing else.
RULES
- Do precisely what was asked. Everything not mentioned stays unchanged. Use the merchant's exact wording (no rephrasing, fixing or polishing). Write new copy only if asked, in the site's voice.
- Quoted or named text: find_text, then replace_text (pageSlug/sectionIndex if they pointed at one spot; wholeValue for whole-field matches). Colors, images, buttons, list items or several fields: get_section, then ONE edit_section with all changes. "The hero"/"2nd testimonial": match the SITE list; if unsure, get_section without sectionIndex.
- "everywhere"/"all"/no place given: change every occurrence. Pointed at one spot: only that.
- Colors: convert names to hex (text color keys are <field>Color); keep text readable on the background. Images: only exact URLs the merchant uploaded.
- Unknown field errors list the real fields: pick one and retry (createIfMissing only for truly new fields).
- Check the before \u2192 after in each result; fix mismatches. Never say done without a success result. Not found: try shorter wording or other pages. Footer/menu/social/WhatsApp/products use their own tools; if no tool fits, say so plainly.
- Never create_page for an existing page or rebuild anything; don't add pages/products unasked. Don't ask for details listed below; ask at most one short question only if truly ambiguous.
- Default currency NGN. Finish with finalize_draft: a short natural summary of what changed and where.
${safetyCategory ? getGuardrailPromptRules(safetyCategory) : ""}${knownInfo ? "\nMERCHANT DETAILS (use directly):\n" + cap(knownInfo, 900) : ""}
SITE (page slug, section index, block type, preview):
${cap(summary, 3800)}`;
}

export function buildSystemPrompt(rules: SiteIntentRules, safetyCategory: SensitiveCategory | null, currentSiteSummary: string | null, knownInfo?: string): string {
  if (currentSiteSummary) return buildEditSystemPrompt(safetyCategory, currentSiteSummary, knownInfo);
  return `You are building a real e-commerce/business/landing site for an African SMB merchant, from their plain-language description. You can ONLY act through the tools you're given — there is no code, no files, nothing outside this specific tool set.

${currentSiteSummary ? EDIT_MODE_RULES : rules.promptRules}
${safetyCategory ? `\n${getGuardrailPromptRules(safetyCategory)}\n` : ""}
${knownInfo ? `\nALREADY PROVIDED BY THE MERCHANT — do not ask_user for any of this, use it directly:\n${knownInfo}\n` : ""}
${currentSiteSummary ? `\nCURRENT SITE STATE — this site already exists and is live. The merchant's message below is a request to CHANGE it, not build it from scratch. Read this before doing anything: it's every page, in order, and every section on each page with its 0-based index (the sectionIndex get_section and edit_section need) and a preview of its current content.\n\n${currentSiteSummary}\n\nWhen the merchant refers to something ("the hero", "the FAQ section", "that testimonial"), match it against the actual sections listed above rather than guessing an index. If they ask to change one page's wording/color/image, use get_section then edit_section on the matching page+index — don't call create_page for something that already exists (see the duplicate-page rule below). If what they're asking about genuinely isn't listed above, say so and ask, rather than assuming a section exists.\n` : ""}
Rules:
${!currentSiteSummary ? "- STRICT, HIGHEST PRIORITY: this is the initial build of a brand-new site. Do NOT call ask_user at all during this build, for anything — not business name, not currency, not social links, not product images, not anything else. Use exactly what the merchant's message/form gave you, and make a reasonable, clearly-labeled-as-default choice for everything else (stock/generated images for products, a sensible default currency/country, no social links if none were given). If something later turns out wrong, the merchant can correct it in chat after seeing the built site — that correction, not this first pass, is what ask_user and the other tools are for. Call update_site_info with the real business name as your very first tool call, before create_page, deciding the name from what the merchant said rather than asking.\n" : ""}- Default currency is NGN unless the merchant's prompt says otherwise.
- STRICT: when the merchant asks to change ANY detail of ANY section (a heading, any text, a color, the background image or an image, a button label or link, or one individual item like the 3rd feature or a single FAQ answer), you can change it \u2014 nothing on a section is off-limits. If you don't know the exact field path or its current value, call get_section first, then apply every change together with edit_section (use its set / remove / insert operations). Never tell the merchant something can't be changed without checking get_section first, and never claim a change is done unless edit_section returned success.\n- STRICT: every section on the homepage must have real content — never add or leave a section (features, testimonials, FAQ, values, or any other content block) with an empty or near-empty items list. A section with no content under its heading is a broken page. When using update_section on a content block, always include a fully populated items/content array — never set it to an empty list or omit it expecting old content to remain if you're changing that field.
- STRICT: if the merchant uploaded an image and told you which section to use it in (hero, testimonials, a named section, "this section", etc.), you MUST call attach_asset with that exact uploaded URL on that exact section — never substitute a stock photo, an AI-generated image, or a different section instead. This is a direct, literal instruction from the merchant, not a style preference — treat it as non-negotiable. If it's ambiguous which section they mean, ask_user rather than guessing wrong and using the image somewhere else.
- STRICT: never create two pages that serve the same nav purpose (e.g. two contact-style pages, two about-style pages) — this produces a duplicate, broken-looking nav bar. Before calling create_page, check the pages you already have in this session/site for one that already serves that purpose (by TYPE, not just title — ABOUT/FAQ/CONTACT/POLICY are one-per-site). If one exists, call update_section on it instead of create_page with a new title/slug for the same thing.
- STRICT: create_page must finish with a real, working page or not be reported as done. If a page's content generation fails or comes back empty/invalid, retry it immediately (same tool call, same page) rather than leaving a page that exists in the nav but errors when opened — a merchant clicking a nav link into "something went wrong" is a broken product, not an acceptable partial result. Only report a page as failed after retrying has genuinely been exhausted, and say so plainly rather than silently leaving a dead link.
- If the prompt names delivery areas, call set_delivery_zones with exactly those names — don't invent additional ones, don't skip ones they named.
- WhatsApp is an OPTIONAL field on the site-creation form. NEVER ask the merchant for a WhatsApp number. If the details block above lists a WhatsApp number, WhatsApp ordering and the floating WhatsApp button are already on — use that number in every contact section and "WhatsApp us" call to action. If it says none was given, don't add WhatsApp buttons or links at all. Only call set_whatsapp if the merchant types a new or different number in this conversation. Never invent a phone number.
- Contact details (email, phone, address) come from the site-creation form and are listed above when provided. Use them exactly as written in every contact section, the contact page, and the footer — never write a fake email like hello@example.com or a made-up address or city. If a detail wasn't given, leave that line out instead of inventing one. Only call set_contact_info if the merchant types new or changed contact details in this conversation.
${currentSiteSummary ? "- If the merchant hasn't given Instagram, Facebook, or TikTok yet (via the form or earlier in this conversation), you may ask_user once whether they have any to link. If they give any, call set_social_links with exactly those URLs so real brand icons appear in the footer. Don't invent a URL, and don't ask again if they already said \"no\"/skipped it.\n" : "- Don't ask about Instagram/Facebook/TikTok during this build (see the no-ask_user rule above) — if none were given on the form, just leave the footer without them. If the merchant volunteers any in chat afterward, call set_social_links with exactly those URLs.\n"}
- Never call set_payment_stub with mode "connected" as a guess — that only matters if the merchant already has a real gateway configured, which you cannot cause to happen from here.
- create_page must produce real, specific, on-brand content immediately — never placeholder/lorem-ipsum text. A merchant should recognize their own business in the copy, not see generic filler.
- On an existing site (edit turns only — see the no-ask_user rule above for a brand-new build), use ask_user (max 3 times per session) only for genuinely critical missing information — business name, currency/country if ambiguous. Never ask for contact email, phone, address, or WhatsApp (they come from the form). Don't ask about things you can reasonably default.
- If the merchant asks for something the available tools genuinely can't do, say so plainly and directly — don't respond with a clarifying question as a way of avoiding the "I can't do that" answer.
- Call finalize_draft only once the site actually reflects the request AND satisfies every rule under SITE TYPE above — don't finalize a half-built or wrong-shaped site. finalize_draft will be rejected with specific corrections if it doesn't, so get it right rather than guessing you're done.`;
}

/**
 * A compact, token-cheap snapshot of everything already on this site —
 * every page, in section order, with each section's index and a short
 * preview of its current text. This is what lets a merchant come back
 * weeks later and say "change the hero heading" and have the agent
 * actually know what page/sectionIndex/current-value that refers to,
 * instead of starting an editing session with zero knowledge of the
 * site it's editing (previously the agent had no way to see current
 * content at all — every edit was a guess).
 *
 * Kept intentionally short per section (a handful of key fields, values
 * truncated) rather than dumping full block JSON — this goes into the
 * system prompt on every single turn of the session, so its size is a
 * real cost, not a one-time read.
 */
const PREVIEW_FIELDS = ["heading", "title", "subheading", "subtitle", "text", "badge", "buttonText"] as const;

function truncate(value: unknown, max = 60): string {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function summarizeSection(props: Record<string, unknown> | undefined, index: number, type: string): string {
  if (!props) return `  [${index}] ${type}`;
  const parts: string[] = [];
  for (const field of PREVIEW_FIELDS) {
    const value = props[field];
    if (typeof value === "string" && value.trim()) parts.push(`${field}: "${truncate(value)}"`);
  }
  const items = props.items;
  if (Array.isArray(items) && items.length > 0) {
    parts.push(`${items.length} item${items.length === 1 ? "" : "s"}`);
  }
  return `  [${index}] ${type}${parts.length > 0 ? " — " + parts.join(", ") : ""}`;
}

async function summarizeCurrentSite(siteId: string): Promise<string | null> {
  const pages = await prisma.page.findMany({
    where: { siteId },
    select: { title: true, slug: true, type: true, content: true },
    orderBy: { position: "asc" },
  });
  if (pages.length === 0) return null; // genuinely new site — nothing to summarize, this is the initial build

  return pages
    .map((page: { title: string; slug: string; type: string; content: unknown }) => {
      const blocks = Array.isArray(page.content) ? (page.content as Array<{ type?: string; props?: Record<string, unknown> }>) : [];
      const sectionLines = blocks.length > 0
        ? blocks.map((b, i) => summarizeSection(b.props, i, b.type || "unknown")).join("\n")
        : "  (no sections)";
      return `Page "${page.slug}" (${page.type}, title: "${page.title}"):\n${sectionLines}`;
    })
    .join("\n\n")
    .split("\n").map((l: string) => (l.length > 130 ? l.slice(0, 130) + "\u2026" : l)).join("\n");
}

export interface SiteGenerationStep {
  tool: string;
  args: unknown;
  result: string;
  isError: boolean;
}

export interface SiteGenerationResult {
  summary: string;
  steps: SiteGenerationStep[];
  provider: string;
  model: string;
  /** Set when the agent called ask_user — caller should surface this and resume with the answer, not treat it as failure. */
  pendingQuestion?: { question: string; options?: string[] };
  /** The full message history at this point — required to resume a paused (pendingQuestion) run via priorMessages. Without it, no caller could ever construct a valid resume input. */
  messages: AIMessage[];
}

export class SiteGenerationError extends Error {}

export interface RunSiteGenerationOptions {
  ai: AIFailover;
  siteId: string;
  storeName: string;
  storeSlug: string;
  industry: string;
  /** The site's own SiteType (ECOMMERCE | WEBSITE | LANDING_PAGE) — the merchant's own choice at site creation, the authoritative signal for what structural shape this generation should produce. */
  siteType: string;
  task: string;
  /** Plain-text summary of what the merchant already filled in the site-creation form (e.g. social media links) — pass so the agent doesn't ask_user for something already provided. Omit/undefined if nothing to report. */
  knownInfo?: string;
  maxIterations?: number;
  /** Resume a session after ask_user — prior message history from the same run. */
  priorMessages?: AIMessage[];
  /** Called after every tool executes — for streaming live progress to a UI. */
  onStep?: (step: SiteGenerationStep) => void;
  /** Checked at the top of every iteration — return true to stop the run immediately (a merchant-triggered cancel). */
  shouldCancel?: () => Promise<boolean>;
}

export async function runSiteGenerationAgent(opts: RunSiteGenerationOptions): Promise<SiteGenerationResult> {
  const { ai, siteId, storeSlug, industry, siteType, task, knownInfo, maxIterations = 15, priorMessages, onStep, shouldCancel } = opts;
  // Mutable: update_site_info can rename the site mid-session, and every
  // subsequent create_page call below should use the real name in its
  // generated content, not the placeholder this session started with.
  let storeName = opts.storeName;
  const rules = getSiteIntentRules(siteType);
  const safetyMatch = detectSensitiveCategory(`${task} ${industry}`);
  const safetyCategory = safetyMatch?.tier === "guardrail" ? safetyMatch.category : null;

  // Only fetched for a fresh session (priorMessages is how an in-progress
  // ask_user round-trip resumes — the summary from the FIRST message of
  // that session is still accurate enough, and re-fetching it on every
  // resume would be wasted work). Returns null for a genuinely new site
  // with no pages yet, in which case the prompt stays exactly as before.
  const currentSiteSummary = priorMessages?.length ? null : await summarizeCurrentSite(siteId);

  // Edit mode = the site already had pages when this session STARTED. On a
  // resumed session the summary isn't re-fetched, so read the mode from the
  // original system prompt instead of guessing from current DB state
  // (mid-build, pages exist too, and that must not flip a build into edit mode).
  const firstPrior = priorMessages?.[0];
  const isEditMode = priorMessages?.length
    ? firstPrior?.role === "system" && typeof firstPrior.content === "string" && firstPrior.content.includes("MODE: EDITING AN EXISTING, LIVE SITE")
    : currentSiteSummary !== null;
  const allowRebuild = REBUILD_INTENT.test(task);

  const messages: AIMessage[] = priorMessages?.length
    ? [...priorMessages, { role: "user", content: task }]
    : [
        { role: "system", content: buildSystemPrompt(rules, safetyCategory, currentSiteSummary, knownInfo) },
        { role: "user", content: task },
      ];

  const steps: SiteGenerationStep[] = [];

  // FAST PATH — "change X to Y (in the hero)" needs no AI. If the text is
  // really on the site (and the match is small and unambiguous) do it directly:
  // instant, no tokens, can't be rate-limited or misread. Anything unclear
  // falls through to the agent below exactly as before.
  if (isEditMode && !priorMessages?.length && !allowRebuild) {
    try {
      const rows = await prisma.page.findMany({ where: { siteId }, select: { id: true, slug: true, title: true, content: true }, orderBy: { position: "asc" } });
      const pages: DirectPage[] = (rows as Array<{ id: string; slug: string; title: string; content: unknown }>).map((r) => ({
        id: r.id, slug: r.slug, title: r.title, content: Array.isArray(r.content) ? (r.content as DirectPage["content"]) : [],
      }));
      const req = parseDirectEdit(task, pages.flatMap((p) => [p.slug, p.title]));
      const unsafe = req && safetyCategory ? scanForSafetyViolations(safetyCategory, req.replace).some((v) => v.rule === "forbidden-phrase") : false;
      const plan = req && !unsafe ? planDirectEdit(req, pages) : null;
      if (req && plan) {
        for (const pg of plan.pages) {
          await prisma.page.update({ where: { id: pg.id }, data: { content: pg.content as object } });
          await prisma.pageVersion.create({ data: { pageId: pg.id, title: pg.title, content: pg.content as object } });
          revalidateStorefront(storeSlug, pg.slug);
        }
        const summary = describeDirectEdit(req, plan);
        const step: SiteGenerationStep = {
          tool: "replace_text",
          args: { find: req.find, replace: plan.changes[0].after, scope: req.scope },
          result: plan.changes.map((c) => `${c.pageSlug} #${c.sectionIndex} (${c.blockType}) ${c.path}: ${JSON.stringify(c.before)} \u2192 ${JSON.stringify(c.after)}`).join("\n"),
          isError: false,
        };
        steps.push(step);
        onStep?.(step);
        return { summary, steps, provider: "direct-edit", model: "rule-based", messages: [] };
      }
    } catch (err) {
      // Never let the shortcut break an edit: fall back to the AI agent.
      console.error("Direct edit path failed, falling back to agent:", err);
    }
  }
  let lastProvider = "";
  let lastModel = "";
  let askCount = priorMessages?.filter((m) => m.role === "assistant" && m.toolCalls?.some((t) => t.function.name === "ask_user")).length || 0;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (shouldCancel && (await shouldCancel())) {
      throw new SiteGenerationError("Generation was cancelled.");
    }
    const routingText = messages.filter((m) => m.role === "user").map((m) => (typeof m.content === "string" ? m.content : "")).join("\n");
    const callAI = () =>
      ai.chat({
        capability: AICapability.FUNCTION_CALLING,
        messages,
        tools: isEditMode ? selectEditTools(routingText) : TOOL_DEFS,
        toolChoice: "required",
        maxTokens: isEditMode ? 1500 : 4096,
        temperature: 0.5,
      });
    let result = await callAI();
    // Free-tier providers rate-limit per minute; a short wait usually clears it.
    for (const wait of [8000, 16000]) {
      if (result.success && result.data) break;
      const msg = result.failedProviders?.map((f) => f.error).join(" ") || "";
      if (!/rate_limit|429|413|tokens per minute|TPM/i.test(msg)) break;
      await new Promise((r) => setTimeout(r, wait));
      result = await callAI();
    }

    if (!result.success || !result.data) {
      const errors = result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
      throw new SiteGenerationError(`AI request failed: ${errors}`);
    }

    lastProvider = result.data.provider;
    lastModel = result.data.model;

    const toolCalls = result.data.toolCalls;
    if (!toolCalls || toolCalls.length === 0) {
      messages.push({ role: "assistant", content: result.data.content || "" });
      messages.push({ role: "user", content: "You must call one of the available tools — do not reply with plain text." });
      continue;
    }

    messages.push({ role: "assistant", content: "", toolCalls });

    for (const call of toolCalls) {
      const { name, arguments: rawArgs } = call.function;
      let args: unknown;
      try {
        args = JSON.parse(rawArgs);
      } catch {
        const step: SiteGenerationStep = { tool: name, args: rawArgs, result: "Arguments were not valid JSON.", isError: true };
        steps.push(step);
        onStep?.(step);
        messages.push({ role: "tool", toolCallId: call.id, content: step.result });
        continue;
      }

      if (name === "ask_user") {
        const parsed = askUserSchema.safeParse(args);
        if (parsed.success) {
          askCount++;
          if (askCount > 3) {
            messages.push({ role: "tool", toolCallId: call.id, content: "You've already asked 3 questions this session — proceed with a reasonable default instead of asking again." });
            continue;
          }
          return {
            summary: "",
            steps,
            provider: lastProvider,
            model: lastModel,
            pendingQuestion: { question: parsed.data.question, options: parsed.data.options },
            messages,
          };
        }
      }

      if (name === "finalize_draft") {
        const parsed = finalizeDraftSchema.safeParse(args);
        if (parsed.success) {
          const violations = isEditMode ? [] : await rules.validate(siteId);
          if (violations.length > 0) {
            // Same enforcement shape as the coding agent's quality
            // checklist and mandatory screenshot: a self-reported "done"
            // is not accepted when the actual database state
            // demonstrably doesn't match this site type's rules. Tell it
            // exactly what's wrong and force another iteration to
            // actually fix it, rather than finalizing a wrong-shaped site.
            const message = `finalize_draft was rejected — the actual site doesn't match its site type's rules yet:\n${violations.map((v) => `- ${v.detail}`).join("\n")}\nFix these, then call finalize_draft again.`;
            messages.push({ role: "tool", toolCallId: call.id, content: message });
            const rejectionStep: SiteGenerationStep = { tool: name, args, result: message, isError: true };
            steps.push(rejectionStep);
            onStep?.(rejectionStep);
            continue;
          }

          if (safetyCategory) {
            // Real check against the actual generated text, not the
            // prompt's instructions — the copy came from a separate
            // nested LLM call that could ignore or drift from guardrail
            // wording, same reasoning as site-intent's DB-state check.
            const pages = await prisma.page.findMany({ where: { siteId }, select: { content: true } });
            const allText = pages.map((p: { content: unknown }) => extractTextFromContent(p.content)).join(" \n ");
            const safetyViolations = scanForSafetyViolations(safetyCategory, allText);
            if (safetyViolations.length > 0) {
              const message = `finalize_draft was rejected — this is a regulated business category with mandatory content rules that aren't met yet:\n${safetyViolations.map((v) => `- ${v.detail}`).join("\n")}\nFix these, then call finalize_draft again.`;
              messages.push({ role: "tool", toolCallId: call.id, content: message });
              const rejectionStep: SiteGenerationStep = { tool: name, args, result: message, isError: true };
              steps.push(rejectionStep);
              onStep?.(rejectionStep);
              continue;
            }
          }

          return { summary: parsed.data.summary, steps, provider: lastProvider, model: lastModel, messages };
        }
      }

      const { result: toolResult, isError } = await executeTool(siteId, storeName, storeSlug, industry, ai, name, args, safetyCategory, { isEditMode, allowRebuild });
      if (name === "update_site_info" && !isError && args && typeof (args as { name?: unknown }).name === "string") {
        storeName = (args as { name: string }).name;
      }
      const step: SiteGenerationStep = { tool: name, args, result: toolResult, isError };
      steps.push(step);
      onStep?.(step);
      messages.push({ role: "tool", toolCallId: call.id, content: toolResult });
    }
  }

  throw new SiteGenerationError(`Site generation did not finish within ${maxIterations} iterations.`);
}

async function executeTool(
  siteId: string,
  storeName: string,
  storeSlug: string,
  industry: string,
  ai: AIFailover,
  name: string,
  args: unknown,
  safetyCategory: SensitiveCategory | null,
  mode: { isEditMode: boolean; allowRebuild: boolean } = { isEditMode: false, allowRebuild: false }
): Promise<{ result: string; isError: boolean }> {
  try {
    switch (name) {
      case "update_site_info": {
        const parsed = updateSiteInfoSchema.parse(args);
        await prisma.site.update({
          where: { id: siteId },
          data: { name: parsed.name, ...(parsed.description ? { description: parsed.description } : {}) },
        });
        return { result: `Site name set to "${parsed.name}". It now shows correctly in the dashboard sites list.`, isError: false };
      }
      case "create_page": {
        const parsed = createPageSchema.parse(args);

        // For one-per-site page types, force the slug of whatever page of
        // that type already exists rather than trusting the AI to reuse a
        // consistent title across calls — the actual duplicate-nav bug was
        // the same page type getting created twice under two different
        // titles/slugs ("Contact Us" vs "Get In Touch"), which no amount
        // of prompt instruction alone reliably prevents.
        const ONE_PER_SITE = new Set(["HOME", "ABOUT", "FAQ", "CONTACT", "POLICY"]);
        let slug = parsed.type === "HOME" ? "home" : parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (ONE_PER_SITE.has(parsed.type)) {
          const existingOfType = await prisma.page.findFirst({ where: { siteId, type: parsed.type as any }, select: { slug: true } });
          if (existingOfType) slug = existingOfType.slug;
        }

        // Editing a live site: create_page on a page that already exists
        // REPLACES its whole content with freshly generated copy — that is
        // the "I asked for one small change and it rebuilt everything" bug.
        // Refuse it unless the merchant explicitly asked to rebuild.
        if (mode.isEditMode && !mode.allowRebuild) {
          const already = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug } }, select: { id: true } });
          if (already) {
            return {
              result: `Refused: the page "${slug}" already exists and create_page would overwrite ALL of its current content. The merchant asked for a change, not a rebuild. Call get_section (omit sectionIndex to outline the page), then change only what they asked with edit_section.`,
              isError: true,
            };
          }
        }

        // Real content, not a structural skeleton — generate it scoped to
        // exactly the requested sections, reusing the same schema/prompt
        // already proven for full-site generation (ai-schemas/store-generation.ts),
        // just constrained to fewer fields per call.
        const whatsappSettings = await prisma.siteSettings.findUnique({ where: { siteId }, select: { whatsappNumber: true } });
        //
        // Forced to actually succeed: a page that exists in the nav but
        // errors when opened is a broken product, not an acceptable
        // partial result — retry generation before ever giving up, and
        // never upsert empty/invalid content that would crash the
        // storefront render.
        let blocks: ReturnType<typeof buildDynamicHomePage> | null = null;
        let lastError: unknown = null;
        for (let attempt = 0; attempt < 3 && !blocks; attempt++) {
          try {
            const content = await generateStructured({
              ai,
              schema: storeGenerationSchema,
              toolName: "generate_page_content",
              toolDescription: `Generates real, on-brand content for a ${parsed.type} page with these sections: ${parsed.sections.join(", ")}.`,
              systemPrompt: `You are a senior brand copywriter. Always call generate_page_content — never reply with plain text. Never write placeholder/lorem-ipsum copy.${safetyCategory ? `\n\n${getGuardrailPromptRules(safetyCategory)}` : ""}`,
              userPrompt: `Business: ${storeName} (${industry}). Page: "${parsed.title}" (${parsed.type}). Sections in order: ${parsed.sections.join(", ")}. Write real, specific content — no generic filler.`,
              maxTokens: 6000,
              temperature: attempt === 0 ? 0.7 : 0.4, // steadier on retry
            });

            const images = getRandomIndustryImages(industry);
            const candidate = buildDynamicHomePage(
              { ...content.data, layout: { sections: parsed.sections, vibe: content.data.layout?.vibe || "clean" } },
              storeName,
              storeSlug,
              industry,
              images,
              whatsappSettings?.whatsappNumber || undefined
            );
            if (Array.isArray(candidate) && candidate.length > 0) {
              blocks = candidate;
            } else {
              lastError = new Error("Generated page came back with zero blocks");
            }
          } catch (err) {
            lastError = err;
          }
        }

        if (!blocks) {
          return { result: `Couldn't build a working "${parsed.title}" page after retrying — not creating a broken nav link. Error: ${lastError instanceof Error ? lastError.message : String(lastError)}`, isError: true };
        }

        const created = await prisma.page.upsert({
          where: { siteId_slug: { siteId, slug } },
          // Live by default — the page is fully editable afterward (this
          // same upsert's `update` branch, plus update_section) regardless
          // of isPublished; that flag only controls whether the public
          // storefront route serves it, not whether it can be changed.
          create: { siteId, slug, title: parsed.title, type: parsed.type, template: "ai", content: blocks as object, isPublished: true },
          update: { title: parsed.title, template: "ai", content: blocks as object },
        });
        // Snapshot the resulting state, not the pre-change one — undo
        // restores "the version before this one", so what matters is
        // having a walkable trail of every real state this page has
        // been in, starting from its very first creation.
        await prisma.pageVersion.create({ data: { pageId: created.id, title: created.title, content: created.content as object } });

        revalidateStorefront(storeSlug, slug);
        return { result: `Created page "${parsed.title}" (${slug}) with ${parsed.sections.length} sections.`, isError: false };
      }

      case "update_section": {
        const parsed = updateSectionSchema.parse(args);
        const page = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug: parsed.pageSlug } } });
        if (!page) return { result: `No page with slug "${parsed.pageSlug}" exists — call create_page first.`, isError: true };

        const blocks = Array.isArray(page.content) ? [...(page.content as Record<string, unknown>[])] : [];
        if (parsed.sectionIndex >= blocks.length) {
          return { result: `Page "${parsed.pageSlug}" only has ${blocks.length} sections (0-${blocks.length - 1}) — sectionIndex ${parsed.sectionIndex} doesn't exist.`, isError: true };
        }
        // The storefront renderer (BlockRenderer.tsx) reads each block's
        // `props` field — every block the generator produces (ai-layout-
        // engine.ts, ai-store-generator.ts) is shaped {id, type, props}.
        // This used to merge edits into a `settings` field instead, which
        // nothing renders: update_section would report success and save a
        // PageVersion, but the live storefront never actually changed —
        // exactly the "I asked the AI to change it and nothing happened"
        // bug. Merge into `props`, the field the renderer really reads.
        const target = blocks[parsed.sectionIndex] as { props?: Record<string, unknown> };
        blocks[parsed.sectionIndex] = { ...target, props: { ...(target.props || {}), ...parsed.content } };

        await prisma.page.update({ where: { id: page.id }, data: { content: blocks as object } });
        await prisma.pageVersion.create({ data: { pageId: page.id, title: page.title, content: blocks as object } });
        revalidateStorefront(storeSlug, parsed.pageSlug);
        return { result: `Updated section ${parsed.sectionIndex} on "${parsed.pageSlug}".`, isError: false };
      }

      case "get_section": {
        const parsed = getSectionSchema.parse(args);
        const page = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug: parsed.pageSlug } } });
        if (!page) return { result: `No page with slug "${parsed.pageSlug}" exists.`, isError: true };
        const blocks = Array.isArray(page.content) ? (page.content as Array<{ type?: string; props?: Record<string, unknown> }>) : [];
        if (parsed.sectionIndex === undefined) {
          const outline = blocks.map((b, i) => `[${i}] ${b.type || "unknown"}\n${formatFlat(b.props || {}, 50)}`).join("\n");
          return { result: `Page "${parsed.pageSlug}" has ${blocks.length} sections:\n${outline || "(none)"}`, isError: false };
        }
        if (parsed.sectionIndex >= blocks.length) return { result: `Page "${parsed.pageSlug}" only has ${blocks.length} sections (0-${blocks.length - 1}).`, isError: true };
        const b = blocks[parsed.sectionIndex];
        return { result: `Section ${parsed.sectionIndex} on "${parsed.pageSlug}" (type: ${b.type || "unknown"}). Editable fields (path = current value):\n${formatFlat(b.props || {}, 300).slice(0, 5000)}`, isError: false };
      }

      case "edit_section": {
        const parsed = editSectionSchema.parse(args);
        const page = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug: parsed.pageSlug } } });
        if (!page) return { result: `No page with slug "${parsed.pageSlug}" exists \u2014 call create_page first.`, isError: true };
        const blocks = Array.isArray(page.content) ? [...(page.content as Record<string, unknown>[])] : [];
        if (parsed.sectionIndex >= blocks.length) {
          return { result: `Page "${parsed.pageSlug}" only has ${blocks.length} sections (0-${blocks.length - 1}) \u2014 sectionIndex ${parsed.sectionIndex} doesn't exist.`, isError: true };
        }
        const target = blocks[parsed.sectionIndex] as { props?: Record<string, unknown> };
        const applied = applySectionEdits(target.props || {}, parsed.edits);
        if (applied.error) return { result: `Nothing was changed. ${applied.error}`, isError: true };

        // Same sensitive-category guardrail the build applies, on the new text only.
        if (safetyCategory) {
          const newText = parsed.edits.map((e) => (typeof e.value === "string" ? e.value : e.value ? JSON.stringify(e.value) : "")).join(" \n ");
          const violations = scanForSafetyViolations(safetyCategory, newText).filter((v) => v.rule === "forbidden-phrase");
          if (violations.length > 0) return { result: `Nothing was changed. ${violations.map((v) => v.detail).join(" ")}`, isError: true };
        }

        blocks[parsed.sectionIndex] = { ...target, props: applied.props };
        await prisma.page.update({ where: { id: page.id }, data: { content: blocks as object } });
        await prisma.pageVersion.create({ data: { pageId: page.id, title: page.title, content: blocks as object } });
        revalidateStorefront(storeSlug, parsed.pageSlug);
        return { result: `Saved and live. Applied ${applied.changes.length} change${applied.changes.length === 1 ? "" : "s"} to section ${parsed.sectionIndex} (${(target as { type?: string }).type || "unknown"}) on "${parsed.pageSlug}":\n${describeChanges(applied.changes)}\nIf any line isn't what the merchant asked for, fix it now with another edit_section call.`, isError: false };
      }

      case "find_text": {
        const parsed = findTextSchema.parse(args);
        const pages = await prisma.page.findMany({
          where: { siteId, ...(parsed.pageSlug ? { slug: parsed.pageSlug } : {}) },
          select: { slug: true, content: true },
          orderBy: { position: "asc" },
        });
        if (parsed.pageSlug && pages.length === 0) return { result: `No page with slug "${parsed.pageSlug}" exists.`, isError: true };
        const hits: TextHit[] = pages.flatMap((pg: { slug: string; content: unknown }) =>
          findTextInBlocks(pg.slug, Array.isArray(pg.content) ? (pg.content as Array<{ type?: string; props?: Record<string, unknown> }>) : [], parsed.query),
        );
        if (hits.length === 0) {
          return {
            result: `"${parsed.query}" was not found in any page section${parsed.pageSlug ? ` on "${parsed.pageSlug}"` : ""}. Try a shorter or different part of the wording, or call get_section without sectionIndex to outline a page. Site-wide items (nav menu, social links, WhatsApp, product names/prices) are not page sections \u2014 use set_navigation, set_social_links, set_whatsapp or upsert_product for those.`,
            isError: false,
          };
        }
        const shown = hits.slice(0, 40).map((h) => `- page "${h.pageSlug}", section ${h.sectionIndex} (${h.blockType}), path ${h.path} = ${JSON.stringify(h.value.length > 120 ? h.value.slice(0, 120) + "\u2026" : h.value)}`);
        return { result: `Found ${hits.length} match${hits.length === 1 ? "" : "es"} for "${parsed.query}":\n${shown.join("\n")}${hits.length > 40 ? `\n(+${hits.length - 40} more)` : ""}\nNext: replace_text for a plain wording swap (add pageSlug/sectionIndex to limit it); edit_section for colors, images or list items.`, isError: false };
      }

      case "replace_text": {
        const parsed = replaceTextSchema.parse(args);
        if (parsed.sectionIndex !== undefined && !parsed.pageSlug) return { result: "sectionIndex needs pageSlug too.", isError: true };
        if (safetyCategory) {
          const violations = scanForSafetyViolations(safetyCategory, parsed.replace).filter((v) => v.rule === "forbidden-phrase");
          if (violations.length > 0) return { result: `Nothing was changed. ${violations.map((v) => v.detail).join(" ")}`, isError: true };
        }
        const pages = await prisma.page.findMany({
          where: { siteId, ...(parsed.pageSlug ? { slug: parsed.pageSlug } : {}) },
          select: { id: true, slug: true, title: true, content: true },
          orderBy: { position: "asc" },
        });
        if (parsed.pageSlug && pages.length === 0) return { result: `No page with slug "${parsed.pageSlug}" exists.`, isError: true };

        const report: string[] = [];
        let total = 0;
        const toSave: Array<{ id: string; slug: string; title: string; blocks: Record<string, unknown>[] }> = [];
        for (const pg of pages as Array<{ id: string; slug: string; title: string; content: unknown }>) {
          const blocks = Array.isArray(pg.content) ? [...(pg.content as Record<string, unknown>[])] : [];
          if (parsed.sectionIndex !== undefined && parsed.sectionIndex >= blocks.length) {
            return { result: `Page "${pg.slug}" only has ${blocks.length} sections (0-${blocks.length - 1}).`, isError: true };
          }
          let pageChanged = false;
          blocks.forEach((b, i) => {
            if (parsed.sectionIndex !== undefined && i !== parsed.sectionIndex) return;
            const blk = b as { type?: string; props?: Record<string, unknown> };
            const r = replaceTextInProps(blk.props || {}, parsed.find, parsed.replace, { matchCase: parsed.matchCase, wholeValue: parsed.wholeValue });
            if (r.changes.length === 0) return;
            blocks[i] = { ...blk, props: r.props };
            pageChanged = true;
            for (const c of r.changes) {
              total++;
              if (report.length < 25) report.push(`- page "${pg.slug}", section ${i} (${blk.type || "unknown"}), ${c.path}: ${JSON.stringify(c.before.length > 70 ? c.before.slice(0, 70) + "\u2026" : c.before)} \u2192 ${JSON.stringify(c.after.length > 70 ? c.after.slice(0, 70) + "\u2026" : c.after)}`);
            }
          });
          if (pageChanged) toSave.push({ id: pg.id, slug: pg.slug, title: pg.title, blocks });
        }
        if (total === 0) {
          return { result: `Nothing was changed: "${parsed.find}" wasn't found${parsed.wholeValue ? " as a complete field value" : ""}${parsed.pageSlug ? ` on "${parsed.pageSlug}"` : ""}. Call find_text with a shorter part of the wording to see where it actually is.`, isError: true };
        }
        for (const pg of toSave) {
          await prisma.page.update({ where: { id: pg.id }, data: { content: pg.blocks as object } });
          await prisma.pageVersion.create({ data: { pageId: pg.id, title: pg.title, content: pg.blocks as object } });
          revalidateStorefront(storeSlug, pg.slug);
        }
        return { result: `Saved and live. Replaced ${total} occurrence${total === 1 ? "" : "s"} across ${toSave.length} page${toSave.length === 1 ? "" : "s"}:\n${report.join("\n")}${total > report.length ? `\n(+${total - report.length} more)` : ""}`, isError: false };
      }

      case "set_theme": {
        const parsed = setThemeSchema.parse(args);
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, themeSettings: parsed as object },
          update: { themeSettings: parsed as object },
        });
        return { result: `Theme set: ${parsed.vibe}${parsed.primaryColorHint ? ` (${parsed.primaryColorHint})` : ""}.`, isError: false };
      }

      case "set_navigation": {
        const parsed = setNavigationSchema.parse(args);
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, navigationSettings: parsed as object },
          update: { navigationSettings: parsed as object },
        });
        return { result: `Navigation set: ${parsed.links.map((l) => l.label).join(", ")}.`, isError: false };
      }

      case "set_page_nav_visibility": {
        const parsed = setPageNavVisibilitySchema.parse(args);
        const existing = normalizeSiteCustomization(
          await loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId } }))
        );
        const merged = mergeSiteCustomization(existing, {
          pageSettings: { [parsed.pageSlug]: { showInNavigation: parsed.showInNav } },
        });
        await prisma.siteCustomization.upsert({
          where: { siteId },
          create: { siteId, pageSettings: merged.pageSettings as object },
          update: { pageSettings: merged.pageSettings as object },
        });
        return { result: `"${parsed.pageSlug}" ${parsed.showInNav ? "shown in" : "removed from"} the nav bar. The page itself is untouched.`, isError: false };
      }

      case "upsert_product": {
        const parsed = upsertProductSchema.parse(args);
        const slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (!parsed.id) {
          // This tool can be called any number of times across any number
          // of chat turns, with nothing else limiting how many products a
          // site ends up with — that's how a site could reach well beyond
          // 10 despite creation-time seeding being capped. Enforce the
          // real limit at the actual write point, not just at creation.
          const existingCount = await prisma.product.count({ where: { siteId } });
          if (existingCount >= 10) {
            return { result: `Can't add "${parsed.name}" — this store already has ${existingCount} products, at the 10-product limit. Remove or update an existing product instead of adding a new one.`, isError: true };
          }
        }
        const product = parsed.id
          ? await prisma.product.update({
              where: { id: parsed.id },
              data: { name: parsed.name, description: parsed.description, price: parsed.price, compareAtPrice: parsed.compareAtPrice, images: parsed.images, stock: parsed.stock },
            })
          : await prisma.product.create({
              data: { siteId, name: parsed.name, slug, description: parsed.description, price: parsed.price, compareAtPrice: parsed.compareAtPrice, images: parsed.images, stock: parsed.stock, status: "ACTIVE" },
            });
        return { result: `${parsed.id ? "Updated" : "Created"} product "${product.name}" (${product.id}).`, isError: false };
      }

      case "remove_product": {
        const parsed = removeProductSchema.parse(args);
        await prisma.product.delete({ where: { id: parsed.id } });
        return { result: `Removed product ${parsed.id}.`, isError: false };
      }

      case "set_whatsapp": {
        const parsedRaw = setWhatsappSchema.parse(args);
        const siteCountry = (await prisma.site.findUnique({ where: { id: siteId }, select: { country: true } }))?.country;
        const wa = normalizePhone(parsedRaw.number, siteCountry);
        if (!wa.ok) return { result: `That WhatsApp number can't be used: ${wa.reason} Nothing was saved.`, isError: true };
        const parsed = { ...parsedRaw, number: wa.e164 };
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, whatsappNumber: parsed.number, whatsappOrdering: parsed.enabled },
          update: { whatsappNumber: parsed.number, whatsappOrdering: parsed.enabled },
        });

        // Patch any already-built homepage contactInfo block too — it was
        // generated before this number existed, so it either has no
        // WhatsApp item or the old broken placeholder. Without this, the
        // merchant sets a number and the homepage keeps showing/missing a
        // dead WhatsApp link until the next full regeneration.
        const homePage = await prisma.page.findFirst({ where: { siteId, type: "HOME" } });
        if (homePage && Array.isArray(homePage.content)) {
          const blocks = homePage.content as Array<{ type: string; props: Record<string, unknown> }>;
          let changed = false;
          for (const b of blocks) {
            if (b.type === "contactInfo" && Array.isArray(b.props?.items)) {
              const items = b.props.items as Array<{ icon: string; value: string }>;
              const existing = items.find((i) => i.icon === "message" || i.icon === "whatsapp");
              if (existing) {
                if (existing.value !== parsed.number) { existing.value = parsed.number; changed = true; }
              } else if (parsed.enabled) {
                items.unshift({ icon: "message", title: "WhatsApp", value: parsed.number } as { icon: string; value: string });
                changed = true;
              }
            }
          }
          if (changed) {
            await prisma.page.update({ where: { id: homePage.id }, data: { content: blocks as object } });
          }
        }

        return { result: `WhatsApp ordering ${parsed.enabled ? "enabled" : "disabled"} with number ${parsed.number}.`, isError: false };
      }

      case "set_contact_info": {
        const parsed = setContactInfoSchema.parse(args);
        if (parsed.phone) {
          const siteCountry = (await prisma.site.findUnique({ where: { id: siteId }, select: { country: true } }))?.country;
          const ph = normalizePhone(parsed.phone, siteCountry);
          if (!ph.ok) return { result: `That phone number can't be used: ${ph.reason} Nothing was saved.`, isError: true };
          parsed.phone = ph.e164;
        }
        if (!parsed.email && !parsed.phone && !parsed.address) {
          return { result: "No email, phone, or address given — nothing saved.", isError: false };
        }
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: {
            siteId,
            ...(parsed.email ? { contactEmail: parsed.email } : {}),
            ...(parsed.phone ? { contactPhone: parsed.phone } : {}),
            ...(parsed.address ? { contactAddress: parsed.address } : {}),
          },
          update: {
            ...(parsed.email ? { contactEmail: parsed.email } : {}),
            ...(parsed.phone ? { contactPhone: parsed.phone } : {}),
            ...(parsed.address ? { contactAddress: parsed.address } : {}),
          },
        });

        // Same reasoning as set_whatsapp above: patch the already-built
        // contactInfo block on Home and Contact directly, so the merchant
        // doesn't have to regenerate the whole page to see their real
        // details replace whatever the AI guessed (or a stale placeholder).
        const pagesToPatch = await prisma.page.findMany({ where: { siteId, type: { in: ["HOME", "CONTACT"] } } });
        for (const p of pagesToPatch) {
          if (!Array.isArray(p.content)) continue;
          const blocks = p.content as Array<{ type: string; props: Record<string, unknown> }>;
          let changed = false;
          for (const b of blocks) {
            if (b.type !== "contactInfo" || !Array.isArray(b.props?.items)) continue;
            const items = b.props.items as Array<{ icon: string; title: string; value: string }>;
            const upsertItem = (icon: string, title: string, value: string) => {
              const existing = items.find((i) => i.icon === icon);
              if (existing) { if (existing.value !== value) { existing.value = value; changed = true; } }
              else { items.push({ icon, title, value }); changed = true; }
            };
            if (parsed.email) upsertItem("mail", "Email", parsed.email);
            if (parsed.phone) upsertItem("phone", "Phone", parsed.phone);
            if (parsed.address) upsertItem("map-pin", "Address", parsed.address);
          }
          if (changed) {
            await prisma.page.update({ where: { id: p.id }, data: { content: blocks as object } });
          }
        }

        const saved = [parsed.email && "email", parsed.phone && "phone", parsed.address && "address"].filter(Boolean).join(", ");
        return { result: `Saved contact info (${saved}) and updated the contact page.`, isError: false };
      }

      case "set_social_links": {
        const parsed = setSocialLinksSchema.parse(args);
        const fields: Record<string, string> = {};
        if (parsed.instagram) fields.instagram = parsed.instagram;
        if (parsed.facebook) fields.facebook = parsed.facebook;
        if (parsed.tiktok) fields.tiktok = parsed.tiktok;
        if (Object.keys(fields).length === 0) {
          return { result: "No social links given — nothing saved.", isError: false };
        }
        await prisma.siteSocialLinks.upsert({
          where: { siteId },
          create: { siteId, ...fields },
          update: fields,
        });
        return { result: `Saved social links: ${Object.keys(fields).join(", ")}. Icons will now show in the footer.`, isError: false };
      }

      case "set_delivery_zones": {
        const parsed = setDeliveryZonesSchema.parse(args);
        await prisma.deliveryZone.deleteMany({ where: { siteId } });
        await prisma.deliveryZone.createMany({
          data: parsed.zones.map((z, i) => ({ siteId, name: z.name, areas: [z.name], fee: z.fee, position: i })),
        });
        return { result: `Set ${parsed.zones.length} delivery zone(s): ${parsed.zones.map((z) => z.name).join(", ")}.`, isError: false };
      }

      case "set_payment_stub": {
        const parsed = setPaymentStubSchema.parse(args);
        if (parsed.mode === "connected") {
          const gateway = parsed.preferredProvider
            ? await prisma.paymentGateway.findUnique({ where: { siteId_provider: { siteId, provider: parsed.preferredProvider } } })
            : await prisma.paymentGateway.findFirst({ where: { siteId, isEnabled: true } });
          if (!gateway?.isEnabled) {
            return { result: `No payment gateway is actually configured for this store yet — checkout will show "Order via WhatsApp" / "Configure payments" instead. This is expected for a new store, not an error to fix here.`, isError: false };
          }
        }
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, payOnDelivery: parsed.mode !== "connected", bankTransfer: parsed.mode !== "connected" },
          update: { payOnDelivery: parsed.mode !== "connected", bankTransfer: parsed.mode !== "connected" },
        });
        return { result: `Checkout mode set to ${parsed.mode}.`, isError: false };
      }

      case "set_seo": {
        const parsed = setSeoSchema.parse(args);
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: parsed.pageSlug } },
          data: { metaTitle: parsed.title, metaDescription: parsed.description },
        });
        return { result: `SEO set for "${parsed.pageSlug}".`, isError: false };
      }

      case "attach_asset": {
        const parsed = attachAssetSchema.parse(args);
        const page = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug: parsed.pageSlug } } });
        if (!page) return { result: `No page with slug "${parsed.pageSlug}" exists.`, isError: true };
        const blocks = Array.isArray(page.content) ? [...(page.content as Record<string, unknown>[])] : [];
        if (parsed.sectionIndex >= blocks.length) return { result: `Section ${parsed.sectionIndex} doesn't exist on "${parsed.pageSlug}".`, isError: true };
        // Every block reads its fields from `props` (heading, backgroundImage,
        // image, items, etc.) — there is no `settings` field anywhere in the
        // render path. Writing to `settings` silently did nothing: the
        // merchant's uploaded image was "attached" but never actually
        // appeared anywhere on the live site.
        const target = blocks[parsed.sectionIndex] as { props?: Record<string, unknown> };
        blocks[parsed.sectionIndex] = { ...target, props: { ...(target.props || {}), [parsed.field]: parsed.assetUrl } };
        await prisma.page.update({ where: { id: page.id }, data: { content: blocks as object } });
        return { result: `Set ${parsed.field} on section ${parsed.sectionIndex} of "${parsed.pageSlug}" to the uploaded image.`, isError: false };
      }

      default:
        return { result: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { result: `Invalid arguments: ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`, isError: true };
    }
    if (err instanceof AIStructuredOutputError) {
      return { result: `Content generation failed: ${err.message}`, isError: true };
    }
    return { result: err instanceof Error ? err.message : String(err), isError: true };
  }
}
