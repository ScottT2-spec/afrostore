"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { Search } from "@/components/icons/FilledIcons";

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
}

export default function TemplateGallery({
  selectable,
  onUseTemplate,
  businessContext,
}: Props) {
  const siteType = typeof businessContext?.siteType === "string" ? businessContext.siteType : "";
  const [templates, setTemplates] = useState<ScoredTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (siteType) params.set("siteType", siteType);
      const res = await api.get<TemplateDefinition[]>(`/api/templates${params.toString() ? `?${params.toString()}` : ""}`);
      if (!cancelled && res.success && res.data) setTemplates(res.data);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [businessContext, siteType]);

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      const text = `${template.name} ${template.category} ${template.description} ${template.recommendationKeywords.join(" ")}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesCategory = !category || template.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [templates, search, category]);

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
          {TEMPLATE_CATEGORIES.filter((item) => !siteType || templates.some((template) => template.category === item)).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <article key={template.id || template.slug} className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
              <div className="relative h-52 overflow-hidden bg-surface-100">
                <iframe
                  src={`/template-preview/${template.slug}`}
                  title={`${template.name} preview`}
                  className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                  style={{ width: "1280px", height: "800px", transform: "scale(0.28)", transformOrigin: "top left" }}
                  loading="lazy"
                  sandbox="allow-same-origin"
                  tabIndex={-1}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{template.category}</span>
                    {template.manifest?.siteType && (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {template.manifest.siteType.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold text-white leading-tight">{template.name}</h3>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-surface-400">{template.manifest?.category || template.category}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-surface-500">{template.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(template.package?.manifest.tags || template.recommendationKeywords).slice(0, 4).map((keyword) => (
                    <span key={keyword} className="rounded-full bg-surface-100 px-2 py-0.5 text-[11px] text-surface-600">{keyword}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/template-preview/${template.slug}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50">
                    Preview <ArrowRight className="h-4 w-4" />
                  </Link>
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
