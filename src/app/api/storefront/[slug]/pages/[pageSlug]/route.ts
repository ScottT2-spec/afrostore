import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; pageSlug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

// GET /api/storefront/:slug/pages/:pageSlug — public page content
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, pageSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug },
          { subdomain: slug },
          { customDomain: slug },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    });

    if (!site) return notFound("Store not found");

    const page = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: pageSlug,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    if (!page) return notFound("Page not found");

    return success({
      store: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        logo: site.logo,
      },
      page,
    });
  } catch (err) {
    console.error("Storefront page fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
