import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import {
  verifyPaystackTransaction,
  verifyFlutterwaveTransaction,
  verifyMonnifyTransaction,
  getMonnifyAccessToken,
  processPaymentConfirmation,
} from "@/lib/payments";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/checkout/verify — verify payment status server-side
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;

  try {
    const body = await req.json();
    const { reference } = body as { reference: string };

    if (!reference) {
      return error("reference is required", 400);
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
      include: { gateway: true },
    });

    if (!transaction) {
      return error("Transaction not found", 404);
    }

    // Ensure transaction belongs to this site
    if (transaction.gateway.siteId !== siteId) {
      return error("Transaction not found", 404);
    }

    // If already processed, return current status
    if (transaction.status !== "PENDING") {
      return success({
        status: transaction.status,
        orderId: transaction.orderId,
        reference: transaction.reference,
      });
    }

    // Verify with the payment provider
    const provider = transaction.gateway.provider;
    let providerStatus: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
    let method = provider;
    let externalRef: string | undefined;

    if (provider === "PAYSTACK") {
      const result = await verifyPaystackTransaction(reference, transaction.gateway.secretKey!);
      if (result.data?.status === "success") {
        providerStatus = "SUCCESS";
        method = `Paystack (${result.data.channel || "card"})`;
        externalRef = result.data.id?.toString();
      } else if (result.data?.status === "failed" || result.data?.status === "abandoned") {
        providerStatus = "FAILED";
      }
    } else if (provider === "FLUTTERWAVE") {
      // Flutterwave verify needs the transaction ID, which comes from the external ref or metadata
      // Try using the tx_ref (our reference) to look up via the provider
      const result = await verifyFlutterwaveTransaction(reference, transaction.gateway.secretKey!);
      if (result.status === "success" && result.data?.status === "successful") {
        providerStatus = "SUCCESS";
        method = `Flutterwave (${result.data.payment_type || "card"})`;
        externalRef = result.data.id?.toString();
      } else if (result.data?.status === "failed") {
        providerStatus = "FAILED";
      }
    } else if (provider === "MONNIFY") {
      const config = transaction.gateway.config as Record<string, string> | null;
      const baseUrl = config?.baseUrl || "https://api.monnify.com";
      const accessToken = await getMonnifyAccessToken(
        transaction.gateway.publicKey!,
        transaction.gateway.secretKey!,
        baseUrl
      );
      const result = await verifyMonnifyTransaction(reference, accessToken, baseUrl);
      if (result.requestSuccessful && result.responseBody?.paymentStatus === "PAID") {
        providerStatus = "SUCCESS";
        method = `Monnify (${result.responseBody.paymentMethod || "transfer"})`;
        externalRef = result.responseBody.transactionReference;
      } else if (result.responseBody?.paymentStatus === "FAILED") {
        providerStatus = "FAILED";
      }
    }

    // If provider confirmed payment, process it
    if (providerStatus === "SUCCESS" || providerStatus === "FAILED") {
      await processPaymentConfirmation({
        reference,
        status: providerStatus,
        method,
        externalRef,
      });
    }

    // Return current status
    const updated = await prisma.paymentTransaction.findUnique({
      where: { reference },
      select: { status: true, orderId: true, reference: true },
    });

    return success(updated);
  } catch (err: any) {
    console.error("Payment verify error:", err);
    return error("Verification failed", 500);
  }
}
