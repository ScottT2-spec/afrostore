"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Eye, CheckCircle2, Star, Loader2, Palette } from "lucide-react";

interface Theme { id: string; name: string; slug: string; description?: string; thumbnail?: string; category: string; industry?: string; isPremium: boolean; isFeatured: boolean; isInstalled?: boolean; isActive?: boolean; }
interface ThemesData { themes: Theme[]; activeThemeId: string | null; }

export default function ThemesPage() {
  const { currentStore } = useStore();
  const [data, setData] = useState<ThemesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  const fetch = async () => {
    if (!currentStore) return;
    const res = await api.get<ThemesData>(`/api/stores/${currentStore.id}/themes`);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [currentStore]);

  const installTheme = async (themeId: string) => {
    if (!currentStore) return;
    setInstalling(themeId);
    await api.post(`/api/stores/${currentStore.id}/themes`, { themeId, activate: true });
    await fetch();
    setInstalling(null);
  };

  const activeThemeId = data?.activeThemeId;

  return (
    <>
      <DashboardHeader title="Themes" subtitle="Customize your store's look" />
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : !data?.themes.length ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <Palette className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No themes available yet</h3>
            <p className="text-sm text-surface-500">Themes will be added to the marketplace soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.themes.map((theme) => {
              const isActive = activeThemeId === theme.id;
              return (
                <div key={theme.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center">
                    {theme.thumbnail ? <img src={theme.thumbnail} alt={theme.name} className="h-full w-full object-cover" /> : <Palette className="h-10 w-10 text-surface-300" />}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-surface-900">{theme.name}</h3>
                      {theme.isPremium && <span className="text-[10px] font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Premium</span>}
                    </div>
                    <p className="text-xs text-surface-500 mb-3">{theme.category}{theme.industry ? ` · ${theme.industry}` : ""}</p>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />Active</span>
                    ) : (
                      <button onClick={() => installTheme(theme.id)} disabled={installing === theme.id} className="btn-primary text-xs py-1.5 px-3 w-full">
                        {installing === theme.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
