import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; popupId: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

async function resolveStore(slug: string) {
  return prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    select: { id: true },
  });
}

// POST /api/storefront/:slug/popups/:popupId/track — public, body: { event: "view" | "conversion" }
export async function POST(req: NextRequest, { params }: Params) {
  const { slug, popupId } = await params;

  try {
    const site = await resolveStore(slug);
    if (!site) return notFound("Store not found");

    const popup = await prisma.popup.findFirst({ where: { id: popupId, siteId: site.id }, select: { id: true } });
    if (!popup) return notFound("Popup not found");

    let event: string = "view";
    try {
      const body = await req.json();
      if (body?.event === "conversion") event = "conversion";
    } catch {
      // no body — default to view
    }

    const updated = await prisma.popup.update({
      where: { id: popupId },
      data: event === "conversion" ? { conversions: { increment: 1 } } : { views: { increment: 1 } },
      select: { views: true, conversions: true },
    });

    return success(updated);
  } catch (err) {
    console.error("Popup track error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
