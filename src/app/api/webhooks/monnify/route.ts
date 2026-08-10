import { NextRequest, NextResponse } from "next/server";
import { verifyMonnifyWebhook, processPaymentConfirmation } from "@/lib/payments";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("monnify-signature") || "";

    // Monnify signs webhooks with your client secret key — there is no
    // separate "webhook secret" concept on their side. secretKey is a
    // required field, so this is always available once a gateway is enabled.
    const gateways = await prisma.paymentGateway.findMany({
      where: { provider: "MONNIFY", isEnabled: true },
    });

    let verified = false;
    for (const gw of gateways) {
      if (gw.secretKey && verifyMonnifyWebhook(body, signature, gw.secretKey)) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      console.error("Monnify webhook verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Monnify sends SUCCESSFUL_TRANSACTION for completed customer payments.
    // (SUCCESSFUL_DISBURSEMENT is a different event — money leaving your
    // Monnify wallet, e.g. a payout — and must never be treated as an order
    // being paid for.)
    if (event.eventType === "SUCCESSFUL_TRANSACTION") {
      const data = event.eventData;
      await processPaymentConfirmation({
        reference: data.paymentReference || data.transactionReference,
        status: "SUCCESS",
        method: `Monnify (${data.paymentMethod || "transfer"})`,
        externalRef: data.transactionReference,
        metadata: {
          amountPaid: data.amountPaid,
          paidOn: data.paidOn,
          paymentMethod: data.paymentMethod,
          settlementAmount: data.settlementAmount,
          customer: data.customer,
        },
      });
    }

    if (event.eventType === "FAILED_TRANSACTION") {
      const data = event.eventData;
      await processPaymentConfirmation({
        reference: data.paymentReference || data.transactionReference,
        status: "FAILED",
        method: `Monnify (${data.paymentMethod || "unknown"})`,
        externalRef: data.transactionReference,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Monnify webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
