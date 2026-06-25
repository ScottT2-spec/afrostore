"use client";
import { Loader2, Plus, X } from "lucide-react";
import { CheckCircle2, Edit3, Eye, Power, Save, Search } from "@/components/icons/FilledIcons";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/catalog";
import type { TemplateDefinition } from "@/lib/templates/types";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";

const EMPTY_CONFIG = {
  homepage_layout: "custom",
  header_style: "modern",
  footer_style: "simple",
  product_card_style: "clean",
  colors: {
    primary: "#1B2B4B",
    secondary: "#111827",
    accent: "#F5B731",
    background: "#ffffff",
    text: "#111827",
  },
  fonts: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
  sections: [],
};

const emptyForm = {
  name: "",
  slug: "",
  category: "Business",
  description: "",
  previewImage: "",
  previewUrl: "",
  recommendationKeywords: "",
  variants: "[]",
  themeConfig: JSON.stringify(EMPTY_CONFIG, null, 2),
  active: true,
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const res = await api.get<TemplateDefinition[]>("/api/templates?includeInactive=true");
    if (res.success && res.data) setTemplates(res.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    return templates.filter((template) => {
      if (!needle) return true;
      return `${template.name} ${template.category} ${template.description} ${template.recommendationKeywords.join(" ")}`.toLowerCase().includes(needle);
    });
  }, [templates, search]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(false);
  };

  const edit = (template: TemplateDefinition) => {
    setForm({
      name: template.name,
      slug: template.slug,
      category: template.category,
      description: template.description,
      previewImage: template.previewImage,
      previewUrl: template.previewUrl,
      recommendationKeywords: template.recommendationKeywords.join(", "),
      variants: JSON.stringify(template.variants || [], null, 2),
      themeConfig: JSON.stringify(template.themeConfig, null, 2),
      active: template.active,
    });
    setEditingId(template.id || null);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        category: form.category,
        description: form.description,
        previewImage: form.previewImage,
        previewUrl: form.previewUrl,
        recommendationKeywords: form.recommendationKeywords.split(",").map((keyword) => keyword.trim().toLowerCase()).filter(Boolean),
        variants: JSON.parse(form.variants || "[]"),
        themeConfig: JSON.parse(form.themeConfig || "{}"),
        active: form.active,
      };
      const res = editingId
        ? await api.put(`/api/templates/${editingId}`, payload)
        : await api.post("/api/templates", payload);
      if (!res.success) throw new Error(res.error || "Failed to save template");
      await loadTemplates();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (template: TemplateDefinition) => {
    if (!template.id) return;
    await api.put(`/api/templates/${template.id}`, { active: !template.active });
    loadTemplates();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Template Management</h1>
          <p className="mt-1 text-sm text-surface-500">Manage marketplace templates, variants, categories, and recommendation keywords.</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Create Template
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search templates" className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
      </div>

      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-surface-900">{editingId ? "Edit Template" : "New Template"}</h2>
            <button onClick={reset} className="text-surface-400 hover:text-surface-700"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Template name" className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug" className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              {TEMPLATE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input value={form.previewUrl} onChange={(event) => setForm({ ...form, previewUrl: event.target.value })} placeholder="Live demo URL" className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            <div className="md:col-span-2">
              <SingleImageUpload image={form.previewImage || null} onChange={(url) => setForm({ ...form, previewImage: url || "" })} label="Preview image" compact />
            </div>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={2} className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 md:col-span-2" />
            <input value={form.recommendationKeywords} onChange={(event) => setForm({ ...form, recommendationKeywords: event.target.value })} placeholder="Recommendation keywords, comma separated" className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 md:col-span-2" />
            <textarea value={form.variants} onChange={(event) => setForm({ ...form, variants: event.target.value })} rows={5} className="font-mono rounded-xl border border-surface-200 px-3 py-2.5 text-xs outline-none focus:border-brand-500" />
            <textarea value={form.themeConfig} onChange={(event) => setForm({ ...form, themeConfig: event.target.value })} rows={12} className="font-mono rounded-xl border border-surface-200 px-3 py-2.5 text-xs outline-none focus:border-brand-500" />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-surface-700">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Active in marketplace
          </label>
          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={reset} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50">Cancel</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Template
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-xs uppercase text-surface-500">
              <tr>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Keywords</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((template) => (
                <tr key={template.id || template.slug}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-surface-900">{template.name}</p>
                    <p className="text-xs text-surface-400">{template.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{template.category}</td>
                  <td className="px-4 py-3 text-xs text-surface-500">{template.recommendationKeywords.slice(0, 5).join(", ")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${template.active ? "bg-emerald-50 text-emerald-700" : "bg-surface-100 text-surface-500"}`}>
                      <CheckCircle2 className="h-3 w-3" /> {template.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a href={`/template-preview/${template.slug}`} target="_blank" rel="noreferrer" className="rounded-lg border border-surface-200 p-2 text-surface-500 hover:bg-surface-50" aria-label="Preview"><Eye className="h-4 w-4" /></a>
                      <button onClick={() => edit(template)} className="rounded-lg border border-surface-200 p-2 text-surface-500 hover:bg-surface-50" aria-label="Edit"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => toggleActive(template)} className="rounded-lg border border-surface-200 p-2 text-surface-500 hover:bg-surface-50" aria-label="Toggle active"><Power className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
