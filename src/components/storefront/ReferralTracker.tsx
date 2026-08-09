"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Tracks affiliate referral clicks from anywhere on the storefront, not
 * just the homepage. Mounted once in the store layout so a link landing
 * on a product page, /shop, /cart — anywhere — still gets attributed.
 *
 * If ?ref=CODE is present, records the click server-side and remembers it
 * in a cookie so checkout can attribute the eventual order to this
 * affiliate. Never blocks rendering or throws — referral tracking failing
 * should never break the storefront.
 */
export default function ReferralTracker({ siteId }: { siteId: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams?.get("ref");
    if (!refCode || !siteId) return;
    // Don't double-track if we already recorded a click for this code
    if (typeof document !== "undefined" && document.cookie.includes(`afro_ref_code=${refCode}`)) return;

    fetch(`/api/sites/${siteId}/referrals/track?ref=${encodeURIComponent(refCode)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !json.data) return;
        const { referralId, affiliateCode, cookieDays } = json.data;
        const maxAge = (cookieDays || 30) * 24 * 60 * 60;
        document.cookie = `afro_ref_code=${affiliateCode}; max-age=${maxAge}; path=/`;
        document.cookie = `afro_ref_id=${referralId}; max-age=${maxAge}; path=/`;
      })
      .catch(() => { /* non-critical - never block the storefront over tracking */ });
  }, [searchParams, siteId]);

  return null;
}
