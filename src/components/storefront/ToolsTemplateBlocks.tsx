"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useRef, useEffect, useContext, createContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { ElectronicsStoreContext } from "./ElectronicsTemplateBlocks";
import { toDisplayText } from "@/components/storefront/prop-normalizers";
import { InlineEditableText } from "@/components/storefront/InlineEditableText";

/* ═══════════════════════════════════════════════════════════════
   TOOLS TEMPLATE HOMEPAGE BLOCKS
   Pixel-perfect replicas of Prokip LTD Tools demo homepage.
   Uses ElectronicsStoreContext for store slug resolution.
   ═══════════════════════════════════════════════════════════════ */

const TOKENS = {
  primaryColor: "var(--color-primary)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  starColor: "var(--color-accent)",
  containerWidth: "1222px",
  titleFont: "'Roboto', Arial, sans-serif",
  bodyFont: "'Roboto', Arial, sans-serif",
};


const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth,
  margin: "0 auto",
  padding: "0 15px",
  boxSizing: "border-box" as const,
  width: "100%",
};

function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-tools-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

function useStoreSlug() {
  const ctx = useContext(ElectronicsStoreContext);
  return ctx?.storeSlug;
}

/* ═══════════════════════════════════════════════════════════════
   FONT LOADER
   ═══════════════════════════════════════════════════════════════ */

export function ToolsFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    `}} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. GRID BANNERS (hero area with 4 banners)
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsBannerItem {
  image: string;
  label: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  size?: "large" | "medium" | "small";
}

export interface ToolsGridBannersProps {
  banners?: ToolsBannerItem[];
}

export function ToolsGridBanners({ banners = [] }: ToolsGridBannersProps) {
  const storeSlug = useStoreSlug();
  const defaultBanners: ToolsBannerItem[] = [
    { image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=80&auto=format&fit=crop", label: "SPECIAL OFFER", title: "Garden Care\nMachines and Tools", description: "To short sentences, to many headings, images too large for the proposed design.", buttonText: "Read more", buttonLink: "#", size: "large" },
    { image: "https://images.unsplash.com/photo-1620912189866-1e2019da2b8f?w=700&q=80&auto=format&fit=crop", label: "PROTECTIVE SUITS", title: "Think About Your Safety", buttonText: "Shop now", buttonLink: "#", size: "medium" },
    { image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=700&q=80&auto=format&fit=crop", label: "NEW ITEMS", title: "Circular Saw", buttonText: "Shop now", buttonLink: "#", size: "small" },
    { image: "https://images.unsplash.com/photo-1581147036324-c1c9c3e0e4e5?w=700&q=80&auto=format&fit=crop", label: "VACUUM CLEANERS", title: "Clean in the work area", description: "It\u2019s like saying you\u2019re a bad designer, use less bold text, don\u2019t use italics in every.", size: "medium" },
  ];
  const items = Array.isArray(banners) ? banners : defaultBanners;
  const css = `
    .tl-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 10px; margin-bottom: 40px; }
    .tl-banner { position: relative; overflow: hidden; min-height: 280px; }
    .tl-banner.tl-large { grid-row: span 2; min-height: 570px; }
    .tl-banner img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tl-banner-ov { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 40px; }
    .tl-banner-label { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .tl-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; line-height: 1.3; color: ${TOKENS.titleColor}; margin: 0 0 10px; white-space: pre-line; }
    .tl-banner.tl-large .tl-banner-title { font-size: 36px; }
    .tl-banner-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.6; color: ${TOKENS.textColor}; margin: 0 0 15px; max-width: 300px; }
    .tl-banner-btn { display: inline-block; padding: 10px 25px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
    .tl-banner-btn:hover { filter: brightness(0.9); }
    @media (max-width: 767px) { .tl-grid { grid-template-columns: 1fr; } .tl-banner.tl-large { grid-row: span 1; min-height: 300px; } }
  `;
  return (
    <>
      <ScopedStyles id="grid-banners" css={css} />
      <div className="tl-grid">
        {items.map((b, i) => (
          <div key={i} className={`tl-banner ${b.size === "large" ? "tl-large" : ""}`}>
            <img src={b.image} alt={b.title} onError={(e) => onImgError(e, b.title)} />
            <div className="tl-banner-ov">
              <InlineEditableText as="div" field={`banners.${i}.label`} value={b.label} isEditor={true} className="tl-banner-label" />
              <InlineEditableText as="h3" field={`banners.${i}.title`} value={b.title} isEditor={true} className="tl-banner-title" />
              {b.description && <InlineEditableText as="p" field={`banners.${i}.description`} value={b.description} isEditor={true} multiline className="tl-banner-desc" />}
              {b.buttonText && <div><Link href={resolveStoreLink(b.buttonLink || "#", storeSlug)} className="tl-banner-btn"><InlineEditableText as="span" field={`banners.${i}.buttonText`} value={b.buttonText} isEditor={true} selectNodeOnFocus={false} /></Link></div>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. FEATURE ICONS (Online Payment, Support 24/7, etc.)
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsFeatureIconsProps {
  features?: { icon: string; title: string; description: string }[];
}

export function ToolsFeatureIcons({ features = [] }: ToolsFeatureIconsProps) {
  const defaultFeatures = [
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Crect%20x%3D%222%22%20y%3D%225%22%20width%3D%2220%22%20height%3D%2214%22%20rx%3D%222%22/%3E%3Cpath%20d%3D%22M2%2010h20%22/%3E%3C/svg%3E", title: "Online Payment", description: "Even if your less into design and more into content strategy." },
    { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M3%2012a9%209%200%200118%200M3%2012v3a2%202%200%20002%202h1v-6H5a2%202%200%2000-2%202zM21%2012v3a2%202%200%2001-2%202h-1v-6h1a2%202%200%20012%202z%22/%3E%3C/svg%3E", title: "Support 24/7", description: "Find some redeeming value with, wait for it, dummy copy, no less." },
  ];
  const items = Array.isArray(features) ? features : defaultFeatures;
  const css = `
    .tl-features { display: flex; gap: 40px; padding: 30px 0; margin-bottom: 30px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .tl-feature { display: flex; align-items: center; gap: 15px; }
    .tl-feature-icon { width: 50px; height: 50px; flex-shrink: 0; }
    .tl-feature-icon img { width: 100%; height: 100%; }
    .tl-feature-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 4px; }
    .tl-feature-desc { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin: 0; }
    @media (max-width: 767px) { .tl-features { flex-direction: column; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="features" css={css} />
      <div className="tl-features">
        {items.map((f, i) => (
          <div key={i} className="tl-feature">
            <div className="tl-feature-icon"><img src={f.icon} alt={f.title} onError={(e) => onImgError(e, f.title)} /></div>
            <div>
              <InlineEditableText as="h4" field={`features.${i}.title`} value={f.title} isEditor={true} className="tl-feature-title" />
              <InlineEditableText as="p" field={`features.${i}.description`} value={f.description} isEditor={true} multiline className="tl-feature-desc" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsSectionTitleProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  align?: "left" | "center";
}

export function ToolsSectionTitle({ title, description, buttonText, buttonLink, align = "left" }: ToolsSectionTitleProps) {
  const storeSlug = useStoreSlug();
  const css = `
    .tl-stitle { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; padding: 20px 0 0; }
    .tl-stitle-main { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 24px; color: ${TOKENS.titleColor}; margin: 0; }
    .tl-stitle-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; margin: 5px 0 0; }
    .tl-stitle-link { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor}; text-decoration: none; font-weight: 500; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="stitle" css={css} />
      <div className="tl-stitle" style={{ textAlign: align }}>
        <div>
          <InlineEditableText as="h3" field="title" value={title} isEditor={true} className="tl-stitle-main" />
          {description && <InlineEditableText as="p" field="description" value={description} isEditor={true} multiline className="tl-stitle-desc" />}
        </div>
        {buttonText && <Link href={resolveStoreLink(buttonLink || "#", storeSlug)} className="tl-stitle-link"><InlineEditableText as="span" field="buttonText" value={buttonText} isEditor={true} selectNodeOnFocus={false} /> →</Link>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  hoverImage?: string;
  category?: string;
}

export interface ToolsProductGridProps {
  sectionTitle?: string;
  sectionDescription?: string;
  sectionButtonText?: string;
  sectionButtonLink?: string;
  columns?: number;
  maxProducts?: number;
  products?: ToolsProduct[];
}

export function ToolsProductGrid({
  sectionTitle = "Bestseller Product",
  sectionDescription = "A client that\u2019s unhappy for a reason is a problem, a client.",
  sectionButtonText = "Show All products",
  sectionButtonLink = "/shop",
  columns = 4,
  maxProducts = 8,
  products: propProducts,
}: ToolsProductGridProps) {
  const ctx = useContext(ElectronicsStoreContext);
  const storeSlug = ctx?.storeSlug;
  const defaultProducts: ToolsProduct[] = [
    { id: 1, name: "Circular SAW M-350", slug: "cercular-saw-m-350", price: "299.00", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop" },
    { id: 2, name: "Grinding Machine R-130", slug: "grinding-machine-r-130", price: "320.00", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1620912189866-1e2019da2b8f?w=500&h=500&fit=crop" },
    { id: 3, name: "Protective Helmet H-18", slug: "protective-helmet-h-18", price: "369.00", image: "https://images.unsplash.com/photo-1590756254933-2873d72c893c?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500&h=500&fit=crop" },
    { id: 4, name: "Polisher P-10", slug: "polisher-p-10", price: "198.00", image: "https://images.unsplash.com/photo-1590756254933-2873d72c893c?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500&h=500&fit=crop" },
    { id: 5, name: "Grinding machine SX-325", slug: "grinding-machine-sx-325", price: "180.00", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop" },
    { id: 6, name: "Protective t-shirt long H-25", slug: "protective-t-shirt-long-h-25", price: "186.00", image: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1590756254933-2873d72c893c?w=500&h=500&fit=crop" },
    { id: 7, name: "Drill R-325", slug: "drill-r-325", price: "300.00", image: "https://images.unsplash.com/photo-1620912189866-1e2019da2b8f?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1620912189866-1e2019da2b8f?w=500&h=500&fit=crop" },
    { id: 8, name: "Protective Boots H-76", slug: "protective-boots-h-76", price: "199.00", image: "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500&h=500&fit=crop", hoverImage: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop" },
  ];
  const items = (propProducts || defaultProducts).slice(0, maxProducts);
  const css = `
    .tl-products { display: grid; gap: 20px; margin-bottom: 50px; }
    .tl-prod { background: #fff; overflow: hidden; text-align: center; position: relative; }
    .tl-prod-img-wrap { position: relative; overflow: hidden; }
    .tl-prod-img { width: 100%; height: auto; display: block; transition: opacity 0.3s; }
    .tl-prod-hover { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; }
    .tl-prod:hover .tl-prod-hover { opacity: 1; }
    .tl-prod:hover .tl-prod-img { opacity: 0; }
    .tl-prod-info { padding: 15px 10px 20px; }
    .tl-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 4px; }
    .tl-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 15px; color: ${TOKENS.titleColor}; margin: 0 0 6px; }
    .tl-prod-name a { color: inherit; text-decoration: none; }
    .tl-prod-name a:hover { color: ${TOKENS.primaryColor}; }
    .tl-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 16px; color: ${TOKENS.primaryColor}; }
    .tl-prod-btn { display: inline-block; margin-top: 8px; padding: 8px 18px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 12px; text-transform: uppercase; border: none; cursor: pointer; }
    .tl-prod-btn:hover { filter: brightness(0.9); }
  `;
  return (
    <div style={containerStyle}>
      <ToolsSectionTitle title={sectionTitle} description={sectionDescription} buttonText={sectionButtonText} buttonLink={sectionButtonLink} />
      <ScopedStyles id="products" css={css} />
      <div className="tl-products" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((p) => (
          <div key={p.id} className="tl-prod">
            <div className="tl-prod-img-wrap">
              <img className="tl-prod-img" src={p.image} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              {p.hoverImage && <img className="tl-prod-hover" src={p.hoverImage} alt={p.name} onError={(e) => onImgError(e, p.name)} style={{ width: "100%", height: "auto" }} />}
            </div>
            <div className="tl-prod-info">
              {p.category && <div className="tl-prod-cat">{toDisplayText(p.category, "")}</div>}
              <h4 className="tl-prod-name"><Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)}>{p.name}</Link></h4>
              <div className="tl-prod-price">${p.price}</div>
              <button className="tl-prod-btn" onClick={() => ctx?.addToCart?.(String(p.id))}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. CHAIN SAW FEATURE SECTION (split hero + product cards)
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsChainSawProduct {
  name: string;
  slug: string;
  price: string;
  image: string;
  description: string;
}

export interface ToolsFeatureSectionProps {
  backgroundImage?: string;
  label?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  productImage?: string;
  products?: ToolsChainSawProduct[];
}

export function ToolsFeatureSection({
  backgroundImage = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80&auto=format&fit=crop",
  label = "NEW CHAIN SAW",
  title = "Powerful Saw X-700",
  description = "Using dummy content or fake information in the Web design process can result in products with unrealistic.",
  buttonText = "View More",
  buttonLink = "#",
  productImage = "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80&auto=format&fit=crop",
  products = [],
}: ToolsFeatureSectionProps) {
  const storeSlug = useStoreSlug();
  const defaultProducts: ToolsChainSawProduct[] = [
    { name: "Chainsaw X-Cut C85", slug: "chainsaw-chain-x-cut-c85", price: "179.00", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop", description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
    { name: "Engine motor MS180", slug: "engine-motor-ms180", price: "480.00", image: "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500&h=500&fit=crop", description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
    { name: "SAE 30 Engine Oil", slug: "sae-30-engine-oil", price: "129.00", image: "https://images.unsplash.com/photo-1590756254933-2873d72c893c?w=500&h=500&fit=crop", description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
  ];
  const items = products.length > 0 ? products : defaultProducts;
  const css = `
    .tl-feat { display: flex; margin-bottom: 50px; }
    .tl-feat-hero { flex: 1; position: relative; min-height: 500px; display: flex; align-items: center; }
    .tl-feat-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .tl-feat-hero-content { position: relative; z-index: 2; padding: 40px; max-width: 400px; }
    .tl-feat-label { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .tl-feat-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 32px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .tl-feat-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.6; margin: 0 0 20px; }
    .tl-feat-btn { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor}; text-decoration: underline; font-weight: 500; }
    .tl-feat-sidebar { flex: 0 0 400px; display: flex; flex-direction: column; }
    .tl-feat-prod-img { width: 100%; }
    .tl-feat-prods { flex: 1; overflow-y: auto; }
    .tl-feat-prod { display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #eee; }
    .tl-feat-prod-thumb { width: 80px; height: 80px; object-fit: cover; flex-shrink: 0; }
    .tl-feat-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 15px; color: ${TOKENS.titleColor}; margin: 0 0 4px; }
    .tl-feat-prod-name a { color: inherit; text-decoration: none; }
    .tl-feat-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px; color: ${TOKENS.primaryColor}; margin-bottom: 6px; }
    .tl-feat-prod-desc { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; line-height: 1.5; }
    @media (max-width: 767px) { .tl-feat { flex-direction: column; } .tl-feat-sidebar { flex: none; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="feature" css={css} />
      <div className="tl-feat">
        <div className="tl-feat-hero">
          <img src={backgroundImage} alt={title} onError={(e) => onImgError(e, title)} />
          <div className="tl-feat-hero-content">
            <div className="tl-feat-label">{label}</div>
            <h3 className="tl-feat-title">{title}</h3>
            <p className="tl-feat-desc">{description}</p>
            <Link href={resolveStoreLink(buttonLink, storeSlug)} className="tl-feat-btn">{buttonText}</Link>
          </div>
        </div>
        <div className="tl-feat-sidebar">
          <img className="tl-feat-prod-img" src={productImage} alt="Featured product" onError={(e) => onImgError(e, "featured")} />
          <div className="tl-feat-prods">
            {items.map((p, i) => (
              <div key={i} className="tl-feat-prod">
                <img className="tl-feat-prod-thumb" src={p.image} alt={p.name} onError={(e) => onImgError(e, p.name)} />
                <div>
                  <h4 className="tl-feat-prod-name"><Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)}>{p.name}</Link></h4>
                  <div className="tl-feat-prod-price">${p.price}</div>
                  <p className="tl-feat-prod-desc">{p.description}</p>
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
   6. FREE DELIVERY BANNER
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsDeliveryBannerProps {
  image?: string;
  label?: string;
  title?: string;
  description?: string;
}

export function ToolsDeliveryBanner({
  image = "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800&q=80&auto=format&fit=crop",
  label = "SPECIAL OFFER",
  title = "Free Delivery from $300",
  description = "To sure calm much most long me mean. Able rent long in do we.",
}: ToolsDeliveryBannerProps) {
  const css = `
    .tl-delivery { position: relative; min-height: 200px; overflow: hidden; margin-bottom: 40px; }
    .tl-delivery img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tl-delivery-ov { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 40px; }
    .tl-delivery-label { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .tl-delivery-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0 0 10px; }
    .tl-delivery-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; max-width: 400px; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="delivery" css={css} />
      <div className="tl-delivery">
        <img src={image} alt={title} onError={(e) => onImgError(e, title)} />
        <div className="tl-delivery-ov">
          <div className="tl-delivery-label">{label}</div>
          <h3 className="tl-delivery-title">{title}</h3>
          <p className="tl-delivery-desc">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PRE-FOOTER CTA (newsletter/share)
   ═══════════════════════════════════════════════════════════════ */

export interface ToolsPreFooterProps {
  image?: string;
  title?: string;
  privacyText?: string;
}

export function ToolsPreFooter({
  image = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&q=80&auto=format&fit=crop",
  title = "Do you like the theme? Share with your friends!",
  privacyText = "Will be used in accordance with our Privacy Policy",
}: ToolsPreFooterProps) {
  const css = `
    .tl-prefooter { display: flex; align-items: center; gap: 30px; padding: 40px 0; border-top: 1px solid #eee; margin-bottom: 0; }
    .tl-prefooter-img { width: 115px; height: 90px; object-fit: cover; flex-shrink: 0; }
    .tl-prefooter-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 8px; }
    .tl-prefooter-privacy { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="prefooter" css={css} />
      <div className="tl-prefooter">
        <img className="tl-prefooter-img" src={image} alt="Tools" onError={(e) => onImgError(e, "tools")} />
        <div>
          <h4 className="tl-prefooter-title">{title}</h4>
          <p className="tl-prefooter-privacy">{privacyText}</p>
        </div>
      </div>
    </div>
  );
}
