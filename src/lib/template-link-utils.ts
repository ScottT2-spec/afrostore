/**
 * Shared link resolution utilities for all template blocks.
 *
 * Handles:
 * - "#" → /store/{slug}/shop
 * - "/shop" → /store/{slug}/shop
 * - "shop" (bare word) → /store/{slug}/shop
 * - "/blog" → /store/{slug}/blog
 * - "/store/..." → pass through
 * - "http..." → pass through (external)
 * - null/undefined/empty → fallback
 */

const coerceLink = (link: unknown): string => {
  if (typeof link === "string") return link;
  if (typeof link === "number" || typeof link === "boolean") return String(link);
  return "";
};

/** Resolve any link to a proper store-scoped path.
 * isLandingOnly: for templates with no real shop/product catalog (Aegis,
 * Landing Gadget, Prokip Agent, Prokip Booking) — an unresolved "#"
 * placeholder should stay a no-op instead of defaulting to /shop, since
 * that page won't have anything meaningful on it for these sites.
 */
export function resolveStoreLink(link: unknown, storeSlug: string | null | undefined, isLandingOnly = false): string {
  const normalized = coerceLink(link).trim();

  // External links pass through
  if (normalized && (normalized.startsWith("http://") || normalized.startsWith("https://"))) return normalized;

  // Already resolved store links pass through
  if (normalized && normalized.startsWith("/store/")) return normalized;

  // No store slug (e.g. template preview, before a real site exists) —
  // external links still work, but internal store-relative paths (/shop,
  // /blog, etc.) have nowhere real to resolve to, so don't navigate at all.
  if (!storeSlug) return "#";

  const base = `/store/${storeSlug}`;

  // Null, empty, or "#" — landing-only templates stay a no-op; everything
  // else (real e-commerce templates) defaults to the shop page.
  if (!normalized || normalized === "#") return isLandingOnly ? "#" : `${base}/shop`;

  // Strip leading slash for uniform handling
  const clean = normalized.startsWith("/") ? normalized.slice(1) : normalized;

  // Known route mappings
  const routeMap: Record<string, string> = {
    shop: `${base}/shop`,
    blog: `${base}/blog`,
    reviews: `${base}/reviews`,
    wishlist: `${base}/wishlist`,
    cart: `${base}/cart`,
    compare: `${base}/compare`,
    "my-account": `${base}/my-account`,
    "order-tracking": `${base}/order-tracking`,
    journal: `${base}/journal`,
    fragrances: `${base}/fragrances`,
    contact: `${base}/contact`,
    "contact-us": `${base}/contact-us`,
    about: `${base}/about`,
    "about-us": `${base}/about-us`,
    "our-story": `${base}/our-story`,
    faq: `${base}/faq`,
    policy: `${base}/policy`,
    gifts: `${base}/product-category/gifts`,
    "product-category/gifts": `${base}/product-category/gifts`,
  };

  if (routeMap[clean]) return routeMap[clean];

  // If it starts with "shop?", "blog/", "product/" etc. prefix with base
  if (
    clean.startsWith("shop?") ||
    clean.startsWith("shop/") ||
    clean.startsWith("blog/") ||
    clean.startsWith("product/") ||
    clean.startsWith("reviews") ||
    clean.startsWith("wishlist")
  ) {
    return `${base}/${clean}`;
  }

  // Any other relative path — prefix with store base
  if (!clean.startsWith("/")) return `${base}/${clean}`;

  return `${base}${normalized}`;
}

/** Resolve footer link URLs intelligently based on label text */
export function resolveFooterLink(url: unknown, label: string, storeSlug: string | null | undefined): string {
  const normalized = coerceLink(url).trim();

  // External or already resolved
  if (normalized && (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/store/"))) return normalized;

  // If url is valid (not "#" or empty), resolve normally
  if (normalized && normalized !== "#") return resolveStoreLink(normalized, storeSlug);

  // url is "#" or empty — try to infer from label
  if (!storeSlug) return "#";

  const base = `/store/${storeSlug}`;
  const lower = label.toLowerCase();

  // Contact
  if (lower.includes("contact")) return `${base}/contact`;

  // Policy / Legal
  if (lower.includes("privacy") || lower.includes("terms") || lower.includes("conditions") || lower.includes("returns") || lower.includes("refund") || lower.includes("policy"))
    return `${base}/policy`;

  // FAQ
  if (lower.includes("faq")) return `${base}/faq`;

  // Blog / News
  if (lower.includes("blog") || lower.includes("news") || lower.includes("latest")) return `${base}/blog`;

  // Shop related
  if (lower.includes("shop") || lower.includes("collection") || lower.includes("product") || lower.includes("catalog") || lower.includes("new arrival") || lower.includes("sale"))
    return `${base}/shop`;

  // About
  if (lower.includes("about") || lower.includes("our story") || lower.includes("who we are")) return `${base}/about`;

  // Reviews
  if (lower.includes("review") || lower.includes("testimonial")) return `${base}/reviews`;

  // Sitemap / Instagram / external-sounding things — leave as "#"
  if (lower.includes("sitemap") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("twitter") || lower.includes("purchase"))
    return "#";

  // Store locations — these are informational, no real page
  // (New York, London, etc.) — leave as "#"
  return "#";
}
