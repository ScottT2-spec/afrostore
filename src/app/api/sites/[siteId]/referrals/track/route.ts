import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { attributeOrderToReferral } from "@/lib/referrals";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/referrals/track?ref=CODE — track click
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const code = req.nextUrl.searchParams.get("ref");
  if (!code) return error("Missing ref code");

  const affiliate = await prisma.affiliate.findUnique({
    where: { code },
    include: { program: true },
  });

  if (!affiliate || affiliate.program.siteId !== siteId) {
    return error("Invalid referral code", 404);
  }
  if (affiliate.status !== "APPROVED") {
    return error("Affiliate not active", 403);
  }
  if (!affiliate.program.enabled) {
    return error("Referral program not active", 403);
  }

  // Record click
  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: { totalClicks: { increment: 1 } },
  });

  // Create a pending referral for this click
  const referral = await prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    },
  });

  return success({
    referralId: referral.id,
    affiliateCode: affiliate.code,
    cookieDays: affiliate.program.cookieDays,
  });
}

// POST /api/sites/:siteId/referrals/track — attribute an order to a referral
// (called right after order creation, before payment). This only links the
// order to the referral — it does NOT award commission. Commission is only
// credited once payment actually succeeds, via convertReferral in
// src/lib/payments.ts, so an abandoned or failed checkout never pays an
// affiliate for a sale that didn't happen.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const body = await req.json();
  const { referralId, orderId, affiliateCode } = body;

  if (!orderId) return error("orderId is required");
  if (!referralId && !affiliateCode) return error("referralId or affiliateCode is required");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.siteId !== siteId) return error("Order not found", 404);

  await attributeOrderToReferral(siteId, orderId, { referralId, affiliateCode });

  return success({ attributed: true });
}
