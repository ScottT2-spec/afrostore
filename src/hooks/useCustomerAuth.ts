"use client";

import { useState, useEffect } from "react";

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface UseCustomerAuth {
  customer: CustomerInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
}

/**
 * Client-side hook to check if a storefront customer is logged in.
 * Reads from localStorage (set during login/register).
 * Verifies token is still valid via /api/storefront/:slug/auth/me.
 */
export function useCustomerAuth(slug: string): UseCustomerAuth {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem(`afrostore_customer_token_${slug}`);
    const cached = localStorage.getItem(`afrostore_customer_${slug}`);

    // Quick check: if no token at all, not logged in
    if (!token) {
      setLoading(false);
      return;
    }

    // Show cached data immediately while we verify
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.id && parsed.email) {
          setCustomer(parsed);
        }
      } catch { /* ignore */ }
    }

    // Verify token is still valid in background
    fetch(`/api/storefront/${slug}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const info: CustomerInfo = {
            id: json.data.id,
            name: `${json.data.firstName} ${json.data.lastName}`,
            email: json.data.email,
            phone: json.data.phone || undefined,
          };
          setCustomer(info);
          // Update cache
          localStorage.setItem(
            `afrostore_customer_${slug}`,
            JSON.stringify(info)
          );
        } else {
          // Token expired or invalid — clear
          localStorage.removeItem(`afrostore_customer_token_${slug}`);
          localStorage.removeItem(`afrostore_customer_${slug}`);
          setCustomer(null);
        }
      })
      .catch(() => {
        // Network error — keep cached data if available
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const logout = () => {
    const token = localStorage.getItem(`afrostore_customer_token_${slug}`);
    if (token) {
      fetch(`/api/storefront/${slug}/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(`afrostore_customer_token_${slug}`);
    localStorage.removeItem(`afrostore_customer_${slug}`);
    setCustomer(null);
  };

  return {
    customer,
    isLoggedIn: !!customer,
    loading,
    logout,
  };
}
