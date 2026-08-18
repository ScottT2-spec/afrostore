import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthCustomer } from "@/lib/customer-auth";
import { joinLoyaltyProgram } from "@/lib/loyalty";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/loyalty/join
// Body (guest/checkout path): { email, firstName?, lastName? }
// Or just an Authorization header for a logged-in customer.
// This is the ONLY way a customer becomes a loyalty member — no purchase
// or any other action silently enrolls anyone.
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const site = await prisma.site.findFirst({ where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] }, select: { id: true } });
  if (!site) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

  let customerId: string | null = null;

  const authed = await getAuthCustomer(req);
  if (authed) {
    customerId = authed.id;
  } else {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

    const customer = await prisma.customer.upsert({
      where: { siteId_email: { siteId: site.id, email } },
      update: {},
      create: {
        siteId: site.id,
        email,
        firstName: body.firstName || "Guest",
        lastName: body.lastName || "",
      },
    });
    customerId = customer.id;
  }

  const result = await joinLoyaltyProgram(site.id, customerId as string);
  if (!result.joined) return NextResponse.json({ success: false, error: result.reason }, { status: 400 });

  return NextResponse.json({ success: true, data: { alreadyMember: result.alreadyMember } });
}
