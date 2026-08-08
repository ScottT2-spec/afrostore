import { Prisma, LoyaltyProgram } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Loyalty points engine.
 *
 * All balance mutations go through here so there is exactly one place
 * that touches LoyaltyMember.totalPoints / availablePoints / redeemedPoints.
 * Every write uses an atomic conditional update (updateMany + count check,
 * or a DB-level guard) so concurrent requests can never double-award or
 * double-spend points — this matters once there's real order volume.
 */

type TxClient = Prisma.TransactionClient | typeof prisma;

/** Points earned for a given order total, per the program's configured rate. */
export function calcEarnedPoints(program: Pick<LoyaltyProgram, "pointsPerCurrency" | "currencyPerPoint">, orderTotal: number): number {
  if (!program.currencyPerPoint || program.currencyPerPoint <= 0) return 0;
  return Math.floor((orderTotal / program.currencyPerPoint) * program.pointsPerCurrency);
}

/** Currency value of a number of points, per the program's configured redemption rate. */
export function calcRedemptionValue(program: Pick<LoyaltyProgram, "redemptionRate">, points: number): number {
  return Math.round(points * program.redemptionRate * 100) / 100;
}

/**
 * Get or create a member. Creating a member is the only time welcome
 * points are granted, and it's guarded by the unique (programId, customerId)
 * constraint — a concurrent duplicate create simply fails and we re-read.
 */
async function getOrCreateMember(tx: TxClient, program: LoyaltyProgram, customerId: string) {
  const existing = await tx.loyaltyMember.findUnique({
    where: { programId_customerId: { programId: program.id, customerId } },
  });
  if (existing) return existing;

  try {
    const member = await tx.loyaltyMember.create({
      data: {
        programId: program.id,
        customerId,
        totalPoints: program.welcomePoints,
        availablePoints: program.welcomePoints,
      },
    });
    if (program.welcomePoints > 0) {
      await tx.loyaltyTransaction.create({
        data: { memberId: member.id, type: "bonus", points: program.welcomePoints, description: "Welcome bonus" },
      });
    }
    return member;
  } catch {
    // Lost a create race to a concurrent request — the member now exists, use it.
    const member = await tx.loyaltyMember.findUnique({
      where: { programId_customerId: { programId: program.id, customerId } },
    });
    if (!member) throw new Error("Failed to create or find loyalty member");
    return member;
  }
}

/**
 * Award points for a completed order. Safe to call from inside the same
 * DB transaction that marks the order paid — idempotency is the caller's
 * responsibility (payments.ts only calls this once per order, guarded by
 * the PENDING -> SUCCESS transition on the payment transaction).
 */
export async function awardOrderPoints(tx: TxClient, siteId: string, customerId: string, orderTotal: number, orderId: string) {
  const program = await tx.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program || !program.enabled) return null;

  const member = await getOrCreateMember(tx, program, customerId);

  const points = calcEarnedPoints(program, orderTotal);
  if (points > 0) {
    await tx.loyaltyMember.update({
      where: { id: member.id },
      data: { totalPoints: { increment: points }, availablePoints: { increment: points } },
    });
    await tx.loyaltyTransaction.create({
      data: { memberId: member.id, type: "earn", points, description: "Purchase", orderId },
    });
  }
  return { program, member, pointsEarned: points };
}

/**
 * Finalize a points redemption that was priced in at order-creation time.
 * Uses an atomic conditional decrement (only succeeds if the balance is
 * still sufficient) so two concurrent orders can never both spend the
 * same points. If the balance has since dropped (e.g. spent elsewhere),
 * this silently no-ops and logs — the order's price was already fixed,
 * so we can't retroactively fail a payment that already succeeded.
 */
export async function finalizeOrderRedemption(tx: TxClient, siteId: string, customerId: string, points: number, orderId: string) {
  if (points <= 0) return;
  const program = await tx.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program) return;

  const member = await tx.loyaltyMember.findUnique({
    where: { programId_customerId: { programId: program.id, customerId } },
  });
  if (!member) {
    console.error(`Loyalty redemption finalize: no member found for order ${orderId}`);
    return;
  }

  const result = await tx.loyaltyMember.updateMany({
    where: { id: member.id, availablePoints: { gte: points } },
    data: { availablePoints: { decrement: points }, redeemedPoints: { increment: points } },
  });

  if (result.count === 0) {
    console.error(`Loyalty redemption finalize: insufficient balance for member ${member.id} on order ${orderId} (wanted ${points})`);
    return;
  }

  await tx.loyaltyTransaction.create({
    data: { memberId: member.id, type: "redeem", points: -points, description: "Redeemed at checkout", orderId },
  });
}

/**
 * Validate a proposed redemption at checkout time (before payment), so the
 * order total can be discounted correctly. Does NOT mutate the balance —
 * the actual spend is finalized on payment success via finalizeOrderRedemption.
 */
export async function validateRedemption(siteId: string, customerId: string, points: number): Promise<
  | { ok: true; program: LoyaltyProgram; discount: number }
  | { ok: false; message: string }
> {
  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program || !program.enabled) return { ok: false, message: "Loyalty program is not active" };
  if (points < program.minRedeemPoints) return { ok: false, message: `Minimum ${program.minRedeemPoints} points required to redeem` };

  const member = await prisma.loyaltyMember.findUnique({
    where: { programId_customerId: { programId: program.id, customerId } },
  });
  if (!member || member.availablePoints < points) return { ok: false, message: "Insufficient points balance" };

  const discount = calcRedemptionValue(program, points);
  return { ok: true, program, discount };
}

/** Manual award/deduct from the dashboard or AI assistant (outside the order flow). */
export async function manualAdjustPoints(siteId: string, customerId: string, action: "earn" | "redeem", points: number, description?: string) {
  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program) throw new Error("Loyalty program is not set up");

  return prisma.$transaction(async (tx) => {
    const member = await getOrCreateMember(tx, program, customerId);

    if (action === "earn") {
      await tx.loyaltyMember.update({
        where: { id: member.id },
        data: { totalPoints: { increment: points }, availablePoints: { increment: points } },
      });
      await tx.loyaltyTransaction.create({
        data: { memberId: member.id, type: "earn", points, description: description || "Manual adjustment" },
      });
    } else {
      if (points < program.minRedeemPoints) throw new Error(`Minimum ${program.minRedeemPoints} points to redeem`);
      const result = await tx.loyaltyMember.updateMany({
        where: { id: member.id, availablePoints: { gte: points } },
        data: { availablePoints: { decrement: points }, redeemedPoints: { increment: points } },
      });
      if (result.count === 0) throw new Error("Insufficient points");
      await tx.loyaltyTransaction.create({
        data: { memberId: member.id, type: "redeem", points: -points, description: description || "Manual redemption" },
      });
    }

    return tx.loyaltyMember.findUnique({
      where: { id: member.id },
      include: { customer: { select: { id: true, firstName: true, lastName: true, email: true } }, transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  });
}

/**
 * Reverse points earned/redeemed for an order that's being cancelled or
 * refunded after payment succeeded. Idempotent — a "reversal" ledger entry
 * marks it done, so calling this twice for the same order is a no-op.
 *
 * Earned points are only clawed back up to whatever is still in the
 * member's available balance — if the customer already spent those points
 * elsewhere, we don't push their balance negative. Redeemed points (the
 * discount they used on this order) are always refunded in full, since the
 * order that discount paid for never actually completed.
 */
export async function reverseOrderPoints(tx: TxClient, siteId: string, customerId: string, orderId: string) {
  const program = await tx.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program) return;
  const member = await tx.loyaltyMember.findUnique({
    where: { programId_customerId: { programId: program.id, customerId } },
  });
  if (!member) return;

  const alreadyReversed = await tx.loyaltyTransaction.findFirst({ where: { memberId: member.id, orderId, type: "reversal" } });
  if (alreadyReversed) return;

  const earnTx = await tx.loyaltyTransaction.findFirst({ where: { memberId: member.id, orderId, type: "earn" } });
  const redeemTx = await tx.loyaltyTransaction.findFirst({ where: { memberId: member.id, orderId, type: "redeem" } });

  if (earnTx && earnTx.points > 0) {
    const fresh = await tx.loyaltyMember.findUniqueOrThrow({ where: { id: member.id } });
    const clawback = Math.min(earnTx.points, fresh.availablePoints);
    if (clawback > 0) {
      await tx.loyaltyMember.update({
        where: { id: member.id },
        data: { availablePoints: { decrement: clawback }, totalPoints: { decrement: clawback } },
      });
    }
    await tx.loyaltyTransaction.create({
      data: { memberId: member.id, type: "reversal", points: -clawback, description: "Order cancelled/refunded — points reversed", orderId },
    });
  }

  if (redeemTx) {
    const refund = -redeemTx.points; // redeemTx.points was stored negative
    await tx.loyaltyMember.update({
      where: { id: member.id },
      data: { availablePoints: { increment: refund }, redeemedPoints: { decrement: refund } },
    });
    await tx.loyaltyTransaction.create({
      data: { memberId: member.id, type: "reversal", points: refund, description: "Order cancelled/refunded — redeemed points refunded", orderId },
    });
  }
}

/** Award points for an approved review. Idempotent per review via the caller's guarded update. */
export async function awardReviewPoints(siteId: string, customerId: string, reviewId: string) {
  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program || !program.enabled || program.reviewPoints <= 0) return;

  await prisma.$transaction(async (tx) => {
    const member = await getOrCreateMember(tx, program, customerId);
    await tx.loyaltyMember.update({
      where: { id: member.id },
      data: { totalPoints: { increment: program.reviewPoints }, availablePoints: { increment: program.reviewPoints } },
    });
    await tx.loyaltyTransaction.create({
      data: { memberId: member.id, type: "earn", points: program.reviewPoints, description: "Review bonus", orderId: undefined },
    });
  });
}
