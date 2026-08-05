import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, getStoreContext } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

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
        type: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
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
