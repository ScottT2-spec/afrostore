import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

// GET /api/storefront/:slug/loyalty/lookup?email=... — used at checkout,
// where the customer isn't necessarily logged in (guest checkout is the
// default flow), so we can't rely on a session cookie. Matches the same
// email-based identity the order-lookup and order-creation routes already
// use. Only returns the minimum needed to offer a redemption at checkout —
// no name/email echoed back, no full transaction history.
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

  const site = await prisma.site.findFirst({ where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] }, select: { id: true } });
  if (!site) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId: site.id } });
  if (!program || !program.enabled) {
    return NextResponse.json({ success: true, data: { enabled: false, availablePoints: 0 } });
  }

  const customer = await prisma.customer.findUnique({ where: { siteId_email: { siteId: site.id, email } } });
  const member = customer
    ? await prisma.loyaltyMember.findUnique({ where: { programId_customerId: { programId: program.id, customerId: customer.id } } })
    : null;

  return NextResponse.json({
    success: true,
    data: {
      enabled: true,
      isMember: !!member,
      availablePoints: member?.availablePoints ?? 0,
      redemptionRate: Number(program.redemptionRate),
      minRedeemPoints: program.minRedeemPoints,
    },
  });
}
