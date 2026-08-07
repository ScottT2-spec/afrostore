import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { parseVariants, mergeVariantStats, leadingVariant } from "@/lib/ab-testing";

type Params = { params: Promise<{ siteId: string; testId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, testId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const test = await prisma.aBTest.findFirst({ where: { id: testId, siteId } });
  if (!test) return error("Test not found", 404);

  const stats = await prisma.aBTestStat.findMany({ where: { testId } });
  const variants = parseVariants(test.variants);
  const results = mergeVariantStats(variants, stats);
  const leader = leadingVariant(results);

  const totalViews = results.reduce((sum, r) => sum + r.views, 0);
  const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0);

  return success({
    testId: test.id,
    status: test.status,
    winnerVariantId: test.winnerVariantId,
    totalViews,
    totalConversions,
    leadingVariantId: leader?.id ?? null,
    variants: results,
  });
}
