// ─── VISUAL EDITOR CORE TYPES ─────────────────────────────────────

export type DeviceType = "desktop" | "tablet" | "mobile";
export type TabType = "content" | "style" | "advanced";

// Element hierarchy types
export type ElementType = 
  // Structural
  | "section" 
  | "column"
  | "container"
  // Basic
  | "heading"
  | "text"
  | "paragraph"
  | "button"
  | "link"
  | "image"
  | "icon"
  | "divider"
  | "spacer"
  // Layout
  | "grid"
  | "flex"
  | "tabs"
  | "accordion"
  // Media
  | "video"
  | "gallery"
  | "slider"
  | "carousel"
  // Forms
  | "form"
  | "input"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  // Commerce
  | "product"
  | "products"
  | "cart"
  | "checkout"
  // Social
  | "social-share"
  | "social-follow"
  | "testimonial"
  | "reviews"
  // Marketing
  | "countdown"
  | "progress-bar"
  | "cta"
  | "popup"
  | "embed"
  // Advanced
  | "html"
  | "shortcode"
  | "widget";

// Element category for widget library
export type ElementCategory = 
  | "basic"
  | "layout"
  | "media"
  | "forms"
  | "commerce"
  | "social"
  | "marketing"
  | "advanced";

// Base element interface
export interface BaseElement {
  id: string;
  type: ElementType;
  parentId: string | null;
  order: number;
  visible: boolean;
  locked: boolean;
  name: string;
  settings: ElementSettings;
  styles: ElementStyles;
  responsiveStyles: ResponsiveStyles;
}

// Section/Container specific
export interface SectionElement extends BaseElement {
  type: "section" | "container";
  layout: "boxed" | "full-width";
  columns: ColumnElement[];
  backgroundColor: string;
  backgroundImage?: string;
  backgroundType: "color" | "gradient" | "image" | "video";
  padding: Spacing;
  margin: Spacing;
  border: Border;
  borderRadius: string;
  boxShadow: string;
}

// Column specific
export interface ColumnElement extends BaseElement {
  type: "column";
  width: string; // percentage or fraction
  widthMobile?: string;
  widthTablet?: string;
  gap: string;
  padding: Spacing;
  children: BaseElement[];
}

// Widget/Element specific
export interface WidgetElement extends BaseElement {
  type: Exclude<ElementType, "section" | "column" | "container">;
  content?: Record<string, any>;
  children?: BaseElement[];
}

// Union type for all elements
export type Element = SectionElement | ColumnElement | WidgetElement;

// Settings structure
export interface ElementSettings {
  [key: string]: any;
}

// Styles structure
export interface ElementStyles {
  typography?: Typography;
  colors?: ColorSettings;
  spacing?: Spacing;
  border?: Border;
  background?: BackgroundSettings;
  effects?: Effects;
  position?: PositionSettings;
  animation?: AnimationSettings;
}

// Responsive styles
export interface ResponsiveStyles {
  desktop?: Partial<ElementStyles>;
  tablet?: Partial<ElementStyles>;
  mobile?: Partial<ElementStyles>;
}

// Typography settings
export interface Typography {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: "left" | "center" | "right" | "justify";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  color: string;
}

// Color settings
export interface ColorSettings {
  text: string;
  background: string;
  border: string;
  link?: string;
  linkHover?: string;
}

// Spacing settings
export interface Spacing {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

// Border settings
export interface Border {
  width: string;
  style: "solid" | "dashed" | "dotted" | "double" | "none";
  color: string;
  radius: string;
}

// Background settings
export interface BackgroundSettings {
  type: "color" | "gradient" | "image" | "video";
  color: string;
  gradient?: string;
  image?: string;
  video?: string;
  overlay?: string;
  overlayOpacity?: number;
  position: string;
  size: string;
  repeat: string;
  attachment: string;
}

// Effects settings
export interface Effects {
  boxShadow: string;
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

// Position settings
export interface PositionSettings {
  type: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
}

// Animation settings
export interface AnimationSettings {
  entrance: string;
  duration: string;
  delay: string;
  iteration: string;
  direction: string;
  timingFunction: string;
}

// Page structure
export interface PageStructure {
  id: string;
  title: string;
  slug: string;
  elements: any[];
  settings: PageSettings;
  meta: PageMeta;
  createdAt: string;
  updatedAt: string;
}

// Page settings
export interface PageSettings {
  layout: "default" | "full-width" | "canvas";
  hideTitle: boolean;
  customCss: string;
  customJs: string;
  padding: Spacing;
  margin: Spacing;
  backgroundColor: string;
  backgroundImage?: string;
}

// Page meta
export interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

// Widget definition for library
export interface WidgetDefinition {
  type: ElementType;
  category: ElementCategory;
  name: string;
  description: string;
  icon: string;
  defaultSettings: ElementSettings;
  defaultStyles: ElementStyles;
  hasChildren: boolean;
  allowedChildTypes?: ElementType[];
  editableContent: boolean;
}

// Editor state
export interface EditorState {
  pageId: string;
  siteId: string;
  pageStructure: PageStructure;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  device: DeviceType;
  activeTab: TabType;
  sidebarPanel: SidebarPanel;
  isNavigatorOpen: boolean;
  isTemplateLibraryOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  darkMode: boolean;
}

// Sidebar panels
export type SidebarPanel = 
  | "widgets"
  | "settings"
  | "page-settings"
  | "navigator"
  | "history"
  | "global-settings";

// History state
export interface HistoryState {
  past: PageStructure[];
  present: PageStructure;
  future: PageStructure[];
}

// Drag and drop state
export interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  dropTargetId: string | null;
  dropPosition: "before" | "after" | "inside" | null;
}

// Template library item
export interface TemplateItem {
  id: string;
  type: "block" | "page" | "section";
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  content: Element[];
  isFavorite: boolean;
  isPro: boolean;
}

// Context menu item
export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
  separator?: boolean;
}
