"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { TrendingUp, TrendingDown, Eye, ShoppingCart, MousePointerClick, Users, Globe, Smartphone, Monitor, ArrowUpRight, Target, ShoppingBag } from "lucide-react";

const metrics = [
  { label: "Total Visitors", value: "12,849", change: "+18.2%", trend: "up", icon: Eye },
  { label: "Conversion Rate", value: "4.2%", change: "+2.1%", trend: "up", icon: Target },
  { label: "Add to Cart", value: "8.7%", change: "+1.3%", trend: "up", icon: ShoppingCart },
  { label: "Avg. Order Value", value: "₦24,500", change: "-3.2%", trend: "down", icon: ShoppingBag },
];

const topPages = [
  { page: "/", name: "Homepage", views: 5420, bounce: "32%", time: "1m 45s" },
  { page: "/products/ankara-maxi-dress", name: "Ankara Maxi Dress", views: 2310, bounce: "28%", time: "2m 12s" },
  { page: "/products/gold-hoop-earrings", name: "Gold Hoop Earrings", views: 1850, bounce: "35%", time: "1m 58s" },
  { page: "/collections/new-arrivals", name: "New Arrivals", views: 1420, bounce: "40%", time: "1m 22s" },
  { page: "/products/leather-crossbody-bag", name: "Leather Crossbody Bag", views: 1180, bounce: "25%", time: "2m 35s" },
];

const trafficSources = [
  { source: "WhatsApp", visitors: 4200, percentage: 33, color: "bg-green-500" },
  { source: "Instagram", visitors: 3100, percentage: 24, color: "bg-pink-500" },
  { source: "Direct", visitors: 2500, percentage: 19, color: "bg-blue-500" },
  { source: "Google Search", visitors: 1800, percentage: 14, color: "bg-amber-500" },
  { source: "Facebook", visitors: 850, percentage: 7, color: "bg-indigo-500" },
  { source: "TikTok", visitors: 399, percentage: 3, color: "bg-surface-800" },
];

const deviceBreakdown = [
  { device: "Mobile", percentage: 78, icon: Smartphone },
  { device: "Desktop", percentage: 18, icon: Monitor },
  { device: "Tablet", percentage: 4, icon: Monitor },
];

const topCities = [
  { city: "Lagos", orders: 89, revenue: "₦1.2M" },
  { city: "Abuja", orders: 34, revenue: "₦480K" },
  { city: "Port Harcourt", orders: 22, revenue: "₦310K" },
  { city: "Accra", orders: 18, revenue: "₦245K" },
  { city: "Ibadan", orders: 12, revenue: "₦168K" },
  { city: "Kano", orders: 11, revenue: "₦155K" },
];

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader title="Analytics" subtitle="Store performance overview" />
      <div className="p-6 space-y-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-2xl border border-surface-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600"><Icon className="h-5 w-5" /></div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${m.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                    {m.trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{m.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-surface-900 font-display">{m.value}</div>
                <div className="text-xs text-surface-500 mt-0.5">{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visitors Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-surface-900">Visitors & Sales</h3>
              <div className="flex gap-1">
                {["7d", "30d", "90d"].map((p) => (
                  <button key={p} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${p === "30d" ? "bg-brand-50 text-brand-700" : "text-surface-400 hover:bg-surface-50"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="relative h-56">
              {/* Visitor bars */}
              <div className="absolute inset-0 flex items-end gap-1">
                {[45, 62, 38, 75, 52, 88, 65, 92, 78, 55, 70, 85, 60, 95, 80, 48, 72, 90, 68, 82, 58, 76, 88, 72, 65, 92, 85, 78, 95, 82].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-0.5 justify-end" style={{ height: '100%' }}>
                    <div className="rounded-t-sm bg-brand-200" style={{ height: `${h * 0.3}%` }} />
                    <div className="rounded-t-sm bg-brand-500" style={{ height: `${h * 0.7}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs text-surface-500"><div className="h-2.5 w-2.5 rounded-sm bg-brand-500" />Visitors</div>
              <div className="flex items-center gap-2 text-xs text-surface-500"><div className="h-2.5 w-2.5 rounded-sm bg-brand-200" />Orders</div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-base font-bold text-surface-900 mb-5">Traffic Sources</h3>
            <div className="space-y-4">
              {trafficSources.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-surface-700">{s.source}</span>
                    <span className="text-xs text-surface-500">{s.visitors.toLocaleString()} ({s.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-100">
                    <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-base font-bold text-surface-900 mb-4">Top Pages</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="pb-2 text-left text-[10px] font-semibold uppercase text-surface-400">Page</th>
                  <th className="pb-2 text-right text-[10px] font-semibold uppercase text-surface-400">Views</th>
                  <th className="pb-2 text-right text-[10px] font-semibold uppercase text-surface-400 hidden sm:table-cell">Bounce</th>
                  <th className="pb-2 text-right text-[10px] font-semibold uppercase text-surface-400 hidden sm:table-cell">Avg. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {topPages.map((p) => (
                  <tr key={p.page} className="hover:bg-surface-50">
                    <td className="py-3">
                      <div className="text-sm font-medium text-surface-900">{p.name}</div>
                      <div className="text-[10px] text-surface-400">{p.page}</div>
                    </td>
                    <td className="py-3 text-right text-sm font-semibold text-surface-900">{p.views.toLocaleString()}</td>
                    <td className="py-3 text-right text-sm text-surface-500 hidden sm:table-cell">{p.bounce}</td>
                    <td className="py-3 text-right text-sm text-surface-500 hidden sm:table-cell">{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-6">
            {/* Device Breakdown */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">Devices</h3>
              <div className="space-y-3">
                {deviceBreakdown.map((d) => {
                  const Icon = d.icon;
                  return (
                    <div key={d.device} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-surface-400" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-surface-700">{d.device}</span>
                          <span className="text-sm font-bold text-surface-900">{d.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-100">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Cities */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">Top Cities</h3>
              <div className="space-y-3">
                {topCities.map((c, i) => (
                  <div key={c.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-surface-300 w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-surface-700">{c.city}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-surface-900">{c.revenue}</span>
                      <span className="text-[10px] text-surface-400 ml-2">{c.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
