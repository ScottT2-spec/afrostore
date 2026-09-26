"use client";
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
  const { currentStore } = useSite();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [launching, setLaunching] = useState(false);

  // Form
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [products, setProducts] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // "Build with AI" no longer generates here and shows a static results
  // summary — it hands everything collected off to the AI Builder's
  // chat + live-preview + build-checklist workspace (the same one site
  // creation's "Build with AI" uses) and opens straight into it, so the
  // merchant watches it build in real time and can immediately keep
  // chatting to request changes once it's done, instead of landing on a
  // dead-end results page.
  const launch = async () => {
    if (!currentStore || !businessName.trim() || !businessType || launching) return;
    setLaunching(true);

    // The Site record's own `name` (shown everywhere — dashboard nav,
    // workspace list, this page's greeting, browser tab) was never
    // actually set from this form: it only ever flowed into the task
    // text sent to the AI, which has no tool to rename the site itself,
    // so the site kept whatever placeholder name it was created with.
    // Set it directly, right away, so it's correct regardless of what
    // the AI does with the rest of the task.
    try {
      await fetch(`/api/sites/${currentStore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName.trim(),
          businessType,
          ...(location.trim() ? { country: location.trim() } : {}),
          // Same reasoning as `name` above: this form's own description
          // field never made it to Site.description either — only into
          // the AI's prompt text — so it never actually showed up
          // anywhere real (footer taglines, meta descriptions).
          ...(description.trim() ? { description: description.trim() } : {}),
        }),
      });
    } catch { /* non-fatal — the AI builder flow below still proceeds either way */ }

    const composedTask = [
      `Build my ${businessType} business site for "${businessName.trim()}".`,
      location.trim() && `We're based in ${location.trim()}.`,
      targetAudience.trim() && `Our target audience is ${targetAudience.trim()}.`,
      products.trim() && `What we sell: ${products.trim()}.`,
      description.trim() && `About the business: ${description.trim()}.`,
    ].filter(Boolean).join(" ");

    sessionStorage.setItem(
      `ai-builder-prefill:${currentStore.id}`,
      JSON.stringify({ task: composedTask, businessName: businessName.trim(), businessType, products: products.trim(), targetAudience: targetAudience.trim() })
    );
    router.push(`/dashboard/sites/${currentStore.id}/ai-builder`);
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

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
            </div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Lagos, Nigeria" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Target Audience</label>
              <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Young professionals, 25-40" /></div>
          </div>
          <button onClick={() => setStep(2)} disabled={!businessName.trim() || !businessType}
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
