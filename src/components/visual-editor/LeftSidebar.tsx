"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/visual-editor/store";
import { 
  LayoutGrid, 
  Settings, 
  Search,
  ChevronDown,
  ChevronRight,
  X,
  LayoutTemplate,
  Loader2,
  Plus
} from "lucide-react";
import { elementCategories, categoryLabels, widgetDefinitions, createElementFromWidget } from "@/lib/visual-editor/widgets";
import { ElementCategory, ElementType } from "@/lib/visual-editor/types";
import { api } from "@/lib/api-client";
import { THEME_BLOCK_GROUPS, BLOCK_TYPE_TO_THEME } from "@/components/storefront/TemplateBlockRenderer";
import { EDITOR_SIMPLE_MODE } from "@/lib/visual-editor/editorMode";
import {
  Type, FileText, MousePointer, Image, Star, Minus, MoveVertical,
  Layout, Columns, Box, Grid3X3, AlignHorizontalJustifyCenter,
  Video, Images, ChevronLeftCircle, FileInput, TextCursorInput, AlignLeft,
  ShoppingBag, ShoppingCart, Share2, UserPlus, MessageCircle,
  Clock, Megaphone, Gauge, Code2, Code, Brackets,
  Link, Layers, NotebookTabs,
} from "lucide-react";

type SidebarPanel = "widgets" | "sections" | "page-settings" | "global-settings";

// "kidsBlogPosts" -> "Blog Posts", "fashionHeroSlider" -> "Hero Slider".
// Purely cosmetic (label generation for the picker), so a best-effort
// split is fine here even though it isn't reliable enough to use for
// the actual theme-matching logic above.
function humanizeBlockType(type: string, themeKey: string): string {
  const withoutPrefix = type.toLowerCase().startsWith(themeKey.toLowerCase())
    ? type.slice(themeKey.length)
    : type;
  const spaced = withoutPrefix.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const label = spaced.charAt(0).toUpperCase() + spaced.slice(1);
  return label.trim() || type;
}

export default function LeftSidebar() {
  const router = useRouter();
  // Default to "sections" (pre-built, populated content blocks) rather than
  // "widgets" (blank building blocks). A merchant's first click into the
  // editor should land on something that already looks like a real page
  // section, not an empty box — reduces blank-canvas paralysis. All four
  // tabs remain fully available and one click away either way.
  const [activePanel, setActivePanel] = useState<SidebarPanel>("sections");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<ElementCategory>>(
    new Set(elementCategories)
  );
  const [pages, setPages] = useState<Array<{ id: string; title: string; slug: string; type?: string; isPublished?: boolean; position?: number }>>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [addingSectionType, setAddingSectionType] = useState<string | null>(null);
  const [expandedThemeGroups, setExpandedThemeGroups] = useState<Set<string>>(new Set());
  const { siteId, pageId, pageStructure } = useEditorStore();

  // Detect which theme this site is actually using by looking at the
  // block types already present on the current page, rather than
  // trusting metadata that was never guaranteed to match the rendered
  // blocks. Falls back to null (shows every theme) if this page is
  // empty or built entirely from basic widgets.
  const detectedThemeKey = useMemo(() => {
    const findThemeInNodes = (nodes: any[] | undefined): string | null => {
      if (!Array.isArray(nodes)) return null;
      for (const node of nodes) {
        if (!node) continue;
        const theme = BLOCK_TYPE_TO_THEME[node.type];
        if (theme) return theme;
        const nested =
          findThemeInNodes(node.elements) ||
          findThemeInNodes(node.children) ||
          findThemeInNodes(node.columns);
        if (nested) return nested;
      }
      return null;
    };
    return findThemeInNodes(pageStructure?.elements);
  }, [pageStructure?.elements]);

  const toggleThemeGroup = (key: string) => {
    setExpandedThemeGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAddSection = async (blockType: string) => {
    if (addingSectionType) return;
    setAddingSectionType(blockType);
    try {
      const res = await api.get<{ found: boolean; settings: any; content: any }>(`/api/template-blocks/${blockType}/example`);
      const settings = res.success && res.data ? res.data.settings || {} : {};
      const content = res.success && res.data ? res.data.content || {} : {};

      const themeKey = BLOCK_TYPE_TO_THEME[blockType] || "";
      const newElement: any = {
        id: crypto.randomUUID(),
        type: blockType,
        parentId: null,
        order: 0,
        visible: true,
        locked: false,
        name: humanizeBlockType(blockType, themeKey),
        settings,
        content,
        styles: {},
        responsiveStyles: {},
      };
      useEditorStore.getState().addElement(newElement);
    } finally {
      setAddingSectionType(null);
    }
  };

  const toggleCategory = (category: ElementCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAddWidget = (type: ElementType) => {
    const findElementByIdDeep = (elements: any[], id: string): any => {
      for (const el of elements) {
        if (el.id === id) return el;
        const nested = el.elements || el.children || el.columns;
        if (Array.isArray(nested)) {
          const found = findElementByIdDeep(nested, id);
          if (found) return found;
        }
      }
      return null;
    };
    const newElement = createElementFromWidget(type);
    if (!newElement) return;
    const { pageStructure, selectedElementId } = useEditorStore.getState();
    const selected = selectedElementId ? findElementByIdDeep(pageStructure.elements, selectedElementId) : null;
    const canNest = selected && (Array.isArray((selected as any).elements) || Array.isArray((selected as any).children) || Array.isArray((selected as any).columns));
    useEditorStore.getState().addElement(newElement, canNest ? selected!.id : null);
    useEditorStore.getState().setSelectedElementId(newElement.id);
    requestAnimationFrame(() => {
      document.querySelector(`[data-editor-node-id="${newElement.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;

    (async () => {
      setLoadingPages(true);
      const res = await api.get<{ pages: Array<{ id: string; title: string; slug: string; type?: string; isPublished?: boolean; position?: number }> }>(`/api/sites/${siteId}/pages?limit=100`);
      if (!cancelled && res.success && res.data?.pages) {
        setPages(res.data.pages);
      }
      if (!cancelled) setLoadingPages(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const filteredWidgets = widgetDefinitions.filter(widget =>
    widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPage = useMemo(() => pages.find((page) => page.id === pageId) || null, [pages, pageId]);

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Panel Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {!EDITOR_SIMPLE_MODE && (
          <button
            type="button"
            onClick={() => setActivePanel("widgets")}
            className={`flex-1 min-w-max px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              activePanel === "widgets" 
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Add Element
          </button>
        )}
        <button
          type="button"
          onClick={() => setActivePanel("sections")}
          className={`flex-1 min-w-max px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
            activePanel === "sections" 
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
          Sections
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("page-settings")}
          className={`flex-1 min-w-max px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
            activePanel === "page-settings" 
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Settings className="h-4 w-4" />
          Pages
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("global-settings")}
          className={`flex-1 min-w-max px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
            activePanel === "global-settings" 
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Settings className="h-4 w-4" />
          Global
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {!EDITOR_SIMPLE_MODE && activePanel === "widgets" && (
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

              {/* Widget Categories */}
              {searchQuery ? (
              // Show filtered results
              <div className="space-y-2">
                {filteredWidgets.map((widget) => {
                  const Icon = getIconForWidget(widget.type);
                  return (
                    <button
                      key={widget.type}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData("application/x-afro-widget", widget.type);
                        e.dataTransfer.setData("text/plain", widget.type);
                      }}
                      onClick={() => handleAddWidget(widget.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-left"
                    >
                      <div className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {widget.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {widget.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {filteredWidgets.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No widgets found
                  </p>
                )}
              </div>
            ) : (
              // Show categories
              <div className="space-y-4">
                {elementCategories.map((category) => {
                  const categoryWidgets = widgetDefinitions.filter(w => w.category === category);
                  if (categoryWidgets.length === 0) return null;

                  const isExpanded = expandedCategories.has(category);

                  return (
                    <div key={category}>
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <span>{categoryLabels[category]}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {categoryWidgets.map((widget) => {
                            const Icon = getIconForWidget(widget.type);
                            return (
                              <button
                                key={widget.type}
                                type="button"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = "copy";
                                  e.dataTransfer.setData("application/x-afro-widget", widget.type);
                                  e.dataTransfer.setData("text/plain", widget.type);
                                }}
                                onClick={() => handleAddWidget(widget.type)}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                              >
                                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-xs font-medium text-gray-900 dark:text-white text-center">
                                  {widget.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activePanel === "sections" && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Sections
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pre-built sections matching your store&apos;s theme
                {detectedThemeKey && THEME_BLOCK_GROUPS[detectedThemeKey] ? ` (${THEME_BLOCK_GROUPS[detectedThemeKey].label})` : ""}.
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(THEME_BLOCK_GROUPS)
                .filter(([, group]) => group.types.length > 0)
                // Show the detected theme's own sections first, so a
                // merchant on e.g. a Fashion store isn't stuck scrolling
                // past 20 unrelated theme groups to find their own.
                .sort(([keyA], [keyB]) => {
                  if (keyA === detectedThemeKey) return -1;
                  if (keyB === detectedThemeKey) return 1;
                  return 0;
                })
                .map(([themeKey, group]) => {
                  const isExpanded = expandedThemeGroups.has(themeKey) || (themeKey === detectedThemeKey && expandedThemeGroups.size === 0);
                  return (
                    <div key={themeKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleThemeGroup(themeKey)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span>{group.label}{themeKey === detectedThemeKey ? " (your theme)" : ""}</span>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {isExpanded && (
                        <div className="p-2 space-y-1.5 bg-gray-50 dark:bg-gray-800/50">
                          {group.types.map((blockType) => (
                            <button
                              key={blockType}
                              type="button"
                              disabled={addingSectionType === blockType}
                              onClick={() => handleAddSection(blockType)}
                              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors disabled:opacity-50"
                            >
                              <span className="truncate">{humanizeBlockType(blockType, themeKey)}</span>
                              {addingSectionType === blockType ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activePanel === "page-settings" && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Site Pages
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currentPage ? `Editing: ${currentPage.title}` : "Select a page to edit"}
              </p>
            </div>
            <div className="space-y-2">
              {loadingPages ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading pages...</p>
              ) : pages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No pages found for this site.</p>
              ) : (
                pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => router.push(`/editor/${page.id}`)}
                    className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
                      page.id === pageId
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{page.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">/{page.slug}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        page.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}>
                        {page.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activePanel === "global-settings" && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Global Settings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Branding, logo, colors, currency, and other site-wide settings apply to every page on this site and are managed from the site customizer.
            </p>
            {siteId && (
              <button
                type="button"
                onClick={() => router.push(`/dashboard/sites/${siteId}/customize`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Open Site Customizer
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

// Get icon for widget type
function getIconForWidget(type: ElementType) {
  const iconMap: any = {
    heading: Type,
    text: FileText,
    paragraph: FileText,
    button: MousePointer,
    link: Link,
    image: Image,
    icon: Star,
    divider: Minus,
    spacer: MoveVertical,
    section: Layout,
    column: Columns,
    container: Box,
    grid: Grid3X3,
    flex: AlignHorizontalJustifyCenter,
    tabs: NotebookTabs,
    accordion: ChevronDown,
    video: Video,
    gallery: Images,
    slider: ChevronLeftCircle,
    carousel: Images,
    form: FileInput,
    input: TextCursorInput,
    textarea: AlignLeft,
    select: ChevronDown,
    checkbox: Search,
    radio: Search,
    product: ShoppingBag,
    products: ShoppingBag,
    cart: ShoppingCart,
    checkout: ShoppingCart,
    "social-share": Share2,
    "social-follow": UserPlus,
    testimonial: MessageCircle,
    reviews: Star,
    countdown: Clock,
    cta: Megaphone,
    "progress-bar": Gauge,
    popup: Layers,
    embed: Code2,
    html: Code,
    shortcode: Brackets,
    widget: Box,
  };

  return iconMap[type] || LayoutGrid;
}
