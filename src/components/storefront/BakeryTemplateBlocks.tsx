"use client";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   BAKERY (SWEETS BAKERY) TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Sweets Bakery template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#fd4680",
  primaryHover: "#e23a6f",
  accentBlue: "#16527f",
  titleColor: "#16527f",
  textColor: "#777777",
  entityTitleColor: "#333333",
  linkColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#ffffff",
  bgLight: "#f4f8fb",
  bgPink: "rgb(255,215,220)",
  bgPeach: "rgb(254,214,192)",
  bgBlue: "rgb(193,228,255)",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Jost', Arial, Helvetica, sans-serif",
  scriptFont: "'Cookie', cursive",
  bodyFont: "'Jost', Arial, Helvetica, sans-serif",
};

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function BakeryFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&family=Cookie&display=swap');
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
  return <style data-bakery-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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
   STORE CONTEXT
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  tags?: string[];
}

export interface BakeryStoreContextData {
  storeSlug?: string;
  products?: BakeryProduct[];
  storeName?: string;
  storeLogo?: string;
  announcement?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: { platform: string; url: string }[];
  footerLinks?: { title: string; links: { label: string; href: string }[] }[];
}

export const BakeryStoreContext = createContext<BakeryStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. BAKERY HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryHeroSlide {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  productImage: string;
  smallImage?: string;
}

export interface BakeryHeroSliderProps {
  slides?: BakeryHeroSlide[];
  autoplaySpeed?: number;
}

export function BakeryHeroSlider({ slides, autoplaySpeed = 5000 }: BakeryHeroSliderProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultSlides: BakeryHeroSlide[] = [
    {
      subtitle: "Crispy and Delicate",
      titleLine1: "BELGIAN",
      titleLine2: "WAFFLES",
      buttonText: "Read More",
      buttonLink: "#",
      backgroundImage: `${IMG}/2024/02/sweets-bakery-slide-bg-1.jpg`,
      productImage: `${IMG}/2024/02/sweets-bakery-slide-img-1.png`,
      smallImage: `${IMG}/2024/02/sweets-bakery-slide-img-s-1.png`,
    },
    {
      subtitle: "A Tasty and Light Dessert",
      titleLine1: "ALMOND",
      titleLine2: "MAFFINS",
      buttonText: "Read More",
      buttonLink: "#",
      backgroundImage: `${IMG}/2024/02/sweets-bakery-slide-bg-2.jpg`,
      productImage: `${IMG}/2024/02/sweets-bakery-slide-img-2.png`,
      smallImage: `${IMG}/2024/02/sweets-bakery-slide-img-s-2.png`,
    },
    {
      subtitle: "It Is Worth Tasting",
      titleLine1: "DONUTS",
      titleLine2: "",
      buttonText: "Read More",
      buttonLink: "#",
      backgroundImage: `${IMG}/2024/02/sweets-bakery-slide-bg-3.jpg`,
      productImage: `${IMG}/2024/02/sweets-bakery-slide-img-3.png`,
      smallImage: `${IMG}/2024/02/sweets-bakery-slide-img-s-3.png`,
    },
  ];

  const items = slides || defaultSlides;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % items.length);
    }, autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length, autoplaySpeed]);

  const css = `
    .bk-slider { position: relative; width: 100%; min-height: 560px; overflow: hidden; }
    .bk-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .bk-slide.bk-active { opacity: 1; position: relative; }
    .bk-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .bk-slide-inner { position: relative; z-index: 2; width: 100%; display: flex; align-items: center; justify-content: space-between; }
    .bk-slide-text { flex: 1; }
    .bk-slide-subtitle { font-family: ${TOKENS.scriptFont}; font-size: 30px; color: ${TOKENS.primaryColor}; margin-bottom: 10px; }
    .bk-slide-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 72px; line-height: 1.1; color: ${TOKENS.titleColor}; margin: 0 0 20px; text-transform: uppercase; }
    .bk-slide-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; }
    .bk-slide-btn:hover { background: ${TOKENS.primaryHover}; }
    .bk-slide-img { flex: 0 0 auto; max-width: 500px; }
    .bk-slide-img img { max-width: 100%; height: auto; }
    .bk-dots { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 5; }
    .bk-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${TOKENS.primaryColor}; background: transparent; cursor: pointer; padding: 0; transition: background 0.3s; }
    .bk-dot.bk-active { background: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .bk-slide-title { font-size: 48px; } .bk-slide-img { max-width: 300px; } }
    @media (max-width: 767px) { .bk-slide-title { font-size: 36px; } .bk-slide-img { display: none; } .bk-slider { min-height: 400px; } }
  `;

  return (
    <div className="bk-slider">
      <ScopedStyles id="hero-slider" css={css} />
      {items.map((slide, i) => (
        <div key={i} className={`bk-slide ${i === current ? "bk-active" : ""}`}>
          <div className="bk-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
          <div style={containerStyle}>
            <div className="bk-slide-inner">
              <div className="bk-slide-text">
                <div className="bk-slide-subtitle">{slide.subtitle}</div>
                <h2 className="bk-slide-title">{slide.titleLine1}<br />{slide.titleLine2}</h2>
                <Link href={fixLink(slide.buttonLink)} className="bk-slide-btn">{slide.buttonText}</Link>
              </div>
              <div className="bk-slide-img">
                <img src={slide.productImage} alt={slide.titleLine1} />
              </div>
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="bk-dots">
          {items.map((_, i) => (
            <button key={i} className={`bk-dot ${i === current ? "bk-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface BakerySectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleSize?: string;
}

export function BakerySectionTitle({ subtitle, title, description, align = "center", maxWidth = "100%", titleSize = "36px" }: BakerySectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      <div style={{ maxWidth, margin: align === "center" ? "0 auto" : "0" }}>
        {subtitle && <div style={{ fontFamily: TOKENS.scriptFont, fontSize: "30px", color: TOKENS.primaryColor, marginBottom: "5px" }}>{subtitle}</div>}
        <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 600, fontSize: titleSize, lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 10px" }}>{title}</h4>
        {description && <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", lineHeight: "26px", color: TOKENS.textColor, margin: 0 }}>{description}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. CATEGORY INFOBOXES (Cupcakes, Macaroons, Cakes)
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryCategoryInfoBox {
  icon: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface BakeryCategoryInfoBoxesProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  items?: BakeryCategoryInfoBox[];
}

export function BakeryCategoryInfoBoxes({ sectionTitle = "Our Fine Home-Made Chocolate", sectionSubtitle = "Sweets Bakery", items }: BakeryCategoryInfoBoxesProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const defaultItems: BakeryCategoryInfoBox[] = [
    { icon: `${IMG}/2019/07/svg-bakery-infobox-1.svg`, title: "Cupcakes", description: "There are some redeeming factors in favor of greeking text", buttonText: "Learn More" },
    { icon: `${IMG}/2019/07/svg-bakery-infobox-2.svg`, title: "Macaroons", description: "Merely the symptom of a worse problem to consideration", buttonText: "Learn More" },
    { icon: `${IMG}/2019/07/svg-bakery-infobox-3.svg`, title: "Cakes", description: "You sculpt information, you chisel away what's not needed", buttonText: "Learn More" },
  ];

  const boxes = items || defaultItems;

  const css = `
    .bk-catbox-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 80px; }
    .bk-catbox { text-align: center; padding: 0 10%; }
    .bk-catbox-icon { width: 80px; height: 80px; margin: 0 auto 20px; }
    .bk-catbox-icon svg, .bk-catbox-icon img { width: 100%; height: 100%; fill: #fff; }
    .bk-catbox-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 26px; color: ${TOKENS.titleColor}; margin: 0 0 10px; }
    .bk-catbox-desc { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.6; color: ${TOKENS.textColor}; margin: 0 0 15px; }
    .bk-catbox-btn { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor}; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
    .bk-catbox-btn:hover { opacity: 0.7; }
    @media (max-width: 767px) { .bk-catbox-grid { grid-template-columns: 1fr; } .bk-catbox { padding: 0; } }
  `;

  return (
    <div style={containerStyle}>
      <BakerySectionTitle subtitle={sectionSubtitle} title={sectionTitle} />
      <ScopedStyles id="catbox" css={css} />
      <div className="bk-catbox-grid">
        {boxes.map((box, i) => (
          <div key={i} className="bk-catbox">
            <div className="bk-catbox-icon"><img src={box.icon} alt={box.title} /></div>
            <h4 className="bk-catbox-title">{box.title}</h4>
            <p className="bk-catbox-desc">{box.description}</p>
            {box.buttonText && <Link href={resolveStoreLink(box.buttonLink || "#", storeCtx?.storeSlug)} className="bk-catbox-btn">{box.buttonText} →</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. HANDMADE CAKES SPLIT SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryHandmadeProps {
  subtitle?: string;
  title?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function BakeryHandmade({
  subtitle = "Sweets Bakery",
  title = "Handmade Cakes\nFor Your Every Taste",
  description = "We bake with love using the finest ingredients for a taste you'll never forget.",
  image = `${IMG}/2019/07/bakery-cyan-cake-opt.jpg`,
  buttonText = "Shop Now",
  buttonLink = "#",
}: BakeryHandmadeProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const css = `
    .bk-handmade { display: flex; align-items: center; gap: 60px; margin-bottom: 80px; }
    .bk-handmade-img { flex: 1; border-radius: 10px; overflow: hidden; }
    .bk-handmade-img img { width: 100%; height: auto; display: block; }
    .bk-handmade-content { flex: 1; }
    .bk-handmade-subtitle { font-family: ${TOKENS.scriptFont}; font-size: 30px; color: ${TOKENS.primaryColor}; margin-bottom: 5px; }
    .bk-handmade-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 42px; line-height: 52px; color: ${TOKENS.titleColor}; margin: 0 0 20px; white-space: pre-line; }
    .bk-handmade-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px; color: ${TOKENS.textColor}; margin: 0 0 25px; }
    .bk-handmade-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
    .bk-handmade-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 767px) { .bk-handmade { flex-direction: column; gap: 30px; } .bk-handmade-title { font-size: 28px; line-height: 38px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="handmade" css={css} />
      <div className="bk-handmade">
        <div className="bk-handmade-img"><img src={image} alt="Handmade Cakes" /></div>
        <div className="bk-handmade-content">
          <div className="bk-handmade-subtitle">{subtitle}</div>
          <h4 className="bk-handmade-title">{title}</h4>
          <p className="bk-handmade-desc">{description}</p>
          <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="bk-handmade-btn">{buttonText}</Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryProductGridProps {
  products?: BakeryProduct[];
  columns?: number;
  sectionTitle?: string;
  sectionSubtitle?: string;
  marginBottom?: string;
  maxProducts?: number;
  backgroundImage?: string;
}

export function BakeryProductGrid({
  products: propProducts,
  columns = 3,
  sectionTitle = "Featured Products",
  sectionSubtitle = "Sweets Bakery",
  marginBottom = "80px",
  maxProducts = 6,
  backgroundImage = `${IMG}/2019/07/bakery-product-bg-opt.jpg`,
}: BakeryProductGridProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const fixLink = (slug: string) => {
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/product/${slug}`;
    return `#`;
  };

  const defaultProducts: BakeryProduct[] = [
    { id: 1, name: "White Cake", slug: "white-cake", price: "199.00", image: `${IMG}/2019/07/prod-1-opt-430x468.jpg`, category: "Sweets Bakery", rating: 5 },
    { id: 2, name: "Raspberry Pie", slug: "raspberry-pie", price: "119.00", image: `${IMG}/2019/07/prod-2-opt-430x468.jpg`, category: "Sweets Bakery", rating: 5 },
    { id: 3, name: "Chocolat Cake", slug: "chocolat-cake", price: "189.00", image: `${IMG}/2019/07/prod-3-opt-430x468.jpg`, category: "Sweets Bakery", rating: 4 },
    { id: 4, name: "Honey Waffles", slug: "honey-waffles", price: "249.00", image: `${IMG}/2019/07/prod-4-opt-430x468.jpg`, category: "Sweets Bakery", rating: 5 },
    { id: 5, name: "Muffin Cake", slug: "muffin-cake", price: "199.00", image: `${IMG}/2019/07/prod-5-opt-430x468.jpg`, category: "Sweets Bakery", rating: 5 },
    { id: 6, name: "Berry Cupcakes", slug: "berry-cupcakes", price: "269.00", image: `${IMG}/2019/07/prod-6-opt-430x468.jpg`, category: "Sweets Bakery", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .bk-products-section { background-image: url(${backgroundImage}); background-size: cover; background-position: center; padding: 60px 0 80px; margin-bottom: ${marginBottom}; }
    .bk-products { display: grid; gap: 20px; }
    .bk-prod { background: #fff; overflow: hidden; transition: box-shadow 0.3s; position: relative; text-align: center; }
    .bk-prod:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .bk-prod-img-wrap { position: relative; overflow: hidden; }
    .bk-prod-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .bk-prod:hover .bk-prod-img { transform: scale(1.05); }
    .bk-prod-info { padding: 15px 20px 25px; }
    .bk-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 5px; }
    .bk-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.entityTitleColor}; margin: 0 0 8px; }
    .bk-prod-name a { color: inherit; text-decoration: none; }
    .bk-prod-name a:hover { color: ${TOKENS.primaryColor}; }
    .bk-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.primaryColor}; }
    .bk-prod-stars { color: ${TOKENS.starColor}; font-size: 12px; letter-spacing: 2px; margin-bottom: 5px; }
    .bk-prod-btn { display: inline-block; margin-top: 10px; padding: 8px 20px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 12px; text-decoration: none; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; }
    .bk-prod-btn:hover { background: ${TOKENS.primaryHover}; }
  `;

  return (
    <div className="bk-products-section">
      <ScopedStyles id="products" css={css} />
      <div style={containerStyle}>
        <BakerySectionTitle subtitle={sectionSubtitle} title={sectionTitle} />
        <div className="bk-products" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="bk-prod">
              <div className="bk-prod-img-wrap">
                <img className="bk-prod-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              </div>
              <div className="bk-prod-info">
                <div className="bk-prod-cat">{p.category}</div>
                <h3 className="bk-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
                <div className="bk-prod-stars">{"★".repeat(p.rating || 5)}{"☆".repeat(5 - (p.rating || 5))}</div>
                <div className="bk-prod-price">${p.price}</div>
                <button className="bk-prod-btn">Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. HOW WE MADE DONUTS (Process Steps)
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryProcessStep {
  icon: string;
  title: string;
  description: string;
}

export interface BakeryProcessProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  steps?: BakeryProcessStep[];
  image?: string;
}

export function BakeryProcess({
  sectionTitle = "How We Made Donuts",
  sectionSubtitle = "Sweets Bakery",
  steps,
  image = `${IMG}/2019/07/bakery-donuts-img-opt.png`,
}: BakeryProcessProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const defaultSteps: BakeryProcessStep[] = [
    { icon: `${IMG}/2019/07/svg-bakery-infobox-4.svg`, title: "1. Ingredients", description: "Chances are there wasn't collaboration, communication." },
    { icon: `${IMG}/2019/07/svg-bakery-infobox-5.svg`, title: "2. Stuffing", description: "Chances are there wasn't collaboration, communication." },
    { icon: `${IMG}/2019/07/svg-bakery-infobox-6.svg`, title: "3. Cooking", description: "Chances are there wasn't collaboration, communication." },
    { icon: `${IMG}/2019/07/svg-bakery-infobox-7.svg`, title: "4. Dish Ready", description: "Chances are there wasn't collaboration, communication." },
  ];

  const items = steps || defaultSteps;

  const css = `
    .bk-process { display: flex; align-items: center; gap: 60px; margin-bottom: 80px; padding: 80px 0 60px; background-image: url(${IMG}/2019/07/bakery-bg-2-opt.png); background-position: 0 0; background-repeat: no-repeat; }
    .bk-process-img { flex: 0 0 40%; text-align: center; }
    .bk-process-img img { max-width: 100%; height: auto; }
    .bk-process-content { flex: 1; }
    .bk-process-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .bk-process-step { background: ${TOKENS.bgLight}; padding: 25px; text-align: right; }
    .bk-process-icon { width: 50px; height: 50px; margin-left: auto; margin-bottom: 15px; }
    .bk-process-step-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 24px; line-height: 34px; color: ${TOKENS.titleColor}; margin: 0 0 8px; }
    .bk-process-step-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px; color: ${TOKENS.textColor}; margin: 0 0 10px; }
    .bk-process-step-link { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor}; text-decoration: none; }
    @media (max-width: 767px) { .bk-process { flex-direction: column; gap: 30px; } .bk-process-grid { grid-template-columns: 1fr; } .bk-process-step { text-align: left; } .bk-process-icon { margin-left: 0; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="process" css={css} />
      <BakerySectionTitle subtitle={sectionSubtitle} title={sectionTitle} />
      <div className="bk-process">
        <div className="bk-process-img"><img src={image} alt="Donuts" /></div>
        <div className="bk-process-content">
          <div className="bk-process-grid">
            {items.map((step, i) => (
              <div key={i} className="bk-process-step">
                <img className="bk-process-icon" src={step.icon} alt={step.title} />
                <h4 className="bk-process-step-title">{step.title}</h4>
                <p className="bk-process-step-desc">{step.description}</p>
                <Link href={resolveStoreLink("#", storeCtx?.storeSlug)} className="bk-process-step-link">Read More →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryBlogPost {
  title: string;
  image: string;
  date: string;
  author?: string;
  link?: string;
}

export interface BakeryBlogPostsProps {
  posts?: BakeryBlogPost[];
  columns?: number;
  sectionTitle?: string;
  sectionSubtitle?: string;
  marginBottom?: string;
}

export function BakeryBlogPosts({ posts, columns = 4, sectionTitle = "Our New Articles", sectionSubtitle = "Sweets Bakery", marginBottom = "80px" }: BakeryBlogPostsProps) {
  const defaultPosts: BakeryBlogPost[] = [
    { title: "Seating collection inspiration by modern", image: `${IMG}/2019/07/bakery-blog-img-1.jpg`, date: "July 15, 2019", author: "Admin" },
    { title: "Green interior design inspiration", image: `${IMG}/2019/07/bakery-blog-img-2.jpg`, date: "July 15, 2019", author: "Admin" },
    { title: "Minimalist design furniture 2026", image: `${IMG}/2019/07/bakery-blog-img-3.jpg`, date: "July 15, 2019", author: "Admin" },
    { title: "Reinterprets the classic bookshelf", image: `${IMG}/2019/07/bakery-blog-img-4.jpg`, date: "July 15, 2019", author: "Admin" },
  ];

  const items = posts || defaultPosts;

  const css = `
    .bk-blog-grid { display: grid; gap: 20px; }
    .bk-blog-card { overflow: hidden; background: #fff; }
    .bk-blog-img-wrap { position: relative; overflow: hidden; }
    .bk-blog-img { width: 100%; height: 250px; object-fit: cover; display: block; transition: transform 0.5s; }
    .bk-blog-card:hover .bk-blog-img { transform: scale(1.05); }
    .bk-blog-content { padding: 20px 0; }
    .bk-blog-date { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 8px; }
    .bk-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; line-height: 1.4; color: ${TOKENS.entityTitleColor}; margin: 0; }
    .bk-blog-title:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 767px) { .bk-blog-grid { grid-template-columns: 1fr !important; } }
  `;

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      <BakerySectionTitle subtitle={sectionSubtitle} title={sectionTitle} />
      <ScopedStyles id="blog" css={css} />
      <div className="bk-blog-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((post, i) => (
          <div key={i} className="bk-blog-card">
            <div className="bk-blog-img-wrap">
              <img className="bk-blog-img" src={post.image} alt={post.title} />
            </div>
            <div className="bk-blog-content">
              <div className="bk-blog-date">{post.date}</div>
              <h3 className="bk-blog-title">{post.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. CTA / SHARE SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryCtaProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

export function BakeryCta({
  title = "Do You Like the Theme?\nShare With Your Friends!",
  subtitle = "Sweets Bakery",
  buttonText = "Buy Theme",
  buttonLink = "#",
  backgroundImage = `${IMG}/2018/01/p-bg-3.jpg`,
}: BakeryCtaProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const css = `
    .bk-cta { position: relative; padding: 100px 40px; text-align: center; background-size: cover; background-position: center; margin-bottom: 0; }
    .bk-cta-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
    .bk-cta-content { position: relative; z-index: 2; }
    .bk-cta-subtitle { font-family: ${TOKENS.scriptFont}; font-size: 30px; color: ${TOKENS.primaryColor}; margin-bottom: 5px; }
    .bk-cta-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 42px; line-height: 52px; color: #fff; margin: 0 0 30px; white-space: pre-line; }
    .bk-cta-btn { display: inline-block; padding: 16px 40px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; }
    .bk-cta-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 767px) { .bk-cta-title { font-size: 28px; line-height: 38px; } .bk-cta { padding: 60px 20px; } }
  `;

  return (
    <>
      <ScopedStyles id="cta" css={css} />
      <div className="bk-cta" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="bk-cta-overlay" />
        <div className="bk-cta-content">
          <div className="bk-cta-subtitle">{subtitle}</div>
          <h4 className="bk-cta-title">{title}</h4>
          <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="bk-cta-btn">{buttonText}</Link>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryFooterProps {
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

export function BakeryFooter({
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
}: BakeryFooterProps) {
  const storeCtx = useContext(BakeryStoreContext);
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
    color: "rgba(0,0,0,0.55)",
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
    .bk-footer a { color: rgba(0,0,0,0.55); text-decoration: none; transition: color 0.2s; }
    .bk-footer a:hover { color: #000; }

    .bk-col-brand { flex: 0 1 25%; min-width: 220px; }
    .bk-col-posts { flex: 0 1 25%; min-width: 220px; }
    .bk-col-links { flex: 0 1 17%; min-width: 140px; }

    .bk-col-toggle-head {
      display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; user-select: none; padding: 0;
    }
    .bk-col-toggle-head svg {
      width: 12px; height: 12px; fill: rgba(0,0,0,0.45);
      transition: transform 0.3s;
      display: none;
    }
    .bk-col-toggle-head.bk-open svg { transform: rotate(180deg); }

    .bk-col-title {
      font-family: ${TOKENS.titleFont};
      font-weight: 700; font-size: 16px; color: #222;
      letter-spacing: 0.3px; text-transform: uppercase;
      margin: 0 0 20px 0;
    }

    .bk-link-list { list-style: none; margin: 0; padding: 0; }
    .bk-link-list li { margin-bottom: 10px; }
    .bk-link-list li a { font-size: 14px; }
    .bk-link-list li a em { font-style: italic; }

    .bk-contact-list { list-style: none; margin: 16px 0 0; padding: 0; }
    .bk-contact-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .bk-contact-icon { width: 14px; height: 14px; flex-shrink: 0; margin-top: 4px; fill: rgba(0,0,0,0.45); }

    .bk-post-item { display: flex; gap: 12px; margin-bottom: 15px; }
    .bk-post-thumb { width: 75px; height: 65px; border-radius: 0; object-fit: cover; flex-shrink: 0; }
    .bk-post-title { font-size: 14px; color: rgba(0,0,0,0.75); font-weight: 400; margin: 0 0 4px; line-height: 1.4; }
    .bk-post-title a { color: rgba(0,0,0,0.75); }
    .bk-post-title a:hover { color: #000; }
    .bk-post-date { font-size: 12px; color: rgba(0,0,0,0.4); }

    .bk-copyrights {
      border-top: 1px solid rgba(0,0,0,0.08);
      max-width: ${TOKENS.containerWidth};
      margin: 0 auto;
      padding: 20px 15px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 10px;
    }
    .bk-copyrights small { font-size: 13px; color: rgba(0,0,0,0.45); }
    .bk-copyrights small a { color: rgba(0,0,0,0.45); }
    .bk-copyrights img { height: 21px; width: auto; }

    @media (max-width: 768px) {
      .bk-main-footer { gap: 0 !important; padding: 0 15px !important; }
      .bk-col-brand, .bk-col-posts, .bk-col-links {
        flex: 0 1 100% !important; min-width: 100% !important;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        padding: 20px 0;
      }
      .bk-col-brand { border-bottom: 1px solid rgba(0,0,0,0.06); padding-top: 30px; }
      .bk-col-toggle-head svg { display: block; }
      .bk-col-toggle-content { overflow: hidden; transition: max-height 0.3s ease; }
      .bk-col-toggle-content.bk-closed { max-height: 0; }
      .bk-col-toggle-content.bk-open { max-height: 500px; }
      .bk-col-title { margin-bottom: 0; }
      .bk-col-toggle-head.bk-open .bk-col-title { margin-bottom: 15px; }
    }

    @media (min-width: 769px) {
      .bk-col-toggle-content { max-height: none !important; }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .bk-col-brand, .bk-col-posts { flex: 0 1 calc(50% - 15px) !important; }
      .bk-col-links { flex: 0 1 calc(33% - 20px) !important; }
    }
  `;

  const contactIcons = {
    address: (
      <svg viewBox="0 0 477 477" className="bk-contact-icon">
        <path d="M238.5 0C146.3 0 71.5 74.8 71.5 167c0 40.7 14.5 78 38.6 107.1L238.5 477l128.4-202.9C391 245 405.5 207.7 405.5 167 405.5 74.8 330.7 0 238.5 0zm0 240c-40.3 0-73-32.7-73-73s32.7-73 73-73 73 32.7 73 73-32.7 73-73 73z"/>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 27 27" className="bk-contact-icon">
        <path d="M20.4 27c-1.8 0-4.4-.9-8-3.8C8.7 20.4 5 16.5 3 13.3.5 9.4-.2 6.4.1 4.3.4 2.5 1.4 1.3 2.4.5c.6-.5 1.2-.5 1.6-.1l4.2 5c.4.5.3 1-.1 1.4l-1.5 1.3c-.3.3-.3.6-.2.9 1 2 2.7 4.2 5 6.2s4.5 3.4 6.7 4c.3.1.7 0 .9-.2l1.5-1.6c.4-.4 1-.5 1.4-.1l4.7 4.4c.5.4.5 1.1 0 1.6-.8.9-2 1.8-3.8 2.2-.8.3-1.5.4-2.4.4z"/>
      </svg>
    ),
    fax: (
      <svg viewBox="0 0 479 479" className="bk-contact-icon">
        <path d="M434.1 59.7H370V20c0-11-9-20-20-20H129c-11 0-20 9-20 20v39.7H44.9C20.1 59.7 0 79.8 0 104.6v214.6c0 24.8 20.1 44.9 44.9 44.9h64.1V459c0 11 9 20 20 20h221c11 0 20-9 20-20V364.1h64.1c24.8 0 44.9-20.1 44.9-44.9V104.6c0-24.8-20.1-44.9-44.9-44.9zM149 40h181v19.7H149V40zm181 399H149V284.1h181V439zm104.1-119.8c0 2.7-2.2 4.9-4.9 4.9H370V264.1c0-11-9-20-20-20H129c-11 0-20 9-20 20v60h-65.1c-2.7 0-4.9-2.2-4.9-4.9V104.6c0-2.7 2.2-4.9 4.9-4.9h390.2c2.7 0 4.9 2.2 4.9 4.9v214.6z"/>
      </svg>
    ),
    email: (
      <svg viewBox="0 0 479 479" className="bk-contact-icon">
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
      <div key={idx} className="bk-col-links">
        <div
          className={`bk-col-toggle-head ${isOpen ? "bk-open" : ""}`}
          onClick={() => toggleColumn(colIndex)}
        >
          <h4 className="bk-col-title">{col.title}</h4>
          {chevronSvg}
        </div>
        <div className={`bk-col-toggle-content ${isOpen ? "bk-open" : "bk-closed"}`}>
          <ul className="bk-link-list">
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
    <footer className="bk-footer" style={footerStyle}>
      <ScopedStyles id="footer" css={scopedCss} />

      <div className="bk-main-footer" style={mainFooterStyle}>
        <div className="bk-col-brand">
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
            <ul className="bk-contact-list">
              {contact.address && (
                <li className="bk-contact-item">
                  {contactIcons.address}
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="bk-contact-item">
                  {contactIcons.phone}
                  <span>Phone: {contact.phone}</span>
                </li>
              )}
              {contact.fax && (
                <li className="bk-contact-item">
                  {contactIcons.fax}
                  <span>Fax: {contact.fax}</span>
                </li>
              )}
              {contact.email && (
                <li className="bk-contact-item">
                  {contactIcons.email}
                  <span>Email: {contact.email}</span>
                </li>
              )}
            </ul>
          )}
        </div>

        {recentPosts.length > 0 && (
          <div className="bk-col-posts">
            <div
              className={`bk-col-toggle-head ${openColumns.has(1) ? "bk-open" : ""}`}
              onClick={() => toggleColumn(1)}
            >
              <h4 className="bk-col-title">RECENT POSTS</h4>
              {chevronSvg}
            </div>
            <div className={`bk-col-toggle-content ${openColumns.has(1) ? "bk-open" : "bk-closed"}`}>
              {recentPosts.map((post, i) => (
                <div key={i} className="bk-post-item">
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="bk-post-thumb"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h5 className="bk-post-title">
                      <Link href={resolveStoreLink(post.url, storeCtx?.storeSlug)}>{post.title}</Link>
                    </h5>
                    <span className="bk-post-date">{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {linkColumns.map(renderLinkColumn)}
      </div>

      <div className="bk-copyrights">
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

