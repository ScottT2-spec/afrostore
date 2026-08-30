"use client";

interface StylePanelProps {
  element: any;
  onUpdate: (updates: any) => void;
}

export default function StylePanel({ element, onUpdate }: StylePanelProps) {
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
  // Mirroring into content too, same fix pattern as AdvancedPanel.
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
