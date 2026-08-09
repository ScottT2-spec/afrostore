import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/dashboard
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // "Orders" reflects real order volume — every order that wasn't
    // cancelled/refunded, regardless of payment stage (a merchant needs to
    // see pending-payment orders too, that's operationally useful). "Total
    // Revenue" is stricter: money actually collected, so it only counts
    // orders that are paid AND weren't later cancelled/refunded. These are
    // deliberately two different filters, not one shared query — the
    // previous version counted every order ever placed (including unpaid,
    // pending, and cancelled ones) as "revenue", which meaningfully
    // overstates what the merchant actually made.
    const notVoided = { status: { notIn: ["CANCELLED", "REFUNDED"] } } as const;
    const paidAndNotVoided = { paymentStatus: "PAID", ...notVoided } as const;

    // Current period aggregates
    const [
      currentOrderCountResult,
      previousOrderCountResult,
      currentRevenueResult,
      previousRevenueResult,
      totalCustomers,
      previousCustomers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { siteId, createdAt: { gte: thirtyDaysAgo }, ...notVoided } }),
      prisma.order.count({ where: { siteId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, ...notVoided } }),
      prisma.order.aggregate({
        where: { siteId, createdAt: { gte: thirtyDaysAgo }, ...paidAndNotVoided },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { siteId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, ...paidAndNotVoided },
        _sum: { total: true },
      }),
      prisma.customer.count({ where: { siteId, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.customer.count({ where: { siteId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.product.count({ where: { siteId } }),
      prisma.order.findMany({
        where: { siteId },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Top products by sales — counts any non-cancelled/refunded order (this
    // is a demand/popularity signal, not an accounting figure).
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { siteId, createdAt: { gte: thirtyDaysAgo }, ...notVoided },
        productId: { not: null },
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const topProductIds = topProducts.map((p) => p.productId).filter(Boolean) as string[];
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, slug: true, price: true, images: { take: 1, select: { url: true } } },
    });
    const productMap = new Map(topProductDetails.map((p) => [p.id, p]));

    const topProductsWithDetails = topProducts.map((p) => ({
      ...productMap.get(p.productId!),
      totalSold: p._sum.quantity || 0,
      totalRevenue: p._sum.total || 0,
    }));

    // Revenue over time (last 30 days) — same PAID + not-voided definition
    // as the headline revenue figure above, so the trend chart and the
    // stat card can never disagree with each other.
    const revenueByDay = await prisma.$queryRawUnsafe<
      { date: string; revenue: number; orders: number }[]
    >(
      `SELECT DATE("createdAt") as date, 
              COALESCE(SUM(total), 0)::float as revenue, 
              COUNT(*)::int as orders
       FROM orders 
       WHERE "siteId" = $1 AND "createdAt" >= $2
         AND "paymentStatus" = 'PAID' AND status NOT IN ('CANCELLED', 'REFUNDED')
       GROUP BY DATE("createdAt") 
       ORDER BY date ASC`,
      siteId,
      thirtyDaysAgo
    );

    // Calculate percentage changes
    const currentRevenue = Number(currentRevenueResult._sum.total || 0);
    const previousRevenue = Number(previousRevenueResult._sum.total || 0);
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0;

    const currentOrderCount = currentOrderCountResult;
    const previousOrderCount = previousOrderCountResult;
    const ordersChange = previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : currentOrderCount > 0 ? 100 : 0;

    const customersChange = previousCustomers > 0
      ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
      : totalCustomers > 0 ? 100 : 0;

    return success({
      stats: {
        totalRevenue: currentRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalOrders: currentOrderCount,
        ordersChange: Math.round(ordersChange * 10) / 10,
        totalCustomers,
        customersChange: Math.round(customersChange * 10) / 10,
        totalProducts,
      },
      recentOrders,
      topProducts: topProductsWithDetails,
      revenueOverTime: revenueByDay,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return error("Internal server error", 500);
  }
}
