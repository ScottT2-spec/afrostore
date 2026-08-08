import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// POST — create a payout for an affiliate
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { affiliateId, amount, reference, note } = body;

  if (!affiliateId) return error("affiliateId is required");
  if (!amount || amount <= 0) return error("Valid amount is required");

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: { program: true },
  });

  if (!affiliate || affiliate.program.siteId !== siteId) {
    return error("Affiliate not found", 404);
  }

  try {
    const payout = await prisma.$transaction(async (tx) => {
      // Re-read inside the transaction and use an atomic conditional update
      // so two concurrent payout requests can't both pass the balance
      // check against a stale read and double-pay the same earnings.
      const current = await tx.affiliate.findUniqueOrThrow({ where: { id: affiliateId } });
      const approvedUnpaid = current.totalEarnings - current.paidEarnings;
      if (amount > approvedUnpaid) {
        throw new Error(`Amount exceeds available balance (₦${approvedUnpaid.toLocaleString()})`);
      }

      const guarded = await tx.affiliate.updateMany({
        where: { id: affiliateId, totalEarnings: { gte: current.paidEarnings + amount } },
        data: { paidEarnings: { increment: amount } },
      });
      if (guarded.count === 0) throw new Error("Balance changed — please retry");

      return tx.payout.create({
        data: {
          affiliateId,
          amount,
          status: "COMPLETED",
          reference,
          note,
          paidAt: new Date(),
        },
      });
    });

    return success(payout, 201);
  } catch (err: any) {
    return error(err.message || "Failed to create payout", 400);
  }
}
