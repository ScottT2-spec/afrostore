"use client";

import { useEffect, useState, useRef } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";
import { DeviceType } from "@/lib/visual-editor/types";
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Save, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone,
  Settings,
  LayoutGrid,
  Navigation,
  History,
  Globe,
  X,
  Menu,
  Search,
  Moon,
  Sun
} from "lucide-react";
import LeftSidebar from "@/components/visual-editor/LeftSidebar";
import RightSidebar from "@/components/visual-editor/RightSidebar";
import EditorCanvas from "@/components/visual-editor/EditorCanvas";
import EditorToolbar from "@/components/visual-editor/EditorToolbar";
import Navigator from "@/components/visual-editor/Navigator";

interface VisualEditorProps {
  pageId: string;
  siteId: string;
  initialContent?: any;
  onSave: (content: any) => Promise<void>;
  onBack: () => void;
  pageTitle?: string;
}

export default function VisualEditor({
  pageId,
  siteId,
  initialContent,
  onSave,
  onBack,
  pageTitle = "Visual Editor"
}: VisualEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    initialize,
    pageStructure,
    selectedElementId,
    device,
    isNavigatorOpen,
    isDirty,
    canUndo,
    canRedo,
    darkMode,
    setDevice,
    setNavigatorOpen,
    undo,
    redo,
    setDarkMode,
    markSaved,
    setSaving
  } = useEditorStore();

  // Initialize editor with page content
  useEffect(() => {
    if (initialContent) {
      initialize(initialContent, siteId);
    }
  }, [initialContent, siteId, initialize]);

  // Handle save
  const handleSave = async () => {
    console.log("VisualEditor handleSave called - isDirty:", isDirty);

    const activeElement = typeof document !== "undefined" ? document.activeElement as HTMLElement | null : null;
    if (activeElement && activeElement !== document.body) {
      activeElement.blur?.();
    }

    const latestPageStructure = useEditorStore.getState().pageStructure;

    if (!useEditorStore.getState().isDirty) {
      console.log("Not saving - not dirty");
      return;
    }
    
    setIsSaving(true);
    setSaving(true);
    setSaveStatus("saving");
    
    console.log("Calling onSave with pageStructure:", latestPageStructure);
    
    try {
      await onSave(latestPageStructure);
      markSaved();
      setSaveStatus("saved");
      console.log("Save successful");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
      setSaving(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return;

    // Clear previous auto-save timer
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    // Set new auto-save timer (30 seconds)
    autoSaveRef.current = setTimeout(() => {
      handleSave();
    }, 30000);

    // Cleanup on unmount
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [isDirty, pageStructure]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = typeof document !== "undefined" ? document.activeElement as HTMLElement | null : null;
      const isInlineEditableActive = Boolean(activeElement?.closest?.('[contenteditable="true"], [data-inline-field], [data-inline-editable="true"]'));
      if (isInlineEditableActive) {
        return;
      }

      // Cmd/Ctrl + Z - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y - Redo
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      
      // Cmd/Ctrl + S - Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      
      // Cmd/Ctrl + E - Finder (placeholder)
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        // TODO: Implement finder
      }
      
      // Cmd/Ctrl + I - Navigator
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        setNavigatorOpen(!isNavigatorOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, handleSave, isNavigatorOpen, setNavigatorOpen]);

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      {/* Top Toolbar */}
      <EditorToolbar
        pageTitle={pageTitle}
        onBack={onBack}
        onSave={handleSave}
        isSaving={isSaving}
        saveStatus={saveStatus}
        isDirty={isDirty}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        device={device}
        onDeviceChange={setDevice}
        isNavigatorOpen={isNavigatorOpen}
        onNavigatorToggle={() => setNavigatorOpen(!isNavigatorOpen)}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Widget Library */}
        <LeftSidebar />

        {/* Center Canvas */}
        <EditorCanvas />

        {/* Right Sidebar - Settings */}
        <RightSidebar />

        {/* Navigator Panel (Floating) */}
        {isNavigatorOpen && (
          <Navigator />
        )}
      </div>
    </div>
  );
}
