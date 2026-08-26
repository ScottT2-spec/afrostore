"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  EditorState, 
  PageStructure, 
  Element, 
  HistoryState,
  DeviceType,
  TabType,
  SidebarPanel 
} from "./types";

interface EditorStore extends EditorState {
  history: HistoryState;
  clipboardElement: Element | null;
  // Actions
  setPageStructure: (structure: PageStructure) => void;
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  setDevice: (device: DeviceType) => void;
  setActiveTab: (tab: TabType) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setNavigatorOpen: (open: boolean) => void;
  setTemplateLibraryOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  
  // Element actions
  addElement: (element: Element, parentId?: string | null, index?: number) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  copyElementToClipboard: (id: string) => void;
  pasteElement: () => void;
  moveElement: (id: string, newParentId: string | null, newIndex: number) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  
  // Page actions
  updatePageSettings: (settings: Partial<PageStructure["settings"]>) => void;
  updatePageMeta: (meta: Partial<PageStructure["meta"]>) => void;
  
  // Save actions
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  setDirty: (dirty: boolean) => void;
  
  // Initialize
  initialize: (pageStructure: PageStructure, siteId: string) => void;
  reset: () => void;
}

const MAX_HISTORY = 50;

export const getNestedChildren = (element: any): any[] | null => {
  if (Array.isArray(element?.elements)) return element.elements;
  if (Array.isArray(element?.children)) return element.children;
  if (Array.isArray(element?.columns)) return element.columns;
  return null;
};

const setNestedChildren = (element: any, children: any[]) => {
  if (Array.isArray(element?.elements)) return { ...element, elements: children };
  if (Array.isArray(element?.children)) return { ...element, children };
  if (Array.isArray(element?.columns)) return { ...element, columns: children };
  return { ...element, elements: children };
};

// Deep-clones an element with a fresh id for itself AND every nested child —
// duplicateElement previously only regenerated the top-level id, so
// duplicating any container (columns, nested sections) left two elements
// sharing the same child ids (React key collisions, and updateElement/
// deleteElement editing whichever occurrence they found first).
const cloneWithNewIds = (element: Element): Element => {
  const cloned: any = { ...element, id: crypto.randomUUID() };
  const children = getNestedChildren(element as any);
  if (children.length > 0) {
    return setNestedChildren(cloned, children.map((c: any) => cloneWithNewIds(c))) as Element;
  }
  return cloned;
};

const findElementPath = (elements: Element[], targetId: string, trail: Element[] = []): Element[] | null => {
  for (const el of elements) {
    const nextTrail = [...trail, el];
    if (el.id === targetId) {
      return nextTrail;
    }

    const nested = getNestedChildren(el);
    if (nested) {
      const found = findElementPath(nested as Element[], targetId, nextTrail);
      if (found) return found;
    }
  }
  return null;
};

const createEmptyPageStructure = (pageId: string): PageStructure => ({
  id: pageId,
  title: "Untitled Page",
  slug: "untitled",
  elements: [],
  settings: {
    layout: "default",
    hideTitle: false,
    customCss: "",
    customJs: "",
    padding: { top: "0", right: "0", bottom: "0", left: "0" },
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    backgroundColor: "#ffffff",
  },
  meta: {
    title: "Untitled Page",
    description: "",
    keywords: "",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const initialState: EditorState = {
  pageId: "",
  siteId: "",
  pageStructure: createEmptyPageStructure(""),
  selectedElementId: null,
  hoveredElementId: null,
  device: "desktop",
  activeTab: "content",
  sidebarPanel: "widgets",
  isNavigatorOpen: false,
  isTemplateLibraryOpen: false,
  canUndo: false,
  canRedo: false,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  darkMode: false,
};

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    clipboardElement: null,
    
    setPageStructure: (structure) => {
      set({ pageStructure: structure, isDirty: true });
    },
    
    setSelectedElementId: (id) => {
      set({ selectedElementId: id });
    },
    
    setHoveredElementId: (id) => {
      set({ hoveredElementId: id });
    },
    
    setDevice: (device) => {
      set({ device });
    },
    
    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },
    
    setSidebarPanel: (panel) => {
      set({ sidebarPanel: panel });
    },
    
    setNavigatorOpen: (open) => {
      set({ isNavigatorOpen: open });
    },
    
    setTemplateLibraryOpen: (open) => {
      set({ isTemplateLibraryOpen: open });
    },
    
    setDarkMode: (dark) => {
      set({ darkMode: dark });
    },
    
    addElement: (element, parentId = null, index) => {
      const { pageStructure, pushHistory } = get();
      pushHistory();
      
      const newElements = [...pageStructure.elements];
      
      if (parentId) {
        const addToParent = (elements: Element[]): Element[] => {
          return elements.map(el => {
            if (el.id === parentId) {
              const nestedChildren = getNestedChildren(el);
              if (Array.isArray((el as any).columns)) {
                if (element.type === "column") {
                  const columns = [...((el as any).columns || [])];
                  if (typeof index === "number") {
                    columns.splice(index, 0, element);
                  } else {
                    columns.push(element);
                  }
                  return { ...el, columns };
                }

                const columns = [...((el as any).columns || [])];
                if (columns.length === 0) {
                  const firstColumn = {
                    id: crypto.randomUUID(),
                    type: "column" as const,
                    parentId: el.id,
                    order: 0,
                    visible: true,
                    locked: false,
                    name: "Column",
                    settings: {},
                    styles: {},
                    responsiveStyles: {},
                    width: "100",
                    gap: "24",
                    padding: { top: "0", right: "0", bottom: "0", left: "0" },
                    children: [element],
                  };
                  return { ...el, columns: [firstColumn] };
                }

                const targetColumn = { ...(columns[0] as any) };
                const children = [...(targetColumn.children || [])];
                if (typeof index === "number") {
                  children.splice(index, 0, element);
                } else {
                  children.push(element);
                }
                targetColumn.children = children;
                columns[0] = targetColumn;
                return { ...el, columns };
              }

              const newChildren = [...(nestedChildren || [])];
              if (typeof index === "number") {
                newChildren.splice(index, 0, element);
              } else {
                newChildren.push(element);
              }
              return setNestedChildren(el, newChildren);
            }
            const nested = getNestedChildren(el);
            if (nested) {
              return setNestedChildren(el, addToParent(nested as Element[]));
            }
            return el;
          });
        };
        set({ 
          pageStructure: { 
            ...pageStructure, 
            elements: addToParent(newElements),
            updatedAt: new Date().toISOString()
          },
          isDirty: true,
          selectedElementId: element.id
        });
      } else {
        // Add to root
        if (typeof index === "number") {
          newElements.splice(index, 0, element);
        } else {
          newElements.push(element);
        }
        set({ 
          pageStructure: { 
            ...pageStructure, 
            elements: newElements,
            updatedAt: new Date().toISOString()
          },
          isDirty: true,
          selectedElementId: element.id
        });
      }
    },
    
    updateElement: (id, updates) => {
      const { pageStructure, pushHistory } = get();
      pushHistory();
      
      const deepMerge = (target: any, source: any): any => {
        if (!source) return target;
        const result = { ...target };
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
        return result;
      };
      
      const updateInTree = (elements: Element[]): Element[] => {
        return elements.map(el => {
          if (el.id === id) {
            return deepMerge(el, updates);
          }
          const nested = getNestedChildren(el);
          if (nested) {
            return setNestedChildren(el, updateInTree(nested as Element[]));
          }
          return el;
        });
      };
      
      set({ 
        pageStructure: { 
          ...pageStructure, 
          elements: updateInTree(pageStructure.elements),
          updatedAt: new Date().toISOString()
        },
        isDirty: true
      });
    },
    
    deleteElement: (id) => {
      const { pageStructure, pushHistory, selectedElementId } = get();
      pushHistory();
      
      const deleteFromTree = (elements: Element[]): Element[] => {
        return elements.filter(el => {
          if (el.id === id) return false;
          return true;
        }).map(el => {
          const nested = getNestedChildren(el);
          if (nested) {
            return setNestedChildren(el, deleteFromTree(nested as Element[]));
          }
          return el;
        });
      };
      
      set({ 
        pageStructure: { 
          ...pageStructure, 
          elements: deleteFromTree(pageStructure.elements),
          updatedAt: new Date().toISOString()
        },
        isDirty: true,
        selectedElementId: selectedElementId === id ? null : selectedElementId
      });
    },
    
    duplicateElement: (id) => {
      const { pageStructure, pushHistory, addElement } = get();
      pushHistory();
      
      const findAndClone = (elements: Element[]): Element | null => {
        for (const el of elements) {
          if (el.id === id) {
            return JSON.parse(JSON.stringify(el));
          }
          const nested = getNestedChildren(el);
          if (nested) {
            const found = findAndClone(nested as Element[]);
            if (found) return found;
          }
        }
        return null;
      };
      
      const cloned = findAndClone(pageStructure.elements);
      if (cloned) {
        addElement(cloneWithNewIds(cloned));
      }
    },

    copyElementToClipboard: (id) => {
      const { pageStructure } = get();
      const findEl = (elements: Element[]): Element | null => {
        for (const el of elements) {
          if (el.id === id) return JSON.parse(JSON.stringify(el));
          const nested = getNestedChildren(el);
          if (nested) {
            const found = findEl(nested as Element[]);
            if (found) return found;
          }
        }
        return null;
      };
      const el = findEl(pageStructure.elements);
      if (el) set({ clipboardElement: el });
    },

    pasteElement: () => {
      const { clipboardElement, addElement, pushHistory } = get();
      if (!clipboardElement) return;
      pushHistory();
      addElement(cloneWithNewIds(clipboardElement));
    },
    
    moveElement: (id, newParentId, newIndex) => {
      const { pageStructure, pushHistory } = get();
      pushHistory();
      
      // Find and remove element
      let movedElement: Element | null = null;
      const removeFromTree = (elements: Element[]): Element[] => {
        return elements.filter(el => {
          if (el.id === id) {
            movedElement = el;
            return false;
          }
          return true;
        }).map(el => {
          const nested = getNestedChildren(el);
          if (nested) {
            return setNestedChildren(el, removeFromTree(nested as Element[]));
          }
          return el;
        });
      };
      
      const elementsWithoutMoved = removeFromTree(pageStructure.elements);
      
      if (!movedElement) return;
      
      // Add to new location
      const addToTree = (elements: Element[]): Element[] => {
        if (!newParentId) {
          const newElements = [...elements];
          if (typeof newIndex === "number") {
            newElements.splice(newIndex, 0, movedElement!);
          } else {
            newElements.push(movedElement!);
          }
          return newElements;
        }

        return elements.map(el => {
          if (el.id === newParentId) {
            if ((el as any).columns) {
              const columns = [...((el as any).columns || [])];
              if (movedElement!.type === "column") {
                if (typeof newIndex === "number") {
                  columns.splice(newIndex, 0, movedElement!);
                } else {
                  columns.push(movedElement!);
                }
                return { ...el, columns };
              }
              const targetColumn = columns[0];
              if (!targetColumn) return el;
              const children = [...((targetColumn as any).children || [])];
              if (typeof newIndex === "number") {
                children.splice(newIndex, 0, movedElement!);
              } else {
                children.push(movedElement!);
              }
              columns[0] = { ...targetColumn, children };
              return { ...el, columns };
            }
            const nestedChildren = getNestedChildren(el) || [];
            const newChildren = [...nestedChildren];
            if (typeof newIndex === "number") {
              newChildren.splice(newIndex, 0, movedElement!);
            } else {
              newChildren.push(movedElement!);
            }
            return setNestedChildren(el, newChildren);
          }
          const nested = getNestedChildren(el);
          if (nested) {
            return setNestedChildren(el, addToTree(nested as Element[]));
          }
          return el;
        });
      };
      
      set({ 
        pageStructure: { 
          ...pageStructure, 
          elements: addToTree(elementsWithoutMoved),
          updatedAt: new Date().toISOString()
        },
        isDirty: true
      });
    },
    
    // History management
    history: {
      past: [],
      present: createEmptyPageStructure(""),
      future: [],
    },
    
    undo: () => {
      const state = get();
      const { history } = state as any;
      
      if (history.past.length === 0) return;
      
      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);
      
      set({
        history: {
          past: newPast,
          present: previous,
          future: [history.present, ...history.future],
        },
        pageStructure: previous,
        canUndo: newPast.length > 0,
        canRedo: true,
        isDirty: true,
      });
    },
    
    redo: () => {
      const state = get();
      const { history } = state as any;
      
      if (history.future.length === 0) return;
      
      const next = history.future[0];
      const newFuture = history.future.slice(1);
      
      set({
        history: {
          past: [...history.past, history.present],
          present: next,
          future: newFuture,
        },
        pageStructure: next,
        canUndo: true,
        canRedo: newFuture.length > 0,
        isDirty: true,
      });
    },
    
    pushHistory: () => {
      const state = get();
      const { history } = state as any;
      
      const newPast = [...history.past, history.present].slice(-MAX_HISTORY);
      
      set({
        history: {
          past: newPast,
          present: state.pageStructure,
          future: [],
        },
        canUndo: newPast.length > 0,
        canRedo: false,
      });
    },
    
    updatePageSettings: (settings) => {
      const { pageStructure, pushHistory } = get();
      pushHistory();
      
      set({
        pageStructure: {
          ...pageStructure,
          settings: { ...pageStructure.settings, ...settings },
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      });
    },
    
    updatePageMeta: (meta) => {
      const { pageStructure, pushHistory } = get();
      pushHistory();
      
      set({
        pageStructure: {
          ...pageStructure,
          meta: { ...pageStructure.meta, ...meta },
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      });
    },
    
    setSaving: (saving) => {
      set({ isSaving: saving });
    },
    
    markSaved: () => {
      set({ 
        isDirty: false, 
        lastSavedAt: new Date().toISOString(),
        isSaving: false
      });
    },
    
    setDirty: (dirty) => {
      console.log("setDirty called with:", dirty);
      set({ isDirty: dirty });
    },
    
    initialize: (pageStructure, siteId) => {
      set({
        pageId: pageStructure.id,
        siteId,
        pageStructure,
        selectedElementId: null,
        hoveredElementId: null,
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
        history: {
          past: [],
          present: pageStructure,
          future: [],
        },
        canUndo: false,
        canRedo: false,
      });
    },
    
    reset: () => {
      set(initialState);
    },
  }))
);

// Helper hooks
export const useSelectedElement = () => {
  const { pageStructure, selectedElementId } = useEditorStore();
  
  if (!selectedElementId) return null;
  
  const findElement = (elements: Element[]): Element | null => {
    for (const el of elements) {
      if (el.id === selectedElementId) return el;
      const nested = getNestedChildren(el);
      if (nested) {
        const found = findElement(nested as Element[]);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findElement(pageStructure.elements);
};

export const useSelectedElementPath = () => {
  const { pageStructure, selectedElementId } = useEditorStore();

  if (!selectedElementId) return [];
  return findElementPath(pageStructure.elements, selectedElementId) || [];
};

export const useElementById = (id: string | null) => {
  const { pageStructure } = useEditorStore();
  if (!id) return null;
  return findElementByIdInTree(pageStructure.elements, id);
};

// Plain (non-hook) version of the same lookup, callable from outside React
// render — needed by commitTextUpdate in InlineEditableText.tsx, which
// must read a node's CURRENT full settings before writing a single field,
// rather than starting from an empty object (see findElementByIdInTree
// usage there for why).
export function findElementByIdInTree(elements: Element[], id: string): Element | null {
  for (const el of elements) {
    if (el.id === id) return el;
    const nested = getNestedChildren(el);
    if (nested) {
      const found = findElementByIdInTree(nested as Element[], id);
      if (found) return found;
    }
  }
  return null;
}
