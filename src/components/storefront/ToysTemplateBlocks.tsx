"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useEffect, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   TOYS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Toys demo sections.
   ═══════════════════════════════════════════════════════════════ */

const TOKENS = {
  primaryColor: "#ff6262",
  accentColor: "#ffd54f",
  titleColor: "#333333",
  textColor: "#777777",
  bgLight: "#fff9f0",
  bgWhite: "#ffffff",
  containerWidth: "1222px",
  borderRadius: "8px",
  titleFont: "'Poppins', Arial, Helvetica, sans-serif",
  bodyFont: "var(--theme-font-body, 'Open Sans', Arial, Helvetica, sans-serif)",
};

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

export function ToysFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600&display=swap');
    `}} />
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px", boxSizing: "border-box" as const, width: "100%",
};

function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-toys-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ─── STORE CONTEXT ───────────────────────────────────────────── */
export interface ToysProduct {
  id: number; name: string; slug: string; price: string; comparePrice?: string;
  image: string; hoverImage?: string; category: string; rating?: number; badge?: string;
}

export interface ToysStoreContextData {
  storeSlug?: string; products?: ToysProduct[]; storeName?: string; storeLogo?: string;
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
}

export const ToysStoreContext = createContext<ToysStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */
export interface ToysHeroSlide {
  titleLine1: string; titleLine2: string; description?: string;
  buttonText: string; buttonLink: string; backgroundColor: string;
  productImage: string; backgroundImage?: string;
}

export interface ToysHeroSliderProps {
  slides?: ToysHeroSlide[]; autoplaySpeed?: number;
}

export function ToysHeroSlider({ slides, autoplaySpeed = 5000 }: ToysHeroSliderProps) {
  const storeCtx = useContext(ToysStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultSlides: ToysHeroSlide[] = [
    { titleLine1: "Guardian", titleLine2: "Of The Galaxy.", description: "Official Marvel movie action figures.", buttonText: "SHOP NOW", buttonLink: "#", backgroundColor: "#1a1a2e", productImage: `${IMG}/2021/06/v-toy-sl-3.png`, backgroundImage: `${IMG}/2018/10/v-toy-sl3-bg-1-opt.jpg` },
    { titleLine1: "Star Wars", titleLine2: "Toy Figures.", description: "There are many variations of passages.", buttonText: "SHOP NOW", buttonLink: "#", backgroundColor: "#0f3460", productImage: `${IMG}/2021/06/v-toy-sl-1.png`, backgroundImage: `${IMG}/2018/10/v-toy-sl-bg-1-opt.jpg` },
    { titleLine1: "Toy Story", titleLine2: "Action Figures.", description: "There are many variations of passages.", buttonText: "SHOP NOW", buttonLink: "#", backgroundColor: "#e94560", productImage: `${IMG}/2021/06/w-toys-slider-3.png`, backgroundImage: `${IMG}/2018/02/v-toy-sl2-bg.jpg` },
  ];

  const items = slides || defaultSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % items.length), autoplaySpeed);
    return () => clearInterval(t);
  }, [items.length, autoplaySpeed]);

  const css = `
    .ty-slider { position: relative; width: 100%; min-height: 560px; overflow: hidden; }
    .ty-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .ty-slide.ty-active { opacity: 1; position: relative; }
    .ty-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
    .ty-slide-inner { position: relative; z-index: 2; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 8%; }
    .ty-slide-text { flex: 1; }
    .ty-slide-title { font-family: ${TOKENS.titleFont}; font-weight: 800; font-size: 54px; line-height: 1.15; color: #fff; margin: 0 0 15px; }
    .ty-slide-desc { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: rgba(255,255,255,0.8); margin: 0 0 25px; }
    .ty-slide-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 30px; transition: background 0.3s; }
    .ty-slide-btn:hover { background: #e55555; }
    .ty-slide-img { flex: 0 0 auto; max-width: 420px; }
    .ty-slide-img img { max-width: 100%; height: auto; }
    .ty-dots { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 5; }
    .ty-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); background: transparent; cursor: pointer; padding: 0; transition: all 0.3s; }
    .ty-dot.ty-active { background: #fff; border-color: #fff; }
    @media (max-width: 767px) { .ty-slide-title { font-size: 36px; } .ty-slide-img { display: none; } .ty-slider { min-height: 380px; } }
  `;

  return (
    <div className="ty-slider">
      <ScopedStyles id="hero" css={css} />
      {items.map((slide, i) => (
        <div key={i} className={`ty-slide ${i === current ? "ty-active" : ""}`}>
          <div className="ty-slide-bg" style={{ backgroundColor: slide.backgroundColor, backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined }} />
          <div className="ty-slide-inner">
            <div className="ty-slide-text">
              <h2 className="ty-slide-title">{slide.titleLine1}<br />{slide.titleLine2}</h2>
              {slide.description && <p className="ty-slide-desc">{slide.description}</p>}
              <Link href={fixLink(slide.buttonLink)} className="ty-slide-btn">{slide.buttonText}</Link>
            </div>
            <div className="ty-slide-img">
              <img src={slide.productImage} alt={slide.titleLine1} onError={(e) => onImgError(e, slide.titleLine1)} />
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="ty-dots">
          {items.map((_, i) => <button key={i} className={`ty-dot ${i === current ? "ty-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />)}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. BANNER CARDS (Disney Soft Toys / Hector / Lego)
   ═══════════════════════════════════════════════════════════════ */
export interface ToysBannerCard {
  label: string; title: string; image: string; link?: string;
}

export interface ToysBannerCardsProps {
  cards?: ToysBannerCard[];
}

export function ToysBannerCards({ cards }: ToysBannerCardsProps) {
  const storeCtx = useContext(ToysStoreContext);
  const defaultCards: ToysBannerCard[] = [
    { label: "Disney", title: "Soft Toys.", image: `${IMG}/2018/10/v-toy-banner-img-1-opt.jpg`, link: "#" },
    { label: "Movies", title: "Hector Toy.", image: `${IMG}/2018/10/v-toy-banner-img-2-opt.jpg`, link: "#" },
    { label: "Lego", title: "Big Sale.", image: `${IMG}/2018/10/v-toy-banner-img-3-opt.jpg`, link: "#" },
  ];
  const items = cards || defaultCards;

  const css = `
    .ty-banners { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px auto 50px; }
    .ty-banner { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; cursor: pointer; min-height: 280px; }
    .ty-banner-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; transition: transform 0.5s; }
    .ty-banner:hover .ty-banner-img { transform: scale(1.06); }
    .ty-banner-content { position: relative; z-index: 2; padding: 30px; }
    .ty-banner-label { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .ty-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 24px; color: ${TOKENS.titleColor}; margin: 0; }
    @media (max-width: 767px) { .ty-banners { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="banners" css={css} />
      <div className="ty-banners">
        {items.map((b, i) => (
          <Link key={i} href={resolveStoreLink(b.link, storeCtx?.storeSlug)} className="ty-banner">
            <img className="ty-banner-img" src={b.image} alt={b.title} onError={(e) => onImgError(e, b.title)} />
            <div className="ty-banner-content">
              <div className="ty-banner-label">{b.label}</div>
              <h4 className="ty-banner-title">{b.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. VIDEO + WELCOME SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface ToysVideoWelcomeProps {
  videoThumbnail?: string; videoUrl?: string;
  subtitle?: string; title?: string; description?: string;
}

export function ToysVideoWelcome({
  videoThumbnail = `${IMG}/2018/10/v-toy-video-img-opt.jpg`,
  videoUrl = "https://www.youtube.com/watch?v=XHOmBV4js_E",
  subtitle = "Curabitur aliquet quam",
  title = "Welcome to our shop",
  description = "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.",
}: ToysVideoWelcomeProps) {
  const css = `
    .ty-video-welcome { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; margin: 50px auto 60px; }
    .ty-video-thumb { position: relative; border-radius: ${TOKENS.borderRadius}; overflow: hidden; cursor: pointer; }
    .ty-video-thumb img { width: 100%; height: auto; display: block; }
    .ty-video-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .ty-video-play::after { content: "▶"; font-size: 24px; color: ${TOKENS.primaryColor}; margin-left: 4px; }
    .ty-welcome-sub { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .ty-welcome-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 32px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .ty-welcome-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.8; color: ${TOKENS.textColor}; }
    @media (max-width: 767px) { .ty-video-welcome { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="video-welcome" css={css} />
      <div className="ty-video-welcome">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="ty-video-thumb">
          <img src={videoThumbnail} alt="Video" onError={(e) => onImgError(e, "Video")} />
          <div className="ty-video-play" />
        </a>
        <div>
          <div className="ty-welcome-sub">{subtitle}</div>
          <h3 className="ty-welcome-title">{title}</h3>
          <p className="ty-welcome-desc">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. FEATURES BAR (Free Shipping, Support 24, Easy Payment)
   ═══════════════════════════════════════════════════════════════ */
export interface ToysFeature {
  icon: string; title: string; description: string;
}

export interface ToysFeaturesBarProps {
  features?: ToysFeature[];
}

export function ToysFeaturesBar({ features }: ToysFeaturesBarProps) {
  const defaultFeatures: ToysFeature[] = [
    { icon: `${IMG}/2018/02/v-toy-shape-1.svg`, title: "Free Shipping", description: "It is a long established fact that a reader will be." },
    { icon: `${IMG}/2018/02/v-toy-shape-2.svg`, title: "Support 24", description: "Various versions have evolved over." },
    { icon: `${IMG}/2018/02/v-toy-shape-3.svg`, title: "Easy Payment", description: "Quisque velit nisi, pretium ut lacinia in." },
  ];
  const items = features || defaultFeatures;

  const css = `
    .ty-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin: 0 auto 60px; text-align: center; }
    .ty-feature-icon { width: 60px; height: 60px; margin: 0 auto 15px; }
    .ty-feature-icon img { width: 100%; height: 100%; }
    .ty-feature-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 8px; }
    .ty-feature-desc { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; line-height: 1.6; }
    @media (max-width: 767px) { .ty-features { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="features" css={css} />
      <div className="ty-features">
        {items.map((f, i) => (
          <div key={i}>
            <div className="ty-feature-icon"><img src={f.icon} alt={f.title} onError={(e) => onImgError(e, f.title)} /></div>
            <h4 className="ty-feature-title">{f.title}</h4>
            <p className="ty-feature-desc">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. AGE CATEGORIES (circular images)
   ═══════════════════════════════════════════════════════════════ */
export interface ToysAgeCategory {
  label: string; image: string; link?: string;
}

export interface ToysAgeCategoriesProps {
  subtitle?: string; title?: string; categories?: ToysAgeCategory[];
}

export function ToysAgeCategories({
  subtitle = "Choose your category",
  title = "Kids' Toys by Age",
  categories,
}: ToysAgeCategoriesProps) {
  const storeCtx = useContext(ToysStoreContext);
  const defaultCategories: ToysAgeCategory[] = [
    { label: "2 Years Old", image: `${IMG}/2018/02/v-toy-categ-img-circle.png`, link: "#" },
    { label: "2-5 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-2.png`, link: "#" },
    { label: "5-8 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-3.png`, link: "#" },
    { label: "8-13 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-4.png`, link: "#" },
    { label: "13-16 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-5.png`, link: "#" },
  ];
  const items = categories || defaultCategories;

  const css = `
    .ty-age-section { background: ${TOKENS.bgLight}; padding: 60px 0; margin-bottom: 60px; }
    .ty-age-sub { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; text-align: center; }
    .ty-age-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 30px; color: ${TOKENS.titleColor}; margin: 0 0 40px; text-align: center; }
    .ty-age-grid { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
    .ty-age-card { text-align: center; cursor: pointer; transition: transform 0.3s; text-decoration: none; }
    .ty-age-card:hover { transform: translateY(-5px); }
    .ty-age-img { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 4px solid transparent; transition: border-color 0.3s; }
    .ty-age-card:hover .ty-age-img { border-color: ${TOKENS.primaryColor}; }
    .ty-age-label { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.titleColor}; }
    @media (max-width: 767px) { .ty-age-grid { gap: 20px; } .ty-age-img { width: 100px; height: 100px; } }
  `;

  return (
    <div className="ty-age-section">
      <ScopedStyles id="age-cats" css={css} />
      <div style={containerStyle}>
        <div className="ty-age-sub">{subtitle}</div>
        <h3 className="ty-age-title">{title}</h3>
        <div className="ty-age-grid">
          {items.map((cat, i) => (
            <Link key={i} href={resolveStoreLink(cat.link, storeCtx?.storeSlug)} className="ty-age-card">
              <img className="ty-age-img" src={cat.image} alt={cat.label} onError={(e) => onImgError(e, cat.label)} />
              <div className="ty-age-label">{cat.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */
export interface ToysSectionTitleProps {
  subtitle?: string; title: string; description?: string; align?: "left" | "center";
}

export function ToysSectionTitle({ subtitle, title, description, align = "center" }: ToysSectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      {subtitle && <div style={{ fontFamily: TOKENS.bodyFont, fontSize: "13px", color: TOKENS.primaryColor, textTransform: "uppercase" as const, letterSpacing: "2px", marginBottom: "8px" }}>{subtitle}</div>}
      <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 700, fontSize: "30px", color: TOKENS.titleColor, margin: "0 0 8px" }}>{title}</h4>
      {description && <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "14px", color: TOKENS.textColor, maxWidth: "500px", margin: align === "center" ? "0 auto" : "0", lineHeight: "1.7" }}>{description}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */
export interface ToysProductGridProps {
  products?: ToysProduct[]; columns?: number; sectionTitle?: string;
  sectionSubtitle?: string; sectionDescription?: string;
  tabs?: string[]; maxProducts?: number; marginBottom?: string;
}

export function ToysProductGrid({
  products: propProducts, columns = 4, sectionTitle, sectionSubtitle,
  sectionDescription, tabs, maxProducts = 8, marginBottom = "60px",
}: ToysProductGridProps) {
  const storeCtx = useContext(ToysStoreContext);
  const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";
  const defaultTabs = tabs || [];
  const [activeTab, setActiveTab] = useState(0);

  const defaultProducts: ToysProduct[] = [
    { id: 1, name: "Accumsan imperdiet nisi", slug: "accumsan-imperdiet", price: "229.00", image: `${IMG}/2018/02/v-toy-product-3-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 2, name: "Consecter adipiscing auctor", slug: "consecter-adipiscing", price: "209.00", image: `${IMG}/2018/02/v-toy-product-4-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 3, name: "Convallis tellus dunt", slug: "convallis-tellus", price: "239.00", image: `${IMG}/2018/02/v-toy-product-20-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 4, name: "Elementum quam ligula", slug: "elementum-quam", price: "249.00", image: `${IMG}/2018/02/v-toy-product-19-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 5, name: "Libero malesuada justo", slug: "libero-malesuada", price: "249.00", image: `${IMG}/2018/02/v-toy-product-8-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 6, name: "Porttitor tincidunt sed", slug: "porttitor-tincidunt", price: "189.00", image: `${IMG}/2018/02/v-toy-product-6-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 7, name: "Praesent sapassa magna", slug: "praesent-sapassa", price: "219.00", image: `${IMG}/2018/02/v-toy-product-2-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
    { id: 8, name: "Sollicitudin tempus eget", slug: "sollicitudin-tempus", price: "259.00", image: `${IMG}/2018/02/v-toy-product-18-opt-430x516.jpg`, category: "Kids Toys", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .ty-products { margin-bottom: ${marginBottom}; }
    .ty-tabs { display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; }
    .ty-tab { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 14px; color: ${TOKENS.textColor}; background: none; border: 2px solid #eee; cursor: pointer; padding: 8px 20px; border-radius: 25px; transition: all 0.3s; text-transform: capitalize; }
    .ty-tab.ty-active { color: #fff; background: ${TOKENS.primaryColor}; border-color: ${TOKENS.primaryColor}; }
    .ty-prod-grid { display: grid; gap: 20px; }
    .ty-prod { background: #fff; border-radius: ${TOKENS.borderRadius}; overflow: hidden; border: 1px solid #f0f0f0; transition: box-shadow 0.3s; text-align: center; }
    .ty-prod:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .ty-prod-img-wrap { position: relative; overflow: hidden; background: #fafafa; }
    .ty-prod-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .ty-prod:hover .ty-prod-img { transform: scale(1.05); }
    .ty-prod-info { padding: 15px; }
    .ty-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.titleColor}; margin: 0 0 5px; }
    .ty-prod-name a { color: inherit; text-decoration: none; }
    .ty-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 6px; }
    .ty-prod-price { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px; color: ${TOKENS.primaryColor}; }
    .ty-prod-btn { display: inline-block; margin-top: 10px; padding: 8px 22px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 12px; border: none; cursor: pointer; border-radius: 25px; transition: background 0.3s; text-transform: uppercase; }
    .ty-prod-btn:hover { background: #e55555; }
    @media (max-width: 1024px) { .ty-prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .ty-prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  `;

  return (
    <div className="ty-products">
      <ScopedStyles id="products" css={css} />
      <div style={containerStyle}>
        {sectionTitle && <ToysSectionTitle subtitle={sectionSubtitle} title={sectionTitle} description={sectionDescription} />}
        {defaultTabs.length > 0 && (
          <div className="ty-tabs">
            {defaultTabs.map((tab, i) => <button key={i} className={`ty-tab ${i === activeTab ? "ty-active" : ""}`} onClick={() => setActiveTab(i)}>{tab}</button>)}
          </div>
        )}
        <div className="ty-prod-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="ty-prod">
              <div className="ty-prod-img-wrap">
                <img className="ty-prod-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              </div>
              <div className="ty-prod-info">
                <h3 className="ty-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
                <div className="ty-prod-cat">{p.category}</div>
                <div className="ty-prod-price">${p.price}</div>
                <button className="ty-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. LIMITED TIME OFFER (countdown)
   ═══════════════════════════════════════════════════════════════ */
export interface ToysLimitedOfferProps {
  subtitle?: string; title?: string; description?: string;
  productImage?: string; ctaText?: string; ctaLink?: string;
  endDate?: string;
}

export function ToysLimitedOffer({
  subtitle = "Don't miss your chance",
  title = "Limited Time Offer",
  description = "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of lorem ipsum, you need to be sure.",
  productImage = `${IMG}/2018/02/v-toy-product-left.png`,
  ctaText = "Buy now",
  ctaLink = "#",
  endDate,
}: ToysLimitedOfferProps) {
  const storeCtx = useContext(ToysStoreContext);
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setCountdown({
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const css = `
    .ty-offer { background: ${TOKENS.bgLight}; padding: 60px 0; margin-bottom: 60px; }
    .ty-offer-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
    .ty-offer-img { max-width: 400px; }
    .ty-offer-img img { width: 100%; height: auto; }
    .ty-offer-sub { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .ty-offer-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 32px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .ty-offer-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.8; color: ${TOKENS.textColor}; margin-bottom: 25px; }
    .ty-countdown { display: flex; gap: 15px; margin-bottom: 25px; }
    .ty-cd-item { text-align: center; }
    .ty-cd-num { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px; color: ${TOKENS.primaryColor}; display: block; }
    .ty-cd-label { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; text-transform: uppercase; }
    .ty-offer-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 13px; text-decoration: none; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; margin-right: 15px; }
    .ty-offer-btn:hover { background: #e55555; }
    .ty-offer-link { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; text-decoration: underline; }
    @media (max-width: 767px) { .ty-offer-inner { grid-template-columns: 1fr; } .ty-offer-img { max-width: 250px; margin: 0 auto; } }
  `;

  return (
    <div className="ty-offer">
      <ScopedStyles id="offer" css={css} />
      <div style={containerStyle}>
        <div className="ty-offer-inner">
          <div className="ty-offer-img">
            <img src={productImage} alt={title} onError={(e) => onImgError(e, title)} />
          </div>
          <div>
            <div className="ty-offer-sub">{subtitle}</div>
            <h3 className="ty-offer-title">{title}</h3>
            <p className="ty-offer-desc">{description}</p>
            <div className="ty-countdown">
              {[
                { num: countdown.days, label: "days" },
                { num: countdown.hrs, label: "hr" },
                { num: countdown.mins, label: "min" },
                { num: countdown.secs, label: "sc" },
              ].map((item) => (
                <div key={item.label} className="ty-cd-item">
                  <span className="ty-cd-num">{String(item.num).padStart(2, "0")}</span>
                  <span className="ty-cd-label">{item.label}</span>
                </div>
              ))}
            </div>
            <Link href={resolveStoreLink(ctaLink, storeCtx?.storeSlug)} className="ty-offer-btn">{ctaText}</Link>
            <Link href={resolveStoreLink("#", storeCtx?.storeSlug)} className="ty-offer-link">View more</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. CUSTOMER REVIEWS / TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */
export interface ToysTestimonial {
  text: string; avatar: string; name?: string;
}

export interface ToysTestimonialsProps {
  subtitle?: string; title?: string; testimonials?: ToysTestimonial[];
}

export function ToysTestimonials({
  subtitle = "Check our latest",
  title = "Customer Reviews",
  testimonials,
}: ToysTestimonialsProps) {
  const defaultTestimonials: ToysTestimonial[] = [
    { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: `${IMG}/2018/02/v-toys-testimon-100x100.jpg` },
    { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: `${IMG}/2018/02/v-toy-testimonials-portrait-2-100x100.jpg` },
    { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: `${IMG}/2018/02/v-toy-testimonials-portrait-3-100x100.jpg` },
  ];
  const items = testimonials || defaultTestimonials;

  const css = `
    .ty-reviews { margin-bottom: 60px; }
    .ty-reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
    .ty-review { background: #fff; border: 1px solid #f0f0f0; border-radius: ${TOKENS.borderRadius}; padding: 30px; text-align: center; }
    .ty-review-avatar { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px; }
    .ty-review-text { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.8; color: ${TOKENS.textColor}; font-style: italic; }
    .ty-review-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 14px; color: ${TOKENS.titleColor}; margin-top: 12px; }
    @media (max-width: 767px) { .ty-reviews-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="ty-reviews">
      <ScopedStyles id="reviews" css={css} />
      <div style={containerStyle}>
        <ToysSectionTitle subtitle={subtitle} title={title} />
        <div className="ty-reviews-grid">
          {items.map((r, i) => (
            <div key={i} className="ty-review">
              <img className="ty-review-avatar" src={r.avatar} alt={r.name || `Review ${i + 1}`} onError={(e) => onImgError(e, "Review")} />
              <p className="ty-review-text">{r.text}</p>
              {r.name && <div className="ty-review-name">{r.name}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */
export interface ToysNewsletterProps {
  title?: string; buttonText?: string;
}

export function ToysNewsletter({
  title = "Join our mailing list to receive any latest updates and promotions",
  buttonText = "Subscribe",
}: ToysNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(ToysStoreContext);
  const { subscribe, status } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  const css = `
    .ty-newsletter { background: ${TOKENS.primaryColor}; padding: 45px 0; margin-bottom: 0; }
    .ty-nl-inner { display: flex; align-items: center; justify-content: space-between; gap: 30px; flex-wrap: wrap; }
    .ty-nl-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 20px; color: #fff; margin: 0; flex: 1; min-width: 280px; }
    .ty-nl-form { display: flex; gap: 0; flex: 1; max-width: 450px; }
    .ty-nl-input { flex: 1; padding: 14px 18px; border: none; border-radius: 30px 0 0 30px; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; }
    .ty-nl-btn { padding: 14px 28px; background: #333; color: #fff; font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 13px; border: none; cursor: pointer; border-radius: 0 30px 30px 0; text-transform: uppercase; transition: background 0.3s; }
    .ty-nl-btn:hover { background: #111; }
    @media (max-width: 767px) { .ty-nl-inner { flex-direction: column; text-align: center; } .ty-nl-form { max-width: 100%; width: 100%; } }
  `;

  return (
    <div className="ty-newsletter">
      <ScopedStyles id="newsletter" css={css} />
      <div style={containerStyle}>
        <div className="ty-nl-inner">
          <h4 className="ty-nl-title">{title}</h4>
          {status === "success" ? (
            <div style={{ color: "#fff", fontFamily: TOKENS.bodyFont, fontSize: "16px" }}>✓ Thank you for subscribing!</div>
          ) : (
            <form className="ty-nl-form" onSubmit={(e) => { e.preventDefault(); subscribe(email).then(() => setEmail("")); }}>
              <input className="ty-nl-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
              <button className="ty-nl-btn" type="submit" disabled={status === "loading"}>{status === "loading" ? "..." : buttonText}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
export function ToysFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(ToysStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
