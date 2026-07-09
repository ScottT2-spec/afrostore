"use client";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
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
                <img src={slide.bottleImage} alt="" className="ph-bottle ph-anim-in" style={{ animationDelay: "0.15s" }} />
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
                  {p.hoverImage && <img src={p.hoverImage} alt={p.name} className="ppg-hover-img" loading="lazy" />}
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
              <img src={sepImg} alt="" />
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
            <img src={b.image} alt={b.title} className="pcb-bg-img" loading="lazy" />
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
        image: b.coverImage || "", title: b.title, excerpt: b.excerpt || "",
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
              <img src={p.image} alt={p.title} className="pba-img" loading="lazy" />
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
                  <img src={item.image} alt="" className="pi-img" loading="lazy" />
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
  logoUrl?: string;
  logoAlt?: string;
  description?: string;
  contact?: FooterContactInfo;
  recentPosts?: FooterRecentPost[];
  linkColumns?: FooterLinkColumn[];
  copyrightText?: string;
  paymentIconsUrl?: string;
  backgroundColor?: string;
}

export interface FooterContactInfo {
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
}

export interface FooterLinkItem {
  label: string;
  url: string;
  emphasized?: boolean;
}

export interface FooterLinkColumn {
  title: string;
  links: FooterLinkItem[];
}

export interface FooterRecentPost {
  title: string;
  url: string;
  date: string;
  thumbnail?: string;
}

export function PerfumesFooter({
  logoUrl,
  logoAlt = "Store Logo",
  description = "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
  contact = {
    address: "451 Wall Street, UK, London",
    phone: "(064) 332-1233",
    fax: "(099) 453-1357",
  },
  recentPosts = [],
  linkColumns = [],
  copyrightText = `© ${new Date().getFullYear()}. ALL RIGHTS RESERVED.`,
  paymentIconsUrl,
  backgroundColor = TOKENS.footerBg,
}: PerfumesFooterProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const [openColumns, setOpenColumns] = useState<Set<number>>(new Set());

  const toggleColumn = (index: number) => {
    setOpenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor,
    color: "rgba(255,255,255,0.66)",
    fontFamily: TOKENS.bodyFont,
    fontSize: "14px",
    lineHeight: "1.7",
  };

  const mainFooterStyle: React.CSSProperties = {
    maxWidth: TOKENS.containerWidth,
    margin: "0 auto",
    padding: "40px 15px",
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
  };

  const scopedCss = `
    .pf-footer a { color: rgba(255,255,255,0.66); text-decoration: none; transition: color 0.2s; }
    .pf-footer a:hover { color: #fff; }

    .pf-col-brand { flex: 0 1 25%; min-width: 220px; }
    .pf-col-posts { flex: 0 1 25%; min-width: 220px; }
    .pf-col-links { flex: 0 1 17%; min-width: 140px; }

    .pf-col-toggle-head {
      display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; user-select: none; padding: 0;
    }
    .pf-col-toggle-head svg {
      width: 12px; height: 12px; fill: rgba(255,255,255,0.66);
      transition: transform 0.3s;
      display: none;
    }
    .pf-col-toggle-head.pf-open svg { transform: rotate(180deg); }

    .pf-col-title {
      font-family: ${TOKENS.titleFont};
      font-weight: 700; font-size: 16px; color: #fff;
      letter-spacing: 0.3px; text-transform: uppercase;
      margin: 0 0 20px 0;
    }

    .pf-link-list { list-style: none; margin: 0; padding: 0; }
    .pf-link-list li { margin-bottom: 10px; }
    .pf-link-list li a { font-size: 14px; }
    .pf-link-list li a em { font-style: italic; }

    .pf-contact-list { list-style: none; margin: 16px 0 0; padding: 0; }
    .pf-contact-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .pf-contact-icon { width: 14px; height: 14px; flex-shrink: 0; margin-top: 4px; fill: rgba(255,255,255,0.66); }

    .pf-post-item { display: flex; gap: 12px; margin-bottom: 15px; }
    .pf-post-thumb { width: 75px; height: 65px; border-radius: 0; object-fit: cover; flex-shrink: 0; }
    .pf-post-title { font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 400; margin: 0 0 4px; line-height: 1.4; }
    .pf-post-title a { color: rgba(255,255,255,0.85); }
    .pf-post-title a:hover { color: #fff; }
    .pf-post-date { font-size: 12px; color: rgba(255,255,255,0.45); }

    .pf-copyrights {
      border-top: 1px solid rgba(255,255,255,0.1);
      max-width: ${TOKENS.containerWidth};
      margin: 0 auto;
      padding: 20px 15px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 10px;
    }
    .pf-copyrights small { font-size: 13px; color: rgba(255,255,255,0.5); }
    .pf-copyrights small a { color: rgba(255,255,255,0.5); }
    .pf-copyrights img { height: 21px; width: auto; }

    @media (max-width: 768px) {
      .pf-main-footer { gap: 0 !important; padding: 0 15px !important; }
      .pf-col-brand, .pf-col-posts, .pf-col-links {
        flex: 0 1 100% !important; min-width: 100% !important;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding: 20px 0;
      }
      .pf-col-brand { border-bottom: 1px solid rgba(255,255,255,0.08); padding-top: 30px; }
      .pf-col-toggle-head svg { display: block; }
      .pf-col-toggle-content { overflow: hidden; transition: max-height 0.3s ease; }
      .pf-col-toggle-content.pf-closed { max-height: 0; }
      .pf-col-toggle-content.pf-open { max-height: 500px; }
      .pf-col-title { margin-bottom: 0; }
      .pf-col-toggle-head.pf-open .pf-col-title { margin-bottom: 15px; }
    }

    @media (min-width: 769px) {
      .pf-col-toggle-content { max-height: none !important; }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .pf-col-brand, .pf-col-posts { flex: 0 1 calc(50% - 15px) !important; }
      .pf-col-links { flex: 0 1 calc(33% - 20px) !important; }
    }
  `;

  const contactIcons = {
    address: (
      <svg viewBox="0 0 477 477" className="pf-contact-icon">
        <path d="M238.5 0C146.3 0 71.5 74.8 71.5 167c0 40.7 14.5 78 38.6 107.1L238.5 477l128.4-202.9C391 245 405.5 207.7 405.5 167 405.5 74.8 330.7 0 238.5 0zm0 240c-40.3 0-73-32.7-73-73s32.7-73 73-73 73 32.7 73 73-32.7 73-73 73z"/>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 27 27" className="pf-contact-icon">
        <path d="M20.4 27c-1.8 0-4.4-.9-8-3.8C8.7 20.4 5 16.5 3 13.3.5 9.4-.2 6.4.1 4.3.4 2.5 1.4 1.3 2.4.5c.6-.5 1.2-.5 1.6-.1l4.2 5c.4.5.3 1-.1 1.4l-1.5 1.3c-.3.3-.3.6-.2.9 1 2 2.7 4.2 5 6.2s4.5 3.4 6.7 4c.3.1.7 0 .9-.2l1.5-1.6c.4-.4 1-.5 1.4-.1l4.7 4.4c.5.4.5 1.1 0 1.6-.8.9-2 1.8-3.8 2.2-.8.3-1.5.4-2.4.4z"/>
      </svg>
    ),
    fax: (
      <svg viewBox="0 0 479 479" className="pf-contact-icon">
        <path d="M434.1 59.7H370V20c0-11-9-20-20-20H129c-11 0-20 9-20 20v39.7H44.9C20.1 59.7 0 79.8 0 104.6v214.6c0 24.8 20.1 44.9 44.9 44.9h64.1V459c0 11 9 20 20 20h221c11 0 20-9 20-20V364.1h64.1c24.8 0 44.9-20.1 44.9-44.9V104.6c0-24.8-20.1-44.9-44.9-44.9zM149 40h181v19.7H149V40zm181 399H149V284.1h181V439zm104.1-119.8c0 2.7-2.2 4.9-4.9 4.9H370V264.1c0-11-9-20-20-20H129c-11 0-20 9-20 20v60h-65.1c-2.7 0-4.9-2.2-4.9-4.9V104.6c0-2.7 2.2-4.9 4.9-4.9h390.2c2.7 0 4.9 2.2 4.9 4.9v214.6z"/>
      </svg>
    ),
    email: (
      <svg viewBox="0 0 479 479" className="pf-contact-icon">
        <path d="M432 59H47C21 59 0 80 0 106v267c0 26 21 47 47 47h385c26 0 47-21 47-47V106c0-26-21-47-47-47zm-6 40L240 259 54 99h372zm6 280H47c-4 0-7-3-7-7V128l197 170c4 3 8 5 13 5s9-2 13-5l187-170v245c0 4-3 7-7 7z"/>
      </svg>
    ),
  };

  const chevronSvg = (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M59.77 20.77c.49-.49.73-1.13.73-1.77s-.24-1.28-.73-1.77a2.5 2.5 0 00-3.54 0L32 41.46 7.77 17.23a2.5 2.5 0 00-3.54 0 2.5 2.5 0 000 3.54l26 26a2.5 2.5 0 003.54 0l26-26z"/>
    </svg>
  );

  const renderLinkColumn = (col: FooterLinkColumn, idx: number) => {
    const colIndex = idx + 2;
    const isOpen = openColumns.has(colIndex);

    return (
      <div key={idx} className="pf-col-links">
        <div
          className={`pf-col-toggle-head ${isOpen ? "pf-open" : ""}`}
          onClick={() => toggleColumn(colIndex)}
        >
          <h4 className="pf-col-title">{col.title}</h4>
          {chevronSvg}
        </div>
        <div className={`pf-col-toggle-content ${isOpen ? "pf-open" : "pf-closed"}`}>
          <ul className="pf-link-list">
            {col.links.map((link, li) => (
              <li key={li}>
                <Link href={resolveFooterLink(link.url, link.label, storeCtx?.storeSlug)}>
                  {link.emphasized ? <em>{link.label}</em> : link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <footer className="pf-footer" style={footerStyle}>
      <ScopedStyles id="footer" css={scopedCss} />

      <div className="pf-main-footer" style={mainFooterStyle}>
        <div className="pf-col-brand">
          {logoUrl && (
            <div style={{ marginBottom: "16px" }}>
              <Link href={storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}` : "/"}>
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  style={{ maxWidth: "220px", height: "auto" }}
                />
              </Link>
            </div>
          )}
          <p style={{ margin: "0 0 10px", fontSize: "14px", lineHeight: "1.7" }}>
            {description}
          </p>
          {contact && (
            <ul className="pf-contact-list">
              {contact.address && (
                <li className="pf-contact-item">
                  {contactIcons.address}
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="pf-contact-item">
                  {contactIcons.phone}
                  <span>Phone: {contact.phone}</span>
                </li>
              )}
              {contact.fax && (
                <li className="pf-contact-item">
                  {contactIcons.fax}
                  <span>Fax: {contact.fax}</span>
                </li>
              )}
              {contact.email && (
                <li className="pf-contact-item">
                  {contactIcons.email}
                  <span>Email: {contact.email}</span>
                </li>
              )}
            </ul>
          )}
        </div>

        {recentPosts.length > 0 && (
          <div className="pf-col-posts">
            <div
              className={`pf-col-toggle-head ${openColumns.has(1) ? "pf-open" : ""}`}
              onClick={() => toggleColumn(1)}
            >
              <h4 className="pf-col-title">RECENT POSTS</h4>
              {chevronSvg}
            </div>
            <div className={`pf-col-toggle-content ${openColumns.has(1) ? "pf-open" : "pf-closed"}`}>
              {recentPosts.map((post, i) => (
                <div key={i} className="pf-post-item">
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="pf-post-thumb"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h5 className="pf-post-title">
                      <Link href={resolveStoreLink(post.url, storeCtx?.storeSlug)}>{post.title}</Link>
                    </h5>
                    <span className="pf-post-date">{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {linkColumns.map(renderLinkColumn)}
      </div>

      <div className="pf-copyrights">
        <div>
          <small>
            <Link href={storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}` : "/"}>{copyrightText}</Link>
          </small>
        </div>
        {paymentIconsUrl && (
          <div>
            <img
              src={paymentIconsUrl}
              alt="Payment methods"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </footer>
  );
}

