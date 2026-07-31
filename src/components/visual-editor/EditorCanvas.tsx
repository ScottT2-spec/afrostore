"use client";

import { useState, useEffect } from "react";
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
import { RenderTemplateBlocks, ALL_TEMPLATE_BLOCKS } from "@/components/storefront/TemplateBlockRenderer";
import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { createElementFromWidget } from "@/lib/visual-editor/widgets";
import MediaLibrary from "./MediaLibrary";

const findElementById = (elements: any[], id: string): any | null => {
  for (const element of elements) {
    if (element.id === id) return element;
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
  return (
    content.text ??
    content.content ??
    element?.settings?.text ??
    element?.settings?.content ??
    fallback
  );
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

const buildEditorInlineStyles = (element: any): Record<string, any> => {
  const styles = element?.styles || {};
  const typography = styles.typography || {};
  const colors = styles.colors || {};
  const spacing = styles.spacing || {};
  const border = styles.border || {};
  const background = styles.background || {};
  const effects = styles.effects || {};
  const position = styles.position || {};

  const resolved: Record<string, any> = {};

  if (typography.fontFamily) resolved.fontFamily = typography.fontFamily;
  if (typography.fontSize) resolved.fontSize = typography.fontSize;
  if (typography.fontWeight) resolved.fontWeight = typography.fontWeight;
  if (typography.lineHeight) resolved.lineHeight = typography.lineHeight;
  if (typography.letterSpacing) resolved.letterSpacing = typography.letterSpacing;
  if (typography.textAlign) resolved.textAlign = typography.textAlign;
  if (typography.textTransform) resolved.textTransform = typography.textTransform;
  if (typography.color) resolved.color = typography.color;

  if (colors.background) resolved.backgroundColor = colors.background;
  if (colors.text) resolved.color = colors.text;
  if (colors.border) resolved.borderColor = colors.border;

  if (spacing.top || spacing.right || spacing.bottom || spacing.left) {
    resolved.padding = `${spacing.top || "0"} ${spacing.right || "0"} ${spacing.bottom || "0"} ${spacing.left || "0"}`;
  }

  if (border.width) resolved.borderWidth = border.width;
  if (border.style) resolved.borderStyle = border.style;
  if (border.color) resolved.borderColor = border.color;
  if (border.radius) resolved.borderRadius = border.radius;

  if (background.image) resolved.backgroundImage = `url(${background.image})`;
  if (background.position) resolved.backgroundPosition = background.position;
  if (background.size) resolved.backgroundSize = background.size;
  if (background.repeat) resolved.backgroundRepeat = background.repeat;

  if (effects.boxShadow) resolved.boxShadow = effects.boxShadow;
  if (typeof effects.opacity === "number") resolved.opacity = effects.opacity;
  const filterParts: string[] = [];
  if (typeof effects.blur === "number") filterParts.push(`blur(${effects.blur}px)`);
  if (typeof effects.brightness === "number") filterParts.push(`brightness(${effects.brightness})`);
  if (typeof effects.contrast === "number") filterParts.push(`contrast(${effects.contrast})`);
  if (typeof effects.saturate === "number") filterParts.push(`saturate(${effects.saturate})`);
  if (typeof effects.grayscale === "number") filterParts.push(`grayscale(${effects.grayscale})`);
  if (typeof effects.sepia === "number") filterParts.push(`sepia(${effects.sepia})`);
  if (typeof effects.hueRotate === "number") filterParts.push(`hue-rotate(${effects.hueRotate}deg)`);
  if (filterParts.length > 0) resolved.filter = filterParts.join(" ");

  if (position.type) resolved.position = position.type;
  if (position.top) resolved.top = position.top;
  if (position.right) resolved.right = position.right;
  if (position.bottom) resolved.bottom = position.bottom;
  if (position.left) resolved.left = position.left;
  if (typeof position.zIndex === "number") resolved.zIndex = position.zIndex;

  return resolved;
};

const buildEditorTemplateStyleOverrides = (element: any): Record<string, any> => {
  const styles = element?.styles || {};
  const typography = styles.typography || {};
  const colors = styles.colors || {};
  const spacing = styles.spacing || {};
  const border = styles.border || {};
  const background = styles.background || {};
  const effects = styles.effects || {};
  const position = styles.position || {};

  const overrides: Record<string, any> = {};

  if (background.color || colors.background) overrides.backgroundColor = background.color || colors.background;
  if (background.gradient) overrides.backgroundGradient = background.gradient;
  if (background.image) overrides.backgroundImage = background.image;
  if (background.type) overrides.backgroundType = background.type;
  if (background.video) overrides.backgroundVideo = background.video;
  if (background.overlay) overrides.backgroundOverlay = background.overlay;
  if (typeof background.overlayOpacity === "number") overrides.backgroundOverlayOpacity = background.overlayOpacity;
  if (background.position) overrides.backgroundPosition = background.position;
  if (background.size) overrides.backgroundSize = background.size;
  if (background.repeat) overrides.backgroundRepeat = background.repeat;

  if (colors.text) overrides.textColor = colors.text;
  if (typography.color) overrides.textColor = typography.color;
  if (typography.fontFamily) overrides.fontFamily = typography.fontFamily;
  if (typography.fontSize) overrides.fontSize = typography.fontSize;
  if (typography.fontWeight) overrides.fontWeight = typography.fontWeight;
  if (typography.lineHeight) overrides.lineHeight = typography.lineHeight;
  if (typography.letterSpacing) overrides.letterSpacing = typography.letterSpacing;
  if (typography.textAlign) overrides.textAlign = typography.textAlign;
  if (typography.textTransform) overrides.textTransform = typography.textTransform;

  if (spacing.top) overrides.paddingTop = spacing.top;
  if (spacing.right) overrides.paddingRight = spacing.right;
  if (spacing.bottom) overrides.paddingBottom = spacing.bottom;
  if (spacing.left) overrides.paddingLeft = spacing.left;

  if (border.width) overrides.borderWidth = border.width;
  if (border.style) overrides.borderStyle = border.style;
  if (border.color) overrides.borderColor = border.color;
  if (border.radius) overrides.borderRadius = border.radius;

  if (effects.boxShadow) overrides.boxShadow = effects.boxShadow;
  if (typeof effects.opacity === "number") overrides.opacity = effects.opacity;
  if (typeof position.zIndex === "number") overrides.zIndex = position.zIndex;
  if (position.type) overrides.position = position.type;
  if (position.top) overrides.top = position.top;
  if (position.right) overrides.right = position.right;
  if (position.bottom) overrides.bottom = position.bottom;
  if (position.left) overrides.left = position.left;
  if (typeof element?.settings?.customCss === "string" && element.settings.customCss.trim()) {
    overrides.customCss = element.settings.customCss;
  }

  return overrides;
};

export default function EditorCanvas() {
  const { pageStructure, device, selectedElementId, setSelectedElementId, moveElement, updateElement, siteId } = useEditorStore();
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
    const canNest = selected && (Array.isArray(selected.children) || Array.isArray(selected.columns));
    const parentId = canNest ? selected.id : null;

    useEditorStore.getState().addElement(element, parentId);
  };

  return (
    <main className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto flex items-start justify-center p-6">
      <div
        className="bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 min-h-full"
        style={{
          width: getCanvasWidth(),
          maxWidth: "100%",
        }}
        onClick={handleCanvasClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
      >
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
                    isSelected={selectedElementId === element.id}
                    onSelect={() => {
                      console.log("SortableElementRenderer onSelect - element.id:", element.id);
                      setSelectedElementId(element.id);
                      console.log("setSelectedElementId called with:", element.id);
                      console.log("selectedElementId after set:", selectedElementId);
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
  isSelected: boolean;
  onSelect: () => void;
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
    <div ref={setNodeRef} style={style}>
      <ElementRenderer
        element={element}
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
  isSelected: boolean;
  onSelect: () => void;
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
  const templateStyleOverrides = buildEditorTemplateStyleOverrides(element);
  const customCss = typeof element?.settings?.customCss === "string" ? element.settings.customCss : "";

  const renderElementContent = () => {
    const content = element.content || {};
    const styles = element.styles || {};

    switch (element.type) {
      case "heading": {
        const level = content.level || "h2";
        const headingStyles = {
          color: styles.typography?.color,
          fontSize: styles.typography?.fontSize,
          fontWeight: styles.typography?.fontWeight,
          textAlign: styles.typography?.textAlign,
          marginBottom: styles.spacing?.bottom,
        };
        
        const HeadingTag = level === "h1" ? "h1" : level === "h2" ? "h2" : level === "h3" ? "h3" : level === "h4" ? "h4" : level === "h5" ? "h5" : "h6";
        const headingText = getElementTextValue(element, "Heading");
        
        return (
          <HeadingTag 
            style={{ ...headingStyles, ...editorInlineStyles }}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onFocus={() => onInlineEdit(element.id, headingText)}
            onInput={(e) => updateElementTextValue(element.id, (e.currentTarget.textContent || "").trimEnd())}
            onBlur={onSaveInlineEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onCancelInlineEdit();
              }
            }}
            className={`cursor-text hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 outline-none ${editingElementId === element.id ? "ring-2 ring-blue-500 bg-blue-50/40" : ""}`}
          >
            {headingText}
          </HeadingTag>
        );
      }

      case "text":
      case "paragraph": {
        const paragraphText = getElementTextValue(element, "Paragraph text goes here...");
        return (
          <div
            style={{
              ...editorInlineStyles,
              color: styles.typography?.color,
              fontSize: styles.typography?.fontSize,
              lineHeight: styles.typography?.lineHeight,
              textAlign: styles.typography?.textAlign,
            }}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onFocus={() => onInlineEdit(element.id, paragraphText)}
            onInput={(e) => updateElementTextValue(element.id, e.currentTarget.textContent || "")}
            onBlur={onSaveInlineEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onCancelInlineEdit();
              }
            }}
            className={`cursor-text hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 outline-none whitespace-pre-wrap ${editingElementId === element.id ? "ring-2 ring-blue-500 bg-blue-50/40" : ""}`}
          >
            {paragraphText}
          </div>
        );
      }

      case "button": {
        const buttonText = getElementTextValue(element, "Button");
        return (
          <button
            type="button"
            style={{
              ...editorInlineStyles,
              backgroundColor: styles.colors?.background,
              color: styles.colors?.text,
              padding: styles.spacing?.top ? `${styles.spacing.top} ${styles.spacing.right} ${styles.spacing.bottom} ${styles.spacing.left}` : "12px 24px",
              borderRadius: styles.border?.radius,
              border: `${styles.border?.width || "1px"} ${styles.border?.style || "solid"} ${styles.border?.color || "transparent"}`,
              fontSize: styles.typography?.fontSize,
              fontWeight: styles.typography?.fontWeight,
            }}
            className={`cursor-text hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 outline-none ${editingElementId === element.id ? "ring-2 ring-blue-500 bg-blue-50/40" : ""}`}
          >
            <span
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onFocus={() => onInlineEdit(element.id, buttonText)}
              onInput={(e) => updateElementTextValue(element.id, e.currentTarget.textContent || "")}
              onBlur={onSaveInlineEdit}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelInlineEdit();
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveInlineEdit();
                }
              }}
              className="outline-none"
            >
              {buttonText}
            </span>
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
                borderRadius: styles.border?.radius,
                boxShadow: styles.effects?.boxShadow,
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
              borderColor: styles.colors?.border || "#e5e5e5",
              borderWidth: styles.border?.width || "1px",
              margin: `${styles.spacing?.top || "16px"} 0 ${styles.spacing?.bottom || "16px"}`,
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
            style={{
              ...editorInlineStyles,
              backgroundColor: styles.colors?.background || "#ffffff",
              padding: `${styles.spacing?.top || "60px"} ${styles.spacing?.right || "0"} ${styles.spacing?.bottom || "60px"} ${styles.spacing?.left || "0"}`,
              margin: `${styles.spacing?.marginTop || "0"} ${styles.spacing?.marginRight || "0"} ${styles.spacing?.marginBottom || "0"} ${styles.spacing?.marginLeft || "0"}`,
              borderRadius: styles.border?.radius,
            }}
          >
            {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
            {element.children?.map((child: any) => (
              <ElementRenderer
                key={child.id}
                element={child}
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
            style={{
              ...editorInlineStyles,
              width: `${element.width || 100}%`,
              padding: `${styles.spacing?.top || "0"} ${styles.spacing?.right || "12px"} ${styles.spacing?.bottom || "0"} ${styles.spacing?.left || "12px"}`,
            }}
          >
            {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
            {element.children?.map((child: any) => (
              <ElementRenderer
                key={child.id}
                element={child}
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
          props: content.props || {},
          styleOverrides: templateStyleOverrides,
        };
        return (
          <div 
            className={`w-full relative group transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'}`}
            data-element-id={element.id}
            style={editorInlineStyles}
            onClickCapture={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onContextMenu) {
                onContextMenu(e, element.id);
              }
            }}
          >
            {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
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
          props: content.props || {},
          styleOverrides: templateStyleOverrides,
        };
        return (
          <div 
            className={`w-full relative group transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'}`}
            data-element-id={element.id}
            onClickCapture={(e) => {
              e.stopPropagation();
              onSelect();
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

      // Dynamic fallback: if the type exists in ALL_TEMPLATE_BLOCKS, render it
      default:
        if (ALL_TEMPLATE_BLOCKS[element.type]) {
          const dynamicTemplateBlock: TemplateBlock = {
            id: element.id,
            type: element.type,
            props: content.props || content || {},
            styleOverrides: templateStyleOverrides,
          };
          
          return (
            <div 
              className={`w-full relative group transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'}`}
              data-element-id={element.id}
              style={editorInlineStyles}
              onClickCapture={(e) => {
                console.log("Template block onClickCapture - element.id:", element.id, "element.type:", element.type);
                console.log("Calling onSelect...");
                e.stopPropagation();
                onSelect();
                console.log("onSelect called");
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onContextMenu) {
                  onContextMenu(e, element.id);
                }
              }}
            >
              {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
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
      className={`group relative border-2 transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
          onContextMenu(e, element.id);
        }
      }}
      data-element-id={element.id}
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

      {/* Render children if any (for nested elements) */}
      {(element.children || element.columns)?.map((child: any) => (
        <ElementRenderer
          key={child.id}
          element={child}
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
