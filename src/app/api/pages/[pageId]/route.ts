import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type Params = { params: Promise<{ pageId: string }> };

// GET /api/pages/:pageId - Get page info including siteId
export async function GET(req: NextRequest, { params }: Params) {
  const { pageId } = await params;

  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { 
        id: true, 
        siteId: true, 
        title: true, 
        slug: true, 
        content: true,
        metaTitle: true,
        metaDescription: true,
        template: true,
        type: true,
        isPublished: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!page) {
      return error("Page not found", 404);
    }

    return success(page);
  } catch (err) {
    console.error("Get page error:", err);
    return error("Internal server error", 500);
  }
}

// PATCH /api/pages/:pageId - Update page content
export async function PATCH(req: NextRequest, { params }: Params) {
  const { pageId } = await params;
  const body = await req.json();

  try {
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        content: body.content,
        title: body.title,
        slug: body.slug,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        updatedAt: new Date(),
      },
    });

    if ((updatedPage as any).siteId) {
      const site = await prisma.site.findUnique({
        where: { id: (updatedPage as any).siteId },
        select: { slug: true },
      });
      if (site?.slug && updatedPage.slug) {
        revalidatePath(`/store/${site.slug}/${updatedPage.slug}`);
        revalidatePath(`/store/${site.slug}`);
        revalidatePath(`/store/${site.slug}/pages/${updatedPage.slug}`);
        revalidatePath(`/api/storefront/${site.slug}/pages/${updatedPage.slug}`);
        revalidatePath(`/api/storefront/${site.slug}`);
      }
    }

    return success(updatedPage);
  } catch (err) {
    console.error("Update page error:", err);
    return error("Internal server error", 500);
  }
}
