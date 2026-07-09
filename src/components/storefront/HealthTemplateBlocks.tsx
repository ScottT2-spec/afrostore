"use client";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   HEALTH (PILLS & SUPPLEMENTS) TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Pills template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "rgb(136,173,153)",
  primaryHover: "rgb(110,150,130)",
  titleColor: "#333333",
  textColor: "#777777",
  entityTitleColor: "#333333",
  linkColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#ffffff",
  containerWidth: "1222px",
  borderRadius: "15px",
  titleFont: "'Geologica', Arial, Helvetica, sans-serif",
  bodyFont: "'Cabin', Arial, Helvetica, sans-serif",
  altFont: "'Lato', Arial, Helvetica, sans-serif",
  bgLight: "#f7f7f7",
};

const IMG = "https://woodmart.xtemos.com/pills/wp-content/uploads/sites/15";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function HealthFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Geologica:wght@500&family=Cabin:wght@400;600&family=Lato:wght@400&display=swap');
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
  return <style data-health-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

export interface HealthProduct {
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

export interface HealthStoreContextData {
  storeSlug?: string;
  products?: HealthProduct[];
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

export const HealthStoreContext = createContext<HealthStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HEALTH HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HealthHeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

export function HealthHero({
  title = "Feel Healthy and Energetic With Our Vitamins",
  subtitle = "Our mission is to make you healthy and happy, for this we use only natural and high-quality ingredients necessary to achieve an extraordinary effect.",
  buttonText = "Shop Now",
  buttonLink = "#",
  backgroundImage = `${IMG}/2023/08/w-pas-first-screen.jpg`,
}: HealthHeroProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const css = `
    .hh-hero { position: relative; width: 100%; min-height: 660px; display: flex; align-items: center; overflow: hidden; background: ${TOKENS.bgLight}; }
    .hh-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .hh-hero-content { position: relative; z-index: 2; max-width: 760px; }
    .hh-hero-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 58px; line-height: 68px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .hh-hero-sub { font-family: ${TOKENS.bodyFont}; font-size: 22px; line-height: 32px; color: ${TOKENS.textColor}; max-width: 780px; margin: 0 0 30px; }
    .hh-hero-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 35px; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.3s; }
    .hh-hero-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 1024px) { .hh-hero { min-height: 500px; } .hh-hero-title { font-size: 42px; line-height: 52px; } .hh-hero-sub { font-size: 20px; line-height: 30px; } }
    @media (max-width: 767px) { .hh-hero { min-height: 400px; } .hh-hero-title { font-size: 32px; line-height: 42px; } .hh-hero-sub { font-size: 18px; line-height: 28px; } }
  `;

  return (
    <div className="hh-hero">
      <ScopedStyles id="hero" css={css} />
      <div className="hh-hero-bg" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div style={containerStyle}>
        <div className="hh-hero-content">
          <h1 className="hh-hero-title">{title}</h1>
          <p className="hh-hero-sub">{subtitle}</p>
          <Link href={fixLink(buttonLink)} className="hh-hero-btn">{buttonText}</Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. MARQUEE BANNER
   ═══════════════════════════════════════════════════════════════ */

export interface HealthMarqueeProps {
  items?: string[];
  speed?: number;
}

export function HealthMarquee({ items = ["Free Shipping from $30!", "Lots of vitamins and supplements"], speed = 10 }: HealthMarqueeProps) {
  const css = `
    .hh-marquee-wrap { overflow: hidden; padding: 12px 0; border-bottom: 1px solid #eee; }
    .hh-marquee { display: flex; animation: hhMarquee ${speed}s linear infinite; white-space: nowrap; }
    .hh-marquee-item { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.titleColor}; padding: 0 40px; flex-shrink: 0; display: flex; align-items: center; gap: 40px; }
    .hh-marquee-dot { width: 5px; height: 5px; border-radius: 50%; background: ${TOKENS.titleColor}; display: inline-block; }
    @keyframes hhMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  `;
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className="hh-marquee-wrap">
      <ScopedStyles id="marquee" css={css} />
      <div className="hh-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="hh-marquee-item">
            <span className="hh-marquee-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PROMO BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface HealthPromoBanner {
  image: string;
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  colorScheme?: "light" | "dark";
  height?: string;
}

export interface HealthPromoBannersProps {
  banners?: HealthPromoBanner[];
}

export function HealthPromoBanners({ banners }: HealthPromoBannersProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultBanners: HealthPromoBanner[] = [
    { image: `${IMG}/2024/03/w-pas-banner-1.jpg`, subtitle: "Save 15%", title: "Bundles", buttonText: "Shop by Need", buttonLink: "#", colorScheme: "light", height: "456px" },
    { image: `${IMG}/2024/03/w-pas-dropdown-banner-gummy.jpg`, title: "Sleep Easy Gummies", description: "Supports an optimal sleep cycle", buttonLink: "#", colorScheme: "dark", height: "200px" },
    { image: `${IMG}/2024/03/w-pas-dropdown-banner-capsule.jpg`, title: "Capsules for Skin", description: "Supports an optimal sleep cycle", buttonLink: "#", colorScheme: "dark", height: "200px" },
  ];

  const items = banners || defaultBanners;

  const css = `
    .hh-banners { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 50px; }
    .hh-banner { position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; }
    .hh-banner:hover .hh-banner-img { transform: scale(1.05); }
    .hh-banner-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
    .hh-banner-content { position: absolute; padding: 25px; z-index: 2; }
    .hh-banner-subtitle { font-family: ${TOKENS.bodyFont}; font-size: 16px; margin-bottom: 5px; }
    .hh-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 26px; margin: 0; }
    .hh-banner-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; margin-top: 5px; }
    .hh-banner-link { position: absolute; inset: 0; z-index: 3; }
    .hh-banner-left { grid-row: 1 / 3; }
    @media (max-width: 767px) { .hh-banners { grid-template-columns: 1fr; } .hh-banner-left { grid-row: auto; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="banners" css={css} />
      <div className="hh-banners">
        {items.map((b, i) => {
          const isLight = b.colorScheme === "light";
          const textColor = isLight ? "#fff" : "#000";
          return (
            <div key={i} className={`hh-banner ${i === 0 ? "hh-banner-left" : ""}`} style={{ height: i === 0 ? "auto" : b.height }}>
              <img className="hh-banner-img" src={b.image} alt={b.title} />
              <div className="hh-banner-content" style={{ bottom: i === 0 ? "20px" : "auto", top: i === 0 ? "auto" : "50%", transform: i === 0 ? "none" : "translateY(-50%)", right: i !== 0 ? "20px" : "auto", textAlign: i !== 0 ? "left" : "left", left: i === 0 ? "20px" : "auto" }}>
                {b.subtitle && <div className="hh-banner-subtitle" style={{ color: textColor }}>{b.subtitle}</div>}
                <h4 className="hh-banner-title" style={{ color: textColor }}>{b.title}</h4>
                {b.description && <div className="hh-banner-desc" style={{ color: textColor, opacity: 0.7 }}>{b.description}</div>}
              </div>
              <Link href={fixLink(b.buttonLink || "#")} className="hh-banner-link" aria-label={b.title} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface HealthSectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleSize?: string;
}

export function HealthSectionTitle({ subtitle, title, description, align = "center", maxWidth = "100%", titleSize = "38px" }: HealthSectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      <div style={{ maxWidth, margin: align === "center" ? "0 auto" : "0" }}>
        {subtitle && <div style={{ fontFamily: TOKENS.bodyFont, fontSize: "14px", color: TOKENS.textColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{subtitle}</div>}
        <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 500, fontSize: titleSize, lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 10px" }}>{title}</h4>
        {description && <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", lineHeight: "26px", color: TOKENS.textColor, margin: 0 }}>{description}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. CATEGORY CARDS (Carousel-style grid)
   ═══════════════════════════════════════════════════════════════ */

export interface HealthCategoryCard {
  name: string;
  image: string;
  link?: string;
}

export interface HealthCategoryCardsProps {
  categories?: HealthCategoryCard[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
}

export function HealthCategoryCards({ categories, columns = 4, sectionTitle = "Popular Categories", marginBottom = "80px" }: HealthCategoryCardsProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);

  const defaultCats: HealthCategoryCard[] = [
    { name: "Allergy Relief", image: `${IMG}/2023/08/w-pas-category-allergy.jpg` },
    { name: "Anxiety", image: `${IMG}/2023/08/w-pas-anx.jpg` },
    { name: "Depression", image: `${IMG}/2023/08/w-pas-depression.jpg` },
    { name: "Eye & Vision", image: `${IMG}/2023/08/w-pas-eye-vision.jpg` },
    { name: "Hair", image: `${IMG}/2023/08/w-pas-hair.jpg` },
    { name: "Pregnancy", image: `${IMG}/2023/08/w-pas-pregnancy.jpg` },
    { name: "Skin", image: `${IMG}/2023/08/w-pas-skin.jpg` },
    { name: "Sleep", image: `${IMG}/2023/08/w-pas-sleep.jpg` },
  ];
  const items = categories || defaultCats;

  const css = `
    .hh-cats { display: grid; gap: 20px; }
    .hh-cat { position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; aspect-ratio: 0.77; }
    .hh-cat:hover .hh-cat-img { transform: scale(1.05); }
    .hh-cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
    .hh-cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%); z-index: 1; }
    .hh-cat-name { position: absolute; bottom: 20px; left: 20px; z-index: 2; font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 28px; color: #fff; text-transform: capitalize; }
    .hh-cat-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .hh-cat-name { font-size: 22px; } }
    @media (max-width: 767px) { .hh-cat-name { font-size: 20px; } }
  `;

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      {sectionTitle && <HealthSectionTitle title={sectionTitle} />}
      <ScopedStyles id="cats" css={css} />
      <div className="hh-cats" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((cat, i) => (
          <div key={i} className="hh-cat">
            <img className="hh-cat-img" src={cat.image} alt={cat.name} />
            <div className="hh-cat-overlay" />
            <h3 className="hh-cat-name">{cat.name}</h3>
            <Link href={fixLink(cat.link)} className="hh-cat-link" aria-label={cat.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface HealthProductGridProps {
  products?: HealthProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  bgColor?: string;
}

export function HealthProductGrid({
  products: propProducts,
  columns = 3,
  sectionTitle = "Bestsellers",
  marginBottom = "80px",
  maxProducts = 6,
  showCategory = true,
  showHoverImage = true,
  bgColor,
}: HealthProductGridProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (slug: string) => {
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/product/${slug}`;
    return `#`;
  };

  const defaultProducts: HealthProduct[] = [
    { id: 112, name: "Allergy Relief 30 Tablets", slug: "allergy-relief-30-tablets", price: "15.00", image: `${IMG}/2023/08/w-pas-ar-30-tablets-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-ar-30-tablets-2.jpg`, category: "Allergy Relief", rating: 5, reviewCount: 3 },
    { id: 246, name: "Depression 60 Tablets", slug: "depression-60-tablets", price: "25.00", image: `${IMG}/2023/08/w-pas-dp-60-tablets-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-dp-30-tablets-2.jpg`, category: "Depression", rating: 5, reviewCount: 2 },
    { id: 451, name: "Skin 30 Gummies", slug: "skin-30-gummies", price: "12.00", image: `${IMG}/2023/08/w-pas-sk-30-gummies-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-sk-30-gummies-2.jpg`, category: "Skin", rating: 4, reviewCount: 1 },
    { id: 356, name: "Hair 60 Capsules", slug: "hair-60-capsules", price: "25.00", image: `${IMG}/2023/08/w-pas-hr-60-capsules-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-hr-30-capsules-2.jpg`, category: "Hair", rating: 5, reviewCount: 4 },
    { id: 493, name: "Sleep 30 Capsules", slug: "sleep-30-capsules", price: "15.00", image: `${IMG}/2023/08/w-pas-sl-30-capsules-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-sl-30-capsules-2.jpg`, category: "Sleep", rating: 5, reviewCount: 2 },
    { id: 308, name: "Eye & Vision 60 Softgels", slug: "eye-vision-60-softgels", price: "18.00", image: `${IMG}/2023/08/w-pas-ev-60-softgel-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-ev-30-softgel-2.jpg`, category: "Eye & Vision", rating: 4, reviewCount: 3 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .hh-products { display: grid; gap: 20px; }
    .hh-prod { background: ${bgColor || "#fff"}; border-radius: 10px; overflow: hidden; transition: box-shadow 0.3s; position: relative; }
    .hh-prod:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .hh-prod-img-wrap { position: relative; overflow: hidden; aspect-ratio: 1; background: ${TOKENS.bgLight}; }
    .hh-prod-img { width: 100%; height: 100%; object-fit: contain; transition: opacity 0.4s; display: block; padding: 15px; }
    .hh-prod-hover { position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s; }
    .hh-prod:hover .hh-prod-hover { opacity: 1; }
    .hh-prod:hover .hh-prod-main-img { opacity: 0; }
    .hh-prod-info { padding: 15px 20px 20px; text-align: center; }
    .hh-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 5px; }
    .hh-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.entityTitleColor}; margin: 0 0 8px; }
    .hh-prod-name a { color: inherit; text-decoration: none; }
    .hh-prod-name a:hover { color: ${TOKENS.primaryColor}; }
    .hh-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.primaryColor}; }
    .hh-prod-stars { color: ${TOKENS.starColor}; font-size: 12px; letter-spacing: 2px; margin-bottom: 5px; }
    .hh-prod-btn { display: inline-block; margin-top: 10px; padding: 8px 20px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 12px; text-decoration: none; border-radius: 25px; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; }
    .hh-prod-btn:hover { background: ${TOKENS.primaryHover}; }
  `;

  const renderStars = (rating: number = 5) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      {sectionTitle && <HealthSectionTitle title={sectionTitle} titleSize="38px" />}
      <ScopedStyles id="products" css={css} />
      <div className="hh-products" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((p) => (
          <div key={p.id} className="hh-prod">
            <div className="hh-prod-img-wrap">
              <img className="hh-prod-img hh-prod-main-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              {showHoverImage && p.hoverImage && (
                <img className="hh-prod-img hh-prod-hover" src={p.hoverImage} alt={p.name} />
              )}
            </div>
            <div className="hh-prod-info">
              {showCategory && <div className="hh-prod-cat">{p.category}</div>}
              <h3 className="hh-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
              <div className="hh-prod-stars">{renderStars(p.rating)}</div>
              <div className="hh-prod-price">${p.price}</div>
              <button className="hh-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. VIDEO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HealthVideoSectionProps {
  videoSrc?: string;
  title?: string;
  subtitle?: string;
  height?: string;
}

export function HealthVideoSection({
  videoSrc = `${IMG}/2023/08/w-pas-video-desktop.mp4`,
  title = "Effective Vitamins For Your Health",
  subtitle = "Our vitamins and supplements are designed to provide essential nutrients that may be lacking in our diet. These products are tested to ensure their safety and quality.",
  height = "660px",
}: HealthVideoSectionProps) {
  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden", marginBottom: "80px", borderRadius: TOKENS.borderRadius }}>
      <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "40px", textAlign: "center" }}>
        <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 500, fontSize: "52px", lineHeight: "62px", color: "#fff", maxWidth: "535px", margin: "0 0 20px" }}>{title}</h4>
        <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "22px", lineHeight: "32px", color: "rgba(255,255,255,0.85)", maxWidth: "625px", margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. INGREDIENTS / FEATURE SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HealthFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface HealthFeatureSectionProps {
  title?: string;
  subtitle?: string;
  features?: HealthFeatureItem[];
  image?: string;
  helpAvatars?: string;
  helpText?: string;
}

export function HealthFeatureSection({
  title = "Supplements And Ingredients You Can Trust",
  subtitle = "Need help choosing?",
  features,
  image = `${IMG}/2023/08/w-pas-iron-72x72.jpg`,
  helpAvatars = `${IMG}/2023/08/w-pas-avatars-help-153x42.png`,
  helpText = "Need help choosing?",
}: HealthFeatureSectionProps) {
  const storeCtx = useContext(HealthStoreContext);
  const defaultFeatures: HealthFeatureItem[] = [
    { icon: `${IMG}/2023/08/w-pas-m-icon-1.svg`, title: "Used In", description: "Chances are, you've probably heard of the nutrient iron before. As a kid, you may remember the not-so-pleasant finger pricks at the doctor's office to check your iron levels." },
    { icon: `${IMG}/2023/08/w-pas-m-icon-2.svg`, title: "Found In", description: "Chances are, you've probably heard of the nutrient iron before. As a kid, you may remember the not-so-pleasant finger pricks at the doctor's office to check your iron levels." },
    { icon: `${IMG}/2023/08/w-pas-m-icon-3.svg`, title: "Learn All Ingredients In Our Guide.", description: "" },
  ];

  const items = features || defaultFeatures;

  const css = `
    .hh-feat { background: ${TOKENS.bgLight}; border-radius: ${TOKENS.borderRadius}; padding: 80px 65px; margin-bottom: 80px; display: flex; gap: 60px; align-items: center; }
    .hh-feat-left { flex: 1; }
    .hh-feat-right { flex: 1; display: flex; flex-direction: column; gap: 30px; }
    .hh-feat-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 52px; line-height: 62px; color: ${TOKENS.titleColor}; margin: 0 0 20px; max-width: 490px; }
    .hh-feat-desc { font-family: ${TOKENS.bodyFont}; font-size: 18px; line-height: 28px; color: ${TOKENS.textColor}; max-width: 490px; }
    .hh-feat-item { display: flex; gap: 15px; align-items: flex-start; }
    .hh-feat-icon { width: 50px; height: 50px; flex-shrink: 0; }
    .hh-feat-item-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 5px; }
    .hh-feat-item-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 22px; color: ${TOKENS.textColor}; margin: 0; }
    .hh-feat-help { display: flex; align-items: center; gap: 15px; margin-top: 20px; }
    .hh-feat-avatars { height: 42px; }
    .hh-feat-help-text { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.titleColor}; }
    .hh-feat-help-link { display: inline-block; margin-top: 5px; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; color: ${TOKENS.primaryColor}; text-decoration: underline; }
    @media (max-width: 1024px) { .hh-feat { flex-direction: column; padding: 60px 45px; } .hh-feat-title { font-size: 34px; line-height: 44px; } }
    @media (max-width: 767px) { .hh-feat { padding: 30px; } .hh-feat-title { font-size: 22px; line-height: 32px; } .hh-feat-desc { font-size: 14px; line-height: 24px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="features" css={css} />
      <div className="hh-feat">
        <div className="hh-feat-left">
          <h4 className="hh-feat-title">{title}</h4>
          <p className="hh-feat-desc">{subtitle}</p>
          <div className="hh-feat-help">
            <img className="hh-feat-avatars" src={helpAvatars} alt="Support team" />
            <div>
              <div className="hh-feat-help-text">{helpText}</div>
              <Link href={resolveStoreLink("#", storeCtx?.storeSlug)} className="hh-feat-help-link">Contact Us →</Link>
            </div>
          </div>
        </div>
        <div className="hh-feat-right">
          {items.map((f, i) => (
            <div key={i} className="hh-feat-item">
              <img className="hh-feat-icon" src={f.icon} alt={f.title} />
              <div>
                <h5 className="hh-feat-item-title">{f.title}</h5>
                {f.description && <p className="hh-feat-item-desc">{f.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */

export interface HealthTestimonial {
  name: string;
  image: string;
  text: string;
  rating?: number;
}

export interface HealthTestimonialsProps {
  title?: string;
  trustpilotImage?: string;
  trustpilotRating?: string;
  reviewCount?: string;
  testimonials?: HealthTestimonial[];
}

export function HealthTestimonials({
  title = "Feedback From Real Customers",
  trustpilotImage = `${IMG}/2023/08/w-pas-trustpilot-1.svg`,
  trustpilotRating = "Rated 4.9",
  reviewCount = "Based on 374 reviews",
  testimonials,
}: HealthTestimonialsProps) {
  const defaultTestimonials: HealthTestimonial[] = [
    { name: "Customer 1", image: `${IMG}/2023/08/w-pas-customer-1.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 2", image: `${IMG}/2023/08/w-pas-customer-2.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 3", image: `${IMG}/2023/08/w-pas-customer-3.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 4", image: `${IMG}/2023/08/w-pas-customer-4.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 5", image: `${IMG}/2023/08/w-pas-customer-5.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 6", image: `${IMG}/2023/08/w-pas-customer-6.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
  ];

  const items = testimonials || defaultTestimonials;

  const css = `
    .hh-testim-section { margin-bottom: 80px; }
    .hh-testim-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
    .hh-testim-tp { display: flex; align-items: center; gap: 15px; }
    .hh-testim-tp img { height: 24px; }
    .hh-testim-tp-info { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; }
    .hh-testim-tp-rating { font-weight: 600; color: ${TOKENS.titleColor}; }
    .hh-testim-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .hh-testim-card { background: ${TOKENS.bgLight}; border-radius: 10px; padding: 30px; }
    .hh-testim-stars { color: ${TOKENS.starColor}; font-size: 14px; letter-spacing: 2px; margin-bottom: 15px; }
    .hh-testim-text { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 24px; color: ${TOKENS.textColor}; margin: 0 0 20px; }
    .hh-testim-author { display: flex; align-items: center; gap: 12px; }
    .hh-testim-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
    .hh-testim-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 14px; color: ${TOKENS.titleColor}; }
    @media (max-width: 767px) { .hh-testim-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="testimonials" css={css} />
      <div className="hh-testim-section">
        <div className="hh-testim-header">
          <HealthSectionTitle title={title} align="left" titleSize="38px" />
          <div className="hh-testim-tp">
            <img src={trustpilotImage} alt="Trustpilot" />
            <div className="hh-testim-tp-info">
              <span className="hh-testim-tp-rating">{trustpilotRating}</span>
              <br />{reviewCount}
            </div>
          </div>
        </div>
        <div className="hh-testim-grid">
          {items.slice(0, 6).map((t, i) => (
            <div key={i} className="hh-testim-card">
              <div className="hh-testim-stars">{"★".repeat(t.rating || 5)}</div>
              <p className="hh-testim-text">{t.text}</p>
              <div className="hh-testim-author">
                <img className="hh-testim-avatar" src={t.image} alt={t.name} />
                <span className="hh-testim-name">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface HealthBlogPost {
  title: string;
  image: string;
  date: string;
  author?: string;
  link?: string;
  category?: string;
}

export interface HealthBlogPostsProps {
  posts?: HealthBlogPost[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
}

export function HealthBlogPosts({ posts, columns = 3, sectionTitle, marginBottom = "60px" }: HealthBlogPostsProps) {
  const defaultPosts: HealthBlogPost[] = [
    { title: "What is fiber and why is it important for health?", image: `${IMG}/2023/09/w-pas-blog-1-400x247.jpg`, date: "September 5, 2023", author: "Admin", category: "Health" },
    { title: "5 ways to celebrate your mom on Mother's Day", image: `${IMG}/2023/09/w-pas-blog-2-400x247.jpg`, date: "September 4, 2023", author: "Admin", category: "Health" },
    { title: "Syncing Up for an Integrated Brain", image: `${IMG}/2023/09/w-pas-blog-3-400x247.jpg`, date: "September 4, 2023", author: "Admin", category: "Health" },
  ];

  const items = posts || defaultPosts;

  const css = `
    .hh-blog-grid { display: grid; gap: 20px; }
    .hh-blog-card { border-radius: 10px; overflow: hidden; background: #fff; }
    .hh-blog-img-wrap { position: relative; overflow: hidden; }
    .hh-blog-img { width: 100%; height: 247px; object-fit: cover; display: block; transition: transform 0.5s; }
    .hh-blog-card:hover .hh-blog-img { transform: scale(1.05); }
    .hh-blog-date { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); color: #fff; padding: 5px 12px; border-radius: 5px; font-family: ${TOKENS.bodyFont}; font-size: 12px; }
    .hh-blog-content { padding: 20px; }
    .hh-blog-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.primaryColor}; background: rgba(136,173,153,0.1); display: inline-block; padding: 3px 10px; border-radius: 3px; margin-bottom: 10px; }
    .hh-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0; }
    .hh-blog-title:hover { color: ${TOKENS.primaryColor}; }
    .hh-blog-meta { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-top: 10px; }
  `;

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      {sectionTitle && <HealthSectionTitle title={sectionTitle} />}
      <ScopedStyles id="blog" css={css} />
      <div className="hh-blog-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((post, i) => (
          <div key={i} className="hh-blog-card">
            <div className="hh-blog-img-wrap">
              <img className="hh-blog-img" src={post.image} alt={post.title} />
              <div className="hh-blog-date">{post.date}</div>
            </div>
            <div className="hh-blog-content">
              {post.category && <span className="hh-blog-cat">{post.category}</span>}
              <h3 className="hh-blog-title">{post.title}</h3>
              <div className="hh-blog-meta">by {post.author || "Admin"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */

export interface HealthNewsletterProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

export function HealthNewsletter({
  title = "Sign Up And Connect to WoodMart",
  subtitle = "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.",
  backgroundColor = TOKENS.bgLight,
}: HealthNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(HealthStoreContext);
  const { subscribe, status: nlStatus } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  const css = `
    .hh-newsletter { background: ${backgroundColor}; padding: 80px 40px; text-align: center; margin-bottom: 80px; border-radius: ${TOKENS.borderRadius}; }
    .hh-nl-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 58px; line-height: 68px; color: ${TOKENS.titleColor}; margin: 0 0 15px; max-width: 622px; margin-left: auto; margin-right: auto; }
    .hh-nl-sub { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px; color: ${TOKENS.textColor}; max-width: 500px; margin: 0 auto 30px; }
    .hh-nl-form { display: flex; max-width: 450px; margin: 0 auto; gap: 0; }
    .hh-nl-input { flex: 1; padding: 14px 20px; border: 1px solid #ddd; border-radius: 35px 0 0 35px; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; border-right: none; }
    .hh-nl-input:focus { border-color: ${TOKENS.primaryColor}; }
    .hh-nl-btn { padding: 14px 30px; background: ${TOKENS.primaryColor}; color: #fff; border: none; border-radius: 0 35px 35px 0; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
    .hh-nl-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 1024px) { .hh-nl-title { font-size: 34px; line-height: 44px; } }
    @media (max-width: 767px) { .hh-nl-title { font-size: 22px; line-height: 32px; } .hh-newsletter { padding: 40px 20px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="newsletter" css={css} />
      <div className="hh-newsletter">
        <h4 className="hh-nl-title">{title}</h4>
        <p className="hh-nl-sub">{subtitle}</p>
        {nlStatus === "success" ? (
          <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", color: TOKENS.primaryColor, marginTop: "20px" }}>Thanks for subscribing! 🎉</p>
        ) : (
        <form className="hh-nl-form" onSubmit={(e) => { e.preventDefault(); subscribe(email).then(() => setEmail("")); }}>
          <input className="hh-nl-input" type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="hh-nl-btn" type="submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? "Signing up..." : "Subscribe"}</button>
        </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. BRAND MARQUEE (Logos scroll)
   ═══════════════════════════════════════════════════════════════ */

export interface HealthBrandMarqueeProps {
  speed?: number;
  reverse?: boolean;
}

export function HealthBrandMarquee({ speed = 70, reverse = false }: HealthBrandMarqueeProps) {
  const css = `
    .hh-brand-marquee { overflow: hidden; padding: 30px 0; }
    .hh-brand-track { display: flex; animation: hhBrandScroll ${speed}s linear infinite; gap: 70px; ${reverse ? "animation-direction: reverse;" : ""} }
    @keyframes hhBrandScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .hh-brand-item { flex-shrink: 0; height: 30px; opacity: 0.5; transition: opacity 0.3s; }
    .hh-brand-item:hover { opacity: 1; }
  `;

  const brands = [
    `${IMG}/2023/08/w-pas-trustpilot-1.svg`,
    `${IMG}/2023/08/w-pas-logo-color.svg`,
    `${IMG}/2023/08/w-pas-trustpilot-1.svg`,
    `${IMG}/2023/08/w-pas-logo-color.svg`,
  ];
  const doubled = [...brands, ...brands, ...brands, ...brands];

  return (
    <>
      <ScopedStyles id={`brand-marquee-${reverse ? "r" : "f"}`} css={css} />
      <div className="hh-brand-marquee">
        <div className="hh-brand-track">
          {doubled.map((src, i) => <img key={i} className="hh-brand-item" src={src} alt="Brand" />)}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export function HealthFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(HealthStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
