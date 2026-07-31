"use client";

import { updateNestedValueAtPath } from "@/lib/visual-editor/style-utils";

interface StylePanelProps {
  element: any;
  onUpdate: (updates: any) => void;
}

export default function StylePanel({ element, onUpdate }: StylePanelProps) {
  const updateStyle = (path: string, value: any) => {
    console.log("StylePanel updateStyle - path:", path, "value:", value);
    const styles = updateNestedValueAtPath(element.styles, path, value);
    console.log("StylePanel calling onUpdate with styles:", styles);
    onUpdate({ styles });
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
              value={element.styles?.typography?.fontSize || "16px"}
              onChange={(e) => updateStyle('typography.fontSize', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="16px"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Font Weight</label>
            <select
              value={element.styles?.typography?.fontWeight || "400"}
              onChange={(e) => updateStyle('typography.fontWeight', e.target.value)}
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
              value={element.styles?.typography?.lineHeight || "1.5"}
              onChange={(e) => updateStyle('typography.lineHeight', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="1.5"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Text Align</label>
            <select
              value={element.styles?.typography?.textAlign || "left"}
              onChange={(e) => updateStyle('typography.textAlign', e.target.value)}
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
              value={element.styles?.typography?.color || "#171717"}
              onChange={(e) => updateStyle('typography.color', e.target.value)}
              className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={element.styles?.typography?.color || "#171717"}
              onChange={(e) => updateStyle('typography.color', e.target.value)}
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
              value={element.styles?.colors?.background || "transparent"}
              onChange={(e) => updateStyle('colors.background', e.target.value)}
              className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={element.styles?.colors?.background || "transparent"}
              onChange={(e) => updateStyle('colors.background', e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.styles?.colors?.border || "#e5e5e5"}
              onChange={(e) => updateStyle('colors.border', e.target.value)}
              className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={element.styles?.colors?.border || "#e5e5e5"}
              onChange={(e) => updateStyle('colors.border', e.target.value)}
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
              value={element.styles?.spacing?.top || "0"}
              onChange={(e) => updateStyle('spacing.top', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Bottom</label>
            <input
              type="text"
              value={element.styles?.spacing?.bottom || "0"}
              onChange={(e) => updateStyle('spacing.bottom', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Left</label>
            <input
              type="text"
              value={element.styles?.spacing?.left || "0"}
              onChange={(e) => updateStyle('spacing.left', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Padding Right</label>
            <input
              type="text"
              value={element.styles?.spacing?.right || "0"}
              onChange={(e) => updateStyle('spacing.right', e.target.value)}
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
              value={element.styles?.border?.width || "0"}
              onChange={(e) => updateStyle('border.width', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="1px"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Radius</label>
            <input
              type="text"
              value={element.styles?.border?.radius || "0"}
              onChange={(e) => updateStyle('border.radius', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Border Style</label>
          <select
            value={element.styles?.border?.style || "solid"}
            onChange={(e) => updateStyle('border.style', e.target.value)}
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
