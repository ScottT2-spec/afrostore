/**
 * Site intent — what kind of site is actually being built, and the
 * concrete, checkable rules that follow from it.
 *
 * Source of truth: the site's own `siteType` field (SiteType enum:
 * ECOMMERCE | WEBSITE | LANDING_PAGE), set by the merchant when they
 * created the site — not re-guessed from the chat prompt on every
 * message. That's a real, already-authoritative signal; re-classifying
 * from scratch each turn would be both more expensive AND less reliable
 * than a choice the merchant already explicitly made.
 *
 * Every rule here exists in two forms:
 *   - `promptRules`: injected into the agent's system prompt for this run
 *   - a matching `validate()` check run against the ACTUAL resulting
 *     database state right before finalize_draft is allowed to succeed
 *
 * The prompt half alone is not enough — this whole feature exists
 * because prior guidance ("build pages that make sense") produced
 * inconsistent results, sometimes matching what was asked, sometimes
 * not. Only the validate() half turns "the model should do this" into
 * "the model cannot finish without doing this," the same enforcement
 * pattern already used for finish_task's quality checklist and the
 * mandatory pre-finish screenshot elsewhere in this codebase.
 */

import { prisma } from "@/lib/db";

export type SiteType = "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";

export interface SiteIntentViolation {
  rule: string;
  detail: string;
}

export interface SiteIntentRules {
  siteType: SiteType;
  /** Injected verbatim into the agent's system prompt for this run. */
  promptRules: string;
  /** Checks real DB state for this site against this type's rules. Returns [] if everything passes. */
  validate(siteId: string): Promise<SiteIntentViolation[]>;
}

const ECOMMERCE_RULES: SiteIntentRules = {
  siteType: "ECOMMERCE",
  promptRules: `SITE TYPE: E-COMMERCE STORE
- Build a real online store: Home, a Shop/products listing, and a Cart or Contact page at minimum — three pages is the floor, not a suggestion.
- Create at least 3 real sample products with upsert_product UNLESS the merchant already gave you their own specific product list — in that case, use exactly what they gave you, don't pad it with invented items.
- Real per-product pricing in the merchant's currency (NGN unless they said otherwise) — never a placeholder price like 0 or 1000 for every item.
- WhatsApp ordering (set_whatsapp) is the expected default contact/order channel for an African SMB store unless the merchant asked for something else.
- Never call set_payment_stub with mode "connected" as a guess — only if a gateway is already genuinely configured.`,
  async validate(siteId) {
    const violations: SiteIntentViolation[] = [];
    const [pageCount, productCount] = await Promise.all([
      prisma.page.count({ where: { siteId } }),
      prisma.product.count({ where: { siteId } }),
    ]);
    if (pageCount < 3) {
      violations.push({ rule: "min-pages", detail: `An e-commerce site needs at least 3 pages (Home, Shop, Cart/Contact) — this site has ${pageCount}.` });
    }
    if (productCount < 3) {
      violations.push({ rule: "min-products", detail: `An e-commerce site needs at least 3 products unless the merchant provided their own list — this site has ${productCount}. If the merchant genuinely only sells 1-2 items, that's fine, but confirm that's actually what they said before finalizing.` });
    }
    return violations;
  },
};

const WEBSITE_RULES: SiteIntentRules = {
  siteType: "WEBSITE",
  promptRules: `SITE TYPE: BUSINESS WEBSITE (not a store)
- Build Home plus at least 2 more pages that make sense for this business (About, Services, Contact, FAQ, etc.) — three pages is the floor.
- Do NOT create any products or a shop/cart — this is a services/information site, not a store. Only use upsert_product if the merchant explicitly described things they sell as products.
- Do NOT imply online payment is available ("Pay Now", "Order Online") unless the merchant explicitly asked for that — a business site's primary CTA is normally "Book", "Contact", or "WhatsApp us", not a checkout flow.
- WhatsApp (set_whatsapp) is the expected default booking/contact channel unless the merchant said otherwise.`,
  async validate(siteId) {
    const violations: SiteIntentViolation[] = [];
    const [pageCount, productCount] = await Promise.all([
      prisma.page.count({ where: { siteId } }),
      prisma.product.count({ where: { siteId } }),
    ]);
    if (pageCount < 3) {
      violations.push({ rule: "min-pages", detail: `A business site needs Home plus at least 2 more pages — this site has ${pageCount}.` });
    }
    if (productCount > 0) {
      violations.push({ rule: "no-products", detail: `This is a business/services site, not a store, but ${productCount} product(s) were created. Only acceptable if the merchant explicitly described things they sell — otherwise remove them.` });
    }
    return violations;
  },
};

const LANDING_PAGE_RULES: SiteIntentRules = {
  siteType: "LANDING_PAGE",
  promptRules: `SITE TYPE: LANDING PAGE (single page, not a multi-page site)
- Build ONE page (type LANDING) — a hero, a short benefits/features section, and ONE clear primary call-to-action (email capture or a WhatsApp button). A second page is only acceptable if it's a genuine thank-you/confirmation page after a form submit.
- Do NOT create a Shop, product catalog, or multi-page navigation — a landing page is a single scroll, not a store. Never call upsert_product for a landing page.
- Do NOT call set_payment_stub — a landing page is not a checkout flow.
- The single primary CTA must be specific and measurable (a real email capture form, or a wa.me WhatsApp link) — not a vague "Learn more" with nowhere real to go.`,
  async validate(siteId) {
    const violations: SiteIntentViolation[] = [];
    const [pageCount, productCount] = await Promise.all([
      prisma.page.count({ where: { siteId } }),
      prisma.product.count({ where: { siteId } }),
    ]);
    if (pageCount > 2) {
      violations.push({ rule: "max-pages", detail: `A landing page should be at most 2 pages (the landing page + an optional thank-you page) — this site has ${pageCount}. Remove the extra pages or fold their content into the single landing page.` });
    }
    if (pageCount === 0) {
      violations.push({ rule: "min-pages", detail: "No page was created at all — a landing page needs exactly one." });
    }
    if (productCount > 0) {
      violations.push({ rule: "no-products", detail: `A landing page should never have products — ${productCount} product(s) were created. Remove them; this isn't a store.` });
    }
    return violations;
  },
};

const RULES_BY_TYPE: Record<SiteType, SiteIntentRules> = {
  ECOMMERCE: ECOMMERCE_RULES,
  WEBSITE: WEBSITE_RULES,
  LANDING_PAGE: LANDING_PAGE_RULES,
};

export function getSiteIntentRules(siteType: string): SiteIntentRules {
  return RULES_BY_TYPE[siteType as SiteType] || WEBSITE_RULES;
}
