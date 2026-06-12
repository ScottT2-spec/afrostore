"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Palette, Plus, Loader2, Star, Eye, Trash2, X } from "lucide-react";

interface Theme {
  id: string; name: string; slug: string; description: string | null; category: string; industry: string | null;
  isPremium: boolean; isFeatured: boolean; isActive: boolean; installs: number; createdAt: string;
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "ecommerce", industry: "", isPremium: false, isFeatured: false });

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    const res = await api.get<Theme[]>("/api/admin/themes");
    if (res.success && res.data) setThemes(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  const resetForm = () => { setForm({ name: "", slug: "", description: "", category: "ecommerce", industry: "", isPremium: false, isFeatured: false }); setEditingId(null); setShowForm(false); };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const body = { ...form, slug, config: { colors: { primary: "#1E293B", accent: "#F59E0B" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" } } };
    const res = editingId ? await api.patch(`/api/admin/themes/${editingId}`, body) : await api.post("/api/admin/themes", body);
    if (res.success) { fetchThemes(); resetForm(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this theme?")) return;
    await api.delete(`/api/admin/themes/${id}`);
    fetchThemes();
  };

  const startEdit = (t: Theme) => {
    setForm({ name: t.name, slug: t.slug, description: t.description || "", category: t.category, industry: t.industry || "", isPremium: t.isPremium, isFeatured: t.isFeatured });
    setEditingId(t.id); setShowForm(true);
  };

  const toggleField = async (id: string, field: string, value: boolean) => {
    await api.patch(`/api/admin/themes/${id}`, { [field]: value });
    fetchThemes();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Theme Management</h1>
          <p className="text-sm text-surface-500 mt-1">Manage marketplace themes</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Theme
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-surface-900">{editingId ? "Edit Theme" : "New Theme"}</h3>
            <button onClick={resetForm} className="text-surface-400 hover:text-surface-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Theme Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
            <input placeholder="Slug (auto-generated)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500">
              <option value="ecommerce">Ecommerce</option><option value="fashion">Fashion</option><option value="food">Food & Beverage</option><option value="beauty">Beauty</option><option value="tech">Tech</option><option value="general">General</option>
            </select>
            <input placeholder="Industry (optional)" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 md:col-span-2" rows={2} />
            <div className="flex items-center gap-6 md:col-span-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="rounded" /> Premium</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" /> Featured</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm rounded-xl border border-surface-200 hover:bg-surface-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
      ) : themes.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <Palette className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">No themes yet. Add your first theme.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((t) => (
            <div key={t.id} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white"><Palette className="h-5 w-5" /></div>
                <div className="flex items-center gap-1">
                  {t.isPremium && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Premium</span>}
                  {t.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                </div>
              </div>
              <h3 className="text-sm font-bold text-surface-900">{t.name}</h3>
              <p className="text-[10px] text-surface-500 mt-0.5">{t.category}{t.industry ? ` · ${t.industry}` : ""}</p>
              {t.description && <p className="text-xs text-surface-400 mt-2 line-clamp-2">{t.description}</p>}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleField(t.id, "isActive", !t.isActive)} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${t.isActive ? "bg-green-100 text-green-700" : "bg-surface-100 text-surface-500"}`}>
                    {t.isActive ? "Active" : "Inactive"}
                  </button>
                  <span className="text-[10px] text-surface-400">{t.installs} installs</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
