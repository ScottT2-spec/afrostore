"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { injectPixels, trackEvent, type PixelIds } from "@/lib/storefront-analytics";
import { useFunnelStepABTestVariant, applyABTestOverrides } from "@/hooks/useABTestVariant";
import { TemplateStoreContextProvider } from "@/components/storefront/TemplateStoreContextProvider";

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
  currency: string;
  templateSlug: string | null;
  funnelId: string;
  funnelName: string;
  step: PublicFunnelStep;
  pixelIds: PixelIds;
}

export default function FunnelStepView({ siteSlug, siteName, siteLogo, currency, templateSlug, funnelId, funnelName, step, pixelIds }: Props) {
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
      <header className="border-b border-surface-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2">
          {siteLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="font-display font-bold text-lg text-surface-900">{siteName}</span>
          )}
        </div>
      </header>

      <main>
        {step.type === "LANDING" && (
          <LandingStep blocks={step.landingBlocks} storeSlug={siteSlug} funnelStepId={step.id} onContinue={goToNextStep} isLastStep={step.isLastStep} settings={step.settings} currency={currency} templateSlug={templateSlug} />
        )}
        {step.type === "LEAD_FORM" && (
          <LeadFormStep siteSlug={siteSlug} funnelId={funnelId} step={step} onSubmitted={goToNextStep} />
        )}
        {step.type === "THANK_YOU" && <ThankYouStep step={step} funnelName={funnelName} siteSlug={siteSlug} funnelId={funnelId} siteName={siteName} />}
        {!["LANDING", "LEAD_FORM", "THANK_YOU"].includes(step.type) && (
          <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-surface-50 flex items-center justify-center px-4 py-16">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
              <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
            </div>
            <div className="relative w-full max-w-md rounded-3xl border border-surface-200/70 bg-white shadow-xl shadow-surface-900/5 px-8 py-12 text-center sm:px-10 animate-fade-up">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-brand-500" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-surface-900 mb-3">{step.name}</h1>
              <p className="text-surface-500 mb-8 leading-relaxed">This step isn&apos;t available for public viewing yet.</p>
              {!step.isLastStep && (
                <button
                  onClick={goToNextStep}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LandingStep({
  blocks,
  storeSlug,
  funnelStepId,
  onContinue,
  isLastStep,
  settings,
  currency,
  templateSlug,
}: {
  blocks: BuilderBlock[];
  storeSlug: string;
  funnelStepId: string;
  onContinue: () => void;
  isLastStep: boolean;
  settings: Record<string, unknown>;
  currency: string;
  templateSlug: string | null;
}) {
  const abTest = useFunnelStepABTestVariant(storeSlug, funnelStepId);
  const effectiveBlocks = applyABTestOverrides(blocks, abTest.content);

  if (blocks.length === 0) {
    return (
      <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-surface-50 flex items-center justify-center px-4 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
        </div>
        <div className="relative w-full max-w-md rounded-3xl border border-surface-200/70 bg-white shadow-xl shadow-surface-900/5 px-8 py-12 text-center sm:px-10 animate-fade-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-brand-500" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 4.5h14A1.5 1.5 0 0120.5 6v13a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 19V6A1.5 1.5 0 015 4.5z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-900 mb-3">Welcome</h1>
          <p className="text-surface-500 mb-8 leading-relaxed">This landing page hasn&apos;t been designed yet.</p>
          {!isLastStep && (
            <button
              onClick={onContinue}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {typeof settings.buttonText === "string" && settings.buttonText ? settings.buttonText : "Continue"}
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* Some bespoke templates (Prokip Agent, Prokip Booking, Hardware,
          etc.) read storeSlug/currency from this Context rather than
          props — without it, their forms fail with "This form isn't
          connected to a store yet." even though a real store is linked. */}
      <TemplateStoreContextProvider
        templateSlug={templateSlug}
        products={[]}
        blogs={[]}
        currency={currency}
        storeSlug={storeSlug}
        socialLinks={[]}
        addToCart={() => {}}
        toggleWishlist={() => {}}
        isWishlisted={() => false}
        onQuickView={() => {}}
      >
        <RenderBlocks blocks={effectiveBlocks} storeSlug={storeSlug} />
      </TemplateStoreContextProvider>
      {!isLastStep && (
        <div className="border-t border-surface-100 bg-surface-50/60">
          <div className="max-w-5xl mx-auto px-4 py-12 text-center">
            <button
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {typeof settings.buttonText === "string" && settings.buttonText ? settings.buttonText : "Continue"}
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
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
      <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-surface-50 flex items-center justify-center px-4 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-accent-200/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        </div>
        <div className="relative w-full max-w-md rounded-3xl border border-surface-200/70 bg-white shadow-xl shadow-surface-900/5 px-8 py-12 text-center sm:px-10 animate-fade-up">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-glow" />
            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-scale-in">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-surface-900 mb-2">
            {step.form?.successMessage || "Thanks! Taking you to the next step..."}
          </h2>
          <p className="text-surface-400 text-sm">One moment&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-surface-50 px-4 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
      </div>
      <div className="relative max-w-md mx-auto rounded-3xl border border-surface-200/70 bg-white shadow-xl shadow-surface-900/5 px-8 py-10 sm:px-10 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-surface-900 mb-2 text-center">{step.name}</h1>
        {step.form?.description && (
          <p className="text-surface-500 text-center mb-8 leading-relaxed">{step.form.description}</p>
        )}
        {!step.form?.description && <div className="mb-8" />}

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
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
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
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ThankYouStep({ step, funnelName, siteSlug, funnelId, siteName }: { step: PublicFunnelStep; funnelName: string; siteSlug: string; funnelId: string; siteName: string }) {
  const redirectUrl = typeof step.settings.redirectUrl === "string" ? step.settings.redirectUrl : undefined;
  const delaySeconds = typeof step.settings.delaySeconds === "number" ? step.settings.delaySeconds : undefined;
  const buttonText = typeof step.settings.buttonText === "string" ? step.settings.buttonText : "Continue";
  const trackedRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);

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
    if (!redirectUrl || delaySeconds === undefined) return;
    if (secondsLeft === undefined || secondsLeft <= 0) {
      window.location.href = redirectUrl;
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [redirectUrl, delaySeconds, secondsLeft]);

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-surface-50 flex items-center justify-center px-4 py-16">
      {/* Soft branded backdrop — two large, blurred color blooms instead of a
          flat white void */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-accent-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="rounded-3xl border border-surface-200/70 bg-white shadow-xl shadow-surface-900/5 px-8 py-12 text-center sm:px-10">
          {/* Success mark — layered rings behind a solid check circle reads
              far more like a genuine confirmation than a lone emoji */}
          <div className="relative mx-auto mb-7 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-glow" />
            <div className="absolute inset-2 rounded-full bg-emerald-50" />
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-scale-in">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-surface-900 mb-3 leading-tight">
            {step.name || "You're all set!"}
          </h1>
          <p className="text-surface-500 text-base leading-relaxed mb-8">
            We&apos;ve received your submission and {siteName} will be in touch soon.
          </p>

          {redirectUrl ? (
            <a
              href={redirectUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {buttonText}
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          ) : (
            <a
              href={`/store/${siteSlug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-200 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Back to {siteName}
            </a>
          )}

          {redirectUrl && delaySeconds !== undefined && secondsLeft !== undefined && secondsLeft > 0 && (
            <p className="mt-4 text-xs text-surface-400">
              Redirecting automatically in {secondsLeft}s&hellip;
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-surface-400">
          Powered by {siteName}
        </p>
      </div>
    </div>
  );
}
