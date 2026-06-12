"use client";

import { BuilderBlock, BlockType } from "@/lib/builder/types";
import { X, Trash2, Plus, Copy } from "lucide-react";

interface PropertyPanelProps {
  block: BuilderBlock;
  onUpdate: (block: BuilderBlock) => void;
  onCommit?: () => void;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

function PropInput({ label, value, onChange, type = "text", options, rows }: {
  label: string;
  value: unknown;
  onChange: (val: unknown) => void;
  type?: "text" | "textarea" | "number" | "color" | "select" | "toggle";
  options?: { value: string; label: string }[];
  rows?: number;
}) {
  if (type === "toggle") {
    return (
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs font-medium text-surface-700">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-brand-600" : "bg-surface-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
        </button>
      </label>
    );
  }

  if (type === "select") {
    return (
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">{label}</label>
        <select value={value as string} onChange={(e) => onChange(e.target.value)} className="input-field text-sm py-2">
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  if (type === "color") {
    return (
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input type="color" value={(value as string) || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 rounded-lg border border-surface-200 cursor-pointer" />
          <input type="text" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} className="input-field text-sm py-1.5 flex-1" />
        </div>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">{label}</label>
        <textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} className="input-field text-sm py-2" rows={rows || 3} />
      </div>
    );
  }

  if (type === "number") {
    return (
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">{label}</label>
        <input type="number" value={(value as number) || 0} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className="input-field text-sm py-2" />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-surface-700 mb-1">{label}</label>
      <input type="text" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} className="input-field text-sm py-2" />
    </div>
  );
}

// ─── PROPERTY CONFIGS PER BLOCK TYPE ─────────────────────────

function HeadingProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Text" value={block.props.text} onChange={(v) => update("text", v)} type="textarea" rows={2} />
      <PropInput label="Level" value={block.props.level} onChange={(v) => update("level", v)} type="select"
        options={[{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }]} />
      <PropInput label="Size" value={block.props.fontSize} onChange={(v) => update("fontSize", v)} type="select"
        options={[{ value: "xl", label: "Small" }, { value: "2xl", label: "Medium" }, { value: "3xl", label: "Large" }, { value: "4xl", label: "XL" }]} />
      <PropInput label="Align" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      <PropInput label="Color" value={block.props.color} onChange={(v) => update("color", v)} type="color" />
    </>
  );
}

function TextProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Content" value={block.props.text} onChange={(v) => update("text", v)} type="textarea" rows={4} />
      <PropInput label="Align" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      <PropInput label="Color" value={block.props.color} onChange={(v) => update("color", v)} type="color" />
    </>
  );
}

function ImageProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Image URL" value={block.props.src} onChange={(v) => update("src", v)} />
      <PropInput label="Alt Text" value={block.props.alt} onChange={(v) => update("alt", v)} />
      <PropInput label="Corners" value={block.props.rounded} onChange={(v) => update("rounded", v)} type="select"
        options={[{ value: "none", label: "Square" }, { value: "lg", label: "Rounded" }, { value: "xl", label: "More Rounded" }, { value: "2xl", label: "Very Round" }]} />
    </>
  );
}

function ButtonProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Text" value={block.props.text} onChange={(v) => update("text", v)} />
      <PropInput label="Link URL" value={block.props.href} onChange={(v) => update("href", v)} />
      <PropInput label="Style" value={block.props.variant} onChange={(v) => update("variant", v)} type="select"
        options={[{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "accent", label: "Accent" }]} />
      <PropInput label="Size" value={block.props.size} onChange={(v) => update("size", v)} type="select"
        options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
      <PropInput label="Align" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
    </>
  );
}

function HeroProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Heading" value={block.props.heading} onChange={(v) => update("heading", v)} />
      <PropInput label="Subheading" value={block.props.subheading} onChange={(v) => update("subheading", v)} type="textarea" rows={2} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      <PropInput label="Button Link" value={block.props.buttonHref} onChange={(v) => update("buttonHref", v)} />
      <PropInput label="Background" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="color" />
      <PropInput label="Text Color" value={block.props.textColor} onChange={(v) => update("textColor", v)} type="color" />
      <PropInput label="Align" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
    </>
  );
}

function SpacerProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return <PropInput label="Height (px)" value={block.props.height} onChange={(v) => update("height", v)} type="number" />;
}

function DividerProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Color" value={block.props.color} onChange={(v) => update("color", v)} type="color" />
      <PropInput label="Thickness" value={block.props.thickness} onChange={(v) => update("thickness", v)} type="number" />
    </>
  );
}

function ProductGridProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      <PropInput label="Product Count" value={block.props.limit} onChange={(v) => update("limit", v)} type="number" />
      <PropInput label="Show Prices" value={block.props.showPrice} onChange={(v) => update("showPrice", v)} type="toggle" />
    </>
  );
}

function TestimonialProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Name" value={block.props.name} onChange={(v) => update("name", v)} />
      <PropInput label="Role" value={block.props.role} onChange={(v) => update("role", v)} />
      <PropInput label="Quote" value={block.props.text} onChange={(v) => update("text", v)} type="textarea" rows={3} />
      <PropInput label="Rating" value={block.props.rating} onChange={(v) => update("rating", v)} type="number" />
    </>
  );
}

function CountdownProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Background" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="color" />
      <PropInput label="Text Color" value={block.props.textColor} onChange={(v) => update("textColor", v)} type="color" />
    </>
  );
}

function GenericProps({ block }: { block: BuilderBlock }) {
  return <p className="text-xs text-surface-500">Properties for this block type coming soon.</p>;
}

const propEditors: Record<string, React.FC<{ block: BuilderBlock; update: (key: string, val: unknown) => void }>> = {
  heading: HeadingProps, text: TextProps, image: ImageProps, button: ButtonProps,
  hero: HeroProps, spacer: SpacerProps, divider: DividerProps,
  productGrid: ProductGridProps, testimonial: TestimonialProps, countdown: CountdownProps,
};

// ─── PANEL ───────────────────────────────────────────────────

export default function PropertyPanel({ block, onUpdate, onCommit, onClose, onDelete, onDuplicate }: PropertyPanelProps) {
  const update = (key: string, val: unknown) => {
    onUpdate({ ...block, props: { ...block.props, [key]: val } });
  };

  const Editor = propEditors[block.type] || GenericProps;

  return (
    <div className="w-72 border-l border-surface-200 bg-white h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-surface-100">
        <h3 className="text-sm font-bold text-surface-900 capitalize">{block.type} Properties</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-100"><X className="h-4 w-4 text-surface-400" /></button>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Editor block={block} update={update} />
      </div>
      <div className="p-4 border-t border-surface-100 space-y-2">
        {onDuplicate && (
          <button onClick={onDuplicate} className="w-full flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-100 transition-colors">
            <Copy className="h-3.5 w-3.5" /> Duplicate Block
          </button>
        )}
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
          <Trash2 className="h-3.5 w-3.5" /> Delete Block
        </button>
      </div>
    </div>
  );
}
