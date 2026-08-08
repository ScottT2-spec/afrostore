import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { parseVariants, pickVariant } from "@/lib/ab-testing";

type Params = { params: Promise<{ slug: string }> };

// POST /api/public/sites/:slug/ab-tests/assign — no auth.
// Body: { pageId: string, existingTestId?: string, existingVariantId?: string }
// If the visitor already has an assignment for the running test (passed back from
// localStorage by the client), that assignment is reused and no new view is counted.
// Otherwise a variant is picked by weight and a view is recorded once.
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const pageId = typeof body.pageId === "string" ? body.pageId : undefined;
    if (!pageId) return error("pageId is required", 400);

    const site = await prisma.site.findFirst({
      where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
      select: { id: true },
    });
    if (!site) return error("Store not found", 404);

    const test = await prisma.aBTest.findFirst({
      where: { siteId: site.id, pageId, status: "RUNNING" },
    });
    if (!test) return success({ active: false });

    const variants = parseVariants(test.variants);
    if (variants.length === 0) return success({ active: false });

    // Reuse an existing assignment for this same test if the client already has one.
    const existingVariantId = typeof body.existingVariantId === "string" ? body.existingVariantId : undefined;
    const existingTestId = typeof body.existingTestId === "string" ? body.existingTestId : undefined;
    if (existingTestId === test.id && existingVariantId && variants.some((v) => v.id === existingVariantId)) {
      const variant = variants.find((v) => v.id === existingVariantId)!;
      return success({ active: true, testId: test.id, variantId: variant.id, content: variant.content ?? null, isNewAssignment: false });
    }

    const variant = pickVariant(variants);
    if (!variant) return success({ active: false });

    await Promise.all([
      prisma.aBTestStat.upsert({
        where: { testId_variantId: { testId: test.id, variantId: variant.id } },
        create: { testId: test.id, variantId: variant.id, views: 1 },
        update: { views: { increment: 1 } },
      }),
      prisma.aBTest.update({ where: { id: test.id }, data: { totalViews: { increment: 1 } } }),
    ]);

    return success({ active: true, testId: test.id, variantId: variant.id, content: variant.content ?? null, isNewAssignment: true });
  } catch (err) {
    console.error("A/B test assign error:", err);
    // Non-critical — never break the visitor's page load over a testing failure.
    return success({ active: false });
  }
}
