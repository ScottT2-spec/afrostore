"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  User,
  HelpCircle,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Menu,
  X,
  Zap,
  ArrowRight,
  BadgeCheck,
  Package,
  Home,
  Grid3X3,
  Heart,
  UserCircle,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   JUMIA-STYLE MARKETPLACE TEMPLATE BLOCKS
   ════════════════════════════════════════════════════════════════ */

// ─── FONT LOADER ───────────────────────────────────────────
export function JumiaFontLoader() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .jumia-block, .jumia-block * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
        .jumia-block { --j-primary: #F68B1E; --j-primary-dark: #E07A10; --j-red: #CC0000; --j-green: #00A651; --j-dark: #282828; --j-text: #313133; --j-muted: #75757A; --j-light: #F1F1F2; --j-border: #E0E0E0; --j-star: #F5A623; --j-bg: #EFEFEF; --j-blue: #004DC1; }
        .jumia-block .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .jumia-block .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .jumia-block .scrollbar-hide::-webkit-scrollbar { display: none; }
        .jumia-block .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

// ─── HELPERS ───────────────────────────────────────────────
function formatPrice(price: number, currency: string = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

function calcDiscount(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function StarRating({ rating = 0, count = 0 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-2.5 w-2.5 ${i <= Math.round(rating) ? "fill-[var(--j-star)] text-[var(--j-star)]" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
      {count > 0 && <span className="text-[9px] text-[var(--j-muted)] ml-0.5">({count})</span>}
    </div>
  );
}

// Stock progress bar like Jumia
function StockBar({ itemsLeft = 0, total = 50 }: { itemsLeft?: number; total?: number }) {
  const pct = Math.min(100, (itemsLeft / total) * 100);
  const isLow = itemsLeft < 10;
  return (
    <div className="mt-1.5">
      <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isLow ? "bg-[var(--j-red)]" : "bg-[var(--j-primary)]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-[9px] mt-0.5 font-medium ${isLow ? "text-[var(--j-red)]" : "text-[var(--j-muted)]"}`}>
        {itemsLeft} items left
      </p>
    </div>
  );
}

// ─── STORE CONTEXT ─────────────────────────────────────────
export interface JumiaStoreContextData {
  products: Product[];
  categories: Category[];
  currency: string;
  storeSlug: string;
  storeName: string;
  logo?: string | null;
}

export const JumiaStoreContext = createContext<JumiaStoreContextData | null>(null);

function useJumiaStore(storeSlug?: string): JumiaStoreContextData | null {
  const ctx = useContext(JumiaStoreContext);
  const [fetched, setFetched] = useState<JumiaStoreContextData | null>(null);

  useEffect(() => {
    if (ctx || !storeSlug) return;
    fetch(`/api/storefront/${storeSlug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          setFetched({
            products: (d.products || []).map((p: any) => ({
              id: p.id, name: p.name, slug: p.slug, price: p.price,
              compareAtPrice: p.compareAtPrice, currency: p.currency || "NGN",
              images: p.images || [], category: p.category,
              isFeatured: p.isFeatured, inStock: p.inStock ?? p.stock > 0,
              tags: p.tags || [], reviewCount: p.reviewCount || p._count?.reviews || 0,
              rating: p.rating || 0, stock: p.stock,
            })),
            categories: (d.categories || []).map((c: any) => ({
              id: c.id, name: c.name, slug: c.slug, image: c.image,
              _count: c._count,
            })),
            currency: d.store?.currency || "NGN",
            storeSlug: d.store?.slug || storeSlug,
            storeName: d.store?.name || "",
            logo: d.store?.logo,
          });
        }
      })
      .catch(() => {});
  }, [ctx, storeSlug]);

  return ctx || fetched;
}

// ─── TYPES ─────────────────────────────────────────────────
interface ProductImage { id: string; url: string; alt?: string; }
interface Product {
  id: string; name: string; slug: string; price: number;
  compareAtPrice?: number; currency: string; images: ProductImage[];
  category?: { name: string; slug: string }; isFeatured?: boolean;
  inStock?: boolean; tags?: string[]; reviewCount?: number; rating?: number;
  stock?: number;
}
interface Category { id: string; name: string; slug: string; image?: string; _count?: { products: number }; }

// Product image — uses real image or clean placeholder
function ProductImage({ product, index = 0, className = "" }: { product?: Product; index?: number; className?: string }) {
  const imgUrl = product?.images?.[0]?.url;
  if (imgUrl) {
    return <img src={imgUrl} alt={product?.name || "Product"} className={`w-full h-full object-contain ${className}`} loading="lazy" />;
  }
  return (
    <div className={`w-full h-full bg-[var(--j-light)] flex items-center justify-center ${className}`}>
      <Package className="w-8 h-8 text-[var(--j-muted)] opacity-40" />
    </div>
  );
}

// Category image
function CategoryImage({ category, className = "" }: { category?: Category; className?: string }) {
  if (category?.image) {
    return <img src={category.image} alt={category.name} className={`w-full h-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div className={`w-full h-full bg-[var(--j-light)] flex items-center justify-center ${className}`}>
      <Grid3X3 className="w-6 h-6 text-[var(--j-muted)] opacity-40" />
    </div>
  );
}

// ─── PRODUCT CARD (Jumia-exact style) ──────────────────────
function JumiaProductCard({
  product,
  index = 0,
  storeSlug = "",
  showStock = false,
  compact = false,
}: {
  product: Product;
  index?: number;
  storeSlug?: string;
  showStock?: boolean;
  compact?: boolean;
}) {
  const discount = calcDiscount(product.price, product.compareAtPrice);
  const img = product.images?.[0]?.url;

  return (
    <Link
      href={`/store/${storeSlug}/product/${product.slug}`}
      className="block bg-white hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--j-light)]">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-contain p-3" />
        ) : (
          <ProductImage product={product} index={index} className="p-3" />
        )}
        {discount > 0 && (
          <span className="absolute top-0 right-0 bg-[var(--j-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-0 left-0 bg-[var(--j-blue)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg flex items-center gap-0.5">
            <BadgeCheck className="h-2.5 w-2.5" /> Official
          </span>
        )}
      </div>

      {/* Info */}
      <div className={`p-2 ${compact ? "pb-2" : "pb-3"}`}>
        <h3 className="text-[11px] text-[var(--j-text)] line-clamp-2 leading-tight mb-1 min-h-[28px]">{product.name}</h3>
        <p className="text-[13px] font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <p className="text-[10px] text-[var(--j-muted)] line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
        )}
        <div className="mt-1">
          <StarRating rating={product.rating || 0} count={product.reviewCount || 0} />
        </div>
        {showStock && product.stock !== undefined && (
          <StockBar itemsLeft={product.stock} />
        )}
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════
// 1. HEADER — Search-focused like Jumia mobile
// ═══════════════════════════════════════════════════════════
export function JumiaHeader({
  storeName = "Store",
  storeSlug = "",
  logo,
}: {
  storeName?: string;
  storeSlug?: string;
  logo?: string | null;
  categories?: Category[];
}) {
  return (
    <div className="jumia-block">
      {/* Main header */}
      <div className="bg-white px-3 py-2 flex items-center gap-2 border-b border-[var(--j-border)]">
        <button className="text-[var(--j-dark)] p-1">
          <Menu className="h-5 w-5" />
        </button>
        {logo ? (
          <img src={logo} alt={storeName} className="h-6 max-w-[80px] object-contain" />
        ) : (
          <span className="text-base font-extrabold text-[var(--j-primary)]">{storeName}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1.5 text-[var(--j-dark)]"><User className="h-5 w-5" /></button>
          <button className="p-1.5 text-[var(--j-dark)]"><HelpCircle className="h-5 w-5" /></button>
          <Link href={`/store/${storeSlug}/cart`} className="p-1.5 text-[var(--j-dark)] relative">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>
      {/* Search bar */}
      <div className="bg-white px-3 py-2 border-b border-[var(--j-border)]">
        <div className="flex items-center bg-[var(--j-light)] rounded-lg overflow-hidden">
          <Search className="h-4 w-4 text-[var(--j-muted)] ml-3 flex-shrink-0" />
          <input
            type="text"
            placeholder={`Search on ${storeName}`}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-[var(--j-text)] placeholder:text-[var(--j-muted)]"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. TOP BAR
// ═══════════════════════════════════════════════════════════
export function JumiaTopBar({
  storeSlug = "",
  message = "FREE delivery on orders over ₦15,000 🚚",
}: {
  storeSlug?: string;
  message?: string;
}) {
  return (
    <div className="jumia-block bg-[var(--j-dark)] text-white">
      <div className="max-w-[1220px] mx-auto px-3 flex items-center justify-center h-[28px] text-[10px] font-medium tracking-wide">
        {message}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. HERO BANNER SLIDER — Rich promotional banners
// ═══════════════════════════════════════════════════════════
export interface JumiaHeroBannerProps {
  slides?: Array<{
    image: string;
    mobileImage?: string;
    title?: string;
    subtitle?: string;
    cta?: string;
    link?: string;
    bgColor?: string;
    textColor?: string;
    align?: "left" | "center" | "right";
  }>;
  storeSlug?: string;
}

export function JumiaHeroBanner({ slides = [], storeSlug = "" }: JumiaHeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultSlides = slides.length > 0 ? slides : [
    { image: "", title: "MEGA DEALS", subtitle: "Up to 70% Off Everything", cta: "SHOP NOW", bgColor: "linear-gradient(135deg, #F68B1E 0%, #E85D04 100%)", textColor: "#fff" },
    { image: "", title: "FLASH SALES", subtitle: "New deals every hour!", cta: "VIEW DEALS", bgColor: "linear-gradient(135deg, #CC0000 0%, #8B0000 100%)", textColor: "#fff" },
    { image: "", title: "NEW ARRIVALS", subtitle: "Latest trending products", cta: "DISCOVER", bgColor: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", textColor: "#fff" },
    { image: "", title: "FREE DELIVERY", subtitle: "On orders above ₦15,000", cta: "ORDER NOW", bgColor: "linear-gradient(135deg, #00A651 0%, #006837 100%)", textColor: "#fff" },
  ];

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % defaultSlides.length), 4000);
  }, [defaultSlides.length]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = (i: number) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-3">
        <div className="relative rounded-xl overflow-hidden" style={{ height: 180 }}>
          {defaultSlides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-500 ${i === current ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"}`}
            >
              {slide.image ? (
                <img src={slide.image} alt={slide.title || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center p-6" style={{ background: slide.bgColor || "var(--j-primary)" }}>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold tracking-[3px] mb-1 opacity-80" style={{ color: slide.textColor }}>LIMITED TIME</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1" style={{ color: slide.textColor }}>{slide.title}</h2>
                    <p className="text-xs opacity-80 mb-3" style={{ color: slide.textColor }}>{slide.subtitle}</p>
                    <button className="bg-white text-[var(--j-dark)] font-bold text-[11px] px-5 py-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                      {slide.cta || "SHOP NOW"} →
                    </button>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute right-[-20px] top-[-20px] w-40 h-40 rounded-full border-[20px] border-white/10" />
                  <div className="absolute right-[30px] bottom-[-30px] w-24 h-24 rounded-full border-[12px] border-white/5" />
                </div>
              )}
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1">
            {defaultSlides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. CATEGORY ICON BAR — Horizontal scroll with emojis
// ═══════════════════════════════════════════════════════════
export interface JumiaCategoryIconBarProps {
  items?: Array<{ icon?: string; emoji?: string; label: string; link?: string }>;
  categories?: Category[];
  storeSlug?: string;
}

export function JumiaCategoryIconBar({ items = [], categories = [], storeSlug = "" }: JumiaCategoryIconBarProps) {
  const store = useJumiaStore(storeSlug);
  const realCats = categories.length > 0 ? categories : (store?.categories || []);
  const cats = realCats.length > 0
    ? realCats.slice(0, 12).map(c => ({ label: c.name, emoji: "", link: `/store/${storeSlug}/category/${c.slug}`, icon: c.image }))
    : items.length > 0
      ? items
      : [];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide py-3 px-1">
            {cats.map((item, i) => (
              <Link
                key={i}
                href={item.link || `/store/${storeSlug}/shop`}
                className="flex-shrink-0 flex flex-col items-center justify-center px-3 min-w-[72px]"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--j-light)] flex items-center justify-center mb-1.5 overflow-hidden">
                  {item.icon ? (
                    <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                  ) : (
                    <Grid3X3 className="w-5 h-5 text-[var(--j-muted)] opacity-50" />
                  )}
                </div>
                <span className="text-[9px] font-medium text-[var(--j-text)] text-center line-clamp-1 w-full">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. FLASH DEALS — Countdown timer + horizontal products
// ═══════════════════════════════════════════════════════════
export interface JumiaFlashDealsProps {
  title?: string;
  products?: Product[];
  storeSlug?: string;
  endTime?: string;
}

export function JumiaFlashDeals({ title = "Flash Sales", products = [], storeSlug = "", endTime }: JumiaFlashDealsProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const end = endTime ? new Date(endTime).getTime() : Date.now() + 8 * 60 * 60 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const store = useJumiaStore(storeSlug); const items = products.length > 0 ? products : (store?.products || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Header — orange bar */}
          <div className="bg-[var(--j-primary)] px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-white fill-white" />
              <span className="text-sm font-bold text-white">{title}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/80 mr-1">Time Left:</span>
              {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
                <span key={i} className="flex items-center gap-0.5">
                  <span className="bg-white text-[var(--j-dark)] font-bold text-[11px] px-1.5 py-0.5 rounded min-w-[22px] text-center">
                    {String(val).padStart(2, "0")}
                  </span>
                  {i < 2 && <span className="text-white font-bold text-xs">:</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Products scroll */}
          <div className="relative">
            <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide">
              {items.map((product, i) => (
                <div key={product.id} className="flex-shrink-0 w-[130px] border-r border-[var(--j-border)] last:border-r-0">
                  <JumiaProductCard product={product} index={i} storeSlug={storeSlug} showStock compact />
                </div>
              ))}
            </div>
          </div>

          {/* See All */}
          <Link href={`/store/${storeSlug}/shop`} className="block text-center py-2 border-t border-[var(--j-border)] text-[var(--j-primary)] text-xs font-bold">
            SEE ALL →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. PROMO TILES — 2x2 quick-access tiles (like Jumia mobile)
// ═══════════════════════════════════════════════════════════
export interface JumiaPromoTilesProps {
  tiles?: Array<{ title: string; image?: string; bgColor?: string; emoji?: string; link?: string }>;
  storeSlug?: string;
}

export function JumiaPromoTiles({ tiles = [], storeSlug = "" }: JumiaPromoTilesProps) {
  const defaultTiles = tiles.length > 0 ? tiles : [
    { title: "Half Price Store", emoji: "🏷️", bgColor: "#FFF3E0" },
    { title: "Free Delivery", emoji: "🚚", bgColor: "#E8F5E9" },
    { title: "Official Stores", emoji: "✅", bgColor: "#E3F2FD" },
    { title: "New Arrivals", emoji: "🆕", bgColor: "#FCE4EC" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {defaultTiles.map((tile, i) => (
            <Link
              key={i}
              href={tile.link || `/store/${storeSlug}/shop`}
              className="bg-white rounded-xl p-3 flex items-center gap-2.5 hover:shadow-md transition-shadow"
              style={{ backgroundColor: tile.bgColor || "#fff" }}
            >
              {tile.image ? (
                <img src={tile.image} alt={tile.title} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <span className="text-2xl">{tile.emoji}</span>
              )}
              <span className="text-[11px] font-bold text-[var(--j-dark)] leading-tight">{tile.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 7. SECTION TITLE
// ═══════════════════════════════════════════════════════════
export function JumiaSectionTitle({ title = "", link, storeSlug = "" }: { title?: string; link?: string; storeSlug?: string }) {
  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-t-xl px-3 py-2.5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--j-dark)]">{title}</h2>
          {link && (
            <Link href={link} className="text-[var(--j-primary)] text-xs font-bold flex items-center gap-0.5">
              SEE ALL <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 8. PRODUCT GRID — 2-column grid (Jumia mobile style)
// ═══════════════════════════════════════════════════════════
export interface JumiaProductGridProps {
  title?: string;
  products?: Product[];
  storeSlug?: string;
  columns?: number;
  showSeeAll?: boolean;
  seeAllLink?: string;
}

export function JumiaProductGrid({
  title,
  products = [],
  storeSlug = "",
  showSeeAll = true,
  seeAllLink,
}: JumiaProductGridProps) {
  const store = useJumiaStore(storeSlug); const items = products.length > 0 ? products : (store?.products || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          {title && (
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--j-border)]">
              <h2 className="text-sm font-bold text-[var(--j-dark)]">{title}</h2>
              {showSeeAll && (
                <Link href={seeAllLink || `/store/${storeSlug}/shop`} className="text-[var(--j-primary)] text-xs font-bold flex items-center gap-0.5">
                  SEE ALL <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.slice(0, 10).map((product, i) => (
              <div key={product.id} className="border-r border-b border-[var(--j-border)] last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 md:[&:nth-child(3n)]:border-r md:[&:nth-child(4n)]:border-r-0">
                <JumiaProductCard product={product} index={i} storeSlug={storeSlug} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 9. CATEGORY DEAL ROW — Horizontal scroll with title
// ═══════════════════════════════════════════════════════════
export interface JumiaCategoryDealRowProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  storeSlug?: string;
  seeAllLink?: string;
  bannerImage?: string;
  bannerLink?: string;
}

export function JumiaCategoryDealRow({
  title = "Top Deals",
  subtitle,
  products = [],
  storeSlug = "",
  seeAllLink,
}: JumiaCategoryDealRowProps) {
  const store = useJumiaStore(storeSlug); const items = products.length > 0 ? products : (store?.products || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--j-border)]">
            <h2 className="text-sm font-bold text-[var(--j-dark)] truncate">
              {title}
              {subtitle && <span className="text-[var(--j-primary)] font-normal text-xs ml-1.5">| {subtitle}</span>}
            </h2>
            <Link href={seeAllLink || `/store/${storeSlug}/shop`} className="text-[var(--j-primary)] text-xs font-bold flex items-center gap-0.5 flex-shrink-0">
              SEE ALL <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide">
            {items.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-[140px] border-r border-[var(--j-border)] last:border-r-0">
                <JumiaProductCard product={product} index={i + 3} storeSlug={storeSlug} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 10. BRAND STORE ROW
// ═══════════════════════════════════════════════════════════
export interface JumiaBrandStoreRowProps {
  brandName?: string;
  subtitle?: string;
  logo?: string;
  bgColor?: string;
  products?: Product[];
  storeSlug?: string;
  seeAllLink?: string;
}

export function JumiaBrandStoreRow({
  brandName = "Brand Store",
  subtitle = "Official Store",
  logo,
  bgColor = "#004DC1",
  products = [],
  storeSlug = "",
  seeAllLink,
}: JumiaBrandStoreRowProps) {
  const store = useJumiaStore(storeSlug); const items = products.length > 0 ? products : (store?.products || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--j-border)]">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[var(--j-dark)]">{brandName}</h2>
              <BadgeCheck className="h-3.5 w-3.5 text-[var(--j-blue)]" />
              {subtitle && <span className="text-[var(--j-primary)] text-xs">| {subtitle}</span>}
            </div>
            <Link href={seeAllLink || `/store/${storeSlug}/shop`} className="text-[var(--j-primary)] text-xs font-bold flex items-center gap-0.5">
              SEE ALL <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide">
            {items.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-[140px] border-r border-[var(--j-border)] last:border-r-0">
                <JumiaProductCard product={{ ...product, isFeatured: true }} index={i + 5} storeSlug={storeSlug} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 11. PROMO BANNERS — Full-width banners between sections
// ═══════════════════════════════════════════════════════════
export interface JumiaPromoBannersProps {
  banners?: Array<{ image: string; link?: string; title?: string; bgColor?: string; emoji?: string }>;
  storeSlug?: string;
}

export function JumiaPromoBanners({ banners = [], storeSlug = "" }: JumiaPromoBannersProps) {
  const defaultBanners = banners.length > 0 ? banners : [
    { image: "", title: "Electronics Sale — Up to 50% Off", bgColor: "linear-gradient(135deg, #1a1a2e, #16213e)", emoji: "💻" },
    { image: "", title: "Fashion Week — New Collection", bgColor: "linear-gradient(135deg, #CC0000, #8B0000)", emoji: "👗" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2 space-y-2">
        {defaultBanners.map((banner, i) => (
          <Link key={i} href={banner.link || `/store/${storeSlug}/shop`} className="block rounded-xl overflow-hidden">
            {banner.image ? (
              <img src={banner.image} alt={banner.title || ""} className="w-full h-[100px] object-cover" />
            ) : (
              <div className="w-full h-[100px] flex items-center justify-between px-6" style={{ background: banner.bgColor || "var(--j-primary)" }}>
                <span className="text-white text-sm font-extrabold max-w-[60%]">{banner.title}</span>
                <span className="text-4xl">{banner.emoji}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 12. TOP DEALS — Colored header section
// ═══════════════════════════════════════════════════════════
export interface JumiaTopDealsProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  products?: Product[];
  storeSlug?: string;
}

export function JumiaTopDeals({ title = "Top Deals", subtitle, bgColor = "#CC0000", products = [], storeSlug = "" }: JumiaTopDealsProps) {
  const store = useJumiaStore(storeSlug); const items = products.length > 0 ? products : (store?.products || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: bgColor }}>
            <div>
              <h2 className="text-sm font-bold text-white">{title}</h2>
              {subtitle && <p className="text-[10px] text-white/80">{subtitle}</p>}
            </div>
            <Link href={`/store/${storeSlug}/shop`} className="text-white text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              SEE ALL <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((product, i) => (
              <div key={product.id} className="border-r border-b border-[var(--j-border)] [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0">
                <JumiaProductCard product={product} index={i + 2} storeSlug={storeSlug} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 13. OFFICIAL STORES — Brand logos grid
// ═══════════════════════════════════════════════════════════
export interface JumiaOfficialStoresProps {
  title?: string;
  brands?: Array<{ name: string; logo?: string; slug?: string }>;
  storeSlug?: string;
}

export function JumiaOfficialStores({ title = "Official Stores", brands = [], storeSlug = "" }: JumiaOfficialStoresProps) {
  const defaultBrands = brands.length > 0 ? brands : [
    { name: "Samsung" }, { name: "Infinix" }, { name: "Xiaomi" },
    { name: "Oraimo" }, { name: "Nike" }, { name: "Adidas" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--j-border)]">
            <h2 className="text-sm font-bold text-[var(--j-dark)]">{title}</h2>
          </div>
          <div className="grid grid-cols-3 gap-0 divide-x divide-y divide-[var(--j-border)]">
            {defaultBrands.slice(0, 6).map((brand, i) => (
              <Link key={i} href={`/store/${storeSlug}/shop`} className="flex items-center justify-center py-4 hover:bg-[var(--j-light)] transition-colors">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-6 max-w-[60px] object-contain" />
                ) : (
                  <span className="text-xs font-bold text-[var(--j-muted)]">{brand.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 14. FEATURES BAR
// ═══════════════════════════════════════════════════════════
export function JumiaFeaturesBar() {
  const features = [
    { icon: Truck, title: "Free Delivery", desc: "Orders above ₦15,000", color: "text-[var(--j-primary)]", bg: "bg-orange-50" },
    { icon: RotateCcw, title: "Easy Returns", desc: "15-day return policy", color: "text-[var(--j-green)]", bg: "bg-green-50" },
    { icon: Shield, title: "Secure Payment", desc: "100% protected", color: "text-[var(--j-blue)]", bg: "bg-blue-50" },
    { icon: Headphones, title: "24/7 Support", desc: "Always here to help", color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          {features.map((f, i) => (
            <div key={i} className={`${f.bg} rounded-xl p-3 flex items-center gap-2.5`}>
              <f.icon className={`h-5 w-5 ${f.color} flex-shrink-0`} />
              <div>
                <p className="text-[11px] font-bold text-[var(--j-dark)]">{f.title}</p>
                <p className="text-[9px] text-[var(--j-muted)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 15. NEWSLETTER
// ═══════════════════════════════════════════════════════════
export function JumiaNewsletter({ storeName = "Store" }: { storeName?: string }) {
  const [email, setEmail] = useState("");
  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-sm font-bold text-[var(--j-dark)] mb-1">New to {storeName}?</p>
          <p className="text-[11px] text-[var(--j-muted)] mb-3">Subscribe for exclusive deals & updates</p>
          <div className="flex max-w-sm mx-auto gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 border border-[var(--j-border)] rounded-l-lg text-xs outline-none focus:border-[var(--j-primary)]"
            />
            <button className="px-4 py-2 bg-[var(--j-primary)] hover:bg-[var(--j-primary-dark)] text-white font-bold text-xs rounded-r-lg transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 16. FOOTER
// ═══════════════════════════════════════════════════════════
export function JumiaFooter({ storeName = "Store", storeSlug = "" }: { storeName?: string; storeSlug?: string }) {
  return (
    <div className="jumia-block bg-[var(--j-dark)] text-white mt-2">
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-[10px] font-bold mb-3 tracking-wider text-gray-400">NEED HELP?</h4>
            <ul className="space-y-2">
              {["Chat with us", "Help Center", "Contact Us"].map((link, i) => (
                <li key={i}><Link href={`/store/${storeSlug}`} className="text-[11px] text-gray-400 hover:text-white">{link}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold mb-3 tracking-wider text-gray-400">USEFUL LINKS</h4>
            <ul className="space-y-2">
              {["Track Order", "Shipping Info", "Return Policy"].map((link, i) => (
                <li key={i}><Link href={`/store/${storeSlug}`} className="text-[11px] text-gray-400 hover:text-white">{link}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
          <p className="text-[10px] text-gray-500">© {new Date().getFullYear()} {storeName}</p>
          <p className="text-[10px] text-gray-600">Powered by Prokip</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 17. BOTTOM NAV — Fixed mobile bottom navigation
// ═══════════════════════════════════════════════════════════
export function JumiaBottomNav({ storeSlug = "" }: { storeSlug?: string }) {
  const tabs = [
    { icon: Home, label: "Home", href: `/store/${storeSlug}`, active: true },
    { icon: Grid3X3, label: "Categories", href: `/store/${storeSlug}/shop` },
    { icon: ShoppingCart, label: "Cart", href: `/store/${storeSlug}/cart` },
    { icon: Heart, label: "Wishlist", href: `/store/${storeSlug}/shop` },
    { icon: UserCircle, label: "Account", href: `/store/${storeSlug}` },
  ];

  return (
    <div className="jumia-block fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--j-border)] lg:hidden">
      <div className="flex items-center justify-around py-1.5">
        {tabs.map((tab, i) => (
          <Link key={i} href={tab.href} className={`flex flex-col items-center gap-0.5 px-2 py-1 ${tab.active ? "text-[var(--j-primary)]" : "text-[var(--j-muted)]"}`}>
            <tab.icon className="h-5 w-5" />
            <span className="text-[9px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 18. SPONSORED PRODUCTS
// ═══════════════════════════════════════════════════════════
export interface JumiaSponsoredProps {
  title?: string;
  products?: Product[];
  storeSlug?: string;
}

export function JumiaSponsored({ title = "Sponsored Products", products = [], storeSlug = "" }: JumiaSponsoredProps) {
  const store = useJumiaStore(storeSlug); const items = products.length > 0 ? products : (store?.products || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--j-border)]">
            <h2 className="text-[10px] font-bold text-[var(--j-muted)] uppercase tracking-wider">{title}</h2>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide">
            {items.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-[130px] border-r border-[var(--j-border)] last:border-r-0">
                <JumiaProductCard product={product} index={i + 1} storeSlug={storeSlug} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 19. CATEGORY GRID — Full grid with images
// ═══════════════════════════════════════════════════════════
export interface JumiaCategoryGridProps {
  title?: string;
  categories?: Category[];
  storeSlug?: string;
}

export function JumiaCategoryGrid({ title = "Top Categories", categories = [], storeSlug = "" }: JumiaCategoryGridProps) {
  const store = useJumiaStore(storeSlug);
  const cats = categories.length > 0 ? categories : (store?.categories || []);

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--j-border)]">
            <h2 className="text-sm font-bold text-[var(--j-dark)]">{title}</h2>
          </div>
          <div className="grid grid-cols-3 gap-0 divide-x divide-y divide-[var(--j-border)]">
            {cats.slice(0, 9).map((cat, i) => (
              <Link key={cat.id} href={`/store/${storeSlug}/category/${cat.slug}`} className="flex flex-col items-center justify-center p-3 hover:bg-[var(--j-light)] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[var(--j-light)] flex items-center justify-center mb-1.5 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Grid3X3 className="w-5 h-5 text-[var(--j-muted)] opacity-40" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-[var(--j-text)] text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 20. APP BANNER
// ═══════════════════════════════════════════════════════════
export function JumiaAppBanner({ storeName = "Store" }: { storeName?: string }) {
  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="px-3 pt-2">
        <div className="bg-gradient-to-r from-[var(--j-primary)] to-[var(--j-primary-dark)] rounded-xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-white text-sm font-extrabold mb-0.5">Download the {storeName} App</h3>
            <p className="text-white/70 text-[10px] mb-2">Get exclusive deals on the go</p>
            <div className="flex gap-2">
              <button className="bg-black text-white rounded-md px-2.5 py-1.5 text-[9px] font-bold">▶ Google Play</button>
              <button className="bg-black text-white rounded-md px-2.5 py-1.5 text-[9px] font-bold">🍎 App Store</button>
            </div>
          </div>
          <span className="text-5xl">📱</span>
        </div>
      </div>
    </div>
  );
}

// ─── SPACER (bottom padding for bottom nav) ────────────────
export function JumiaSpacer() {
  return <div className="jumia-block h-16 bg-[var(--j-bg)]" />;
}
