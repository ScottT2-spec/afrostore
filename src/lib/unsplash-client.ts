/**
 * Unsplash Search API client — real, dynamic image search by keyword.
 *
 * Note: the old "source.unsplash.com/random?query" trick is fully dead
 * (deprecated 2021, now errors) — do not use it. This uses the real,
 * current Unsplash API (api.unsplash.com), which requires a free
 * developer access key (UNSPLASH_ACCESS_KEY). Without a key configured,
 * every function here returns null/empty so callers fall back to the
 * curated static image pools instead of breaking.
 */

interface UnsplashPhoto {
  url: string;
  alt: string;
  credit: { name: string; link: string };
}

const UNSPLASH_API = "https://api.unsplash.com";

function isConfigured(): boolean {
  return !!process.env.UNSPLASH_ACCESS_KEY;
}

/**
 * Search Unsplash for photos matching a query. Returns [] if no API key
 * is configured or the request fails — callers must have a fallback.
 */
export async function searchUnsplashPhotos(
  query: string,
  count: number = 10,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<UnsplashPhoto[]> {
  if (!isConfigured()) return [];

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(Math.min(count, 30)),
      orientation,
      content_filter: "high",
    });
    const res = await fetch(`${UNSPLASH_API}/search/photos?${params.toString()}`, {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("Unsplash search failed:", res.status, await res.text().catch(() => ""));
      return [];
    }
    const json = await res.json();
    const results = Array.isArray(json.results) ? json.results : [];
    return results.map((p: any) => ({
      url: `${p.urls.raw}&w=1600&q=80&auto=format&fit=crop`,
      alt: p.alt_description || query,
      credit: { name: p.user?.name || "Unsplash", link: p.user?.links?.html || "https://unsplash.com" },
    }));
  } catch (err) {
    console.error("Unsplash search error:", err);
    return [];
  }
}

/** Convenience: get a single random-ish photo URL for a query, or null. */
export async function getUnsplashPhoto(query: string, orientation: "landscape" | "portrait" | "squarish" = "landscape"): Promise<string | null> {
  const results = await searchUnsplashPhotos(query, 10, orientation);
  if (results.length === 0) return null;
  return results[Math.floor(Math.random() * results.length)].url;
}

export { isConfigured as isUnsplashConfigured };
