"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";
import { EDITOR_SIMPLE_MODE } from "@/lib/visual-editor/editorMode";

interface StylePanelProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const FONT_SIZE_PRESETS = [
  { label: "Small", value: "14px" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "XL", value: "28px" },
];

const SPACING_PRESETS = [
  { label: "None", value: "0" },
  { label: "Small", value: "8px" },
  { label: "Medium", value: "24px" },
  { label: "Large", value: "48px" },
];

const BORDER_PRESETS = [
  { label: "None", borderWidth: "0", borderStyle: "none", borderRadius: "0" },
  { label: "Subtle", borderWidth: "1px", borderStyle: "solid", borderRadius: "8px" },
  { label: "Rounded", borderWidth: "1px", borderStyle: "solid", borderRadius: "16px" },
];

// Walks the page tree collecting hex colors already used somewhere on the
// page, so "Simple" mode swatches reflect the merchant's actual site
// instead of an arbitrary generic palette. Read-only, defensive — if the
// page shape is ever unexpected this just yields fewer swatches, it never
// throws or blocks styling.
function collectUsedColors(node: any, out: Set<string>) {
  const s = node?.settings;
  if (s) {
    ["textColor", "backgroundColor", "borderColor"].forEach((k) => {
      if (typeof s[k] === "string" && /^#[0-9a-fA-F]{3,8}$/.test(s[k])) out.add(s[k]);
    });
  }
  const children = Array.isArray(node?.elements) ? node.elements : [];
  children.forEach((c: any) => collectUsedColors(c, out));
}

const modeButtonClass = (active: boolean) =>
  `flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
  }`;

const presetButtonClass = (active: boolean) =>
  `px-2 py-2 text-xs font-medium rounded-md border transition-colors ${
    active
      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
  }`;

export default function StylePanel({ element, onUpdate }: StylePanelProps) {
  const [mode, setMode] = useState<"simple" | "custom">("simple");
  // In simple mode there is no way to reach "custom" at all — the toggle
  // itself is hidden below — but this guards the render path too, so
  // there's no way for stale/local state to sneak Custom controls back in.
  const effectiveMode = EDITOR_SIMPLE_MODE ? "simple" : mode;
  const pageStructure = useEditorStore((s) => s.pageStructure);

  const usedColors = useMemo(() => {
    const set = new Set<string>();
    try {
      const roots = Array.isArray((pageStructure as any)?.elements) ? (pageStructure as any).elements : [];
      roots.forEach((el: any) => collectUsedColors(el, set));
    } catch {
      // Swatches are a convenience, never a requirement — fall through to none.
    }
    return Array.from(set).slice(0, 8);
  }, [pageStructure]);

  if (!element) {
    return (
      <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
        This item doesn&apos;t have its own style settings — try selecting the section or slide around it instead.
      </div>
    );
  }
  const settings = element.settings || {};
  const content = element.content && typeof element.content === "object" ? element.content : {};

  // Same bug class as AdvancedPanel's Background Image: editorNodeToBlock
  // merges settings then content, content wins on collision — so writing
  // a style change to settings ONLY (as this used to) silently gets
  // shadowed on the live site by any stale value already in content for
  // that same key (e.g. from an AI-generated page or template preset).
  // Mirroring into content too, same fix pattern as AdvancedPanel. This
  // applies to the new Simple-mode presets below as well as the Custom
  // inputs — both call the same updateSetting/updateBorderSetting/
  // applySpacingPreset/applyBorderPreset functions.
  const updateSetting = (key: string, value: any) => {
    onUpdate({
      settings: {
        ...settings,
        [key]: value,
      },
      content: {
        ...content,
        [key]: value,
      },
    });
  };

  // Border needs width + style + color together to render at all in CSS.
  // Touching any one of them while the others are unset/zero would silently
  // produce no visible border, so fill in sane defaults for the others.
  const updateBorderSetting = (key: "borderColor" | "borderWidth" | "borderStyle", value: any) => {
    const next = { ...settings, [key]: value };
    const hasNoWidth = !next.borderWidth || next.borderWidth === "0" || next.borderWidth === "0px";
    const hasNoStyle = !next.borderStyle || next.borderStyle === "none";

    if (key === "borderStyle" && value === "none") {
      onUpdate({ settings: next, content: { ...content, [key]: value } });
      return;
    }

    if (key === "borderColor" || key === "borderWidth" || key === "borderStyle") {
      if (hasNoWidth) next.borderWidth = "1px";
      if (hasNoStyle) next.borderStyle = "solid";
    }

    onUpdate({
      settings: next,
      content: { ...content, borderColor: next.borderColor, borderWidth: next.borderWidth, borderStyle: next.borderStyle },
    });
  };

  const applySpacingPreset = (value: string) => {
    const next = { ...settings, paddingTop: value, paddingBottom: value, paddingLeft: value, paddingRight: value };
    onUpdate({
      settings: next,
      content: { ...content, paddingTop: value, paddingBottom: value, paddingLeft: value, paddingRight: value },
    });
  };

  const applyBorderPreset = (preset: (typeof BORDER_PRESETS)[number]) => {
    const borderColor = settings.borderColor || "#e5e5e5";
    const next = { ...settings, borderWidth: preset.borderWidth, borderStyle: preset.borderStyle, borderRadius: preset.borderRadius, borderColor };
    onUpdate({
      settings: next,
      content: { ...content, borderWidth: preset.borderWidth, borderStyle: preset.borderStyle, borderRadius: preset.borderRadius, borderColor },
    });
  };

  const isUniformSpacing =
    settings.paddingTop === settings.paddingBottom &&
    settings.paddingTop === settings.paddingLeft &&
    settings.paddingTop === settings.paddingRight;

  return (
    <div className="space-y-6">
      {/* Simple / Custom mode toggle. "Custom" below is the exact same
          controls that existed here before this change — nothing removed,
          nothing renamed, same settings keys, same content-mirroring fix.
          "Simple" is new, additive, on top. The toggle itself is hidden
          entirely in simple mode — there's nothing to switch to. */}
      {!EDITOR_SIMPLE_MODE && (
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
          <button type="button" onClick={() => setMode("simple")} className={modeButtonClass(mode === "simple")}>
            Simple
          </button>
          <button type="button" onClick={() => setMode("custom")} className={modeButtonClass(mode === "custom")}>
            Custom
          </button>
        </div>
      )}

      {effectiveMode === "simple" ? (
        <div className="space-y-6">
          {/* Text Size */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Text Size
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {FONT_SIZE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => updateSetting("fontSize", p.value)}
                  className={presetButtonClass(settings.fontSize === p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Text Color
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {usedColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => updateSetting("textColor", c)}
                  style={{ backgroundColor: c }}
                  className={`h-7 w-7 rounded-full border-2 ${
                    settings.textColor === c ? "border-blue-500" : "border-gray-200 dark:border-gray-600"
                  }`}
                />
              ))}
              <input
                type="color"
                title="Custom color"
                value={settings.textColor || "#171717"}
                onChange={(e) => updateSetting("textColor", e.target.value)}
                className="h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Background Color
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {usedColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => updateSetting("backgroundColor", c)}
                  style={{ backgroundColor: c }}
                  className={`h-7 w-7 rounded-full border-2 ${
                    settings.backgroundColor === c ? "border-blue-500" : "border-gray-200 dark:border-gray-600"
                  }`}
                />
              ))}
              <input
                type="color"
                title="Custom color"
                value={settings.backgroundColor || "#ffffff"}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Spacing */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Spacing
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {SPACING_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applySpacingPreset(p.value)}
                  className={presetButtonClass(isUniformSpacing && settings.paddingTop === p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Border
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              {BORDER_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyBorderPreset(p)}
                  className={presetButtonClass(
                    settings.borderWidth === p.borderWidth && settings.borderRadius === p.borderRadius
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Typography */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Typography
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Font Size</label>
                <input
                  type="text"
                  value={settings.fontSize || "16px"}
                  onChange={(e) => updateSetting("fontSize", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="16px"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Font Weight</label>
                <select
                  value={settings.fontWeight || "400"}
                  onChange={(e) => updateSetting("fontWeight", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Line Height</label>
                <input
                  type="text"
                  value={settings.lineHeight || "1.5"}
                  onChange={(e) => updateSetting("lineHeight", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Text Align</label>
                <select
                  value={settings.textAlign || "left"}
                  onChange={(e) => updateSetting("textAlign", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.textColor || "#171717"}
                  onChange={(e) => updateSetting("textColor", e.target.value)}
                  className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.textColor || "#171717"}
                  onChange={(e) => updateSetting("textColor", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Colors
            </h4>

            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor || "#ffffff"}
                  onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                  className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.backgroundColor || ""}
                  onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.borderColor || "#e5e5e5"}
                  onChange={(e) => updateBorderSetting("borderColor", e.target.value)}
                  className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.borderColor || "#e5e5e5"}
                  onChange={(e) => updateBorderSetting("borderColor", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Spacing
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Top</label>
                <input
                  type="text"
                  value={settings.paddingTop || "0"}
                  onChange={(e) => updateSetting("paddingTop", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Bottom</label>
                <input
                  type="text"
                  value={settings.paddingBottom || "0"}
                  onChange={(e) => updateSetting("paddingBottom", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Left</label>
                <input
                  type="text"
                  value={settings.paddingLeft || "0"}
                  onChange={(e) => updateSetting("paddingLeft", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Right</label>
                <input
                  type="text"
                  value={settings.paddingRight || "0"}
                  onChange={(e) => updateSetting("paddingRight", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Border */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Border
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Width</label>
                <input
                  type="text"
                  value={settings.borderWidth || "0"}
                  onChange={(e) => updateBorderSetting("borderWidth", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="1px"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Radius</label>
                <input
                  type="text"
                  value={settings.borderRadius || "0"}
                  onChange={(e) => updateSetting("borderRadius", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Style</label>
              <select
                value={settings.borderStyle || "solid"}
                onChange={(e) => updateBorderSetting("borderStyle", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
