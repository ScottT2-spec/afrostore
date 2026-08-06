import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string; funnelId: string; stepId: string }> };

// POST /api/public/sites/:slug/funnels/:funnelId/steps/:stepId/view — no auth; increments view count
export async function POST(_req: NextRequest, { params }: Params) {
  const { slug, funnelId, stepId } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
      select: { id: true },
    });
    if (!site) return error("Site not found", 404);

    const step = await prisma.funnelStep.findFirst({
      where: { id: stepId, funnelId, funnel: { siteId: site.id } },
    });
    if (!step) return error("Step not found", 404);

    await prisma.funnelStep.update({
      where: { id: stepId },
      data: { viewCount: { increment: 1 } },
    });

    return success({ tracked: true });
  } catch (err) {
    console.error("Funnel step view tracking error:", err);
    // Non-critical — don't break the visitor's experience over an analytics failure
    return success({ tracked: false });
  }
}
