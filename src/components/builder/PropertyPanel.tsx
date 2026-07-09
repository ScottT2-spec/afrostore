"use client";
import { Plus, X } from "lucide-react";
import { Copy, Trash2 } from "@/components/icons/FilledIcons";

import { BuilderBlock } from "@/lib/builder/types";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";

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
      <SingleImageUpload
        image={(block.props.src as string) || null}
        onChange={(url) => update("src", url || "")}
        label="Image"
        compact
      />
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
      <PropInput label="Badge" value={block.props.badge} onChange={(v) => update("badge", v)} />
      <PropInput label="Heading" value={block.props.heading} onChange={(v) => update("heading", v)} />
      <PropInput label="Subheading" value={block.props.subheading} onChange={(v) => update("subheading", v)} type="textarea" rows={2} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      <PropInput label="Button Link" value={block.props.buttonHref} onChange={(v) => update("buttonHref", v)} />
      <PropInput label="Secondary Button" value={block.props.secondaryButtonText} onChange={(v) => update("secondaryButtonText", v)} />
      <PropInput label="Secondary Link" value={block.props.secondaryButtonHref} onChange={(v) => update("secondaryButtonHref", v)} />
      <PropInput label="Button Color" value={block.props.buttonColor} onChange={(v) => update("buttonColor", v)} type="color" />
      <PropInput label="Button Text Color" value={block.props.buttonTextColor} onChange={(v) => update("buttonTextColor", v)} type="color" />
      <SingleImageUpload image={(block.props.bgImage as string) || null} onChange={(url) => update("bgImage", url || "")} label="Background Image" compact />
      <PropInput label="Overlay Opacity" value={block.props.overlayOpacity ?? 50} onChange={(v) => update("overlayOpacity", v)} type="number" />
      <PropInput label="Overlay Color" value={block.props.overlayColor} onChange={(v) => update("overlayColor", v)} type="color" />
      <PropInput label="Background Style" value={block.props.bgStyle} onChange={(v) => update("bgStyle", v)} type="select"
        options={[
          { value: "", label: "Custom Color" },
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
          { value: "accent", label: "Accent" },
          { value: "gradient", label: "Gradient" },
        ]} />
      <PropInput label="Background Color" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="color" />
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

function ContactInfoProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<{ icon: string; title: string; value: string }>) || [];
  const iconOptions = [
    { value: "mail", label: "Email" }, { value: "phone", label: "Phone" },
    { value: "message", label: "WhatsApp" }, { value: "map-pin", label: "Address" },
    { value: "clock", label: "Hours" }, { value: "globe", label: "Website" },
  ];
  const updateItem = (index: number, key: string, val: string) => {
    const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, { icon: "mail", title: "Email", value: "" }]);
  const removeItem = (index: number) => update("items", items.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Business Hours" value={block.props.hours} onChange={(v) => update("hours", v)} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Contact Items</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Item {i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <PropInput label="Type" value={item.icon} onChange={(v) => updateItem(i, "icon", v as string)} type="select" options={iconOptions} />
              <PropInput label="Label" value={item.title} onChange={(v) => updateItem(i, "title", v as string)} />
              <PropInput label="Value" value={item.value} onChange={(v) => updateItem(i, "value", v as string)} />
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Contact Item
        </button>
      </div>
    </>
  );
}

function ContactFormProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} type="textarea" rows={2} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
    </>
  );
}

function FeaturesProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<{ icon: string; title: string; desc: string }>) || [];
  const iconOptions = [
    { value: "truck", label: "Truck" }, { value: "shield", label: "Shield" },
    { value: "headphones", label: "Support" }, { value: "zap", label: "Zap" },
    { value: "heart", label: "Heart" }, { value: "award", label: "Award" },
    { value: "globe", label: "Globe" }, { value: "rocket", label: "Rocket" },
    { value: "lock", label: "Lock" }, { value: "star", label: "Star" },
    { value: "target", label: "Target" }, { value: "check", label: "Check" },
  ];
  const updateItem = (index: number, key: string, val: string) => {
    const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, { icon: "star", title: "Feature", desc: "Description" }]);
  const removeItem = (index: number) => update("items", items.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <PropInput label="Background" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="select"
        options={[{ value: "transparent", label: "None" }, { value: "surface", label: "Light" }, { value: "dark", label: "Dark" }]} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Features</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Feature {i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <PropInput label="Icon" value={item.icon} onChange={(v) => updateItem(i, "icon", v as string)} type="select" options={iconOptions} />
              <PropInput label="Title" value={item.title} onChange={(v) => updateItem(i, "title", v as string)} />
              <PropInput label="Description" value={item.desc} onChange={(v) => updateItem(i, "desc", v as string)} type="textarea" rows={2} />
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Feature
        </button>
      </div>
    </>
  );
}

function TestimonialsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<{ name: string; text: string; role?: string; rating?: number }>) || [];
  const updateItem = (index: number, key: string, val: unknown) => {
    const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, { name: "Customer", text: "Great experience!", role: "Buyer", rating: 5 }]);
  const removeItem = (index: number) => update("items", items.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Testimonials</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Testimonial {i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <PropInput label="Name" value={item.name} onChange={(v) => updateItem(i, "name", v)} />
              <PropInput label="Role" value={item.role} onChange={(v) => updateItem(i, "role", v)} />
              <PropInput label="Quote" value={item.text} onChange={(v) => updateItem(i, "text", v)} type="textarea" rows={2} />
              <PropInput label="Rating (1-5)" value={item.rating} onChange={(v) => updateItem(i, "rating", v)} type="number" />
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Testimonial
        </button>
      </div>
    </>
  );
}

function BannerProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      <PropInput label="Button Link" value={block.props.buttonHref} onChange={(v) => update("buttonHref", v)} />
      <SingleImageUpload image={(block.props.bgImage as string) || null} onChange={(url) => update("bgImage", url || "")} label="Background Image" compact />
      <PropInput label="Overlay Color" value={block.props.overlayColor} onChange={(v) => update("overlayColor", v)} type="color" />
      <PropInput label="Overlay Opacity" value={block.props.overlayOpacity ?? 35} onChange={(v) => update("overlayOpacity", v)} type="number" />
      <PropInput label="Text Color" value={block.props.textColor} onChange={(v) => update("textColor", v)} type="color" />
      <PropInput label="Button Color" value={block.props.buttonColor} onChange={(v) => update("buttonColor", v)} type="color" />
      <PropInput label="Button Text Color" value={block.props.buttonTextColor} onChange={(v) => update("buttonTextColor", v)} type="color" />
      <PropInput label="Background" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="select"
        options={[{ value: "brand", label: "Brand" }, { value: "accent", label: "Accent" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
    </>
  );
}

function StatsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<{ value: string; label: string; icon?: string }>) || [];
  const updateItem = (index: number, key: string, val: string) => {
    const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
    update("items", next);
  };
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Background" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="select"
        options={[{ value: "brand", label: "Brand" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Stats</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <PropInput label="Value" value={item.value} onChange={(v) => updateItem(i, "value", v as string)} />
              <PropInput label="Label" value={item.label} onChange={(v) => updateItem(i, "label", v as string)} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FAQProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<{ question: string; answer: string }>) || [];
  const updateItem = (index: number, key: string, val: string) => {
    const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, { question: "Question?", answer: "Answer." }]);
  const removeItem = (index: number) => update("items", items.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">FAQ Items</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Q{i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <PropInput label="Question" value={item.question} onChange={(v) => updateItem(i, "question", v as string)} />
              <PropInput label="Answer" value={item.answer} onChange={(v) => updateItem(i, "answer", v as string)} type="textarea" rows={2} />
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add FAQ
        </button>
      </div>
    </>
  );
}

function NewsletterProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} type="textarea" rows={2} />
      <PropInput label="Background" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="select"
        options={[{ value: "brand", label: "Brand" }, { value: "dark", label: "Dark" }, { value: "surface", label: "Light" }]} />
    </>
  );
}

function ImageTextProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Badge" value={block.props.badge} onChange={(v) => update("badge", v)} />
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Text" value={block.props.text} onChange={(v) => update("text", v)} type="textarea" rows={4} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      <PropInput label="Button Link" value={block.props.buttonHref} onChange={(v) => update("buttonHref", v)} />
      <PropInput label="Reverse Layout" value={block.props.reverse} onChange={(v) => update("reverse", v)} type="toggle" />
      <SingleImageUpload image={(block.props.image as string) || null} onChange={(url) => update("image", url || "")} label="Image" compact />
      <PropInput label="Image Alt Text" value={block.props.imageAlt} onChange={(v) => update("imageAlt", v)} />
      <PropInput label="Background Color" value={block.props.bgColor} onChange={(v) => update("bgColor", v)} type="color" />
      <PropInput label="Heading Color" value={block.props.headingColor} onChange={(v) => update("headingColor", v)} type="color" />
      <PropInput label="Body Color" value={block.props.bodyColor} onChange={(v) => update("bodyColor", v)} type="color" />
      <PropInput label="Text Color" value={block.props.textColor} onChange={(v) => update("textColor", v)} type="color" />
      <PropInput label="Button Color" value={block.props.buttonColor} onChange={(v) => update("buttonColor", v)} type="color" />
      <PropInput label="Button Text Color" value={block.props.buttonTextColor} onChange={(v) => update("buttonTextColor", v)} type="color" />
    </>
  );
}

function GalleryProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const images = (block.props.images as Array<{ src: string; alt?: string }>) || [];
  const updateImage = (index: number, key: string, val: string) => {
    const next = images.map((image, i) => (i === index ? { ...image, [key]: val } : image));
    update("images", next);
  };
  const addImage = () => update("images", [...images, { src: "", alt: "" }]);
  const removeImage = (index: number) => update("images", images.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} type="textarea" rows={2} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Gallery Images</label>
        <div className="space-y-3">
          {images.map((image, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Image {i + 1}</span>
                <button onClick={() => removeImage(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <SingleImageUpload image={image.src || null} onChange={(url) => updateImage(i, "src", url || "")} label="Image" compact />
              <PropInput label="Alt Text" value={image.alt} onChange={(v) => updateImage(i, "alt", v as string)} />
            </div>
          ))}
        </div>
        <button onClick={addImage} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Image
        </button>
      </div>
    </>
  );
}

function TeamProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const members = (block.props.members as Array<{ name: string; role: string; image?: string }>) || [];
  const updateMember = (index: number, key: string, val: string) => {
    const next = members.map((m, i) => i === index ? { ...m, [key]: val } : m);
    update("members", next);
  };
  const addMember = () => update("members", [...members, { name: "New Member", role: "Role" }]);
  const removeMember = (index: number) => update("members", members.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} type="textarea" rows={2} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Team Members</label>
        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Member {i + 1}</span>
                <button onClick={() => removeMember(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <PropInput label="Name" value={m.name} onChange={(v) => updateMember(i, "name", v as string)} />
              <PropInput label="Role" value={m.role} onChange={(v) => updateMember(i, "role", v as string)} />
              <SingleImageUpload image={m.image || null} onChange={(url) => updateMember(i, "image", url || "")} label="Photo" compact />
            </div>
          ))}
        </div>
        <button onClick={addMember} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Member
        </button>
      </div>
    </>
  );
}

function BrandsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const names = (block.props.names as string[]) || [];
  const updateName = (index: number, val: string) => {
    const next = names.map((n, i) => i === index ? val : n);
    update("names", next);
  };
  const addName = () => update("names", [...names, "Brand Name"]);
  const removeName = (index: number) => update("names", names.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Brand Names</label>
        <div className="space-y-2">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={name} onChange={(e) => updateName(i, e.target.value)} className="input-field text-sm py-1.5 flex-1" />
              <button onClick={() => removeName(i)} className="text-red-500 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <button onClick={addName} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Brand
        </button>
      </div>
    </>
  );
}

function TrustBadgesProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<{ icon: string; label: string }>) || [];
  const iconOptions = [
    { value: "shield", label: "Shield" }, { value: "truck", label: "Truck" },
    { value: "refresh", label: "Returns" }, { value: "headphones", label: "Support" },
    { value: "lock", label: "Lock" }, { value: "check", label: "Check" },
    { value: "star", label: "Star" }, { value: "heart", label: "Heart" },
    { value: "award", label: "Award" }, { value: "zap", label: "Zap" },
  ];
  const updateItem = (index: number, key: string, val: string) => {
    const next = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, { icon: "shield", label: "Badge" }]);
  const removeItem = (index: number) => update("items", items.filter((_, i) => i !== index));
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-2">Badges</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-surface-400 uppercase">Badge {i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
              <PropInput label="Icon" value={item.icon} onChange={(v) => updateItem(i, "icon", v as string)} type="select" options={iconOptions} />
              <PropInput label="Label" value={item.label} onChange={(v) => updateItem(i, "label", v as string)} />
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 w-full rounded-lg border border-dashed border-surface-300 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <Plus className="h-3 w-3 inline mr-1" /> Add Badge
        </button>
      </div>
    </>
  );
}

function VideoProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Video URL" value={block.props.url} onChange={(v) => update("url", v)} />
    </>
  );
}

function ColumnsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      <PropInput label="Gap" value={block.props.gap} onChange={(v) => update("gap", v)} type="number" />
    </>
  );
}

// ─── FASHION TEMPLATE BLOCK PROPERTY EDITORS ────────────────

function FashionHeroSliderProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const slides = (block.props.slides as Array<Record<string, unknown>>) || [];
  const updateSlide = (idx: number, key: string, val: unknown) => {
    const next = slides.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    update("slides", next);
  };
  const addSlide = () => {
    update("slides", [...slides, { subtitle: "NEW SLIDE", titleLine1: "Heading Line 1", titleLine2: "Heading Line 2", description: "Description text", buttonText: "SHOP NOW", buttonLink: "/shop", backgroundImage: "", textPosition: "center", colorScheme: "dark" }]);
  };
  const removeSlide = (idx: number) => {
    update("slides", slides.filter((_, i) => i !== idx));
  };
  return (
    <>
      <PropInput label="Min Height" value={block.props.minHeight} onChange={(v) => update("minHeight", v)} />
      <PropInput label="Autoplay Speed (ms)" value={block.props.autoplaySpeed} onChange={(v) => update("autoplaySpeed", v)} type="number" />
      {slides.map((slide, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Slide {i + 1}</span>
            {slides.length > 1 && <button onClick={() => removeSlide(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(i, "subtitle", v)} />
          <PropInput label="Title Line 1" value={slide.titleLine1} onChange={(v) => updateSlide(i, "titleLine1", v)} />
          <PropInput label="Title Line 2" value={slide.titleLine2} onChange={(v) => updateSlide(i, "titleLine2", v)} />
          <PropInput label="Description" value={slide.description} onChange={(v) => updateSlide(i, "description", v)} type="textarea" rows={2} />
          <PropInput label="Button Text" value={slide.buttonText} onChange={(v) => updateSlide(i, "buttonText", v)} />
          <PropInput label="Button Link" value={slide.buttonLink} onChange={(v) => updateSlide(i, "buttonLink", v)} />
          <SingleImageUpload image={(slide.backgroundImage as string) || null} onChange={(url) => updateSlide(i, "backgroundImage", url || "")} label="Background Image" compact />
          <PropInput label="Text Position" value={slide.textPosition} onChange={(v) => updateSlide(i, "textPosition", v)} type="select"
            options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
          <PropInput label="Color Scheme" value={slide.colorScheme} onChange={(v) => updateSlide(i, "colorScheme", v)} type="select"
            options={[{ value: "dark", label: "Dark Text" }, { value: "light", label: "Light Text" }]} />
        </div>
      ))}
      <button onClick={addSlide} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Slide
      </button>
    </>
  );
}

function FashionPromoBannersProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const banners = (block.props.banners as Array<Record<string, unknown>>) || [];
  const updateBanner = (idx: number, key: string, val: unknown) => {
    const next = banners.map((b, i) => i === idx ? { ...b, [key]: val } : b);
    update("banners", next);
  };
  const addBanner = () => {
    update("banners", [...banners, { image: "", subtitle: "NEW", title: "BANNER\nTITLE", buttonText: "Shop Now", buttonLink: "/shop", textAlign: "center" }]);
  };
  const removeBanner = (idx: number) => {
    update("banners", banners.filter((_, i) => i !== idx));
  };
  return (
    <>
      {banners.map((b, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Banner {i + 1}</span>
            {banners.length > 1 && <button onClick={() => removeBanner(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <SingleImageUpload image={(b.image as string) || null} onChange={(url) => updateBanner(i, "image", url || "")} label="Image" compact />
          <PropInput label="Subtitle" value={b.subtitle} onChange={(v) => updateBanner(i, "subtitle", v)} />
          <PropInput label="Title" value={b.title} onChange={(v) => updateBanner(i, "title", v)} type="textarea" rows={2} />
          <PropInput label="Button Text" value={b.buttonText} onChange={(v) => updateBanner(i, "buttonText", v)} />
          <PropInput label="Button Link" value={b.buttonLink} onChange={(v) => updateBanner(i, "buttonLink", v)} />
          <PropInput label="Text Align" value={b.textAlign} onChange={(v) => updateBanner(i, "textAlign", v)} type="select"
            options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
        </div>
      ))}
      <button onClick={addBanner} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Banner
      </button>
    </>
  );
}

function FashionSectionTitleProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={2} />
      <PropInput label="Align" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      <PropInput label="Max Width" value={block.props.maxWidth} onChange={(v) => update("maxWidth", v)} />
    </>
  );
}

function FashionProductGridProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const sectionTitle = (block.props.sectionTitle as Record<string, unknown>) || {};
  const updateTitle = (key: string, val: unknown) => update("sectionTitle", { ...sectionTitle, [key]: val });
  return (
    <>
      <div className="border border-surface-200 rounded-lg p-3 space-y-3">
        <span className="text-xs font-bold text-surface-700">Section Header</span>
        <PropInput label="Subtitle" value={sectionTitle.subtitle} onChange={(v) => updateTitle("subtitle", v)} />
        <PropInput label="Title" value={sectionTitle.title} onChange={(v) => updateTitle("title", v)} />
        <PropInput label="Description" value={sectionTitle.description} onChange={(v) => updateTitle("description", v)} type="textarea" rows={2} />
      </div>
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      <PropInput label="Max Products" value={block.props.maxProducts} onChange={(v) => update("maxProducts", v)} type="number" />
      <PropInput label="Filter" value={block.props.filter} onChange={(v) => update("filter", v)} type="select"
        options={[
          { value: "all", label: "All Products" },
          { value: "featured", label: "Featured Only" },
          { value: "bestseller", label: "Bestsellers (tag)" },
          { value: "new-arrival", label: "New Arrivals (tag)" },
          { value: "sale", label: "On Sale (tag)" },
        ]} />
      <PropInput label="Custom Tag Filter" value={block.props.filterTag} onChange={(v) => update("filterTag", v)} />
      <PropInput label="Show Category" value={block.props.showCategory} onChange={(v) => update("showCategory", v)} type="toggle" />
      <PropInput label="Show Hover Image" value={block.props.showHoverImage} onChange={(v) => update("showHoverImage", v)} type="toggle" />
      <p className="text-xs text-surface-400">Products are pulled from your store automatically. Use the Featured toggle or Tags in your product settings to control which products appear here.</p>
    </>
  );
}

function FashionCategoryCardsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const sectionTitle = (block.props.sectionTitle as Record<string, unknown>) || {};
  const categories = (block.props.categories as Array<Record<string, unknown>>) || [];
  const updateTitle = (key: string, val: unknown) => update("sectionTitle", { ...sectionTitle, [key]: val });
  const updateCat = (idx: number, key: string, val: unknown) => {
    const next = categories.map((c, i) => i === idx ? { ...c, [key]: val } : c);
    update("categories", next);
  };
  const addCat = () => {
    update("categories", [...categories, { name: "New Category", image: "", productCount: 0, link: "/shop" }]);
  };
  const removeCat = (idx: number) => {
    update("categories", categories.filter((_, i) => i !== idx));
  };
  return (
    <>
      <div className="border border-surface-200 rounded-lg p-3 space-y-3">
        <span className="text-xs font-bold text-surface-700">Section Header</span>
        <PropInput label="Subtitle" value={sectionTitle.subtitle} onChange={(v) => updateTitle("subtitle", v)} />
        <PropInput label="Title" value={sectionTitle.title} onChange={(v) => updateTitle("title", v)} />
        <PropInput label="Description" value={sectionTitle.description} onChange={(v) => updateTitle("description", v)} type="textarea" rows={2} />
      </div>
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      {categories.map((c, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Category {i + 1}</span>
            {categories.length > 1 && <button onClick={() => removeCat(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Name" value={c.name} onChange={(v) => updateCat(i, "name", v)} />
          <SingleImageUpload image={(c.image as string) || null} onChange={(url) => updateCat(i, "image", url || "")} label="Image" compact />
          <PropInput label="Product Count" value={c.productCount} onChange={(v) => updateCat(i, "productCount", v)} type="number" />
          <PropInput label="Link" value={c.link} onChange={(v) => updateCat(i, "link", v)} />
        </div>
      ))}
      <button onClick={addCat} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Category
      </button>
    </>
  );
}

function FashionTestimonialsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const testimonials = (block.props.testimonials as Array<Record<string, unknown>>) || [];
  const updateTest = (idx: number, key: string, val: unknown) => {
    const next = testimonials.map((t, i) => i === idx ? { ...t, [key]: val } : t);
    update("testimonials", next);
  };
  const addTest = () => {
    update("testimonials", [...testimonials, { avatar: "", text: "Customer review text.", name: "Customer Name", role: "Verified Buyer", rating: 5 }]);
  };
  const removeTest = (idx: number) => {
    update("testimonials", testimonials.filter((_, i) => i !== idx));
  };
  return (
    <>
      <PropInput label="Section Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <SingleImageUpload image={(block.props.backgroundImage as string) || null} onChange={(url) => update("backgroundImage", url || "")} label="Background Image" compact />
      {testimonials.map((t, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Review {i + 1}</span>
            {testimonials.length > 1 && <button onClick={() => removeTest(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Name" value={t.name} onChange={(v) => updateTest(i, "name", v)} />
          <PropInput label="Role" value={t.role} onChange={(v) => updateTest(i, "role", v)} />
          <PropInput label="Review" value={t.text} onChange={(v) => updateTest(i, "text", v)} type="textarea" rows={3} />
          <PropInput label="Rating (1-5)" value={t.rating} onChange={(v) => updateTest(i, "rating", v)} type="number" />
          <SingleImageUpload image={(t.avatar as string) || null} onChange={(url) => updateTest(i, "avatar", url || "")} label="Avatar" compact />
        </div>
      ))}
      <button onClick={addTest} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Review
      </button>
    </>
  );
}

function FashionBlogPostsProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const sectionTitle = (block.props.sectionTitle as Record<string, unknown>) || {};
  const posts = (block.props.posts as Array<Record<string, unknown>>) || [];
  const updateTitle = (key: string, val: unknown) => update("sectionTitle", { ...sectionTitle, [key]: val });
  const updatePost = (idx: number, key: string, val: unknown) => {
    const next = posts.map((p, i) => i === idx ? { ...p, [key]: val } : p);
    update("posts", next);
  };
  const addPost = () => {
    update("posts", [...posts, { image: "", title: "New Blog Post", excerpt: "Post excerpt...", date: { day: "01", month: "Jan" }, categories: ["News"], author: { name: "Author" }, link: "/blog", commentCount: 0 }]);
  };
  const removePost = (idx: number) => {
    update("posts", posts.filter((_, i) => i !== idx));
  };
  return (
    <>
      <div className="border border-surface-200 rounded-lg p-3 space-y-3">
        <span className="text-xs font-bold text-surface-700">Section Header</span>
        <PropInput label="Subtitle" value={sectionTitle.subtitle} onChange={(v) => updateTitle("subtitle", v)} />
        <PropInput label="Title" value={sectionTitle.title} onChange={(v) => updateTitle("title", v)} />
        <PropInput label="Description" value={sectionTitle.description} onChange={(v) => updateTitle("description", v)} type="textarea" rows={2} />
      </div>
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      {posts.map((p, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Post {i + 1}</span>
            {posts.length > 1 && <button onClick={() => removePost(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <SingleImageUpload image={(p.image as string) || null} onChange={(url) => updatePost(i, "image", url || "")} label="Image" compact />
          <PropInput label="Title" value={p.title} onChange={(v) => updatePost(i, "title", v)} />
          <PropInput label="Excerpt" value={p.excerpt} onChange={(v) => updatePost(i, "excerpt", v)} type="textarea" rows={2} />
          <PropInput label="Link" value={p.link} onChange={(v) => updatePost(i, "link", v)} />
        </div>
      ))}
      <button onClick={addPost} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Post
      </button>
    </>
  );
}

function FashionNewsletterEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const socialLinks = (block.props.socialLinks as Array<Record<string, unknown>>) || [];
  const updateSocial = (idx: number, key: string, val: unknown) => {
    const next = socialLinks.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    update("socialLinks", next);
  };
  const addSocial = () => {
    update("socialLinks", [...socialLinks, { platform: "facebook", url: "#" }]);
  };
  const removeSocial = (idx: number) => {
    update("socialLinks", socialLinks.filter((_, i) => i !== idx));
  };
  return (
    <>
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={2} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      {socialLinks.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <PropInput label="" value={s.platform} onChange={(v) => updateSocial(i, "platform", v)} type="select"
            options={[{ value: "facebook", label: "Facebook" }, { value: "twitter", label: "Twitter/X" }, { value: "instagram", label: "Instagram" }, { value: "youtube", label: "YouTube" }, { value: "tiktok", label: "TikTok" }]} />
          <PropInput label="" value={s.url} onChange={(v) => updateSocial(i, "url", v)} />
          <button onClick={() => removeSocial(i)} className="text-red-500 text-xs mt-1">✕</button>
        </div>
      ))}
      <button onClick={addSocial} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Social Link
      </button>
    </>
  );
}

function GenericProps() {
  return <p className="text-xs text-surface-500">Properties for this block type coming soon.</p>;
}

function FashionInstagramEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Instagram URL" value={block.props.instagramUrl} onChange={(v) => update("instagramUrl", v)} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      <PropInput label="Margin Bottom" value={block.props.marginBottom} onChange={(v) => update("marginBottom", v)} />
    </>
  );
}

function FashionMarqueeEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<Record<string, unknown>>) || [];
  const updateItem = (idx: number, key: string, val: unknown) => {
    const next = items.map((item, i) => i === idx ? { ...item, [key]: val } : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, { text: "New marquee text", icon: "✦" }]);
  const removeItem = (idx: number) => update("items", items.filter((_, i) => i !== idx));
  return (
    <>
      <PropInput label="Background Color" value={block.props.backgroundColor} onChange={(v) => update("backgroundColor", v)} type="color" />
      <PropInput label="Text Color" value={block.props.textColor} onChange={(v) => update("textColor", v)} type="color" />
      <PropInput label="Font Size" value={block.props.fontSize} onChange={(v) => update("fontSize", v)} />
      <PropInput label="Speed" value={block.props.speed} onChange={(v) => update("speed", v)} />
      {items.map((item, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Item {i + 1}</span>
            {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Text" value={item.text} onChange={(v) => updateItem(i, "text", v)} />
          <PropInput label="Icon" value={item.icon} onChange={(v) => updateItem(i, "icon", v)} />
        </div>
      ))}
      <button onClick={addItem} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        + Add Item
      </button>
    </>
  );
}

// ─── GENERIC TEMPLATE BLOCK PROPERTY EDITORS ────────────────
// Reusable editors that work for any template's hero slider, product grid, etc.

function GenericHeroSliderEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const slides = (block.props.slides as Array<Record<string, unknown>>) || [];
  const updateSlide = (idx: number, key: string, val: unknown) => {
    const next = slides.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    update("slides", next);
  };
  const addSlide = () => update("slides", [...slides, { subtitle: "NEW", titleLine1: "Heading", titleLine2: "Line 2", description: "", buttonText: "Shop Now", buttonLink: "/shop", backgroundImage: "" }]);
  const removeSlide = (idx: number) => update("slides", slides.filter((_, i) => i !== idx));
  return (
    <>
      <PropInput label="Autoplay Speed (ms)" value={block.props.autoplaySpeed} onChange={(v) => update("autoplaySpeed", v)} type="number" />
      <PropInput label="Min Height" value={block.props.minHeight} onChange={(v) => update("minHeight", v)} />
      {slides.map((slide, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Slide {i + 1}</span>
            {slides.length > 1 && <button onClick={() => removeSlide(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          {slide.subtitle !== undefined && <PropInput label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(i, "subtitle", v)} />}
          {slide.title !== undefined && <PropInput label="Title" value={slide.title} onChange={(v) => updateSlide(i, "title", v)} />}
          {slide.titleLine1 !== undefined && <PropInput label="Title Line 1" value={slide.titleLine1} onChange={(v) => updateSlide(i, "titleLine1", v)} />}
          {slide.titleLine2 !== undefined && <PropInput label="Title Line 2" value={slide.titleLine2} onChange={(v) => updateSlide(i, "titleLine2", v)} />}
          {slide.description !== undefined && <PropInput label="Description" value={slide.description} onChange={(v) => updateSlide(i, "description", v)} type="textarea" rows={2} />}
          <PropInput label="Button Text" value={slide.buttonText} onChange={(v) => updateSlide(i, "buttonText", v)} />
          <PropInput label="Button Link" value={slide.buttonLink} onChange={(v) => updateSlide(i, "buttonLink", v)} />
          <SingleImageUpload image={(slide.backgroundImage as string) || (slide.image as string) || null} onChange={(url) => updateSlide(i, slide.backgroundImage !== undefined ? "backgroundImage" : "image", url || "")} label="Image" compact />
          {slide.productImage !== undefined && <SingleImageUpload image={(slide.productImage as string) || null} onChange={(url) => updateSlide(i, "productImage", url || "")} label="Product Image" compact />}
          {slide.colorScheme !== undefined && <PropInput label="Color Scheme" value={slide.colorScheme} onChange={(v) => updateSlide(i, "colorScheme", v)} type="select" options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />}
          {slide.backgroundColor !== undefined && <PropInput label="Background Color" value={slide.backgroundColor} onChange={(v) => updateSlide(i, "backgroundColor", v)} type="color" />}
        </div>
      ))}
      <button onClick={addSlide} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Slide
      </button>
    </>
  );
}

function GenericSectionTitleEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      {block.props.subtitle !== undefined && <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />}
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      {block.props.description !== undefined && <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={2} />}
      <PropInput label="Align" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
    </>
  );
}

function GenericProductGridEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  // Handle sectionTitle as string or object
  const st = block.props.sectionTitle;
  const isObj = typeof st === "object" && st !== null;
  return (
    <>
      {isObj ? (
        <div className="border border-surface-200 rounded-lg p-3 space-y-3">
          <span className="text-xs font-bold text-surface-700">Section Header</span>
          <PropInput label="Subtitle" value={(st as Record<string, unknown>).subtitle} onChange={(v) => update("sectionTitle", { ...(st as Record<string, unknown>), subtitle: v })} />
          <PropInput label="Title" value={(st as Record<string, unknown>).title} onChange={(v) => update("sectionTitle", { ...(st as Record<string, unknown>), title: v })} />
        </div>
      ) : (
        <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />
      )}
      {block.props.sectionSubtitle !== undefined && <PropInput label="Section Subtitle" value={block.props.sectionSubtitle} onChange={(v) => update("sectionSubtitle", v)} />}
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      <PropInput label="Max Products" value={block.props.maxProducts} onChange={(v) => update("maxProducts", v)} type="number" />
      {block.props.filter !== undefined && <PropInput label="Filter" value={block.props.filter} onChange={(v) => update("filter", v)} type="select"
        options={[{ value: "all", label: "All" }, { value: "featured", label: "Featured" }, { value: "bestseller", label: "Bestsellers" }, { value: "new-arrival", label: "New Arrivals" }, { value: "sale", label: "On Sale" }]} />}
      {block.props.showCategory !== undefined && <PropInput label="Show Category" value={block.props.showCategory} onChange={(v) => update("showCategory", v)} type="toggle" />}
      {block.props.showHoverImage !== undefined && <PropInput label="Show Hover Image" value={block.props.showHoverImage} onChange={(v) => update("showHoverImage", v)} type="toggle" />}
      <p className="text-xs text-surface-400">Products are pulled from your store automatically.</p>
    </>
  );
}

function GenericPromoBannersEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const banners = (block.props.banners as Array<Record<string, unknown>>) || [];
  const updateBanner = (idx: number, key: string, val: unknown) => {
    const next = banners.map((b, i) => i === idx ? { ...b, [key]: val } : b);
    update("banners", next);
  };
  const addBanner = () => update("banners", [...banners, { image: "", title: "New Banner", description: "", buttonText: "Shop Now", buttonLink: "/shop" }]);
  const removeBanner = (idx: number) => update("banners", banners.filter((_, i) => i !== idx));
  return (
    <>
      {banners.map((b, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Banner {i + 1}</span>
            {banners.length > 1 && <button onClick={() => removeBanner(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <SingleImageUpload image={(b.image as string) || (b.backgroundImage as string) || null} onChange={(url) => updateBanner(i, b.image !== undefined ? "image" : "backgroundImage", url || "")} label="Image" compact />
          {b.subtitle !== undefined && <PropInput label="Subtitle" value={b.subtitle} onChange={(v) => updateBanner(i, "subtitle", v)} />}
          <PropInput label="Title" value={b.title} onChange={(v) => updateBanner(i, "title", v)} />
          {b.description !== undefined && <PropInput label="Description" value={b.description} onChange={(v) => updateBanner(i, "description", v)} type="textarea" rows={2} />}
          {b.buttonText !== undefined && <PropInput label="Button Text" value={b.buttonText} onChange={(v) => updateBanner(i, "buttonText", v)} />}
          {b.buttonLink !== undefined && <PropInput label="Button Link" value={b.buttonLink} onChange={(v) => updateBanner(i, "buttonLink", v)} />}
          {b.colorScheme !== undefined && <PropInput label="Color Scheme" value={b.colorScheme} onChange={(v) => updateBanner(i, "colorScheme", v)} type="select" options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />}
        </div>
      ))}
      <button onClick={addBanner} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Banner
      </button>
    </>
  );
}

function GenericCategoryCardsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const st = block.props.sectionTitle;
  const isObj = typeof st === "object" && st !== null;
  const categories = (block.props.categories as Array<Record<string, unknown>>) || (block.props.items as Array<Record<string, unknown>>) || [];
  const catKey = block.props.categories !== undefined ? "categories" : "items";
  const updateCat = (idx: number, key: string, val: unknown) => {
    const next = categories.map((c, i) => i === idx ? { ...c, [key]: val } : c);
    update(catKey, next);
  };
  const addCat = () => update(catKey, [...categories, { name: "New Category", image: "", link: "/shop" }]);
  const removeCat = (idx: number) => update(catKey, categories.filter((_, i) => i !== idx));
  return (
    <>
      {isObj ? (
        <div className="border border-surface-200 rounded-lg p-3 space-y-3">
          <span className="text-xs font-bold text-surface-700">Section Header</span>
          <PropInput label="Subtitle" value={(st as Record<string, unknown>).subtitle} onChange={(v) => update("sectionTitle", { ...(st as Record<string, unknown>), subtitle: v })} />
          <PropInput label="Title" value={(st as Record<string, unknown>).title} onChange={(v) => update("sectionTitle", { ...(st as Record<string, unknown>), title: v })} />
        </div>
      ) : typeof st === "string" ? (
        <PropInput label="Section Title" value={st} onChange={(v) => update("sectionTitle", v)} />
      ) : null}
      {block.props.columns !== undefined && <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />}
      {categories.map((c, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">{(c.name as string) || (c.title as string) || `Item ${i + 1}`}</span>
            {categories.length > 1 && <button onClick={() => removeCat(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Name" value={c.name || c.title} onChange={(v) => updateCat(i, c.name !== undefined ? "name" : "title", v)} />
          {c.description !== undefined && <PropInput label="Description" value={c.description} onChange={(v) => updateCat(i, "description", v)} type="textarea" rows={2} />}
          <SingleImageUpload image={(c.image as string) || (c.icon as string) || null} onChange={(url) => updateCat(i, c.image !== undefined ? "image" : "icon", url || "")} label="Image" compact />
          {c.link !== undefined && <PropInput label="Link" value={c.link} onChange={(v) => updateCat(i, "link", v)} />}
          {c.productCount !== undefined && <PropInput label="Product Count" value={c.productCount} onChange={(v) => updateCat(i, "productCount", v)} type="number" />}
        </div>
      ))}
      <button onClick={addCat} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Item
      </button>
    </>
  );
}

function GenericBlogPostsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const st = block.props.sectionTitle;
  const isObj = typeof st === "object" && st !== null;
  return (
    <>
      {isObj ? (
        <div className="border border-surface-200 rounded-lg p-3 space-y-3">
          <span className="text-xs font-bold text-surface-700">Section Header</span>
          <PropInput label="Subtitle" value={(st as Record<string, unknown>).subtitle} onChange={(v) => update("sectionTitle", { ...(st as Record<string, unknown>), subtitle: v })} />
          <PropInput label="Title" value={(st as Record<string, unknown>).title} onChange={(v) => update("sectionTitle", { ...(st as Record<string, unknown>), title: v })} />
        </div>
      ) : (
        <PropInput label="Section Title" value={st} onChange={(v) => update("sectionTitle", v)} />
      )}
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", v)} type="number" />
      <p className="text-xs text-surface-400">Blog posts are pulled from your store&apos;s blog automatically.</p>
    </>
  );
}

function GenericNewsletterEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      {block.props.subtitle !== undefined && <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />}
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      {block.props.description !== undefined && <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={2} />}
      {block.props.buttonText !== undefined && <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />}
      {block.props.backgroundColor !== undefined && <PropInput label="Background Color" value={block.props.backgroundColor} onChange={(v) => update("backgroundColor", v)} type="color" />}
      {block.props.backgroundImage !== undefined && <SingleImageUpload image={(block.props.backgroundImage as string) || null} onChange={(url) => update("backgroundImage", url || "")} label="Background Image" compact />}
    </>
  );
}

function GenericFooterEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const contact = (block.props.contact as Record<string, string>) || {};
  const updateContact = (key: string, val: string) => update("contact", { ...contact, [key]: val });

  // linkColumns (cosmetics/fashion/kids/makeup/perfumes style) or columns (bakery/grocery/health/interior style)
  const linkColumns = (block.props.linkColumns as Array<{ title: string; links: Array<{ label: string; url?: string; href?: string }> }>) ||
    (block.props.columns as Array<{ title: string; links: Array<{ label: string; url?: string; href?: string }> }>) || [];
  const linkColumnsKey = block.props.linkColumns !== undefined ? "linkColumns" : "columns";

  const updateColumn = (ci: number, key: string, val: unknown) => {
    const next = linkColumns.map((c, i) => i === ci ? { ...c, [key]: val } : c);
    update(linkColumnsKey, next);
  };
  const updateColumnLink = (ci: number, li: number, key: string, val: string) => {
    const col = linkColumns[ci];
    const links = col.links.map((l, i) => i === li ? { ...l, [key]: val } : l);
    updateColumn(ci, "links", links);
  };
  const addColumnLink = (ci: number) => {
    const col = linkColumns[ci];
    const newLink = col.links[0]?.url !== undefined ? { label: "New Link", url: "#" } : { label: "New Link", href: "#" };
    updateColumn(ci, "links", [...col.links, newLink]);
  };
  const removeColumnLink = (ci: number, li: number) => {
    const col = linkColumns[ci];
    updateColumn(ci, "links", col.links.filter((_, i) => i !== li));
  };
  const addColumn = () => {
    const newCol = linkColumns[0]?.links[0]?.url !== undefined
      ? { title: "New Section", links: [{ label: "Link", url: "#" }] }
      : { title: "New Section", links: [{ label: "Link", href: "#" }] };
    update(linkColumnsKey, [...linkColumns, newCol]);
  };
  const removeColumn = (ci: number) => update(linkColumnsKey, linkColumns.filter((_, i) => i !== ci));

  // Social links
  const socialLinks = (block.props.socialLinks as Array<{ platform: string; url: string }>) || [];
  const updateSocial = (i: number, key: string, val: string) => {
    const next = socialLinks.map((s, si) => si === i ? { ...s, [key]: val } : s);
    update("socialLinks", next);
  };
  const addSocial = () => update("socialLinks", [...socialLinks, { platform: "facebook", url: "#" }]);
  const removeSocial = (i: number) => update("socialLinks", socialLinks.filter((_, si) => si !== i));

  return (
    <>
      {/* Logo */}
      {block.props.logoUrl !== undefined && <SingleImageUpload image={(block.props.logoUrl as string) || null} onChange={(url) => update("logoUrl", url || "")} label="Logo" compact />}
      {block.props.logoAlt !== undefined && <PropInput label="Logo Alt Text" value={block.props.logoAlt} onChange={(v) => update("logoAlt", v)} />}

      {/* Basic text fields */}
      {block.props.tagline !== undefined && <PropInput label="Tagline" value={block.props.tagline} onChange={(v) => update("tagline", v)} />}
      <PropInput label="Description" value={block.props.description || ""} onChange={(v) => update("description", v)} type="textarea" rows={3} />
      {block.props.copyright !== undefined && <PropInput label="Copyright" value={block.props.copyright} onChange={(v) => update("copyright", v)} />}

      {/* Contact - flat style (bakery/grocery) */}
      {block.props.contactPhone !== undefined && <PropInput label="Phone" value={block.props.contactPhone} onChange={(v) => update("contactPhone", v)} />}
      {block.props.contactEmail !== undefined && <PropInput label="Email" value={block.props.contactEmail} onChange={(v) => update("contactEmail", v)} />}
      {block.props.contactAddress !== undefined && <PropInput label="Address" value={block.props.contactAddress} onChange={(v) => update("contactAddress", v)} />}

      {/* Contact - nested style (fashion/cosmetics/kids) */}
      {block.props.contact !== undefined && (
        <div className="border border-surface-200 rounded-lg p-3 space-y-3">
          <span className="text-xs font-bold text-surface-700">Contact Info</span>
          <PropInput label="Address" value={contact.address || ""} onChange={(v) => updateContact("address", v)} />
          <PropInput label="Phone" value={contact.phone || ""} onChange={(v) => updateContact("phone", v)} />
          {contact.fax !== undefined && <PropInput label="Fax" value={contact.fax || ""} onChange={(v) => updateContact("fax", v)} />}
          {contact.email !== undefined && <PropInput label="Email" value={contact.email || ""} onChange={(v) => updateContact("email", v)} />}
        </div>
      )}

      {/* Flat email/phone (health style) */}
      {block.props.email !== undefined && block.props.contact === undefined && <PropInput label="Email" value={block.props.email} onChange={(v) => update("email", v)} />}
      {block.props.phone !== undefined && block.props.contact === undefined && <PropInput label="Phone" value={block.props.phone} onChange={(v) => update("phone", v)} />}
      {block.props.address !== undefined && block.props.contact === undefined && <PropInput label="Address" value={block.props.address} onChange={(v) => update("address", v)} />}

      {/* Link columns */}
      {linkColumns.length > 0 && (
        <div className="space-y-3 mt-2">
          <span className="text-xs font-bold text-surface-700 block">Footer Link Sections</span>
          {linkColumns.map((col, ci) => (
            <div key={ci} className="border border-surface-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <PropInput label="Section Title" value={col.title} onChange={(v) => updateColumn(ci, "title", v)} />
                {linkColumns.length > 1 && <button onClick={() => removeColumn(ci)} className="text-red-500 text-xs ml-2">✕</button>}
              </div>
              {col.links.map((link, li) => {
                const urlKey = link.url !== undefined ? "url" : "href";
                return (
                  <div key={li} className="flex items-center gap-2 pl-2">
                    <PropInput label="" value={link.label} onChange={(v) => updateColumnLink(ci, li, "label", v)} />
                    <PropInput label="" value={(link as Record<string, string>)[urlKey] || ""} onChange={(v) => updateColumnLink(ci, li, urlKey, v)} />
                    <button onClick={() => removeColumnLink(ci, li)} className="text-red-500 text-xs">✕</button>
                  </div>
                );
              })}
              <button onClick={() => addColumnLink(ci)} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-1.5 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
                <Plus className="h-3 w-3" /> Add Link
              </button>
            </div>
          ))}
          <button onClick={addColumn} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
            <Plus className="h-3 w-3" /> Add Section
          </button>
        </div>
      )}

      {/* Social links */}
      {(block.props.socialLinks !== undefined || socialLinks.length > 0) && (
        <div className="space-y-2 mt-2">
          <span className="text-xs font-bold text-surface-700 block">Social Links</span>
          {socialLinks.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <PropInput label="" value={s.platform} onChange={(v) => updateSocial(i, "platform", v)} type="select"
                options={[{ value: "facebook", label: "Facebook" }, { value: "twitter", label: "Twitter/X" }, { value: "instagram", label: "Instagram" }, { value: "youtube", label: "YouTube" }, { value: "tiktok", label: "TikTok" }, { value: "whatsapp", label: "WhatsApp" }]} />
              <PropInput label="" value={s.url} onChange={(v) => updateSocial(i, "url", v)} />
              <button onClick={() => removeSocial(i)} className="text-red-500 text-xs">✕</button>
            </div>
          ))}
          <button onClick={addSocial} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-1.5 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
            <Plus className="h-3 w-3" /> Add Social Link
          </button>
        </div>
      )}

      {/* Payment image */}
      {block.props.paymentImage !== undefined && <SingleImageUpload image={(block.props.paymentImage as string) || null} onChange={(url) => update("paymentImage", url || "")} label="Payment Image" compact />}
    </>
  );
}

function GenericHandmadeEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      {block.props.subtitle !== undefined && <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />}
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      {block.props.description !== undefined && <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={3} />}
      <SingleImageUpload image={(block.props.image as string) || null} onChange={(url) => update("image", url || "")} label="Image" compact />
      {block.props.buttonText !== undefined && <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />}
      {block.props.buttonLink !== undefined && <PropInput label="Button Link" value={block.props.buttonLink} onChange={(v) => update("buttonLink", v)} />}
    </>
  );
}

function GenericProcessStepsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const steps = (block.props.steps as Array<Record<string, unknown>>) || [];
  const updateStep = (idx: number, key: string, val: unknown) => {
    const next = steps.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    update("steps", next);
  };
  const addStep = () => update("steps", [...steps, { icon: "", title: "New Step", description: "" }]);
  const removeStep = (idx: number) => update("steps", steps.filter((_, i) => i !== idx));
  return (
    <>
      {block.props.sectionTitle !== undefined && <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />}
      {block.props.sectionSubtitle !== undefined && <PropInput label="Section Subtitle" value={block.props.sectionSubtitle} onChange={(v) => update("sectionSubtitle", v)} />}
      {block.props.image !== undefined && <SingleImageUpload image={(block.props.image as string) || null} onChange={(url) => update("image", url || "")} label="Image" compact />}
      {steps.map((step, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Step {i + 1}</span>
            {steps.length > 1 && <button onClick={() => removeStep(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Title" value={step.title} onChange={(v) => updateStep(i, "title", v)} />
          <PropInput label="Description" value={step.description} onChange={(v) => updateStep(i, "description", v)} type="textarea" rows={2} />
          {step.icon !== undefined && <PropInput label="Icon URL" value={step.icon} onChange={(v) => updateStep(i, "icon", v)} />}
        </div>
      ))}
      <button onClick={addStep} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Step
      </button>
    </>
  );
}

function GenericCtaEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      {block.props.subtitle !== undefined && <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />}
      {block.props.description !== undefined && <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={2} />}
      {block.props.buttonText !== undefined && <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />}
      {block.props.buttonLink !== undefined && <PropInput label="Button Link" value={block.props.buttonLink} onChange={(v) => update("buttonLink", v)} />}
      {block.props.backgroundImage !== undefined && <SingleImageUpload image={(block.props.backgroundImage as string) || null} onChange={(url) => update("backgroundImage", url || "")} label="Background Image" compact />}
      {block.props.backgroundColor !== undefined && <PropInput label="Background Color" value={block.props.backgroundColor} onChange={(v) => update("backgroundColor", v)} type="color" />}
    </>
  );
}

function GenericInfoBoxesEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as Array<Record<string, unknown>>) || (block.props.boxes as Array<Record<string, unknown>>) || (block.props.features as Array<Record<string, unknown>>) || [];
  const itemsKey = block.props.items !== undefined ? "items" : block.props.boxes !== undefined ? "boxes" : "features";
  const updateItem = (idx: number, key: string, val: unknown) => {
    const next = items.map((item, i) => i === idx ? { ...item, [key]: val } : item);
    update(itemsKey, next);
  };
  const addItem = () => update(itemsKey, [...items, { icon: "⭐", title: "New Item", description: "" }]);
  const removeItem = (idx: number) => update(itemsKey, items.filter((_, i) => i !== idx));
  return (
    <>
      {block.props.sectionTitle !== undefined && (typeof block.props.sectionTitle === "string"
        ? <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />
        : <PropInput label="Title" value={(block.props.sectionTitle as Record<string, unknown>)?.title} onChange={(v) => update("sectionTitle", { ...(block.props.sectionTitle as Record<string, unknown>), title: v })} />
      )}
      {items.map((item, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">{(item.title as string) || `Item ${i + 1}`}</span>
            {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          {item.icon !== undefined && <PropInput label="Icon" value={item.icon} onChange={(v) => updateItem(i, "icon", v)} />}
          {item.number !== undefined && <PropInput label="Number" value={item.number} onChange={(v) => updateItem(i, "number", v)} />}
          <PropInput label="Title" value={item.title} onChange={(v) => updateItem(i, "title", v)} />
          {item.description !== undefined && <PropInput label="Description" value={item.description} onChange={(v) => updateItem(i, "description", v)} type="textarea" rows={2} />}
          {item.image !== undefined && <SingleImageUpload image={(item.image as string) || null} onChange={(url) => updateItem(i, "image", url || "")} label="Image" compact />}
        </div>
      ))}
      <button onClick={addItem} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Item
      </button>
    </>
  );
}

function GenericMarqueeEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const items = (block.props.items as string[]) || [];
  const updateItem = (idx: number, val: string) => {
    const next = items.map((item, i) => i === idx ? val : item);
    update("items", next);
  };
  const addItem = () => update("items", [...items, "New Item"]);
  const removeItem = (idx: number) => update("items", items.filter((_, i) => i !== idx));
  return (
    <>
      {block.props.speed !== undefined && <PropInput label="Speed" value={block.props.speed} onChange={(v) => update("speed", v)} type="number" />}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={item} onChange={(e) => updateItem(i, e.target.value)} className="input-field text-sm py-1.5 flex-1" />
          <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={addItem} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Item
      </button>
    </>
  );
}

function GenericInstagramEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      {block.props.handle !== undefined && <PropInput label="Handle" value={block.props.handle} onChange={(v) => update("handle", v)} />}
      {block.props.handleLink !== undefined && <PropInput label="Handle Link" value={block.props.handleLink} onChange={(v) => update("handleLink", v)} />}
      <p className="text-xs text-surface-400">Instagram images will be pulled automatically when connected.</p>
    </>
  );
}

function GenericOlfactoryTagsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const tags = (block.props.tags as Array<Record<string, unknown>>) || [];
  const updateTag = (idx: number, key: string, val: unknown) => {
    const next = tags.map((t, i) => i === idx ? { ...t, [key]: val } : t);
    update("tags", next);
  };
  const addTag = () => update("tags", [...tags, { name: "New Tag", link: "/shop" }]);
  const removeTag = (idx: number) => update("tags", tags.filter((_, i) => i !== idx));
  return (
    <>
      {block.props.title !== undefined && <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />}
      {tags.map((tag, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={(tag.name as string) || ""} onChange={(e) => updateTag(i, "name", e.target.value)} className="input-field text-sm py-1.5 flex-1" placeholder="Tag name" />
          <input value={(tag.link as string) || ""} onChange={(e) => updateTag(i, "link", e.target.value)} className="input-field text-sm py-1.5 flex-1" placeholder="Link" />
          <button onClick={() => removeTag(i)} className="text-red-500 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={addTag} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Tag
      </button>
    </>
  );
}

function GenericBundlePromoEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      {block.props.subtitle !== undefined && <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />}
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      {block.props.description !== undefined && <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={2} />}
      {block.props.buttonText !== undefined && <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />}
      {block.props.buttonLink !== undefined && <PropInput label="Button Link" value={block.props.buttonLink} onChange={(v) => update("buttonLink", v)} />}
      {block.props.backgroundColor !== undefined && <PropInput label="Background Color" value={block.props.backgroundColor} onChange={(v) => update("backgroundColor", v)} type="color" />}
    </>
  );
}

function GenericDiscoveryEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Description" value={block.props.description} onChange={(v) => update("description", v)} type="textarea" rows={3} />
      <SingleImageUpload image={(block.props.image as string) || null} onChange={(url) => update("image", url || "")} label="Image" compact />
      {block.props.buttonText !== undefined && <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />}
      {block.props.buttonLink !== undefined && <PropInput label="Button Link" value={block.props.buttonLink} onChange={(v) => update("buttonLink", v)} />}
      {block.props.secondButtonText !== undefined && <PropInput label="Secondary Button" value={block.props.secondButtonText} onChange={(v) => update("secondButtonText", v)} />}
      {block.props.secondButtonLink !== undefined && <PropInput label="Secondary Link" value={block.props.secondButtonLink} onChange={(v) => update("secondButtonLink", v)} />}
    </>
  );
}

// ─── ELECTRONICS TEMPLATE PROPERTY EDITORS ─────────────────────

function ElectronicsHeroSliderEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const slides = (block.props.slides as Array<Record<string, unknown>>) || [];
  const updateSlide = (idx: number, key: string, val: unknown) => {
    const next = slides.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    update("slides", next);
  };
  const addSlide = () => {
    update("slides", [...slides, { subtitle: "NEW CATEGORY", titleLine1: "HEADING LINE 1", titleLine2: "HEADING LINE 2", description: "Description text here.", buttonText: "Buy Now", buttonLink: "/shop", backgroundImage: "", textPosition: "left", colorScheme: "dark" }]);
  };
  const removeSlide = (idx: number) => update("slides", slides.filter((_, i) => i !== idx));
  return (
    <>
      <PropInput label="Min Height" value={block.props.minHeight} onChange={(v) => update("minHeight", v)} />
      <PropInput label="Autoplay Speed (ms)" value={block.props.autoplaySpeed} onChange={(v) => update("autoplaySpeed", v)} type="number" />
      {slides.map((slide, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Slide {i + 1}</span>
            {slides.length > 1 && <button onClick={() => removeSlide(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(i, "subtitle", v)} />
          <PropInput label="Title Line 1" value={slide.titleLine1} onChange={(v) => updateSlide(i, "titleLine1", v)} />
          <PropInput label="Title Line 2" value={slide.titleLine2} onChange={(v) => updateSlide(i, "titleLine2", v)} />
          <PropInput label="Description" value={slide.description} onChange={(v) => updateSlide(i, "description", v)} type="textarea" rows={2} />
          <PropInput label="Button Text" value={slide.buttonText} onChange={(v) => updateSlide(i, "buttonText", v)} />
          <PropInput label="Button Link" value={slide.buttonLink} onChange={(v) => updateSlide(i, "buttonLink", v)} />
          <SingleImageUpload image={(slide.backgroundImage as string) || null} onChange={(url) => updateSlide(i, "backgroundImage", url || "")} label="Background Image" compact />
          <PropInput label="Text Position" value={slide.textPosition} onChange={(v) => updateSlide(i, "textPosition", v)} type="select"
            options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
          <PropInput label="Color Scheme" value={slide.colorScheme} onChange={(v) => updateSlide(i, "colorScheme", v)} type="select"
            options={[{ value: "dark", label: "Dark Text" }, { value: "light", label: "Light Text" }]} />
        </div>
      ))}
      <button onClick={addSlide} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Slide
      </button>
    </>
  );
}

function ElectronicsPromoBannersEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const banners = (block.props.banners as Array<Record<string, unknown>>) || [];
  const updateBanner = (idx: number, key: string, val: unknown) => {
    const next = banners.map((b, i) => i === idx ? { ...b, [key]: val } : b);
    update("banners", next);
  };
  const addBanner = () => update("banners", [...banners, { image: "", subtitle: "NEW", title: "BANNER TITLE", description: "Description", buttonText: "Shop More", buttonLink: "/shop", colorScheme: "dark" }]);
  const removeBanner = (idx: number) => update("banners", banners.filter((_, i) => i !== idx));
  return (
    <>
      {banners.map((b, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Banner {i + 1}</span>
            {banners.length > 1 && <button onClick={() => removeBanner(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <SingleImageUpload image={(b.image as string) || null} onChange={(url) => updateBanner(i, "image", url || "")} label="Image" compact />
          <PropInput label="Subtitle" value={b.subtitle} onChange={(v) => updateBanner(i, "subtitle", v)} />
          <PropInput label="Title" value={b.title} onChange={(v) => updateBanner(i, "title", v)} />
          <PropInput label="Description" value={b.description} onChange={(v) => updateBanner(i, "description", v)} type="textarea" rows={2} />
          <PropInput label="Button Text" value={b.buttonText} onChange={(v) => updateBanner(i, "buttonText", v)} />
          <PropInput label="Button Link" value={b.buttonLink} onChange={(v) => updateBanner(i, "buttonLink", v)} />
          <PropInput label="Color Scheme" value={b.colorScheme} onChange={(v) => updateBanner(i, "colorScheme", v)} type="select"
            options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
        </div>
      ))}
      <button onClick={addBanner} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Banner
      </button>
    </>
  );
}

function ElectronicsProductTabsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const tabs = (block.props.tabs as Array<Record<string, unknown>>) || [];
  const updateTab = (idx: number, key: string, val: unknown) => {
    const next = tabs.map((t, i) => i === idx ? { ...t, [key]: val } : t);
    update("tabs", next);
  };
  const addTab = () => update("tabs", [...tabs, { label: "New Tab", filter: "all" }]);
  const removeTab = (idx: number) => update("tabs", tabs.filter((_, i) => i !== idx));
  return (
    <>
      <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", Number(v))} type="number" />
      <PropInput label="Max Products" value={block.props.maxProducts} onChange={(v) => update("maxProducts", Number(v))} type="number" />
      {tabs.map((tab, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Tab {i + 1}</span>
            {tabs.length > 1 && <button onClick={() => removeTab(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Label" value={tab.label} onChange={(v) => updateTab(i, "label", v)} />
          <PropInput label="Filter" value={tab.filter} onChange={(v) => updateTab(i, "filter", v)} type="select"
            options={[{ value: "all", label: "All" }, { value: "new", label: "New" }, { value: "featured", label: "Featured" }, { value: "top-sellers", label: "Top Sellers" }, { value: "sale", label: "On Sale" }]} />
        </div>
      ))}
      <button onClick={addTab} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Tab
      </button>
    </>
  );
}

function ElectronicsBannerGridEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const banners = (block.props.banners as Array<Record<string, unknown>>) || [];
  const updateBanner = (idx: number, key: string, val: unknown) => {
    const next = banners.map((b, i) => i === idx ? { ...b, [key]: val } : b);
    update("banners", next);
  };
  return (
    <>
      {banners.slice(0, 4).map((b, i) => {
        const labels = ["Left Tall", "Middle Top", "Middle Bottom", "Right Tall"];
        return (
          <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
            <span className="text-xs font-bold text-surface-700">{labels[i] || `Banner ${i + 1}`}</span>
            <SingleImageUpload image={(b.image as string) || null} onChange={(url) => updateBanner(i, "image", url || "")} label="Image" compact />
            <PropInput label="Subtitle" value={b.subtitle} onChange={(v) => updateBanner(i, "subtitle", v)} />
            <PropInput label="Title" value={b.title} onChange={(v) => updateBanner(i, "title", v)} type="textarea" rows={2} />
            <PropInput label="Button Text" value={b.buttonText} onChange={(v) => updateBanner(i, "buttonText", v)} />
            <PropInput label="Button Link" value={b.buttonLink} onChange={(v) => updateBanner(i, "buttonLink", v)} />
            <PropInput label="Color Scheme" value={b.colorScheme} onChange={(v) => updateBanner(i, "colorScheme", v)} type="select"
              options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
          </div>
        );
      })}
    </>
  );
}

function ElectronicsHotDealsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />
      <PropInput label="Button Text" value={block.props.buttonText} onChange={(v) => update("buttonText", v)} />
      <PropInput label="Button Link" value={block.props.buttonLink} onChange={(v) => update("buttonLink", v)} />
      <PropInput label="Deal End Date" value={block.props.dealEndDate} onChange={(v) => update("dealEndDate", v)} placeholder="YYYY-MM-DD" />
      <PropInput label="Max Products" value={block.props.maxProducts} onChange={(v) => update("maxProducts", Number(v))} type="number" />
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", Number(v))} type="number" />
      <PropInput label="Filter" value={block.props.filter} onChange={(v) => update("filter", v)} type="select"
        options={[{ value: "sale", label: "On Sale" }, { value: "featured", label: "Featured" }, { value: "all", label: "All" }]} />
    </>
  );
}

function ElectronicsSideBannerEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const rightTabs = (block.props.rightTabs as Array<Record<string, unknown>>) || [];
  const updateTab = (idx: number, key: string, val: unknown) => {
    const next = rightTabs.map((t, i) => i === idx ? { ...t, [key]: val } : t);
    update("rightTabs", next);
  };
  return (
    <>
      <SingleImageUpload image={(block.props.bannerImage as string) || null} onChange={(url) => update("bannerImage", url || "")} label="Banner Image" compact />
      <PropInput label="Banner Subtitle" value={block.props.bannerSubtitle} onChange={(v) => update("bannerSubtitle", v)} />
      <PropInput label="Banner Title" value={block.props.bannerTitle} onChange={(v) => update("bannerTitle", v)} />
      <PropInput label="Banner Button Text" value={block.props.bannerButtonText} onChange={(v) => update("bannerButtonText", v)} />
      <PropInput label="Banner Button Link" value={block.props.bannerButtonLink} onChange={(v) => update("bannerButtonLink", v)} />
      <PropInput label="Featured Title" value={block.props.featuredTitle} onChange={(v) => update("featuredTitle", v)} />
      <PropInput label="Max Featured Products" value={block.props.maxFeaturedProducts} onChange={(v) => update("maxFeaturedProducts", Number(v))} type="number" />
      <PropInput label="Right Section Title" value={block.props.rightSectionTitle} onChange={(v) => update("rightSectionTitle", v)} />
      <PropInput label="Right Max Products" value={block.props.rightMaxProducts} onChange={(v) => update("rightMaxProducts", Number(v))} type="number" />
      {rightTabs.map((tab, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <span className="text-xs font-bold text-surface-700">Tab {i + 1}</span>
          <PropInput label="Label" value={tab.label} onChange={(v) => updateTab(i, "label", v)} />
          <PropInput label="Filter" value={tab.filter} onChange={(v) => updateTab(i, "filter", v)} type="select"
            options={[{ value: "all", label: "All" }, { value: "new", label: "New" }, { value: "featured", label: "Featured" }, { value: "top-sellers", label: "Top Sellers" }]} />
        </div>
      ))}
    </>
  );
}

function ElectronicsGamingCTAEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <SingleImageUpload image={(block.props.backgroundImage as string) || null} onChange={(url) => update("backgroundImage", url || "")} label="Background Image" compact />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} />
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Primary Button Text" value={block.props.primaryButtonText} onChange={(v) => update("primaryButtonText", v)} />
      <PropInput label="Primary Button Link" value={block.props.primaryButtonLink} onChange={(v) => update("primaryButtonLink", v)} />
      <PropInput label="Secondary Button Text" value={block.props.secondaryButtonText} onChange={(v) => update("secondaryButtonText", v)} />
      <PropInput label="Secondary Button Link" value={block.props.secondaryButtonLink} onChange={(v) => update("secondaryButtonLink", v)} />
      <SingleImageUpload image={(block.props.productImage as string) || null} onChange={(url) => update("productImage", url || "")} label="Product Image" compact />
    </>
  );
}

function ElectronicsBlogPostsEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const posts = (block.props.posts as Array<Record<string, unknown>>) || [];
  const updatePost = (idx: number, key: string, val: unknown) => {
    const next = posts.map((p, i) => i === idx ? { ...p, [key]: val } : p);
    update("posts", next);
  };
  const updatePostDate = (idx: number, dateKey: string, val: unknown) => {
    const post = posts[idx];
    const date = (post.date as Record<string, unknown>) || {};
    const next = posts.map((p, i) => i === idx ? { ...p, date: { ...date, [dateKey]: val } } : p);
    update("posts", next);
  };
  const addPost = () => update("posts", [...posts, { image: "", title: "New Blog Post", excerpt: "", date: { day: "01", month: "Jan", year: "2024" }, category: "Tech", author: "Store Team", link: "#" }]);
  const removePost = (idx: number) => update("posts", posts.filter((_, i) => i !== idx));
  return (
    <>
      <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />
      <PropInput label="Columns" value={block.props.columns} onChange={(v) => update("columns", Number(v))} type="number" />
      {posts.map((p, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Post {i + 1}</span>
            {posts.length > 1 && <button onClick={() => removePost(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <SingleImageUpload image={(p.image as string) || null} onChange={(url) => updatePost(i, "image", url || "")} label="Image" compact />
          <PropInput label="Title" value={p.title} onChange={(v) => updatePost(i, "title", v)} />
          <PropInput label="Category" value={p.category} onChange={(v) => updatePost(i, "category", v)} />
          <PropInput label="Author" value={p.author} onChange={(v) => updatePost(i, "author", v)} />
          <PropInput label="Link" value={p.link} onChange={(v) => updatePost(i, "link", v)} />
          <div className="grid grid-cols-3 gap-2">
            <PropInput label="Day" value={(p.date as Record<string, unknown>)?.day} onChange={(v) => updatePostDate(i, "day", v)} />
            <PropInput label="Month" value={(p.date as Record<string, unknown>)?.month} onChange={(v) => updatePostDate(i, "month", v)} />
            <PropInput label="Year" value={(p.date as Record<string, unknown>)?.year} onChange={(v) => updatePostDate(i, "year", v)} />
          </div>
        </div>
      ))}
      <button onClick={addPost} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Post
      </button>
    </>
  );
}

function ElectronicsPartnersEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  const logos = (block.props.logos as Array<Record<string, unknown>>) || [];
  const updateLogo = (idx: number, key: string, val: unknown) => {
    const next = logos.map((l, i) => i === idx ? { ...l, [key]: val } : l);
    update("logos", next);
  };
  const addLogo = () => update("logos", [...logos, { name: "Brand", logoUrl: "", linkUrl: "#" }]);
  const removeLogo = (idx: number) => update("logos", logos.filter((_, i) => i !== idx));
  return (
    <>
      <PropInput label="Section Title" value={block.props.sectionTitle} onChange={(v) => update("sectionTitle", v)} />
      <PropInput label="Video URL" value={block.props.videoUrl} onChange={(v) => update("videoUrl", v)} />
      <SingleImageUpload image={(block.props.videoThumbnail as string) || null} onChange={(url) => update("videoThumbnail", url || "")} label="Video Thumbnail" compact />
      {logos.map((l, i) => (
        <div key={i} className="border border-surface-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-700">Logo {i + 1}</span>
            {logos.length > 1 && <button onClick={() => removeLogo(i)} className="text-red-500 text-xs">Remove</button>}
          </div>
          <PropInput label="Name" value={l.name} onChange={(v) => updateLogo(i, "name", v)} />
          <SingleImageUpload image={(l.logoUrl as string) || null} onChange={(url) => updateLogo(i, "logoUrl", url || "")} label="Logo" compact />
          <PropInput label="Link URL" value={l.linkUrl} onChange={(v) => updateLogo(i, "linkUrl", v)} />
        </div>
      ))}
      <button onClick={addLogo} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 py-2 border border-dashed border-brand-300 rounded-lg hover:bg-brand-50">
        <Plus className="h-3 w-3" /> Add Logo
      </button>
    </>
  );
}

function ElectronicsSectionTitleEditProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Alignment" value={block.props.align} onChange={(v) => update("align", v)} type="select"
        options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      <label className="flex items-center gap-2 text-xs text-surface-600">
        <input type="checkbox" checked={block.props.showLine !== false} onChange={(e) => update("showLine", e.target.checked)} />
        Show underline
      </label>
    </>
  );
}

const propEditors: Record<string, React.FC<{ block: BuilderBlock; update: (key: string, val: unknown) => void }>> = {
  // Core block types
  heading: HeadingProps, text: TextProps, image: ImageProps, button: ButtonProps,
  hero: HeroProps, spacer: SpacerProps, divider: DividerProps, columns: ColumnsProps,
  productGrid: ProductGridProps, testimonial: TestimonialProps, countdown: CountdownProps,
  contactInfo: ContactInfoProps, contactForm: ContactFormProps,
  features: FeaturesProps, testimonials: TestimonialsProps,
  banner: BannerProps, stats: StatsProps, faq: FAQProps,
  newsletter: NewsletterProps, imageText: ImageTextProps, "image-text": ImageTextProps,
  gallery: GalleryProps, team: TeamProps, brands: BrandsProps,
  trustBadges: TrustBadgesProps, video: VideoProps,

  // Fashion template blocks
  fashionHeroSlider: FashionHeroSliderProps,
  fashionPromoBanners: FashionPromoBannersProps,
  fashionSectionTitle: FashionSectionTitleProps,
  fashionProductGrid: FashionProductGridProps,
  fashionCategoryCards: FashionCategoryCardsProps,
  fashionTestimonials: FashionTestimonialsProps,
  fashionBlogPosts: FashionBlogPostsProps,
  fashionNewsletter: FashionNewsletterEditProps,
  fashionFooter: GenericFooterEditProps,
  fashionFeatures: GenericInfoBoxesEditProps,
  fashionInstagram: FashionInstagramEditProps,
  fashionMarquee: FashionMarqueeEditProps,
  fashionCoverBanners: GenericPromoBannersEditProps,

  // Electronics template blocks
  electronicsHeroSlider: ElectronicsHeroSliderEditProps,
  electronicsPromoBanners: ElectronicsPromoBannersEditProps,
  electronicsProductTabs: ElectronicsProductTabsEditProps,
  electronicsBannerGrid: ElectronicsBannerGridEditProps,
  electronicsHotDeals: ElectronicsHotDealsEditProps,
  electronicsSideBanner: ElectronicsSideBannerEditProps,
  electronicsGamingCTA: ElectronicsGamingCTAEditProps,
  electronicsBlogPosts: ElectronicsBlogPostsEditProps,
  electronicsPartners: ElectronicsPartnersEditProps,
  electronicsSectionTitle: ElectronicsSectionTitleEditProps,
  electronicsFooter: GenericFooterEditProps,

  // Bakery template blocks
  bakeryHeroSlider: GenericHeroSliderEditProps,
  bakerySectionTitle: GenericSectionTitleEditProps,
  bakeryCategoryInfoBoxes: GenericCategoryCardsEditProps,
  bakeryHandmade: GenericHandmadeEditProps,
  bakeryProductGrid: GenericProductGridEditProps,
  bakeryProcess: GenericProcessStepsEditProps,
  bakeryBlogPosts: GenericBlogPostsEditProps,
  bakeryCta: GenericCtaEditProps,
  bakeryFooter: GenericFooterEditProps,

  // Cosmetics template blocks
  cosmeticsHeroSlider: GenericHeroSliderEditProps,
  cosmeticsPromoBanners: GenericPromoBannersEditProps,
  cosmeticsSectionTitle: GenericSectionTitleEditProps,
  cosmeticsProductGrid: GenericProductGridEditProps,
  cosmeticsCategoryCards: GenericCategoryCardsEditProps,
  cosmeticsDiscovery: GenericDiscoveryEditProps,
  cosmeticsCountdownBanner: GenericCtaEditProps,
  cosmeticsInfoBoxes: GenericInfoBoxesEditProps,
  cosmeticsBlogPosts: GenericBlogPostsEditProps,
  cosmeticsInstagram: GenericInstagramEditProps,
  cosmeticsNewsletter: GenericNewsletterEditProps,
  cosmeticsFooter: GenericFooterEditProps,

  // Grocery template blocks
  groceryHeroSlider: GenericHeroSliderEditProps,
  groceryFeaturesBar: GenericInfoBoxesEditProps,
  grocerySectionTitle: GenericSectionTitleEditProps,
  groceryProductGrid: GenericProductGridEditProps,
  groceryPromoBanners: GenericPromoBannersEditProps,
  groceryCategoryGrid: GenericCategoryCardsEditProps,
  groceryNewsletter: GenericNewsletterEditProps,
  groceryBestSellers: GenericProductGridEditProps,
  groceryFooter: GenericFooterEditProps,

  // Health template blocks
  healthHero: GenericCtaEditProps,
  healthMarquee: GenericMarqueeEditProps,
  healthPromoBanners: GenericPromoBannersEditProps,
  healthSectionTitle: GenericSectionTitleEditProps,
  healthCategoryCards: GenericCategoryCardsEditProps,
  healthProductGrid: GenericProductGridEditProps,
  healthVideoSection: GenericCtaEditProps,
  healthFeatureSection: GenericInfoBoxesEditProps,
  healthTestimonials: GenericInfoBoxesEditProps,
  healthBlogPosts: GenericBlogPostsEditProps,
  healthNewsletter: GenericNewsletterEditProps,
  healthBrandMarquee: GenericMarqueeEditProps,
  healthFooter: GenericFooterEditProps,

  // Interior Design template blocks
  interiorHeroSlider: GenericHeroSliderEditProps,
  interiorSectionTitle: GenericSectionTitleEditProps,
  interiorCategoryGrid: GenericCategoryCardsEditProps,
  interiorProductGrid: GenericProductGridEditProps,
  interiorInfoBoxes: GenericInfoBoxesEditProps,
  interiorGardenProducts: GenericProductGridEditProps,
  interiorPromoBanners: GenericPromoBannersEditProps,
  interiorFurnitureCategories: GenericCategoryCardsEditProps,
  interiorFurnitureProducts: GenericProductGridEditProps,
  interiorBlogPosts: GenericBlogPostsEditProps,
  interiorBrandsBar: GenericInfoBoxesEditProps,
  interiorCta: GenericCtaEditProps,
  interiorFooter: GenericFooterEditProps,

  // Kids template blocks
  kidsAnnouncementBar: GenericCtaEditProps,
  kidsHeroSlider: GenericHeroSliderEditProps,
  kidsSectionTitle: GenericSectionTitleEditProps,
  kidsCategoryCards: GenericCategoryCardsEditProps,
  kidsProductGrid: GenericProductGridEditProps,
  kidsBundlePromo: GenericBundlePromoEditProps,
  kidsBlogPosts: GenericBlogPostsEditProps,
  kidsInstagram: GenericInstagramEditProps,
  kidsNewsletter: GenericNewsletterEditProps,
  kidsFooter: GenericFooterEditProps,

  // Makeup template blocks
  makeupHeroSlider: GenericHeroSliderEditProps,
  makeupCategorySidebar: GenericCategoryCardsEditProps,
  makeupSectionTitle: GenericSectionTitleEditProps,
  makeupProductGrid: GenericProductGridEditProps,
  makeupProductTypeCards: GenericCategoryCardsEditProps,
  makeupBeforeAfter: GenericDiscoveryEditProps,
  makeupPromoBannerCards: GenericPromoBannersEditProps,
  makeupVideoBlog: GenericBlogPostsEditProps,
  makeupBlogPosts: GenericBlogPostsEditProps,
  makeupBrandsCarousel: GenericInfoBoxesEditProps,
  makeupFooter: GenericFooterEditProps,

  // Perfumes template blocks
  perfumesHeroSlider: GenericHeroSliderEditProps,
  perfumesSectionTitle: GenericSectionTitleEditProps,
  perfumesProductGrid: GenericProductGridEditProps,
  perfumesOlfactoryTags: GenericOlfactoryTagsEditProps,
  perfumesMarquee: GenericMarqueeEditProps,
  perfumesFeaturedBanners: GenericPromoBannersEditProps,
  perfumesTabbedProducts: GenericProductGridEditProps,
  perfumesCollectionBanners: GenericPromoBannersEditProps,
  perfumesBlogArticles: GenericBlogPostsEditProps,
  perfumesInstagram: GenericInstagramEditProps,
  perfumesFooter: GenericFooterEditProps,

  // Template aliases → map to their base editor
  featured_products: ProductGridProps,
  featured_dishes: ProductGridProps,
  featured_toys: ProductGridProps,
  new_arrivals: ProductGridProps,
  best_sellers: ProductGridProps,
  categories: FeaturesProps,
  collections: FeaturesProps,
  menu: FeaturesProps,
  service_cards: FeaturesProps,
  services: FeaturesProps,
  case_studies: FeaturesProps,
  age_categories: FeaturesProps,
  reservations: ContactFormProps,
  chef: TeamProps,
  opening_hours: ContactInfoProps,
  lookbook: GalleryProps,
  promotions: BannerProps,
  projects: GalleryProps,
  portfolio: GalleryProps,
};

// ─── PANEL ───────────────────────────────────────────────────

export default function PropertyPanel({ block, onUpdate, onClose, onDelete, onDuplicate }: PropertyPanelProps) {
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
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
          <Trash2 className="h-3.5 w-3.5" /> Delete Block
        </button>
      </div>
    </div>
  );
}
