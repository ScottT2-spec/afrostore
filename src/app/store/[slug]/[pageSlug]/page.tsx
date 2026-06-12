"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Star,
  Truck,
  Shield,
  Headphones,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowLeft,
  Loader2,
  MessageCircle,
} from "lucide-react";

/* ─── TYPES ─────────────────────────────────────────────────── */

interface BuilderBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

interface PageData {
  store: { id: string; name: string; slug: string; logo?: string };
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    content: unknown;
    metaTitle?: string;
    metaDescription?: string;
  };
}

/* ─── ICON MAP ──────────────────────────────────────────────── */

const iconMap: Record<string, React.ElementType> = {
  truck: Truck,
  shield: Shield,
  headphones: Headphones,
  refresh: RefreshCw,
};

/* ─── BLOCK RENDERERS (public/read-only) ────────────────────── */

function HeadingBlock({ props }: { props: Record<string, unknown> }) {
  const level = (props.level as string) || "h2";
  const sizeMap: Record<string, string> = {
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };
  const cls = `font-bold ${sizeMap[(props.fontSize as string) || "2xl"] || "text-2xl"}`;
  const style = {
    color: (props.color as string) || "#171717",
    textAlign: (props.align as string) || "left",
  } as React.CSSProperties;
  const text = (props.text as string) || "Heading";

  if (level === "h1") return <h1 className={cls} style={style}>{text}</h1>;
  if (level === "h3") return <h3 className={cls} style={style}>{text}</h3>;
  if (level === "h4") return <h4 className={cls} style={style}>{text}</h4>;
  return <h2 className={cls} style={style}>{text}</h2>;
}

function TextBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <p
      className="leading-relaxed"
      style={{
        color: (props.color as string) || "#525252",
        textAlign: (props.align as React.CSSProperties["textAlign"]) || "left",
        fontSize: { sm: "0.875rem", base: "1rem", lg: "1.125rem" }[(props.fontSize as string) || "base"] || "1rem",
      }}
    >
      {(props.text as string) || ""}
    </p>
  );
}

function ImageBlock({ props }: { props: Record<string, unknown> }) {
  const src = props.src as string;
  if (!src) return null;
  const radiusMap: Record<string, string> = { none: "0", lg: "0.5rem", xl: "0.75rem", "2xl": "1rem" };
  return (
    <img
      src={src}
      alt={(props.alt as string) || ""}
      className="w-full object-cover"
      style={{ borderRadius: radiusMap[(props.rounded as string) || "xl"] || "0.75rem" }}
    />
  );
}

function ButtonBlock({ props }: { props: Record<string, unknown> }) {
  const variant = (props.variant as string) || "primary";
  const size = (props.size as string) || "md";

  const variantStyles: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
    accent: "bg-orange-500 text-white hover:bg-orange-600",
  };
  const sizeStyles: Record<string, string> = {
    sm: "text-sm py-2 px-4",
    md: "text-sm py-3 px-6",
    lg: "text-base py-4 px-8",
  };

  return (
    <div style={{ textAlign: (props.align as React.CSSProperties["textAlign"]) || "left" }}>
      <a
        href={(props.href as string) || "#"}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md}`}
      >
        {(props.text as string) || "Button"}
      </a>
    </div>
  );
}

function HeroBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div
      className="rounded-2xl px-8 py-16 sm:py-20"
      style={{
        backgroundColor: (props.bgColor as string) || "#1B2B4B",
        color: (props.textColor as string) || "#fff",
        textAlign: (props.align as React.CSSProperties["textAlign"]) || "center",
      }}
    >
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
        {(props.heading as string) || "Hero Heading"}
      </h1>
      <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
        {(props.subheading as string) || "Subheading text"}
      </p>
      {(props.buttonText as string) && (
        <a
          href={(props.buttonHref as string) || "#"}
          className="inline-flex items-center justify-center rounded-xl bg-orange-500 text-white font-semibold py-3 px-6 hover:bg-orange-600 transition-colors"
        >
          {props.buttonText as string}
        </a>
      )}
    </div>
  );
}

function SpacerBlock({ props }: { props: Record<string, unknown> }) {
  return <div style={{ height: `${(props.height as number) || 40}px` }} />;
}

function DividerBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <hr
      style={{
        borderColor: (props.color as string) || "#e5e5e5",
        borderWidth: `${(props.thickness as number) || 1}px`,
        borderStyle: (props.style as string) || "solid",
      }}
    />
  );
}

function ColumnsBlock({ props }: { props: Record<string, unknown> }) {
  const children = (props.children as BuilderBlock[]) || [];
  const cols = (props.columns as number) || 2;
  return (
    <div
      className="grid grid-cols-1 gap-6"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children.map((child) => (
        <div key={child.id}>
          <PublicBlockRenderer block={child} />
        </div>
      ))}
    </div>
  );
}

function ProductGridBlock({ props }: { props: Record<string, unknown> }) {
  const limit = (props.limit as number) || 6;
  const cols = (props.columns as number) || 3;
  return (
    <div>
      {(props.title as string) && (
        <h3 className="text-xl font-bold text-gray-900 mb-4">{props.title as string}</h3>
      )}
      <div
        className="grid grid-cols-2 gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50" />
            <div className="p-4">
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialBlock({ props }: { props: Record<string, unknown> }) {
  const rating = (props.rating as number) || 5;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-700 mb-4 italic">
        &ldquo;{(props.text as string) || "Great product!"}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
          {((props.name as string) || "C")[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{(props.name as string) || "Customer"}</p>
          <p className="text-xs text-gray-500">{(props.role as string) || "Buyer"}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; title: string; desc: string }>) || [];
  return (
    <div>
      {(props.title as string) && (
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{props.title as string}</h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div key={i} className="text-center p-4 rounded-xl border border-gray-100">
              <Icon className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FAQBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ question: string; answer: string }>) || [];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {(props.title as string) && (
        <h3 className="text-xl font-bold text-gray-900 mb-4">{props.title as string}</h3>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              {item.question}
              {open === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm text-gray-600">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactFormBlock({ props }: { props: Record<string, unknown> }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      {(props.title as string) && (
        <h3 className="text-lg font-bold text-gray-900 mb-1">{props.title as string}</h3>
      )}
      {(props.subtitle as string) && (
        <p className="text-xs text-gray-500 mb-4">{props.subtitle as string}</p>
      )}
      {submitted ? (
        <div className="text-center py-8">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">Message sent!</h4>
          <p className="text-sm text-gray-500">We&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3">
          <input className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Your name" required />
          <input className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Your email" type="email" required />
          <textarea className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Your message" rows={3} required />
          <button type="submit" className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-3 hover:bg-indigo-700 transition-colors">
            {(props.buttonText as string) || "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}

function VideoBlock({ props }: { props: Record<string, unknown> }) {
  const url = props.url as string;
  // Convert YouTube/Vimeo URLs to embeddable format
  const embedUrl = useMemo(() => {
    if (!url) return "";
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
    return url;
  }, [url]);

  if (!embedUrl) return null;

  return (
    <div>
      {(props.title as string) && (
        <h3 className="text-lg font-bold text-gray-900 mb-3">{props.title as string}</h3>
      )}
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
      </div>
    </div>
  );
}

function CountdownBlock({ props }: { props: Record<string, unknown> }) {
  const endDate = (props.endDate as string) || "";
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, min: 0, sec: 0 });

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div
      className="rounded-2xl px-6 py-8 text-center"
      style={{
        backgroundColor: (props.bgColor as string) || "#1B2B4B",
        color: (props.textColor as string) || "#fff",
      }}
    >
      <h3 className="text-lg font-bold mb-4">
        {(props.title as string) || "Sale Ends In"}
      </h3>
      <div className="flex items-center justify-center gap-4">
        {[
          { label: "Days", val: timeLeft.days },
          { label: "Hours", val: timeLeft.hours },
          { label: "Min", val: timeLeft.min },
          { label: "Sec", val: timeLeft.sec },
        ].map(({ label, val }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-extrabold tabular-nums">
              {String(val).padStart(2, "0")}
            </div>
            <div className="text-[10px] opacity-60 uppercase">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBadgesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; label: string }>) || [];
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4">
      {items.map((item, i) => {
        const Icon = iconMap[item.icon] || Shield;
        return (
          <div key={i} className="flex items-center gap-2 text-gray-600">
            <Icon className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-semibold">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── BLOCK RENDERER ────────────────────────────────────────── */

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
  testimonial: TestimonialBlock,
  features: FeaturesBlock,
  faq: FAQBlock,
  contactForm: ContactFormBlock,
  video: VideoBlock,
  countdown: CountdownBlock,
  trustBadges: TrustBadgesBlock,
};

function PublicBlockRenderer({ block }: { block: BuilderBlock }) {
  const Renderer = renderers[block.type];
  if (!Renderer) return null;
  return <Renderer props={block.props} />;
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          // Set document title from meta
          if (json.data.page.metaTitle) {
            document.title = json.data.page.metaTitle;
          } else {
            document.title = `${json.data.page.title} — ${json.data.store.name}`;
          }
        } else {
          setError(json.error || "Page not found");
        }
      } catch {
        setError("Failed to load page");
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-6">{error || "This page doesn't exist."}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const { store, page } = data;
  const blocks: BuilderBlock[] = Array.isArray(page.content) ? (page.content as BuilderBlock[]) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href={`/store/${slug}`} className="flex items-center gap-2">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-bold text-gray-900">{store.name}</span>
          </Link>
          <Link
            href={`/store/${slug}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Store
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {blocks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">This page has no content yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block) => (
              <PublicBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} {store.name}. Powered by <span className="font-semibold text-indigo-500">AfroStore</span></p>
      </footer>
    </div>
  );
}
