"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface AnalyticsData {
  signups: { date: string; count: number }[];
  stores: { date: string; count: number }[];
  orders: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
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

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;
  if (!data) return <div className="p-6 text-surface-500">Failed to load analytics.</div>;

  const charts = [
    { title: "User Signups", subtitle: "Last 30 days", data: data.signups, dataKey: "count", label: "Signups" },
    { title: "Stores Created", subtitle: "Last 30 days", data: data.stores, dataKey: "count", label: "Stores" },
    { title: "Orders", subtitle: "Last 30 days", data: data.orders, dataKey: "count", label: "Orders" },
    { title: "Revenue", subtitle: "Last 30 days", data: data.revenue, dataKey: "amount", label: "Revenue", format: (v: number) => `₵${v.toLocaleString()}` },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Platform Analytics</h1>
        <p className="text-sm text-surface-500 mt-1">Platform-wide growth metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div key={chart.title} className="rounded-2xl border border-surface-200 bg-white p-6">
            <div className="mb-6">
              <h3 className="text-base font-bold text-surface-900">{chart.title}</h3>
              <p className="text-xs text-surface-500 mt-0.5">{chart.subtitle}</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={chart.format || undefined} />
                  <Tooltip formatter={(value) => [chart.format ? chart.format(Number(value)) : value, chart.label]} />
                  <Area type="monotone" dataKey={chart.dataKey} stroke="#1E293B" fill="#1E293B" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
