"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Store, Globe, Bell, Shield, Truck, MessageCircle, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { currentStore } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    allowGuestCheckout: true,
    payOnDelivery: true,
    bankTransfer: true,
    whatsappOrdering: true,
    showStockCount: false,
    lowDataMode: false,
    language: "en",
    whatsappNumber: "",
    metaTitle: "",
    metaDescription: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
  });

  useEffect(() => {
    if (!currentStore) return;
    (async () => {
      const res = await api.get<any>(`/api/stores/${currentStore.id}/settings`);
      if (res.success && res.data) {
        // Strip non-settings fields from DB response
        const { id, storeId, createdAt, updatedAt, ...s } = res.data;
        setSettings((prev) => ({ ...prev, ...s }));
      }
      setLoading(false);
    })();
  }, [currentStore]);

  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    if (!currentStore) return;
    setSaving(true);
    setSaveError("");
    // Only send fields that have actual values (don't send empty strings for optional fields)
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "boolean") {
        cleaned[key] = value;
      } else if (typeof value === "string" && value.trim()) {
        cleaned[key] = value;
      } else if (typeof value === "string") {
        cleaned[key] = null; // send null instead of empty string
      }
    }
    const res = await api.patch(`/api/stores/${currentStore.id}/settings`, cleaned);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      // Re-fetch settings to confirm they persisted
      const fresh = await api.get<any>(`/api/stores/${currentStore.id}/settings`);
      if (fresh.success && fresh.data) {
        const { id: _id, storeId: _sid, createdAt: _ca, updatedAt: _ua, ...s } = fresh.data;
        setSettings((prev) => ({ ...prev, ...s }));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSaved(false), 3000);
    } else {
      setSaveError(res.error || "Failed to save settings");
    }
  };

  const toggle = (key: string) => setSettings((prev) => ({ ...prev, [key]: !(prev as any)[key] }));
  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) return (
    <>
      <DashboardHeader title="Settings" />
      <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Configure your store" />
      <div className="p-6 space-y-6 max-w-3xl">
        {saved && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2 animate-pulse">
            ✅ Settings saved successfully!
          </div>
        )}
        {/* Store Info */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Store className="h-5 w-5" />Store Info</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">SEO Title</label>
              <input value={settings.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className="input-field" placeholder="Your Store Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">SEO Description</label>
              <textarea value={settings.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className="input-field" rows={3} />
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Shield className="h-5 w-5" />Checkout</h3>
          <div className="space-y-3">
            {[
              { key: "allowGuestCheckout", label: "Allow guest checkout" },
              { key: "payOnDelivery", label: "Pay on delivery" },
              { key: "bankTransfer", label: "Bank transfer checkout" },
              { key: "showStockCount", label: "Show stock count to customers" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-surface-700">{label}</span>
                <button type="button" onClick={() => toggle(key)} className={`relative w-11 h-6 rounded-full transition-colors ${(settings as any)[key] ? "bg-brand-600" : "bg-surface-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${(settings as any)[key] ? "translate-x-5" : ""}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><MessageCircle className="h-5 w-5" />WhatsApp</h3>
          <label className="flex items-center justify-between cursor-pointer mb-4">
            <span className="text-sm text-surface-700">Enable WhatsApp ordering</span>
            <button type="button" onClick={() => toggle("whatsappOrdering")} className={`relative w-11 h-6 rounded-full transition-colors ${settings.whatsappOrdering ? "bg-brand-600" : "bg-surface-300"}`}>
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.whatsappOrdering ? "translate-x-5" : ""}`} />
            </button>
          </label>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">WhatsApp Number</label>
            <input value={settings.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} className="input-field" placeholder="+234 812 345 6789" />
          </div>
        </div>

        {/* Tracking */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Globe className="h-5 w-5" />Tracking & Analytics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Google Analytics ID</label>
              <input value={settings.googleAnalyticsId} onChange={(e) => update("googleAnalyticsId", e.target.value)} className="input-field" placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Facebook Pixel ID</label>
              <input value={settings.facebookPixelId} onChange={(e) => update("facebookPixelId", e.target.value)} className="input-field" placeholder="1234567890" />
            </div>
          </div>
        </div>

        {/* Save */}
        {saveError && (
          <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{saveError}</div>
        )}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />{saved ? "Saved!" : "Save Settings"}</>}
          </button>
        </div>
      </div>
    </>
  );
}
