import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES, TEMPLATE_CATEGORIES, getTemplatesByCategory, getTemplatesByIndustry } from "@/lib/templates/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const industry = searchParams.get("industry");
  const search = searchParams.get("q")?.toLowerCase();

  let templates = [...TEMPLATES];

  if (category) {
    templates = getTemplatesByCategory(category);
  } else if (industry) {
    templates = getTemplatesByIndustry(industry);
  }

  if (search) {
    templates = templates.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.categoryLabel.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    templates: templates.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      categoryLabel: t.categoryLabel,
      description: t.description,
      previewImage: t.previewImage,
      previewUrl: `/api/templates/${t.slug}/preview`,
      industries: t.industries,
    })),
    categories: TEMPLATE_CATEGORIES,
    total: templates.length,
  });
}
