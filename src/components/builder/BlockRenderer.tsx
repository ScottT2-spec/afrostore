"use client";

import { BuilderBlock } from "@/lib/builder/types";
import {
  Star, Truck, Shield, Headphones, RefreshCw, ChevronDown, ChevronUp, Play,
  Phone, Mail, MapPin, Clock, Zap, Heart, Award, Users, Globe,
  TrendingUp, Package, CreditCard, CheckCircle2, ArrowRight, Send,
  Sparkles, ShoppingBag, Eye, ThumbsUp, Target, Palette, Rocket, Lock,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

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

/* ── Heading ─────────────────────────────────────────────────── */
function HeadingBlock({ props }: { props: Record<string, unknown> }) {
  const level = (props.level as string) || "h2";
  const sizeMap: Record<string, string> = { xl: "text-xl", "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl" };
  const className = `font-display font-bold ${sizeMap[(props.fontSize as string) || "2xl"] || "text-2xl"}`;
  const style = { color: (props.color as string) || "#171717", textAlign: (props.align as string) || "left" } as React.CSSProperties;
  const text = (props.text as string) || "Heading";

  if (level === "h1") return <h1 className={className} style={style}>{text}</h1>;
  if (level === "h3") return <h3 className={className} style={style}>{text}</h3>;
  if (level === "h4") return <h4 className={className} style={style}>{text}</h4>;
  return <h2 className={className} style={style}>{text}</h2>;
}

/* ── Text ────────────────────────────────────────────────────── */
function TextBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <p
      className={`text-${(props.fontSize as string) || "base"} leading-relaxed`}
      style={{ color: (props.color as string) || "#525252", textAlign: (props.align as React.CSSProperties["textAlign"]) || "left" }}
    >
      {(props.text as string) || ""}
    </p>
  );
}

/* ── Image ───────────────────────────────────────────────────── */
function ImageBlock({ props }: { props: Record<string, unknown> }) {
  const src = props.src as string;
  if (!src) return <div className="h-48 bg-surface-100 rounded-xl flex items-center justify-center text-surface-400 text-sm">Click to add image URL</div>;
  return <img src={src} alt={(props.alt as string) || ""} className={`w-${(props.width as string) || "full"} rounded-${(props.rounded as string) || "xl"} object-cover`} />;
}

/* ── Button ──────────────────────────────────────────────────── */
function ButtonBlock({ props }: { props: Record<string, unknown> }) {
  const variants: Record<string, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
  };
  const sizes: Record<string, string> = { sm: "text-sm py-2 px-4", md: "text-sm py-3 px-6", lg: "text-base py-4 px-8" };
  return (
    <div style={{ textAlign: (props.align as React.CSSProperties["textAlign"]) || "left" }}>
      <a href={(props.href as string) || "#"} className={`${variants[(props.variant as string) || "primary"]} ${sizes[(props.size as string) || "md"]} inline-flex`}>
        {(props.text as string) || "Button"}
      </a>
    </div>
  );
}

/* ── Hero ────────────────────────────────────────────────────── */
function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const bgStyle = (props.bgStyle as string) || "";
  const bgClasses: Record<string, string> = {
    gradient: "bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800",
    dark: "bg-gradient-to-br from-surface-950 via-surface-900 to-surface-800",
    accent: "bg-gradient-to-br from-accent-600 via-accent-500 to-accent-400",
    light: "bg-gradient-to-br from-surface-50 to-white",
  };
  const isLight = bgStyle === "light";
  const bgClass = bgClasses[bgStyle] || "";

  return (
    <div
      className={`rounded-2xl px-8 py-16 sm:py-20 relative overflow-hidden ${bgClass}`}
      style={!bgClass ? { backgroundColor: (props.bgColor as string) || "#1B2B4B", color: (props.textColor as string) || "#fff" } : {}}
    >
      <div style={{ textAlign: (props.align as React.CSSProperties["textAlign"]) || "center" }}>
        {(props.badge as string) && (
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 ${isLight ? "bg-brand-100 text-brand-700" : "bg-white/10 text-white/80 border border-white/20"}`}>
            <Sparkles className="h-3 w-3" />
            {props.badge as string}
          </span>
        )}
        <h1 className={`font-display text-3xl sm:text-4xl font-extrabold mb-4 ${isLight ? "text-surface-900" : "text-white"}`}>
          {(props.heading as string) || "Hero Heading"}
        </h1>
        <p className={`text-lg mb-8 max-w-2xl mx-auto ${isLight ? "text-surface-600" : "opacity-80"}`}>
          {(props.subheading as string) || "Subheading text"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(props.buttonText as string) && (
            <a href={(props.buttonHref as string) || "#"} className="btn-accent inline-flex items-center gap-2">
              {props.buttonText as string} <ArrowRight className="h-4 w-4" />
            </a>
          )}
          {(props.secondaryButtonText as string) && (
            <a href={(props.secondaryButtonHref as string) || "#"} className={`inline-flex items-center gap-2 rounded-xl font-semibold py-2.5 px-6 text-sm ${isLight ? "border border-surface-200 text-surface-700" : "border border-white/20 text-white/80"}`}>
              {props.secondaryButtonText as string}
            </a>
          )}
        </div>
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
  return (
    <hr style={{ borderColor: (props.color as string) || "#e5e5e5", borderWidth: `${(props.thickness as number) || 1}px`, borderStyle: (props.style as string) || "solid" }} />
  );
}

/* ── Columns ─────────────────────────────────────────────────── */
function ColumnsBlock({ props }: { props: Record<string, unknown> }) {
  const children = (props.children as BuilderBlock[]) || [];
  const cols = (props.columns as number) || 2;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-${(props.gap as number) || 4}`}>
      {children.map((child) => (
        <div key={child.id} className="p-4 border border-dashed border-surface-200 rounded-xl min-h-[80px]">
          <BlockRenderer block={child} />
        </div>
      ))}
    </div>
  );
}

/* ── Product Grid ────────────────────────────────────────────── */
function ProductGridBlock({ props }: { props: Record<string, unknown> }) {
  const limit = (props.limit as number) || 6;
  const cols = (props.columns as number) || 3;
  return (
    <div>
      {(props.title as string) && <h3 className="text-xl font-bold text-surface-900 mb-2">{props.title as string}</h3>}
      {(props.subtitle as string) && <p className="text-sm text-surface-500 mb-4">{props.subtitle as string}</p>}
      <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
        {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 bg-white overflow-hidden">
            <div className="h-32 bg-surface-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-surface-300" />
            </div>
            <div className="p-3">
              <div className="h-3 bg-surface-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center text-surface-400 mt-2">Products will load from your store</p>
    </div>
  );
}

/* ── Testimonial (single) ────────────────────────────────────── */
function TestimonialBlock({ props }: { props: Record<string, unknown> }) {
  const rating = (props.rating as number) || 5;
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? "text-accent-400 fill-accent-400" : "text-surface-200"}`} />
        ))}
      </div>
      <p className="text-sm text-surface-700 mb-4 italic">&ldquo;{(props.text as string) || "Great product!"}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
          {((props.name as string) || "C")[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-900">{(props.name as string) || "Customer"}</p>
          <p className="text-[10px] text-surface-500">{(props.role as string) || "Buyer"}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Testimonials (multi / marquee) ──────────────────────────── */
function TestimonialsBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ name: string; text: string; role?: string; rating?: number }>) || [];
  const bg = (props.bgColor as string) || "transparent";
  const isDark = bg === "dark";
  return (
    <div className={`rounded-2xl py-8 px-6 ${isDark ? "bg-surface-900" : bg === "surface" ? "bg-surface-50" : "bg-white border border-surface-100"}`}>
      {(props.title as string) && (
        <h3 className={`text-xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-surface-900"}`}>
          {props.title as string}
        </h3>
      )}
      {(props.subtitle as string) && (
        <p className={`text-sm text-center mb-6 ${isDark ? "text-white/60" : "text-surface-500"}`}>{props.subtitle as string}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(items.length > 0 ? items : [{ name: "Customer", text: "Great experience!", rating: 5 }]).slice(0, 3).map((item, i) => (
          <div key={i} className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-surface-100"}`}>
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`h-3 w-3 ${j < (item.rating || 5) ? "text-amber-400 fill-amber-400" : "text-surface-200"}`} />
              ))}
            </div>
            <p className={`text-xs leading-relaxed mb-3 ${isDark ? "text-white/70" : "text-surface-600"}`}>
              &ldquo;{item.text}&rdquo;
            </p>
            <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-surface-900"}`}>{item.name}</p>
            <p className={`text-[10px] ${isDark ? "text-white/50" : "text-surface-400"}`}>{item.role || "Customer"}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center text-surface-400 mt-3">Scrolling marquee on published page • Real reviews will merge automatically</p>
    </div>
  );
}

/* ── Features Grid ───────────────────────────────────────────── */
function FeaturesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; title: string; desc: string }>) || [];
  return (
    <div>
      {(props.title as string) && <h3 className="text-xl font-bold text-surface-900 mb-2 text-center">{props.title as string}</h3>}
      {(props.subtitle as string) && <p className="text-sm text-surface-500 mb-6 text-center">{props.subtitle as string}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.length > 0 ? items.map((item, i) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div key={i} className="text-center p-4 rounded-xl border border-surface-100">
              <Icon className="h-8 w-8 text-brand-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-surface-900 mb-1">{item.title}</h4>
              <p className="text-xs text-surface-500">{item.desc}</p>
            </div>
          );
        }) : (
          <div className="col-span-3 text-center py-8 text-surface-400 text-sm">
            Add feature items in the property panel →
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────── */
function FAQBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ question: string; answer: string }>) || [];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {(props.title as string) && <h3 className="text-xl font-bold text-surface-900 mb-4">{props.title as string}</h3>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-surface-200 overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-sm font-semibold text-surface-900 hover:bg-surface-50">
              {item.question}
              {open === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-surface-600">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Contact Form ────────────────────────────────────────────── */
function ContactFormBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6">
      {(props.title as string) && <h3 className="text-lg font-bold text-surface-900 mb-1">{props.title as string}</h3>}
      {(props.subtitle as string) && <p className="text-xs text-surface-500 mb-4">{props.subtitle as string}</p>}
      <div className="space-y-3">
        <input className="input-field" placeholder="Your name" disabled />
        <input className="input-field" placeholder="Your email" disabled />
        <textarea className="input-field" placeholder="Your message" rows={3} disabled />
        <button className="btn-primary">{(props.buttonText as string) || "Send"}</button>
      </div>
    </div>
  );
}

/* ── Contact Info ────────────────────────────────────────────── */
function ContactInfoBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; title: string; value: string }>) || [];
  const hours = props.hours as string;
  return (
    <div>
      {(props.title as string) && <h3 className="text-xl font-bold text-surface-900 mb-2 text-center">{props.title as string}</h3>}
      {(props.subtitle as string) && <p className="text-sm text-surface-500 mb-6 text-center">{props.subtitle as string}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || Mail;
          return (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-surface-100 bg-white p-4">
              <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{item.title}</p>
                <p className="text-sm font-medium text-surface-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      {hours && (
        <div className="mt-3 rounded-xl bg-surface-50 border border-surface-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-surface-500" />
            <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Business Hours</p>
          </div>
          <p className="text-sm text-surface-700">{hours}</p>
        </div>
      )}
    </div>
  );
}

/* ── Stats / Counters ────────────────────────────────────────── */
function StatsBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ value: string; label: string; icon?: string }>) || [];
  const bg = (props.bgColor as string) || "brand";
  const isDark = bg === "brand" || bg === "dark";
  return (
    <div className={`rounded-2xl py-10 px-6 ${
      bg === "brand" ? "bg-gradient-to-br from-brand-700 to-brand-900" :
      bg === "dark" ? "bg-gradient-to-br from-surface-900 to-surface-950" :
      "bg-surface-50 border border-surface-100"
    }`}>
      {(props.title as string) && (
        <h3 className={`text-xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-surface-900"}`}>
          {props.title as string}
        </h3>
      )}
      {(props.subtitle as string) && (
        <p className={`text-sm text-center mb-6 ${isDark ? "text-white/60" : "text-surface-500"}`}>{props.subtitle as string}</p>
      )}
      <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(items.length || 4, 4)} gap-6`}>
        {(items.length > 0 ? items : [
          { value: "—", label: "Stat 1" },
          { value: "—", label: "Stat 2" },
          { value: "—", label: "Stat 3" },
        ]).map((item, i) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          return (
            <div key={i} className="text-center">
              {Icon && <Icon className={`h-5 w-5 mx-auto mb-1 ${isDark ? "text-accent-400" : "text-brand-600"}`} />}
              <div className={`text-2xl font-display font-extrabold ${isDark ? "text-white" : "text-surface-900"}`}>
                {item.value}
              </div>
              <div className={`text-xs mt-1 ${isDark ? "text-white/60" : "text-surface-500"}`}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Newsletter ──────────────────────────────────────────────── */
function NewsletterBlock({ props }: { props: Record<string, unknown> }) {
  const bg = (props.bgColor as string) || "surface";
  const isDark = bg === "dark" || bg === "brand";
  return (
    <div className={`rounded-2xl py-10 px-6 text-center ${
      bg === "brand" ? "bg-gradient-to-br from-brand-600 to-brand-800" :
      bg === "dark" ? "bg-gradient-to-br from-surface-900 to-surface-950" :
      "bg-surface-50 border border-surface-100"
    }`}>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-surface-900"}`}>
        {(props.title as string) || "Stay Updated"}
      </h3>
      <p className={`text-sm mb-4 max-w-md mx-auto ${isDark ? "text-white/60" : "text-surface-500"}`}>
        {(props.subtitle as string) || "Subscribe to get the latest offers."}
      </p>
      <div className="flex gap-2 max-w-sm mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm" disabled />
        <button className={`rounded-lg font-bold py-2 px-4 text-sm ${isDark ? "bg-white text-surface-900" : "bg-brand-600 text-white"}`} disabled>
          Subscribe
        </button>
      </div>
    </div>
  );
}

/* ── Banner / Promo ──────────────────────────────────────────── */
function BannerBlock({ props }: { props: Record<string, unknown> }) {
  const bg = (props.bgColor as string) || "brand";
  const isLight = bg === "light";
  return (
    <div className={`rounded-2xl px-8 py-8 ${
      bg === "brand" ? "bg-gradient-to-r from-brand-700 to-brand-900" :
      bg === "accent" ? "bg-gradient-to-r from-accent-500 to-accent-700" :
      bg === "dark" ? "bg-gradient-to-r from-surface-900 to-surface-950" :
      "bg-surface-50 border border-surface-200"
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className={`text-lg font-bold ${isLight ? "text-surface-900" : "text-white"}`}>
            {(props.title as string) || "Special Offer"}
          </h3>
          {(props.subtitle as string) && (
            <p className={`text-sm mt-1 ${isLight ? "text-surface-600" : "text-white/70"}`}>{props.subtitle as string}</p>
          )}
        </div>
        {(props.buttonText as string) && (
          <a href={(props.buttonHref as string) || "#"} className={`inline-flex items-center gap-2 rounded-xl font-bold py-2.5 px-6 text-sm ${isLight ? "bg-brand-600 text-white" : "bg-white text-surface-900"}`}>
            {props.buttonText as string} <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Image + Text ────────────────────────────────────────────── */
function ImageTextBlock({ props }: { props: Record<string, unknown> }) {
  const reverse = (props.reverse as boolean) || false;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-center`}>
      <div className={reverse ? "md:order-2" : ""}>
        {(props.image as string) ? (
          <img src={props.image as string} alt={(props.imageAlt as string) || ""} className="w-full rounded-xl object-cover" />
        ) : (
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-100 via-surface-100 to-accent-50 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-surface-300" />
          </div>
        )}
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        {(props.badge as string) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-semibold mb-3">
            <Sparkles className="h-3 w-3" /> {props.badge as string}
          </span>
        )}
        <h3 className="text-xl font-bold text-surface-900 mb-3">{(props.title as string) || "Title"}</h3>
        <p className="text-sm text-surface-600 leading-relaxed mb-4">{(props.text as string) || "Description text"}</p>
        {(props.buttonText as string) && (
          <a href={(props.buttonHref as string) || "#"} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white font-bold py-2.5 px-6 text-sm">
            {props.buttonText as string} <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Gallery ─────────────────────────────────────────────────── */
function GalleryBlock({ props }: { props: Record<string, unknown> }) {
  const images = (props.images as Array<{ src: string; alt?: string }>) || [];
  return (
    <div>
      {(props.title as string) && <h3 className="text-xl font-bold text-surface-900 mb-2 text-center">{props.title as string}</h3>}
      {(props.subtitle as string) && <p className="text-sm text-surface-500 mb-4 text-center">{props.subtitle as string}</p>}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
              <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-surface-300" />
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-center text-surface-400 mt-2">Add images in the property panel</p>
    </div>
  );
}

/* ── Team ────────────────────────────────────────────────────── */
function TeamBlock({ props }: { props: Record<string, unknown> }) {
  const members = (props.members as Array<{ name: string; role: string; image?: string }>) || [];
  return (
    <div>
      {(props.title as string) && <h3 className="text-xl font-bold text-surface-900 mb-2 text-center">{props.title as string}</h3>}
      {(props.subtitle as string) && <p className="text-sm text-surface-500 mb-6 text-center">{props.subtitle as string}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(members.length > 0 ? members : [
          { name: "Team Member", role: "Role" },
          { name: "Team Member", role: "Role" },
          { name: "Team Member", role: "Role" },
        ]).map((m, i) => (
          <div key={i} className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-brand-200 to-accent-100 border-2 border-white shadow">
              {m.image ? (
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-brand-600">
                  {m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <h4 className="text-sm font-bold text-surface-900">{m.name}</h4>
            <p className="text-[10px] text-surface-500">{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Brands / Logos ──────────────────────────────────────────── */
function BrandsBlock({ props }: { props: Record<string, unknown> }) {
  const names = (props.names as string[]) || [];
  return (
    <div className="py-6">
      {(props.title as string) && (
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest text-center mb-4">{props.title as string}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {(names.length > 0 ? names : ["Brand A", "Brand B", "Brand C"]).map((name, i) => (
          <span key={i} className="text-lg font-display font-bold text-surface-300">{name}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Video ───────────────────────────────────────────────────── */
function VideoBlock({ props }: { props: Record<string, unknown> }) {
  const url = props.url as string;
  if (!url) return <div className="h-48 bg-surface-900 rounded-xl flex items-center justify-center"><Play className="h-10 w-10 text-white/50" /></div>;
  return (
    <div>
      {(props.title as string) && <h3 className="text-lg font-bold text-surface-900 mb-3">{props.title as string}</h3>}
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe src={url} className="w-full h-full" allowFullScreen />
      </div>
    </div>
  );
}

/* ── Countdown ───────────────────────────────────────────────── */
function CountdownBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div
      className="rounded-2xl px-6 py-8 text-center"
      style={{ backgroundColor: (props.bgColor as string) || "#1B2B4B", color: (props.textColor as string) || "#fff" }}
    >
      <h3 className="text-lg font-bold mb-4">{(props.title as string) || "Sale Ends In"}</h3>
      <div className="flex items-center justify-center gap-4">
        {["Days", "Hours", "Min", "Sec"].map((label) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-extrabold font-display">00</div>
            <div className="text-[10px] opacity-60 uppercase">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] opacity-50 mt-2">Timer activates on published page</p>
    </div>
  );
}

/* ── Trust Badges ────────────────────────────────────────────── */
function TrustBadgesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; label: string }>) || [];
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 rounded-xl bg-surface-50 border border-surface-100 px-4">
      {(items.length > 0 ? items : [
        { icon: "shield", label: "Secure" },
        { icon: "truck", label: "Fast Delivery" },
        { icon: "refresh", label: "Easy Returns" },
      ]).map((item, i) => {
        const Icon = iconMap[item.icon] || Shield;
        return (
          <div key={i} className="flex items-center gap-2 text-surface-600">
            <Icon className="h-5 w-5 text-brand-600" />
            <span className="text-xs font-semibold">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RENDERER MAP — includes all block types + template aliases
// ═══════════════════════════════════════════════════════════════

const renderers: Record<string, React.FC<{ props: Record<string, unknown> }>> = {
  // Core block types
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  hero: HeroBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  columns: ColumnsBlock,
  productGrid: ProductGridBlock,
  testimonial: TestimonialBlock,
  testimonials: TestimonialsBlock,
  features: FeaturesBlock,
  faq: FAQBlock,
  contactForm: ContactFormBlock,
  contactInfo: ContactInfoBlock,
  video: VideoBlock,
  countdown: CountdownBlock,
  trustBadges: TrustBadgesBlock,
  stats: StatsBlock,
  newsletter: NewsletterBlock,
  banner: BannerBlock,
  imageText: ImageTextBlock,
  "image-text": ImageTextBlock,
  gallery: GalleryBlock,
  team: TeamBlock,
  brands: BrandsBlock,

  // Template aliases → map to their base renderer
  featured_products: ProductGridBlock,
  featured_dishes: ProductGridBlock,
  featured_toys: ProductGridBlock,
  new_arrivals: ProductGridBlock,
  best_sellers: ProductGridBlock,
  categories: FeaturesBlock,
  collections: FeaturesBlock,
  menu: FeaturesBlock,
  service_cards: FeaturesBlock,
  services: FeaturesBlock,
  case_studies: FeaturesBlock,
  age_categories: FeaturesBlock,
  reservations: ContactFormBlock,
  chef: TeamBlock,
  opening_hours: ContactInfoBlock,
  lookbook: GalleryBlock,
  promotions: BannerBlock,
  projects: GalleryBlock,
  portfolio: GalleryBlock,
};

// ─── MAIN RENDERER ───────────────────────────────────────────

interface BlockRendererProps {
  block: BuilderBlock;
  isSelected?: boolean;
  onInlineEdit?: (key: string, value: string) => void;
}

export default function BlockRenderer({ block, isSelected, onInlineEdit }: BlockRendererProps) {
  // Inline editing for heading/text blocks when selected
  if (isSelected && onInlineEdit && (block.type === "heading" || block.type === "text")) {
    return <InlineEditableBlock block={block} onInlineEdit={onInlineEdit} />;
  }

  const Renderer = renderers[block.type];
  if (!Renderer) return <div className="p-4 bg-accent-50 rounded-xl text-sm text-accent-700">Unknown block: {block.type}</div>;
  return <Renderer props={block.props} />;
}

/* ─── INLINE EDITABLE BLOCK ────────────────────────────────── */

function InlineEditableBlock({ block, onInlineEdit }: { block: BuilderBlock; onInlineEdit: (key: string, value: string) => void }) {
  const isHeading = block.type === "heading";
  const text = (block.props.text as string) || "";
  const align = (block.props.align as string) || "left";
  const color = (block.props.color as string) || (isHeading ? "#171717" : "#525252");

  if (isHeading) {
    const sizeMap: Record<string, string> = { xl: "text-xl", "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl" };
    const sizeClass = sizeMap[(block.props.fontSize as string) || "2xl"] || "text-2xl";
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onInlineEdit("text", e.currentTarget.textContent || "")}
        className={`font-display font-bold ${sizeClass} outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 rounded-lg px-1 -mx-1 cursor-text`}
        style={{ color, textAlign: align as React.CSSProperties["textAlign"] }}
      >
        {text}
      </div>
    );
  }

  // Text block
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onInlineEdit("text", e.currentTarget.textContent || "")}
      className="leading-relaxed outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 rounded-lg px-1 -mx-1 cursor-text"
      style={{
        color,
        textAlign: align as React.CSSProperties["textAlign"],
        fontSize: { sm: "0.875rem", base: "1rem", lg: "1.125rem" }[(block.props.fontSize as string) || "base"] || "1rem",
      }}
    >
      {text}
    </div>
  );
}
