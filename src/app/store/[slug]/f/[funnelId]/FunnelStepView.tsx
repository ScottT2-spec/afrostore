"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { injectPixels, trackEvent, type PixelIds } from "@/lib/storefront-analytics";

export interface PublicFunnelStep {
  id: string;
  name: string;
  type: string;
  position: number;
  isLastStep: boolean;
  settings: Record<string, unknown>;
  landingBlocks: BuilderBlock[];
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    fields: Array<{ id: string; label: string; type: string; placeholder?: string; required?: boolean }>;
    submitButtonText: string;
    successMessage: string | null;
  } | null;
}

interface Props {
  siteSlug: string;
  siteName: string;
  siteLogo: string | null;
  funnelId: string;
  funnelName: string;
  step: PublicFunnelStep;
  pixelIds: PixelIds;
}

export default function FunnelStepView({ siteSlug, siteName, siteLogo, funnelId, funnelName, step, pixelIds }: Props) {
  const router = useRouter();
  const trackedRef = useRef(false);

  // Every funnel step is a landing destination in its own right (ads point
  // straight at /f/[funnelId]?step=N), so it needs the same pixel injection
  // + page_view firing the homepage already gets — previously this page
  // never called injectPixels/trackEvent at all, so Meta/TikTok/GA never
  // loaded here and a visitor landing directly on a funnel step was
  // completely invisible to ad platforms.
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    injectPixels(pixelIds);
    // Own funnel-step counter (drives the funnel dashboard's view counts)
    fetch(`/api/public/sites/${siteSlug}/funnels/${funnelId}/steps/${step.id}/view`, { method: "POST" }).catch(() => {});
    // Central event log + pixel PageView/ViewContent equivalents
    trackEvent(siteSlug, "page_view", {
      page: `/f/${funnelId}?step=${step.position}`,
      metadata: { funnelId, funnelStepId: step.id, funnelStepType: step.type, funnelName },
    });
  }, [siteSlug, funnelId, funnelName, step.id, step.position, step.type, pixelIds]);

  const goToNextStep = () => {
    if (step.isLastStep) return;
    // A funnel-step "Continue" click is the CTA event the PRD calls
    // CTA_CLICK — distinct from the eventual lead/purchase conversion.
    trackEvent(siteSlug, "cta_click", {
      page: `/f/${funnelId}?step=${step.position}`,
      metadata: { funnelId, funnelStepId: step.id },
    });
    router.push(`/store/${siteSlug}/f/${funnelId}?step=${step.position + 1}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-surface-100 py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2">
          {siteLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="font-bold text-surface-900">{siteName}</span>
          )}
        </div>
      </header>

      <main>
        {step.type === "LANDING" && (
          <LandingStep blocks={step.landingBlocks} storeSlug={siteSlug} onContinue={goToNextStep} isLastStep={step.isLastStep} settings={step.settings} />
        )}
        {step.type === "LEAD_FORM" && (
          <LeadFormStep siteSlug={siteSlug} funnelId={funnelId} step={step} onSubmitted={goToNextStep} />
        )}
        {step.type === "THANK_YOU" && <ThankYouStep step={step} funnelName={funnelName} siteSlug={siteSlug} funnelId={funnelId} />}
        {!["LANDING", "LEAD_FORM", "THANK_YOU"].includes(step.type) && (
          <div className="max-w-lg mx-auto px-4 py-24 text-center">
            <h1 className="text-2xl font-bold text-surface-900 mb-3">{step.name}</h1>
            <p className="text-surface-500 mb-8">This step type isn&apos;t available for public viewing yet.</p>
            {!step.isLastStep && (
              <button onClick={goToNextStep} className="btn-primary px-6 py-3">Continue</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function LandingStep({
  blocks,
  storeSlug,
  onContinue,
  isLastStep,
  settings,
}: {
  blocks: BuilderBlock[];
  storeSlug: string;
  onContinue: () => void;
  isLastStep: boolean;
  settings: Record<string, unknown>;
}) {
  if (blocks.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-surface-900 mb-4">Welcome</h1>
        <p className="text-surface-500 mb-8">This landing page hasn&apos;t been designed yet.</p>
        {!isLastStep && (
          <button onClick={onContinue} className="btn-primary px-6 py-3">
            {typeof settings.buttonText === "string" && settings.buttonText ? settings.buttonText : "Continue"}
          </button>
        )}
      </div>
    );
  }
  return (
    <div>
      <RenderBlocks blocks={blocks} storeSlug={storeSlug} />
      {!isLastStep && (
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <button onClick={onContinue} className="btn-primary px-8 py-3.5 text-base">
            {typeof settings.buttonText === "string" && settings.buttonText ? settings.buttonText : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}

function LeadFormStep({
  siteSlug,
  funnelId,
  step,
  onSubmitted,
}: {
  siteSlug: string;
  funnelId: string;
  step: PublicFunnelStep;
  onSubmitted: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [quickCapture, setQuickCapture] = useState({ firstName: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (id: string, value: string) => setValues((prev) => ({ ...prev, [id]: value }));

  const submitLinkedForm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/storefront/${siteSlug}/forms/${step.form!.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, _funnelStepId: step.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      trackEvent(siteSlug, "lead", {
        metadata: { funnelId, funnelStepId: step.id, formId: step.form!.id },
        email: step.form!.fields.find((f) => f.type === "email") ? values[step.form!.fields.find((f) => f.type === "email")!.id] : undefined,
      });
      setSuccess(true);
      setTimeout(onSubmitted, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuickCapture = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const [firstName, ...rest] = quickCapture.firstName.trim().split(/\s+/).filter(Boolean);
      const res = await fetch(`/api/public/sites/${siteSlug}/crm/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: quickCapture.email,
          firstName: firstName || "",
          lastName: rest.join(" "),
          funnelStepId: step.id,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      trackEvent(siteSlug, "lead", { metadata: { funnelId, funnelStepId: step.id, quickCapture: true }, email: quickCapture.email });
      setSuccess(true);
      setTimeout(onSubmitted, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">
          {step.form?.successMessage || "Thanks! Redirecting you now..."}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-surface-900 mb-2 text-center">{step.name}</h1>
      {step.form?.description && (
        <p className="text-surface-500 text-center mb-8">{step.form.description}</p>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {step.form ? (
        <form
          onSubmit={(e) => { e.preventDefault(); submitLinkedForm(); }}
          className="space-y-4"
        >
          {step.form.fields.map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-surface-700 mb-1">{f.label}</label>
              <input
                type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
                required={f.required}
                placeholder={f.placeholder}
                value={values[f.id] || ""}
                onChange={(e) => handleChange(f.id, e.target.value)}
                className="input-field py-3 w-full"
              />
            </div>
          ))}
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base">
            {submitting ? "Submitting..." : step.form.submitButtonText || "Submit"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); submitQuickCapture(); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
            <input
              type="text"
              value={quickCapture.firstName}
              onChange={(e) => setQuickCapture((p) => ({ ...p, firstName: e.target.value }))}
              className="input-field py-3 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={quickCapture.email}
              onChange={(e) => setQuickCapture((p) => ({ ...p, email: e.target.value }))}
              className="input-field py-3 w-full"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base">
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}

function ThankYouStep({ step, funnelName, siteSlug, funnelId }: { step: PublicFunnelStep; funnelName: string; siteSlug: string; funnelId: string }) {
  const redirectUrl = typeof step.settings.redirectUrl === "string" ? step.settings.redirectUrl : undefined;
  const delaySeconds = typeof step.settings.delaySeconds === "number" ? step.settings.delaySeconds : undefined;
  const buttonText = typeof step.settings.buttonText === "string" ? step.settings.buttonText : "Continue";
  const trackedRef = useRef(false);

  // THANK_YOU_VIEW — the final confirmation that the funnel's conversion
  // was actually reached (page_view on this step already fired above, but
  // recording it distinctly here is what lets the dashboard tell "step was
  // viewed" apart from "conversion was confirmed").
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent(siteSlug, "thank_you_view", { metadata: { funnelId, funnelStepId: step.id, funnelName } });
  }, [siteSlug, funnelId, step.id, funnelName]);

  useEffect(() => {
    if (redirectUrl && delaySeconds !== undefined) {
      const t = setTimeout(() => { window.location.href = redirectUrl; }, delaySeconds * 1000);
      return () => clearTimeout(t);
    }
  }, [redirectUrl, delaySeconds]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 text-3xl">🎉</div>
      <h1 className="text-3xl font-bold text-surface-900 mb-3">{step.name || "Thank You!"}</h1>
      <p className="text-surface-500 mb-8">
        We&apos;ve received your submission for {funnelName}. We&apos;ll be in touch soon.
      </p>
      {redirectUrl && (
        <a href={redirectUrl} className="btn-primary inline-block px-8 py-3.5 text-base">{buttonText}</a>
      )}
    </div>
  );
}
