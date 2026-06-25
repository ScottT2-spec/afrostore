"use client";
import { Plus, X } from "lucide-react";
import { Copy, Trash2 } from "@/components/icons/FilledIcons";

import { BuilderBlock, BlockType } from "@/lib/builder/types";
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
      <SingleImageUpload image={(block.props.bgImage as string) || null} onChange={(url) => update("bgImage", url || "")} label="Background Image" compact />
      <PropInput label="Overlay Opacity" value={block.props.overlayOpacity ?? 50} onChange={(v) => update("overlayOpacity", v)} type="number" />
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
    </>
  );
}

function GalleryProps({ block, update }: { block: BuilderBlock; update: (key: string, val: unknown) => void }) {
  return (
    <>
      <PropInput label="Title" value={block.props.title} onChange={(v) => update("title", v)} />
      <PropInput label="Subtitle" value={block.props.subtitle} onChange={(v) => update("subtitle", v)} type="textarea" rows={2} />
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

function GenericProps({ block }: { block: BuilderBlock }) {
  return <p className="text-xs text-surface-500">Properties for this block type coming soon.</p>;
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
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
          <Trash2 className="h-3.5 w-3.5" /> Delete Block
        </button>
      </div>
    </div>
  );
}
