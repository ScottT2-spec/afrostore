import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, validationError } from "@/lib/api-helpers";
import { analyticsEventSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { sendServerConversionEvents } from "@/lib/server-conversions";

// Internal event names that map to a real advertising conversion worth an
// authoritative server-side call (backstops ad blockers / Safari ITP losing
// the browser-side pixel fire). Not every event type needs this — a plain
// page_view or cta_click has no server-side equivalent worth sending.
const CONVERSION_EVENT_MAP: Record<string, "Lead" | "Purchase" | "Contact"> = {
  lead: "Lead",
  form_submit: "Lead",
  purchase: "Purchase",
  whatsapp_click: "Contact",
  instagram_click: "Contact",
};

type Params = { params: Promise<{ slug: string }> };

// POST /api/public/sites/:slug/analytics/track — no auth; used by the live storefront/landing page
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
      select: { id: true, slug: true, subdomain: true, customDomain: true },
    });
    if (!site) return error("Site not found", 404);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = rateLimit(`analytics:${site.id}:${ip}`, 120, 60 * 1000);
    if (!rl.allowed) {
      // Silently drop instead of erroring - a burst of tracking calls should
      // never surface an error to a real visitor.
      return success({ tracked: false });
    }

    const body = await req.json();
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const ua = req.headers.get("user-agent") || "";
    const device = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";
    const browser = /edg/i.test(ua) ? "Edge" : /chrome/i.test(ua) ? "Chrome" : /firefox/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : "Other";
    const os = /android/i.test(ua) ? "Android" : /iphone|ipad|ios/i.test(ua) ? "iOS" : /windows/i.test(ua) ? "Windows" : /mac os/i.test(ua) ? "macOS" : "Other";

    // Derive traffic source from the Referer header when the client didn't
    // explicitly pass one — categorize common platforms, otherwise use the
    // referring hostname, or "direct" if there's no referrer at all.
    let source = parsed.data.source;
    if (!source) {
      const referer = req.headers.get("referer") || "";
      if (!referer) source = "direct";
      else {
        try {
          const host = new URL(referer).hostname.replace(/^www\./, "");
          const ownHosts = [site.subdomain ? `${site.subdomain}.afrostore.com` : null, site.customDomain, "afrostore.com"].filter(Boolean);
          if (ownHosts.includes(host)) source = "direct"; // internal navigation, not a real referral
          else if (host.includes("google")) source = "google";
          else if (host.includes("facebook") || host.includes("fb.com")) source = "facebook";
          else if (host.includes("instagram")) source = "instagram";
          else if (host.includes("tiktok")) source = "tiktok";
          else if (host.includes("whatsapp")) source = "whatsapp";
          else if (host.includes("twitter") || host.includes("x.com")) source = "twitter";
          else source = host;
        } catch {
          source = "direct";
        }
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        siteId: site.id,
        event: parsed.data.event,
        page: parsed.data.page,
        productId: parsed.data.productId,
        orderId: parsed.data.orderId,
        sessionId: parsed.data.sessionId,
        source,
        medium: parsed.data.medium,
        campaign: parsed.data.campaign,
        funnelId: parsed.data.funnelId,
        device: parsed.data.device || device,
        country: parsed.data.country,
        city: parsed.data.city,
        browser,
        os,
        metadata: parsed.data.metadata as any,
      },
    });

    // Authoritative server-side conversion, deduplicated against the
    // browser pixel call via the shared eventId the client generated.
    const conversionName = CONVERSION_EVENT_MAP[parsed.data.event];
    if (conversionName && parsed.data.eventId) {
      const settings = await prisma.siteSettings.findUnique({
        where: { siteId: site.id },
        select: { facebookPixelId: true, metaAccessToken: true, metaTestEventCode: true, tiktokPixelId: true, tiktokAccessToken: true },
      });
      if (settings && (settings.metaAccessToken || settings.tiktokAccessToken)) {
        await sendServerConversionEvents({
          eventName: conversionName,
          eventId: parsed.data.eventId,
          eventSourceUrl: parsed.data.page ? `https://${site.customDomain || `${site.subdomain}.afrostore.com`}${parsed.data.page}` : undefined,
          user: { email: parsed.data.email, phone: parsed.data.phone, ip, userAgent: ua },
          customData: parsed.data.metadata,
          settings,
        });
      }
    }

    return success({ tracked: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    // Never let a tracking failure surface as an error to a real visitor
    return success({ tracked: false });
  }
}
