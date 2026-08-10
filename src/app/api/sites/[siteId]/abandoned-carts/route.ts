import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET — list abandoned carts
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const status = req.nextUrl.searchParams.get("status") || undefined;

  const carts = await prisma.abandonedCart.findMany({
    where: {
      siteId,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Summary stats
  const [total, active, recovered, totalValue, recoveredValue] = await Promise.all([
    prisma.abandonedCart.count({ where: { siteId } }),
    prisma.abandonedCart.count({ where: { siteId, status: "ACTIVE" } }),
    prisma.abandonedCart.count({ where: { siteId, status: "RECOVERED" } }),
    prisma.abandonedCart.aggregate({ where: { siteId }, _sum: { totalAmount: true } }),
    prisma.abandonedCart.aggregate({ where: { siteId, status: "RECOVERED" }, _sum: { totalAmount: true } }),
  ]);

  return success({
    carts,
    stats: {
      total,
      active,
      recovered,
      recoveryRate: total > 0 ? ((recovered / total) * 100).toFixed(1) : "0",
      totalValue: totalValue._sum.totalAmount || 0,
      recoveredValue: recoveredValue._sum.totalAmount || 0,
    },
  });
}

// POST — record/update an abandoned cart (called from the storefront while
// a visitor has items in their cart; public endpoint, no auth - same trust
// model as other storefront tracking calls).
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const body = await req.json();
  const { email, phone, sessionId, items, totalAmount, currency, customerId } = body;

  if (!items || !Array.isArray(items) || items.length === 0) return error("Cart items required");
  if (items.length > 200) return error("Too many cart items");
  if (!email && !phone && !sessionId) return error("At least email, phone, or sessionId required");

  const site = await prisma.site.findFirst({ where: { id: siteId, status: "ACTIVE" }, select: { id: true } });
  if (!site) return error("Store not found", 404);

  // Match on ANY identifier we have, not just one - a visitor typically
  // starts anonymous (sessionId only) and only becomes reachable (email/
  // phone) once they reach checkout. Without an OR match here, that later
  // call with email/phone would create a duplicate record instead of
  // upgrading the original session's cart with contact info.
  const identifiers = [
    sessionId ? { sessionId } : null,
    email ? { email } : null,
    phone ? { phone } : null,
  ].filter((x): x is { sessionId: string } | { email: string } | { phone: string } => x !== null);

  const existing = await prisma.abandonedCart.findFirst({
    where: { siteId, status: "ACTIVE", OR: identifiers },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    const updated = await prisma.abandonedCart.update({
      where: { id: existing.id },
      data: {
        items,
        totalAmount: totalAmount || 0,
        currency: currency || "NGN",
        // Upgrade with any newly-known identity - never null out what we
        // already had.
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(customerId ? { customerId } : {}),
        ...(sessionId && !existing.sessionId ? { sessionId } : {}),
      },
    });
    return success(updated);
  }

  const cart = await prisma.abandonedCart.create({
    data: {
      siteId,
      customerId,
      email,
      phone,
      sessionId,
      items,
      totalAmount: totalAmount || 0,
      currency: currency || "NGN",
    },
  });

  return success(cart, 201);
}
