"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";
import { 
  Copy, 
  Trash2, 
  Scissors, 
  Clipboard, 
  Edit3, 
  Lock, 
  Unlock,
  Eye,
  EyeOff
} from "lucide-react";

interface ContextMenuProps {
  elementId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ContextMenu({ elementId, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { 
    deleteElement, 
    duplicateElement, 
    updateElement, 
    selectedElementId 
  } = useEditorStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleDelete = () => {
    deleteElement(elementId);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateElement(elementId);
    onClose();
  };

  const handleCopy = () => {
    // Copy element to clipboard
    const element = selectedElementId;
    if (element) {
      navigator.clipboard.writeText(JSON.stringify(element));
    }
    onClose();
  };

  const handleToggleLock = () => {
    // Toggle lock state - would need to get the element first
    updateElement(elementId, { locked: true });
    onClose();
  };

  const handleToggleVisibility = () => {
    // Toggle visibility - would need to get the element first
    updateElement(elementId, { visible: false });
    onClose();
  };

  const menuItems = [
    {
      icon: Edit3,
      label: "Edit",
      action: () => {
        // Focus on the element for editing
        onClose();
      },
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Copy,
      label: "Duplicate",
      action: handleDuplicate,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Scissors,
      label: "Cut",
      action: handleCopy,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Clipboard,
      label: "Copy",
      action: handleCopy,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Lock,
      label: "Lock",
      action: handleToggleLock,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Eye,
      label: "Hide",
      action: handleToggleVisibility,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Trash2,
      label: "Delete",
      action: handleDelete,
      color: "text-red-600 dark:text-red-400",
      separator: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.separator && (
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
          )}
          <button
            type="button"
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${item.color}`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
