"use client";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import { CheckCircle2, Heart, Menu, MessageCircle, Minus, Phone, Search, Shield, ShoppingBag, ShoppingCart, Star, Truck } from "@/components/icons/FilledIcons";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { FASHION_TEMPLATE_PRESET } from "@/lib/templates/presets/fashion-preset";
import { FASHION_COLORED_PRESET } from "@/lib/templates/presets/fashion-colored-preset";
import { HANDMADE_BAGS_PRESET } from "@/lib/templates/presets/handmade-bags-preset";
import { T_SHIRTS_PRINTS_PRESET } from "@/lib/templates/presets/t-shirts-prints-preset";
import { ELECTRONICS_TEMPLATE_PRESET } from "@/lib/templates/presets/electronics-preset";
import { BAKERY_TEMPLATE_PRESET } from "@/lib/templates/presets/bakery-preset";
import { COSMETICS_TEMPLATE_PRESET } from "@/lib/templates/presets/cosmetics-preset";
import { GROCERY_TEMPLATE_PRESET } from "@/lib/templates/presets/grocery-preset";
import { HEALTH_TEMPLATE_PRESET } from "@/lib/templates/presets/health-preset";
import { INTERIOR_DECOR_PRESET, INTERIOR_RETAIL_PRESET } from "@/lib/templates/presets/interior-preset";
import { KIDS_TEMPLATE_PRESET } from "@/lib/templates/presets/kids-preset";
import { MAKEUP_TEMPLATE_PRESET } from "@/lib/templates/presets/makeup-preset";
import { PERFUMES_TEMPLATE_PRESET } from "@/lib/templates/presets/perfumes-preset";
import { FashionStoreContext } from "@/components/storefront/FashionTemplateBlocks";
import { ElectronicsStoreContext } from "@/components/storefront/ElectronicsTemplateBlocks";
import { BakeryStoreContext } from "@/components/storefront/BakeryTemplateBlocks";
import { CosmeticsStoreContext } from "@/components/storefront/CosmeticsTemplateBlocks";
import { GroceryStoreContext } from "@/components/storefront/GroceryTemplateBlocks";
import { HealthStoreContext } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorStoreContext } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { KidsStoreContext } from "@/components/storefront/KidsTemplateBlocks";
import { MakeupStoreContext } from "@/components/storefront/MakeupTemplateBlocks";
import { PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { FashionHeader, FashionFooter, type NavItem } from "@/components/storefront/FashionStoreChrome";

/* ─── Template preset map ─── */
const TEMPLATE_PRESET_MAP: Record<string, TemplateBlock[]> = {
  fashion: FASHION_TEMPLATE_PRESET,
  "fashion-colored": FASHION_COLORED_PRESET,
  "handmade-bags": HANDMADE_BAGS_PRESET,
  "t-shirts-prints": T_SHIRTS_PRINTS_PRESET,
  electronics: ELECTRONICS_TEMPLATE_PRESET,
  "electronics-accessories": ELECTRONICS_TEMPLATE_PRESET,
  hardware: ELECTRONICS_TEMPLATE_PRESET,
  tools: ELECTRONICS_TEMPLATE_PRESET,
  "sweets-bakery": BAKERY_TEMPLATE_PRESET,
  cosmetics: COSMETICS_TEMPLATE_PRESET,
  grocery: GROCERY_TEMPLATE_PRESET,
  vegetables: GROCERY_TEMPLATE_PRESET,
  pills: HEALTH_TEMPLATE_PRESET,
  decor: INTERIOR_DECOR_PRESET,
  retail: INTERIOR_RETAIL_PRESET,
  kids: KIDS_TEMPLATE_PRESET,
  toys: KIDS_TEMPLATE_PRESET,
  makeup: MAKEUP_TEMPLATE_PRESET,
  perfumes: PERFUMES_TEMPLATE_PRESET,
};
import { getLinkedPageHref, parsePageContent, type PageSettings } from "@/lib/page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";

/* ───────── Types ───────── */

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock?: number;
  inStock: boolean;
  isFeatured: boolean;
  tags: string[];
  images: ProductImage[];
  category?: ProductCategory;
  reviewCount: number;
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  freeAbove?: number;
  estimatedDays?: string;
}

interface StoreData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    subdomain: string;
    customDomain?: string;
    currency: string;
    country: string;
    businessType: string;
    siteType?: string;
  };
  settings: {
    allowGuestCheckout?: boolean;
    payOnDelivery?: boolean;
    bankTransfer?: boolean;
    whatsappOrdering?: boolean;
    showStockCount?: boolean;
    lowDataMode?: boolean;
    whatsappNumber?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
  categories: StoreCategory[];
  deliveryZones: DeliveryZone[];
  pages: Array<{ id: string; title: string; slug: string; type: string; content?: unknown }>;
  templateSlug: string | null;
  theme: ThemeData | null;
  customization?: SiteCustomizationDocument | null;
  blogs?: Array<{
    id: string; title: string; slug: string; excerpt?: string | null;
    coverImage?: string | null; author?: string | null; category?: string | null;
    tags: string[]; publishedAt?: string | null; createdAt: string;
  }>;
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
}

/* ───────── Helpers ───────── */

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-amber-600 to-yellow-600",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-red-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-purple-400 to-violet-500",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getWhatsAppLink(phone: string | undefined, cart: CartItem[], currency: string, storeName: string): string {
  const num = phone?.replace(/[^0-9+]/g, "") || "";
  if (!num) return "#";
  let msg = `Hi ${storeName}! I'd like to order:\n\n`;
  cart.forEach((item) => {
    msg += `• ${item.product.name} x${item.quantity} — ${formatCurrency(Number(item.product.price) * item.quantity, currency)}\n`;
  });
  const total = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  msg += `\nTotal: ${formatCurrency(total, currency)}`;
  return `https://wa.me/${num.replace("+", "")}?text=${encodeURIComponent(msg)}`;
}

/* ───────── Template Store Context Provider ───────── */

/** Maps any template slug to the correct StoreContext provider */
function TemplateStoreContextProvider({ templateSlug, products, blogs, currency, storeSlug, socialLinks, addToCart, toggleWishlist, isWishlisted, onQuickView, children }: {
  templateSlug: string | null;
  products: any[];
  blogs: any[];
  currency: string;
  storeSlug: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
  children: React.ReactNode;
}) {
  const value = { products, blogs, currency, storeSlug, socialLinks , addToCart, toggleWishlist, isWishlisted, onQuickView };

  // Determine which context to use based on template slug or block prefix
  const slug = templateSlug || "";
  if (slug === "electronics" || slug === "electronics-accessories" || slug === "hardware" || slug === "tools") {
    return <ElectronicsStoreContext.Provider value={value}>{children}</ElectronicsStoreContext.Provider>;
  }
  if (slug === "sweets-bakery") {
    return <BakeryStoreContext.Provider value={value}>{children}</BakeryStoreContext.Provider>;
  }
  if (slug === "cosmetics") {
    return <CosmeticsStoreContext.Provider value={value}>{children}</CosmeticsStoreContext.Provider>;
  }
  if (slug === "grocery" || slug === "vegetables") {
    return <GroceryStoreContext.Provider value={value}>{children}</GroceryStoreContext.Provider>;
  }
  if (slug === "pills") {
    return <HealthStoreContext.Provider value={value}>{children}</HealthStoreContext.Provider>;
  }
  if (slug === "decor" || slug === "retail") {
    return <InteriorStoreContext.Provider value={value}>{children}</InteriorStoreContext.Provider>;
  }
  if (slug === "kids" || slug === "toys") {
    return <KidsStoreContext.Provider value={value}>{children}</KidsStoreContext.Provider>;
  }
  if (slug === "makeup") {
    return <MakeupStoreContext.Provider value={value}>{children}</MakeupStoreContext.Provider>;
  }
  if (slug === "perfumes") {
    return <PerfumesStoreContext.Provider value={value}>{children}</PerfumesStoreContext.Provider>;
  }
  // Default: fashion family
  return <FashionStoreContext.Provider value={value}>{children}</FashionStoreContext.Provider>;
}

/* ───────── Component ───────── */

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftCustomization, setDraftCustomization] = useState<SiteCustomizationDocument | null>(null);
  const templateIframeRef = useRef<HTMLIFrameElement>(null);
  const cartKey = `afrostore_cart_${slug}`;
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  /** Navigate to shop page with search query */
  const handleSearch = (q?: string) => {
    const query = (q ?? searchQuery).trim();
    if (query) {
      router.push(`/store/${slug}/shop?search=${encodeURIComponent(query)}`);
    }
  };
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(data?.store?.id || "");

  useEffect(() => {
    let cancelled = false;

    async function fetchStore() {
      setLoading(true);
      try {
        const res = await fetch(`/api/storefront/${slug}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data) {
          setData(json.data);
          setDraftCustomization(normalizeSiteCustomization(json.data.customization || null));
        } else {
          setError(json.error || "Store not found");
        }
      } catch {
        if (!cancelled) setError("Failed to load store");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStore();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "afro-site-customization-preview") return;
      const nextCustomization = normalizeSiteCustomization(event.data.customization || null);
      setDraftCustomization(nextCustomization);
      templateIframeRef.current?.contentWindow?.postMessage({
        type: "afro-site-customization-preview",
        customization: nextCustomization,
      }, "*");
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Persist cart to localStorage for checkout
  useEffect(() => {
    if (data) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
      localStorage.setItem("afrostore_siteId", data.store.id);
      localStorage.setItem("afrostore_storeSlug", data.store.slug);
      localStorage.setItem("afrostore_storeName", data.store.name);
      localStorage.setItem("afrostore_currency", data.store.currency);
      localStorage.setItem("afrostore_deliveryZones", JSON.stringify(data.deliveryZones));
    }
  }, [cart, data, cartKey, slug]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { productId: product.id, quantity, product }];
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const resolvedTheme = useMemo(() => buildThemeDataWithCustomization(data?.theme || null, draftCustomization), [data?.theme, draftCustomization]);

  // Custom navigation items from site customization
  const customNavItems = useMemo(() => {
    const items = (draftCustomization?.navigationSettings?.items as NavItem[] | undefined) || [];
    return items.length > 0 ? items : undefined;
  }, [draftCustomization]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading store...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Store not found</h1>
          <p className="text-surface-500">{error || "This store doesn't exist or isn't active yet."}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700">
            <ArrowRight className="h-4 w-4 rotate-180" /> Go to AfroStore
          </Link>
        </div>
      </div>
    );
  }

  const { store, settings, socialLinks, products, categories } = data;
  const currency = store.currency || "NGN";
  const whatsappNumber = settings.whatsappNumber || socialLinks.whatsapp;
  const isLanding = store.siteType === "LANDING_PAGE" || store.siteType === "WEBSITE";

  // Build socialLinks array from DB data for template blocks
  const socialLinksArray: Array<{ platform: string; url: string }> = [
    ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
    ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
    ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
    ...(socialLinks?.tiktok ? [{ platform: "tiktok", url: socialLinks.tiktok }] : []),
    ...((socialLinks as any)?.youtube ? [{ platform: "youtube", url: (socialLinks as any).youtube }] : []),
    ...(socialLinks?.whatsapp ? [{ platform: "whatsapp", url: socialLinks.whatsapp }] : []),
  ];

  const categoryNames = ["All", ...categories.filter((c) => c._count.products > 0).map((c) => c.name)];

  // ─── Page helpers ─────────────────────────────────────────
  // Find the primary page — HOME or LANDING (whichever has content)
  const visiblePages = filterVisiblePages(data.pages, draftCustomization);
  const customizedPages = visiblePages.map((page) => applyPageCustomization(page, draftCustomization));
  const homePage = customizedPages.find((p) => p.type === "HOME") || customizedPages.find((p) => p.type === "LANDING");
  const homeContent: { blocks: BuilderBlock[]; settings: PageSettings } = homePage
    ? parsePageContent(homePage.content)
    : { blocks: [], settings: {} };
  const homePageSettings = homePage ? getResolvedPageSettings(homePage, homeContent.settings, draftCustomization) : {};
  const homeBlocks: BuilderBlock[] = homeContent.blocks;
  const hasHomeContent = homeBlocks.length > 0;
  const homeHasProductGrid = homeBlocks.some((b) => b.type === "productGrid");
  const isFashionTemplate = data.templateSlug === "fashion" || data.templateSlug === "fashion-colored" || data.templateSlug === "handmade-bags" || data.templateSlug === "t-shirts-prints" || homeBlocks.some((b) => b.type.startsWith("fashion"));
  const templatePreset = data.templateSlug ? TEMPLATE_PRESET_MAP[data.templateSlug] : undefined;

  // Template-specific navigation items — tailored to each niche
  const TEMPLATE_NAV_ITEMS: Record<string, Array<{ label: string; href: string }>> = {
    // Fashion family
    "fashion":          [{ label: "New Arrivals", href: `/store/${slug}/shop?sort=newest` }, { label: "Collections", href: `/store/${slug}/shop` }, { label: "Lookbook", href: `/store/${slug}/blog` }],
    "fashion-colored":  [{ label: "New Arrivals", href: `/store/${slug}/shop?sort=newest` }, { label: "Collections", href: `/store/${slug}/shop` }, { label: "Lookbook", href: `/store/${slug}/blog` }],
    "handmade-bags":    [{ label: "New Arrivals", href: `/store/${slug}/shop?sort=newest` }, { label: "Handbags", href: `/store/${slug}/shop` }, { label: "Our Story", href: `/store/${slug}/blog` }],
    "t-shirts-prints":  [{ label: "New Drops", href: `/store/${slug}/shop?sort=newest` }, { label: "All Designs", href: `/store/${slug}/shop` }, { label: "Custom Prints", href: `/store/${slug}/shop` }],
    // Electronics
    "electronics":              [{ label: "Deals", href: `/store/${slug}/shop?sort=price_asc` }, { label: "New Tech", href: `/store/${slug}/shop?sort=newest` }, { label: "Brands", href: `/store/${slug}/shop` }, { label: "Blog", href: `/store/${slug}/blog` }],
    "electronics-accessories":  [{ label: "Deals", href: `/store/${slug}/shop?sort=price_asc` }, { label: "New Tech", href: `/store/${slug}/shop?sort=newest` }, { label: "Accessories", href: `/store/${slug}/shop` }],
    "hardware":                 [{ label: "Tools", href: `/store/${slug}/shop` }, { label: "New Arrivals", href: `/store/${slug}/shop?sort=newest` }, { label: "Guides", href: `/store/${slug}/blog` }],
    "tools":                    [{ label: "Power Tools", href: `/store/${slug}/shop` }, { label: "Hand Tools", href: `/store/${slug}/shop` }, { label: "Guides", href: `/store/${slug}/blog` }],
    // Bakery
    "sweets-bakery":    [{ label: "Menu", href: `/store/${slug}/shop` }, { label: "Specials", href: `/store/${slug}/shop?sort=newest` }, { label: "Catering", href: `/store/${slug}/shop` }, { label: "Our Story", href: `/store/${slug}/blog` }],
    // Cosmetics
    "cosmetics":        [{ label: "Skincare", href: `/store/${slug}/shop` }, { label: "Bestsellers", href: `/store/${slug}/shop?sort=popular` }, { label: "New In", href: `/store/${slug}/shop?sort=newest` }, { label: "Beauty Tips", href: `/store/${slug}/blog` }],
    // Grocery
    "grocery":          [{ label: "Weekly Deals", href: `/store/${slug}/shop?sort=price_asc` }, { label: "Fresh Produce", href: `/store/${slug}/shop` }, { label: "Pantry", href: `/store/${slug}/shop` }, { label: "Recipes", href: `/store/${slug}/blog` }],
    "vegetables":       [{ label: "Fresh Today", href: `/store/${slug}/shop?sort=newest` }, { label: "Organic", href: `/store/${slug}/shop` }, { label: "Seasonal", href: `/store/${slug}/shop` }, { label: "Recipes", href: `/store/${slug}/blog` }],
    // Health
    "pills":            [{ label: "Supplements", href: `/store/${slug}/shop` }, { label: "Bestsellers", href: `/store/${slug}/shop?sort=popular` }, { label: "Wellness Blog", href: `/store/${slug}/blog` }],
    // Interior
    "decor":            [{ label: "Furniture", href: `/store/${slug}/shop` }, { label: "New Collection", href: `/store/${slug}/shop?sort=newest` }, { label: "Inspiration", href: `/store/${slug}/blog` }],
    "retail":           [{ label: "Living Room", href: `/store/${slug}/shop` }, { label: "New Arrivals", href: `/store/${slug}/shop?sort=newest` }, { label: "Design Ideas", href: `/store/${slug}/blog` }],
    // Kids
    "kids":             [{ label: "Toys", href: `/store/${slug}/shop` }, { label: "New In", href: `/store/${slug}/shop?sort=newest` }, { label: "Gift Ideas", href: `/store/${slug}/shop` }, { label: "Parenting", href: `/store/${slug}/blog` }],
    "toys":             [{ label: "Age Groups", href: `/store/${slug}/shop` }, { label: "New Toys", href: `/store/${slug}/shop?sort=newest` }, { label: "Gift Finder", href: `/store/${slug}/shop` }],
    // Makeup
    "makeup":           [{ label: "Face", href: `/store/${slug}/shop` }, { label: "Lips", href: `/store/${slug}/shop` }, { label: "New Launches", href: `/store/${slug}/shop?sort=newest` }, { label: "Tutorials", href: `/store/${slug}/blog` }],
    // Perfumes
    "perfumes":         [{ label: "Fragrances", href: `/store/${slug}/shop` }, { label: "New Scents", href: `/store/${slug}/shop?sort=newest` }, { label: "Gift Sets", href: `/store/${slug}/shop` }, { label: "Scent Guide", href: `/store/${slug}/blog` }],
  };
  const templateNavItems = data.templateSlug ? TEMPLATE_NAV_ITEMS[data.templateSlug] || [] : [];

  // Navigation pages: exclude HOME (we're on it), sort sensibly
  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = customizedPages
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  return (
    <ThemeProvider theme={resolvedTheme}>
    <div className="min-h-screen bg-white">
      {/* ─── FASHION TEMPLATE HEADER ─── */}
      {isFashionTemplate ? (
        <FashionHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          navPages={navPages}
          customNavItems={customNavItems || (templateNavItems.length > 0 ? [
            { id: "home", label: "Home", url: `/store/${slug}`, type: "internal" },
            ...templateNavItems.map((item, i) => ({ id: `tnav-${i}`, label: item.label, url: item.href, type: "internal" })),
            { id: "reviews", label: "Reviews", url: `/store/${slug}/reviews`, type: "internal" },
          ] : undefined)}
          categories={categories.filter((c) => c._count.products > 0).map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c._count.products }))}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          topBarText={data.deliveryZones.some((z: any) => z.freeAbove)
            ? `FREE DELIVERY ON ORDERS ABOVE ${formatCurrency(Number(data.deliveryZones.find((z: any) => z.freeAbove)?.freeAbove || 0), currency)}`
            : `FREE SHIPPING FOR ALL ORDERS — SHOP NOW!`}
          socialLinks={[
            ...(data.socialLinks?.facebook ? [{ platform: "facebook", url: data.socialLinks.facebook }] : []),
            ...(data.socialLinks?.instagram ? [{ platform: "instagram", url: data.socialLinks.instagram }] : []),
            ...(data.socialLinks?.twitter ? [{ platform: "twitter", url: data.socialLinks.twitter }] : []),
          ]}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          isLanding={isLanding}
        />
      ) : (
      <>
      {/* Announcement Bar */}
      {!isLanding && (
      <div className="bg-brand-600 text-white text-center py-2 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          {data.deliveryZones.some((z) => z.freeAbove)
            ? `Free delivery on orders above ${formatCurrency(Number(data.deliveryZones.find((z: any) => z.freeAbove)?.freeAbove || 0), currency)} — Shop now!`
            : `Welcome to ${store.name} — Shop now!`}
        </div>
      </div>
      )}

      {/* Store Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm themed-header">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 -ml-2 text-surface-600">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={`/store/${slug}`} className="flex items-center gap-2">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {isLanding ? <span className="text-white font-bold text-sm">{store.name.charAt(0)}</span> : <ShoppingBag className="h-5 w-5 text-white" />}
                </div>
              )}
              <span className="font-display text-lg font-bold text-surface-900">{store.name}</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm font-medium text-brand-700 transition-colors">Home</Link>
            {!isLanding && templateNavItems.length > 0 ? (
              <>
                {templateNavItems.map((item, i) => (
                  <Link key={i} href={item.href} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">{item.label}</Link>
                ))}
                <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
              </>
            ) : (
              <>
                {!isLanding && <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Shop</Link>}
                {!isLanding && <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>}
              </>
            )}
            {navPages.slice(0, isLanding ? 6 : 3).map((page) => (
              <Link key={page.id} href={`/store/${slug}/${page.slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">{page.title}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!isLanding && (
              <>
                <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-surface-600 hover:bg-surface-50 rounded-lg"><Search className="h-5 w-5" /></button>
                <Link href={`/store/${slug}/wishlist`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg hidden sm:flex">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
                <Link
                  href="/checkout"
                  className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Search bar */}
        {!isLanding && showSearch && (
          <div className="border-t border-surface-100 px-4 sm:px-6 py-3 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2">
              <Search className="h-4 w-4 text-surface-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")}><X className="h-4 w-4 text-surface-400" /></button>}
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="sm:hidden bg-white border-b border-surface-200 px-4 py-4 space-y-2">
          <Link href={`/store/${slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-brand-700 py-2">Home</Link>
          {!isLanding && templateNavItems.length > 0 ? (
            <>
              {templateNavItems.map((item, i) => (
                <Link key={i} href={item.href} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">{item.label}</Link>
              ))}
              <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
            </>
          ) : (
            <>
              {!isLanding && <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Shop</Link>}
              {!isLanding && <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>}
            </>
          )}
          {navPages.map((page) => (
            <Link key={page.id} href={`/store/${slug}/${page.slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">{page.title}</Link>
          ))}
          {!isLanding && whatsappNumber && (
            <a href={getWhatsAppLink(whatsappNumber, [], currency, store.name)} className="block text-sm font-medium text-green-600 py-2">WhatsApp us</a>
          )}
        </div>
      )}
      </>
      )}

      {/* ─── HOME PAGE CONTENT ─────────────────────────────────── */}
      {hasHomeContent ? (
        /* Builder blocks Home page — render template blocks */
        <div style={buildPageBackgroundStyle(homePageSettings)}>
          <TemplateStoreContextProvider templateSlug={data.templateSlug} products={products} blogs={data.blogs || []} currency={currency} storeSlug={slug} socialLinks={socialLinksArray} addToCart={(pid,qty)=>{const x=products.find(p=>p.id===pid);if(x)addToCart(x,qty);}} toggleWishlist={toggleWishlist} isWishlisted={isWishlisted} onQuickView={(pid)=>{const x=products.find(p=>p.id===pid);if(x)setSelectedProduct(x);}}>
          <RenderBlocks blocks={homeBlocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as Product)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
          </TemplateStoreContextProvider>
          {!isLanding && products.length > 0 && !homeHasProductGrid && (
            <div className="text-center py-10">
              <Link
                href={`/store/${slug}/shop`}
                className="inline-flex items-center gap-2 rounded-2xl bg-surface-900 text-white px-8 py-3.5 text-sm font-bold hover:bg-surface-800 transition-all shadow-lg hover:-translate-y-0.5"
              >
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      ) : templatePreset ? (
        /* Template with editable block preset */
        <div>
          <TemplateStoreContextProvider templateSlug={data.templateSlug} products={products} blogs={data.blogs || []} currency={currency} storeSlug={slug} socialLinks={socialLinksArray} addToCart={(pid,qty)=>{const x=products.find(p=>p.id===pid);if(x)addToCart(x,qty);}} toggleWishlist={toggleWishlist} isWishlisted={isWishlisted} onQuickView={(pid)=>{const x=products.find(p=>p.id===pid);if(x)setSelectedProduct(x);}}>
            <RenderTemplateBlocks blocks={templatePreset} />
          </TemplateStoreContextProvider>
          {!isLanding && products.length > 0 && (
            <div className="text-center py-10">
              <Link
                href={`/store/${slug}/shop`}
                className="inline-flex items-center gap-2 rounded-2xl bg-surface-900 text-white px-8 py-3.5 text-sm font-bold hover:bg-surface-800 transition-all shadow-lg hover:-translate-y-0.5"
              >
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      ) : homeBlocks.length > 0 ? (
        /* Fallback: render blocks even if hasHomeContent is false but blocks exist */
        <div style={buildPageBackgroundStyle(homePageSettings)}>
          <RenderBlocks blocks={homeBlocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as Product)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
        </div>
      ) : (
        <div style={buildPageBackgroundStyle(homePageSettings)} className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 py-16">
          <div className="max-w-xl w-full rounded-3xl border border-dashed border-surface-200 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-surface-900">{store.name}</h1>
            <p className="mt-3 text-sm leading-6 text-surface-500">
              This store has not imported a template yet. Import a theme package to render the selected design in builder, preview, and live views.
            </p>
          </div>
        </div>
      )}
      {/* Cart preview bar */}
      {!isLanding && cartCount > 0 && !selectedProduct && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 shadow-2xl px-4 sm:px-6 py-3 sm:hidden">
          <Link href="/checkout" className="btn-primary w-full py-3.5 text-sm">
            <ShoppingCart className="h-4 w-4" />
            View Cart ({cartCount}) — {formatCurrency(cartTotal, currency)}
          </Link>
        </div>
      )}

      {/* Footer */}
      {isFashionTemplate ? (
        <FashionFooter
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          navPages={navPages}
          description={store.description}
          socialLinks={[
            ...(data.socialLinks?.facebook ? [{ platform: "facebook", url: data.socialLinks.facebook }] : []),
            ...(data.socialLinks?.instagram ? [{ platform: "instagram", url: data.socialLinks.instagram }] : []),
            ...(data.socialLinks?.twitter ? [{ platform: "twitter", url: data.socialLinks.twitter }] : []),
          ]}
          contactInfo={{
            phone: whatsappNumber || undefined,
            email: (data.socialLinks as any)?.email || undefined,
          }}
        />
      ) : (
      <footer className="bg-surface-900 text-surface-400 py-12 themed-footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`grid gap-8 ${isLanding ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
            <div className={isLanding ? "col-span-1" : "col-span-2 sm:col-span-1"}>
              <div className="flex items-center gap-2 mb-3">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {isLanding ? <span className="text-white font-bold text-xs">{store.name.charAt(0)}</span> : <ShoppingBag className="h-4 w-4 text-white" />}
                  </div>
                )}
                <span className="font-display font-bold text-white">{store.name}</span>
              </div>
              {store.description && <p className="text-xs leading-relaxed">{store.description}</p>}
            </div>
            {!isLanding && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
              <ul className="space-y-2 text-xs">
                {categoryNames.filter((c) => c !== "All").slice(0, 5).map((c) => (
                  <li key={c}><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition-colors">{c}</button></li>
                ))}
              </ul>
            </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">{isLanding ? "Pages" : "Info"}</h4>
              <ul className="space-y-2 text-xs">
                {navPages.slice(0, 5).map((page) => (
                  <li key={page.id}><Link href={`/store/${slug}/${page.slug}`} className="hover:text-white transition-colors">{page.title}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-xs">
                {whatsappNumber && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{whatsappNumber}</div>}
                {socialLinks.instagram && <div className="flex items-center gap-2"><span>📸</span>{socialLinks.instagram}</div>}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-800 flex items-center justify-between text-xs text-surface-600">
            <span>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</span>
            <span className="flex items-center gap-1">Powered by <span className="font-semibold text-brand-400">AfroStore</span></span>
          </div>
        </div>
      </footer>
      )}

      {/* Floating WhatsApp */}
      {!isLanding && settings.whatsappOrdering && whatsappNumber && (
        <a href={getWhatsAppLink(whatsappNumber, cart, currency, store.name)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all sm:bottom-6" style={{ bottom: cartCount > 0 ? "5rem" : undefined }}>
          <MessageCircle className="h-6 w-6" />
        </a>
      )}

      {/* Product Quick View Modal */}
      {!isLanding && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Image */}
              <div className="aspect-square relative overflow-hidden">
                {selectedProduct.images.length > 0 && selectedProduct.images[0].url ? (
                  <img src={selectedProduct.images[0].url} alt={selectedProduct.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(selectedProduct.id)}`} />
                )}
                {selectedProduct.isFeatured && (
                  <span className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white bg-brand-600">Featured</span>
                )}
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-surface-700 hover:bg-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Details */}
              <div className="p-6 sm:p-8 flex flex-col">
                <h2 className="font-display text-2xl font-bold text-surface-900">{selectedProduct.name}</h2>
                {selectedProduct.reviewCount > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-surface-500">({selectedProduct.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-3xl font-extrabold text-surface-900 font-display">{formatCurrency(Number(selectedProduct.price), currency)}</span>
                  {selectedProduct.compareAtPrice && (
                    <>
                      <span className="text-lg text-surface-400 line-through">{formatCurrency(Number(selectedProduct.compareAtPrice), currency)}</span>
                      <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-0.5 text-xs font-bold">
                        Save {formatCurrency(Number(selectedProduct.compareAtPrice) - Number(selectedProduct.price), currency)}
                      </span>
                    </>
                  )}
                </div>
                {selectedProduct.description && (
                  <p className="mt-4 text-sm text-surface-500 leading-relaxed">{selectedProduct.description}</p>
                )}

                {!selectedProduct.inStock && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">Out of stock</div>
                )}

                {/* Quantity */}
                {selectedProduct.inStock && (
                  <div className="mt-5">
                    <span className="text-sm font-semibold text-surface-900">Quantity</span>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 rounded-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-50"><Minus className="h-4 w-4" /></button>
                      <span className="text-lg font-bold text-surface-900 w-8 text-center">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="h-10 w-10 rounded-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-50"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-3 flex-1 flex flex-col justify-end">
                  {selectedProduct.inStock && (
                    <div className="flex gap-2">
                      <button onClick={() => { addToCart(selectedProduct, qty); setSelectedProduct(null); }} className="btn-primary flex-1 py-3.5">
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart — {formatCurrency(Number(selectedProduct.price) * qty, currency)}
                      </button>
                      <button
                        onClick={() => toggleWishlist(selectedProduct.id)}
                        className={`p-3.5 rounded-xl border transition-all ${isWishlisted(selectedProduct.id) ? "border-red-200 bg-red-50 text-red-500" : "border-surface-200 text-surface-400 hover:text-red-500"}`}
                      >
                        <Heart className={`h-5 w-5 ${isWishlisted(selectedProduct.id) ? "fill-red-500" : ""}`} />
                      </button>
                    </div>
                  )}
                  {settings.whatsappOrdering && whatsappNumber && (
                    <a
                      href={getWhatsAppLink(whatsappNumber, [{ productId: selectedProduct.id, quantity: qty, product: selectedProduct }], currency, store.name)}
                      className="btn-secondary w-full py-3 text-green-700 border-green-200 hover:bg-green-50 text-center"
                    >
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      Order via WhatsApp
                    </a>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-surface-100">
                  {[
                    { icon: Truck, text: "Fast Delivery" },
                    { icon: Shield, text: "Secure Pay" },
                    { icon: CheckCircle2, text: "Verified" },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.text} className="flex flex-col items-center gap-1 text-center">
                        <Icon className="h-4 w-4 text-brand-600" />
                        <span className="text-[10px] text-surface-500">{t.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}
