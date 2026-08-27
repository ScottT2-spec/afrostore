"use client";
import { Loader2 } from "lucide-react";
import { AlertCircle, Bell, CheckCircle2, Eye, EyeOff, Globe, Info, Lock, Mail, Save, Shield } from "@/components/icons/FilledIcons";

import { useEffect, useState } from "react";

interface PlatformSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultCountry: string;
  maintenanceMode: boolean;
  allowSignups: boolean;
  requireEmailVerification: boolean;
  maxStoresPerUser: number;
  platformFeePercent: number;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  sendFromEmail: string;
  sendFromName: string;
  smtpPassSet: boolean;
}

const defaults: PlatformSettings = {
  siteName: "Prokip",
  siteUrl: "https://prokip.app",
  supportEmail: "support@prokip.app",
  defaultCurrency: "NGN",
  defaultCountry: "NG",
  maintenanceMode: false,
  allowSignups: true,
  requireEmailVerification: false,
  maxStoresPerUser: 5,
  platformFeePercent: 2.5,
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  sendFromEmail: "",
  sendFromName: "Prokip",
  smtpPassSet: false,
};

/* ───────── Shared chrome: fonts + design tokens (Adire system) ───────── */
function SettingsChrome() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
      />
      <style>{`
        :root {
          --co-ink: #14132f;
          --co-indigo: #2f2a7a;
          --co-indigo-deep: #1e1a57;
          --co-indigo-soft: #edecf9;
          --co-indigo-ring: rgba(47,42,122,0.14);
          --co-marigold: #e8a33d;
          --co-marigold-deep: #c97f1e;
          --co-marigold-soft: #fbeed9;
          --co-chalk: #f5f4f9;
          --co-coral: #e15241;
          --co-coral-soft: #fdeceb;
          --co-coral-ring: rgba(225,82,65,0.14);
          --co-green: #1f9d63;
          --co-green-soft: #e7f6ee;
          --co-line: #e4e2ed;
        }
        .co-font-display { font-family: 'Fraunces', Georgia, serif; }
        .co-font-mono { font-family: 'Space Mono', ui-monospace, SFMono-Regular, monospace; }
        .co-font-body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>
    </>
  );
}

function Toggle({ value, onChange, label, hint }: { value: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-1">
      <span>
        <span className="block text-sm font-medium text-[var(--co-ink)]">{label}</span>
        {hint && <span className="block text-xs text-surface-400 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "var(--co-indigo)" : "#d4d2df" }}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

const fieldClass =
  "w-full rounded-xl border border-[var(--co-line)] bg-white px-4 py-2.5 text-sm text-[var(--co-ink)] transition-all focus:outline-none focus:border-[var(--co-indigo)] focus:ring-4 focus:ring-[var(--co-indigo-ring)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaults);
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "email" | "security">("general");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data) {
          setSettings({ ...defaults, ...json.data, platformFeePercent: Number(json.data.platformFeePercent) });
        } else {
          setLoadError(json.error || "Failed to load settings");
        }
      } catch {
        if (!cancelled) setLoadError("Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, val: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const { smtpPassSet, ...rest } = settings;
      const body: Record<string, unknown> = { ...rest };
      if (smtpPassInput.trim()) body.smtpPass = smtpPassInput.trim();

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setSaveError(json.error || "Failed to save settings");
        return;
      }
      setSettings({ ...defaults, ...json.data, platformFeePercent: Number(json.data.platformFeePercent) });
      setSmtpPassInput("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      setSaveError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Globe },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="p-6 co-font-body">
        <SettingsChrome />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--co-indigo)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 co-font-body bg-[var(--co-chalk)] min-h-screen">
      <SettingsChrome />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="co-font-display text-2xl font-bold text-[var(--co-ink)]">Platform Settings</h1>
          <p className="text-sm text-surface-500 mt-1">Configure global platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--co-coral)]">
              <AlertCircle className="h-4 w-4" /> {saveError}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[var(--co-indigo)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--co-indigo-deep)] transition-all duration-200 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 className="h-4 w-4" /> Saved</>
            ) : (
              <><Save className="h-4 w-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--co-coral)] bg-[var(--co-coral-soft)] px-4 py-3 text-sm text-[var(--co-coral)]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {loadError} — showing defaults, changes may not persist.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--co-line)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
              style={active ? { borderColor: "var(--co-indigo)", color: "var(--co-indigo)" } : { borderColor: "transparent", color: "#8a8894" }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[var(--co-line)] bg-white">
        {/* General */}
        {activeTab === "general" && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Platform Name">
                <input value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} className={fieldClass} />
              </Field>
              <Field label="Site URL">
                <input value={settings.siteUrl} onChange={(e) => update("siteUrl", e.target.value)} className={fieldClass} />
              </Field>
              <Field label="Support Email">
                <input value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} className={fieldClass} />
              </Field>
              <Field label="Default Currency">
                <select value={settings.defaultCurrency} onChange={(e) => update("defaultCurrency", e.target.value)} className={fieldClass}>
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="KES">KES — Kenyan Shilling</option>
                  <option value="GHS">GHS — Ghanaian Cedi</option>
                  <option value="ZAR">ZAR — South African Rand</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </Field>
              <Field label="Default Country">
                <select value={settings.defaultCountry} onChange={(e) => update("defaultCountry", e.target.value)} className={fieldClass}>
                  <option value="NG">Nigeria</option>
                  <option value="KE">Kenya</option>
                  <option value="GH">Ghana</option>
                  <option value="ZA">South Africa</option>
                </select>
              </Field>
              <Field label="Max Stores Per User">
                <input type="number" value={settings.maxStoresPerUser} onChange={(e) => update("maxStoresPerUser", parseInt(e.target.value) || 1)} className={fieldClass} />
              </Field>
              <Field label="Platform Fee (%)">
                <div className="relative">
                  <input type="number" step="0.1" value={settings.platformFeePercent} onChange={(e) => update("platformFeePercent", parseFloat(e.target.value) || 0)} className={`${fieldClass} co-font-mono pr-10`} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-surface-400 co-font-mono">%</span>
                </div>
              </Field>
            </div>
            <div className="pt-4 border-t border-[var(--co-line)]">
              <Toggle label="Maintenance Mode" hint="Temporarily takes every storefront offline for shoppers" value={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
            </div>
          </div>
        )}

        {/* Email */}
        {activeTab === "email" && (
          <div className="p-6 space-y-5">
            <p className="text-sm text-surface-500 mb-2">Configure SMTP for transactional emails (order confirmations, password resets, etc.)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="SMTP Host">
                <input value={settings.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} placeholder="smtp.example.com" className={fieldClass} />
              </Field>
              <Field label="SMTP Port">
                <input value={settings.smtpPort} onChange={(e) => update("smtpPort", e.target.value)} className={`${fieldClass} co-font-mono`} />
              </Field>
              <Field label="SMTP Username">
                <input value={settings.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} className={fieldClass} />
              </Field>
              <Field label="SMTP Password">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={smtpPassInput}
                    onChange={(e) => setSmtpPassInput(e.target.value)}
                    placeholder={settings.smtpPassSet ? "•••••••• (saved — leave blank to keep)" : "Enter a password"}
                    className={`${fieldClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-[var(--co-indigo)]">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Send From Email">
                <input value={settings.sendFromEmail} onChange={(e) => update("sendFromEmail", e.target.value)} placeholder="noreply@prokip.app" className={fieldClass} />
              </Field>
              <Field label="Send From Name">
                <input value={settings.sendFromName} onChange={(e) => update("sendFromName", e.target.value)} className={fieldClass} />
              </Field>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-[var(--co-indigo-soft)] px-4 py-3">
              <Lock className="h-4 w-4 text-[var(--co-indigo)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--co-indigo-deep)]">
                The saved password is never sent back to your browser. Leave the field blank to keep the current one.
              </p>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="p-6 space-y-5">
            <div className="space-y-4 divide-y divide-[var(--co-line)]">
              <Toggle label="Allow New Signups" hint="Turn off to stop new merchants from creating accounts" value={settings.allowSignups} onChange={(v) => update("allowSignups", v)} />
              <div className="pt-4">
                <Toggle label="Require Email Verification" hint="New accounts must confirm their email before selling" value={settings.requireEmailVerification} onChange={(v) => update("requireEmailVerification", v)} />
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--co-line)]">
              <div className="rounded-xl bg-[var(--co-marigold-soft)] border border-[var(--co-marigold)]/30 p-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-[var(--co-marigold-deep)] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--co-ink)]">Security Notifications</h4>
                    <p className="text-xs text-surface-500 mt-1">Admin notifications for suspicious activity, failed logins, and new signups will be sent to the support email configured in General settings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-surface-400">
        <Info className="h-3.5 w-3.5" /> Changes apply platform-wide and take effect immediately after saving.
      </div>
    </div>
  );
}
