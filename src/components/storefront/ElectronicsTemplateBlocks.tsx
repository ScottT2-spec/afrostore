"use client";
import { useState, useEffect, useRef, createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════════════════
   ELECTRONICS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Electronics template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

const TOKENS = {
  primaryColor: "#007bc4",
  primaryHover: "#006aaa",
  altColor: "#fbbc34",
  titleColor: "#242424",
  textColor: "#767676",
  entityTitleColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#0a0a0a",
  containerWidth: "1222px",
  titleFont: "'Poppins', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function ElectronicsFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lato:wght@400;700&display=swap');
    `}} />
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px",
  boxSizing: "border-box" as const, width: "100%",
};

function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-elec-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ═══════════════════════════════════════════════════════════════
   STORE CONTEXT
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsProduct {
  id: number; name: string; slug: string; price: string; comparePrice?: string;
  image: string; hoverImage?: string; category: string; rating?: number;
  badge?: string; tags?: string[];
}

export interface ElectronicsStoreContextData {
  storeSlug?: string; products?: ElectronicsProduct[]; storeName?: string;
  storeLogo?: string; contactEmail?: string; contactPhone?: string;
  socialLinks?: { platform: string; url: string }[];
  footerLinks?: { title: string; links: { label: string; href: string }[] }[];
}

export const ElectronicsStoreContext = createContext<ElectronicsStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsHeroSlide {
  subtitle?: string;
  titleLine1: string;
  titleLine2?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  image: string;
  textColor?: string;
}

export interface ElectronicsHeroSliderProps {
  slides?: ElectronicsHeroSlide[];
  autoplaySpeed?: number;
}

export function ElectronicsHeroSlider({ slides, autoplaySpeed = 5000 }: ElectronicsHeroSliderProps) {
  const storeCtx = useContext(ElectronicsStoreContext);
  const fixLink = (link: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/shop`;
    return link || "#";
  };

  const defaultSlides: ElectronicsHeroSlide[] = [
    {
      subtitle: "WEBCAMS 2024",
      titleLine1: "Pro Stream",
      titleLine2: "Webcam HD",
      buttonText: "Shop Now",
      buttonLink: "#",
      backgroundColor: "rgb(242,242,242)",
      image: `${IMG}/2021/06/w-electronic-slide-1.jpg`,
    },
    {
      subtitle: "LEATHER CASES",
      titleLine1: "Premium Cases",
      titleLine2: "For All Devices",
      buttonText: "Shop Now",
      buttonLink: "#",
      backgroundColor: "rgb(242,242,242)",
      image: `${IMG}/2022/06/electro-banner.jpg`,
    },
    {
      subtitle: "NEW ARRIVAL",
      titleLine1: "Next-Gen",
      titleLine2: "Gaming Gear",
      buttonText: "Shop Now",
      buttonLink: "#",
      backgroundColor: "rgb(0,0,0)",
      image: `${IMG}/2022/06/electro-banner3.jpg`,
      textColor: "#fff",
    },
  ];

  const items = slides || defaultSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % items.length), autoplaySpeed);
    return () => clearInterval(t);
  }, [items.length, autoplaySpeed]);

  const css = `
    .el-slider { position: relative; width: 100%; min-height: 500px; overflow: hidden; }
    .el-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .el-slide.el-active { opacity: 1; position: relative; }
    .el-slide-inner { width: 100%; display: flex; align-items: center; min-height: 500px; }
    .el-slide-text { flex: 1; padding: 60px 0 60px 80px; z-index: 2; }
    .el-slide-subtitle { font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px; opacity: 0.7; }
    .el-slide-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 56px; line-height: 1.15; margin: 0 0 25px; }
    .el-slide-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; border-radius: 0; }
    .el-slide-btn:hover { background: ${TOKENS.primaryHover}; }
    .el-slide-img { flex: 1; height: 500px; overflow: hidden; }
    .el-slide-img img { width: 100%; height: 100%; object-fit: cover; }
    .el-dots { position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 5; }
    .el-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid ${TOKENS.primaryColor}; background: transparent; cursor: pointer; padding: 0; transition: all 0.3s; }
    .el-dot.el-active { background: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .el-slide-title { font-size: 40px; } .el-slide-text { padding-left: 40px; } }
    @media (max-width: 767px) { .el-slide-title { font-size: 32px; } .el-slide-img { display: none; } .el-slide-text { padding: 40px 20px; } .el-slider { min-height: 350px; } .el-slide-inner { min-height: 350px; } }
  `;

  return (
    <div className="el-slider">
      <ScopedStyles id="hero" css={css} />
      {items.map((slide, i) => (
        <div key={i} className={`el-slide ${i === current ? "el-active" : ""}`} style={{ backgroundColor: slide.backgroundColor }}>
          <div className="el-slide-inner">
            <div className="el-slide-text">
              {slide.subtitle && <div className="el-slide-subtitle" style={{ color: slide.textColor || TOKENS.titleColor }}>{slide.subtitle}</div>}
              <h2 className="el-slide-title" style={{ color: slide.textColor || TOKENS.titleColor }}>{slide.titleLine1}{slide.titleLine2 && <><br />{slide.titleLine2}</>}</h2>
              <a href={fixLink(slide.buttonLink)} className="el-slide-btn">{slide.buttonText}</a>
            </div>
            <div className="el-slide-img">
              <img src={slide.image} alt={slide.titleLine1} />
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="el-dots">
          {items.map((_, i) => (
            <button key={i} className={`el-dot ${i === current ? "el-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export function ElectronicsSectionTitle({ title, align = "center" }: { title: string; align?: "left" | "center" | "right" }) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "25px" }}>
      <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 700, fontSize: "20px", color: TOKENS.titleColor, margin: 0, textTransform: "uppercase" as const, letterSpacing: "1px" }}>{title}</h4>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PROMO BANNERS (4-grid: Monster Beats, iPhone, Music, iWatch)
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsBanner {
  subtitle: string;
  title: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  textColor?: string;
}

export interface ElectronicsBannerGridProps {
  banners?: ElectronicsBanner[];
}

export function ElectronicsBannerGrid({ banners }: ElectronicsBannerGridProps) {
  const defaultBanners: ElectronicsBanner[] = [
    { subtitle: "NEW TECHNOLOGIES", title: "Monster Beats\nHeadphones", image: `${IMG}/2022/06/electro-banner1-2.jpg`, buttonText: "Shop Now" },
    { subtitle: "APPLE ACCESSORIES", title: "Apple iPhone 7\nColor Red", image: `${IMG}/2022/06/electro-banner1-32.jpg`, buttonText: "Shop Now" },
    { subtitle: "Hich Tech News", title: "Music Makes\nFeel Better", image: `${IMG}/2022/06/electro-banner10.jpg`, buttonText: "Shop Now", textColor: "#fff" },
    { subtitle: "Health & Fit", title: "Apple iWatch Nike Edition", image: `${IMG}/2022/06/electro-banner11.jpg`, buttonText: "Shop Now" },
  ];

  const items = banners || defaultBanners;

  const css = `
    .el-banner-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; margin-bottom: 60px; }
    .el-banner-grid .el-banner:first-child { grid-row: 1 / 3; }
    .el-banner { position: relative; overflow: hidden; cursor: pointer; min-height: 240px; }
    .el-banner-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; position: absolute; inset: 0; }
    .el-banner:hover .el-banner-img { transform: scale(1.05); }
    .el-banner-content { position: relative; z-index: 2; padding: 30px; }
    .el-banner-sub { font-family: ${TOKENS.bodyFont}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; opacity: 0.7; }
    .el-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 24px; line-height: 1.3; margin: 0 0 15px; white-space: pre-line; }
    .el-banner-btn { display: inline-block; padding: 10px 22px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
    .el-banner-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 767px) { .el-banner-grid { grid-template-columns: 1fr; grid-template-rows: auto; } .el-banner-grid .el-banner:first-child { grid-row: auto; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="banners" css={css} />
      <div className="el-banner-grid">
        {items.map((b, i) => (
          <div key={i} className="el-banner">
            <img className="el-banner-img" src={b.image} alt={b.title} />
            <div className="el-banner-content">
              <div className="el-banner-sub" style={{ color: b.textColor || TOKENS.titleColor }}>{b.subtitle}</div>
              <h4 className="el-banner-title" style={{ color: b.textColor || TOKENS.titleColor }}>{b.title}</h4>
              {b.buttonText && <a href={b.buttonLink || "#"} className="el-banner-btn">{b.buttonText}</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsProductGridProps {
  products?: ElectronicsProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
}

export function ElectronicsProductGrid({
  products: propProducts,
  columns = 4,
  sectionTitle = "FEATURED PRODUCTS",
  marginBottom = "60px",
  maxProducts = 8,
}: ElectronicsProductGridProps) {
  const storeCtx = useContext(ElectronicsStoreContext);
  const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";

  const defaultProducts: ElectronicsProduct[] = [
    { id: 1, name: "Google Pixel Blue", slug: "google-pixel-blue", price: "159.00", image: `${IMG}/2017/04/Product-3-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-3-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 2, name: "iPhone Red 128GB", slug: "iphone-red", price: "159.00", image: `${IMG}/2017/04/Product-5-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-5-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 3, name: "Microsoft Xbox One S", slug: "xbox-one-s", price: "159.00", image: `${IMG}/2017/04/Product-6-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-6-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 4, name: "Samsung Galaxy S8", slug: "samsung-galaxy-s8", price: "159.00", image: `${IMG}/2017/04/Product-4-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-4-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 5, name: "Samsung Gear 360", slug: "samsung-gear-360", price: "159.00", image: `${IMG}/2017/04/Product-7-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-7-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 6, name: "Apple Watch Stainless Steel", slug: "apple-watch", price: "159.00", image: `${IMG}/2017/04/Product-9-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-9-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 7, name: "Pro Stream Webcam", slug: "pro-stream-webcam", price: "159.00", image: `${IMG}/2017/04/Product-11-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-11-2-430x491.jpg`, category: "Electronics", rating: 5 },
    { id: 8, name: "Artemis Spectrum G98", slug: "artemis-spectrum", price: "159.00", image: `${IMG}/2017/04/Product-12-1-430x491.jpg`, hoverImage: `${IMG}/2017/04/Product-12-2-430x491.jpg`, category: "Electronics", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const css = `
    .el-products { margin-bottom: ${marginBottom}; }
    .el-prod-grid { display: grid; gap: 20px; }
    .el-prod { background: #fff; border: 1px solid #eee; overflow: hidden; transition: box-shadow 0.3s; position: relative; text-align: center; }
    .el-prod:hover { box-shadow: 0 5px 25px rgba(0,0,0,0.1); }
    .el-prod-img-wrap { position: relative; overflow: hidden; background: #f9f9f9; height: 280px; }
    .el-prod-img { width: 100%; height: 100%; object-fit: contain; display: block; transition: opacity 0.4s; padding: 15px; }
    .el-prod-info { padding: 12px 15px 20px; }
    .el-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 11px; color: ${TOKENS.textColor}; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .el-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 14px; color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; }
    .el-prod-name a { color: inherit; text-decoration: none; }
    .el-prod-name a:hover { color: rgba(51,51,51,0.65); }
    .el-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 15px; color: ${TOKENS.titleColor}; }
    .el-prod-stars { color: ${TOKENS.starColor}; font-size: 11px; letter-spacing: 1px; margin-bottom: 4px; }
    .el-prod-btn { display: inline-block; margin-top: 8px; padding: 8px 20px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 11px; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; }
    .el-prod-btn:hover { background: ${TOKENS.primaryHover}; }
    .el-prod-badge { position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 11px; font-weight: 700; padding: 3px 10px; text-transform: uppercase; z-index: 2; }
    @media (max-width: 1024px) { .el-prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .el-prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  `;

  return (
    <div className="el-products">
      <ScopedStyles id="products" css={css} />
      <div style={containerStyle}>
        {sectionTitle && <ElectronicsSectionTitle title={sectionTitle} />}
        <div className="el-prod-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="el-prod" onMouseEnter={() => setHoveredId(p.id)} onMouseLeave={() => setHoveredId(null)}>
              {p.badge && <span className="el-prod-badge">{p.badge}</span>}
              <div className="el-prod-img-wrap">
                <img className="el-prod-img" src={hoveredId === p.id && p.hoverImage ? p.hoverImage : p.image} alt={p.name} />
              </div>
              <div className="el-prod-info">
                <div className="el-prod-cat">{p.category}</div>
                <h3 className="el-prod-name"><a href={fixLink(p.slug)}>{p.name}</a></h3>
                <div className="el-prod-stars">{"★".repeat(p.rating || 5)}{"☆".repeat(5 - (p.rating || 5))}</div>
                <div className="el-prod-price">${p.price}</div>
                <button className="el-prod-btn">Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. HOT DEALS (countdown timer)
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsHotDealsProps {
  sectionTitle?: string;
  products?: ElectronicsProduct[];
  endDate?: Date;
  backgroundImage?: string;
}

export function ElectronicsHotDeals({
  sectionTitle = "TODAY HOT DEALS",
  products,
  endDate,
  backgroundImage = `${IMG}/2022/06/bg-electro.jpg`,
}: ElectronicsHotDealsProps) {
  const target = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const defaultProducts: ElectronicsProduct[] = [
    { id: 51, name: "iPhone Red 128GB", slug: "iphone-red-deal", price: "159.00", comparePrice: "199.00", image: `${IMG}/2017/04/Product-5-1-430x491.jpg`, category: "Electronics", rating: 5, badge: "SALE" },
    { id: 52, name: "Microsoft Xbox One S", slug: "xbox-deal", price: "159.00", comparePrice: "199.00", image: `${IMG}/2017/04/Product-6-1-430x491.jpg`, category: "Electronics", rating: 5, badge: "SALE" },
    { id: 53, name: "Artemis Spectrum G98", slug: "artemis-deal", price: "99.00", comparePrice: "159.00", image: `${IMG}/2017/04/Product-12-1-430x491.jpg`, category: "Electronics", rating: 5, badge: "SALE" },
  ];

  const items = products || defaultProducts;

  const css = `
    .el-hotdeals { background-image: url(${backgroundImage}); background-size: cover; background-position: center; padding: 60px 0; margin-bottom: 60px; }
    .el-countdown { display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; }
    .el-countdown-item { text-align: center; min-width: 70px; }
    .el-countdown-num { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px; color: #fff; display: block; }
    .el-countdown-label { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; }
    .el-hotdeals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .el-hotdeal-card { background: #fff; text-align: center; padding: 20px; position: relative; }
    .el-hotdeal-img { width: 200px; height: 200px; object-fit: contain; margin: 0 auto 15px; display: block; }
    .el-hotdeal-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; }
    .el-hotdeal-price { font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 16px; color: ${TOKENS.primaryColor}; }
    .el-hotdeal-price del { color: ${TOKENS.textColor}; font-weight: 400; font-size: 14px; margin-right: 8px; }
    .el-hotdeal-stars { color: ${TOKENS.starColor}; font-size: 11px; letter-spacing: 1px; margin-bottom: 5px; }
    .el-hotdeal-badge { position: absolute; top: 10px; left: 10px; background: #e74c3c; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 11px; font-weight: 700; padding: 3px 10px; }
    @media (max-width: 767px) { .el-hotdeals-grid { grid-template-columns: 1fr; } .el-countdown-num { font-size: 28px; } }
  `;

  return (
    <div className="el-hotdeals">
      <ScopedStyles id="hotdeals" css={css} />
      <div style={containerStyle}>
        <ElectronicsSectionTitle title={sectionTitle} />
        <div className="el-countdown">
          {[
            { val: timeLeft.days, label: "Days" },
            { val: timeLeft.hours, label: "Hours" },
            { val: timeLeft.minutes, label: "Mins" },
            { val: timeLeft.seconds, label: "Secs" },
          ].map((t, i) => (
            <div key={i} className="el-countdown-item">
              <span className="el-countdown-num">{String(t.val).padStart(2, "0")}</span>
              <span className="el-countdown-label">{t.label}</span>
            </div>
          ))}
        </div>
        <div className="el-hotdeals-grid">
          {items.map((p) => (
            <div key={p.id} className="el-hotdeal-card">
              {p.badge && <span className="el-hotdeal-badge">{p.badge}</span>}
              <img className="el-hotdeal-img" src={p.image} alt={p.name} />
              <div className="el-hotdeal-stars">{"★".repeat(p.rating || 5)}</div>
              <h3 className="el-hotdeal-name">{p.name}</h3>
              <div className="el-hotdeal-price">
                {p.comparePrice && <del>${p.comparePrice}</del>}
                ${p.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. DUALSHOCK BANNER (full-width with product image)
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsDualshockProps {
  subtitle?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  productImage?: string;
}

export function ElectronicsDualshock({
  subtitle = "Play The Dream",
  title = "Sony Playstation 4 Dualshok Controller",
  buttonText = "Shop Now",
  buttonLink = "#",
  backgroundImage = `${IMG}/2022/06/electro-dualshok.jpg`,
  productImage = `${IMG}/2022/06/dualshok.png`,
}: ElectronicsDualshockProps) {
  const css = `
    .el-dualshock { position: relative; min-height: 350px; background-size: cover; background-position: center; display: flex; align-items: center; margin-bottom: 60px; overflow: hidden; }
    .el-dualshock-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .el-dualshock-text { flex: 1; }
    .el-dualshock-sub { font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .el-dualshock-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px; line-height: 1.2; color: #fff; margin: 0 0 25px; max-width: 500px; }
    .el-dualshock-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px; text-decoration: none; text-transform: uppercase; transition: background 0.3s; }
    .el-dualshock-btn:hover { background: ${TOKENS.primaryHover}; }
    .el-dualshock-img { flex: 0 0 auto; max-width: 350px; }
    .el-dualshock-img img { max-width: 100%; height: auto; }
    @media (max-width: 767px) { .el-dualshock-title { font-size: 24px; } .el-dualshock-img { display: none; } }
  `;

  return (
    <div className="el-dualshock" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <ScopedStyles id="dualshock" css={css} />
      <div style={containerStyle}>
        <div className="el-dualshock-inner">
          <div className="el-dualshock-text">
            <div className="el-dualshock-sub">{subtitle}</div>
            <h4 className="el-dualshock-title">{title}</h4>
            <a href={buttonLink} className="el-dualshock-btn">{buttonText}</a>
          </div>
          <div className="el-dualshock-img">
            <img src={productImage} alt={title} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. SMART HOME BANNER (Google)
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsSmartHomeBannerProps {
  subtitle?: string;
  title?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function ElectronicsSmartHomeBanner({
  subtitle = "Hich Tech News",
  title = "Google Smart Home 2024",
  image = `${IMG}/2022/06/electro-banner3-1.jpg`,
  buttonText = "Shop Now",
  buttonLink = "#",
}: ElectronicsSmartHomeBannerProps) {
  const css = `
    .el-smarthome { position: relative; overflow: hidden; margin-bottom: 60px; min-height: 300px; }
    .el-smarthome-img { width: 100%; height: 300px; object-fit: cover; display: block; }
    .el-smarthome-content { position: absolute; inset: 0; display: flex; align-items: center; padding: 0 60px; }
    .el-smarthome-sub { font-family: ${TOKENS.bodyFont}; font-size: 12px; font-weight: 700; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .el-smarthome-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 32px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .el-smarthome-btn { display: inline-block; padding: 12px 28px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px; text-decoration: none; text-transform: uppercase; transition: background 0.3s; }
    .el-smarthome-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 767px) { .el-smarthome-title { font-size: 24px; } .el-smarthome-content { padding: 0 20px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="smarthome" css={css} />
      <div className="el-smarthome">
        <img className="el-smarthome-img" src={image} alt={title} />
        <div className="el-smarthome-content">
          <div>
            <div className="el-smarthome-sub">{subtitle}</div>
            <h4 className="el-smarthome-title">{title}</h4>
            <a href={buttonLink} className="el-smarthome-btn">{buttonText}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsBlogPost {
  title: string; image: string; date?: string; link?: string;
}

export interface ElectronicsBlogPostsProps {
  posts?: ElectronicsBlogPost[];
  columns?: number;
  sectionTitle?: string;
}

export function ElectronicsBlogPosts({ posts, columns = 5, sectionTitle = "INNOVATIVE GADGETS" }: ElectronicsBlogPostsProps) {
  const defaultPosts: ElectronicsBlogPost[] = [
    { title: "Collar brings back coffee brewing ritual", image: `${IMG}/2022/06/electro-blog1.jpg`, date: "June 15, 2022" },
    { title: "Exterior ideas: 10 colored garden seats", image: `${IMG}/2022/06/electro-blog2.jpg`, date: "June 15, 2022" },
    { title: "Exploring Atlanta's modern homes", image: `${IMG}/2022/06/electro-blog3.jpg`, date: "June 15, 2022" },
    { title: "New home decor from John Doerson", image: `${IMG}/2022/06/electro-blog4.jpg`, date: "June 15, 2022" },
    { title: "The big design: Wall likes pictures", image: `${IMG}/2022/06/electro-blog5.jpg`, date: "June 15, 2022" },
  ];

  const items = posts || defaultPosts;

  const css = `
    .el-blog { margin-bottom: 60px; }
    .el-blog-grid { display: grid; gap: 20px; }
    .el-blog-card { overflow: hidden; }
    .el-blog-img-wrap { overflow: hidden; }
    .el-blog-img { width: 100%; height: 180px; object-fit: cover; display: block; transition: transform 0.5s; }
    .el-blog-card:hover .el-blog-img { transform: scale(1.05); }
    .el-blog-content { padding: 15px 0; }
    .el-blog-date { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 6px; }
    .el-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 14px; line-height: 1.4; color: ${TOKENS.entityTitleColor}; margin: 0; cursor: pointer; }
    .el-blog-title:hover { color: rgba(51,51,51,0.65); }
    @media (max-width: 1024px) { .el-blog-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .el-blog-grid { grid-template-columns: 1fr !important; } }
  `;

  return (
    <div className="el-blog">
      <ScopedStyles id="blog" css={css} />
      <div style={containerStyle}>
        <ElectronicsSectionTitle title={sectionTitle} />
        <div className="el-blog-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((post, i) => (
            <div key={i} className="el-blog-card">
              <div className="el-blog-img-wrap">
                <img className="el-blog-img" src={post.image} alt={post.title} />
              </div>
              <div className="el-blog-content">
                {post.date && <div className="el-blog-date">{post.date}</div>}
                <h3 className="el-blog-title">{post.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. PARTNERS / BRANDS BAR
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsBrandsBarProps {
  brands?: { name: string; logo: string }[];
}

export function ElectronicsBrandsBar({ brands }: ElectronicsBrandsBarProps) {
  const defaultBrands = [
    { name: "Joseph Joseph", logo: `${IMG}/2016/09/brand-Joseph-Joseph.png` },
    { name: "Louis Poulsen", logo: `${IMG}/2016/09/brand-Louis-Poulsen.png` },
    { name: "Magisso", logo: `${IMG}/2016/09/brand-Magisso.png` },
    { name: "PackIt", logo: `${IMG}/2016/09/brand-PackIt.png` },
    { name: "Rosenthal", logo: `${IMG}/2016/09/brand-Rosenthal.png` },
    { name: "Hay", logo: `${IMG}/2016/09/brand-hay.png` },
    { name: "Witra", logo: `${IMG}/2016/09/brand-witra.png` },
  ];

  const items = brands || defaultBrands;

  const css = `
    .el-brands { padding: 40px 0; margin-bottom: 60px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .el-brands-grid { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .el-brand { opacity: 0.4; transition: opacity 0.3s; cursor: pointer; }
    .el-brand:hover { opacity: 1; }
    .el-brand img { height: 30px; width: auto; }
    @media (max-width: 767px) { .el-brands-grid { justify-content: center; } }
  `;

  return (
    <div className="el-brands">
      <ScopedStyles id="brands" css={css} />
      <div style={containerStyle}>
        <div className="el-brands-grid">
          {items.map((brand, i) => (
            <div key={i} className="el-brand">
              <img src={brand.logo} alt={brand.name} />
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

export interface ElectronicsNewsletterProps {
  title?: string;
  buttonText?: string;
  backgroundImage?: string;
}

export function ElectronicsNewsletter({
  title = "HEY YOU, SIGN UP AND CONNECT TO WOODMART!",
  buttonText = "Sign up",
  backgroundImage = `${IMG}/2017/01/newsletter-wood-3.jpg`,
}: ElectronicsNewsletterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const css = `
    .el-newsletter { position: relative; padding: 60px 0; margin-bottom: 0; background-size: cover; background-position: center; }
    .el-newsletter-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
    .el-newsletter-content { position: relative; z-index: 2; text-align: center; }
    .el-newsletter-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; color: #fff; margin: 0 0 25px; text-transform: uppercase; }
    .el-newsletter-form { display: flex; gap: 0; max-width: 500px; margin: 0 auto; }
    .el-newsletter-input { flex: 1; padding: 14px 18px; border: none; background: rgba(255,255,255,0.15); color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; }
    .el-newsletter-input::placeholder { color: rgba(255,255,255,0.6); }
    .el-newsletter-btn { padding: 14px 30px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px; border: none; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
    .el-newsletter-btn:hover { background: ${TOKENS.primaryHover}; }
    .el-newsletter-ok { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: #fff; }
    @media (max-width: 767px) { .el-newsletter-title { font-size: 22px; } .el-newsletter-form { flex-direction: column; } }
  `;

  return (
    <div className="el-newsletter" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="el-newsletter-overlay" />
      <ScopedStyles id="newsletter" css={css} />
      <div style={containerStyle}>
        <div className="el-newsletter-content">
          <h2 className="el-newsletter-title">{title}</h2>
          {!submitted ? (
            <form className="el-newsletter-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <input className="el-newsletter-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
              <button className="el-newsletter-btn" type="submit">{buttonText}</button>
            </form>
          ) : (
            <div className="el-newsletter-ok">✓ Thank you for subscribing!</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. FOOTER
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsFooterProps {
  logo?: string;
  description?: string;
  columns?: { title: string; links: { label: string; href: string }[] }[];
  paymentImage?: string;
  copyright?: string;
}

export function ElectronicsFooter({
  logo = `${IMG}/2018/09/wood-logo-dark.svg`,
  description = "The best electronics store with the latest gadgets and technology.",
  columns,
  paymentImage = `${IMG}/2018/08/payment.png`,
  copyright = "WoodMart © 2026 created by Xtemos Studio.",
}: ElectronicsFooterProps) {
  const storeCtx = useContext(ElectronicsStoreContext);

  const defaultColumns = [
    { title: "Shop", links: [
      { label: "Shop Pages", href: "#" }, { label: "Product Loop", href: "#" },
      { label: "Single Product", href: "#" }, { label: "Features", href: "#" },
    ]},
    { title: "Pages", links: [
      { label: "Blog", href: "#" }, { label: "Pages", href: "#" },
      { label: "Elements", href: "#" }, { label: "Contact", href: "#" },
    ]},
    { title: "Connect", links: [
      { label: "Facebook", href: "#" }, { label: "Instagram", href: "#" },
      { label: "Twitter", href: "#" }, { label: "YouTube", href: "#" },
    ]},
  ];

  const cols = columns || storeCtx?.footerLinks || defaultColumns;

  const css = `
    .el-footer { background: ${TOKENS.footerBg}; padding: 60px 0 30px; }
    .el-footer-grid { display: grid; grid-template-columns: 1.5fr repeat(${cols.length}, 1fr); gap: 40px; margin-bottom: 40px; }
    .el-footer-logo { height: 30px; margin-bottom: 15px; filter: brightness(0) invert(1); }
    .el-footer-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 24px; color: rgba(255,255,255,0.5); margin: 0 0 20px; }
    .el-footer-col-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px; color: #fff; margin: 0 0 15px; text-transform: uppercase; }
    .el-footer-links { list-style: none; padding: 0; margin: 0; }
    .el-footer-links li { margin-bottom: 8px; }
    .el-footer-links a { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.3s; }
    .el-footer-links a:hover { color: #fff; }
    .el-footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
    .el-footer-copyright { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: rgba(255,255,255,0.4); }
    .el-footer-payment img { height: 24px; filter: brightness(0) invert(1); }
    @media (max-width: 767px) { .el-footer-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <footer className="el-footer">
      <ScopedStyles id="footer" css={css} />
      <div style={containerStyle}>
        <div className="el-footer-grid">
          <div>
            <img className="el-footer-logo" src={storeCtx?.storeLogo || logo} alt="Logo" />
            <p className="el-footer-desc">{description}</p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <h5 className="el-footer-col-title">{col.title}</h5>
              <ul className="el-footer-links">
                {col.links.map((link, j) => (
                  <li key={j}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="el-footer-bottom">
          <span className="el-footer-copyright">{copyright}</span>
          <div className="el-footer-payment"><img src={paymentImage} alt="Payment methods" /></div>
        </div>
      </div>
    </footer>
  );
}
