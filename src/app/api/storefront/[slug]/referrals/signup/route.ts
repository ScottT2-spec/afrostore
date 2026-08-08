import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /api/storefront/:slug/referrals/signup — public self-serve affiliate application.
// New affiliates always start PENDING regardless of the program's autoApprove
// setting — that flag governs commission approval, not who's allowed to become
// an affiliate at all. A merchant approves applicants from the dashboard.
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { email, firstName, lastName, phone } = body;

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "A valid email is required" }, { status: 400 });
  }
  if (!firstName || !lastName) {
    return NextResponse.json({ success: false, error: "First and last name are required" }, { status: 400 });
  }

  const program = await prisma.referralProgram.findUnique({ where: { siteId: site.id } });
  if (!program || !program.enabled) {
    return NextResponse.json({ success: false, error: "This store isn't accepting affiliate signups right now" }, { status: 403 });
  }

  let customer = await prisma.customer.findUnique({
    where: { siteId_email: { siteId: site.id, email: email.toLowerCase() } },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { siteId: site.id, email: email.toLowerCase(), firstName, lastName, phone },
    });
  }

  const existing = await prisma.affiliate.findUnique({
    where: { programId_customerId: { programId: program.id, customerId: customer.id } },
  });
  if (existing) {
    return NextResponse.json({
      success: true,
      data: { status: existing.status, alreadyApplied: true },
    });
  }

  let code = generateReferralCode();
  while (await prisma.affiliate.findUnique({ where: { code } })) {
    code = generateReferralCode();
  }

  try {
    const affiliate = await prisma.affiliate.create({
      data: {
        programId: program.id,
        customerId: customer.id,
        code,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: { status: affiliate.status, alreadyApplied: false },
    }, { status: 201 });
  } catch (err: any) {
    // Concurrent duplicate submission — the unique (programId, customerId)
    // constraint caught it. Treat it the same as "already applied".
    if (err?.code === "P2002") {
      return NextResponse.json({ success: true, data: { status: "PENDING", alreadyApplied: true } });
    }
    throw err;
  }
}
