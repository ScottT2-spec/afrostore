import { FashionFooter } from "./FashionTemplateBlocks";
"use client";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   INTERIOR DESIGN (RETAIL) TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Retail template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#f4a51c",
  primaryHover: "#db9318",
  altColor: "#fbbc34",
  titleColor: "#242424",
  textColor: "#767676",
  entityTitleColor: "#333333",
  linkColor: "#333333",
  starColor: "#EABE12",
  footerBg: "#092143",
  bgWhite: "#ffffff",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Cabin', Arial, Helvetica, sans-serif",
  bodyFont: "'Cabin', Arial, Helvetica, sans-serif",
};

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function InteriorFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap');
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

function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-interior-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ═══════════════════════════════════════════════════════════════
   STORE CONTEXT
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  category: string;
  rating?: number;
  badge?: string;
  tags?: string[];
}

export interface InteriorStoreContextData {
  storeSlug?: string;
  products?: InteriorProduct[];
  storeName?: string;
  storeLogo?: string;
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

export const InteriorStoreContext = createContext<InteriorStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorHeroSlide {
  titleLine1: string;
  titleLine2?: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  sideImage?: string;
}

export interface InteriorHeroSliderProps {
  slides?: InteriorHeroSlide[];
  autoplaySpeed?: number;
}

export function InteriorHeroSlider({ slides, autoplaySpeed = 5000 }: InteriorHeroSliderProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultSlides: InteriorHeroSlide[] = [
    {
      subtitle: "SALE PRODUCTS",
      titleLine1: "Lamp",
      description: "Explore our curated collection of modern lighting for your home.",
      buttonText: "Shop Now",
      buttonLink: "#",
      image: `${IMG}/2018/08/slide-1.jpg`,
      sideImage: `${IMG}/2018/10/side-product-cutdown-opt.jpg`,
    },
    {
      subtitle: "SALE PRODUCTS",
      titleLine1: "Floor Lamp",
      description: "Elegant floor lamps that blend style with functionality.",
      buttonText: "Shop Now",
      buttonLink: "#",
      image: `${IMG}/2018/08/slide-2.jpg`,
      sideImage: `${IMG}/2018/10/side-product-cutdown-2-opt.jpg`,
    },
    {
      subtitle: "MOST POPULAR",
      titleLine1: "Floor Lamp",
      titleLine2: "",
      description: "Discover our most popular interior design pieces.",
      buttonText: "Shop Now",
      buttonLink: "#",
      image: `${IMG}/2018/08/slide-3.jpg`,
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
    .id-slider { position: relative; width: 100%; min-height: 560px; overflow: hidden; background: #f5f5f5; }
    .id-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .id-slide.id-active { opacity: 1; position: relative; }
    .id-slide-inner { width: 100%; display: flex; align-items: center; }
    .id-slide-text { flex: 1; padding: 60px 0 60px 80px; z-index: 2; }
    .id-slide-subtitle { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; }
    .id-slide-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 72px; line-height: 1.1; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .id-slide-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px; color: ${TOKENS.textColor}; margin: 0 0 30px; max-width: 400px; }
    .id-slide-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; }
    .id-slide-btn:hover { background: ${TOKENS.primaryHover}; }
    .id-slide-img { flex: 1; position: relative; height: 560px; overflow: hidden; }
    .id-slide-img img { width: 100%; height: 100%; object-fit: cover; }
    .id-slide-side { position: absolute; bottom: 30px; left: -60px; width: 200px; height: 200px; border: 5px solid #fff; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
    .id-slide-side img { width: 100%; height: 100%; object-fit: cover; }
    .id-dots { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 5; }
    .id-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${TOKENS.primaryColor}; background: transparent; cursor: pointer; padding: 0; transition: all 0.3s; }
    .id-dot.id-active { background: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .id-slide-title { font-size: 48px; } .id-slide-text { padding-left: 40px; } }
    @media (max-width: 767px) { .id-slide-title { font-size: 36px; } .id-slide-img { display: none; } .id-slide-text { padding: 40px 20px; } .id-slider { min-height: 400px; } }
  `;

  return (
    <div className="id-slider">
      <ScopedStyles id="hero-slider" css={css} />
      {items.map((slide, i) => (
        <div key={i} className={`id-slide ${i === current ? "id-active" : ""}`}>
          <div className="id-slide-inner">
            <div className="id-slide-text">
              {slide.subtitle && <div className="id-slide-subtitle">{slide.subtitle}</div>}
              <h2 className="id-slide-title">{slide.titleLine1}{slide.titleLine2 && <><br />{slide.titleLine2}</>}</h2>
              {slide.description && <p className="id-slide-desc">{slide.description}</p>}
              <Link href={fixLink(slide.buttonLink)} className="id-slide-btn">{slide.buttonText}</Link>
            </div>
            <div className="id-slide-img">
              <img src={slide.image} alt={slide.titleLine1} />
              {slide.sideImage && (
                <div className="id-slide-side"><img src={slide.sideImage} alt="Featured" /></div>
              )}
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="id-dots">
          {items.map((_, i) => (
            <button key={i} className={`id-dot ${i === current ? "id-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorSectionTitleProps {
  title: string;
  align?: "left" | "center" | "right";
  after?: React.ReactNode;
}

export function InteriorSectionTitle({ title, align = "center", after }: InteriorSectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 600, fontSize: "22px", lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 5px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>{title}</h4>
      {after}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. TOP CATEGORIES GRID
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorCategory {
  name: string;
  image: string;
  icon?: string;
  link?: string;
}

export interface InteriorCategoryGridProps {
  sectionTitle?: string;
  categories?: InteriorCategory[];
  columns?: number;
}

export function InteriorCategoryGrid({ sectionTitle = "TOP CATEGORIES", categories, columns = 6 }: InteriorCategoryGridProps) {
  const defaultCategories: InteriorCategory[] = [
    { name: "Lighting", image: `${IMG}/2018/10/retail-category-1-opt.jpg`, icon: `${IMG}/2025/05/wd-light-bulb.svg` },
    { name: "Clocks", image: `${IMG}/2018/10/retail-category-2-opt.jpg`, icon: `${IMG}/2025/05/wd-clock.svg` },
    { name: "Furniture", image: `${IMG}/2018/10/retail-category-3-opt.jpg`, icon: `${IMG}/2025/05/wd-chair.svg` },
    { name: "Accessories", image: `${IMG}/2018/10/retail-category-4-opt.jpg`, icon: `${IMG}/2025/05/wd-hand-bag.svg` },
    { name: "Cooking", image: `${IMG}/2018/10/retail-category-5-opt.jpg`, icon: `${IMG}/2025/05/wd-knives.svg` },
    { name: "Toys", image: `${IMG}/2018/10/retail-category-6-opt.jpg`, icon: `${IMG}/2025/05/wd-rocking-horse.svg` },
  ];

  const items = categories || defaultCategories;

  const css = `
    .id-cats { margin-bottom: 60px; }
    .id-cats-grid { display: grid; gap: 20px; }
    .id-cat { text-align: center; cursor: pointer; transition: transform 0.3s; }
    .id-cat:hover { transform: translateY(-5px); }
    .id-cat-img-wrap { position: relative; overflow: hidden; margin-bottom: 15px; border-radius: 50%; width: 160px; height: 160px; margin-left: auto; margin-right: auto; }
    .id-cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .id-cat:hover .id-cat-img { transform: scale(1.1); }
    .id-cat-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.entityTitleColor}; }
    @media (max-width: 1024px) { .id-cats-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .id-cats-grid { grid-template-columns: repeat(2, 1fr) !important; } .id-cat-img-wrap { width: 120px; height: 120px; } }
  `;

  return (
    <div className="id-cats">
      <ScopedStyles id="cats" css={css} />
      <div style={containerStyle}>
        <InteriorSectionTitle title={sectionTitle} />
        <div className="id-cats-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((cat, i) => (
            <div key={i} className="id-cat">
              <div className="id-cat-img-wrap">
                <img className="id-cat-img" src={cat.image} alt={cat.name} />
              </div>
              <span className="id-cat-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorProductGridProps {
  products?: InteriorProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
}

export function InteriorProductGrid({
  products: propProducts,
  columns = 4,
  sectionTitle = "SALE PRODUCTS",
  marginBottom = "60px",
  maxProducts = 8,
}: InteriorProductGridProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";

  const defaultProducts: InteriorProduct[] = [
    { id: 1, name: "Dark Headphones", slug: "dark-headphones", price: "154.00", image: `${IMG}/2018/10/retail-product-1-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 2, name: "Solo Cook Set", slug: "solo-cook-set", price: "215.00", image: `${IMG}/2018/10/retail-product-2-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 3, name: "Gray Shorts", slug: "gray-shorts", price: "169.00", image: `${IMG}/2018/10/retail-product-3-opt-330x340.jpg`, category: "Retail", rating: 4 },
    { id: 4, name: "Gold Laptop", slug: "gold-laptop", price: "273.00", image: `${IMG}/2018/10/retail-product-4-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 5, name: "Kitchen Chair", slug: "kitchen-chair", price: "199.00", image: `${IMG}/2018/10/retail-product-5-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 6, name: "Smartphone Case", slug: "smartphone-case", price: "149.00", image: `${IMG}/2018/10/retail-product-6-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 7, name: "Dark Mice", slug: "dark-mice", price: "112.00", image: `${IMG}/2018/10/retail-product-7-opt-330x340.jpg`, category: "Retail", rating: 4 },
    { id: 8, name: "Red Sneakers", slug: "red-sneakers", price: "155.00", image: `${IMG}/2018/10/retail-product-8-opt-330x340.jpg`, category: "Retail", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .id-products { margin-bottom: ${marginBottom}; }
    .id-prod-grid { display: grid; gap: 20px; }
    .id-prod { background: #fff; overflow: hidden; transition: box-shadow 0.3s; position: relative; text-align: center; }
    .id-prod:hover { box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
    .id-prod-img-wrap { position: relative; overflow: hidden; background: #f5f5f5; }
    .id-prod-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .id-prod:hover .id-prod-img { transform: scale(1.05); }
    .id-prod-info { padding: 15px 15px 20px; }
    .id-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 11px; color: ${TOKENS.textColor}; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .id-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; }
    .id-prod-name a { color: inherit; text-decoration: none; }
    .id-prod-name a:hover { color: rgba(51,51,51,0.65); }
    .id-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.titleColor}; }
    .id-prod-price del { color: ${TOKENS.textColor}; font-weight: 400; font-size: 13px; margin-right: 5px; }
    .id-prod-stars { color: ${TOKENS.starColor}; font-size: 11px; letter-spacing: 1px; margin-bottom: 4px; }
    .id-prod-btn { display: inline-block; margin-top: 8px; padding: 8px 20px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 11px; text-decoration: none; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; }
    .id-prod-btn:hover { background: ${TOKENS.primaryHover}; }
    .id-prod-badge { position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 11px; font-weight: 600; padding: 3px 10px; text-transform: uppercase; z-index: 2; }
    @media (max-width: 1024px) { .id-prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .id-prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  `;

  return (
    <div className="id-products">
      <ScopedStyles id="products" css={css} />
      <div style={containerStyle}>
        {sectionTitle && <InteriorSectionTitle title={sectionTitle} />}
        <div className="id-prod-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="id-prod">
              {p.badge && <span className="id-prod-badge">{p.badge}</span>}
              <div className="id-prod-img-wrap">
                <img className="id-prod-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              </div>
              <div className="id-prod-info">
                <div className="id-prod-cat">{p.category}</div>
                <h3 className="id-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
                <div className="id-prod-stars">{"★".repeat(p.rating || 5)}{"☆".repeat(5 - (p.rating || 5))}</div>
                <div className="id-prod-price">
                  {p.comparePrice && <del>${p.comparePrice}</del>}
                  ${p.price}
                </div>
                <button className="id-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. INFO BOXES (Home Delivery, Order As Gift, High Quality, Buy With Joy)
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorInfoBox {
  icon: string;
  title: string;
  description: string;
}

export interface InteriorInfoBoxesProps {
  items?: InteriorInfoBox[];
}

export function InteriorInfoBoxes({ items }: InteriorInfoBoxesProps) {
  const defaultItems: InteriorInfoBox[] = [
    { icon: `${IMG}/2018/08/retail-free-shipping.svg`, title: "Home Delivery.", description: "The European languages." },
    { icon: `${IMG}/2018/08/retail-payment.svg`, title: "Order As a Gift.", description: "Donec odio etiam sceles." },
    { icon: `${IMG}/2018/08/retail-delivery-man.svg`, title: "High Quality.", description: "Curabitur hac hac maece." },
    { icon: `${IMG}/2018/08/retail-247.svg`, title: "Buy With Joy.", description: "Ullamcorper magna nec." },
  ];

  const boxes = items || defaultItems;

  const css = `
    .id-infoboxes { margin-bottom: 60px; padding: 40px 0; background: #fff; }
    .id-infobox-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
    .id-infobox { display: flex; align-items: center; gap: 15px; padding: 0 15px; border-right: 1px solid #eee; }
    .id-infobox:last-child { border-right: none; }
    .id-infobox-icon { width: 45px; height: 45px; flex-shrink: 0; }
    .id-infobox-icon img { width: 100%; height: 100%; }
    .id-infobox-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 3px; }
    .id-infobox-desc { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin: 0; }
    @media (max-width: 767px) { .id-infobox-grid { grid-template-columns: 1fr; } .id-infobox { border-right: none; border-bottom: 1px solid #eee; padding-bottom: 15px; } .id-infobox:last-child { border-bottom: none; } }
  `;

  return (
    <div className="id-infoboxes">
      <ScopedStyles id="infoboxes" css={css} />
      <div style={containerStyle}>
        <div className="id-infobox-grid">
          {boxes.map((box, i) => (
            <div key={i} className="id-infobox">
              <div className="id-infobox-icon"><img src={box.icon} alt={box.title} /></div>
              <div>
                <h4 className="id-infobox-title">{box.title}</h4>
                <p className="id-infobox-desc">{box.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. OUTDOOR / GARDEN PRODUCTS
   ═══════════════════════════════════════════════════════════════ */

export function InteriorGardenProducts({ products: propProducts, columns = 4, maxProducts = 6 }: { products?: InteriorProduct[]; columns?: number; maxProducts?: number }) {
  const storeCtx = useContext(InteriorStoreContext);

  const defaultProducts: InteriorProduct[] = [
    { id: 21, name: "Transplanting Trowel", slug: "transplanting-trowel", price: "118.00", image: `${IMG}/2018/10/retail-product-13-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 22, name: "Gathering Bag", slug: "gathering-bag", price: "173.00", image: `${IMG}/2018/10/retail-product-14-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 23, name: "Garden Scissors", slug: "garden-scissors", price: "168.00", image: `${IMG}/2018/10/retail-product-15-opt-330x340.jpg`, category: "Best sellers", rating: 4 },
    { id: 24, name: "Leaf Rake", slug: "leaf-rake", price: "173.00", image: `${IMG}/2018/10/retail-product-16-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 25, name: "Penatibus Nibh", slug: "penatibus-nibh", price: "148.00", image: `${IMG}/2018/10/retail-product-17-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 26, name: "Shovel", slug: "shovel", price: "112.00", image: `${IMG}/2018/10/retail-product-18-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
  ];

  return (
    <InteriorProductGrid
      products={propProducts || defaultProducts}
      columns={columns}
      sectionTitle="FAVORITE GARDEN"
      maxProducts={maxProducts}
      marginBottom="60px"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PROMO BANNERS (2-col layout)
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorPromoBanner {
  subtitle?: string;
  title: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface InteriorPromoBannersProps {
  banners?: InteriorPromoBanner[];
  variant?: "garden" | "furniture";
}

export function InteriorPromoBanners({ banners, variant = "garden" }: InteriorPromoBannersProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const gardenBanners: InteriorPromoBanner[] = [
    { subtitle: "Scelerisque fusce", title: "New Arrival of\nModern Garden Gloves.", image: `${IMG}/2018/10/retail-garden-banner-1-1-opt.jpg`, buttonText: "Shop Now" },
    { subtitle: "A nec augue", title: "Discount 30% Garden Equipment.", image: `${IMG}/2018/10/retail-garden-banner-2-1-opt.jpg`, buttonText: "Shop Now" },
  ];

  const furnitureBanners: InteriorPromoBanner[] = [
    { subtitle: "Mollis tortor", title: "25 Ideas For\nModern Interior", image: `${IMG}/2018/10/retail-furniture-banner-1-2-opt.jpg`, buttonText: "Shop Now" },
    { subtitle: "Cubilia ultricies", title: "Beds And Sofas\nWith 15% Discount.", image: `${IMG}/2018/10/retail-furniture-banner-2-2-opt.jpg`, buttonText: "Shop Now" },
  ];

  const items = banners || (variant === "furniture" ? furnitureBanners : gardenBanners);

  const css = `
    .id-banners { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 60px; }
    .id-banner { position: relative; overflow: hidden; cursor: pointer; min-height: 320px; }
    .id-banner-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; position: absolute; inset: 0; }
    .id-banner:hover .id-banner-img { transform: scale(1.05); }
    .id-banner-content { position: relative; z-index: 2; padding: 40px; }
    .id-banner-sub { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin-bottom: 10px; }
    .id-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; line-height: 1.3; color: ${TOKENS.titleColor}; margin: 0 0 20px; white-space: pre-line; }
    .id-banner-btn { display: inline-block; padding: 12px 28px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
    .id-banner-btn:hover { background: ${TOKENS.primaryHover}; }
    @media (max-width: 767px) { .id-banners { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id={"banners-" + variant} css={css} />
      <div className="id-banners">
        {items.map((b, i) => (
          <div key={i} className="id-banner">
            <img className="id-banner-img" src={b.image} alt={b.title} />
            <div className="id-banner-content">
              {b.subtitle && <div className="id-banner-sub">{b.subtitle}</div>}
              <h4 className="id-banner-title">{b.title}</h4>
              {b.buttonText && <Link href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="id-banner-btn">{b.buttonText}</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. FURNITURE CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

export function InteriorFurnitureCategories({ categories, columns = 6 }: { categories?: InteriorCategory[]; columns?: number }) {
  const defaultCategories: InteriorCategory[] = [
    { name: "Decore", image: `${IMG}/2018/10/retail-category-7-opt.jpg` },
    { name: "Jewelry", image: `${IMG}/2018/10/retail-category-8-opt-1.jpg` },
    { name: "Marketplace", image: `${IMG}/2018/10/retail-category-9-opt.jpg` },
    { name: "Shoes", image: `${IMG}/2018/10/retail-category-10-opt.jpg` },
    { name: "Electronics", image: `${IMG}/2018/10/retail-category-11-opt.jpg` },
    { name: "Retail", image: `${IMG}/2018/10/retail-category-12-opt.jpg` },
  ];

  return <InteriorCategoryGrid sectionTitle="FURNITURE CATEGORIES" categories={categories || defaultCategories} columns={columns} />;
}

/* ═══════════════════════════════════════════════════════════════
   9. FURNITURE PRODUCTS
   ═══════════════════════════════════════════════════════════════ */

export function InteriorFurnitureProducts({ products: propProducts, columns = 4, maxProducts = 8 }: { products?: InteriorProduct[]; columns?: number; maxProducts?: number }) {
  const defaultProducts: InteriorProduct[] = [
    { id: 31, name: "Gray Chair", slug: "gray-chair", price: "189.00", image: `${IMG}/2018/10/retail-product-19-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 32, name: "Two Pafs", slug: "two-pafs", price: "173.00", image: `${IMG}/2018/10/retail-product-20-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 33, name: "Gray Chair", slug: "gray-chair-2", price: "175.00", image: `${IMG}/2018/10/retail-product-21-opt-330x340.jpg`, category: "Retail", rating: 4 },
    { id: 34, name: "Spotight", slug: "spotlight", price: "169.00", image: `${IMG}/2018/10/retail-product-22-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 35, name: "Wooden Table", slug: "wooden-table", price: "215.00", image: `${IMG}/2018/10/retail-product-23-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 36, name: "Wood Wardrobes", slug: "wood-wardrobes", price: "273.00", image: `${IMG}/2018/10/retail-product-24-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 37, name: "Kids Chair", slug: "kids-chair", price: "148.00", image: `${IMG}/2018/10/retail-product-25-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 38, name: "Table Wood Light", slug: "table-wood-light", price: "199.00", image: `${IMG}/2018/10/retail-product-9-opt-330x340.jpg`, category: "Retail", rating: 5 },
  ];

  return (
    <InteriorProductGrid
      products={propProducts || defaultProducts}
      columns={columns}
      sectionTitle=""
      maxProducts={maxProducts}
      marginBottom="60px"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorBlogPost {
  title: string;
  image: string;
  date?: string;
  author?: string;
  link?: string;
}

export interface InteriorBlogPostsProps {
  posts?: InteriorBlogPost[];
  columns?: number;
  sectionTitle?: string;
}

export function InteriorBlogPosts({ posts, columns = 4, sectionTitle = "OUR BLOG" }: InteriorBlogPostsProps) {
  const defaultPosts: InteriorBlogPost[] = [
    { title: "Furniture that explores wood as a material", image: `${IMG}/2018/10/retail-blog-img-1-opt.jpg`, date: "October 18, 2018" },
    { title: "The big design: Wall likes pictures", image: `${IMG}/2018/10/retail-blog-img-2-opt.jpg`, date: "October 18, 2018" },
    { title: "New home decor from John Doerson", image: `${IMG}/2018/10/retail-blog-img-3-opt.jpg`, date: "October 18, 2018" },
    { title: "Collar brings back coffee brewing ritual", image: `${IMG}/2018/10/retail-blog-img-4-opt.jpg`, date: "October 18, 2018" },
  ];

  const items = posts || defaultPosts;

  const css = `
    .id-blog { margin-bottom: 60px; }
    .id-blog-grid { display: grid; gap: 20px; }
    .id-blog-card { overflow: hidden; background: #fff; }
    .id-blog-img-wrap { position: relative; overflow: hidden; }
    .id-blog-img { width: 100%; height: 220px; object-fit: cover; display: block; transition: transform 0.5s; }
    .id-blog-card:hover .id-blog-img { transform: scale(1.05); }
    .id-blog-content { padding: 18px 0; }
    .id-blog-date { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 8px; }
    .id-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; line-height: 1.4; color: ${TOKENS.entityTitleColor}; margin: 0; cursor: pointer; }
    .id-blog-title:hover { color: rgba(51,51,51,0.65); }
    @media (max-width: 767px) { .id-blog-grid { grid-template-columns: 1fr !important; } }
  `;

  return (
    <div className="id-blog">
      <ScopedStyles id="blog" css={css} />
      <div style={containerStyle}>
        <InteriorSectionTitle title={sectionTitle} />
        <div className="id-blog-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((post, i) => (
            <div key={i} className="id-blog-card">
              <div className="id-blog-img-wrap">
                <img className="id-blog-img" src={post.image} alt={post.title} />
              </div>
              <div className="id-blog-content">
                {post.date && <div className="id-blog-date">{post.date}</div>}
                <h3 className="id-blog-title">{post.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. BRANDS BAR
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorBrandsBarProps {
  brands?: { name: string; logo: string; link?: string }[];
}

export function InteriorBrandsBar({ brands }: InteriorBrandsBarProps) {
  const defaultBrands = [
    { name: "Alessi", logo: `${IMG}/2016/09/brand-alessi.png` },
    { name: "Eva Solo", logo: `${IMG}/2016/09/brand-Eva-Solo.png` },
    { name: "Flos", logo: `${IMG}/2016/09/brand-flos.png` },
    { name: "Hay", logo: `${IMG}/2016/09/brand-hay.png` },
    { name: "Joseph Joseph", logo: `${IMG}/2016/09/brand-Joseph-Joseph.png` },
    { name: "Louis Poulsen", logo: `${IMG}/2016/09/brand-Louis-Poulsen.png` },
    { name: "Magisso", logo: `${IMG}/2016/09/brand-Magisso.png` },
    { name: "PackIt", logo: `${IMG}/2016/09/brand-PackIt.png` },
    { name: "Rosenthal", logo: `${IMG}/2016/09/brand-Rosenthal.png` },
    { name: "Witra", logo: `${IMG}/2016/09/brand-witra.png` },
  ];

  const items = brands || defaultBrands;

  const css = `
    .id-brands { padding: 40px 0; margin-bottom: 60px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .id-brands-grid { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .id-brand { opacity: 0.5; transition: opacity 0.3s; cursor: pointer; }
    .id-brand:hover { opacity: 1; }
    .id-brand img { height: 30px; width: auto; }
    @media (max-width: 767px) { .id-brands-grid { justify-content: center; } }
  `;

  return (
    <div className="id-brands">
      <ScopedStyles id="brands" css={css} />
      <div style={containerStyle}>
        <div className="id-brands-grid">
          {items.map((brand, i) => (
            <div key={i} className="id-brand">
              <img src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. CTA SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorCtaProps {
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
}

export function InteriorCta({
  title = "DO YOU LIKE THE THEME?\nSHARE WITH YOUR FRIENDS!",
  buttonText = "Buy Theme",
  buttonLink = "#",
  backgroundColor = TOKENS.primaryColor,
}: InteriorCtaProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const css = `
    .id-cta { padding: 60px 40px; text-align: center; margin-bottom: 0; }
    .id-cta-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; line-height: 1.4; color: #fff; margin: 0 0 25px; white-space: pre-line; text-transform: uppercase; letter-spacing: 1px; }
    .id-cta-btn { display: inline-block; padding: 14px 35px; background: #fff; color: ${TOKENS.titleColor}; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: opacity 0.3s; border: none; cursor: pointer; }
    .id-cta-btn:hover { opacity: 0.9; }
    @media (max-width: 767px) { .id-cta-title { font-size: 22px; } .id-cta { padding: 40px 20px; } }
  `;

  return (
    <div className="id-cta" style={{ backgroundColor }}>
      <ScopedStyles id="cta" css={css} />
      <h4 className="id-cta-title">{title}</h4>
      <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="id-cta-btn">{buttonText}</Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export function InteriorFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(InteriorStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
