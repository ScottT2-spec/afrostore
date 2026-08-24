"use client";
import { Loader2 } from "lucide-react";
import { Activity, DollarSign, ShoppingCart, Store, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  activeStores: number;
  totalRevenue: number;
  recentSignups: { id: string; firstName: string; lastName: string; email: string; role: string; createdAt: string }[];
  recentStores: { id: string; name: string; slug: string; plan: string; status: string; createdAt: string; owner: { firstName: string; lastName: string } }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>("/api/admin/stats").then((res) => {
      if (res.success && res.data) setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
      </div>
    );
  }

  if (!stats) return <div className="p-6 text-surface-500">Failed to load stats.</div>;

  const cards = [
    { label: "Revenue (GMV)", value: `₵${Number(stats.totalRevenue).toLocaleString()}`, icon: DollarSign, color: "brand" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
    { label: "Total Stores", value: stats.totalStores, icon: Store, color: "purple" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "accent" },
    { label: "Active Stores", value: stats.activeStores, icon: Activity, color: "green" },
  ];

  const accentBorder: Record<string, string> = {
    brand: "",
    blue: "border-l-blue-500",
    purple: "border-l-purple-500",
    accent: "border-l-accent-500",
    green: "border-l-green-500",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Admin Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const isFeatured = c.color === "brand";
          return (
            <div
              key={c.label}
              className={
                isFeatured
                  ? "rounded-2xl bg-brand-900 p-7 text-white transition-all hover:shadow-lg relative overflow-hidden"
                  : `rounded-2xl border border-surface-200 border-l-4 ${accentBorder[c.color]} bg-white p-7 transition-all hover:shadow-md`
              }
            >
              {isFeatured && (
                <Icon className="absolute -right-4 -bottom-4 h-28 w-28 text-white/5" strokeWidth={1} />
              )}
              <div className="flex items-center justify-between mb-4 relative">
                <span className={`text-xs font-bold uppercase tracking-wider ${isFeatured ? "text-white/60" : "text-surface-400"}`}>
                  {c.label}
                </span>
              </div>
              <div className={`text-5xl font-black tracking-tight font-display relative ${isFeatured ? "text-white" : "text-surface-900"}`}>
                {c.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4">Recent Signups</h3>
          <div className="space-y-3">
            {stats.recentSignups.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-surface-500">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-accent-100 text-accent-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                  <p className="text-[10px] text-surface-400 mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {stats.recentSignups.length === 0 && <p className="text-sm text-surface-500 text-center py-4">No users yet</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4">Recent Stores</h3>
          <div className="space-y-3">
            {stats.recentStores.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">{s.name}</p>
                    <p className="text-[10px] text-surface-500">by {s.owner.firstName} {s.owner.lastName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {s.status}
                  </span>
                  <p className="text-[10px] text-surface-400 mt-1">{s.plan}</p>
                </div>
              </div>
            ))}
            {stats.recentStores.length === 0 && <p className="text-sm text-surface-500 text-center py-4">No stores yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
