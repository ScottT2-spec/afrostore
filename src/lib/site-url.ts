import { NextRequest } from "next/server";
import { headers } from "next/headers";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "prokip.africa";

function computeBaseUrl(host: string, proto: string, site: { slug: string; customDomain?: string | null }) {
  if (site.customDomain) return `https://${site.customDomain}`;

  const cleanHost = host.split(":")[0].toLowerCase();
  const isMainDomain =
    cleanHost === APP_DOMAIN ||
    cleanHost === `www.${APP_DOMAIN}` ||
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "" ||
    cleanHost.endsWith(".vercel.app");

  if (isMainDomain) return `${proto}://${cleanHost}/store/${site.slug}`;
  return `${proto}://${cleanHost}`;
}

/**
 * Resolve the store's real public base URL using the request that actually
 * reached this route, instead of a hardcoded domain that may not match where
 * the app is actually being served (e.g. a Vercel preview URL, staging, etc).
 *
 * - Custom domain on file (mystore.com)             -> https://mystore.com
 * - Reached via a real subdomain/custom domain       -> https://<that host>
 *   (middleware already rewrote root paths into /store/:slug for these)
 * - Reached on the main app / preview domain          -> https://<host>/store/:slug
 *   (no wildcard subdomain routing here, so the /store/:slug prefix is required)
 */
export function resolveStoreBaseUrl(req: NextRequest, site: { slug: string; customDomain?: string | null }) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return computeBaseUrl(host, proto, site);
}

/** Same as resolveStoreBaseUrl, but for Server Components / generateMetadata, which
 *  don't receive a NextRequest — reads the incoming request's headers directly. */
export async function resolveStoreBaseUrlFromHeaders(site: { slug: string; customDomain?: string | null }) {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  return computeBaseUrl(host, proto, site);
}
