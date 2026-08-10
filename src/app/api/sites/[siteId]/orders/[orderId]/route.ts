import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit , requireRole } from "@/lib/api-helpers";
import { updateOrderStatusSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { awardOrderPoints, finalizeOrderRedemption, reverseOrderPoints } from "@/lib/loyalty";
import { convertReferral, reverseReferral } from "@/lib/referrals";

type Params = { params: Promise<{ siteId: string; orderId: string }> };

// GET /api/sites/:siteId/orders/:orderId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, orderId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const order = await prisma.order.findFirst({
    where: { id: orderId, siteId },
    include: {
      items: { include: { product: { select: { id: true, name: true, images: { take: 1 } } } } },
      customer: true,
      coupon: true,
      timeline: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return error("Order not found", 404);
  return success(order);
}

// PATCH /api/sites/:siteId/orders/:orderId — update status
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, orderId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const body = await req.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.order.findFirst({ where: { id: orderId, siteId } });
  if (!existing) return error("Order not found", 404);

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  let markCodAsPaid = false;

  if (parsed.data.status === "SHIPPED") {
    updateData.shippedAt = new Date();
    if (parsed.data.trackingNumber) updateData.trackingNumber = parsed.data.trackingNumber;
  } else if (parsed.data.status === "DELIVERED") {
    updateData.deliveredAt = new Date();
    // Cash-on-delivery orders never go through the online payment webhook
    // flow, so DELIVERED is the closest real-world signal that payment was
    // actually collected. Mark it paid here so loyalty/referral hooks (which
    // are keyed off paymentStatus: PAID) fire for COD orders too.
    if (existing.paymentMethod === "PAY_ON_DELIVERY" && existing.paymentStatus !== "PAID") {
      markCodAsPaid = true;
    }
  } else if (parsed.data.status === "CANCELLED" || parsed.data.status === "REFUNDED") {
    if (parsed.data.status === "CANCELLED") {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = parsed.data.note;
    }

    // Restore stock
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    // Status fields always apply, regardless of the payment-status race below.
    await tx.order.update({ where: { id: orderId }, data: updateData });

    // Atomic guard: if we're marking this COD order paid, only flip
    // paymentStatus if it's still not-paid, so a concurrent duplicate
    // request can't fire the loyalty/referral hooks twice for the same
    // order. Decoupled from the status update above so losing this race
    // never causes the DELIVERED/shipped status change to be dropped.
    if (markCodAsPaid) {
      const guarded = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: { not: "PAID" } },
        data: { paymentStatus: "PAID", paidAt: new Date() },
      });
      if (guarded.count === 0) markCodAsPaid = false; // lost the race, don't double-fire hooks
    }

    const updated = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true, customer: true, timeline: true },
    });

    if (markCodAsPaid) {
      if (updated.customerId) {
        try {
          await tx.customer.update({
            where: { id: updated.customerId },
            data: { totalSpent: { increment: Number(updated.total) } },
          });
        } catch (err) {
          console.error("Customer totalSpent update error for COD order", updated.id, err);
        }
      }
      if (updated.customerId) {
        try {
          await awardOrderPoints(tx, siteId, updated.customerId, Number(updated.total), updated.id);
          if (updated.loyaltyPointsRedeemed > 0) {
            await finalizeOrderRedemption(tx, siteId, updated.customerId, updated.loyaltyPointsRedeemed, updated.id);
          }
        } catch (err) {
          console.error("Loyalty processing error for COD order", updated.id, err);
        }
      }
      try {
        await convertReferral(tx, siteId, updated.id, Number(updated.total));
      } catch (err) {
        console.error("Referral conversion error for COD order", updated.id, err);
      }
    }

    // Cancelling/refunding an order that had already been paid means any
    // points earned/redeemed or commission converted for it need to be
    // undone — otherwise a customer keeps points, and an affiliate keeps
    // commission, for a sale that didn't actually happen. Same logic for
    // lifetime spend: money that's being refunded/voided is no longer
    // "received", so it must come back out of totalSpent too.
    if ((parsed.data.status === "CANCELLED" || parsed.data.status === "REFUNDED") && existing.paymentStatus === "PAID") {
      if (updated.customerId) {
        try {
          await tx.customer.update({
            where: { id: updated.customerId },
            data: { totalSpent: { decrement: Number(updated.total) } },
          });
        } catch (err) {
          console.error("Customer totalSpent reversal error for order", updated.id, err);
        }
      }
      if (updated.customerId) {
        try {
          await reverseOrderPoints(tx, siteId, updated.customerId, updated.id);
        } catch (err) {
          console.error("Loyalty reversal error for order", updated.id, err);
        }
      }
      try {
        await reverseReferral(tx, siteId, updated.id);
      } catch (err) {
        console.error("Referral reversal error for order", updated.id, err);
      }
    }

    return updated;
  });

  // Add timeline entry
  await prisma.orderTimeline.create({
    data: {
      orderId,
      status: parsed.data.status,
      note: parsed.data.note,
      createdBy: ctx.user!.id,
    },
  });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "UPDATE_STATUS", entity: "order", entityId: orderId,
    before: { status: existing.status }, after: { status: parsed.data.status },
  });

  return success(order);
}
