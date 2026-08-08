"use client";
import { Loader2 } from "lucide-react";
import { BarChart3, Eye, MousePointerClick, ShoppingCart, TrendingUp, Users } from "@/components/icons/FilledIcons";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useState, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSiteApi } from "@/hooks/useApiData";
import { useSite } from "@/context/StoreContext";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
  summary: {
    pageViews: number;
    uniqueVisitors: number;
    addToCarts: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
  };
  topPages: Array<{ page: string; views: number }>;
  topProducts: Array<{ productId: string; name: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  timeline: Array<{ date: string; event: string; count: number }>;
}

const SERIES = [
  { key: "page_view", label: "Page Views", color: "#1B2B4B" },
  { key: "add_to_cart", label: "Add to Carts", color: "#3d6499" },
  { key: "purchase", label: "Purchases", color: "#F5B731" },
] as const;

function buildTrendSeries(timeline: AnalyticsData["timeline"] | undefined) {
  if (!timeline || timeline.length === 0) return [];
  const byDate = new Map<string, Record<string, number>>();
  for (const row of timeline) {
    const d = row.date.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, {});
    byDate.get(d)![row.event] = row.count;
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      page_view: counts.page_view || 0,
      add_to_cart: counts.add_to_cart || 0,
      purchase: counts.purchase || 0,
    }));
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-lg px-4 py-3 min-w-[160px]">
      <p className="text-xs font-semibold text-surface-500 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-surface-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {SERIES.find((s) => s.key === p.dataKey)?.label}
            </span>
            <span className="text-xs font-bold text-surface-900">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { currentStore } = useSite();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data, loading } = useSiteApi<AnalyticsData>(`/analytics?period=${period}`, [period]);
  const currency = currentStore?.currency || "NGN";

  const summary = data?.summary;
  const trendData = useMemo(() => buildTrendSeries(data?.timeline), [data?.timeline]);
  const periodLabel = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" }[period];

  const statCards = [
    { label: "Page Views", value: summary?.pageViews || 0, icon: Eye, color: "blue" },
    { label: "Unique Visitors", value: summary?.uniqueVisitors || 0, icon: Users, color: "purple" },
    { label: "Add to Carts", value: summary?.addToCarts || 0, icon: ShoppingCart, color: "accent" },
    { label: "Purchases", value: summary?.purchases || 0, icon: MousePointerClick, color: "brand" },
  ];

  return (
    <>
      <DashboardHeader title="Analytics" subtitle={`${periodLabel} performance`} />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <div className="inline-flex items-center rounded-xl border border-surface-200 bg-white p-1 gap-1">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  period === p ? "bg-brand-600 text-white shadow-sm" : "text-surface-500 hover:text-surface-700 hover:bg-surface-50"
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : !summary ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <BarChart3 className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No analytics data yet</h3>
            <p className="text-sm text-surface-500">Analytics will appear once your store gets traffic.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  brand: "bg-brand-50 text-brand-600",
                  blue: "bg-blue-50 text-blue-600",
                  purple: "bg-purple-50 text-purple-600",
                  accent: "bg-accent-50 text-accent-600",
                };
                return (
                  <div key={stat.label} className="rounded-2xl border border-surface-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-surface-900 font-display">{stat.value.toLocaleString()}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Trends */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-surface-900">Traffic & Conversion Trends</h3>
              </div>
              <p className="text-xs text-surface-400 mb-4">Page views, add-to-carts, and purchases over time</p>
              {trendData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        {SERIES.map((s) => (
                          <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8892A6" }} axisLine={{ stroke: "#EDF0F5" }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#8892A6" }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                      <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#B8C9E0", strokeWidth: 1, strokeDasharray: "3 3" }} />
                      {SERIES.map((s) => (
                        <Area
                          key={s.key}
                          type="monotone"
                          dataKey={s.key}
                          name={s.label}
                          stroke={s.color}
                          strokeWidth={2.5}
                          fill={`url(#fill-${s.key})`}
                          activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-2 pt-3 border-t border-surface-100">
                    {SERIES.map((s) => (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs font-medium text-surface-600">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <TrendingUp className="h-10 w-10 text-surface-200 mb-3" />
                  <p className="text-sm text-surface-500">No trend data for this period yet.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Conversion</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-500">Conversion Rate</span>
                    <span className="text-lg font-bold text-brand-600">{(summary.conversionRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-500">Revenue</span>
                    <span className="text-lg font-bold text-surface-900">{formatCurrency(summary.revenue || 0, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Top Pages</h3>
                {data?.topPages && data.topPages.length > 0 ? (
                  <div className="space-y-3">
                    {data.topPages.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-surface-700 truncate">{p.page}</span>
                        <span className="text-xs font-semibold text-surface-500">{p.views}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No page view data yet.</p>
                )}
              </div>

              {/* Top Products */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Top Products</h3>
                {data?.topProducts && data.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {data.topProducts.slice(0, 5).map((p) => (
                      <div key={p.productId} className="flex items-center justify-between">
                        <span className="text-sm text-surface-700 truncate">{p.name}</span>
                        <span className="text-xs font-semibold text-surface-500">{p.views} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No product view data yet.</p>
                )}
              </div>

              {/* Devices */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Devices</h3>
                {data?.deviceBreakdown && data.deviceBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {data.deviceBreakdown.sort((a, b) => b.count - a.count).map((d) => (
                      <div key={d.device} className="flex items-center justify-between">
                        <span className="text-sm text-surface-700 capitalize">{d.device}</span>
                        <span className="text-xs font-semibold text-surface-500">{d.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No device data yet.</p>
                )}
              </div>

              {/* Traffic Sources */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Traffic Sources</h3>
                {data?.sourceBreakdown && data.sourceBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {data.sourceBreakdown.sort((a, b) => b.count - a.count).slice(0, 5).map((s) => (
                      <div key={s.source} className="flex items-center justify-between">
                        <span className="text-sm text-surface-700 capitalize truncate">{s.source}</span>
                        <span className="text-xs font-semibold text-surface-500">{s.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No traffic source data yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
