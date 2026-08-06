import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");

  if (!workspaceId) return error("Missing workspaceId");

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: user.id },
    select: {
      id: true,
      plan: true,
      planPeriod: true,
      planStartDate: true,
      planEndDate: true,
      paystackSubscriptionCode: true,
    },
  });

  if (!workspace) return error("Workspace not found or access denied", 404);

  const isActive =
    workspace.plan !== "FREE" &&
    workspace.planEndDate &&
    new Date(workspace.planEndDate) > new Date();

  return success({
    plan: workspace.plan,
    planPeriod: workspace.planPeriod,
    planStartDate: workspace.planStartDate,
    planEndDate: workspace.planEndDate,
    isActive: isActive || workspace.plan === "FREE",
    hasSubscription: !!workspace.paystackSubscriptionCode,
    webhookConfigured: !!process.env.PAYSTACK_WEBHOOK_SECRET,
  });
}
