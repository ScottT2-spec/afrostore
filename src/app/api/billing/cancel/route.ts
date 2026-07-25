import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) return error("Missing workspaceId");

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: user.id },
    });
    if (!workspace) return error("Workspace not found or access denied", 404);

    if (workspace.plan === "FREE") {
      return error("No active subscription to cancel");
    }

    if (!workspace.paystackSubscriptionCode) {
      return error("No subscription found to cancel");
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return error("Payment configuration error", 500);

    // Get subscription details to get the email token
    const subRes = await fetch(
      `https://api.paystack.co/subscription/${workspace.paystackSubscriptionCode}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const subData = await subRes.json();

    if (!subData.status) {
      return error("Failed to fetch subscription details");
    }

    const emailToken = subData.data.email_token;

    // Disable the subscription
    const disableRes = await fetch("https://api.paystack.co/subscription/disable", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: workspace.paystackSubscriptionCode,
        token: emailToken,
      }),
    });

    const disableData = await disableRes.json();
    if (!disableData.status) {
      return error(disableData.message || "Failed to cancel subscription");
    }

    // Don't downgrade immediately — keep plan active until planEndDate
    // The webhook will handle expiry when subscription.disable fires

    return success({
      message: "Subscription cancelled. Your plan will remain active until the end of the billing period.",
      planEndDate: workspace.planEndDate,
    });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return error("Failed to cancel subscription", 500);
  }
}
