"use client";

import { DeviceType } from "@/lib/visual-editor/types";
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Save, 
  Monitor, 
  Tablet, 
  Smartphone,
  Navigation,
  Moon,
  Sun,
  Loader2,
  Check
} from "lucide-react";

interface EditorToolbarProps {
  pageTitle: string;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  isNavigatorOpen: boolean;
  onNavigatorToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export default function EditorToolbar({
  pageTitle,
  onBack,
  onSave,
  isSaving,
  saveStatus,
  isDirty,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  device,
  onDeviceChange,
  isNavigatorOpen,
  onNavigatorToggle,
  darkMode,
  onDarkModeToggle
}: EditorToolbarProps) {
  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
        
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            {isDirty && "Unsaved changes"}
          </p>
        </div>
      </div>

      {/* Center Section - Device Switcher */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Device Switcher */}
        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "desktop" 
                ? "bg-white dark:bg-gray-700 shadow-sm" 
                : "hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            title="Desktop"
          >
            <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("tablet")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "tablet" 
                ? "bg-white dark:bg-gray-700 shadow-sm" 
                : "hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            title="Tablet"
          >
            <Tablet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "mobile" 
                ? "bg-white dark:bg-gray-700 shadow-sm" 
                : "hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Navigator Toggle */}
        <button
          type="button"
          onClick={onNavigatorToggle}
          className={`p-2 rounded-lg transition-colors ${
            isNavigatorOpen 
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
          title="Navigator (⌘I)"
        >
          <Navigation className="h-4 w-4" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onDarkModeToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Right Section - Save */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : saveStatus === "error" ? (
            "Error"
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              {isDirty ? "Save Changes" : "Saved"}
            </>
          )}
        </button>
      </div>
    </header>
  );
}
