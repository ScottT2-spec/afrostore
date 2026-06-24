import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getTemplateByIdOrSlug } from "@/lib/templates/recommendation";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await getTemplateByIdOrSlug(slug);
  if (!template) notFound();

  redirect(`/template-preview/${template.slug}`);
}
