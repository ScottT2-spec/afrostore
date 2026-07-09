'use client';
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
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
  return JSON.parse(text) as T;
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
  const [branding, setBranding] = useState({
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    background: '#ffffff',
    text: '#111827',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
  });
  const [colorFormats, setColorFormats] = useState<Record<string, 'hex' | 'rgb' | 'hsl'>>({
    primary: 'hex',
    secondary: 'hex',
    accent: 'hex',
    background: 'hex',
    text: 'hex',
  });

  // Color format conversion functions
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return hsl;
    let h = parseInt(match[1], 10) / 360;
    let s = parseInt(match[2], 10) / 100;
    let l = parseInt(match[3], 10) / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const formatColor = (color: string, format: 'hex' | 'rgb' | 'hsl'): string => {
    const hexColor = color.startsWith('#') ? color : (color.startsWith('rgb') ? rgbToHex(color) : (color.startsWith('hsl') ? hslToHex(color) : color));
    if (format === 'hex') return hexColor;
    if (format === 'rgb') return hexToRgb(hexColor);
    if (format === 'hsl') return hexToHsl(hexColor);
    return hexColor;
  };

  const parseColorInput = (value: string, format: 'hex' | 'rgb' | 'hsl'): string => {
    if (format === 'hex') {
      if (!value.startsWith('#')) value = '#' + value;
      return value;
    }
    if (format === 'rgb') {
      if (value.startsWith('#')) return value;
      return value;
    }
    if (format === 'hsl') {
      if (value.startsWith('#')) return value;
      return value;
    }
    return value;
  };
  const [selectedGateways, setSelectedGateways] = useState<string[]>([]);
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [customDomain, setCustomDomain] = useState('');
  const [recommendedTemplates, setRecommendedTemplates] = useState<ScoredTemplate[]>(Array.isArray(draft?.recommendations) ? (draft?.recommendations as ScoredTemplate[]) : []);

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

  const totalSteps = 7;
  const canProceed = () => {
    switch (step) {
      case 1: return !!siteType;
      case 2: return !!industry;
      case 3: return !!launchMethod;
      case 4: return businessInfo.name.trim().length >= 2;
      case 5: return launchMethod === 'blank' || !!selectedTemplateId;
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
                  onClick={() => setSiteType('ECOMMERCE')} // Default to ecommerce for guided selection
                className="flex items-start gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-gray-300 text-left transition"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Use guided selection</p>
                  <p className="text-sm text-gray-500 mt-0.5">Tell us about your business and we’ll guide the category choice</p>
                </div>
              </button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your business</h1>
            <p className="text-gray-500 mb-8">This information will appear on your site</p>
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

        {/* Step 5: Theme Package Selection + Theme Customization */}
        {step === 5 && !created && (
          <div className="fade-in py-10">
            {creating ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Creating your site...</h1>
                <p className="text-gray-500">Selecting a template, generating pages, and cloning your theme config</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {launchMethod === 'blank' ? 'Ready to create your site' : launchMethod === 'template' ? 'Choose a template' : 'Choose a theme package'}
                  </h1>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    We&apos;ll create a {siteType === 'ECOMMERCE' ? 'store' : siteType === 'WEBSITE' ? 'website' : 'landing page'} for
                    <strong> {businessInfo.name}</strong> in the <strong>{INDUSTRIES.find(i => i.id === industry)?.name}</strong> industry.
                  </p>
                </div>
                {launchMethod !== 'blank' && (
                  <div className="mt-8">
                    <TemplateSelector
                      industry={industry}
                      selectedSlug={selectedTemplate?.slug || null}
                      onSelect={(t) => {
                        setSelectedTemplate({ slug: t.slug, name: t.name, category: t.category, description: t.description, previewImage: t.previewImage, previewUrl: t.previewUrl, recommendationKeywords: t.industries });
                        setSelectedTemplateId(t.slug);
                        // Smooth scroll to bottom after template selection so user sees theme customization
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
                {launchMethod !== 'blank' && (
                  <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-5 h-5 text-gray-500" />
                      <h2 className="font-semibold text-gray-900">Theme customization</h2>
                    </div>
                    {/* Color inputs - all visible by default with proper spacing */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map(key => (
                        <div key={key} className="flex flex-col">
                          <label className="text-xs font-medium text-gray-600 capitalize mb-2">{key}</label>
                          <div className="flex items-center gap-2">
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <input
                                type="color"
                                value={branding[key]}
                                onChange={e => setBranding(prev => ({ ...prev, [key]: e.target.value }))}
                                className="absolute inset-0 w-full h-full rounded-lg border border-gray-200 cursor-pointer opacity-0"
                              />
                              <div 
                                className="w-full h-full rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition"
                                style={{ backgroundColor: branding[key] }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={formatColor(branding[key], colorFormats[key])}
                                onChange={e => {
                                  const newValue = parseColorInput(e.target.value, colorFormats[key]);
                                  // Convert to HEX for storage
                                  const hexValue = newValue.startsWith('#') ? newValue : (newValue.startsWith('rgb') ? rgbToHex(newValue) : (newValue.startsWith('hsl') ? hslToHex(newValue) : newValue));
                                  setBranding(prev => ({ ...prev, [key]: hexValue }));
                                }}
                                placeholder={colorFormats[key] === 'hex' ? '#000000' : colorFormats[key] === 'rgb' ? 'rgb(0, 0, 0)' : 'hsl(0, 0%, 0%)'}
                                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-mono"
                              />
                              <select
                                value={colorFormats[key]}
                                onChange={e => setColorFormats(prev => ({ ...prev, [key]: e.target.value as 'hex' | 'rgb' | 'hsl' }))}
                                className="mt-1 text-xs border border-gray-200 rounded px-1 py-0.5 bg-gray-50"
                              >
                                <option value="hex">HEX</option>
                                <option value="rgb">RGB</option>
                                <option value="hsl">HSL</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Font inputs */}
                    <div className="grid sm:grid-cols-2 gap-4 mt-5">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Heading font</label>
                        <input
                          value={branding.headingFont}
                          onChange={e => setBranding(prev => ({ ...prev, headingFont: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                          placeholder="e.g. Plus Jakarta Sans"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Body font</label>
                        <input
                          value={branding.bodyFont}
                          onChange={e => setBranding(prev => ({ ...prev, bodyFont: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                          placeholder="e.g. Inter"
                        />
                      </div>
                    </div>
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
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
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
