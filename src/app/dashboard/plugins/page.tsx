"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Search, Star, CheckCircle2, Loader2, Puzzle } from "lucide-react";

interface Plugin { id: string; name: string; slug: string; description?: string; icon?: string; category: string; author: string; isPremium: boolean; installs: number; }
interface StorePlugin { id: string; pluginId: string; isEnabled: boolean; }
interface PluginsData { plugins: Plugin[]; storePlugins: StorePlugin[]; }

export default function PluginsPage() {
  const { currentStore } = useStore();
  const [data, setData] = useState<PluginsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [installing, setInstalling] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentStore) return;
    const params = new URLSearchParams(); if (search) params.set("search", search);
    const res = await api.get<PluginsData>(`/api/stores/${currentStore.id}/plugins?${params}`);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentStore, search]);

  const togglePlugin = async (pluginId: string) => {
    if (!currentStore) return;
    setInstalling(pluginId);
    const installed = data?.storePlugins.find((sp) => sp.pluginId === pluginId);
    if (installed) {
      await api.patch(`/api/stores/${currentStore.id}/plugins`, { pluginId, isEnabled: !installed.isEnabled });
    } else {
      await api.post(`/api/stores/${currentStore.id}/plugins`, { pluginId });
    }
    await fetchData();
    setInstalling(null);
  };

  return (
    <>
      <DashboardHeader title="Plugins" subtitle="Extend your store's functionality" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-surface-400" />
          <input type="text" placeholder="Search plugins..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : !data?.plugins.length ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <Puzzle className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No plugins available yet</h3>
            <p className="text-sm text-surface-500">The plugin marketplace is coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.plugins.map((plugin) => {
              const sp = data.storePlugins.find((s) => s.pluginId === plugin.id);
              const isInstalled = !!sp?.isEnabled;
              return (
                <div key={plugin.id} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                      <Puzzle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-surface-900">{plugin.name}</h3>
                      <p className="text-[10px] text-surface-500">{plugin.author} · {plugin.category}</p>
                    </div>
                    {plugin.isPremium && <span className="text-[10px] font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Pro</span>}
                  </div>
                  <p className="text-xs text-surface-500 mb-4 line-clamp-2">{plugin.description || "No description"}</p>
                  <button onClick={() => togglePlugin(plugin.id)} disabled={installing === plugin.id} className={`w-full text-xs py-2 px-3 rounded-xl font-semibold transition-colors ${isInstalled ? "bg-green-50 text-green-700 border border-green-200" : "btn-primary"}`}>
                    {installing === plugin.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : isInstalled ? <><CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />Installed</> : "Install"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
