"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/catalog";
import type { TemplateDefinition } from "@/lib/templates/types";
import { ArrowRight, ExternalLink, Loader2, Search, Sparkles } from "lucide-react";

interface ScoredTemplate extends TemplateDefinition {
  score?: number;
  matchPercent?: number;
  reasons?: string[];
}

interface Props {
  selectable?: boolean;
  onUseTemplate?: (template: ScoredTemplate) => void;
  businessContext?: Record<string, unknown>;
  initialRecommendations?: ScoredTemplate[];
  onRecommendationsLoaded?: (templates: ScoredTemplate[]) => void;
}

export default function TemplateGallery({
  selectable,
  onUseTemplate,
  businessContext,
  initialRecommendations = [],
  onRecommendationsLoaded,
}: Props) {
  const [templates, setTemplates] = useState<ScoredTemplate[]>([]);
  const [recommended, setRecommended] = useState<ScoredTemplate[]>(initialRecommendations);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await api.get<TemplateDefinition[]>("/api/templates");
      if (!cancelled && res.success && res.data) setTemplates(res.data);

      if (businessContext && Object.keys(businessContext).length > 0) {
        const rec = await api.post<{ recommendations: ScoredTemplate[] }>("/api/templates/recommend", businessContext);
        if (!cancelled && rec.success && rec.data) {
          const recommendations = rec.data.recommendations || [];
          setRecommended(recommendations);
          onRecommendationsLoaded?.(recommendations);
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [businessContext, onRecommendationsLoaded]);

  const filtered = useMemo(() => {
    const recommendedIds = new Set(recommended.map((template) => template.id || template.slug));
    const all = recommended.length > 0
      ? [...recommended, ...templates.filter((template) => !recommendedIds.has(template.id || template.slug))]
      : templates;
    return all.filter((template) => {
      const text = `${template.name} ${template.category} ${template.description} ${template.recommendationKeywords.join(" ")}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesCategory = !category || template.category === category || template.recommendationKeywords.includes(category.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [templates, recommended, search, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates"
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All categories</option>
          {TEMPLATE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {recommended.length > 0 && (
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
          <Sparkles className="h-4 w-4" />
          Recommended For Your Business
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <article key={template.id || template.slug} className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
              <div className="relative h-44 bg-gradient-to-br from-surface-900 via-brand-700 to-accent-500">
                {template.previewImage ? <img src={template.previewImage} alt={template.name} className="h-full w-full object-cover" /> : null}
                {template.matchPercent !== undefined && (
                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm">
                    {template.matchPercent}% Match
                  </span>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-surface-400">{template.category}</p>
                  <h3 className="text-base font-bold text-surface-900">{template.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-surface-500">{template.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {template.recommendationKeywords.slice(0, 4).map((keyword) => (
                    <span key={keyword} className="rounded-full bg-surface-100 px-2 py-0.5 text-[11px] text-surface-600">{keyword}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/template-preview/${template.slug}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50">
                    Preview <ArrowRight className="h-4 w-4" />
                  </Link>
                  {template.previewUrl && (
                    <a href={template.previewUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-surface-200 p-2 text-surface-500 hover:bg-surface-50" aria-label="Open internal preview">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {selectable && (
                    <button onClick={() => onUseTemplate?.(template)} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                      Use
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
