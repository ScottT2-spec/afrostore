import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/publish-pages
// The explicit "Publish" action for AI/structured-generated sites -
// flips every draft page (isPublished: false) to live. Pages created by
// the structured agent start as drafts specifically so a merchant can
// review before anything is publicly visible - this is the one place
// that's actually allowed to make that call, not the agent finishing a
// chat turn.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const result = await prisma.page.updateMany({ where: { siteId, isPublished: false }, data: { isPublished: true } });
  return success({ published: true, pagesPublished: result.count });
}
