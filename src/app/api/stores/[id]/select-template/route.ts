import { NextRequest } from "next/server";
import { getSiteContext, error, success } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { importTemplateToSite } from "@/lib/templates/importer";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await getSiteContext(req, id);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const result = await importTemplateToSite(id, {
      ...body,
      businessName: body.businessName || body.business_name || ctx.site?.name,
      description: body.description || ctx.site?.description || undefined,
      businessCategory: body.businessCategory || body.category || ctx.site?.businessType,
      industry: body.industry || ctx.site?.industry || undefined,
      aiBuild: false,
    });

    return success({
      selectedTemplate: result.template,
      siteTemplate: result.siteTemplate,
      pagesGenerated: result.pages.length,
      themeConfig: result.themeConfig,
    });
  } catch (err) {
    console.error("Select template error:", err);
    return error(err instanceof Error ? err.message : "Failed to select template", 500);
  }
}
