"use client";

import { useEffect, useRef } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const SESSION_ID_KEY = "afrostore_session_id";
const HEARTBEAT_MS = 30_000;

function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (private browsing edge cases, etc.) - fall
    // back to a per-load id rather than crashing the tracker.
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

function readCart(slug: string): any[] {
  try {
    const raw = localStorage.getItem(`afrostore_cart_${slug}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeItems(cart: any[]) {
  return cart
    .filter((i) => i && i.productId)
    .map((i) => ({
      productId: i.productId,
      variantId: i.variantId || null,
      quantity: Number(i.quantity) || 1,
      name: i.product?.name || i.name || "Item",
      price: Number(i.product?.price ?? i.price ?? 0),
      image: i.product?.images?.[0]?.url || i.product?.image || i.image || null,
    }));
}

interface Options {
  /** Contact info known right now, if any - e.g. what the customer has
   * typed into the checkout form so far. Logged-in customer info is
   * picked up automatically and doesn't need to be passed here. */
  email?: string;
  phone?: string;
}

/**
 * Watches this browser's cart for a given store and reports it to the
 * abandoned-cart backend so recovery reminders can actually be sent.
 * Mount once per storefront (layout-level) - safe to call from multiple
 * places (e.g. also from the checkout page to pass in typed-but-not-yet-
 * submitted contact info); each call just heartbeats independently.
 */
export function useAbandonedCartTracking(slug: string | undefined, siteId: string | undefined, options: Options = {}) {
  const { customer } = useCustomerAuth(slug || "");
  const lastPayloadRef = useRef<string>("");
  const email = options.email || customer?.email;
  const phone = options.phone || customer?.phone;

  useEffect(() => {
    if (!slug || !siteId) return;

    const send = (useBeacon: boolean) => {
      const items = normalizeItems(readCart(slug));
      if (items.length === 0) return;

      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const sessionId = getOrCreateSessionId();
      const body = {
        email: email || undefined,
        phone: phone || undefined,
        customerId: customer?.id || undefined,
        sessionId,
        items,
        totalAmount,
      };
      const serialized = JSON.stringify(body);
      // Skip redundant heartbeats when nothing about the cart or the
      // customer's known contact info has actually changed.
      if (!useBeacon && serialized === lastPayloadRef.current) return;
      lastPayloadRef.current = serialized;

      const url = `/api/sites/${siteId}/abandoned-carts`;
      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([serialized], { type: "application/json" }));
      } else {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: serialized,
          keepalive: true,
        }).catch(() => { /* best-effort - never disrupt the shopper's session */ });
      }
    };

    send(false);
    const interval = setInterval(() => send(false), HEARTBEAT_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") send(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, siteId, email, phone, customer?.id]);
}
