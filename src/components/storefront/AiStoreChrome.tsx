"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   AI BLOCK-BUILDER STORE HEADER
   Used only for AI-generated sites (templateSlug === "ai").
   Deliberately fixed to exactly four nav items — Home, About Us,
   Contact Us, Shop — with no category- or niche-specific links
   (no "Men"/"Women", no Blog, no Policies). Rendered identically
   on every page of an AI-generated site so navigation is consistent
   everywhere.
   ═══════════════════════════════════════════════════════════════ */

const A = {
  textPrimary: "#1a1a1a",
  border: "#e5e5e5",
  cream: "#F1E4C8",
  creamBorder: "#E0CFA8",
  sansFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  containerWidth: "1200px",
};

export interface AiStoreHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  /** Store id — the wishlist is cached in localStorage under this id, so
   *  without it the wishlist badge can't show a count (icon still links). */
  siteId?: string;
}

// Cart is stored per store slug by the storefront pages as an array of
// items with a `quantity`; the wishlist as an array of product ids keyed
// by site id (see useWishlist). Read both straight from localStorage so
// the header works identically on every page without each page having to
// pass live counts down.
function readCounts(storeSlug: string, siteId?: string) {
  if (typeof window === "undefined") return { cart: 0, wishlist: 0 };
  let cart = 0;
  let wishlist = 0;
  try {
    const raw = localStorage.getItem(`prokip_cart_${storeSlug}`);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) cart = parsed.reduce((n: number, i: { quantity?: number }) => n + (Number(i?.quantity) || 1), 0);
  } catch { /* ignore */ }
  try {
    if (siteId) {
      const raw = localStorage.getItem(`wishlist_${siteId}`);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) wishlist = parsed.length;
    }
  } catch { /* ignore */ }
  return { cart, wishlist };
}

export function AiStoreHeader({ storeName, storeSlug, logo, siteId }: AiStoreHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0 });
  const base = `/store/${storeSlug}`;

  useEffect(() => {
    const update = () => setCounts(readCounts(storeSlug, siteId));
    update();
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    // `storage` doesn't fire for changes made in the same tab, so poll
    // lightly to keep the badge live when an item is added on this page.
    const t = setInterval(update, 1500);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      clearInterval(t);
    };
  }, [storeSlug, siteId]);

  // Strictly these four — nothing else. Do not add Shop, Blog,
  // Policies, FAQ, or any category link here.
  const navItems = [
    { label: "Home", href: base },
    { label: "About Us", href: `${base}/about` },
    { label: "Contact Us", href: `${base}/contact` },
    { label: "Shop", href: `${base}/shop` },
  ];

  const css = `
    .ai-nav-wrap { position: sticky; top: 0; z-index: 50; background: ${A.cream}; border-bottom: 1px solid ${A.creamBorder}; }
    .ai-nav-inner { max-width: ${A.containerWidth}; margin: 0 auto; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
    .ai-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
    .ai-nav-logo-img { height: 32px; width: auto; object-fit: contain; }
    .ai-nav-logo-text { font-family: ${A.sansFont}; font-weight: 700; font-size: 18px; color: ${A.textPrimary}; text-decoration: none; letter-spacing: 0.02em; }
    .ai-nav-logo-text--with-logo { max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @media (max-width: 640px) { .ai-nav-logo-text--with-logo { max-width: 38vw; font-size: 16px; } }
    .ai-nav-links { display: flex; align-items: center; gap: 32px; }
    .ai-nav-link { font-family: ${A.sansFont}; font-weight: 700; font-size: 14px; color: ${A.textPrimary}; text-decoration: none; transition: opacity 0.2s; }
    .ai-nav-link:hover { opacity: 0.6; }
    .ai-nav-right { display: flex; align-items: center; gap: 28px; }
    .ai-nav-icons { display: flex; align-items: center; gap: 6px; }
    .ai-nav-icon { position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; color: ${A.textPrimary}; text-decoration: none; transition: opacity 0.2s; }
    .ai-nav-icon:hover { opacity: 0.6; }
    .ai-nav-badge { position: absolute; top: 2px; right: 0; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: ${A.textPrimary}; color: ${A.cream}; font-family: ${A.sansFont}; font-size: 10px; font-weight: 700; line-height: 17px; text-align: center; }
    .ai-nav-mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: ${A.textPrimary}; padding: 4px; font-size: 22px; line-height: 1; }
    .ai-nav-mobile-menu { display: none; background: ${A.cream}; border-bottom: 1px solid ${A.creamBorder}; padding: 8px 20px 16px; }
    .ai-nav-mobile-menu a { display: block; padding: 12px 0; font-family: ${A.sansFont}; font-weight: 700; font-size: 15px; color: ${A.textPrimary}; text-decoration: none; }
    @media (max-width: 768px) {
      .ai-nav-links { display: none; }
      .ai-nav-mobile-toggle { display: flex; }
      .ai-nav-mobile-menu.ai-nav-open { display: block; }
    }
  `;

  return (
    <div className="ai-nav-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ai-nav-inner">
        <button className="ai-nav-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
          {mobileMenu ? "✕" : "☰"}
        </button>

        <Link href={base} className="ai-nav-logo">
          {/* Logo (when uploaded) sits beside the business name, not instead of it */}
          {logo && <img src={logo} alt="" className="ai-nav-logo-img" />}
          <span className={logo ? "ai-nav-logo-text ai-nav-logo-text--with-logo" : "ai-nav-logo-text"}>{storeName}</span>
        </Link>

        <div className="ai-nav-right">
          <nav className="ai-nav-links">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="ai-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ai-nav-icons">
            <Link href={`${base}/wishlist`} className="ai-nav-icon" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
              {counts.wishlist > 0 && <span className="ai-nav-badge">{counts.wishlist}</span>}
            </Link>
            <Link href={`${base}/cart`} className="ai-nav-icon" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              {counts.cart > 0 && <span className="ai-nav-badge">{counts.cart}</span>}
            </Link>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <div className={`ai-nav-mobile-menu ${mobileMenu ? "ai-nav-open" : ""}`}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMobileMenu(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI BLOCK-BUILDER STORE FOOTER
   Same rule as the header above: exactly the four mandatory pages
   (Home, About Us, Contact Us, Shop), rendered identically on
   every page of an AI-generated site. Added alongside the header —
   the header got this same-nav treatment earlier, but nothing filled
   in the equivalent footer, so About/Contact/Reviews were still
   falling back to a hardcoded, niche-template footer (or nothing, on
   Home) instead of matching each other.
   ═══════════════════════════════════════════════════════════════ */

export interface AiStoreFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  description?: string | null;
  socialLinks?: Array<{ platform: string; url: string }>;
}

const SOCIAL_ICON_PATHS: Record<string, string> = {
  instagram: "M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44 2.54c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34z",
  facebook: "M13.5 21v-8.1h2.7l.4-3.2h-3.1V7.7c0-.9.25-1.5 1.55-1.5H16.7V3.3c-.28-.04-1.25-.13-2.37-.13-2.34 0-3.94 1.43-3.94 4.05v2.26H7.7v3.2h2.69V21h3.11z",
  tiktok: "M16.6 5.82c-.97-.9-1.56-2.15-1.6-3.55V2h-3.2v13.5a2.85 2.85 0 1 1-2.02-2.73V9.5a6.05 6.05 0 1 0 5.22 6v-6.8a8.15 8.15 0 0 0 4.6 1.43V7.02a4.85 4.85 0 0 1-2.99-1.2z",
};

function AiFooterSocialIcons({ socialLinks }: { socialLinks?: Array<{ platform: string; url: string }> }) {
  const shown = (socialLinks || []).filter((l) => SOCIAL_ICON_PATHS[l.platform] && l.url);
  if (shown.length === 0) return null;
  return (
    <div className="ai-footer-social">
      {shown.map((l) => (
        <a key={l.platform} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.platform} className="ai-footer-social-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={SOCIAL_ICON_PATHS[l.platform]} /></svg>
        </a>
      ))}
    </div>
  );
}

export function AiStoreFooter({ storeName, storeSlug, logo, description, socialLinks }: AiStoreFooterProps) {
  const base = `/store/${storeSlug}`;
  const navItems = [
    { label: "Home", href: base },
    { label: "About Us", href: `${base}/about` },
    { label: "Contact Us", href: `${base}/contact` },
    { label: "Shop", href: `${base}/shop` },
  ];

  const css = `
    .ai-footer-wrap { background: #b5b5b2; border-top: 1px solid ${A.border}; }
    .ai-footer-inner { max-width: ${A.containerWidth}; margin: 0 auto; padding: 48px 20px 28px; display: flex; flex-direction: column; gap: 24px; }
    .ai-footer-top { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 24px; }
    .ai-footer-brand { display: flex; flex-direction: column; gap: 8px; max-width: 360px; }
    .ai-footer-logo-img { height: 28px; width: auto; object-fit: contain; }
    .ai-footer-logo-text { font-family: ${A.sansFont}; font-weight: 700; font-size: 16px; color: ${A.textPrimary}; }
    .ai-footer-desc { font-family: ${A.sansFont}; font-size: 13px; color: #3a3a38; line-height: 1.5; }
    .ai-footer-links { display: flex; flex-wrap: wrap; gap: 24px; }
    .ai-footer-link { font-family: ${A.sansFont}; font-weight: 500; font-size: 13px; color: ${A.textPrimary}; text-decoration: none; }
    .ai-footer-link:hover { opacity: 0.6; }
    .ai-footer-social { display: flex; gap: 10px; margin-top: 4px; }
    .ai-footer-social-icon { width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: ${A.textPrimary}; transition: opacity 0.2s; }
    .ai-footer-social-icon:hover { opacity: 0.6; }
    .ai-footer-bottom { border-top: 1px solid rgba(0,0,0,0.15); padding-top: 16px; font-family: ${A.sansFont}; font-size: 12px; color: #47473f; }
  `;

  return (
    <div className="ai-footer-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ai-footer-inner">
        <div className="ai-footer-top">
          <div className="ai-footer-brand">
            {logo ? (
              <img src={logo} alt={storeName} className="ai-footer-logo-img" />
            ) : (
              <span className="ai-footer-logo-text">{storeName}</span>
            )}
            {description && <p className="ai-footer-desc">{description}</p>}
            <AiFooterSocialIcons socialLinks={socialLinks} />
          </div>
          <nav className="ai-footer-links">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="ai-footer-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ai-footer-bottom">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
