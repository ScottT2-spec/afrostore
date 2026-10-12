import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { error, getSiteContext, requireRole, success } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import type { SiteSnapshot } from "@/lib/site-history";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/history — every saved version of the site, newest first
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const rows = await prisma.siteVersion.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // The oldest row is the site's original; the list is newest-first.
  const originalId = rows.length ? rows[rows.length - 1].id : null;
  const versions = rows.map((row) => ({
    id: row.id,
    source: row.source,
    label: row.label,
    createdAt: row.createdAt,
    isOriginal: row.id === originalId,
    pageCount: Array.isArray((row.snapshot as unknown as SiteSnapshot)?.pages)
      ? (row.snapshot as unknown as SiteSnapshot).pages.length
      : 0,
  }));

  return success({ site: { id: ctx.site!.id, name: ctx.site!.name, slug: ctx.site!.slug }, versions });
}
