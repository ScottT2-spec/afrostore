import { NextRequest } from "next/server";
import { error, getSiteContext, logAudit, requireRole, success } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { restoreSiteVersion } from "@/lib/site-history";

type Params = { params: Promise<{ siteId: string; versionId: string }> };

// POST /api/sites/:siteId/history/:versionId/restore — put the whole site back to that version
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, versionId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  try {
    const result = await restoreSiteVersion(siteId, versionId, ctx.user!.id);
    if (!result.ok) return error(result.message, result.status);

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "site_history_restore",
      entityId: versionId,
    });
    return success({ restored: true });
  } catch (err) {
    console.error("Restore site version error:", err);
    return error("Could not restore this version", 500);
  }
}
