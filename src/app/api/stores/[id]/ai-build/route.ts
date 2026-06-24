import { NextRequest } from "next/server";
import { getSiteContext, error, success } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { applyTemplateToSite, recommendTemplates } from "@/lib/templates/recommendation";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await getSiteContext(req, id);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const analysisInput = {
      ...body,
      businessName: body.businessName || body.business_name || ctx.site?.name,
      description: body.description || ctx.site?.description || undefined,
      businessCategory: body.businessCategory || body.category || ctx.site?.businessType,
      industry: body.industry || ctx.site?.industry || undefined,
    };
    const recommendations = await recommendTemplates(analysisInput);
    const best = recommendations.recommendations[0];
    if (!best) return error("No template recommendations available", 404);

    const result = await applyTemplateToSite(id, {
      ...analysisInput,
      templateId: best.template.id,
      aiBuild: true,
    });

    return success({
      analysis: recommendations.classification,
      selectedTemplate: result.template,
      matchPercent: best.matchPercent,
      pagesGenerated: result.pages.length,
      themeConfig: result.themeConfig,
    });
  } catch (err) {
    console.error("AI build error:", err);
    return error(err instanceof Error ? err.message : "Failed to build website", 500);
  }
}
