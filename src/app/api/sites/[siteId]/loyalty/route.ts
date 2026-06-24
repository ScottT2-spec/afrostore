import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateLoyaltyProgramSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  let program = await prisma.loyaltyProgram.findUnique({
    where: { siteId },
    include: { _count: { select: { members: true } } },
  });

  // Auto-create if not exists
  if (!program) {
    program = await prisma.loyaltyProgram.create({ data: { siteId }, include: { _count: { select: { members: true } } } });
  }

  // Member stats
  const memberStats = await prisma.loyaltyMember.aggregate({
    where: { program: { siteId } },
    _sum: { totalPoints: true, availablePoints: true, redeemedPoints: true },
    _count: true,
  });

  return success({ program, stats: { totalMembers: memberStats._count, totalPointsIssued: memberStats._sum.totalPoints || 0, availablePoints: memberStats._sum.availablePoints || 0, redeemedPoints: memberStats._sum.redeemedPoints || 0 } });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = updateLoyaltyProgramSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const program = await prisma.loyaltyProgram.upsert({
      where: { siteId },
      create: { siteId, ...parsed.data },
      update: parsed.data,
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "loyalty_program", entityId: program.id, after: program });
    return success(program);
  } catch (err) { console.error("Update loyalty program error:", err); return error("Internal server error", 500); }
}
