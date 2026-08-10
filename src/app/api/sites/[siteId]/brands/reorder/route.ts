import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit, requireRole, serverError } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// PATCH /api/sites/:siteId/brands/reorder
// Body: { order: string[] } — brand IDs in the desired display order
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  try {
    const body = await req.json();
    const { order } = body as { order: string[] };
    if (!Array.isArray(order)) return error("order must be an array of brand IDs", 400);

    await Promise.all(
      order.map((brandId, idx) =>
        prisma.brand.updateMany({ where: { id: brandId, siteId }, data: { position: idx } })
      )
    );

    const brands = await prisma.brand.findMany({
      where: { siteId },
      include: { _count: { select: { products: true } } },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "REORDER", entity: "brand", after: { order } });

    return success({ brands });
  } catch (err) {
    return serverError(err, "Reorder brands error");
  }
}
