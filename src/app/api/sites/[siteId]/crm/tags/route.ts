import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/crm/tags — distinct tags across CRM contacts AND
// customers (tags get applied in both places in the dashboard — the CRM and
// the Customers list — which are separate tables), with counts of unique
// people per tag so this matches what a campaign would actually reach.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const [crmContacts, customers] = await Promise.all([
      prisma.crmContact.findMany({ where: { siteId, tags: { isEmpty: false } }, select: { email: true, tags: true } }),
      prisma.customer.findMany({ where: { siteId, tags: { isEmpty: false } }, select: { email: true, tags: true } }),
    ]);

    const peopleByTag = new Map<string, Set<string>>();
    for (const c of [...crmContacts, ...customers]) {
      const emailKey = c.email.toLowerCase();
      for (const t of c.tags) {
        if (!peopleByTag.has(t)) peopleByTag.set(t, new Set());
        peopleByTag.get(t)!.add(emailKey);
      }
    }

    const tags = Array.from(peopleByTag.entries())
      .map(([tag, people]) => ({ tag, count: people.size }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

    return success({ tags });
  } catch (err) {
    console.error("Fetch CRM tags error:", err);
    return error("Internal server error", 500);
  }
}
