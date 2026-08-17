"use client";
import { Loader2 } from "lucide-react";
import { Building2, CheckCircle2, MapPin, Phone, Plus, Star, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface LocationItem {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  isDefault: boolean;
  isActive: boolean;
}

const emptyForm = { name: "", address: "", city: "", state: "", country: "", phone: "" };

export default function LocationsPage() {
  const { currentStore } = useSite();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchLocations = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ locations: LocationItem[] }>(`/api/sites/${currentStore.id}/locations`);
    if (res.success && res.data) setLocations(res.data.locations);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setFormError(""); setShowEditor(true); };
  const openEdit = (l: LocationItem) => {
    setForm({ name: l.name, address: l.address || "", city: l.city || "", state: l.state || "", country: l.country || "", phone: l.phone || "" });
    setEditingId(l.id); setFormError(""); setShowEditor(true);
  };

  const save = async () => {
    if (!currentStore || !form.name.trim()) { setFormError("Name is required"); return; }
    setSaving(true); setFormError("");
    const payload = { ...form, address: form.address || null, city: form.city || null, state: form.state || null, country: form.country || null, phone: form.phone || null };
    const res = editingId
      ? await api.patch(`/api/sites/${currentStore.id}/locations/${editingId}`, payload)
      : await api.post(`/api/sites/${currentStore.id}/locations`, payload);
    if (res.success) {
      setShowEditor(false);
      fetchLocations();
    } else {
      setFormError(res.error || "Failed to save location");
    }
    setSaving(false);
  };

  const setDefault = async (id: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/locations/${id}`, { isDefault: true });
    fetchLocations();
  };

  const remove = async (l: LocationItem) => {
    if (!currentStore || !confirm(`Delete "${l.name}"?`)) return;
    const res = await api.delete(`/api/sites/${currentStore.id}/locations/${l.id}`);
    if (res.success) fetchLocations();
    else alert(res.error || "Failed to delete location");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Locations</h1>
          <p className="text-sm text-surface-500 mt-1">Manage the branches, warehouses, or pickup points for your store</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : locations.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No locations yet</h3>
          <p className="text-sm text-surface-500 mb-4">Add your first branch, warehouse, or pickup point.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4 inline-flex"><Plus className="h-4 w-4" /> Add Location</button>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map((l) => (
            <div key={l.id} className={`rounded-2xl border bg-white p-5 ${!l.isActive ? "opacity-60" : "border-surface-200"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-surface-900">{l.name}</span>
                    {l.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        <Star className="h-2.5 w-2.5 fill-brand-700" /> Default
                      </span>
                    )}
                    {!l.isActive && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Inactive</span>}
                  </div>
                  {(l.address || l.city || l.state) && (
                    <p className="text-xs text-surface-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {[l.address, l.city, l.state, l.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {l.phone && <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {l.phone}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!l.isDefault && (
                    <button onClick={() => setDefault(l.id)} className="text-xs font-medium text-surface-500 hover:text-brand-600 px-2 py-1.5 rounded-lg hover:bg-surface-50 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Set default
                    </button>
                  )}
                  <button onClick={() => openEdit(l)} className="text-xs font-medium text-surface-500 hover:text-surface-900 px-2 py-1.5 rounded-lg hover:bg-surface-50">Edit</button>
                  <button onClick={() => remove(l)} className="p-1.5 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !saving && setShowEditor(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-surface-900 mb-4">{editingId ? "Edit Location" : "Add Location"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field w-full text-sm" placeholder="e.g. Lekki Branch" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input-field w-full text-sm" placeholder="Street address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">City</label>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">State</label>
                  <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="input-field w-full text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">Country</label>
                  <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-field w-full text-sm" />
                </div>
              </div>
            </div>
            {formError && <p className="text-sm text-accent-600 mt-3">{formError}</p>}
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowEditor(false)} className="btn-secondary text-sm flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary text-sm flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
