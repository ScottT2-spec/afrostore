"use client";
import { useState, useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { Layers, ImageIcon, Type, MousePointer, Layout, ExternalLink } from "@/components/icons/FilledIcons";
import type { TemplateElement, TemplateSection } from "@/lib/builder/template-editor-types";

/* ─── helpers ─────────────────────────────────────────────── */

function rgbToHex(rgb: string | undefined): string {
  if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "#ffffff";
  if (rgb.startsWith("#")) return rgb.length > 7 ? rgb.substring(0, 7) : rgb;
  const parts = rgb.match(/\d+/g);
  if (!parts || parts.length < 3) return "#000000";
  return (
    "#" +
    ((1 << 24) + (parseInt(parts[0]) << 16) + (parseInt(parts[1]) << 8) + parseInt(parts[2]))
      .toString(16)
      .slice(1)
  );
}

const kindLabel: Record<string, string> = {
  text: "Text",
  image: "Image",
  link: "Link",
  button: "Button",
  section: "Section",
};

const kindIcon: Record<string, React.ElementType> = {
  text: Type,
  image: ImageIcon,
  link: ExternalLink,
  button: MousePointer,
  section: Layout,
};

/* ─── props ───────────────────────────────────────────────── */

interface Props {
  element: TemplateElement | null;
  sections: TemplateSection[];
  onUpdateText: (id: string, text: string) => void;
  onUpdateLink: (id: string, href: string, target: string) => void;
  onUpdateImage: (id: string, src: string, alt: string) => void;
  onUpdateStyles: (id: string, styles: Record<string, string>) => void;
  onRemoveElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onDeselect: () => void;
  onUploadImage: (file: File, elementId: string) => void;
}

/* ─── component ───────────────────────────────────────────── */

export default function TemplateElementPanel({
  element,
  sections,
  onUpdateText,
  onUpdateLink,
  onUpdateImage,
  onUpdateStyles,
  onRemoveElement,
  onSelectSection,
  onDeselect,
  onUploadImage,
}: Props) {
  /* ── no element selected → sections overview ── */
  if (!element) {
    return (
      <div className="w-72 border-l border-surface-200 bg-white h-full overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-surface-100">
          <h3 className="text-sm font-bold text-surface-900 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-brand-600" />
            Template Sections
          </h3>
          <p className="mt-1 text-xs text-surface-500">
            Click any element in the preview to edit it here.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sections.length === 0 && (
            <p className="text-xs text-surface-400 text-center py-8">
              Click &quot;Customize Template&quot; to start editing
            </p>
          )}
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-surface-100 hover:border-brand-200 hover:bg-brand-50/50 transition-colors cursor-pointer group"
              onClick={() => onSelectSection(s.id)}
            >
              <span className="text-[10px] font-mono text-surface-400 w-5">
                {s.index + 1}
              </span>
              <span className="text-[10px] font-bold uppercase text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                {s.tag}
              </span>
              <span className="text-xs text-surface-700 truncate flex-1">
                {s.label || "Section"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveElement(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                title="Remove section"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── element selected → editing panel ── */
  const Icon = kindIcon[element.kind] || Type;

  return (
    <div className="w-72 border-l border-surface-200 bg-white h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-brand-50 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">
              {kindLabel[element.kind] || "Element"}
            </h3>
            <p className="text-[10px] text-surface-400 font-mono">{element.tag}</p>
          </div>
        </div>
        <button
          onClick={onDeselect}
          className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── Text / Link / Button editing ── */}
        {(element.kind === "text" ||
          element.kind === "link" ||
          element.kind === "button") && (
          <TextFields
            element={element}
            onUpdateText={onUpdateText}
            onUpdateStyles={onUpdateStyles}
          />
        )}

        {/* ── Link-specific fields ── */}
        {(element.kind === "link" || element.kind === "button") && (
          <LinkFields element={element} onUpdateLink={onUpdateLink} />
        )}

        {/* ── Image editing ── */}
        {element.kind === "image" && (
          <ImageFields
            element={element}
            onUpdateImage={onUpdateImage}
            onUploadImage={onUploadImage}
          />
        )}

        {/* ── Section editing ── */}
        {element.kind === "section" && (
          <SectionFields
            element={element}
            onUpdateStyles={onUpdateStyles}
            onUploadImage={onUploadImage}
          />
        )}
      </div>

      {/* Remove button */}
      <div className="p-4 border-t border-surface-100">
        <button
          onClick={() => {
            onRemoveElement(element.id);
            onDeselect();
          }}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg py-2.5 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove {kindLabel[element.kind] || "Element"}
        </button>
      </div>
    </div>
  );
}

/* ─── TEXT FIELDS ─────────────────────────────────────────── */

function TextFields({
  element,
  onUpdateText,
  onUpdateStyles,
}: {
  element: TemplateElement;
  onUpdateText: (id: string, text: string) => void;
  onUpdateStyles: (id: string, styles: Record<string, string>) => void;
}) {
  const [text, setText] = useState(element.text || "");
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setText(element.text || "");
  }, [element.id, element.text]);

  const handleTextChange = (val: string) => {
    setText(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => onUpdateText(element.id, val), 300);
  };

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Text Content
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
          placeholder="Enter text..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Font Size
        </label>
        <input
          type="text"
          defaultValue={element.styles.fontSize || ""}
          placeholder="e.g. 16px, 1.2rem"
          onChange={(e) =>
            onUpdateStyles(element.id, { fontSize: e.target.value })
          }
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Text Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            defaultValue={rgbToHex(element.styles.color)}
            onChange={(e) =>
              onUpdateStyles(element.id, { color: e.target.value })
            }
            className="h-10 w-14 rounded-lg border border-surface-200 bg-white p-1 cursor-pointer"
          />
          <input
            type="text"
            defaultValue={rgbToHex(element.styles.color)}
            placeholder="#000000"
            onChange={(e) =>
              onUpdateStyles(element.id, { color: e.target.value })
            }
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Font Weight
        </label>
        <select
          defaultValue={element.styles.fontWeight || ""}
          onChange={(e) =>
            onUpdateStyles(element.id, { fontWeight: e.target.value })
          }
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="">Default</option>
          <option value="normal">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="bold">Bold (700)</option>
          <option value="900">Black (900)</option>
        </select>
      </div>
    </>
  );
}

/* ─── LINK FIELDS ─────────────────────────────────────────── */

function LinkFields({
  element,
  onUpdateLink,
}: {
  element: TemplateElement;
  onUpdateLink: (id: string, href: string, target: string) => void;
}) {
  const [href, setHref] = useState(element.href || "");
  const [newTab, setNewTab] = useState(false);

  useEffect(() => {
    setHref(element.href || "");
  }, [element.id, element.href]);

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Link URL
        </label>
        <input
          type="url"
          value={href}
          onChange={(e) => {
            setHref(e.target.value);
            onUpdateLink(
              element.id,
              e.target.value,
              newTab ? "_blank" : "_self"
            );
          }}
          placeholder="https://example.com"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs font-medium text-surface-700">
          Open in new tab
        </span>
        <button
          type="button"
          onClick={() => {
            const next = !newTab;
            setNewTab(next);
            onUpdateLink(element.id, href, next ? "_blank" : "_self");
          }}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            newTab ? "bg-brand-600" : "bg-surface-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              newTab ? "translate-x-5" : ""
            }`}
          />
        </button>
      </label>
    </>
  );
}

/* ─── IMAGE FIELDS ────────────────────────────────────────── */

function ImageFields({
  element,
  onUpdateImage,
  onUploadImage,
}: {
  element: TemplateElement;
  onUpdateImage: (id: string, src: string, alt: string) => void;
  onUploadImage: (file: File, elementId: string) => void;
}) {
  const [src, setSrc] = useState(element.src || "");
  const [alt, setAlt] = useState(element.alt || "");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSrc(element.src || "");
    setAlt(element.alt || "");
  }, [element.id, element.src, element.alt]);

  return (
    <>
      {/* Preview */}
      {src && (
        <div className="rounded-lg border border-surface-200 overflow-hidden bg-surface-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-32 object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
          />
        </div>
      )}

      <div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg py-2.5 transition-colors"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Upload New Image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadImage(file, element.id);
          }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={src}
          onChange={(e) => {
            setSrc(e.target.value);
            onUpdateImage(element.id, e.target.value, alt);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={alt}
          onChange={(e) => {
            setAlt(e.target.value);
            onUpdateImage(element.id, src, e.target.value);
          }}
          placeholder="Describe the image"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
    </>
  );
}

/* ─── SECTION FIELDS ──────────────────────────────────────── */

function SectionFields({
  element,
  onUpdateStyles,
  onUploadImage,
}: {
  element: TemplateElement;
  onUpdateStyles: (id: string, styles: Record<string, string>) => void;
  onUploadImage: (file: File, elementId: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Background Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            defaultValue={rgbToHex(element.styles.backgroundColor)}
            onChange={(e) =>
              onUpdateStyles(element.id, { backgroundColor: e.target.value })
            }
            className="h-10 w-14 rounded-lg border border-surface-200 bg-white p-1 cursor-pointer"
          />
          <input
            type="text"
            defaultValue={rgbToHex(element.styles.backgroundColor)}
            placeholder="#ffffff"
            onChange={(e) =>
              onUpdateStyles(element.id, { backgroundColor: e.target.value })
            }
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Text Color (all children)
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            defaultValue={rgbToHex(element.styles.color)}
            onChange={(e) =>
              onUpdateStyles(element.id, { color: e.target.value })
            }
            className="h-10 w-14 rounded-lg border border-surface-200 bg-white p-1 cursor-pointer"
          />
          <input
            type="text"
            defaultValue={rgbToHex(element.styles.color)}
            placeholder="#000000"
            onChange={(e) =>
              onUpdateStyles(element.id, { color: e.target.value })
            }
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-700 mb-1">
          Background Image
        </label>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg py-2.5 transition-colors mb-2"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {element.styles.backgroundImage &&
          element.styles.backgroundImage !== "none"
            ? "Change Background Image"
            : "Add Background Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadImage(file, element.id);
          }}
        />
        {element.styles.backgroundImage &&
          element.styles.backgroundImage !== "none" && (
            <button
              onClick={() =>
                onUpdateStyles(element.id, { backgroundImage: "none" })
              }
              className="w-full text-xs text-red-500 hover:text-red-700 py-1 transition-colors"
            >
              Remove Background Image
            </button>
          )}
      </div>
    </>
  );
}
