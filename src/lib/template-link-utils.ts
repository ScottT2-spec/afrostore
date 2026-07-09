/**
 * Shared link resolution utilities for all template blocks.
 *
 * DEPRECATED: This file is kept for backward compatibility.
 * New code should use the useEditLink hook from @/hooks/useEditLink
 * which provides reactive edit mode detection and proper URL state management.
 *
 * The old implementation relied on window.location.search which is not reactive
 * and breaks during client-side navigation. The new useEditLink hook uses
 * React Context, useParams, and useSearchParams for bulletproof link resolution.
 */

import { appendEditModeParam as appendEditModeParamFromHook } from "@/hooks/useEditLink";

/** Detect if we're in edit mode by checking for afro_editor query param */
function isEditMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("afro_editor") === "1";
}

/** Append edit mode query param to a URL if in edit mode */
function appendEditModeParam(url: string): string {
  return appendEditModeParamFromHook(url, isEditMode());
}

/** Resolve any link to a proper store-scoped path */
export function resolveStoreLink(link: string | null | undefined, storeSlug: string | null | undefined): string {
  // External links pass through
  if (link && (link.startsWith("http://") || link.startsWith("https://"))) return link;

  // Already resolved store links pass through (but preserve edit mode)
  if (link && link.startsWith("/store/")) return appendEditModeParam(link);

  // No store slug — can't resolve, return as-is or "#"
  if (!storeSlug) return link || "#";

  const base = `/store/${storeSlug}`;

  // Null, empty, or "#" → shop page
  if (!link || link === "#") return appendEditModeParam(`${base}/shop`);

  // Strip leading slash for uniform handling
  const clean = link.startsWith("/") ? link.slice(1) : link;

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
    contact: `${base}/contact`,
    about: `${base}/about`,
    faq: `${base}/faq`,
    policy: `${base}/policy`,
  };

  if (routeMap[clean]) return appendEditModeParam(routeMap[clean]);

  // If it starts with "shop?", "blog/", "product/" etc. prefix with base
  if (
    clean.startsWith("shop?") ||
    clean.startsWith("shop/") ||
    clean.startsWith("blog/") ||
    clean.startsWith("product/") ||
    clean.startsWith("reviews") ||
    clean.startsWith("wishlist")
  ) {
    return appendEditModeParam(`${base}/${clean}`);
  }

  // Any other relative path — prefix with store base
  if (!clean.startsWith("/")) return appendEditModeParam(`${base}/${clean}`);

  return appendEditModeParam(`${base}${link}`);
}

/** Resolve footer link URLs intelligently based on label text */
export function resolveFooterLink(url: string | null | undefined, label: string, storeSlug: string | null | undefined): string {
  // External or already resolved (preserve edit mode for store links)
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) return url;
  if (url && url.startsWith("/store/")) return appendEditModeParam(url);

  // If url is valid (not "#" or empty), resolve normally
  if (url && url !== "#") return resolveStoreLink(url, storeSlug);

  // url is "#" or empty — try to infer from label
  if (!storeSlug) return "#";

  const base = `/store/${storeSlug}`;
  const lower = label.toLowerCase();

  // Contact
  if (lower.includes("contact")) return appendEditModeParam(`${base}/contact`);

  // Policy / Legal
  if (lower.includes("privacy") || lower.includes("terms") || lower.includes("conditions") || lower.includes("returns") || lower.includes("refund") || lower.includes("policy"))
    return appendEditModeParam(`${base}/policy`);

  // FAQ
  if (lower.includes("faq")) return appendEditModeParam(`${base}/faq`);

  // Blog / News
  if (lower.includes("blog") || lower.includes("news") || lower.includes("latest")) return appendEditModeParam(`${base}/blog`);

  // Shop related
  if (lower.includes("shop") || lower.includes("collection") || lower.includes("product") || lower.includes("catalog") || lower.includes("new arrival") || lower.includes("sale"))
    return appendEditModeParam(`${base}/shop`);

  // About
  if (lower.includes("about") || lower.includes("our story") || lower.includes("who we are")) return appendEditModeParam(`${base}/about`);

  // Reviews
  if (lower.includes("review") || lower.includes("testimonial")) return appendEditModeParam(`${base}/reviews`);

  // Sitemap / Instagram / external-sounding things — leave as "#"
  if (lower.includes("sitemap") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("twitter") || lower.includes("purchase"))
    return "#";

  // Store locations — these are informational, no real page
  // (New York, London, etc.) — leave as "#"
  return "#";
}
