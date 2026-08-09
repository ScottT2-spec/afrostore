"use client";
import { Loader2 } from "lucide-react";
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, FileText, Globe, Link2, Package, Save, Search as SearchIcon, Sparkles } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface SeoItem {
  id: string; type: "page" | "product" | "blog"; name: string; slug: string;
  metaTitle: string | null; metaDescription: string | null; path: string;
}

const typeIcons = { page: FileText, product: Package, blog: Globe } as const;
const typeColors = { page: "text-blue-600 bg-blue-50", product: "text-green-600 bg-green-50", blog: "text-purple-600 bg-purple-50" } as const;
const typeLabels = { page: "Page", product: "Product", blog: "Blog Post" } as const;

function CharBar({ length, min, max }: { length: number; min: number; max: number }) {
  const pct = Math.min(100, (length / max) * 100);
  const color = length === 0 ? "bg-surface-200" : length > max ? "bg-red-500" : length < min ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="h-1 w-full rounded-full bg-surface-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function SeoPage() {
  const { currentStore } = useSite();
  const [items, setItems] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "page" | "product" | "blog">("");
  const [edits, setEdits] = useState<Record<string, { metaTitle?: string; metaDescription?: string }>>({});
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const all: SeoItem[] = [];

    const [pagesRes, prodsRes, blogsRes] = await Promise.all([
      api.get<{ pages: Array<{ id: string; title: string; slug: string; type: string; metaTitle: string | null; metaDescription: string | null }> }>(`/api/sites/${currentStore.id}/pages`),
      api.get<{ products: Array<{ id: string; name: string; slug: string; metaTitle: string | null; metaDescription: string | null }> }>(`/api/sites/${currentStore.id}/products`),
      api.get<{ blogs: Array<{ id: string; title: string; slug: string; metaTitle: string | null; metaDescription: string | null }> }>(`/api/sites/${currentStore.id}/blogs`),
    ]);

    if (pagesRes.success && pagesRes.data) {
      for (const p of pagesRes.data.pages || []) {
        if (p.type === "HOME") continue; // homepage SEO lives in Site Settings, not here
        all.push({ id: p.id, type: "page", name: p.title, slug: p.slug, metaTitle: p.metaTitle, metaDescription: p.metaDescription, path: `/${p.slug}` });
      }
    }
    if (prodsRes.success && prodsRes.data) {
      for (const p of prodsRes.data.products || []) {
        all.push({ id: p.id, type: "product", name: p.name, slug: p.slug, metaTitle: p.metaTitle, metaDescription: p.metaDescription, path: `/product/${p.slug}` });
      }
    }
    if (blogsRes.success && blogsRes.data) {
      for (const b of blogsRes.data.blogs || []) {
        all.push({ id: b.id, type: "blog", name: b.title, slug: b.slug, metaTitle: b.metaTitle, metaDescription: b.metaDescription, path: `/blog/${b.slug}` });
      }
    }

    setItems(all);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const siteUrl = useMemo(() => {
    if (typeof window === "undefined" || !currentStore) return "";
    return `${window.location.origin}/store/${currentStore.slug}`;
  }, [currentStore]);

  const copyLink = async (key: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(key);
      setTimeout(() => setCopiedLink((k) => (k === key ? null : k)), 2000);
    } catch {
      window.open(link, "_blank");
    }
  };

  const updateEdit = (id: string, field: "metaTitle" | "metaDescription", value: string) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveAll = async () => {
    if (!currentStore) return;
    setSaving(true);
    for (const [id, data] of Object.entries(edits)) {
      const item = items.find((i) => i.id === id);
      if (!item) continue;
      const endpoint = item.type === "page" ? "pages" : item.type === "product" ? "products" : "blogs";
      await api.patch(`/api/sites/${currentStore.id}/${endpoint}/${id}`, data);
    }
    setEdits({}); setSaving(false); fetchItems();
  };

  const generateOne = async (item: SeoItem) => {
    if (!currentStore) return;
    setGeneratingId(item.id);
    const res = await api.post<{ updated: number }>(`/api/sites/${currentStore.id}/ai/generate-seo`, { target: item.type, targetId: item.id });
    if (res.success) await fetchItems();
    setGeneratingId(null);
  };

  const generateAllMissing = async () => {
    if (!currentStore) return;
    setGeneratingAll(true);
    await api.post(`/api/sites/${currentStore.id}/ai/generate-seo`, { target: "all" });
    await fetchItems();
    setGeneratingAll(false);
  };

  const filtered = items.filter((i) => {
    if (typeFilter && i.type !== typeFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.slug.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const missingMeta = items.filter((i) => !i.metaTitle || !i.metaDescription).length;
  const hasEdits = Object.keys(edits).length > 0;

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">SEO Manager</h1>
          <p className="text-sm text-surface-500 mt-1">Meta titles and descriptions that actually reach Google, previews, and search engines</p>
        </div>
        <div className="flex items-center gap-2">
          {missingMeta > 0 && (
            <button onClick={generateAllMissing} disabled={generatingAll} className="btn-secondary text-sm py-2.5 px-4">
              {generatingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Fix {missingMeta} with AI
            </button>
          )}
          {hasEdits && (
            <button onClick={saveAll} disabled={saving} className="btn-primary text-sm py-2.5 px-4">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save {Object.keys(edits).length} Changes</>}
            </button>
          )}
        </div>
      </div>

      {/* Crawlability status — proof this is actually live */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-surface-900">Search engine crawlability</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Live</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "sitemap.xml", path: "/sitemap.xml", key: "sitemap" },
            { label: "robots.txt", path: "/robots.txt", key: "robots" },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-surface-800">{f.label}</p>
                <p className="text-[11px] text-surface-400 truncate">{siteUrl}{f.path}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => copyLink(f.key, `${siteUrl}${f.path}`)} className="p-1.5 rounded-lg hover:bg-white text-surface-400 hover:text-surface-700" title="Copy link">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <a href={`${siteUrl}${f.path}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white text-surface-400 hover:text-surface-700" title="Open">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {copiedLink === f.key && <span className="text-[10px] text-green-600 font-medium">Copied!</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-surface-900">{items.length}</p><p className="text-xs text-surface-500">Total Content</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-green-600">{items.length - missingMeta}</p><p className="text-xs text-surface-500">Optimized</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-amber-600">{missingMeta}</p><p className="text-xs text-surface-500">Needs Work</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-brand-600">{items.length > 0 ? `${((1 - missingMeta / items.length) * 100).toFixed(0)}%` : "—"}</p><p className="text-xs text-surface-500">SEO Score</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search content..." className="input-field py-2.5 pl-9 w-full" />
        </div>
        {(["", "page", "product", "blog"] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500"}`}>
            {t ? typeLabels[t] : "All"} {t ? `(${items.filter((i) => i.type === t).length})` : `(${items.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : filtered.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <SearchIcon className="h-8 w-8 text-surface-300 mx-auto mb-2" />
          <p className="text-sm text-surface-500">No content found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type];
            const color = typeColors[item.type];
            const edit = edits[item.id] || {};
            const title = edit.metaTitle ?? item.metaTitle ?? "";
            const desc = edit.metaDescription ?? item.metaDescription ?? "";
            const hasMeta = !!(item.metaTitle || edit.metaTitle) && !!(item.metaDescription || edit.metaDescription);
            const liveUrl = `${siteUrl}${item.path}`;
            const displayUrl = liveUrl.replace(/^https?:\/\//, "");

            return (
              <div key={item.id} className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-surface-900 truncate">{item.name}</span>
                      {hasMeta ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 flex-shrink-0"><CheckCircle2 className="h-3 w-3" /> Optimized</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0"><AlertTriangle className="h-3 w-3" /> Needs work</span>
                      )}
                    </div>
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-surface-400 hover:text-brand-600 flex items-center gap-1 truncate">
                      <Link2 className="h-3 w-3 flex-shrink-0" /><span className="truncate">{displayUrl}</span>
                    </a>
                  </div>
                  <button
                    onClick={() => generateOne(item)}
                    disabled={generatingId === item.id}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:bg-brand-50 rounded-lg px-2.5 py-1.5 disabled:opacity-50"
                  >
                    {generatingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI
                  </button>
                </div>

                {/* Google-style live preview */}
                <div className="rounded-xl bg-surface-50 border border-surface-100 p-3.5">
                  <p className="text-[11px] text-surface-400 mb-1.5 font-medium">Preview</p>
                  <p className="text-[13px] text-[#1a0dab] leading-tight truncate" style={{ fontFamily: "arial,sans-serif" }}>
                    {title || item.name}
                  </p>
                  <p className="text-[12px] text-[#006621] leading-tight truncate" style={{ fontFamily: "arial,sans-serif" }}>{displayUrl}</p>
                  <p className="text-[12.5px] text-[#545454] leading-snug line-clamp-2" style={{ fontFamily: "arial,sans-serif" }}>
                    {desc || "No meta description set — search engines will show an auto-generated snippet instead."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-surface-600">Meta Title</label>
                      <span className="text-[11px] text-surface-400">{title.length}/60</span>
                    </div>
                    <input value={title} maxLength={70} onChange={(e) => updateEdit(item.id, "metaTitle", e.target.value)}
                      className="input-field py-2 text-sm w-full mb-1.5"
                      placeholder={item.name} />
                    <CharBar length={title.length} min={30} max={60} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-surface-600">Meta Description</label>
                      <span className="text-[11px] text-surface-400">{desc.length}/160</span>
                    </div>
                    <input value={desc} maxLength={180} onChange={(e) => updateEdit(item.id, "metaDescription", e.target.value)}
                      className="input-field py-2 text-sm w-full mb-1.5"
                      placeholder="Describe this content for search results..." />
                    <CharBar length={desc.length} min={70} max={160} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
