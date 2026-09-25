"use client";
import { useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   AI BLOCK-BUILDER STORE HEADER
   Used only for AI-generated sites (templateSlug === "ai").
   Deliberately fixed to exactly four nav items — Home, About Us,
   Contact Us, Reviews — with no category- or niche-specific links
   (no "Men"/"Women", no Blog, no Policies). Rendered identically
   on every page of an AI-generated site so navigation is consistent
   everywhere.
   ═══════════════════════════════════════════════════════════════ */

const A = {
  textPrimary: "#1a1a1a",
  border: "#e5e5e5",
  sansFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  containerWidth: "1200px",
};

export interface AiStoreHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
}

export function AiStoreHeader({ storeName, storeSlug, logo }: AiStoreHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const base = `/store/${storeSlug}`;

  // Strictly these four — nothing else. Do not add Shop, Blog,
  // Policies, FAQ, or any category link here.
  const navItems = [
    { label: "Home", href: base },
    { label: "About Us", href: `${base}/about` },
    { label: "Contact Us", href: `${base}/contact` },
    { label: "Reviews", href: `${base}/reviews` },
  ];

  const css = `
    .ai-nav-wrap { position: sticky; top: 0; z-index: 50; background: #ffffff; border-bottom: 1px solid ${A.border}; }
    .ai-nav-inner { max-width: ${A.containerWidth}; margin: 0 auto; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
    .ai-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
    .ai-nav-logo-img { height: 32px; width: auto; object-fit: contain; }
    .ai-nav-logo-text { font-family: ${A.sansFont}; font-weight: 700; font-size: 18px; color: ${A.textPrimary}; text-decoration: none; letter-spacing: 0.02em; }
    .ai-nav-links { display: flex; align-items: center; gap: 32px; }
    .ai-nav-link { font-family: ${A.sansFont}; font-weight: 500; font-size: 14px; color: ${A.textPrimary}; text-decoration: none; transition: opacity 0.2s; }
    .ai-nav-link:hover { opacity: 0.6; }
    .ai-nav-mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: ${A.textPrimary}; padding: 4px; font-size: 22px; line-height: 1; }
    .ai-nav-mobile-menu { display: none; background: #ffffff; border-bottom: 1px solid ${A.border}; padding: 8px 20px 16px; }
    .ai-nav-mobile-menu a { display: block; padding: 12px 0; font-family: ${A.sansFont}; font-weight: 500; font-size: 15px; color: ${A.textPrimary}; text-decoration: none; border-bottom: 1px solid #f0f0f0; }
    .ai-nav-mobile-menu a:last-child { border-bottom: none; }
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
          {logo ? (
            <img src={logo} alt={storeName} className="ai-nav-logo-img" />
          ) : (
            <span className="ai-nav-logo-text">{storeName}</span>
          )}
        </Link>

        <nav className="ai-nav-links">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="ai-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer to balance the mobile toggle button on the left, keeping the logo centered on mobile */}
        <div style={{ width: "22px" }} className="ai-nav-mobile-toggle" aria-hidden="true" />
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
