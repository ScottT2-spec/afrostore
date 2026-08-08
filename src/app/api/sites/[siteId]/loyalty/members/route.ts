import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { manualAdjustPoints } from "@/lib/loyalty";

type Params = { params: Promise<{ siteId: string }> };

// POST — add loyalty member + award/redeem points
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program) return error("Loyalty program not set up", 404);

  const body = await req.json();
  const { customerId, action, points, description } = body;

  if (!customerId) return error("customerId required");
  if (action !== "earn" && action !== "redeem") return error("action must be 'earn' or 'redeem'");
  if (!points || points <= 0) return error("points must be a positive number");

  // Ensure customer belongs to store
  const customer = await prisma.customer.findFirst({ where: { id: customerId, siteId } });
  if (!customer) return error("Customer not found", 404);

  try {
    const updated = await manualAdjustPoints(siteId, customerId, action, points, description);
    return success(updated);
  } catch (err: any) {
    return error(err.message || "Failed to adjust points", 400);
  }
}
