import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { PLAN_PRICES, getOrCreatePaystackPlan, getOrCreatePaystackCustomer } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const { workspaceId, plan, period } = await req.json();

    if (!workspaceId || !plan || !period) {
      return error("Missing required fields: workspaceId, plan, period");
    }

    if (!["monthly", "yearly"].includes(period)) {
      return error("Period must be 'monthly' or 'yearly'");
    }

    const planUpper = plan.toUpperCase();
    if (!PLAN_PRICES[planUpper]) {
      return error("Invalid plan. Choose STARTER, BUSINESS, or GROWTH");
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: user.id },
    });
    if (!workspace) return error("Workspace not found or access denied", 404);

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return error("Payment configuration error", 500);

    const amount = PLAN_PRICES[planUpper][period as "monthly" | "yearly"];
    const interval = period === "monthly" ? "monthly" : "annually";
    const planName = `Prokip ${planUpper.charAt(0) + planUpper.slice(1).toLowerCase()} ${period === "monthly" ? "Monthly" : "Yearly"}`;

    // Get or create Paystack plan
    const paystackPlan = await getOrCreatePaystackPlan(planName, amount, interval, secretKey);

    // Get or create Paystack customer
    const customer = await getOrCreatePaystackCustomer(
      user.email,
      user.firstName || "",
      user.lastName || "",
      secretKey
    );

    // Initialize transaction with plan to auto-create subscription
    const origin = new URL(req.url).origin;
    const reference = `billing_${workspaceId}_${Date.now()}`;

    const txRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        reference,
        plan: paystackPlan.plan_code,
        callback_url: `${origin}/dashboard/billing?status=success&workspace=${workspaceId}`,
        metadata: {
          workspaceId,
          plan: planUpper,
          period,
          custom_fields: [
            { display_name: "Workspace", variable_name: "workspace_id", value: workspaceId },
            { display_name: "Plan", variable_name: "plan", value: planUpper },
            { display_name: "Period", variable_name: "period", value: period },
          ],
        },
      }),
    });

    const txData = await txRes.json();
    if (!txData.status) return error(txData.message || "Failed to initialize payment", 500);

    return success({
      paymentUrl: txData.data.authorization_url,
      reference: txData.data.reference,
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return error("Failed to create subscription", 500);
  }
}
