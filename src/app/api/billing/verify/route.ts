import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { verifyPaystackTransaction } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const { reference, workspaceId } = await req.json();

    if (!reference || !workspaceId) {
      return error("Missing required fields: reference, workspaceId");
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: user.id },
    });
    if (!workspace) return error("Workspace not found or access denied", 404);

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return error("Payment configuration error", 500);

    const result = await verifyPaystackTransaction(reference, secretKey);

    if (!result.status || result.data?.status !== "success") {
      return error("Payment not confirmed yet");
    }

    const metadata = result.data.metadata;
    const plan = metadata?.plan;
    const period = metadata?.period || "monthly";

    if (plan && ["STARTER", "BUSINESS", "GROWTH"].includes(plan)) {
      const now = new Date();
      const endDate = new Date(now);
      if (period === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setDate(endDate.getDate() + 30);
      }

      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan: plan as "STARTER" | "BUSINESS" | "GROWTH",
          planPeriod: period,
          planStartDate: now,
          planEndDate: endDate,
          paystackPlanCode: result.data.plan_object?.plan_code || null,
        },
      });
    }

    // Fetch updated workspace
    const updated = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        plan: true,
        planPeriod: true,
        planStartDate: true,
        planEndDate: true,
      },
    });

    return success(updated);
  } catch (err) {
    console.error("Verify billing error:", err);
    return error("Failed to verify payment", 500);
  }
}
