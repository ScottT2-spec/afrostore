"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   AI TEMPLATE BLOCKS
   Allbirds-inspired modern e-commerce template.
   Clean, minimal, full-bleed imagery, Tailwind-style spacing.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  pageBackground: "#F1F1F1",
  cardBackground: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#555555",
  textWhite: "#ffffff",
  overlayDark: "rgba(0, 0, 0, 0.15)",
  overlayRadial: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)",
  dotsColor: "#d6d3d1", // stone-300
  naturalWhite: "#E7E4D3",
  footerBg: "#000000",
  accentColor: "var(--color-primary, #1a1a1a)",
  serifFont: "'Playfair Display', Georgia, 'Times New Roman', serif",
  sansFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  monoFont: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  containerWidth: "1440px",
  gap: "10px",       // 2.5 in tailwind = 10px
  radiusSm: "8px",   // rounded
  radiusMd: "16px",  // rounded-2xl
  radiusLg: "24px",  // rounded-3xl
  radiusXl: "20px",  // rounded-[20px]
  radiusFull: "9999px",
};

/* ─── STORE CONTEXT ─────────────────────────────────────────── */
export interface AiStoreContextData {
  storeSlug?: string;
  storeName?: string;
  storeLogo?: string;
}
export const AiStoreContext = createContext<AiStoreContextData | null>(null);

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function AiFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    `}} />
  );
}

/* ─── SCOPED STYLE INJECTOR ─────────────────────────────────── */
function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-ai-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

/* ─── HELPER: resolve link ──────────────────────────────────── */
function useFixLink() {
  const ctx = useContext(AiStoreContext);
  return (link: string) => resolveStoreLink(link, ctx?.storeSlug);
}

/* ═══════════════════════════════════════════════════════════════
   1. AI ANNOUNCEMENT BAR — Scrolling marquee ticker
   ═══════════════════════════════════════════════════════════════ */

export interface AiAnnouncementBarProps {
  messages: string[];
  speed?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function AiAnnouncementBar({
  messages,
  speed = 30,
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
}: AiAnnouncementBarProps) {
  const repeatedMessages = [...messages, ...messages, ...messages, ...messages];
  const scopedCss = `
    @keyframes ai-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .ai-marquee-track { display: flex; animation: ai-marquee ${speed}s linear infinite; white-space: nowrap; }
    .ai-marquee-track:hover { animation-play-state: paused; }
  `;
  return (
    <div style={{ background: backgroundColor, color: textColor, overflow: "hidden", padding: "10px 0", fontSize: "12px", fontFamily: TOKENS.monoFont, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      <ScopedStyles id="ai-marquee" css={scopedCss} />
      <div className="ai-marquee-track">
        {repeatedMessages.map((msg, i) => (
          <span key={i} style={{ padding: "0 40px", display: "inline-flex", alignItems: "center", gap: "40px" }}>
            {msg}
            <span style={{ opacity: 0.3 }}>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. AI HERO VIDEO — Full-bleed hero with video/image background
   ═══════════════════════════════════════════════════════════════ */

export interface AiHeroVideoProps {
  backgroundImage: string;
  backgroundVideo?: string;
  mobileBackgroundImage?: string;
  mobileBackgroundVideo?: string;
  buttons: Array<{
    text: string;
    link: string;
    style?: "primary" | "outline-white" | "outline-black";
  }>;
  contentPosition?: "bottom-center" | "bottom-right" | "bottom-left" | "center";
  overlayOpacity?: number;
  minHeight?: string;
}

export function AiHeroVideo({
  backgroundImage,
  backgroundVideo,
  buttons,
  contentPosition = "bottom-right",
  overlayOpacity = 0,
  minHeight,
}: AiHeroVideoProps) {
  const fixLink = useFixLink();
  const { ref, inView } = useInView(0.05);

  const positionStyles: Record<string, React.CSSProperties> = {
    "bottom-center": { justifyContent: "flex-end", alignItems: "center", textAlign: "center" },
    "bottom-right": { justifyContent: "flex-end", alignItems: "flex-end", textAlign: "right" },
    "bottom-left": { justifyContent: "flex-end", alignItems: "flex-start", textAlign: "left" },
    "center": { justifyContent: "center", alignItems: "center", textAlign: "center" },
  };

  const btnStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: TOKENS.textWhite,
      color: TOKENS.textPrimary,
      border: "2px solid white",
      padding: "14px 32px",
      fontFamily: TOKENS.sansFont,
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      borderRadius: TOKENS.radiusFull,
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    "outline-white": {
      background: "transparent",
      color: TOKENS.textWhite,
      border: "2px solid white",
      padding: "14px 32px",
      fontFamily: TOKENS.sansFont,
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      borderRadius: TOKENS.radiusFull,
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    "outline-black": {
      background: "transparent",
      color: TOKENS.textPrimary,
      border: "2px solid #1a1a1a",
      padding: "14px 32px",
      fontFamily: TOKENS.sansFont,
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      borderRadius: TOKENS.radiusFull,
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        margin: TOKENS.gap,
        borderRadius: TOKENS.radiusSm,
        overflow: "hidden",
        height: minHeight || "calc(100vh - 120px)",
        minHeight: "500px",
        color: TOKENS.textWhite,
        opacity: inView ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}
    >
      {/* Background */}
      {backgroundVideo ? (
        <video
          autoPlay
          playsInline
          loop
          muted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          poster={safeSrc(backgroundImage)}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : (
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${safeSrc(backgroundImage)})`,
          backgroundSize: "cover", backgroundPosition: "center",
        }} />
      )}

      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayOpacity / 100})`, zIndex: 1 }} />
      )}

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        display: "flex", flexDirection: "column",
        padding: "32px",
        paddingTop: "80px",
        ...positionStyles[contentPosition],
      }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${buttons.length}, 1fr)`, gap: TOKENS.gap, pointerEvents: "auto" }}>
          {buttons.map((btn, i) => (
            <Link key={i} href={fixLink(btn.link)} style={btnStyles[btn.style || "primary"]}>
              {btn.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. AI CATEGORY ROW — Tall portrait category cards
   ═══════════════════════════════════════════════════════════════ */

export interface AiCategoryCard {
  title: string;
  image: string;
  hoverImage?: string;
  overlayOpacity?: number;
  buttons: Array<{ text: string; link: string }>;
}

export interface AiCategoryRowProps {
  cards: AiCategoryCard[];
}

export function AiCategoryRow({ cards }: AiCategoryRowProps) {
  const fixLink = useFixLink();
  const { ref, inView } = useInView();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const scopedCss = `
    .ai-cat-card { position: relative; aspect-ratio: 0.77; overflow: hidden; border-radius: ${TOKENS.radiusXl}; cursor: pointer; flex: 1; min-width: 0; }
    .ai-cat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .ai-cat-card:hover img { transform: scale(1.03); }
    .ai-cat-card-overlay { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .ai-cat-card-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin: auto; width: fit-content; height: fit-content; }
    .ai-cat-title { font-family: ${TOKENS.sansFont}; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: white; border: 2px solid white; border-radius: ${TOKENS.radiusFull}; padding: 10px 24px; pointer-events: none; white-space: nowrap; }
    .ai-cat-btn { font-family: ${TOKENS.sansFont}; font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: white; border: 1.5px solid rgba(255,255,255,0.6); border-radius: ${TOKENS.radiusFull}; padding: 8px 20px; text-decoration: none; text-align: center; width: 100%; transition: all 0.3s ease; pointer-events: auto; display: block; }
    .ai-cat-btn:hover { background: rgba(255,255,255,0.15); border-color: white; }
    @media (max-width: 768px) {
      .ai-cat-row { overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
      .ai-cat-card { min-width: 75vw; scroll-snap-align: start; flex: none; }
    }
  `;

  return (
    <div
      ref={ref}
      style={{
        padding: TOKENS.gap,
        color: TOKENS.textWhite,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <ScopedStyles id="ai-cat-row" css={scopedCss} />
      <div className="ai-cat-row" style={{ display: "flex", gap: TOKENS.gap }}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="ai-cat-card"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <img
              src={safeSrc((hoveredIdx === i && card.hoverImage) ? card.hoverImage : card.image)}
              alt={card.title}
              onError={onImgError}
              loading="lazy"
            />
            <div className="ai-cat-card-overlay" style={{ backgroundColor: `rgba(0,0,0,${(card.overlayOpacity ?? 15) / 100})` }} />
            <div className="ai-cat-card-content">
              <span className="ai-cat-title">{card.title}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", width: "100%" }}>
                {card.buttons.map((btn, j) => (
                  <Link key={j} href={fixLink(btn.link)} className="ai-cat-btn">{btn.text}</Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. AI LARGE PRODUCT CAROUSEL — Featured products on dotted bg
   ═══════════════════════════════════════════════════════════════ */

export interface AiLargeProductItem {
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  image: string;
  link: string;
  mensLink?: string;
  womensLink?: string;
  isUnisex?: boolean;
}

export interface AiLargeProductCarouselProps {
  tabs: Array<{ label: string; products: AiLargeProductItem[] }>;
  dotsBackground?: string;
}

export function AiLargeProductCarousel({ tabs, dotsBackground = TOKENS.naturalWhite }: AiLargeProductCarouselProps) {
  const fixLink = useFixLink();
  const { ref, inView } = useInView();
  const [activeTab, setActiveTab] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const products = tabs[activeTab]?.products || [];
  const product = products[activeProduct];

  const scopedCss = `
    @keyframes ai-dot-pattern {
      0% { background-position: 0 0; }
      100% { background-position: 20px 20px; }
    }
    .ai-dots-bg {
      background-image: radial-gradient(circle, ${TOKENS.dotsColor} 1px, transparent 1px);
      background-size: 20px 20px;
      position: absolute; inset: 0;
      opacity: 0.6;
    }
    .ai-dots-fade { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 30%, ${dotsBackground} 70%); }
    .ai-lpc-slide { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
    .ai-lpc-slide:hover { transform: scale(1.05); }
    .ai-lpc-nav { width: 48px; height: 48px; border-radius: ${TOKENS.radiusFull}; border: 2px solid #1a1a1a; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; font-size: 18px; color: #1a1a1a; }
    .ai-lpc-nav:hover { background: #1a1a1a; color: white; }
    .ai-lpc-tab { font-family: ${TOKENS.monoFont}; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: none; cursor: pointer; padding: 4px 0; color: #999; transition: color 0.3s; border-bottom: 2px solid transparent; }
    .ai-lpc-tab:hover, .ai-lpc-tab.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }
    @media (max-width: 768px) { .ai-lpc-nav { display: none; } }
  `;

  const goNext = () => setActiveProduct((prev) => (prev + 1) % products.length);
  const goPrev = () => setActiveProduct((prev) => (prev - 1 + products.length) % products.length);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        marginTop: "96px",
        marginBottom: TOKENS.gap,
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <ScopedStyles id="ai-lpc" css={scopedCss} />

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "32px", position: "relative", zIndex: 2 }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`ai-lpc-tab ${i === activeTab ? "active" : ""}`}
            onClick={() => { setActiveTab(i); setActiveProduct(0); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product display area */}
      <div style={{ position: "relative", paddingTop: "4%", paddingBottom: "4%" }}>
        {/* Dotted background */}
        <div style={{
          position: "absolute",
          inset: 0,
          margin: "auto",
          width: "70%",
          height: "70%",
          background: dotsBackground,
          borderRadius: TOKENS.radiusMd,
          overflow: "hidden",
        }}>
          <div className="ai-dots-bg" />
          <div className="ai-dots-fade" />
        </div>

        {/* Product carousel */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
          <button className="ai-lpc-nav" onClick={goPrev} aria-label="Previous product">‹</button>

          <div style={{ width: "50%", maxWidth: "600px", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {product && (
              <Link href={fixLink(product.link)} style={{ display: "block", width: "100%", height: "100%" }}>
                <img
                  src={safeSrc(product.image)}
                  alt={product.title}
                  onError={onImgError}
                  style={{ width: "100%", height: "100%", objectFit: "contain", transition: "opacity 0.4s ease" }}
                />
              </Link>
            )}
          </div>

          <button className="ai-lpc-nav" onClick={goNext} aria-label="Next product">›</button>
        </div>

        {/* Product info */}
        {product && (
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <h3 style={{ fontFamily: TOKENS.serifFont, fontSize: "clamp(24px, 4vw, 40px)", lineHeight: 1.2, color: TOKENS.textPrimary, margin: 0, fontWeight: 400 }}>
              {product.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: TOKENS.sansFont, fontSize: "13px", color: TOKENS.textSecondary }}>
              <span>{product.description}</span>
              <span>—</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{product.price}</span>
                {product.compareAtPrice && (
                  <span style={{ textDecoration: "line-through", opacity: 0.65, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {product.compareAtPrice}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: TOKENS.gap }}>
              {product.mensLink && (
                <Link href={fixLink(product.mensLink)} style={{
                  fontFamily: TOKENS.sansFont, fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  border: "2px solid #1a1a1a", borderRadius: TOKENS.radiusFull, padding: "12px 28px", color: TOKENS.textPrimary,
                  textDecoration: "none", minWidth: "128px", textAlign: "center", transition: "all 0.3s",
                }}>
                  Shop Men
                </Link>
              )}
              {product.womensLink && (
                <Link href={fixLink(product.womensLink)} style={{
                  fontFamily: TOKENS.sansFont, fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  border: "2px solid #1a1a1a", borderRadius: TOKENS.radiusFull, padding: "12px 28px", color: TOKENS.textPrimary,
                  textDecoration: "none", minWidth: "128px", textAlign: "center", transition: "all 0.3s",
                }}>
                  Shop Women
                </Link>
              )}
              {product.isUnisex && (
                <Link href={fixLink(product.link)} style={{
                  fontFamily: TOKENS.sansFont, fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  border: "2px solid #1a1a1a", borderRadius: TOKENS.radiusFull, padding: "12px 28px", color: TOKENS.textPrimary,
                  textDecoration: "none", minWidth: "128px", textAlign: "center", transition: "all 0.3s",
                }}>
                  Shop Now
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px", position: "relative", zIndex: 2 }}>
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveProduct(i)}
              style={{
                width: i === activeProduct ? "24px" : "8px",
                height: "8px",
                borderRadius: TOKENS.radiusFull,
                border: "none",
                background: i === activeProduct ? TOKENS.textPrimary : "#ccc",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
              aria-label={`Product ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. AI PROMO TILES — 3 portrait promo cards with hover effects
   ═══════════════════════════════════════════════════════════════ */

export interface AiPromoTile {
  title: string;
  image: string;
  buttons: Array<{ text: string; link: string }>;
  titleColor?: string;
}

export interface AiPromoTilesProps {
  tiles: AiPromoTile[];
}

export function AiPromoTiles({ tiles }: AiPromoTilesProps) {
  const fixLink = useFixLink();
  const { ref, inView } = useInView();

  const scopedCss = `
    .ai-promo-tile { position: relative; aspect-ratio: 7/10; overflow: hidden; border-radius: ${TOKENS.radiusLg}; background: white; }
    .ai-promo-tile img { width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform 0.9s ease-in-out; }
    .ai-promo-tile:hover img { transform: scale(1.08); }
    .ai-promo-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; background: radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 65%); z-index: 2; }
    .ai-promo-btns { position: absolute; bottom: 10px; left: 10px; right: 10px; display: flex; gap: 10px; z-index: 3; }
    .ai-promo-btn { flex: 1; font-family: ${TOKENS.sansFont}; font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: white; border: 1.5px solid rgba(255,255,255,0.7); border-radius: ${TOKENS.radiusFull}; padding: 12px 16px; text-decoration: none; text-align: center; transition: all 0.3s; background: transparent; }
    .ai-promo-btn:hover { background: rgba(255,255,255,0.15); border-color: white; }
    @media (min-width: 769px) { .ai-promo-btns { bottom: 20px; left: 20px; right: 20px; } }
    @media (max-width: 768px) { .ai-promo-grid { grid-template-columns: 1fr !important; } }
  `;

  return (
    <div
      ref={ref}
      style={{
        padding: `40px ${TOKENS.gap}`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <ScopedStyles id="ai-promo" css={scopedCss} />
      <div className="ai-promo-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${tiles.length}, 1fr)`, gap: TOKENS.gap }}>
        {tiles.map((tile, i) => (
          <div key={i} className="ai-promo-tile">
            <img src={safeSrc(tile.image)} alt={tile.title} onError={onImgError} loading="lazy" />
            <div className="ai-promo-content">
              <h2 style={{
                fontFamily: TOKENS.serifFont,
                fontSize: "clamp(24px, 3vw, 40px)",
                fontWeight: 400,
                userSelect: "none",
                color: tile.titleColor || TOKENS.textWhite,
                margin: 0,
              }}>
                {tile.title}
              </h2>
            </div>
            <div className="ai-promo-btns">
              {tile.buttons.map((btn, j) => (
                <Link key={j} href={fixLink(btn.link)} className="ai-promo-btn">{btn.text}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. AI PRODUCT CAROUSEL — Standard product cards with badges
   ═══════════════════════════════════════════════════════════════ */

export interface AiProductCardData {
  name: string;
  colorway: string;
  price: string;
  compareAtPrice?: string;
  image: string;
  hoverImage?: string;
  link: string;
  badge?: string;
  swatches?: Array<{ color: string; label: string }>;
}

export interface AiProductCarouselProps {
  tabs: Array<{ label: string; products: AiProductCardData[] }>;
}

export function AiProductCarousel({ tabs }: AiProductCarouselProps) {
  const fixLink = useFixLink();
  const { ref, inView } = useInView();
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = tabs[activeTab]?.products || [];

  const scopedCss = `
    .ai-pc-card { position: relative; display: flex; flex-direction: column; border-radius: ${TOKENS.radiusMd}; background: white; overflow: hidden; min-width: 260px; max-width: 320px; flex-shrink: 0; transition: all 0.3s ease; }
    .ai-pc-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    .ai-pc-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: ${TOKENS.radiusMd} ${TOKENS.radiusMd} 0 0; }
    .ai-pc-img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease; }
    .ai-pc-hover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s ease; }
    .ai-pc-card:hover .ai-pc-hover-img { opacity: 1; }
    .ai-pc-badge { position: absolute; top: 10px; left: 10px; z-index: 2; background: ${TOKENS.naturalWhite}; color: ${TOKENS.textPrimary}; border-radius: ${TOKENS.radiusFull}; padding: 6px 12px; font-family: ${TOKENS.sansFont}; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .ai-pc-swatch { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; box-shadow: none; }
    .ai-pc-swatch:hover { transform: scale(1.1); }
    .ai-pc-swatch.active { border-color: white; box-shadow: 0 0 0 1px #1a1a1a; }
    .ai-pc-scroll { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 0 10px 20px; scrollbar-width: none; }
    .ai-pc-scroll::-webkit-scrollbar { display: none; }
    .ai-pc-scroll > * { scroll-snap-align: start; }
  `;

  return (
    <div
      ref={ref}
      style={{
        padding: "40px 0",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <ScopedStyles id="ai-pc" css={scopedCss} />

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 20px`, marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "20px", overflowX: "auto" }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                fontFamily: TOKENS.monoFont,
                fontSize: "14px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "none",
                border: "none",
                borderBottom: i === activeTab ? "2px solid #1a1a1a" : "2px solid transparent",
                cursor: "pointer",
                padding: "4px 0",
                color: i === activeTab ? TOKENS.textPrimary : "#999",
                transition: "all 0.3s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards scroll */}
      <div ref={scrollRef} className="ai-pc-scroll">
        {products.map((p, i) => (
          <div key={i} className="ai-pc-card">
            {/* Badge */}
            {p.badge && <div className="ai-pc-badge">{p.badge}</div>}

            {/* Image */}
            <Link href={fixLink(p.link)} className="ai-pc-img-wrap">
              <img src={safeSrc(p.image)} alt={p.name} className="ai-pc-img" onError={onImgError} loading="lazy" />
              {p.hoverImage && (
                <img src={safeSrc(p.hoverImage)} alt={`${p.name} hover`} className="ai-pc-hover-img" onError={onImgError} loading="lazy" />
              )}
            </Link>

            {/* Info */}
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px", marginTop: "auto" }}>
              <Link href={fixLink(p.link)} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
                <p style={{ fontFamily: TOKENS.sansFont, fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TOKENS.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </p>
                <p style={{ fontFamily: TOKENS.sansFont, fontSize: "12px", letterSpacing: "0.05em", color: TOKENS.textSecondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.colorway}
                </p>
              </Link>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                {/* Swatches */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {(p.swatches || []).map((sw, si) => (
                    <span key={si} className={`ai-pc-swatch ${si === 0 ? "active" : ""}`} style={{ backgroundColor: sw.color }} title={sw.label} />
                  ))}
                </div>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: TOKENS.sansFont, fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <span style={{ color: TOKENS.textPrimary }}>{p.price}</span>
                  {p.compareAtPrice && (
                    <span style={{ textDecoration: "line-through", opacity: 0.65, color: TOKENS.textSecondary }}>{p.compareAtPrice}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. AI VALUE PROPS — 3-column info tiles (SEO content)
   ═══════════════════════════════════════════════════════════════ */

export interface AiValueProp {
  title: string;
  description: string;
  icon?: string;
}

export interface AiValuePropsProps {
  props: AiValueProp[];
  backgroundColor?: string;
}

export function AiValueProps({ props: valuePropItems, backgroundColor }: AiValuePropsProps) {
  const { ref, inView } = useInView();

  const scopedCss = `
    @media (max-width: 768px) { .ai-vp-grid { grid-template-columns: 1fr !important; } }
  `;

  return (
    <div
      ref={ref}
      style={{
        padding: TOKENS.gap,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <ScopedStyles id="ai-vp" css={scopedCss} />
      <div className="ai-vp-grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${valuePropItems.length}, 1fr)`,
        gap: TOKENS.gap,
        minHeight: "240px",
      }}>
        {valuePropItems.map((vp, i) => (
          <div key={i} style={{
            background: backgroundColor || TOKENS.cardBackground,
            borderRadius: TOKENS.radiusMd,
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <h3 style={{
              fontFamily: TOKENS.serifFont,
              fontSize: "22px",
              fontWeight: 500,
              color: TOKENS.textPrimary,
              margin: "0 0 12px 0",
              lineHeight: 1.3,
            }}>
              {vp.title}
            </h3>
            <p style={{
              fontFamily: TOKENS.sansFont,
              fontSize: "14px",
              lineHeight: 1.7,
              color: TOKENS.textSecondary,
              margin: 0,
            }}>
              {vp.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. AI NEWSLETTER — Email signup section
   ═══════════════════════════════════════════════════════════════ */

export interface AiNewsletterProps {
  heading?: string;
  subheading?: string;
  buttonText?: string;
  backgroundColor?: string;
}

export function AiNewsletter({
  heading = "Subscribe to our emails",
  subheading,
  buttonText = "Sign Up",
  backgroundColor,
}: AiNewsletterProps) {
  const { ref, inView } = useInView();
  const storeCtx = useContext(AiStoreContext);
  const { subscribe, status } = useNewsletterSubscribe(storeCtx?.storeSlug || "");
  const [email, setEmail] = useState("");
  const handleSubscribe = () => { subscribe(email); };

  return (
    <div
      ref={ref}
      style={{
        padding: "60px 20px",
        textAlign: "center",
        background: backgroundColor || "transparent",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <h3 style={{ fontFamily: TOKENS.serifFont, fontSize: "28px", fontWeight: 400, color: TOKENS.textPrimary, margin: "0 0 8px 0" }}>
        {heading}
      </h3>
      {subheading && (
        <p style={{ fontFamily: TOKENS.sansFont, fontSize: "14px", color: TOKENS.textSecondary, margin: "0 0 24px 0" }}>{subheading}</p>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubscribe(); }}
        style={{ display: "flex", gap: "0", maxWidth: "420px", margin: "0 auto", overflow: "hidden", borderRadius: TOKENS.radiusFull, border: "2px solid #1a1a1a" }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{
            flex: 1,
            padding: "14px 20px",
            fontFamily: TOKENS.sansFont,
            fontSize: "14px",
            border: "none",
            outline: "none",
            background: "transparent",
            color: TOKENS.textPrimary,
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: "14px 28px",
            fontFamily: TOKENS.sansFont,
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: TOKENS.textPrimary,
            color: TOKENS.textWhite,
            border: "none",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
        >
          {status === "loading" ? "..." : status === "success" ? "✓" : buttonText}
        </button>
      </form>
      {status === "success" && (
        <p style={{ fontFamily: TOKENS.sansFont, fontSize: "13px", color: "#16a34a", marginTop: "12px" }}>You&apos;re all set!</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. AI FOOTER — Full footer with columns
   ═══════════════════════════════════════════════════════════════ */

export interface AiFooterColumn {
  title: string;
  links: Array<{ text: string; link: string }>;
}

export interface AiFooterProps {
  columns: AiFooterColumn[];
  copyrightText?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  showNewsletter?: boolean;
  newsletterHeading?: string;
}

export function AiFooter({
  columns,
  copyrightText,
  socialLinks,
  showNewsletter = true,
  newsletterHeading = "Subscribe to our emails",
}: AiFooterProps) {
  const fixLink = useFixLink();
  const storeCtx = useContext(AiStoreContext);
  const { subscribe, status } = useNewsletterSubscribe(storeCtx?.storeSlug || "");
  const [email, setEmail] = useState("");
  const handleSubscribe = () => { subscribe(email); };
  const [expandedCol, setExpandedCol] = useState<number | null>(null);

  const scopedCss = `
    .ai-footer a { color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-size: 13px; line-height: 2; }
    .ai-footer a:hover { color: white; }
    .ai-footer-col-title { font-family: ${TOKENS.sansFont}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    @media (min-width: 769px) {
      .ai-footer-col-title { cursor: default; }
      .ai-footer-col-title svg { display: none; }
      .ai-footer-links { display: block !important; }
    }
    @media (max-width: 768px) {
      .ai-footer-grid { grid-template-columns: 1fr !important; }
      .ai-footer-links { display: none; }
      .ai-footer-links.expanded { display: block; }
    }
  `;

  return (
    <footer className="ai-footer" style={{ background: TOKENS.footerBg, color: TOKENS.textWhite, padding: "50px 20px" }}>
      <ScopedStyles id="ai-footer" css={scopedCss} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" }}>
          {/* Newsletter in footer */}
          {showNewsletter && (
            <div>
              <h4 style={{ fontFamily: TOKENS.sansFont, fontSize: "14px", fontWeight: 400, margin: "0 0 16px 0" }}>{newsletterHeading}</h4>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubscribe(); }}
                style={{ display: "flex", gap: 0, maxWidth: "360px", borderRadius: TOKENS.radiusFull, overflow: "hidden", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  style={{ flex: 1, padding: "12px 16px", background: "transparent", border: "none", outline: "none", color: "white", fontFamily: TOKENS.sansFont, fontSize: "13px" }}
                />
                <button type="submit" style={{ padding: "12px 20px", background: "white", color: "black", border: "none", fontFamily: TOKENS.sansFont, fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                  {status === "success" ? "✓" : "Sign Up"}
                </button>
              </form>
              {status === "success" && <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "8px" }}>You&apos;re all set!</p>}
            </div>
          )}

          {/* Link columns */}
          <div className="ai-footer-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: "24px" }}>
            {columns.map((col, i) => (
              <div key={i}>
                <div className="ai-footer-col-title" onClick={() => setExpandedCol(expandedCol === i ? null : i)}>
                  {col.title}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    {expandedCol === i ? <path d="M2 8L6 4L10 8" /> : <path d="M2 4L6 8L10 4" />}
                  </svg>
                </div>
                <div className={`ai-footer-links ${expandedCol === i ? "expanded" : ""}`}>
                  {col.links.map((link, j) => (
                    <div key={j}>
                      <Link href={resolveFooterLink(link.link, link.text, storeCtx?.storeSlug)}>{link.text}</Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social + copyright */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          {socialLinks && socialLinks.length > 0 && (
            <div style={{ display: "flex", gap: "16px" }}>
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{s.platform}</a>
              ))}
            </div>
          )}
          <p style={{ fontFamily: TOKENS.sansFont, fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {copyrightText || `© ${new Date().getFullYear()} All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. AI SECTION TITLE — Reusable section heading
   ═══════════════════════════════════════════════════════════════ */

export interface AiSectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  titleFont?: "serif" | "sans" | "mono";
}

export function AiSectionTitle({ title, subtitle, align = "center", titleFont = "serif" }: AiSectionTitleProps) {
  const fontMap = { serif: TOKENS.serifFont, sans: TOKENS.sansFont, mono: TOKENS.monoFont };
  return (
    <div style={{ textAlign: align, padding: "40px 20px 20px" }}>
      <h2 style={{
        fontFamily: fontMap[titleFont],
        fontSize: "clamp(24px, 4vw, 40px)",
        fontWeight: titleFont === "mono" ? 500 : 400,
        color: TOKENS.textPrimary,
        margin: 0,
        letterSpacing: titleFont === "mono" ? "0.1em" : "0",
        textTransform: titleFont === "mono" ? "uppercase" : "none",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: TOKENS.sansFont, fontSize: "14px", color: TOKENS.textSecondary, margin: "8px 0 0", letterSpacing: "0.02em" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════ */
