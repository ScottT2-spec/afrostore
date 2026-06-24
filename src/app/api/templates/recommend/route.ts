import { NextRequest } from "next/server";
import { error, success } from "@/lib/api-helpers";
import { recommendTemplates } from "@/lib/templates/recommendation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await recommendTemplates(body || {});
    return success({
      industry: result.classification.industry,
      confidence: result.classification.confidence,
      recommended_templates: result.classification.recommended_templates,
      recommendations: result.recommendations.map((item) => ({
        ...item.template,
        score: item.score,
        matchPercent: item.matchPercent,
        reasons: item.reasons,
      })),
    });
  } catch (err) {
    console.error("Template recommend error:", err);
    return error("Failed to recommend templates", 500);
  }
}
