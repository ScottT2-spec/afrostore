import { NextRequest, NextResponse } from "next/server";
import { getTemplateBySlug } from "@/lib/templates/catalog";
import { TEMPLATE_PRESET_MAP } from "@/lib/templates/template-preset-map";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Prefer the real block-based preview whenever one exists — this renders
  // the actual components the storefront uses after the site is created,
  // not a static HTML snapshot (which are old scraped WordPress theme demo
  // pages full of external, third-party asset references).
  if (TEMPLATE_PRESET_MAP[template.slug] || TEMPLATE_PRESET_MAP[`${template.slug}-landing`]) {
    return NextResponse.redirect(
      new URL(`/templates/preview/${template.slug}`, _req.url),
      302
    );
  }

  // No block preset yet — fall back to the static HTML file, if one exists.
  if (template.file) {
    return NextResponse.redirect(
      new URL(`/templates/${template.file}`, _req.url),
      302
    );
  }

  return NextResponse.json({ error: "No preview available for this template" }, { status: 404 });
}
