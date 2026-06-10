"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Eye, CheckCircle2, Star, Sparkles, Crown, Palette } from "lucide-react";

const themes = [
  { id: "1", name: "Lagos Fashion", category: "Fashion & Apparel", gradient: "from-purple-500 via-pink-500 to-orange-400", active: true, rating: 4.9, premium: false },
  { id: "2", name: "Nairobi Fresh", category: "Food & Restaurant", gradient: "from-orange-500 via-red-500 to-pink-500", active: false, rating: 4.8, premium: false },
  { id: "3", name: "Accra Beauty", category: "Beauty & Skincare", gradient: "from-rose-400 via-fuchsia-500 to-indigo-500", active: false, rating: 4.9, premium: true },
  { id: "4", name: "Abuja Tech", category: "Electronics", gradient: "from-blue-500 via-cyan-500 to-teal-400", active: false, rating: 4.7, premium: false },
  { id: "5", name: "Kigali Minimal", category: "General Store", gradient: "from-emerald-500 via-green-500 to-teal-400", active: false, rating: 4.8, premium: false },
  { id: "6", name: "Dakar Luxe", category: "Luxury & Jewelry", gradient: "from-amber-400 via-yellow-500 to-orange-400", active: false, rating: 5.0, premium: true },
  { id: "7", name: "Cape Town Modern", category: "General Store", gradient: "from-slate-500 via-zinc-500 to-stone-500", active: false, rating: 4.6, premium: false },
  { id: "8", name: "Kampala Market", category: "Marketplace", gradient: "from-lime-500 via-green-500 to-emerald-500", active: false, rating: 4.7, premium: true },
  { id: "9", name: "Dar Artisan", category: "Handmade & Craft", gradient: "from-amber-600 via-orange-500 to-red-500", active: false, rating: 4.8, premium: false },
];

export default function ThemesPage() {
  return (
    <>
      <DashboardHeader title="Themes" subtitle="Customize your store's look and feel" />
      <div className="p-6 space-y-6">
        {/* AI Theme Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Generate a Custom Theme with AI</h3>
            <p className="text-sm text-white/80 mt-0.5">Describe your ideal look and AI creates a complete theme — colors, fonts, layout, everything.</p>
          </div>
          <button className="btn-secondary bg-white text-brand-700 border-white hover:bg-brand-50 text-sm flex-shrink-0">
            <Sparkles className="h-4 w-4" />
            Generate Theme
          </button>
        </div>

        {/* Current Theme */}
        <div className="rounded-2xl border-2 border-brand-500 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-brand-500" />
            <h3 className="text-base font-bold text-surface-900">Active Theme</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-20 w-32 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
            <div>
              <h4 className="text-lg font-bold text-surface-900">Lagos Fashion</h4>
              <p className="text-sm text-surface-500">Fashion & Apparel</p>
              <div className="flex items-center gap-2 mt-2">
                <button className="btn-primary text-xs py-1.5 px-3"><Palette className="h-3.5 w-3.5" />Customize</button>
                <button className="btn-ghost text-xs py-1.5 px-3"><Eye className="h-3.5 w-3.5" />Preview</button>
              </div>
            </div>
          </div>
        </div>

        {/* All Themes */}
        <div>
          <h3 className="text-base font-bold text-surface-900 mb-4">All Themes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.filter(t => !t.active).map((theme) => (
              <div key={theme.id} className="group rounded-2xl border border-surface-200 bg-white overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                  <div className="absolute inset-4 flex flex-col">
                    <div className="flex justify-between"><div className="h-4 w-16 rounded bg-white/30" /><div className="flex gap-1"><div className="h-4 w-8 rounded bg-white/20" /><div className="h-4 w-8 rounded bg-white/20" /></div></div>
                    <div className="flex-1 flex gap-2 mt-3"><div className="flex-1 space-y-1.5"><div className="h-3 w-3/4 rounded bg-white/30" /><div className="h-2 w-1/2 rounded bg-white/20" /><div className="mt-2 h-6 w-20 rounded-lg bg-white/40" /></div><div className="w-1/2 rounded-lg bg-white/20" /></div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-surface-900 hover:bg-surface-50"><Eye className="h-3.5 w-3.5 inline mr-1.5" />Preview</button>
                    <button className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700">Apply Theme</button>
                  </div>
                  {theme.premium && <div className="absolute top-3 right-3 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1"><Crown className="h-3 w-3" />Premium</div>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div><h4 className="font-bold text-surface-900">{theme.name}</h4><p className="text-xs text-surface-500">{theme.category}</p></div>
                    <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="text-xs font-semibold text-surface-700">{theme.rating}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
