"use client";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Zap, Plus, Loader2, Trash2, Pencil, Clock, Eye, EyeOff, Package } from "lucide-react";

interface FlashSaleItem {
  id: string; name: string; description: string | null;
  discountType: string; discountValue: number; startsAt: string; endsAt: string;
  isActive: boolean; maxUses: number | null; usedCount: number; createdAt: string;
  _count?: { products: number };
}

export default function FlashSalesPage() {
  const { currentStore } = useSite();
  const [sales, setSales] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const fetchSales = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ sales: FlashSaleItem[] }>(`/api/sites/${currentStore.id}/flash-sales`);
    if (res.success && res.data) setSales(res.data.sales || []);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const resetForm = () => { setName(""); setDiscountType("PERCENTAGE"); setDiscountValue(""); setStartsAt(""); setEndsAt(""); setEditingId(null); };

  const openEdit = (s: FlashSaleItem) => {
    setName(s.name); setDiscountType(s.discountType); setDiscountValue(s.discountValue.toString());
    setStartsAt(s.startsAt.slice(0, 16)); setEndsAt(s.endsAt.slice(0, 16));
    setEditingId(s.id); setShowEditor(true);
  };

  const saveSale = async () => {
    if (!currentStore || !name.trim() || !discountValue || !startsAt || !endsAt) return;
    setSaving(true);
    const payload = { name: name.trim(), discountType, discountValue: parseFloat(discountValue), startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() };
    if (editingId) await api.patch(`/api/sites/${currentStore.id}/flash-sales/${editingId}`, payload);
    else await api.post(`/api/sites/${currentStore.id}/flash-sales`, payload);
    setShowEditor(false); resetForm(); setSaving(false); fetchSales();
  };

  const deleteSale = async (id: string) => {
    if (!currentStore || !confirm("Delete this flash sale?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/flash-sales/${id}`);
    setSales((p) => p.filter((s) => s.id !== id)); setDeleteId(null);
  };

  const toggleActive = async (s: FlashSaleItem) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/flash-sales/${s.id}`, { isActive: !s.isActive });
    setSales((p) => p.map((x) => (x.id === s.id ? { ...x, isActive: !x.isActive } : x)));
  };

  const isLive = (s: FlashSaleItem) => s.isActive && new Date(s.startsAt) <= new Date() && new Date(s.endsAt) > new Date();
  const isUpcoming = (s: FlashSaleItem) => new Date(s.startsAt) > new Date();

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Flash Sales</h1><p className="text-sm text-surface-500 mt-1">Create time-limited discount events</p></div>
        <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Flash Sale</button>
      </div>

      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} Flash Sale</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2.5 w-full" autoFocus /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="input-field py-2.5 w-full"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed Amount</option></select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Discount Value *</label><input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="input-field py-2.5 w-full" placeholder={discountType === "PERCENTAGE" ? "20" : "500"} /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Starts At *</label><input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input-field py-2.5 w-full" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Ends At *</label><input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="input-field py-2.5 w-full" /></div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveSale} disabled={saving || !name.trim() || !discountValue || !startsAt || !endsAt} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}</button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : sales.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Zap className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No flash sales yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create time-limited sales to drive urgency.</p>
          <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Sale</button>
        </div>
      ) : !showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {sales.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLive(s) ? "bg-red-50" : "bg-amber-50"}`}>
                <Zap className={`h-5 w-5 ${isLive(s) ? "text-red-600" : "text-amber-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-surface-900">{s.name}</h3>
                  <span className="text-sm font-bold text-brand-600">{s.discountType === "PERCENTAGE" ? `${s.discountValue}%` : `$${s.discountValue}`} off</span>
                  {isLive(s) && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 animate-pulse">🔴 LIVE</span>}
                  {isUpcoming(s) && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Upcoming</span>}
                  {!isLive(s) && !isUpcoming(s) && s.isActive && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Ended</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                  <span><Clock className="h-3 w-3 inline" /> {new Date(s.startsAt).toLocaleDateString()} – {new Date(s.endsAt).toLocaleDateString()}</span>
                  <span><Package className="h-3 w-3 inline" /> {s._count?.products || 0} products</span>
                  <span>{s.usedCount} uses{s.maxUses ? ` / ${s.maxUses}` : ""}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleActive(s)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400">{s.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteSale(s.id)} disabled={deleteId === s.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
                  {deleteId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
