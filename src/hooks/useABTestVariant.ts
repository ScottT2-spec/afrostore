"use client";
import { useEffect, useState } from "react";

interface ABTestAssignment {
  active: boolean;
  testId?: string;
  variantId?: string;
  content?: { blockOverrides?: Record<string, Record<string, unknown>> } | null;
}

const storageKey = (targetId: string) => `ab-assign-${targetId}`;

/**
 * Assigns the current visitor to a running A/B test variant for the given page
 * (if one exists), persisting the assignment in localStorage so repeat visits
 * see the same variant and don't get double-counted as new views.
 */
export function useABTestVariant(storeSlug: string | undefined, pageId: string | undefined) {
  return useABTestVariantByTarget(storeSlug, pageId ? { pageId } : undefined);
}

/** Same as useABTestVariant, but for a funnel step instead of a standalone page. */
export function useFunnelStepABTestVariant(storeSlug: string | undefined, funnelStepId: string | undefined) {
  return useABTestVariantByTarget(storeSlug, funnelStepId ? { funnelStepId } : undefined);
}

function useABTestVariantByTarget(storeSlug: string | undefined, target: { pageId?: string; funnelStepId?: string } | undefined) {
  const [assignment, setAssignment] = useState<ABTestAssignment>({ active: false });
  const targetId = target?.pageId || target?.funnelStepId;

  useEffect(() => {
    if (!storeSlug || !targetId) return;
    let cancelled = false;

    let existing: ABTestAssignment | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey(targetId));
      if (raw) existing = JSON.parse(raw);
    } catch {
      existing = null;
    }

    fetch(`/api/public/sites/${storeSlug}/ab-tests/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: target?.pageId,
        funnelStepId: target?.funnelStepId,
        existingTestId: existing?.testId,
        existingVariantId: existing?.variantId,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.success) return;
        const data: ABTestAssignment = json.data;
        if (data.active) {
          setAssignment(data);
          try {
            window.localStorage.setItem(storageKey(targetId), JSON.stringify({ testId: data.testId, variantId: data.variantId }));
          } catch {
            // localStorage unavailable — assignment still works for this page view
          }
        }
      })
      .catch(() => {
        // Non-critical — fall through to unmodified content
      });

    return () => { cancelled = true; };
  }, [storeSlug, targetId, target?.pageId, target?.funnelStepId]);

  return assignment;
}

/** Apply a variant's block-level content overrides onto a page's block list. */
export function applyABTestOverrides<T extends { id?: string }>(
  blocks: T[],
  content: ABTestAssignment["content"]
): T[] {
  const overrides = content?.blockOverrides;
  if (!overrides || Object.keys(overrides).length === 0) return blocks;
  return blocks.map((block) => {
    const override = block.id ? overrides[block.id] : undefined;
    return override ? { ...block, ...override } : block;
  });
}

/** Notify all active A/B test assignments on this page of a conversion (e.g. completed order). */
export function trackABTestConversion(storeSlug: string | undefined) {
  if (!storeSlug || typeof window === "undefined") return;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith("ab-assign-")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const { testId, variantId } = JSON.parse(raw);
      if (!testId || !variantId) continue;
      fetch(`/api/public/sites/${storeSlug}/ab-tests/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, variantId }),
      }).catch(() => {});
    }
  } catch {
    // Non-critical
  }
}
