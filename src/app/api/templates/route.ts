import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates/catalog";
import { TEMPLATE_PRESET_MAP } from "@/lib/templates/template-preset-map";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const industry = searchParams.get("industry");
  const siteType = searchParams.get("siteType");
  const search = searchParams.get("q")?.toLowerCase();

  let templates = [...TEMPLATES].filter((t) => !t.hidden);

  // Filter by site type first
  if (siteType) {
    templates = templates.filter((t) => t.siteType === siteType);
  }

  // Sort industry matches first but always return all templates
  if (industry) {
    templates.sort((a, b) => {
      const aMatch = a.industries.includes(industry) ? 0 : 1;
      const bMatch = b.industries.includes(industry) ? 0 : 1;
      return aMatch - bMatch;
    });
  }

  if (category) {
    templates = templates.filter((t) => t.category === category);
  }

  if (search) {
    templates = templates.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.categoryLabel.toLowerCase().includes(search)
    );
  }

  // Only return categories that have templates in the filtered set
  const activeCategoryIds = new Set(templates.map((t) => t.category));
  const filteredCategories = TEMPLATE_CATEGORIES.filter((c) => activeCategoryIds.has(c.id));

  return NextResponse.json({
    templates: templates.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      categoryLabel: t.categoryLabel,
      description: t.description,
      previewImage: t.previewImage,
      previewUrl: (TEMPLATE_PRESET_MAP[t.slug] || TEMPLATE_PRESET_MAP[`${t.slug}-landing`])
        ? `/templates/preview/${t.slug}`
        : t.file ? `/templates/${t.file}` : `/templates/preview/${t.slug}`,
      siteType: t.siteType,
      industries: t.industries,
    })),
    categories: filteredCategories,
    total: templates.length,
  });
}
