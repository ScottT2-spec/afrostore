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
  isPublished?: boolean;
  onPublishChange?: () => void;
}

export default function VisualEditor({
  pageId,
  siteId,
  initialContent,
  onSave,
  onBack,
  pageTitle = "Visual Editor",
  isPublished = false,
  onPublishChange
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
    setSaving,
    initialize
  } = useEditorStore();

  // Initialize editor with page content
  useEffect(() => {
    if (initialContent) {
      initialize(initialContent, siteId);
    }
  }, [initialContent, siteId, initialize]);

  // Handle save
  const handleSave = async () => {
    const activeElement = typeof document !== "undefined" ? document.activeElement as HTMLElement | null : null;
    if (activeElement && activeElement !== document.body) {
      activeElement.blur?.();
    }

    const latestPageStructure = useEditorStore.getState().pageStructure;

    if (!useEditorStore.getState().isDirty) {
      return;
    }
    
    setIsSaving(true);
    setSaving(true);
    setSaveStatus("saving");
    
    try {
      await onSave(latestPageStructure);
      markSaved();
      setSaveStatus("saved");
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

  // Auto-save functionality — fires on a fixed 30s cadence from the first
  // unsaved change, rather than resetting on every keystroke/edit. The
  // previous version cleared and restarted the timer on every single
  // pageStructure change, so a merchant actively editing continuously
  // (very common — typing text, moving elements) could go the entire
  // session without a single autosave ever completing, since each new
  // edit kept pushing the 30s mark further out. Closing the tab or losing
  // the connection mid-session would then lose everything back to the
  // last manual save.
  useEffect(() => {
    if (!isDirty) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;
      }
      return;
    }
    // Already have a pending autosave scheduled from when this dirty
    // streak started — don't push it back out on every subsequent edit.
    if (autoSaveRef.current) return;

    autoSaveRef.current = setTimeout(() => {
      autoSaveRef.current = null;
      handleSave();
    }, 30000);

    return () => {
      // Only clear on unmount, not on every dependency change — see above.
    };
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, []);

  // Warn before leaving with unsaved changes — closing the tab, refreshing,
  // or navigating away by any means other than the in-app Back button
  // previously gave zero warning and silently discarded unsaved work.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!useEditorStore.getState().isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleBack = () => {
    if (useEditorStore.getState().isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Leave without saving?");
      if (!confirmed) return;
    }
    onBack();
  };

  const handleRevert = () => {
    if (!window.confirm("Revert all changes back to the last saved version? This can't be undone.")) return;
    initialize(initialContent && typeof initialContent === "object" && Array.isArray(initialContent.elements)
      ? initialContent
      : { elements: [], settings: {} }, siteId);
    markSaved();
  };

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
        onBack={handleBack}
        onSave={handleSave}
        onRevert={handleRevert}
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
        isPublished={isPublished}
        onPublishToggle={() => onPublishChange?.()}
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
