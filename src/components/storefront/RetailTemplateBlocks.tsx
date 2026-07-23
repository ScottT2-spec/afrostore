"use client";
import { useState } from "react";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";

/* ═══════════════════════════════════════════════════════════════
   RETAIL TEMPLATE BLOCKS
   Home & Garden Decor style - matching WoodMart Retail demo
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#c27843",
  primaryHover: "#a86538",
  titleColor: "#242424",
  textColor: "#767676",
  linkColor: "#333333",
  footerBg: "#0c0c0c",
  containerWidth: "1222px",
  borderRadius: "15px",
  titleFont: "'Montserrat', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
  bgLight: "#f7f7f7",
};

/* ─── SHARED STYLES ─────────────────────────────────────────── */
const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth,
  margin: "0 auto",
  padding: "0 15px",
  boxSizing: "border-box" as const,
  width: "100%",
};

/* ═══════════════════════════════════════════════════════════════
   RETAIL HEADER
   ═══════════════════════════════════════════════════════════════ */

export interface RetailHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (q: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  topBarText?: string;
  isLanding?: boolean;
}

export function RetailHeader({
  storeName, storeSlug, logo, cartCount = 0, wishlistCount = 0,
  onSearch, searchQuery = "", onSearchChange,
  topBarText = "Free delivery on orders over $200.00",
  isLanding = false,
}: RetailHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchUrl = resolveStoreLink(`/shop?search=${encodeURIComponent(query.trim())}`, storeSlug);
      window.location.href = searchUrl;
      setShowSearch(false);
      setLocalSearchQuery("");
    }
  };

  const css = `
    .rh-topbar { background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 12px; padding: 0; }
    .rh-topbar-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 8px 15px; display: flex; align-items: center; justify-content: center; }
    .rh-topbar-text { font-weight: 600; letter-spacing: 0.3px; text-align: center; }
    .rh-main { background: #fff; border-bottom: 1px solid #e5e5e5; }
    .rh-main-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 25px 15px; display: flex; align-items: center; justify-content: space-between; }
    .rh-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .rh-logo-img { height: 45px; width: auto; object-fit: contain; }
    .rh-logo-text { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; color: ${TOKENS.titleColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
    .rh-icons { display: flex; align-items: center; gap: 8px; }
    .rh-icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background: none; border: 1px solid #e5e5e5; cursor: pointer; color: ${TOKENS.linkColor}; font-size: 18px; text-decoration: none; transition: all 0.2s; border-radius: 0; }
    .rh-icon-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; border-color: ${TOKENS.primaryColor}; }
    .rh-badge { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; border-radius: 50%; background: ${TOKENS.primaryColor}; color: #fff; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; line-height: 1; border: 2px solid #fff; }
    .rh-nav { background: #fff; border-bottom: 1px solid #e5e5e5; }
    .rh-nav-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px; display: flex; align-items: center; height: 55px; }
    .rh-nav-links { display: flex; align-items: center; gap: 0; height: 100%; }
    .rh-nav-link { display: flex; align-items: center; height: 100%; padding: 0 20px; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px; color: ${TOKENS.linkColor}; text-decoration: none; text-transform: uppercase; transition: color 0.2s; position: relative; letter-spacing: 0.5px; }
    .rh-nav-link:hover { color: ${TOKENS.primaryColor}; }
    .rh-nav-link.rh-active { color: ${TOKENS.primaryColor}; }
    .rh-nav-link::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: ${TOKENS.primaryColor}; transform: scaleX(0); transition: transform 0.2s;
    }
    .rh-nav-link:hover::after, .rh-nav-link.rh-active::after { transform: scaleX(1); }
    .rh-search-bar { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 15px; background: #fff; border-bottom: 1px solid #e5e5e5; }
    .rh-search-input { width: 100%; padding: 12px 20px; border: 1px solid #ddd; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; background: #f9f9f9; }
    .rh-search-input:focus { border-color: ${TOKENS.primaryColor}; background: #fff; }
    .rh-mobile-toggle { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: ${TOKENS.linkColor}; padding: 8px; }
    .rh-mobile-menu { display: none; background: #fff; border-bottom: 1px solid #e5e5e5; padding: 20px; }
    .rh-mobile-menu a { display: block; padding: 12px 0; font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px; color: ${TOKENS.linkColor}; text-decoration: none; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; letter-spacing: 0.5px; }
    .rh-mobile-menu a:last-child { border-bottom: none; }
    .rh-mobile-menu a:hover { color: ${TOKENS.primaryColor}; }

    @media (max-width: 1024px) {
      .rh-topbar-inner { padding: 6px 15px; }
      .rh-main-inner { padding: 15px; }
      .rh-logo-text { font-size: 22px; }
      .rh-nav { display: none; }
      .rh-mobile-toggle { display: block; }
      .rh-mobile-menu.rh-open { display: block; }
    }
    @media (max-width: 767px) {
      .rh-logo-text { font-size: 18px; }
      .rh-icons { gap: 5px; }
      .rh-icon-btn { width: 38px; height: 38px; font-size: 16px; }
      .rh-topbar-text { font-size: 11px; }
    }
  `;

  return (
    <div className="rh-header">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* Top Bar */}
      <div className="rh-topbar">
        <div className="rh-topbar-inner">
          <div className="rh-topbar-text">{topBarText}</div>
        </div>
      </div>

      {/* Main Header */}
      <div className="rh-main">
        <div className="rh-main-inner">
          <button className="rh-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? "✕" : "☰"}
          </button>
          <Link href={resolveStoreLink("/", storeSlug)} className="rh-logo">
            {logo ? <img src={logo} alt={storeName} className="rh-logo-img" /> : null}
            <span className="rh-logo-text">{storeName}</span>
          </Link>
          <div className="rh-icons">
            {!isLanding && (
              <>
                <button className="rh-icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">🔍</button>
                <Link href={resolveStoreLink("/wishlist", storeSlug)} className="rh-icon-btn" aria-label="Wishlist">
                  ♡{wishlistCount > 0 && <span className="rh-badge">{wishlistCount}</span>}
                </Link>
                <Link href={resolveStoreLink("/cart", storeSlug)} className="rh-icon-btn" aria-label="Cart">
                  🛒{cartCount > 0 && <span className="rh-badge">{cartCount}</span>}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="rh-search-bar">
          <input
            autoFocus
            type="text"
            className="rh-search-input"
            placeholder="Search products..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(localSearchQuery); }}
          />
        </div>
      )}

      {/* Desktop Nav */}
      <nav className="rh-nav">
        <div className="rh-nav-inner">
          <div className="rh-nav-links">
            <Link href={resolveStoreLink("/shop", storeSlug)} className="rh-nav-link">Shop</Link>
            <Link href={resolveStoreLink("/about", storeSlug)} className="rh-nav-link">About Us</Link>
            <Link href={resolveStoreLink("/projects", storeSlug)} className="rh-nav-link">Projects</Link>
            {!isLanding && <Link href={resolveStoreLink("/contact", storeSlug)} className="rh-nav-link">Contact Us</Link>}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`rh-mobile-menu ${mobileMenu ? "rh-open" : ""}`}>
        <Link href={resolveStoreLink("/shop", storeSlug)} onClick={() => setMobileMenu(false)}>Shop</Link>
        <Link href={resolveStoreLink("/about", storeSlug)} onClick={() => setMobileMenu(false)}>About Us</Link>
        <Link href={resolveStoreLink("/projects", storeSlug)} onClick={() => setMobileMenu(false)}>Projects</Link>
        {!isLanding && <Link href={resolveStoreLink("/contact", storeSlug)} onClick={() => setMobileMenu(false)}>Contact Us</Link>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RETAIL FOOTER
   ═══════════════════════════════════════════════════════════════ */

export interface RetailFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  description?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  contactInfo?: { address?: string; phone?: string; email?: string };
}

export function RetailFooter({
  storeName, storeSlug, logo, description,
  socialLinks = [], contactInfo,
}: RetailFooterProps) {
  const css = `
    .rf-footer { background: ${TOKENS.footerBg}; color: rgba(255,255,255,0.6); font-family: ${TOKENS.bodyFont}; padding: 70px 0 0; }
    .rf-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 45px; }
    .rf-col-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 15px; color: #fff; text-transform: uppercase; margin: 0 0 25px; letter-spacing: 1px; }
    .rf-text { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 20px; }
    .rf-links { list-style: none; padding: 0; margin: 0; }
    .rf-links li { margin-bottom: 12px; }
    .rf-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .rf-links a:hover { color: ${TOKENS.primaryColor}; }
    .rf-contact-item { display: flex; gap: 12px; margin-bottom: 15px; font-size: 14px; line-height: 1.6; }
    .rf-contact-label { color: #fff; font-weight: 700; min-width: 70px; }
    .rf-social { display: flex; gap: 12px; margin-top: 20px; }
    .rf-social-icon { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .rf-social-icon:hover { border-color: ${TOKENS.primaryColor}; background: ${TOKENS.primaryColor}; color: #fff; }
    .rf-bottom { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 30px 15px; margin-top: 50px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .rf-copyright { color: rgba(255,255,255,0.4); }
    .rf-logo-text { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 22px; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: inline-block; }
    @media (max-width: 1024px) { .rf-inner { grid-template-columns: repeat(2, 1fr); gap: 35px; } }
    @media (max-width: 767px) { .rf-inner { grid-template-columns: 1fr; gap: 30px; } .rf-bottom { flex-direction: column; gap: 15px; text-align: center; } }
  `;

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪",
  };

  return (
    <footer className="rf-footer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rf-inner">
        {/* Col 1: About */}
        <div>
          <Link href={resolveStoreLink("/", storeSlug)} className="rf-logo-text">{storeName}</Link>
          <p className="rf-text">{description || "Handcrafted leather goods made with passion and precision. Every bag tells a story of artisan excellence."}</p>
          <div className="rf-social">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} className="rf-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Shop */}
        <div>
          <h4 className="rf-col-title">Shop</h4>
          <ul className="rf-links">
            <li><Link href={resolveStoreLink("/shop?category=women", storeSlug)}>Women</Link></li>
            <li><Link href={resolveStoreLink("/shop?category=men", storeSlug)}>Men</Link></li>
            <li><Link href={resolveStoreLink("/shop?tag=bestseller", storeSlug)}>Bestsellers</Link></li>
            <li><Link href={resolveStoreLink("/shop?tag=new-arrival", storeSlug)}>New Arrivals</Link></li>
          </ul>
        </div>

        {/* Col 3: Information */}
        <div>
          <h4 className="rf-col-title">Information</h4>
          <ul className="rf-links">
            <li><Link href={resolveStoreLink("/blog", storeSlug)}>Blog</Link></li>
            <li><Link href={resolveStoreLink("/about", storeSlug)}>About Us</Link></li>
            <li><Link href={resolveStoreLink("/projects", storeSlug)}>Projects</Link></li>
            <li><Link href={resolveStoreLink("/our-story", storeSlug)}>Our Story</Link></li>
            <li><Link href={resolveStoreLink("/contact", storeSlug)}>Contact Us</Link></li>
            <li><Link href={resolveStoreLink("/reviews", storeSlug)}>Reviews</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h4 className="rf-col-title">Contact Us</h4>
          {contactInfo?.address && (
            <div className="rf-contact-item">
              <span className="rf-contact-label">Address:</span>
              <span>{contactInfo.address}</span>
            </div>
          )}
          {contactInfo?.phone && (
            <div className="rf-contact-item">
              <span className="rf-contact-label">Phone:</span>
              <span>{contactInfo.phone}</span>
            </div>
          )}
          {contactInfo?.email && (
            <div className="rf-contact-item">
              <span className="rf-contact-label">Email:</span>
              <span>{contactInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rf-bottom">
        <span className="rf-copyright">© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
      </div>
    </footer>
  );
}
