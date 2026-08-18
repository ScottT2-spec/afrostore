import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthCustomer } from "@/lib/customer-auth";

type Params = { params: Promise<{ slug: string }> };

// GET /api/storefront/:slug/loyalty/me — the logged-in customer's own
// points balance, tier, and recent transaction history.
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const customer = await getAuthCustomer(req);
  if (!customer) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const site = await prisma.site.findFirst({ where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] }, select: { id: true } });
  if (!site) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId: site.id } });
  if (!program || !program.enabled) {
    return NextResponse.json({ success: true, data: { enabled: false } });
  }

  const member = await prisma.loyaltyMember.findUnique({
    where: { programId_customerId: { programId: program.id, customerId: customer.id } },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  return NextResponse.json({
    success: true,
    data: {
      enabled: true,
      availablePoints: member?.availablePoints ?? 0,
      totalPoints: member?.totalPoints ?? 0,
      redeemedPoints: member?.redeemedPoints ?? 0,
      tier: member?.tier ?? "bronze",
      redemptionRate: Number(program.redemptionRate),
      minRedeemPoints: program.minRedeemPoints,
      pointsPerCurrency: Number(program.pointsPerCurrency),
      currencyPerPoint: Number(program.currencyPerPoint),
      transactions: (member?.transactions ?? []).map((t: { id: string; type: string; points: number; description: string; createdAt: Date }) => ({
        id: t.id, type: t.type, points: t.points, description: t.description, createdAt: t.createdAt,
      })),
    },
  });
}
