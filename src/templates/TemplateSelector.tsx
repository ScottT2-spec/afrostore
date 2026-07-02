"use client";

import TemplateGallery from "./TemplateGallery";
import type { TemplateDefinition } from "@/lib/templates/types";

interface ScoredTemplate extends TemplateDefinition {
  score?: number;
  matchPercent?: number;
  reasons?: string[];
}

export default function TemplateSelector({
  businessContext,
  onSelect,
}: {
  businessContext?: Record<string, unknown>;
  onSelect: (template: ScoredTemplate) => void;
}) {
  return (
    <TemplateGallery
      selectable
      businessContext={businessContext}
      onUseTemplate={onSelect}
    />
  );
}
