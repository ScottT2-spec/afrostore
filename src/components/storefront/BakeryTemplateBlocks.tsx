"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { InlineEditableText } from "@/components/storefront/InlineEditableText";

/* ═══════════════════════════════════════════════════════════════
   BAKERY (SWEETS BAKERY) TEMPLATE BLOCKS
   Pixel-perfect replicas of Prokip LTD Sweets Bakery template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "var(--color-primary)",
  primaryHover: "var(--color-primary)", // Will use CSS filter for hover effect
  accentBlue: "var(--color-accent)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  entityTitleColor: "var(--color-text)",
  linkColor: "var(--color-text)",
  starColor: "var(--color-accent)",
  footerBg: "var(--color-background)",
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
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
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

export function BakeryHeroSlider({ slides = [], autoplaySpeed = 5000 }: BakeryHeroSliderProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultSlides: BakeryHeroSlide[] = [
    {
      subtitle: "Crispy and Delicate",
      titleLine1: "BELGIAN",
      titleLine2: "WAFFLES",
      buttonText: "Read More",
      buttonLink: "#",
      backgroundImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop",
      productImage: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600&q=80&auto=format&fit=crop",
      smallImage: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=300&q=80&auto=format&fit=crop",
    },
    {
      subtitle: "A Tasty and Light Dessert",
      titleLine1: "ALMOND",
      titleLine2: "MAFFINS",
      buttonText: "Read More",
      buttonLink: "#",
      backgroundImage: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80&auto=format&fit=crop",
      productImage: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80&auto=format&fit=crop",
      smallImage: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&q=80&auto=format&fit=crop",
    },
    {
      subtitle: "It Is Worth Tasting",
      titleLine1: "DONUTS",
      titleLine2: "",
      buttonText: "Read More",
      buttonLink: "#",
      backgroundImage: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1200&q=80&auto=format&fit=crop",
      productImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80&auto=format&fit=crop",
      smallImage: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=300&q=80&auto=format&fit=crop",
    },
  ];

  const items = slides.length > 0 ? slides : defaultSlides;
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
    .bk-slide-btn:hover { filter: brightness(0.9); }
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
                <InlineEditableText as="div" field={`slides.${i}.subtitle`} value={slide.subtitle} isEditor={true} className="bk-slide-subtitle" />
                <InlineEditableText as="h2" field={`slides.${i}.titleLine1`} value={slide.titleLine1} isEditor={true} className="bk-slide-title" />
                <Link href={fixLink(slide.buttonLink)} className="bk-slide-btn"><InlineEditableText as="span" field={`slides.${i}.buttonText`} value={slide.buttonText} isEditor={true} selectNodeOnFocus={false} /></Link>
              </div>
              <div className="bk-slide-img">
                <img src={slide.productImage} alt={slide.titleLine1}  onError={(e) => onImgError(e, slide.titleLine1)} />
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
        {subtitle && <InlineEditableText as="div" field="subtitle" value={subtitle} isEditor={true} style={{ fontFamily: TOKENS.scriptFont, fontSize: "30px", color: TOKENS.primaryColor, marginBottom: "5px" }} />}
        <InlineEditableText as="h4" field="title" value={title} isEditor={true} style={{ fontFamily: TOKENS.titleFont, fontWeight: 600, fontSize: titleSize, lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 10px" }} />
        {description && <InlineEditableText as="p" field="description" value={description} isEditor={true} multiline style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", lineHeight: "26px", color: TOKENS.textColor, margin: 0 }} />}
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

export function BakeryCategoryInfoBoxes({ sectionTitle = "Our Fine Home-Made Chocolate", sectionSubtitle = "Sweets Bakery", items = [] }: BakeryCategoryInfoBoxesProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const defaultItems: BakeryCategoryInfoBox[] = [
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M6%2010h12l-1.5%209a2%202%200%2001-2%201.7H9.5a2%202%200%2001-2-1.7L6%2010z%22/%3E%3Cpath%20d%3D%22M8%2010a4%204%200%20118%200%22/%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%224%22%20r%3D%221.5%22/%3E%3C/svg%3E", title: "Cupcakes", description: "Freshly baked every morning with real butter and seasonal fruit.", buttonText: "Learn More" },
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cellipse%20cx%3D%2212%22%20cy%3D%228%22%20rx%3D%227%22%20ry%3D%224%22/%3E%3Cellipse%20cx%3D%2212%22%20cy%3D%2216%22%20rx%3D%227%22%20ry%3D%224%22/%3E%3Cpath%20d%3D%22M7%2011c0%201%202%202%205%202s5-1%205-2%22/%3E%3C/svg%3E", title: "Macaroons", description: "Delicate shells with rich, hand-piped fillings in every color.", buttonText: "Learn More" },
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M4%2021v-7a2%202%200%20012-2h12a2%202%200%20012%202v7M4%2021h16M9%2012V7a3%203%200%20016%200v5M12%204v1%22/%3E%3C/svg%3E", title: "Cakes", description: "Custom celebration cakes made to order, any size, any occasion.", buttonText: "Learn More" },
  ];

  const boxes = items.length > 0 ? items : defaultItems;

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
            <div className="bk-catbox-icon"><img src={box.icon} alt={box.title}  onError={(e) => onImgError(e, box.title)} /></div>
            <InlineEditableText as="h4" field={`items.${i}.title`} value={box.title} isEditor={true} className="bk-catbox-title" />
            <InlineEditableText as="p" field={`items.${i}.description`} value={box.description} isEditor={true} multiline className="bk-catbox-desc" />
            {box.buttonText && <Link href={resolveStoreLink(box.buttonLink || "#", storeCtx?.storeSlug)} className="bk-catbox-btn"><InlineEditableText as="span" field={`items.${i}.buttonText`} value={box.buttonText} isEditor={true} selectNodeOnFocus={false} /> →</Link>}
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
  image = "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=700&q=80&auto=format&fit=crop",
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
    .bk-handmade-btn:hover { filter: brightness(0.9); }
    @media (max-width: 767px) { .bk-handmade { flex-direction: column; gap: 30px; } .bk-handmade-title { font-size: 28px; line-height: 38px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="handmade" css={css} />
      <div className="bk-handmade">
        <div className="bk-handmade-img"><img src={image} alt="Handmade Cakes"  onError={(e) => onImgError(e, "fallback")} /></div>
        <div className="bk-handmade-content">
          <InlineEditableText as="div" field="subtitle" value={subtitle} isEditor={true} className="bk-handmade-subtitle" />
          <InlineEditableText as="h4" field="title" value={title} isEditor={true} className="bk-handmade-title" />
          <InlineEditableText as="p" field="description" value={description} isEditor={true} multiline className="bk-handmade-desc" />
          <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="bk-handmade-btn"><InlineEditableText as="span" field="buttonText" value={buttonText} isEditor={true} selectNodeOnFocus={false} /></Link>
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
  backgroundImage = "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=1400&q=80&auto=format&fit=crop",
}: BakeryProductGridProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const fixLink = (slug: string) => {
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/product/${slug}`;
    return `#`;
  };

  const defaultProducts: BakeryProduct[] = [
    { id: 1, name: "White Cake", slug: "white-cake", price: "199.00", image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&h=500&fit=crop", category: "Sweets Bakery", rating: 5 },
    { id: 2, name: "Raspberry Pie", slug: "raspberry-pie", price: "119.00", image: "https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=500&h=500&fit=crop", category: "Sweets Bakery", rating: 5 },
    { id: 3, name: "Chocolat Cake", slug: "chocolat-cake", price: "189.00", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop", category: "Sweets Bakery", rating: 4 },
    { id: 4, name: "Honey Waffles", slug: "honey-waffles", price: "249.00", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&h=500&fit=crop", category: "Sweets Bakery", rating: 5 },
    { id: 5, name: "Muffin Cake", slug: "muffin-cake", price: "199.00", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&h=500&fit=crop", category: "Sweets Bakery", rating: 5 },
    { id: 6, name: "Berry Cupcakes", slug: "berry-cupcakes", price: "269.00", image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=500&fit=crop", category: "Sweets Bakery", rating: 5 },
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
    .bk-prod-btn:hover { filter: brightness(0.9); }
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
                <button className="bk-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
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
  steps = [],
  image = "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=700&q=80&auto=format&fit=crop",
}: BakeryProcessProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const defaultSteps: BakeryProcessStep[] = [
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M12%202v20M12%206l-3-2M12%206l3-2M12%2010l-3-2M12%2010l3-2M12%2014l-3-2M12%2014l3-2M12%2018l-3-2M12%2018l3-2%22/%3E%3C/svg%3E", title: "1. Ingredients", description: "We start with real butter, fresh eggs, and quality flour." },
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M6%203h12l-2%2012a2%202%200%2001-2%201.7h-4a2%202%200%2001-2-1.7L6%203z%22/%3E%3Cpath%20d%3D%22M9%203v3M15%203v3%22/%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2221%22%20r%3D%221%22/%3E%3C/svg%3E", title: "2. Mixing", description: "Every batch is hand-mixed for the right texture, every time." },
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Crect%20x%3D%223%22%20y%3D%224%22%20width%3D%2218%22%20height%3D%2217%22%20rx%3D%221%22/%3E%3Crect%20x%3D%226%22%20y%3D%2210%22%20width%3D%2212%22%20height%3D%228%22%20rx%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%226.5%22%20r%3D%220.8%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%226.5%22%20r%3D%220.8%22/%3E%3C/svg%3E", title: "3. Baking", description: "Baked fresh daily in small batches for the best flavor." },
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%229%22/%3E%3Cpath%20d%3D%22M8%2012l3%203%205-6%22/%3E%3C/svg%3E", title: "4. Ready to Serve", description: "Cooled, decorated, and packaged fresh for you to enjoy." },
  ];

  const items = steps.length > 0 ? steps : defaultSteps;

  const css = `
    .bk-process { display: flex; align-items: center; gap: 60px; margin-bottom: 80px; padding: 80px 0 60px; background-image: url(https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop); background-position: 0 0; background-repeat: no-repeat; }
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
        <div className="bk-process-img"><img src={image} alt="Donuts"  onError={(e) => onImgError(e, "fallback")} /></div>
        <div className="bk-process-content">
          <div className="bk-process-grid">
            {items.map((step, i) => (
              <div key={i} className="bk-process-step">
                <img className="bk-process-icon" src={step.icon} alt={step.title}  onError={(e) => onImgError(e, step.title)} />
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

export function BakeryBlogPosts({ posts = [], columns = 4, sectionTitle = "Our New Articles", sectionSubtitle = "Sweets Bakery", marginBottom = "80px" }: BakeryBlogPostsProps) {
  const defaultPosts: BakeryBlogPost[] = [
    { title: "5 tips for the perfect sourdough crust", image: "https://images.unsplash.com/photo-1585478259715-4d3a5f47ea7e?w=500&q=80&auto=format&fit=crop", date: "June 12, 2026", author: "Admin" },
    { title: "How we source our seasonal fruit", image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=500&q=80&auto=format&fit=crop", date: "May 28, 2026", author: "Admin" },
    { title: "Behind the scenes: our early morning bake", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80&auto=format&fit=crop", date: "May 14, 2026", author: "Admin" },
    { title: "Custom cakes: how to order for your event", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80&auto=format&fit=crop", date: "May 3, 2026", author: "Admin" },
  ];

  const items = posts.length > 0 ? posts : defaultPosts;

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
              <img className="bk-blog-img" src={post.image} alt={post.title}  onError={(e) => onImgError(e, post.title)} />
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
  backgroundImage = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop",
}: BakeryCtaProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const css = `
    .bk-cta { position: relative; padding: 100px 40px; text-align: center; background-size: cover; background-position: center; margin-bottom: 0; }
    .bk-cta-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
    .bk-cta-content { position: relative; z-index: 2; }
    .bk-cta-subtitle { font-family: ${TOKENS.scriptFont}; font-size: 30px; color: ${TOKENS.primaryColor}; margin-bottom: 5px; }
    .bk-cta-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 42px; line-height: 52px; color: #fff; margin: 0 0 30px; white-space: pre-line; }
    .bk-cta-btn { display: inline-block; padding: 16px 40px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; }
    .bk-cta-btn:hover { filter: brightness(0.9); }
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
   9. ABOUT CONTENT (text block with optional heading, buttons, credit)
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryAboutContentProps {
  subtitle?: string;
  title?: string;
  paragraphs?: string[];
  buttons?: { text: string; link: string }[];
  credit?: string;
}

export function BakeryAboutContent({ subtitle, title, paragraphs = [], buttons = [], credit }: BakeryAboutContentProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const css = `
    .bk-about { padding: 40px 15px; }
    .bk-about-subtitle { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700; font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; }
    .bk-about-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; line-height: 1.3; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .bk-about-text { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; margin: 0 0 16px; }
    .bk-about-btns { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
    .bk-about-btn { display: inline-block; padding: 12px 30px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
    .bk-about-btn:hover { filter: brightness(0.9); }
    .bk-about-credit { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; font-style: italic; margin-top: 20px; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="about-content" css={css} />
      <div className="bk-about">
        {subtitle && <div className="bk-about-subtitle">{subtitle}</div>}
        {title && <h4 className="bk-about-title">{title}</h4>}
        {paragraphs.map((p, i) => <p key={i} className="bk-about-text">{p}</p>)}
        {buttons.length > 0 && (
          <div className="bk-about-btns">
            {buttons.map((btn, i) => <Link key={i} href={fixLink(btn.link)} className="bk-about-btn">{btn.text}</Link>)}
          </div>
        )}
        {credit && <div className="bk-about-credit">{credit}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. STATS COUNTERS
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryStatsCountersProps {
  counters?: { value: number; label: string }[];
}

export function BakeryStatsCounters({ counters = [] }: BakeryStatsCountersProps) {
  const css = `
    .bk-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; padding: 40px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 40px; }
    .bk-stat { text-align: center; min-width: 120px; }
    .bk-stat-value { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 42px; color: ${TOKENS.primaryColor}; line-height: 1; margin-bottom: 8px; }
    .bk-stat-label { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 1px; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="stats" css={css} />
      <div className="bk-stats">
        {counters.map((c, i) => (
          <div key={i} className="bk-stat">
            <div className="bk-stat-value">{c.value}</div>
            <div className="bk-stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. SERVICES GRID (icon + title + description cards)
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryServicesGridProps {
  subtitle?: string;
  title?: string;
  services?: { icon: string; title: string; description: string }[];
}

export function BakeryServicesGrid({ subtitle, title, services = [] }: BakeryServicesGridProps) {
  const css = `
    .bk-services { padding: 40px 0; }
    .bk-services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 30px; }
    .bk-service { text-align: center; }
    .bk-service-icon { width: 70px; height: 70px; margin: 0 auto 15px; }
    .bk-service-icon img { width: 100%; height: 100%; }
    .bk-service-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; text-transform: uppercase; margin: 0 0 8px; }
    .bk-service-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.6; color: ${TOKENS.textColor}; }
    @media (max-width: 767px) { .bk-services-grid { grid-template-columns: 1fr 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="services" css={css} />
      <div className="bk-services">
        {(subtitle || title) && <BakerySectionTitle subtitle={subtitle} title={title || ""} />}
        <div className="bk-services-grid">
          {services.map((s, i) => (
            <div key={i} className="bk-service">
              <div className="bk-service-icon"><img src={s.icon} alt={s.title} onError={(e) => onImgError(e, s.title)} /></div>
              <h4 className="bk-service-title">{s.title}</h4>
              <p className="bk-service-desc">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. GALLERY GRID
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryGalleryGridProps {
  images?: string[];
}

export function BakeryGalleryGrid({ images = [] }: BakeryGalleryGridProps) {
  const css = `
    .bk-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 40px 0; }
    .bk-gallery img { width: 100%; height: auto; display: block; }
    @media (max-width: 767px) { .bk-gallery { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="gallery" css={css} />
      <div className="bk-gallery">
        {images.map((img, i) => <img key={i} src={img} alt={`Gallery ${i + 1}`} onError={(e) => onImgError(e, "gallery")} />)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   13. VIDEO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryVideoSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  videos?: { thumbnail: string; youtubeUrl: string; title: string }[];
}

export function BakeryVideoSection({ subtitle, title, description, videos = [] }: BakeryVideoSectionProps) {
  const css = `
    .bk-videos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin: 30px 0 40px; }
    .bk-video { position: relative; overflow: hidden; cursor: pointer; }
    .bk-video img { width: 100%; height: auto; display: block; }
    .bk-video-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: background 0.3s; }
    .bk-video:hover .bk-video-overlay { background: rgba(0,0,0,0.5); }
    .bk-video-play { width: 60px; height: 60px; border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
    .bk-video-play::after { content: '▶'; color: #fff; font-size: 20px; margin-left: 4px; }
    .bk-video-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: #fff; }
    @media (max-width: 767px) { .bk-videos { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      {(subtitle || title) && <BakerySectionTitle subtitle={subtitle} title={title || ""} description={description} />}
      <ScopedStyles id="videos" css={css} />
      <div className="bk-videos">
        {videos.map((v, i) => (
          <a key={i} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bk-video" style={{ textDecoration: "none" }}>
            <img src={v.thumbnail} alt={v.title} onError={(e) => onImgError(e, v.title)} />
            <div className="bk-video-overlay">
              <div className="bk-video-play" />
              <div className="bk-video-title">{v.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   14. QUOTE SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryQuoteSectionProps {
  subtitle?: string;
  quote?: string;
  attribution?: string;
  description?: string;
  credit?: string;
}

export function BakeryQuoteSection({ subtitle, quote, attribution, description, credit }: BakeryQuoteSectionProps) {
  const css = `
    .bk-quote { text-align: center; padding: 60px 15px; max-width: 800px; margin: 0 auto; }
    .bk-quote-subtitle { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700; font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; }
    .bk-quote-text { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .bk-quote-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; margin: 0 0 16px; }
    .bk-quote-credit { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; font-style: italic; }
  `;
  return (
    <>
      <ScopedStyles id="quote" css={css} />
      <div className="bk-quote">
        {subtitle && <div className="bk-quote-subtitle">{subtitle}</div>}
        {quote && <h4 className="bk-quote-text">&ldquo;{quote}&rdquo;{attribution && ` — ${attribution}`}</h4>}
        {description && <p className="bk-quote-desc">{description}</p>}
        {credit && <div className="bk-quote-credit">{credit}</div>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   15. TEAM SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryTeamSectionProps {
  members?: { name: string; role: string; image: string; socials?: string[] }[];
}

export function BakeryTeamSection({ members = [] }: BakeryTeamSectionProps) {
  const css = `
    .bk-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin: 40px 0; }
    .bk-team-member { text-align: center; }
    .bk-team-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; margin-bottom: 15px; }
    .bk-team-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 4px; }
    .bk-team-role { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 1px; }
    @media (max-width: 767px) { .bk-team { grid-template-columns: 1fr 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="team" css={css} />
      <div className="bk-team">
        {members.map((m, i) => (
          <div key={i} className="bk-team-member">
            <img className="bk-team-img" src={m.image} alt={m.name} onError={(e) => onImgError(e, m.name)} />
            <h4 className="bk-team-name">{m.name}</h4>
            <div className="bk-team-role">{m.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   16. OFFICE LOCATIONS
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryOfficeLocationsProps {
  subtitle?: string;
  title?: string;
  description?: string;
  offices?: { city: string; address: string; phone: string; email: string }[];
}

export function BakeryOfficeLocations({ subtitle, title, description, offices = [] }: BakeryOfficeLocationsProps) {
  const css = `
    .bk-offices { padding: 40px 0; }
    .bk-offices-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 30px; }
    .bk-office { padding: 25px; background: ${TOKENS.bgLight}; }
    .bk-office-city { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 12px; }
    .bk-office-addr { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.6; color: ${TOKENS.textColor}; white-space: pre-line; margin: 0 0 12px; }
    .bk-office-contact { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; }
    .bk-office-contact strong { color: ${TOKENS.titleColor}; }
    @media (max-width: 767px) { .bk-offices-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="offices" css={css} />
      <div className="bk-offices">
        {(subtitle || title) && <BakerySectionTitle subtitle={subtitle} title={title || ""} description={description} />}
        <div className="bk-offices-grid">
          {offices.map((o, i) => (
            <div key={i} className="bk-office">
              <h4 className="bk-office-city">{o.city}</h4>
              <p className="bk-office-addr">{o.address}</p>
              <div className="bk-office-contact"><strong>Phone:</strong> {o.phone}<br /><strong>Email:</strong> {o.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   17. COVER BANNERS (news/article cards)
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryCoverBannersProps {
  banners?: { image: string; title: string; description: string; buttonText: string; link: string }[];
}

export function BakeryCoverBanners({ banners = [] }: BakeryCoverBannersProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const css = `
    .bk-covers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
    .bk-cover { position: relative; overflow: hidden; min-height: 280px; }
    .bk-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .bk-cover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; flex-direction: column; justify-content: flex-end; padding: 25px; transition: background 0.3s; }
    .bk-cover:hover .bk-cover-overlay { background: rgba(0,0,0,0.5); }
    .bk-cover-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: #fff; margin: 0 0 8px; }
    .bk-cover-desc { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: rgba(255,255,255,0.8); margin: 0 0 12px; }
    .bk-cover-link { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: #fff; text-decoration: underline; }
    @media (max-width: 767px) { .bk-covers { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="covers" css={css} />
      <div className="bk-covers">
        {banners.map((b, i) => (
          <Link key={i} href={resolveStoreLink(b.link, storeCtx?.storeSlug)} className="bk-cover" style={{ textDecoration: "none" }}>
            <img src={b.image} alt={b.title} onError={(e) => onImgError(e, b.title)} />
            <div className="bk-cover-overlay">
              <h4 className="bk-cover-title">{b.title}</h4>
              <p className="bk-cover-desc">{b.description}</p>
              <span className="bk-cover-link">{b.buttonText}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   18. STORE VISIT SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryStoreVisitProps {
  subtitle?: string;
  title?: string;
  address?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function BakeryStoreVisit({ subtitle, title, address, buttonText, buttonLink = "#" }: BakeryStoreVisitProps) {
  const storeCtx = useContext(BakeryStoreContext);
  const css = `
    .bk-visit { padding: 60px 0; background: ${TOKENS.bgLight}; text-align: center; margin-bottom: 40px; }
    .bk-visit-subtitle { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700; font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; }
    .bk-visit-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0 0 15px; white-space: pre-line; }
    .bk-visit-addr { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; white-space: pre-line; margin: 0 0 20px; }
    .bk-visit-btn { display: inline-block; padding: 12px 30px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
  `;
  return (
    <>
      <ScopedStyles id="visit" css={css} />
      <div className="bk-visit">
        {subtitle && <div className="bk-visit-subtitle">{subtitle}</div>}
        {title && <h4 className="bk-visit-title">{title}</h4>}
        {address && <p className="bk-visit-addr">{address}</p>}
        {buttonText && <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="bk-visit-btn">{buttonText}</Link>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   19. FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryFaqAccordionProps {
  subtitle?: string;
  title?: string;
  items?: { question: string; answer: string }[];
}

export function BakeryFaqAccordion({ subtitle, title, items = [] }: BakeryFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const css = `
    .bk-faq { padding: 40px 0; }
    .bk-faq-item { border-bottom: 1px solid #eee; }
    .bk-faq-q { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; cursor: pointer; font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.titleColor}; }
    .bk-faq-q:hover { color: ${TOKENS.primaryColor}; }
    .bk-faq-toggle { font-size: 20px; color: ${TOKENS.textColor}; transition: transform 0.3s; }
    .bk-faq-a { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7; color: ${TOKENS.textColor}; padding: 0 0 18px; white-space: pre-line; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="faq" css={css} />
      <div className="bk-faq">
        {(subtitle || title) && <BakerySectionTitle subtitle={subtitle} title={title || ""} />}
        {items.map((item, i) => (
          <div key={i} className="bk-faq-item">
            <div className="bk-faq-q" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span>{item.question}</span>
              <span className="bk-faq-toggle" style={{ transform: openIndex === i ? "rotate(45deg)" : "none" }}>+</span>
            </div>
            {openIndex === i && <div className="bk-faq-a">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   20. CONTACT FORM
   ═══════════════════════════════════════════════════════════════ */

export interface BakeryContactFormProps {
  subtitle?: string;
  title?: string;
  fields?: string[];
  buttonText?: string;
}

export function BakeryContactForm({ subtitle, title, fields = ["name", "email", "phone", "company", "message"], buttonText = "Submit" }: BakeryContactFormProps) {
  const css = `
    .bk-contact-form { padding: 40px 0; max-width: 700px; margin: 0 auto; }
    .bk-contact-form input, .bk-contact-form textarea { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #ddd; font-family: ${TOKENS.bodyFont}; font-size: 14px; box-sizing: border-box; outline: none; }
    .bk-contact-form input:focus, .bk-contact-form textarea:focus { border-color: ${TOKENS.primaryColor}; }
    .bk-contact-form textarea { height: 120px; resize: vertical; }
    .bk-contact-submit { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border: none; cursor: pointer; transition: background 0.3s; }
    .bk-contact-submit:hover { filter: brightness(0.9); }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="contact-form" css={css} />
      {(subtitle || title) && <BakerySectionTitle subtitle={subtitle} title={title || ""} />}
      <div className="bk-contact-form">
        {fields.includes("name") && <input type="text" placeholder="Your Name" />}
        {fields.includes("email") && <input type="email" placeholder="Your Email" />}
        {fields.includes("phone") && <input type="tel" placeholder="Phone Number" />}
        {fields.includes("company") && <input type="text" placeholder="Company" />}
        {fields.includes("message") && <textarea placeholder="Your Message" />}
        <button className="bk-contact-submit">{buttonText}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export function BakeryFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(BakeryStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
