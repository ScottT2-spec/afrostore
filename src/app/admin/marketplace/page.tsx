"use client";
import { Loader2, X } from "lucide-react";
import { CheckCircle2, Palette, ShoppingBag, XCircle } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

interface MarketplaceItem {
  id: string; type: string; name: string; description: string | null;
  price: string; currency: string; authorName: string; status: string;
  rejectionReason: string | null; downloads: number; createdAt: string;
  theme: { id: string; name: string; slug: string; thumbnail: string | null; category: string } | null;
}

const TABS = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED", "ALL"];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  SUSPENDED: "bg-surface-100 text-surface-500",
};

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await api.get<MarketplaceItem[]>(`/api/admin/marketplace?status=${tab}`);
    if (res.success && res.data) setItems(res.data);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const review = async (id: string, status: string, rejectionReason?: string) => {
    setBusyId(id);
    const res = await api.patch(`/api/admin/marketplace/${id}`, { status, rejectionReason });
    setBusyId(null);
    if (!res.success) { alert(res.error || "Failed to update"); return; }
    setRejectingId(null); setRejectReason("");
    setItems((prev) => prev.filter((i) => i.id !== id || tab === "ALL"));
    fetchItems();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" /> Marketplace Review
        </h1>
        <p className="text-sm text-surface-500 mt-1">Approve, reject, or suspend merchant-submitted marketplace listings</p>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-surface-500"}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-surface-400" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-surface-200">
          <ShoppingBag className="h-10 w-10 text-surface-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-surface-900 mb-1">Nothing here</h3>
          <p className="text-sm text-surface-500">No {tab.toLowerCase()} submissions right now.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white divide-y divide-surface-100">
          {items.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-surface-100 flex items-center justify-center overflow-hidden shrink-0">
                  {item.theme?.thumbnail ? (
                    <img src={item.theme.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Palette className="h-6 w-6 text-surface-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-surface-900">{item.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{item.status}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">{item.type}</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">by {item.authorName} · {new Date(item.createdAt).toLocaleDateString()}</p>
                  {item.description && <p className="text-sm text-surface-600 mt-2 line-clamp-2">{item.description}</p>}
                  {item.status === "REJECTED" && item.rejectionReason && (
                    <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-1.5">Rejected: {item.rejectionReason}</p>
                  )}
                </div>

                {item.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => review(item.id, "APPROVED")}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {busyId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Approve
                    </button>
                    <button
                      onClick={() => { setRejectingId(item.id); setRejectReason(""); }}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1.5 rounded-lg border border-surface-200 text-surface-600 px-3 py-1.5 text-xs font-medium hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </div>
                )}
                {item.status === "APPROVED" && (
                  <button
                    onClick={() => review(item.id, "SUSPENDED")}
                    disabled={busyId === item.id}
                    className="shrink-0 rounded-lg border border-surface-200 text-surface-600 px-3 py-1.5 text-xs font-medium hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {busyId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Suspend"}
                  </button>
                )}
                {(item.status === "REJECTED" || item.status === "SUSPENDED") && (
                  <button
                    onClick={() => review(item.id, "APPROVED")}
                    disabled={busyId === item.id}
                    className="shrink-0 rounded-lg border border-surface-200 text-surface-600 px-3 py-1.5 text-xs font-medium hover:border-green-200 hover:text-green-700 transition-colors disabled:opacity-50"
                  >
                    {busyId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Re-approve"}
                  </button>
                )}
              </div>

              {rejectingId === item.id && (
                <div className="mt-3 pl-[72px] flex items-start gap-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (shown to the submitter)"
                    rows={2}
                    className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => review(item.id, "REJECTED", rejectReason)}
                    disabled={!rejectReason.trim() || busyId === item.id}
                    className="rounded-lg bg-red-600 text-white px-3 py-2 text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button onClick={() => setRejectingId(null)} className="text-surface-400 hover:text-surface-600 p-2"><X className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
