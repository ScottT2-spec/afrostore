"use client";
import { ArrowRight, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { CheckCircle2, CreditCard, Heart, ImageIcon, Mail, MapPin, Menu, MessageCircle, Minus, Phone, Search, Shield, ShoppingBag, ShoppingCart, Star, Truck, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { getLinkedPageHref, parsePageContent } from "@/lib/page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";

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

/* ───────── Component ───────── */

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [hasRawHtml, setHasRawHtml] = useState<boolean | null>(null); // null = checking, true/false = result
  const rawHtmlIframeRef = useRef<HTMLIFrameElement>(null);
  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(data?.store?.id || "");

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/storefront/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Store not found");
      }
    } catch {
      setError("Failed to load store");
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  // Check if this store has a raw HTML template available
  useEffect(() => {
    if (!data?.templateSlug) { setHasRawHtml(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/storefront/${slug}/template-html`, { method: "HEAD" });
        if (!cancelled) setHasRawHtml(res.ok);
      } catch {
        if (!cancelled) setHasRawHtml(false);
      }
    })();
    return () => { cancelled = true; };
  }, [data?.templateSlug, slug]);

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
  }, [cart, data]);

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

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "All" || p.category?.name === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const categoryNames = ["All", ...categories.filter((c) => c._count.products > 0).map((c) => c.name)];

  // ─── Page helpers ─────────────────────────────────────────
  // Find the primary page — HOME or LANDING (whichever has content)
  const homePage = data.pages.find((p) => p.type === "HOME") || data.pages.find((p) => p.type === "LANDING");
  const homeBlocks: BuilderBlock[] = homePage ? parsePageContent(homePage.content).blocks : [];
  const hasHomeContent = homeBlocks.length > 0;
  const homeHasProductGrid = homeBlocks.some((b) => b.type === "productGrid");

  // Navigation pages: exclude HOME (we're on it), sort sensibly
  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = data.pages
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  return (
    <ThemeProvider theme={data.theme}>
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-brand-600 text-white text-center py-2 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          {data.deliveryZones.some((z) => z.freeAbove)
            ? `Free delivery on orders above ${formatCurrency(Number(data.deliveryZones.find((z) => z.freeAbove)?.freeAbove || 0), currency)} — Shop now!`
            : `Welcome to ${store.name} — Shop now!`}
        </div>
      </div>

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
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-display text-lg font-bold text-surface-900">{store.name}</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm font-medium text-brand-700 transition-colors">Home</Link>
            <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Shop</Link>
            <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
            {navPages.slice(0, 4).map((page) => (
              <Link key={page.id} href={getLinkedPageHref(page as { slug: string; template?: string | null }, slug)} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">{page.title}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
        {/* Search bar */}
        {showSearch && (
          <div className="border-t border-surface-100 px-4 sm:px-6 py-3 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2">
              <Search className="h-4 w-4 text-surface-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Shop</Link>
          <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
          {navPages.map((page) => (
            <Link key={page.id} href={getLinkedPageHref(page as { slug: string; template?: string | null }, slug)} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">{page.title}</Link>
          ))}
          {whatsappNumber && (
            <a href={getWhatsAppLink(whatsappNumber, [], currency, store.name)} className="block text-sm font-medium text-green-600 py-2">WhatsApp us</a>
          )}
        </div>
      )}

      {/* ─── HOME PAGE CONTENT ─────────────────────────────────── */}
      {hasRawHtml ? (
        /* Raw HTML template — render the EXACT template layout via iframe */
        <iframe
          ref={rawHtmlIframeRef}
          src={`/api/storefront/${slug}/template-html`}
          className="w-full border-0"
          style={{ minHeight: "100vh" }}
          title={`${store.name} Store`}
          onLoad={() => {
            // Auto-resize iframe to content height
            const iframe = rawHtmlIframeRef.current;
            if (iframe?.contentDocument?.body) {
              const resizeObserver = new ResizeObserver(() => {
                const h = iframe.contentDocument?.body?.scrollHeight;
                if (h) iframe.style.height = `${h}px`;
              });
              resizeObserver.observe(iframe.contentDocument.body);
            }
          }}
        />
      ) : hasHomeContent ? (
        /* Builder blocks Home page — render template blocks */
        <div>
          <RenderBlocks blocks={homeBlocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as Product)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
          {products.length > 0 && !homeHasProductGrid && (
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
      ) : (
        /* Fallback: no template — default hero + product grid for blank stores */
        <>
          <section className="relative bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
            </div>
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/80 mb-4">
                  <Zap className="h-3 w-3" />{store.businessType ? `${store.businessType.charAt(0).toUpperCase()}${store.businessType.slice(1)}` : "Shop"}
                </span>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="mt-4 text-white/60 max-w-md text-base leading-relaxed">{store.description}</p>
                )}
                <div className="mt-6 flex items-center gap-3 justify-center sm:justify-start">
                  <a href="#shop" className="btn-primary text-sm">Shop Now <ArrowRight className="h-4 w-4" /></a>
                  {settings.whatsappOrdering && whatsappNumber && (
                    <a href={getWhatsAppLink(whatsappNumber, cart, currency, store.name)} className="inline-flex items-center gap-2 text-white/70 text-sm font-medium hover:text-white transition-colors">
                      <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                    </a>
                  )}
                </div>
              </div>
              {store.coverImage ? (
                <img src={store.coverImage} alt={store.name} className="w-64 h-80 sm:w-72 sm:h-96 rounded-2xl object-cover shadow-2xl flex-shrink-0" />
              ) : (
                <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-2xl shadow-purple-500/20 flex-shrink-0" />
              )}
            </div>
          </section>

          <div className="border-b border-surface-100 bg-surface-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Truck, text: "Fast Delivery" },
                { icon: Shield, text: "Secure Payment" },
                { icon: CreditCard, text: "Pay Your Way" },
                ...(settings.whatsappOrdering ? [{ icon: MessageCircle, text: "WhatsApp Support" }] : [{ icon: CheckCircle2, text: "Verified Store" }]),
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.text} className="flex items-center gap-2 justify-center">
                    <Icon className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-medium text-surface-600">{t.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <section id="shop" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-surface-900">
                {selectedCategory !== "All" ? selectedCategory : "Our Collection"}
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`hidden sm:block rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === cat ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {categoryNames.length > 1 && (
              <div className="sm:hidden flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === cat ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-surface-900 mb-2">
                  {searchQuery ? "No products found" : "No products yet"}
                </h3>
                <p className="text-sm text-surface-500">
                  {searchQuery ? `No results for "${searchQuery}"` : "This store is setting up. Check back soon!"}
                </p>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.slice(0, 8).map((product) => {
                  const hasImage = product.images.length > 0 && product.images[0].url;
                  const discount = product.compareAtPrice
                    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                    : 0;
                  const justAdded = addedToCart === product.id;

                  return (
                    <div key={product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); setQty(1); }}>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                        {hasImage ? (
                          <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(product.id)} transition-transform duration-500 group-hover:scale-110 flex items-center justify-center`}>
                            <ImageIcon className="h-10 w-10 text-white/40" />
                          </div>
                        )}
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-brand-600">Featured</div>
                        )}
                        {!product.inStock && (
                          <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-red-500">Sold Out</div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white z-10">-{discount}%</div>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-sm ${isWishlisted(product.id) ? "ring-1 ring-red-200" : ""}`}
                          >
                            <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-surface-500"}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (product.inStock) addToCart(product); }}
                            disabled={!product.inStock}
                            className={`h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm disabled:opacity-40 ${
                              justAdded ? "bg-green-500 text-white" : "bg-white/90 text-surface-500 hover:bg-white"
                            }`}
                          >
                            {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                      {product.reviewCount > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] text-surface-400">({product.reviewCount})</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base font-bold text-surface-900">{formatCurrency(Number(product.price), currency)}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-surface-400 line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length > 8 && (
                <div className="text-center mt-10">
                  <Link
                    href={`/store/${slug}/shop`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-surface-900 text-white px-8 py-3.5 text-sm font-bold hover:bg-surface-800 transition-all shadow-lg hover:-translate-y-0.5"
                  >
                    View All Products <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-xs text-surface-400 mt-2">Showing 8 of {filteredProducts.length} products</p>
                </div>
              )}
              </>
            )}
          </section>

          {/* WhatsApp CTA — only for blank stores without template */}
          {settings.whatsappOrdering && whatsappNumber && (
            <section className="bg-green-600 py-10">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white">Prefer to order on WhatsApp?</h3>
                  <p className="text-green-100 text-sm mt-1">Send us a message and we&apos;ll help you place your order.</p>
                </div>
                <a href={getWhatsAppLink(whatsappNumber, cart, currency, store.name)} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors shadow-lg">
                  <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                </a>
              </div>
            </section>
          )}
        </>
      )}

      {/* Cart preview bar */}
      {cartCount > 0 && !selectedProduct && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 shadow-2xl px-4 sm:px-6 py-3 sm:hidden">
          <Link href="/checkout" className="btn-primary w-full py-3.5 text-sm">
            <ShoppingCart className="h-4 w-4" />
            View Cart ({cartCount}) — {formatCurrency(cartTotal, currency)}
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12 themed-footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-white" /></div>
                )}
                <span className="font-display font-bold text-white">{store.name}</span>
              </div>
              {store.description && <p className="text-xs leading-relaxed">{store.description}</p>}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
              <ul className="space-y-2 text-xs">
                {categoryNames.filter((c) => c !== "All").slice(0, 5).map((c) => (
                  <li key={c}><button onClick={() => { setSelectedCategory(c); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition-colors">{c}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Info</h4>
              <ul className="space-y-2 text-xs">
                {navPages.slice(0, 5).map((page) => (
                  <li key={page.id}><Link href={getLinkedPageHref(page as { slug: string; template?: string | null }, slug)} className="hover:text-white transition-colors">{page.title}</Link></li>
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

      {/* Floating WhatsApp */}
      {settings.whatsappOrdering && whatsappNumber && (
        <a href={getWhatsAppLink(whatsappNumber, cart, currency, store.name)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all sm:bottom-6" style={{ bottom: cartCount > 0 ? "5rem" : undefined }}>
          <MessageCircle className="h-6 w-6" />
        </a>
      )}

      {/* Product Quick View Modal */}
      {selectedProduct && (
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
