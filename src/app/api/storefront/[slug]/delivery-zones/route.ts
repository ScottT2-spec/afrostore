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
 * GET /api/storefront/:slug/delivery-zones
 *
 * Delivery zones already exist as a real, working feature (DeliveryZone
 * model, merchant dashboard at /api/sites/:siteId/delivery-zones, and
 * already surfaced in the main storefront/:slug page-content route) —
 * this isn't new functionality. What was missing is a small, dedicated
 * endpoint the AI coding agent's client can call on its own, without
 * pulling in the full page-content payload just to read zones.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true },
  });
  if (!site) return notFound("Store not found");

  const zones = await prisma.deliveryZone.findMany({
    where: { siteId: site.id, isActive: true },
    select: { id: true, name: true, areas: true, fee: true, freeAbove: true, estimatedDays: true },
    orderBy: { position: "asc" },
  });

  return success({
    zones: zones.map((z) => ({
      ...z,
      fee: Number(z.fee),
      freeAbove: z.freeAbove ? Number(z.freeAbove) : null,
    })),
  });
}
