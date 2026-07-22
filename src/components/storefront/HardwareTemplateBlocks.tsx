"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useRef, useEffect, useContext } from "react";
import { onImgError } from "./image-fallback";
import { ElectronicsStoreContext } from "./ElectronicsTemplateBlocks";

/* ═══════════════════════════════════════════════════════════════
   HARDWARE TEMPLATE SUB-PAGE BLOCKS
   Independent block components for the Hardware template's
   about, contact, and blog pages. Uses ElectronicsStoreContext
   for store slug resolution only.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "var(--color-primary)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  containerWidth: "1222px",
  titleFont: "'Poppins', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

/* ─── SHARED ────────────────────────────────────────────────── */
const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth,
  margin: "0 auto",
  padding: "0 15px",
  boxSizing: "border-box" as const,
  width: "100%",
};

function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-hardware-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

function useStoreSlug() {
  const ctx = useContext(ElectronicsStoreContext);
  return ctx?.storeSlug;
}

/* ═══════════════════════════════════════════════════════════════
   1. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareSectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleSize?: string;
}

export function HardwareSectionTitle({ subtitle, title, description, align = "center", maxWidth = "100%", titleSize = "36px" }: HardwareSectionTitleProps) {
  const css = `
    .hw-stitle { text-align: ${align}; max-width: ${maxWidth}; margin: 0 auto; padding: 40px 15px 20px; }
    .hw-stitle-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 13px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 1px; }
    .hw-stitle-main { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: ${titleSize}; line-height: 1.2; color: ${TOKENS.titleColor}; margin: 0; }
    .hw-stitle-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 1.7; color: ${TOKENS.textColor}; margin: 15px 0 0; }
  `;
  return (
    <>
      <ScopedStyles id="section-title" css={css} />
      <div className="hw-stitle">
        {subtitle && <div className="hw-stitle-sub">{subtitle}</div>}
        <h2 className="hw-stitle-main">{title}</h2>
        {description && <p className="hw-stitle-desc">{description}</p>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. ABOUT CONTENT
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareAboutContentProps {
  subtitle?: string;
  title?: string;
  paragraphs?: string[];
  buttons?: { text: string; link: string }[];
  credit?: string;
}

export function HardwareAboutContent({ subtitle, title, paragraphs = [], buttons = [], credit }: HardwareAboutContentProps) {
  const storeSlug = useStoreSlug();
  const css = `
    .hw-about { padding: 40px 15px; }
    .hw-about-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 13px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 1px; }
    .hw-about-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; line-height: 1.3; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .hw-about-text { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; margin: 0 0 16px; }
    .hw-about-btns { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
    .hw-about-btn { display: inline-block; padding: 12px 30px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
    .hw-about-btn:hover { filter: brightness(0.9); }
    .hw-about-credit { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; font-style: italic; margin-top: 20px; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="about" css={css} />
      <div className="hw-about">
        {subtitle && <div className="hw-about-sub">{subtitle}</div>}
        {title && <h4 className="hw-about-title">{title}</h4>}
        {paragraphs.map((p, i) => <p key={i} className="hw-about-text">{p}</p>)}
        {buttons.length > 0 && (
          <div className="hw-about-btns">
            {buttons.map((btn, i) => <Link key={i} href={resolveStoreLink(btn.link, storeSlug)} className="hw-about-btn">{btn.text}</Link>)}
          </div>
        )}
        {credit && <div className="hw-about-credit">{credit}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. STATS COUNTERS
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareStatsCountersProps {
  counters?: { value: number; label: string }[];
}

export function HardwareStatsCounters({ counters = [] }: HardwareStatsCountersProps) {
  const css = `
    .hw-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; padding: 40px 0; border-top: 1px solid #222; border-bottom: 1px solid #222; margin-bottom: 40px; }
    .hw-stat { text-align: center; min-width: 120px; }
    .hw-stat-val { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 42px; color: ${TOKENS.primaryColor}; line-height: 1; margin-bottom: 8px; }
    .hw-stat-label { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 1px; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="stats" css={css} />
      <div className="hw-stats">
        {counters.map((c, i) => (
          <div key={i} className="hw-stat">
            <div className="hw-stat-val">{c.value}</div>
            <div className="hw-stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. SERVICES GRID
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareServicesGridProps {
  subtitle?: string;
  title?: string;
  services?: { icon: string; title: string; description: string }[];
}

export function HardwareServicesGrid({ subtitle, title, services = [] }: HardwareServicesGridProps) {
  const css = `
    .hw-svcs { padding: 40px 0; }
    .hw-svcs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 30px; }
    .hw-svc { text-align: center; }
    .hw-svc-icon { width: 70px; height: 70px; margin: 0 auto 15px; }
    .hw-svc-icon img { width: 100%; height: 100%; }
    .hw-svc-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; text-transform: uppercase; margin: 0 0 8px; }
    .hw-svc-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.6; color: ${TOKENS.textColor}; }
    @media (max-width: 767px) { .hw-svcs-grid { grid-template-columns: 1fr 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="services" css={css} />
      <div className="hw-svcs">
        {(subtitle || title) && <HardwareSectionTitle subtitle={subtitle} title={title || ""} />}
        <div className="hw-svcs-grid">
          {services.map((s, i) => (
            <div key={i} className="hw-svc">
              <div className="hw-svc-icon"><img src={s.icon} alt={s.title} onError={(e) => onImgError(e, s.title)} /></div>
              <h4 className="hw-svc-title">{s.title}</h4>
              <p className="hw-svc-desc">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. GALLERY GRID
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareGalleryGridProps {
  images?: string[];
}

export function HardwareGalleryGrid({ images = [] }: HardwareGalleryGridProps) {
  const css = `
    .hw-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 40px 0; }
    .hw-gallery img { width: 100%; height: auto; display: block; }
    @media (max-width: 767px) { .hw-gallery { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="gallery" css={css} />
      <div className="hw-gallery">
        {images.map((img, i) => <img key={i} src={img} alt={`Gallery ${i + 1}`} onError={(e) => onImgError(e, "gallery")} />)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. VIDEO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareVideoSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  videos?: { thumbnail: string; youtubeUrl: string; title: string }[];
}

export function HardwareVideoSection({ subtitle, title, description, videos = [] }: HardwareVideoSectionProps) {
  const css = `
    .hw-videos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin: 30px 0 40px; }
    .hw-video { position: relative; overflow: hidden; cursor: pointer; }
    .hw-video img { width: 100%; height: auto; display: block; }
    .hw-video-ov { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: background 0.3s; }
    .hw-video:hover .hw-video-ov { background: rgba(0,0,0,0.6); }
    .hw-video-play { width: 60px; height: 60px; border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
    .hw-video-play::after { content: '▶'; color: #fff; font-size: 20px; margin-left: 4px; }
    .hw-video-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: #fff; }
    @media (max-width: 767px) { .hw-videos { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      {(subtitle || title) && <HardwareSectionTitle subtitle={subtitle} title={title || ""} description={description} />}
      <ScopedStyles id="videos" css={css} />
      <div className="hw-videos">
        {videos.map((v, i) => (
          <a key={i} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hw-video" style={{ textDecoration: "none" }}>
            <img src={v.thumbnail} alt={v.title} onError={(e) => onImgError(e, v.title)} />
            <div className="hw-video-ov">
              <div className="hw-video-play" />
              <div className="hw-video-title">{v.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. QUOTE SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareQuoteSectionProps {
  subtitle?: string;
  quote?: string;
  attribution?: string;
  description?: string;
  credit?: string;
}

export function HardwareQuoteSection({ subtitle, quote, attribution, description, credit }: HardwareQuoteSectionProps) {
  const css = `
    .hw-quote { text-align: center; padding: 60px 15px; max-width: 800px; margin: 0 auto; }
    .hw-quote-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 13px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 1px; }
    .hw-quote-text { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .hw-quote-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; margin: 0 0 16px; }
    .hw-quote-credit { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; font-style: italic; }
  `;
  return (
    <>
      <ScopedStyles id="quote" css={css} />
      <div className="hw-quote">
        {subtitle && <div className="hw-quote-sub">{subtitle}</div>}
        {quote && <h4 className="hw-quote-text">&ldquo;{quote}&rdquo;{attribution && ` — ${attribution}`}</h4>}
        {description && <p className="hw-quote-desc">{description}</p>}
        {credit && <div className="hw-quote-credit">{credit}</div>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. TEAM SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareTeamSectionProps {
  members?: { name: string; role: string; image: string; socials?: string[] }[];
}

export function HardwareTeamSection({ members = [] }: HardwareTeamSectionProps) {
  const css = `
    .hw-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin: 40px 0; }
    .hw-team-m { text-align: center; }
    .hw-team-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; margin-bottom: 15px; }
    .hw-team-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 4px; }
    .hw-team-role { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 1px; }
    @media (max-width: 767px) { .hw-team { grid-template-columns: 1fr 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="team" css={css} />
      <div className="hw-team">
        {members.map((m, i) => (
          <div key={i} className="hw-team-m">
            <img className="hw-team-img" src={m.image} alt={m.name} onError={(e) => onImgError(e, m.name)} />
            <h4 className="hw-team-name">{m.name}</h4>
            <div className="hw-team-role">{m.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. OFFICE LOCATIONS
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareOfficeLocationsProps {
  subtitle?: string;
  title?: string;
  description?: string;
  offices?: { city: string; address: string; phone: string; email: string }[];
}

export function HardwareOfficeLocations({ subtitle, title, description, offices = [] }: HardwareOfficeLocationsProps) {
  const css = `
    .hw-offices { padding: 40px 0; }
    .hw-offices-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 30px; }
    .hw-office { padding: 25px; background: #f4f4f4; }
    .hw-office-city { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 12px; }
    .hw-office-addr { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.6; color: ${TOKENS.textColor}; white-space: pre-line; margin: 0 0 12px; }
    .hw-office-contact { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; }
    .hw-office-contact strong { color: ${TOKENS.titleColor}; }
    @media (max-width: 767px) { .hw-offices-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="offices" css={css} />
      <div className="hw-offices">
        {(subtitle || title) && <HardwareSectionTitle subtitle={subtitle} title={title || ""} description={description} />}
        <div className="hw-offices-grid">
          {offices.map((o, i) => (
            <div key={i} className="hw-office">
              <h4 className="hw-office-city">{o.city}</h4>
              <p className="hw-office-addr">{o.address}</p>
              <div className="hw-office-contact"><strong>Phone:</strong> {o.phone}<br /><strong>Email:</strong> {o.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. COVER BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareCoverBannersProps {
  banners?: { image: string; title: string; description: string; buttonText: string; link: string }[];
}

export function HardwareCoverBanners({ banners = [] }: HardwareCoverBannersProps) {
  const storeSlug = useStoreSlug();
  const css = `
    .hw-covers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
    .hw-cover { position: relative; overflow: hidden; min-height: 280px; text-decoration: none; }
    .hw-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hw-cover-ov { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; flex-direction: column; justify-content: flex-end; padding: 25px; transition: background 0.3s; }
    .hw-cover:hover .hw-cover-ov { background: rgba(0,0,0,0.5); }
    .hw-cover-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: #fff; margin: 0 0 8px; }
    .hw-cover-desc { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: rgba(255,255,255,0.8); margin: 0 0 12px; }
    .hw-cover-link { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: #fff; text-decoration: underline; }
    @media (max-width: 767px) { .hw-covers { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="covers" css={css} />
      <div className="hw-covers">
        {banners.map((b, i) => (
          <Link key={i} href={resolveStoreLink(b.link, storeSlug)} className="hw-cover">
            <img src={b.image} alt={b.title} onError={(e) => onImgError(e, b.title)} />
            <div className="hw-cover-ov">
              <h4 className="hw-cover-title">{b.title}</h4>
              <p className="hw-cover-desc">{b.description}</p>
              <span className="hw-cover-link">{b.buttonText}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. STORE VISIT
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareStoreVisitProps {
  subtitle?: string;
  title?: string;
  address?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function HardwareStoreVisit({ subtitle, title, address, buttonText, buttonLink = "#" }: HardwareStoreVisitProps) {
  const storeSlug = useStoreSlug();
  const css = `
    .hw-visit { padding: 60px 0; background: #f4f4f4; text-align: center; margin-bottom: 40px; }
    .hw-visit-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 13px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 1px; }
    .hw-visit-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0 0 15px; white-space: pre-line; }
    .hw-visit-addr { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; white-space: pre-line; margin: 0 0 20px; }
    .hw-visit-btn { display: inline-block; padding: 12px 30px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
  `;
  return (
    <>
      <ScopedStyles id="visit" css={css} />
      <div className="hw-visit">
        {subtitle && <div className="hw-visit-sub">{subtitle}</div>}
        {title && <h4 className="hw-visit-title">{title}</h4>}
        {address && <p className="hw-visit-addr">{address}</p>}
        {buttonText && <Link href={resolveStoreLink(buttonLink, storeSlug)} className="hw-visit-btn">{buttonText}</Link>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareFaqAccordionProps {
  subtitle?: string;
  title?: string;
  items?: { question: string; answer: string }[];
}

export function HardwareFaqAccordion({ subtitle, title, items = [] }: HardwareFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const css = `
    .hw-faq { padding: 40px 0; }
    .hw-faq-item { border-bottom: 1px solid #ddd; }
    .hw-faq-q { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; cursor: pointer; font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.titleColor}; }
    .hw-faq-q:hover { color: ${TOKENS.primaryColor}; }
    .hw-faq-toggle { font-size: 20px; color: ${TOKENS.textColor}; transition: transform 0.3s; }
    .hw-faq-a { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7; color: ${TOKENS.textColor}; padding: 0 0 18px; white-space: pre-line; }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="faq" css={css} />
      <div className="hw-faq">
        {(subtitle || title) && <HardwareSectionTitle subtitle={subtitle} title={title || ""} />}
        {items.map((item, i) => (
          <div key={i} className="hw-faq-item">
            <div className="hw-faq-q" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span>{item.question}</span>
              <span className="hw-faq-toggle" style={{ transform: openIndex === i ? "rotate(45deg)" : "none" }}>+</span>
            </div>
            {openIndex === i && <div className="hw-faq-a">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   13. CONTACT FORM
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareContactFormProps {
  subtitle?: string;
  title?: string;
  fields?: string[];
  buttonText?: string;
}

export function HardwareContactForm({ subtitle, title, fields = ["name", "email", "phone", "company", "message"], buttonText = "Submit" }: HardwareContactFormProps) {
  const css = `
    .hw-cform { padding: 40px 0; max-width: 700px; margin: 0 auto; }
    .hw-cform input, .hw-cform textarea { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #ddd; font-family: ${TOKENS.bodyFont}; font-size: 14px; box-sizing: border-box; outline: none; background: #fff; }
    .hw-cform input:focus, .hw-cform textarea:focus { border-color: ${TOKENS.primaryColor}; }
    .hw-cform textarea { height: 120px; resize: vertical; }
    .hw-cform-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border: none; cursor: pointer; transition: background 0.3s; }
    .hw-cform-btn:hover { filter: brightness(0.9); }
  `;
  return (
    <div style={containerStyle}>
      <ScopedStyles id="contact-form" css={css} />
      {(subtitle || title) && <HardwareSectionTitle subtitle={subtitle} title={title || ""} />}
      <div className="hw-cform">
        {fields.includes("name") && <input type="text" placeholder="Your Name" />}
        {fields.includes("email") && <input type="email" placeholder="Your Email" />}
        {fields.includes("phone") && <input type="tel" placeholder="Phone Number" />}
        {fields.includes("company") && <input type="text" placeholder="Company" />}
        {fields.includes("message") && <textarea placeholder="Your Message" />}
        <button className="hw-cform-btn">{buttonText}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   14. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface HardwareBlogPostsProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  columns?: number;
  posts?: { title: string; image: string; date: string; author: string; excerpt?: string; categories?: string[] }[];
}

export function HardwareBlogPosts({ sectionTitle, sectionSubtitle, columns = 3, posts = [] }: HardwareBlogPostsProps) {
  const storeSlug = useStoreSlug();
  const css = `
    .hw-blog-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 30px; margin: 30px 0 60px; }
    .hw-blog-card { overflow: hidden; }
    .hw-blog-img { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; }
    .hw-blog-body { padding: 20px 0; }
    .hw-blog-cats { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .hw-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 8px; line-height: 1.4; }
    .hw-blog-meta { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; }
    .hw-blog-excerpt { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.6; color: ${TOKENS.textColor}; margin-top: 10px; }
    @media (max-width: 767px) { .hw-blog-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div style={containerStyle}>
      {(sectionTitle || sectionSubtitle) && <HardwareSectionTitle subtitle={sectionSubtitle} title={sectionTitle || ""} />}
      <ScopedStyles id="blog" css={css} />
      <div className="hw-blog-grid">
        {posts.map((p, i) => (
          <div key={i} className="hw-blog-card">
            <img className="hw-blog-img" src={p.image} alt={p.title} onError={(e) => onImgError(e, p.title)} />
            <div className="hw-blog-body">
              {p.categories && <div className="hw-blog-cats">{p.categories.join(", ")}</div>}
              <h4 className="hw-blog-title">{p.title}</h4>
              <div className="hw-blog-meta">{p.date} • by {p.author}</div>
              {p.excerpt && <p className="hw-blog-excerpt">{p.excerpt}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
