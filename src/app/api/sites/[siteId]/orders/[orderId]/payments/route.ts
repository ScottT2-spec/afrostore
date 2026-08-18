import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit, serverError } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { runAutomationsForTrigger } from "@/lib/automations";
import { awardOrderPoints, finalizeOrderRedemption } from "@/lib/loyalty";
import { convertReferral } from "@/lib/referrals";
import { z } from "zod";

type Params = { params: Promise<{ siteId: string; orderId: string }> };

const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.string().min(1, "Method is required").max(60),
  note: z.string().max(500).optional(),
  reference: z.string().max(120).optional(),
});

// GET /api/sites/:siteId/orders/:orderId/payments — payment history for an
// order (how it's been paid so far, across possibly multiple transactions).
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, orderId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const order = await prisma.order.findFirst({ where: { id: orderId, siteId }, select: { id: true, total: true, amountPaid: true, paymentStatus: true, currency: true } });
  if (!order) return error("Order not found", 404);

  const transactions = await prisma.paymentTransaction.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return success({ order, transactions });
}

// POST /api/sites/:siteId/orders/:orderId/payments — record a payment
// against an order. Supports split/partial payments: an order can receive
// multiple payments (different methods, different times — e.g. a cash
// deposit now and a bank transfer for the balance later) via repeated
// calls to this endpoint. The order is only marked PAID once the running
// total (amountPaid) meets or exceeds the order total; otherwise it's
// PARTIALLY_PAID.
//
// This is for merchant-recorded payments (cash, in-person transfer, POS
// terminal, WhatsApp/manual orders) — NOT for online-gateway checkouts,
// which continue to go through processPaymentConfirmation via the
// existing webhook flow untouched.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, orderId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = recordPaymentSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Invalid input", 400);

  const order = await prisma.order.findFirst({ where: { id: orderId, siteId } });
  if (!order) return error("Order not found", 404);
  if (order.paymentStatus === "PAID") return error("This order is already fully paid", 400);
  if (order.paymentStatus === "REFUNDED") return error("This order has been refunded — can't record a new payment against it", 400);

  const remaining = Number(order.total) - Number(order.amountPaid);
  if (parsed.data.amount > remaining + 0.01) {
    return error(`That's more than the remaining balance (${remaining.toFixed(2)} ${order.currency}). Record a smaller amount, or adjust the order total first.`, 400);
  }

  try {
    const wasFullyPaidAfter = async () => {
    // Get-or-create the site's single "Manual" gateway row — a bookkeeping
    // record for non-gateway payments, not a real payment processor
    // integration, so it doesn't need API keys.
    const manualGateway = await prisma.paymentGateway.upsert({
      where: { siteId_provider: { siteId, provider: "MANUAL" } },
      create: { siteId, provider: "MANUAL", isEnabled: true },
      update: {},
    });

    const reference = parsed.data.reference || `MANUAL-${orderId}-${Date.now()}`;

    const result = await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.create({
        data: {
          gatewayId: manualGateway.id,
          orderId,
          reference,
          amount: parsed.data.amount,
          currency: order.currency,
          status: "SUCCESS",
          method: parsed.data.method,
          metadata: { note: parsed.data.note, recordedBy: ctx.user!.id, recordedManually: true } as any,
          paidAt: new Date(),
        },
      });

      const newAmountPaid = Number(order.amountPaid) + parsed.data.amount;
      const isFullyPaid = newAmountPaid >= Number(order.total) - 0.01;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
          ...(isFullyPaid && order.paymentStatus !== "PAID" ? { paidAt: new Date(), status: order.status === "PENDING" ? "CONFIRMED" : order.status } : {}),
        },
        // The client replaces its in-memory order with whatever comes back
        // here (setSelectedOrder(res.data)) and immediately renders
        // order.items.map(...) — without this include, items is undefined
        // and that render crashes the whole order-detail panel.
        include: { items: true },
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: updatedOrder.status,
          note: `Payment of ${order.currency} ${parsed.data.amount} recorded (${parsed.data.method})${isFullyPaid ? " — order fully paid" : ` — ${(Number(order.total) - newAmountPaid).toFixed(2)} ${order.currency} remaining`}`,
        },
      });

      // Mirror the gateway-confirmation path's downstream effects, but
      // only the first time this order actually reaches fully-paid —
      // never double-award loyalty points or double-credit a referral
      // across multiple partial payments on the same order.
      if (isFullyPaid && order.paymentStatus !== "PAID") {
        if (updatedOrder.customerId) {
          try {
            await tx.customer.update({ where: { id: updatedOrder.customerId }, data: { totalSpent: { increment: Number(updatedOrder.total) } } });
          } catch (err) {
            console.error("Customer totalSpent update error for order", orderId, err);
          }
          try {
            await awardOrderPoints(tx, siteId, updatedOrder.customerId, Number(updatedOrder.total), orderId);
            if (updatedOrder.loyaltyPointsRedeemed > 0) {
              await finalizeOrderRedemption(tx, siteId, updatedOrder.customerId, updatedOrder.loyaltyPointsRedeemed, orderId);
            }
          } catch (err) {
            console.error("Loyalty processing error for order", orderId, err);
          }
        }
        try {
          await convertReferral(tx, siteId, orderId, Number(updatedOrder.total));
        } catch (err) {
          console.error("Referral conversion error for order", orderId, err);
        }
      }

      return { updatedOrder, isFullyPaid };
    });

    return result;
  };

  const { updatedOrder, isFullyPaid } = await wasFullyPaidAfter();

  if (isFullyPaid) {
    runAutomationsForTrigger(siteId, "payment_success", {
      recipientEmail: updatedOrder.email,
      recipientPhone: updatedOrder.phone ?? undefined,
      subject: `Payment received for order`,
      message: `Payment of ${updatedOrder.currency} ${updatedOrder.total} was confirmed via ${parsed.data.method}.`,
      data: { orderId: updatedOrder.id, email: updatedOrder.email, phone: updatedOrder.phone, total: Number(updatedOrder.total), currency: updatedOrder.currency, method: parsed.data.method },
    }).catch((err) => console.error("Automation trigger (payment_success) error:", err));
  }

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "RECORD_PAYMENT", entity: "order", entityId: orderId,
    after: { amount: parsed.data.amount, method: parsed.data.method, paymentStatus: updatedOrder.paymentStatus },
  });

  return success(updatedOrder, 201);
  } catch (err) {
    return serverError(err, "Record payment error");
  }
}
