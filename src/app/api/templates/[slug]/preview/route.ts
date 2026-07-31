import { NextRequest, NextResponse } from "next/server";
import { getTemplateBySlug } from "@/lib/templates/catalog";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Block-based templates (no HTML file) → render via React preview page
  if (!template.file) {
    return NextResponse.redirect(
      new URL(`/templates/preview/${template.slug}`, _req.url),
      302
    );
  }

  // Static HTML templates → redirect to public/templates/
  return NextResponse.redirect(
    new URL(`/templates/${template.file}`, _req.url),
    302
  );
}
