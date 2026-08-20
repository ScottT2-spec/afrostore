"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { createContext, useContext, useState } from "react";
import { onImgError } from "./image-fallback";
import { InlineEditableText } from "@/components/storefront/InlineEditableText";

/* ═══════════════════════════════════════════════════════════════
   AEGIS LANDING PAGE TEMPLATE BLOCKS
   Health/medical landing page inspired by Aegis Health demo.
   Source: https://demo.templatesjungle.com/aegis/
   ═══════════════════════════════════════════════════════════════ */

/* ─── Context ──────────────────────────────────────────────── */
interface AegisContextData { storeSlug?: string; }
const AegisCtx = createContext<AegisContextData>({});
export { AegisCtx as AegisLandingContext };
function useFix() { const ctx = useContext(AegisCtx); return (l: string) => resolveStoreLink(l, ctx?.storeSlug, true); }

/* ─── Design Tokens ────────────────────────────────────────── */
const C = {
  primary: "#000666",
  secondary: "#b80049",
  secondaryContainer: "#e2165f",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#8690ee",
  primaryFixed: "#e0e0ff",
  primaryFixedDim: "#bdc2ff",
  primaryContainer: "#1a237e",
  surface: "#f9f9fb",
  surfaceLow: "#f3f3f5",
  surfaceLowest: "#ffffff",
  surfaceContainer: "#eeeef0",
  onSurface: "#1a1c1d",
  onSurfaceVariant: "#454652",
  outline: "#767683",
  headlineFont: "'Noto Serif', Georgia, serif",
  bodyFont: "'Manrope', Arial, sans-serif",
};

/* ─── Font Loader ──────────────────────────────────────────── */
export function AegisLandingFontLoader() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </>
  );
}

function S({ id, css }: { id: string; css: string }) {
  return <style data-aegis={id} dangerouslySetInnerHTML={{ __html: css }} />;
}
const ctr: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 32px", boxSizing: "border-box" as const };

function EditableCopy({
  blockId,
  isEditor = false,
  field,
  fieldPath,
  value,
  as = "div",
  className,
  style,
  multiline = false,
}: {
  blockId?: string;
  isEditor?: boolean;
  field?: string;
  fieldPath?: string;
  value: string;
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  const Tag = as;
  if (!isEditor) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }
  return <InlineEditableText nodeId={blockId} field={field} fieldPath={fieldPath} value={value} isEditor={isEditor} as={as} className={className} style={style} multiline={multiline} />;
}

/* ═══════════════════════════════════════════════════════════════
   1. HEADER
   ═══════════════════════════════════════════════════════════════ */
export interface AegisHeaderProps {
  brandName?: string;
  navLinks?: Array<{ label: string; href: string; active?: boolean }>;
  portalText?: string;
  portalLink?: string;
  ctaText?: string;
  ctaLink?: string;
  blockId?: string;
  isEditor?: boolean;
}

export function AegisHeader({
  brandName = "Aegis Health",
  navLinks = [],
  portalText = "Patient Portal",
  portalLink = "#",
  ctaText = "Donate",
  ctaLink = "#",
  blockId,
  isEditor = false,
}: AegisHeaderProps) {
  const fix = useFix();
  const css = `
    .aegis-nav { position: sticky; top: 0; z-index: 50; background: ${C.surface}; }
    .aegis-nav-inner { display: flex; justify-content: space-between; align-items: center; max-width: 1280px; margin: 0 auto; padding: 16px 32px; }
    .aegis-brand { font-family: ${C.headlineFont}; font-size: 1.5rem; font-weight: 700; color: ${C.primary}; text-decoration: none; }
    .aegis-links { display: flex; align-items: center; gap: 32px; }
    .aegis-link { font-family: ${C.bodyFont}; font-size: 14px; color: #64748b; text-decoration: none; transition: color 0.2s; }
    .aegis-link:hover { color: ${C.primary}; }
    .aegis-link-active { color: ${C.primary}; font-weight: 700; border-bottom: 2px solid ${C.secondary}; padding-bottom: 4px; }
    .aegis-nav-right { display: flex; align-items: center; gap: 16px; }
    .aegis-portal { font-family: ${C.bodyFont}; font-size: 14px; font-weight: 600; color: ${C.primary}; text-decoration: none; transition: color 0.2s; }
    .aegis-portal:hover { color: ${C.secondary}; }
    .aegis-donate { display: inline-block; background: ${C.secondary}; color: #fff; padding: 8px 24px; border-radius: 8px; font-family: ${C.bodyFont}; font-weight: 700; font-size: 14px; text-decoration: none; transition: transform 0.15s; border: none; cursor: pointer; }
    .aegis-donate:hover { transform: scale(1.02); }
    @media (max-width: 768px) { .aegis-links { display: none; } }
  `;
  return (
    <nav className="aegis-nav">
      <S id="header" css={css} />
      <div className="aegis-nav-inner">
        {isEditor ? <EditableCopy blockId={blockId} isEditor field="brandName" value={brandName} as="span" className="aegis-brand" /> : <Link href={fix("/")} className="aegis-brand">{brandName}</Link>}
        <div className="aegis-links">
          {navLinks.map((l, i) => isEditor ? <EditableCopy key={i} blockId={blockId} isEditor fieldPath={`navLinks.${i}.label`} value={l.label} as="span" className={`aegis-link ${l.active ? "aegis-link-active" : ""}`} /> : <Link key={i} href={fix(l.href)} className={`aegis-link ${l.active ? "aegis-link-active" : ""}`}>{l.label}</Link>)}
        </div>
        <div className="aegis-nav-right">
          {isEditor ? <EditableCopy blockId={blockId} isEditor field="portalText" value={portalText} as="span" className="aegis-portal" /> : <Link href={fix(portalLink)} className="aegis-portal">{portalText}</Link>}
          {isEditor ? <EditableCopy blockId={blockId} isEditor field="ctaText" value={ctaText} as="span" className="aegis-donate" /> : <Link href={fix(ctaLink)} className="aegis-donate">{ctaText}</Link>}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. HERO
   ═══════════════════════════════════════════════════════════════ */
export interface AegisHeroStat { value: string; label: string; style?: "light" | "primary" | "secondary" | "surface"; }
export interface AegisHeroProps {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  stats?: AegisHeroStat[];
  blockId?: string;
  isEditor?: boolean;
}

export function AegisHero({
  titleLine1 = "Living Beyond,",
  titleLine2 = "Living Well.",
  description = "",
  primaryButtonText = "Get Tested Today",
  primaryButtonLink = "#",
  secondaryButtonText = "View Care Programs",
  secondaryButtonLink = "#",
  backgroundImage = "",
  stats = [],
  blockId,
  isEditor = false,
}: AegisHeroProps) {
  const fix = useFix();
  const statStyles: Record<string, { bg: string; textColor: string; labelColor: string }> = {
    light: { bg: C.surfaceLowest, textColor: C.secondary, labelColor: C.onSurfaceVariant },
    primary: { bg: C.primaryContainer, textColor: C.onPrimaryContainer, labelColor: C.primaryFixedDim },
    secondary: { bg: C.secondaryContainer, textColor: "#fff", labelColor: "rgba(255,255,255,0.8)" },
    surface: { bg: C.surfaceLow, textColor: C.primary, labelColor: C.onSurfaceVariant },
  };
  const css = `
    .aegis-hero { position: relative; min-height: 870px; display: flex; align-items: center; overflow: hidden; background: ${C.primary}; }
    .aegis-hero-bg { position: absolute; inset: 0; z-index: 0; }
    .aegis-hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.3; mix-blend-mode: overlay; }
    .aegis-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, ${C.primary} 0%, ${C.primary}e6 50%, transparent 100%); }
    .aegis-hero-grid { position: relative; z-index: 10; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
    .aegis-hero-text { display: flex; flex-direction: column; gap: 32px; }
    .aegis-hero-h1 { font-family: ${C.headlineFont}; font-size: clamp(3rem, 5vw, 4.5rem); color: #fff; line-height: 1.1; margin: 0; }
    .aegis-hero-h1 em { color: ${C.onPrimaryContainer}; font-style: italic; }
    .aegis-hero-desc { font-family: ${C.bodyFont}; font-size: 1.125rem; color: ${C.primaryFixed}; max-width: 560px; font-weight: 300; line-height: 1.7; margin: 0; }
    .aegis-hero-btns { display: flex; flex-wrap: wrap; gap: 16px; padding-top: 16px; }
    .aegis-hero-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 32px; border-radius: 8px; font-family: ${C.bodyFont}; font-weight: 700; font-size: 1.125rem; text-decoration: none; transition: all 0.2s; border: none; cursor: pointer; }
    .aegis-hero-btn-pri { background: ${C.secondary}; color: #fff; }
    .aegis-hero-btn-pri:hover { background: ${C.secondaryContainer}; }
    .aegis-hero-btn-sec { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; }
    .aegis-hero-btn-sec:hover { background: rgba(255,255,255,0.1); }
    .aegis-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .aegis-stat { padding: 32px; border-radius: 12px; display: flex; flex-direction: column; justify-content: flex-end; }
    .aegis-stat:nth-child(1) { height: 192px; }
    .aegis-stat:nth-child(2) { height: 256px; transform: translateY(32px); }
    .aegis-stat:nth-child(3) { height: 256px; transform: translateY(-32px); }
    .aegis-stat:nth-child(4) { height: 192px; }
    .aegis-stat-val { font-family: ${C.headlineFont}; font-size: 2.25rem; font-weight: 700; margin: 0; }
    .aegis-stat-label { font-family: ${C.bodyFont}; font-weight: 500; font-size: 14px; margin: 0; }
    @media (max-width: 1024px) { .aegis-hero-grid { grid-template-columns: 1fr; } .aegis-stats-grid { display: none; } .aegis-hero { min-height: 600px; } }
  `;
  return (
    <header className="aegis-hero">
      <S id="hero" css={css} />
      <div className="aegis-hero-bg">
        {backgroundImage && <img src={backgroundImage} alt="Hero" onError={(e) => onImgError(e, "hero")} />}
        <div className="aegis-hero-overlay" />
      </div>
      <div style={{ ...ctr, width: "100%", padding: "96px 32px" }}>
        <div className="aegis-hero-grid">
          <div className="aegis-hero-text">
            <EditableCopy blockId={blockId} isEditor={isEditor} field="titleLine1" value={titleLine1} as="h1" className="aegis-hero-h1" />
            <EditableCopy blockId={blockId} isEditor={isEditor} field="titleLine2" value={titleLine2} as="span" style={{ fontStyle: "italic" }} />
            {description && <EditableCopy blockId={blockId} isEditor={isEditor} field="description" value={description} as="p" multiline className="aegis-hero-desc" />}
            <div className="aegis-hero-btns">
              {isEditor ? <EditableCopy blockId={blockId} isEditor field="primaryButtonText" value={primaryButtonText} as="span" className="aegis-hero-btn aegis-hero-btn-pri" /> : <Link href={fix(primaryButtonLink)} className="aegis-hero-btn aegis-hero-btn-pri">{primaryButtonText} →</Link>}
              {secondaryButtonText && (isEditor ? <EditableCopy blockId={blockId} isEditor field="secondaryButtonText" value={secondaryButtonText} as="span" className="aegis-hero-btn aegis-hero-btn-sec" /> : <Link href={fix(secondaryButtonLink)} className="aegis-hero-btn aegis-hero-btn-sec">{secondaryButtonText}</Link>)}
            </div>
          </div>
          {stats.length > 0 && (
            <div className="aegis-stats-grid">
              {stats.map((s, i) => {
                const st = statStyles[s.style || "light"];
                return (
                  <div key={i} className="aegis-stat" style={{ background: st.bg }}>
                    <EditableCopy blockId={blockId} isEditor={isEditor} fieldPath={`stats.${i}.value`} value={s.value} as="p" className="aegis-stat-val" style={{ color: st.textColor }} />
                    <EditableCopy blockId={blockId} isEditor={isEditor} fieldPath={`stats.${i}.label`} value={s.label} as="p" className="aegis-stat-label" style={{ color: st.labelColor }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. SERVICES / OUR APPROACH
   ═══════════════════════════════════════════════════════════════ */
export interface AegisServiceCard { icon: string; title: string; description: string; accent?: boolean; }
export interface AegisServicesProps {
  subtitle?: string;
  title?: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  cards?: AegisServiceCard[];
  blockId?: string;
  isEditor?: boolean;
}

export function AegisServices({
  subtitle = "Our Approach",
  title = "Innovative Care,\nPersonalized Journeys",
  description = "",
  linkText = "Explore our medical protocols",
  linkHref = "#",
  cards = [],
  blockId,
  isEditor = false,
}: AegisServicesProps) {
  const fix = useFix();
  const css = `
    .aegis-svc { padding: 96px 0; }
    .aegis-svc-layout { display: flex; gap: 64px; align-items: flex-start; }
    .aegis-svc-left { flex: 0 0 33.33%; position: sticky; top: 128px; }
    .aegis-svc-sub { font-family: ${C.bodyFont}; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.875rem; color: ${C.secondary}; margin: 0 0 16px; }
    .aegis-svc-title { font-family: ${C.headlineFont}; font-size: 2.25rem; color: ${C.primary}; margin: 0 0 24px; line-height: 1.2; white-space: pre-line; }
    .aegis-svc-desc { font-family: ${C.bodyFont}; font-size: 1.125rem; color: ${C.onSurfaceVariant}; line-height: 1.7; margin: 0 0 32px; }
    .aegis-svc-link { font-family: ${C.bodyFont}; font-weight: 700; color: ${C.secondary}; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .aegis-svc-link:hover { gap: 12px; }
    .aegis-svc-right { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .aegis-card { padding: 40px; border-radius: 12px; display: flex; flex-direction: column; gap: 16px; }
    .aegis-card:nth-child(even) { transform: translateY(48px); }
    .aegis-card-light { background: ${C.surfaceLowest}; }
    .aegis-card-dim { background: ${C.surfaceLow}; }
    .aegis-card-icon { font-size: 2.25rem; }
    .aegis-card-icon-accent { color: ${C.secondary}; }
    .aegis-card-icon-primary { color: ${C.primary}; }
    .aegis-card-title { font-family: ${C.headlineFont}; font-size: 1.5rem; color: ${C.primary}; margin: 0; }
    .aegis-card-desc { font-family: ${C.bodyFont}; color: ${C.onSurfaceVariant}; margin: 0; line-height: 1.6; }
    @media (max-width: 1024px) { .aegis-svc-layout { flex-direction: column; } .aegis-svc-left { position: static; } .aegis-svc-right { grid-template-columns: 1fr; } .aegis-card:nth-child(even) { transform: none; } }
  `;
  return (
    <section className="aegis-svc" style={{ background: C.surface }}>
      <S id="services" css={css} />
      <div style={ctr}>
        <div className="aegis-svc-layout">
          <div className="aegis-svc-left">
            {subtitle && <EditableCopy blockId={blockId} isEditor={isEditor} field="subtitle" value={subtitle} as="p" className="aegis-svc-sub" />}
            <EditableCopy blockId={blockId} isEditor={isEditor} field="title" value={title} as="h2" multiline className="aegis-svc-title" />
            {description && <EditableCopy blockId={blockId} isEditor={isEditor} field="description" value={description} as="p" multiline className="aegis-svc-desc" />}
            {linkText && (isEditor ? <EditableCopy blockId={blockId} isEditor field="linkText" value={linkText} as="span" className="aegis-svc-link" /> : <Link href={fix(linkHref)} className="aegis-svc-link">{linkText} →</Link>)}
          </div>
          <div className="aegis-svc-right">
            {cards.map((c, i) => (
              <div key={i} className={`aegis-card ${i % 2 === 0 ? "aegis-card-light" : "aegis-card-dim"}`}>
                <span className={`material-symbols-outlined aegis-card-icon ${c.accent ? "aegis-card-icon-accent" : "aegis-card-icon-primary"}`}>{c.icon}</span>
                <EditableCopy blockId={blockId} isEditor={isEditor} fieldPath={`cards.${i}.title`} value={c.title} as="h3" className="aegis-card-title" />
                <EditableCopy blockId={blockId} isEditor={isEditor} fieldPath={`cards.${i}.description`} value={c.description} as="p" multiline className="aegis-card-desc" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. STORIES / TESTIMONIAL
   ═══════════════════════════════════════════════════════════════ */
export interface AegisStoriesProps {
  sectionTitle?: string;
  storyImage?: string;
  storyBadge?: string;
  storyQuote?: string;
  storyAuthor?: string;
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialRole?: string;
  testimonialAvatar?: string;
  blockId?: string;
  isEditor?: boolean;
}

export function AegisStories({
  sectionTitle = "Stories of Resilience",
  storyImage = "",
  storyBadge = "Advocate Story",
  storyQuote = "",
  storyAuthor = "",
  testimonialQuote = "",
  testimonialName = "",
  testimonialRole = "",
  testimonialAvatar = "",
  blockId,
  isEditor = false,
}: AegisStoriesProps) {
  const css = `
    .aegis-stories { background: ${C.surfaceLow}; padding: 128px 0; }
    .aegis-stories-header { text-align: center; margin-bottom: 80px; }
    .aegis-stories-h2 { font-family: ${C.headlineFont}; font-size: clamp(2.25rem, 4vw, 3rem); color: ${C.primary}; margin: 0; }
    .aegis-stories-bar { width: 96px; height: 4px; background: ${C.secondary}; margin: 24px auto 0; }
    .aegis-stories-grid { display: grid; grid-template-columns: 7fr 5fr; gap: 32px; align-items: center; }
    .aegis-story-img-wrap { position: relative; overflow: hidden; border-radius: 16px; aspect-ratio: 16/9; }
    .aegis-story-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s; }
    .aegis-story-img-wrap:hover img { transform: scale(1.05); }
    .aegis-story-overlay { position: absolute; inset: 0; background: linear-gradient(to top, ${C.primary}cc 0%, transparent 50%); }
    .aegis-story-text { position: absolute; bottom: 0; left: 0; padding: 32px; color: #fff; }
    .aegis-story-badge { display: inline-block; background: ${C.secondary}; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; font-family: ${C.bodyFont}; }
    .aegis-story-quote { font-family: ${C.headlineFont}; font-size: 1.875rem; margin: 0 0 8px; }
    .aegis-story-author { font-style: italic; opacity: 0.8; font-family: ${C.bodyFont}; margin: 0; }
    .aegis-testimonial { background: ${C.surfaceLowest}; padding: 48px; border-radius: 16px; border-left: 4px solid ${C.secondary}; display: flex; flex-direction: column; justify-content: center; }
    .aegis-testimonial-icon { font-size: 3rem; color: ${C.secondary}; margin-bottom: 24px; }
    .aegis-testimonial-text { font-family: ${C.bodyFont}; font-size: 1.25rem; line-height: 1.7; color: ${C.onSurfaceVariant}; margin: 0 0 32px; }
    .aegis-testimonial-author { display: flex; align-items: center; gap: 16px; }
    .aegis-testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: ${C.surfaceContainer}; }
    .aegis-testimonial-name { font-family: ${C.bodyFont}; font-weight: 700; color: ${C.primary}; margin: 0; }
    .aegis-testimonial-role { font-family: ${C.bodyFont}; font-size: 0.875rem; color: ${C.onSurfaceVariant}; margin: 0; }
    @media (max-width: 1024px) { .aegis-stories-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="aegis-stories">
      <S id="stories" css={css} />
      <div style={ctr}>
        <div className="aegis-stories-header">
          <EditableCopy blockId={blockId} isEditor={isEditor} field="sectionTitle" value={sectionTitle} as="h2" className="aegis-stories-h2" />
          <div className="aegis-stories-bar" />
        </div>
        <div className="aegis-stories-grid">
          <div className="aegis-story-img-wrap">
            {storyImage && <img src={storyImage} alt="Story" onError={(e) => onImgError(e, "story")} />}
            <div className="aegis-story-overlay" />
            <div className="aegis-story-text">
              <EditableCopy blockId={blockId} isEditor={isEditor} field="storyBadge" value={storyBadge} as="span" className="aegis-story-badge" />
              <EditableCopy blockId={blockId} isEditor={isEditor} field="storyQuote" value={storyQuote} as="h4" className="aegis-story-quote" />
              <EditableCopy blockId={blockId} isEditor={isEditor} field="storyAuthor" value={storyAuthor} as="p" className="aegis-story-author" />
            </div>
          </div>
          <div className="aegis-testimonial">
            <span className="material-symbols-outlined aegis-testimonial-icon">format_quote</span>
            <EditableCopy blockId={blockId} isEditor={isEditor} field="testimonialQuote" value={testimonialQuote} as="p" multiline className="aegis-testimonial-text" />
            <div className="aegis-testimonial-author">
              {testimonialAvatar && <img src={testimonialAvatar} alt={testimonialName} className="aegis-testimonial-avatar" onError={(e) => onImgError(e, "avatar")} />}
              <div>
                <EditableCopy blockId={blockId} isEditor={isEditor} field="testimonialName" value={testimonialName} as="p" className="aegis-testimonial-name" />
                <EditableCopy blockId={blockId} isEditor={isEditor} field="testimonialRole" value={testimonialRole} as="p" className="aegis-testimonial-role" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. CTA SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface AegisCTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  /** Show an inline email capture form (feeds the site's CRM as a lead). Defaults to true — this is a landing page. */
  showLeadForm?: boolean;
  leadFormButtonText?: string;
  leadFormSuccessMessage?: string;
  storeSlug?: string;
  blockId?: string;
  isEditor?: boolean;
}

export function AegisCTA({
  title = "Take the first step towards clarity.",
  description = "",
  primaryButtonText = "Find a Clinic Near You",
  primaryButtonLink = "#",
  secondaryButtonText = "Speak with a Specialist",
  secondaryButtonLink = "#",
  showLeadForm = true,
  leadFormButtonText = "Notify Me",
  leadFormSuccessMessage = "Thanks! We'll be in touch shortly.",
  storeSlug,
  blockId,
  isEditor = false,
}: AegisCTAProps) {
  const fix = useFix();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) { setSubmitted(true); return; } // editor/preview fallback — no real site to submit to
    setSending(true);
    setFormError("");
    try {
      const res = await fetch(`/api/public/sites/${storeSlug}/crm/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing", tags: ["aegis-cta"] }),
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
      else setFormError(json.error || "Something went wrong. Please try again.");
    } catch {
      setFormError("Network error. Please try again.");
    }
    setSending(false);
  };
  const css = `
    .aegis-cta { padding: 96px 32px; }
    .aegis-cta-card { max-width: 960px; margin: 0 auto; background: ${C.primary}; border-radius: 24px; padding: 80px; text-align: center; position: relative; overflow: hidden; }
    .aegis-cta-orb1 { position: absolute; top: 0; right: 0; width: 256px; height: 256px; background: ${C.secondary}; border-radius: 50%; transform: translate(50%, -50%); opacity: 0.2; filter: blur(48px); }
    .aegis-cta-orb2 { position: absolute; bottom: 0; left: 0; width: 256px; height: 256px; background: ${C.onPrimaryContainer}; border-radius: 50%; transform: translate(-50%, 50%); opacity: 0.1; filter: blur(48px); }
    .aegis-cta-inner { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 32px; align-items: center; }
    .aegis-cta-h2 { font-family: ${C.headlineFont}; font-size: clamp(2rem, 4vw, 3rem); color: #fff; margin: 0; }
    .aegis-cta-desc { font-family: ${C.bodyFont}; font-size: 1.125rem; color: ${C.primaryFixedDim}; max-width: 640px; line-height: 1.7; margin: 0; }
    .aegis-cta-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
    .aegis-cta-btn { display: inline-block; padding: 16px 40px; border-radius: 8px; font-family: ${C.bodyFont}; font-weight: 700; font-size: 1.125rem; text-decoration: none; transition: all 0.2s; }
    .aegis-cta-btn-light { background: #fff; color: ${C.primary}; }
    .aegis-cta-btn-light:hover { background: ${C.primaryFixed}; }
    .aegis-cta-btn-sec { background: ${C.secondary}; color: #fff; box-shadow: 0 20px 40px ${C.secondary}33; }
    .aegis-cta-btn-sec:hover { filter: brightness(0.9); }
    .aegis-cta-form { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; width: 100%; max-width: 440px; }
    .aegis-cta-input { flex: 1; min-width: 220px; border-radius: 8px; border: none; padding: 14px 18px; font-family: ${C.bodyFont}; font-size: 0.95rem; }
    .aegis-cta-form-btn { border-radius: 8px; padding: 14px 28px; font-family: ${C.bodyFont}; font-weight: 700; font-size: 0.95rem; background: #fff; color: ${C.primary}; border: none; cursor: pointer; transition: all 0.2s; }
    .aegis-cta-form-btn:hover { background: ${C.primaryFixed}; }
    .aegis-cta-form-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .aegis-cta-form-error { color: #fecaca; font-family: ${C.bodyFont}; font-size: 0.85rem; margin: 0; }
    .aegis-cta-form-success { color: #fff; font-family: ${C.bodyFont}; font-weight: 600; font-size: 1rem; }
    @media (max-width: 768px) { .aegis-cta-card { padding: 48px 24px; } }
  `;
  return (
    <section className="aegis-cta" style={{ background: C.surface }}>
      <S id="cta" css={css} />
      <div className="aegis-cta-card">
        <div className="aegis-cta-orb1" />
        <div className="aegis-cta-orb2" />
        <div className="aegis-cta-inner">
          <EditableCopy blockId={blockId} isEditor={isEditor} field="title" value={title} as="h2" className="aegis-cta-h2" />
          {description && <EditableCopy blockId={blockId} isEditor={isEditor} field="description" value={description} as="p" multiline className="aegis-cta-desc" />}
          {showLeadForm && (
            submitted ? (
              <p className="aegis-cta-form-success">{leadFormSuccessMessage}</p>
            ) : (
              <form onSubmit={handleLeadSubmit} className="aegis-cta-form">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="aegis-cta-input"
                />
                <button type="submit" disabled={sending} className="aegis-cta-form-btn">
                  {sending ? "..." : leadFormButtonText}
                </button>
                {formError && <p className="aegis-cta-form-error">{formError}</p>}
              </form>
            )
          )}
          <div className="aegis-cta-btns">
            {isEditor ? <EditableCopy blockId={blockId} isEditor field="primaryButtonText" value={primaryButtonText} as="span" className="aegis-cta-btn aegis-cta-btn-light" /> : <Link href={fix(primaryButtonLink)} className="aegis-cta-btn aegis-cta-btn-light">{primaryButtonText}</Link>}
            {secondaryButtonText && (isEditor ? <EditableCopy blockId={blockId} isEditor field="secondaryButtonText" value={secondaryButtonText} as="span" className="aegis-cta-btn aegis-cta-btn-sec" /> : <Link href={fix(secondaryButtonLink)} className="aegis-cta-btn aegis-cta-btn-sec">{secondaryButtonText}</Link>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. FOOTER
   ═══════════════════════════════════════════════════════════════ */
export interface AegisFooterColumn { title: string; links: Array<{ label: string; href: string }>; }
export interface AegisFooterProps {
  brandName?: string;
  tagline?: string;
  columns?: AegisFooterColumn[];
  socialIcons?: Array<{ icon: string; href: string }>;
  copyright?: string;
  blockId?: string;
  isEditor?: boolean;
}

export function AegisFooter({
  brandName = "Aegis Health",
  tagline = "Dedicated to a world where health is a right, and every life is celebrated.",
  columns = [],
  socialIcons = [],
  copyright = "© 2024 Aegis Health.",
  blockId,
  isEditor = false,
}: AegisFooterProps) {
  const fix = useFix();
  const css = `
    .aegis-footer { background: ${C.surfaceLow}; padding: 48px 0; }
    .aegis-footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
    .aegis-footer-brand { font-family: ${C.headlineFont}; font-size: 1.25rem; font-weight: 600; color: ${C.primary}; margin: 0 0 16px; }
    .aegis-footer-tagline { font-family: ${C.bodyFont}; font-size: 0.875rem; color: #64748b; line-height: 1.6; margin: 0; }
    .aegis-footer-col-title { font-family: ${C.bodyFont}; font-weight: 700; color: ${C.primary}; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.15em; margin: 0 0 16px; }
    .aegis-footer-links { display: flex; flex-direction: column; gap: 8px; }
    .aegis-footer-link { font-family: ${C.bodyFont}; font-size: 0.875rem; color: #64748b; text-decoration: none; transition: color 0.2s; }
    .aegis-footer-link:hover { color: ${C.primary}; }
    .aegis-footer-social { display: flex; gap: 16px; margin-bottom: 16px; }
    .aegis-footer-social-btn { width: 40px; height: 40px; border-radius: 50%; background: ${C.surfaceContainer}; display: flex; align-items: center; justify-content: center; color: ${C.primary}; text-decoration: none; transition: all 0.2s; }
    .aegis-footer-social-btn:hover { background: ${C.primary}; color: #fff; }
    .aegis-footer-copy { font-family: ${C.bodyFont}; font-size: 0.625rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin: 16px 0 0; }
    @media (max-width: 768px) { .aegis-footer-grid { grid-template-columns: 1fr 1fr; } }
  `;
  return (
    <footer className="aegis-footer">
      <S id="footer" css={css} />
      <div style={ctr}>
        <div className="aegis-footer-grid">
          <div>
            <EditableCopy blockId={blockId} isEditor={isEditor} field="brandName" value={brandName} as="h3" className="aegis-footer-brand" />
            <EditableCopy blockId={blockId} isEditor={isEditor} field="tagline" value={tagline} as="p" multiline className="aegis-footer-tagline" />
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <EditableCopy blockId={blockId} isEditor={isEditor} fieldPath={`columns.${i}.title`} value={col.title} as="h4" className="aegis-footer-col-title" />
              <nav className="aegis-footer-links">
                {col.links.map((l, j) => isEditor ? <EditableCopy key={j} blockId={blockId} isEditor fieldPath={`columns.${i}.links.${j}.label`} value={l.label} as="span" className="aegis-footer-link" /> : <Link key={j} href={fix(l.href)} className="aegis-footer-link">{l.label}</Link>)}
              </nav>
            </div>
          ))}
          {columns.length < 3 && (
            <div>
              <EditableCopy blockId={blockId} isEditor={isEditor} field="connectTitle" value="Connect" as="h4" className="aegis-footer-col-title" />
              <div className="aegis-footer-social">
                {socialIcons.map((s, i) => <a key={i} href={s.href} className="aegis-footer-social-btn"><span className="material-symbols-outlined" style={{ fontSize: 20 }}>{s.icon}</span></a>)}
              </div>
              <EditableCopy blockId={blockId} isEditor={isEditor} field="copyright" value={copyright} as="p" className="aegis-footer-copy" />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
