import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;

  const [carts, total] = await Promise.all([
    prisma.abandonedCart.findMany({
      where: where as any, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      include: { customer: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.abandonedCart.count({ where: where as any }),
  ]);

  // Summary
  const stats = await prisma.abandonedCart.groupBy({ by: ["status"], where: { siteId }, _count: true, _sum: { totalAmount: true } });
  const summary = {
    total: stats.reduce((a, s) => a + s._count, 0),
    totalValue: stats.reduce((a, s) => a + (s._sum.totalAmount || 0), 0),
    byStatus: Object.fromEntries(stats.map((s) => [s.status, { count: s._count, value: s._sum.totalAmount || 0 }])),
  };

  return success({ carts, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
