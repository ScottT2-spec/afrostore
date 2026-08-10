"use client";

import { useAbandonedCartTracking } from "@/hooks/useAbandonedCartTracking";

export default function AbandonedCartTracker({ slug, siteId }: { slug: string; siteId: string }) {
  useAbandonedCartTracking(slug, siteId);
  return null;
}
