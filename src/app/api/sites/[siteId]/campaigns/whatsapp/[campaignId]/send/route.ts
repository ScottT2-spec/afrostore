import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit , requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { sendWhatsAppCampaign } from "@/lib/campaign-sender";

type Params = { params: Promise<{ siteId: string; campaignId: string }> };

// POST /api/sites/:siteId/campaigns/whatsapp/:campaignId/send — send immediately
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const campaign = await prisma.whatsAppCampaign.findFirst({ where: { id: campaignId, siteId } });
  if (!campaign) return error("Campaign not found", 404);
  if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
    return error(`Campaign cannot be sent from status ${campaign.status}`, 400);
  }

  const result = await sendWhatsAppCampaign(campaignId);

  await logAudit({
    siteId, userId: ctx.user!.id, action: "SEND", entity: "whatsapp_campaign", entityId: campaignId,
    after: { success: result.success, error: result.error },
  });

  const updated = await prisma.whatsAppCampaign.findUnique({ where: { id: campaignId } });
  if (!result.success) return error(result.error || "Failed to send campaign", 422);
  return success(updated);
}
