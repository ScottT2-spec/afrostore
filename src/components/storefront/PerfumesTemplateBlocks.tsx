"use client";
import { ChevronDown, Menu, Search, Heart, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   PERFUMES TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Perfumes template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#242424",
  primaryHover: "#000000",
  accentColor: "#8b6798",
  titleColor: "#242424",
  textColor: "#767676",
  entityTitleColor: "#333333",
  linkColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#1a1a1a",
  containerWidth: "1320px",
  borderRadius: "0px",
  titleFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'Inter', Arial, Helvetica, sans-serif",
};

const IMG_BASE = "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function PerfumesFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    `}} />
  );
}

/* ─── SHARED STYLES ─────────────────────────────────────────── */
const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth,
  margin: "0 auto",
  padding: "0 15px",
  boxSizing: "border-box" as const,
  width: "100%",
};

/* ─── SCOPED STYLE INJECTOR ─────────────────────────────────── */
function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-perfumes-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ─── useInView HOOK ────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── STORE CONTEXT ─────────────────────────────────────────── */

export interface PerfumesProduct {
  id: string;
  name: string;
  category?: string;
  categoryLink?: string;
  price: string;
  salePrice?: string;
  image: string;
  hoverImage?: string;
  link: string;
  badge?: string;
}

export interface PerfumesStoreContextData {
  products: Array<{
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    currency: string; inStock: boolean; isFeatured: boolean; tags?: string[];
    images: Array<{ id: string; url: string; alt?: string }>;
    category?: { id: string; name: string; slug: string };
  }>;
  categories?: Array<{
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
  }>;
  blogs: Array<{
    id: string; title: string; slug: string; excerpt?: string | null;
    coverImage?: string | null; author?: string | null; category?: string | null;
    tags: string[]; publishedAt?: string | null; createdAt: string;
  }>;
  currency: string;
  storeSlug: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
}
export const PerfumesStoreContext = createContext<PerfumesStoreContextData | null>(null);

type PerfumeCategoryData = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

const PERFUME_COLLECTIONS = {
  her: [
    { name: "Étheria", slug: "etheria" },
    { name: "Celeste Aura", slug: "celeste-aura" },
    { name: "Opus Essence", slug: "opus-essence" },
  ],
  him: [
    { name: "Velours Noir", slug: "velours-noir" },
    { name: "Nocturne Essence", slug: "nocturne-essence" },
    { name: "Elysian Bloom", slug: "elysian-bloom" },
  ],
};

function usePerfumeCollections(storeCtx: PerfumesStoreContextData | null, categoryOverrides?: PerfumeCategoryData[]) {
  const overrideCategories = (categoryOverrides || storeCtx?.categories || []).map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
  }));

  const perfumeSlugs = [...PERFUME_COLLECTIONS.her, ...PERFUME_COLLECTIONS.him].map((item) => item.slug);
  const hasPerfumeOverrides = overrideCategories.some((category) => perfumeSlugs.includes(category.slug));
  const sourceCategories = hasPerfumeOverrides ? overrideCategories : [...PERFUME_COLLECTIONS.her, ...PERFUME_COLLECTIONS.him];
  const lookup = new Map(sourceCategories.map((category) => [category.slug, category]));
  const her = PERFUME_COLLECTIONS.her.map((item) => lookup.get(item.slug) || item);
  const him = PERFUME_COLLECTIONS.him.map((item) => lookup.get(item.slug) || item);
  const all = [...her, ...him];

  return { her, him, all };
}

export interface PerfumesHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  categories?: PerfumeCategoryData[];
  cartCount?: number;
  wishlistCount?: number;
}

export function PerfumesHeader({ storeName, storeSlug, logo, categories, cartCount = 0, wishlistCount = 0 }: PerfumesHeaderProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const { her, him, all } = usePerfumeCollections(storeCtx, categories);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const navItems = [
    { label: "Home", href: `/store/${storeSlug}` },
    { label: "Fragrances", href: `/store/${storeSlug}/fragrances`, dropdown: true },
    { label: "Journal", href: `/store/${storeSlug}/journal` },
    { label: "About Us", href: `/store/${storeSlug}/about-us` },
    { label: "Contact Us", href: `/store/${storeSlug}/contact-us` },
    { label: "FAQ", href: `/store/${storeSlug}/contact-us` },
  ];

  const goToSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/store/${storeSlug}/shop?search=${encodeURIComponent(query)}` : `/store/${storeSlug}/shop`);
    setSearchOpen(false);
  };

  const collectionLink = (slug: string) => `/store/${storeSlug}/shop?category=${slug}`;

  const headerCss = `
    .phx-header {
      position: sticky; top: 0; z-index: 40;
      background: rgba(10, 10, 12, 0.96);
      backdrop-filter: blur(14px);
      color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .phx-shell {
      max-width: 1320px; margin: 0 auto; padding: 18px 15px;
      display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: center;
    }
    .phx-logo {
      display: inline-flex; align-items: center; gap: 12px; color: inherit; text-decoration: none;
    }
    .phx-logo img { display: block; width: auto; height: 30px; max-width: 220px; object-fit: contain; }
    .phx-brand {
      font-family: ${TOKENS.titleFont}; font-size: 18px; letter-spacing: 0.12em; text-transform: uppercase;
      white-space: nowrap;
    }
    .phx-nav {
      display: flex; align-items: center; justify-content: center; gap: 28px;
    }
    .phx-nav-item {
      position: relative; display: inline-flex; align-items: center; gap: 6px;
      color: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 600;
      letter-spacing: 0.04em; text-transform: capitalize;
    }
    .phx-nav-item:hover { color: rgba(255,255,255,0.82); }
    .phx-fragrances:hover .phx-dropdown,
    .phx-fragrances:focus-within .phx-dropdown { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
    .phx-dropdown {
      position: absolute; top: calc(100% + 18px); left: 50%; transform: translateX(-50%) translateY(10px);
      width: min(1060px, calc(100vw - 30px)); padding: 26px;
      background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 24px 80px rgba(0,0,0,0.36); opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
    }
    .phx-dropdown-grid {
      display: grid; grid-template-columns: 1.05fr 1.05fr 1.2fr; gap: 24px; align-items: stretch;
    }
    .phx-dropdown-group h3 {
      margin: 0 0 18px; font-family: ${TOKENS.titleFont}; font-size: 20px; font-weight: 600;
    }
    .phx-dropdown-list { display: grid; gap: 10px; }
    .phx-dropdown-link {
      color: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont}; font-size: 15px;
      transition: opacity 0.15s ease;
    }
    .phx-dropdown-link:hover { opacity: 0.72; }
    .phx-dropdown-feature {
      position: relative; min-height: 300px; display: flex; align-items: flex-end; padding: 28px; overflow: hidden;
      background: #2a2028 center/cover no-repeat;
    }
    .phx-dropdown-feature::before {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.1));
    }
    .phx-dropdown-feature-content { position: relative; z-index: 1; max-width: 340px; }
    .phx-dropdown-feature h3 { margin: 0 0 10px; font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 600; }
    .phx-dropdown-feature p { margin: 0; color: rgba(255,255,255,0.88); line-height: 1.7; font-size: 15px; }
    .phx-actions { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }
    .phx-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 42px; height: 42px; color: #fff; text-decoration: none;
      border: 1px solid rgba(255,255,255,0.12); border-radius: 999px;
      background: rgba(255,255,255,0.04); transition: background 0.15s ease, transform 0.15s ease;
    }
    .phx-icon:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
    .phx-icon svg { width: 18px; height: 18px; }
    .phx-badge {
      position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px;
      border-radius: 999px; background: #fff; color: #111; font-size: 10px; font-weight: 700;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .phx-search {
      position: absolute; right: 0; top: calc(100% + 16px); width: min(360px, calc(100vw - 30px));
      background: #111; border: 1px solid rgba(255,255,255,0.1); padding: 14px; box-shadow: 0 18px 50px rgba(0,0,0,0.28);
    }
    .phx-search form { display: flex; gap: 10px; }
    .phx-search input {
      flex: 1; min-width: 0; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      color: #fff; padding: 12px 14px; font-family: ${TOKENS.bodyFont}; font-size: 14px;
    }
    .phx-search input::placeholder { color: rgba(255,255,255,0.48); }
    .phx-search button {
      background: #fff; border: 0; color: #111; font-weight: 700; padding: 12px 16px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer;
    }
    .phx-mobile-toggle { display: none; }
    .phx-mobile-panel {
      display: none; padding: 0 15px 18px; border-top: 1px solid rgba(255,255,255,0.08);
    }
    .phx-mobile-links { display: grid; gap: 8px; padding-top: 16px; }
    .phx-mobile-link { color: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont}; font-size: 15px; }
    .phx-mobile-dropdown { display: grid; gap: 10px; padding-left: 14px; margin-top: 10px; }
    @media (max-width: 1100px) {
      .phx-shell { grid-template-columns: auto auto; }
      .phx-nav, .phx-actions { display: none; }
      .phx-mobile-toggle { display: inline-flex; width: 42px; height: 42px; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #fff; }
      .phx-mobile-panel { display: ${mobileMenu ? "block" : "none"}; }
    }
    @media (max-width: 767px) {
      .phx-shell { grid-template-columns: 1fr auto; gap: 14px; }
      .phx-brand { display: none; }
      .phx-search { left: 0; right: auto; width: min(100%, calc(100vw - 30px)); }
      .phx-dropdown { width: calc(100vw - 30px); padding: 18px; }
      .phx-dropdown-grid { grid-template-columns: 1fr; }
      .phx-dropdown-feature { min-height: 220px; }
      .phx-dropdown-feature h3 { font-size: 30px; }
    }
  `;

  return (
    <header className="phx-header">
      <ScopedStyles id="header" css={headerCss} />
      <div className="phx-shell">
        <Link href={`/store/${storeSlug}`} className="phx-logo" aria-label={storeName}>
          {logo ? <img src={logo} alt={storeName} /> : <span className="phx-brand">{storeName}</span>}
        </Link>

        <nav className="phx-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <div key={item.label} className={item.dropdown ? "phx-fragrances" : ""}>
              <Link href={item.href} className="phx-nav-item">
                {item.label}
                {item.dropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>
              {item.dropdown && (
                <div className="phx-dropdown" role="menu" aria-label="Fragrances dropdown">
                  <div className="phx-dropdown-grid">
                    <div className="phx-dropdown-group">
                      <h3>Collections for Her</h3>
                      <div className="phx-dropdown-list">
                        {her.map((collection) => (
                          <Link key={collection.slug} href={collectionLink(collection.slug)} className="phx-dropdown-link">
                            {collection.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="phx-dropdown-group">
                      <h3>Collections for Him</h3>
                      <div className="phx-dropdown-list">
                        {him.map((collection) => (
                          <Link key={collection.slug} href={collectionLink(collection.slug)} className="phx-dropdown-link">
                            {collection.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="phx-dropdown-feature" style={{ backgroundImage: "url(https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-collection-opus-essence.jpg)" }}>
                      <div className="phx-dropdown-feature-content">
                        <h3>Opus Essence</h3>
                        <p>A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and dewy accords.</p>
                        <div style={{ marginTop: 18 }}>
                          <Link href={collectionLink("opus-essence")} className="phx-dropdown-link">
                            View collection
                          </Link>
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <div className="phx-dropdown-list">
                            {all.map((collection) => (
                              <Link key={`all-${collection.slug}`} href={collectionLink(collection.slug)} className="phx-dropdown-link">
                                {collection.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="phx-actions">
          <button className="phx-icon" type="button" aria-label="Search" onClick={() => setSearchOpen((value) => !value)}>
            <Search />
          </button>
          <Link href={`/store/${storeSlug}/wishlist`} className="phx-icon" aria-label="Wishlist">
            <Heart />
            {wishlistCount > 0 && <span className="phx-badge">{wishlistCount}</span>}
          </Link>
          <Link href={`/store/${storeSlug}/cart`} className="phx-icon" aria-label="Cart">
            <ShoppingCart />
            {cartCount > 0 && <span className="phx-badge">{cartCount}</span>}
          </Link>
        </div>

        <button className="phx-mobile-toggle" type="button" aria-label="Toggle navigation" onClick={() => setMobileMenu((value) => !value)}>
          <Menu className="h-5 w-5" />
        </button>

        {searchOpen && (
          <div className="phx-search">
            <form onSubmit={goToSearch}>
              <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search for products" />
              <button type="submit">Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" style={{ background: "transparent", color: "#fff", border: 0, padding: "0 6px" }}>
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="phx-mobile-panel">
        <div className="phx-mobile-links">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link href={item.href} className="phx-mobile-link">
                {item.label}
              </Link>
              {item.dropdown && (
                <div className="phx-mobile-dropdown">
                  {[...all].map((collection) => (
                    <Link key={`mobile-${collection.slug}-${collection.name}`} href={collectionLink(collection.slug)} className="phx-mobile-link">
                      {collection.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. PERFUMES HERO SLIDER
   Full-viewport slides with solid color backgrounds, centered
   bottle image, large serif title, "Buy now" CTA. Numbered pagination.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesHeroSlide {
  title: string;
  bottleImage: string;
  backgroundImage?: string;
  backgroundColor: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle?: "primary" | "black";
}

export interface PerfumesHeroSliderProps {
  slides: PerfumesHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function PerfumesHeroSlider({ slides, autoplaySpeed = 6000, minHeight = "100vh" }: PerfumesHeroSliderProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => { setCurrent(idx); }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, autoplaySpeed]);

  const scopedCss = `
    .ph-slider { position: relative; width: 100%; overflow: hidden; }
    .ph-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: flex-end; justify-content: center; }
    .ph-slide.ph-active { opacity: 1; position: relative; }
    .ph-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .ph-slide-content {
      position: relative; z-index: 2; width: 100%; text-align: center;
      padding: 120px 15px 100px; display: flex; flex-direction: column; align-items: center;
    }
    .ph-bottle {
      width: 140px; height: auto; margin-bottom: 20px;
    }
    .ph-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 56px;
      line-height: 1.2; margin: 0 0 25px; color: #fff; max-width: 660px;
    }
    .ph-btn-primary {
      display: inline-block; padding: 16px 40px;
      background: ${TOKENS.accentColor}; color: #fff; text-transform: none;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px;
      text-decoration: none; border: none; cursor: pointer;
      transition: opacity 0.3s;
    }
    .ph-btn-primary:hover { opacity: 0.85; }
    .ph-btn-black {
      display: inline-block; padding: 16px 40px;
      background: #000; color: #fff; text-transform: none;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px;
      text-decoration: none; border: none; cursor: pointer;
      transition: opacity 0.3s;
    }
    .ph-btn-black:hover { opacity: 0.85; }
    .ph-nav {
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 25px; z-index: 5;
    }
    .ph-nav-item {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 600;
      color: rgba(255,255,255,0.4); background: none; border: none;
      cursor: pointer; padding: 5px 0; position: relative; transition: color 0.3s;
    }
    .ph-nav-item.ph-nav-active { color: #fff; }
    .ph-nav-item.ph-nav-active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 2px; background: #fff;
    }
    .ph-arrows {
      position: absolute; top: 50%; z-index: 5; display: flex;
      justify-content: space-between; width: 100%; padding: 0 30px;
      transform: translateY(-50%); pointer-events: none;
    }
    .ph-arrow {
      pointer-events: auto; width: 50px; height: 50px; border: 1px solid rgba(255,255,255,0.3);
      background: transparent; color: #fff; font-size: 20px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s;
    }
    .ph-arrow:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
    .ph-anim-in { animation: phSlideDown 0.6s ease forwards; opacity: 0; }
    @keyframes phSlideDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 1024px) {
      .ph-slider { min-height: 600px !important; }
      .ph-title { font-size: 48px; }
      .ph-slide-content { padding: 100px 15px 80px; }
    }
    @media (max-width: 767px) {
      .ph-slider { min-height: 500px !important; }
      .ph-title { font-size: 32px; }
      .ph-bottle { width: 120px; }
    }
  `;

  return (
    <div className="ph-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => (
        <div key={i} className={`ph-slide ${i === current ? "ph-active" : ""}`}>
          <div className="ph-slide-bg" style={{
            backgroundColor: slide.backgroundColor,
            backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
          }} />
          <div className="ph-slide-content">
            {i === current && (
              <>
                <img src={slide.bottleImage} alt="" className="ph-bottle ph-anim-in" style={{ animationDelay: "0.15s" }}  onError={(e) => onImgError(e, "fallback")} />
                <h2 className="ph-title ph-anim-in" style={{ animationDelay: "0.25s" }}>{slide.title}</h2>
                <div className="ph-anim-in" style={{ animationDelay: "0.35s" }}>
                  <Link href={fixLink(slide.buttonLink)} className={slide.buttonStyle === "black" ? "ph-btn-black" : "ph-btn-primary"}>{slide.buttonText}</Link>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <div className="ph-arrows">
            <button className="ph-arrow" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous">←</button>
            <button className="ph-arrow" onClick={() => goTo((current + 1) % slides.length)} aria-label="Next">→</button>
          </div>
          <div className="ph-nav">
            {slides.map((_, i) => (
              <button key={i} className={`ph-nav-item ${i === current ? "ph-nav-active" : ""}`} onClick={() => goTo(i)}>
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. PERFUMES SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesSectionTitleProps {
  title: string;
  align?: "left" | "center";
  marginBottom?: string;
}

export function PerfumesSectionTitle({ title, align = "left", marginBottom = "30px" }: PerfumesSectionTitleProps) {
  return (
    <div style={{ textAlign: align, marginBottom }}>
      <h2 style={{
        fontFamily: TOKENS.titleFont, fontWeight: 600, fontSize: "48px",
        lineHeight: 1.2, color: TOKENS.titleColor, margin: 0,
      }}>{title}</h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PERFUMES PRODUCT GRID
   Bordered grid products — minimal, editorial. Name + price on hover.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesProductGridProps {
  products?: PerfumesProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function PerfumesProductGrid({ products: propProducts, columns = 3, sectionTitle, marginBottom = "120px", maxProducts = 6, filter, filterTag }: PerfumesProductGridProps) {
  const storeCtx = useContext(PerfumesStoreContext);

  const products: PerfumesProduct[] = (() => {
    if (!storeCtx || !storeCtx.products || storeCtx.products.length === 0) return propProducts || [];

    let storeProducts = storeCtx.products;
    if (filter === "featured") {
      const f = storeProducts.filter(p => p.isFeatured);
      if (f.length > 0) storeProducts = f;
    } else if (filter && filter !== "all") {
      const tagged = storeProducts.filter(p =>
        p.tags?.some((t: string) => t.toLowerCase().replace(/[-_ ]/g, "") === filter!.toLowerCase().replace(/[-_ ]/g, ""))
      );
      if (tagged.length > 0) storeProducts = tagged;
    }
    if (filterTag) {
      const tagged = storeProducts.filter(p => p.tags?.some((t: string) => t.toLowerCase() === filterTag.toLowerCase()));
      if (tagged.length > 0) storeProducts = tagged;
    }
    if (storeProducts.length === 0) return propProducts || [];

    const currencySymbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const sym = currencySymbols[storeCtx.currency] || storeCtx.currency;

    return storeProducts.slice(0, maxProducts).map(p => ({
      id: p.id, name: p.name,
      category: p.category?.name,
      categoryLink: p.category?.slug ? `/store/${storeCtx.storeSlug}/shop?category=${p.category.slug}` : undefined,
      price: p.compareAtPrice ? `${sym}${p.compareAtPrice.toLocaleString()}` : `${sym}${p.price.toLocaleString()}`,
      salePrice: p.compareAtPrice ? `${sym}${p.price.toLocaleString()}` : undefined,
      image: p.images[0]?.url || safeSrc(null, p.name),
      hoverImage: p.images[1]?.url,
      link: `/store/${storeCtx.storeSlug}/product/${p.slug}`,
      badge: p.compareAtPrice ? "SALE" : undefined,
    }));
  })();

  const resolveLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/product/${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  const scopedCss = `
    .ppg-section { margin-bottom: ${marginBottom}; }
    .ppg-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 0;
      border: 1px solid #e8e8e8;
    }
    .ppg-card {
      position: relative; border-right: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8;
      overflow: hidden;
    }
    .ppg-card:nth-child(${columns}n) { border-right: none; }
    .ppg-thumb { position: relative; overflow: hidden; }
    .ppg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s; }
    .ppg-hover-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s;
    }
    .ppg-card:hover .ppg-hover-img { opacity: 1; }
    .ppg-card:hover .ppg-main-img { opacity: 0; }
    .ppg-info {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 25px 60px 25px 25px; display: flex; flex-direction: column;
      justify-content: flex-end; pointer-events: none; z-index: 3;
    }
    .ppg-name {
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px;
      color: ${TOKENS.titleColor}; margin: 0 0 5px;
    }
    .ppg-name a { color: inherit; text-decoration: none; pointer-events: auto; }
    .ppg-name a:hover { opacity: 0.7; }
    .ppg-price-wrap {
      opacity: 0; transform: translateY(100%); transition: all 0.3s ease;
    }
    .ppg-card:hover .ppg-price-wrap { opacity: 1; transform: translateY(0); }
    .ppg-price {
      font-weight: 500; font-size: 16px; font-family: ${TOKENS.bodyFont};
      color: ${TOKENS.titleColor};
    }
    .ppg-price-old {
      text-decoration: line-through; color: #999; font-weight: 400;
      margin-right: 8px; font-size: 14px;
    }
    .ppg-actions {
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transition: opacity 0.3s; z-index: 4;
    }
    .ppg-card:hover .ppg-actions { opacity: 1; }
    .ppg-action-btn {
      width: 38px; height: 38px; border-radius: 0; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 14px; transition: background 0.2s;
    }
    .ppg-action-btn:hover { background: #f0f0f0; }
    .ppg-cart-btn {
      position: absolute; bottom: 10px; right: 10px;
      width: 38px; height: 38px; background: #fff; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 16px; opacity: 0; transition: opacity 0.3s; z-index: 4;
    }
    .ppg-card:hover .ppg-cart-btn { opacity: 1; }
    @media (max-width: 1024px) {
      .ppg-grid { grid-template-columns: repeat(3, 1fr); }
      .ppg-info { padding: 15px; }
    }
    @media (max-width: 767px) {
      .ppg-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;

  if (products.length === 0) {
    return (
      <div className="ppg-section" style={containerStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ppg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
      <div className="ppg-grid">
        {products.map((p) => {
          const pLink = resolveLink(p.link, p.name);
          return (
            <div key={p.id} className="ppg-card">
              <div className="ppg-thumb">
                <Link href={pLink}>
                  <img src={p.image || safeSrc(null, p.name)} alt={p.name} className="ppg-img ppg-main-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                  {p.hoverImage && <img src={p.hoverImage} alt={p.name} className="ppg-hover-img" loading="lazy"  onError={(e) => onImgError(e, p.name)} />}
                </Link>
                <div className="ppg-info">
                  <h3 className="ppg-name"><Link href={pLink}>{p.name}</Link></h3>
                  <div className="ppg-price-wrap">
                    <div className="ppg-price">
                      {p.salePrice && <span className="ppg-price-old">{p.price}</span>}
                      <span>{p.salePrice || p.price}</span>
                    </div>
                  </div>
                </div>
                <div className="ppg-actions">
                  <button className="ppg-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                </div>
                <button className="ppg-cart-btn" title="Add to cart" aria-label="Add to cart" onClick={() => storeCtx?.addToCart?.(String(p.id))}>🛒</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PERFUMES OLFACTORY FAMILY TAGS
   Row of bordered pill buttons for fragrance families.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesOlfactoryTag {
  name: string;
  link: string;
}

export interface PerfumesOlfactoryTagsProps {
  title?: string;
  tags: PerfumesOlfactoryTag[];
  marginBottom?: string;
}

export function PerfumesOlfactoryTags({ title = "Shop by Olfactory Family", tags, marginBottom = "120px" }: PerfumesOlfactoryTagsProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .pot-section { margin-bottom: ${marginBottom}; }
    .pot-tags {
      display: flex; flex-wrap: wrap; gap: 10px; overflow-y: auto;
    }
    .pot-tag {
      display: inline-block; padding: 14px 28px;
      border: 1px solid ${TOKENS.titleColor}; color: ${TOKENS.titleColor};
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 16px;
      text-decoration: none; transition: all 0.3s; flex: 1 0 auto;
      text-align: center;
    }
    .pot-tag:hover { background: ${TOKENS.titleColor}; color: #fff; }
    @media (max-width: 767px) {
      .pot-tag { font-size: 14px; padding: 10px 20px; }
    }
  `;

  return (
    <div className="pot-section" style={containerStyle}>
      <ScopedStyles id="olfactory-tags" css={scopedCss} />
      {title && <PerfumesSectionTitle title={title} />}
      <div className="pot-tags">
        {tags.map((t, i) => (
          <a key={i} href={fixLink(t.link)} className="pot-tag">{t.name}</a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. PERFUMES MARQUEE
   Large text scrolling marquee with decorative SVG elements.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesMarqueeProps {
  items: string[];
  speed?: string;
  marginBottom?: string;
}

export function PerfumesMarquee({ items, speed = "45s", marginBottom = "120px" }: PerfumesMarqueeProps) {
  const scopedCss = `
    .pm-section { margin-bottom: ${marginBottom}; overflow: hidden; }
    .pm-track {
      display: flex; gap: 20px; align-items: center;
      animation: pmScroll ${speed} linear infinite;
      white-space: nowrap;
    }
    .pm-item {
      font-family: ${TOKENS.titleFont}; font-size: 84px; font-weight: 400;
      color: ${TOKENS.titleColor}; flex-shrink: 0; line-height: 1.2;
    }
    .pm-sep {
      width: 30px; height: 30px; flex-shrink: 0;
    }
    .pm-sep img { width: 100%; height: 100%; }
    @keyframes pmScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .pm-section:hover .pm-track { animation-play-state: paused; }
    @media (max-width: 1024px) { .pm-item { font-size: 48px; } }
    @media (max-width: 767px) { .pm-item { font-size: 36px; } }
  `;

  const sepImg = `${IMG_BASE}/2025/11/prf-marquee-figure.svg`;

  return (
    <div className="pm-section">
      <ScopedStyles id="marquee" css={scopedCss} />
      <div className="pm-track">
        {[...items, ...items].map((text, i) => (
          <span key={i}>
            <span className="pm-item">{text}</span>
            <span className="pm-sep" style={{ display: "inline-block", verticalAlign: "middle", margin: "0 15px" }}>
              <img src={sepImg} alt=""  onError={(e) => onImgError(e, "fallback")} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. PERFUMES FEATURED BANNERS
   3 square cover-image banners with product name + description
   that slide up on hover. Each has unique background image.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesFeaturedBanner {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  link: string;
}

export interface PerfumesFeaturedBannersProps {
  banners: PerfumesFeaturedBanner[];
  marginBottom?: string;
}

export function PerfumesFeaturedBanners({ banners, marginBottom = "120px" }: PerfumesFeaturedBannersProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .pfb-section { margin-bottom: ${marginBottom}; }
    .pfb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .pfb-card {
      position: relative; overflow: hidden; aspect-ratio: 900/900;
      background-size: cover; background-position: center; cursor: pointer;
      display: flex; align-items: flex-end; justify-content: center; padding: 50px;
    }
    .pfb-content { text-align: center; color: #fff; max-width: 550px; z-index: 2; }
    .pfb-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 25px; color: #fff;
      margin: 0 0 10px;
    }
    .pfb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 62px;
      color: #fff; line-height: 1.2; margin: 0 0 10px;
    }
    .pfb-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: rgba(255,255,255,0.8);
      line-height: 1.5; max-width: 600px; margin: 0 auto;
      opacity: 0; transform: translateY(15px); transition: all 0.4s ease;
    }
    .pfb-card:hover .pfb-desc { opacity: 1; transform: translateY(0); }
    .pfb-btn {
      display: inline-block; margin-top: 15px; padding: 12px 30px;
      border: 1px solid rgba(255,255,255,0.5); color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      text-decoration: none; transition: all 0.3s;
      opacity: 0; transform: translateY(15px);
    }
    .pfb-card:hover .pfb-btn { opacity: 1; transform: translateY(0); }
    .pfb-btn:hover { background: #fff; color: #000; }
    .pfb-link { position: absolute; inset: 0; z-index: 3; }
    .pfb-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%);
      z-index: 1;
    }
    @media (max-width: 1024px) {
      .pfb-title { font-size: 36px; }
      .pfb-subtitle { font-size: 20px; }
      .pfb-card { padding: 30px; }
    }
    @media (max-width: 767px) {
      .pfb-grid { grid-template-columns: 1fr; }
      .pfb-title { font-size: 28px; }
      .pfb-subtitle { font-size: 16px; }
    }
  `;

  return (
    <div className="pfb-section" style={containerStyle}>
      <ScopedStyles id="featured-banners" css={scopedCss} />
      <div className="pfb-grid">
        {banners.map((b, i) => (
          <div key={i} className="pfb-card" style={{ backgroundImage: `url(${b.backgroundImage})` }}>
            <div className="pfb-overlay" />
            <div className="pfb-content">
              <p className="pfb-subtitle">{b.subtitle}</p>
              <h3 className="pfb-title">{b.title}</h3>
              <p className="pfb-desc">{b.description}</p>
              <Link href={fixLink(b.link)} className="pfb-btn">Shop Now</Link>
            </div>
            <Link href={fixLink(b.link)} className="pfb-link" aria-label={b.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PERFUMES TABBED PRODUCTS
   Tab navigation (e.g. "EDP", "EDT") with product grids below.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesTab {
  label: string;
  filterTag?: string;
}

export interface PerfumesTabbedProductsProps {
  title?: string;
  tabs: PerfumesTab[];
  products?: PerfumesProduct[];
  columns?: number;
  maxProducts?: number;
  marginBottom?: string;
}

export function PerfumesTabbedProducts({ title, tabs, products, columns = 3, maxProducts = 6, marginBottom = "120px" }: PerfumesTabbedProductsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const scopedCss = `
    .ptp-section { margin-bottom: ${marginBottom}; }
    .ptp-header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
    .ptp-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 48px;
      line-height: 1.2; color: ${TOKENS.titleColor}; margin: 0;
    }
    .ptp-tabs { display: flex; gap: 30px; }
    .ptp-tab {
      font-family: ${TOKENS.titleFont}; font-size: 18px; font-weight: 600;
      color: rgba(0,0,0,0.5); background: none; border: none;
      cursor: pointer; padding: 5px 0; position: relative; transition: color 0.3s;
      text-transform: capitalize;
    }
    .ptp-tab.ptp-tab-active {
      color: ${TOKENS.titleColor};
    }
    .ptp-tab.ptp-tab-active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 2px; background: ${TOKENS.titleColor};
    }
    .ptp-tab:hover { color: ${TOKENS.titleColor}; }
  `;

  return (
    <div className="ptp-section" style={containerStyle}>
      <ScopedStyles id="tabbed-products" css={scopedCss} />
      <div className="ptp-header">
        {title && <h2 className="ptp-title">{title}</h2>}
        <div className="ptp-tabs">
          {tabs.map((tab, i) => (
            <button key={i} className={`ptp-tab ${i === activeTab ? "ptp-tab-active" : ""}`} onClick={() => setActiveTab(i)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <PerfumesProductGrid
        products={products}
        columns={columns}
        maxProducts={maxProducts}
        marginBottom="0"
        filterTag={tabs[activeTab]?.filterTag}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. PERFUMES COLLECTION BANNERS
   Two large square cover-image banners with collection name +
   "Shop Now" button that appears on hover.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesCollectionBanner {
  title: string;
  image: string;
  link: string;
}

export interface PerfumesCollectionBannersProps {
  banners: PerfumesCollectionBanner[];
  sectionTitle?: string;
  marginBottom?: string;
}

export function PerfumesCollectionBanners({ banners, sectionTitle, marginBottom = "120px" }: PerfumesCollectionBannersProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const { ref, inView } = useInView();

  const scopedCss = `
    .pcb-section { margin-bottom: ${marginBottom}; }
    .pcb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .pcb-card {
      position: relative; overflow: hidden; aspect-ratio: 900/900;
      background-size: cover; background-position: center; cursor: pointer;
      display: flex; align-items: flex-end; justify-content: center; padding: 50px;
    }
    .pcb-card:hover .pcb-bg-img { transform: scale(1.09); }
    .pcb-bg-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s cubic-bezier(0,0,.44,1.18); z-index: 0;
    }
    .pcb-content { text-align: center; z-index: 2; position: relative; }
    .pcb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 48px;
      color: #fff; line-height: 1.2; margin: 0 0 10px;
    }
    .pcb-btn {
      display: inline-block; margin-top: 5px; padding: 12px 30px;
      border: 1px solid rgba(255,255,255,0.5); color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      text-decoration: none; transition: all 0.4s;
      opacity: 0; transform: translateY(15px);
    }
    .pcb-card:hover .pcb-btn { opacity: 1; transform: translateY(0); }
    .pcb-btn:hover { background: #fff; color: #000; }
    .pcb-link { position: absolute; inset: 0; z-index: 3; }
    .pcb-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 50%);
      z-index: 1;
    }
    .pcb-animate { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
    .pcb-animate.pcb-visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .pcb-title { font-size: 36px; } .pcb-card { padding: 30px; } }
    @media (max-width: 767px) {
      .pcb-grid { grid-template-columns: 1fr; }
      .pcb-title { font-size: 28px; }
    }
  `;

  return (
    <div className="pcb-section" ref={ref} style={containerStyle}>
      <ScopedStyles id="collection-banners" css={scopedCss} />
      {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
      <div className="pcb-grid">
        {banners.map((b, i) => (
          <div key={i} className={`pcb-card pcb-animate ${inView ? "pcb-visible" : ""}`} style={{ transitionDelay: `${i * 0.15}s` }}>
            <img src={b.image} alt={b.title} className="pcb-bg-img" loading="lazy"  onError={(e) => onImgError(e, b.title)} />
            <div className="pcb-overlay" />
            <div className="pcb-content">
              <h3 className="pcb-title">{b.title}</h3>
              <Link href={fixLink(b.link)} className="pcb-btn">Shop Now</Link>
            </div>
            <Link href={fixLink(b.link)} className="pcb-link" aria-label={b.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. PERFUMES BLOG ARTICLES
   "Journal Articles" — carousel-style blog cards with large
   featured images, category tag, title, excerpt.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: string;
  categories: string[];
  link: string;
}

export interface PerfumesBlogArticlesProps {
  posts: PerfumesBlogPost[];
  sectionTitle?: string;
  columns?: number;
  marginBottom?: string;
}

export function PerfumesBlogArticles({ posts: propPosts, sectionTitle = "Journal Articles", columns = 5, marginBottom = "100px" }: PerfumesBlogArticlesProps) {
  const storeCtx = useContext(PerfumesStoreContext);

  const posts: PerfumesBlogPost[] = (() => {
    if (!storeCtx || !storeCtx.blogs || storeCtx.blogs.length === 0) return propPosts || [];
    return storeCtx.blogs.slice(0, columns).map(b => {
      const d = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return {
        image: b.coverImage || safeSrc(null, b.title), title: b.title, excerpt: b.excerpt || "",
        date: d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        categories: b.category ? [b.category] : [],
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
      };
    });
  })();

  const scopedCss = `
    .pba-section { margin-bottom: ${marginBottom}; }
    .pba-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .pba-card { overflow: hidden; }
    .pba-img-wrap { position: relative; overflow: hidden; margin-bottom: 15px; aspect-ratio: 588/598; }
    .pba-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s ease;
    }
    .pba-card:hover .pba-img { transform: scale(1.05); }
    .pba-cats { margin-bottom: 6px; display: flex; gap: 5px; flex-wrap: wrap; }
    .pba-cat {
      font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor};
      text-transform: uppercase; letter-spacing: 1px;
    }
    .pba-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 22px;
      color: ${TOKENS.titleColor}; margin: 0 0 8px; line-height: 1.3;
    }
    .pba-title a { color: inherit; text-decoration: none; }
    .pba-title a:hover { opacity: 0.7; }
    .pba-date {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
    }
    .pba-link { position: absolute; inset: 0; z-index: 2; }
    @media (max-width: 1024px) {
      .pba-grid { grid-template-columns: repeat(3, 1fr); }
      .pba-title { font-size: 18px; }
    }
    @media (max-width: 767px) {
      .pba-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    }
  `;

  return (
    <div className="pba-section" style={containerStyle}>
      <ScopedStyles id="blog-articles" css={scopedCss} />
      {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
      <div className="pba-grid">
        {posts.map((p, i) => (
          <article key={i} className="pba-card">
            <div className="pba-img-wrap">
              <img src={p.image} alt={p.title} className="pba-img" loading="lazy"  onError={(e) => onImgError(e, p.title)} />
              <Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} className="pba-link" aria-label={p.title} />
            </div>
            <div className="pba-cats">
              {p.categories.map((c, ci) => (
                <span key={ci} className="pba-cat">{c}</span>
              ))}
            </div>
            <h3 className="pba-title"><Link href={p.link}>{p.title}</Link></h3>
            <div className="pba-date">{p.date}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. PERFUMES INSTAGRAM
   "Connect to our Instagram" — left side with title + handle,
   right side with square image carousel/grid.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesInstagramItem {
  image: string;
  link: string;
}

export interface PerfumesInstagramProps {
  handle?: string;
  handleLink?: string;
  items: PerfumesInstagramItem[];
  marginBottom?: string;
}

export function PerfumesInstagram({ handle = "@xtemos.studio", handleLink = "https://www.instagram.com/", items, marginBottom = "0" }: PerfumesInstagramProps) {
  const scopedCss = `
    .pi-section { margin-bottom: ${marginBottom}; }
    .pi-layout { display: flex; gap: 30px; align-items: center; }
    .pi-left { flex: 0 0 30%; }
    .pi-right { flex: 1; overflow: hidden; }
    .pi-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 48px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 15px;
    }
    .pi-handle {
      font-family: ${TOKENS.bodyFont}; font-size: 20px; font-weight: 600;
      color: ${TOKENS.titleColor}; text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .pi-handle:hover { opacity: 0.7; }
    .pi-handle-arrow { font-size: 16px; }
    .pi-grid { display: flex; gap: 10px; }
    .pi-item {
      flex: 0 0 auto; width: calc(100% / 3.5); aspect-ratio: 1;
      overflow: hidden; border-radius: 0;
    }
    .pi-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s;
    }
    .pi-item:hover .pi-img { transform: scale(1.08); }
    .pi-link { display: block; width: 100%; height: 100%; }
    @media (max-width: 1024px) {
      .pi-title { font-size: 36px; }
      .pi-left { flex: 0 0 40%; }
    }
    @media (max-width: 767px) {
      .pi-layout { flex-direction: column; }
      .pi-left { flex: none; width: 100%; text-align: center; }
      .pi-title { font-size: 28px; }
      .pi-item { width: calc(100% / 2.5); }
    }
  `;

  return (
    <div className="pi-section" style={containerStyle}>
      <ScopedStyles id="instagram" css={scopedCss} />
      <div className="pi-layout">
        <div className="pi-left">
          <h2 className="pi-title">Connect to our Instagram</h2>
          <a href={handleLink} className="pi-handle" target="_blank" rel="noopener noreferrer">
            {handle} <span className="pi-handle-arrow">→</span>
          </a>
        </div>
        <div className="pi-right">
          <div className="pi-grid">
            {items.map((item, i) => (
              <div key={i} className="pi-item">
                <a href={item.link} className="pi-link" target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${i + 1}`}>
                  <img src={item.image} alt="" className="pi-img" loading="lazy"  onError={(e) => onImgError(e, "fallback")} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  description?: string | null;
}

export function PerfumesFooter({ storeName, storeSlug, logo, description }: PerfumesFooterProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const resolvedStoreSlug = storeCtx?.storeSlug || storeSlug;
  const footerCss = `
    .pfx-footer {
      background: #111;
      color: #fff;
      margin-top: 80px;
    }
    .pfx-inner {
      max-width: 1320px; margin: 0 auto; padding: 80px 15px 0;
    }
    .pfx-top {
      display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 40px; align-items: start;
      padding-bottom: 40px;
    }
    .pfx-brand {
      display: inline-flex; align-items: center; margin-bottom: 18px;
      font-family: ${TOKENS.titleFont}; font-size: 28px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase; color: #fff;
    }
    .pfx-lead {
      font-family: ${TOKENS.titleFont}; font-size: 30px; line-height: 1.2; margin: 0; max-width: 620px;
      color: #fff;
    }
    .pfx-newsletter h3, .pfx-links h3 {
      margin: 0 0 16px; font-family: ${TOKENS.titleFont}; font-size: 28px; font-weight: 600;
    }
    .pfx-newsletter p, .pfx-links a, .pfx-copy {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.82);
    }
    .pfx-form {
      display: grid; grid-template-columns: 1fr auto; gap: 10px; margin: 18px 0 20px;
    }
    .pfx-form input {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      padding: 12px 14px; color: #fff; font-family: ${TOKENS.bodyFont};
    }
    .pfx-form input::placeholder { color: rgba(255,255,255,0.45); }
    .pfx-form button {
      border: 0; background: #fff; color: #111; font-weight: 700; padding: 12px 18px; cursor: pointer;
      font-family: ${TOKENS.bodyFont};
    }
    .pfx-links-grid {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px;
    }
    .pfx-link-col {
      padding-left: 24px; border-left: 1px solid rgba(255,255,255,0.1);
    }
    .pfx-links-list { display: grid; gap: 10px; }
    .pfx-links-list a { text-decoration: none; }
    .pfx-links-list a:hover { opacity: 0.75; }
    .pfx-bottom {
      border-top: 2px solid rgba(255,255,255,0.14);
      padding: 20px 0 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
      flex-wrap: wrap;
    }
    .pfx-payments { max-width: 350px; width: 100%; height: auto; }
    .pfx-socials { display: flex; gap: 12px; margin-top: 18px; }
    .pfx-socials a {
      display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center;
      border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); color: #fff; text-decoration: none;
      background: rgba(255,255,255,0.03);
    }
    .pfx-socials svg { width: 16px; height: 16px; }
    @media (max-width: 1024px) {
      .pfx-top { grid-template-columns: 1fr; gap: 28px; }
      .pfx-lead { font-size: 24px; }
      .pfx-links h3, .pfx-newsletter h3 { font-size: 24px; }
    }
    @media (max-width: 767px) {
      .pfx-inner { padding-top: 56px; }
      .pfx-links-grid { grid-template-columns: 1fr; }
      .pfx-link-col { padding-left: 0; border-left: 0; }
      .pfx-form { grid-template-columns: 1fr; }
      .pfx-bottom { align-items: flex-start; }
    }
  `;

  const footerLinks = [
    { label: "About Us", href: `/store/${resolvedStoreSlug}/about-us` },
    { label: "Contact Us", href: `/store/${resolvedStoreSlug}/contact-us` },
    { label: "FAQ", href: `/store/${resolvedStoreSlug}/contact-us` },
    { label: "Blog", href: `/store/${resolvedStoreSlug}/journal` },
  ];

  const policyLinks = [
    { label: "Terms of use", href: `/store/${resolvedStoreSlug}/terms` },
    { label: "Refund policy", href: `/store/${resolvedStoreSlug}/terms#returns` },
    { label: "Cookies", href: `/store/${resolvedStoreSlug}/terms#cookies` },
    { label: "Privacy policy", href: `/store/${resolvedStoreSlug}/terms#privacy` },
  ];

  return (
    <footer className="pfx-footer">
      <ScopedStyles id="footer" css={footerCss} />
      <div className="pfx-inner">
        <div className="pfx-top">
          <div>
            <Link href={`/store/${resolvedStoreSlug}`} className="pfx-brand" aria-label={storeName}>
              {storeName}
            </Link>
            <p className="pfx-lead">
              {description || "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle."}
            </p>
            <div className="pfx-socials" aria-label="Social links">
              <a href="https://www.facebook.com/xtemos.studio" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
              <a href="https://x.com/xtemos_studio" target="_blank" rel="noopener noreferrer" aria-label="X">x</a>
              <a href="https://www.instagram.com/xtemos.studio/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">ig</a>
              <a href="https://www.youtube.com/channel/UCu3loFwqqOQ9z-YTcnplK8w" target="_blank" rel="noopener noreferrer" aria-label="YouTube">yt</a>
            </div>
          </div>

          <div className="pfx-newsletter">
            <h3>Insider Access</h3>
            <p>Receive exclusive content and be the first to know about product launches and special announcements.</p>
            <form className="pfx-form" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Your email address" aria-label="Email address" />
              <button type="submit">Sign up</button>
            </form>
          </div>

          <div className="pfx-links">
            <h3>Quick Links</h3>
            <div className="pfx-links-grid">
              <div className="pfx-link-col">
                <div className="pfx-links-list">
                  {footerLinks.map((link) => (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pfx-link-col">
                <div className="pfx-links-list">
                  {policyLinks.map((link) => (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pfx-bottom">
          <p className="pfx-copy">{storeName} © {new Date().getFullYear()}. All Rights Reserved.</p>
          <img
            src="https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/ps-mtds.png.webp"
            alt="Payment methods"
            className="pfx-payments"
          />
        </div>
      </div>
    </footer>
  );
}
