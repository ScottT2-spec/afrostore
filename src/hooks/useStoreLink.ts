"use client";

import { useParams, useSearchParams, usePathname } from "next/navigation";

/**
 * useStoreLink - Bulletproof hook for generating store links in both live and edit mode
 * 
 * This hook uses Next.js App Router hooks to reliably detect:
 * - Current store slug from useParams()
 * - Edit mode from useSearchParams()
 * - Current path from usePathname()
 * 
 * All links generated through this hook will:
 * 1. Always include the correct /store/[slug] prefix
 * 2. Preserve ?afro_editor=1 when in edit mode
 * 3. Work correctly in both server and client components
 * 4. Handle client-side navigation properly
 */

export function useStoreLink() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get store slug from URL params (most reliable source)
  const storeSlug = params?.slug as string | undefined;

  // Detect edit mode from search params
  const isEditMode = searchParams?.get("afro_editor") === "1";

  /**
   * Generate a full store link with proper slug and edit mode preservation
   * @param path - The path to append (e.g., "shop", "product/xyz", "/")
   * @param overrideSlug - Optional override for storeSlug (useful for footer links, etc.)
   * @returns Full URL with slug and edit mode parameter
   */
  const resolveLink = (path: string, overrideSlug?: string): string => {
    const slug = overrideSlug || storeSlug;

    // Debug logging
    if (typeof window !== "undefined") {
      console.log("[useStoreLink] resolveLink called:", {
        path,
        overrideSlug,
        storeSlug,
        slug,
        isEditMode,
        pathname,
      });
    }

    if (!slug) {
      console.warn("[useStoreLink] No storeSlug available - link may be broken:", path);
      // Return path as-is if no slug (fallback)
      return path.startsWith("/") ? path : `/${path}`;
    }

    // Normalize path - remove leading slash if present
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    
    // Handle empty path (home page)
    const finalPath = normalizedPath === "" || normalizedPath === "/" ? "" : `/${normalizedPath}`;

    // Build base URL
    const baseUrl = `/store/${slug}${finalPath}`;

    // Add edit mode parameter if in edit mode
    if (isEditMode) {
      const separator = baseUrl.includes("?") ? "&" : "?";
      const fullUrl = `${baseUrl}${separator}afro_editor=1`;
      
      if (typeof window !== "undefined") {
        console.log("[useStoreLink] Generated URL (edit mode):", fullUrl);
      }
      return fullUrl;
    }

    if (typeof window !== "undefined") {
      console.log("[useStoreLink] Generated URL (live mode):", baseUrl);
    }
    return baseUrl;
  };

  /**
   * Generate a footer link with intelligent URL handling
   * @param url - The URL (can be internal path or external URL)
   * @param label - Link label (for debugging)
   * @param overrideSlug - Optional override for storeSlug
   * @returns Full URL or external URL as-is
   */
  const resolveFooterLink = (url: string, label?: string, overrideSlug?: string): string => {
    // Handle external URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Handle anchor links
    if (url.startsWith("#")) {
      return url;
    }

    // Handle mailto/tel links
    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      return url;
    }

    // Handle internal links
    const slug = overrideSlug || storeSlug;
    if (!slug) {
      console.warn("[useStoreLink] No storeSlug for footer link:", label, url);
      return url;
    }

    const resolved = resolveLink(url, slug);
    if (typeof window !== "undefined") {
      console.log("[useStoreLink] Footer link resolved:", { label, url, resolved });
    }
    return resolved;
  };

  /**
   * Check if we're currently in edit mode
   */
  const getEditMode = (): boolean => {
    return isEditMode;
  };

  /**
   * Get the current store slug
   */
  const getStoreSlug = (): string | undefined => {
    return storeSlug;
  };

  return {
    resolveLink,
    resolveFooterLink,
    isEditMode: getEditMode,
    storeSlug: getStoreSlug,
    pathname,
  };
}

/**
 * Helper function to append edit mode parameter to a URL
 * Can be used in server components where hooks can't be used
 */
export function appendEditModeParam(url: string, isEditMode: boolean): string {
  if (!isEditMode) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}afro_editor=1`;
}
