import { NextRequest } from "next/server";
import { error, success } from "@/lib/api-helpers";
import { listTemplates } from "@/lib/templates/recommendation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const templates = await listTemplates({ siteType: body?.siteType });
    return success({
      industry: body?.businessCategory || body?.industry || "Business",
      confidence: 0.5,
      recommended_templates: templates.slice(0, 5).map((template) => template.slug),
      recommendations: templates.slice(0, 5).map((template) => ({
        ...template,
        score: 100,
        matchPercent: 100,
        reasons: ["Category filtered package"],
      })),
    });
  } catch (err) {
    console.error("Template recommend error:", err);
    return error("Failed to recommend templates", 500);
  }
}
