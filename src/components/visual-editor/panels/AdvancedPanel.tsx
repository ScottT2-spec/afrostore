"use client";

import { updateNestedValueAtPath } from "@/lib/visual-editor/style-utils";

interface AdvancedPanelProps {
  element: any;
  onUpdate: (updates: any) => void;
}

export default function AdvancedPanel({ element, onUpdate }: AdvancedPanelProps) {
  const updateStyle = (path: string, value: any) => {
    console.log("AdvancedPanel updateStyle - path:", path, "value:", value);
    const styles = updateNestedValueAtPath(element.styles, path, value);
    console.log("AdvancedPanel calling onUpdate with styles:", styles);
    onUpdate({ styles });
  };

  const updateSetting = (key: string, value: any) => {
    console.log("AdvancedPanel updateSetting - key:", key, "value:", value);
    onUpdate({
      settings: {
        ...element.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Position */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Position
        </h4>
        
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Position Type</label>
          <select
            value={element.styles?.position?.type || "static"}
            onChange={(e) => updateStyle('position.type', e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="static">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>
        
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Z-Index</label>
          <input
            type="number"
            value={element.styles?.position?.zIndex || 1}
            onChange={(e) => updateStyle('position.zIndex', parseInt(e.target.value) || 1)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="1"
          />
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Effects
        </h4>
        
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Opacity</label>
          <input
            type="range"
            min="0"
            max="100"
            value={(element.styles?.effects?.opacity || 1) * 100}
            onChange={(e) => updateStyle('effects.opacity', parseInt(e.target.value) / 100)}
            className="w-full"
          />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {Math.round((element.styles?.effects?.opacity || 1) * 100)}%
          </span>
        </div>
        
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Box Shadow</label>
          <input
            type="text"
            value={element.styles?.effects?.boxShadow || "none"}
            onChange={(e) => updateStyle('effects.boxShadow', e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="0 2px 4px rgba(0,0,0,0.1)"
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Visibility
        </h4>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="visible"
            checked={element.visible !== false}
            onChange={(e) => updateSetting('visible', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="visible" className="text-xs text-gray-700 dark:text-gray-300">
            Visible
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="locked"
            checked={element.locked || false}
            onChange={(e) => updateSetting('locked', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="locked" className="text-xs text-gray-700 dark:text-gray-300">
            Locked (prevent editing)
          </label>
        </div>
      </div>

      {/* Custom CSS */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Custom CSS
        </h4>
        
        <textarea
          value={element.settings?.customCss || ""}
          onChange={(e) => updateSetting('customCss', e.target.value)}
          rows={4}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono resize-none"
          placeholder=".my-class { }"
        />
      </div>
    </div>
  );
}
