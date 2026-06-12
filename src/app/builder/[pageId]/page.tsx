"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { BuilderBlock, BlockType, blockDefaults, blockPalette, PaletteItem } from "@/lib/builder/types";
import BlockRenderer from "@/components/builder/BlockRenderer";
import PropertyPanel from "@/components/builder/PropertyPanel";
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
import {
  ArrowLeft,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Plus,
  GripVertical,
  Loader2,
  LayoutGrid,
  Type,
  Image as ImageIcon,
  MousePointer,
  Layout,
  Columns,
  Grid3X3,
  ShoppingBag,
  MessageCircle,
  HelpCircle,
  Mail,
  Play,
  Clock,
  Shield,
  MoveVertical,
  Minus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// ─── ICON MAP ────────────────────────────────────────────────

const paletteIcons: Record<string, React.ElementType> = {
  type: Type, "align-left": Type, image: ImageIcon, "mouse-pointer": MousePointer,
  "move-vertical": MoveVertical, minus: Minus, layout: Layout, columns: Columns,
  grid: Grid3X3, "shopping-bag": ShoppingBag, "message-circle": MessageCircle,
  "help-circle": HelpCircle, mail: Mail, play: Play, clock: Clock, shield: Shield,
};

// ─── SORTABLE BLOCK WRAPPER ─────────────────────────────────

function SortableBlock({
  block,
  isSelected,
  onClick,
}: {
  block: BuilderBlock;
  isSelected: boolean;
  onClick: () => void;
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
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-10"
      >
        <GripVertical className="h-5 w-5 text-surface-400" />
      </div>

      {/* Block type label */}
      <div className="absolute -top-2.5 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
          {block.type}
        </span>
      </div>

      {/* Block content */}
      <div className="p-4">
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}

// ─── MAIN BUILDER PAGE ───────────────────────────────────────

export default function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const { currentStore } = useStore();
  const router = useRouter();

  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [pageData, setPageData] = useState<any>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load page
  useEffect(() => {
    if (!currentStore) return;
    (async () => {
      const res = await api.get<any>(`/api/stores/${currentStore.id}/pages/${pageId}`);
      if (res.success && res.data) {
        setPageData(res.data);
        setPageTitle(res.data.title || "");
        setBlocks(Array.isArray(res.data.content) ? res.data.content : []);
      }
      setLoading(false);
    })();
  }, [currentStore, pageId]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((items) => {
      const oldIndex = items.findIndex((b) => b.id === active.id);
      const newIndex = items.findIndex((b) => b.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Add block
  const addBlock = (type: BlockType) => {
    const newBlock: BuilderBlock = {
      id: crypto.randomUUID(),
      type,
      props: blockDefaults[type](),
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setShowPalette(false);
  };

  // Update block
  const updateBlock = useCallback((updated: BuilderBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId(null);
  }, []);

  // Save
  const handleSave = async () => {
    if (!currentStore) return;
    setSaving(true);
    const res = await api.patch(`/api/stores/${currentStore.id}/pages/${pageId}`, {
      title: pageTitle,
      content: blocks,
    });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Group palette by category
  const categories = ["basic", "layout", "commerce", "social", "marketing"] as const;
  const categoryLabels: Record<string, string> = { basic: "Basic", layout: "Layout", commerce: "Commerce", social: "Social", marketing: "Marketing" };

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Toolbar */}
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <ArrowLeft className="h-4 w-4 text-surface-500" />
          </Link>
          <input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="text-sm font-bold text-surface-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0"
            placeholder="Page title..."
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <div className="flex items-center rounded-lg border border-surface-200 p-0.5">
            <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md ${previewMode === "desktop" ? "bg-surface-100" : ""}`}>
              <Monitor className="h-4 w-4 text-surface-500" />
            </button>
            <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md ${previewMode === "mobile" ? "bg-surface-100" : ""}`}>
              <Smartphone className="h-4 w-4 text-surface-500" />
            </button>
          </div>

          {/* Toggle palette */}
          <button onClick={() => setShowPalette(!showPalette)} className={`p-2 rounded-lg transition-colors ${showPalette ? "bg-brand-50 text-brand-600" : "hover:bg-surface-100 text-surface-500"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-4">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? "Saved!" : <><Save className="h-3.5 w-3.5" /> Save</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette */}
        {showPalette && (
          <div className="w-56 border-r border-surface-200 bg-white overflow-y-auto flex-shrink-0">
            <div className="p-3">
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Add Blocks</p>
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
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6" onClick={() => setSelectedBlockId(null)}>
          <div className={`mx-auto bg-white rounded-2xl border border-surface-200 shadow-sm min-h-[600px] transition-all ${
            previewMode === "mobile" ? "max-w-[375px]" : "max-w-4xl"
          }`}>
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-surface-50 flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-surface-300" />
                </div>
                <h3 className="text-base font-bold text-surface-900 mb-1">Start building your page</h3>
                <p className="text-xs text-surface-500 mb-4">Click blocks from the left panel to add them here.</p>
                <button onClick={() => { setShowPalette(true); addBlock("hero"); }} className="btn-primary text-xs py-2 px-4">
                  <Sparkles className="h-3.5 w-3.5" /> Add Hero Section
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="p-6 space-y-3">
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div className="rounded-xl bg-white shadow-2xl border border-brand-200 p-4 opacity-90">
                      <BlockRenderer block={blocks.find((b) => b.id === activeId)!} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Add block button at bottom */}
            {blocks.length > 0 && (
              <div className="p-4 text-center">
                <button
                  onClick={() => setShowPalette(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-400 hover:text-brand-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Block
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Property Panel */}
        {selectedBlock && (
          <PropertyPanel
            block={selectedBlock}
            onUpdate={updateBlock}
            onClose={() => setSelectedBlockId(null)}
            onDelete={() => deleteBlock(selectedBlock.id)}
          />
        )}
      </div>
    </div>
  );
}
