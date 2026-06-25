"use client";
import { ArrowLeft } from "lucide-react";
import { ExternalLink, Sparkles } from "@/components/icons/FilledIcons";

import Link from "next/link";
import type { TemplateDefinition } from "@/lib/templates/types";
import TemplateRenderer from "./TemplateRenderer";

interface Props {
  template: TemplateDefinition;
  previewMode?: boolean;
}

export default function TemplatePreview({ template, previewMode = false }: Props) {
  const sections = template.themeConfig.sections.map((section) => section.type.replace(/_/g, " "));

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/templates" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-900">
          <ArrowLeft className="h-4 w-4" /> Templates
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white p-4">
            <TemplateRenderer template={template} previewMode={previewMode} />
          </div>
          <aside className="space-y-5">
            {previewMode && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
                Internal preview - this template is rendered from platform-owned config.
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase text-brand-600">{template.category}</p>
              <h1 className="mt-1 text-3xl font-bold text-surface-900">{template.name}</h1>
              <p className="mt-3 text-surface-600">{template.description}</p>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-5">
              <h2 className="text-sm font-bold text-surface-900">Included Sections</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {sections.map((section) => (
                  <span key={section} className="rounded-full bg-surface-100 px-3 py-1 text-xs capitalize text-surface-700">{section}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-5">
              <h2 className="text-sm font-bold text-surface-900">Variants</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(template.variants || [{ name: template.category }]).map((variant) => (
                  <span key={variant.name} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    <Sparkles className="h-3 w-3" /> {variant.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <a href={template.previewUrl || `/template-preview/${template.slug}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50">
                Open preview <ExternalLink className="h-4 w-4" />
              </a>
              <Link href={`/dashboard/new-site?template=${template.id || template.slug}`} className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                Use This Template
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
