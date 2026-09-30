import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

// Merchant toggles must show up on checkout immediately — never cache this.
export const dynamic = "force-dynamic";

function success(data: unknown) {
  return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/**
 * GET /api/storefront/:slug/payment-methods — which payment provider(s)
 * a customer can actually pay with.
 *
 * The gap this closes: checkout initiation (POST /api/sites/:siteId/checkout)
 * requires a specific provider ("MONNIFY" | "PAYSTACK" | "FLUTTERWAVE")
 * and 400s with "not configured for this store" if that exact one isn't
 * enabled — but there was no way for a storefront to find out which one
 * IS enabled without this. The only existing route for that
 * (/api/sites/:siteId/payment-gateways) is merchant-auth-gated, correctly,
 * since it's used to manage the actual credentials. This route deliberately
 * returns only providers + enabled status — never publicKey, secretKey,
 * or webhookSecret.
 *
 * Also returns the Settings-page toggles that decide which non-gateway
 * options exist (payOnDelivery, bankTransfer) so checkout can render
 * exactly what the merchant left switched on. Both default to true when
 * the store has no settings row, matching the schema defaults.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true },
  });
  if (!site) return notFound("Store not found");

  const settings = await prisma.siteSettings.findUnique({
    where: { siteId: site.id },
    select: { payOnDelivery: true, bankTransfer: true },
  });

  const gateways = await prisma.paymentGateway.findMany({
    where: { siteId: site.id, isEnabled: true },
    select: { provider: true },
  });

  return success({
    providers: gateways.map((g) => g.provider),
    payOnDelivery: settings?.payOnDelivery ?? true,
    bankTransfer: settings?.bankTransfer ?? true,
  });
}
