"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Upload,
  Palette,
  CreditCard,
  Globe,
  Rocket,
  Store,
  Shirt,
  UtensilsCrossed,
  Gem,
  Smartphone,
  Flower2,
  BookOpen,
  Package,
  Building2,
  MessageCircle,
  Bot,
  Loader2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const businessTypes = [
  { id: "fashion", label: "Fashion & Apparel", icon: Shirt, color: "from-pink-500 to-rose-500" },
  { id: "beauty", label: "Beauty & Skincare", icon: Flower2, color: "from-purple-500 to-fuchsia-500" },
  { id: "food", label: "Food & Restaurant", icon: UtensilsCrossed, color: "from-accent-400 to-accent-600" },
  { id: "jewelry", label: "Jewelry & Accessories", icon: Gem, color: "from-amber-400 to-yellow-500" },
  { id: "electronics", label: "Electronics & Gadgets", icon: Smartphone, color: "from-blue-500 to-cyan-500" },
  { id: "general", label: "General Store", icon: Package, color: "from-green-500 to-emerald-500" },
  { id: "services", label: "Services & Booking", icon: BookOpen, color: "from-indigo-500 to-violet-500" },
  { id: "other", label: "Other", icon: Store, color: "from-slate-500 to-zinc-500" },
];

const templates = [
  { id: "1", name: "Lagos Fashion", gradient: "from-purple-500 via-pink-500 to-orange-400", popular: true },
  { id: "2", name: "Nairobi Fresh", gradient: "from-accent-400 via-accent-500 to-brand-600" },
  { id: "3", name: "Accra Beauty", gradient: "from-rose-400 via-fuchsia-500 to-indigo-500" },
  { id: "4", name: "Kigali Minimal", gradient: "from-emerald-500 via-green-500 to-teal-400" },
  { id: "5", name: "Abuja Tech", gradient: "from-blue-500 via-cyan-500 to-teal-400" },
  { id: "6", name: "Dakar Luxe", gradient: "from-amber-400 via-yellow-500 to-orange-400" },
];

const paymentGateways = [
  { id: "monnify", name: "Monnify", desc: "Bank transfers, USSD, cards", logo: "M", gradient: "from-blue-600 to-blue-700" },
  { id: "paystack", name: "Paystack", desc: "Cards, mobile money, bank", logo: "P", gradient: "from-cyan-500 to-blue-500" },
  { id: "flutterwave", name: "Flutterwave", desc: "Pan-African payments", logo: "F", gradient: "from-orange-400 to-amber-500" },
];

const steps = [
  { number: 1, label: "Business Type" },
  { number: 2, label: "Store Details" },
  { number: 3, label: "Template" },
  { number: 4, label: "Payments" },
  { number: 5, label: "Launch" },
];

export default function NewStorePage() {
  const { refreshStores } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedGateways, setSelectedGateways] = useState<string[]>([]);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState<string[]>([]);
  const [aiError, setAiError] = useState("");
  const [launched, setLaunched] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [createdStore, setCreatedStore] = useState<{ subdomain: string; id: string } | null>(null);
  const [generatedPages, setGeneratedPages] = useState<Array<{ id: string; title: string; slug: string; type: string }>>([]);

  const toggleGateway = (id: string) => {
    setSelectedGateways((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    setAiError("");
    setAiProgress(["Analyzing your business type"]);

    try {
      // Step 1: Create the store first
      setAiProgress(["Analyzing your business type", "Creating your store"]);
      const storeRes = await api.post<{ id: string; subdomain: string; name: string }>("/api/stores", {
        name: storeName || "My Store",
        description: storeDescription || undefined,
        businessType: selectedType || "general",
        country: "NG",
        currency: "NGN",
      });

      if (!storeRes.success || !storeRes.data) {
        throw new Error(storeRes.error || "Failed to create store");
      }

      const newStore = storeRes.data;
      setCreatedStore({ subdomain: newStore.subdomain, id: newStore.id });
      await refreshStores();

      // Step 2: Generate pages with AI
      setAiProgress(["Analyzing your business type", "Creating your store", "Generating homepage & content"]);

      await new Promise((r) => setTimeout(r, 500)); // small pause so user sees progress

      setAiProgress([
        "Analyzing your business type",
        "Creating your store",
        "Generating homepage & content",
        "Writing About page & brand story",
      ]);

      const genRes = await api.post<{
        pages: Array<{ id: string; title: string; slug: string; type: string }>;
        provider: string;
        model: string;
      }>(`/api/stores/${newStore.id}/ai/generate-store`, {
        storeName: storeName || "My Store",
        businessType: selectedType || "general",
        description: storeDescription || undefined,
      });

      if (!genRes.success || !genRes.data) {
        // Store was created but AI generation failed — still continue
        console.error("AI generation failed:", genRes.error);
        setAiProgress([
          "Analyzing your business type",
          "Creating your store",
          "Generating homepage & content",
          "Writing About page & brand story",
          "Building FAQ & policies",
          "⚠️ AI content generation had issues — you can use the AI assistant later to generate pages",
        ]);
        await new Promise((r) => setTimeout(r, 2000));
        setAiGenerating(false);
        setSelectedTemplate("1");
        setCurrentStep(4);
        return;
      }

      setGeneratedPages(genRes.data.pages);

      setAiProgress([
        "Analyzing your business type",
        "Creating your store",
        "Generating homepage & content",
        "Writing About page & brand story",
        "Building FAQ & policies",
        "Optimizing for mobile & SEO",
      ]);

      await new Promise((r) => setTimeout(r, 1000));

      setAiGenerating(false);
      setSelectedTemplate("1");
      // Skip template selection — AI already built the pages. Go to payments.
      setCurrentStep(4);
    } catch (err) {
      console.error("AI store generation error:", err);
      setAiError((err as Error).message || "Something went wrong. Please try again.");
      setAiGenerating(false);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError("");
    try {
      // If AI flow already created the store, just mark as launched
      if (useAI && createdStore) {
        setLaunched(true);
        setLaunching(false);
        return;
      }

      // Manual flow — create the store now
      const res = await api.post<{ id: string; subdomain: string; name: string }>("/api/stores", {
        name: storeName || "My Store",
        description: storeDescription || undefined,
        businessType: selectedType || "general",
        country: "NG",
        currency: "NGN",
        logo: storeLogo || undefined,
      });
      if (res.success && res.data) {
        setCreatedStore({ subdomain: res.data.subdomain, id: res.data.id });
        setLaunched(true);
        await refreshStores();
      } else {
        setLaunchError(res.error || "Failed to create store. Please try again.");
      }
    } catch {
      setLaunchError("Something went wrong. Please try again.");
    }
    setLaunching(false);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-surface-900">
              Create Store
            </span>
          </Link>
          <Link href="/dashboard" className="p-2 rounded-lg text-surface-400 hover:bg-surface-100">
            <X className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      step.number < currentStep
                        ? "bg-brand-600 text-white"
                        : step.number === currentStep
                          ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500"
                          : "bg-surface-100 text-surface-400"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block truncate ${step.number <= currentStep ? "text-surface-900" : "text-surface-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${step.number < currentStep ? "bg-brand-500" : "bg-surface-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Step 1: Business Type */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
                What type of business is this?
              </h2>
              <p className="text-surface-500 mt-2">
                This helps us give you the best templates and features.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {businessTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                      selectedType === type.id
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                        : "border-surface-200 bg-white hover:border-surface-300"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-surface-900 text-center">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => selectedType && setCurrentStep(2)}
                disabled={!selectedType}
                className="btn-primary text-base py-3.5 px-10"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Store Details */}
        {currentStep === 2 && (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
                Tell us about your store
              </h2>
              <p className="text-surface-500 mt-2">
                Basic info to get you started.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Store name</label>
                <input
                  type="text"
                  className="input-field text-lg"
                  placeholder="e.g., Amara's Fashion"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                {storeName && (
                  <p className="text-xs text-surface-400 mt-1.5 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.afrostore.com
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Store description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="What do you sell? Who are your customers?"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                />
              </div>

              <SingleImageUpload
                image={storeLogo}
                onChange={setStoreLogo}
                label="Logo (optional)"
              />

              {/* AI or Manual */}
              <div className="rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-100 p-5">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-surface-900">Let AI build your store?</h4>
                    <p className="text-xs text-surface-500 mt-0.5">
                      AI will generate your homepage, product pages, about page, policies, SEO — everything. Takes about 60 seconds.
                    </p>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => { setUseAI(true); handleAIGenerate(); }} className="btn-primary text-xs py-2 px-4">
                        <Sparkles className="h-3.5 w-3.5" />
                        Yes, use AI
                      </button>
                      <button onClick={() => { setUseAI(false); setCurrentStep(3); }} className="btn-ghost text-xs py-2 px-4">
                        No, I&apos;ll pick a template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Error */}
            {aiError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">AI generation failed</p>
                  <p className="mt-1">{aiError}</p>
                  <button
                    onClick={() => { setAiError(""); handleAIGenerate(); }}
                    className="mt-2 text-red-800 underline font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Try again
                  </button>
                </div>
              </div>
            )}

            {/* AI Generating State */}
            {aiGenerating && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
                <div className="text-center max-w-md">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mx-auto mb-6 animate-glow shadow-xl shadow-brand-500/25">
                    <Sparkles className="h-10 w-10 animate-pulse" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">AI is building your store...</h2>
                  <p className="text-surface-500 mb-8">
                    Creating your homepage, about page, FAQ, policies, and SEO — all tailored to your business.
                  </p>
                  <div className="space-y-3 text-left max-w-sm mx-auto">
                    {[
                      "Analyzing your business type",
                      "Creating your store",
                      "Generating homepage & content",
                      "Writing About page & brand story",
                      "Building FAQ & policies",
                      "Optimizing for mobile & SEO",
                    ].map((label, i) => {
                      const isDone = i < aiProgress.length;
                      const isCurrent = i === aiProgress.length - 1;
                      const isWarning = aiProgress[i]?.startsWith("⚠️");
                      return (
                        <div key={label} className="flex items-center gap-3">
                          {isWarning ? (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          ) : isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-brand-500" />
                          ) : isCurrent ? (
                            <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-surface-200" />
                          )}
                          <span className={`text-sm ${
                            isWarning ? "text-amber-700 font-medium" :
                            isDone ? "text-surface-900 font-medium" :
                            "text-surface-400"
                          }`}>
                            {isWarning ? aiProgress[i] : label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!aiGenerating && !useAI && (
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentStep(1)} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button onClick={() => setCurrentStep(3)} disabled={!storeName} className="btn-primary">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Template Selection */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
                Choose a template
              </h2>
              <p className="text-surface-500 mt-2">
                Pick a starting point. You can customize everything later.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                    selectedTemplate === t.id
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "border-surface-200 hover:border-surface-300"
                  }`}
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${t.gradient} relative`}>
                    {t.popular && (
                      <span className="absolute top-2 right-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Popular
                      </span>
                    )}
                    {selectedTemplate === t.id && (
                      <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-3 flex flex-col">
                      <div className="h-3 w-14 rounded bg-white/30 mb-2" />
                      <div className="flex-1 flex gap-1.5">
                        <div className="flex-1 space-y-1"><div className="h-2 w-3/4 rounded bg-white/25" /><div className="h-2 w-1/2 rounded bg-white/15" /><div className="mt-2 h-5 w-14 rounded bg-white/30" /></div>
                        <div className="w-1/3 rounded bg-white/15" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <span className="text-sm font-semibold text-surface-900">{t.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentStep(2)} className="btn-ghost"><ArrowLeft className="h-4 w-4" />Back</button>
              <button onClick={() => setCurrentStep(4)} disabled={!selectedTemplate} className="btn-primary">Continue<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* Step 4: Payments */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
                Connect payments
              </h2>
              <p className="text-surface-500 mt-2">
                Select at least one payment gateway. You can set up the keys later.
              </p>
            </div>

            <div className="space-y-3">
              {paymentGateways.map((gw) => (
                <button
                  key={gw.id}
                  onClick={() => toggleGateway(gw.id)}
                  className={`w-full flex items-center gap-4 rounded-2xl border-2 p-5 transition-all text-left ${
                    selectedGateways.includes(gw.id)
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                      : "border-surface-200 bg-white hover:border-surface-300"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gw.gradient} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                    {gw.logo}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-surface-900">{gw.name}</h4>
                    <p className="text-xs text-surface-500">{gw.desc}</p>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedGateways.includes(gw.id) ? "border-brand-500 bg-brand-500" : "border-surface-300"}`}>
                    {selectedGateways.includes(gw.id) && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setCurrentStep(5)} className="text-xs text-surface-400 hover:text-surface-600 mx-auto block">
              Skip for now — I&apos;ll set up payments later
            </button>

            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentStep(3)} className="btn-ghost"><ArrowLeft className="h-4 w-4" />Back</button>
              <button onClick={() => setCurrentStep(5)} className="btn-primary">Continue<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* Step 5: Launch */}
        {currentStep === 5 && !launched && (
          <div className="space-y-8 max-w-lg mx-auto text-center">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/25">
              <Rocket className="h-10 w-10" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
                Ready to launch!
              </h2>
              <p className="text-surface-500 mt-2">
                Your store is configured and ready to go live.
              </p>
            </div>

            <div className="rounded-2xl border border-surface-200 bg-white p-6 text-left space-y-3">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-brand-500" /><span className="text-sm text-surface-700">Business type: <b className="capitalize">{selectedType}</b></span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-brand-500" /><span className="text-sm text-surface-700">Store name: <b>{storeName || "My Store"}</b></span></div>
              {useAI && generatedPages.length > 0 ? (
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-brand-500" />
                  <span className="text-sm text-surface-700">
                    AI generated <b>{generatedPages.length} pages</b>: {generatedPages.map(p => p.title).join(", ")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-brand-500" /><span className="text-sm text-surface-700">Template selected</span></div>
              )}
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-brand-500" /><span className="text-sm text-surface-700">{selectedGateways.length > 0 ? `${selectedGateways.length} payment gateway(s)` : "Payments: setup later"}</span></div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-brand-500" />
                <span className="text-sm text-surface-700">
                  URL: <b>{createdStore?.subdomain || (storeName || "mystore").toLowerCase().replace(/[^a-z0-9]/g, "")}.afrostore.com</b>
                </span>
              </div>
            </div>

            {launchError && (
              <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700 max-w-lg mx-auto">{launchError}</div>
            )}
            <button onClick={handleLaunch} disabled={launching} className="btn-primary text-lg py-4 px-12">
              {launching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
              {launching ? "Creating..." : "Launch My Store"}
            </button>
          </div>
        )}

        {/* Launched! */}
        {launched && (
          <div className="space-y-8 max-w-lg mx-auto text-center py-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mx-auto shadow-2xl shadow-brand-500/30 animate-scale-in">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl font-extrabold text-surface-900 animate-fade-up">
                Your store is live! 🎉
              </h2>
              <p className="text-lg text-surface-500 mt-2 animate-fade-up">
                Congratulations! You&apos;re now ready to start selling.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 animate-fade-up">
              <p className="text-sm text-surface-600 mb-2">Your store URL:</p>
              <p className="text-lg font-bold text-brand-700">
                {createdStore?.subdomain || (storeName || "mystore").toLowerCase().replace(/[^a-z0-9]/g, "")}.afrostore.com
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 animate-fade-up">
              <Link href="/dashboard" className="btn-primary py-3">
                <Store className="h-4 w-4" />
                Go to Dashboard
              </Link>
              <Link href="/dashboard/products" className="btn-secondary py-3">
                <Package className="h-4 w-4" />
                Add Products
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-surface-400 pt-4">
              <span>Share on:</span>
              <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1"><MessageCircle className="h-4 w-4" />WhatsApp</button>
              <button className="text-pink-600 font-semibold hover:text-pink-700">Instagram</button>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Twitter</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
