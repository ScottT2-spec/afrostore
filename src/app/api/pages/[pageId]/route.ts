import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, getStoreContext, validationError, ensureUniqueSlug, logAudit, requireRole } from "@/lib/api-helpers";
import { updatePageSchema } from "@/lib/validators";
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

// PATCH /api/pages/:pageId - Update page content (used by the visual editor)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { pageId } = await params;

  try {
    // Same reasoning as GET: siteId isn't in the URL, so look the page up
    // first and verify the caller actually has access to its site — and a
    // real role, not just membership — before touching anything. This was
    // previously missing entirely: any unauthenticated request with a
    // pageId could overwrite any store's page content, title, slug, meta
    // tags, and publish status with zero login or ownership check at all.
    const existing = await prisma.page.findUnique({
      where: { id: pageId },
      include: { site: { select: { slug: true } } },
    });
    if (!existing) return error("Page not found", 404);

    const ctx = await getStoreContext(req, existing.siteId);
    if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
    const roleErr = requireRole(ctx, "STAFF");
    if (roleErr) return roleErr;

    const body = await req.json();
    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // If title is changing, regenerate slug — matching the site-scoped
    // sibling route's behavior instead of accepting an arbitrary raw slug
    // straight from the request body.
    if (parsed.data.title && parsed.data.title !== existing.title) {
      updateData.slug = await ensureUniqueSlug(parsed.data.title, existing.siteId, "page", pageId);
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: updateData,
    });

    if (existing.site.slug && updatedPage.slug) {
      revalidatePath(`/store/${existing.site.slug}/${updatedPage.slug}`);
      revalidatePath(`/store/${existing.site.slug}`);
      revalidatePath(`/store/${existing.site.slug}/pages/${updatedPage.slug}`);
      revalidatePath(`/api/storefront/${existing.site.slug}/pages/${updatedPage.slug}`);
      revalidatePath(`/api/storefront/${existing.site.slug}`);
    }

    await logAudit({
      siteId: existing.siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "page",
      entityId: pageId,
      before: existing,
      after: updatedPage,
    });

    return success(updatedPage);
  } catch (err) {
    console.error("Update page error:", err);
    return error("Internal server error", 500);
  }
}
