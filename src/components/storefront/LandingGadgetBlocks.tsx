"use client";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useEffect, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   LANDING GADGET TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Landing Gadget demo.
   ═══════════════════════════════════════════════════════════════ */

const TOKENS = {
  primaryColor: "#3e97ff",
  accentColor: "#e84e48",
  titleColor: "#222222",
  textColor: "#777777",
  bgGray: "#f1f2f6",
  bgDarkGray: "#f0f2f4",
  bgWhite: "#ffffff",
  borderColor: "#ffffff",
  borderWidth: "14px",
};

/* ─── context for store-level data ─────────────────────────── */

interface GadgetContextData {
  storeSlug?: string;
  products?: any[];
  currency?: string;
  addToCart?: (pid: string, qty: number) => void;
}

const GadgetCtx = createContext<GadgetContextData>({});
export function useGadgetCtx() { return useContext(GadgetCtx); }
export { GadgetCtx as LandingGadgetContext };

/* ─── Google Fonts loader ──────────────────────────────────── */

export function LandingGadgetFontLoader() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. HERO SECTION
   Split layout: text left, product image right.
   Background image with white border frame.
   ═══════════════════════════════════════════════════════════════ */

interface HeroProps {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  productImage?: string;
  backgroundImage?: string;
}

export function LandingGadgetHero({
  titleLine1 = "Inspiration Of",
  titleLine2 = "Beauty In Simplicity.",
  description = "Authorities in our business will tell in no uncertain terms that Lorem Ipsum is that huge, huge no no to forswear forever. Not so fast, I'd say, there are some redeeming factors in favor of greeking text.",
  primaryButtonText = "Buy now",
  primaryButtonLink = "#",
  secondaryButtonText = "View More",
  secondaryButtonLink = "#",
  productImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-slider-phone-opt.png",
  backgroundImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-slider-bg-opt.jpg",
}: HeroProps) {
  const { storeSlug } = useGadgetCtx();
  return (
    <section
      style={{
        backgroundImage: `url(${safeSrc(backgroundImage)})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        border: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
        borderBottom: "none",
        padding: "120px 0 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        {/* Text side */}
        <div style={{ flex: "1 1 50%", minWidth: 280, paddingRight: 40, paddingBottom: 60 }}>
          <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 400, color: "#fff", opacity: 0.7, marginBottom: 8, letterSpacing: 1 }}>
            {titleLine1}
          </h4>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 52, fontWeight: 700, lineHeight: 1.19, color: "#fff", margin: "0 0 24px" }}>
            {titleLine2}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.625, color: "rgba(255,255,255,0.7)", maxWidth: 420, marginBottom: 32 }}>
            {description}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href={resolveStoreLink(primaryButtonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: TOKENS.primaryColor, color: "#fff", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "opacity .2s" }}>
              {primaryButtonText}
            </Link>
            <Link href={resolveStoreLink(secondaryButtonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "transparent", color: "#333", border: "2px solid #dadada", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              {secondaryButtonText}
            </Link>
          </div>
        </div>
        {/* Product image side */}
        <div style={{ flex: "1 1 50%", minWidth: 280, textAlign: "center" }}>
          <img src={safeSrc(productImage)} alt="Product" onError={onImgError} style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. STATS BAR
   Three info boxes with big number + title + description.
   Gray background strip.
   ═══════════════════════════════════════════════════════════════ */

interface StatItem {
  number: string;
  title: string;
  description: string;
  link?: string;
}

interface StatsBarProps {
  items?: StatItem[];
}

export function LandingGadgetStatsBar({
  items = [
    { number: "48", title: "Hours Life", description: "It's unreal, uncanny, makes you wonder if something is wrong, it." },
    { number: "2X", title: "More Powerful", description: "Usually, we prefer the real thing, wine without sulfur based pres." },
    { number: "12.2", title: "MP Camera", description: "Real butter, not margarine, and so we'd like our layouts designs." },
  ],
}: StatsBarProps) {
  return (
    <section style={{ backgroundColor: TOKENS.bgGray, border: `0 ${TOKENS.borderWidth} solid ${TOKENS.borderColor}`, borderLeft: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`, borderRight: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`, padding: "40px 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30 }}>
        {items.map((item, i) => (
          <div key={i} style={{ flex: "1 1 280px", maxWidth: 360, textAlign: "center", padding: "0 13%", marginBottom: 80 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 48, fontWeight: 700, color: TOKENS.accentColor, lineHeight: 1.1 }}>
              {item.number}
            </div>
            <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 600, color: TOKENS.titleColor, margin: "8px 0 12px" }}>
              {item.title}
            </h4>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.7, color: TOKENS.textColor }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. FEATURE SECTION (reusable split layout)
   Image on one side, text + specs on the other.
   Used for Sound, Display, Camera, etc.
   ═══════════════════════════════════════════════════════════════ */

interface SpecItem {
  icon?: string;
  title: string;
  description: string;
}

interface FeatureSplitProps {
  title?: string;
  description?: string;
  image?: string;
  imagePosition?: "left" | "right";
  specs?: SpecItem[];
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string;
  bordered?: boolean;
  parallax?: boolean;
}

export function LandingGadgetFeatureSplit({
  title = "2 stereo speakers for\nfull immersion.",
  description = "You begin with a text, you sculpt information, you chisel away what's not needed, you come to the point, make things clear, add value.",
  image = "",
  imagePosition = "right",
  specs = [],
  primaryButtonText,
  primaryButtonLink = "#",
  secondaryButtonText,
  secondaryButtonLink = "#",
  backgroundColor = "transparent",
  textColor: propTextColor,
  titleColor: propTitleColor,
  bordered = true,
  parallax = false,
}: FeatureSplitProps) {
  const { storeSlug } = useGadgetCtx();
  const finalTextColor = propTextColor || TOKENS.textColor;
  const finalTitleColor = propTitleColor || TOKENS.titleColor;

  const textContent = (
    <div style={{ flex: "1 1 50%", minWidth: 280, padding: "40px 30px" }}>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: finalTitleColor, margin: "0 0 20px", whiteSpace: "pre-line" }}>
        {title}
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.625, color: finalTextColor, maxWidth: 480, marginBottom: specs.length > 0 ? 30 : 24 }}>
        {description}
      </p>
      {specs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 30 }}>
          {specs.map((s, i) => (
            <div key={i} style={{ flex: "1 1 180px", maxWidth: 220 }}>
              {s.icon && <img src={safeSrc(s.icon)} alt={s.title} onError={onImgError} style={{ width: 40, height: 40, marginBottom: 10 }} />}
              <h5 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: finalTitleColor, marginBottom: 4 }}>{s.title}</h5>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: finalTextColor, lineHeight: 1.5 }}>{s.description}</p>
            </div>
          ))}
        </div>
      )}
      {(primaryButtonText || secondaryButtonText) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {primaryButtonText && (
            <Link href={resolveStoreLink(primaryButtonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: TOKENS.primaryColor, color: "#fff", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              {primaryButtonText}
            </Link>
          )}
          {secondaryButtonText && (
            <Link href={resolveStoreLink(secondaryButtonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "transparent", color: finalTitleColor, border: "2px solid currentColor", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              {secondaryButtonText}
            </Link>
          )}
        </div>
      )}
    </div>
  );

  const imageContent = (
    <div style={{ flex: "1 1 50%", minWidth: 280, textAlign: "center", padding: "40px 0" }}>
      <img src={safeSrc(image)} alt={typeof title === "string" ? title.split("\n")[0] : "Feature"} onError={onImgError} style={{ maxWidth: "100%", height: "auto" }} />
    </div>
  );

  return (
    <section style={{
      backgroundColor,
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderLeft: bordered ? `${TOKENS.borderWidth} solid ${TOKENS.borderColor}` : undefined,
      borderRight: bordered ? `${TOKENS.borderWidth} solid ${TOKENS.borderColor}` : undefined,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        {imagePosition === "left" ? <>{imageContent}{textContent}</> : <>{textContent}{imageContent}</>}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. WATERPROOF / DARK BG FEATURE
   Full-width dark background image with text overlay + parallax image
   ═══════════════════════════════════════════════════════════════ */

interface DarkFeatureProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  overlayImage?: string;
}

export function LandingGadgetDarkFeature({
  title = "The body is made of\nwaterproof materials.",
  description = "When it's about controlling hundreds of articles, product pages for web shops, or user profiles in social networks, all of them potentially with different sizes, formats, rules for.",
  buttonText = "View More",
  buttonLink = "#",
  backgroundImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-bg-woterproof-opt.jpg",
  overlayImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-woterproof-opt.png",
}: DarkFeatureProps) {
  const { storeSlug } = useGadgetCtx();
  return (
    <section style={{
      backgroundImage: `url(${safeSrc(backgroundImage)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderLeft: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      borderRight: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      marginBottom: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 40%", minWidth: 280, padding: "80px 0" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: "#fff", margin: "0 0 20px", whiteSpace: "pre-line" }}>
            {title}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.625, color: "rgba(255,255,255,0.7)", maxWidth: 480, marginBottom: 24 }}>
            {description}
          </p>
          <Link href={resolveStoreLink(buttonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "transparent", color: "#fff", border: "2px solid #fff", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            {buttonText}
          </Link>
        </div>
        <div style={{ flex: "1 1 50%", minWidth: 280, textAlign: "center" }}>
          <img src={safeSrc(overlayImage)} alt="Feature" onError={onImgError} style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. PHOTO GALLERY WITH TEXT
   Two images + text description side by side.
   ═══════════════════════════════════════════════════════════════ */

interface PhotoGalleryProps {
  title?: string;
  description?: string;
  images?: string[];
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imagePosition?: "left" | "right";
}

export function LandingGadgetPhotoGallery({
  title = "Point your camera\nfind products online.",
  description = "Using test items of real content and data in designs will help, but there's no guarantee that every oddity will be found and corrected.",
  images = [
    "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-photo-1-opt.jpg",
    "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-photo-2-opt-.jpg",
  ],
  primaryButtonText = "To Shop",
  primaryButtonLink = "#",
  secondaryButtonText = "View More",
  secondaryButtonLink = "#",
  imagePosition = "left",
}: PhotoGalleryProps) {
  const { storeSlug } = useGadgetCtx();

  const gallery = (
    <div style={{ flex: "1 1 50%", minWidth: 280, display: "flex", gap: 10, padding: "0 10px" }}>
      {images.map((img, i) => (
        <div key={i} style={{ flex: 1 }}>
          <img src={safeSrc(img)} alt={`Photo ${i + 1}`} onError={onImgError} style={{ width: "100%", height: "auto", borderRadius: 0 }} />
        </div>
      ))}
    </div>
  );

  const text = (
    <div style={{ flex: "1 1 50%", minWidth: 280, padding: "40px 30px" }}>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: TOKENS.titleColor, margin: "0 0 20px", whiteSpace: "pre-line" }}>
        {title}
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.625, color: TOKENS.textColor, maxWidth: 480, marginBottom: 24 }}>
        {description}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {primaryButtonText && (
          <Link href={resolveStoreLink(primaryButtonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: TOKENS.primaryColor, color: "#fff", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            {primaryButtonText}
          </Link>
        )}
        {secondaryButtonText && (
          <Link href={resolveStoreLink(secondaryButtonLink, storeSlug)} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "transparent", color: TOKENS.titleColor, border: "2px solid currentColor", borderRadius: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            {secondaryButtonText}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <section style={{ margin: "0 0 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        {imagePosition === "left" ? <>{gallery}{text}</> : <>{text}{gallery}</>}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. CAMERA DARK FEATURE
   Dark bg with text + 4 stat boxes in grid, parallax image
   ═══════════════════════════════════════════════════════════════ */

interface CameraStatItem {
  value: string;
  label: string;
  description: string;
}

interface CameraDarkProps {
  title?: string;
  description?: string;
  stats?: CameraStatItem[];
  backgroundImage?: string;
  overlayImage?: string;
}

export function LandingGadgetCameraDark({
  title = "You'll never want\nto use your flash again.",
  description = "Just fill up a page with draft copy about the client's business and they will actually read it and comment on it.",
  stats = [
    { value: "0.1 sec.", label: "For Shutter Release", description: "In faucibus malesuada euismod." },
    { value: "18+", label: "Equipment work", description: "Etiam ut consectetur ipsum." },
    { value: "240 FPS", label: "Frame Frequency", description: "A eu a et parturient platea lobo." },
    { value: "0.5 Ro", label: "Video Recording", description: "Pellentesque interdum odio." },
  ],
  backgroundImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-bg-opt.jpg",
  overlayImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-opt.png",
}: CameraDarkProps) {
  return (
    <section style={{
      backgroundImage: `url(${safeSrc(backgroundImage)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderLeft: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      borderRight: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      margin: "80px 0",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 50%", minWidth: 280, textAlign: "center", display: "flex", justifyContent: "center" }}>
          <img src={safeSrc(overlayImage)} alt="Camera" onError={onImgError} style={{ maxWidth: "90%", height: "auto" }} />
        </div>
        <div style={{ flex: "1 1 50%", minWidth: 280, padding: "80px 0" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: "#fff", margin: "0 0 20px", whiteSpace: "pre-line" }}>
            {title}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.625, color: "rgba(255,255,255,0.7)", maxWidth: 480, marginBottom: 30 }}>
            {description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 30 }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{s.value}</div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", margin: "6px 0 4px" }}>{s.label}</h5>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. SECURITY SECTION
   Title + 3 icon feature boxes in a row
   ═══════════════════════════════════════════════════════════════ */

interface SecurityItem {
  icon: string;
  title: string;
  description: string;
}

interface SecurityProps {
  sectionTitle?: string;
  items?: SecurityItem[];
}

export function LandingGadgetSecurity({
  sectionTitle = "Security and protection against thieves.",
  items = [
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-sequrity-fingerprint-1.svg", title: "Unlock Fingerprint", description: "Presently it defines a new ipsum provider plugin service that allows for pluggable ipsum." },
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-sequrity-web-1.svg", title: "Web Locking", description: "Optionally available are extracts from a speech, corporate nonsense, and a randomised." },
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-sequrity-os-shild-1.svg", title: "OS Secure", description: "Try telling a client to ignore draft copy however, and you're up to something you can't win." },
  ],
}: SecurityProps) {
  return (
    <section style={{ padding: "80px 0 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: TOKENS.titleColor, textAlign: "center", margin: "0 0 50px" }}>
          {sectionTitle}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
          {items.map((item, i) => (
            <div key={i} style={{ flex: "1 1 280px", maxWidth: 340, textAlign: "center" }}>
              <img src={safeSrc(item.icon)} alt={item.title} onError={onImgError} style={{ width: 80, height: 80, marginBottom: 20 }} />
              <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 600, color: TOKENS.titleColor, marginBottom: 10 }}>
                {item.title}
              </h4>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.7, color: TOKENS.textColor }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. CAMERA OPTICS / 360° SECTION
   Title + 6 spec boxes flanking a central product viewer
   ═══════════════════════════════════════════════════════════════ */

interface OpticsSpec {
  icon: string;
  value: string;
  label: string;
}

interface CameraOpticsProps {
  sectionTitle?: string;
  productImage?: string;
  leftSpecs?: OpticsSpec[];
  rightSpecs?: OpticsSpec[];
}

export function LandingGadgetCameraOptics({
  sectionTitle = "Powerful optics and advanced technology in camera.",
  productImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/pixel-3-xl-360-1-opt.jpg",
  leftSpecs = [
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-1.svg", value: "12.2 MP", label: "Camera" },
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-2.svg", value: "1.4 μm", label: "Pixel Size" },
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-3.svg", value: "f/1.8", label: "Aperture" },
  ],
  rightSpecs = [
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-4.svg", value: "6x Zoom", label: "Sapphire Lenses" },
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-5.svg", value: "2 LED", label: "Smart Flash" },
    { icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-camera-6.svg", value: "2 Laser", label: "Smart Flash" },
  ],
}: CameraOpticsProps) {
  return (
    <section style={{
      backgroundColor: TOKENS.bgDarkGray,
      borderLeft: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      borderRight: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      padding: "80px 0 40px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: TOKENS.titleColor, textAlign: "center", margin: "0 0 50px" }}>
          {sectionTitle}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
          {/* Left specs */}
          <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", flexDirection: "column", gap: 30 }}>
            {leftSpecs.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <img src={safeSrc(s.icon)} alt={s.value} onError={onImgError} style={{ width: 48, height: 48, marginBottom: 8 }} />
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: TOKENS.titleColor }}>{s.value}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: TOKENS.textColor }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Center product image */}
          <div style={{ flex: "1 1 300px", maxWidth: 440, textAlign: "center", padding: "0 20px" }}>
            <img src={safeSrc(productImage)} alt="Product 360" onError={onImgError} style={{ maxWidth: "100%", height: "auto" }} />
          </div>
          {/* Right specs */}
          <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", flexDirection: "column", gap: 30 }}>
            {rightSpecs.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <img src={safeSrc(s.icon)} alt={s.value} onError={onImgError} style={{ width: 48, height: 48, marginBottom: 8 }} />
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: TOKENS.titleColor }}>{s.value}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: TOKENS.textColor }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. PRODUCTS SHOWCASE
   Product cards + accessories banner
   ═══════════════════════════════════════════════════════════════ */

interface ShowcaseProduct {
  name: string;
  category?: string;
  price: string;
  image: string;
  link?: string;
}

interface ProductsShowcaseProps {
  products?: ShowcaseProduct[];
  bannerImage?: string;
  bannerTitle?: string;
  bannerButtonText?: string;
  bannerButtonLink?: string;
}

export function LandingGadgetProductsShowcase({
  products = [
    { name: "Pixel 3", category: "Landing Pixel", price: "$649.00", image: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/pixel-3-beige-opt.jpg", link: "#" },
    { name: "Pixel 3 XL", category: "Landing Pixel", price: "$849.00", image: "https://woodmart.xtemos.com/wp-content/uploads/2018/11/pixel-3-xl-gray-opt.jpg", link: "#" },
  ],
  bannerImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-accessories-banner-opt-1.jpg",
  bannerTitle = "Accessories",
  bannerButtonText = "View More",
  bannerButtonLink = "#",
}: ProductsShowcaseProps) {
  const { storeSlug } = useGadgetCtx();
  return (
    <section style={{
      borderLeft: `7px solid ${TOKENS.borderColor}`,
      borderRight: `7px solid ${TOKENS.borderColor}`,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap" }}>
        {products.map((p, i) => (
          <div key={i} style={{ flex: "1 1 25%", minWidth: 220, backgroundColor: TOKENS.bgDarkGray, marginBottom: 14, borderLeft: `7px solid ${TOKENS.borderColor}`, borderRight: `7px solid ${TOKENS.borderColor}`, padding: 20 }}>
            <Link href={resolveStoreLink(p.link || "#", storeSlug)} style={{ textDecoration: "none" }}>
              <img src={safeSrc(p.image)} alt={p.name} onError={onImgError} style={{ width: "100%", height: "auto", marginBottom: 12 }} />
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 600, color: TOKENS.titleColor, margin: "0 0 4px" }}>{p.name}</h3>
              {p.category && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: TOKENS.textColor, margin: "0 0 8px" }}>{p.category}</p>}
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: TOKENS.primaryColor }}>{p.price}</div>
            </Link>
          </div>
        ))}
        {/* Accessories banner */}
        <div style={{ flex: "1 1 50%", minWidth: 280, position: "relative", overflow: "hidden", marginBottom: 14, borderLeft: `7px solid ${TOKENS.borderColor}`, borderRight: `7px solid ${TOKENS.borderColor}` }}>
          <Link href={resolveStoreLink(bannerButtonLink, storeSlug)} style={{ display: "block", textDecoration: "none" }}>
            <img src={safeSrc(bannerImage)} alt={bannerTitle} onError={onImgError} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 30, left: 30 }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, fontWeight: 700, color: "#222", margin: "0 0 10px" }}>{bannerTitle}</h3>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: TOKENS.primaryColor, textDecoration: "underline" }}>{bannerButtonText}</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. NEWSLETTER / SUBSCRIBE SECTION
   Dark background with title, description, and email form
   ═══════════════════════════════════════════════════════════════ */

interface NewsletterProps {
  title?: string;
  description?: string;
  backgroundImage?: string;
  buttonText?: string;
}

export function LandingGadgetNewsletter({
  title = "Subscribe us.",
  description = "A client that's unhappy for a reason is a problem, a client that's unhappy though he or her can't quite put a finger on it is worse. That's not so bad, there's dummy copy.",
  backgroundImage = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-subscribe-bg-opt.jpg",
  buttonText = "Subscribe",
}: NewsletterProps) {
  const { storeSlug } = useGadgetCtx();
  const { email, setEmail, loading, success, error, handleSubmit } = useNewsletterSubscribe(storeSlug);

  return (
    <section style={{
      backgroundImage: `url(${safeSrc(backgroundImage)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: `${TOKENS.borderWidth} solid ${TOKENS.borderColor}`,
      borderTop: "none",
      padding: "60px 0",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 30px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1.23, color: "#fff", margin: "0 0 16px" }}>
          {title}
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.625, color: "rgba(255,255,255,0.7)", marginBottom: 30 }}>
          {description}
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto" }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            style={{
              flex: 1,
              padding: "14px 18px",
              border: "none",
              borderRadius: "4px 0 0 4px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              backgroundColor: TOKENS.primaryColor,
              color: "#fff",
              border: "none",
              borderRadius: "0 4px 4px 0",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "..." : buttonText}
          </button>
        </form>
        {success && <p style={{ color: "#4caf50", marginTop: 10, fontSize: 14 }}>Subscribed!</p>}
        {error && <p style={{ color: "#ff5252", marginTop: 10, fontSize: 14 }}>{error}</p>}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. FOOTER
   Logo + nav links + copyright + social icons
   ═══════════════════════════════════════════════════════════════ */

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  logo?: string;
  links?: FooterLink[];
  copyright?: string;
  brandName?: string;
  socialLinks?: { platform: string; url: string }[];
}

export function LandingGadgetFooter({
  logo = "https://woodmart.xtemos.com/wp-content/uploads/2018/08/wood-logo-dark.svg",
  links = [
    { label: "Privacy Policy", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Term & Conditions", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Latest News", href: "#" },
    { label: "Our Sitemap", href: "#" },
  ],
  copyright = "2024 PREMIUM E-COMMERCE SOLUTIONS.",
  brandName = "STORE",
  socialLinks = [],
}: FooterProps) {
  const { storeSlug } = useGadgetCtx();
  return (
    <footer style={{ backgroundColor: "#1a1a1a", padding: "50px 0 30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 30px", textAlign: "center" }}>
        {logo && <img src={safeSrc(logo)} alt="Logo" onError={onImgError} style={{ height: 30, marginBottom: 24 }} />}
        <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginBottom: 24 }}>
          {links.map((l, i) => (
            <Link key={i} href={resolveStoreLink(l.href, storeSlug)} style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>
          <strong style={{ color: "rgba(255,255,255,0.7)" }}>{brandName}</strong> {copyright}
        </p>
        {socialLinks.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, textDecoration: "none" }}>
                {s.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. FULL-WIDTH IMAGE BANNER
   Single full-width image section
   ═══════════════════════════════════════════════════════════════ */

interface FullWidthImageProps {
  image?: string;
  alt?: string;
}

export function LandingGadgetFullWidthImage({
  image = "https://woodmart.xtemos.com/wp-content/uploads/2018/11/landing-pixel-sequrity-opt-1.jpg",
  alt = "Full width banner",
}: FullWidthImageProps) {
  return (
    <section style={{ width: "100%", lineHeight: 0 }}>
      <img src={safeSrc(image)} alt={alt} onError={onImgError} style={{ width: "100%", height: "auto" }} />
    </section>
  );
}
