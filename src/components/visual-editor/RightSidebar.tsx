"use client";

import { useEditorStore } from "@/lib/visual-editor/store";
import { useSelectedElement, useSelectedElementPath } from "@/lib/visual-editor/store";
import { TabType } from "@/lib/visual-editor/types";
import { Settings, Palette, Sliders, ChevronRight } from "lucide-react";
import ContentPanel from "@/components/visual-editor/panels/ContentPanel";
import { PanelErrorBoundary } from "@/components/visual-editor/PanelErrorBoundary";
import StylePanel from "@/components/visual-editor/panels/StylePanel";
import AdvancedPanel from "@/components/visual-editor/panels/AdvancedPanel";
import { EDITOR_SIMPLE_MODE } from "@/lib/visual-editor/editorMode";

export default function RightSidebar() {
  const { selectedElementId, activeTab, setActiveTab, updateElement } = useEditorStore();
  const selectedElement = useSelectedElement();
  const selectedPath = useSelectedElementPath();

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
        {selectedPath.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            {selectedPath.map((node, index) => (
              <span key={node.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => useEditorStore.getState().setSelectedElementId(node.id)}
                  className="rounded px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {node.name || node.type}
                </button>
                {index < selectedPath.length - 1 && <ChevronRight className="h-3 w-3 text-gray-400" />}
              </span>
            ))}
          </div>
        )}
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
        {!EDITOR_SIMPLE_MODE && (
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
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "content" && (
          <PanelErrorBoundary panelName="Content" elementType={selectedElement?.type}>
            <ContentPanel element={selectedElement} onUpdate={handleUpdate} />
          </PanelErrorBoundary>
        )}
        {activeTab === "style" && (
          <PanelErrorBoundary panelName="Style" elementType={selectedElement?.type}>
            <StylePanel element={selectedElement} onUpdate={handleUpdate} />
          </PanelErrorBoundary>
        )}
        {!EDITOR_SIMPLE_MODE && activeTab === "advanced" && (
          <PanelErrorBoundary panelName="Advanced" elementType={selectedElement?.type}>
            <AdvancedPanel element={selectedElement} onUpdate={handleUpdate} />
          </PanelErrorBoundary>
        )}
      </div>
    </aside>
  );
}
