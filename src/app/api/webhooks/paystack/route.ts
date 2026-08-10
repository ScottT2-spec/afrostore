import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook, processPaymentConfirmation } from "@/lib/payments";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // Paystack signs webhooks with your API secret key — there is no
    // separate "webhook secret" concept on their side. secretKey is a
    // required field, so this is always available once a gateway is enabled.
    const gateways = await prisma.paymentGateway.findMany({
      where: { provider: "PAYSTACK", isEnabled: true },
    });

    let verified = false;
    for (const gw of gateways) {
      if (gw.secretKey && verifyPaystackWebhook(body, signature, gw.secretKey)) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      console.error("Paystack webhook verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const data = event.data;
      await processPaymentConfirmation({
        reference: data.reference,
        status: "SUCCESS",
        method: `Paystack (${data.channel || "card"})`,
        externalRef: data.id?.toString(),
        metadata: data.metadata,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
