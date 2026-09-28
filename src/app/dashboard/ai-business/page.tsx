"use client";
import { normalizePhone } from "@/lib/phone";
import { ArrowRight, Loader2 } from "lucide-react";
import { CheckCircle2, Palette, Sparkles } from "@/components/icons/FilledIcons";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSite } from "@/context/StoreContext";

const INDUSTRIES = [
  "Fashion", "Electronics", "Food & Restaurant", "Beauty & Cosmetics", "Real Estate",
  "Education", "Healthcare", "Agency", "Church & NGO", "Construction",
  "Automotive", "Jewelry", "Pharmacy", "Furniture", "Other",
];

export default function AIBusinessPage() {
  const { setSiteId, loading: siteLoading } = useSite();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [launching, setLaunching] = useState(false);

  // Form
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  // When "Other" is picked, the merchant types the actual business type
  // (e.g. "Car wash", "Pet shop"). That typed text — not the word
  // "Other" — is what everything downstream receives as the business type.
  const [customType, setCustomType] = useState("");
  const effectiveType = businessType === "Other" ? customType.trim() : businessType;
  const [products, setProducts] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  // Contact details. WhatsApp isn't its own field — the toggle reuses the
  // phone number, so nobody types the same number twice.
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);
  // What the typed phone will actually be saved as (one canonical form,
  // whatever way it was typed) — null while the field is empty.
  const phoneCheck = phone.trim() ? normalizePhone(phone, location) : null;

  // "Build with AI" no longer generates here and shows a static results
  // summary — it hands everything collected off to the AI Builder's
  // chat + live-preview + build-checklist workspace (the same one site
  // creation's "Build with AI" uses) and opens straight into it, so the
  // merchant watches it build in real time and can immediately keep
  // chatting to request changes once it's done, instead of landing on a
  // dead-end results page.
  const launch = async () => {
    if (!businessName.trim() || !effectiveType || launching) return;
    if (phoneCheck && !phoneCheck.ok) return; // the field shows why; don't send a number we can't resolve
    setLaunching(true);

    try {
      // A brand-new Site every time — "AI Business" was silently reusing
      // whatever site the merchant happened to have active (currentStore),
      // so a second AI-generated site overwrote the first instead of
      // creating its own. Same endpoint/shape the template flow already
      // uses, so this new site shows up in the dashboard sites list the
      // same way a template-created one does.
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const wsRes = await fetch("/api/workspaces", { headers: authHeaders });
      const wsJson = await wsRes.json();
      const workspaceId = wsJson?.data?.[0]?.id;
      if (!workspaceId) throw new Error("No workspace found for this account");

      const createRes = await fetch(`/api/workspaces/${workspaceId}/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          name: businessName.trim(),
          businessType: effectiveType,
          siteType: "ECOMMERCE",
          ...(location.trim() ? { country: location.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(phoneCheck?.ok ? { phone: phoneCheck.e164 } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(location.trim() ? { location: location.trim() } : {}),
          ...(products.trim() ? { products: products.trim() } : {}),
          ...(targetAudience.trim() ? { targetAudience: targetAudience.trim() } : {}),
          ...(instagram.trim() || facebook.trim() || tiktok.trim() || (whatsappSameAsPhone && phoneCheck?.ok)
            ? {
                socialLinks: {
                  instagram: instagram.trim(), facebook: facebook.trim(), tiktok: tiktok.trim(),
                  // Toggle on = the contact phone doubles as the WhatsApp number.
                  whatsapp: whatsappSameAsPhone && phoneCheck?.ok ? phoneCheck.e164 : "",
                },
              }
            : {}),
        }),
      });
      const createJson = await createRes.json();
      const newSiteId = createJson?.data?.id;
      if (!createRes.ok || !newSiteId) throw new Error(createJson?.error || "Failed to create site");

      // Point the app's "current site" at the one we just made, so the
      // dashboard (sidebar switcher included) reflects it immediately.
      setSiteId(newSiteId);

      const composedTask = [
        `Build my ${effectiveType} business site for "${businessName.trim()}".`,
        location.trim() && `We're based in ${location.trim()}.`,
        targetAudience.trim() && `Our target audience is ${targetAudience.trim()}.`,
        products.trim() && `What we sell: ${products.trim()}.`,
        description.trim() && `About the business: ${description.trim()}.`,
      ].filter(Boolean).join(" ");

      sessionStorage.setItem(
        `ai-builder-prefill:${newSiteId}`,
        JSON.stringify({
          task: composedTask, businessName: businessName.trim(), businessType: effectiveType,
          products: products.trim(), targetAudience: targetAudience.trim(),
          socialLinks: { instagram: instagram.trim(), facebook: facebook.trim(), tiktok: tiktok.trim() },
        })
      );
      router.push(`/dashboard/sites/${newSiteId}/ai-builder`);
    } catch (err) {
      setLaunching(false);
      alert(err instanceof Error ? err.message : "Failed to launch AI Business — please try again.");
    }
  };

  if (siteLoading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4"><Sparkles className="h-8 w-8 text-white" /></div>
        <h1 className="text-3xl font-bold text-surface-900 font-display">AI Business Mode</h1>
        <p className="text-surface-500 mt-2">Go from idea to online business in under 5 minutes</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-brand-600 text-white" : "bg-surface-200 text-surface-400"}`}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-brand-600" : "bg-surface-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5">
          <h2 className="text-xl font-bold text-surface-900">Tell us about your business</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Business Name *</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-field py-3 w-full text-lg" placeholder="e.g. Kwame Fashion Hub" autoFocus /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Industry *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {INDUSTRIES.map((ind) => (
                  <button key={ind} onClick={() => setBusinessType(ind)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors text-center ${businessType === ind ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500 hover:bg-surface-50"}`}>
                    {ind}
                  </button>
                ))}
              </div>
              {businessType === "Other" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-surface-700 mb-1">What type of business is it? *</label>
                  <input value={customType} onChange={(e) => setCustomType(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Car wash, Pet shop, Bookstore" maxLength={60} autoFocus />
                </div>
              )}
            </div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Lagos, Nigeria" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Target Audience</label>
              <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Young professionals, 25-40" /></div>
          </div>
          <button onClick={() => setStep(2)} disabled={!businessName.trim() || !effectiveType}
            className="btn-primary py-3 px-6 w-full sm:w-auto">Next <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5">
          <h2 className="text-xl font-bold text-surface-900">More details (optional but helpful)</h2>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Products / Services</label>
            <textarea value={products} onChange={(e) => setProducts(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} placeholder="e.g. African print dresses, accessories, custom tailoring..." /></div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Business Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} placeholder="Tell us what makes your business unique..." /></div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Contact details (optional)</label>
            <p className="text-xs text-surface-400 mb-2">Shown on your Contact page exactly as you type them.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field py-2.5 w-full" placeholder="Phone number, e.g. +234 800 000 0000" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field py-2.5 w-full" placeholder="Email, e.g. hello@business.com" />
            </div>
            {phoneCheck && (
              phoneCheck.ok
                ? <p className="mt-1.5 text-xs text-surface-500">Will be saved as <span className="font-medium text-surface-700">{phoneCheck.display}</span></p>
                : <p className="mt-1.5 text-xs text-red-600">{phoneCheck.reason}</p>
            )}
            <div className="mt-3 flex items-start justify-between gap-4 rounded-lg border border-surface-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-surface-700">Use this number for WhatsApp</p>
                <p className="mt-0.5 text-xs text-surface-400">
                  {phoneCheck?.ok
                    ? "Adds a floating WhatsApp button so customers can order or chat with you on the phone number above."
                    : "Enter a valid phone number above first."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={whatsappSameAsPhone && !!phoneCheck?.ok}
                disabled={!phoneCheck?.ok}
                onClick={() => setWhatsappSameAsPhone((v) => !v)}
                className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${whatsappSameAsPhone && phoneCheck?.ok ? "bg-green-500" : "bg-surface-300"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${whatsappSameAsPhone && phoneCheck?.ok ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Social Media (optional)</label>
            <p className="text-xs text-surface-400 mb-2">Add any accounts you have — they'll show as icons in your site's footer.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input-field py-2.5 w-full" placeholder="Instagram URL" />
              <input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="input-field py-2.5 w-full" placeholder="Facebook URL" />
              <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="input-field py-2.5 w-full" placeholder="TikTok URL" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6">Back</button>
            <button onClick={launch} disabled={launching} className="btn-primary py-3 px-6 flex-1 sm:flex-none">
              {launching ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening AI Builder...</> : <><Sparkles className="h-4 w-4" /> Build with AI</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
