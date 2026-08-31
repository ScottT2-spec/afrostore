"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { injectPixels, trackEvent, type PixelIds } from "@/lib/storefront-analytics";
import { useFunnelStepABTestVariant, applyABTestOverrides } from "@/hooks/useABTestVariant";
import { TemplateStoreContextProvider } from "@/components/storefront/TemplateStoreContextProvider";
import { getDirectNextStepId, type FlowStep } from "@/lib/funnel-flow";

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
  steps: FlowStep[];
  pixelIds: PixelIds;
}

export default function FunnelStepView({ siteSlug, siteName, siteLogo, currency, templateSlug, funnelId, funnelName, step, steps, pixelIds }: Props) {
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
    // CartFlows parity (get_direct_next_step_id): advance to the next
    // step that isn't disabled, not just position + 1 — a disabled step
    // in between gets skipped rather than shown.
    const nextStepId = getDirectNextStepId(steps, step.id);
    const nextStep = nextStepId ? steps.find((s) => s.id === nextStepId) : null;
    const nextPosition = nextStep ? nextStep.position : step.position + 1;
    router.push(`/store/${siteSlug}/f/${funnelId}?step=${nextPosition}`);
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
          <LandingStep blocks={step.landingBlocks} storeSlug={siteSlug} funnelStepId={step.id} onContinue={goToNextStep} isLastStep={step.isLastStep} settings={step.settings} currency={currency} templateSlug={templateSlug} />
        )}
        {step.type === "LEAD_FORM" && (
          <LeadFormStep siteSlug={siteSlug} funnelId={funnelId} step={step} onSubmitted={goToNextStep} />
        )}
        {step.type === "THANK_YOU" && <ThankYouStep step={step} funnelName={funnelName} siteSlug={siteSlug} funnelId={funnelId} />}
        {step.type === "CHECKOUT" && <CheckoutStep siteSlug={siteSlug} funnelId={funnelId} step={step} />}
        {!["LANDING", "LEAD_FORM", "THANK_YOU", "CHECKOUT"].includes(step.type) && (
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

function CheckoutStep({ siteSlug, funnelId, step }: { siteSlug: string; funnelId: string; step: PublicFunnelStep }) {
  // Redirects straight into the storefront's checkout, passing this
  // funnel + step as context so a confirmed order redirects to this
  // funnel's next THANK_YOU step (see checkout/page.tsx's
  // redirectToFunnelThankYou) instead of showing the generic success
  // screen — the same role CartFlows' checkout step plays via its
  // woocommerce_get_checkout_order_received_url filter.
  useEffect(() => {
    const params = new URLSearchParams({ funnelId, funnelStepId: step.id });
    window.location.href = `/checkout?${params.toString()}`;
  }, [funnelId, step.id]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-surface-500">Taking you to checkout…</p>
    </div>
  );
}

function ThankYouStep({ step, funnelName, siteSlug, funnelId }: { step: PublicFunnelStep; funnelName: string; siteSlug: string; funnelId: string }) {
  const redirectUrl = typeof step.settings.redirectUrl === "string" ? step.settings.redirectUrl : undefined;
  const delaySeconds = typeof step.settings.delaySeconds === "number" ? step.settings.delaySeconds : undefined;
  const buttonText = typeof step.settings.buttonText === "string" ? step.settings.buttonText : "Continue";
  const trackedRef = useRef(false);

  // Order confirmation, when this thank-you was reached via a funnel
  // CHECKOUT step's redirect (?order=&key=) — CartFlows' equivalent
  // thank-you template shows the same order-number confirmation.
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    if (order) setOrderNumber(order);
  }, []);

  // THANK_YOU_VIEW — the final confirmation that the funnel's conversion
  // was actually reached (page_view on this step already fired above, but
  // recording it distinctly here is what lets the dashboard tell "step was
  // viewed" apart from "conversion was confirmed".
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
      {orderNumber ? (
        <p className="text-surface-500 mb-8">
          Order <span className="font-mono font-bold text-surface-900">{orderNumber}</span> confirmed. We&apos;ll be in touch soon.
        </p>
      ) : (
        <p className="text-surface-500 mb-8">
          We&apos;ve received your submission for {funnelName}. We&apos;ll be in touch soon.
        </p>
      )}
      {redirectUrl && (
        <a href={redirectUrl} className="btn-primary inline-block px-8 py-3.5 text-base">{buttonText}</a>
      )}
    </div>
  );
}
