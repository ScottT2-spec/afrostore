"use client";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Link2, Loader2, Save, Users, DollarSign, MousePointerClick, ShoppingCart, Settings } from "lucide-react";

interface ReferralProgram {
  id: string; enabled: boolean; commissionType: string; commissionValue: number;
  cookieDays: number; minPayoutAmount: number; autoApprove: boolean;
  welcomeMessage: string | null; termsText: string | null;
}

interface AffiliateItem {
  id: string; code: string; status: string;
  totalClicks: number; totalOrders: number; totalEarnings: number; pendingEarnings: number;
  customer: { id: string; firstName: string; lastName: string; email: string };
  _count: { referrals: number };
}

interface Stats { totalAffiliates: number; totalClicks: number; totalOrders: number; totalEarnings: number; pendingEarnings: number; }

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700", APPROVED: "bg-green-50 text-green-700",
  SUSPENDED: "bg-red-50 text-red-700", REJECTED: "bg-surface-100 text-surface-500",
};

export default function ReferralsPage() {
  const { currentStore } = useSite();
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAffiliates: 0, totalClicks: 0, totalOrders: 0, totalEarnings: 0, pendingEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ program: ReferralProgram; affiliates: AffiliateItem[]; stats: Stats }>(`/api/sites/${currentStore.id}/referrals`);
    if (res.success && res.data) { setProgram(res.data.program); setAffiliates(res.data.affiliates || []); setStats(res.data.stats); }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const update = (field: keyof ReferralProgram, value: number | boolean | string | null) => {
    if (!program) return;
    setProgram({ ...program, [field]: value }); setEdited(true);
  };

  const save = async () => {
    if (!currentStore || !program) return;
    setSaving(true);
    const { id, ...data } = program;
    await api.patch(`/api/sites/${currentStore.id}/referrals`, data);
    setSaving(false); setEdited(false);
  };

  if (!currentStore || loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  if (!program) return null;

  const statCards = [
    { label: "Affiliates", value: stats.totalAffiliates, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Clicks", value: stats.totalClicks.toLocaleString(), icon: MousePointerClick, color: "bg-purple-50 text-purple-600" },
    { label: "Referred Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-green-50 text-green-600" },
    { label: "Total Earnings", value: `$${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Referral Program</h1><p className="text-sm text-surface-500 mt-1">Grow through affiliate partnerships and referral commissions</p></div>
        {edited && <button onClick={save} disabled={saving} className="btn-primary text-sm py-2.5 px-4">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}</button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-surface-200 bg-white p-4">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <p className="text-lg font-bold text-surface-900 mt-2">{s.value}</p>
            <p className="text-xs text-surface-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Program Settings */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-surface-500" /><h3 className="text-lg font-bold text-surface-900">Settings</h3></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={program.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-600" />
            <span className="text-sm font-medium text-surface-700">{program.enabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Commission Type</label>
            <select value={program.commissionType} onChange={(e) => update("commissionType", e.target.value)} className="input-field py-2.5 w-full">
              <option value="PERCENTAGE">Percentage</option><option value="FLAT">Flat Amount</option>
            </select></div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Commission Value</label>
            <input type="number" value={program.commissionValue} min={0} onChange={(e) => update("commissionValue", parseFloat(e.target.value) || 0)} className="input-field py-2.5 w-full" /></div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Cookie Days</label>
            <input type="number" value={program.cookieDays} min={1} onChange={(e) => update("cookieDays", parseInt(e.target.value) || 30)} className="input-field py-2.5 w-full" /></div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Min Payout</label>
            <input type="number" value={program.minPayoutAmount} min={0} onChange={(e) => update("minPayoutAmount", parseFloat(e.target.value) || 0)} className="input-field py-2.5 w-full" /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={program.autoApprove} onChange={(e) => update("autoApprove", e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-600" />
          <span className="text-sm text-surface-700">Auto-approve new affiliates</span>
        </label>
      </div>

      {/* Affiliates */}
      <div>
        <h3 className="text-lg font-bold text-surface-900 mb-3">Top Affiliates</h3>
        {affiliates.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white text-center py-12 px-6">
            <Link2 className="h-8 w-8 text-surface-300 mx-auto mb-2" />
            <p className="text-sm text-surface-500">No affiliates yet. They'll appear once customers sign up.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
            {affiliates.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600">{a.customer.firstName[0]}{a.customer.lastName[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-surface-900">{a.customer.firstName} {a.customer.lastName}</span>
                    <code className="text-xs bg-surface-100 px-1.5 py-0.5 rounded font-mono">{a.code}</code>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[a.status]}`}>{a.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-400">
                    <span>{a.totalClicks} clicks</span><span>{a.totalOrders} orders</span><span>${a.totalEarnings.toFixed(2)} earned</span><span>${a.pendingEarnings.toFixed(2)} pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
