import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateReferralProgramSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  let program = await prisma.referralProgram.findUnique({
    where: { siteId },
    include: { _count: { select: { affiliates: true } } },
  });

  if (!program) {
    program = await prisma.referralProgram.create({ data: { siteId }, include: { _count: { select: { affiliates: true } } } });
  }

  // Affiliate stats
  const affiliates = await prisma.affiliate.findMany({
    where: { program: { siteId } },
    include: { customer: { select: { id: true, firstName: true, lastName: true, email: true } }, _count: { select: { referrals: true } } },
    orderBy: { totalEarnings: "desc" }, take: 20,
  });

  const stats = await prisma.affiliate.aggregate({
    where: { program: { siteId } },
    _sum: { totalClicks: true, totalOrders: true, totalEarnings: true, pendingEarnings: true },
    _count: true,
  });

  return success({
    program, affiliates,
    stats: { totalAffiliates: stats._count, totalClicks: stats._sum.totalClicks || 0, totalOrders: stats._sum.totalOrders || 0, totalEarnings: stats._sum.totalEarnings || 0, pendingEarnings: stats._sum.pendingEarnings || 0 },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = updateReferralProgramSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const program = await prisma.referralProgram.upsert({
      where: { siteId }, create: { siteId, ...parsed.data }, update: parsed.data,
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "referral_program", entityId: program.id, after: program });
    return success(program);
  } catch (err) { console.error("Update referral program error:", err); return error("Internal server error", 500); }
}
