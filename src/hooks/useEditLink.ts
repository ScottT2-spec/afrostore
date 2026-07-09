"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEditMode } from "@/contexts/EditModeContext";

/**
 * Bulletproof link resolution hook for edit mode.
 * 
 * This hook ensures all internal links:
 * - Include the current store slug from URL params
 * - Preserve the afro_editor=1 query parameter in edit mode
 * - Work correctly in both server and client components
 * - React to URL changes during client-side navigation
 */
export function useEditLink() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isEditMode: isEditModeFromContext, storeSlug: storeSlugFromContext } = useEditMode();

  // Get storeSlug from URL params (most reliable in App Router)
  const storeSlug = (params.slug as string) || storeSlugFromContext;

  // Check edit mode from both context and search params (defensive)
  const isEditMode = isEditModeFromContext || searchParams.get("afro_editor") === "1";

  /**
   * Resolve any link to a proper store-scoped path with edit mode preservation.
   * 
   * @param link - The link to resolve (can be relative, absolute, or external)
   * @param overrideStoreSlug - Optional override for storeSlug (useful in template blocks)
   * @returns Fully resolved URL with store slug and edit mode parameter
   */
  const resolveLink = (link: string | null | undefined, overrideStoreSlug?: string | null): string => {
    const effectiveStoreSlug = overrideStoreSlug || storeSlug;

    // External links pass through unchanged
    if (link && (link.startsWith("http://") || link.startsWith("https://"))) {
      return link;
    }

    // Already resolved store links - preserve edit mode
    if (link && link.startsWith("/store/")) {
      return appendEditModeParam(link, isEditMode);
    }

    // No store slug available - can't resolve, return fallback
    if (!effectiveStoreSlug) {
      console.warn("[useEditLink] No storeSlug available, returning fallback:", link || "#");
      return link || "#";
    }

    const base = `/store/${effectiveStoreSlug}`;

    // Null, empty, or "#" → shop page
    if (!link || link === "#") {
      const resolved = `${base}/shop`;
      const withEdit = appendEditModeParam(resolved, isEditMode);
      console.log("[useEditLink] Resolved '#' to:", withEdit);
      return withEdit;
    }

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

    if (routeMap[clean]) {
      const withEdit = appendEditModeParam(routeMap[clean], isEditMode);
      console.log("[useEditLink] Resolved route", clean, "to:", withEdit);
      return withEdit;
    }

    // If it starts with "shop?", "blog/", "product/" etc. prefix with base
    if (
      clean.startsWith("shop?") ||
      clean.startsWith("shop/") ||
      clean.startsWith("blog/") ||
      clean.startsWith("product/") ||
      clean.startsWith("reviews") ||
      clean.startsWith("wishlist")
    ) {
      const withEdit = appendEditModeParam(`${base}/${clean}`, isEditMode);
      console.log("[useEditLink] Resolved path", clean, "to:", withEdit);
      return withEdit;
    }

    // Any other relative path — prefix with store base
    const withEdit = appendEditModeParam(`${base}/${clean}`, isEditMode);
    console.log("[useEditLink] Resolved relative path", clean, "to:", withEdit);
    return withEdit;
  };

  /**
   * Resolve footer link URLs intelligently based on label text.
   */
  const resolveFooterLink = (url: string | null | undefined, label: string, overrideStoreSlug?: string | null): string => {
    const effectiveStoreSlug = overrideStoreSlug || storeSlug;

    // External or already resolved (preserve edit mode for store links)
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }
    if (url && url.startsWith("/store/")) {
      return appendEditModeParam(url, isEditMode);
    }

    // If url is valid (not "#" or empty), resolve normally
    if (url && url !== "#") {
      return resolveLink(url, effectiveStoreSlug);
    }

    // url is "#" or empty — try to infer from label
    if (!effectiveStoreSlug) {
      console.warn("[useEditLink] No storeSlug for footer link inference");
      return "#";
    }

    const base = `/store/${effectiveStoreSlug}`;
    const lower = label.toLowerCase();

    // Contact
    if (lower.includes("contact")) {
      return appendEditModeParam(`${base}/contact`, isEditMode);
    }

    // Policy / Legal
    if (lower.includes("privacy") || lower.includes("terms") || lower.includes("conditions") || lower.includes("returns") || lower.includes("refund") || lower.includes("policy")) {
      return appendEditModeParam(`${base}/policy`, isEditMode);
    }

    // FAQ
    if (lower.includes("faq")) {
      return appendEditModeParam(`${base}/faq`, isEditMode);
    }

    // Blog / News
    if (lower.includes("blog") || lower.includes("news") || lower.includes("latest")) {
      return appendEditModeParam(`${base}/blog`, isEditMode);
    }

    // Shop related
    if (lower.includes("shop") || lower.includes("collection") || lower.includes("product") || lower.includes("catalog") || lower.includes("new arrival") || lower.includes("sale")) {
      return appendEditModeParam(`${base}/shop`, isEditMode);
    }

    // About
    if (lower.includes("about") || lower.includes("our story") || lower.includes("who we are")) {
      return appendEditModeParam(`${base}/about`, isEditMode);
    }

    // Reviews
    if (lower.includes("review") || lower.includes("testimonial")) {
      return appendEditModeParam(`${base}/reviews`, isEditMode);
    }

    // Sitemap / Instagram / external-sounding things — leave as "#"
    if (lower.includes("sitemap") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("twitter") || lower.includes("purchase")) {
      return "#";
    }

    // Store locations — these are informational, no real page
    return "#";
  };

  return {
    resolveLink,
    resolveFooterLink,
    isEditMode,
    storeSlug,
  };
}

/**
 * Append edit mode query param to a URL if in edit mode.
 * This is a pure function that can be used outside the hook.
 */
export function appendEditModeParam(url: string, isEditMode: boolean): string {
  if (!isEditMode) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}afro_editor=1`;
}
