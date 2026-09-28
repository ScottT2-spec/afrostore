"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { CheckCircle2, Sparkles } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const INDUSTRIES = [
  "Fashion", "Electronics", "Food & Restaurant", "Beauty & Cosmetics", "Real Estate",
  "Education", "Healthcare", "Agency", "Church & NGO", "Construction",
  "Automotive", "Jewelry", "Pharmacy", "Furniture", "Other",
];

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form — prefilled from the site's saved data on load
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [products, setProducts] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  // What was actually saved when the page loaded — the baseline every
  // "did the merchant change this?" comparison below is measured against.
  const [original, setOriginal] = useState({
    businessName: "", businessType: "", products: "", targetAudience: "",
    location: "", description: "", instagram: "", facebook: "", tiktok: "",
  });

  useEffect(() => {
    if (!siteId) return;
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/sites/${siteId}`, { headers });
        const json = await res.json();
        if (json.success && json.data) {
          const s = json.data;
          const loaded = {
            businessName: s.name || "",
            businessType: s.businessType || "",
            products: s.productsSummary || "",
            targetAudience: s.targetAudience || "",
            location: s.country || "",
            description: s.description || "",
            instagram: s.socialLinks?.instagram || "",
            facebook: s.socialLinks?.facebook || "",
            tiktok: s.socialLinks?.tiktok || "",
          };
          setBusinessName(loaded.businessName);
          setBusinessType(loaded.businessType);
          setProducts(loaded.products);
          setTargetAudience(loaded.targetAudience);
          setLocation(loaded.location);
          setDescription(loaded.description);
          setInstagram(loaded.instagram);
          setFacebook(loaded.facebook);
          setTiktok(loaded.tiktok);
          setOriginal(loaded);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  const saveAndContinue = async () => {
    if (!businessName.trim() || !businessType || saving) return;
    setSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          name: businessName.trim(),
          businessType,
          country: location.trim(),
          description: description.trim(),
          productsSummary: products.trim(),
          targetAudience: targetAudience.trim(),
        }),
      });

      if (instagram.trim() !== original.instagram || facebook.trim() !== original.facebook || tiktok.trim() !== original.tiktok) {
        await fetch(`/api/sites/${siteId}/social-links`, {
          method: "POST",
          headers,
          body: JSON.stringify({ instagram: instagram.trim(), facebook: facebook.trim(), tiktok: tiktok.trim() }),
        });
      }

      // The core rule: same industry = targeted edit, keep the existing
      // catalog/content as-is and only touch what the merchant actually
      // changed on this form. Different industry = the whole site,
      // products included, no longer matches the business — tell the
      // agent explicitly to rebuild around the new one.
      const industryChanged = businessType !== original.businessType;
      let task: string;

      if (industryChanged) {
        task = [
          `The merchant just changed this site's industry from "${original.businessType}" to "${businessType}" for "${businessName.trim()}".`,
          `This is a full pivot, not a tweak — rebuild the site's content, design direction, and product catalog to actually fit ${businessType}, not ${original.businessType}. The old products/services no longer apply; replace them.`,
          location.trim() && `Based in ${location.trim()}.`,
          targetAudience.trim() && `Target audience: ${targetAudience.trim()}.`,
          products.trim() && `New products/services: ${products.trim()}.`,
          description.trim() && `About the business: ${description.trim()}.`,
        ].filter(Boolean).join(" ");
      } else {
        const changes: string[] = [];
        if (businessName.trim() !== original.businessName) changes.push(`business name is now "${businessName.trim()}" (was "${original.businessName}")`);
        if (location.trim() !== original.location) changes.push(`location is now "${location.trim()}"${original.location ? ` (was "${original.location}")` : ""}`);
        if (targetAudience.trim() !== original.targetAudience) changes.push(`target audience is now "${targetAudience.trim()}"${original.targetAudience ? ` (was "${original.targetAudience}")` : ""}`);
        if (products.trim() !== original.products) changes.push(`products/services: ${products.trim()}${original.products ? ` (was: ${original.products})` : ""}`);
        if (description.trim() !== original.description) changes.push(`business description is now: ${description.trim()}`);
        if (instagram.trim() !== original.instagram) changes.push(`Instagram link updated`);
        if (facebook.trim() !== original.facebook) changes.push(`Facebook link updated`);
        if (tiktok.trim() !== original.tiktok) changes.push(`TikTok link updated`);

        task = changes.length
          ? `The merchant updated their business info form for "${businessName.trim()}" — same industry (${businessType}), so keep the existing product catalog and overall site as-is. Apply only these changes: ${changes.join("; ")}.`
          : `The merchant reopened their business info form for "${businessName.trim()}" and didn't change anything — no site changes needed from this; just wait for what they ask for in chat.`;
      }

      sessionStorage.setItem(`ai-builder-prefill:${siteId}`, JSON.stringify({ task }));
      router.push(`/dashboard/sites/${siteId}/ai-builder`);
    } catch (err) {
      setSaving(false);
      alert(err instanceof Error ? err.message : "Failed to save — please try again.");
    }
  };

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4"><Sparkles className="h-8 w-8 text-white" /></div>
        <h1 className="text-3xl font-bold text-surface-900 font-display">Edit Business Details</h1>
        <p className="text-surface-500 mt-2">Update what changed — the AI will apply just that, or rebuild around a new industry if you switch it</p>
      </div>

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

      {step === 1 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5">
          <h2 className="text-xl font-bold text-surface-900">Business basics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Business Name *</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-field py-3 w-full text-lg" autoFocus /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Industry *</label>
              {businessType !== original.businessType && (
                <p className="text-xs text-amber-600 mb-2">Changing this from "{original.businessType}" will rebuild the whole site — including products — around the new industry.</p>
              )}
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
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field py-2.5 w-full" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Target Audience</label>
              <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="input-field py-2.5 w-full" /></div>
          </div>
          <button onClick={() => setStep(2)} disabled={!businessName.trim() || !businessType}
            className="btn-primary py-3 px-6 w-full sm:w-auto">Next <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5">
          <h2 className="text-xl font-bold text-surface-900">More details</h2>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Products / Services</label>
            <textarea value={products} onChange={(e) => setProducts(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} /></div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Business Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} /></div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Social Media</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input-field py-2.5 w-full" placeholder="Instagram URL" />
              <input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="input-field py-2.5 w-full" placeholder="Facebook URL" />
              <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="input-field py-2.5 w-full" placeholder="TikTok URL" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6">Back</button>
            <button onClick={saveAndContinue} disabled={saving} className="btn-primary py-3 px-6 flex-1 sm:flex-none">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Sparkles className="h-4 w-4" /> Save & Continue to AI Builder</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
