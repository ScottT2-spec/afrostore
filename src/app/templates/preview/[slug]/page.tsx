"use client";

import { useParams } from "next/navigation";
import { TEMPLATE_PRESET_MAP } from "@/lib/templates/template-preset-map";
import { RenderTemplateBlocks } from "@/components/storefront/TemplateBlockRenderer";

export default function TemplatePreviewPage() {
  const { slug } = useParams<{ slug: string }>();

  const blocks = TEMPLATE_PRESET_MAP[slug] ?? TEMPLATE_PRESET_MAP[`${slug}-landing`];

  if (!blocks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Template not found: {slug}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <RenderTemplateBlocks blocks={blocks} />
    </div>
  );
}
