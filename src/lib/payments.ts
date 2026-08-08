import { prisma } from "./db";
import crypto from "crypto";
import { runAutomationsForTrigger } from "./automations";
import { awardOrderPoints, finalizeOrderRedemption } from "./loyalty";

// ─── PAYSTACK ───────────────────────────────────────────────

export async function initializePaystackPayment(params: {
  secretKey: string;
  email: string;
  amount: number; // in kobo
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Paystack initialization failed");
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export function verifyPaystackWebhook(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export async function verifyPaystackTransaction(reference: string, secretKey: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await res.json();
  return data;
}

// ─── FLUTTERWAVE ────────────────────────────────────────────

export async function initializeFlutterwavePayment(params: {
  secretKey: string;
  amount: number;
  currency: string;
  email: string;
  reference: string;
  redirectUrl: string;
  customerName: string;
  meta?: Record<string, unknown>;
}) {
  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.reference,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.email,
        name: params.customerName,
      },
      meta: params.meta,
      customizations: {
        title: "AfroStore Payment",
      },
    }),
  });

  const data = await res.json();
  if (data.status !== "success") throw new Error(data.message || "Flutterwave initialization failed");
  return data.data as { link: string };
}

// Use when you already have Flutterwave's own numeric transaction ID
// (e.g. from a webhook payload's `data.id`).
export async function verifyFlutterwaveTransaction(transactionId: string, secretKey: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const data = await res.json();
  return data;
}

// Use when you only have OUR reference (tx_ref) — e.g. the manual/fallback
// verification path after redirect, before any webhook has arrived.
// Flutterwave's /transactions/{id}/verify endpoint requires THEIR numeric
// transaction id, not tx_ref, so calling it with our reference silently
// fails. This endpoint is the correct one for verifying by tx_ref.
export async function verifyFlutterwaveTransactionByReference(txRef: string, secretKey: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const data = await res.json();
  return data;
}

export function verifyFlutterwaveWebhook(signature: string, secret: string): boolean {
  return signature === secret;
}

// ─── MONNIFY ────────────────────────────────────────────────

export async function getMonnifyAccessToken(apiKey: string, secretKey: string, baseUrl: string) {
  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  if (!data.requestSuccessful) {
    throw new Error(data.responseMessage || `Monnify authentication failed (HTTP ${res.status}). Check your API key and secret key.`);
  }
  return data.responseBody.accessToken as string;
}

export async function initializeMonnifyPayment(params: {
  accessToken: string;
  baseUrl: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  reference: string;
  description: string;
  contractCode: string;
  redirectUrl: string;
  paymentMethods?: string[];
}) {
  const res = await fetch(`${params.baseUrl}/api/v1/merchant/transactions/init-transaction`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      paymentReference: params.reference,
      paymentDescription: params.description,
      contractCode: params.contractCode,
      redirectUrl: params.redirectUrl,
      paymentMethods: params.paymentMethods || ["CARD", "ACCOUNT_TRANSFER", "USSD"],
    }),
  });

  const data = await res.json();
  if (!data.requestSuccessful) throw new Error(data.responseMessage || "Monnify initialization failed");
  return data.responseBody as { transactionReference: string; checkoutUrl: string };
}

export async function verifyMonnifyTransaction(reference: string, accessToken: string, baseUrl: string) {
  const res = await fetch(
    `${baseUrl}/api/v2/merchant/transactions/query?paymentReference=${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data;
}

export function verifyMonnifyWebhook(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

// ─── COMMON: Process webhook payment confirmation ───────────

export async function processPaymentConfirmation(params: {
  reference: string;
  status: "SUCCESS" | "FAILED";
  method?: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;
}) {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { reference: params.reference },
  });

  if (!transaction) {
    console.error(`Transaction not found: ${params.reference}`);
    return null;
  }

  if (transaction.status !== "PENDING") {
    return transaction; // Already processed
  }

  // Use a Prisma transaction with atomic where clause to prevent race conditions
  type PaidOrderInfo = { id: string; siteId: string; email: string; phone: string | null; total: unknown; currency: string };
  const result = await prisma.$transaction(async (tx) => {
    // Atomically update only if status is still PENDING
    const updateResult = await tx.paymentTransaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: {
        status: params.status,
        method: params.method,
        externalRef: params.externalRef,
        metadata: params.metadata as any,
        paidAt: params.status === "SUCCESS" ? new Date() : undefined,
      },
    });

    // If no rows updated, another process already handled it
    if (updateResult.count === 0) {
      return { transaction: null, paidOrder: null as PaidOrderInfo | null };
    }

    // Update order payment status
    let paidOrder: PaidOrderInfo | null = null;
    if (transaction.orderId) {
      if (params.status === "SUCCESS") {
        const updatedOrder = await tx.order.update({
          where: { id: transaction.orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            paidAt: new Date(),
          },
        });

        await tx.orderTimeline.create({
          data: {
            orderId: transaction.orderId,
            status: "CONFIRMED",
            note: `Payment confirmed via ${params.method || "unknown"}`,
          },
        });

        // Loyalty: award points for the purchase and finalize any points
        // redemption that was priced into this order at checkout. Both are
        // no-ops if the site has no loyalty program, it's disabled, or the
        // order has no linked customer (guest checkout).
        if (updatedOrder.customerId) {
          try {
            await awardOrderPoints(tx, updatedOrder.siteId, updatedOrder.customerId, Number(updatedOrder.total), updatedOrder.id);
            if (updatedOrder.loyaltyPointsRedeemed > 0) {
              await finalizeOrderRedemption(tx, updatedOrder.siteId, updatedOrder.customerId, updatedOrder.loyaltyPointsRedeemed, updatedOrder.id);
            }
          } catch (loyaltyErr) {
            // Never let a loyalty hiccup roll back a confirmed payment.
            console.error("Loyalty processing error for order", updatedOrder.id, loyaltyErr);
          }
        }

        paidOrder = {
          id: updatedOrder.id,
          siteId: updatedOrder.siteId,
          email: updatedOrder.email,
          phone: updatedOrder.phone,
          total: updatedOrder.total,
          currency: updatedOrder.currency,
        };
      } else {
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: "FAILED" },
        });
      }
    }

    // Return the updated transaction alongside the paid-order info (if any)
    // so automations can be fired once the transaction has committed.
    const updatedTxn = await tx.paymentTransaction.findUnique({ where: { id: transaction.id } });
    return { transaction: updatedTxn, paidOrder };
  });

  if (!result || !result.transaction) {
    // Race condition: already processed by another request
    return prisma.paymentTransaction.findUnique({ where: { id: transaction.id } });
  }

  // Fire "payment_success" automations after the transaction has committed
  // (fire-and-forget — never block the webhook response on this).
  if (result.paidOrder) {
    const order = result.paidOrder;
    runAutomationsForTrigger(order.siteId, "payment_success", {
      recipientEmail: order.email,
      recipientPhone: order.phone ?? undefined,
      subject: `Payment received for order`,
      message: `Payment of ${order.currency} ${order.total} was confirmed via ${params.method || "unknown"}.`,
      data: { orderId: order.id, email: order.email, phone: order.phone, total: Number(order.total), currency: order.currency, method: params.method },
    }).catch((err) => console.error("Automation trigger (payment_success) error:", err));
  }

  return result.transaction;
}
