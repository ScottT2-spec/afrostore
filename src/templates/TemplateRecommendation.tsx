"use client";
import { Sparkles } from "@/components/icons/FilledIcons";

import type { TemplateDefinition } from "@/lib/templates/types";

export interface RecommendedTemplate extends TemplateDefinition {
  matchPercent?: number;
  reasons?: string[];
}

export default function TemplateRecommendation({ templates, onSelect }: { templates: RecommendedTemplate[]; onSelect?: (template: RecommendedTemplate) => void }) {
  if (templates.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
        <Sparkles className="h-4 w-4" />
        Recommended For Your Business
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {templates.slice(0, 3).map((template) => (
          <button
            key={template.id || template.slug}
            onClick={() => onSelect?.(template)}
            className="rounded-xl border border-brand-100 bg-white p-4 text-left shadow-sm hover:border-brand-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-surface-900">{template.name}</p>
                <p className="mt-1 text-xs text-surface-500">{template.category}</p>
              </div>
              {template.matchPercent !== undefined && <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">{template.matchPercent}%</span>}
            </div>
            <p className="mt-3 line-clamp-2 text-xs text-surface-500">{template.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
