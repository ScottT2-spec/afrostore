"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useContext, createContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Accessories template sections.
   All styling via scoped CSS — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#3E3E3E",
  accentColor: "#F8C542",
  titleColor: "#1D1D1D",
  textColor: "#777",
  containerWidth: "1222px",
  titleFont: "'Poppins', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function AccessoriesFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Poppins:wght@400;500;600;700&display=swap');
    `}} />
  );
}

/* ─── STORE CONTEXT ─────────────────────────────────────────── */
export interface AccessoriesStoreContextData {
  products: Array<{
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    currency: string; inStock: boolean; isFeatured: boolean; tags?: string[];
    images: Array<{ id: string; url: string; alt?: string }>;
    category?: { id: string; name: string; slug: string };
  }>;
  currency: string;
  storeSlug: string;
}
export const AccessoriesStoreContext = createContext<AccessoriesStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES ABOUT HERO
   Two-column layout: text + images grid + testimonial
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesAboutHeroTestimonial { text: string; avatar: string; name: string; company: string; }
export interface AccessoriesAboutHeroProps { subtitle?: string; title: string; description: string; images: string[]; testimonial: AccessoriesAboutHeroTestimonial; }

export function AccessoriesAboutHero({ subtitle, title, description, images, testimonial }: AccessoriesAboutHeroProps) {
  const css = `
    .aah-section { padding: 60px 15px; }
    .aah-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
    .aah-left {}
    .aah-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${TOKENS.bodyFont}; margin-bottom: 12px; letter-spacing: 2px; }
    .aah-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 32px; color: ${TOKENS.titleColor}; margin: 0 0 20px; line-height: 1.3; }
    .aah-desc { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.8; margin: 0 0 30px; }
    .aah-images { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .aah-img { width: 100%; height: auto; display: block; border-radius: 4px; }
    .aah-img-full { grid-column: 1 / -1; }
    .aah-right { display: flex; flex-direction: column; gap: 30px; }
    .aah-testimonial { padding: 30px; background: #f7f7f7; border-radius: 4px; }
    .aah-tq { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.8; margin: 0 0 20px; font-style: italic; }
    .aah-tauthor { display: flex; align-items: center; gap: 12px; }
    .aah-tavatar { width: 48px; height: 48px; border-radius: 50%; }
    .aah-tname { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.titleColor}; margin: 0; }
    .aah-tcompany { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 1px; margin: 2px 0 0; }
    @media (max-width: 767px) {
      .aah-grid { grid-template-columns: 1fr; }
      .aah-title { font-size: 24px; }
    }
  `;
  return (
    <section className="aah-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <div className="aah-grid">
          <div className="aah-left">
            {subtitle && <div className="aah-sub">{subtitle}</div>}
            <h2 className="aah-title">{title}</h2>
            <p className="aah-desc">{description}</p>
            <div className="aah-images">
              {images.slice(0, 2).map((src, i) => (
                <img key={i} src={safeSrc(src)} alt={`About ${i + 1}`} className="aah-img" loading="lazy" onError={onImgError} />
              ))}
            </div>
          </div>
          <div className="aah-right">
            <div className="aah-testimonial">
              <p className="aah-tq">{testimonial.text}</p>
              <div className="aah-tauthor">
                <img src={safeSrc(testimonial.avatar)} alt={testimonial.name} className="aah-tavatar" onError={onImgError} />
                <div>
                  <h4 className="aah-tname">{testimonial.name}</h4>
                  <p className="aah-tcompany">{testimonial.company}</p>
                </div>
              </div>
            </div>
            {images[2] && (
              <img src={safeSrc(images[2])} alt="About 3" className="aah-img" loading="lazy" onError={onImgError} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES TEAM SECTION
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesTeamMember { name: string; role: string; image: string; socials?: string[]; }
export interface AccessoriesTeamSectionProps { subtitle?: string; title?: string; description?: string; members: AccessoriesTeamMember[]; }

export function AccessoriesTeamSection({ subtitle, title, description, members }: AccessoriesTeamSectionProps) {
  const ic: Record<string, string> = { facebook: "f", twitter: "\uD835\uDD4F", instagram: "\uD83D\uDCF7", linkedin: "in" };
  const css = `
    .ats-section { padding: 60px 15px; }
    .ats-header { margin-bottom: 40px; }
    .ats-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 2px; }
    .ats-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0 0 12px; line-height: 1.3; }
    .ats-desc { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.6; margin: 0; }
    .ats-grid { display: grid; grid-template-columns: repeat(${members.length}, 1fr); gap: 30px; }
    .ats-card { text-align: center; }
    .ats-img { width: 100%; height: auto; display: block; margin-bottom: 20px; border-radius: 4px; }
    .ats-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.titleColor}; margin: 0 0 4px; }
    .ats-role { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin: 0 0 12px; }
    .ats-soc { display: flex; gap: 10px; justify-content: center; }
    .ats-sl { width: 36px; height: 36px; border-radius: 50%; background: #f7f7f7; display: flex; align-items: center; justify-content: center; text-decoration: none; color: ${TOKENS.titleColor}; font-size: 14px; font-weight: 700; transition: all 0.3s; }
    .ats-sl:hover { background: ${TOKENS.titleColor}; color: #fff; }
    @media (max-width: 767px) { .ats-grid { grid-template-columns: repeat(2, 1fr); } }
  `;
  return (
    <section className="ats-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        {(subtitle || title) && (
          <div className="ats-header">
            {subtitle && <div className="ats-sub">{subtitle}</div>}
            {title && <h3 className="ats-title">{title}</h3>}
            {description && <p className="ats-desc">{description}</p>}
          </div>
        )}
        <div className="ats-grid">
          {members.map((m, i) => (
            <div key={i} className="ats-card">
              <img src={safeSrc(m.image)} alt={m.name} className="ats-img" loading="lazy" onError={onImgError} />
              <h4 className="ats-name">{m.name}</h4>
              <p className="ats-role">{m.role}</p>
              {m.socials && m.socials.length > 0 && (
                <div className="ats-soc">
                  {m.socials.map((s, j) => <a key={j} href="#" className="ats-sl" title={s}>{ic[s] || s[0]}</a>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES STRATEGY SECTION
   Text + infobox cards
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesInfobox { icon: string; title: string; description: string; }
export interface AccessoriesStrategySectionProps { subtitle?: string; title?: string; paragraphs?: string[]; infoboxes: AccessoriesInfobox[]; }

export function AccessoriesStrategySection({ subtitle, title, paragraphs = [], infoboxes }: AccessoriesStrategySectionProps) {
  const css = `
    .ass-section { padding: 60px 15px; }
    .ass-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${TOKENS.bodyFont}; margin-bottom: 12px; letter-spacing: 2px; }
    .ass-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0 0 20px; line-height: 1.3; }
    .ass-p { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.8; margin: 0 0 16px; }
    .ass-boxes { display: grid; grid-template-columns: repeat(${infoboxes.length}, 1fr); gap: 30px; margin-top: 40px; }
    .ass-box { text-align: center; }
    .ass-icon { width: 60px; height: 60px; margin: 0 auto 16px; }
    .ass-bt { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 8px; }
    .ass-bd { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.6; margin: 0; }
    @media (max-width: 767px) { .ass-boxes { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="ass-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        {subtitle && <div className="ass-sub">{subtitle}</div>}
        {title && <h3 className="ass-title">{title}</h3>}
        {paragraphs.map((p, i) => <p key={i} className="ass-p">{p}</p>)}
        <div className="ass-boxes">
          {infoboxes.map((b, i) => (
            <div key={i} className="ass-box">
              <img src={safeSrc(b.icon)} alt={b.title} className="ass-icon" loading="lazy" onError={onImgError} />
              <h4 className="ass-bt">{b.title}</h4>
              <p className="ass-bd">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES COMMUNITY CTA
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesCommunityCtaProps { title: string; description: string; tabs?: string[]; }

export function AccessoriesCommunityCta({ title, description, tabs = [] }: AccessoriesCommunityCtaProps) {
  const [activeTab, setActiveTab] = useState(0);
  const css = `
    .acc-section { padding: 60px 15px; background: #f7f7f7; }
    .acc-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0 0 16px; line-height: 1.3; }
    .acc-desc { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.8; margin: 0 0 30px; max-width: 80%; }
    .acc-tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid #e0e0e0; }
    .acc-tab { padding: 12px 24px; font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 700; color: ${TOKENS.textColor}; background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s; }
    .acc-tab-active { color: ${TOKENS.titleColor}; border-bottom-color: ${TOKENS.titleColor}; }
    .acc-submit { display: inline-block; padding: 14px 32px; background: ${TOKENS.titleColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 700; text-transform: uppercase; border: none; cursor: pointer; transition: opacity 0.3s; }
    .acc-submit:hover { opacity: 0.85; }
    @media (max-width: 767px) { .acc-desc { max-width: 100%; } .acc-tabs { flex-wrap: wrap; } }
  `;
  return (
    <section className="acc-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <h3 className="acc-title">{title}</h3>
        <p className="acc-desc">{description}</p>
        {tabs.length > 0 && (
          <div className="acc-tabs">
            {tabs.map((t, i) => (
              <button key={i} className={`acc-tab ${activeTab === i ? "acc-tab-active" : ""}`} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>
        )}
        <button className="acc-submit">Submit Now</button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES STORE VISIT
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesStoreVisitProps { subtitle?: string; title: string; address: string; buttonText?: string; buttonLink?: string; }

export function AccessoriesStoreVisit({ subtitle, title, address, buttonText = "See More About", buttonLink = "#" }: AccessoriesStoreVisitProps) {
  const storeCtx = useContext(AccessoriesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const css = `
    .asv-section { padding: 60px 15px; text-align: center; }
    .asv-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${TOKENS.bodyFont}; margin-bottom: 12px; letter-spacing: 2px; }
    .asv-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 32px; text-transform: uppercase; color: ${TOKENS.titleColor}; margin: 0 0 16px; line-height: 1.2; white-space: pre-line; }
    .asv-addr { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.6; margin: 0 0 24px; white-space: pre-line; }
    .asv-btn { display: inline-block; padding: 12px 28px; background: ${TOKENS.titleColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 700; text-transform: uppercase; text-decoration: none; transition: opacity 0.3s; }
    .asv-btn:hover { opacity: 0.85; }
    @media (max-width: 767px) { .asv-title { font-size: 24px; } }
  `;
  return (
    <section className="asv-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        {subtitle && <div className="asv-sub">{subtitle}</div>}
        <h2 className="asv-title">{title}</h2>
        <p className="asv-addr">{address}</p>
        <Link href={fixLink(buttonLink)} className="asv-btn">{buttonText}</Link>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesFaqItem { question: string; answer: string; }
export interface AccessoriesFaqAccordionProps { subtitle?: string; title?: string; items: AccessoriesFaqItem[]; }

export function AccessoriesFaqAccordion({ subtitle, title, items }: AccessoriesFaqAccordionProps) {
  const [oi, setOi] = useState<number | null>(null);
  const css = `
    .afa-section { padding: 60px 15px; }
    .afa-header { margin-bottom: 30px; }
    .afa-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 2px; }
    .afa-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0; line-height: 1.3; }
    .afa-item { border-bottom: 1px solid #e0e0e0; }
    .afa-q { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 18px 0; background: none; border: none; cursor: pointer; text-align: left; font-family: ${TOKENS.bodyFont}; font-size: 15px; font-weight: 700; color: ${TOKENS.titleColor}; }
    .afa-arr { font-size: 18px; transition: transform 0.3s; color: ${TOKENS.textColor}; }
    .afa-arr-o { transform: rotate(180deg); }
    .afa-ans { padding: 0 0 18px; font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.8; white-space: pre-line; }
  `;
  return (
    <section className="afa-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        {(subtitle || title) && (
          <div className="afa-header">
            {subtitle && <div className="afa-sub">{subtitle}</div>}
            {title && <h3 className="afa-title">{title}</h3>}
          </div>
        )}
        {items.map((item, i) => (
          <div key={i} className="afa-item">
            <button className="afa-q" onClick={() => setOi(oi === i ? null : i)}>
              <span>{item.question}</span>
              <span className={`afa-arr ${oi === i ? "afa-arr-o" : ""}`}>&#9660;</span>
            </button>
            {oi === i && <div className="afa-ans">{item.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES CONTACT FORM
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesContactFormProps { subtitle?: string; title?: string; fields?: string[]; }

export function AccessoriesContactForm({ subtitle, title, fields = ["name", "email", "phone", "company", "message"] }: AccessoriesContactFormProps) {
  const labels: Record<string, string> = { name: "Your Name", email: "Your Email", phone: "Phone Number", company: "Company", message: "Your Message" };
  const css = `
    .acf-section { padding: 60px 15px; }
    .acf-header { margin-bottom: 30px; }
    .acf-sub { color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 600; font-size: 12px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px; letter-spacing: 2px; }
    .acf-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0; line-height: 1.3; }
    .acf-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .acf-full { grid-column: 1 / -1; }
    .acf-input { width: 100%; padding: 14px 16px; font-family: ${TOKENS.bodyFont}; font-size: 14px; border: 1px solid #e0e0e0; background: #fff; color: ${TOKENS.titleColor}; outline: none; transition: border-color 0.3s; box-sizing: border-box; }
    .acf-input:focus { border-color: ${TOKENS.titleColor}; }
    .acf-ta { min-height: 150px; resize: vertical; }
    .acf-submit { display: inline-block; padding: 14px 32px; background: ${TOKENS.titleColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 700; text-transform: uppercase; border: none; cursor: pointer; transition: opacity 0.3s; }
    .acf-submit:hover { opacity: 0.85; }
    @media (max-width: 767px) { .acf-form { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="acf-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        {(subtitle || title) && (
          <div className="acf-header">
            {subtitle && <div className="acf-sub">{subtitle}</div>}
            {title && <h3 className="acf-title">{title}</h3>}
          </div>
        )}
        <form className="acf-form" onSubmit={(e) => e.preventDefault()}>
          {fields.map((f) => f === "message"
            ? <textarea key={f} className="acf-input acf-ta acf-full" placeholder={labels[f] || f} />
            : <input key={f} type={f === "email" ? "email" : "text"} className="acf-input" placeholder={labels[f] || f} />
          )}
          <div className="acf-full"><button type="submit" className="acf-submit">Send Message</button></div>
        </form>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES BLOG HEADER
   Full-width banner with title overlay
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesBlogHeaderProps { title: string; backgroundImage?: string; }

export function AccessoriesBlogHeader({ title, backgroundImage }: AccessoriesBlogHeaderProps) {
  const css = `
    .abh-section { position: relative; min-height: 200px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
    .abh-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); }
    .abh-title { position: relative; z-index: 1; font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 36px; color: #fff; text-align: center; margin: 0; }
    @media (max-width: 767px) { .abh-title { font-size: 24px; } .abh-section { min-height: 140px; } }
  `;
  return (
    <section className="abh-section" style={backgroundImage ? { backgroundImage: `url(${safeSrc(backgroundImage)})` } : { background: TOKENS.primaryColor }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="abh-overlay" />
      <h1 className="abh-title">{title}</h1>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesBlogPost { title: string; date: string; category: string; author: string; excerpt: string; image: string; link: string; }
export interface AccessoriesBlogPostsProps { posts: AccessoriesBlogPost[]; columns?: number; }

export function AccessoriesBlogPosts({ posts, columns = 2 }: AccessoriesBlogPostsProps) {
  const css = `
    .abp-section { padding: 60px 15px; }
    .abp-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 30px; }
    .abp-card { overflow: hidden; }
    .abp-img-wrap { position: relative; overflow: hidden; margin-bottom: 16px; }
    .abp-img { width: 100%; height: auto; display: block; transition: transform 0.4s; }
    .abp-img-wrap:hover .abp-img { transform: scale(1.05); }
    .abp-date { position: absolute; top: 12px; left: 12px; background: ${TOKENS.titleColor}; color: #fff; padding: 6px 12px; font-family: ${TOKENS.bodyFont}; font-size: 12px; font-weight: 700; }
    .abp-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .abp-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 20px; color: ${TOKENS.titleColor}; margin: 0 0 8px; line-height: 1.3; }
    .abp-title a { color: inherit; text-decoration: none; }
    .abp-title a:hover { color: ${TOKENS.primaryColor}; }
    .abp-meta { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin-bottom: 12px; }
    .abp-excerpt { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.6; margin: 0 0 12px; }
    .abp-read { font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 700; color: ${TOKENS.titleColor}; text-decoration: none; text-transform: uppercase; }
    .abp-read:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 767px) { .abp-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="abp-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <div className="abp-grid">
          {posts.map((post, i) => (
            <div key={i} className="abp-card">
              <div className="abp-img-wrap">
                <img src={safeSrc(post.image)} alt={post.title} className="abp-img" loading="lazy" onError={onImgError} />
                <span className="abp-date">{post.date}</span>
              </div>
              <div className="abp-cat">{post.category}</div>
              <h3 className="abp-title"><a href={post.link}>{post.title}</a></h3>
              <div className="abp-meta">Posted by {post.author}</div>
              <p className="abp-excerpt">{post.excerpt}</p>
              <a href={post.link} className="abp-read">Continue reading</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesProductGridProps { columns?: number; maxProducts?: number; }

export function AccessoriesProductGrid({ columns = 4, maxProducts = 12 }: AccessoriesProductGridProps) {
  const storeCtx = useContext(AccessoriesStoreContext);
  const products = (storeCtx?.products || []).slice(0, maxProducts);
  const currency = storeCtx?.currency || "USD";
  const currencySymbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const sym = currencySymbols[currency] || currency + " ";
  const css = `
    .apg-section { padding: 40px 15px; }
    .apg-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 24px; }
    .apg-card { text-align: center; }
    .apg-img { width: 100%; height: auto; display: block; margin-bottom: 12px; border-radius: 4px; }
    .apg-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 14px; color: ${TOKENS.titleColor}; margin: 0 0 6px; }
    .apg-name a { color: inherit; text-decoration: none; }
    .apg-price { font-family: ${TOKENS.bodyFont}; font-size: 15px; font-weight: 700; color: ${TOKENS.titleColor}; }
    .apg-compare { text-decoration: line-through; color: ${TOKENS.textColor}; font-weight: 400; margin-right: 8px; font-size: 13px; }
    .apg-empty { grid-column: 1 / -1; text-align: center; padding: 40px; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    @media (max-width: 767px) { .apg-grid { grid-template-columns: repeat(2, 1fr); } }
  `;
  if (products.length === 0) {
    return (
      <section className="apg-section">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
          <div className="apg-grid"><div className="apg-empty">No products available yet.</div></div>
        </div>
      </section>
    );
  }
  return (
    <section className="apg-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <div className="apg-grid">
          {products.map((p) => {
            const img = p.images?.[0]?.url;
            const slug = storeCtx?.storeSlug;
            return (
              <div key={p.id} className="apg-card">
                {img && <Link href={`/store/${slug}/product/${p.slug}`}><img src={safeSrc(img)} alt={p.name} className="apg-img" loading="lazy" onError={onImgError} /></Link>}
                <h4 className="apg-name"><Link href={`/store/${slug}/product/${p.slug}`}>{p.name}</Link></h4>
                <div className="apg-price">
                  {p.compareAtPrice && <span className="apg-compare">{sym}{p.compareAtPrice.toFixed(2)}</span>}
                  {sym}{p.price.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES FAQS HEADER
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesFaqsHeaderProps { title: string; description: string; contactButtonText?: string; }

export function AccessoriesFaqsHeader({ title, description, contactButtonText = "CONTACT US" }: AccessoriesFaqsHeaderProps) {
  const css = `
    .afh-section { padding: 60px 15px 30px; }
    .afh-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0 0 12px; }
    .afh-desc { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 1.6; margin: 0 0 20px; }
    .afh-btn { display: inline-block; padding: 12px 28px; background: ${TOKENS.titleColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 700; text-transform: uppercase; text-decoration: none; border: none; cursor: pointer; transition: opacity 0.3s; }
    .afh-btn:hover { opacity: 0.85; }
  `;
  return (
    <section className="afh-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <h2 className="afh-title">{title}</h2>
        <p className="afh-desc">{description}</p>
        <button className="afh-btn">{contactButtonText}</button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES FAQS CONTACT INFO
   Form + sidebar contact details
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesFaqsContactInfoData { address: string; phones: string[]; emails: string[]; }
export interface AccessoriesFaqsContactInfoProps { formFields?: string[]; contactInfo: AccessoriesFaqsContactInfoData; footerText?: string; }

export function AccessoriesFaqsContactInfo({ formFields = ["name", "email", "phone", "company", "message"], contactInfo, footerText }: AccessoriesFaqsContactInfoProps) {
  const labels: Record<string, string> = { name: "Your Name", email: "Your Email", phone: "Phone Number", company: "Company", message: "Your Message" };
  const css = `
    .afci-section { padding: 30px 15px 60px; }
    .afci-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .afci-form-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 20px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .afci-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .afci-full { grid-column: 1 / -1; }
    .afci-input { width: 100%; padding: 12px 14px; font-family: ${TOKENS.bodyFont}; font-size: 14px; border: 1px solid #e0e0e0; background: #fff; color: ${TOKENS.titleColor}; outline: none; box-sizing: border-box; }
    .afci-input:focus { border-color: ${TOKENS.titleColor}; }
    .afci-ta { min-height: 120px; resize: vertical; }
    .afci-right-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 20px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .afci-info-block { display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
    .afci-icon { width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px; }
    .afci-info-text { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.6; white-space: pre-line; }
    .afci-info-text a { color: ${TOKENS.titleColor}; text-decoration: none; }
    .afci-footer { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.6; margin-top: 20px; }
    @media (max-width: 767px) { .afci-grid { grid-template-columns: 1fr; } .afci-form { grid-template-columns: 1fr; } }
  `;
  return (
    <section className="afci-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <div className="afci-grid">
          <div>
            <h3 className="afci-form-title">SEND US A MESSAGE</h3>
            <form className="afci-form" onSubmit={(e) => e.preventDefault()}>
              {formFields.map((f) => f === "message"
                ? <textarea key={f} className="afci-input afci-ta afci-full" placeholder={labels[f] || f} />
                : <input key={f} type={f === "email" ? "email" : "text"} className="afci-input" placeholder={labels[f] || f} />
              )}
            </form>
          </div>
          <div>
            <h3 className="afci-right-title">CONTACT INFORMATION</h3>
            <div className="afci-info-block">
              <img src="https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/07/placeholder.svg" alt="Address" className="afci-icon" onError={onImgError} />
              <div className="afci-info-text">{contactInfo.address}</div>
            </div>
            <div className="afci-info-block">
              <img src="https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/07/smartphone.svg" alt="Phone" className="afci-icon" onError={onImgError} />
              <div className="afci-info-text">{contactInfo.phones.join("\n")}</div>
            </div>
            <div className="afci-info-block">
              <img src="https://woodmart.xtemos.com/accessories/wp-content/uploads/sites/7/2022/07/paper-plane.svg" alt="Email" className="afci-icon" onError={onImgError} />
              <div className="afci-info-text">{contactInfo.emails.map((e, i) => <span key={i}><a href={`mailto:${e}`}>{e}</a>{i < contactInfo.emails.length - 1 ? "\n" : ""}</span>)}</div>
            </div>
            {footerText && <p className="afci-footer">{footerText}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSORIES CATEGORIZED FAQ
   FAQ section with category heading
   ═══════════════════════════════════════════════════════════════ */
export interface AccessoriesCategorizedFaqItem { question: string; answer: string; }
export interface AccessoriesCategorizedFaqProps { category: string; items: AccessoriesCategorizedFaqItem[]; }

export function AccessoriesCategorizedFaq({ category, items }: AccessoriesCategorizedFaqProps) {
  const [oi, setOi] = useState<number | null>(null);
  const css = `
    .acfq-section { padding: 30px 15px; }
    .acfq-cat { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 22px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .acfq-item { border-bottom: 1px solid #e0e0e0; }
    .acfq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px 0; background: none; border: none; cursor: pointer; text-align: left; font-family: ${TOKENS.bodyFont}; font-size: 15px; font-weight: 600; color: ${TOKENS.titleColor}; }
    .acfq-arr { font-size: 16px; transition: transform 0.3s; color: ${TOKENS.textColor}; }
    .acfq-arr-o { transform: rotate(180deg); }
    .acfq-ans { padding: 0 0 16px; font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; line-height: 1.8; white-space: pre-line; }
  `;
  return (
    <section className="acfq-section">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: TOKENS.containerWidth, margin: "0 auto", padding: "0 15px" }}>
        <h3 className="acfq-cat">{category}</h3>
        {items.map((item, i) => (
          <div key={i} className="acfq-item">
            <button className="acfq-q" onClick={() => setOi(oi === i ? null : i)}>
              <span>{item.question}</span>
              <span className={`acfq-arr ${oi === i ? "acfq-arr-o" : ""}`}>&#9660;</span>
            </button>
            {oi === i && <div className="acfq-ans">{item.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
