"use client";
import { Loader2 } from "lucide-react";
import { DollarSign, ShoppingCart, Store, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface AnalyticsData {
  signups: { date: string; count: number }[];
  stores: { date: string; count: number }[];
  sites: { date: string; count: number }[];
  orders: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  totals?: { users: number; stores: number; sites: number; orders: number; revenue: number };
}

/* ───────── Shared chrome: fonts + design tokens (Adire system) ───────── */
function AnalyticsChrome() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
      />
      <style>{`
        :root {
          --co-ink: #14132f;
          --co-indigo: #2f2a7a;
          --co-indigo-deep: #1e1a57;
          --co-indigo-soft: #edecf9;
          --co-marigold: #e8a33d;
          --co-marigold-deep: #c97f1e;
          --co-marigold-soft: #fbeed9;
          --co-chalk: #f5f4f9;
          --co-coral: #e15241;
          --co-coral-soft: #fdeceb;
          --co-green: #1f9d63;
          --co-green-soft: #e7f6ee;
          --co-line: #e4e2ed;
        }
        .co-font-display { font-family: 'Fraunces', Georgia, serif; }
        .co-font-mono { font-family: 'Space Mono', ui-monospace, SFMono-Regular, monospace; }
        .co-font-body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>
    </>
  );
}

// Thin out X-axis ticks so labels never collide, regardless of range length —
// always shows the first, the last, and evenly spaced points between.
function tickInterval(length: number, maxTicks = 6) {
  if (length <= maxTicks) return 0;
  return Math.ceil(length / maxTicks) - 1;
}

function ChartTooltip({ active, payload, label, format }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-xl border border-[var(--co-line)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-400">{label}</p>
      <p className="co-font-mono text-sm font-bold text-[var(--co-ink)]">
        {format ? format(Number(value)) : Number(value).toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsData>("/api/admin/analytics").then((res) => {
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh] co-font-body">
        <AnalyticsChrome />
        <Loader2 className="h-8 w-8 animate-spin text-[var(--co-indigo)]" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="p-6 text-surface-500 co-font-body">
        <AnalyticsChrome />
        Failed to load analytics.
      </div>
    );
  }

  // Compute totals from chart data
  const totalSignups = data.totals?.users ?? data.signups.reduce((s, d) => s + d.count, 0);
  const totalStores = data.totals?.sites ?? (data.sites || data.stores).reduce((s: number, d: { count: number }) => s + d.count, 0);
  const totalOrders = data.totals?.orders ?? data.orders.reduce((s, d) => s + d.count, 0);
  const totalRevenue = data.totals?.revenue ?? data.revenue.reduce((s, d) => s + d.amount, 0);

  const summaryCards = [
    { label: "Total Users", value: totalSignups.toLocaleString(), icon: Users },
    { label: "Total Stores", value: totalStores.toLocaleString(), icon: Store },
    { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingCart },
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign },
  ];

  const charts: { title: string; subtitle: string; data: Record<string, string | number>[]; dataKey: string; label: string; color: string; format?: (v: number) => string }[] = [
    { title: "User Signups", subtitle: "Last 30 days", data: data.signups, dataKey: "count", label: "Signups", color: "var(--co-indigo)" },
    { title: "Stores Created", subtitle: "Last 30 days", data: data.sites || data.stores, dataKey: "count", label: "Stores", color: "var(--co-marigold-deep)" },
    { title: "Orders", subtitle: "Last 30 days", data: data.orders, dataKey: "count", label: "Orders", color: "var(--co-green)" },
    { title: "Revenue", subtitle: "Last 30 days", data: data.revenue, dataKey: "amount", label: "Revenue", color: "var(--co-coral)", format: (v: number) => `₦${v.toLocaleString()}` },
  ];

  return (
    <div className="p-6 space-y-6 co-font-body bg-[var(--co-chalk)] min-h-screen">
      <AnalyticsChrome />
      <div>
        <h1 className="co-font-display text-2xl font-bold text-[var(--co-ink)]">Platform Analytics</h1>
        <p className="text-sm text-surface-500 mt-1">Platform-wide growth metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-[var(--co-line)] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--co-indigo-soft)] text-[var(--co-indigo)] mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="co-font-display co-font-mono text-2xl font-bold text-[var(--co-ink)]">{card.value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div key={chart.title} className="rounded-2xl border border-[var(--co-line)] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="co-font-display text-base font-bold text-[var(--co-ink)]">{chart.title}</h3>
                <p className="text-xs text-surface-500 mt-0.5">{chart.subtitle}</p>
              </div>
              <span
                className="co-font-mono text-lg font-bold"
                style={{ color: chart.color }}
              >
                {chart.format
                  ? chart.format(chart.data.reduce((s, d) => s + Number(d[chart.dataKey]), 0))
                  : chart.data.reduce((s, d) => s + Number(d[chart.dataKey]), 0).toLocaleString()}
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`fill-${chart.dataKey}-${chart.title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="var(--co-line)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#8a8894" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--co-line)" }}
                    interval={tickInterval(chart.data.length)}
                    minTickGap={24}
                    padding={{ left: 8, right: 8 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8a8894" }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={chart.format || ((v: number) => v.toLocaleString())}
                  />
                  <Tooltip content={<ChartTooltip format={chart.format} />} cursor={{ stroke: "var(--co-line)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey={chart.dataKey}
                    stroke={chart.color}
                    strokeWidth={2}
                    fill={`url(#fill-${chart.dataKey}-${chart.title})`}
                    activeDot={{ r: 4, fill: chart.color, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
