import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

// POST /api/public/sites/:slug/ab-tests/convert — no auth.
// Body: { testId: string, variantId: string }
// The client supplies the assignment it already holds (from the /assign call);
// we just validate it belongs to this site's running/paused test before counting it.
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const testId = typeof body.testId === "string" ? body.testId : undefined;
    const variantId = typeof body.variantId === "string" ? body.variantId : undefined;
    if (!testId || !variantId) return error("testId and variantId are required", 400);

    const site = await prisma.site.findFirst({
      where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
      select: { id: true },
    });
    if (!site) return error("Store not found", 404);

    const test = await prisma.aBTest.findFirst({
      where: { id: testId, siteId: site.id, status: { in: ["RUNNING", "PAUSED"] } },
      select: { id: true },
    });
    if (!test) return success({ tracked: false });

    await prisma.aBTestStat.upsert({
      where: { testId_variantId: { testId, variantId } },
      create: { testId, variantId, conversions: 1 },
      update: { conversions: { increment: 1 } },
    });

    return success({ tracked: true });
  } catch (err) {
    console.error("A/B test convert error:", err);
    return success({ tracked: false });
  }
}
