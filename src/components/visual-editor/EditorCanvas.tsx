"use client";

import React, { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useEditorStore, getNestedChildren } from "@/lib/visual-editor/store";
import { DeviceType } from "@/lib/visual-editor/types";
import { Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ContextMenu from "./ContextMenu";
import { RenderTemplateBlocks, isRegisteredTemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { createElementFromWidget } from "@/lib/visual-editor/widgets";
import MediaLibrary from "./MediaLibrary";
import { buildScopedNodeCss, resolveNodeStyles } from "@/lib/visual-editor/node-tree";
import { isChildFragmentType } from "@/lib/templates/template-tree";

const findElementById = (elements: any[], id: string): any | null => {
  for (const element of elements) {
    if (element.id === id) return element;
    if (Array.isArray(element.elements) && element.elements.length > 0) {
      const found = findElementById(element.elements, id);
      if (found) return found;
    }
    if (Array.isArray(element.children) && element.children.length > 0) {
      const found = findElementById(element.children, id);
      if (found) return found;
    }
    if (Array.isArray(element.columns) && element.columns.length > 0) {
      const found = findElementById(element.columns, id);
      if (found) return found;
    }
  }
  return null;
};

// Resolve a lucide-react icon component from a loosely-formatted name
// (e.g. "star", "shopping-bag", "ShoppingBag" all resolve correctly).
// Falls back to a generic circle so an unrecognized name still shows
// something instead of rendering nothing.
const getLucideIcon = (name?: string): React.ComponentType<any> => {
  const fallback = (LucideIcons as any).Circle;
  if (!name) return fallback;
  const pascal = name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (LucideIcons as any)[pascal] || fallback;
};

const SOCIAL_ICON_NAMES: Record<string, string> = {
  facebook: "Facebook",
  twitter: "Twitter",
  x: "Twitter",
  instagram: "Instagram",
  linkedin: "Linkedin",
  youtube: "Youtube",
  whatsapp: "MessageCircle",
  tiktok: "Music2",
  pinterest: "Image",
  email: "Mail",
};

const getSocialIcon = (platform?: string): React.ComponentType<any> =>
  getLucideIcon(SOCIAL_ICON_NAMES[(platform || "").toLowerCase()] || platform);

const getElementTextValue = (element: any, fallback: string) => {
  const content = element?.content || {};
  const settings = element?.settings || {};
  return (
    content.text ??
    content.content ??
    settings.text ??
    settings.content ??
    fallback
  );
};

const INLINE_EDITABLE_SELECTOR = '[contenteditable="true"], [data-inline-field], [data-inline-editable="true"]';

const isInlineEditableTarget = (target: EventTarget | null) => {
  if (!target) return false;
  if (target instanceof Element) {
    return Boolean(target.closest(INLINE_EDITABLE_SELECTOR));
  }
  if (target instanceof Node) {
    const parent = target.parentElement;
    return Boolean(parent?.closest(INLINE_EDITABLE_SELECTOR));
  }
  return false;
};

export const buildEditorCanvasCss = (elements: any[]): string => {
  const css: string[] = [];

  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      if (!node?.id) continue;
      css.push(buildScopedNodeCss(node));
      const customCss = typeof node?.settings?.customCss === "string" ? node.settings.customCss.trim() : "";
      if (customCss) css.push(customCss);
      if (Array.isArray(node.elements) && node.elements.length > 0) walk(node.elements);
      if (Array.isArray(node.children) && node.children.length > 0) walk(node.children);
      if (Array.isArray(node.columns) && node.columns.length > 0) walk(node.columns);
    }
  };

  walk(elements || []);
  return css.filter(Boolean).join("\n");
};

const updateElementTextValue = (elementId: string, nextText: string) => {
  const current = useEditorStore.getState().pageStructure;
  const target = findElementById(current.elements, elementId);
  if (!target) return;

  const updateInTree = (elements: any[]): any[] =>
    elements.map((el) => {
      if (el.id === elementId) {
        return {
          ...el,
          content: {
            ...(el.content && typeof el.content === "object" ? el.content : {}),
            text: nextText,
            content: nextText,
          },
          settings: {
            ...(el.settings || {}),
            text: nextText,
            content: nextText,
          },
        };
      }
      if (Array.isArray(el.elements)) {
        return { ...el, elements: updateInTree(el.elements) };
      }
      if (Array.isArray(el.children)) {
        return { ...el, children: updateInTree(el.children) };
      }
      if (Array.isArray(el.columns)) {
        return { ...el, columns: updateInTree(el.columns) };
      }
      return el;
    });

  useEditorStore.setState({
    pageStructure: {
      ...current,
      elements: updateInTree(current.elements),
      updatedAt: new Date().toISOString(),
    },
    isDirty: true,
  });
};

type CanvasEditableTag = "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "button";

function CanvasInlineEditableText({
  as = "div",
  value,
  className,
  style,
  multiline = false,
  selectNodeOnFocus = true,
  onSelectNode,
  onBeginEdit,
  onCommit,
  onCancel,
}: {
  as?: CanvasEditableTag;
  value: string;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
  selectNodeOnFocus?: boolean;
  onSelectNode?: () => void;
  onBeginEdit?: () => void;
  onCommit: (nextText: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const focusedRef = useRef(false);
  const commitBaselineRef = useRef(value ?? "");
  const selectFrameRef = useRef<number | null>(null);
  const cancelCommitRef = useRef(false);
  const normalizedValue = value ?? "";

  useLayoutEffect(() => {
    if (focusedRef.current || !ref.current) return;
    const currentText = ref.current.textContent ?? "";
    if (currentText !== normalizedValue) {
      ref.current.textContent = normalizedValue;
    }
  }, [normalizedValue]);

  useEffect(() => {
    return () => {
      if (selectFrameRef.current != null) {
        cancelAnimationFrame(selectFrameRef.current);
      }
    };
  }, []);

  const handleFocus = useCallback(() => {
    focusedRef.current = true;
    cancelCommitRef.current = false;
    commitBaselineRef.current = normalizedValue;
    onBeginEdit?.();

    if (!selectNodeOnFocus || !onSelectNode) return;
    if (selectFrameRef.current != null) {
      cancelAnimationFrame(selectFrameRef.current);
    }
    selectFrameRef.current = requestAnimationFrame(() => {
      onSelectNode();
      selectFrameRef.current = null;
    });
  }, [normalizedValue, onBeginEdit, onSelectNode, selectNodeOnFocus]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
    focusedRef.current = false;
    if (selectFrameRef.current != null) {
      cancelAnimationFrame(selectFrameRef.current);
      selectFrameRef.current = null;
    }

    const nextText = (event.currentTarget.innerText || event.currentTarget.textContent || "").replace(/\u00a0/g, " ");
    if (cancelCommitRef.current) {
      cancelCommitRef.current = false;
      onCancel();
      return;
    }

    if (nextText !== commitBaselineRef.current) {
      onCommit(nextText);
    }
    onCancel();
  }, [onCancel, onCommit]);

  const stopPropagation = useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    event.stopPropagation();
  }, []);

  return createElement(
    as,
    {
      ref: ref as any,
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      "data-inline-editable": "true",
      "data-inline-field": "true",
      className,
      style: { ...style, outline: "none" },
      onPointerDownCapture: stopPropagation,
      onKeyDownCapture: stopPropagation,
      onMouseDownCapture: stopPropagation,
      onMouseDown: stopPropagation,
      onClickCapture: stopPropagation,
      onClick: stopPropagation,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onInput: stopPropagation,
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelCommitRef.current = true;
          (event.currentTarget as HTMLElement).blur();
          return;
        }

        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
      },
      tabIndex: 0,
    },
    null
  );
}

const buildEditorInlineStyles = (element: any): Record<string, any> => {
  return resolveNodeStyles(element?.settings || {}) as Record<string, any>;
};

// Simple image carousel for the "slider" widget. Kept self-contained
// (own index state) rather than lifted into the editor store, since
// slide position is transient UI state, not page content.
function SliderWidget({
  images,
  showArrows,
  showDots,
  style,
}: {
  images: any[];
  showArrows: boolean;
  showDots: boolean;
  style?: CSSProperties;
}) {
  const [index, setIndex] = useState(0);
  const safeImages = Array.isArray(images) ? images : [];

  if (safeImages.length === 0) {
    return (
      <div style={style} className="flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-300 rounded-lg py-10">
        {createElement(getLucideIcon("ChevronLeftCircle"), { className: "h-6 w-6" })}
        <span className="text-xs">No slides yet — add images in Settings</span>
      </div>
    );
  }

  const clampedIndex = Math.min(index, safeImages.length - 1);
  const current = safeImages[clampedIndex];
  const currentSrc = typeof current === "string" ? current : current?.src || "";

  return (
    <div style={style} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-[16/9]">
      <img src={currentSrc} alt={`Slide ${clampedIndex + 1}`} className="w-full h-full object-cover" />
      {showArrows && safeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + safeImages.length) % safeImages.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
          >
            {createElement(getLucideIcon("ChevronLeft"), { className: "h-4 w-4" })}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % safeImages.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
          >
            {createElement(getLucideIcon("ChevronRight"), { className: "h-4 w-4" })}
          </button>
        </>
      )}
      {showDots && safeImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {safeImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`h-1.5 rounded-full transition-all ${i === clampedIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Live countdown for the "countdown" widget. Recomputes the remaining
// time every second on the client; renders a static placeholder if no
// target date has been set yet so it never shows garbage like "NaN".
function CountdownWidget({ content, style }: { content: any; style?: CSSProperties }) {
  const targetDate: string = content?.endDate || "";
  const [remaining, setRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setRemaining(null);
      return;
    }
    const target = new Date(targetDate).getTime();
    if (Number.isNaN(target)) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units: [string, number][] = remaining
    ? [
        ...(content?.showDays !== false ? [["Days", remaining.days] as [string, number]] : []),
        ...(content?.showHours !== false ? [["Hours", remaining.hours] as [string, number]] : []),
        ...(content?.showMinutes !== false ? [["Min", remaining.minutes] as [string, number]] : []),
        ...(content?.showSeconds !== false ? [["Sec", remaining.seconds] as [string, number]] : []),
      ]
    : [];

  return (
    <div style={style} className="text-center space-y-3">
      {content?.title && <div className="text-sm font-semibold text-gray-900">{content.title}</div>}
      {!remaining ? (
        <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg py-6">
          Set a target date in Settings to start the countdown
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {units.map(([label, value]) => (
            <div key={label} className="flex flex-col items-center min-w-[52px] rounded-lg bg-gray-900 text-white py-2.5">
              <span className="text-lg font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-wide text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditorCanvas() {
  const { pageStructure, device, selectedElementId, hoveredElementId, setSelectedElementId, setHoveredElementId, moveElement, updateElement, siteId } = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ elementId: string; position: { x: number; y: number } } | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaLibraryTargetElementId, setMediaLibraryTargetElementId] = useState<string | null>(null);

  // Prevent navigation in editor mode
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Prevent navigation on links and buttons in editor mode
      if (target.closest('a[href]')) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (target.closest('button[type="submit"]')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Handle inline text editing
  const handleInlineEdit = (elementId: string, currentValue: string) => {
    setEditingElementId(elementId);
    setEditingValue(currentValue);
  };

  const saveInlineEdit = () => {
    setEditingElementId(null);
    setEditingValue("");
  };

  const cancelInlineEdit = () => {
    setEditingElementId(null);
    setEditingValue("");
  };

  // Handle image replacement
  const handleImageReplace = (elementId: string) => {
    setMediaLibraryTargetElementId(elementId);
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (media: any) => {
    if (mediaLibraryTargetElementId) {
      const target = findElementById(pageStructure.elements, mediaLibraryTargetElementId);
      updateElement(mediaLibraryTargetElementId, {
        content: {
          ...target?.content,
          src: media.url,
          alt: media.alt || media.name,
        },
      });
    }
    setMediaLibraryOpen(false);
    setMediaLibraryTargetElementId(null);
  };

  // Handle template block prop editing
  const handleTemplateBlockPropEdit = (elementId: string, propKey: string, newValue: any) => {
    const element = findElementById(pageStructure.elements, elementId);
    if (!element) return;

    // Use deep merge for nested props
    const currentProps = element.content?.props || {};
    const updatedProps = { ...currentProps };
    
    // Handle nested prop updates (e.g., "slides[0].title")
    if (propKey.includes('.')) {
      const keys = propKey.split('.');
      let target = updatedProps;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!target[key]) target[key] = {};
        target = target[key];
      }
      target[keys[keys.length - 1]] = newValue;
    } else {
      updatedProps[propKey] = newValue;
    }

    updateElement(elementId, {
      content: {
        ...element.content,
        props: updatedProps,
      },
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Resolve where an element actually lives in the tree (its parent's id
    // and its index within that parent's own children list) — needed
    // because drag targets are no longer only top-level siblings; a widget
    // can now be dragged within a column, or between columns/sections.
    // Previously this only ever looked at pageStructure.elements directly,
    // so dragging anything nested (i.e. virtually everything, since real
    // content lives inside Section -> Column -> Widget) silently did
    // nothing: both lookups returned -1 and the move never happened.
    type Loc = { parentId: string | null; index: number };
    const findLocation = (elements: Element[], id: string, parentId: string | null = null): Loc | null => {
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as any;
        if (el.id === id) return { parentId, index: i };
        const nested = getNestedChildren(el);
        if (nested && nested.length > 0) {
          const found = findLocation(nested, id, el.id);
          if (found) return found;
        }
      }
      return null;
    };

    const overLocation = findLocation(pageStructure.elements, over.id as string);
    if (!overLocation) {
      setActiveId(null);
      return;
    }

    moveElement(active.id as string, overLocation.parentId, overLocation.index);
    setActiveId(null);
  };

  const getCanvasWidth = () => {
    switch (device) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking on empty canvas
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
      setContextMenu(null);
    }
  };

  const resolveSelectableIdFromTarget = (target: EventTarget | null): string | null => {
    if (!(target instanceof HTMLElement)) return null;
    const selectable = target.closest("[data-editor-node-id], [data-editor-block-id], [data-element-id]");
    if (!selectable) return null;
    return (
      selectable.getAttribute("data-editor-node-id") ||
      selectable.getAttribute("data-editor-block-id") ||
      selectable.getAttribute("data-element-id") ||
      null
    );
  };

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      elementId,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    const rawType = e.dataTransfer.getData("application/x-afro-widget") || e.dataTransfer.getData("text/plain");
    if (!rawType) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      const element = createElementFromWidget(rawType as any);
      if (!element) {
        console.error("[EditorCanvas] handleCanvasDrop: createElementFromWidget returned nothing for type", rawType);
        return;
      }

      const selected = selectedElementId ? findElementById(pageStructure.elements, selectedElementId) : null;
      const canNest = selected && (Array.isArray(selected.elements) || Array.isArray(selected.children) || Array.isArray(selected.columns));
      const parentId = canNest ? selected.id : null;

      useEditorStore.getState().addElement(element, parentId);
      // A dropped widget can land far below the fold (e.g. appended to the
      // end of a long page) with no other feedback that anything happened
      // — select it and scroll it into view so the drop is never silent.
      useEditorStore.getState().setSelectedElementId(element.id);
      requestAnimationFrame(() => {
        document.querySelector(`[data-editor-node-id="${element.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (err) {
      console.error("[EditorCanvas] handleCanvasDrop failed:", err);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    const nextHoveredId = resolveSelectableIdFromTarget(e.target);
    if (nextHoveredId !== hoveredElementId) {
      setHoveredElementId(nextHoveredId);
    }
  };

  const handleCanvasPointerLeave = () => {
    if (hoveredElementId) {
      setHoveredElementId(null);
    }
  };

  const editorNodeCss = buildEditorCanvasCss(pageStructure.elements);

  return (
    <main className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto flex items-start justify-center p-6">
      <div
        className="bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 min-h-full"
        style={{
          width: getCanvasWidth(),
          maxWidth: "100%",
        }}
        onClick={handleCanvasClick}
        onPointerMove={handleCanvasPointerMove}
        onPointerLeave={handleCanvasPointerLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
      >
        {editorNodeCss && (
          <style data-editor-node-styles dangerouslySetInnerHTML={{ __html: editorNodeCss }} />
        )}
        {/* Empty State */}
        {pageStructure.elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[600px] p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 m-4 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start Building Your Page
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Drag widgets from the left sidebar or click the button below to add your first section
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              onClick={() => {
                // Add a default section
                const newSection = {
                  id: crypto.randomUUID(),
                  type: "section" as const,
                  parentId: null,
                  order: 0,
                  visible: true,
                  locked: false,
                  name: "Section",
                  settings: {},
                  styles: {},
                  responsiveStyles: {},
                  layout: "full-width" as const,
                  columns: [],
                  backgroundColor: "#ffffff",
                  padding: { top: "60px", right: "0", bottom: "60px", left: "0" },
                  margin: { top: "0", right: "0", bottom: "0", left: "0" },
                  border: { width: "0", style: "solid", color: "#e5e5e5", radius: "0" },
                  borderRadius: "0",
                  boxShadow: "none",
                };
                // This would need to be connected to the store
                console.log("Add section clicked", newSection);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          </div>
        ) : (
          /* Page Content with Drag and Drop */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pageStructure.elements.map((el) => el.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="min-h-full">
                {pageStructure.elements.map((element) => (
                  <SortableElementRenderer
                    key={element.id}
                    element={element}
                    depth={0}
                    isSelected={selectedElementId === element.id}
                    onSelect={(target) => {
                      const selectableId = resolveSelectableIdFromTarget(target ?? null) || element.id;
                      setSelectedElementId(selectableId);
                    }}
                    onContextMenu={handleContextMenu}
                    editingElementId={editingElementId}
                    editingValue={editingValue}
                    onInlineEdit={handleInlineEdit}
                    onSaveInlineEdit={saveInlineEdit}
                    onCancelInlineEdit={cancelInlineEdit}
                    onImageReplace={handleImageReplace}
                    onEditingValueChange={setEditingValue}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          elementId={contextMenu.elementId}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Media Library */}
      {mediaLibraryOpen && (
        <MediaLibrary
          isOpen={mediaLibraryOpen}
          onClose={() => {
            setMediaLibraryOpen(false);
            setMediaLibraryTargetElementId(null);
          }}
          onSelect={handleMediaSelect}
          siteId={siteId}
        />
      )}
    </main>
  );
}

function SortableElementRenderer({
  element,
  depth,
  isSelected,
  onSelect,
  onContextMenu,
  editingElementId,
  editingValue,
  onInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onImageReplace,
  onEditingValueChange,
  selectedElementId,
  onSelectElement,
}: {
  element: any;
  depth: number;
  isSelected: boolean;
  onSelect: (target?: EventTarget | null) => void;
  onContextMenu: (e: React.MouseEvent, elementId: string) => void;
  editingElementId: string | null;
  editingValue: string;
  onInlineEdit: (elementId: string, currentValue: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onImageReplace: (elementId: string) => void;
  onEditingValueChange: (value: string) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : element.visible === false ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-editor-node-id={element.id} className={`editor-node-${element.id} relative`}>
      {element.visible === false && (
        <div className="absolute top-1 left-1 z-10 pointer-events-none flex items-center gap-1 rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Hidden — right-click to show
        </div>
      )}
      <ElementRenderer
        element={element}
        depth={depth}
        isSelected={isSelected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        editingElementId={editingElementId}
        editingValue={editingValue}
        onInlineEdit={onInlineEdit}
        onSaveInlineEdit={onSaveInlineEdit}
        onCancelInlineEdit={onCancelInlineEdit}
        onImageReplace={onImageReplace}
        onEditingValueChange={onEditingValueChange}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
        dragAttributes={element.locked ? undefined : attributes}
        dragListeners={element.locked ? undefined : listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

function ElementRenderer({
  element,
  depth,
  isSelected,
  onSelect,
  onContextMenu,
  dragAttributes,
  dragListeners,
  isDragging = false,
  editingElementId,
  editingValue,
  onInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onImageReplace,
  onEditingValueChange,
  selectedElementId,
  onSelectElement,
}: {
  element: any;
  depth: number;
  isSelected: boolean;
  onSelect: (target?: EventTarget | null) => void;
  onContextMenu?: (e: React.MouseEvent, elementId: string) => void;
  dragAttributes?: any;
  dragListeners?: any;
  isDragging?: boolean;
  editingElementId: string | null;
  editingValue: string;
  onInlineEdit: (elementId: string, currentValue: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onImageReplace: (elementId: string) => void;
  onEditingValueChange: (value: string) => void;
  selectedElementId?: string | null;
  onSelectElement: (id: string | null) => void;
}) {
  const editorInlineStyles = buildEditorInlineStyles(element);
  const styles = editorInlineStyles as Record<string, any>;
  const isTopLevelNode = depth === 0;
  const isHovered = useEditorStore((state) => state.hoveredElementId === element.id);
  const isInlineEditing = editingElementId === element.id;
  const selectionChromeClass = isSelected
    ? isTopLevelNode
      ? isInlineEditing
        ? "border-blue-500 ring-1 ring-blue-400/40 ring-offset-0 bg-transparent"
        : "border-blue-500 ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30 dark:bg-blue-900/20"
      : isInlineEditing
        ? "border-emerald-500 ring-1 ring-emerald-400/40 ring-offset-0 bg-transparent"
        : "border-emerald-500 ring-2 ring-emerald-500 ring-offset-2 bg-emerald-50/25 dark:bg-emerald-900/15"
    : isTopLevelNode
      ? "border-transparent hover:border-blue-300 hover:ring-2 hover:ring-blue-300/70 hover:ring-offset-1"
      : "border-transparent hover:border-emerald-300 hover:ring-1 hover:ring-emerald-300/70 hover:ring-offset-1";
  const hoveredChromeClass = isHovered && !isSelected
    ? isTopLevelNode
      ? "border-blue-300 ring-2 ring-blue-300/70 ring-offset-1"
      : "border-emerald-300 ring-1 ring-emerald-300/70 ring-offset-1"
    : "";

  const renderElementContent = () => {
    const content = element.content || {};

    switch (element.type) {
      case "heading": {
        const level = content.level || "h2";
        const headingStyles = {
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          textAlign: styles.textAlign,
          marginBottom: styles.marginBottom,
        };
        
        const HeadingTag = level === "h1" ? "h1" : level === "h2" ? "h2" : level === "h3" ? "h3" : level === "h4" ? "h4" : level === "h5" ? "h5" : "h6";
        const headingText = getElementTextValue(element, "Heading");
        
        return (
          <CanvasInlineEditableText
            as={HeadingTag}
            value={headingText}
            onSelectNode={() => onSelectElement(element.id)}
            onBeginEdit={() => onInlineEdit(element.id, headingText)}
            onCommit={(nextText) => updateElementTextValue(element.id, nextText)}
            onCancel={onSaveInlineEdit}
            className="cursor-text outline-none"
            style={{ ...headingStyles, ...editorInlineStyles }}
          />
        );
      }

      case "text":
      case "paragraph": {
        const paragraphText = getElementTextValue(element, "Paragraph text goes here...");
        return (
          <CanvasInlineEditableText
            as="div"
            value={paragraphText}
            onSelectNode={() => onSelectElement(element.id)}
            onBeginEdit={() => onInlineEdit(element.id, paragraphText)}
            onCommit={(nextText) => updateElementTextValue(element.id, nextText)}
            onCancel={onSaveInlineEdit}
            multiline
            className="cursor-text outline-none whitespace-pre-wrap"
            style={{
              ...editorInlineStyles,
              color: styles.color,
              fontSize: styles.fontSize,
              lineHeight: styles.lineHeight,
              textAlign: styles.textAlign,
            }}
          />
        );
      }

      case "button": {
        const buttonText = getElementTextValue(element, "Button");
        return (
          <button
            type="button"
            style={{
              ...editorInlineStyles,
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              paddingTop: styles.paddingTop,
              paddingRight: styles.paddingRight || "24px",
              paddingBottom: styles.paddingBottom,
              paddingLeft: styles.paddingLeft || "24px",
              borderRadius: styles.borderRadius,
              border: `${styles.borderWidth || "1px"} ${styles.borderStyle || "solid"} ${styles.borderColor || "transparent"}`,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
            }}
            className="cursor-text outline-none"
          >
            <CanvasInlineEditableText
              as="span"
              value={buttonText}
              onSelectNode={() => onSelectElement(element.id)}
              onBeginEdit={() => onInlineEdit(element.id, buttonText)}
              onCommit={(nextText) => updateElementTextValue(element.id, nextText)}
              onCancel={onSaveInlineEdit}
              selectNodeOnFocus={false}
              className="outline-none"
            />
          </button>
        );
      }

      case "image":
        return (
          <div className="relative group" style={editorInlineStyles}>
            <img
              src={content.src || "https://via.placeholder.com/400x300"}
              alt={content.alt || "Image"}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: styles.borderRadius,
                boxShadow: styles.boxShadow,
              }}
              className="cursor-pointer"
              onClick={() => onImageReplace(element.id)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              onImageReplace(element.id);
            }}>
              <span className="text-white text-sm font-medium">Click to replace image</span>
            </div>
          </div>
        );

      case "divider":
        return (
          <hr
            style={{
              borderColor: styles.borderColor || "#e5e5e5",
              borderWidth: styles.borderWidth || "1px",
              marginTop: styles.marginTop || "16px",
              marginRight: "0",
              marginBottom: styles.marginBottom || "16px",
              marginLeft: "0",
            }}
          />
        );

      case "spacer":
        return (
          <div
            style={{
              height: content.height || "40px",
            }}
          />
        );

      case "section":
      case "container":
        return (
          <div
            data-editor-node-id={element.id}
            className={`editor-node-${element.id} ${selectionChromeClass}`}
            style={{
              ...editorInlineStyles,
              backgroundColor: styles.backgroundColor || "#ffffff",
              paddingTop: styles.paddingTop || "60px",
              paddingRight: styles.paddingRight || "0",
              paddingBottom: styles.paddingBottom || "60px",
              paddingLeft: styles.paddingLeft || "0",
              marginTop: styles.marginTop || "0",
              marginRight: styles.marginRight || "0",
              marginBottom: styles.marginBottom || "0",
              marginLeft: styles.marginLeft || "0",
              borderRadius: styles.borderRadius,
            }}
          >
            <SortableContext
              items={(element.elements || element.children || element.columns || []).map((c: any) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {(element.elements || element.children || element.columns)?.map((child: any) => (
                <SortableElementRenderer
                  key={child.id}
                  element={child}
                  depth={depth + 1}
                  isSelected={selectedElementId === child.id}
                  onSelect={() => onSelectElement(child.id)}
                  onContextMenu={onContextMenu}
                  editingElementId={editingElementId}
                  editingValue={editingValue}
                  onInlineEdit={onInlineEdit}
                  onSaveInlineEdit={onSaveInlineEdit}
                  onCancelInlineEdit={onCancelInlineEdit}
                  onImageReplace={onImageReplace}
                  onEditingValueChange={onEditingValueChange}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                />
              ))}
            </SortableContext>
          </div>
        );

      case "column":
        return (
          <div
            data-editor-node-id={element.id}
            className={`editor-node-${element.id} ${selectionChromeClass}`}
            style={{
              ...editorInlineStyles,
              width: `${element.width || 100}%`,
              paddingTop: styles.paddingTop || "0",
              paddingRight: styles.paddingRight || "12px",
              paddingBottom: styles.paddingBottom || "0",
              paddingLeft: styles.paddingLeft || "12px",
            }}
          >
            <SortableContext
              items={(element.elements || element.children || []).map((c: any) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {(element.elements || element.children)?.map((child: any) => (
                <SortableElementRenderer
                  key={child.id}
                  element={child}
                  depth={depth + 1}
                  isSelected={selectedElementId === child.id}
                  onSelect={() => onSelectElement(child.id)}
                  onContextMenu={onContextMenu}
                  editingElementId={editingElementId}
                  editingValue={editingValue}
                  onInlineEdit={onInlineEdit}
                  onSaveInlineEdit={onSaveInlineEdit}
                  onCancelInlineEdit={onCancelInlineEdit}
                  onImageReplace={onImageReplace}
                  onEditingValueChange={onEditingValueChange}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                />
              ))}
            </SortableContext>
          </div>
        );

      case "grid": {
        const gridChildren = element.elements || element.children || [];
        const columns = Number(content.columns) || 3;
        return (
          <div
            data-editor-node-id={element.id}
            className={`editor-node-${element.id} ${selectionChromeClass}`}
            style={{
              ...editorInlineStyles,
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${content.gap || "24"}px`,
              minHeight: gridChildren.length ? undefined : "80px",
            }}
          >
            {gridChildren.length === 0 && (
              <div className="col-span-full flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg py-6">
                Empty grid — drag widgets here
              </div>
            )}
            {gridChildren.map((child: any) => (
              <ElementRenderer
                key={child.id}
                element={child}
                depth={depth + 1}
                isSelected={selectedElementId === child.id}
                onSelect={() => onSelectElement(child.id)}
                onContextMenu={onContextMenu}
                editingElementId={editingElementId}
                editingValue={editingValue}
                onInlineEdit={onInlineEdit}
                onSaveInlineEdit={onSaveInlineEdit}
                onCancelInlineEdit={onCancelInlineEdit}
                onImageReplace={onImageReplace}
                onEditingValueChange={onEditingValueChange}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              />
            ))}
          </div>
        );
      }

      case "flex": {
        const flexChildren = element.elements || element.children || [];
        return (
          <div
            data-editor-node-id={element.id}
            className={`editor-node-${element.id} ${selectionChromeClass}`}
            style={{
              ...editorInlineStyles,
              display: "flex",
              flexDirection: content.direction === "column" ? "column" : "row",
              justifyContent: content.justify || "flex-start",
              alignItems: content.align || "center",
              flexWrap: content.wrap || "nowrap",
              gap: `${content.gap || "16"}px`,
              minHeight: flexChildren.length ? undefined : "80px",
            }}
          >
            {flexChildren.length === 0 && (
              <div className="flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg py-6 w-full">
                Empty flex container — drag widgets here
              </div>
            )}
            {flexChildren.map((child: any) => (
              <ElementRenderer
                key={child.id}
                element={child}
                depth={depth + 1}
                isSelected={selectedElementId === child.id}
                onSelect={() => onSelectElement(child.id)}
                onContextMenu={onContextMenu}
                editingElementId={editingElementId}
                editingValue={editingValue}
                onInlineEdit={onInlineEdit}
                onSaveInlineEdit={onSaveInlineEdit}
                onCancelInlineEdit={onCancelInlineEdit}
                onImageReplace={onImageReplace}
                onEditingValueChange={onEditingValueChange}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              />
            ))}
          </div>
        );
      }

      case "video": {
        const videoSrc: string = content.src || "";
        const isYouTube = /youtube\.com|youtu\.be/.test(videoSrc);
        const isVimeo = /vimeo\.com/.test(videoSrc);
        const toEmbedUrl = (url: string) => {
          if (isYouTube) {
            const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
            return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url;
          }
          if (isVimeo) {
            const idMatch = url.match(/vimeo\.com\/(\d+)/);
            return idMatch ? `https://player.vimeo.com/video/${idMatch[1]}` : url;
          }
          return url;
        };
        return (
          <div style={{ ...editorInlineStyles, aspectRatio: content.aspectRatio || "16/9", position: "relative" }} className="w-full bg-gray-900 rounded-lg overflow-hidden">
            {!videoSrc ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                {createElement(getLucideIcon("Video"), { className: "h-8 w-8" })}
                <span className="text-xs">No video source set — add one in Settings</span>
              </div>
            ) : isYouTube || isVimeo ? (
              <iframe
                src={toEmbedUrl(videoSrc)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoSrc}
                poster={content.poster || undefined}
                autoPlay={!!content.autoplay}
                loop={!!content.loop}
                muted={!!content.muted}
                controls={content.controls !== false}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        );
      }

      case "gallery": {
        const galleryImages: any[] = Array.isArray(content.images) ? content.images : [];
        const galleryColumns = Number(content.columns) || 3;
        return (
          <div style={editorInlineStyles}>
            {galleryImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-300 rounded-lg py-10">
                {createElement(getLucideIcon("Images"), { className: "h-6 w-6" })}
                <span className="text-xs">No images yet — add some in Settings</span>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${galleryColumns}, 1fr)`, gap: `${content.gap || "16"}px` }}>
                {galleryImages.map((img: any, i: number) => (
                  <img
                    key={i}
                    src={typeof img === "string" ? img : img?.src || ""}
                    alt={typeof img === "string" ? `Gallery image ${i + 1}` : img?.alt || `Gallery image ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg aspect-square"
                  />
                ))}
              </div>
            )}
          </div>
        );
      }

      case "slider": {
        const sliderImages: any[] = Array.isArray(content.images) ? content.images : [];
        return (
          <SliderWidget
            images={sliderImages}
            showArrows={content.showArrows !== false}
            showDots={content.showDots !== false}
            style={editorInlineStyles}
          />
        );
      }

      case "form": {
        const formChildren = element.elements || element.children || [];
        return (
          <form
            data-editor-node-id={element.id}
            className={`editor-node-${element.id} ${selectionChromeClass} space-y-4`}
            style={editorInlineStyles}
            onSubmit={(e) => e.preventDefault()}
          >
            {formChildren.length === 0 ? (
              <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg py-6 text-center">
                Empty form — drag Input, Text Area, or Select widgets here
              </div>
            ) : (
              formChildren.map((child: any) => (
                <ElementRenderer
                  key={child.id}
                  element={child}
                  depth={depth + 1}
                  isSelected={selectedElementId === child.id}
                  onSelect={() => onSelectElement(child.id)}
                  onContextMenu={onContextMenu}
                  editingElementId={editingElementId}
                  editingValue={editingValue}
                  onInlineEdit={onInlineEdit}
                  onSaveInlineEdit={onSaveInlineEdit}
                  onCancelInlineEdit={onCancelInlineEdit}
                  onImageReplace={onImageReplace}
                  onEditingValueChange={onEditingValueChange}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                />
              ))
            )}
            <button
              type="submit"
              className="rounded-lg bg-gray-900 text-white text-sm font-medium px-5 py-2.5"
            >
              {content.submitText || "Submit"}
            </button>
          </form>
        );
      }

      case "input":
        return (
          <div style={editorInlineStyles} className="space-y-1.5">
            {content.label && <label className="block text-sm font-medium text-gray-700">{content.label}{content.required && <span className="text-red-500"> *</span>}</label>}
            <input
              type={content.type || "text"}
              placeholder={content.placeholder || ""}
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-500"
            />
          </div>
        );

      case "textarea":
        return (
          <div style={editorInlineStyles} className="space-y-1.5">
            {content.label && <label className="block text-sm font-medium text-gray-700">{content.label}{content.required && <span className="text-red-500"> *</span>}</label>}
            <textarea
              placeholder={content.placeholder || ""}
              rows={Number(content.rows) || 4}
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-500 resize-none"
            />
          </div>
        );

      case "select": {
        const selectOptions: any[] = Array.isArray(content.options) ? content.options : [];
        return (
          <div style={editorInlineStyles} className="space-y-1.5">
            {content.label && <label className="block text-sm font-medium text-gray-700">{content.label}{content.required && <span className="text-red-500"> *</span>}</label>}
            <select disabled className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-500">
              {selectOptions.length === 0 ? (
                <option>No options set</option>
              ) : (
                selectOptions.map((opt: any, i: number) => (
                  <option key={i} value={opt?.value ?? ""}>{opt?.label ?? String(opt)}</option>
                ))
              )}
            </select>
          </div>
        );
      }

      case "product":
        return (
          <div style={editorInlineStyles} className="w-full max-w-[220px] rounded-xl border border-gray-200 overflow-hidden bg-white">
            {content.showImage !== false && (
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                {createElement(getLucideIcon("ShoppingBag"), { className: "h-8 w-8" })}
              </div>
            )}
            <div className="p-3 space-y-1">
              <div className="text-sm font-medium text-gray-900">{content.productId ? "Selected product" : "No product selected"}</div>
              {content.showPrice !== false && <div className="text-sm text-gray-500">$0.00</div>}
              {content.showAddToCart !== false && (
                <button type="button" className="mt-2 w-full rounded-lg bg-gray-900 text-white text-xs font-medium py-2">Add to cart</button>
              )}
              {!content.productId && <div className="text-[11px] text-amber-600">Pick a product in Settings</div>}
            </div>
          </div>
        );

      case "products": {
        const productColumns = Number(content.columns) || 4;
        const productCount = Math.max(1, Number(content.limit) || 8);
        return (
          <div style={editorInlineStyles}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${productColumns}, 1fr)`, gap: "16px" }}>
              {Array.from({ length: Math.min(productCount, productColumns * 2) }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                    {createElement(getLucideIcon("ShoppingBag"), { className: "h-6 w-6" })}
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-xs font-medium text-gray-900">Product name</div>
                    {content.showPrice !== false && <div className="text-xs text-gray-500">$0.00</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-gray-400 mt-2">Live products load automatically on the storefront{content.category ? ` from "${content.category}"` : ""}.</div>
          </div>
        );
      }

      case "cart":
        return (
          <div style={editorInlineStyles} className="w-full max-w-xs rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              {createElement(getLucideIcon("ShoppingCart"), { className: "h-4 w-4" })}
              Your cart
            </div>
            {content.showItems !== false && (
              <div className="text-xs text-gray-400 border-t border-b border-gray-100 py-3">Cart items appear here on the live storefront</div>
            )}
            {content.showTotal !== false && (
              <div className="flex justify-between text-sm font-medium text-gray-900">
                <span>Total</span>
                <span>$0.00</span>
              </div>
            )}
            {content.showCheckout !== false && (
              <button type="button" className="w-full rounded-lg bg-gray-900 text-white text-xs font-medium py-2.5">Checkout</button>
            )}
          </div>
        );

      case "social-share": {
        const sharePlatforms: string[] = Array.isArray(content.platforms) ? content.platforms : [];
        return (
          <div style={editorInlineStyles} className="flex items-center gap-2">
            {sharePlatforms.length === 0 && <span className="text-xs text-gray-400">No platforms selected</span>}
            {sharePlatforms.map((platform: string, i: number) => {
              const Icon = getSocialIcon(platform);
              return (
                <span key={i} className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600" title={platform}>
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        );
      }

      case "social-follow": {
        const followPlatforms: any[] = Array.isArray(content.platforms) ? content.platforms : [];
        return (
          <div style={editorInlineStyles} className="flex items-center gap-2">
            {followPlatforms.length === 0 && <span className="text-xs text-gray-400">No social links set</span>}
            {followPlatforms.map((p: any, i: number) => {
              const Icon = getSocialIcon(p?.name);
              return (
                <span key={i} className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600" title={p?.name || ""}>
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        );
      }

      case "testimonial": {
        const testimonialText = getElementTextValue(element, content.text || "This is a testimonial from a satisfied customer.");
        const rating = Math.max(0, Math.min(5, Number(content.rating) || 0));
        return (
          <div style={editorInlineStyles} className="rounded-xl border border-gray-200 bg-white p-5 max-w-md space-y-3">
            {rating > 0 && (
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{createElement(getLucideIcon("Star"), { className: "h-3.5 w-3.5", fill: i < rating ? "currentColor" : "none" })}</span>
                ))}
              </div>
            )}
            <CanvasInlineEditableText
              as="p"
              value={testimonialText}
              onSelectNode={() => onSelectElement(element.id)}
              onBeginEdit={() => onInlineEdit(element.id, testimonialText)}
              onCommit={(nextText) => updateElementTextValue(element.id, nextText)}
              onCancel={onSaveInlineEdit}
              multiline
              className="cursor-text outline-none text-sm text-gray-700 whitespace-pre-wrap"
            />
            <div className="flex items-center gap-2 pt-1">
              {content.avatar ? (
                <img src={content.avatar} alt={content.name || ""} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {(content.name || "?").charAt(0)}
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-gray-900">{content.name || "Customer Name"}</div>
                <div className="text-[11px] text-gray-500">{content.role || "Customer Role"}</div>
              </div>
            </div>
          </div>
        );
      }

      case "reviews": {
        const reviewLimit = Math.max(1, Math.min(Number(content.limit) || 6, 4));
        return (
          <div style={editorInlineStyles} className="space-y-3">
            {Array.from({ length: reviewLimit }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-1.5">
                {content.showRating !== false && (
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j}>{createElement(getLucideIcon("Star"), { className: "h-3 w-3", fill: "currentColor" })}</span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500">Reviews load automatically on the storefront{content.productId ? " for this product" : ""}.</div>
              </div>
            ))}
          </div>
        );
      }

      case "countdown":
        return <CountdownWidget content={content} style={editorInlineStyles} />;

      case "cta": {
        const ctaHeading = getElementTextValue(element, content.heading || "Take Action Now");
        return (
          <div
            style={{
              ...editorInlineStyles,
              backgroundColor: content.backgroundColor || "#2563eb",
              color: content.textColor || "#ffffff",
            }}
            className="rounded-xl px-8 py-10 text-center space-y-3"
          >
            <CanvasInlineEditableText
              as="h3"
              value={ctaHeading}
              onSelectNode={() => onSelectElement(element.id)}
              onBeginEdit={() => onInlineEdit(element.id, ctaHeading)}
              onCommit={(nextText) => updateElementTextValue(element.id, nextText)}
              onCancel={onSaveInlineEdit}
              className="cursor-text outline-none text-2xl font-bold"
            />
            {content.description && <p className="opacity-90 text-sm max-w-lg mx-auto">{content.description}</p>}
            <button
              type="button"
              className="inline-flex mt-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold"
              style={{ color: content.backgroundColor || "#2563eb" }}
            >
              {content.buttonText || "Get Started"}
            </button>
          </div>
        );
      }

      case "progress-bar": {
        const progressValue = Math.max(0, Math.min(100, Number(content.value) || 0));
        return (
          <div style={editorInlineStyles} className="space-y-1.5">
            {content.showLabel !== false && (
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Progress</span>
                <span>{progressValue}%</span>
              </div>
            )}
            <div className="w-full rounded-full bg-gray-100" style={{ height: `${content.height || 8}px` }}>
              <div
                className="rounded-full transition-all"
                style={{ width: `${progressValue}%`, height: "100%", backgroundColor: content.color || "#2563eb" }}
              />
            </div>
          </div>
        );
      }

      case "embed": {
        const embedCode: string = content.code || "";
        if (!embedCode) {
          return (
            <div style={editorInlineStyles} className="flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-300 rounded-lg py-10">
              {createElement(getLucideIcon("Code2"), { className: "h-6 w-6" })}
              <span className="text-xs">No embed code set — add it in Settings</span>
            </div>
          );
        }
        const isUrl = /^https?:\/\//.test(embedCode.trim());
        return (
          <div style={editorInlineStyles} className="w-full rounded-lg overflow-hidden border border-gray-200">
            {isUrl ? (
              <iframe src={embedCode} className="w-full" style={{ height: "400px", border: "none" }} />
            ) : (
              <iframe srcDoc={embedCode} className="w-full" style={{ height: "400px", border: "none" }} sandbox="allow-scripts allow-same-origin" />
            )}
          </div>
        );
      }

      case "html": {
        const htmlCode: string = content.code || "";
        return (
          <div
            style={editorInlineStyles}
            className={htmlCode ? "" : "flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-300 rounded-lg py-10"}
          >
            {htmlCode ? (
              <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
            ) : (
              <>
                {createElement(getLucideIcon("Code"), { className: "h-6 w-6" })}
                <span className="text-xs">No HTML added yet</span>
              </>
            )}
          </div>
        );
      }

      case "shortcode":
        return (
          <div style={editorInlineStyles} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 font-mono text-xs text-gray-600">
            {createElement(getLucideIcon("Brackets"), { className: "h-3.5 w-3.5" })}
            {content.code || "[shortcode]"}
          </div>
        );

      case "icon": {
        const IconComponent = getLucideIcon(content.name);
        return (
          <div style={editorInlineStyles}>
            <IconComponent
              size={Number(content.size) || 24}
              color={content.color || "#171717"}
            />
          </div>
        );
      }


      case "template-block": {
        // Render template blocks using the RenderTemplateBlock
        const templateBlock: TemplateBlock = {
          id: element.id,
          type: content.blockType || element.type,
          settings: element.settings || {},
          props: element.settings || {},
          styleOverrides: element.settings || {},
          elements: element.elements || [],
        };
        return (
          <div 
            className={`w-full relative group transition-all editor-node-${element.id} ${selectionChromeClass}`}
            data-element-id={element.id}
            data-editor-node-id={element.id}
            style={editorInlineStyles}
            onClickCapture={(e) => {
              if (isInlineEditableTarget(e.target)) return;
              e.stopPropagation();
              onSelect(e.target);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onContextMenu) {
                onContextMenu(e, element.id);
              }
            }}
          >
            <RenderTemplateBlocks blocks={[templateBlock]} isEditor={true} />
            {isSelected && (
              <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10 shadow-lg">
                  {element.type}
                </div>
              </>
            )}
          </div>
        );
      }

      // Handle template block types directly (aegisHeader, aegisHero, etc.)
      case "aegisHeader":
      case "aegisHero":
      case "aegisServices":
      case "aegisStories":
      case "aegisCTA":
      case "aegisFooter":
      case "fashionHeroSlider":
      case "fashionPromoBanners":
      case "fashionProductGrid":
      case "fashionFooter":
      case "tshirtAboutHero":
      case "tshirtFeatureCards":
      case "landingGadgetHero":
      case "landingGadgetFeatures":
        // Render as template block
        const templateBlockDirect: TemplateBlock = {
          id: element.id,
          type: element.type,
          props: {
            ...(element.settings || {}),
            ...(element.content || {}),
            ...(element.content?.props || {}),
          },
          elements: element.elements || [],
        };
        return (
          <div 
            className={`w-full relative group transition-all editor-node-${element.id} ${selectionChromeClass}`}
              data-element-id={element.id}
            data-editor-node-id={element.id}
            onClickCapture={(e) => {
              if (isInlineEditableTarget(e.target)) return;
              e.stopPropagation();
              onSelect(e.target);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onContextMenu) {
                onContextMenu(e, element.id);
              }
            }}
          >
            <RenderTemplateBlocks blocks={[templateBlockDirect]} isEditor={true} />
            {isSelected && (
              <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10 shadow-lg">
                  {element.type}
                </div>
              </>
            )}
          </div>
        );

      // Dynamic fallback: if the type is a registered top-level template block, render it
      default:
        if (isRegisteredTemplateBlock(element.type)) {
            // Same settings/content split as editorNodeToBlock in
            // src/lib/page-content.ts: handleAddSection (LeftSidebar.tsx)
            // stores real data in both element.settings and element.content,
            // but this only read .settings — a section added via the
            // Sections tab could preview incomplete or wrong right here in
            // the editor's own canvas even though it would have published
            // correctly live (that path was already fixed).
            const mergedBlockProps = {
              ...(element.settings || {}),
              ...(element.content || {}),
              ...(element.content?.props || {}),
            };
            const dynamicTemplateBlock: TemplateBlock = {
              id: element.id,
              type: element.type,
              settings: mergedBlockProps,
              props: mergedBlockProps,
              styleOverrides: mergedBlockProps,
              elements: element.elements || [],
            };
          
          return (
            <div 
              className={`w-full relative group transition-all editor-node-${element.id} ${selectionChromeClass}`}
              data-element-id={element.id}
              data-editor-node-id={element.id}
              style={editorInlineStyles}
              onClickCapture={(e) => {
                if (isInlineEditableTarget(e.target)) return;
                e.stopPropagation();
                onSelect(e.target);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onContextMenu) {
                  onContextMenu(e, element.id);
                }
              }}
          >
              <RenderTemplateBlocks blocks={[dynamicTemplateBlock]} isEditor={true} />
              {isSelected && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10 shadow-lg">
                    {element.type}
                  </div>
                </>
              )}
            </div>
          );
        }
        if (isChildFragmentType(element.type)) {
          return null;
        }
        // Fallback for unknown types - try to render content as JSON
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {element.type} - {JSON.stringify(content).substring(0, 100)}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`group relative border-2 transition-colors editor-node-${element.id} ${
        selectionChromeClass
      } ${hoveredChromeClass} ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e.target);
      }}
      onMouseEnter={() => useEditorStore.getState().setHoveredElementId(element.id)}
      onMouseLeave={() => {
        if (useEditorStore.getState().hoveredElementId === element.id) {
          useEditorStore.getState().setHoveredElementId(null);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
          onContextMenu(e, element.id);
        }
      }}
      data-element-id={element.id}
      data-editor-node-id={element.id}
      {...dragAttributes}
      {...dragListeners}
    >
      {/* Element Label */}
      <div className={`absolute -top-3 left-2 px-2 py-0.5 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-medium rounded z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {element.name}
      </div>

      {/* Element Content */}
      <div className="min-h-[40px]">
        {renderElementContent()}
      </div>

      {/* Render children only for generic builder nodes; template blocks render their own nested content */}
      {!isRegisteredTemplateBlock(element.type) && element.type !== "template-block" && !isChildFragmentType(element.type) && (element.elements || element.children || element.columns)?.map((child: any) => (
        <ElementRenderer
          key={child.id}
          element={child}
          depth={depth + 1}
          isSelected={selectedElementId === child.id}
          onSelect={() => onSelectElement(child.id)}
          onContextMenu={onContextMenu}
          editingElementId={editingElementId}
          editingValue={editingValue}
          onInlineEdit={onInlineEdit}
          onSaveInlineEdit={onSaveInlineEdit}
          onCancelInlineEdit={onCancelInlineEdit}
          onImageReplace={onImageReplace}
          onEditingValueChange={onEditingValueChange}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        />
      ))}
    </div>
  );
}
