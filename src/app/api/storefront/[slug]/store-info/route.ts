import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function success(data: unknown) {
  return NextResponse.json({ success: true, data });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/**
 * GET /api/storefront/:slug/store-info
 *
 * WhatsApp ordering is a real, complete, working feature already — real
 * wa.me link generation with pre-filled order messages exists across the
 * block-based storefront (BlockRenderer.tsx, the product page, the
 * contact page), backed by real whatsappNumber/whatsappOrdering fields
 * on Site. This isn't new functionality, same as delivery zones. What's
 * actually new: a small endpoint the AI coding agent's client can read
 * on its own, without pulling in the full bundled page-content route
 * just to get a phone number and currency.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, name: true, currency: true },
  });
  if (!site) return notFound("Store not found");

  const settings = await prisma.siteSettings.findUnique({
    where: { siteId: site.id },
    select: { whatsappNumber: true, whatsappOrdering: true, payOnDelivery: true, bankTransfer: true },
  });

  return success({
    name: site.name,
    currency: site.currency,
    whatsappNumber: settings?.whatsappNumber || null,
    whatsappOrderingEnabled: settings?.whatsappOrdering ?? false,
    payOnDeliveryEnabled: settings?.payOnDelivery ?? false,
    bankTransferEnabled: settings?.bankTransfer ?? false,
  });
}
