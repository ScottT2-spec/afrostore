"use client";
import { ArrowRight, ChevronDown, ChevronUp, Loader2, GripVertical, Share2, icons as lucideIcons } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { Award, CheckCircle2, Clock, CreditCard, Eye, Globe, Headphones, Heart, Lock, Mail, MapPin, MessageCircle, Package, Palette, Phone, Play, RefreshCw, Rocket, Send, Shield, ShoppingBag, ShoppingCart, Sparkles, Star, Target, ThumbsUp, TrendingUp, Truck, Users, Zap, Facebook, Twitter, Instagram, Linkedin, Youtube } from "@/components/icons/FilledIcons";

import { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import { useDraggable, useDroppable, DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { getSectionStyle, resolveOpacity } from "@/components/storefront/block-style";
import { ALL_TEMPLATE_BLOCKS, TemplateBlockErrorBoundary } from "@/components/storefront/TemplateBlockRenderer";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { normalizeStorefrontTemplateProps, toDisplayText } from "@/components/storefront/prop-normalizers";
import { trackEvent } from "@/lib/storefront-analytics";
import {
  FashionFontLoader as FashionFontLoaderDirect,
  FashionStoreContext,
  type FashionStoreContextData,
} from "@/components/storefront/FashionTemplateBlocks";
import { ElectronicsFontLoader, ElectronicsStoreContext, type ElectronicsStoreContextData } from "@/components/storefront/ElectronicsTemplateBlocks";
import { BakeryFontLoader } from "@/components/storefront/BakeryTemplateBlocks";
import { CosmeticsFontLoader } from "@/components/storefront/CosmeticsTemplateBlocks";
import { GroceryFontLoader } from "@/components/storefront/GroceryTemplateBlocks";
import { HealthFontLoader } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorFontLoader, InteriorStoreContext, type InteriorStoreContextData } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { AccessoriesFontLoader, AccessoriesStoreContext, type AccessoriesStoreContextData } from "@/components/storefront/AccessoriesTemplateBlocks";
import { KidsFontLoader } from "@/components/storefront/KidsTemplateBlocks";
import { ToysFontLoader } from "@/components/storefront/ToysTemplateBlocks";
import { LandingGadgetFontLoader } from "@/components/storefront/LandingGadgetBlocks";
import { MakeupFontLoader } from "@/components/storefront/MakeupTemplateBlocks";
import { PerfumesFontLoader } from "@/components/storefront/PerfumesTemplateBlocks";
import { AiFontLoader } from "@/components/storefront/AiTemplateBlocks";

const loggedMissingBlockKeys = new Set<string>();

function getTemplateFontLoader(type: string): React.ComponentType {
  if (type.startsWith("ai")) return AiFontLoader;
  if (type.startsWith("electronics")) return ElectronicsFontLoader;
  if (type.startsWith("bakery")) return BakeryFontLoader;
  if (type.startsWith("cosmetics")) return CosmeticsFontLoader;
  if (type.startsWith("grocery")) return GroceryFontLoader;
  if (type.startsWith("health")) return HealthFontLoader;
  if (type.startsWith("accessories")) return AccessoriesFontLoader;
  if (type.startsWith("interior")) return InteriorFontLoader;
  if (type.startsWith("kids")) return KidsFontLoader;
  if (type.startsWith("toys")) return ToysFontLoader;
  if (type.startsWith("gadget")) return LandingGadgetFontLoader;
  if (type.startsWith("makeup")) return MakeupFontLoader;
  if (type.startsWith("perfumes")) return PerfumesFontLoader;
  return FashionFontLoaderDirect;
}

function getBlockListKey(block: BuilderBlock | undefined, index: number, scope: string): string {
  if (block?.id) return block.id;
  const fallbackKey = `${scope}-${index}`;
  if (!loggedMissingBlockKeys.has(fallbackKey)) {
    loggedMissingBlockKeys.add(fallbackKey);
    console.warn(`[BlockRenderer] Missing block id for ${scope}[${index}]; using fallback key "${fallbackKey}"`);
  }
  return fallbackKey;
}

/* ─── TYPES ─────────────────────────────────────────────────── */

export interface BuilderBlock {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  styleOverrides?: Record<string, unknown>;
  elements?: BuilderBlock[];
}

/* ─── ANIMATION HOOK ────────────────────────────────────────── */

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimateIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const roundedClasses: Record<string, string> = {
  none: "rounded-none",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};
/* ─── ICON MAP ──────────────────────────────────────────────── */

const iconMap: Record<string, React.ElementType> = {
  truck: Truck, shield: Shield, headphones: Headphones, refresh: RefreshCw,
  phone: Phone, mail: Mail, "map-pin": MapPin, clock: Clock, zap: Zap,
  heart: Heart, award: Award, users: Users, globe: Globe,
  "trending-up": TrendingUp, package: Package, "credit-card": CreditCard,
  check: CheckCircle2, sparkles: Sparkles, "shopping-bag": ShoppingBag,
  eye: Eye, "thumbs-up": ThumbsUp, target: Target, palette: Palette,
  rocket: Rocket, lock: Lock, star: Star, send: Send, play: Play,
  message: MessageCircle,
};

/* ═══════════════════════════════════════════════════════════════
   BLOCK RENDERERS
   ═══════════════════════════════════════════════════════════════ */

/* ── Heading ─────────────────────────────────────────────────── */
function HeadingBlock({ props }: { props: Record<string, unknown> }) {
  const level = (props.level as string) || "h2";
  const sizeMap: Record<string, string> = { xl: "text-xl", "2xl": "text-2xl sm:text-3xl", "3xl": "text-3xl sm:text-4xl", "4xl": "text-4xl sm:text-5xl" };
  const cls = `font-display font-extrabold tracking-tight ${sizeMap[(props.fontSize as string) || "2xl"] || "text-2xl sm:text-3xl"}`;
  const style = { color: (props.color as string) || "#171717", textAlign: (props.align as string) || "left" } as React.CSSProperties;
  const text = (props.text as string) || "Heading";
  if (level === "h1") return <AnimateIn><h1 className={cls} style={style}>{text}</h1></AnimateIn>;
  if (level === "h3") return <AnimateIn><h3 className={cls} style={style}>{text}</h3></AnimateIn>;
  if (level === "h4") return <AnimateIn><h4 className={cls} style={style}>{text}</h4></AnimateIn>;
  return <AnimateIn><h2 className={cls} style={style}>{text}</h2></AnimateIn>;
}

/* ── Text ────────────────────────────────────────────────────── */
function TextBlock({ props }: { props: Record<string, unknown> }) {
  const text = (props.text as string) || (props.content as string) || "";
  const paragraphs = text.split(/\n\n+/);
  const dropCap = props.dropCap as boolean;
  return (
    <AnimateIn>
      <div
        className="leading-relaxed space-y-4 max-w-3xl mx-auto"
        style={{
          color: (props.color as string) || "#525252",
          textAlign: (props.align as React.CSSProperties["textAlign"]) || "left",
          fontSize: { sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem" }[(props.fontSize as string) || "base"] || "1rem",
        }}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 && dropCap ? "first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:leading-none" : ""}>
            {p}
          </p>
        ))}
      </div>
    </AnimateIn>
  );
}

/* ── Image ───────────────────────────────────────────────────── */
function ImageBlock({ props }: { props: Record<string, unknown> }) {
  const src = props.src as string;
  if (!src) return null;
  const img = (
    <img
      src={src}
      alt={(props.alt as string) || ""}
      className={`w-full object-cover shadow-lg ${roundedClasses[(props.rounded as string) || "2xl"] || roundedClasses["2xl"]}`}
    />
  );
  const link = props.link as string;
  return (
    <AnimateIn>
      {link ? (
        <a href={link} target={props.openInNewTab ? "_blank" : undefined} rel={props.openInNewTab ? "noopener noreferrer" : undefined}>
          {img}
        </a>
      ) : img}
    </AnimateIn>
  );
}

/* ── Button ──────────────────────────────────────────────────── */
function ButtonBlock({ props }: { props: Record<string, unknown> }) {
  const variant = (props.variant as string) || "primary";
  const size = (props.size as string) || "md";
  const variantStyles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5",
    secondary: "bg-surface-100 text-surface-900 hover:bg-surface-200 border border-surface-200",
    accent: "bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/25",
    outline: "border-2 border-surface-900 text-surface-900 hover:bg-surface-900 hover:text-white",
  };
  const sizeStyles: Record<string, string> = { sm: "text-sm py-2.5 px-5", md: "text-sm py-3 px-7", lg: "text-base py-4 px-9" };
  return (
    <AnimateIn>
      <div style={{ textAlign: (props.align as React.CSSProperties["textAlign"]) || "left" }}>
        <a
          href={(props.href as string) || (props.link as string) || "#"}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md}`}
        >
          {(props.text as string) || "Button"}
          {variant === "primary" && <ArrowRight className="h-4 w-4" />}
        </a>
      </div>
    </AnimateIn>
  );
}

/* ── Hero ────────────────────────────────────────────────────── */
function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const bgStyle = (props.bgStyle as string) || "gradient";
  const bgColor = (props.bgColor as string) || "#1B2B4B";
  const textColor = (props.textColor as string) || "#fff";
  const layout = (props.layout as string) || "center";
  const imageSrc = (props.image as string) || (props.bgImage as string) || "";
  const storeSlug = useContext(StoreSlugContext);

  // Resolve broken/placeholder hrefs — "#", "#shop", "/store/slug#shop" → actual shop page
  function resolveHref(raw: string | undefined): string {
    if (!raw || raw === "#") return storeSlug ? `/store/${storeSlug}/shop` : "#";
    if (raw === "#shop" || raw.endsWith("#shop")) return storeSlug ? `/store/${storeSlug}/shop` : raw;
    return raw;
  }

  const bgClasses: Record<string, string> = {
    gradient: "bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800",
    dark: "bg-gradient-to-br from-surface-950 via-surface-900 to-surface-800",
    accent: "bg-gradient-to-br from-accent-600 via-accent-500 to-accent-400",
    light: "bg-gradient-to-br from-surface-50 to-white",
  };

  const isLight = bgStyle === "light";
  const sectionStyle = getSectionStyle(props);
  const hasImageBackground = Boolean(props.bgImage);
  const overlayColor = (props.overlayColor as string) || "#000000";
  const overlayOpacity = resolveOpacity(props.overlayOpacity, 0.35);
  const textStyle = { color: textColor } as React.CSSProperties;

  if (layout === "split") {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 ${bgClasses[bgStyle] || ""}`}
        style={{
          ...(bgClasses[bgStyle] ? {} : { backgroundColor: bgColor, color: textColor }),
          ...sectionStyle,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-24 -right-24 h-80 w-80 rounded-full ${isLight ? "bg-brand-100/30" : "bg-white/5"} blur-3xl`} />
          <div className={`absolute -bottom-24 -left-24 h-80 w-80 rounded-full ${isLight ? "bg-accent-100/25" : "bg-accent-500/10"} blur-3xl`} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          {hasImageBackground && <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />}
        </div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div className="max-w-xl text-left" style={textStyle}>
            {(props.badge as string) && (
              <AnimateIn>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  {props.badge as string}
                </span>
              </AnimateIn>
            )}
            <AnimateIn delay={0.1}>
              <h1 className="mb-4 text-4xl font-display font-extrabold tracking-tight text-[#242424] sm:text-5xl lg:text-[4.5rem] lg:leading-[1.02] whitespace-pre-line">
                {(props.heading as string) || "Hero Heading"}
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <p className="mb-8 max-w-xl text-base leading-7 text-[#767676] sm:text-lg">
                {(props.subheading as string) || "Subheading text"}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.3}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={resolveHref(props.buttonHref as string)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700"
                  style={{
                    backgroundColor: (props.buttonColor as string) || undefined,
                    color: (props.buttonTextColor as string) || undefined,
                  }}
                >
                  {props.buttonText as string}
                </a>
                {(props.secondaryButtonText as string) && (
                  <a
                    href={(props.secondaryButtonHref as string) || "#"}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-surface-300 bg-white/80 px-8 py-3.5 text-sm font-semibold text-[#242424] backdrop-blur transition-all hover:border-surface-400 hover:bg-white"
                  >
                    {props.secondaryButtonText as string}
                  </a>
                )}
              </div>
            </AnimateIn>
          </div>

          <AnimateIn delay={0.15}>
            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-black/5 via-transparent to-black/10 blur-3xl" />
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={(props.imageAlt as string) || ""}
                  className="relative z-10 mx-auto w-full max-w-[620px] object-contain drop-shadow-[0_26px_55px_rgba(0,0,0,0.18)]"
                />
              ) : null}
            </div>
          </AnimateIn>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl px-8 sm:px-12 py-16 sm:py-24 ${bgClasses[bgStyle] || ""}`}
      style={{
        ...(bgClasses[bgStyle] ? {} : { backgroundColor: bgColor, color: textColor }),
        ...sectionStyle,
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!hasImageBackground && (
          <>
            <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full ${isLight ? "bg-brand-100/40" : "bg-white/5"} blur-3xl`} />
            <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full ${isLight ? "bg-accent-100/40" : "bg-accent-500/10"} blur-3xl`} />
          </>
        )}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        {hasImageBackground && (
          <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
        )}
      </div>

      <div className="relative max-w-3xl mx-auto" style={{ textAlign: (props.align as React.CSSProperties["textAlign"]) || "center", ...textStyle }}>
        {(props.badge as string) && (
          <AnimateIn>
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 ${isLight ? "bg-brand-100 text-brand-700" : "bg-white/10 text-white/80 border border-white/20"}`}>
              <Sparkles className="h-3 w-3" />
              {props.badge as string}
            </span>
          </AnimateIn>
        )}
          <AnimateIn delay={0.1}>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight mb-4 sm:mb-6`} style={textStyle}>
            {(props.heading as string) || "Hero Heading"}
          </h1>
        </AnimateIn>
        <AnimateIn delay={0.2}>
          <p className="text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={textStyle}>
            {(props.subheading as string) || "Subheading text"}
          </p>
        </AnimateIn>
        {(props.buttonText as string) && (
          <AnimateIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={resolveHref(props.buttonHref as string)}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold py-3.5 px-8 transition-all duration-300 hover:-translate-y-0.5 ${
                  isLight
                    ? "bg-brand-600 text-white shadow-xl shadow-brand-600/25 hover:bg-brand-700"
                    : "bg-white text-surface-900 shadow-xl shadow-black/20 hover:bg-surface-50"
                }`}
                style={{
                  backgroundColor: (props.buttonColor as string) || undefined,
                  color: (props.buttonTextColor as string) || undefined,
                }}
              >
                {props.buttonText as string}
                <ArrowRight className="h-4 w-4" />
              </a>
              {(props.secondaryButtonText as string) && (
                <a
                  href={(props.secondaryButtonHref as string) || "#"}
                  className={`inline-flex items-center gap-2 rounded-2xl font-semibold py-3.5 px-8 transition-all ${
                    isLight
                      ? "border border-surface-200 text-surface-700 hover:bg-surface-50"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {props.secondaryButtonText as string}
                </a>
              )}
            </div>
          </AnimateIn>
        )}
      </div>
    </div>
  );
}

/* ── Spacer ──────────────────────────────────────────────────── */
function SpacerBlock({ props }: { props: Record<string, unknown> }) {
  return <div style={{ height: `${(props.height as number) || 40}px` }} />;
}

/* ── Divider ─────────────────────────────────────────────────── */
function DividerBlock({ props }: { props: Record<string, unknown> }) {
  const style = (props.style as string) || "solid";
  if (style === "wave") {
    return (
      <div className="py-4">
        <svg viewBox="0 0 1200 40" className="w-full h-6 text-surface-200" preserveAspectRatio="none">
          <path d="M0 20 Q150 0 300 20 Q450 40 600 20 Q750 0 900 20 Q1050 40 1200 20" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    );
  }
  if (style === "dots") {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        {[0, 1, 2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-surface-300" />)}
      </div>
    );
  }
  return <hr style={{ borderColor: (props.color as string) || "#e5e5e5", borderWidth: `${(props.thickness as number) || 1}px`, borderStyle: style }} />;
}

/* ── Columns ─────────────────────────────────────────────────── */
function ColumnsBlock({ props }: { props: Record<string, unknown> }) {
  const children = (props.children as BuilderBlock[]) || [];
  const cols = (props.columns as number) || 2;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cols, 4)} gap-6`}>
      {children.map((child) => <div key={child.id}><PublicBlockRenderer block={child} /></div>)}
    </div>
  );
}

/* ── Product Grid ────────────────────────────────────────────── */

function formatBlockCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const PRODUCT_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-amber-600 to-yellow-600",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-red-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-purple-400 to-violet-500",
];

function getProductGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PRODUCT_GRADIENTS[Math.abs(hash) % PRODUCT_GRADIENTS.length];
}

function ProductGridBlock({ props }: { props: Record<string, unknown> }) {
  const limit = (props.limit as number) || 6;
  const cols = (props.columns as number) || 3;
  const categoryFilter = toDisplayText(props.category, "");
  const { products, currency, slug, addToCart, isWishlisted, toggleWishlist, addedToCart } = useContext(StoreContext);

  // Filter products by category if specified, then limit
  let displayProducts = products;
  if (categoryFilter) {
    displayProducts = products.filter(
      (p) => p.category?.name?.toLowerCase() === categoryFilter.toLowerCase() || p.category?.slug === categoryFilter
    );
  }
  // If "featured" filter or showFeatured prop, prioritise featured
  if (props.filter === "featured" || props.showFeatured) {
    const featured = displayProducts.filter((p) => p.isFeatured);
    if (featured.length > 0) displayProducts = featured;
  }
  displayProducts = displayProducts.slice(0, limit);

  // Fallback: if no real products, show skeletons
  const hasRealProducts = displayProducts.length > 0;

  return (
    <AnimateIn>
      <div>
        {(props.title as string) && (
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900">{props.title as string}</h3>
            {(props.subtitle as string) && <p className="text-surface-500 mt-2">{props.subtitle as string}</p>}
          </div>
        )}
        <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(cols, 4)} gap-4 sm:gap-6`}>
          {hasRealProducts
            ? displayProducts.map((product) => {
                const hasImage = product.images.length > 0 && product.images[0].url;
                const discount = product.compareAtPrice
                  ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                  : 0;
                const productUrl = slug ? `/store/${slug}/product/${product.slug}` : "#";
                const wishlisted = isWishlisted ? isWishlisted(product.id) : false;
                const justAdded = addedToCart === product.id;
                return (
                  <div key={product.id} className="group">
                    <a href={productUrl} className="block">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                        {hasImage ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${getProductGradient(product.id)} transition-transform duration-500 group-hover:scale-110 flex items-center justify-center`}>
                            <ShoppingBag className="h-10 w-10 text-white/40" />
                          </div>
                        )}
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-brand-600">Featured</div>
                        )}
                        {!product.inStock && (
                          <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-red-500">Sold Out</div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white z-10">-{discount}%</div>
                        )}
                        {/* Always-visible wishlist + cart icons */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          {toggleWishlist && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                              className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-sm ${wishlisted ? "ring-1 ring-red-200" : ""}`}
                            >
                              <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-surface-500"}`} />
                            </button>
                          )}
                          {addToCart && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                              disabled={!product.inStock}
                              className={`h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm disabled:opacity-40 ${
                                justAdded ? "bg-green-500 text-white" : "bg-white/90 text-surface-500 hover:bg-white"
                              }`}
                            >
                              {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    </a>
                    <a href={productUrl}>
                      <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                    </a>
                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-surface-400">({product.reviewCount})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-bold text-surface-900">{formatBlockCurrency(Number(product.price), currency)}</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-surface-400 line-through">{formatBlockCurrency(Number(product.compareAtPrice), currency)}</span>
                      )}
                    </div>
                  </div>
                );
              })
            : Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="group rounded-2xl border border-surface-100 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-surface-100 via-surface-50 to-brand-50/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-surface-300" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-3 bg-surface-100 rounded-full w-3/4 mb-2" />
                    <div className="h-3 bg-surface-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Testimonial (single) ────────────────────────────────────── */
function TestimonialBlock({ props }: { props: Record<string, unknown> }) {
  const rating = (props.rating as number) || 5;
  return (
    <AnimateIn>
      <div className="rounded-2xl border border-surface-100 bg-white p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300">
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-surface-200"}`} />
          ))}
        </div>
        <p className="text-surface-700 mb-5 leading-relaxed italic">
          &ldquo;{(props.text as string) || "Great product!"}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
            {((props.name as string) || "C").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900">{(props.name as string) || "Customer"}</p>
            <p className="text-xs text-surface-500">{(props.role as string) || "Buyer"}</p>
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Testimonials Grid (multiple) — with live approved reviews + marquee ── */
function TestimonialCard({ item, isDark }: { item: { name: string; text: string; role?: string; rating?: number }; isDark: boolean }) {
  return (
    <div className={`flex-shrink-0 w-[320px] sm:w-[360px] rounded-2xl p-6 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-surface-100 shadow-sm hover:shadow-lg"} transition-shadow duration-300`}>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} className={`h-4 w-4 ${j < (item.rating || 5) ? "text-amber-400 fill-amber-400" : "text-surface-200"}`} />
        ))}
      </div>
      <p className={`text-sm leading-relaxed mb-4 line-clamp-4 ${isDark ? "text-white/70" : "text-surface-600"}`}>
        &ldquo;{item.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {item.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-surface-900"}`}>{item.name}</p>
          <p className={`text-xs truncate ${isDark ? "text-white/50" : "text-surface-400"}`}>{item.role || "Customer"}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsBlock({ props }: { props: Record<string, unknown> }) {
  const hardcodedItems = useMemo(
    () => (props.items as Array<{ name: string; text: string; role?: string; rating?: number }>) || [],
    [props.items],
  );
  const bg = (props.bgColor as string) || "transparent";
  const isDark = bg === "dark";
  const storeSlug = useContext(StoreSlugContext);
  const [approvedItems, setApprovedItems] = useState<Array<{ name: string; text: string; role?: string; rating?: number }>>([]);
  const allItems = useMemo(() => [...approvedItems, ...hardcodedItems], [approvedItems, hardcodedItems]);
  useEffect(() => {
    setApprovedItems([]);
  }, [storeSlug]);
  // Fetch approved reviews and merge with hardcoded items
  useEffect(() => {
    if (!storeSlug) return;
    let cancelled = false;

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/storefront/${storeSlug}/reviews?limit=30`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;

        if (json.success && json.data?.items && json.data.items.length > 0) {
          const reviewCards = json.data.items
            .filter((r: { body?: string; title?: string }) => r.body || r.title)
            .map((r: { name: string; body?: string; title?: string; rating: number; isVerified: boolean }) => ({
              name: r.name,
              text: r.body || r.title || "Great product!",
              role: r.isVerified ? "Verified Buyer" : "Customer",
              rating: r.rating,
            }));

          if (reviewCards.length > 0) {
            // Approved reviews first, then hardcoded ones
            setApprovedItems(reviewCards);
          }
        }
      } catch {
        // Keep hardcoded items on error
      }
    }

    fetchReviews();
    return () => { cancelled = true; };
  }, [storeSlug]);

  const bgStyle = bg === "surface" ? "#FAFAFA" : isDark ? "#0F172A" : "transparent";

  return (
    <div
      className="rounded-3xl py-12 overflow-hidden"
      style={{ backgroundColor: bgStyle }}
      
    >
      <AnimateIn>
        {(props.title as string) && (
          <div className="text-center mb-10 px-6 sm:px-10">
            <h3 className={`text-2xl sm:text-3xl font-display font-extrabold ${isDark ? "text-white" : "text-surface-900"}`}>
              {props.title as string}
            </h3>
            {(props.subtitle as string) && (
              <p className={`mt-2 ${isDark ? "text-white/60" : "text-surface-500"}`}>{props.subtitle as string}</p>
            )}
          </div>
        )}
      </AnimateIn>

      {/* Scrolling marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10 bg-gradient-to-r ${isDark ? "from-[#0F172A]" : bg === "surface" ? "from-[#FAFAFA]" : "from-white"} to-transparent`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10 bg-gradient-to-l ${isDark ? "from-[#0F172A]" : bg === "surface" ? "from-[#FAFAFA]" : "from-white"} to-transparent`} />

        <div
          className="marquee-track"
          data-direction="left"
          style={{ "--marquee-duration": "25s" } as React.CSSProperties}
        >
          {allItems.map((item, index) => (
            <TestimonialCard key={`a-${index}`} item={item} isDark={isDark} />
          ))}
          {/* Duplicate for seamless loop */}
          {allItems.map((item, index) => (
            <TestimonialCard key={`b-${index}`} item={item} isDark={isDark} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Features Grid ───────────────────────────────────────────── */
function FeaturesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; title: string; desc: string }>) || [];
  const cols = items.length <= 3 ? 3 : 4;
  const bg = (props.bgColor as string) || "transparent";
  const isDark = bg === "dark";
  return (
    <div className="rounded-3xl py-10 px-6 sm:px-10" style={{ backgroundColor: bg === "surface" ? "#FAFAFA" : isDark ? "#0F172A" : "transparent" }}>
      {(props.title as string) && (
        <AnimateIn>
          <div className="text-center mb-10">
            <h3 className={`text-2xl sm:text-3xl font-display font-extrabold ${isDark ? "text-white" : "text-surface-900"}`}>
              {props.title as string}
            </h3>
            {(props.subtitle as string) && (
              <p className={`mt-2 text-base ${isDark ? "text-white/60" : "text-surface-500"}`}>{props.subtitle as string}</p>
            )}
          </div>
        </AnimateIn>
      )}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-5`}>
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <AnimateIn key={i} delay={i * 0.08}>
              <div className={`text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                isDark ? "bg-white/5 border border-white/10 hover:bg-white/10" : "bg-white border border-surface-100 shadow-sm hover:shadow-lg"
              }`}>
                <div className={`h-12 w-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-brand-500/20" : "bg-brand-50"}`}>
                  <Icon className={`h-6 w-6 ${isDark ? "text-brand-400" : "text-brand-600"}`} />
                </div>
                <h4 className={`text-sm font-bold mb-1.5 ${isDark ? "text-white" : "text-surface-900"}`}>{item.title}</h4>
                <p className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-surface-500"}`}>{item.desc}</p>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </div>
  );
}

/* ── FAQ Accordion ───────────────────────────────────────────── */
function FAQBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ question: string; answer: string }>) || [];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <AnimateIn>
      <div className="max-w-3xl mx-auto">
        {(props.title as string) && (
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900">{props.title as string}</h3>
            {(props.subtitle as string) && <p className="text-surface-500 mt-2">{props.subtitle as string}</p>}
          </div>
        )}
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`rounded-2xl border overflow-hidden transition-colors ${isOpen ? "border-brand-200 bg-brand-50/30" : "border-surface-200 bg-white hover:border-surface-300"}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-bold text-surface-900 pr-4">{item.question}</span>
                  <div className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${isOpen ? "bg-brand-600 text-white" : "bg-surface-100 text-surface-500"}`}>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "500px" : "0", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-5 pb-5 text-sm text-surface-600 leading-relaxed">{item.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Contact Form ────────────────────────────────────────────── */
function ContactFormBlock({ props }: { props: Record<string, unknown> }) {
  const storeSlug = useContext(StoreSlugContext);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) { setSubmitted(true); return; } // fallback for preview
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/storefront/${storeSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        trackEvent(storeSlug, "lead", { metadata: { source: "contact_form" } });
      } else {
        setError(json.error || "Failed to send. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSending(false);
  };

  const inputCls = "w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow";

  return (
    <AnimateIn>
      <div className="max-w-xl mx-auto rounded-2xl border border-surface-200 bg-white p-6 sm:p-8 shadow-sm">
        {(props.title as string) && <h3 className="text-xl font-display font-bold text-surface-900 mb-1">{props.title as string}</h3>}
        {(props.subtitle as string) && <p className="text-sm text-surface-500 mb-6">{props.subtitle as string}</p>}
        {submitted ? (
          <div className="text-center py-10">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-surface-900 mb-1">Message sent!</h4>
            <p className="text-sm text-surface-500">We&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className={inputCls} placeholder="Your name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <input className={inputCls} placeholder="Your email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <input className={inputCls} placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            <textarea className={`${inputCls} resize-none`} placeholder="Your message" rows={4} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-brand-600 text-white font-bold py-3.5 hover:bg-brand-700 transition-all duration-300 shadow-lg shadow-brand-600/25 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending..." : (props.buttonText as string) || "Send Message"}
            </button>
          </form>
        )}
      </div>
    </AnimateIn>
  );
}

/* ── Contact Info ────────────────────────────────────────────── */
function getContactHref(icon: string, value: string, whatsappMessage?: string): string | null {
  const v = value.trim();
  if (icon === "mail" || v.includes("@")) return `mailto:${v}`;
  if (icon === "phone" || icon === "tel") {
    const num = v.replace(/[^0-9+]/g, "");
    return num ? `tel:${num}` : null;
  }
  if (icon === "message" || icon === "whatsapp") {
    const num = v.replace(/[^0-9+]/g, "");
    if (!num) return null;
    const base = `https://wa.me/${num.replace("+", "")}`;
    return whatsappMessage ? `${base}?text=${encodeURIComponent(whatsappMessage)}` : base;
  }
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return null;
}

function ContactInfoBlock({ props }: { props: Record<string, unknown> }) {
  const storeSlug = useContext(StoreSlugContext);
  const items = (props.items as Array<{ icon: string; title: string; value: string; href?: string; whatsappMessage?: string }>) || [];
  const hours = props.hours as string;
  return (
    <AnimateIn>
      <div className="max-w-2xl mx-auto">
        {(props.title as string) && (
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-extrabold text-surface-900">{props.title as string}</h3>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || Mail;
            const isWhatsapp = item.icon === "message" || item.icon === "whatsapp";
            const href = item.href || getContactHref(item.icon, item.value, isWhatsapp ? item.whatsappMessage : undefined);
            const content = (
              <>
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{item.title}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${href ? "text-brand-700 underline decoration-brand-200" : "text-surface-900"}`}>{item.value}</p>
                </div>
              </>
            );
            return href ? (
              <a key={i} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={() => { if (isWhatsapp && storeSlug) trackEvent(storeSlug, "whatsapp_click"); }}
                className="flex items-start gap-4 rounded-2xl border border-surface-100 bg-white p-5 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer">
                {content}
              </a>
            ) : (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-surface-100 bg-white p-5 hover:shadow-md transition-shadow">
                {content}
              </div>
            );
          })}
        </div>
        {hours && (
          <div className="mt-4 rounded-2xl bg-surface-50 border border-surface-100 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-surface-500" />
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Business Hours</p>
            </div>
            <p className="text-sm text-surface-700">{hours}</p>
          </div>
        )}
      </div>
    </AnimateIn>
  );
}

/* ── Stats / Counters ────────────────────────────────────────── */
function StatsBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ value: string; label: string; icon?: string }>) || [];
  const bg = (props.bgColor as string) || "brand";
  const isDark = bg === "brand" || bg === "dark";
  return (
    <div className={`rounded-3xl py-12 px-6 sm:px-10 ${
      bg === "brand" ? "bg-gradient-to-br from-brand-700 to-brand-900" :
      bg === "dark" ? "bg-gradient-to-br from-surface-900 to-surface-950" :
      "bg-surface-50"
    }`}>
      {(props.title as string) && (
        <AnimateIn>
          <h3 className={`text-2xl sm:text-3xl font-display font-extrabold text-center mb-10 ${isDark ? "text-white" : "text-surface-900"}`}>
            {props.title as string}
          </h3>
        </AnimateIn>
      )}
      <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(items.length, 4)} gap-6`}>
        {items.map((item, i) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          return (
            <AnimateIn key={i} delay={i * 0.1}>
              <div className="text-center">
                {Icon && <Icon className={`h-6 w-6 mx-auto mb-2 ${isDark ? "text-accent-400" : "text-brand-600"}`} />}
                <div className={`text-3xl sm:text-4xl font-display font-extrabold ${isDark ? "text-white" : "text-surface-900"}`}>
                  {item.value}
                </div>
                <div className={`text-xs sm:text-sm mt-1 ${isDark ? "text-white/60" : "text-surface-500"}`}>{item.label}</div>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </div>
  );
}

/* ── Newsletter ──────────────────────────────────────────────── */
function NewsletterBlock({ props }: { props: Record<string, unknown> }) {
  const storeSlug = useContext(StoreSlugContext);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const bg = (props.bgColor as string) || "surface";
  const isDark = bg === "dark" || bg === "brand";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) { setSubmitted(true); return; } // fallback for preview
    setSending(true);
    setFormError("");
    try {
      const res = await fetch(`/api/storefront/${storeSlug}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        trackEvent(storeSlug, "lead", { metadata: { source: "newsletter" } });
      } else {
        setFormError(json.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    }
    setSending(false);
  };

  return (
    <AnimateIn>
      <div className={`rounded-3xl py-12 px-6 sm:px-10 text-center ${
        bg === "brand" ? "bg-gradient-to-br from-brand-600 to-brand-800" :
        bg === "dark" ? "bg-gradient-to-br from-surface-900 to-surface-950" :
        "bg-surface-50 border border-surface-100"
      }`}>
        <h3 className={`text-xl sm:text-2xl font-display font-extrabold mb-2 ${isDark ? "text-white" : "text-surface-900"}`}>
          {(props.title as string) || "Stay Updated"}
        </h3>
        <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? "text-white/60" : "text-surface-500"}`}>
          {(props.subtitle as string) || "Get the latest updates and offers."}
        </p>
        {submitted ? (
          <div className={`flex items-center justify-center gap-2 text-sm font-semibold ${isDark ? "text-accent-400" : "text-brand-600"}`}>
            <CheckCircle2 className="h-5 w-5" /> You&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" disabled={sending} className={`rounded-xl font-bold py-3 px-6 text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 ${
              isDark ? "bg-white text-surface-900 shadow-lg" : "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
            }`}>
              {sending ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {formError && (
          <p className={`mt-3 text-xs font-medium ${isDark ? "text-red-300" : "text-red-600"}`}>{formError}</p>
        )}
      </div>
    </AnimateIn>
  );
}

/* ── Video ───────────────────────────────────────────────────── */
function VideoBlock({ props }: { props: Record<string, unknown> }) {
  const url = (props.url as string) || (props.src as string);
  const [playing, setPlaying] = useState(false);
  const embedUrl = useMemo(() => {
    if (!url) return "";
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1`;
    return url;
  }, [url]);

  if (!embedUrl) return null;

  return (
    <AnimateIn>
      <div className="max-w-4xl mx-auto">
        {(props.title as string) && (
          <h3 className="text-xl font-display font-bold text-surface-900 mb-4 text-center">{props.title as string}</h3>
        )}
        <div className="aspect-video rounded-2xl overflow-hidden bg-surface-900 relative shadow-2xl">
          {playing ? (
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay" />
          ) : (
            <button onClick={() => setPlaying(true)} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900 group">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                <Play className="h-7 w-7 text-white ml-1" />
              </div>
            </button>
          )}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Countdown ───────────────────────────────────────────────── */
function CountdownBlock({ props }: { props: Record<string, unknown> }) {
  const endDate = (props.endDate as string) || "";
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, min: 0, sec: 0 });
  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), min: Math.floor((diff % 3600000) / 60000), sec: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <AnimateIn>
      <div className="rounded-3xl px-8 py-12 text-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 relative overflow-hidden"
        style={{ backgroundColor: (props.bgColor as string) || undefined, color: (props.textColor as string) || "#fff" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-500/10 blur-3xl" />
        </div>
        <div className="relative">
          <h3 className="text-xl sm:text-2xl font-display font-extrabold mb-6">{(props.title as string) || "Sale Ends In"}</h3>
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {[
              { label: "Days", val: timeLeft.days },
              { label: "Hours", val: timeLeft.hours },
              { label: "Min", val: timeLeft.min },
              { label: "Sec", val: timeLeft.sec },
            ].map(({ label, val }) => (
              <div key={label} className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/10">
                  <div className="text-2xl sm:text-4xl font-display font-extrabold tabular-nums">
                    {String(val).padStart(2, "0")}
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs mt-2 opacity-60 uppercase tracking-wider font-semibold">{label}</div>
              </div>
            ))}
          </div>
          {(props.buttonText as string) && (
            <a href={(props.buttonHref as string) || "#"} className="inline-flex items-center gap-2 mt-8 rounded-2xl bg-white text-surface-900 font-bold py-3 px-8 hover:-translate-y-0.5 transition-all shadow-xl">
              {props.buttonText as string}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Trust Badges ────────────────────────────────────────────── */
function TrustBadgesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; label: string }>) || [];
  return (
    <AnimateIn>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 rounded-2xl bg-surface-50 border border-surface-100 px-4">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div key={i} className="flex items-center gap-2.5 text-surface-600">
              <div className="h-9 w-9 rounded-xl bg-white border border-surface-200 flex items-center justify-center shadow-sm">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <span className="text-xs font-bold">{item.label}</span>
            </div>
          );
        })}
      </div>
    </AnimateIn>
  );
}

/* ── Banner ──────────────────────────────────────────────────── */
function BannerBlock({ props }: { props: Record<string, unknown> }) {
  const bg = (props.bgColor as string) || "brand";
  const sectionStyle = getSectionStyle(props);
  const hasImageBackground = Boolean(props.bgImage);
  const overlayColor = (props.overlayColor as string) || "#000000";
  const overlayOpacity = resolveOpacity(props.overlayOpacity, 0.35);
  const textStyle = { color: (props.textColor as string) || undefined } as React.CSSProperties;
  return (
    <AnimateIn>
      <div className={`rounded-3xl px-8 sm:px-12 py-10 sm:py-14 relative overflow-hidden ${
        bg === "brand" ? "bg-gradient-to-r from-brand-700 to-brand-900" :
        bg === "accent" ? "bg-gradient-to-r from-accent-500 to-accent-700" :
        bg === "dark" ? "bg-gradient-to-r from-surface-900 to-surface-950" :
        "bg-surface-50 border border-surface-200"
      }`} style={sectionStyle}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {!hasImageBackground && <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />}
          {hasImageBackground && (
            <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
          )}
        </div>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold" style={textStyle}>
              {(props.title as string) || "Special Offer"}
            </h3>
            {(props.subtitle as string) && (
              <p className="text-sm mt-1" style={textStyle}>{props.subtitle as string}</p>
            )}
          </div>
          {(props.buttonText as string) && (
            <a href={(props.buttonHref as string) || "#"}
              className={`inline-flex items-center gap-2 rounded-2xl font-bold py-3 px-7 text-sm transition-all hover:-translate-y-0.5 flex-shrink-0 ${
                bg === "light" ? "bg-brand-600 text-white shadow-lg" : "bg-white text-surface-900 shadow-xl"
              }`}
              style={{
                backgroundColor: (props.buttonColor as string) || undefined,
                color: (props.buttonTextColor as string) || undefined,
              }}>
              {props.buttonText as string}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Image + Text ────────────────────────────────────────────── */
function ImageTextBlock({ props }: { props: Record<string, unknown> }) {
  const reverse = (props.reverse as boolean) || false;
  const sectionStyle = getSectionStyle(props);
  const textStyle = { color: (props.textColor as string) || undefined } as React.CSSProperties;
  return (
    <AnimateIn>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center rounded-3xl p-6 sm:p-8`} style={sectionStyle}>
        <div className={reverse ? "md:order-2" : ""}>
          {(props.image as string) ? (
            <img src={props.image as string} alt={(props.imageAlt as string) || ""} className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]" />
          ) : (
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-100 via-surface-100 to-accent-50 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-surface-300" />
            </div>
          )}
        </div>
        <div className={reverse ? "md:order-1" : ""}>
          {(props.badge as string) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3" /> {props.badge as string}
            </span>
          )}
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold mb-4" style={{ color: (props.headingColor as string) || undefined }}>
            {(props.title as string) || "Title"}
          </h3>
          <p className="leading-relaxed mb-6" style={{ ...textStyle, color: (props.bodyColor as string) || (props.textColor as string) || undefined }}>
            {(props.text as string) || "Description text"}
          </p>
          {(props.buttonText as string) && (
            <a
              href={(props.buttonHref as string) || "#"}
              className="inline-flex items-center gap-2 rounded-2xl font-bold py-3 px-7 text-sm transition-all shadow-lg hover:-translate-y-0.5"
              style={{
                backgroundColor: (props.buttonColor as string) || "#0f62fe",
                color: (props.buttonTextColor as string) || "#ffffff",
              }}
            >
              {props.buttonText as string}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Gallery ─────────────────────────────────────────────────── */
function GalleryBlock({ props }: { props: Record<string, unknown> }) {
  const images = (props.images as Array<{ src: string; alt?: string }>) || [];
  if (images.length === 0) return null;
  return (
    <AnimateIn>
      <div>
        {(props.title as string) && (
          <h3 className="text-2xl font-display font-extrabold text-surface-900 mb-6 text-center">{props.title as string}</h3>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
              <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Projects ─────────────────────────────────────────────────── */
function ProjectsBlock({ props }: { props: Record<string, unknown> }) {
  const storeSlug = useContext(StoreSlugContext);
  const items = (props.items as Array<{ id: string; title: string; description: string; image: string; link: string }>) || [];
  const columns = (props.columns as number) || 2;
  const gridClass = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-3" }[Math.min(columns, 3) as 1 | 2 | 3] || "grid-cols-1 md:grid-cols-2";
  
  if (items.length === 0) return null;
  
  return (
    <AnimateIn>
      <div>
        {(props.title as string) && (
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900 mb-8 text-center">{props.title as string}</h3>
        )}
        <div className={`grid gap-8 ${gridClass}`}>
          {items.map((item, i) => (
            <div key={item.id || i} className="group">
              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-xl font-bold text-surface-900 mb-2">{item.title}</h4>
              <p className="text-surface-500 mb-4 line-clamp-3">{item.description}</p>
              <a href={resolveStoreLink(item.link, storeSlug)} className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Continue Reading
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Team ────────────────────────────────────────────────────── */
function TeamBlock({ props }: { props: Record<string, unknown> }) {
  const members = (props.members as Array<{ name: string; role: string; image?: string; bio?: string }>) || [];
  return (
    <AnimateIn>
      <div>
        {(props.title as string) && (
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900">{props.title as string}</h3>
            {(props.subtitle as string) && <p className="text-surface-500 mt-2">{props.subtitle as string}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((m, i) => (
            <AnimateIn key={i} delay={i * 0.08}>
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-brand-200 to-accent-100 border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-600">
                      {m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-surface-900">{m.name}</h4>
                <p className="text-xs text-surface-500">{m.role}</p>
                {m.bio && <p className="text-xs text-surface-400 mt-1">{m.bio}</p>}
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Brands / Logos ──────────────────────────────────────────── */
function BrandsBlock({ props }: { props: Record<string, unknown> }) {
  const names = (props.names as string[]) || [];
  return (
    <AnimateIn>
      <div className="py-8">
        {(props.title as string) && (
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest text-center mb-6">{props.title as string}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {names.map((name, i) => (
            <span key={i} className="text-lg sm:text-xl font-display font-bold text-surface-300 hover:text-surface-500 transition-colors">{name}</span>
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Image Hero Banner (dual side-by-side image banners) ───── */
function ImageHeroBannerBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ image: string; title: string; subtitle: string; buttonText: string; buttonHref: string }>) || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <AnimateIn key={i} delay={i * 0.15}>
          <a href={item.buttonHref || "#"} className="group relative block aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden">
            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-1">{item.title}</h2>
              <p className="text-lg sm:text-xl font-display font-semibold text-white/90 mb-4">{item.subtitle}</p>
              <span className="inline-block border-b-2 border-white text-sm font-semibold text-white uppercase tracking-wider pb-1 group-hover:border-white/60 transition-colors">
                {item.buttonText}
              </span>
            </div>
          </a>
        </AnimateIn>
      ))}
    </div>
  );
}

/* ── Image Category Cards ────────────────────────────────────── */
function ImageCategoryCardsBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ image: string; title: string; href: string }>) || [];
  const cols = (props.columns as number) || 4;
  const gridClass = { 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[Math.min(cols, 4) as 2 | 3 | 4] || "grid-cols-2 sm:grid-cols-4";
  return (
    <AnimateIn>
      <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
        {items.map((item, i) => (
          <a key={i} href={item.href || "#"} className="group text-center">
            <div className="aspect-square rounded-full overflow-hidden mx-auto mb-3 w-32 h-32 sm:w-40 sm:h-40 border-2 border-surface-100 shadow-sm group-hover:shadow-lg transition-shadow">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="text-sm sm:text-base font-display font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{item.title}</h3>
          </a>
        ))}
      </div>
    </AnimateIn>
  );
}

/* ── Static Product Grid (hardcoded products, not from store) ── */
function StaticProductGridBlock({ props }: { props: Record<string, unknown> }) {
  type StaticProduct = { name: string; price: number; compareAtPrice?: number; image: string; hoverImage?: string; currency?: string };
  const products = (props.products as StaticProduct[]) || [];
  const cols = (props.columns as number) || 3;
  const gridClass = { 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4" }[Math.min(cols, 4) as 2 | 3 | 4] || "grid-cols-2 sm:grid-cols-3";
  const fmt = (amount: number, cur?: string) => {
    const symbols: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", NGN: "₦", KES: "KSh", ZAR: "R" };
    return `${symbols[cur || "USD"] || "$"}${amount.toFixed(2)}`;
  };
  return (
    <AnimateIn>
      <div>
        {(props.title as string) && (
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-surface-900">{props.title as string}</h3>
          </div>
        )}
        <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
          {products.map((product, i) => {
            const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
            return (
              <div key={i} className="group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${product.hoverImage ? "group-hover:opacity-0" : ""}`}
                  />
                  {product.hoverImage && (
                    <img
                      src={product.hoverImage}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  )}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white z-10">-{discount}%</div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <button className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-sm">
                      <Heart className="h-4 w-4 text-surface-500" />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-surface-900 mb-1 line-clamp-1">{product.name}</h4>
                <div className="flex items-center gap-2">
                  {product.compareAtPrice && (
                    <span className="text-xs text-surface-400 line-through">{fmt(product.compareAtPrice, product.currency)}</span>
                  )}
                  <span className="text-sm font-bold text-surface-900">{fmt(product.price, product.currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Promo Split Section (images | products | images) ──────── */
function PromoSplitBlock({ props }: { props: Record<string, unknown> }) {
  type PromoImage = { src: string; title?: string };
  type PromoProduct = { name: string; price: number; image: string; hoverImage?: string };
  const leftImages = (props.leftImages as PromoImage[]) || [];
  const rightImages = (props.rightImages as PromoImage[]) || [];
  const centerProducts = (props.centerProducts as PromoProduct[]) || [];
  return (
    <AnimateIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left stacked images */}
        <div className="flex flex-col gap-4">
          {leftImages.map((img, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src={img.src} alt={img.title || ""} className="w-full h-full object-cover" />
              {img.title && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-lg font-display font-bold text-white">{img.title}</h3>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Center products */}
        <div className="flex flex-col gap-4 justify-center">
          {centerProducts.map((product, i) => (
            <div key={i} className="group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2">
                <img src={product.image} alt={product.name} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${product.hoverImage ? "group-hover:opacity-0" : ""}`} />
                {product.hoverImage && <img src={product.hoverImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                <div className="absolute top-3 right-3"><button className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"><Heart className="h-4 w-4 text-surface-500" /></button></div>
              </div>
              <h4 className="text-sm font-semibold text-surface-900 line-clamp-1">{product.name}</h4>
              <span className="text-sm font-bold text-surface-900">${product.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        {/* Right stacked images */}
        <div className="flex flex-col gap-4">
          {rightImages.map((img, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src={img.src} alt={img.title || ""} className="w-full h-full object-cover" />
              {img.title && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4"><h3 className="text-lg font-display font-bold text-white">{img.title}</h3></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Image Brands (logo images, not text) ────────────────────── */
function ImageBrandsBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ name: string; logo: string }>) || [];
  return (
    <AnimateIn>
      <div className="py-8">
        {(props.title as string) && (
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest text-center mb-6">{props.title as string}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {items.map((item, i) => (
            <img key={i} src={item.logo} alt={item.name} className="h-8 sm:h-10 object-contain opacity-50 hover:opacity-100 transition-opacity" />
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Link Cards (pre-footer image cards with overlay) ────────── */
function LinkCardsBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ image: string; title: string; buttonText: string; href: string }>) || [];
  const cols = (props.columns as number) || 4;
  const gridClass = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[Math.min(cols, 4) as 2 | 3 | 4] || "grid-cols-2 sm:grid-cols-4";
  return (
    <AnimateIn>
      <div className={`grid gap-4 ${gridClass}`}>
        {items.map((item, i) => (
          <a key={i} href={item.href || "#"} className="group relative block aspect-[3/4] rounded-2xl overflow-hidden">
            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h3 className="text-lg font-display font-bold text-white mb-2">{item.title}</h3>
              <span className="inline-block border-b border-white text-xs font-semibold text-white uppercase tracking-wider pb-0.5 group-hover:border-white/60 transition-colors">
                {item.buttonText}
              </span>
            </div>
          </a>
        ))}
      </div>
    </AnimateIn>
  );
}

/* ── HTML Embed (template iframe) ────────────────────────────── */
function HtmlEmbedBlock({ props }: { props: Record<string, unknown> }) {
  const src = (props.src as string) || "";
  const minHeight = (props.minHeight as string) || "100vh";
  const title = (props.title as string) || "Template Preview";
  if (!src) return null;
  return (
    <div className="w-full" style={{ minHeight }}>
      <iframe
        src={src}
        title={title}
        className="w-full border-0"
        style={{ minHeight, display: "block" }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        loading="eager"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEWLY WIRED WIDGET TYPES — previously had zero live renderer
   ═══════════════════════════════════════════════════════════════ */

/* ── Icon ────────────────────────────────────────────────────── */
function IconBlock({ props }: { props: Record<string, unknown> }) {
  const rawName = ((props.name as string) || "star").trim();
  const pascalName = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const LucideIcon = (lucideIcons as Record<string, React.ComponentType<any>>)[pascalName] || Star;
  const size = Number(props.size) || 24;
  return (
    <AnimateIn>
      <LucideIcon size={size} color={(props.color as string) || "#171717"} />
    </AnimateIn>
  );
}

/* ── Progress Bar ────────────────────────────────────────────── */
function ProgressBarBlock({ props }: { props: Record<string, unknown> }) {
  const value = Math.max(0, Math.min(100, Number(props.value) || 0));
  const height = `${Number(props.height) || 8}px`;
  const color = (props.color as string) || "#2563eb";
  return (
    <AnimateIn>
      <div className="w-full">
        {props.showLabel !== false && <div className="text-xs font-medium text-surface-500 mb-1.5">{value}%</div>}
        <div className="w-full rounded-full bg-surface-100" style={{ height }}>
          <div className="rounded-full transition-all" style={{ width: `${value}%`, height, backgroundColor: color }} />
        </div>
      </div>
    </AnimateIn>
  );
}

/* ── Call to Action ──────────────────────────────────────────── */
function CtaBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <AnimateIn>
      <div
        className="rounded-2xl px-6 py-12 sm:py-16 text-center"
        style={{ backgroundColor: (props.backgroundColor as string) || "#2563eb", color: (props.textColor as string) || "#ffffff" }}
      >
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold mb-3">{(props.heading as string) || "Take Action Now"}</h2>
        {props.description ? <p className="opacity-90 max-w-xl mx-auto mb-6">{props.description as string}</p> : null}
        <a
          href={(props.buttonLink as string) || "#"}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold"
          style={{ color: (props.backgroundColor as string) || "#2563eb" }}
        >
          {(props.buttonText as string) || "Get Started"} <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </AnimateIn>
  );
}

/* ── Social Share ────────────────────────────────────────────── */
function SocialShareBlock({ props }: { props: Record<string, unknown> }) {
  const platforms = (Array.isArray(props.platforms) ? props.platforms : ["facebook", "twitter", "linkedin", "whatsapp"]) as string[];
  const iconMap: Record<string, React.ComponentType<any>> = { facebook: Facebook, twitter: Twitter, linkedin: Linkedin, whatsapp: Share2, instagram: Instagram, youtube: Youtube };
  return (
    <AnimateIn>
      <div className="flex items-center gap-3">
        {platforms.map((p) => {
          const Icon = iconMap[p] || Share2;
          return (
            <span key={p} className="h-9 w-9 rounded-full bg-surface-100 flex items-center justify-center text-surface-700">
              <Icon className="h-4 w-4" />
            </span>
          );
        })}
      </div>
    </AnimateIn>
  );
}

/* ── Social Follow ───────────────────────────────────────────── */
function SocialFollowBlock({ props }: { props: Record<string, unknown> }) {
  const platforms = (Array.isArray(props.platforms) ? props.platforms : []) as Array<{ name: string; url: string }>;
  const iconMap: Record<string, React.ComponentType<any>> = { facebook: Facebook, twitter: Twitter, linkedin: Linkedin, instagram: Instagram, youtube: Youtube };
  return (
    <AnimateIn>
      <div className="flex items-center gap-3">
        {platforms.filter((p) => p?.url).map((p) => {
          const Icon = iconMap[p.name] || Share2;
          return (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-700">
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </AnimateIn>
  );
}

/* ── HTML / Embed (raw code widgets — sanitized) ─────────────── */
function RawHtmlBlock({ props }: { props: Record<string, unknown> }) {
  const code = (props.code as string) || "";
  if (!code) return null;
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(code) }} />;
}

/* ── Simple Form (input/textarea/select children render inline) ─ */
function FormFieldBlock({ block }: { block: BuilderBlock }) {
  const p = block.props || {};
  if (block.type === "textarea") {
    return (
      <div className="mb-4">
        {p.label ? <label className="block text-sm font-medium text-surface-700 mb-1.5">{p.label as string}</label> : null}
        <textarea placeholder={(p.placeholder as string) || ""} rows={Number(p.rows) || 4} required={Boolean(p.required)} className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm" />
      </div>
    );
  }
  if (block.type === "select") {
    const options = (Array.isArray(p.options) ? p.options : []) as Array<{ label: string; value: string }>;
    return (
      <div className="mb-4">
        {p.label ? <label className="block text-sm font-medium text-surface-700 mb-1.5">{p.label as string}</label> : null}
        <select required={Boolean(p.required)} className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="mb-4">
      {p.label ? <label className="block text-sm font-medium text-surface-700 mb-1.5">{p.label as string}</label> : null}
      <input type={(p.type as string) || "text"} placeholder={(p.placeholder as string) || ""} required={Boolean(p.required)} className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm" />
    </div>
  );
}

function FormBlock({ block }: { block: BuilderBlock }) {
  const p = block.props || {};
  const children = block.elements || [];
  return (
    <AnimateIn>
      <form className="max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
        {children.map((child) =>
          ["input", "textarea", "select"].includes(child.type)
            ? <FormFieldBlock key={child.id} block={child} />
            : <PublicBlockRenderer key={child.id} block={child} />
        )}
        <button type="submit" className="w-full rounded-xl bg-brand-600 text-white py-3 font-bold">
          {(p.submitText as string) || "Submit"}
        </button>
      </form>
    </AnimateIn>
  );
}

/* ── Cart summary (static preview — real cart lives in the header/drawer) ── */
function CartPreviewBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <AnimateIn>
      <div className="rounded-2xl border border-surface-200 p-6 flex items-center gap-3 text-surface-500">
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm">Your cart is available from the header icon at checkout.</span>
      </div>
    </AnimateIn>
  );
}

function StandaloneInputBlock({ props }: { props: Record<string, unknown> }) {
  return <FormFieldBlock block={{ id: "standalone", type: "input", props }} />;
}
function StandaloneTextareaBlock({ props }: { props: Record<string, unknown> }) {
  return <FormFieldBlock block={{ id: "standalone", type: "textarea", props }} />;
}
function StandaloneSelectBlock({ props }: { props: Record<string, unknown> }) {
  return <FormFieldBlock block={{ id: "standalone", type: "select", props }} />;
}

/* ═══════════════════════════════════════════════════════════════
   RENDERER MAP
   ═══════════════════════════════════════════════════════════════ */

const renderers: Record<string, React.FC<{ props: Record<string, unknown> }>> = {
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  hero: HeroBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  columns: ColumnsBlock,
  productGrid: ProductGridBlock,
  featured_products: ProductGridBlock,
  new_arrivals: ProductGridBlock,
  best_sellers: ProductGridBlock,
  featured_dishes: ProductGridBlock,
  featured_toys: ProductGridBlock,
  testimonial: TestimonialBlock,
  testimonials: TestimonialsBlock,
  features: FeaturesBlock,
  categories: FeaturesBlock,
  collections: FeaturesBlock,
  menu: FeaturesBlock,
  reservations: ContactFormBlock,
  chef: TeamBlock,
  opening_hours: ContactInfoBlock,
  lookbook: GalleryBlock,
  promotions: BannerBlock,
  projects: ProjectsBlock,
  portfolio: GalleryBlock,
  service_cards: FeaturesBlock,
  services: FeaturesBlock,
  case_studies: FeaturesBlock,
  age_categories: FeaturesBlock,
  faq: FAQBlock,
  contactForm: ContactFormBlock,
  contactInfo: ContactInfoBlock,
  stats: StatsBlock,
  newsletter: NewsletterBlock,
  video: VideoBlock,
  countdown: CountdownBlock,
  trustBadges: TrustBadgesBlock,
  banner: BannerBlock,
  imageText: ImageTextBlock,
  "image-text": ImageTextBlock,
  gallery: GalleryBlock,
  team: TeamBlock,
  brands: BrandsBlock,
  imageHeroBanner: ImageHeroBannerBlock,
  imageCategoryCards: ImageCategoryCardsBlock,
  staticProductGrid: StaticProductGridBlock,
  promoSplit: PromoSplitBlock,
  imageBrands: ImageBrandsBlock,
  linkCards: LinkCardsBlock,
  htmlEmbed: HtmlEmbedBlock,
  // Newly wired widget types (previously had no live renderer at all)
  icon: IconBlock,
  "progress-bar": ProgressBarBlock,
  cta: CtaBlock,
  "social-share": SocialShareBlock,
  "social-follow": SocialFollowBlock,
  html: RawHtmlBlock,
  embed: RawHtmlBlock,
  shortcode: RawHtmlBlock,
  paragraph: TextBlock,
  products: ProductGridBlock,
  product: ProductGridBlock,
  reviews: TestimonialsBlock,
  cart: CartPreviewBlock,
  slider: GalleryBlock,
  input: StandaloneInputBlock,
  textarea: StandaloneTextareaBlock,
  select: StandaloneSelectBlock,
};

/* ─── STORE CONTEXT (for blocks that need store info) ─────── */

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  inStock: boolean;
  isFeatured: boolean;
  tags: string[];
  images: Array<{ id: string; url: string; alt?: string }>;
  category?: { id: string; name: string; slug: string };
  variants?: Array<{
    id: string;
    name: string;
    price: number | null;
    stock: number;
    inStock: boolean;
    options: Record<string, string> | null;
    image: string | null;
  }>;
  reviewCount: number;
}

interface StoreContextData {
  slug: string;
  products: StoreProduct[];
  currency: string;
  addToCart?: (product: StoreProduct) => void;
  isWishlisted?: (productId: string) => boolean;
  toggleWishlist?: (productId: string) => void;
  addedToCart?: string | null;
}

const StoreContext = createContext<StoreContextData>({ slug: "", products: [], currency: "NGN" });
const StoreSlugContext = createContext<string>("");

/* ─── DRAG AND DROP COMPONENTS ───────────────────────────────── */

function DraggableBlock({ block, children, isEditorMode }: { block: BuilderBlock; children: React.ReactNode; isEditorMode?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    disabled: !isEditorMode,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isEditorMode ? 'group' : ''}`}
    >
      {isEditorMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <GripVertical className="h-5 w-5 text-surface-400 hover:text-surface-600" />
        </div>
      )}
      {children}
    </div>
  );
}

function DroppableBlockList({ children, isEditorMode }: { children: React.ReactNode; isEditorMode?: boolean }) {
  const { setNodeRef } = useDroppable({
    id: "block-list",
    disabled: !isEditorMode,
  });

  return <div ref={setNodeRef}>{children}</div>;
}

/* ─── PUBLIC API ────────────────────────────────────────────── */

export function PublicBlockRenderer({ block }: { block: BuilderBlock; isEditorMode?: boolean }) {
  const normalizedProps = normalizeStorefrontTemplateProps((block.props || {}) as Record<string, unknown>);

  // Check if it's a template block (fashion, electronics, bakery, cosmetics, etc.)
  const TemplateComponent = ALL_TEMPLATE_BLOCKS[block.type];
  if (TemplateComponent) {
    const FontLoader = getTemplateFontLoader(block.type);
    return (
      <>
        <FontLoader />
        <TemplateComponent {...normalizedProps} elements={block.elements || []} />
      </>
    );
  }

  // Structural wrapper types from the visual page editor (section, column,
  // container, grid, flex) have no dedicated renderer entry here — they're
  // generic layout containers, not named content blocks like the ones
  // above. Without this fallback, PublicBlockRenderer bailed out entirely
  // for these types before, which meant a page built with the visual
  // editor's core Section -> Column -> Widget structure rendered as a
  // completely blank page on the live storefront: not just missing some
  // content, but rendering nothing at all, since the very first thing
  // encountered at the top of every such page is a "section" block.
  const STRUCTURAL_TYPES = new Set(["section", "container", "column", "grid", "flex"]);
  if (STRUCTURAL_TYPES.has(block.type)) {
    const style: Record<string, unknown> = {};
    if (typeof normalizedProps.backgroundColor === "string") style.backgroundColor = normalizedProps.backgroundColor;
    if (typeof normalizedProps.paddingTop === "string") style.paddingTop = normalizedProps.paddingTop;
    if (typeof normalizedProps.paddingBottom === "string") style.paddingBottom = normalizedProps.paddingBottom;
    if (typeof normalizedProps.paddingLeft === "string") style.paddingLeft = normalizedProps.paddingLeft;
    if (typeof normalizedProps.paddingRight === "string") style.paddingRight = normalizedProps.paddingRight;
    if (typeof normalizedProps.marginTop === "string") style.marginTop = normalizedProps.marginTop;
    if (typeof normalizedProps.marginBottom === "string") style.marginBottom = normalizedProps.marginBottom;
    if (typeof normalizedProps.borderRadius === "string") style.borderRadius = normalizedProps.borderRadius;
    if (block.type === "column" && typeof (block.props as any)?.width === "string") {
      style.width = `${(block.props as any).width}%`;
    }
    const display = block.type === "grid" ? "grid" : block.type === "flex" || block.type === "column" ? "flex" : undefined;
    if (display) style.display = display;
    if (block.type === "flex" || block.type === "column") style.flexDirection = "column";

    return (
      <div style={style as React.CSSProperties} data-block-id={block.id} data-block-type={block.type}>
        {(block.elements || []).map((child) => (
          <PublicBlockRenderer key={child.id} block={child} />
        ))}
      </div>
    );
  }

  if (block.type === "form") {
    return <FormBlock block={block} />;
  }

  const Renderer = renderers[block.type];
  if (!Renderer) {
    // Unknown/unimplemented widget type (see the widget-type audit — a
    // number of types the editor can create don't have a matching live
    // renderer yet: icon, progress-bar, social-share/follow, cta, cart,
    // form fields, etc.). Rather than silently returning null — which
    // would also drop any nested children — render nothing for the
    // widget itself but still recurse into children if it has any, so a
    // container that merely wraps an unimplemented type doesn't lose
    // everything inside it too.
    if (Array.isArray(block.elements) && block.elements.length > 0) {
      return (
        <>
          {block.elements.map((child) => (
            <PublicBlockRenderer key={child.id} block={child} />
          ))}
        </>
      );
    }
    return null;
  }
  return <Renderer props={normalizedProps} />;
}

export function RenderBlocks({ blocks, storeSlug, products, currency, addToCart, isWishlisted, toggleWishlist, addedToCart, isEditorMode = false, pageId, blockCount, dataSource, wrapBlock }: {
  blocks: BuilderBlock[];
  storeSlug?: string;
  products?: StoreProduct[];
  currency?: string;
  addToCart?: (product: StoreProduct) => void;
  isWishlisted?: (productId: string) => boolean;
  toggleWishlist?: (productId: string) => void;
  addedToCart?: string | null;
  isEditorMode?: boolean;
  pageId?: string | null;
  blockCount?: number;
  dataSource?: string;
  wrapBlock?: (block: BuilderBlock, content: React.ReactNode, index: number) => React.ReactNode;
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Send reorder message to parent
    window.parent.postMessage({
      type: "builder-block-reorder",
      blockId: active.id as string,
      oldIndex,
      newIndex,
    }, "*");
  };

  const content = isEditorMode ? (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <DroppableBlockList isEditorMode={isEditorMode}>
        <div className="space-y-8">
          {blocks.map((block, index) => {
            const listKey = getBlockListKey(block, index, "editor-block");
            const isHidden = (block as any).visible === false;
            const node = (
              <TemplateBlockErrorBoundary blockType={block.type} blockId={block.id} isEditor={isEditorMode}>
                <PublicBlockRenderer block={block} isEditorMode={isEditorMode} />
              </TemplateBlockErrorBoundary>
            );
            const wrappedNode = wrapBlock ? wrapBlock(block, node, index) : node;
            const scopedNode = (
              <div
                data-editor-node-id={block.id}
                className={`editor-node-${block.id} relative`}
                style={isHidden ? { opacity: 0.35 } : undefined}
              >
                {isHidden && (
                  <div className="absolute top-1 left-1 z-10 pointer-events-none rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Hidden — won&apos;t show on the live site
                  </div>
                )}
                {wrappedNode}
              </div>
            );
            return (
              <DraggableBlock key={listKey} block={block} isEditorMode={isEditorMode}>
                {scopedNode}
              </DraggableBlock>
            );
          })}
        </div>
      </DroppableBlockList>
    </DndContext>
  ) : (
      <div className="space-y-8">
        {blocks.filter((block) => (block as any).visible !== false).map((block, index) => {
          const listKey = getBlockListKey(block, index, "live-block");
          const node = (
            <TemplateBlockErrorBoundary blockType={block.type} blockId={block.id} isEditor={isEditorMode}>
              <PublicBlockRenderer block={block} isEditorMode={isEditorMode} />
            </TemplateBlockErrorBoundary>
          );
          const scopedNode = (
            <div
              data-editor-node-id={block.id}
              className={`editor-node-${block.id}`}
            >
              {wrapBlock ? wrapBlock(block, node, index) : node}
            </div>
          );
          return <div key={listKey}>{scopedNode}</div>;
        })}
      </div>
    );
  const hasFashionBlocks = blocks.some((b) => b.type.startsWith("fashion"));
  const hasElectronicsBlocks = blocks.some((b) => b.type.startsWith("electronics") || b.type.startsWith("tools") || b.type.startsWith("hardware"));
  const hasInteriorBlocks = blocks.some((b) => b.type.startsWith("interior"));
  const hasAccessoriesBlocks = blocks.some((b) => b.type.startsWith("accessories"));
  const electronicsCtxValue = hasElectronicsBlocks ? { products: (products || []) as unknown as ElectronicsStoreContextData["products"], blogs: [], currency: currency || "NGN", storeSlug: storeSlug || "" } : null;
  const interiorCtxValue = hasInteriorBlocks ? { products: (products || []) as unknown as InteriorStoreContextData["products"], blogs: [], currency: currency || "NGN", storeSlug: storeSlug || "" } : null;
  const accessoriesCtxValue = hasAccessoriesBlocks ? { products: (products || []) as unknown as AccessoriesStoreContextData["products"], currency: currency || "NGN", storeSlug: storeSlug || "" } : null;
  const wrappedContent = storeSlug ? (
    <StoreSlugContext.Provider value={storeSlug}>
      <StoreContext.Provider value={{ slug: storeSlug || "", products: products || [], currency: currency || "NGN", addToCart, isWishlisted, toggleWishlist, addedToCart }}>
        <FashionStoreContext.Provider value={hasFashionBlocks ? { products: (products || []) as unknown as FashionStoreContextData["products"], blogs: [], currency: currency || "NGN", storeSlug: storeSlug || "" } : null as unknown as FashionStoreContextData}>
        <ElectronicsStoreContext.Provider value={electronicsCtxValue as unknown as ElectronicsStoreContextData}>
        <InteriorStoreContext.Provider value={interiorCtxValue as unknown as InteriorStoreContextData}>
        <AccessoriesStoreContext.Provider value={accessoriesCtxValue as unknown as AccessoriesStoreContextData}>
        <div className="relative">
          {isEditorMode && (
            <div className="pointer-events-none sticky top-0 z-30 border-b border-brand-200 bg-brand-50/95 px-4 py-2 text-[10px] font-mono text-brand-800 backdrop-blur">
              <span className="font-semibold uppercase tracking-wide">Editor</span>
              {" · "}
              {pageId || "unknown page"}
              {" · "}
              {blockCount ?? blocks.length} blocks
              {dataSource ? ` · ${dataSource}` : ""}
            </div>
          )}
          {content}
        </div>
        </AccessoriesStoreContext.Provider>
        </InteriorStoreContext.Provider>
        </ElectronicsStoreContext.Provider>
        </FashionStoreContext.Provider>
      </StoreContext.Provider>
    </StoreSlugContext.Provider>
  ) : content;
  return wrappedContent;
}
