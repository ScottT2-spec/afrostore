import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/payments";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("PAYSTACK_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    if (!verifyPaystackWebhook(body, signature, webhookSecret)) {
      console.error("Paystack billing webhook verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const data = event.data;

    switch (event.event) {
      case "subscription.create": {
        // Find workspace from metadata or customer email
        const workspaceId = data.metadata?.workspaceId;
        if (workspaceId) {
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              paystackSubscriptionCode: data.subscription_code,
              paystackCustomerCode: data.customer?.customer_code || null,
              paystackPlanCode: data.plan?.plan_code || null,
            },
          });
        }
        break;
      }

      case "charge.success": {
        // Only process if this is a subscription charge (has plan)
        const metadata = data.metadata;
        if (!metadata?.plan || !metadata?.workspaceId) break;

        const plan = metadata.plan;
        const period = metadata.period || "monthly";
        const wsId = metadata.workspaceId;

        if (!["STARTER", "BUSINESS", "GROWTH"].includes(plan)) break;

        const now = new Date();
        const endDate = new Date(now);
        if (period === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setDate(endDate.getDate() + 30);
        }

        await prisma.workspace.update({
          where: { id: wsId },
          data: {
            plan: plan as "STARTER" | "BUSINESS" | "GROWTH",
            planPeriod: period,
            planStartDate: now,
            planEndDate: endDate,
            paystackSubscriptionCode: data.plan_object?.subscription_code || undefined,
            paystackCustomerCode: data.customer?.customer_code || undefined,
            paystackPlanCode: data.plan_object?.plan_code || data.plan?.plan_code || undefined,
          },
        });
        break;
      }

      case "subscription.not_renew": {
        // Subscription will not renew — plan stays active until planEndDate
        const subCode = data.subscription_code;
        if (subCode) {
          const workspace = await prisma.workspace.findFirst({
            where: { paystackSubscriptionCode: subCode },
          });
          if (workspace) {
            console.log(`Subscription ${subCode} will not renew for workspace ${workspace.id}`);
            // Plan remains active until planEndDate — no immediate action needed
          }
        }
        break;
      }

      case "subscription.disable": {
        // Subscription disabled — check if plan has expired
        const subCode = data.subscription_code;
        if (subCode) {
          const workspace = await prisma.workspace.findFirst({
            where: { paystackSubscriptionCode: subCode },
          });

          if (workspace) {
            const now = new Date();
            const planEnd = workspace.planEndDate ? new Date(workspace.planEndDate) : null;

            // If planEndDate has passed, downgrade to FREE
            if (!planEnd || planEnd <= now) {
              await prisma.workspace.update({
                where: { id: workspace.id },
                data: {
                  plan: "FREE",
                  planPeriod: null,
                  planStartDate: null,
                  planEndDate: null,
                  paystackSubscriptionCode: null,
                  paystackPlanCode: null,
                },
              });
            }
            // Otherwise, the plan stays until planEndDate and will be cleaned up later
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paystack billing webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
