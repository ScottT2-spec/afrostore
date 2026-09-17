import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; pageId: string }> };

// POST /api/sites/:siteId/pages/:pageId/undo
// Restores this page's content to the version before its current one.
// A PageVersion row is written after every AI mutation (create_page,
// update_section) - this walks that trail one step back, deletes the
// version being "undone past" so undo doesn't create a redo-able forward
// branch, and leaves everything older than that intact for further undos.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, pageId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const page = await prisma.page.findFirst({ where: { id: pageId, siteId } });
  if (!page) return error("Page not found", 404);

  const versions = await prisma.pageVersion.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  if (versions.length < 2) {
    return error("No earlier version to undo to — this is the first recorded version of this page.", 400);
  }

  const [current, previous] = versions;
  await prisma.page.update({
    where: { id: pageId },
    data: { title: previous.title, content: previous.content as object },
  });
  // Remove the version we just undid past - keeps the trail linear (undo
  // -> redo -> undo wouldn't make sense without a real redo stack, which
  // this doesn't build yet) rather than leaving a stale, misleading
  // "most recent" row that no longer matches the page's real content.
  await prisma.pageVersion.delete({ where: { id: current.id } });

  return success({ page: { id: pageId, title: previous.title, content: previous.content }, remainingVersions: versions.length - 1 });
}
