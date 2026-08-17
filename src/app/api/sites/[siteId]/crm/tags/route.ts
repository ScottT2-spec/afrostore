import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/crm/tags — distinct tags across all CRM contacts, with contact counts
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const contacts = await prisma.crmContact.findMany({
      where: { siteId, tags: { isEmpty: false } },
      select: { tags: true },
    });

    const counts = new Map<string, number>();
    for (const c of contacts) {
      for (const t of c.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }

    const tags = Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

    return success({ tags });
  } catch (err) {
    console.error("Fetch CRM tags error:", err);
    return error("Internal server error", 500);
  }
}
