"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { AlertCircle, CheckCircle2, CreditCard, Shield } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface Gateway {
  id: string;
  provider: string;
  isEnabled: boolean;
  publicKey?: string;
  hasWebhookSecret?: boolean;
  config?: { contractCode?: string; baseUrl?: string } | null;
}

const providerInfo: Record<string, { name: string; desc: string; color: string }> = {
  MONNIFY: { name: "Monnify", desc: "Bank transfers, cards, USSD, mobile money", color: "from-blue-500 to-blue-600" },
  PAYSTACK: { name: "Paystack", desc: "Cards, bank transfers, mobile money", color: "from-teal-500 to-teal-600" },
  FLUTTERWAVE: { name: "Flutterwave", desc: "Cards, bank transfers, mobile money, Barter", color: "from-orange-500 to-orange-600" },
};

export default function PaymentsPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("payment_gateway");
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupProvider, setSetupProvider] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [contractCode, setContractCode] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentStore) return;
    (async () => {
      const res = await api.get<Gateway[]>(`/api/sites/${currentStore.id}/payment-gateways`);
      if (res.success && res.data) setGateways(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    })();
  }, [currentStore]);

  const toggleGateway = async (id: string, isEnabled: boolean) => {
    if (!currentStore) return;
    setTogglingId(id);
    const res = await api.patch<{ id: string; isEnabled: boolean }>(`/api/sites/${currentStore.id}/payment-gateways`, { id, isEnabled });
    setTogglingId(null);
    if (!res.success) { alert(res.error || "Failed to update gateway"); return; }
    setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, isEnabled } : g)));
  };

  const resetForm = () => {
    setSetupProvider(null);
    setPublicKey("");
    setSecretKey("");
    setWebhookSecret("");
    setContractCode("");
    setBaseUrl("");
    setSetupError("");
  };

  const openSetup = (provider: string) => {
    const gw = gateways.find((g) => g.provider === provider);
    setSetupProvider(provider);
    setPublicKey(gw?.publicKey || "");
    setSecretKey(""); // never prefilled — write-only, backend never returns it
    setWebhookSecret(""); // write-only — leave blank unless the user wants to change it
    setContractCode(gw?.config?.contractCode || "");
    setBaseUrl(gw?.config?.baseUrl || "");
    setSetupError("");
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || !setupProvider) return;

    if (setupProvider === "MONNIFY" && !contractCode.trim()) {
      setSetupError("Contract code is required for Monnify");
      return;
    }

    setSaving(true);
    setSetupError("");

    const gw = gateways.find((g) => g.provider === setupProvider);
    const body: Record<string, unknown> = { provider: setupProvider, publicKey, secretKey };
    // Only send webhookSecret if the user actually typed a new one — otherwise
    // keep whatever is already saved (don't overwrite it with an empty value).
    if (webhookSecret.trim()) body.webhookSecret = webhookSecret;
    else if (gw?.hasWebhookSecret) body.webhookSecret = undefined;
    if (setupProvider === "MONNIFY") {
      body.config = { contractCode: contractCode.trim(), baseUrl: baseUrl.trim() || undefined };
    }

    const res = await api.post(`/api/sites/${currentStore.id}/payment-gateways`, body);
    if (res.success) {
      resetForm();
      // Refresh
      const r = await api.get<Gateway[]>(`/api/sites/${currentStore.id}/payment-gateways`);
      if (r.success && r.data) setGateways(Array.isArray(r.data) ? r.data : []);
    } else {
      setSetupError(res.error || "Setup failed");
    }
    setSaving(false);
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  // AI prefill — auto-open setup for a specific provider
  useEffect(() => {
    if (prefillData && isFromAI && (prefillData as any).provider) {
      const d = prefillData as any;
      setSetupProvider(d.provider);
      if (d.publicKey) setPublicKey(d.publicKey);
      if (d.secretKey) setSecretKey(d.secretKey);
      if (d.webhookSecret) setWebhookSecret(d.webhookSecret);
      if (d.contractCode) setContractCode(d.contractCode);
      if (d.baseUrl) setBaseUrl(d.baseUrl);
    }
  }, [prefillData, isFromAI]);

  if (loading) return (
    <>
      <DashboardHeader title="Payments" />
      <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Payments" subtitle="Connect your payment gateways" />
      <div className="p-6 space-y-4 max-w-3xl">
        {isFromAI && <AIPrefillBanner entityType="payment gateway" onDiscard={() => { clearPrefill(); setSetupProvider(null); }} />}
        {["MONNIFY", "PAYSTACK", "FLUTTERWAVE"].map((provider) => {
          const info = providerInfo[provider];
          const gw = gateways.find((g) => g.provider === provider);
          const configured = !!gw;
          const enabled = gw?.isEnabled ?? false;

          return (
            <div key={provider} className="rounded-2xl border border-surface-200 bg-white p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-surface-900">{info.name}</h3>
                    <p className="text-xs text-surface-500">{info.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {configured ? (
                    <>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${enabled ? "bg-green-50 border-green-200 text-green-700" : "bg-surface-100 border-surface-200 text-surface-500"}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> {enabled ? "Connected" : "Disabled"}
                      </span>
                      <button
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => toggleGateway(gw!.id, !enabled)}
                        disabled={togglingId === gw!.id}
                        title={enabled ? "Disable this gateway" : "Enable this gateway"}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-green-600" : "bg-surface-300"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                      <button onClick={() => openSetup(provider)} className="btn-secondary text-xs py-2 px-4">
                        Edit
                      </button>
                    </>
                  ) : (
                    <button onClick={() => openSetup(provider)} className="btn-primary text-xs py-2 px-4">
                      Connect <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {!enabled && configured && (
                <p className="mt-3 text-xs text-surface-500">
                  This gateway is disabled — customers won't see it as a payment option at checkout. Your credentials are kept, so you can re-enable it anytime.
                </p>
              )}
              {configured && provider === "MONNIFY" && !gw?.config?.contractCode && (
                <p className="mt-3 text-xs text-amber-600">
                  Contract code missing — checkout will fail until this is set. Click Edit to add it.
                </p>
              )}
              {configured && !gw?.hasWebhookSecret && (
                <p className="mt-3 text-xs text-amber-600">
                  {provider === "FLUTTERWAVE"
                    ? "No webhook secret hash set — payment confirmations may be delayed or missed. Click Edit to add one."
                    : "Payment confirmations may be delayed until a customer returns to your site after paying. Click Edit and re-save to enable instant confirmation."}
                </p>
              )}
            </div>
          );
        })}

        {/* Setup Modal */}
        {setupProvider && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-surface-900 mb-1">Connect {providerInfo[setupProvider].name}</h2>
              <p className="text-xs text-surface-500 mb-6">Enter your API keys from {providerInfo[setupProvider].name} dashboard.</p>
              <form onSubmit={handleSetup} className="space-y-4">
                {setupError && <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{setupError}</div>}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Public Key</label>
                  <input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Secret Key</label>
                  <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="input-field" required />
                </div>

                {setupProvider === "MONNIFY" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Contract Code</label>
                      <input value={contractCode} onChange={(e) => setContractCode(e.target.value)} className="input-field" required />
                      <p className="mt-1 text-[11px] text-surface-400">Required by Monnify to initialize transactions.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Base URL <span className="text-surface-400 font-normal">(optional)</span></label>
                      <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.monnify.com" className="input-field" />
                      <p className="mt-1 text-[11px] text-surface-400">Leave blank to use Monnify's live API. Use the sandbox URL for testing — just the domain, e.g. https://sandbox.monnify.com (no trailing /api).</p>
                    </div>
                  </>
                )}

                {setupProvider === "FLUTTERWAVE" ? (
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      Webhook Secret Hash {gateways.find((g) => g.provider === setupProvider)?.hasWebhookSecret && <span className="text-surface-400 font-normal">(already set — leave blank to keep it)</span>}
                    </label>
                    <input
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      className="input-field"
                      placeholder={gateways.find((g) => g.provider === setupProvider)?.hasWebhookSecret ? "••••••••" : ""}
                      required={!gateways.find((g) => g.provider === setupProvider)?.hasWebhookSecret}
                    />
                    <p className="mt-1 text-[11px] text-surface-400">
                      Set this same value as the "Secret Hash" when you add the webhook URL in your Flutterwave dashboard's Settings → Webhooks.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-surface-400 bg-surface-50 rounded-lg px-3 py-2">
                    No separate webhook secret needed — {providerInfo[setupProvider].name} authenticates webhook events using the Secret Key above. Just add this URL as your webhook endpoint in your {providerInfo[setupProvider].name} dashboard.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={resetForm} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Shield className="h-4 w-4" /> {gateways.find((g) => g.provider === setupProvider)?.isEnabled ? "Save" : "Connect"}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
