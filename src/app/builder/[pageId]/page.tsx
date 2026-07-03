"use client";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Clock, Columns, Copy, Eye, EyeOff, Grid3X3, GripVertical, HelpCircle, Image as ImageIcon, Layers, Layout, LayoutGrid, Mail, MessageCircle, Minus, Monitor, MousePointer, MoveVertical, Play, Redo2, Save, Shield, ShoppingBag, Smartphone, Sparkles, Type, Undo2, User } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import { BuilderBlock, BlockType, blockPalette } from "@/lib/builder/types";
import { blockTemplates, type BlockTemplate } from "@/lib/builder/templates";
import BlockRenderer from "@/components/builder/BlockRenderer";
import PropertyPanel from "@/components/builder/PropertyPanel";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import { parsePageContent, pickRicherPageDocumentWithMeta, serializePageContent, type PageSettings } from "@/lib/page-content";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { RenderBlocks, type BuilderBlock as StorefrontBlock, type StoreProduct } from "@/components/storefront/BlockRenderer";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import {
  addBuilderEditorBlock,
  deleteBuilderEditorBlock,
  duplicateBuilderEditorBlock,
  getBuilderEditorStorageKey,
  initializeBuilderEditorSession,
  markBuilderEditorSaved,
  moveBuilderEditorBlock,
  redoBuilderEditor,
  replaceBuilderEditorBlock,
  setBuilderEditorBlocks,
  setBuilderEditorPageSettings,
  setBuilderEditorPageTitle,
  setBuilderEditorPageSlug,
  setBuilderEditorPublished,
  setBuilderEditorSelectedBlockId,
  undoBuilderEditor,
  useBuilderEditor,
  updateBuilderEditorBlockProp,
} from "@/lib/builder/editor-store";
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

const paletteIcons: Record<string, React.ElementType> = {
  type: Type, "align-left": Type, image: ImageIcon, "mouse-pointer": MousePointer,
  "move-vertical": MoveVertical, minus: Minus, layout: Layout, columns: Columns,
  grid: Grid3X3, "shopping-bag": ShoppingBag, "message-circle": MessageCircle,
  "help-circle": HelpCircle, mail: Mail, play: Play, clock: Clock, shield: Shield,
  user: User,
};

function SortableEditorBlock({
  block,
  isSelected,
  isEditing,
  onClick,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onInlineEdit,
  isFirst,
  isLast,
  children,
}: {
  block: BuilderBlock;
  isSelected: boolean;
  isEditing: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInlineEdit: (key: string, value: string) => void;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
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
      className={`group relative transition-all ${
        isSelected ? "ring-2 ring-brand-600 ring-offset-2" : isEditing ? "hover:ring-2 hover:ring-brand-300 hover:ring-offset-1" : ""
      }`}
      onClick={(e) => { if (isEditing) { e.stopPropagation(); onClick(); } }}
    >
      {isEditing && (
        <>
          <div
            {...attributes}
            {...listeners}
            className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-10"
          >
            <GripVertical className="h-5 w-5 text-surface-400" />
          </div>
          <div className="absolute -top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-0.5">
            <span className="bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mr-1">
              {block.type}
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst}
              className="h-5 w-5 rounded bg-white shadow border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700 disabled:opacity-30">
              <ChevronUp className="h-3 w-3" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}
              className="h-5 w-5 rounded bg-white shadow border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700 disabled:opacity-30">
              <ChevronDown className="h-3 w-3" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="h-5 w-5 rounded bg-white shadow border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700">
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
      {isEditing && isSelected && (block.type === "heading" || block.type === "text") ? (
        <BlockRenderer block={block} isSelected={isSelected} onInlineEdit={onInlineEdit} />
      ) : (
        children
      )}
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

interface BuilderPagePayload {
  store: { id: string; name: string; slug: string; currency?: string; siteType?: string };
  page: {
    id: string;
    siteId: string;
    slug: string;
    title: string;
    type: string;
    content?: unknown;
    isPublished: boolean;
  };
  products: StoreProduct[];
  theme: ThemeData | null;
  customization?: SiteCustomizationDocument | null;
}

export default function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const { user } = useAuth();
  const editor = useBuilderEditor();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "templates">("blocks");
  const [showSidebar, setShowSidebar] = useState(true);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canvasMode, setCanvasMode] = useState<"builder" | "preview">("builder");
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [currency, setCurrency] = useState<string>("NGN");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<{ id: string; slug: string; currency?: string; siteType?: string } | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeData | null>(null);
  const [pageType, setPageType] = useState<string>("HOME");
  const [contentSource, setContentSource] = useState<string>("builder-api");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadError(null);
        setLoading(true);

        const pageRes = await api.get<BuilderPagePayload>(`/api/builder/pages/${pageId}`);
        if (cancelled) return;

        if (!pageRes.success || !pageRes.data) {
          setLoadError(pageRes.error || `Unable to load page ${pageId}.`);
          return;
        }

        const { store, page, products, theme, customization } = pageRes.data;
        if (!page || !store) {
          setLoadError(`Unable to resolve page or store for ${pageId}.`);
          return;
        }

        const normalizedCustomization = normalizeSiteCustomization(customization || null);
        const builderPage = applyPageCustomization(page, normalizedCustomization);
        const builderDocument = parsePageContent(builderPage.content);

        let resolvedPage = builderPage;
        let resolvedDocument = builderDocument;
        let nextContentSource = "builder-api";

        const storefrontRes = await api.get<{
          pages: Array<{ id: string; slug: string; type: string; title: string; content?: unknown }>;
          products: StoreProduct[];
        }>(`/api/storefront/${store.slug}`);

        if (!cancelled && storefrontRes.success && storefrontRes.data?.pages?.length) {
          const livePageRecord =
            storefrontRes.data.pages.find((item) => item.id === pageId) ||
            storefrontRes.data.pages.find((item) => item.slug === page.slug) ||
            storefrontRes.data.pages.find((item) => item.type === page.type) ||
            null;

          if (livePageRecord) {
            const livePage = applyPageCustomization(
              { ...builderPage, ...livePageRecord, id: builderPage.id },
              normalizedCustomization,
            );
            const liveDocument = parsePageContent(livePage.content);
            const picked = pickRicherPageDocumentWithMeta(builderDocument, liveDocument);
            resolvedDocument = picked.document;
            resolvedPage = picked.usedSecondary ? livePage : builderPage;
            nextContentSource = picked.usedSecondary ? "storefront-api" : "builder-api";
          }
        }

        const pageSettings = getResolvedPageSettings(resolvedPage, resolvedDocument.settings, normalizedCustomization);
        const nextBlocks = resolvedDocument.blocks as unknown as BuilderBlock[];

        setStoreData(store);
        setStoreProducts(products || []);
        setCurrency(store.currency || "NGN");
        setResolvedTheme(buildThemeDataWithCustomization(theme, normalizedCustomization));
        setPageType(page.type || "HOME");
        setContentSource(nextContentSource);

        initializeBuilderEditorSession({
          storageKey: getBuilderEditorStorageKey(user.id, store.id, pageId),
          siteId: store.id,
          siteSlug: store.slug,
          pageId,
          pageSlug: resolvedPage.slug || "",
          pageTitle: resolvedPage.title || "Untitled Page",
          isPublished: Boolean(page.isPublished),
          blocks: nextBlocks,
          pageSettings,
          selectedBlockId: null,
        });
      } catch {
        if (!cancelled) setLoadError("Failed to load builder page content.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageId, user]);

  const handleSave = useCallback(async () => {
    if (!storeData) return;
    setSaving(true);
    const res = await api.patch<{
      title?: string;
      slug?: string;
      isPublished?: boolean;
    }>(`/api/sites/${storeData.id}/pages/${pageId}`, {
      title: editor.pageTitle,
      content: serializePageContent({ blocks: editor.blocks as unknown as StorefrontBlock[], settings: editor.pageSettings }),
      isPublished: editor.isPublished,
    });
    setSaving(false);
    if (res.success) {
      if (res.data) {
        setBuilderEditorPageTitle((res.data.title as string) || editor.pageTitle);
        setBuilderEditorPageSlug((res.data.slug as string) || editor.pageSlug);
        setBuilderEditorPublished(Boolean(res.data.isPublished));
      }
      markBuilderEditorSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [storeData, editor.blocks, editor.isPublished, editor.pageSettings, editor.pageSlug, editor.pageTitle, pageId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); undoBuilderEditor(); }
      if (mod && e.key === "z" && e.shiftKey) { e.preventDefault(); redoBuilderEditor(); }
      if (mod && e.key === "y") { e.preventDefault(); redoBuilderEditor(); }
      if (mod && e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (editor.selectedBlockId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA" && document.activeElement?.tagName !== "SELECT") {
          e.preventDefault();
          deleteBuilderEditorBlock(editor.selectedBlockId);
        }
      }
      if (mod && e.key === "d" && editor.selectedBlockId) { e.preventDefault(); duplicateBuilderEditorBlock(editor.selectedBlockId); }
      if (e.key === "Escape") setBuilderEditorSelectedBlockId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor.selectedBlockId, handleSave]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = editor.blocks.findIndex((b) => b.id === active.id);
    const newIndex = editor.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setBuilderEditorBlocks(arrayMove(editor.blocks, oldIndex, newIndex));
  };

  const addBlock = (type: BlockType) => {
    addBuilderEditorBlock(type);
    setSidebarTab("blocks");
  };

  const updateBlock = useCallback((updated: BuilderBlock) => {
    replaceBuilderEditorBlock(updated);
  }, []);

  const applyTemplate = (template: BlockTemplate) => {
    const newBlocks = template.blocks.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
      props: JSON.parse(JSON.stringify(b.props)),
    }));
    setBuilderEditorBlocks(newBlocks as BuilderBlock[]);
    setBuilderEditorSelectedBlockId(null);
  };

  const selectedBlock = editor.blocks.find((b) => b.id === editor.selectedBlockId) || null;
  const isEditing = canvasMode === "builder";
  const storefrontBlocks = editor.blocks as unknown as StorefrontBlock[];

  const wrapBlock = useCallback((block: StorefrontBlock, content: React.ReactNode, index: number) => {
    if (!isEditing) return content;
    return (
      <SortableEditorBlock
        block={block as unknown as BuilderBlock}
        isSelected={editor.selectedBlockId === block.id}
        isEditing={isEditing}
        onClick={() => setBuilderEditorSelectedBlockId(block.id)}
        onDuplicate={() => duplicateBuilderEditorBlock(block.id)}
        onMoveUp={() => moveBuilderEditorBlock(block.id, "up")}
        onMoveDown={() => moveBuilderEditorBlock(block.id, "down")}
        onInlineEdit={(key, value) => updateBuilderEditorBlockProp(block.id, key, value)}
        isFirst={index === 0}
        isLast={index === editor.blocks.length - 1}
      >
        {content}
      </SortableEditorBlock>
    );
  }, [editor.blocks.length, editor.selectedBlockId, isEditing]);

  const pageBackgroundStyle = useMemo(() => buildPageBackgroundStyle(editor.pageSettings), [editor.pageSettings]);

  const previewHref = useMemo(() => {
    if (!storeData) return "";
    const isHome = pageType === "HOME" || editor.pageSlug === "home";
    return isHome ? `/store/${storeData.slug}` : `/store/${storeData.slug}/${editor.pageSlug}`;
  }, [editor.pageSlug, pageType, storeData]);

  if (loading || !storeData || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="max-w-md rounded-2xl border border-surface-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-surface-900">Couldn&apos;t load page content</h2>
          <p className="mt-2 text-sm text-surface-500">{loadError}</p>
        </div>
      </div>
    );
  }

  const allCategories = ["basic", "layout", "commerce", "social", "marketing"] as const;
  const categories = storeData?.siteType === "LANDING_PAGE"
    ? allCategories.filter((c) => c !== "commerce")
    : allCategories;
  const categoryLabels: Record<string, string> = { basic: "Basic", layout: "Layout", commerce: "Commerce", social: "Social", marketing: "Marketing" };

  const canvas = (
    <div
      className={`mx-auto rounded-2xl border border-surface-200 shadow-sm min-h-[600px] transition-all overflow-hidden bg-white ${
        previewMode === "mobile" ? "max-w-[375px]" : "max-w-5xl"
      }`}
    >
      <div className="relative" style={pageBackgroundStyle}>
        {editor.pageSettings.backgroundImage && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: editor.pageSettings.overlayColor || "#000000",
              opacity: editor.pageSettings.overlayOpacity ?? 0.25,
            }}
          />
        )}
        <div className="relative z-10">
          <ThemeProvider theme={resolvedTheme}>
            <RenderBlocks
              blocks={storefrontBlocks}
              storeSlug={storeData.slug}
              products={storeProducts}
              currency={currency}
              addToCart={() => {}}
              isWishlisted={() => false}
              toggleWishlist={() => {}}
              addedToCart={null}
              isEditorMode={isEditing}
              pageId={pageId}
              blockCount={editor.blocks.length}
              dataSource={contentSource}
              wrapBlock={isEditing ? wrapBlock : undefined}
            />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <ArrowLeft className="h-4 w-4 text-surface-500" />
          </Link>
          <div className="h-5 w-px bg-surface-200" />
          <input
            value={editor.pageTitle}
            onChange={(e) => setBuilderEditorPageTitle(e.target.value)}
            className="text-sm font-bold text-surface-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 w-48"
            placeholder="Page title..."
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={undoBuilderEditor} disabled={!editor.canUndo} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors" title="Undo (⌘Z)">
            <Undo2 className="h-4 w-4 text-surface-500" />
          </button>
          <button type="button" onClick={redoBuilderEditor} disabled={!editor.canRedo} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors" title="Redo (⌘⇧Z)">
            <Redo2 className="h-4 w-4 text-surface-500" />
          </button>

          <div className="h-5 w-px bg-surface-200 mx-1" />

          <div className="flex items-center rounded-lg border border-surface-200 p-0.5 mr-1">
            <button type="button" onClick={() => setCanvasMode("builder")} className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${canvasMode === "builder" ? "bg-brand-100 text-brand-700" : "text-surface-500"}`}>
              <LayoutGrid className="h-3.5 w-3.5 inline mr-0.5" />Blocks
            </button>
            <button type="button" onClick={() => setCanvasMode("preview")} className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${canvasMode === "preview" ? "bg-brand-100 text-brand-700" : "text-surface-500"}`}>
              <Eye className="h-3.5 w-3.5 inline mr-0.5" />Preview
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-surface-200 p-0.5">
            <button type="button" onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-surface-100" : ""}`}>
              <Monitor className="h-4 w-4 text-surface-500" />
            </button>
            <button type="button" onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-surface-100" : ""}`}>
              <Smartphone className="h-4 w-4 text-surface-500" />
            </button>
          </div>

          <button type="button" onClick={() => setShowSidebar(!showSidebar)} className={`p-2 rounded-lg transition-colors ${showSidebar ? "bg-brand-50 text-brand-600" : "hover:bg-surface-100 text-surface-500"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>

          <div className="h-5 w-px bg-surface-200 mx-1" />

          <button
            type="button"
            onClick={() => setBuilderEditorPublished(!editor.isPublished)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${editor.isPublished ? "bg-green-50 text-green-700 border-green-200" : "bg-surface-50 text-surface-500 border-surface-200"}`}
          >
            {editor.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {editor.isPublished ? "Published" : "Draft"}
          </button>

          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-4">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? "Saved ✓" : <><Save className="h-3.5 w-3.5" /> Save</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <div className="w-56 border-r border-surface-200 bg-white overflow-y-auto flex-shrink-0 flex flex-col">
            <div className="flex border-b border-surface-100">
              <button type="button" onClick={() => setSidebarTab("blocks")} className={`flex-1 text-xs font-semibold py-2.5 text-center transition-colors ${sidebarTab === "blocks" ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400"}`}>
                <LayoutGrid className="h-3.5 w-3.5 inline mr-1" />Blocks
              </button>
              <button type="button" onClick={() => setSidebarTab("templates")} className={`flex-1 text-xs font-semibold py-2.5 text-center transition-colors ${sidebarTab === "templates" ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400"}`}>
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
                                type="button"
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
                  {blockTemplates.filter((t) => !t.siteType || t.siteType === storeData?.siteType).map((template, i) => {
                    const Icon = paletteIcons[template.icon] || Sparkles;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (editor.blocks.length > 0 && !confirm("This will replace your current blocks. Continue?")) return;
                          applyTemplate(template);
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

            <div className="p-3 border-t border-surface-100 text-[9px] text-surface-400 space-y-0.5">
              <p><kbd className="font-mono bg-surface-100 px-1 rounded">⌘Z</kbd> Undo · <kbd className="font-mono bg-surface-100 px-1 rounded">⌘⇧Z</kbd> Redo</p>
              <p><kbd className="font-mono bg-surface-100 px-1 rounded">⌘D</kbd> Duplicate · <kbd className="font-mono bg-surface-100 px-1 rounded">⌘S</kbd> Save</p>
              <p><kbd className="font-mono bg-surface-100 px-1 rounded">Del</kbd> Delete · <kbd className="font-mono bg-surface-100 px-1 rounded">Esc</kbd> Deselect</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6" onClick={() => isEditing && setBuilderEditorSelectedBlockId(null)}>
          {canvasMode === "preview" ? (
            <div
              className={`mx-auto overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-all ${
                previewMode === "mobile" ? "max-w-[375px] min-h-[600px]" : "max-w-5xl min-h-[600px]"
              }`}
            >
              <iframe
                key={previewHref}
                src={previewHref}
                title="Live storefront preview"
                className="h-[700px] w-full border-0"
              />
            </div>
          ) : isEditing ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={editor.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {canvas}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="rounded-xl bg-white shadow-2xl border border-brand-200 opacity-90 max-w-lg">
                    <BlockRenderer block={editor.blocks.find((b) => b.id === activeId)!} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            canvas
          )}
        </div>

        {selectedBlock && isEditing ? (
          <PropertyPanel
            block={selectedBlock}
            onUpdate={updateBlock}
            onCommit={() => {}}
            onClose={() => setBuilderEditorSelectedBlockId(null)}
            onDelete={() => deleteBuilderEditorBlock(selectedBlock.id)}
            onDuplicate={() => duplicateBuilderEditorBlock(selectedBlock.id)}
          />
        ) : (
          <PageSettingsPanel settings={editor.pageSettings} onChange={setBuilderEditorPageSettings} />
        )}
      </div>
    </div>
  );
}
