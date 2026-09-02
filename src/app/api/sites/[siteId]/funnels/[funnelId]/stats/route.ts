import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; funnelId: string }> };

// GET /api/sites/:siteId/funnels/:funnelId/stats?from=&to=
//
// Aggregates real AnalyticsEvent rows (already tagged with funnelId by
// FunnelStepView's page_view tracking and checkout's purchase tracking)
// into the summary metrics shown on the Funnels dashboard.
//
// bumpOfferRevenue / offersRevenue are computed from "bump_offer_purchase"
// / "offer_purchase" events, which nothing in this codebase emits yet -
// there's no order-bump or one-click-upsell feature built. These are wired
// to a real (currently always-empty) query rather than hardcoded, so if
// that feature is ever added later, these cards start reflecting real
// numbers automatically without further changes here.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, funnelId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId }, select: { id: true } });
  if (!funnel) return error("Funnel not found", 404);

  const { searchParams } = new URL(req.url);
  const toParam = searchParams.get("to");
  const fromParam = searchParams.get("from");
  const to = toParam ? new Date(toParam) : new Date();
  const from = fromParam ? new Date(fromParam) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  // Include the entire "to" day, matching how a date-range picker's end date is normally understood.
  const toInclusive = new Date(to.getTime());
  toInclusive.setHours(23, 59, 59, 999);

  const dateWhere = { siteId, funnelId, createdAt: { gte: from, lte: toInclusive } };

  const [totalPageViews, totalVisitorRows, purchaseEvents, bumpOfferEvents, offerEvents] = await Promise.all([
    prisma.analyticsEvent.count({ where: { ...dateWhere, event: "page_view" } }),
    prisma.analyticsEvent.findMany({ where: { ...dateWhere, event: "page_view" }, select: { visitorId: true }, distinct: ["visitorId"] }),
    prisma.analyticsEvent.findMany({ where: { ...dateWhere, event: "purchase" }, select: { metadata: true } }),
    prisma.analyticsEvent.findMany({ where: { ...dateWhere, event: "bump_offer_purchase" }, select: { metadata: true } }),
    prisma.analyticsEvent.findMany({ where: { ...dateWhere, event: "offer_purchase" }, select: { metadata: true } }),
  ]);

  const sumValue = (rows: { metadata: unknown }[]) =>
    rows.reduce((sum, row) => {
      const meta = row.metadata as Record<string, unknown> | null;
      const v = meta && typeof meta.value === "number" ? meta.value : 0;
      return sum + v;
    }, 0);

  const totalVisitors = totalVisitorRows.filter((r: { visitorId: string | null }) => r.visitorId).length;
  const totalOrders = purchaseEvents.length;
  const totalRevenue = sumValue(purchaseEvents);
  const bumpOfferRevenue = sumValue(bumpOfferEvents);
  const offersRevenue = sumValue(offerEvents);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const revenuePerVisit = totalPageViews > 0 ? totalRevenue / totalPageViews : 0;
  const rpuv = totalVisitors > 0 ? totalRevenue / totalVisitors : 0;

  return success({
    dateRange: { from: from.toISOString(), to: toInclusive.toISOString() },
    totalVisitors,
    totalOrders,
    totalRevenue,
    avgOrderValue,
    bumpOfferRevenue,
    offersRevenue,
    revenuePerVisit,
    rpuv,
  });
}
