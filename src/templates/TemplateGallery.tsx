"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { ExternalLink, Search, Sparkles } from "@/components/icons/FilledIcons";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/catalog";
import type { TemplateDefinition } from "@/lib/templates/types";

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

function TemplateMiniPreview({ template }: { template: ScoredTemplate }) {
  const colors = template.themeConfig?.colors || { primary: "#6366f1", secondary: "#1f2937", accent: "#f59e0b", background: "#ffffff", text: "#111827", headerBg: "#ffffff", footerBg: "#1f2937", footerText: "#f9fafb" };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Scaled-down full website mockup */}
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: "400%", height: "400%", transform: "scale(0.25)" }}>
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#f1f3f4" }}>
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4 h-6 rounded-md bg-white flex items-center px-3">
            <div className="h-2 w-32 rounded bg-gray-300" />
          </div>
        </div>

        {/* Site Header */}
        <div className="flex items-center justify-between px-12 py-5" style={{ background: colors.headerBg, borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg" style={{ background: colors.primary }} />
            <div className="h-4 w-28 rounded" style={{ background: colors.text, opacity: 0.8 }} />
          </div>
          <div className="flex items-center gap-6">
            <div className="h-3 w-16 rounded" style={{ background: colors.text, opacity: 0.4 }} />
            <div className="h-3 w-16 rounded" style={{ background: colors.text, opacity: 0.4 }} />
            <div className="h-3 w-16 rounded" style={{ background: colors.text, opacity: 0.4 }} />
            <div className="h-3 w-16 rounded" style={{ background: colors.text, opacity: 0.4 }} />
            <div className="h-8 w-24 rounded-lg" style={{ background: colors.primary }} />
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative px-12 py-24" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, minHeight: "320px" }}>
          <div className="max-w-xl">
            <div className="h-3 w-32 rounded-full mb-6" style={{ background: colors.accent, opacity: 0.9 }} />
            <div className="h-8 w-full rounded mb-3" style={{ background: "#ffffff", opacity: 0.95 }} />
            <div className="h-8 w-3/4 rounded mb-6" style={{ background: "#ffffff", opacity: 0.95 }} />
            <div className="h-4 w-full rounded mb-2" style={{ background: "#ffffff", opacity: 0.4 }} />
            <div className="h-4 w-2/3 rounded mb-8" style={{ background: "#ffffff", opacity: 0.4 }} />
            <div className="flex gap-4">
              <div className="h-12 w-40 rounded-lg" style={{ background: colors.accent }} />
              <div className="h-12 w-40 rounded-lg border-2" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="px-12 py-16" style={{ background: colors.background }}>
          <div className="text-center mb-10">
            <div className="mx-auto h-3 w-24 rounded-full mb-4" style={{ background: colors.primary, opacity: 0.6 }} />
            <div className="mx-auto h-6 w-64 rounded mb-3" style={{ background: colors.text, opacity: 0.85 }} />
            <div className="mx-auto h-3 w-80 rounded" style={{ background: colors.text, opacity: 0.3 }} />
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[0,1,2,3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: "2px solid rgba(0,0,0,0.06)", background: colors.background }}>
                <div className="h-40" style={{ background: `linear-gradient(${135 + i * 25}deg, ${colors.primary}15, ${colors.accent}20, ${colors.secondary}10)` }} />
                <div className="p-4">
                  <div className="h-3 w-full rounded mb-2" style={{ background: colors.text, opacity: 0.6 }} />
                  <div className="h-3 w-2/3 rounded mb-3" style={{ background: colors.text, opacity: 0.3 }} />
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 rounded" style={{ background: colors.primary, opacity: 0.8 }} />
                    <div className="h-8 w-8 rounded-lg" style={{ background: colors.accent, opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="px-12 py-12 flex items-center justify-between" style={{ background: colors.primary }}>
          <div>
            <div className="h-5 w-56 rounded mb-2" style={{ background: "#ffffff", opacity: 0.9 }} />
            <div className="h-3 w-72 rounded" style={{ background: "#ffffff", opacity: 0.4 }} />
          </div>
          <div className="h-12 w-36 rounded-lg" style={{ background: colors.accent }} />
        </div>

        {/* Footer */}
        <div className="px-12 py-10" style={{ background: colors.footerBg }}>
          <div className="grid grid-cols-4 gap-8 mb-8">
            {[0,1,2,3].map((i) => (
              <div key={i}>
                <div className="h-3 w-20 rounded mb-4" style={{ background: colors.footerText, opacity: 0.7 }} />
                <div className="space-y-2">
                  <div className="h-2 w-24 rounded" style={{ background: colors.footerText, opacity: 0.3 }} />
                  <div className="h-2 w-20 rounded" style={{ background: colors.footerText, opacity: 0.3 }} />
                  <div className="h-2 w-28 rounded" style={{ background: colors.footerText, opacity: 0.3 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="h-px w-full mb-4" style={{ background: colors.footerText, opacity: 0.1 }} />
          <div className="h-2 w-48 rounded mx-auto" style={{ background: colors.footerText, opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
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
              <div className="relative h-52 overflow-hidden bg-gray-100">
                {template.previewImage ? (
                  <img src={template.previewImage} alt={template.name} className="h-full w-full object-cover" />
                ) : (
                  <TemplateMiniPreview template={template} />
                )}
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
                  {selectable ? (
                    <button onClick={() => onUseTemplate?.(template)} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                      Use
                    </button>
                  ) : (
                    <Link href={`/dashboard/new-site?template=${template.slug}`} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                      Use
                    </Link>
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
