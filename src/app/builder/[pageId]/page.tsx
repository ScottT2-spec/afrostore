"use client";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { Clock, Columns, Copy, Eye, EyeOff, Grid3X3, GripVertical, HelpCircle, Image as ImageIcon, Layers, Layout, LayoutGrid, Mail, MessageCircle, Minus, Monitor, MousePointer, MoveVertical, Play, Redo2, Save, Shield, ShoppingBag, Smartphone, Sparkles, Type, Undo2, User } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { BuilderBlock, BlockType, blockDefaults, blockPalette } from "@/lib/builder/types";
import { BuilderHistory } from "@/lib/builder/history";
import { blockTemplates } from "@/lib/builder/templates";
import BlockRenderer from "@/components/builder/BlockRenderer";
import PropertyPanel from "@/components/builder/PropertyPanel";
import TemplateElementPanel from "@/components/builder/TemplateElementPanel";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import { parsePageContent, serializePageContent, type PageSettings } from "@/lib/page-content";
import { hasTemplateHtml as checkTemplateHtml } from "@/lib/templates/template-html-map";
import type { TemplateElement, TemplateSection } from "@/lib/builder/template-editor-types";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

// ─── ICON MAP ────────────────────────────────────────────────

const paletteIcons: Record<string, React.ElementType> = {
  type: Type, "align-left": Type, image: ImageIcon, "mouse-pointer": MousePointer,
  "move-vertical": MoveVertical, minus: Minus, layout: Layout, columns: Columns,
  grid: Grid3X3, "shopping-bag": ShoppingBag, "message-circle": MessageCircle,
  "help-circle": HelpCircle, mail: Mail, play: Play, clock: Clock, shield: Shield,
  user: User,
};

// ─── SORTABLE BLOCK WRAPPER ─────────────────────────────────

function SortableBlock({
  block,
  isSelected,
  onClick,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onInlineEdit,
  isFirst,
  isLast,
}: {
  block: BuilderBlock;
  isSelected: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInlineEdit: (key: string, value: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl transition-all ${
        isSelected ? "ring-2 ring-brand-600 ring-offset-2" : "hover:ring-2 hover:ring-brand-300 hover:ring-offset-1"
      }`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-10"
      >
        <GripVertical className="h-5 w-5 text-surface-400" />
      </div>

      {/* Block toolbar */}
      <div className="absolute -top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-0.5">
        <span className="bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mr-1">
          {block.type}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst}
          className="h-5 w-5 rounded bg-white shadow border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700 disabled:opacity-30">
          <ChevronUp className="h-3 w-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}
          className="h-5 w-5 rounded bg-white shadow border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700 disabled:opacity-30">
          <ChevronDown className="h-3 w-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="h-5 w-5 rounded bg-white shadow border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700">
          <Copy className="h-3 w-3" />
        </button>
      </div>

      {/* Block content */}
      <div className="p-4">
        <BlockRenderer block={block} isSelected={isSelected} onInlineEdit={onInlineEdit} />
      </div>
    </div>
  );
}

function PageSettingsPanel({
  settings,
  onChange,
}: {
  settings: PageSettings;
  onChange: (settings: PageSettings) => void;
}) {
  return (
    <div className="w-72 border-l border-surface-200 bg-white h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-surface-100">
        <h3 className="text-sm font-bold text-surface-900">Page Settings</h3>
        <p className="mt-1 text-xs text-surface-500">Add a background image or adjust the page shell.</p>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <SingleImageUpload
          image={settings.backgroundImage || null}
          onChange={(backgroundImage) => onChange({ ...settings, backgroundImage })}
          label="Background Image"
          compact
        />
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1">Background Color</label>
          <input
            type="color"
            value={settings.backgroundColor || "#ffffff"}
            onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
            className="h-10 w-full rounded-xl border border-surface-200 bg-white p-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1">Background Size</label>
          <select
            value={settings.backgroundSize || "cover"}
            onChange={(e) => onChange({ ...settings, backgroundSize: e.target.value as PageSettings["backgroundSize"] })}
            className="input-field text-sm py-2 w-full"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1">Background Position</label>
          <select
            value={settings.backgroundPosition || "center center"}
            onChange={(e) => onChange({ ...settings, backgroundPosition: e.target.value })}
            className="input-field text-sm py-2 w-full"
          >
            <option value="center center">Center</option>
            <option value="center top">Top</option>
            <option value="center bottom">Bottom</option>
            <option value="left center">Left</option>
            <option value="right center">Right</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1">Overlay Color</label>
          <input
            type="color"
            value={settings.overlayColor || "#000000"}
            onChange={(e) => onChange({ ...settings, overlayColor: e.target.value })}
            className="h-10 w-full rounded-xl border border-surface-200 bg-white p-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1">Overlay Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.overlayOpacity ?? 0.25}
            onChange={(e) => onChange({ ...settings, overlayOpacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN BUILDER PAGE ───────────────────────────────────────

export default function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const { currentStore } = useSite();
  const router = useRouter();

  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [pageSettings, setPageSettings] = useState<PageSettings>({});
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "templates">("blocks");
  const [showSidebar, setShowSidebar] = useState(true);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canvasMode, setCanvasMode] = useState<"builder" | "preview">("builder");
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string>("");
  const [templateEditMode, setTemplateEditMode] = useState(false);
  const [templateSelectedElement, setTemplateSelectedElement] = useState<TemplateElement | null>(null);
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>([]);
  const templateIframeRef = useRef<HTMLIFrameElement>(null);

  const historyRef = useRef(new BuilderHistory());

  // Push state to history
  const pushHistory = useCallback(() => {
    historyRef.current.push(blocks);
    setCanUndo(historyRef.current.canUndo);
    setCanRedo(historyRef.current.canRedo);
  }, [blocks]);

  // Undo
  const undo = useCallback(() => {
    const prev = historyRef.current.undo(blocks);
    if (prev) {
      setBlocks(prev);
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(historyRef.current.canRedo);
    }
  }, [blocks]);

  // Redo
  const redo = useCallback(() => {
    const next = historyRef.current.redo(blocks);
    if (next) {
      setBlocks(next);
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(historyRef.current.canRedo);
    }
  }, [blocks]);

  // Load page + check for template HTML
  useEffect(() => {
    if (!currentStore) return;
    // Set store slug immediately — needed for iframe src before async completes
    setStoreSlug(currentStore.slug);
    (async () => {
      const res = await api.get<any>(`/api/sites/${currentStore.id}/pages/${pageId}`);
      if (res.success && res.data) {
        setPageTitle(res.data.title || "");
        setIsPublished(res.data.isPublished || false);
        const content = parsePageContent(res.data.content);
        setBlocks(content.blocks as unknown as BuilderBlock[]);
        setPageSettings(content.settings);
        historyRef.current.push(content.blocks as unknown as BuilderBlock[]);

        // Synchronous template check — no async HEAD request needed
        const tplSlug = res.data.templateSlug || null;
        setTemplateSlug(tplSlug);
        if (tplSlug && checkTemplateHtml(tplSlug)) {
          setCanvasMode("preview");
        }
      }

      setLoading(false);
    })();
  }, [currentStore, pageId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if (mod && e.key === "y") { e.preventDefault(); redo(); }
      if (mod && e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBlockId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA" && document.activeElement?.tagName !== "SELECT") {
          e.preventDefault();
          deleteBlock(selectedBlockId);
        }
      }
      if (mod && e.key === "d" && selectedBlockId) { e.preventDefault(); duplicateBlock(selectedBlockId); }
      if (e.key === "Escape") setSelectedBlockId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const startTemplateEdit = () => {
    if (!storeSlug) return;
    if (templateIframeRef.current) {
      templateIframeRef.current.src = `/api/storefront/${storeSlug}/template-html?afro_edit=1`;
      setTemplateEditMode(true);
    }
  };

  // Send message to the template iframe
  const sendToIframe = useCallback((data: Record<string, unknown>) => {
    templateIframeRef.current?.contentWindow?.postMessage(data, "*");
  }, []);

  // Listen for postMessage events from the template editor iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || !e.data.type) return;
      const { type } = e.data;

      switch (type) {
        case "afro-editor-element-selected":
          setTemplateSelectedElement(e.data.element as TemplateElement);
          break;

        case "afro-editor-element-deselected":
          setTemplateSelectedElement(null);
          break;

        case "afro-editor-sections-list":
          setTemplateSections(e.data.sections as TemplateSection[]);
          break;

        case "afro-editor-started":
          setTemplateEditMode(true);
          break;

        case "afro-editor-save":
          // Save customized HTML to the template-html-editor endpoint
          if (currentStore && e.data.html) {
            (async () => {
              setSaving(true);
              await api.put(`/api/sites/${currentStore.id}/template-html-editor`, {
                customHtml: e.data.html,
              });
              setSaving(false);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            })();
          }
          break;

        case "afro-editor-cancel":
          setTemplateEditMode(false);
          setTemplateSelectedElement(null);
          setTemplateSections([]);
          // Reload iframe without edit mode
          if (templateIframeRef.current && storeSlug) {
            templateIframeRef.current.src = `/api/storefront/${storeSlug}/template-html`;
          }
          break;

        case "afro-editor-reset":
          // Reset custom HTML via DELETE and reload
          if (currentStore) {
            (async () => {
              await api.delete(`/api/sites/${currentStore.id}/template-html-editor`);
              setTemplateEditMode(false);
              setTemplateSelectedElement(null);
              setTemplateSections([]);
              if (templateIframeRef.current && storeSlug) {
                templateIframeRef.current.src = `/api/storefront/${storeSlug}/template-html`;
              }
            })();
          }
          break;

        case "afro-editor-upload-image":
          // Handle image upload from iframe, then send URL back
          if (e.data.dataUrl && currentStore) {
            (async () => {
              try {
                const res = await api.post<{ url: string }>(`/api/sites/${currentStore.id}/upload`, {
                  file: e.data.dataUrl,
                  fileName: e.data.fileName || "image.jpg",
                  mimeType: e.data.mimeType || "image/jpeg",
                });
                if (res.success && res.data?.url) {
                  sendToIframe({
                    type: "afro-editor-image-uploaded",
                    url: res.data.url,
                  });
                }
              } catch {
                // Upload failed silently
              }
            })();
          }
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [currentStore, pageId, storeSlug, sendToIframe]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    pushHistory();
    setBlocks((items) => {
      const oldIndex = items.findIndex((b) => b.id === active.id);
      const newIndex = items.findIndex((b) => b.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Block operations
  const addBlock = (type: BlockType, index?: number) => {
    pushHistory();
    const newBlock: BuilderBlock = { id: crypto.randomUUID(), type, props: blockDefaults[type]() };
    setBlocks((prev) => {
      if (index !== undefined) { const arr = [...prev]; arr.splice(index, 0, newBlock); return arr; }
      return [...prev, newBlock];
    });
    setSelectedBlockId(newBlock.id);
    setSidebarTab("blocks");
  };

  const updateBlock = useCallback((updated: BuilderBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const commitBlockUpdate = useCallback(() => { pushHistory(); }, [pushHistory]);

  const deleteBlock = useCallback((id: string) => {
    pushHistory();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId(null);
  }, [pushHistory]);

  const duplicateBlock = useCallback((id: string) => {
    pushHistory();
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const clone: BuilderBlock = {
        id: crypto.randomUUID(),
        type: original.type,
        props: JSON.parse(JSON.stringify(original.props)),
      };
      const arr = [...prev];
      arr.splice(idx + 1, 0, clone);
      setSelectedBlockId(clone.id);
      return arr;
    });
  }, [pushHistory]);

  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    pushHistory();
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      return arrayMove(prev, idx, newIdx);
    });
  }, [pushHistory]);

  const applyTemplate = (templateIdx: number) => {
    const template = blockTemplates[templateIdx];
    if (!template) return;
    pushHistory();
    // Give each block a fresh ID
    const newBlocks = template.blocks.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
      props: JSON.parse(JSON.stringify(b.props)),
    }));
    setBlocks(newBlocks);
    setSelectedBlockId(null);
  };

  // Save
  const handleSave = async () => {
    if (!currentStore) return;
    setSaving(true);
    const res = await api.patch(`/api/sites/${currentStore.id}/pages/${pageId}`, {
      title: pageTitle,
      content: serializePageContent({ blocks, settings: pageSettings }),
      isPublished,
    });
    setSaving(false);
    if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const categories = ["basic", "layout", "commerce", "social", "marketing"] as const;
  const categoryLabels: Record<string, string> = { basic: "Basic", layout: "Layout", commerce: "Commerce", social: "Social", marketing: "Marketing" };

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Toolbar */}
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <ArrowLeft className="h-4 w-4 text-surface-500" />
          </Link>
          <div className="h-5 w-px bg-surface-200" />
          <input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="text-sm font-bold text-surface-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 w-48"
            placeholder="Page title..."
          />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Undo/Redo */}
          <button onClick={undo} disabled={!canUndo} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors" title="Undo (⌘Z)">
            <Undo2 className="h-4 w-4 text-surface-500" />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors" title="Redo (⌘⇧Z)">
            <Redo2 className="h-4 w-4 text-surface-500" />
          </button>

          <div className="h-5 w-px bg-surface-200 mx-1" />

          {/* Canvas mode toggle — Builder vs Live Preview */}
          {checkTemplateHtml(templateSlug) && (
            <>
              <div className="flex items-center rounded-lg border border-surface-200 p-0.5 mr-1">
                <button onClick={() => setCanvasMode("builder")} className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${canvasMode === "builder" ? "bg-brand-100 text-brand-700" : "text-surface-500"}`} title="Block Editor">
                  <LayoutGrid className="h-3.5 w-3.5 inline mr-0.5" />Blocks
                </button>
                <button onClick={() => setCanvasMode("preview")} className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${canvasMode === "preview" ? "bg-brand-100 text-brand-700" : "text-surface-500"}`} title="Live Template Preview">
                  <Eye className="h-3.5 w-3.5 inline mr-0.5" />Preview
                </button>
              </div>
              {canvasMode === "preview" && !templateEditMode && (
                <button
                  onClick={startTemplateEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors mr-1"
                  title="Customize the template — change text, images, colors"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Customize Template
                </button>
              )}
              {templateEditMode && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-purple-600 text-white mr-1">
                  <Sparkles className="h-3.5 w-3.5" /> Customizing...
                </span>
              )}
            </>
          )}

          {/* Preview toggle */}
          <div className="flex items-center rounded-lg border border-surface-200 p-0.5">
            <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-surface-100" : ""}`} title="Desktop">
              <Monitor className="h-4 w-4 text-surface-500" />
            </button>
            <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-surface-100" : ""}`} title="Mobile">
              <Smartphone className="h-4 w-4 text-surface-500" />
            </button>
          </div>

          {/* Sidebar toggle */}
          <button onClick={() => setShowSidebar(!showSidebar)} className={`p-2 rounded-lg transition-colors ${showSidebar ? "bg-brand-50 text-brand-600" : "hover:bg-surface-100 text-surface-500"}`} title="Toggle blocks panel">
            <LayoutGrid className="h-4 w-4" />
          </button>

          <div className="h-5 w-px bg-surface-200 mx-1" />

          {/* Publish toggle */}
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${isPublished ? "bg-green-50 text-green-700 border-green-200" : "bg-surface-50 text-surface-500 border-surface-200"}`}
          >
            {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {isPublished ? "Published" : "Draft"}
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-4">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? "Saved ✓" : <><Save className="h-3.5 w-3.5" /> Save</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — Blocks + Templates */}
        {showSidebar && (
          <div className="w-56 border-r border-surface-200 bg-white overflow-y-auto flex-shrink-0 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-surface-100">
              <button onClick={() => setSidebarTab("blocks")} className={`flex-1 text-xs font-semibold py-2.5 text-center transition-colors ${sidebarTab === "blocks" ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400"}`}>
                <LayoutGrid className="h-3.5 w-3.5 inline mr-1" />Blocks
              </button>
              <button onClick={() => setSidebarTab("templates")} className={`flex-1 text-xs font-semibold py-2.5 text-center transition-colors ${sidebarTab === "templates" ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400"}`}>
                <Layers className="h-3.5 w-3.5 inline mr-1" />Templates
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {sidebarTab === "blocks" ? (
                <>
                  {categories.map((cat) => {
                    const items = blockPalette.filter((p) => p.category === cat);
                    if (!items.length) return null;
                    return (
                      <div key={cat} className="mb-4">
                        <p className="text-[9px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5 px-1">{categoryLabels[cat]}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {items.map((item) => {
                            const Icon = paletteIcons[item.icon] || Sparkles;
                            return (
                              <button
                                key={item.type}
                                onClick={() => addBlock(item.type)}
                                className="flex flex-col items-center gap-1 rounded-lg border border-surface-100 bg-surface-50 p-2.5 text-[10px] font-medium text-surface-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="space-y-2">
                  {blockTemplates.map((template, i) => {
                    const Icon = paletteIcons[template.icon] || Sparkles;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (blocks.length > 0 && !confirm("This will replace your current blocks. Continue?")) return;
                          applyTemplate(i);
                        }}
                        className="w-full text-left rounded-xl border border-surface-100 bg-surface-50 p-3 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-brand-600" />
                          <span className="text-xs font-bold text-surface-900">{template.name}</span>
                        </div>
                        <p className="text-[10px] text-surface-500">{template.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="p-3 border-t border-surface-100 text-[9px] text-surface-400 space-y-0.5">
              <p><kbd className="font-mono bg-surface-100 px-1 rounded">⌘Z</kbd> Undo · <kbd className="font-mono bg-surface-100 px-1 rounded">⌘⇧Z</kbd> Redo</p>
              <p><kbd className="font-mono bg-surface-100 px-1 rounded">⌘D</kbd> Duplicate · <kbd className="font-mono bg-surface-100 px-1 rounded">⌘S</kbd> Save</p>
              <p><kbd className="font-mono bg-surface-100 px-1 rounded">Del</kbd> Delete · <kbd className="font-mono bg-surface-100 px-1 rounded">Esc</kbd> Deselect</p>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6" onClick={() => setSelectedBlockId(null)}>
          {canvasMode === "preview" && checkTemplateHtml(templateSlug) && storeSlug ? (
            /* ─── LIVE TEMPLATE PREVIEW ──────────────────────────── */
            <div className={`mx-auto transition-all ${previewMode === "mobile" ? "max-w-[375px]" : "max-w-5xl"}`}>
              <div className="rounded-2xl border border-surface-200 shadow-sm overflow-hidden bg-white">
                <div className="bg-surface-50 border-b border-surface-200 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] text-surface-400 font-mono">
                      {storeSlug}.afrostore.com
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-brand-600 bg-brand-50">
                    Live Template Preview
                  </span>
                </div>
                <iframe
                  ref={templateIframeRef}
                  src={`/api/storefront/${storeSlug}/template-html`}
                  className="w-full border-0"
                  style={{ minHeight: "80vh", display: "block" }}
                  title="Template Preview"
                />
              </div>
              {/* Section list below preview */}
              <div className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
                <h3 className="text-xs font-bold text-surface-900 mb-3 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-brand-600" />
                  Page Sections ({blocks.length})
                </h3>
                <div className="space-y-1.5">
                  {blocks.map((block, idx) => (
                    <button
                      key={block.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setCanvasMode("builder"); }}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedBlockId === block.id
                          ? "bg-brand-50 border border-brand-200"
                          : "hover:bg-surface-50 border border-transparent"
                      }`}
                    >
                      <span className="text-[10px] font-mono text-surface-400 w-5">{idx + 1}</span>
                      <span className="text-[10px] font-bold uppercase text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {block.type}
                      </span>
                      <span className="text-xs text-surface-600 truncate flex-1">
                        {(block.props.title as string) || (block.props.heading as string) || (block.props.text as string) || ""}
                      </span>
                      <span className="text-[9px] text-surface-400">Customize →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ─── BLOCK EDITOR CANVAS ────────────────────────────── */
            <div
              className={`mx-auto rounded-2xl border border-surface-200 shadow-sm min-h-[600px] transition-all overflow-hidden relative ${
              previewMode === "mobile" ? "max-w-[375px]" : "max-w-4xl"
            }`}
              style={{
                backgroundColor: pageSettings.backgroundColor || "#ffffff",
                backgroundImage: pageSettings.backgroundImage ? `url(${pageSettings.backgroundImage})` : undefined,
                backgroundSize: pageSettings.backgroundImage ? pageSettings.backgroundSize || "cover" : undefined,
                backgroundPosition: pageSettings.backgroundImage ? pageSettings.backgroundPosition || "center center" : undefined,
                backgroundRepeat: pageSettings.backgroundImage ? pageSettings.backgroundRepeat || "no-repeat" : undefined,
                backgroundAttachment: pageSettings.backgroundImage ? pageSettings.backgroundAttachment || "scroll" : undefined,
              }}
            >
              {pageSettings.backgroundImage && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: pageSettings.overlayColor || "#000000",
                    opacity: pageSettings.overlayOpacity ?? 0.25,
                  }}
                />
              )}
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-surface-50 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-surface-300" />
                  </div>
                  <h3 className="text-base font-bold text-surface-900 mb-1">Start building your page</h3>
                  <p className="text-xs text-surface-500 mb-6 max-w-sm">Add blocks from the left panel or start with a template.</p>
                  <div className="flex gap-2">
                    <button onClick={() => addBlock("hero")} className="btn-primary text-xs py-2 px-4">
                      <Sparkles className="h-3.5 w-3.5" /> Add Hero
                    </button>
                    <button onClick={() => { setShowSidebar(true); setSidebarTab("templates"); }} className="btn-secondary text-xs py-2 px-4">
                      <Layers className="h-3.5 w-3.5" /> Use Template
                    </button>
                  </div>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="p-6 space-y-3 relative z-10">
                      {blocks.map((block, idx) => (
                        <div key={block.id}>
                          {/* Insert-between button */}
                          {idx === 0 && (
                            <div className="flex justify-center -mb-1 opacity-0 hover:opacity-100 transition-opacity">
                              <button onClick={() => { setShowSidebar(true); }} className="text-[9px] text-surface-400 hover:text-brand-600 flex items-center gap-1 py-1">
                                <Plus className="h-3 w-3" /> Add block above
                              </button>
                            </div>
                          )}
                          <SortableBlock
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            onMoveUp={() => moveBlock(block.id, "up")}
                            onMoveDown={() => moveBlock(block.id, "down")}
                            onInlineEdit={(key, value) => {
                              pushHistory();
                              updateBlock({ ...block, props: { ...block.props, [key]: value } });
                            }}
                            isFirst={idx === 0}
                            isLast={idx === blocks.length - 1}
                          />
                          {/* Insert-between button */}
                          <div className="flex justify-center -mt-1 opacity-0 hover:opacity-100 transition-opacity">
                            <button onClick={() => { setShowSidebar(true); }} className="text-[9px] text-surface-400 hover:text-brand-600 flex items-center gap-1 py-1">
                              <Plus className="h-3 w-3" /> Add block
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeId ? (
                      <div className="rounded-xl bg-white shadow-2xl border border-brand-200 p-4 opacity-90 max-w-lg">
                        <BlockRenderer block={blocks.find((b) => b.id === activeId)!} />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          )}
        </div>

        {/* Property Panel */}
        {canvasMode === "preview" && templateEditMode ? (
          <TemplateElementPanel
            element={templateSelectedElement}
            sections={templateSections}
            onUpdateText={(id, text) => sendToIframe({ type: "afro-editor-update-text", id, text })}
            onUpdateLink={(id, href, target) => sendToIframe({ type: "afro-editor-update-link", id, href, target })}
            onUpdateImage={(id, src, alt) => sendToIframe({ type: "afro-editor-update-image", id, src, alt })}
            onUpdateStyles={(id, styles) => sendToIframe({ type: "afro-editor-update-styles", id, styles })}
            onRemoveElement={(id) => sendToIframe({ type: "afro-editor-remove-element", id })}
            onSelectSection={(id) => sendToIframe({ type: "afro-editor-select-element", id })}
            onDeselect={() => { setTemplateSelectedElement(null); sendToIframe({ type: "afro-editor-deselect" }); }}
            onUploadImage={(file, elementId) => {
              const reader = new FileReader();
              reader.onload = (evt) => {
                if (currentStore && evt.target?.result) {
                  (async () => {
                    try {
                      const res = await api.post<{ url: string }>(`/api/sites/${currentStore.id}/upload`, {
                        file: evt.target!.result as string,
                        fileName: file.name,
                        mimeType: file.type,
                      });
                      if (res.success && res.data?.url) {
                        sendToIframe({ type: "afro-editor-update-image", id: elementId, src: res.data.url, alt: "" });
                        // Update local state too
                        setTemplateSelectedElement((prev) => prev ? { ...prev, src: res.data!.url } : null);
                      }
                    } catch { /* upload failed */ }
                  })();
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        ) : selectedBlock ? (
          <PropertyPanel
            block={selectedBlock}
            onUpdate={updateBlock}
            onCommit={commitBlockUpdate}
            onClose={() => setSelectedBlockId(null)}
            onDelete={() => deleteBlock(selectedBlock.id)}
            onDuplicate={() => duplicateBlock(selectedBlock.id)}
          />
        ) : (
          <PageSettingsPanel settings={pageSettings} onChange={setPageSettings} />
        )}
      </div>
    </div>
  );
}
