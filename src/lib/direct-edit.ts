/**
 * Direct edits: the most common merchant request is "change <text> to <text>",
 * optionally "in the hero" / "on the home page". That needs no AI at all —
 * parse it, find the text on the site, replace it, done. It can't be
 * rate-limited, can't time out, and can't be "reinterpreted".
 *
 * SAFETY: a request is only handled here when the text to change is actually
 * FOUND on the site inside the named scope, and matches are few. Anything
 * unclear returns null and goes to the AI agent as before.
 */
import { findTextInBlocks, normalizeText, replaceTextInProps } from "@/lib/section-edit";

export interface DirectEditRequest {
  find: string;
  replace: string;
  /** Words the merchant used to narrow where (e.g. "hero", "home", "why choose us"). */
  scope?: string;
  /** True when the merchant put the text in quotes, i.e. wants it verbatim. */
  quoted: boolean;
}

export const BLOCK_ALIASES: Record<string, string[]> = {
  hero: ["hero", "hero section", "top section", "main banner"],
  banner: ["banner", "promo banner", "announcement bar"],
  features: ["features", "feature", "why choose us", "why choose", "benefits"],
  stats: ["stats", "statistics", "numbers"],
  testimonials: ["testimonials", "testimonial", "reviews"],
  imagetext: ["story", "our story", "image text", "about section"],
  newsletter: ["newsletter", "subscribe", "signup", "sign up"],
  trustbadges: ["trust badges", "badges"],
  gallery: ["gallery"],
  contactinfo: ["contact info", "contact details", "contact section"],
  faq: ["faq", "faqs", "questions"],
  team: ["team"],
  countdown: ["countdown", "timer"],
  productgrid: ["products", "product grid", "product section", "shop section"],
};

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Quoted token: "x", “x”, `x`, or 'x' (single quotes only when not an apostrophe inside a word). */
const QT = `(?:"([^"]+)"|\\u201C([^\\u201D]+)\\u201D|\`([^\`]+)\`|(?<![\\w])'([^']+)'(?![\\w]))`;
const VERB = `(?:change|replace|rename|edit|update|switch|make)`;
const QUOTED_RE = new RegExp(`^\\s*(?:please\\s+)?${VERB}\\s+(?:the\\s+)?(?:(?:text|word|words|label|button|heading|title|wording|line)\\s+)?${QT}\\s+(?:to|with|into|say|read)\\s+(?:just\\s+)?${QT}(.*)$`, "i");
const PLAIN_RE = new RegExp(`^\\s*(?:please\\s+)?${VERB}\\s+(?:the\\s+)?(?:(?:text|word|words|label|wording)\\s+)?(.+?)\\s+(?:to|with|into)\\s+(.+?)\\s*$`, "i");
const SCOPE_TAIL_RE = /^(.*\S)\s+(?:in|on|inside|within|at|from)\s+(?:the\s+)?(.+?)(?:\s+(?:block|section|page|area))?\s*[.!]?$/i;

const first = (m: RegExpMatchArray, from: number) => m.slice(from, from + 4).find((x) => x !== undefined) as string;

function stripFiller(s: string): string {
  return s.replace(/^\s*just\s+/i, "").replace(/\s+(please|pls|thanks|thank you)\s*[.!]?\s*$/i, "").replace(/[.!]+$/, "").trim();
}

export function knownScope(word: string, pageNames: string[]): boolean {
  const w = squash(word);
  if (!w) return false;
  if (Object.entries(BLOCK_ALIASES).some(([type, al]) => squash(type) === w || al.some((a) => squash(a) === w))) return true;
  return pageNames.some((p) => squash(p) === w || w === squash(p) + "page");
}

export function parseDirectEdit(task: string, pageNames: string[] = []): DirectEditRequest | null {
  const text = task.trim();
  if (!text || text.length > 400) return null;

  const q = text.match(QUOTED_RE);
  if (q) {
    const find = first(q, 1);
    const replace = first(q, 5);
    const tail = (q[9] || "").trim();
    let scope: string | undefined;
    if (tail) {
      const s = tail.match(/^(?:in|on|inside|within|at)\s+(?:the\s+)?(.+?)(?:\s+(?:block|section|page|area))?\s*[.!]?$/i);
      if (!s) return null; // trailing words we don't understand — let the AI handle it
      scope = s[1];
    }
    if (!find || replace === undefined) return null;
    return { find: find.trim(), replace, scope, quoted: true };
  }

  const p = text.match(PLAIN_RE);
  if (!p) return null;
  const find = stripFiller(p[1]);
  let rest = p[2];
  let scope: string | undefined;
  const st = rest.match(SCOPE_TAIL_RE);
  if (st && knownScope(st[2], pageNames)) {
    rest = st[1];
    scope = st[2];
  }
  // "…to X in the something block" where "something" isn't a scope we recognise:
  // the merchant is narrowing the location and we can't tell where. Let the AI ask.
  if (!scope && /\s+(?:in|on|inside|within)\s+the\s+.+\s+(?:block|section|page)\s*[.!]?$/i.test(rest)) return null;
  const replace = stripFiller(rest);
  if (!find || !replace) return null;
  return { find, replace, scope, quoted: false };
}

export interface DirectBlock { type?: string; props?: Record<string, unknown> }
export interface DirectPage { id: string; slug: string; title: string; content: DirectBlock[] }

function scopeMatches(scope: string, page: DirectPage, block: DirectBlock): "page" | "block" | null {
  const w = squash(scope);
  if (squash(page.slug) === w || squash(page.title) === w || w === squash(page.slug) + "page") return "page";
  const type = squash(block.type || "");
  for (const [t, al] of Object.entries(BLOCK_ALIASES)) {
    if (squash(t) === w || al.some((a) => squash(a) === w)) if (type === squash(t)) return "block";
  }
  return type && (type === w || type.includes(w)) ? "block" : null;
}

export interface DirectEditPlan {
  pages: Array<{ id: string; slug: string; title: string; content: DirectBlock[] }>;
  changes: Array<{ pageSlug: string; sectionIndex: number; blockType: string; path: string; before: string; after: string }>;
}

const MAX_DIRECT_MATCHES = 10;

/** Returns null when the request isn't safe to do without the AI (nothing found, too many matches, scope unknown). */
export function planDirectEdit(req: DirectEditRequest, pages: DirectPage[]): DirectEditPlan | null {
  const out: DirectEditPlan = { pages: [], changes: [] };
  let scopeHit = !req.scope;

  for (const page of pages) {
    const blocks = [...page.content];
    let pageChanged = false;
    blocks.forEach((block, i) => {
      if (req.scope) {
        const m = scopeMatches(req.scope, page, block);
        if (!m) return;
        scopeHit = true;
      }
      const hits = findTextInBlocks(page.slug, [block], req.find);
      if (hits.length === 0) return;

      // Casual typing ("order") over a capitalised original ("Order via WhatsApp") should keep the capital.
      let replacement = req.replace;
      const stored = hits[0].value.trim();
      if (!req.quoted && /^[A-Z]/.test(stored) && /^[a-z]/.test(replacement) && /^[a-z]/.test(req.find.trim())) {
        replacement = replacement[0].toUpperCase() + replacement.slice(1);
      }
      const r = replaceTextInProps(block.props || {}, req.find, replacement);
      if (r.changes.length === 0) return;
      blocks[i] = { ...block, props: r.props };
      pageChanged = true;
      for (const c of r.changes) out.changes.push({ pageSlug: page.slug, sectionIndex: i, blockType: block.type || "unknown", path: c.path, before: c.before, after: c.after });
    });
    if (pageChanged) out.pages.push({ id: page.id, slug: page.slug, title: page.title, content: blocks });
  }

  if (!scopeHit || out.changes.length === 0 || out.changes.length > MAX_DIRECT_MATCHES) return null;
  return out;
}

export function describeDirectEdit(req: DirectEditRequest, plan: DirectEditPlan): string {
  const c = plan.changes[0];
  const where = plan.changes.length === 1
    ? `the ${c.blockType} section${plan.pages.length ? ` on the ${c.pageSlug} page` : ""}`
    : `${plan.changes.length} places across ${plan.pages.length} page${plan.pages.length === 1 ? "" : "s"}`;
  return `Done \u2014 changed "${c.before.length > 60 ? c.before.slice(0, 60) + "\u2026" : c.before}" to "${c.after.length > 60 ? c.after.slice(0, 60) + "\u2026" : c.after}" in ${where}. It's live on your site now.`;
}

export { normalizeText };
