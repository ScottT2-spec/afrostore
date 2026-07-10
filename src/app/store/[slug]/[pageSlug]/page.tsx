"use client";
import { ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock, type StoreProduct } from "@/components/storefront/BlockRenderer";
import { FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { parsePageContent, getLinkedPageHref } from "@/lib/page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";

/* ─── TYPES ─────────────────────────────────────────────────── */

interface PageData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    currency: string;
    country: string;
    businessType: string;
  };
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    content: unknown;
    metaTitle?: string;
    metaDescription?: string;
  };
  settings: {
    whatsappOrdering?: boolean;
    whatsappNumber?: string;
  };
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  products: StoreProduct[];
  categories: Array<{ id: string; name: string; slug: string; _count: { products: number } }>;
  deliveryZones: Array<{ id: string; name: string; fee: number; freeAbove?: number }>;
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  templateSlug: string | null;
  theme: ThemeData | null;
  customization?: SiteCustomizationDocument | null;
}

/* ─── HELPERS ───────────────────────────────────────────────── */

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftCustomization, setDraftCustomization] = useState<SiteCustomizationDocument | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Cart state
  const cartKey = `afrostore_cart_${slug}`;
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: StoreProduct }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });

  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(data?.store?.id || "");

  useEffect(() => {
    (async () => {
      try {
      const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setDraftCustomization(normalizeSiteCustomization(json.data.customization || null));
        const title = json.data.page.metaTitle || `${json.data.page.title} — ${json.data.store.name}`;
        document.title = title;
      } else {
          setError(json.error || "Page not found");
        }
      } catch {
        setError("Failed to load page");
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "afro-site-customization-preview") return;
      setDraftCustomization(normalizeSiteCustomization(event.data.customization || null));
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Persist cart
  useEffect(() => {
    if (data) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
      localStorage.setItem("afrostore_siteId", data.store.id);
    }
  }, [cart, data, cartKey, slug]);

  const resolvedTheme = useMemo(() => buildThemeDataWithCustomization(data?.theme || null, draftCustomization), [data?.theme, draftCustomization]);

  const addToCart = useCallback((product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading...</p>
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
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
          <p className="text-surface-500 mb-6">{error || "This page doesn't exist."}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const { store, page, settings, socialLinks, products, categories } = data;
  const currency = store.currency || "NGN";
  const whatsappNumber = settings?.whatsappNumber || socialLinks?.whatsapp;
  const resolvedPage = applyPageCustomization(page, draftCustomization);
  const parsedContent = parsePageContent(resolvedPage.content);
  const resolvedPageSettings = getResolvedPageSettings(resolvedPage, parsedContent.settings, draftCustomization);
  const blocks: BuilderBlock[] = parsedContent.blocks;
  const visiblePages = filterVisiblePages(data.pages, draftCustomization);
  const customizedPages = visiblePages.map((item) => applyPageCustomization(item, draftCustomization));

  // Navigation pages — exclude current page type HOME (we link to store root for that)
  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = customizedPages
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  return (
    <ThemeProvider theme={resolvedTheme}>
    <div className="min-h-screen bg-white">
      {/* Announcement Bar — same as store homepage */}
      <div className="bg-brand-600 text-white text-center py-2 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          Welcome to {store.name}
        </div>
      </div>

      {/* Store Nav — identical to store homepage */}
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
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-display text-lg font-bold text-surface-900">{store.name}</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Home</Link>
            <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Shop</Link>
            <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
            {navPages.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={getLinkedPageHref(p as { slug: string; template?: string | null }, slug)}
                className={`text-sm font-medium transition-colors ${p.slug === pageSlug ? "text-brand-700 font-bold" : "text-surface-600 hover:text-surface-900"}`}
              >
                {p.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={`/store/${slug}/wishlist`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg hidden sm:flex">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>
            <Link href={`/store/${slug}/cart`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="sm:hidden bg-white border-b border-surface-200 px-4 py-4 space-y-2">
          <Link href={`/store/${slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Home</Link>
          <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Shop</Link>
          <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
          {navPages.map((p) => (
            <Link
              key={p.id}
              href={getLinkedPageHref(p as { slug: string; template?: string | null }, slug)}
              onClick={() => setMobileMenu(false)}
              className={`block text-sm font-medium py-2 ${p.slug === pageSlug ? "text-brand-700 font-bold" : "text-surface-600"}`}
            >
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-surface-400">
          <Link href={`/store/${slug}`} className="hover:text-surface-600 transition-colors">{store.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-surface-700 font-medium">{resolvedPage.title}</span>
        </nav>
      </div>

      {/* Page content — full width like homepage, blocks define their own max-width */}
      <main
        className="relative overflow-hidden"
        style={buildPageBackgroundStyle(resolvedPageSettings)}
      >
        {resolvedPageSettings.backgroundImage && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: String(resolvedPageSettings.overlayColor || "#000000"),
              opacity: Number(resolvedPageSettings.overlayOpacity ?? 0.25),
            }}
          />
        )}
        {resolvedPageSettings.backgroundColor && (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: String(resolvedPageSettings.backgroundColor) }} />
        )}
        {blocks.length === 0 ? (
          <div className="text-center py-20 relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-surface-900 mb-2">{page.title}</h1>
            <p className="text-surface-400">This page has no content yet.</p>
          </div>
        ) : (
          <div className="relative z-10">
            <RenderBlocks
              blocks={blocks}
              storeSlug={slug}
              products={products}
              currency={currency}
              addToCart={addToCart}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
              addedToCart={addedToCart}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <FashionFooter
        storeName={store.name}
        storeSlug={slug}
        logo={store.logo}
        navPages={navPages}
        description={store.description}
        socialLinks={[
          ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
          ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
          ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
        ]}
        contactInfo={{
          phone: whatsappNumber || undefined,
          email: undefined,
        }}
      />

      {/* Floating WhatsApp */}
      {settings?.whatsappOrdering && whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
    </ThemeProvider>
  );
}
