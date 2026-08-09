import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Referral/affiliate conversion engine.
 *
 * Split into two phases on purpose:
 *  1. Attribution (attributeOrderToReferral) — links an order to the
 *     referral that sent the customer. Happens at checkout, before
 *     payment. No money moves here.
 *  2. Conversion (convertReferral) — actually credits the affiliate's
 *     commission. Only called once payment has actually succeeded, so
 *     an abandoned or failed checkout never pays out a commission.
 *
 * Both phases are idempotent so retries / concurrent calls can't
 * double-attribute or double-credit.
 */

type TxClient = Prisma.TransactionClient | typeof prisma;

/**
 * Link an order to whichever referral sent the customer, if any.
 * Safe to call multiple times for the same order (Referral.orderId is
 * unique, so a duplicate call is a no-op rather than a crash).
 * Does NOT award commission — that happens in convertReferral.
 */
export async function attributeOrderToReferral(
  siteId: string,
  orderId: string,
  params: { referralId?: string; affiliateCode?: string }
) {
  const { referralId, affiliateCode } = params;
  if (!referralId && !affiliateCode) return;

  // If this order is already attributed (e.g. a retried request), stop.
  const already = await prisma.referral.findUnique({ where: { orderId } });
  if (already) return;

  let affiliate;
  if (affiliateCode) {
    affiliate = await prisma.affiliate.findUnique({ where: { code: affiliateCode }, include: { program: true } });
  } else if (referralId) {
    const referral = await prisma.referral.findUnique({ where: { id: referralId }, include: { affiliate: { include: { program: true } } } });
    affiliate = referral?.affiliate;
  }
  if (!affiliate || affiliate.program.siteId !== siteId) return;

  try {
    if (referralId) {
      // Only attach if that referral hasn't already been claimed by another order.
      await prisma.referral.updateMany({
        where: { id: referralId, orderId: null },
        data: { orderId },
      });
    } else {
      await prisma.referral.create({
        data: { affiliateId: affiliate.id, orderId },
      });
    }
  } catch (err: any) {
    // Unique constraint on orderId — another request attributed it first. Fine.
    if (err?.code !== "P2002") throw err;
  }
}

/**
 * Credit the affiliate's commission for an order that has been confirmed
 * paid. Idempotent: guarded by an atomic PENDING -> CONVERTED/APPROVED
 * transition on the referral row, so calling this twice for the same
 * order (e.g. a retried webhook) only credits the commission once.
 */
export async function convertReferral(tx: TxClient, siteId: string, orderId: string, orderTotal: number) {
  const referral = await tx.referral.findUnique({
    where: { orderId },
    include: { affiliate: { include: { program: true } } },
  });
  if (!referral) return; // this order wasn't referred
  if (referral.affiliate.program.siteId !== siteId) return;
  if (!referral.affiliate.program.enabled) return;

  const program = referral.affiliate.program;
  const commission = program.commissionType === "PERCENTAGE"
    ? (orderTotal * program.commissionValue) / 100
    : program.commissionValue;

  const newStatus = program.autoApprove ? "APPROVED" : "CONVERTED";

  // Atomic guard: only proceed if still PENDING, so a duplicate call is a no-op.
  const guarded = await tx.referral.updateMany({
    where: { id: referral.id, status: "PENDING" },
    data: {
      status: newStatus,
      commissionAmount: commission,
      convertedAt: new Date(),
      ...(newStatus === "APPROVED" ? { approvedAt: new Date() } : {}),
    },
  });
  if (guarded.count === 0) return; // already converted by a concurrent call

  await tx.affiliate.update({
    where: { id: referral.affiliateId },
    data: {
      totalOrders: { increment: 1 },
      ...(newStatus === "APPROVED"
        ? { totalEarnings: { increment: commission } }
        : { pendingEarnings: { increment: commission } }),
    },
  });
}

/**
 * Reverse a commission for an order that's being cancelled or refunded
 * after it was already converted. Idempotent — guarded by an atomic
 * status transition, so calling this twice is a no-op.
 *
 * Reuses the REJECTED status to mean "voided" here (there's no separate
 * CANCELLED value on ReferralStatus). If the affiliate was already paid
 * out for this commission, totalEarnings can go below paidEarnings —
 * that's a real debt the merchant would need to handle manually; this
 * doesn't attempt to claw back money already paid out.
 */
export async function reverseReferral(tx: TxClient, siteId: string, orderId: string) {
  const referral = await tx.referral.findUnique({
    where: { orderId },
    include: { affiliate: { include: { program: true } } },
  });
  if (!referral) return;
  if (referral.affiliate.program.siteId !== siteId) return;
  if (referral.status !== "CONVERTED" && referral.status !== "APPROVED") return;

  const wasApproved = referral.status === "APPROVED";
  const commission = referral.commissionAmount;

  const guarded = await tx.referral.updateMany({
    where: { id: referral.id, status: referral.status },
    data: { status: "REJECTED" },
  });
  if (guarded.count === 0) return; // already reversed or changed concurrently

  await tx.affiliate.update({
    where: { id: referral.affiliateId },
    data: {
      totalOrders: { decrement: 1 },
      ...(wasApproved
        ? { totalEarnings: { decrement: commission } }
        : { pendingEarnings: { decrement: commission } }),
    },
  });
}
