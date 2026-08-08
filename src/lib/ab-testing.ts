// Shared helpers for A/B test traffic-splitting and results reporting.
// Used by the public assignment/conversion endpoints and the dashboard stats endpoint.

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  content?: unknown;
}

export interface ABTestVariantResult extends ABTestVariant {
  views: number;
  conversions: number;
  conversionRate: number;
}

/** Parse the `variants` Json column into a typed, weight-sane array. */
export function parseVariants(raw: unknown): ABTestVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
    .map((v) => ({
      id: String(v.id ?? ""),
      name: String(v.name ?? "Variant"),
      weight: typeof v.weight === "number" && v.weight >= 0 ? v.weight : 0,
      content: v.content,
    }))
    .filter((v) => v.id);
}

/**
 * Pick a variant using weighted-random selection. Falls back to uniform
 * random if all weights are zero (e.g. a test with no weights configured).
 */
export function pickVariant(variants: ABTestVariant[]): ABTestVariant | null {
  if (variants.length === 0) return null;
  const totalWeight = variants.reduce((sum, v) => sum + Math.max(v.weight, 0), 0);

  if (totalWeight <= 0) {
    return variants[Math.floor(Math.random() * variants.length)];
  }

  let roll = Math.random() * totalWeight;
  for (const variant of variants) {
    roll -= Math.max(variant.weight, 0);
    if (roll <= 0) return variant;
  }
  return variants[variants.length - 1];
}

/** Merge per-variant view/conversion stat rows into the variant list for display. */
export function mergeVariantStats(
  variants: ABTestVariant[],
  stats: Array<{ variantId: string; views: number; conversions: number }>
): ABTestVariantResult[] {
  const statsByVariant = new Map(stats.map((s) => [s.variantId, s]));
  return variants.map((v) => {
    const s = statsByVariant.get(v.id);
    const views = s?.views ?? 0;
    const conversions = s?.conversions ?? 0;
    return {
      ...v,
      views,
      conversions,
      conversionRate: views > 0 ? conversions / views : 0,
    };
  });
}

/** The variant currently in the lead by conversion rate (min sample size to avoid noise). */
export function leadingVariant(
  results: ABTestVariantResult[],
  minViews = 25
): ABTestVariantResult | null {
  const eligible = results.filter((r) => r.views >= minViews);
  const pool = eligible.length > 0 ? eligible : results;
  if (pool.length === 0) return null;
  return pool.reduce((best, r) => (r.conversionRate > best.conversionRate ? r : best), pool[0]);
}
