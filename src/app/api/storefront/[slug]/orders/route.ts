import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ slug: string }> };

// GET /api/storefront/:slug/orders?email=...
// Public: customers can look up their own orders by email
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
  }

  // This endpoint has no auth at all — it's a public email->orders lookup,
  // which without a limit is an easy way to scrape whether an email has
  // shopped here and see their order totals/history. Rate limiting doesn't
  // fully close that (a real fix would require verifying the requester
  // owns the email, e.g. via a magic link), but it at least stops
  // automated mass lookups.
  const rl = rateLimit(`storefront-orders-lookup:${getClientIp(req)}`, 20, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { siteId: site.id, email: { equals: email, mode: "insensitive" } },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const data = orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    itemCount: o._count.items,
  }));

  return NextResponse.json({ success: true, data });
}
