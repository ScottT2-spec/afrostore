"use client";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { ShoppingCart, Loader2, DollarSign, Clock, CheckCircle2, XCircle, Mail } from "lucide-react";

interface AbandonedCartItem {
  id: string; email: string | null; phone: string | null; sessionId: string | null;
  items: unknown; totalAmount: number; currency: string; status: string;
  remindersSent: number; lastReminderAt: string | null; recoveredAt: string | null;
  createdAt: string; customer: { id: string; firstName: string; lastName: string; email: string } | null;
}

interface CartSummary {
  total: number; totalValue: number;
  byStatus: Record<string, { count: number; value: number }>;
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-amber-50 text-amber-700", REMINDED: "bg-blue-50 text-blue-700",
  RECOVERED: "bg-green-50 text-green-700", EXPIRED: "bg-surface-100 text-surface-500",
};

export default function AbandonedCartsPage() {
  const { currentStore } = useSite();
  const [carts, setCarts] = useState<AbandonedCartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>({ total: 0, totalValue: 0, byStatus: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCarts = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await api.get<{ carts: AbandonedCartItem[]; summary: CartSummary }>(`/api/sites/${currentStore.id}/abandoned-carts?${params}`);
    if (res.success && res.data) { setCarts(res.data.carts || []); setSummary(res.data.summary); }
    setLoading(false);
  }, [currentStore, statusFilter]);

  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  const statCards = [
    { label: "Total Abandoned", value: summary.total, sub: `${summary.byStatus?.ACTIVE?.count || 0} active`, icon: ShoppingCart, color: "bg-amber-50 text-amber-600" },
    { label: "Lost Revenue", value: `$${summary.totalValue.toLocaleString()}`, sub: "potential recovery", icon: DollarSign, color: "bg-red-50 text-red-600" },
    { label: "Recovered", value: summary.byStatus?.RECOVERED?.count || 0, sub: `$${(summary.byStatus?.RECOVERED?.value || 0).toLocaleString()}`, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
    { label: "Recovery Rate", value: summary.total > 0 ? `${((summary.byStatus?.RECOVERED?.count || 0) / summary.total * 100).toFixed(1)}%` : "0%", sub: "of all carts", icon: Clock, color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900 font-display">Abandoned Carts</h1><p className="text-sm text-surface-500 mt-1">Recover lost sales from abandoned checkouts</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-surface-200 bg-white p-4">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <p className="text-lg font-bold text-surface-900 mt-2">{s.value}</p>
            <p className="text-xs text-surface-500">{s.label}</p>
            <p className="text-[10px] text-surface-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {["", "ACTIVE", "REMINDED", "RECOVERED", "EXPIRED"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${statusFilter === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500 hover:bg-surface-50"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : carts.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><ShoppingCart className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No abandoned carts</h3>
          <p className="text-sm text-surface-500">Abandoned checkout data will appear here automatically.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {carts.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><ShoppingCart className="h-5 w-5 text-amber-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-surface-900">{c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : c.email || "Anonymous"}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[c.status]}`}>{c.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                  <span className="font-semibold text-surface-700">${c.totalAmount.toFixed(2)} {c.currency}</span>
                  {c.email && <span><Mail className="h-3 w-3 inline" /> {c.email}</span>}
                  <span>{c.remindersSent} reminders sent</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-surface-900">${c.totalAmount.toFixed(2)}</p>
                <p className="text-[10px] text-surface-400">{new Date(c.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
