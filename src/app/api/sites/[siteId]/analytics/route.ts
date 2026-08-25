import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { analyticsEventSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

// GET /api/sites/:siteId/analytics
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const event = url.searchParams.get("event");
  const period = url.searchParams.get("period");
  const groupBy = url.searchParams.get("groupBy") || "day"; // day | week | month
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const skip = (page - 1) * limit;

  // "period=30d" (used by the dashboard) takes precedence over explicit
  // startDate/endDate if both are somehow given.
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const periodDays = period ? PERIOD_DAYS[period] : undefined;
  const rangeStart = periodDays
    ? new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    : startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rangeEnd = endDate ? new Date(endDate) : undefined;

  try {
    const where: Record<string, unknown> = { siteId };
    if (event) where.event = event;
    where.createdAt = { gte: rangeStart, ...(rangeEnd ? { lte: rangeEnd } : {}) };

    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({ where: where as any, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.analyticsEvent.count({ where: where as any }),
    ]);

    const metricsWhere = { siteId, createdAt: { gte: rangeStart, ...(rangeEnd ? { lte: rangeEnd } : {}) } };

    const [
      pageViews, addToCart, checkoutStarts, purchaseEvents, uniqueSessions, uniqueGuestVisitors,
      pageGroups, deviceGroups, sourceGroups, productViewGroups,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "page_view" } as any }),
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "add_to_cart" } as any }),
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "checkout" } as any }),
      prisma.analyticsEvent.findMany({ where: { ...metricsWhere, event: "purchase" } as any, select: { metadata: true } }),
      prisma.analyticsEvent.findMany({ where: { ...metricsWhere, sessionId: { not: null } } as any, select: { sessionId: true }, distinct: ["sessionId"] }),
      // Distinct visitorId, not sessionId — a guest who clicked an ad, left,
      // and came back later is one visitor across two sessions. This is
      // what actually answers "how many different people saw this landing
      // page", including anyone who never filled a form.
      prisma.analyticsEvent.findMany({ where: { ...metricsWhere, visitorId: { not: null } } as any, select: { visitorId: true }, distinct: ["visitorId"] }),
      prisma.analyticsEvent.groupBy({ by: ["page"], where: { ...metricsWhere, event: "page_view", page: { not: null } } as any, _count: { _all: true }, orderBy: { _count: { page: "desc" } }, take: 10 } as any),
      prisma.analyticsEvent.groupBy({ by: ["device"], where: { ...metricsWhere, device: { not: null } } as any, _count: { _all: true } } as any),
      prisma.analyticsEvent.groupBy({ by: ["source"], where: { ...metricsWhere, source: { not: null } } as any, _count: { _all: true } } as any),
      prisma.analyticsEvent.groupBy({ by: ["productId"], where: { ...metricsWhere, event: "product_view", productId: { not: null } } as any, _count: { _all: true }, orderBy: { _count: { productId: "desc" } }, take: 10 } as any),
    ]);

    const purchases = purchaseEvents.length;
    const revenue = purchaseEvents.reduce((sum: number, e: { metadata: unknown }) => {
      const meta = e.metadata as Record<string, unknown> | null;
      const value = meta && typeof meta.value === "number" ? meta.value : 0;
      return sum + value;
    }, 0);
    const uniqueVisitors = uniqueSessions.length;
    const uniqueGuests = uniqueGuestVisitors.length;
    const conversionRate = pageViews > 0 ? Math.round((purchases / pageViews) * 10000) / 100 : 0;
    const cartRate = pageViews > 0 ? Math.round((addToCart / pageViews) * 10000) / 100 : 0;

    const topPages = (pageGroups as any[]).map((g) => ({ page: g.page as string, views: g._count._all as number }));
    const deviceBreakdown = (deviceGroups as any[]).map((g) => ({ device: g.device as string, count: g._count._all as number }));
    const sourceBreakdown = (sourceGroups as any[]).map((g) => ({ source: g.source as string, count: g._count._all as number }));

    let topProducts: { productId: string; name: string; views: number }[] = [];
    const productIds = (productViewGroups as any[]).map((g) => g.productId as string);
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } });
      const nameById = new Map(products.map((p: { id: string; name: string }) => [p.id, p.name]));
      topProducts = (productViewGroups as any[]).map((g) => ({
        productId: g.productId as string,
        name: (nameById.get(g.productId as string) as string | undefined) || "Unknown product",
        views: g._count._all as number,
      }));
    }

    // Group by time period
    let dateTrunc: string;
    if (groupBy === "week") dateTrunc = "week";
    else if (groupBy === "month") dateTrunc = "month";
    else dateTrunc = "day";

    const timeline = await prisma.$queryRawUnsafe<
      { date: string; event: string; count: number }[]
    >(
      `SELECT DATE_TRUNC($1, "createdAt")::date as date, event, COUNT(*)::int as count
       FROM analytics_events
       WHERE "siteId" = $2 AND "createdAt" >= $3 ${rangeEnd ? 'AND "createdAt" <= $4' : ""}
       GROUP BY DATE_TRUNC($1, "createdAt")::date, event
       ORDER BY date ASC`,
      dateTrunc,
      siteId,
      rangeStart,
      ...(rangeEnd ? [rangeEnd] : [])
    );

    return success({
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: { pageViews, uniqueVisitors, uniqueGuests, addToCarts: addToCart, purchases, conversionRate, revenue },
      metrics: { pageViews, addToCart, checkoutStarts, purchases, conversionRate, cartRate }, // kept for any other existing consumers
      topPages,
      topProducts,
      deviceBreakdown,
      sourceBreakdown,
      timeline,
    });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/sites/:siteId/analytics — record an analytics event (public)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;

  // Verify store exists (no auth required — storefront tracking)
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return error("Store not found", 404);

  try {
    const body = await req.json();
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { metadata, ...rest } = parsed.data;
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        siteId,
        ...rest,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });

    return success(analyticsEvent, 201);
  } catch (err) {
    console.error("Analytics POST error:", err);
    return error("Internal server error", 500);
  }
}
