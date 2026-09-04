"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";
import { 
  Copy, 
  Trash2, 
  Scissors, 
  Clipboard, 
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

// Block types that are core storefront infrastructure rather than ordinary
// page content. These stay fully movable and restylable — merchants should
// be free to reposition/reskin them — but are protected from accidental
// deletion by default, without needing any stored flag or data migration:
// protection is derived from `type`, so it applies uniformly to every site
// immediately, including ones saved before this existed.
const STRUCTURAL_TYPES = new Set(["cart"]);

export default function ContextMenu({ elementId, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    deleteElement,
    duplicateElement,
    updateElement,
    copyElementToClipboard,
    pasteElement,
    clipboardElement,
    pageStructure,
  } = useEditorStore();

  // Find the actual element (not just its id) so Lock/Hide can read current
  // state and toggle it, instead of always setting a hardcoded value.
  const findElement = (elements: any[], id: string): any => {
    for (const el of elements) {
      if (el.id === id) return el;
      const nested = el.elements || el.children || el.columns;
      if (Array.isArray(nested)) {
        const found = findElement(nested, id);
        if (found) return found;
      }
    }
    return null;
  };
  const currentElement = findElement(pageStructure.elements, elementId);
  const isStructural = STRUCTURAL_TYPES.has(currentElement?.type);
  const isLocked = Boolean(currentElement?.locked) || isStructural;
  const isHidden = currentElement?.visible === false;

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
    if (isLocked) return;
    deleteElement(elementId);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateElement(elementId);
    onClose();
  };

  const handleCopy = () => {
    copyElementToClipboard(elementId);
    onClose();
  };

  const handleCut = () => {
    if (isLocked) return;
    copyElementToClipboard(elementId);
    deleteElement(elementId);
    onClose();
  };

  const handlePaste = () => {
    pasteElement();
    onClose();
  };

  const handleToggleLock = () => {
    updateElement(elementId, { locked: !isLocked });
    onClose();
  };

  const handleToggleVisibility = () => {
    updateElement(elementId, { visible: isHidden ? true : false });
    onClose();
  };

  const menuItems = [
    {
      icon: Copy,
      label: "Duplicate",
      action: handleDuplicate,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Scissors,
      label: "Cut",
      action: handleCut,
      disabled: isLocked,
      color: isLocked ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Clipboard,
      label: "Copy",
      action: handleCopy,
      color: "text-gray-700 dark:text-gray-300",
    },
    ...(clipboardElement ? [{
      icon: Clipboard,
      label: "Paste",
      action: handlePaste,
      color: "text-gray-700 dark:text-gray-300",
    }] : []),
    ...(isStructural ? [] : [{
      icon: isLocked ? Unlock : Lock,
      label: isLocked ? "Unlock" : "Lock",
      action: handleToggleLock,
      color: "text-gray-700 dark:text-gray-300",
    }]),
    {
      icon: isHidden ? Eye : EyeOff,
      label: isHidden ? "Show" : "Hide",
      action: handleToggleVisibility,
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Trash2,
      label: isStructural ? "Delete (protected)" : "Delete",
      action: handleDelete,
      disabled: isLocked,
      color: isLocked ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-red-600 dark:text-red-400",
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
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:hover:bg-transparent ${item.color}`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
