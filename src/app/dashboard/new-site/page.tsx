'use client';
import { ArrowLeft, ArrowRight, Check, Loader2, X, MessageSquare } from "lucide-react";
import { FileText, Globe, Layout, Link as LinkIcon, Palette, ShoppingBag, Sparkles, Square, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TemplateSelector from '@/components/templates/TemplateSelector';
import { clearOnboardingDraft, saveOnboardingDraft } from '@/lib/onboarding-draft';
import { useOnboardingDraft } from '@/hooks/useOnboardingDraft';
import { useAuth } from '@/context/AuthContext';

async function parseResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Server returned non-JSON (e.g. HTML error page)
    console.error("Non-JSON response:", text.slice(0, 200));
    return { success: false, error: `Server error (${response.status}). Please try again.` } as T;
  }
}

const INDUSTRIES = [
  { id: 'fashion', emoji: '👗', name: 'Fashion & Clothing' },
  { id: 'electronics', emoji: '📱', name: 'Electronics & Gadgets' },
  { id: 'food', emoji: '🍽️', name: 'Food & Restaurant' },
  { id: 'beauty', emoji: '💄', name: 'Beauty & Skincare' },
  { id: 'health', emoji: '💪', name: 'Health & Wellness' },
  { id: 'real-estate', emoji: '🏠', name: 'Real Estate' },
  { id: 'education', emoji: '📚', name: 'Education' },
  { id: 'healthcare', emoji: '🏥', name: 'Healthcare' },
  { id: 'agency', emoji: '🏢', name: 'Agency' },
  { id: 'church', emoji: '⛪', name: 'Church & Ministry' },
  { id: 'ngo', emoji: '🤝', name: 'NGO & Non-Profit' },
  { id: 'construction', emoji: '🏗️', name: 'Construction' },
  { id: 'auto', emoji: '🚗', name: 'Automotive' },
  { id: 'art', emoji: '🎨', name: 'Art & Crafts' },
  { id: 'sports', emoji: '⚽', name: 'Sports & Fitness' },
  { id: 'services', emoji: '🛠️', name: 'Professional Services' },
  { id: 'other', emoji: '🏪', name: 'Other' },
];

const LAUNCH_METHODS = [
  { id: 'quick', icon: Zap, title: 'Build with AI', desc: 'Let AI help you build your site quickly', color: 'border-emerald-500 bg-emerald-50' },
  { id: 'template', icon: Layout, title: 'Use a Template', desc: 'Pick a professionally designed template', color: 'border-blue-500 bg-blue-50' },
  { id: 'blank', icon: Square, title: 'Blank Canvas', desc: 'Start from scratch', color: 'border-gray-500 bg-gray-50' },
];

const PAYMENT_GATEWAYS = [
  { id: 'paystack', name: 'Paystack', logo: '💳', desc: 'Cards, bank transfer, USSD' },
  { id: 'flutterwave', name: 'Flutterwave', logo: '🦋', desc: 'Cards, mobile money, bank' },
  { id: 'monnify', name: 'Monnify', logo: '🏦', desc: 'Bank transfer, cards, USSD' },
];

type SiteType = 'ECOMMERCE' | 'WEBSITE' | 'LANDING_PAGE';
type ScoredTemplate = { slug: string; id?: string; name: string; category: string; description: string; previewImage: string; previewUrl: string; recommendationKeywords: string[]; matchPercent?: number; score?: number; reasons?: string[] };
const asScoredTemplate = (value: unknown): ScoredTemplate | null => (value ? (value as ScoredTemplate) : null);

export default function NewSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const workspaceId = searchParams.get('workspace');
  const templateParam = searchParams.get('template');
  const draft = useOnboardingDraft();

  const [step, setStep] = useState(draft?.currentStep || 1);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const [createError, setCreateError] = useState('');

  // Form state
  const [siteType, setSiteType] = useState<SiteType | null>((draft?.siteType as SiteType | null) || null);
  const [industry, setIndustry] = useState<string | null>(draft?.industry || null);
  const [launchMethod, setLaunchMethod] = useState<string | null>(templateParam ? 'template' : draft?.launchMethod || null);
  const [selectedTemplate, setSelectedTemplate] = useState<ScoredTemplate | null>(asScoredTemplate(draft?.selectedTemplate));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateParam || draft?.selectedTemplateId || null);
  const [businessInfo, setBusinessInfo] = useState({
    name: draft?.businessDetails.name || '',
    description: draft?.businessDetails.description || '',
    logo: draft?.businessDetails.logo || '',
    phone: draft?.businessDetails.phone || '',
    email: draft?.businessDetails.email || '',
    location: draft?.businessDetails.location || '',
    whatsapp: draft?.businessDetails.whatsapp || '',
    instagram: draft?.businessDetails.instagram || '',
    facebook: draft?.businessDetails.facebook || '',
    twitter: draft?.businessDetails.twitter || '',
    tiktok: draft?.businessDetails.tiktok || '',
    products: draft?.businessDetails.products || '',
    services: draft?.businessDetails.services || '',
    targetAudience: draft?.businessDetails.targetAudience || '',
  });
  const [landingConfig, setLandingConfig] = useState({
    leadCaptureEnabled: true,
    whatsappCta: '',
    countdownEnabled: false,
    countdownDate: '',
    paymentLink: '',
    eventRegistrationEnabled: false,
    eventDate: '',
  });
  const [branding, setBranding] = useState({
    primary: '#1B2B4B',
    secondary: '#111827',
    accent: '#F5B731',
    background: '#ffffff',
    text: '#111827',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
  });
  const [selectedGateways, setSelectedGateways] = useState<string[]>([]);
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [customDomain, setCustomDomain] = useState('');
  const [recommendedTemplates, setRecommendedTemplates] = useState<ScoredTemplate[]>(Array.isArray(draft?.recommendations) ? (draft?.recommendations as ScoredTemplate[]) : []);

  // Guided selection state
  const [showGuided, setShowGuided] = useState(false);
  const [guidedInput, setGuidedInput] = useState('');

  // Load workspaces if none specified
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId || '');
  const businessContext = useMemo(() => ({
    businessName: businessInfo.name,
    businessCategory: industry,
    industry,
    description: businessInfo.description,
    products: businessInfo.products.split(',').map((item) => item.trim()).filter(Boolean),
    services: businessInfo.services.split(',').map((item) => item.trim()).filter(Boolean),
    targetAudience: businessInfo.targetAudience,
    siteType,
  }), [businessInfo, industry, siteType]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!workspaceId) {
      const token = localStorage.getItem('token');
      fetch('/api/workspaces', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data.length > 0) {
            setSelectedWorkspace(json.data[0].id);
          }
        });
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!user) return;
    saveOnboardingDraft({
      currentStep: step,
      siteType,
      industry,
      launchMethod,
      businessDetails: { ...businessInfo },
      selectedTemplate,
      selectedTemplateId,
    }, user.id);
  }, [
    user,
    step,
    siteType,
    industry,
    launchMethod,
    businessInfo,
    selectedTemplate,
    selectedTemplateId,
  ]);

  // Scroll to top when entering template selection step (step 5)
  useEffect(() => {
    if (step === 5 && !created) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, created]);

  // ─── Guided Selection Logic ──────────────────────────────
  const GUIDED_RULES: Array<{ keywords: string[]; siteType: SiteType; industry: string }> = [
    { keywords: ['sell', 'shop', 'store', 'product', 'buy', 'order', 'inventory', 'ecommerce', 'retail', 'merchant', 'marketplace'], siteType: 'ECOMMERCE', industry: 'other' },
    { keywords: ['fashion', 'cloth', 'wear', 'dress', 'shirt', 'shoe', 'sneaker', 'apparel', 'boutique', 'tailoring'], siteType: 'ECOMMERCE', industry: 'fashion' },
    { keywords: ['phone', 'laptop', 'gadget', 'electronic', 'tech', 'computer', 'accessori', 'device', 'hardware'], siteType: 'ECOMMERCE', industry: 'electronics' },
    { keywords: ['food', 'restaurant', 'catering', 'kitchen', 'meal', 'chef', 'bakery', 'cafe', 'grill'], siteType: 'ECOMMERCE', industry: 'food' },
    { keywords: ['beauty', 'skincare', 'cosmetic', 'makeup', 'hair', 'salon', 'spa', 'cream', 'perfume'], siteType: 'ECOMMERCE', industry: 'beauty' },
    { keywords: ['health', 'wellness', 'gym', 'fitness', 'supplement', 'vitamin', 'pharma', 'medical', 'clinic', 'hospital'], siteType: 'WEBSITE', industry: 'health' },
    { keywords: ['real estate', 'property', 'house', 'apartment', 'land', 'rent', 'building'], siteType: 'WEBSITE', industry: 'real-estate' },
    { keywords: ['school', 'education', 'course', 'learn', 'tutor', 'training', 'academy', 'university'], siteType: 'WEBSITE', industry: 'education' },
    { keywords: ['church', 'ministry', 'pastor', 'worship', 'faith', 'sermon', 'congregation'], siteType: 'WEBSITE', industry: 'church' },
    { keywords: ['ngo', 'non-profit', 'nonprofit', 'charity', 'foundation', 'donate', 'volunteer'], siteType: 'WEBSITE', industry: 'ngo' },
    { keywords: ['agency', 'marketing', 'design', 'brand', 'consult', 'freelance', 'creative'], siteType: 'WEBSITE', industry: 'agency' },
    { keywords: ['construction', 'building', 'architect', 'contractor', 'plumb', 'electric'], siteType: 'WEBSITE', industry: 'construction' },
    { keywords: ['car', 'auto', 'vehicle', 'mechanic', 'motor', 'garage', 'spare part'], siteType: 'WEBSITE', industry: 'auto' },
    { keywords: ['art', 'craft', 'handmade', 'painting', 'draw', 'sculpture', 'pottery'], siteType: 'ECOMMERCE', industry: 'art' },
    { keywords: ['sport', 'fitness', 'football', 'basketball', 'athlet', 'jersey', 'equipment'], siteType: 'ECOMMERCE', industry: 'sports' },
    { keywords: ['service', 'cleaning', 'laundry', 'repair', 'plumber', 'delivery', 'logistics'], siteType: 'WEBSITE', industry: 'services' },
    { keywords: ['landing', 'launch', 'waitlist', 'coming soon', 'single page', 'one page', 'lead', 'funnel', 'campaign'], siteType: 'LANDING_PAGE', industry: 'other' },
    { keywords: ['portfolio', 'showcase', 'gallery', 'personal', 'cv', 'resume'], siteType: 'WEBSITE', industry: 'other' },
  ];

  const [classifying, setClassifying] = useState(false);

  const classifyGuidedInputLocally = (input: string): { siteType: SiteType; industry: string } => {
    const lower = input.toLowerCase();
    let bestMatch: { siteType: SiteType; industry: string; score: number } = { siteType: 'ECOMMERCE', industry: 'other', score: 0 };
    for (const rule of GUIDED_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) score++;
      }
      if (score > bestMatch.score) {
        bestMatch = { siteType: rule.siteType, industry: rule.industry, score };
      }
    }
    return { siteType: bestMatch.siteType, industry: bestMatch.industry };
  };

  const handleGuidedSubmit = async () => {
    if (guidedInput.trim().length < 3) return;
    setClassifying(true);

    let result = classifyGuidedInputLocally(guidedInput);
    let aiName: string | undefined;
    let aiTagline: string | undefined;

    try {
      const res = await fetch("/api/ai/classify-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: guidedInput }),
      });
      const json = await res.json();
      if (json?.success && json.data?.classified) {
        result = { siteType: json.data.siteType, industry: json.data.industry };
        aiName = json.data.suggestedName;
        aiTagline = json.data.suggestedTagline;
      }
    } catch {
      // network error — keep the local keyword-match result
    }

    setClassifying(false);
    setSiteType(result.siteType);
    setIndustry(result.industry);
    if (aiName) setBusinessInfo((prev) => ({ ...prev, name: prev.name || aiName!, description: prev.description || aiTagline || guidedInput }));
    setLaunchMethod('quick'); // Auto-select "Build with AI"
    setShowGuided(false);
    setGuidedInput('');
    setStep(4); // Skip straight to business info — type, industry, and method are all set
  };

  const totalSteps = 7;
  const canProceed = () => {
    switch (step) {
      case 1: return !!siteType;
      case 2: return siteType === 'LANDING_PAGE' || !!industry;
      case 3: return !!launchMethod;
      case 4: return businessInfo.name.trim().length >= 2;
      case 5: return launchMethod === 'blank' || launchMethod === 'quick' || !!selectedTemplateId;
      case 6: return true; // payment optional
      case 7: return true; // domain optional
      default: return false;
    }
  };

  const createSite = async () => {
    if (creating) return;
    setCreating(true);
    setCreateError('');

    try {
      const wsId = selectedWorkspace || workspaceId;

      // Create workspace if none exist
      let finalWsId = wsId;
      if (!finalWsId) {
        const wsRes = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ name: businessInfo.name.trim() }),
        });
        const wsJson = await wsRes.json();
        if (wsJson.success) finalWsId = wsJson.data.id;
        else throw new Error(wsJson.error || 'Failed to create workspace');
      }

      const res = await fetch(`/api/workspaces/${finalWsId}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          siteType,
          industry,
          launchMethod,
          templateId: selectedTemplateId,
          templateSlug: selectedTemplate?.slug || selectedTemplateId || null,
          name: businessInfo.name.trim(),
          description: businessInfo.description,
          logo: businessInfo.logo || null,
          phone: businessInfo.phone,
          businessType: industry || 'general',
          products: businessInfo.products.split(',').map(item => item.trim()).filter(Boolean),
          services: businessInfo.services.split(',').map(item => item.trim()).filter(Boolean),
          targetAudience: businessInfo.targetAudience,
          landingPageConfig: siteType === 'LANDING_PAGE' ? landingConfig : undefined,
          branding: {
            logo: businessInfo.logo || undefined,
            colors: {
              primary: branding.primary,
              secondary: branding.secondary,
              accent: branding.accent,
              background: branding.background,
              text: branding.text,
            },
            fonts: {
              heading: branding.headingFont,
              body: branding.bodyFont,
            },
          },
          socialLinks: {
            whatsapp: businessInfo.whatsapp,
            instagram: businessInfo.instagram,
            facebook: businessInfo.facebook,
            twitter: businessInfo.twitter,
            tiktok: businessInfo.tiktok,
          },
          customDomain: domainType === 'custom' && customDomain ? customDomain : null,
        }),
      });

      const json = await parseResponse<{ success?: boolean; data?: { id: string }; error?: string }>(res);
      if (!json) {
        throw new Error("The site creation service returned no data. Please try again.");
      }
      if (json.success && json.data) {
        setCreatedSiteId(json.data.id);
        setCreated(true);
        clearOnboardingDraft(user?.id);
        // Scroll to top so the user sees the success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCreateError(json.error || 'Failed to create site');
      }
    } catch (e) {
      console.error(e);
      setCreateError(e instanceof Error ? e.message : 'Failed to create site');
    } finally {
      setCreating(false);
    }
  };

  const handleNext = () => {
    // Landing pages skip the industry step entirely — straight to launch method
    if (step === 1 && siteType === 'LANDING_PAGE') {
      setStep(3);
      return;
    }
    // "Build with AI" skips template selection - go straight to create
    if (step === 4 && launchMethod === 'quick') {
      setStep(5);
      // Auto-trigger site creation for AI path
      setTimeout(() => createSite(), 100);
      return;
    }
    if (step === 5) {
      createSite();
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleFinish = () => {
    if (createdSiteId) {
      localStorage.setItem(`activeSiteId:${user?.id || "guest"}`, createdSiteId);
      localStorage.removeItem('activeSiteId');
      router.push(`/dashboard/sites/${createdSiteId}/customize`);
    }
  };

  // Navigate to dashboard (used by "Skip & Go to Dashboard" button)
  const handleSkipToDashboard = () => {
    if (createdSiteId) {
      localStorage.setItem(`activeSiteId:${user?.id || "guest"}`, createdSiteId);
      localStorage.removeItem('activeSiteId');
    }
    router.push('/dashboard');
  };

  // Publish the site (used by "Publish" button)
  const handlePublish = async () => {
    if (createdSiteId) {
      localStorage.setItem(`activeSiteId:${user?.id || "guest"}`, createdSiteId);
      localStorage.removeItem('activeSiteId');
      // Navigate to customize page where publishing can be managed
      router.push(`/dashboard/sites/${createdSiteId}/customize`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step 1: Choose Site Type */}
        {step === 1 && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What do you want to build?</h1>
            <p className="text-gray-500 mb-8">Choose the type of site that fits your needs</p>
            <div className="grid gap-4">
              {([
                { type: 'ECOMMERCE' as SiteType, icon: ShoppingBag, title: 'Ecommerce Store', desc: 'Sell products and services online. Products, orders, inventory, payments.', color: 'emerald' },
                { type: 'WEBSITE' as SiteType, icon: Globe, title: 'Business Website', desc: 'Build an informational website. Pages, blogs, forms, SEO.', color: 'blue' },
                { type: 'LANDING_PAGE' as SiteType, icon: FileText, title: 'Landing Page', desc: 'Lead generation and conversion. Funnels, CRM, email & WhatsApp marketing.', color: 'purple' },
              ]).map(item => {
                const Icon = item.icon;
                const selected = siteType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setSiteType(item.type)}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition ${
                      selected
                        ? `border-${item.color}-500 bg-${item.color}-50`
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selected ? `bg-${item.color}-100` : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${selected ? `text-${item.color}-600` : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    {selected && <Check className={`w-5 h-5 text-${item.color}-600 mt-1`} />}
                  </button>
                );
              })}

              {/* Guided selection option */}
              <button
                onClick={() => setShowGuided(true)}
                className="flex items-start gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 text-left transition"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Use guided selection</p>
                  <p className="text-sm text-gray-500 mt-0.5">Tell us about your business and we&apos;ll pick the best option for you</p>
                </div>
              </button>

              {/* Guided selection modal */}
              {showGuided && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-gray-900">Guided Selection</h3>
                      </div>
                      <button onClick={() => setShowGuided(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4">
                        Describe what your business does and what you want to build. We&apos;ll recommend the best site type and industry for you.
                      </p>
                      <textarea
                        value={guidedInput}
                        onChange={(e) => setGuidedInput(e.target.value)}
                        placeholder="e.g. I sell handmade bags and accessories online, mostly through Instagram and WhatsApp..."
                        className="w-full h-32 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-300"
                        autoFocus
                      />
                      <button
                        onClick={handleGuidedSubmit}
                        disabled={guidedInput.trim().length < 3 || classifying}
                        className="w-full mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 text-sm hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {classifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Find My Best Match
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Choose Industry */}
        {step === 2 && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your industry?</h1>
            <p className="text-gray-500 mb-8">This helps us customize templates and features for you</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    industry === ind.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{ind.emoji}</span>
                  <p className="text-sm font-medium text-gray-900 mt-2">{ind.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Launch Method */}
        {step === 3 && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">How do you want to start?</h1>
            <p className="text-gray-500 mb-8">Choose your preferred launch method</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {LAUNCH_METHODS.map(method => {
                const Icon = method.icon;
                const selected = launchMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setLaunchMethod(method.id)}
                    className={`p-6 rounded-xl border-2 text-left transition ${
                      selected ? method.color : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${selected ? 'text-gray-900' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">{method.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{method.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Business Information */}
        {step === 4 && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {siteType === 'LANDING_PAGE' ? 'Tell us about your campaign' : 'Tell us about your business'}
            </h1>
            <p className="text-gray-500 mb-8">This information will appear on your {siteType === 'LANDING_PAGE' ? 'page' : 'site'}</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                <input
                  type="text"
                  value={businessInfo.name}
                  onChange={e => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  placeholder="e.g. Prokip Technologies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={businessInfo.description}
                  onChange={e => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  rows={3}
                  placeholder="What does your business do?"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {siteType === 'LANDING_PAGE' ? (
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
                    <input
                      type="text"
                      value={businessInfo.targetAudience}
                      onChange={e => setBusinessInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                      placeholder="Who is this campaign for?"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Products</label>
                      <input
                        type="text"
                        value={businessInfo.products}
                        onChange={e => setBusinessInfo(prev => ({ ...prev, products: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="dresses, shoes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Services</label>
                      <input
                        type="text"
                        value={businessInfo.services}
                        onChange={e => setBusinessInfo(prev => ({ ...prev, services: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="delivery, styling"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
                      <input
                        type="text"
                        value={businessInfo.targetAudience}
                        onChange={e => setBusinessInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="families, founders"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={businessInfo.phone}
                    onChange={e => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={businessInfo.email}
                    onChange={e => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="hello@business.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={businessInfo.location}
                  onChange={e => setBusinessInfo(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  placeholder="Lagos, Nigeria"
                />
              </div>

              {siteType === 'LANDING_PAGE' && (
                <div className="border border-purple-100 bg-purple-50/50 rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Campaign details</h3>

                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <span className="text-sm text-gray-700">Collect leads with a capture form</span>
                    <input
                      type="checkbox"
                      checked={landingConfig.leadCaptureEnabled}
                      onChange={e => setLandingConfig(prev => ({ ...prev, leadCaptureEnabled: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp CTA number</label>
                    <input
                      type="tel"
                      value={landingConfig.whatsappCta}
                      onChange={e => setLandingConfig(prev => ({ ...prev, whatsappCta: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment link (optional)</label>
                    <input
                      type="url"
                      value={landingConfig.paymentLink}
                      onChange={e => setLandingConfig(prev => ({ ...prev, paymentLink: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                      placeholder="Paystack/Flutterwave payment link"
                    />
                    <p className="text-xs text-gray-500 mt-1">A single link for one-off payments — not a full store checkout.</p>
                  </div>

                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <span className="text-sm text-gray-700">Add a countdown timer</span>
                    <input
                      type="checkbox"
                      checked={landingConfig.countdownEnabled}
                      onChange={e => setLandingConfig(prev => ({ ...prev, countdownEnabled: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </label>
                  {landingConfig.countdownEnabled && (
                    <input
                      type="datetime-local"
                      value={landingConfig.countdownDate}
                      onChange={e => setLandingConfig(prev => ({ ...prev, countdownDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    />
                  )}

                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <span className="text-sm text-gray-700">This is for an event or webinar</span>
                    <input
                      type="checkbox"
                      checked={landingConfig.eventRegistrationEnabled}
                      onChange={e => setLandingConfig(prev => ({ ...prev, eventRegistrationEnabled: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </label>
                  {landingConfig.eventRegistrationEnabled && (
                    <input
                      type="datetime-local"
                      value={landingConfig.eventDate}
                      onChange={e => setLandingConfig(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    />
                  )}
                </div>
              )}

              {/* Social Links (collapsible) */}
              <details className="border border-gray-100 rounded-lg">
                <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
                  Social Links (optional)
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  {(['whatsapp', 'instagram', 'facebook', 'twitter', 'tiktok'] as const).map(platform => (
                    <input
                      key={platform}
                      type="text"
                      value={businessInfo[platform]}
                      onChange={e => setBusinessInfo(prev => ({ ...prev, [platform]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none text-sm"
                      placeholder={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    />
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Step 5: AI Build / Theme Package Selection + Theme Customization */}
        {step === 5 && !created && (
          <div className="fade-in py-10">
            {creating ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {launchMethod === 'quick' ? 'AI is building your store...' : 'Creating your site...'}
                </h1>
                <p className="text-gray-500">
                  {launchMethod === 'quick'
                    ? `Setting up ${businessInfo.name} with a professional marketplace layout, product grids, and all the essentials`
                    : 'Selecting a template, generating pages, and cloning your theme config'}
                </p>
                {launchMethod === 'quick' && (
                  <div className="mt-6 max-w-sm mx-auto space-y-2">
                    {['Generating store layout', 'Setting up product sections', 'Configuring categories', 'Adding store features'].map((text, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-400 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {launchMethod === 'blank' ? 'Ready to create your site' : 'Choose a template'}
                  </h1>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    We&apos;ll create a {siteType === 'ECOMMERCE' ? 'store' : siteType === 'WEBSITE' ? 'website' : 'landing page'} for
                    <strong> {businessInfo.name}</strong> in the <strong>{INDUSTRIES.find(i => i.id === industry)?.name}</strong> industry.
                  </p>
                </div>
                {launchMethod === 'template' && (
                  <div className="mt-8">
                    <TemplateSelector
                      industry={industry}
                      siteType={siteType}
                      selectedSlug={selectedTemplate?.slug || null}
                      onSelect={(t) => {
                        setSelectedTemplate({ slug: t.slug, name: t.name, category: t.category, description: t.description, previewImage: t.previewImage, previewUrl: t.previewUrl, recommendationKeywords: t.industries });
                        setSelectedTemplateId(t.slug);
                        setTimeout(() => {
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }, 100);
                      }}
                    />
                    {selectedTemplate && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-4">
                        <div className="text-sm text-emerald-800">
                          ✅ Selected <strong>{selectedTemplate.name}</strong>
                        </div>
                        <button
                          onClick={createSite}
                          disabled={creating}
                          className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-semibold whitespace-nowrap"
                        >
                          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {creating ? 'Creating...' : 'Create Site'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {createError && <p className="mt-4 text-center text-sm font-medium text-red-600">{createError}</p>}
              </>
            )}
          </div>
        )}

        {step === 5 && created && (
          <div className="fade-in text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your site is ready! 🎉</h1>
            <p className="text-gray-500 mb-2">
              <strong>{businessInfo.name}</strong> has been created successfully.
            </p>
            <p className="text-sm text-gray-400 mb-8">You can connect payments and set a custom domain in the next steps, or skip to your dashboard.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800"
              >
                Customize Site <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleSkipToDashboard}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Connect Payment */}
        {step === 6 && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Payment Gateway</h1>
            <p className="text-gray-500 mb-8">Choose how you want to receive payments (you can set this up later)</p>
            <div className="space-y-3">
              {PAYMENT_GATEWAYS.map(gw => {
                const selected = selectedGateways.includes(gw.id);
                return (
                  <button
                    key={gw.id}
                    onClick={() => setSelectedGateways(prev =>
                      selected ? prev.filter(g => g !== gw.id) : [...prev, gw.id]
                    )}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${
                      selected ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">{gw.logo}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{gw.name}</p>
                      <p className="text-sm text-gray-500">{gw.desc}</p>
                    </div>
                    {selected && <Check className="w-5 h-5 text-gray-900" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: Domain */}
        {step === 7 && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Domain</h1>
            <p className="text-gray-500 mb-8">Choose how people will access your site</p>
            <div className="space-y-4">
              <button
                onClick={() => setDomainType('subdomain')}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition ${
                  domainType === 'subdomain' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <Globe className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">Free Subdomain</p>
                  <p className="text-sm text-gray-500">your-site.prokip.site</p>
                </div>
              </button>

              <button
                onClick={() => setDomainType('custom')}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition ${
                  domainType === 'custom' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <LinkIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">Custom Domain</p>
                  <p className="text-sm text-gray-500">yoursite.com</p>
                </div>
              </button>

              {domainType === 'custom' && (
                <input
                  type="text"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  placeholder="yourdomain.com"
                />
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              if (step === 3 && siteType === 'LANDING_PAGE') { setStep(1); return; }
              if (step > 1) { setStep(step - 1); return; }
              router.back();
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex gap-3">
            {step >= 6 && (
              <button
                onClick={handleSkipToDashboard}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 transition"
              >
                Skip & Go to Dashboard
              </button>
            )}
            {step === 7 ? (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Publish <Check className="w-4 h-4" />
              </button>
            ) : step === 5 && created ? (
              <button
                onClick={() => setStep(6)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed() || creating}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 transition font-medium"
              >
                {step === 5 && !created ? (
                  creating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Import Package</>
                  )
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
