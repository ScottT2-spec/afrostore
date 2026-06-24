import { notFound } from "next/navigation";
import TemplatePreview from "@/templates/TemplatePreview";
import { getTemplateByIdOrSlug } from "@/lib/templates/recommendation";

export default async function InternalTemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await getTemplateByIdOrSlug(slug);
  if (!template) notFound();

  return <TemplatePreview template={template} previewMode />;
}
