"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

function getStorageKey(siteId: string) {
  return `wishlist_${siteId}`;
}

function readWishlist(siteId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(siteId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(siteId: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(siteId), JSON.stringify(ids));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Logged-in customer id for this store, if any — same cached-token
 * pattern useCustomerAuth uses (set during login/register), read
 * synchronously so we don't need a separate network round-trip just to
 * know whether to sync.
 */
function getLoggedInCustomerId(storeSlug?: string): string | null {
  if (typeof window === "undefined" || !storeSlug) return null;
  try {
    const cached = localStorage.getItem(`afrostore_customer_${storeSlug}`);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return parsed?.id || null;
  } catch {
    return null;
  }
}

/**
 * @param siteId Store id — used for the local cache key (kept as-is so
 *   existing localStorage data isn't orphaned).
 * @param storeSlug Store slug — when provided AND the shopper is logged in
 *   (see getLoggedInCustomerId), wishlist actions also sync to the real
 *   database via /api/storefront/:slug/wishlists, which is what the
 *   merchant dashboard's Wishlists page actually reads. Without this, a
 *   customer's wishlist lived ONLY in their own browser's localStorage —
 *   guests always did, but so did logged-in customers, even though a full
 *   working DB-backed wishlist API already existed and just was never
 *   called. Server sync is best-effort and never blocks the local/instant
 *   UI update.
 */
export function useWishlist(siteId: string, storeSlug?: string) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const customerId = useMemo(() => getLoggedInCustomerId(storeSlug), [storeSlug]);

  // Initialize from localStorage after mount
  useEffect(() => {
    setWishlist(readWishlist(siteId));
  }, [siteId]);

  // If logged in, also pull the server-side wishlist and merge it in —
  // covers items added from another device/session/browser.
  useEffect(() => {
    if (!customerId || !storeSlug) return;
    fetch(`/api/storefront/${storeSlug}/wishlists?customerId=${customerId}`)
      .then((res) => res.json())
      .then((json) => {
        const serverIds: string[] = (json?.data?.items || []).map((i: { productId: string }) => i.productId);
        if (serverIds.length === 0) return;
        setWishlist((current) => {
          const merged = Array.from(new Set([...current, ...serverIds]));
          writeWishlist(siteId, merged);
          return merged;
        });
      })
      .catch(() => {}); // best-effort — local wishlist still works if this fails
  }, [customerId, storeSlug, siteId]);

  // Sync across tabs
  useEffect(() => {
    const key = getStorageKey(siteId);
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        setWishlist(readWishlist(siteId));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [siteId]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const syncToServer = useCallback(
    (productId: string, added: boolean) => {
      if (!customerId || !storeSlug) return; // guest — local-only, nothing to sync
      const url = `/api/storefront/${storeSlug}/wishlists`;
      if (added) {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, productId }),
        }).catch(() => {});
      } else {
        fetch(`${url}?customerId=${customerId}&productId=${productId}`, { method: "DELETE" }).catch(() => {});
      }
    },
    [customerId, storeSlug]
  );

  const toggleWishlist = useCallback(
    (productId: string): boolean => {
      const current = readWishlist(siteId);
      let next: string[];
      let added: boolean;
      if (current.includes(productId)) {
        next = current.filter((id) => id !== productId);
        added = false;
      } else {
        next = [...current, productId];
        added = true;
      }
      writeWishlist(siteId, next);
      setWishlist(next);
      syncToServer(productId, added);
      return added;
    },
    [siteId, syncToServer]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const current = readWishlist(siteId);
      const next = current.filter((id) => id !== productId);
      writeWishlist(siteId, next);
      setWishlist(next);
      syncToServer(productId, false);
    },
    [siteId, syncToServer]
  );

  const clearWishlist = useCallback(() => {
    writeWishlist(siteId, []);
    setWishlist([]);
  }, [siteId]);

  const wishlistCount = wishlist.length;

  return {
    wishlist,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    wishlistCount,
  };
}
