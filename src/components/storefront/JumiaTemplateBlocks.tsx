"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ShoppingCart,
  User,
  HelpCircle,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Menu,
  X,
  Clock,
  Zap,
  ArrowRight,
  BadgeCheck,
  Smartphone,
  Package,
  CreditCard,
  MapPin,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   JUMIA-STYLE MARKETPLACE TEMPLATE BLOCKS
   ════════════════════════════════════════════════════════════════
   Elite one-block pattern for AI-generated stores.
   Follows Jumia's exact layout: top bar → header → hero slider →
   flash deals → categories → product grids → banners → official
   stores → app CTA → newsletter → footer.
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
        .jumia-block, .jumia-block * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .jumia-block { --j-primary: #F68B1E; --j-primary-dark: #E07A10; --j-red: #CC0000; --j-red-light: #FFE0E0; --j-green: #00A651; --j-dark: #282828; --j-text: #313133; --j-muted: #75757A; --j-light: #F1F1F2; --j-border: #E0E0E0; --j-star: #F5A623; --j-bg: #F1F1F2; }
        .jumia-block .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
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
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i <= Math.round(rating) ? "fill-[var(--j-star)] text-[var(--j-star)]" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
      {count > 0 && <span className="text-[10px] text-[var(--j-muted)]">({count})</span>}
    </div>
  );
}

// ─── TYPES ─────────────────────────────────────────────────
interface ProductImage { id: string; url: string; alt?: string; }
interface Product {
  id: string; name: string; slug: string; price: number;
  compareAtPrice?: number; currency: string; images: ProductImage[];
  category?: { name: string; slug: string }; isFeatured?: boolean;
  inStock?: boolean; tags?: string[]; reviewCount?: number; rating?: number;
}
interface Category { id: string; name: string; slug: string; image?: string; _count?: { products: number }; }

// ═══════════════════════════════════════════════════════════
// 1. TOP BAR — Free delivery, seller CTA, help links
// ═══════════════════════════════════════════════════════════
export function JumiaTopBar({
  storeSlug = "",
  message = "Free delivery on orders over ₦15,000",
}: {
  storeSlug?: string;
  message?: string;
}) {
  return (
    <div className="jumia-block bg-[var(--j-dark)] text-white">
      <div className="max-w-[1220px] mx-auto px-4 flex items-center justify-between h-[30px] text-[11px]">
        <span className="flex items-center gap-1.5">
          <Truck className="h-3 w-3 text-[var(--j-primary)]" />
          {message}
        </span>
        <div className="hidden md:flex items-center gap-4">
          <Link href={`/store/${storeSlug}`} className="hover:text-[var(--j-primary)] transition-colors">
            Sell on Store
          </Link>
          <span className="text-gray-500">|</span>
          <Link href={`/store/${storeSlug}`} className="hover:text-[var(--j-primary)] transition-colors flex items-center gap-1">
            <Headphones className="h-3 w-3" /> Help
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. HEADER — Logo, search bar, account, cart
// ═══════════════════════════════════════════════════════════
export function JumiaHeader({
  storeName = "Store",
  storeSlug = "",
  logo,
  cartCount = 0,
  categories = [],
}: {
  storeName?: string;
  storeSlug?: string;
  logo?: string | null;
  cartCount?: number;
  categories?: Category[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="jumia-block bg-white border-b border-[var(--j-border)] sticky top-0 z-50">
      <div className="max-w-[1220px] mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center gap-4 h-[60px]">
          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-[var(--j-dark)]">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href={`/store/${storeSlug}`} className="flex-shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 max-w-[120px] object-contain" />
            ) : (
              <span className="text-xl font-extrabold text-[var(--j-primary)]">{storeName}</span>
            )}
          </Link>

          {/* Search */}
          <div className="flex-1 hidden sm:flex items-center max-w-[600px]">
            <div className="flex w-full rounded-lg overflow-hidden border border-[var(--j-border)] focus-within:border-[var(--j-primary)] transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and categories..."
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white text-[var(--j-text)] placeholder:text-[var(--j-muted)]"
              />
              <button className="px-5 bg-[var(--j-primary)] hover:bg-[var(--j-primary-dark)] transition-colors text-white flex items-center justify-center">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
            <Link
              href={`/store/${storeSlug}`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--j-dark)] hover:bg-[var(--j-light)] transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="hidden lg:block text-xs font-medium">Account</span>
            </Link>
            <Link
              href={`/store/${storeSlug}`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--j-dark)] hover:bg-[var(--j-light)] transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="hidden lg:block text-xs font-medium">Help</span>
            </Link>
            <Link
              href={`/store/${storeSlug}/cart`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--j-dark)] hover:bg-[var(--j-light)] transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden lg:block text-xs font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 left-5 lg:left-auto lg:-top-0.5 lg:-right-1 bg-[var(--j-primary)] text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category nav bar */}
        {categories.length > 0 && (
          <div className="hidden lg:flex items-center gap-0.5 h-[38px] overflow-x-auto scrollbar-hide -mx-1">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${storeSlug}/category/${cat.slug}`}
                className="flex-shrink-0 px-3 py-1.5 text-[12px] font-medium text-[var(--j-text)] hover:text-[var(--j-primary)] hover:bg-[var(--j-light)] rounded-md transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--j-border)] bg-white px-4 py-3">
          {/* Mobile search */}
          <div className="sm:hidden flex items-center rounded-lg overflow-hidden border border-[var(--j-border)] mb-3">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button className="px-4 py-2 bg-[var(--j-primary)] text-white">
              <Search className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${storeSlug}/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-[var(--j-text)] hover:bg-[var(--j-light)] rounded-lg"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. HERO BANNER SLIDER
// ═══════════════════════════════════════════════════════════
export interface JumiaHeroBannerProps {
  slides?: Array<{
    image: string;
    mobileImage?: string;
    title?: string;
    subtitle?: string;
    link?: string;
    bgColor?: string;
  }>;
  sidebanners?: Array<{ image: string; link?: string }>;
  storeSlug?: string;
}

export function JumiaHeroBanner({ slides = [], sidebanners = [], storeSlug = "" }: JumiaHeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultSlides = slides.length > 0 ? slides : [
    { image: "", title: "Mega Sale Up To 70% Off", subtitle: "Shop the best deals today", bgColor: "#F68B1E" },
    { image: "", title: "Free Delivery On Orders Above ₦15,000", subtitle: "Fast & reliable shipping", bgColor: "#CC0000" },
    { image: "", title: "New Arrivals Just Dropped", subtitle: "Discover what's trending", bgColor: "#282828" },
  ];

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % defaultSlides.length), 5000);
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
      <div className="max-w-[1220px] mx-auto px-4 py-3">
        <div className="flex gap-3">
          {/* Main slider */}
          <div className="flex-1 relative rounded-lg overflow-hidden bg-white" style={{ minHeight: 280 }}>
            {defaultSlides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                {slide.image ? (
                  <img src={slide.image} alt={slide.title || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8" style={{ background: slide.bgColor || "var(--j-primary)" }}>
                    <div className="text-center text-white">
                      <h2 className="text-2xl md:text-4xl font-extrabold mb-2">{slide.title}</h2>
                      <p className="text-sm md:text-base opacity-90">{slide.subtitle}</p>
                      <button className="mt-4 bg-white text-[var(--j-dark)] font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Arrows */}
            <button onClick={() => goTo((current - 1 + defaultSlides.length) % defaultSlides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
              <ChevronLeft className="h-5 w-5 text-[var(--j-dark)]" />
            </button>
            <button onClick={() => goTo((current + 1) % defaultSlides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
              <ChevronRight className="h-5 w-5 text-[var(--j-dark)]" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {defaultSlides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-[var(--j-primary)]" : "w-2 bg-white/60"}`} />
              ))}
            </div>
          </div>

          {/* Side banners (desktop) */}
          {sidebanners.length > 0 && (
            <div className="hidden lg:flex flex-col gap-3 w-[260px]">
              {sidebanners.slice(0, 2).map((banner, i) => (
                <Link key={i} href={banner.link || "#"} className="flex-1 rounded-lg overflow-hidden bg-white">
                  <img src={banner.image} alt="" className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. FLASH DEALS — Countdown timer + horizontal scroll
// ═══════════════════════════════════════════════════════════
export interface JumiaFlashDealsProps {
  title?: string;
  products?: Product[];
  storeSlug?: string;
  endTime?: string; // ISO date
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

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--j-border)]">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-[var(--j-dark)] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[var(--j-primary)] fill-[var(--j-primary)]" />
                {title}
              </h2>
              {/* Countdown */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--j-muted)]">Time Left:</span>
                {[
                  { val: timeLeft.hours, label: "H" },
                  { val: timeLeft.minutes, label: "M" },
                  { val: timeLeft.seconds, label: "S" },
                ].map((t, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <span className="bg-[var(--j-dark)] text-white font-bold text-xs px-1.5 py-0.5 rounded min-w-[26px] text-center">
                      {String(t.val).padStart(2, "0")}
                    </span>
                    {i < 2 && <span className="text-[var(--j-dark)] font-bold">:</span>}
                  </span>
                ))}
              </div>
            </div>
            <Link href={`/store/${storeSlug}/shop`} className="text-[var(--j-primary)] text-sm font-semibold hover:underline flex items-center gap-1">
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Products scroll */}
          <div className="relative group">
            <button onClick={() => scroll("left")} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide gap-0 divide-x divide-[var(--j-border)]">
              {products.map((product) => {
                const discount = calcDiscount(product.price, product.compareAtPrice);
                const img = product.images?.[0]?.url;
                return (
                  <Link
                    key={product.id}
                    href={`/store/${storeSlug}/product/${product.slug}`}
                    className="flex-shrink-0 w-[160px] sm:w-[180px] p-3 hover:shadow-md transition-shadow block"
                  >
                    <div className="relative aspect-square mb-2 bg-[var(--j-light)] rounded flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img src={img} alt={product.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Package className="h-10 w-10 text-gray-300" />
                      )}
                      {discount > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-[var(--j-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs text-[var(--j-text)] line-clamp-2 mb-1 leading-tight">{product.name}</h3>
                    <p className="text-sm font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <p className="text-[11px] text-[var(--j-muted)] line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
                    )}
                  </Link>
                );
              })}
            </div>
            <button onClick={() => scroll("right")} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. CATEGORY GRID — Icons + names
// ═══════════════════════════════════════════════════════════
export interface JumiaCategoryGridProps {
  title?: string;
  categories?: Category[];
  storeSlug?: string;
}

export function JumiaCategoryGrid({ title = "Top Categories", categories = [], storeSlug = "" }: JumiaCategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--j-border)]">
            <h2 className="text-base font-bold text-[var(--j-dark)]">{title}</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0 divide-x divide-y divide-[var(--j-border)]">
            {categories.slice(0, 16).map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${storeSlug}/category/${cat.slug}`}
                className="flex flex-col items-center justify-center p-4 hover:bg-[var(--j-light)] transition-colors text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--j-light)] flex items-center justify-center mb-2 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-[var(--j-muted)]" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-[var(--j-text)] line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. SECTION TITLE
// ═══════════════════════════════════════════════════════════
export function JumiaSectionTitle({ title = "", link, storeSlug = "" }: { title?: string; link?: string; storeSlug?: string }) {
  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-1 pt-1">
        <div className="bg-white rounded-t-lg px-4 py-3 border-b border-[var(--j-border)] flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--j-dark)]">{title}</h2>
          {link && (
            <Link href={link} className="text-[var(--j-primary)] text-sm font-semibold hover:underline flex items-center gap-1">
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 7. PRODUCT GRID — Main product display (Jumia card style)
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
  columns = 5,
  showSeeAll = true,
  seeAllLink,
}: JumiaProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Title bar */}
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--j-border)]">
              <h2 className="text-base font-bold text-[var(--j-dark)]">{title}</h2>
              {showSeeAll && (
                <Link href={seeAllLink || `/store/${storeSlug}/shop`} className="text-[var(--j-primary)] text-sm font-semibold hover:underline flex items-center gap-1">
                  SEE ALL <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}

          {/* Product grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${columns} divide-x divide-y divide-[var(--j-border)]`}>
            {products.map((product) => {
              const discount = calcDiscount(product.price, product.compareAtPrice);
              const img = product.images?.[0]?.url;
              return (
                <Link
                  key={product.id}
                  href={`/store/${storeSlug}/product/${product.slug}`}
                  className="group p-3 hover:shadow-lg transition-shadow block relative"
                >
                  {/* Discount badge */}
                  {discount > 0 && (
                    <span className="absolute top-2 right-2 z-10 bg-[var(--j-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      -{discount}%
                    </span>
                  )}

                  {/* Official badge */}
                  {product.isFeatured && (
                    <span className="absolute top-2 left-2 z-10 bg-[#004DC1] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <BadgeCheck className="h-2.5 w-2.5" /> Official
                    </span>
                  )}

                  {/* Image */}
                  <div className="aspect-square mb-2 bg-[var(--j-light)] rounded flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="h-12 w-12 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-xs text-[var(--j-text)] line-clamp-2 mb-1.5 leading-tight min-h-[32px]">{product.name}</h3>
                  <p className="text-[15px] font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[var(--j-muted)] line-through">{formatPrice(product.compareAtPrice, product.currency)}</span>
                    </div>
                  )}
                  <div className="mt-1.5">
                    <StarRating rating={product.rating || 0} count={product.reviewCount || 0} />
                  </div>

                  {/* Free delivery tag */}
                  {product.price > 15000 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--j-green)] font-medium">
                      <Truck className="h-3 w-3" /> Free Delivery
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 8. PROMO BANNERS — Full-width deal banners
// ═══════════════════════════════════════════════════════════
export interface JumiaPromoBannersProps {
  banners?: Array<{
    image: string;
    link?: string;
    title?: string;
    bgColor?: string;
  }>;
  storeSlug?: string;
}

export function JumiaPromoBanners({ banners = [], storeSlug = "" }: JumiaPromoBannersProps) {
  const defaultBanners = banners.length > 0 ? banners : [
    { image: "", title: "Up To 50% Off Electronics", bgColor: "#282828" },
    { image: "", title: "New Collection Available", bgColor: "#CC0000" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className={`grid ${defaultBanners.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-3`}>
          {defaultBanners.map((banner, i) => (
            <Link key={i} href={banner.link || `/store/${storeSlug}/shop`} className="block rounded-lg overflow-hidden">
              {banner.image ? (
                <img src={banner.image} alt={banner.title || ""} className="w-full h-[140px] md:h-[160px] object-cover" />
              ) : (
                <div className="w-full h-[140px] md:h-[160px] flex items-center justify-center" style={{ background: banner.bgColor || "var(--j-primary)" }}>
                  <span className="text-white text-lg md:text-xl font-extrabold">{banner.title}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 9. OFFICIAL STORES — Brand logos grid
// ═══════════════════════════════════════════════════════════
export interface JumiaOfficialStoresProps {
  title?: string;
  brands?: Array<{ name: string; logo?: string; slug?: string }>;
  storeSlug?: string;
}

export function JumiaOfficialStores({ title = "Official Stores", brands = [], storeSlug = "" }: JumiaOfficialStoresProps) {
  if (brands.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--j-border)]">
            <h2 className="text-base font-bold text-[var(--j-dark)]">{title}</h2>
            <Link href={`/store/${storeSlug}/shop`} className="text-[var(--j-primary)] text-sm font-semibold hover:underline flex items-center gap-1">
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-0 divide-x divide-y divide-[var(--j-border)]">
            {brands.slice(0, 12).map((brand, i) => (
              <Link
                key={i}
                href={`/store/${storeSlug}/shop`}
                className="flex items-center justify-center p-5 hover:bg-[var(--j-light)] transition-colors aspect-[3/2]"
              >
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-10 max-w-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-[var(--j-muted)] text-center">{brand.name}</span>
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
// 10. FEATURES BAR — Delivery, returns, secure, support
// ═══════════════════════════════════════════════════════════
export function JumiaFeaturesBar() {
  const features = [
    { icon: Truck, title: "Free Delivery", desc: "For orders above ₦15,000" },
    { icon: RotateCcw, title: "15 Days Returns", desc: "Easy return policy" },
    { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
    { icon: Headphones, title: "24/7 Support", desc: "Dedicated support" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--j-border)]">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-[var(--j-primary)]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--j-dark)]">{f.title}</p>
                  <p className="text-[10px] text-[var(--j-muted)]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 11. APP DOWNLOAD BANNER
// ═══════════════════════════════════════════════════════════
export function JumiaAppBanner({ storeName = "Store" }: { storeName?: string }) {
  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-gradient-to-r from-[var(--j-primary)] to-[var(--j-primary-dark)] rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-white text-lg md:text-xl font-extrabold mb-1">Download the {storeName} App</h3>
            <p className="text-white/80 text-sm">Get exclusive deals and track your orders on the go</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-black text-white rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-900 transition-colors">
              <Smartphone className="h-5 w-5" />
              <div className="text-left">
                <p className="text-[8px] leading-none">GET IT ON</p>
                <p className="text-xs font-bold">Google Play</p>
              </div>
            </button>
            <button className="bg-black text-white rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-900 transition-colors">
              <Smartphone className="h-5 w-5" />
              <div className="text-left">
                <p className="text-[8px] leading-none">Download on the</p>
                <p className="text-xs font-bold">App Store</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 12. NEWSLETTER
// ═══════════════════════════════════════════════════════════
export function JumiaNewsletter({ storeName = "Store" }: { storeName?: string }) {
  const [email, setEmail] = useState("");
  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-base font-bold text-[var(--j-dark)] mb-1">Subscribe to our Newsletter</h3>
          <p className="text-sm text-[var(--j-muted)] mb-4">Get the latest deals and offers from {storeName}</p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 border border-[var(--j-border)] rounded-l-lg text-sm outline-none focus:border-[var(--j-primary)]"
            />
            <button className="px-6 py-2.5 bg-[var(--j-primary)] hover:bg-[var(--j-primary-dark)] text-white font-bold text-sm rounded-r-lg transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 13. FOOTER — Multi-column links, payment, social
// ═══════════════════════════════════════════════════════════
export function JumiaFooter({ storeName = "Store", storeSlug = "" }: { storeName?: string; storeSlug?: string }) {
  const columns = [
    {
      title: "NEED HELP?",
      links: ["Chat with us", "Help Center", "Contact Us"],
    },
    {
      title: "USEFUL LINKS",
      links: ["Track Your Order", "Shipping & Delivery", "Return Policy", "Dispute Resolution"],
    },
    {
      title: `ABOUT ${storeName.toUpperCase()}`,
      links: ["About Us", "Terms & Conditions", "Privacy Policy", "Cookie Notice", "Careers"],
    },
  ];

  return (
    <div className="jumia-block bg-[#282828] text-white">
      <div className="max-w-[1220px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-xs font-bold mb-4 tracking-wider">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href={`/store/${storeSlug}`} className="text-xs text-gray-400 hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Payment & Connect */}
          <div>
            <h4 className="text-xs font-bold mb-4 tracking-wider">PAYMENT METHODS</h4>
            <div className="flex items-center gap-2 mb-6">
              {["Visa", "MC", "Verve", "Bank"].map((method) => (
                <div key={method} className="h-7 px-2 bg-white rounded flex items-center justify-center">
                  <span className="text-[9px] font-bold text-[var(--j-dark)]">{method}</span>
                </div>
              ))}
            </div>
            <h4 className="text-xs font-bold mb-3 tracking-wider">CONNECT WITH US</h4>
            <div className="flex items-center gap-3">
              {["FB", "TW", "IG", "YT"].map((social) => (
                <div key={social} className="h-8 w-8 bg-gray-700 hover:bg-[var(--j-primary)] rounded-full flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p className="text-xs text-gray-600">Powered by Prokip</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 14. TOP DEALS BANNER — Colored header section
// ═══════════════════════════════════════════════════════════
export interface JumiaTopDealsProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  products?: Product[];
  storeSlug?: string;
}

export function JumiaTopDeals({ title = "Top Deals", subtitle = "Limited time offers", bgColor = "#CC0000", products = [], storeSlug = "" }: JumiaTopDealsProps) {
  if (products.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Colored header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: bgColor }}>
            <div>
              <h2 className="text-base font-bold text-white">{title}</h2>
              {subtitle && <p className="text-[11px] text-white/80">{subtitle}</p>}
            </div>
            <Link href={`/store/${storeSlug}/shop`} className="text-white text-sm font-semibold hover:underline flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x divide-y divide-[var(--j-border)]">
            {products.slice(0, 12).map((product) => {
              const discount = calcDiscount(product.price, product.compareAtPrice);
              const img = product.images?.[0]?.url;
              return (
                <Link key={product.id} href={`/store/${storeSlug}/product/${product.slug}`} className="p-3 hover:shadow-md transition-shadow block">
                  <div className="relative aspect-square mb-2 bg-[var(--j-light)] rounded flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Package className="h-10 w-10 text-gray-300" />
                    )}
                    {discount > 0 && (
                      <span className="absolute top-1 right-1 bg-[var(--j-primary)] text-white text-[9px] font-bold px-1 py-0.5 rounded">-{discount}%</span>
                    )}
                  </div>
                  <h3 className="text-[11px] text-[var(--j-text)] line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-sm font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <p className="text-[10px] text-[var(--j-muted)] line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
                  )}
                  <div className="mt-1"><StarRating rating={product.rating || 0} count={product.reviewCount || 0} /></div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 15. CATEGORY DEAL ROW — The core repeating Jumia pattern
//     "Phone deals | Clearance Sales", "Beauty Deals", etc.
//     Each is a titled card with a horizontal product carousel
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
  title = "Deals",
  subtitle,
  products = [],
  storeSlug = "",
  seeAllLink,
  bannerImage,
  bannerLink,
}: JumiaCategoryDealRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Title */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--j-border)]">
            <h2 className="text-base font-bold text-[var(--j-dark)] truncate">
              {title}
              {subtitle && <span className="text-[var(--j-primary)] font-normal text-sm ml-2">| {subtitle}</span>}
            </h2>
            <Link
              href={seeAllLink || `/store/${storeSlug}/shop`}
              className="text-[var(--j-primary)] text-sm font-semibold hover:underline flex items-center gap-1 flex-shrink-0"
            >
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Banner + Products row (Jumia pattern: optional left banner + scrolling products) */}
          <div className="flex">
            {/* Optional side banner */}
            {bannerImage && (
              <Link
                href={bannerLink || seeAllLink || `/store/${storeSlug}/shop`}
                className="hidden lg:block flex-shrink-0 w-[220px] border-r border-[var(--j-border)]"
              >
                <img src={bannerImage} alt={title} className="w-full h-full object-cover" />
              </Link>
            )}

            {/* Horizontal product scroll */}
            <div className="flex-1 relative group min-w-0">
              <button onClick={() => scroll("left")} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide divide-x divide-[var(--j-border)]">
                {products.map((product) => {
                  const discount = calcDiscount(product.price, product.compareAtPrice);
                  const img = product.images?.[0]?.url;
                  return (
                    <Link
                      key={product.id}
                      href={`/store/${storeSlug}/product/${product.slug}`}
                      className="flex-shrink-0 w-[160px] sm:w-[180px] p-3 hover:shadow-md transition-shadow block"
                    >
                      <div className="relative aspect-square mb-2 bg-[var(--j-light)] rounded flex items-center justify-center overflow-hidden">
                        {img ? (
                          <img src={img} alt={product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="h-10 w-10 text-gray-300" />
                        )}
                        {discount > 0 && (
                          <span className="absolute top-1.5 right-1.5 bg-[var(--j-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs text-[var(--j-text)] line-clamp-2 mb-1 leading-tight">{product.name}</h3>
                      <p className="text-sm font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <p className="text-[11px] text-[var(--j-muted)] line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
                      )}
                      <div className="mt-1"><StarRating rating={product.rating || 0} count={product.reviewCount || 0} /></div>
                    </Link>
                  );
                })}
              </div>
              <button onClick={() => scroll("right")} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 16. BRAND STORE ROW — "Nivea Official Store", "Xiaomi" etc.
//     Brand banner left + products right (Jumia pattern)
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Brand header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--j-border)]">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--j-dark)]">
                {brandName}
                {subtitle && <span className="text-[var(--j-primary)] font-normal text-sm ml-2">| {subtitle}</span>}
              </h2>
              <BadgeCheck className="h-4 w-4 text-[#004DC1]" />
            </div>
            <Link
              href={seeAllLink || `/store/${storeSlug}/shop`}
              className="text-[var(--j-primary)] text-sm font-semibold hover:underline flex items-center gap-1"
            >
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex">
            {/* Brand banner on left */}
            <div className="hidden lg:flex flex-shrink-0 w-[220px] flex-col items-center justify-center p-6 border-r border-[var(--j-border)]" style={{ background: bgColor }}>
              {logo ? (
                <img src={logo} alt={brandName} className="max-w-[140px] max-h-[80px] object-contain mb-3" />
              ) : (
                <span className="text-white text-lg font-extrabold mb-2">{brandName}</span>
              )}
              <span className="text-white/80 text-xs text-center">Shop exclusive deals</span>
            </div>

            {/* Products */}
            <div className="flex-1 relative group min-w-0">
              <button onClick={() => scroll("left")} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide divide-x divide-[var(--j-border)]">
                {products.map((product) => {
                  const discount = calcDiscount(product.price, product.compareAtPrice);
                  const img = product.images?.[0]?.url;
                  return (
                    <Link
                      key={product.id}
                      href={`/store/${storeSlug}/product/${product.slug}`}
                      className="flex-shrink-0 w-[160px] sm:w-[180px] p-3 hover:shadow-md transition-shadow block"
                    >
                      <div className="relative aspect-square mb-2 bg-[var(--j-light)] rounded flex items-center justify-center overflow-hidden">
                        {img ? (
                          <img src={img} alt={product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="h-10 w-10 text-gray-300" />
                        )}
                        {discount > 0 && (
                          <span className="absolute top-1.5 right-1.5 bg-[var(--j-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                        {/* Official badge */}
                        <span className="absolute bottom-1 left-1 bg-[#004DC1] text-white text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                          <BadgeCheck className="h-2 w-2" /> Official
                        </span>
                      </div>
                      <h3 className="text-xs text-[var(--j-text)] line-clamp-2 mb-1 leading-tight">{product.name}</h3>
                      <p className="text-sm font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <p className="text-[11px] text-[var(--j-muted)] line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
                      )}
                      <div className="mt-1"><StarRating rating={product.rating || 0} count={product.reviewCount || 0} /></div>
                    </Link>
                  );
                })}
              </div>
              <button onClick={() => scroll("right")} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 17. CATEGORY ICON BAR — Small horizontal bar with icons
//     (Buy Phones, Sell on Jumia, Delivery, JForce)
// ═══════════════════════════════════════════════════════════
export interface JumiaCategoryIconBarProps {
  items?: Array<{ icon?: string; label: string; link?: string }>;
  storeSlug?: string;
}

export function JumiaCategoryIconBar({ items = [], storeSlug = "" }: JumiaCategoryIconBarProps) {
  const defaultItems = items.length > 0 ? items : [
    { label: "Phones & Tablets", link: "" },
    { label: "Sell on Store", link: "" },
    { label: "Free Delivery", link: "" },
    { label: "Best Deals", link: "" },
    { label: "Groceries", link: "" },
    { label: "Fashion", link: "" },
  ];

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide divide-x divide-[var(--j-border)]">
            {defaultItems.map((item, i) => (
              <Link
                key={i}
                href={item.link || `/store/${storeSlug}/shop`}
                className="flex-shrink-0 flex flex-col items-center justify-center py-3 px-5 hover:bg-[var(--j-light)] transition-colors min-w-[120px]"
              >
                {item.icon ? (
                  <img src={item.icon} alt={item.label} className="h-8 w-8 object-contain mb-1.5" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[var(--j-light)] flex items-center justify-center mb-1.5">
                    <Package className="h-4 w-4 text-[var(--j-muted)]" />
                  </div>
                )}
                <span className="text-[11px] font-medium text-[var(--j-text)] text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 18. SPONSORED PRODUCTS — Single row highlight
// ═══════════════════════════════════════════════════════════
export interface JumiaSponsoredProps {
  title?: string;
  products?: Product[];
  storeSlug?: string;
}

export function JumiaSponsored({ title = "Sponsored Products", products = [], storeSlug = "" }: JumiaSponsoredProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <div className="jumia-block bg-[var(--j-bg)]">
      <div className="max-w-[1220px] mx-auto px-4 pb-3">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--j-border)]">
            <h2 className="text-xs font-bold text-[var(--j-muted)] uppercase tracking-wider">{title}</h2>
          </div>
          <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide divide-x divide-[var(--j-border)]">
            {products.map((product) => {
              const img = product.images?.[0]?.url;
              return (
                <Link key={product.id} href={`/store/${storeSlug}/product/${product.slug}`} className="flex-shrink-0 w-[150px] p-3 hover:shadow-md transition-shadow block">
                  <div className="aspect-square mb-2 bg-[var(--j-light)] rounded flex items-center justify-center overflow-hidden">
                    {img ? <img src={img} alt={product.name} className="w-full h-full object-contain p-1" /> : <Package className="h-8 w-8 text-gray-300" />}
                  </div>
                  <h3 className="text-[10px] text-[var(--j-text)] line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs font-bold text-[var(--j-dark)]">{formatPrice(product.price, product.currency)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
