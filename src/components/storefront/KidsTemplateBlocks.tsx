"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════════════════
   KIDS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Kids template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#f5857c",
  primaryHover: "#e76e64",
  titleColor: "#242424",
  textColor: "#767676",
  entityTitleColor: "#333333",
  linkColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#faf8f5",
  containerWidth: "1222px",
  borderRadius: "10px",
  titleFont: "'Quicksand', Arial, Helvetica, sans-serif",
  bodyFont: "'Quicksand', Arial, Helvetica, sans-serif",
};

const IMG_BASE = "https://woodmart.xtemos.com/kids/wp-content/uploads/sites/13/2023/05";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function KidsFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
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
  return <style data-kids-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

export interface KidsProduct {
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
  colors?: Array<{ name: string; hex: string }>;
}

export interface KidsStoreContextData {
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
}
export const KidsStoreContext = createContext<KidsStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. KIDS ANNOUNCEMENT BAR
   ═══════════════════════════════════════════════════════════════ */

export interface KidsAnnouncementBarProps {
  text?: string;
  link?: string;
  backgroundColor?: string;
}

export function KidsAnnouncementBar({ text = "Sign up for our newsletter to get 10% off for the week!", link, backgroundColor = TOKENS.primaryColor }: KidsAnnouncementBarProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const scopedCss = `
    .kab-bar {
      padding: 10px 40px; text-align: center; position: relative;
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: #fff;
    }
    .kab-bar a { color: #fff; text-decoration: underline; }
    .kab-close {
      position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #fff; cursor: pointer; font-size: 18px;
      opacity: 0.7; transition: opacity 0.2s;
    }
    .kab-close:hover { opacity: 1; }
  `;

  return (
    <div className="kab-bar" style={{ background: backgroundColor }}>
      <ScopedStyles id="announcement" css={scopedCss} />
      {link ? <a href={link}>{text}</a> : <span>{text}</span>}
      <button className="kab-close" onClick={() => setVisible(false)} aria-label="Close">✕</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. KIDS HERO SLIDER
   Parallax-style slides with large playful headlines, description,
   "Shop now" button. Pastel/warm backgrounds with kid imagery.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsHeroSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  colorScheme?: "dark" | "light";
}

export interface KidsHeroSliderProps {
  slides: KidsHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function KidsHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "560px" }: KidsHeroSliderProps) {
  const storeCtx = useContext(KidsStoreContext);
  const fixLink = (link: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/shop`;
    return link || "#";
  };
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
    .kh-slider { position: relative; width: 100%; overflow: hidden; }
    .kh-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .kh-slide.kh-active { opacity: 1; position: relative; }
    .kh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .kh-slide-content { position: relative; z-index: 2; width: 100%; }
    .kh-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 64px;
      line-height: 74px; margin: 0 0 20px; max-width: 685px;
    }
    .kh-title-light { color: #fff; }
    .kh-title-dark { color: ${TOKENS.titleColor}; }
    .kh-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 1.6;
      max-width: 490px; margin: 0 0 25px;
    }
    .kh-desc-light { color: rgba(255,255,255,0.6); }
    .kh-desc-dark { color: ${TOKENS.textColor}; }
    .kh-btn {
      display: inline-block; padding: 12px 28px;
      background: ${TOKENS.primaryColor}; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      text-decoration: none; border: none; cursor: pointer;
      border-radius: 5px; transition: background-color 0.3s;
    }
    .kh-btn:hover { background: ${TOKENS.primaryHover}; }
    .kh-dots {
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px; z-index: 5;
    }
    .kh-dot {
      width: 12px; height: 12px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.4); transition: background 0.3s; padding: 0;
    }
    .kh-dot.kh-dot-active { background: ${TOKENS.primaryColor}; }
    .kh-anim-in { animation: khSlideUp 0.6s ease forwards; opacity: 0; }
    @keyframes khSlideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .kh-arrows {
      position: absolute; top: 50%; z-index: 5; display: flex;
      justify-content: space-between; width: 100%; padding: 0 20px;
      transform: translateY(-50%); pointer-events: none;
    }
    .kh-arrow {
      pointer-events: auto; width: 45px; height: 45px; border-radius: 50%;
      border: none; background: rgba(255,255,255,0.8); color: #333;
      font-size: 18px; cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .kh-arrow:hover { background: #fff; }
    @media (max-width: 1024px) {
      .kh-slider { min-height: 450px !important; }
      .kh-title { font-size: 38px; line-height: 48px; max-width: 450px; }
    }
    @media (max-width: 767px) {
      .kh-slider { min-height: 380px !important; }
      .kh-title { font-size: 28px; line-height: 38px; }
      .kh-desc { font-size: 14px; }
    }
  `;

  return (
    <div className="kh-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "light";
        return (
          <div key={i} className={`kh-slide ${i === current ? "kh-active" : ""}`}>
            <div className="kh-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            <div className="kh-slide-content">
              <div style={containerStyle}>
                <div style={{ padding: "60px 0", maxWidth: "60%" }}>
                  {i === current && (
                    <>
                      <h2 className={`kh-title kh-title-${scheme} kh-anim-in`} style={{ animationDelay: "0.2s" }}>{slide.title}</h2>
                      <p className={`kh-desc kh-desc-${scheme} kh-anim-in`} style={{ animationDelay: "0.4s" }}>{slide.description}</p>
                      <div className="kh-anim-in" style={{ animationDelay: "0.5s" }}>
                        <a href={fixLink(slide.buttonLink)} className="kh-btn">{slide.buttonText}</a>
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
        <>
          <div className="kh-arrows">
            <button className="kh-arrow" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous">←</button>
            <button className="kh-arrow" onClick={() => goTo((current + 1) % slides.length)} aria-label="Next">→</button>
          </div>
          <div className="kh-dots">
            {slides.map((_, i) => (
              <button key={i} className={`kh-dot ${i === current ? "kh-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. KIDS SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface KidsSectionTitleProps {
  subtitle?: string;
  title: string;
  align?: "left" | "center";
  marginBottom?: string;
  size?: "default" | "large";
}

export function KidsSectionTitle({ subtitle, title, align = "center", marginBottom = "30px", size = "default" }: KidsSectionTitleProps) {
  const fontSize = size === "large" ? "42px" : "28px";

  const scopedCss = `
    .kst-wrap { margin-bottom: ${marginBottom}; }
    .kst-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor};
      font-weight: 500; margin-bottom: 5px;
    }
    .kst-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: ${fontSize};
      color: ${TOKENS.titleColor}; margin: 0; line-height: 1.3;
    }
    @media (max-width: 767px) {
      .kst-title { font-size: ${size === "large" ? "28px" : "22px"}; }
    }
  `;

  return (
    <div className="kst-wrap" style={{ textAlign: align }}>
      <ScopedStyles id="section-title" css={scopedCss} />
      {subtitle && <div className="kst-subtitle">{subtitle}</div>}
      <h2 className="kst-title">{title}</h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. KIDS CATEGORY CARDS
   Circular zoom-out design with category image, name + count.
   6 categories: Growsuits, Jumpers, Toys, Accessories, Dresses, Leggings
   ═══════════════════════════════════════════════════════════════ */

export interface KidsCategoryCard {
  name: string;
  image: string;
  productCount?: number;
  link: string;
}

export interface KidsCategoryCardsProps {
  categories: KidsCategoryCard[];
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
}

export function KidsCategoryCards({ categories, sectionTitle, marginBottom = "60px" }: KidsCategoryCardsProps) {
  const storeCtx = useContext(KidsStoreContext);
  const fixLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/shop?category=${slug}`;
    }
    return link || "#";
  };

  const scopedCss = `
    .kcc-section { margin-bottom: ${marginBottom}; }
    .kcc-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
    .kcc-card { text-align: center; cursor: pointer; }
    .kcc-img-wrap {
      position: relative; overflow: hidden; border-radius: 50%;
      aspect-ratio: 1; margin-bottom: 15px;
    }
    .kcc-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.6s ease;
    }
    .kcc-card:hover .kcc-img { transform: scale(0.92); }
    .kcc-name {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.titleColor}; margin: 0 0 3px;
    }
    .kcc-name a { color: inherit; text-decoration: none; }
    .kcc-name a:hover { color: ${TOKENS.primaryColor}; }
    .kcc-count {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
    }
    .kcc-link { position: absolute; inset: 0; z-index: 2; border-radius: 50%; }
    @media (max-width: 1024px) { .kcc-grid { grid-template-columns: repeat(3, 1fr); gap: 15px; } }
    @media (max-width: 767px) { .kcc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div className="kcc-section" style={containerStyle}>
      <ScopedStyles id="category-cards" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="kcc-grid">
        {categories.map((c, i) => (
          <div key={i} className="kcc-card">
            <div className="kcc-img-wrap">
              <img src={c.image} alt={c.name} className="kcc-img" loading="lazy" />
              <a href={fixLink(c.link, c.name)} className="kcc-link" aria-label={c.name} />
            </div>
            <h3 className="kcc-name"><a href={fixLink(c.link, c.name)}>{c.name}</a></h3>
            {c.productCount !== undefined && <span className="kcc-count">{c.productCount} products</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. KIDS PRODUCT GRID
   Rounded product cards with color swatches, hover image swap,
   star ratings, labels (Sale, Hot, New).
   ═══════════════════════════════════════════════════════════════ */

export interface KidsProductGridProps {
  products?: KidsProduct[];
  columns?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function KidsProductGrid({ products: propProducts, columns = 4, showCategory = true, showHoverImage = true, sectionTitle, marginBottom = "60px", maxProducts = 8, filter, filterTag }: KidsProductGridProps) {
  const storeCtx = useContext(KidsStoreContext);

  const products: KidsProduct[] = (() => {
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
      image: p.images[0]?.url || "",
      hoverImage: p.images[1]?.url,
      link: `/store/${storeCtx.storeSlug}/product/${p.slug}`,
      badge: p.compareAtPrice ? "Sale" : p.isFeatured ? "Hot" : undefined,
    }));
  })();

  const resolveLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/product/${slug}`;
    }
    return link || "#";
  };

  const scopedCss = `
    .kpg-section { margin-bottom: ${marginBottom}; }
    .kpg-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .kpg-card { position: relative; }
    .kpg-thumb { position: relative; overflow: hidden; margin-bottom: 12px; border-radius: ${TOKENS.borderRadius}; background: #f5f5f5; }
    .kpg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s; }
    .kpg-hover-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s;
    }
    .kpg-card:hover .kpg-hover-img { opacity: 1; }
    .kpg-card:hover .kpg-main-img { opacity: 0; }
    .kpg-actions {
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transform: translateX(10px); transition: all 0.3s; z-index: 3;
    }
    .kpg-card:hover .kpg-actions { opacity: 1; transform: translateX(0); }
    .kpg-action-btn {
      width: 35px; height: 35px; border-radius: 50%; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-size: 14px; transition: background 0.2s;
    }
    .kpg-action-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .kpg-badge {
      position: absolute; top: 10px; left: 10px; z-index: 3;
      padding: 3px 12px; border-radius: 3px; font-size: 12px; font-weight: 700;
      font-family: ${TOKENS.bodyFont}; color: #fff;
    }
    .kpg-badge-sale { background: ${TOKENS.primaryColor}; }
    .kpg-badge-hot { background: #e67e22; }
    .kpg-badge-new { background: #27ae60; }
    .kpg-swatches { display: flex; gap: 5px; margin-bottom: 6px; }
    .kpg-swatch {
      width: 16px; height: 16px; border-radius: 50%; border: 2px solid #e0e0e0;
      cursor: pointer; transition: border-color 0.2s;
    }
    .kpg-swatch:hover { border-color: ${TOKENS.titleColor}; }
    .kpg-cat {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      margin-bottom: 4px;
    }
    .kpg-cat a { color: inherit; text-decoration: none; }
    .kpg-name {
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.4;
    }
    .kpg-name a { color: inherit; text-decoration: none; }
    .kpg-name a:hover { color: ${TOKENS.primaryColor}; }
    .kpg-price { font-weight: 700; font-size: 14px; font-family: ${TOKENS.bodyFont}; }
    .kpg-price-old { text-decoration: line-through; color: #999; font-weight: 400; margin-right: 8px; }
    .kpg-price-sale { color: ${TOKENS.primaryColor}; }
    .kpg-add-btn {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: ${TOKENS.primaryColor}; color: #fff; border: none;
      padding: 10px; font-weight: 700; font-size: 13px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s;
      border-radius: 0 0 ${TOKENS.borderRadius} ${TOKENS.borderRadius};
    }
    .kpg-card:hover .kpg-add-btn { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .kpg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .kpg-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  if (products.length === 0) {
    return (
      <div className="kpg-section" style={containerStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kpg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="kpg-grid">
        {products.map((p) => {
          const pLink = resolveLink(p.link, p.name);
          const badgeClass = p.badge?.toLowerCase() === "sale" ? "kpg-badge-sale" : p.badge?.toLowerCase() === "hot" ? "kpg-badge-hot" : "kpg-badge-new";
          return (
            <div key={p.id} className="kpg-card">
              <div className="kpg-thumb">
                <a href={pLink}>
                  <img src={p.image} alt={p.name} className="kpg-img kpg-main-img" loading="lazy" />
                  {showHoverImage && p.hoverImage && (
                    <img src={p.hoverImage} alt={p.name} className="kpg-hover-img" loading="lazy" />
                  )}
                </a>
                {p.badge && <span className={`kpg-badge ${badgeClass}`}>{p.badge}</span>}
                <div className="kpg-actions">
                  <button className="kpg-action-btn" title="Quick view" aria-label="Quick view">👁</button>
                  <button className="kpg-action-btn" title="Wishlist" aria-label="Wishlist">♡</button>
                  <button className="kpg-action-btn" title="Compare" aria-label="Compare">⇌</button>
                </div>
                <button className="kpg-add-btn">Add to cart</button>
              </div>
              {p.colors && p.colors.length > 0 && (
                <div className="kpg-swatches">
                  {p.colors.map((c, ci) => (
                    <span key={ci} className="kpg-swatch" style={{ background: c.hex }} title={c.name} />
                  ))}
                </div>
              )}
              {showCategory && p.category && (
                <div className="kpg-cat"><a href={p.categoryLink || "#"}>{p.category}</a></div>
              )}
              <h3 className="kpg-name"><a href={pLink}>{p.name}</a></h3>
              <div className="kpg-price">
                {p.salePrice && <span className="kpg-price-old">{p.price}</span>}
                <span className={p.salePrice ? "kpg-price-sale" : ""}>{p.salePrice || p.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. KIDS BUNDLE PROMO
   "Organic and safe clothes set for your baby" — left text with
   "Buy bundle now" CTA, right side product images carousel.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsBundlePromoProps {
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  productImages: string[];
  backgroundColor?: string;
  marginBottom?: string;
}

export function KidsBundlePromo({ subtitle = "Buy bundle and get a 25% discount", title, description, buttonText = "Buy bundle now", buttonLink, productImages, backgroundColor = "#f5f0eb", marginBottom = "60px" }: KidsBundlePromoProps) {
  const storeCtx = useContext(KidsStoreContext);
  const fixLink = (link?: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/shop`;
    return link || "#";
  };
  const { ref, inView } = useInView();

  const scopedCss = `
    .kbp-section { margin-bottom: ${marginBottom}; border-radius: ${TOKENS.borderRadius}; overflow: hidden; padding: 50px; }
    .kbp-grid { display: flex; align-items: center; gap: 40px; }
    .kbp-content { flex: 0 0 40%; }
    .kbp-images { flex: 1; display: flex; gap: 15px; overflow-x: auto; }
    .kbp-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor};
      font-weight: 500; margin-bottom: 5px;
    }
    .kbp-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 42px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 20px;
    }
    .kbp-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0 0 25px;
    }
    .kbp-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; background: ${TOKENS.primaryColor}; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      text-decoration: none; border-radius: 5px; transition: background 0.3s;
    }
    .kbp-btn:hover { background: ${TOKENS.primaryHover}; }
    .kbp-btn-icon { width: 18px; height: 18px; }
    .kbp-product-img {
      flex: 0 0 auto; width: 200px; border-radius: ${TOKENS.borderRadius};
      object-fit: cover; aspect-ratio: 7/8;
    }
    .kbp-animate { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
    .kbp-animate.kbp-visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) {
      .kbp-title { font-size: 32px; }
      .kbp-section { padding: 30px; }
    }
    @media (max-width: 767px) {
      .kbp-grid { flex-direction: column; gap: 25px; }
      .kbp-content { flex: none; width: 100%; }
      .kbp-title { font-size: 26px; }
      .kbp-product-img { width: 150px; }
    }
  `;

  return (
    <div className="kbp-section" ref={ref} style={{ backgroundColor }} >
      <ScopedStyles id="bundle-promo" css={scopedCss} />
      <div className={`kbp-grid kbp-animate ${inView ? "kbp-visible" : ""}`} style={containerStyle}>
        <div className="kbp-content">
          {subtitle && <div className="kbp-subtitle">{subtitle}</div>}
          <h2 className="kbp-title">{title}</h2>
          {description && <p className="kbp-desc">{description}</p>}
          <a href={fixLink(buttonLink)} className="kbp-btn">
            <img src={`${IMG_BASE}/bundle.svg`} alt="" className="kbp-btn-icon" />
            {buttonText}
          </a>
        </div>
        <div className="kbp-images">
          {productImages.map((img, i) => (
            <img key={i} src={img} alt={`Bundle product ${i + 1}`} className="kbp-product-img" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. KIDS BLOG POSTS
   Masonry-style blog cards with date badge, category tags,
   author avatar, social share, excerpt.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string };
  categories: string[];
  author: { name: string; avatar?: string };
  link: string;
  commentCount?: number;
}

export interface KidsBlogPostsProps {
  posts: KidsBlogPost[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
}

export function KidsBlogPosts({ posts: propPosts, columns = 3, sectionTitle, marginBottom = "60px" }: KidsBlogPostsProps) {
  const storeCtx = useContext(KidsStoreContext);

  const posts: KidsBlogPost[] = (() => {
    if (!storeCtx || !storeCtx.blogs || storeCtx.blogs.length === 0) return propPosts || [];
    return storeCtx.blogs.slice(0, columns * 2).map(b => {
      const d = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return {
        image: b.coverImage || "",
        title: b.title,
        excerpt: b.excerpt || "",
        date: { day: d.getDate().toString().padStart(2, "0"), month: d.toLocaleString("en-US", { month: "short" }) },
        categories: b.category ? [b.category] : [],
        author: { name: b.author || "Store Team" },
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
        commentCount: 0,
      };
    });
  })();

  const scopedCss = `
    .kbp2-section { margin-bottom: ${marginBottom}; }
    .kbp2-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .kbp2-card { overflow: hidden; background: #fff; border-radius: ${TOKENS.borderRadius}; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .kbp2-img-wrap { position: relative; overflow: hidden; }
    .kbp2-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .kbp2-card:hover .kbp2-img { transform: scale(1.05); }
    .kbp2-date-badge {
      position: absolute; top: 15px; left: 15px; background: ${TOKENS.primaryColor};
      color: #fff; text-align: center; padding: 8px 12px; border-radius: 5px; z-index: 2;
    }
    .kbp2-date-day { display: block; font-size: 20px; font-weight: 700; line-height: 1; font-family: ${TOKENS.bodyFont}; }
    .kbp2-date-month { display: block; font-size: 11px; text-transform: uppercase; font-family: ${TOKENS.bodyFont}; }
    .kbp2-content { padding: 20px; }
    .kbp2-cats { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
    .kbp2-cat {
      background: rgba(245,133,124,0.12); color: ${TOKENS.primaryColor}; font-size: 11px;
      padding: 3px 10px; border-radius: 3px; text-transform: uppercase; font-weight: 600;
      font-family: ${TOKENS.bodyFont};
    }
    .kbp2-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 18px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; line-height: 1.4;
    }
    .kbp2-title a { color: inherit; text-decoration: none; }
    .kbp2-title a:hover { color: ${TOKENS.primaryColor}; }
    .kbp2-meta {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      font-size: 13px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont};
    }
    .kbp2-avatar { width: 24px; height: 24px; border-radius: 50%; }
    .kbp2-excerpt {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor};
      line-height: 1.6;
    }
    .kbp2-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .kbp2-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .kbp2-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="kbp2-section" style={containerStyle}>
      <ScopedStyles id="blog-posts" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="kbp2-grid">
        {posts.map((p, i) => (
          <article key={i} className="kbp2-card">
            <div className="kbp2-img-wrap">
              <img src={p.image} alt={p.title} className="kbp2-img" loading="lazy" />
              <div className="kbp2-date-badge">
                <span className="kbp2-date-day">{p.date.day}</span>
                <span className="kbp2-date-month">{p.date.month}</span>
              </div>
              <a href={p.link} className="kbp2-link" aria-label={p.title} />
            </div>
            <div className="kbp2-content">
              <div className="kbp2-cats">
                {p.categories.map((c, ci) => <span key={ci} className="kbp2-cat">{c}</span>)}
              </div>
              <h3 className="kbp2-title"><a href={p.link}>{p.title}</a></h3>
              <div className="kbp2-meta">
                {p.author.avatar && <img src={p.author.avatar} alt={p.author.name} className="kbp2-avatar" />}
                <span>By <strong>{p.author.name}</strong></span>
                {p.commentCount !== undefined && <span>💬 {p.commentCount}</span>}
              </div>
              <p className="kbp2-excerpt">{p.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. KIDS INSTAGRAM FEED
   5 square images with likes + comments on hover.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsInstagramItem {
  image: string;
  likes: number;
  comments: number;
  link: string;
}

export interface KidsInstagramProps {
  items: KidsInstagramItem[];
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
}

export function KidsInstagram({ items, sectionTitle, marginBottom = "60px" }: KidsInstagramProps) {
  const scopedCss = `
    .ki-section { margin-bottom: ${marginBottom}; }
    .ki-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
    .ki-item { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; cursor: pointer; aspect-ratio: 1; }
    .ki-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
    .ki-item:hover .ki-img { transform: scale(1.08); }
    .ki-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center; gap: 15px;
      opacity: 0; transition: opacity 0.3s; z-index: 2; border-radius: ${TOKENS.borderRadius};
    }
    .ki-item:hover .ki-overlay { opacity: 1; }
    .ki-stat {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 700;
      color: #fff; display: flex; align-items: center; gap: 5px;
    }
    .ki-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .ki-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .ki-grid { grid-template-columns: repeat(2, 1fr); } }
  `;

  return (
    <div className="ki-section" style={containerStyle}>
      <ScopedStyles id="instagram" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="ki-grid">
        {items.map((item, i) => (
          <div key={i} className="ki-item">
            <img src={item.image} alt={`Instagram ${i + 1}`} className="ki-img" loading="lazy" />
            <div className="ki-overlay">
              <span className="ki-stat">❤ {item.likes.toLocaleString()}</span>
              <span className="ki-stat">💬 {item.comments}</span>
            </div>
            <a href={item.link} className="ki-link" target="_blank" rel="noopener noreferrer" aria-label={`Instagram post ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. KIDS NEWSLETTER
   "Join our mailing list" info-box style with email input.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsNewsletterProps {
  title?: string;
  buttonText?: string;
  backgroundColor?: string;
  onSubmit?: (email: string) => void;
}

export function KidsNewsletter({ title = "Join our mailing list to receive any latest updates and promotions", buttonText = "Subscribe", backgroundColor = "#faf8f5", onSubmit }: KidsNewsletterProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
    setEmail("");
  };

  const scopedCss = `
    .kn-section { padding: 40px; border-radius: ${TOKENS.borderRadius}; text-align: center; }
    .kn-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 20px;
      color: ${TOKENS.titleColor}; margin: 0 auto 20px; max-width: 500px;
    }
    .kn-form { display: flex; max-width: 450px; margin: 0 auto; gap: 0; }
    .kn-input {
      flex: 1; padding: 12px 18px; border: 2px solid #e0e0e0;
      font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none;
      border-radius: 5px 0 0 5px; border-right: none; background: #fff;
    }
    .kn-input:focus { border-color: ${TOKENS.primaryColor}; }
    .kn-submit {
      padding: 12px 25px; background: ${TOKENS.primaryColor}; color: #fff;
      border: 2px solid ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont};
      font-weight: 700; font-size: 13px; cursor: pointer;
      border-radius: 0 5px 5px 0; transition: background 0.3s;
    }
    .kn-submit:hover { background: ${TOKENS.primaryHover}; border-color: ${TOKENS.primaryHover}; }
    @media (max-width: 767px) {
      .kn-form { flex-direction: column; gap: 10px; }
      .kn-input { border-right: 2px solid #e0e0e0; border-radius: 5px; }
      .kn-submit { border-radius: 5px; }
    }
  `;

  return (
    <div className="kn-section" style={{ backgroundColor, ...containerStyle }}>
      <ScopedStyles id="newsletter" css={scopedCss} />
      <h3 className="kn-title">{title}</h3>
      <form className="kn-form" onSubmit={handleSubmit}>
        <input type="email" className="kn-input" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit" className="kn-submit">{buttonText}</button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. KIDS FOOTER
   Warm background footer with tagline, link columns, social icons,
   contact info, payment icons.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsFooterLinkColumn {
  title: string;
  links: Array<{ label: string; url: string }>;
}

export interface KidsFooterProps {
  logoUrl?: string;
  logoAlt?: string;
  tagline?: string;
  description?: string;
  contact?: { address?: string; phone?: string; email?: string };
  linkColumns?: KidsFooterLinkColumn[];
  socialLinks?: Array<{ platform: string; url: string }>;
  copyrightText?: string;
  paymentIconsUrl?: string;
  backgroundColor?: string;
}

export function KidsFooter({
  logoUrl,
  logoAlt = "Store Logo",
  tagline = "Beautiful things for small people",
  description = "Quality children's clothing and accessories for every occasion.",
  contact,
  linkColumns = [],
  socialLinks = [],
  copyrightText = `© ${new Date().getFullYear()}. All rights reserved.`,
  paymentIconsUrl,
  backgroundColor = TOKENS.footerBg,
}: KidsFooterProps) {
  const [openColumns, setOpenColumns] = useState<Set<number>>(new Set());
  const toggleColumn = (idx: number) => {
    setOpenColumns(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶",
    tiktok: "♪", linkedin: "in", pinterest: "📌",
  };

  const scopedCss = `
    .kf-footer { background: ${backgroundColor}; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.7; }
    .kf-footer a { color: ${TOKENS.textColor}; text-decoration: none; transition: color 0.2s; }
    .kf-footer a:hover { color: ${TOKENS.primaryColor}; }
    .kf-top { padding: 40px 0; text-align: center; }
    .kf-tagline {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 42px;
      color: ${TOKENS.titleColor}; margin: 0 0 10px;
    }
    .kf-main {
      max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 30px 15px 50px;
      display: flex; flex-wrap: wrap; gap: 30px;
    }
    .kf-col-brand { flex: 0 1 28%; min-width: 220px; }
    .kf-col-links { flex: 0 1 18%; min-width: 140px; }
    .kf-col-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.titleColor}; text-transform: uppercase; margin: 0 0 18px;
    }
    .kf-link-list { list-style: none; margin: 0; padding: 0; }
    .kf-link-list li { margin-bottom: 8px; }
    .kf-social { display: flex; gap: 8px; margin-top: 15px; }
    .kf-social-icon {
      width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ddd;
      display: flex; align-items: center; justify-content: center;
      color: ${TOKENS.entityTitleColor}; font-size: 13px; font-weight: 700;
      transition: all 0.2s;
    }
    .kf-social-icon:hover { border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; }
    .kf-contact-list { list-style: none; margin: 10px 0 0; padding: 0; }
    .kf-contact-item { margin-bottom: 6px; font-size: 14px; }
    .kf-copyrights {
      border-top: 1px solid #e0e0e0;
      max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 20px 15px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 10px;
    }
    .kf-copyrights small { font-size: 13px; color: ${TOKENS.textColor}; }
    .kf-copyrights img { height: 21px; width: auto; }
    .kf-col-toggle-head {
      display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; user-select: none;
    }
    .kf-col-toggle-head svg {
      width: 12px; height: 12px; fill: ${TOKENS.textColor};
      transition: transform 0.3s; display: none;
    }
    .kf-col-toggle-head.kf-open svg { transform: rotate(180deg); }
    @media (max-width: 768px) {
      .kf-main { gap: 0 !important; padding: 0 15px !important; }
      .kf-col-brand, .kf-col-links {
        flex: 0 1 100% !important; min-width: 100% !important;
        border-bottom: 1px solid #e0e0e0; padding: 20px 0;
      }
      .kf-col-toggle-head svg { display: block; }
      .kf-col-toggle-content { overflow: hidden; transition: max-height 0.3s ease; }
      .kf-col-toggle-content.kf-closed { max-height: 0; }
      .kf-col-toggle-content.kf-open { max-height: 500px; }
      .kf-col-title { margin-bottom: 0; }
      .kf-col-toggle-head.kf-open .kf-col-title { margin-bottom: 15px; }
      .kf-tagline { font-size: 28px; }
    }
    @media (min-width: 769px) { .kf-col-toggle-content { max-height: none !important; } }
  `;

  const chevronSvg = (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M59.77 20.77c.49-.49.73-1.13.73-1.77s-.24-1.28-.73-1.77a2.5 2.5 0 00-3.54 0L32 41.46 7.77 17.23a2.5 2.5 0 00-3.54 0 2.5 2.5 0 000 3.54l26 26a2.5 2.5 0 003.54 0l26-26z"/>
    </svg>
  );

  return (
    <footer className="kf-footer">
      <ScopedStyles id="footer" css={scopedCss} />

      {/* Tagline */}
      <div className="kf-top" style={containerStyle}>
        <h2 className="kf-tagline">{tagline}</h2>
      </div>

      <div className="kf-main">
        {/* Brand */}
        <div className="kf-col-brand">
          {logoUrl && (
            <div style={{ marginBottom: "16px" }}>
              <a href="/"><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></a>
            </div>
          )}
          <p style={{ margin: "0 0 10px" }}>{description}</p>
          {contact && (
            <ul className="kf-contact-list">
              {contact.address && <li className="kf-contact-item">📍 {contact.address}</li>}
              {contact.phone && <li className="kf-contact-item">📞 {contact.phone}</li>}
              {contact.email && <li className="kf-contact-item">✉️ {contact.email}</li>}
            </ul>
          )}
          {socialLinks.length > 0 && (
            <div className="kf-social">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} className="kf-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                  {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Link columns */}
        {linkColumns.map((col, idx) => {
          const isOpen = openColumns.has(idx);
          return (
            <div key={idx} className="kf-col-links">
              <div className={`kf-col-toggle-head ${isOpen ? "kf-open" : ""}`} onClick={() => toggleColumn(idx)}>
                <h4 className="kf-col-title">{col.title}</h4>
                {chevronSvg}
              </div>
              <div className={`kf-col-toggle-content ${isOpen ? "kf-open" : "kf-closed"}`}>
                <ul className="kf-link-list">
                  {col.links.map((link, li) => (
                    <li key={li}><a href={link.url}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="kf-copyrights">
        <div><small>{copyrightText}</small></div>
        {paymentIconsUrl && <div><img src={paymentIconsUrl} alt="Payment methods" loading="lazy" /></div>}
      </div>
    </footer>
  );
}
