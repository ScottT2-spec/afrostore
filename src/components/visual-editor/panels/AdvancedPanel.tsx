"use client";

import { useState } from "react";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";

type Breakpoint = "desktop" | "tablet" | "mobile";
type Mode = "normal" | "hover";

interface AdvancedPanelProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function AdvancedPanel({ element, onUpdate }: AdvancedPanelProps) {
  const [mode, setMode] = useState<Mode>("normal");
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const settings = isPlainObject(element?.settings) ? element.settings : {};

  const hoverKey = (key: string) => `hover${capitalize(key)}`;

  const getDeviceSettings = (target: Breakpoint): Record<string, unknown> => {
    if (target === "desktop") {
      return isPlainObject(settings.desktop) ? settings.desktop : settings;
    }
    return isPlainObject(settings[target]) ? settings[target] : {};
  };

  const getValue = (key: string, fallback = ""): string | number => {
    if (mode === "hover") {
      const hoverValue = settings[hoverKey(key)];
      if (hoverValue !== undefined && hoverValue !== null) return hoverValue as string | number;
      const deviceHover = getDeviceSettings(breakpoint)[hoverKey(key)];
      if (deviceHover !== undefined && deviceHover !== null) return deviceHover as string | number;
      return fallback;
    }

    const currentDevice = getDeviceSettings(breakpoint);
    const currentValue = currentDevice[key];
    if (currentValue !== undefined && currentValue !== null && currentValue !== "") return currentValue as string | number;
    const baseValue = settings[key];
    if (baseValue !== undefined && baseValue !== null && baseValue !== "") return baseValue as string | number;
    return fallback;
  };

  const commitTopLevel = (nextSettings: Record<string, unknown>) => {
    onUpdate({ settings: nextSettings });
  };

  const updateSetting = (key: string, value: unknown) => {
    if (key === "customCss" || key === "cssId" || key === "cssClass") {
      commitTopLevel({
        ...settings,
        [key]: value,
      });
      return;
    }

    if (mode === "hover") {
      commitTopLevel({
        ...settings,
        [hoverKey(key)]: value,
      });
      return;
    }

    if (breakpoint === "desktop") {
      const desktopSettings = isPlainObject(settings.desktop) ? settings.desktop : {};
      commitTopLevel({
        ...settings,
        [key]: value,
        desktop: {
          ...desktopSettings,
          [key]: value,
        },
      });
      return;
    }

    const currentDevice = getDeviceSettings(breakpoint);
    commitTopLevel({
      ...settings,
      [breakpoint]: {
        ...currentDevice,
        [key]: value,
      },
    });
  };

  const renderTextInput = (label: string, key: string, placeholder = "") => (
    <div>
      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={String(getValue(key, ""))}
        onChange={(e) => updateSetting(key, e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder={placeholder}
      />
    </div>
  );

  const renderNumberInput = (label: string, key: string, placeholder = "") => (
    <div>
      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={String(getValue(key, ""))}
        onChange={(e) => updateSetting(key, e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder={placeholder}
      />
    </div>
  );

  const renderSelect = (label: string, key: string, options: Array<{ label: string; value: string }>) => (
    <div>
      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select
        value={String(getValue(key, options[0]?.value || ""))}
        onChange={(e) => updateSetting(key, e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderColorInput = (label: string, key: string, fallback = "#000000") => (
    <div>
      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={String(getValue(key, fallback))}
          onChange={(e) => updateSetting(key, e.target.value)}
          className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={String(getValue(key, fallback))}
          onChange={(e) => updateSetting(key, e.target.value)}
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );

  const activeScope = mode === "hover" ? `Hover` : `${breakpoint.charAt(0).toUpperCase()}${breakpoint.slice(1)}`;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">State</div>
            <div className="text-xs text-gray-700 dark:text-gray-300">{activeScope}</div>
          </div>
          <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("normal")}
              className={`px-3 py-1.5 text-xs font-medium ${mode === "normal" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setMode("hover")}
              className={`px-3 py-1.5 text-xs font-medium ${mode === "hover" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            >
              Hover
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {BREAKPOINTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setBreakpoint(item)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                breakpoint === item
                  ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                  : "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {capitalize(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Layout & Position</h4>
        <div className="grid grid-cols-2 gap-2">
          {renderTextInput("Margin Top", "marginTop", "0")}
          {renderTextInput("Margin Right", "marginRight", "0")}
          {renderTextInput("Margin Bottom", "marginBottom", "0")}
          {renderTextInput("Margin Left", "marginLeft", "0")}
          {renderTextInput("Margin Shorthand", "margin", "0 0 0 0")}
          {renderTextInput("Padding Top", "paddingTop", "0")}
          {renderTextInput("Padding Right", "paddingRight", "0")}
          {renderTextInput("Padding Bottom", "paddingBottom", "0")}
          {renderTextInput("Padding Left", "paddingLeft", "0")}
          {renderTextInput("Padding Shorthand", "padding", "0 0 0 0")}
          {renderTextInput("Width", "width", "100%")}
          {renderTextInput("Height", "height", "auto")}
          {renderTextInput("Min Width", "minWidth", "0")}
          {renderTextInput("Max Width", "maxWidth", "100%")}
          {renderTextInput("Min Height", "minHeight", "0")}
          {renderTextInput("Max Height", "maxHeight", "none")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {renderSelect("Position", "position", [
            { label: "Static", value: "static" },
            { label: "Relative", value: "relative" },
            { label: "Absolute", value: "absolute" },
            { label: "Fixed", value: "fixed" },
            { label: "Sticky", value: "sticky" },
          ])}
          {renderSelect("Overflow", "overflow", [
            { label: "Visible", value: "visible" },
            { label: "Hidden", value: "hidden" },
            { label: "Scroll", value: "scroll" },
            { label: "Auto", value: "auto" },
          ])}
          {renderNumberInput("Z-Index", "zIndex", "1")}
          {renderTextInput("Top", "top", "auto")}
          {renderTextInput("Right", "right", "auto")}
          {renderTextInput("Bottom", "bottom", "auto")}
          {renderTextInput("Left", "left", "auto")}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Background</h4>
        <div className="grid grid-cols-2 gap-2">
          {renderColorInput("Background Color", "backgroundColor", "#ffffff")}
          {renderTextInput("Background Image", "backgroundImage", "https://...")}
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Or upload one</label>
            <SingleImageUpload
              image={String(getValue("backgroundImage", "")) || null}
              onChange={(url) => updateSetting("backgroundImage", url || "")}
              compact
            />
          </div>
          {renderTextInput("Background Gradient", "backgroundGradient", "linear-gradient(...)")}
          {renderSelect("Background Size", "backgroundSize", [
            { label: "Auto", value: "auto" },
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
          ])}
          {renderTextInput("Background Position", "backgroundPosition", "center center")}
          {renderSelect("Background Repeat", "backgroundRepeat", [
            { label: "No Repeat", value: "no-repeat" },
            { label: "Repeat", value: "repeat" },
            { label: "Repeat X", value: "repeat-x" },
            { label: "Repeat Y", value: "repeat-y" },
          ])}
          {renderSelect("Background Attachment", "backgroundAttachment", [
            { label: "Scroll", value: "scroll" },
            { label: "Fixed", value: "fixed" },
          ])}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Border & Corners</h4>
        <div className="grid grid-cols-2 gap-2">
          {renderTextInput("Border Width", "borderWidth", "1px")}
          {renderSelect("Border Style", "borderStyle", [
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
            { label: "Double", value: "double" },
            { label: "None", value: "none" },
          ])}
          {renderColorInput("Border Color", "borderColor", "#e5e5e5")}
          {renderTextInput("Border Radius", "borderRadius", "0")}
          {renderTextInput("Top Left Radius", "borderTopLeftRadius", "0")}
          {renderTextInput("Top Right Radius", "borderTopRightRadius", "0")}
          {renderTextInput("Bottom Left Radius", "borderBottomLeftRadius", "0")}
          {renderTextInput("Bottom Right Radius", "borderBottomRightRadius", "0")}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Shadow</h4>
        {renderTextInput("Box Shadow", "boxShadow", "0 8px 24px rgba(0, 0, 0, 0.12)")}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Typography</h4>
        <div className="grid grid-cols-2 gap-2">
          {renderTextInput("Font Family", "fontFamily", "Inter, sans-serif")}
          {renderTextInput("Font Size", "fontSize", "16px")}
          {renderSelect("Font Weight", "fontWeight", [
            { label: "300", value: "300" },
            { label: "400", value: "400" },
            { label: "500", value: "500" },
            { label: "600", value: "600" },
            { label: "700", value: "700" },
            { label: "800", value: "800" },
          ])}
          {renderSelect("Font Style", "fontStyle", [
            { label: "Normal", value: "normal" },
            { label: "Italic", value: "italic" },
            { label: "Oblique", value: "oblique" },
          ])}
          {renderTextInput("Line Height", "lineHeight", "1.5")}
          {renderTextInput("Letter Spacing", "letterSpacing", "0")}
          {renderSelect("Text Align", "textAlign", [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
            { label: "Justify", value: "justify" },
          ])}
          {renderSelect("Text Transform", "textTransform", [
            { label: "None", value: "none" },
            { label: "Uppercase", value: "uppercase" },
            { label: "Lowercase", value: "lowercase" },
            { label: "Capitalize", value: "capitalize" },
          ])}
          {renderSelect("Text Decoration", "textDecoration", [
            { label: "None", value: "none" },
            { label: "Underline", value: "underline" },
            { label: "Line Through", value: "line-through" },
            { label: "Overline", value: "overline" },
          ])}
          {renderColorInput("Text Color", "color", "#171717")}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Custom CSS</h4>
        <div className="grid grid-cols-2 gap-2">
          {renderTextInput("CSS ID", "cssId", "my-element")}
          {renderTextInput("CSS Class", "cssClass", "promo hero")}
        </div>
        <textarea
          value={String(getValue("customCss", settings.customCss || ""))}
          onChange={(e) => updateSetting("customCss", e.target.value)}
          rows={5}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono resize-none"
          placeholder=".my-class { }"
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Responsive Keys</h4>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-5">
          The active breakpoint is edited in the matching nested object. Desktop values are mirrored into both the base keys and `settings.desktop` so the scoped CSS can resolve immediately.
        </div>
      </div>
    </div>
  );
}
