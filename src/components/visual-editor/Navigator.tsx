"use client";

import { useEditorStore } from "@/lib/visual-editor/store";
import { X, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useState } from "react";

export default function Navigator() {
  const { pageStructure, selectedElementId, setSelectedElementId, setNavigatorOpen } = useEditorStore();
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  const toggleExpand = (elementId: string) => {
    setExpandedElements(prev => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  };

  const renderElementTree = (elements: any[], level: number = 0) => {
    return elements.map((element) => {
      const hasChildren = (element.children?.length > 0) || (element.columns?.length > 0);
      const isExpanded = expandedElements.has(element.id);
      const isSelected = selectedElementId === element.id;

      return (
        <div key={element.id}>
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
              isSelected
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => setSelectedElementId(element.id)}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(element.id);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
            <Layers className="h-3 w-3 text-gray-400" />
            <span className="text-xs font-medium truncate flex-1">
              {element.name}
            </span>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderElementTree(element.children || element.columns, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed right-80 top-14 bottom-0 w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Navigator
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setNavigatorOpen(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {pageStructure.elements.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
            No elements yet
          </p>
        ) : (
          renderElementTree(pageStructure.elements)
        )}
      </div>
    </div>
  );
}
