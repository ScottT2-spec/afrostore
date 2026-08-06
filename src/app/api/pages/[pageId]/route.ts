import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, getStoreContext } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type Params = { params: Promise<{ pageId: string }> };

// GET /api/pages/:pageId - Get full page data (used by the visual editor,
// which only knows the pageId upfront and needs to discover its siteId)
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

    // This route has no siteId in its URL, so ownership can only be verified
    // after looking the page up — do that before returning any content.
    const ctx = await getStoreContext(req, page.siteId);
    if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

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
    const updateData: any = {
      content: body.content,
      title: body.title,
      slug: body.slug,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      updatedAt: new Date(),
    };

    // Allow publishing/unpublishing pages
    if (body.isPublished !== undefined) {
      updateData.isPublished = body.isPublished;
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: updateData,
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
