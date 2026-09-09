import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to route custom domains and subdomains to the correct store.
 *
 * Flow:
 *   mystore.prosell.africa/anything    →  internally rewrite to /store/mystore/anything
 *   mycustomdomain.com/anything     →  internally rewrite to /store/mycustomdomain.com/anything
 *   prosell.africa/anything            →  pass through (main app)
 */

// NOTE: kept local (not imported from lib/domain/domain-manager.ts) because
// that module pulls in `dns` + Prisma, which aren't safe/available in this
// Edge middleware runtime. Same fix, applied locally: production has had
// NEXT_PUBLIC_APP_DOMAIN set to "https://prosell.africa" (scheme included)
// rather than the bare domain — since `host` below always comes from the
// literal HTTP Host header (never includes a scheme), `host === APP_DOMAIN`
// was silently false for every request, so isMainDomain never matched and
// every non-bypassed path got rewritten into a dead /store/... URL.
const APP_DOMAIN = (process.env.NEXT_PUBLIC_APP_DOMAIN || "prosell.africa")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");

// Paths that should NEVER be rewritten (app infrastructure)
const BYPASS_PREFIXES = [
  "/api/",
  "/_next/",
  "/static/",
  "/js/",
  "/favicon",
  "/manifest",
  "/uploads/",
  // App pages (not store pages)
  "/dashboard",
  "/admin",
  "/builder",
  "/checkout",
  "/auth",
  "/login",
  "/register",
  "/signup",
  "/onboarding",
  "/verify",
  "/reset-password",
  "/invite",
  "/editor",
  "/templates",
  "/store/",  // Already has /store/ prefix — don't double-rewrite
  "/_codegen/",  // Internal rewrite target for published AI-generated sites
];

export async function middleware(req: NextRequest) {
  const hostname =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "";

  // Strip port if present (e.g., localhost:3000)
  const host = hostname.split(":")[0].toLowerCase();
  const pathname = req.nextUrl.pathname;

  // Debug headers — purely informational, attached to every response this
  // middleware produces. Never affects routing. Inspect with:
  //   curl -I https://prosell.africa/templates
  // or the Network tab in browser dev tools. Shows exactly what host this
  // request arrived with, what APP_DOMAIN it's being compared against, and
  // which of the three decisions below fired — turns "still 404, no idea
  // why" into something checkable in seconds instead of guessed at.
  const withDebugHeaders = (res: NextResponse, extra: Record<string, string>) => {
    res.headers.set("x-mw-host", host || "(empty)");
    res.headers.set("x-mw-app-domain", APP_DOMAIN);
    res.headers.set("x-mw-path", pathname);
    for (const [k, v] of Object.entries(extra)) res.headers.set(k, v);
    return res;
  };

  // 1. Skip bypass paths
  for (const prefix of BYPASS_PREFIXES) {
    if (pathname.startsWith(prefix) || pathname === prefix.replace(/\/$/, "")) {
      return withDebugHeaders(NextResponse.next(), {
        "x-mw-decision": "bypass",
        "x-mw-bypass-prefix": prefix,
      });
    }
  }

  // 2. Check if this is the main app domain (no rewrite needed)
  const isMainDomain =
    host === APP_DOMAIN ||
    host === `www.${APP_DOMAIN}` ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "" ||  // Missing host header
    host.endsWith(".vercel.app");  // Vercel preview/production domains

  if (isMainDomain) {
    return withDebugHeaders(NextResponse.next(), { "x-mw-decision": "main-domain" });
  }

  // 3. Check if this is a subdomain of the app domain
  //    e.g., mystore.prosell.africa → slug = "mystore"
  let storeSlug: string | null = null;

  if (host.endsWith(`.${APP_DOMAIN}`)) {
    const subdomain = host.replace(`.${APP_DOMAIN}`, "");
    // Ignore www, mail, etc.
    if (subdomain && subdomain !== "www" && subdomain !== "mail" && subdomain !== "admin" && !subdomain.includes(".")) {
      storeSlug = subdomain;
    }
  }

  // 4. If not a subdomain, it's a custom domain
  //    e.g., mycoolstore.com → slug = "mycoolstore.com"
  if (!storeSlug) {
    storeSlug = host;
  }

  // 5. Rewrite to /store/[slug]/...
  //    The store page + API routes already look up by slug, subdomain, OR customDomain
  const url = req.nextUrl.clone();
  const storePath = pathname === "/" ? "" : pathname;

  // Published AI-generated (real code) sites take over every path for
  // their slug/domain entirely — no coexisting with the page-builder
  // routes at specific paths, since the generated app can freely use any
  // route name (about/contact/shop/etc.) and a hybrid would be
  // inconsistent. One extra fetch per request, cached, to a tiny
  // Node-runtime endpoint since this Edge middleware can't use Prisma
  // directly.
  try {
    const modeRes = await fetch(
      `${req.nextUrl.origin}/api/internal/site-mode?slug=${encodeURIComponent(storeSlug)}`,
      { next: { revalidate: 30 } }
    );
    if (modeRes.ok) {
      const mode = (await modeRes.json()) as { codeGen: boolean; buildPath: string | null };
      if (mode.codeGen && mode.buildPath) {
        url.pathname = `/_codegen/${encodeURIComponent(mode.buildPath)}${storePath}`;
        return withDebugHeaders(NextResponse.rewrite(url), {
          "x-mw-decision": "rewrite-codegen",
          "x-mw-store-slug": storeSlug,
          "x-mw-rewrite-target": url.pathname,
        });
      }
    }
  } catch {
    // Lookup failing (network blip, endpoint down) must never break a
    // normal block-based store — fall through to the existing behavior.
  }

  url.pathname = `/store/${storeSlug}${storePath}`;

  return withDebugHeaders(NextResponse.rewrite(url), {
    "x-mw-decision": "rewrite",
    "x-mw-store-slug": storeSlug,
    "x-mw-rewrite-target": url.pathname,
  });
}

export const config = {
  // Run middleware on all paths except static files
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files with extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
