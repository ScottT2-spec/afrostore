import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/**
 * Resolve a store by slug, subdomain, or custom domain.
 * Only returns ACTIVE stores.
 */
async function resolveStore(slug: string) {
  return prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    select: { id: true },
  });
}

// GET /api/storefront/:slug/popups — public, active popups only
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const site = await resolveStore(slug);
    if (!site) return notFound("Store not found");

    const popups = await prisma.popup.findMany({
      where: { siteId: site.id, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        content: true,
        trigger: true,
        displayRules: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success({ popups });
  } catch (err) {
    console.error("Storefront popups fetch error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
