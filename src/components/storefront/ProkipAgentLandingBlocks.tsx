"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import { onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   PROKIP SALES AGENT LANDING PAGE TEMPLATE
   Dark navy recruitment landing page with brand accent.
   Source: Prokip Agent recruitment Vite/React app
   Every section faithfully reproduced as editable blocks.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Design Tokens ────────────────────────────────────────── */
const T = {
  navy900: "#0b1120",
  navy950: "#060d1b",
  brand400: "#facc15",
  brand300: "#fde047",
  red400: "#f87171",
  red500: "#ef4444",
  white: "#ffffff",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  headFont: "'Inter', 'Segoe UI', sans-serif",
  bodyFont: "'Inter', 'Segoe UI', sans-serif",
  radius: "1.5rem",
};

/* ─── Context ──────────────────────────────────────────────── */
interface ProkipAgentCtxData { storeSlug?: string; }
const ProkipAgentCtx = createContext<ProkipAgentCtxData>({});
export { ProkipAgentCtx as ProkipAgentLandingContext };
function useFix() { const ctx = useContext(ProkipAgentCtx); return (l: string) => resolveStoreLink(l, ctx?.storeSlug); }

/* ─── Font Loader ──────────────────────────────────────────── */
export function ProkipAgentFontLoader() {
  return <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />;
}

/* ─── Helpers ──────────────────────────────────────────────── */
function S({ id, css }: { id: string; css: string }) {
  return <style data-prokip-agent={id} dangerouslySetInnerHTML={{ __html: css }} />;
}
const ctr: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 24px", boxSizing: "border-box" as const, width: "100%" };

function CTAButton({ text, onClick, className = "" }: { text: string; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`pa-cta-btn ${className}`}>
      {text} <span className="pa-cta-arrow">→</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APPLICATION MODAL
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentModalProps {
  title?: string;
  badge?: string;
  fields?: Array<{ name: string; label: string; type: string; placeholder: string; prefix?: string }>;
  submitText?: string;
  onSubmitRedirect?: string;
}

export function ProkipAgentModal({
  title = "Enter your correct details to join Prokip Sales Agent Team",
  badge = "Nigeria Agent",
  fields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "email", label: "Email", type: "email", placeholder: "john@example.com" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "801 234 5678", prefix: "+234" },
  ],
  submitText = "JOIN OUR TEAM NOW",
}: ProkipAgentModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-application-modal", handler);
    return () => window.removeEventListener("open-application-modal", handler);
  }, []);

  const css = `
    .pa-modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: ${T.navy950}cc; backdrop-filter: blur(4px); overflow-y: auto; }
    .pa-modal { position: relative; width: 100%; max-width: 560px; background: ${T.navy900}; border-radius: 2.5rem; padding: 48px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
    .pa-modal-close { position: absolute; top: 24px; right: 24px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); border: none; color: ${T.gray400}; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .pa-modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .pa-modal-title { font-family: ${T.headFont}; font-size: 1.875rem; font-weight: 700; color: #fff; text-align: center; margin: 0 0 16px; padding-right: 32px; }
    .pa-modal-badge { display: inline-flex; align-items: center; padding: 6px 16px; border-radius: 9999px; background: ${T.brand400}1a; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.brand400}; border: 1px solid ${T.brand400}33; }
    .pa-modal-form { margin-top: 40px; display: flex; flex-direction: column; gap: 24px; }
    .pa-modal-label { display: block; font-size: 0.875rem; font-weight: 600; color: ${T.gray300}; margin-bottom: 10px; font-family: ${T.bodyFont}; }
    .pa-modal-input { display: block; width: 100%; padding: 16px 20px; border-radius: 12px; border: none; background: ${T.navy950}; color: #fff; font-size: 1rem; font-family: ${T.bodyFont}; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); outline: none; border: 1px solid rgba(255,255,255,0.1); box-sizing: border-box; }
    .pa-modal-input:focus { border-color: ${T.brand400}; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px ${T.brand400}33; }
    .pa-modal-input::placeholder { color: ${T.gray500}; }
    .pa-modal-phone-wrap { display: flex; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: ${T.navy950}; overflow: hidden; }
    .pa-modal-phone-wrap:focus-within { border-color: ${T.brand400}; box-shadow: 0 0 0 2px ${T.brand400}33; }
    .pa-modal-prefix { display: flex; align-items: center; padding: 0 12px 0 20px; color: ${T.gray400}; font-size: 1rem; font-weight: 500; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap; }
    .pa-modal-phone-input { flex: 1; border: none; background: transparent; color: #fff; padding: 16px 16px; font-size: 1rem; outline: none; font-family: ${T.bodyFont}; }
    .pa-modal-phone-input::placeholder { color: ${T.gray500}; }
    .pa-modal-submit { margin-top: 16px; width: 100%; padding: 20px; border-radius: 12px; background: ${T.brand400}; color: ${T.navy900}; font-family: ${T.bodyFont}; font-weight: 700; font-size: 1.125rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s; }
    .pa-modal-submit:hover { background: ${T.brand300}; }
  `;

  if (!open) return null;
  return (
    <div className="pa-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <S id="modal" css={css} />
      <div className="pa-modal">
        <button className="pa-modal-close" onClick={() => setOpen(false)}>✕</button>
        <h3 className="pa-modal-title">{title}</h3>
        <div style={{ textAlign: "center" }}><span className="pa-modal-badge">{badge}</span></div>
        <form className="pa-modal-form" onSubmit={(e) => { e.preventDefault(); setOpen(false); }}>
          {fields.map((f) => (
            <div key={f.name}>
              <label className="pa-modal-label">{f.label}</label>
              {f.prefix ? (
                <div className="pa-modal-phone-wrap">
                  <span className="pa-modal-prefix">{f.prefix}</span>
                  <input type={f.type} placeholder={f.placeholder} required className="pa-modal-phone-input" />
                </div>
              ) : (
                <input type={f.type} placeholder={f.placeholder} required className="pa-modal-input" />
              )}
            </div>
          ))}
          <button type="submit" className="pa-modal-submit">{submitText} ✈</button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. TOP BANNER (sticky warning bar)
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentTopBannerProps {
  attentionText?: string;
  message?: string;
}

export function ProkipAgentTopBanner({
  attentionText = "Attention!",
  message = "Please read this entire page carefully before you register. This opportunity requires serious commitment. If you cannot read and understand the full page, please do not sign up.",
}: ProkipAgentTopBannerProps) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 10) return;
      setHidden(y > lastY && y > 100);
      lastY = y > 0 ? y : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const css = `
    .pa-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 40; background: rgba(69,10,10,0.95); border-bottom: 1px solid ${T.red500}4d; backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.3s ease; }
    .pa-banner-hidden { transform: translateY(-100%); }
    .pa-banner-inner { max-width: 1280px; margin: 0 auto; padding: 12px 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 16px; text-align: center; }
    .pa-banner-warn { display: flex; align-items: center; gap: 8px; color: ${T.red400}; font-weight: 700; font-size: 1.125rem; font-family: ${T.headFont}; flex-shrink: 0; }
    .pa-banner-warn::before { content: '⚠'; font-size: 1.25rem; }
    .pa-banner-text { font-size: 0.875rem; color: #fca5a5; line-height: 1.6; font-family: ${T.bodyFont}; }
    .pa-banner-text strong { color: #fee2e2; font-weight: 600; }
    @media (min-width: 768px) { .pa-banner-text { font-size: 1rem; } }
  `;
  return (
    <div className={`pa-banner ${hidden ? "pa-banner-hidden" : ""}`}>
      <S id="banner" css={css} />
      <div className="pa-banner-inner">
        <div className="pa-banner-warn">{attentionText}</div>
        <p className="pa-banner-text" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. HERO SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentHeroProps {
  badge?: string;
  titleStart?: string;
  titleHighlight?: string;
  description?: string;
  videoUrl?: string;
  ctaText?: string;
}

export function ProkipAgentHero({
  badge = "Become Our Next Success Story",
  titleStart = "Earn 6-figures And More Monthly As a",
  titleHighlight = "Prokip Sales Agent",
  description = 'By becoming our sales agent, you will enjoy earnings of up to <strong>N500,000 - N1,000,000</strong> aside from bonuses. Now you can build a financial growth path for yourself all from your location in Nigeria.',
  videoUrl = "https://www.youtube.com/embed/Sd7MkZ9PZqM?si=hkq1ZIeesfmZG45k",
  ctaText = "Join Our Team Now",
}: ProkipAgentHeroProps) {
  const openModal = () => window.dispatchEvent(new CustomEvent("open-application-modal"));
  const css = `
    .pa-hero { position: relative; overflow: hidden; background: ${T.navy900}; padding: 96px 0 64px; }
    @media (min-width: 640px) { .pa-hero { padding: 128px 0 96px; } }
    .pa-hero-center { text-align: center; max-width: 960px; margin: 0 auto; }
    .pa-hero-badge { display: inline-flex; align-items: center; padding: 6px 16px; border-radius: 9999px; background: rgba(255,255,255,0.05); border: 1px solid ${T.brand400}4d; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.brand400}; margin-bottom: 32px; font-family: ${T.bodyFont}; }
    .pa-hero-h1 { font-family: ${T.headFont}; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; letter-spacing: -0.03em; color: #fff; line-height: 1.1; margin: 0 0 32px; }
    .pa-hero-hl { color: ${T.brand400}; }
    .pa-hero-desc { margin-top: 24px; font-size: 1.25rem; line-height: 1.7; color: ${T.gray300}; max-width: 768px; margin-left: auto; margin-right: auto; font-family: ${T.bodyFont}; }
    .pa-hero-desc strong { color: #fff; font-weight: 600; }
    .pa-hero-video { margin-top: 48px; width: 100%; max-width: 896px; margin-left: auto; margin-right: auto; border-radius: ${T.radius}; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 16/9; background: ${T.navy950}; }
    .pa-hero-video iframe { width: 100%; height: 100%; border: none; }
    .pa-hero-cta-wrap { margin-top: 48px; display: flex; justify-content: center; }
    .pa-cta-btn { display: inline-flex; align-items: center; padding: 16px 32px; border-radius: 9999px; background: ${T.brand400}; color: ${T.navy900}; font-family: ${T.bodyFont}; font-weight: 700; font-size: 1rem; border: none; cursor: pointer; transition: all 0.2s; gap: 8px; }
    .pa-cta-btn:hover { background: ${T.brand300}; }
    .pa-cta-arrow { transition: transform 0.2s; }
    .pa-cta-btn:hover .pa-cta-arrow { transform: translateX(4px); }
  `;
  return (
    <section className="pa-hero">
      <S id="hero" css={css} />
      <div style={ctr}>
        <div className="pa-hero-center">
          <span className="pa-hero-badge">{badge}</span>
          <h1 className="pa-hero-h1">{titleStart} <span className="pa-hero-hl">{titleHighlight}</span></h1>
          <p className="pa-hero-desc" dangerouslySetInnerHTML={{ __html: description }} />
          {videoUrl && (
            <div className="pa-hero-video">
              <iframe src={videoUrl} title="Hero Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div>
          )}
          <div className="pa-hero-cta-wrap"><CTAButton text={ctaText} onClick={openModal} /></div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. INTRO & TASKS SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentTask { title: string; description: string; icon: string; }
export interface ProkipAgentIntroProps {
  subtitle?: string;
  title?: string;
  description?: string;
  calloutText?: string;
  tasksTitle?: string;
  tasksSubtitle?: string;
  tasks?: ProkipAgentTask[];
}

export function ProkipAgentIntro({
  subtitle = "A Unique Opportunity",
  title = "Dear friend, if you're looking for a way to make more money this year, this could be the most important message you'll read today.",
  description = "Right now, our company, Prokip, is offering a unique opportunity for individuals like you to join us as a sales agent. All you have to do is help business owners use our software to grow their businesses.",
  calloutText = "And don't worry—it doesn't matter whether you have advanced tech skills or accounting experience. We'll teach you everything step by step. We'll teach all you need to know to represent us in your state and start making good money.",
  tasksTitle = "What You'll Do",
  tasksSubtitle = "As a Sales Agent at Prokip, you'll be at the forefront of our mission to empower businesses. Here's what your day-to-day will look like:",
  tasks = [],
}: ProkipAgentIntroProps) {
  const css = `
    .pa-intro { padding: 96px 0; background: ${T.navy950}; }
    @media (min-width: 640px) { .pa-intro { padding: 128px 0; } }
    .pa-intro-top { max-width: 768px; margin: 0 auto; text-align: center; }
    .pa-intro-sub { font-family: ${T.bodyFont}; font-weight: 700; font-size: 0.875rem; color: ${T.brand400}; text-transform: uppercase; letter-spacing: 0.1em; }
    .pa-intro-h2 { font-family: ${T.headFont}; font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; color: #fff; margin: 8px 0 24px; line-height: 1.3; letter-spacing: -0.02em; }
    .pa-intro-desc { font-family: ${T.bodyFont}; font-size: 1.125rem; color: ${T.gray300}; line-height: 1.7; }
    .pa-intro-callout { margin-top: 40px; padding: 32px; border-radius: ${T.radius}; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); text-align: left; }
    .pa-intro-callout p { font-family: ${T.bodyFont}; color: ${T.gray300}; font-weight: 500; line-height: 1.7; margin: 0; }
    .pa-tasks-section { margin-top: 96px; }
    .pa-tasks-header { text-align: center; margin-bottom: 64px; }
    .pa-tasks-h2 { font-family: ${T.headFont}; font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 800; color: #fff; margin: 0 0 16px; letter-spacing: -0.03em; }
    .pa-tasks-sub { font-family: ${T.bodyFont}; font-size: 1.125rem; color: ${T.gray400}; max-width: 640px; margin: 0 auto; }
    .pa-tasks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .pa-task-card { display: flex; flex-direction: column; align-items: flex-start; background: ${T.navy900}; border-radius: ${T.radius}; padding: 32px; border: 1px solid rgba(255,255,255,0.1); transition: border-color 0.3s; }
    .pa-task-card:hover { border-color: ${T.brand400}80; }
    .pa-task-icon { width: 56px; height: 56px; border-radius: 12px; background: ${T.brand400}1a; border: 1px solid ${T.brand400}33; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 24px; }
    .pa-task-title { font-family: ${T.headFont}; font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0 0 12px; }
    .pa-task-desc { font-family: ${T.bodyFont}; font-size: 1rem; color: ${T.gray400}; line-height: 1.7; margin: 0; flex: 1; }
    @media (max-width: 1024px) { .pa-tasks-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .pa-tasks-grid { grid-template-columns: 1fr; gap: 24px; } }
  `;
  return (
    <section className="pa-intro">
      <S id="intro" css={css} />
      <div style={ctr}>
        <div className="pa-intro-top">
          <div className="pa-intro-sub">{subtitle}</div>
          <h2 className="pa-intro-h2">{title}</h2>
          <p className="pa-intro-desc">{description}</p>
          {calloutText && <div className="pa-intro-callout"><p>{calloutText}</p></div>}
        </div>
        {tasks.length > 0 && (
          <div className="pa-tasks-section">
            <div className="pa-tasks-header">
              <h2 className="pa-tasks-h2">{tasksTitle}</h2>
              <p className="pa-tasks-sub">{tasksSubtitle}</p>
            </div>
            <div className="pa-tasks-grid">
              {tasks.map((t, i) => (
                <div key={i} className="pa-task-card">
                  <div className="pa-task-icon">{t.icon}</div>
                  <h3 className="pa-task-title">{t.title}</h3>
                  <p className="pa-task-desc">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. ABOUT & OPPORTUNITY SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentAboutProps {
  title?: string;
  description?: string;
  description2?: string;
  features?: string[];
  highlightQuote?: string;
  cardTitle?: string;
  cardDescription?: string;
  cardDescription2?: string;
  dutiesTitle?: string;
  duties?: string[];
  ctaText?: string;
}

export function ProkipAgentAbout({
  title = "Now, What's Prokip All About?",
  description = "Prokip is a powerful business management software that helps business owners simplify their operations and manage their money better.",
  description2 = "Prokip is redefining how businesses manage their operations with an all-in-one platform that integrates:",
  features = ["Accounting", "Inventory Management", "Customer Relationship Management", "Payment Processing", "Marketing Tools", "POS System", "Production Management", "Table and Restaurant Management"],
  highlightQuote = "And in today's world, tools like Prokip are becoming a must-have for every serious business.",
  cardTitle = "Here's the exciting part:",
  cardDescription = 'In Nigeria alone, there are over <strong>20 million businesses</strong> that could benefit from Prokip solution. Plus, 200,000 new businesses start every year!',
  cardDescription2 = "Many of these businesses do not even know how much Prokip can help them. That's where you come in.",
  dutiesTitle = "And your job is simple:",
  duties = [
    "Talk to business owners and show them how Prokip can make their lives easier.",
    "Help them see the value, and close them to integrate Prokip's solution with their businesses.",
    "Support them through a seamless onboarding process.",
    "Earn a commission while at it.",
  ],
  ctaText = "Join Our Team Now",
}: ProkipAgentAboutProps) {
  const openModal = () => window.dispatchEvent(new CustomEvent("open-application-modal"));
  const css = `
    .pa-about { padding: 96px 0; background: ${T.navy900}; }
    @media (min-width: 640px) { .pa-about { padding: 128px 0; } }
    .pa-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .pa-about-h2 { font-family: ${T.headFont}; font-size: clamp(1.875rem, 4vw, 3rem); font-weight: 700; color: #fff; margin: 0 0 24px; letter-spacing: -0.02em; }
    .pa-about-p { font-family: ${T.bodyFont}; font-size: 1.125rem; color: ${T.gray300}; line-height: 1.7; margin: 0 0 24px; }
    .pa-about-features { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; list-style: none; padding: 0; }
    .pa-about-feat { display: flex; align-items: center; gap: 12px; color: ${T.gray300}; font-family: ${T.bodyFont}; }
    .pa-about-feat::before { content: '✓'; color: ${T.brand400}; font-weight: 700; flex-shrink: 0; }
    .pa-about-quote { font-family: ${T.bodyFont}; font-size: 1.25rem; font-weight: 500; color: #fff; border-left: 4px solid ${T.brand400}; padding: 8px 0 8px 16px; }
    .pa-about-card { background: ${T.navy950}; padding: 32px 48px; border-radius: ${T.radius}; box-shadow: 0 25px 50px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); }
    .pa-about-card-h3 { font-family: ${T.headFont}; font-size: 1.5rem; font-weight: 700; color: ${T.brand400}; margin: 0 0 24px; letter-spacing: -0.02em; }
    .pa-about-card-p { font-family: ${T.bodyFont}; font-size: 1rem; color: ${T.gray300}; line-height: 1.7; margin: 0 0 24px; }
    .pa-about-card-p strong { color: #fff; }
    .pa-duties-title { font-family: ${T.headFont}; font-weight: 700; color: #fff; margin: 0 0 24px; font-size: 1.125rem; }
    .pa-duties { list-style: none; padding: 0; margin: 0 0 40px; display: flex; flex-direction: column; gap: 20px; }
    .pa-duty { display: flex; gap: 16px; color: ${T.gray300}; font-family: ${T.bodyFont}; }
    .pa-duty-num { width: 32px; height: 32px; border-radius: 50%; background: ${T.brand400}1a; border: 1px solid ${T.brand400}4d; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; color: ${T.brand400}; flex-shrink: 0; margin-top: 2px; }
    .pa-duty span { line-height: 1.6; }
    @media (max-width: 1024px) { .pa-about-grid { grid-template-columns: 1fr; } .pa-about-card { padding: 32px; } }
  `;
  return (
    <section className="pa-about">
      <S id="about" css={css} />
      <div style={ctr}>
        <div className="pa-about-grid">
          <div>
            <h2 className="pa-about-h2">{title}</h2>
            <p className="pa-about-p">{description}</p>
            <p className="pa-about-p">{description2}</p>
            <ul className="pa-about-features">
              {features.map((f, i) => <li key={i} className="pa-about-feat">{f}</li>)}
            </ul>
            <p className="pa-about-quote">{highlightQuote}</p>
          </div>
          <div className="pa-about-card">
            <h3 className="pa-about-card-h3">{cardTitle}</h3>
            <p className="pa-about-card-p" dangerouslySetInnerHTML={{ __html: cardDescription }} />
            <p className="pa-about-card-p">{cardDescription2}</p>
            <h4 className="pa-duties-title">{dutiesTitle}</h4>
            <ul className="pa-duties">
              {duties.map((d, i) => (
                <li key={i} className="pa-duty">
                  <div className="pa-duty-num">{i + 1}</div>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <CTAButton text={ctaText} onClick={openModal} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. BENEFITS SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentBenefit { title: string; items: string[]; icon: string; }
export interface ProkipAgentBenefitsProps {
  title?: string;
  subtitle?: string;
  benefits?: ProkipAgentBenefit[];
}

export function ProkipAgentBenefits({
  title = "What Will You Gain?",
  subtitle = "Joining Prokip isn't just a job—it's a launchpad for your career.",
  benefits = [],
}: ProkipAgentBenefitsProps) {
  const css = `
    .pa-benefits { padding: 96px 0; background: ${T.navy950}; }
    @media (min-width: 640px) { .pa-benefits { padding: 128px 0; } }
    .pa-benefits-header { max-width: 640px; margin: 0 auto 80px; text-align: center; }
    .pa-benefits-h2 { font-family: ${T.headFont}; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: #fff; margin: 0 0 24px; letter-spacing: -0.03em; }
    .pa-benefits-sub { font-family: ${T.bodyFont}; font-size: 1.25rem; color: ${T.gray400}; }
    .pa-benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .pa-benefit-card { display: flex; flex-direction: column; background: ${T.navy900}; border-radius: ${T.radius}; padding: 40px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.3); transition: border-color 0.3s; }
    .pa-benefit-card:hover { border-color: ${T.brand400}80; }
    .pa-benefit-icon { width: 64px; height: 64px; border-radius: 16px; background: ${T.brand400}1a; border: 1px solid ${T.brand400}33; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 32px; }
    .pa-benefit-title { font-family: ${T.headFont}; font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 24px; }
    .pa-benefit-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; flex: 1; }
    .pa-benefit-item { display: flex; gap: 12px; color: ${T.gray300}; font-family: ${T.bodyFont}; line-height: 1.6; align-items: flex-start; }
    .pa-benefit-item::before { content: '•'; color: ${T.brand400}; font-weight: 700; font-size: 1.125rem; margin-top: 2px; flex-shrink: 0; }
    @media (max-width: 1024px) { .pa-benefits-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .pa-benefits-grid { grid-template-columns: 1fr; gap: 24px; } }
  `;
  return (
    <section className="pa-benefits">
      <S id="benefits" css={css} />
      <div style={ctr}>
        <div className="pa-benefits-header">
          <h2 className="pa-benefits-h2">{title}</h2>
          <p className="pa-benefits-sub">{subtitle}</p>
        </div>
        <div className="pa-benefits-grid">
          {benefits.map((b, i) => (
            <div key={i} className="pa-benefit-card">
              <div className="pa-benefit-icon">{b.icon}</div>
              <h3 className="pa-benefit-title">{b.title}</h3>
              <ul className="pa-benefit-items">
                {b.items.map((item, j) => <li key={j} className="pa-benefit-item">{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. MEDIA SECTION (Teams + Video Testimonials)
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentTeam { country: string; imageUrl: string; }
export interface ProkipAgentMediaProps {
  teamsTitle?: string;
  teamsSubtitle?: string;
  teams?: ProkipAgentTeam[];
  videosTitle?: string;
  videos?: string[];
  ctaText?: string;
}

export function ProkipAgentMedia({
  teamsTitle = "We Have Team All Over Africa",
  teamsSubtitle = "Below are some of our team in different countries.",
  teams = [],
  videosTitle = "Hear What Some of Our Agents Are Saying...",
  videos = [],
  ctaText = "Join Our Team Now",
}: ProkipAgentMediaProps) {
  const openModal = () => window.dispatchEvent(new CustomEvent("open-application-modal"));
  const css = `
    .pa-media { padding: 96px 0; background: ${T.navy900}; }
    @media (min-width: 640px) { .pa-media { padding: 128px 0; } }
    .pa-media-header { max-width: 640px; margin: 0 auto 64px; text-align: center; }
    .pa-media-h2 { font-family: ${T.headFont}; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: #fff; margin: 0 0 24px; letter-spacing: -0.02em; }
    .pa-media-sub { font-family: ${T.bodyFont}; font-size: 1.25rem; color: ${T.gray400}; }
    .pa-teams-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-bottom: 96px; }
    .pa-team-card { border-radius: ${T.radius}; overflow: hidden; background: ${T.navy950}; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
    .pa-team-img { width: 100%; aspect-ratio: 3/2; object-fit: cover; transition: transform 0.5s; }
    .pa-team-card:hover .pa-team-img { transform: scale(1.05); }
    .pa-team-name { padding: 20px; text-align: center; font-family: ${T.headFont}; font-weight: 700; color: #fff; font-size: 1.125rem; }
    .pa-videos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 960px; margin: 0 auto; }
    .pa-video { aspect-ratio: 16/9; border-radius: ${T.radius}; overflow: hidden; background: ${T.navy950}; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
    .pa-video iframe { width: 100%; height: 100%; border: none; }
    .pa-media-cta { margin-top: 80px; display: flex; justify-content: center; }
    @media (max-width: 1024px) { .pa-teams-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .pa-teams-grid { grid-template-columns: 1fr; } .pa-videos-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="pa-media">
      <S id="media" css={css} />
      <div style={ctr}>
        <div className="pa-media-header">
          <h2 className="pa-media-h2">{teamsTitle}</h2>
          <p className="pa-media-sub">{teamsSubtitle}</p>
        </div>
        <div className="pa-teams-grid">
          {teams.map((t, i) => (
            <div key={i} className="pa-team-card">
              <div style={{ overflow: "hidden" }}><img src={t.imageUrl} alt={t.country} className="pa-team-img" loading="lazy" onError={(e) => onImgError(e, t.country)} /></div>
              <div className="pa-team-name">{t.country}</div>
            </div>
          ))}
        </div>
        {videos.length > 0 && (
          <>
            <div className="pa-media-header"><h2 className="pa-media-h2">{videosTitle}</h2></div>
            <div className="pa-videos-grid">
              {videos.map((v, i) => (
                <div key={i} className="pa-video">
                  <iframe src={v} title={`Testimonial ${i + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              ))}
            </div>
          </>
        )}
        <div className="pa-media-cta"><CTAButton text={ctaText} onClick={openModal} /></div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. SUPPORT & QUALIFICATIONS SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentSupportCard { number: string; title: string; items: Array<string | { text: string; subitems?: string[] }>; footer?: string; }
export interface ProkipAgentQualification { text: string; }
export interface ProkipAgentSupportProps {
  supportTitle?: string;
  supportSubtitle?: string;
  supportCards?: ProkipAgentSupportCard[];
  qualBadge?: string;
  qualTitle?: string;
  qualDescription?: string;
  lookingForTitle?: string;
  lookingFor?: string[];
  opportunityTitle?: string;
  opportunitySubtitle?: string;
  opportunityItems?: string[];
  ctaText?: string;
}

export function ProkipAgentSupport({
  supportTitle = "How Can Prokip Support You As A Sales Agent?",
  supportSubtitle = "As a sales agent, Prokip will support you every step of the way. Here is how we intend to do so:",
  supportCards = [],
  qualBadge = "Exclusive Opportunity",
  qualTitle = "BUT So We Don't Waste Your Time…",
  qualDescription = "It's important you know that this opening is NOT for everyone. It's an EXCLUSIVE opportunity for a certain set of people. So, you have to be eligible before you join.",
  lookingForTitle = "Who Are We Looking For?",
  lookingFor = [],
  opportunityTitle = "Who Is This Opportunity For?",
  opportunitySubtitle = "This is for you if:",
  opportunityItems = [],
  ctaText = "Join Our Team Now",
}: ProkipAgentSupportProps) {
  const openModal = () => window.dispatchEvent(new CustomEvent("open-application-modal"));
  const css = `
    .pa-support { padding: 96px 0; background: ${T.navy950}; }
    @media (min-width: 640px) { .pa-support { padding: 128px 0; } }
    .pa-support-header { max-width: 640px; margin: 0 auto 64px; text-align: center; }
    .pa-support-h2 { font-family: ${T.headFont}; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: #fff; margin: 0 0 24px; letter-spacing: -0.03em; }
    .pa-support-sub { font-family: ${T.bodyFont}; font-size: 1.25rem; color: ${T.gray400}; }
    .pa-support-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; max-width: 960px; margin: 0 auto 96px; }
    .pa-support-card { background: ${T.navy900}; padding: 40px; border-radius: ${T.radius}; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
    .pa-support-card-head { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .pa-support-num { width: 56px; height: 56px; background: ${T.brand400}1a; border: 1px solid ${T.brand400}4d; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: ${T.brand400}; font-weight: 700; font-size: 1.5rem; flex-shrink: 0; }
    .pa-support-card-title { font-family: ${T.headFont}; font-size: 1.5rem; font-weight: 700; color: #fff; }
    .pa-support-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
    .pa-support-item { display: flex; gap: 12px; color: ${T.gray300}; font-family: ${T.bodyFont}; font-size: 1.125rem; line-height: 1.6; }
    .pa-support-item::before { content: '•'; color: ${T.brand400}; font-weight: 700; flex-shrink: 0; }
    .pa-support-subitems { padding-left: 16px; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; color: ${T.gray400}; }
    .pa-support-footer { margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }
    .pa-support-footer p { font-family: ${T.bodyFont}; font-weight: 500; color: #fff; font-size: 1.125rem; line-height: 1.6; margin: 0; }
    .pa-qual { background: ${T.navy900}; border-radius: 3rem; padding: 32px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.3); position: relative; overflow: hidden; }
    @media (min-width: 640px) { .pa-qual { padding: 64px; } }
    .pa-qual-glow { position: absolute; inset: 0; background: linear-gradient(135deg, ${T.brand400}0d 0%, transparent 100%); pointer-events: none; }
    .pa-qual-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
    .pa-qual-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 9999px; background: ${T.red500}1a; color: ${T.red400}; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid ${T.red500}33; margin-bottom: 32px; font-family: ${T.bodyFont}; }
    .pa-qual-badge::before { content: '🛡'; }
    .pa-qual-h2 { font-family: ${T.headFont}; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: #fff; margin: 0 0 32px; line-height: 1.2; letter-spacing: -0.02em; }
    .pa-qual-desc { font-family: ${T.bodyFont}; font-size: 1.25rem; color: ${T.gray300}; line-height: 1.6; margin: 0 0 40px; }
    .pa-qual-looking-h3 { font-family: ${T.headFont}; font-size: 1.5rem; font-weight: 700; color: ${T.brand400}; margin: 0 0 24px; }
    .pa-qual-looking-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
    .pa-qual-looking-item { display: flex; gap: 16px; color: ${T.gray300}; font-family: ${T.bodyFont}; font-size: 1.125rem; line-height: 1.6; }
    .pa-qual-looking-item::before { content: '👤'; flex-shrink: 0; margin-top: 2px; }
    .pa-qual-right { background: ${T.navy950}; border-radius: ${T.radius}; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    .pa-qual-right-h3 { font-family: ${T.headFont}; font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 24px; }
    .pa-qual-right-sub { font-family: ${T.bodyFont}; color: ${T.gray400}; font-size: 1.125rem; margin: 0 0 32px; }
    .pa-qual-opp-list { list-style: none; padding: 0; margin: 0 0 48px; display: flex; flex-direction: column; gap: 24px; }
    .pa-qual-opp-item { display: flex; gap: 16px; color: ${T.gray300}; font-family: ${T.bodyFont}; line-height: 1.6; }
    .pa-qual-opp-item::before { content: '🤝'; flex-shrink: 0; margin-top: 2px; }
    @media (max-width: 1024px) { .pa-support-grid { grid-template-columns: 1fr; } .pa-qual-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="pa-support">
      <S id="support" css={css} />
      <div style={ctr}>
        <div className="pa-support-header">
          <h2 className="pa-support-h2">{supportTitle}</h2>
          <p className="pa-support-sub">{supportSubtitle}</p>
        </div>
        {supportCards.length > 0 && (
          <div className="pa-support-grid">
            {supportCards.map((c, i) => (
              <div key={i} className="pa-support-card">
                <div className="pa-support-card-head">
                  <div className="pa-support-num">{c.number}</div>
                  <h3 className="pa-support-card-title">{c.title}</h3>
                </div>
                <ul className="pa-support-items">
                  {c.items.map((item, j) => {
                    const txt = typeof item === "string" ? item : item.text;
                    const subs = typeof item === "string" ? undefined : item.subitems;
                    return (
                      <li key={j} className="pa-support-item">
                        <div>
                          {txt}
                          {subs && <div className="pa-support-subitems">{subs.map((s, k) => <div key={k}>- {s}</div>)}</div>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {c.footer && <div className="pa-support-footer"><p>{c.footer}</p></div>}
              </div>
            ))}
          </div>
        )}
        <div className="pa-qual">
          <div className="pa-qual-glow" />
          <div className="pa-qual-grid">
            <div>
              <span className="pa-qual-badge">{qualBadge}</span>
              <h2 className="pa-qual-h2">{qualTitle}</h2>
              <p className="pa-qual-desc">{qualDescription}</p>
              <h3 className="pa-qual-looking-h3">{lookingForTitle}</h3>
              <ul className="pa-qual-looking-list">
                {lookingFor.map((l, i) => <li key={i} className="pa-qual-looking-item">{l}</li>)}
              </ul>
            </div>
            <div className="pa-qual-right">
              <h3 className="pa-qual-right-h3">{opportunityTitle}</h3>
              <p className="pa-qual-right-sub">{opportunitySubtitle}</p>
              <ul className="pa-qual-opp-list">
                {opportunityItems.map((item, i) => <li key={i} className="pa-qual-opp-item">{item}</li>)}
              </ul>
              <CTAButton text={ctaText} onClick={openModal} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. CONVERSION SECTION (Final CTA)
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentConversionProps {
  title?: string;
  description?: string;
  checkmarks?: string[];
  urgencyText?: string;
  ctaText?: string;
}

export function ProkipAgentConversion({
  title = "What Are You Waiting For?",
  description = "If you are serious about making more money that allows you to do what you really want to do with your life —",
  checkmarks = [
    "Spending quality time with your family...",
    "Going on holidays whenever you want...",
    "Living in a beautiful home you want...",
    "Paying bills easily and never having to worry about money again…",
  ],
  urgencyText = "Then, you owe it to yourself to take full advantage of this very limited, risk-free opportunity right now before it's too late, as we will close down this opportunity very soon. So do yourself a favour. Join today, won't you?",
  ctaText = "Join Our Team Now",
}: ProkipAgentConversionProps) {
  const openModal = () => window.dispatchEvent(new CustomEvent("open-application-modal"));
  const css = `
    .pa-conversion { padding: 96px 0; background: ${T.navy900}; }
    @media (min-width: 640px) { .pa-conversion { padding: 128px 0; } }
    .pa-conversion-inner { max-width: 896px; margin: 0 auto; text-align: center; }
    .pa-conversion-h2 { font-family: ${T.headFont}; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: #fff; margin: 0 0 32px; line-height: 1.2; letter-spacing: -0.02em; }
    .pa-conversion-desc { font-family: ${T.bodyFont}; font-size: 1.25rem; color: ${T.gray300}; line-height: 1.6; margin: 0 0 32px; max-width: 640px; margin-left: auto; margin-right: auto; }
    .pa-conversion-checks { list-style: none; padding: 0; margin: 0 0 40px; display: flex; flex-direction: column; gap: 20px; max-width: 640px; margin-left: auto; margin-right: auto; text-align: left; }
    .pa-conversion-check { display: flex; align-items: center; gap: 16px; color: ${T.gray300}; font-family: ${T.bodyFont}; font-weight: 500; font-size: 1.125rem; }
    .pa-conversion-check::before { content: '✓'; color: ${T.brand400}; font-size: 1.5rem; font-weight: 700; }
    .pa-conversion-urgency { font-family: ${T.bodyFont}; font-size: 1.125rem; color: #fff; font-weight: 500; background: ${T.brand400}1a; padding: 24px 32px; border-radius: 16px; border: 1px solid ${T.brand400}33; line-height: 1.6; margin: 0 auto 48px; max-width: 768px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .pa-conversion-cta-wrap { display: flex; justify-content: center; }
  `;
  return (
    <section className="pa-conversion" id="application-form">
      <S id="conversion" css={css} />
      <div style={ctr}>
        <div className="pa-conversion-inner">
          <h2 className="pa-conversion-h2">{title}</h2>
          <p className="pa-conversion-desc">{description}</p>
          <ul className="pa-conversion-checks">
            {checkmarks.map((c, i) => <li key={i} className="pa-conversion-check">{c}</li>)}
          </ul>
          <p className="pa-conversion-urgency">{urgencyText}</p>
          <div className="pa-conversion-cta-wrap"><CTAButton text={ctaText} onClick={openModal} /></div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. FOOTER
   ═══════════════════════════════════════════════════════════════ */
export interface ProkipAgentFooterProps {
  brandName?: string;
  brandAccent?: string;
  disclaimers?: string[];
  copyright?: string;
}

export function ProkipAgentFooter({
  brandName = "Prokip",
  brandAccent = ".",
  disclaimers = [
    "This site and associated website are not a part of the Facebook website or Facebook Inc.",
    "Additionally, this is NOT endorsed by FACEBOOK in any way. FACEBOOK is a trademark of FACEBOOK, INC.",
  ],
  copyright = "© 2024 Prokip. ALL RIGHTS RESERVED.",
}: ProkipAgentFooterProps) {
  const css = `
    .pa-footer { background: ${T.navy950}; color: ${T.gray400}; padding: 48px 0; }
    .pa-footer-inner { text-align: center; }
    .pa-footer-brand { font-family: ${T.headFont}; font-size: 1.875rem; font-weight: 800; color: #fff; margin-bottom: 32px; letter-spacing: -0.02em; }
    .pa-footer-brand-accent { color: ${T.brand400}; }
    .pa-footer-disclaimers { max-width: 768px; margin: 0 auto 48px; display: flex; flex-direction: column; gap: 16px; }
    .pa-footer-disclaimer { font-family: ${T.bodyFont}; font-size: 0.875rem; color: ${T.gray500}; line-height: 1.6; }
    .pa-footer-bottom { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }
    .pa-footer-copy { font-family: ${T.bodyFont}; font-size: 0.875rem; color: ${T.gray500}; }
    .pa-footer-top-btn { font-family: ${T.bodyFont}; font-size: 0.875rem; color: ${T.gray400}; background: none; border: none; cursor: pointer; transition: color 0.2s; }
    .pa-footer-top-btn:hover { color: #fff; }
  `;
  return (
    <footer className="pa-footer">
      <S id="footer" css={css} />
      <div style={ctr}>
        <div className="pa-footer-inner">
          <div className="pa-footer-brand">{brandName}<span className="pa-footer-brand-accent">{brandAccent}</span></div>
          <div className="pa-footer-disclaimers">
            {disclaimers.map((d, i) => <p key={i} className="pa-footer-disclaimer">{d}</p>)}
          </div>
          <div className="pa-footer-bottom">
            <p className="pa-footer-copy">{copyright}</p>
            <button className="pa-footer-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Scroll to Top ↑</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
