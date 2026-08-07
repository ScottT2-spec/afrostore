import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, validationError } from "@/lib/api-helpers";
import { analyticsEventSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ slug: string }> };

// POST /api/public/sites/:slug/analytics/track — no auth; used by the live storefront/landing page
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
      select: { id: true },
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

    await prisma.analyticsEvent.create({
      data: {
        siteId: site.id,
        event: parsed.data.event,
        page: parsed.data.page,
        productId: parsed.data.productId,
        orderId: parsed.data.orderId,
        sessionId: parsed.data.sessionId,
        source: parsed.data.source,
        device: parsed.data.device || device,
        country: parsed.data.country,
        city: parsed.data.city,
        browser,
        os,
        metadata: parsed.data.metadata as any,
      },
    });

    return success({ tracked: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    // Never let a tracking failure surface as an error to a real visitor
    return success({ tracked: false });
  }
}
