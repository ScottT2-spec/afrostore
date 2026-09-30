"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, Loader2 } from "lucide-react";
import { DndContext, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "@/lib/api-client";
import { parsePageContent, serializePageContent, type PageContentDocument } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";

export interface SelectedBlock {
  id: string;
  type: string;
  pageId: string;
  pageTitle: string;
}

export interface PageRef {
  id: string;
  title: string;
  slug: string;
  type: string;
}

interface StoreCtx {
  storeSlug: string;
  currency: string;
  products: any[];
}

const prettyType = (t: string) =>
  t.replace(/^(ai|fashion|electronics|interior|accessories)(?=[A-Z])/, "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");

function SortableBlock({ block, selected, onSelect, store }: {
  block: BuilderBlock; selected: boolean; onSelect: () => void; store: StoreCtx;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, zIndex: isDragging ? 20 : undefined }}
      className={`group relative cursor-pointer outline-2 -outline-offset-2 transition-[outline-color] ${selected ? "outline outline-brand-600" : "outline outline-transparent hover:outline-brand-300"}`}
      onClick={onSelect}
    >
      {/* Label + drag handle: always visible on the selected block, on hover otherwise */}
      <div className={`absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-brand-600 px-1.5 py-1 text-[11px] font-medium capitalize text-white shadow ${selected ? "" : "opacity-0 group-hover:opacity-100"}`}>
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
          className="cursor-grab touch-none active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {prettyType(block.type)}
      </div>
      {/* Content is inert so a click selects the block instead of following links / buttons */}
      <div className="pointer-events-none select-none">
        <RenderBlocks blocks={[block]} storeSlug={store.storeSlug} products={store.products} currency={store.currency} />
      </div>
    </div>
  );
}

/**
 * Selectable + reorderable render of one page's blocks. Shows the same page
 * the Live iframe is on (`pageSlug`, null = home). Selecting a block only
 * reports it upward; nothing opens. Reordering saves straight to the page.
 */
export function BlockPreview({ siteId, pages, pageSlug, store, selectedId, onSelect, onSaved }: {
  siteId: string;
  pages: PageRef[];
  pageSlug: string | null;
  store: StoreCtx;
  selectedId: string | null;
  onSelect: (block: SelectedBlock | null) => void;
  onSaved: () => void;
}) {
  const page = (pageSlug && pages.find((p) => p.slug === pageSlug)) || pages.find((p) => p.type === "HOME") || pages[0] || null;
  const [doc, setDoc] = useState<PageContentDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const docRef = useRef<PageContentDocument | null>(null);
  docRef.current = doc;

  useEffect(() => {
    if (!page) return;
    let cancelled = false;
    setDoc(null);
    setError(null);
    api.get<{ content: unknown }>(`/api/sites/${siteId}/pages/${page.id}`).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setDoc(parsePageContent(res.data.content));
      else setError("Couldn't load this page.");
    });
    return () => { cancelled = true; };
  }, [siteId, page?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  const onDragEnd = useCallback(async (e: DragEndEvent) => {
    const current = docRef.current;
    if (!current || !page || !e.over || e.active.id === e.over.id) return;
    const from = current.blocks.findIndex((b) => b.id === e.active.id);
    const to = current.blocks.findIndex((b) => b.id === e.over!.id);
    if (from < 0 || to < 0) return;

    const blocks = arrayMove(current.blocks, from, to);
    const order = new Map(blocks.map((b, i) => [b.id, i]));
    // `elements` (visual-editor tree) wins over `blocks` when saved, so keep both in the same order.
    const elements = current.elements
      ? [...current.elements].sort((a, b) => Number(order.get(a.id) ?? 1e6) - Number(order.get(b.id) ?? 1e6))
      : current.elements;
    const next: PageContentDocument = { ...current, blocks, elements };
    setDoc(next); // optimistic — feels instant
    setError(null);

    const res = await api.patch(`/api/sites/${siteId}/pages/${page.id}`, { content: serializePageContent(next) });
    if (res.success) onSaved();
    else { setDoc(current); setError("Couldn't save the new order. Please try again."); }
  }, [page, siteId, onSaved]);

  if (!page || !doc) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-surface-500">
        {error ? <p className="text-sm">{error}</p> : (<><Loader2 className="h-6 w-6 animate-spin" /><p className="text-sm">Loading blocks…</p></>)}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white" onClick={() => onSelect(null)}>
      <div className="sticky top-0 z-30 border-b border-brand-200 bg-brand-50/95 px-3 py-1.5 text-[11px] text-brand-800 backdrop-blur">
        <b>{page.title}</b> · tap a block to select it · drag <GripVertical className="inline h-3 w-3" /> to reorder
        {error && <span className="ml-2 font-medium text-red-600">{error}</span>}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={doc.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div onClick={(e) => e.stopPropagation()}>
            {doc.blocks.map((b) => (
              <SortableBlock
                key={b.id}
                block={b as unknown as BuilderBlock}
                store={store}
                selected={selectedId === b.id}
                onSelect={() => onSelect({ id: b.id, type: b.type, pageId: page.id, pageTitle: page.title })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {doc.blocks.length === 0 && <p className="p-8 text-center text-sm text-surface-400">This page has no blocks yet.</p>}
    </div>
  );
}
