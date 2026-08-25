"use client";

/**
 * Storefront-side analytics + pixel tracking.
 *
 * Two things happen on every tracked event:
 * 1. We record it ourselves (POST /api/public/sites/:slug/analytics/track)
 *    so it shows up in the merchant's own Analytics dashboard.
 * 2. We fire the merchant's configured third-party pixels (Meta, TikTok,
 *    Google Analytics), if any are set, so their ad platforms see it too.
 *
 * Neither of these should ever throw or block the page - tracking failures
 * are silently swallowed everywhere in this file on purpose.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void; page?: () => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const SESSION_KEY = "afro_analytics_session";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export interface PixelIds {
  googleAnalyticsId?: string | null;
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;
}

const injectedPixels = new Set<string>();

/** Injects the merchant's configured pixel scripts once per page load. Safe to call on every render. */
export function injectPixels(ids: PixelIds) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (ids.facebookPixelId && !injectedPixels.has(`fb:${ids.facebookPixelId}`)) {
    injectedPixels.add(`fb:${ids.facebookPixelId}`);
    try {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any) {
        if (f.fbq) return;
        const n: any = (f.fbq = function (...args: unknown[]) {
          n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
        });
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        const t = b.createElement(e);
        t.async = true;
        t.src = v;
        const s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      window.fbq?.("init", ids.facebookPixelId);
      window.fbq?.("track", "PageView");
    } catch { /* never block the page over a pixel */ }
  }

  if (ids.tiktokPixelId && !injectedPixels.has(`tt:${ids.tiktokPixelId}`)) {
    injectedPixels.add(`tt:${ids.tiktokPixelId}`);
    try {
      const script = document.createElement("script");
      script.async = true;
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${ids.tiktokPixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
    } catch { /* never block the page over a pixel */ }
  }

  if (ids.googleAnalyticsId && !injectedPixels.has(`ga:${ids.googleAnalyticsId}`)) {
    injectedPixels.add(`ga:${ids.googleAnalyticsId}`);
    try {
      const loader = document.createElement("script");
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${ids.googleAnalyticsId}`;
      document.head.appendChild(loader);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) { window.dataLayer!.push(args); };
      window.gtag("js", new Date());
      window.gtag("config", ids.googleAnalyticsId);
    } catch { /* never block the page over a pixel */ }
  }
}

export type ConversionEvent = "page_view" | "add_to_cart" | "form_submit" | "whatsapp_click" | "purchase" | "lead" | "cta_click";

/**
 * Records the event in our own analytics and fires the equivalent event on
 * any configured third-party pixel. Fire-and-forget - never awaited by callers.
 */
export function trackEvent(
  siteSlug: string,
  event: ConversionEvent | string,
  opts: { page?: string; productId?: string; orderId?: string; metadata?: Record<string, unknown>; email?: string; phone?: string } = {}
) {
  if (!siteSlug) return;

  // Shared across the browser pixel call and the server-side Conversions
  // API call the ingestion endpoint makes, so Meta/TikTok can deduplicate
  // the same real-world event instead of double-counting it.
  const eventId = `${event}_${getAnalyticsSessionId()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  fetch(`/api/public/sites/${siteSlug}/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      eventId,
      page: opts.page || (typeof window !== "undefined" ? window.location.pathname : undefined),
      productId: opts.productId,
      orderId: opts.orderId,
      sessionId: getAnalyticsSessionId(),
      metadata: opts.metadata,
      email: opts.email,
      phone: opts.phone,
    }),
  }).catch(() => { /* non-critical */ });

  try {
    if (typeof window === "undefined") return;
    switch (event) {
      case "purchase":
        window.fbq?.("track", "Purchase", opts.metadata, { eventID: eventId });
        window.ttq?.track("CompletePayment", { ...opts.metadata, event_id: eventId });
        window.gtag?.("event", "purchase", opts.metadata);
        break;
      case "lead":
      case "form_submit":
        window.fbq?.("track", "Lead", opts.metadata, { eventID: eventId });
        window.ttq?.track("SubmitForm", { ...opts.metadata, event_id: eventId });
        window.gtag?.("event", "generate_lead", opts.metadata);
        break;
      case "add_to_cart":
        window.fbq?.("track", "AddToCart", opts.metadata, { eventID: eventId });
        window.ttq?.track("AddToCart", { ...opts.metadata, event_id: eventId });
        window.gtag?.("event", "add_to_cart", opts.metadata);
        break;
      case "whatsapp_click":
        window.fbq?.("trackCustom", "WhatsAppClick", opts.metadata, { eventID: eventId });
        window.gtag?.("event", "whatsapp_click", opts.metadata);
        break;
      case "cta_click":
        window.fbq?.("trackCustom", "CTAClick", opts.metadata, { eventID: eventId });
        window.ttq?.track("ClickButton", { ...opts.metadata, event_id: eventId });
        window.gtag?.("event", "cta_click", opts.metadata);
        break;
      default:
        break;
    }
  } catch { /* never block the page over a pixel */ }
}
