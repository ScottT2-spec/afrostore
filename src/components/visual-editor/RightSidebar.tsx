"use client";

import { useEditorStore } from "@/lib/visual-editor/store";
import { useSelectedElement } from "@/lib/visual-editor/store";
import { TabType } from "@/lib/visual-editor/types";
import { Settings, Palette, Sliders } from "lucide-react";
import ContentPanel from "@/components/visual-editor/panels/ContentPanel";
import StylePanel from "@/components/visual-editor/panels/StylePanel";
import AdvancedPanel from "@/components/visual-editor/panels/AdvancedPanel";

export default function RightSidebar() {
  const { selectedElementId, activeTab, setActiveTab, updateElement } = useEditorStore();
  const selectedElement = useSelectedElement();

  const handleUpdate = (updates: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, updates);
    }
  };

  if (!selectedElement || !selectedElementId) {
    return (
      <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Settings className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            No Element Selected
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click on an element in the canvas to edit its settings
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Element Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
          {selectedElement.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {selectedElement.type}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "content"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Settings className="h-4 w-4" />
          Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "style"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Palette className="h-4 w-4" />
          Style
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "advanced"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "content" && (
          <ContentPanel element={selectedElement} onUpdate={handleUpdate} />
        )}
        {activeTab === "style" && (
          <StylePanel element={selectedElement} onUpdate={handleUpdate} />
        )}
        {activeTab === "advanced" && (
          <AdvancedPanel element={selectedElement} onUpdate={handleUpdate} />
        )}
      </div>
    </aside>
  );
}
