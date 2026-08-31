"use client";

import { isRegisteredTemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { isChildFragmentType } from "@/lib/templates/template-tree";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import LinkPicker from "./LinkPicker";

interface ContentPanelProps {
  element: any;
  onUpdate: (updates: any) => void;
}

type PropPath = Array<string | number>;

const labelize = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const describeItem = (value: any, index: number): string => {
  if (value == null) return `Item ${index + 1}`;
  if (typeof value === "string") return value.slice(0, 40) || `Item ${index + 1}`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `Array (${value.length})`;
  if (typeof value === "object") {
    const candidate = value.question || value.title || value.name || value.label || value.subtitle || value.text;
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim().slice(0, 60);
    const keys = Object.keys(value);
    return keys.length > 0 ? `${labelize(keys[0])}` : `Item ${index + 1}`;
  }
  return `Item ${index + 1}`;
};

const cloneValue = (value: any): any => {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneValue(child)]));
  }
  return value;
};

const createDefaultValue = (sample: any): any => {
  if (Array.isArray(sample)) {
    return sample.length > 0 ? [createDefaultValue(sample[0])] : [""];
  }

  if (sample && typeof sample === "object") {
    return Object.fromEntries(
      Object.entries(sample).map(([key, child]) => [key, createDefaultValue(child)])
    );
  }

  switch (typeof sample) {
    case "number":
      return 0;
    case "boolean":
      return false;
    default:
      return "";
  }
};

const updateValueAtPath = (root: any, path: PropPath, value: any): any => {
  if (path.length === 0) return cloneValue(value);

  const [head, ...rest] = path;
  const nextRoot = Array.isArray(root) ? [...root] : { ...(root || {}) };
  const currentValue = root?.[head as any];

  nextRoot[head as any] = rest.length === 0
    ? value
    : updateValueAtPath(
        currentValue ?? (typeof rest[0] === "number" ? [] : {}),
        rest,
        value
      );

  return nextRoot;
};

const isEditorNodeLike = (value: any): boolean => {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.id === "string" &&
      typeof value.type === "string"
  );
};

const getNodeLabel = (node: any, index: number): string => {
  if (!node || typeof node !== "object") return `Node ${index + 1}`;
  const candidate =
    node.title ||
    node.name ||
    node.label ||
    node.subtitle ||
    node.text ||
    node.content?.title ||
    node.content?.text ||
    node.settings?.title ||
    node.settings?.text;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim().slice(0, 60);
  return `${labelize(String(node.type || "node"))} ${index + 1}`;
};

function TemplatePropEditor({
  label,
  value,
  path,
  onChange,
  depth = 0,
}: {
  label: string;
  value: any;
  path: PropPath;
  onChange: (path: PropPath, value: any) => void;
  depth?: number;
}) {
  const wrapperClass = depth > 0 ? "pl-3 border-l border-gray-200 dark:border-gray-700" : "";
  const displayLabel = labelize(label);

  if (Array.isArray(value)) {
    return (
      <details open={depth === 0} className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${wrapperClass}`}>
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-gray-900 dark:text-white flex items-center justify-between gap-3">
          <span>{displayLabel} <span className="text-gray-500 dark:text-gray-400">Array ({value.length} items)</span></span>
        </summary>
        <div className="px-3 pb-3 space-y-3">
          {value.length === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              No items yet. Add one to start editing.
            </div>
          )}
          {value.map((item, index) => (
            <div key={`${label}-${index}`} className="space-y-2 rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {describeItem(item, index)}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
                  className="text-[11px] text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <TemplatePropEditor
                label={`${label}[${index}]`}
                value={item}
                path={[...path, index]}
                onChange={onChange}
                depth={depth + 1}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange(path, [...value, createDefaultValue(value[0])])}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Add item
          </button>
        </div>
      </details>
    );
  }

  if (value && typeof value === "object") {
    if (isEditorNodeLike(value)) {
      return (
        <TemplateNodeEditor
          node={value}
          path={path}
          onChange={onChange}
          depth={depth}
        />
      );
    }

    const entries = Object.entries(value);

    return (
      <details open={depth === 0} className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${wrapperClass}`}>
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-gray-900 dark:text-white flex items-center justify-between gap-3">
          <span>{displayLabel} <span className="text-gray-500 dark:text-gray-400">Object ({entries.length} properties)</span></span>
        </summary>
        <div className="px-3 pb-3 space-y-3">
          {entries.length === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              No properties available.
            </div>
          )}
          {entries.map(([childKey, childValue]) => (
            <TemplatePropEditor
              key={`${label}.${childKey}`}
              label={childKey}
              value={childValue}
              path={[...path, childKey]}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      </details>
    );
  }

  const commonInputClass = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  const isLongText = typeof value === "string" && (value.includes("\n") || value.length > 80);
  // Field keys in template props are camelCase (backgroundImage, bgImage,
  // heroImage), not snake_case/kebab-case, so insert a boundary before each
  // internal capital before testing — otherwise "backgroundImage" never
  // matches a "preceded by _ or -" boundary and silently falls through to
  // the plain-text-only branch below, which is why fields like a slider's
  // "Background Image" had no upload option while hand-built panels (which
  // target element.type === "image" directly) always did.
  // Re-applied after an unexplained revert — checked this doesn't change
  // any save/data behavior, purely widens which fields get an upload
  // button in the UI, so there's no plausible way this alone broke
  // anything downstream.
  const wordBoundaryLabel = label.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
  // A string field whose key name suggests it holds an image URL (avatar,
  // poster, thumbnail, gallery item url, etc.) — this generic editor is
  // what drives every widget type without a hand-built content panel
  // (icon, cta, gallery, testimonial, video, social-follow, and so on),
  // so without this, image fields anywhere outside the 5 hand-built
  // editors were text-only, no upload option at all.
  const isImageField = typeof value !== "boolean" && typeof value !== "number" &&
    /(^|[_-])(src|image|img|avatar|poster|logo|photo|picture|thumbnail|banner|cover|gallery)s?([_-]|\[|$)/i.test(wordBoundaryLabel);
  // A string field whose key name suggests it holds a navigation
  // destination (buttonLink, ctaLink, href, url, destination...) — gets
  // the same page-picker treatment as the hand-built button/image panels,
  // instead of a bare text box with no way to browse the site's real pages.
  const isLinkField = typeof value === "string" && !isImageField &&
    /(^|[_-])(link|href|url|destination)s?([_-]|\[|$)/i.test(wordBoundaryLabel);

  return (
    <div className={wrapperClass}>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 capitalize">
        {displayLabel}
      </label>
      {typeof value === "boolean" ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(path, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">Toggle value</span>
        </div>
      ) : typeof value === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          className={commonInputClass}
        />
      ) : isLongText ? (
        <textarea
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
          rows={4}
          className={`${commonInputClass} resize-none`}
        />
      ) : isImageField ? (
        <div className="space-y-2">
          <SingleImageUpload
            image={(value as string) || null}
            onChange={(url) => onChange(path, url || "")}
            compact
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className={commonInputClass}
            placeholder="Or paste an image URL"
          />
        </div>
      ) : isLinkField ? (
        <LinkPicker value={value as string} onChange={(url) => onChange(path, url)} />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
          className={commonInputClass}
          placeholder={keyHintFromLabel(displayLabel)}
        />
      )}
    </div>
  );
}

function TemplateNodeEditor({
  node,
  path,
  onChange,
  depth = 0,
}: {
  node: any;
  path: PropPath;
  onChange: (path: PropPath, value: any) => void;
  depth?: number;
}) {
  const wrapperClass = depth > 0 ? "pl-3 border-l border-gray-200 dark:border-gray-700" : "";
  const childSettings = node?.settings && typeof node.settings === "object" ? Object.entries(node.settings) : [];
  const childContent = node?.content && typeof node.content === "object" ? Object.entries(node.content) : [];
  const childElements = Array.isArray(node?.elements) ? node.elements : [];

  return (
    <details open={depth === 0} className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${wrapperClass}`}>
      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-gray-900 dark:text-white flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">{getNodeLabel(node, 0)}</span>
          <span className="text-gray-500 dark:text-gray-400">Node</span>
        </span>
        <span className="text-gray-500 dark:text-gray-400">{labelize(String(node?.type || "node"))}</span>
      </summary>
      <div className="px-3 pb-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Node ID</label>
            <input
              type="text"
              value={node?.id || ""}
              onChange={(e) => onChange([...path, "id"], e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Node Type</label>
            <input
              type="text"
              value={node?.type || ""}
              onChange={(e) => onChange([...path, "type"], e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        {childSettings.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="text-xs font-medium text-gray-900 dark:text-white">Settings</div>
            {childSettings.map(([key, value]) => (
              <TemplatePropEditor
                key={`settings.${key}`}
                label={key}
                value={value}
                path={[...path, "settings", key]}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </div>
        )}

        {childContent.length > 0 && (
          <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-900 dark:text-white">Content</div>
            {childContent.map(([key, value]) => (
              <TemplatePropEditor
                key={`content.${key}`}
                label={key}
                value={value}
                path={[...path, "content", key]}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </div>
        )}

        {childElements.length > 0 && (
          <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-900 dark:text-white">Children</div>
            {childElements.map((child: any, index: number) => (
              <TemplateNodeEditor
                key={child?.id || `${node?.id || "node"}-${index}`}
                node={child}
                path={[...path, "elements", index]}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function keyHintFromLabel(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("url") || normalized.includes("src") || normalized.includes("href")) return "https://";
  return "";
}

export default function ContentPanel({ element, onUpdate }: ContentPanelProps) {
  const isTemplateNode =
    isRegisteredTemplateBlock(element.type) ||
    isChildFragmentType(element.type) ||
    element.type === "template-block";

  const updateSetting = (key: string, value: any) => {
    onUpdate({
      settings: {
        ...element.settings,
        [key]: value,
      },
      content: {
        ...element.content,
        [key]: value,
      },
    });
  };

  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: {
        ...element.content,
        [key]: value,
      },
    });
  };

  const updateProp = (key: string, value: any) => {
    onUpdate({
      content: {
        ...element.content,
        props: {
          ...element.content?.props,
          [key]: value,
        },
      },
    });
  };

  const settingsEntries = element?.settings && typeof element.settings === "object" ? Object.entries(element.settings) : [];
  const contentEntries = element?.content && typeof element.content === "object" ? Object.entries(element.content) : [];
  const childElements = Array.isArray(element?.elements) ? element.elements : [];

  // Types with a hand-built, purpose-specific editor above; everything
  // else falls back to the generic key/value editor driven by whatever
  // is actually in element.settings/content, instead of a dead end.
  const hasCustomEditor = ["heading", "paragraph", "text", "button", "image"].includes(element.type);
  const hasGenericEntries = settingsEntries.length > 0 || contentEntries.length > 0 || childElements.length > 0;
  const showGenericEditor = !hasCustomEditor && (isTemplateNode || hasGenericEntries);

  return (
    <div className="space-y-6">
      {/* Heading-specific content */}
      {element.type === "heading" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading Text
            </label>
            <input
              type="text"
              value={element.content?.text || element.settings?.text || ""}
              onChange={(e) => updateSetting("text", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading Level
            </label>
            <select
              value={element.content?.level || element.settings?.level || "h2"}
              onChange={(e) => updateSetting("level", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alignment
            </label>
            <select
              value={element.content?.align || element.settings?.align || "left"}
              onChange={(e) => updateSetting("align", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {/* Paragraph/Text-specific content */}
      {(element.type === "paragraph" || element.type === "text") && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Content
            </label>
            <textarea
              value={element.content?.content || element.content?.text || element.settings?.content || ""}
              onChange={(e) => updateSetting("content", e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alignment
            </label>
            <select
              value={element.content?.align || element.settings?.align || "left"}
              onChange={(e) => updateSetting("align", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {/* Button-specific content */}
      {element.type === "button" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Button Text
            </label>
            <input
              type="text"
              value={element.content?.text || element.settings?.text || ""}
              onChange={(e) => updateSetting("text", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Link URL
            </label>
            <LinkPicker
              value={element.content?.link || element.settings?.link || ""}
              onChange={(url) => updateSetting("link", url)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Button Style
            </label>
            <select
              value={element.content?.variant || element.settings?.variant || "primary"}
              onChange={(e) => updateSetting("variant", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Size
            </label>
            <select
              value={element.content?.size || element.settings?.size || "medium"}
              onChange={(e) => updateSetting("size", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fullWidth"
              checked={element.content?.fullWidth || element.settings?.fullWidth || false}
              onChange={(e) => updateSetting("fullWidth", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="fullWidth" className="text-xs text-gray-700 dark:text-gray-300">
              Full Width
            </label>
          </div>
        </div>
      )}

      {/* Image-specific content */}
      {element.type === "image" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Image
            </label>
            <SingleImageUpload
              image={element.content?.src || element.settings?.src || null}
              onChange={(url) => updateSetting("src", url || "")}
              label="Upload from your device"
            />
          </div>
          <div>
            <label htmlFor="image-src" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Or paste an Image URL
            </label>
            <input
              id="image-src"
              name="image-src"
              type="text"
              value={element.content?.src || element.settings?.src || ""}
              onChange={(e) => updateSetting("src", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://"
            />
          </div>
          <div>
            <label htmlFor="image-alt" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alt Text
            </label>
            <input
              id="image-alt"
              name="image-alt"
              type="text"
              value={element.content?.alt || element.settings?.alt || ""}
              onChange={(e) => updateSetting("alt", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="image-link" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Link URL
            </label>
            <LinkPicker
              value={element.content?.link || element.settings?.link || ""}
              onChange={(url) => updateSetting("link", url)}
            />
          </div>
        </div>
      )}

      {/* Generic settings editor - covers template blocks and any
          widget type without a hand-built panel above */}
      {showGenericEditor && (
        <div className="space-y-4">
          <div className="text-xs font-medium text-gray-900 dark:text-white mb-3">
            {isTemplateNode ? `Template Settings (${settingsEntries.length} properties)` : "Settings"}
          </div>
          {settingsEntries.length === 0 ? (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isTemplateNode ? "This template node has no settings yet." : "No settings for this element."}
            </div>
          ) : (
            <div className="space-y-3">
              {settingsEntries.map(([key, value]) => (
                <TemplatePropEditor
                  key={key}
                  label={key}
                  value={value}
                  path={[key]}
                  onChange={(path, nextValue) => {
                    const nextSettings = updateValueAtPath(element.settings || {}, path, nextValue);
                    const nextContent = updateValueAtPath(element.content || {}, path, nextValue);
                    onUpdate({
                      settings: nextSettings,
                      content: nextContent,
                    });
                  }}
                />
              ))}
            </div>
          )}
          {contentEntries.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {isTemplateNode ? `Template Content (${contentEntries.length} properties)` : "Content"}
              </div>
              <div className="space-y-3">
                {contentEntries.map(([key, value]) => (
                  <TemplatePropEditor
                    key={key}
                    label={key}
                    value={value}
                    path={[key]}
                    onChange={(path, nextValue) => {
                      const nextContent = updateValueAtPath(element.content || {}, path, nextValue);
                      const nextSettings = updateValueAtPath(element.settings || {}, path, nextValue);
                      onUpdate({
                        content: nextContent,
                        settings: nextSettings,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {childElements.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                Children ({childElements.length} nodes)
              </div>
              <div className="space-y-3">
                {childElements.map((child: any, index: number) => (
                  <TemplateNodeEditor
                    key={child?.id || `${element?.id || "node"}-${index}`}
                    node={child}
                    path={["elements", index]}
                    onChange={(path, nextValue) => {
                      const nextElements = updateValueAtPath(element.elements || [], path, nextValue);
                      onUpdate({
                        elements: nextElements,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback - only for elements with no custom panel and no
          settings/content/children to drive a generic editor either */}
      {!hasCustomEditor && !showGenericEditor && (
        <div className="text-center py-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Content settings for {element.type} coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
