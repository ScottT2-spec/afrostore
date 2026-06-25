"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Globe, CheckCircle2, AlertCircle, Plus, ExternalLink, Copy, Loader2 } from "lucide-react";

export default function DomainsPage() {
  const { currentStore, refreshStores } = useSite();
  const [customDomain, setCustomDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const subdomain = currentStore ? `${currentStore.subdomain}.prokip.site` : "";

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;
    setSaving(true); setError("");
    const res = await api.patch(`/api/sites/${currentStore.id}`, { customDomain });
    if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); refreshStores(); }
    else setError(res.error || "Failed");
    setSaving(false);
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };

  return (
    <>
      <DashboardHeader title="Domains" subtitle="Manage your store URLs" />
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Free subdomain */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div>
              <h3 className="text-base font-bold text-surface-900">Free Subdomain</h3>
              <p className="text-xs text-surface-500">Always active and free</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-50 rounded-xl p-3">
            <Globe className="h-4 w-4 text-surface-400" />
            <span className="text-sm font-medium text-surface-900 flex-1">{subdomain}</span>
            <button onClick={() => copyToClipboard(`https://${subdomain}`)} className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors"><Copy className="h-4 w-4 text-surface-500" /></button>
            <a href={`https://${subdomain}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors"><ExternalLink className="h-4 w-4 text-surface-500" /></a>
          </div>
        </div>

        {/* Custom domain */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-1">Custom Domain</h3>
          <p className="text-xs text-surface-500 mb-4">Connect your own domain (e.g. mystore.com)</p>

          {currentStore?.customDomain ? (
            <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 flex-1">{String(currentStore.customDomain)}</span>
            </div>
          ) : null}

          <form onSubmit={handleConnect} className="space-y-3">
            {error && <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{error}</div>}
            <input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} className="input-field" placeholder="mystore.com" />
            <p className="text-[10px] text-surface-500">Point your domain&apos;s CNAME record to <strong>cname.prokip.site</strong></p>
            <button type="submit" disabled={saving || !customDomain} className="btn-primary text-sm py-2 px-4">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Saved!" : <><Plus className="h-4 w-4" />Connect Domain</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
