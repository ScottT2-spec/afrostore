"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { onImgError, safeSrc } from "./image-fallback";
import { ElectronicsStoreContext } from "./ElectronicsTemplateBlocks";
import { toggleCompare as toggleCompareItem } from "@/lib/compare-utils";
import { FashionFooter } from "./FashionTemplateBlocks";

/* ═══════════════════════════════════════════════════════════════
   HARDWARE HOMEPAGE BLOCKS
   Dark-themed homepage blocks matching Prokip LTD Hardware demo.
   Source: https://prokip.xtemos.com/demo-hardware/?opt=hardware
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS (DARK THEME) ────────────────────────────── */
const T = {
  bg: "#1a1a2e",
  bgDarker: "#0f0f1a",
  bgCard: "#16213e",
  primary: "var(--color-primary)",
  title: "#ffffff",
  text: "rgba(255,255,255,0.65)",
  textLight: "rgba(255,255,255,0.45)",
  border: "rgba(255,255,255,0.08)",
  containerW: "1222px",
  titleFont: "'Poppins', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

const ctr: React.CSSProperties = {
  maxWidth: T.containerW, margin: "0 auto", padding: "0 15px",
  boxSizing: "border-box" as const, width: "100%",
};

function S({ id, css }: { id: string; css: string }) {
  return <style data-hw-home={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

function useSlug() {
  const ctx = useContext(ElectronicsStoreContext);
  return ctx?.storeSlug;
}
function useFix() {
  const slug = useSlug();
  return (link: string) => resolveStoreLink(link, slug);
}
function useSym() {
  const ctx = useContext(ElectronicsStoreContext);
  const m: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  return m[ctx?.currency || "USD"] || ctx?.currency || "$";
}

function normalizeBlogDate(date: unknown): { day: string; month: string } | null {
  if (!date) return null;
  if (typeof date === "object" && date !== null) {
    const maybeDate = date as { day?: unknown; month?: unknown };
    const day = typeof maybeDate.day === "string" || typeof maybeDate.day === "number" ? String(maybeDate.day) : "";
    const month = typeof maybeDate.month === "string" || typeof maybeDate.month === "number" ? String(maybeDate.month) : "";
    return day || month ? { day, month } : null;
  }
  if (typeof date === "string") {
    const parts = date.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return null;
    const [first, second] = parts;
    if (/^\d+$/.test(first || "")) return { day: first, month: second || "" };
    if (/^\d+$/.test(second || "")) return { day: second, month: first || "" };
    return { day: first, month: second || "" };
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   1. HARDWARE HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface HwHeroSlide {
  subtitleTop: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  price?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage: string;
}

export interface HwHeroSliderProps {
  slides: HwHeroSlide[];
  autoplaySpeed?: number;
}

export function HardwareHomeHeroSlider({ slides = [], autoplaySpeed = 5000 }: HwHeroSliderProps) {
  const fix = useFix();
  const [cur, setCur] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => setCur(idx), []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setCur(p => (p + 1) % slides.length), autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, autoplaySpeed]);

  const css = `
    .hwh-slider { position: relative; width: 100%; overflow: hidden; background: ${T.bgDarker}; min-height: 580px; }
    .hwh-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease; display: flex; align-items: center; }
    .hwh-slide.hwh-active { opacity: 1; position: relative; }
    .hwh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
    .hwh-slide-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%); }
    .hwh-content { position: relative; z-index: 2; max-width: 50%; padding: 60px 0; }
    .hwh-sub { color: ${T.primary}; text-transform: uppercase; font-weight: 600; font-size: 14px; font-family: ${T.bodyFont}; margin-bottom: 8px; letter-spacing: 2px; }
    .hwh-title { font-family: ${T.titleFont}; font-weight: 700; font-size: 56px; line-height: 1.1; color: ${T.title}; margin: 0 0 20px; text-transform: uppercase; }
    .hwh-desc { font-family: ${T.bodyFont}; font-size: 15px; line-height: 1.7; color: ${T.text}; margin: 0 0 25px; max-width: 420px; }
    .hwh-price { font-family: ${T.titleFont}; font-weight: 700; font-size: 28px; color: ${T.title}; margin: 0 0 20px; }
    .hwh-btns { display: flex; gap: 15px; flex-wrap: wrap; align-items: center; }
    .hwh-btn { display: inline-block; padding: 14px 35px; background: ${T.primary}; color: #fff; text-transform: uppercase; font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 1px; transition: filter 0.3s; }
    .hwh-btn:hover { filter: brightness(0.85); }
    .hwh-btn-sec { background: transparent; border: 2px solid rgba(255,255,255,0.3); color: #fff; }
    .hwh-btn-sec:hover { border-color: #fff; background: rgba(255,255,255,0.08); filter: none; }
    .hwh-dots { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 5; }
    .hwh-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); background: transparent; cursor: pointer; padding: 0; transition: all 0.3s; }
    .hwh-dot.hwh-dot-on { background: #fff; border-color: #fff; }
    .hwh-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 44px; height: 44px; background: rgba(255,255,255,0.08); color: #fff; border: none; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: background 0.3s; }
    .hwh-nav:hover { background: ${T.primary}; }
    .hwh-nav-p { left: 0; }
    .hwh-nav-n { right: 0; }
    .hwh-anim { animation: hwhFadeUp 0.6s ease forwards; opacity: 0; }
    @keyframes hwhFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1024px) { .hwh-slider { min-height: 500px; } .hwh-title { font-size: 40px; } .hwh-content { max-width: 65%; } }
    @media (max-width: 767px) { .hwh-slider { min-height: 420px; } .hwh-title { font-size: 32px; } .hwh-content { max-width: 85%; } .hwh-nav { display: none; } }
  `;

  return (
    <div className="hwh-slider">
      <S id="hero" css={css} />
      {slides.map((s, i) => (
        <div key={i} className={`hwh-slide ${i === cur ? "hwh-active" : ""}`}>
          <div className="hwh-slide-bg" style={{ backgroundImage: `url(${s.backgroundImage})` }} />
          <div className="hwh-slide-overlay" />
          <div style={ctr}>
            <div className="hwh-content">
              {i === cur && (
                <>
                  <div className="hwh-sub hwh-anim" style={{ animationDelay: "0.1s" }}>{s.subtitleTop}</div>
                  <h2 className="hwh-title hwh-anim" style={{ animationDelay: "0.2s" }}>{s.title}</h2>
                  <p className="hwh-desc hwh-anim" style={{ animationDelay: "0.3s" }}>{s.description}</p>
                  {s.price && <div className="hwh-price hwh-anim" style={{ animationDelay: "0.35s" }}>{s.price}</div>}
                  <div className="hwh-btns hwh-anim" style={{ animationDelay: "0.4s" }}>
                    <Link href={fix(s.buttonLink)} className="hwh-btn">{s.buttonText}</Link>
                    {s.secondaryButtonText && <Link href={fix(s.secondaryButtonLink || "#")} className="hwh-btn hwh-btn-sec">{s.secondaryButtonText}</Link>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button className="hwh-nav hwh-nav-p" onClick={() => goTo((cur - 1 + slides.length) % slides.length)} aria-label="Previous">‹</button>
          <button className="hwh-nav hwh-nav-n" onClick={() => goTo((cur + 1) % slides.length)} aria-label="Next">›</button>
          <div className="hwh-dots">
            {slides.map((_, i) => <button key={i} className={`hwh-dot ${i === cur ? "hwh-dot-on" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. HARDWARE CATEGORY GRID
   ═══════════════════════════════════════════════════════════════ */

export interface HwCategory {
  name: string;
  productCount: number;
  image: string;
  link: string;
}

export interface HwCategoryGridProps {
  categories: HwCategory[];
}

export function HardwareHomeCategoryGrid({ categories = [] }: HwCategoryGridProps) {
  const fix = useFix();
  const css = `
    .hwcg-section { padding: 50px 0; background: ${T.bgDarker}; }
    .hwcg-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; }
    .hwcg-card { position: relative; overflow: hidden; cursor: pointer; min-height: 280px; }
    .hwcg-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s; }
    .hwcg-card:hover img { transform: scale(1.08); }
    .hwcg-ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; transition: background 0.3s; }
    .hwcg-card:hover .hwcg-ov { background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 100%); }
    .hwcg-name { font-family: ${T.titleFont}; font-weight: 600; font-size: 18px; color: #fff; margin: 0 0 4px; }
    .hwcg-count { font-family: ${T.bodyFont}; font-size: 13px; color: ${T.text}; }
    .hwcg-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .hwcg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .hwcg-grid { grid-template-columns: repeat(2, 1fr); } .hwcg-card { min-height: 200px; } }
  `;
  return (
    <div style={{ background: T.bgDarker }}>
      <S id="catgrid" css={css} />
      <div className="hwcg-section" style={ctr}>
        <div className="hwcg-grid">
          {categories.map((c, i) => (
            <div key={i} className="hwcg-card">
              <img src={c.image} alt={c.name} loading="lazy" onError={(e) => onImgError(e, c.name)} />
              <div className="hwcg-ov">
                <h3 className="hwcg-name">{c.name}</h3>
                <span className="hwcg-count">{c.productCount} products</span>
              </div>
              <Link href={fix(c.link)} className="hwcg-link" aria-label={c.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. HARDWARE FEATURED PRODUCTS (with tabs)
   ═══════════════════════════════════════════════════════════════ */

export interface HwFeaturedProductsProps {
  sectionSubtitle?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  tabs?: Array<{ label: string; filter: string }>;
  columns?: number;
  maxProducts?: number;
}

export function HardwareHomeFeaturedProducts({
  sectionSubtitle = "The Takeover Is Complete",
  sectionTitle = "FEATURED PRODUCTS",
  sectionDescription = "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected.",
  tabs,
  columns = 4,
  maxProducts = 8,
}: HwFeaturedProductsProps) {
  const ctx = useContext(ElectronicsStoreContext);
  const sym = useSym();
  const [, setCompareState] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const getFiltered = (filter: string) => {
    if (!ctx?.products?.length) return [];
    let p = ctx.products;
    if (filter === "featured") { const f = p.filter(x => x.isFeatured); if (f.length) p = f; }
    else if (filter === "new") { const f = p.filter(x => x.tags?.some(t => t.toLowerCase().replace(/[-_ ]/g, "") === "newarrival")); if (f.length) p = f; }
    else if (filter === "bestseller") { const f = p.filter(x => x.tags?.some(t => ["bestseller", "topseller"].includes(t.toLowerCase().replace(/[-_ ]/g, "")))); if (f.length) p = f; }
    return p.slice(0, maxProducts);
  };

  const currentFilter = tabs?.[activeTab]?.filter || "featured";
  const products = getFiltered(currentFilter);

  const css = `
    .hwfp-section { padding: 60px 0; background: ${T.bg}; }
    .hwfp-header { text-align: center; margin-bottom: 40px; }
    .hwfp-sub { color: ${T.text}; font-family: ${T.bodyFont}; font-size: 14px; font-style: italic; margin-bottom: 8px; }
    .hwfp-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: ${T.title}; text-transform: uppercase; margin: 0 0 15px; letter-spacing: 0.5px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwfp-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: ${T.primary}; }
    .hwfp-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; max-width: 600px; margin: 0 auto; line-height: 1.7; }
    .hwfp-tabs { display: flex; justify-content: center; gap: 5px; margin-bottom: 30px; }
    .hwfp-tab { padding: 8px 20px; font-size: 13px; font-weight: 600; font-family: ${T.bodyFont}; text-transform: uppercase; border: none; cursor: pointer; background: transparent; color: ${T.text}; transition: all 0.3s; }
    .hwfp-tab:hover { color: ${T.title}; }
    .hwfp-tab-on { background: ${T.primary}; color: #fff; }
    .hwfp-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .hwfp-card { background: ${T.bgCard}; overflow: hidden; transition: box-shadow 0.3s; position: relative; border: 1px solid ${T.border}; }
    .hwfp-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
    .hwfp-thumb { position: relative; overflow: hidden; background: #0d1117; aspect-ratio: 1; }
    .hwfp-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .hwfp-card:hover .hwfp-thumb img { transform: scale(1.05); }
    .hwfp-badge { position: absolute; top: 8px; left: 8px; background: ${T.primary}; color: #fff; font-size: 11px; font-weight: 600; padding: 3px 8px; z-index: 2; text-transform: uppercase; }
    .hwfp-actions { position: absolute; top: 8px; right: 8px; display: flex; flex-direction: column; gap: 4px; opacity: 0; transform: translateX(10px); transition: all 0.3s; z-index: 3; }
    .hwfp-card:hover .hwfp-actions { opacity: 1; transform: translateX(0); }
    .hwfp-act { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s; color: #333; }
    .hwfp-act:hover { background: ${T.primary}; color: #fff; }
    .hwfp-info { padding: 15px; }
    .hwfp-cat { font-size: 12px; color: ${T.textLight}; margin-bottom: 4px; font-family: ${T.bodyFont}; }
    .hwfp-name { font-family: ${T.titleFont}; font-weight: 500; font-size: 14px; color: ${T.title}; margin: 0 0 8px; line-height: 1.3; }
    .hwfp-name a { color: inherit; text-decoration: none; }
    .hwfp-name a:hover { color: ${T.primary}; }
    .hwfp-price { font-weight: 600; font-size: 15px; color: ${T.primary}; font-family: ${T.bodyFont}; }
    .hwfp-price-old { text-decoration: line-through; color: ${T.textLight}; font-weight: 400; margin-right: 8px; font-size: 13px; }
    .hwfp-add { display: block; width: 100%; padding: 10px; background: ${T.primary}; color: #fff; border: none; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${T.bodyFont}; cursor: pointer; opacity: 0; transform: translateY(100%); transition: all 0.3s; }
    .hwfp-card:hover .hwfp-add { opacity: 1; transform: translateY(0); }
    .hwfp-empty { text-align: center; padding: 40px; color: ${T.text}; font-family: ${T.bodyFont}; }
    @media (max-width: 1024px) { .hwfp-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .hwfp-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div style={{ background: T.bg }}>
      <S id="featured" css={css} />
      <div className="hwfp-section" style={ctr}>
        <div className="hwfp-header">
          {sectionSubtitle && <div className="hwfp-sub">{sectionSubtitle}</div>}
          <h2 className="hwfp-title">{sectionTitle}</h2>
          {sectionDescription && <p className="hwfp-desc">{sectionDescription}</p>}
        </div>
        {tabs && tabs.length > 0 && (
          <div className="hwfp-tabs">
            {tabs.map((t, i) => <button key={i} className={`hwfp-tab ${i === activeTab ? "hwfp-tab-on" : ""}`} onClick={() => setActiveTab(i)}>{t.label}</button>)}
          </div>
        )}
        {products.length === 0 ? (
          <div className="hwfp-empty"><p>No products yet. Add products from your dashboard to see them here.</p></div>
        ) : (
          <div className="hwfp-grid">
            {products.map(p => {
              const link = ctx ? `/store/${ctx.storeSlug}/product/${p.slug}` : "#";
              return (
                <div key={p.id} className="hwfp-card">
                  <div className="hwfp-thumb">
                    <Link href={link}><img src={safeSrc(p.images[0]?.url, p.name)} alt={p.name} loading="lazy" onError={(e) => onImgError(e, p.name)} /></Link>
                    {p.compareAtPrice && <span className="hwfp-badge">SALE</span>}
                    {!p.compareAtPrice && p.isFeatured && <span className="hwfp-badge">HOT</span>}
                    <div className="hwfp-actions">
                      <button className="hwfp-act" title="Quick view" onClick={() => ctx?.onQuickView?.(String(p.id))}>👁</button>
                      <button className="hwfp-act" title="Wishlist" onClick={() => ctx?.toggleWishlist?.(String(p.id))} style={ctx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{ctx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                      <button className="hwfp-act" title="Compare" onClick={() => { toggleCompareItem({ id: String(p.id), name: p.name, slug: p.slug, price: p.price, image: p.images?.[0]?.url }, ctx?.storeSlug); setCompareState(v => !v); }}>⇌</button>
                    </div>
                  </div>
                  <div className="hwfp-info">
                    {p.category && <div className="hwfp-cat">{p.category.name}</div>}
                    <h3 className="hwfp-name"><Link href={link}>{p.name}</Link></h3>
                    <div className="hwfp-price">
                      {p.compareAtPrice && <span className="hwfp-price-old">{sym}{p.compareAtPrice.toLocaleString()}</span>}
                      <span>{sym}{p.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="hwfp-add" onClick={() => ctx?.addToCart?.(String(p.id))}>Add to cart</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. HARDWARE BUILD PC
   ═══════════════════════════════════════════════════════════════ */

export interface HwBuildPCSpec { icon: string; title: string; description: string; }
export interface HwBuildPCProps {
  progressPercent?: number;
  subtitle?: string;
  title?: string;
  description?: string;
  specs?: HwBuildPCSpec[];
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export function HardwareHomeBuildPC({
  progressPercent = 0,
  subtitle = "Build Your",
  title = "NEW PC",
  description,
  specs = [],
  primaryButtonText = "NEXT STEP",
  primaryButtonLink = "#",
  secondaryButtonText = "Choose PC-Case",
  secondaryButtonLink = "#",
}: HwBuildPCProps) {
  const fix = useFix();
  const css = `
    .hwbpc-section { padding: 70px 0; background: ${T.bgDarker}; }
    .hwbpc-layout { display: flex; align-items: center; gap: 60px; }
    .hwbpc-left { flex: 1; }
    .hwbpc-progress { width: 100%; height: 6px; background: rgba(255,255,255,0.1); margin-bottom: 20px; overflow: hidden; }
    .hwbpc-bar { height: 100%; background: ${T.primary}; transition: width 1s ease; }
    .hwbpc-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; font-style: italic; margin-bottom: 5px; }
    .hwbpc-title { font-family: ${T.titleFont}; font-weight: 700; font-size: 38px; color: ${T.title}; text-transform: uppercase; margin: 0 0 20px; }
    .hwbpc-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; line-height: 1.7; margin: 0 0 30px; max-width: 450px; }
    .hwbpc-right { flex: 1; display: flex; flex-direction: column; gap: 25px; }
    .hwbpc-spec { display: flex; align-items: flex-start; gap: 15px; }
    .hwbpc-spec-icon { width: 50px; height: 50px; flex-shrink: 0; }
    .hwbpc-spec-icon img { width: 100%; height: 100%; filter: brightness(0) invert(1); }
    .hwbpc-spec-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 15px; color: ${T.title}; text-transform: uppercase; margin: 0 0 4px; }
    .hwbpc-spec-desc { font-family: ${T.bodyFont}; font-size: 13px; color: ${T.text}; margin: 0; }
    .hwbpc-btns { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px; }
    .hwbpc-btn { display: inline-block; padding: 14px 35px; background: ${T.primary}; color: #fff; text-transform: uppercase; font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 1px; transition: filter 0.3s; }
    .hwbpc-btn:hover { filter: brightness(0.85); }
    .hwbpc-btn-sec { background: transparent; border: 2px solid rgba(255,255,255,0.25); color: #fff; }
    .hwbpc-btn-sec:hover { border-color: #fff; background: rgba(255,255,255,0.05); filter: none; }
    @media (max-width: 1024px) { .hwbpc-layout { flex-direction: column; gap: 30px; } }
  `;
  return (
    <div style={{ background: T.bgDarker }}>
      <S id="buildpc" css={css} />
      <div className="hwbpc-section" style={ctr}>
        <div className="hwbpc-layout">
          <div className="hwbpc-left">
            <div className="hwbpc-progress"><div className="hwbpc-bar" style={{ width: `${progressPercent}%` }} /></div>
            <div className="hwbpc-sub">{subtitle}</div>
            <h2 className="hwbpc-title">{title}</h2>
            {description && <p className="hwbpc-desc">{description}</p>}
            <div className="hwbpc-btns">
              <Link href={fix(primaryButtonLink)} className="hwbpc-btn">{primaryButtonText}</Link>
              {secondaryButtonText && <Link href={fix(secondaryButtonLink)} className="hwbpc-btn hwbpc-btn-sec">{secondaryButtonText}</Link>}
            </div>
          </div>
          <div className="hwbpc-right">
            {specs.map((s, i) => (
              <div key={i} className="hwbpc-spec">
                <div className="hwbpc-spec-icon"><img src={s.icon} alt={s.title} onError={(e) => onImgError(e, s.title)} /></div>
                <div>
                  <h4 className="hwbpc-spec-title">{s.title}</h4>
                  <p className="hwbpc-spec-desc">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. HARDWARE PRICING TABLE (READY PC BUILDS)
   ═══════════════════════════════════════════════════════════════ */

export interface HwPricingTier {
  name: string;
  price: string;
  priceLabel?: string;
  specs: string[];
  buttonText?: string;
  buttonLink?: string;
  highlighted?: boolean;
}

export interface HwPricingTableProps {
  subtitle?: string;
  title?: string;
  description?: string;
  tiers: HwPricingTier[];
}

export function HardwareHomePricingTable({
  subtitle = "Play Like The Pros",
  title = "READY PC BUILDS",
  description,
  tiers,
}: HwPricingTableProps) {
  const fix = useFix();
  const css = `
    .hwpt-section { padding: 70px 0; background: ${T.bg}; }
    .hwpt-header { text-align: center; margin-bottom: 45px; }
    .hwpt-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; font-style: italic; margin-bottom: 5px; }
    .hwpt-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: ${T.title}; text-transform: uppercase; margin: 0 0 15px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwpt-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: ${T.primary}; }
    .hwpt-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; max-width: 600px; margin: 0 auto; line-height: 1.7; }
    .hwpt-grid { display: grid; grid-template-columns: repeat(${tiers.length}, 1fr); gap: 0; }
    .hwpt-tier { text-align: center; padding: 40px 25px; border: 1px solid ${T.border}; background: ${T.bgCard}; transition: transform 0.3s, box-shadow 0.3s; }
    .hwpt-tier:hover { transform: translateY(-5px); box-shadow: 0 10px 40px rgba(0,0,0,0.4); z-index: 2; }
    .hwpt-tier-hl { background: ${T.primary}; border-color: ${T.primary}; }
    .hwpt-tier-name { font-family: ${T.titleFont}; font-weight: 600; font-size: 14px; color: ${T.title}; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px; }
    .hwpt-tier-price { font-family: ${T.titleFont}; font-weight: 700; font-size: 36px; color: ${T.title}; margin: 0 0 5px; }
    .hwpt-tier-label { font-family: ${T.bodyFont}; font-size: 12px; color: ${T.text}; margin: 0 0 25px; }
    .hwpt-specs { list-style: none; padding: 0; margin: 0 0 25px; }
    .hwpt-specs li { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; padding: 8px 0; border-bottom: 1px solid ${T.border}; }
    .hwpt-tier-hl .hwpt-specs li { border-color: rgba(255,255,255,0.2); }
    .hwpt-buy { display: inline-block; padding: 12px 30px; background: transparent; border: 2px solid ${T.title}; color: ${T.title}; text-transform: uppercase; font-family: ${T.bodyFont}; font-weight: 700; font-size: 12px; text-decoration: none; letter-spacing: 1px; transition: all 0.3s; }
    .hwpt-buy:hover { background: ${T.title}; color: ${T.bgCard}; }
    .hwpt-tier-hl .hwpt-buy { border-color: #fff; color: #fff; }
    .hwpt-tier-hl .hwpt-buy:hover { background: #fff; color: ${T.primary}; }
    @media (max-width: 1024px) { .hwpt-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .hwpt-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={{ background: T.bg }}>
      <S id="pricing" css={css} />
      <div className="hwpt-section" style={ctr}>
        <div className="hwpt-header">
          {subtitle && <div className="hwpt-sub">{subtitle}</div>}
          <h2 className="hwpt-title">{title}</h2>
          {description && <p className="hwpt-desc">{description}</p>}
        </div>
        <div className="hwpt-grid">
          {tiers.map((t, i) => (
            <div key={i} className={`hwpt-tier ${t.highlighted ? "hwpt-tier-hl" : ""}`}>
              <h3 className="hwpt-tier-name">{t.name}</h3>
              <div className="hwpt-tier-price">{t.price}</div>
              {t.priceLabel && <div className="hwpt-tier-label">{t.priceLabel}</div>}
              <ul className="hwpt-specs">
                {t.specs.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
              <Link href={fix(t.buttonLink || "/shop")} className="hwpt-buy">{t.buttonText || "BUY NOW"}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. HARDWARE GEAR UP CTA
   ═══════════════════════════════════════════════════════════════ */

export interface HwGearUpCTAProps {
  subtitle?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  videoUrl?: string;
}

export function HardwareHomeGearUpCTA({
  subtitle = "Gear Up",
  title = "THROW DOWN",
  description,
  primaryButtonText = "VIEW MORE",
  primaryButtonLink = "#",
  secondaryButtonText = "GO TO SHOP",
  secondaryButtonLink = "/shop",
  image,
  videoUrl,
}: HwGearUpCTAProps) {
  const fix = useFix();
  const [playing, setPlaying] = useState(false);
  const getEmbed = (url: string) => { const m = url?.match(/(?:watch\?v=|youtu\.be\/)([^&?]+)/); return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url; };

  const css = `
    .hwgu-section { padding: 70px 0; background: ${T.bgDarker}; }
    .hwgu-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; }
    .hwgu-text {}
    .hwgu-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; font-style: italic; margin-bottom: 5px; }
    .hwgu-title { font-family: ${T.titleFont}; font-weight: 700; font-size: 38px; color: ${T.title}; text-transform: uppercase; margin: 0 0 20px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwgu-title::after { content: ''; position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: ${T.primary}; }
    .hwgu-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; line-height: 1.8; margin: 0 0 30px; }
    .hwgu-btns { display: flex; gap: 15px; flex-wrap: wrap; }
    .hwgu-btn { display: inline-block; padding: 14px 35px; background: ${T.primary}; color: #fff; text-transform: uppercase; font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 1px; transition: filter 0.3s; }
    .hwgu-btn:hover { filter: brightness(0.85); }
    .hwgu-btn-sec { background: transparent; border: 2px solid rgba(255,255,255,0.25); }
    .hwgu-btn-sec:hover { border-color: #fff; background: rgba(255,255,255,0.05); filter: none; }
    .hwgu-img-wrap { position: relative; overflow: hidden; }
    .hwgu-img { width: 100%; height: auto; display: block; }
    .hwgu-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
    .hwgu-play:hover { background: ${T.primary}; border-color: ${T.primary}; }
    .hwgu-play::after { content: '▶'; color: #fff; font-size: 20px; margin-left: 3px; }
    .hwgu-iframe { width: 100%; aspect-ratio: 16/9; border: none; }
    @media (max-width: 1024px) { .hwgu-layout { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={{ background: T.bgDarker }}>
      <S id="gearup" css={css} />
      <div className="hwgu-section" style={ctr}>
        <div className="hwgu-layout">
          <div className="hwgu-text">
            {subtitle && <div className="hwgu-sub">{subtitle}</div>}
            <h2 className="hwgu-title">{title}</h2>
            {description && <p className="hwgu-desc">{description}</p>}
            <div className="hwgu-btns">
              <Link href={fix(primaryButtonLink)} className="hwgu-btn">{primaryButtonText}</Link>
              {secondaryButtonText && <Link href={fix(secondaryButtonLink)} className="hwgu-btn hwgu-btn-sec">{secondaryButtonText}</Link>}
            </div>
          </div>
          <div className="hwgu-img-wrap">
            {playing && videoUrl ? (
              <iframe className="hwgu-iframe" src={getEmbed(videoUrl)} allow="autoplay; encrypted-media" allowFullScreen />
            ) : (
              <>
                <img src={image} alt={title} className="hwgu-img" loading="lazy" onError={(e) => onImgError(e, "gear-up")} />
                {videoUrl && <div className="hwgu-play" onClick={() => setPlaying(true)} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. HARDWARE CUSTOM DESKTOPS
   ═══════════════════════════════════════════════════════════════ */

export interface HwDesktop {
  name: string;
  image: string;
  specs: string[];
  link?: string;
}

export interface HwCustomDesktopsProps {
  subtitle?: string;
  title?: string;
  description?: string;
  desktops: HwDesktop[];
}

export function HardwareHomeCustomDesktops({
  subtitle = "Light On The Wallet",
  title = "CUSTOM DESKTOPS",
  description,
  desktops,
}: HwCustomDesktopsProps) {
  const fix = useFix();
  const css = `
    .hwcd-section { padding: 70px 0; background: ${T.bg}; }
    .hwcd-header { text-align: center; margin-bottom: 45px; }
    .hwcd-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; font-style: italic; margin-bottom: 5px; }
    .hwcd-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: ${T.title}; text-transform: uppercase; margin: 0 0 15px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwcd-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: ${T.primary}; }
    .hwcd-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; max-width: 600px; margin: 0 auto; line-height: 1.7; }
    .hwcd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; }
    .hwcd-card { text-align: center; background: ${T.bgCard}; border: 1px solid ${T.border}; padding: 30px 20px; transition: transform 0.3s, box-shadow 0.3s; }
    .hwcd-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .hwcd-img { width: 100%; max-height: 200px; object-fit: contain; margin-bottom: 20px; }
    .hwcd-name { font-family: ${T.titleFont}; font-weight: 600; font-size: 18px; color: ${T.title}; margin: 0 0 15px; }
    .hwcd-specs { list-style: none; padding: 0; margin: 0 0 20px; }
    .hwcd-specs li { font-family: ${T.bodyFont}; font-size: 13px; color: ${T.text}; padding: 6px 0; display: flex; align-items: center; gap: 8px; justify-content: center; }
    .hwcd-check { color: ${T.primary}; font-size: 14px; }
    .hwcd-more { display: inline-block; padding: 10px 25px; border: 2px solid rgba(255,255,255,0.2); color: ${T.title}; text-transform: uppercase; font-family: ${T.bodyFont}; font-weight: 700; font-size: 12px; text-decoration: none; letter-spacing: 1px; transition: all 0.3s; }
    .hwcd-more:hover { border-color: ${T.primary}; background: ${T.primary}; }
    @media (max-width: 1024px) { .hwcd-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .hwcd-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={{ background: T.bg }}>
      <S id="desktops" css={css} />
      <div className="hwcd-section" style={ctr}>
        <div className="hwcd-header">
          {subtitle && <div className="hwcd-sub">{subtitle}</div>}
          <h2 className="hwcd-title">{title}</h2>
          {description && <p className="hwcd-desc">{description}</p>}
        </div>
        <div className="hwcd-grid">
          {desktops.map((d, i) => (
            <div key={i} className="hwcd-card">
              <img src={d.image} alt={d.name} className="hwcd-img" loading="lazy" onError={(e) => onImgError(e, d.name)} />
              <h3 className="hwcd-name">{d.name}</h3>
              <ul className="hwcd-specs">
                {d.specs.map((s, j) => <li key={j}><span className="hwcd-check">✓</span>{s}</li>)}
              </ul>
              <Link href={fix(d.link || "#")} className="hwcd-more">READ MORE</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. HARDWARE GAMING GALLERY
   ═══════════════════════════════════════════════════════════════ */

export interface HwGamingGalleryProps {
  subtitle?: string;
  title?: string;
  description?: string;
  images: string[];
}

export function HardwareHomeGamingGallery({
  subtitle = "Heavy On Power",
  title = "GAMING SETUP",
  description,
  images,
}: HwGamingGalleryProps) {
  const css = `
    .hwgg-section { padding: 70px 0; background: ${T.bgDarker}; }
    .hwgg-header { text-align: center; margin-bottom: 40px; }
    .hwgg-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; font-style: italic; margin-bottom: 5px; }
    .hwgg-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: ${T.title}; text-transform: uppercase; margin: 0 0 15px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwgg-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: ${T.primary}; }
    .hwgg-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; max-width: 600px; margin: 0 auto; line-height: 1.7; }
    .hwgg-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .hwgg-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; cursor: pointer; transition: opacity 0.3s, transform 0.4s; }
    .hwgg-img:hover { opacity: 0.8; transform: scale(1.02); }
    @media (max-width: 1024px) { .hwgg-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 767px) { .hwgg-grid { grid-template-columns: repeat(2, 1fr); } }
  `;
  return (
    <div style={{ background: T.bgDarker }}>
      <S id="gallery" css={css} />
      <div className="hwgg-section" style={ctr}>
        <div className="hwgg-header">
          {subtitle && <div className="hwgg-sub">{subtitle}</div>}
          <h2 className="hwgg-title">{title}</h2>
          {description && <p className="hwgg-desc">{description}</p>}
        </div>
        <div className="hwgg-grid">
          {images.map((img, i) => <img key={i} src={img} alt={`Setup ${i + 1}`} className="hwgg-img" loading="lazy" onError={(e) => onImgError(e, "gallery")} />)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. HARDWARE TESTIMONIAL
   ═══════════════════════════════════════════════════════════════ */

export interface HwTestimonialProps {
  subtitle?: string;
  title?: string;
  description?: string;
  quote: string;
  author: string;
  signatureImage?: string;
  avatarImages?: string[];
}

export function HardwareHomeTestimonial({
  subtitle = "POWER AND BEAUTY",
  title = "IN ONE CASE",
  description,
  quote,
  author,
  signatureImage,
  avatarImages = [],
}: HwTestimonialProps) {
  const css = `
    .hwt-section { padding: 70px 0; background: ${T.bg}; text-align: center; }
    .hwt-avatars { display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; }
    .hwt-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid ${T.border}; }
    .hwt-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
    .hwt-title { font-family: ${T.titleFont}; font-weight: 700; font-size: 38px; color: ${T.title}; text-transform: uppercase; margin: 0 0 20px; }
    .hwt-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; max-width: 600px; margin: 0 auto 30px; line-height: 1.8; }
    .hwt-quote { font-family: ${T.titleFont}; font-size: 18px; font-style: italic; color: ${T.title}; line-height: 1.6; max-width: 700px; margin: 0 auto 20px; }
    .hwt-author { font-family: ${T.titleFont}; font-weight: 600; font-size: 14px; color: ${T.title}; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px; }
    .hwt-sig { max-width: 120px; margin: 0 auto; opacity: 0.7; filter: brightness(0) invert(1); }
  `;
  return (
    <div style={{ background: T.bg }}>
      <S id="testimonial" css={css} />
      <div className="hwt-section" style={ctr}>
        {avatarImages.length > 0 && (
          <div className="hwt-avatars">
            {avatarImages.map((img, i) => <img key={i} src={img} alt="Reviewer" className="hwt-avatar" loading="lazy" onError={(e) => onImgError(e, "avatar")} />)}
          </div>
        )}
        {subtitle && <div className="hwt-sub">{subtitle}</div>}
        <h2 className="hwt-title">{title}</h2>
        {description && <p className="hwt-desc">{description}</p>}
        <blockquote className="hwt-quote">&ldquo;{quote}&rdquo;</blockquote>
        <p className="hwt-author">{author}</p>
        {signatureImage && <img src={signatureImage} alt="Signature" className="hwt-sig" loading="lazy" onError={(e) => onImgError(e, "signature")} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. HARDWARE LATEST EVENTS (BLOG)
   ═══════════════════════════════════════════════════════════════ */

export interface HwBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string };
  categories: string[];
  author: string;
  link: string;
  comments?: number;
}

export interface HwLatestEventsProps {
  subtitle?: string;
  title?: string;
  description?: string;
  posts?: HwBlogPost[];
  columns?: number;
}

export function HardwareHomeLatestEvents({
  subtitle = "Find Out Our",
  title = "LATEST EVENTS",
  description,
  posts: propPosts,
  columns = 4,
}: HwLatestEventsProps) {
  const ctx = useContext(ElectronicsStoreContext);

  const posts: HwBlogPost[] = (() => {
    if (!ctx?.blogs?.length) return propPosts || [];
    return ctx.blogs.slice(0, columns * 2).map(b => {
      const d = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return {
        image: b.coverImage || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
        title: b.title,
        excerpt: b.excerpt || "",
        date: { day: d.getDate().toString().padStart(2, "0"), month: d.toLocaleString("en-US", { month: "short" }) },
        categories: b.category ? [b.category] : ["Tech"],
        author: b.author || "Store Team",
        link: `/store/${ctx.storeSlug}/blog/${b.slug}`,
        comments: 0,
      };
    });
  })();

  const css = `
    .hwle-section { padding: 70px 0; background: ${T.bgDarker}; }
    .hwle-header { text-align: center; margin-bottom: 45px; }
    .hwle-sub { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; font-style: italic; margin-bottom: 5px; }
    .hwle-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: ${T.title}; text-transform: uppercase; margin: 0 0 15px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwle-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: ${T.primary}; }
    .hwle-desc { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.text}; max-width: 600px; margin: 0 auto; line-height: 1.7; }
    .hwle-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 25px; }
    .hwle-card { background: ${T.bgCard}; border: 1px solid ${T.border}; overflow: hidden; transition: box-shadow 0.3s; }
    .hwle-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
    .hwle-img-wrap { position: relative; overflow: hidden; aspect-ratio: 16/10; }
    .hwle-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .hwle-card:hover .hwle-img { transform: scale(1.05); }
    .hwle-date { position: absolute; top: 15px; left: 15px; background: ${T.primary}; color: #fff; text-align: center; padding: 8px 10px; z-index: 2; }
    .hwle-date-day { display: block; font-size: 18px; font-weight: 700; line-height: 1; font-family: ${T.titleFont}; }
    .hwle-date-month { display: block; font-size: 10px; text-transform: uppercase; font-family: ${T.bodyFont}; }
    .hwle-body { padding: 20px; }
    .hwle-cats { font-size: 11px; color: ${T.primary}; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; font-family: ${T.bodyFont}; }
    .hwle-pname { font-family: ${T.titleFont}; font-weight: 500; font-size: 16px; color: ${T.title}; margin: 0 0 8px; line-height: 1.4; }
    .hwle-pname a { color: inherit; text-decoration: none; }
    .hwle-pname a:hover { color: ${T.primary}; }
    .hwle-meta { font-size: 12px; color: ${T.textLight}; font-family: ${T.bodyFont}; }
    .hwle-excerpt { font-family: ${T.bodyFont}; font-size: 13px; color: ${T.text}; line-height: 1.6; margin-top: 10px; }
    .hwle-read { display: inline-block; margin-top: 12px; color: ${T.primary}; font-family: ${T.bodyFont}; font-size: 13px; font-weight: 600; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; }
    .hwle-read:hover { text-decoration: underline; }
    @media (max-width: 1024px) { .hwle-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .hwle-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={{ background: T.bgDarker }}>
      <S id="events" css={css} />
      <div className="hwle-section" style={ctr}>
        <div className="hwle-header">
          {subtitle && <div className="hwle-sub">{subtitle}</div>}
          <h2 className="hwle-title">{title}</h2>
          {description && <p className="hwle-desc">{description}</p>}
        </div>
        <div className="hwle-grid">
          {posts.map((p, i) => {
            const normalizedDate = normalizeBlogDate((p as any).date);
            return (
            <article key={i} className="hwle-card">
              <div className="hwle-img-wrap">
                <img src={p.image} alt={p.title} className="hwle-img" loading="lazy" onError={(e) => onImgError(e, p.title)} />
                {normalizedDate && (
                  <div className="hwle-date">
                    <span className="hwle-date-day">{normalizedDate.day}</span>
                    <span className="hwle-date-month">{normalizedDate.month}</span>
                  </div>
                )}
              </div>
              <div className="hwle-body">
                <div className="hwle-cats">{p.categories.join(", ")}</div>
                <h3 className="hwle-pname"><Link href={resolveStoreLink(p.link, ctx?.storeSlug)}>{p.title}</Link></h3>
                <div className="hwle-meta">By {p.author}{p.comments !== undefined ? ` • ${p.comments} comments` : ""}</div>
                {p.excerpt && <p className="hwle-excerpt">{p.excerpt}</p>}
                <Link href={resolveStoreLink(p.link, ctx?.storeSlug)} className="hwle-read">Continue reading</Link>
              </div>
            </article>
          );})}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. HARDWARE NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */

export interface HwNewsletterProps {
  subtitle?: string;
  title?: string;
  privacyText?: string;
}

export function HardwareHomeNewsletter({
  subtitle = "CURABITUR ALIQUET QUAM POSUERE",
  title = "DO YOU LIKE THE THEME? SHARE WITH YOUR FRIENDS!",
  privacyText = "Will be used in accordance with our Privacy Policy",
}: HwNewsletterProps) {
  const css = `
    .hwnl-section { padding: 60px 0; background: ${T.bg}; text-align: center; border-top: 1px solid ${T.border}; }
    .hwnl-sub { font-family: ${T.bodyFont}; font-size: 12px; color: ${T.textLight}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .hwnl-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: ${T.title}; text-transform: uppercase; margin: 0 0 25px; position: relative; display: inline-block; padding-bottom: 12px; }
    .hwnl-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: ${T.primary}; }
    .hwnl-form { display: flex; max-width: 500px; margin: 0 auto 15px; }
    .hwnl-input { flex: 1; padding: 14px 16px; font-family: ${T.bodyFont}; font-size: 14px; border: 1px solid ${T.border}; background: rgba(255,255,255,0.05); color: #fff; outline: none; }
    .hwnl-input::placeholder { color: ${T.textLight}; }
    .hwnl-submit { padding: 14px 25px; background: ${T.primary}; color: #fff; border: none; font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: filter 0.3s; }
    .hwnl-submit:hover { filter: brightness(0.85); }
    .hwnl-privacy { font-family: ${T.bodyFont}; font-size: 12px; color: ${T.textLight}; }
    .hwnl-privacy a { color: ${T.primary}; text-decoration: none; }
    @media (max-width: 767px) { .hwnl-form { flex-direction: column; gap: 10px; } }
  `;
  return (
    <div style={{ background: T.bg }}>
      <S id="newsletter" css={css} />
      <div className="hwnl-section" style={ctr}>
        {subtitle && <div className="hwnl-sub">{subtitle}</div>}
        <h2 className="hwnl-title">{title}</h2>
        <form className="hwnl-form" onSubmit={e => e.preventDefault()}>
          <input className="hwnl-input" type="email" placeholder="Your email address" />
          <button className="hwnl-submit" type="submit">Subscribe</button>
        </form>
        {privacyText && <p className="hwnl-privacy">{privacyText}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. HARDWARE FOOTER
   ═══════════════════════════════════════════════════════════════ */

export function HardwareHomeFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const ctx = useContext(ElectronicsStoreContext);
  // Wrap FashionFooter in a dark background container
  const css = `
    .hwf-wrap { background: ${T.bgDarker}; color: ${T.text}; }
    .hwf-wrap a { color: ${T.text}; }
    .hwf-wrap a:hover { color: ${T.title}; }
  `;
  return (
    <div className="hwf-wrap">
      <S id="footer" css={css} />
      <FashionFooter {...props} storeSlug={ctx?.storeSlug} />
    </div>
  );
}
