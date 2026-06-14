"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

function getStorageKey(storeId: string) {
  return `wishlist_${storeId}`;
}

function readWishlist(storeId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(storeId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(storeId: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(storeId), JSON.stringify(ids));
  } catch {
    // localStorage full or unavailable
  }
}

export function useWishlist(storeId: string) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Initialize from localStorage after mount
  useEffect(() => {
    setWishlist(readWishlist(storeId));
  }, [storeId]);

  // Sync across tabs
  useEffect(() => {
    const key = getStorageKey(storeId);
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        setWishlist(readWishlist(storeId));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storeId]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (productId: string): boolean => {
      const current = readWishlist(storeId);
      let next: string[];
      let added: boolean;
      if (current.includes(productId)) {
        next = current.filter((id) => id !== productId);
        added = false;
      } else {
        next = [...current, productId];
        added = true;
      }
      writeWishlist(storeId, next);
      setWishlist(next);
      return added;
    },
    [storeId]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const current = readWishlist(storeId);
      const next = current.filter((id) => id !== productId);
      writeWishlist(storeId, next);
      setWishlist(next);
    },
    [storeId]
  );

  const clearWishlist = useCallback(() => {
    writeWishlist(storeId, []);
    setWishlist([]);
  }, [storeId]);

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
