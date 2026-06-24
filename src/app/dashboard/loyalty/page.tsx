"use client";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Crown, Loader2, Save, Users, Gift, Star, Settings } from "lucide-react";

interface LoyaltyProgram {
  id: string; enabled: boolean; pointsPerCurrency: number; currencyPerPoint: number;
  redemptionRate: number; minRedeemPoints: number; welcomePoints: number;
  referralPoints: number; reviewPoints: number;
}

interface Stats { totalMembers: number; totalPointsIssued: number; availablePoints: number; redeemedPoints: number; }

export default function LoyaltyPage() {
  const { currentStore } = useSite();
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalPointsIssued: 0, availablePoints: 0, redeemedPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(false);

  const fetchProgram = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ program: LoyaltyProgram; stats: Stats }>(`/api/sites/${currentStore.id}/loyalty`);
    if (res.success && res.data) { setProgram(res.data.program); setStats(res.data.stats); }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchProgram(); }, [fetchProgram]);

  const update = (field: keyof LoyaltyProgram, value: number | boolean) => {
    if (!program) return;
    setProgram({ ...program, [field]: value }); setEdited(true);
  };

  const save = async () => {
    if (!currentStore || !program) return;
    setSaving(true);
    const { id, ...data } = program;
    await api.patch(`/api/sites/${currentStore.id}/loyalty`, data);
    setSaving(false); setEdited(false);
  };

  if (!currentStore || loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  if (!program) return null;

  const statCards = [
    { label: "Members", value: stats.totalMembers, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Points Issued", value: stats.totalPointsIssued.toLocaleString(), icon: Star, color: "bg-amber-50 text-amber-600" },
    { label: "Available Points", value: stats.availablePoints.toLocaleString(), icon: Gift, color: "bg-green-50 text-green-600" },
    { label: "Redeemed", value: stats.redeemedPoints.toLocaleString(), icon: Crown, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Loyalty Program</h1><p className="text-sm text-surface-500 mt-1">Reward customers with points for purchases and engagement</p></div>
        {edited && <button onClick={save} disabled={saving} className="btn-primary text-sm py-2.5 px-4">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}</button>}
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

      <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-surface-500" /><h3 className="text-lg font-bold text-surface-900">Program Settings</h3></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={program.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-600" />
            <span className="text-sm font-medium text-surface-700">{program.enabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Points per currency unit", field: "pointsPerCurrency" as const, step: "0.1" },
            { label: "Currency units per point", field: "currencyPerPoint" as const, step: "1" },
            { label: "Redemption rate", field: "redemptionRate" as const, step: "0.001" },
            { label: "Min points to redeem", field: "minRedeemPoints" as const, step: "1" },
            { label: "Welcome bonus points", field: "welcomePoints" as const, step: "1" },
            { label: "Referral points", field: "referralPoints" as const, step: "1" },
            { label: "Review points", field: "reviewPoints" as const, step: "1" },
          ].map(({ label, field, step }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>
              <input type="number" value={program[field] as number} step={step} min={0}
                onChange={(e) => update(field, parseFloat(e.target.value) || 0)}
                className="input-field py-2.5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
