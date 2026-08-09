"use client";
import { Loader2, Plus } from "lucide-react";
import { Download, FileText, Filter, Palette, Pencil, Puzzle, Search, Star, Store, Trash2, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

interface MarketplaceItem {
  id: string; type: string; name: string; description: string | null;
  price: string; currency: string; authorName: string; thumbnail: string | null;
  downloads: number; rating: string; reviewCount: number; status: string;
  rejectionReason?: string | null; themeId?: string | null;
  category: string | null; tags: string[]; createdAt: string;
}

interface OwnedTheme { id: string; name: string; thumbnail: string | null; authorId?: string | null; }

const typeIcons: Record<string, typeof Store> = { THEME: Palette, PLUGIN: Puzzle, TEMPLATE: FileText, FUNNEL: Filter, AUTOMATION: Zap };
const typeColors: Record<string, string> = { THEME: "bg-blue-50 text-blue-600", PLUGIN: "bg-green-50 text-green-600", TEMPLATE: "bg-purple-50 text-purple-600", FUNNEL: "bg-amber-50 text-amber-600", AUTOMATION: "bg-red-50 text-red-600" };
const statusColors: Record<string, string> = { PENDING: "bg-amber-50 text-amber-700", APPROVED: "bg-green-50 text-green-700", REJECTED: "bg-red-50 text-red-700", SUSPENDED: "bg-surface-100 text-surface-500" };

export default function MarketplacePage() {
  const { currentStore } = useSite();
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tab, setTab] = useState<"browse" | "mine">("browse");
  const [showPublish, setShowPublish] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [installId, setInstallId] = useState<string | null>(null);

  const [ownedThemes, setOwnedThemes] = useState<OwnedTheme[]>([]);
  const [pubThemeId, setPubThemeId] = useState("");
  const [pubDescription, setPubDescription] = useState("");
  const [pubPrice, setPubPrice] = useState("0");
  const [pubCategory, setPubCategory] = useState("");

  const fetchItems = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (tab === "mine") params.set("mine", "true");
    const res = await api.get<{ items: MarketplaceItem[] }>(`/api/sites/${currentStore.id}/marketplace?${params}`);
    if (res.success && res.data) setItems(res.data.items || []);
    setLoading(false);
  }, [currentStore, search, typeFilter, tab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Load the themes this merchant actually owns (e.g. AI-generated), since
  // that's the only content that can currently be published + installed.
  useEffect(() => {
    if (!currentStore || !user || !showPublish) return;
    api.get<{ themes: OwnedTheme[] }>(`/api/sites/${currentStore.id}/themes`).then((res) => {
      if (res.success && res.data) setOwnedThemes(res.data.themes.filter((t) => t.authorId === user.id));
    });
  }, [currentStore, user, showPublish]);

  const publishItem = async () => {
    if (!currentStore || !pubThemeId) return;
    setSaving(true);
    const theme = ownedThemes.find((t) => t.id === pubThemeId);
    const res = await api.post(`/api/sites/${currentStore.id}/marketplace`, {
      name: theme?.name, type: "THEME", themeId: pubThemeId, description: pubDescription.trim() || undefined,
      price: parseFloat(pubPrice) || 0, category: pubCategory.trim() || undefined,
    });
    setSaving(false);
    if (!res.success) { alert(res.error || "Failed to submit"); return; }
    setShowPublish(false); setPubThemeId(""); setPubDescription(""); setPubPrice("0"); setPubCategory("");
    alert("Submitted for review. It won't appear in the public marketplace until it's approved — check the \"My submissions\" tab for its status.");
    setTab("mine");
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!currentStore || !confirm("Delete this submission?")) return;
    setDeleteId(id);
    const res = await api.delete(`/api/sites/${currentStore.id}/marketplace/${id}`);
    setDeleteId(null);
    if (!res.success) { alert(res.error || "Failed to delete"); return; }
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const installItem = async (id: string) => {
    if (!currentStore) return;
    setInstallId(id);
    const res = await api.post<{ message: string }>(`/api/sites/${currentStore.id}/marketplace/${id}/install`, {});
    setInstallId(null);
    if (!res.success) { alert(res.error || "Failed to install"); return; }
    alert(res.data?.message || "Installed successfully.");
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Marketplace</h1><p className="text-sm text-surface-500 mt-1">Browse and publish themes, plugins, templates, and more</p></div>
        <button onClick={() => setShowPublish(true)} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> Publish</button>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-200">
        <button onClick={() => setTab("browse")} className={`text-sm font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${tab === "browse" ? "border-brand-600 text-brand-700" : "border-transparent text-surface-500"}`}>Browse</button>
        <button onClick={() => setTab("mine")} className={`text-sm font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${tab === "mine" ? "border-brand-600 text-brand-700" : "border-transparent text-surface-500"}`}>My Submissions</button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search marketplace..." className="input-field py-2.5 pl-9 w-full" />
        </div>
        {["", "THEME", "PLUGIN", "TEMPLATE", "FUNNEL", "AUTOMATION"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500"}`}>
            {t || "All"}
          </button>
        ))}
      </div>

      {/* Publish form */}
      {showPublish && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">Publish a Theme</h3>
          <p className="text-xs text-surface-500 -mt-2">Only themes you've created can be published right now — other listing types are coming soon.</p>
          {ownedThemes.length === 0 ? (
            <p className="text-sm text-surface-500">You don't have any themes of your own yet. Generate one with AI Theme Builder first, then come back here to publish it.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-surface-700 mb-1">Theme *</label>
                <select value={pubThemeId} onChange={(e) => setPubThemeId(e.target.value)} className="input-field py-2.5 w-full">
                  <option value="">Select a theme...</option>
                  {ownedThemes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-surface-700 mb-1">Price (NGN, 0 = free)</label><input type="number" value={pubPrice} onChange={(e) => setPubPrice(e.target.value)} className="input-field py-2.5 w-full" min="0" /></div>
              <div><label className="block text-sm font-medium text-surface-700 mb-1">Category</label><input value={pubCategory} onChange={(e) => setPubCategory(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Fashion, Beauty" /></div>
              <div className="sm:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-surface-700 mb-1">Description</label><textarea value={pubDescription} onChange={(e) => setPubDescription(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} /></div>
              {parseFloat(pubPrice) > 0 && <p className="sm:col-span-2 lg:col-span-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">Heads up: paid listings can't be purchased yet — installs are only enabled for free items for now.</p>}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={publishItem} disabled={saving || !pubThemeId} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Review"}</button>
            <button onClick={() => setShowPublish(false)} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Items */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : items.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Store className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">{tab === "mine" ? "You haven't submitted anything yet" : `No marketplace items${typeFilter ? ` of type "${typeFilter}"` : ""}`}</h3>
          <p className="text-sm text-surface-500 mb-5">{tab === "mine" ? "Publish a theme, plugin, or template to see it here." : "Publish your first theme, plugin, or template."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || Store;
            const color = typeColors[item.type] || "bg-surface-100 text-surface-600";
            return (
              <div key={item.id} className="rounded-xl border border-surface-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-surface-50 flex items-center justify-center">
                  {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" /> : <Icon className="h-12 w-12 text-surface-200" />}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{item.type}</span>
                    {tab === "mine" && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[item.status] || "bg-surface-100 text-surface-500"}`}>{item.status}</span>}
                    {parseFloat(item.price) === 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Free</span>}
                  </div>
                  <h3 className="text-sm font-bold text-surface-900 truncate">{item.name}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">by {item.authorName}</p>
                  {tab === "mine" && item.status === "REJECTED" && item.rejectionReason && (
                    <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-2 py-1 mt-2">{item.rejectionReason}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <span className="flex items-center gap-0.5"><Download className="h-3 w-3" /> {item.downloads}</span>
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3" /> {parseFloat(item.rating).toFixed(1)}</span>
                    </div>
                    {parseFloat(item.price) > 0 && <span className="text-sm font-bold text-brand-600">₦{parseFloat(item.price).toLocaleString()}</span>}
                  </div>
                  {tab === "browse" && item.status === "APPROVED" && (
                    parseFloat(item.price) === 0 ? (
                      <button
                        onClick={() => installItem(item.id)}
                        disabled={installId === item.id}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {installId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Install"}
                      </button>
                    ) : (
                      <button disabled className="mt-3 w-full rounded-lg border border-surface-200 text-surface-400 px-3 py-1.5 text-xs font-medium cursor-not-allowed">
                        Purchase coming soon
                      </button>
                    )
                  )}
                  {tab === "mine" && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={deleteId === item.id}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-surface-200 text-surface-500 hover:text-accent-600 hover:border-accent-200 px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      {deleteId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3" /> Delete</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
