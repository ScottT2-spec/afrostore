"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════════════════
   FASHION TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Fashion template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#da3c3c",
  primaryHover: "#c13030",
  titleColor: "#242424",
  textColor: "#767676",
  entityTitleColor: "#333333",
  linkColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#0c0c0c",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Montserrat', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function FashionFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@700&display=swap');
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
  return <style data-fashion-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

/* ═══════════════════════════════════════════════════════════════
   1. FASHION HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface FashionHeroSlide {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  textPosition?: "left" | "center" | "right";
  colorScheme?: "dark" | "light";
}

export interface FashionHeroSliderProps {
  slides: FashionHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function FashionHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "560px" }: FashionHeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, autoplaySpeed]);

  const scopedCss = `
    .fh-slider { position: relative; width: 100%; overflow: hidden; background: #f9f9f9; }
    .fh-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .fh-slide.fh-active { opacity: 1; position: relative; }
    .fh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center center; z-index: 0; }
    .fh-slide-content { position: relative; z-index: 2; width: 100%; }
    .fh-subtitle { 
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700; 
      font-size: 18px; font-family: ${TOKENS.bodyFont}; margin-bottom: 20px;
    }
    .fh-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 38px; 
      line-height: 48px; margin: 0 0 15px; 
    }
    .fh-title-dark { color: ${TOKENS.titleColor}; }
    .fh-title-light { color: #ffffff; }
    .fh-desc { 
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 1.6;
      max-width: 380px; margin: 0 auto 20px; 
    }
    .fh-desc-dark { color: ${TOKENS.textColor}; }
    .fh-desc-light { color: rgba(255,255,255,0.85); }
    .fh-btn { 
      display: inline-block; padding: 12px 30px; 
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border: none; cursor: pointer; border-radius: 25px;
      transition: background-color 0.3s ease; letter-spacing: 0.5px;
    }
    .fh-btn:hover { background: ${TOKENS.primaryHover}; }
    .fh-dots { 
      position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px; z-index: 5; 
    }
    .fh-dot { 
      width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.5); transition: background 0.3s ease; padding: 0;
    }
    .fh-dot.fh-dot-active { background: #ffffff; }
    .fh-anim-in { 
      animation: fhSlideUp 0.6s ease forwards; opacity: 0; 
    }
    @keyframes fhSlideUp { 
      from { opacity: 0; transform: translateY(30px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    @media (max-width: 1024px) {
      .fh-slider { min-height: 500px !important; }
      .fh-title { font-size: 28px; line-height: 36px; }
    }
    @media (max-width: 767px) {
      .fh-slider { min-height: 400px !important; }
      .fh-title { font-size: 23px; line-height: 33px; }
      .fh-subtitle { font-size: 14px; }
      .fh-desc { font-size: 14px; }
    }
  `;

  return (
    <div className="fh-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "dark";
        const align = slide.textPosition || "center";
        return (
          <div key={i} className={`fh-slide ${i === current ? "fh-active" : ""}`}>
            <div className="fh-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            <div className="fh-slide-content">
              <div style={{ ...containerStyle, textAlign: align as React.CSSProperties["textAlign"] }}>
                <div style={{ maxWidth: align === "center" ? "65%" : "50%", margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0", padding: "40px 0" }}>
                  {i === current && (
                    <>
                      <div className="fh-subtitle fh-anim-in" style={{ animationDelay: "0.2s" }}>{slide.subtitle}</div>
                      <div className={`fh-title fh-title-${scheme} fh-anim-in`} style={{ animationDelay: "0.3s" }}>{slide.titleLine1}</div>
                      <div className={`fh-title fh-title-${scheme} fh-anim-in`} style={{ animationDelay: "0.4s" }}>{slide.titleLine2}</div>
                      <div className={`fh-desc fh-desc-${scheme} fh-anim-in`} style={{ animationDelay: "0.5s", marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}>{slide.description}</div>
                      <div className="fh-anim-in" style={{ animationDelay: "0.6s" }}>
                        <a href={slide.buttonLink} className="fh-btn">{slide.buttonText}</a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {slides.length > 1 && (
        <div className="fh-dots">
          {slides.map((_, i) => (
            <button key={i} className={`fh-dot ${i === current ? "fh-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. FASHION PROMO BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionPromoBanner {
  image: string;
  subtitle: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  textAlign?: "left" | "center" | "right";
}

export interface FashionPromoBannersProps {
  banners: FashionPromoBanner[];
}

export function FashionPromoBanners({ banners }: FashionPromoBannersProps) {
  const scopedCss = `
    .fp-banners { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 80px; }
    .fp-banner { position: relative; overflow: hidden; cursor: pointer; }
    .fp-banner-img-wrap { overflow: hidden; }
    .fp-banner-img { 
      width: 100%; height: auto; display: block; 
      transition: transform 0.6s ease; 
    }
    .fp-banner:hover .fp-banner-img { transform: scale(1.1); }
    .fp-banner-overlay { 
      position: absolute; inset: 0; display: flex; align-items: center;
      z-index: 2; padding: 20px 30px; 
    }
    .fp-banner-subtitle { 
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700;
      font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 5px; 
    }
    .fp-banner-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 26px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 12px;
      white-space: pre-line;
    }
    .fp-banner-btn { 
      color: ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont}; font-size: 13px;
      text-transform: uppercase; font-weight: 600; text-decoration: none;
      position: relative; display: inline-block; letter-spacing: 0.5px;
    }
    .fp-banner-btn::after { 
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%;
      height: 2px; background: ${TOKENS.primaryColor}; 
      transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease; 
    }
    .fp-banner:hover .fp-banner-btn::after { transform: scaleX(1); transform-origin: left; }
    .fp-banner-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { 
      .fp-banners { grid-template-columns: repeat(3, 1fr); gap: 20px; } 
      .fp-banner-title { font-size: 22px; }
    }
    @media (max-width: 767px) { 
      .fp-banners { grid-template-columns: 1fr; gap: 15px; } 
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="promo-banners" css={scopedCss} />
      <div className="fp-banners">
        {banners.map((b, i) => {
          const justify = b.textAlign === "right" ? "flex-end" : b.textAlign === "left" ? "flex-start" : "center";
          return (
            <div key={i} className="fp-banner">
              <div className="fp-banner-img-wrap">
                <img src={b.image} alt={b.title} className="fp-banner-img" loading="lazy" />
              </div>
              <div className="fp-banner-overlay" style={{ justifyContent: justify }}>
                <div style={{ textAlign: b.textAlign || "center" }}>
                  <div className="fp-banner-subtitle">{b.subtitle}</div>
                  <h4 className="fp-banner-title">{b.title}</h4>
                  <div className="fp-banner-btn">{b.buttonText}</div>
                </div>
              </div>
              <a href={b.buttonLink} className="fp-banner-link" aria-label={b.title} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. FASHION SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface FashionSectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleColor?: "primary" | "white";
}

export function FashionSectionTitle({ subtitle, title, description, align = "center", maxWidth = "40%", titleColor = "primary" }: FashionSectionTitleProps) {
  const scopedCss = `
    .fst-wrapper { margin-bottom: 25px; }
    .fst-subtitle { 
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700;
      font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px;
    }
    .fst-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px;
      text-transform: uppercase; margin: 0 0 15px; line-height: 1.2;
    }
    .fst-title-primary { color: ${TOKENS.titleColor}; }
    .fst-title-white { color: #ffffff; }
    .fst-desc { 
      font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0;
    }
    .fst-desc-light { color: rgba(255,255,255,0.7); }
    @media (max-width: 1024px) {
      .fst-title { font-size: 28px; }
      .fst-inner { max-width: 70% !important; }
    }
    @media (max-width: 767px) {
      .fst-title { font-size: 22px; }
      .fst-inner { max-width: 90% !important; }
    }
  `;

  return (
    <div className="fst-wrapper" style={{ textAlign: align as React.CSSProperties["textAlign"] }}>
      <ScopedStyles id="section-title" css={scopedCss} />
      <div className="fst-inner" style={{ maxWidth, margin: align === "center" ? "0 auto" : undefined, display: "inline-block", width: "100%" }}>
        {subtitle && <div className="fst-subtitle">{subtitle}</div>}
        <h4 className={`fst-title fst-title-${titleColor}`}>{title}</h4>
        {description && <p className={`fst-desc ${titleColor === "white" ? "fst-desc-light" : ""}`}>{description}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. FASHION PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface FashionProduct {
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

/** Context bridge — lets fashion blocks access real store products */
export interface FashionStoreContextData {
  products: Array<{
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    currency: string; inStock: boolean; isFeatured: boolean; tags?: string[];
    images: Array<{ id: string; url: string; alt?: string }>;
    category?: { id: string; name: string; slug: string };
  }>;
  currency: string;
  storeSlug: string;
}
export const FashionStoreContext = createContext<FashionStoreContextData | null>(null);

export interface FashionProductGridProps {
  products?: FashionProduct[];
  columns?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function FashionProductGrid({ products: propProducts, columns = 4, showCategory = true, showHoverImage = true, sectionTitle, marginBottom = "60px", maxProducts = 8, filter, filterTag }: FashionProductGridProps) {
  const storeCtx = useContext(FashionStoreContext);

  // Convert real store products to FashionProduct format
  const products: FashionProduct[] = (() => {
    // If no store context, use placeholder products from props
    if (!storeCtx || storeCtx.products.length === 0) return propProducts || [];
    
    let storeProducts = storeCtx.products;
    
    // Filter by featured flag
    if (filter === "featured") {
      const featured = storeProducts.filter(p => p.isFeatured);
      if (featured.length > 0) storeProducts = featured;
    }
    // Filter by tag (bestseller, new-arrival, etc.)
    else if (filter === "bestseller" || filter === "new-arrival" || filter === "sale") {
      const tagged = storeProducts.filter(p => 
        p.tags?.some((t: string) => t.toLowerCase() === filter!.toLowerCase() || t.toLowerCase().replace(/[-_ ]/g, "") === filter!.toLowerCase().replace(/[-_ ]/g, ""))
      );
      if (tagged.length > 0) storeProducts = tagged;
    }
    // Custom tag filter
    if (filterTag) {
      const tagged = storeProducts.filter(p => 
        p.tags?.some((t: string) => t.toLowerCase() === filterTag.toLowerCase())
      );
      if (tagged.length > 0) storeProducts = tagged;
    }

    // If filtering returned no results, fall back to placeholder products
    if (storeProducts.length === 0) return propProducts || [];

    const currencySymbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const sym = currencySymbols[storeCtx.currency] || storeCtx.currency;

    return storeProducts.slice(0, maxProducts).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category?.name,
      categoryLink: p.category?.slug ? `/store/${storeCtx.storeSlug}/shop?category=${p.category.slug}` : undefined,
      price: p.compareAtPrice ? `${sym}${p.compareAtPrice.toLocaleString()}` : `${sym}${p.price.toLocaleString()}`,
      salePrice: p.compareAtPrice ? `${sym}${p.price.toLocaleString()}` : undefined,
      image: p.images[0]?.url || "",
      hoverImage: p.images[1]?.url,
      link: `/store/${storeCtx.storeSlug}/product/${p.slug}`,
      badge: p.compareAtPrice ? "SALE" : p.isFeatured ? "FEATURED" : undefined,
    }));
  })();
  const scopedCss = `
    .fpg-section { margin-bottom: ${marginBottom}; }
    .fpg-grid { 
      display: grid; grid-template-columns: repeat(${columns}, 1fr); 
      gap: 20px; 
    }
    .fpg-card { position: relative; }
    .fpg-thumb { position: relative; overflow: hidden; margin-bottom: 12px; }
    .fpg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s ease; }
    .fpg-hover-img { 
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s ease; 
    }
    .fpg-card:hover .fpg-hover-img { opacity: 1; }
    .fpg-card:hover .fpg-main-img { opacity: 0; }
    .fpg-actions { 
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transform: translateX(10px); transition: all 0.3s ease; z-index: 3;
    }
    .fpg-card:hover .fpg-actions { opacity: 1; transform: translateX(0); }
    .fpg-action-btn { 
      width: 35px; height: 35px; border-radius: 50%; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: background 0.2s; font-size: 14px;
    }
    .fpg-action-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .fpg-name { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.4;
    }
    .fpg-name a { color: inherit; text-decoration: none; transition: color 0.2s; }
    .fpg-name a:hover { color: rgba(51,51,51,0.65); }
    .fpg-cat { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      margin-bottom: 6px;
    }
    .fpg-cat a { color: inherit; text-decoration: none; }
    .fpg-price { 
      color: ${TOKENS.primaryColor}; font-weight: 600; font-size: 14px;
      font-family: ${TOKENS.bodyFont};
    }
    .fpg-price-old { 
      text-decoration: line-through; color: #999; font-weight: 400; 
      margin-right: 8px; font-size: 13px;
    }
    .fpg-badge { 
      position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor};
      color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase;
      padding: 3px 10px; z-index: 3;
    }
    .fpg-add-btn { 
      position: absolute; bottom: 0; left: 0; right: 0; 
      background: ${TOKENS.primaryColor}; color: #fff; border: none; 
      padding: 10px; text-transform: uppercase; font-weight: 600; font-size: 12px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s ease;
    }
    .fpg-card:hover .fpg-add-btn { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .fpg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .fpg-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div className="fpg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && (
        <FashionSectionTitle
          subtitle={sectionTitle.subtitle}
          title={sectionTitle.title}
          description={sectionTitle.description}
        />
      )}
      <div className="fpg-grid">
        {products.map((p) => (
          <div key={p.id} className="fpg-card">
            <div className="fpg-thumb">
              <a href={p.link}>
                <img src={p.image} alt={p.name} className="fpg-img fpg-main-img" loading="lazy" />
                {showHoverImage && p.hoverImage && (
                  <img src={p.hoverImage} alt={p.name} className="fpg-hover-img" loading="lazy" />
                )}
              </a>
              {p.badge && <span className="fpg-badge">{p.badge}</span>}
              <div className="fpg-actions">
                <button className="fpg-action-btn" title="Compare" aria-label="Compare">⇌</button>
                <button className="fpg-action-btn" title="Quick view" aria-label="Quick view">👁</button>
                <button className="fpg-action-btn" title="Wishlist" aria-label="Wishlist">♡</button>
              </div>
              <button className="fpg-add-btn">Add to cart</button>
            </div>
            <h3 className="fpg-name"><a href={p.link}>{p.name}</a></h3>
            {showCategory && p.category && (
              <div className="fpg-cat">
                <a href={p.categoryLink || "#"}>{p.category}</a>
              </div>
            )}
            <div className="fpg-price">
              {p.salePrice && <span className="fpg-price-old">{p.price}</span>}
              <span>{p.salePrice || p.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. FASHION CATEGORY CARDS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionCategoryCard {
  name: string;
  image: string;
  productCount?: number;
  link: string;
}

export interface FashionCategoryCardsProps {
  categories: FashionCategoryCard[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
}

export function FashionCategoryCards({ categories, columns = 4, sectionTitle, marginBottom = "50px" }: FashionCategoryCardsProps) {
  const scopedCss = `
    .fcc-section { margin-bottom: ${marginBottom}; }
    .fcc-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .fcc-card { 
      position: relative; overflow: hidden; cursor: pointer;
      aspect-ratio: 3/4;
    }
    .fcc-img { 
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.6s ease;
    }
    .fcc-card:hover .fcc-img { transform: scale(1.05); }
    .fcc-overlay { 
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 2;
      background: rgba(0,0,0,0); transition: background 0.3s ease;
    }
    .fcc-card:hover .fcc-overlay { background: rgba(0,0,0,0.15); }
    .fcc-name { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 18px;
      color: #fff; text-transform: uppercase; margin: 0 0 5px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }
    .fcc-count { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; 
      color: rgba(255,255,255,0.85); text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
    .fcc-count a { color: inherit; text-decoration: none; }
    .fcc-count a:hover { text-decoration: underline; }
    .fcc-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .fcc-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .fcc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div className="fcc-section" style={containerStyle}>
      <ScopedStyles id="category-cards" css={scopedCss} />
      {sectionTitle && (
        <FashionSectionTitle
          subtitle={sectionTitle.subtitle}
          title={sectionTitle.title}
          description={sectionTitle.description}
        />
      )}
      <div className="fcc-grid">
        {categories.map((c, i) => (
          <div key={i} className="fcc-card">
            <img src={c.image} alt={c.name} className="fcc-img" loading="lazy" />
            <div className="fcc-overlay">
              <h3 className="fcc-name">{c.name}</h3>
              {c.productCount !== undefined && (
                <div className="fcc-count">
                  <a href={c.link}>{c.productCount} products</a>
                </div>
              )}
            </div>
            <a href={c.link} className="fcc-link" aria-label={c.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. FASHION TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionTestimonial {
  avatar: string;
  text: string;
  name: string;
  role: string;
  rating: number;
}

export interface FashionTestimonialsProps {
  title?: string;
  backgroundImage: string;
  testimonials: FashionTestimonial[];
}

export function FashionTestimonials({ title = "CUSTOMERS REVIEWS", backgroundImage, testimonials }: FashionTestimonialsProps) {
  const [current, setCurrent] = useState(0);

  const scopedCss = `
    .ft-section { 
      position: relative; padding: 90px 0 80px; margin-bottom: 0;
      background-size: cover; background-position: center; background-repeat: no-repeat;
    }
    .ft-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); z-index: 1; }
    .ft-content { position: relative; z-index: 2; }
    .ft-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px;
      color: #fff; text-transform: uppercase; text-align: center; margin: 0 0 20px;
    }
    .ft-quote { text-align: center; margin-bottom: 30px; }
    .ft-quote svg { width: 35px; height: 35px; fill: rgba(255,255,255,0.6); }
    .ft-carousel { max-width: 65%; margin: 0 auto; text-align: center; }
    .ft-avatar { 
      width: 70px; height: 70px; border-radius: 50%; object-fit: cover;
      margin: 0 auto 15px; display: block;
    }
    .ft-stars { margin-bottom: 15px; }
    .ft-star { color: ${TOKENS.starColor}; font-size: 16px; letter-spacing: 3px; }
    .ft-star-empty { color: rgba(255,255,255,0.3); }
    .ft-text { 
      font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7;
      color: rgba(255,255,255,0.85); margin-bottom: 20px;
    }
    .ft-author { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 15px;
      color: #fff; margin: 0;
    }
    .ft-role { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; 
      color: rgba(255,255,255,0.6); display: block; margin-top: 3px;
    }
    .ft-nav { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
    .ft-nav-btn { 
      width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.3);
      background: transparent; color: #fff; cursor: pointer; font-size: 18px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; border-radius: 0;
    }
    .ft-nav-btn:hover { background: rgba(255,255,255,0.15); }
    .ft-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
    .ft-tdot { 
      width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.3); transition: background 0.3s; padding: 0;
    }
    .ft-tdot.ft-tdot-active { background: #fff; }
    @media (max-width: 1024px) {
      .ft-carousel { max-width: 80%; }
      .ft-title { font-size: 28px; }
    }
    @media (max-width: 767px) {
      .ft-section { padding: 60px 0 50px; }
      .ft-carousel { max-width: 95%; }
      .ft-title { font-size: 22px; }
    }
  `;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "ft-star" : "ft-star ft-star-empty"}>★</span>
    ));
  };

  const t = testimonials[current];
  if (!t) return null;

  return (
    <div className="ft-section" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <ScopedStyles id="testimonials" css={scopedCss} />
      <div className="ft-overlay" />
      <div className="ft-content" style={containerStyle}>
        <h4 className="ft-title">{title}</h4>
        <div className="ft-quote">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
          </svg>
        </div>
        <div className="ft-carousel">
          <img src={t.avatar} alt={t.name} className="ft-avatar" />
          <div className="ft-stars">{renderStars(t.rating)}</div>
          <p className="ft-text">{t.text}</p>
          <p className="ft-author">
            {t.name}
            <span className="ft-role">{t.role}</span>
          </p>
        </div>
        {testimonials.length > 1 && (
          <>
            <div className="ft-nav">
              <button className="ft-nav-btn" onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)} aria-label="Previous">‹</button>
              <button className="ft-nav-btn" onClick={() => setCurrent((current + 1) % testimonials.length)} aria-label="Next">›</button>
            </div>
            <div className="ft-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`ft-tdot ${i === current ? "ft-tdot-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. FASHION BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string };
  categories: string[];
  author: { name: string; avatar?: string };
  link: string;
  commentCount?: number;
}

export interface FashionBlogPostsProps {
  posts: FashionBlogPost[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
}

export function FashionBlogPosts({ posts, columns = 2, sectionTitle, marginBottom = "30px" }: FashionBlogPostsProps) {
  const scopedCss = `
    .fbp-section { margin-bottom: ${marginBottom}; }
    .fbp-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .fbp-card { display: flex; overflow: hidden; background: #fff; }
    .fbp-card:nth-child(even) { flex-direction: row-reverse; }
    .fbp-img-wrap { position: relative; flex: 0 0 45%; overflow: hidden; }
    .fbp-img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 250px; }
    .fbp-date-badge { 
      position: absolute; top: 15px; left: 15px; background: ${TOKENS.primaryColor};
      color: #fff; text-align: center; padding: 8px 12px; z-index: 2;
    }
    .fbp-date-day { display: block; font-size: 20px; font-weight: 700; line-height: 1; font-family: ${TOKENS.bodyFont}; }
    .fbp-date-month { display: block; font-size: 11px; text-transform: uppercase; font-family: ${TOKENS.bodyFont}; }
    .fbp-content { flex: 1; padding: 25px 20px; display: flex; flex-direction: column; justify-content: center; }
    .fbp-cats { margin-bottom: 8px; display: flex; gap: 5px; flex-wrap: wrap; }
    .fbp-cat { 
      background: #f0f0f0; color: ${TOKENS.entityTitleColor}; font-size: 11px;
      padding: 3px 10px; text-transform: uppercase; font-weight: 600;
      text-decoration: none; font-family: ${TOKENS.bodyFont};
    }
    .fbp-title { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; line-height: 1.4;
    }
    .fbp-title a { color: inherit; text-decoration: none; }
    .fbp-title a:hover { color: rgba(51,51,51,0.65); }
    .fbp-meta { 
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      font-size: 12px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont};
    }
    .fbp-meta-avatar { width: 18px; height: 18px; border-radius: 50%; }
    .fbp-excerpt { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      line-height: 1.6; margin-bottom: 12px;
    }
    .fbp-read-more { 
      color: ${TOKENS.entityTitleColor}; font-size: 13px; font-weight: 600;
      text-decoration: none; font-family: ${TOKENS.bodyFont};
    }
    .fbp-read-more:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { 
      .fbp-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 767px) { 
      .fbp-card, .fbp-card:nth-child(even) { flex-direction: column; }
      .fbp-img-wrap { flex: none; }
      .fbp-img { min-height: 200px; }
    }
  `;

  return (
    <div className="fbp-section" style={containerStyle}>
      <ScopedStyles id="blog-posts" css={scopedCss} />
      {sectionTitle && (
        <FashionSectionTitle
          subtitle={sectionTitle.subtitle}
          title={sectionTitle.title}
          description={sectionTitle.description}
        />
      )}
      <div className="fbp-grid">
        {posts.map((p, i) => (
          <article key={i} className="fbp-card">
            <div className="fbp-img-wrap">
              <img src={p.image} alt={p.title} className="fbp-img" loading="lazy" />
              <div className="fbp-date-badge">
                <span className="fbp-date-day">{p.date.day}</span>
                <span className="fbp-date-month">{p.date.month}</span>
              </div>
              <a href={p.link} style={{ position: "absolute", inset: 0, zIndex: 3 }} aria-label={p.title} />
            </div>
            <div className="fbp-content">
              <div className="fbp-cats">
                {p.categories.map((c, ci) => (
                  <span key={ci} className="fbp-cat">{c}</span>
                ))}
              </div>
              <h3 className="fbp-title"><a href={p.link}>{p.title}</a></h3>
              <div className="fbp-meta">
                {p.author.avatar && <img src={p.author.avatar} alt={p.author.name} className="fbp-meta-avatar" />}
                <span>Posted by <strong>{p.author.name}</strong></span>
                {p.commentCount !== undefined && <span>💬 {p.commentCount}</span>}
              </div>
              <p className="fbp-excerpt">{p.excerpt}</p>
              <a href={p.link} className="fbp-read-more">Continue reading</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. FASHION NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */

export interface FashionNewsletterProps {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  onSubmit?: (email: string) => void;
}

export function FashionNewsletter({
  subtitle = "TO WOODMART",
  title = "REGISTER FOR OUR NEWSLETTER",
  description = "Sign up for all the news about our last arrivals and get an exclusive early access shopping.",
  buttonText = "Sign up",
  socialLinks = [],
  onSubmit,
}: FashionNewsletterProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
    setEmail("");
  };

  const socialIcons: Record<string, string> = {
    facebook: "f",
    twitter: "𝕏",
    instagram: "📷",
    youtube: "▶",
    tiktok: "♪",
    linkedin: "in",
  };

  const scopedCss = `
    .fn-section { 
      padding: 40px; margin-bottom: 30px; text-align: center;
      background: #f9f9f9;
    }
    .fn-form { 
      display: flex; max-width: 500px; margin: 20px auto 0; gap: 10px;
    }
    .fn-input { 
      flex: 1; padding: 12px 15px; border: 1px solid #ddd; 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none;
      border-radius: ${TOKENS.borderRadius}; background: #fff;
    }
    .fn-input:focus { border-color: ${TOKENS.primaryColor}; }
    .fn-submit { 
      padding: 12px 25px; background: ${TOKENS.primaryColor}; color: #fff;
      border: none; font-family: ${TOKENS.bodyFont}; font-weight: 600;
      font-size: 13px; text-transform: uppercase; cursor: pointer;
      border-radius: ${TOKENS.borderRadius}; transition: background 0.3s;
    }
    .fn-submit:hover { background: ${TOKENS.primaryHover}; }
    .fn-separator { 
      display: flex; align-items: center; gap: 15px; margin: 25px auto;
      max-width: 400px; color: ${TOKENS.textColor}; font-size: 14px;
      font-family: ${TOKENS.bodyFont};
    }
    .fn-sep-line { flex: 1; height: 1px; background: #ddd; }
    .fn-social { display: flex; justify-content: center; gap: 8px; }
    .fn-social-icon { 
      width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ccc;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none; color: ${TOKENS.entityTitleColor}; font-size: 13px;
      font-family: ${TOKENS.bodyFont}; font-weight: 700;
      transition: all 0.2s ease;
    }
    .fn-social-icon:hover { 
      border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; 
    }
    @media (max-width: 767px) {
      .fn-form { flex-direction: column; }
      .fn-section { padding: 30px 20px; }
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="newsletter" css={scopedCss} />
      <div className="fn-section">
        <FashionSectionTitle subtitle={subtitle} title={title} description={description} maxWidth="70%" />
        <form className="fn-form" onSubmit={handleSubmit}>
          <input type="email" className="fn-input" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="fn-submit">{buttonText}</button>
        </form>
        {socialLinks.length > 0 && (
          <>
            <div className="fn-separator">
              <span className="fn-sep-line" />
              <span>OR FOLLOW US</span>
              <span className="fn-sep-line" />
            </div>
            <div className="fn-social">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} className="fn-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                  {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
