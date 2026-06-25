"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Headphones, Play, RefreshCw, Shield, Star, Truck } from "@/components/icons/FilledIcons";

import { BuilderBlock } from "@/lib/builder/types";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  truck: Truck, shield: Shield, headphones: Headphones, refresh: RefreshCw,
};

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

function TextBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <p
      className={`text-${(props.fontSize as string) || "base"} leading-relaxed`}
      style={{ color: (props.color as string) || "#525252", textAlign: (props.align as any) || "left" }}
    >
      {(props.text as string) || ""}
    </p>
  );
}

function ImageBlock({ props }: { props: Record<string, unknown> }) {
  const src = props.src as string;
  if (!src) return <div className="h-48 bg-surface-100 rounded-xl flex items-center justify-center text-surface-400 text-sm">Click to add image URL</div>;
  return <img src={src} alt={(props.alt as string) || ""} className={`w-${(props.width as string) || "full"} rounded-${(props.rounded as string) || "xl"} object-cover`} />;
}

function ButtonBlock({ props }: { props: Record<string, unknown> }) {
  const variants: Record<string, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
  };
  const sizes: Record<string, string> = { sm: "text-sm py-2 px-4", md: "text-sm py-3 px-6", lg: "text-base py-4 px-8" };
  return (
    <div style={{ textAlign: (props.align as any) || "left" }}>
      <a href={(props.href as string) || "#"} className={`${variants[(props.variant as string) || "primary"]} ${sizes[(props.size as string) || "md"]} inline-flex`}>
        {(props.text as string) || "Button"}
      </a>
    </div>
  );
}

function HeroBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div
      className="rounded-2xl px-8 py-16 sm:py-20"
      style={{ backgroundColor: (props.bgColor as string) || "#1B2B4B", color: (props.textColor as string) || "#fff", textAlign: (props.align as any) || "center" }}
    >
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-4">{(props.heading as string) || "Hero Heading"}</h1>
      <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">{(props.subheading as string) || "Subheading text"}</p>
      {(props.buttonText as string) ? (
        <a href={(props.buttonHref as string) || "#"} className="btn-accent inline-flex">{props.buttonText as string}</a>
      ) : null}
    </div>
  );
}

function SpacerBlock({ props }: { props: Record<string, unknown> }) {
  return <div style={{ height: `${(props.height as number) || 40}px` }} />;
}

function DividerBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <hr style={{ borderColor: (props.color as string) || "#e5e5e5", borderWidth: `${(props.thickness as number) || 1}px`, borderStyle: (props.style as string) || "solid" }} />
  );
}

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

function ProductGridBlock({ props }: { props: Record<string, unknown> }) {
  const limit = (props.limit as number) || 6;
  const cols = (props.columns as number) || 3;
  return (
    <div>
      {(props.title as string) ? <h3 className="text-xl font-bold text-surface-900 mb-4">{props.title as string}</h3> : null}
      <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 bg-white overflow-hidden">
            <div className="h-32 bg-surface-100" />
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

function FeaturesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; title: string; desc: string }>) || [];
  return (
    <div>
      {(props.title as string) ? <h3 className="text-xl font-bold text-surface-900 mb-6 text-center">{props.title as string}</h3> : null}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div key={i} className="text-center p-4 rounded-xl border border-surface-100">
              <Icon className="h-8 w-8 text-brand-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-surface-900 mb-1">{item.title}</h4>
              <p className="text-xs text-surface-500">{item.desc}</p>
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
      {(props.title as string) ? <h3 className="text-xl font-bold text-surface-900 mb-4">{props.title as string}</h3> : null}
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

function ContactFormBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6">
      {(props.title as string) ? <h3 className="text-lg font-bold text-surface-900 mb-1">{props.title as string}</h3> : null}
      {(props.subtitle as string) ? <p className="text-xs text-surface-500 mb-4">{props.subtitle as string}</p> : null}
      <div className="space-y-3">
        <input className="input-field" placeholder="Your name" disabled />
        <input className="input-field" placeholder="Your email" disabled />
        <textarea className="input-field" placeholder="Your message" rows={3} disabled />
        <button className="btn-primary">{(props.buttonText as string) || "Send"}</button>
      </div>
    </div>
  );
}

function VideoBlock({ props }: { props: Record<string, unknown> }) {
  const url = props.url as string;
  if (!url) return <div className="h-48 bg-surface-900 rounded-xl flex items-center justify-center"><Play className="h-10 w-10 text-white/50" /></div>;
  return (
    <div>
      {(props.title as string) ? <h3 className="text-lg font-bold text-surface-900 mb-3">{props.title as string}</h3> : null}
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe src={url} className="w-full h-full" allowFullScreen />
      </div>
    </div>
  );
}

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

function TrustBadgesBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as Array<{ icon: string; label: string }>) || [];
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4">
      {items.map((item, i) => {
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

// ─── MAIN RENDERER ───────────────────────────────────────────

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
