"use client";

import React, { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";
import { DeviceType } from "@/lib/visual-editor/types";
import { Plus } from "lucide-react";
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
    
    if (over && active.id !== over.id) {
      const oldIndex = pageStructure.elements.findIndex((el) => el.id === active.id);
      const newIndex = pageStructure.elements.findIndex((el) => el.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        moveElement(active.id as string, null, newIndex);
      }
    }
    
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

    const element = createElementFromWidget(rawType as any);
    if (!element) return;

    const selected = selectedElementId ? findElementById(pageStructure.elements, selectedElementId) : null;
    const canNest = selected && (Array.isArray(selected.elements) || Array.isArray(selected.children) || Array.isArray(selected.columns));
    const parentId = canNest ? selected.id : null;

    useEditorStore.getState().addElement(element, parentId);
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-editor-node-id={element.id} className={`editor-node-${element.id}`}>
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
        dragAttributes={attributes}
        dragListeners={listeners}
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
            {(element.elements || element.children)?.map((child: any) => (
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
            {(element.elements || element.children)?.map((child: any) => (
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

      case "template-block":
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
          props: element.settings || {},
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
            const dynamicTemplateBlock: TemplateBlock = {
              id: element.id,
              type: element.type,
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
