import type { CSSProperties } from "react";

export type EditorSettingValue = string | number | boolean;

export interface EditorNode {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  content?: Record<string, unknown>;
  elements?: EditorNode[];
}

export interface EditorContentTree {
  elements: EditorNode[];
  settings: Record<string, unknown>;
}

type StyleMapper = (value: EditorSettingValue) => Partial<CSSProperties>;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const createId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `node-${Math.random().toString(36).slice(2, 10)}`;
};

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return undefined;
};

const normalizeSettingValue = (value: unknown): EditorSettingValue | undefined => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return undefined;
};

const STYLE_MAP: Record<string, StyleMapper> = {
  backgroundColor: (value) => ({ backgroundColor: value as string }),
  textColor: (value) => ({ color: value as string }),
  color: (value) => ({ color: value as string }),
  fontFamily: (value) => ({ fontFamily: value as string }),
  fontSize: (value) => ({ fontSize: value as string }),
  fontWeight: (value) => ({ fontWeight: value as CSSProperties["fontWeight"] }),
  fontStyle: (value) => ({ fontStyle: value as CSSProperties["fontStyle"] }),
  lineHeight: (value) => ({ lineHeight: value as string }),
  letterSpacing: (value) => ({ letterSpacing: value as string }),
  textAlign: (value) => ({ textAlign: value as CSSProperties["textAlign"] }),
  textTransform: (value) => ({ textTransform: value as CSSProperties["textTransform"] }),
  textDecoration: (value) => ({ textDecoration: value as CSSProperties["textDecoration"] }),
  backgroundImage: (value) => ({ backgroundImage: `url(${value as string})` }),
  backgroundGradient: (value) => ({ backgroundImage: value as string }),
  backgroundSize: (value) => ({ backgroundSize: value as string }),
  backgroundPosition: (value) => ({ backgroundPosition: value as string }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value as CSSProperties["backgroundRepeat"] }),
  backgroundAttachment: (value) => ({ backgroundAttachment: value as CSSProperties["backgroundAttachment"] }),
  padding: (value) => ({ padding: value as string }),
  margin: (value) => ({ margin: value as string }),
  paddingTop: (value) => ({ paddingTop: value as string }),
  paddingRight: (value) => ({ paddingRight: value as string }),
  paddingBottom: (value) => ({ paddingBottom: value as string }),
  paddingLeft: (value) => ({ paddingLeft: value as string }),
  marginTop: (value) => ({ marginTop: value as string }),
  marginRight: (value) => ({ marginRight: value as string }),
  marginBottom: (value) => ({ marginBottom: value as string }),
  marginLeft: (value) => ({ marginLeft: value as string }),
  display: (value) => ({ display: value as CSSProperties["display"] }),
  flexDirection: (value) => ({ flexDirection: value as CSSProperties["flexDirection"] }),
  flexWrap: (value) => ({ flexWrap: value as CSSProperties["flexWrap"] }),
  justifyContent: (value) => ({ justifyContent: value as CSSProperties["justifyContent"] }),
  alignItems: (value) => ({ alignItems: value as CSSProperties["alignItems"] }),
  alignContent: (value) => ({ alignContent: value as CSSProperties["alignContent"] }),
  gap: (value) => ({ gap: value as string }),
  width: (value) => ({ width: value as string }),
  height: (value) => ({ height: value as string }),
  maxWidth: (value) => ({ maxWidth: value as string }),
  minHeight: (value) => ({ minHeight: value as string }),
  maxHeight: (value) => ({ maxHeight: value as string }),
  minWidth: (value) => ({ minWidth: value as string }),
  overflow: (value) => ({ overflow: value as CSSProperties["overflow"] }),
  position: (value) => ({ position: value as CSSProperties["position"] }),
  top: (value) => ({ top: value as string }),
  right: (value) => ({ right: value as string }),
  bottom: (value) => ({ bottom: value as string }),
  left: (value) => ({ left: value as string }),
  zIndex: (value) => ({ zIndex: value as number | "auto" }),
  borderStyle: (value) => ({ borderStyle: value as CSSProperties["borderStyle"] }),
  borderWidth: (value) => ({ borderWidth: value as string }),
  borderColor: (value) => ({ borderColor: value as string }),
  borderRadius: (value) => ({ borderRadius: value as string }),
  borderTopLeftRadius: (value) => ({ borderTopLeftRadius: value as string }),
  borderTopRightRadius: (value) => ({ borderTopRightRadius: value as string }),
  borderBottomLeftRadius: (value) => ({ borderBottomLeftRadius: value as string }),
  borderBottomRightRadius: (value) => ({ borderBottomRightRadius: value as string }),
  boxShadow: (value) => ({ boxShadow: value as string }),
  opacity: (value) => ({ opacity: typeof value === "number" ? value : Number(value) }),
  transform: (value) => ({ transform: value as string }),
  transitionDuration: (value) => ({ transitionDuration: value as string }),
  transitionTimingFunction: (value) => ({ transitionTimingFunction: value as string }),
  cursor: (value) => ({ cursor: value as CSSProperties["cursor"] }),
  objectFit: (value) => ({ objectFit: value as CSSProperties["objectFit"] }),
};

const HOVER_STYLE_MAP: Record<string, StyleMapper> = {
  hoverBackgroundColor: (value) => ({ backgroundColor: value as string }),
  hoverBackgroundImage: (value) => ({ backgroundImage: `url(${value as string})` }),
  hoverBackgroundGradient: (value) => ({ backgroundImage: value as string }),
  hoverBackgroundSize: (value) => ({ backgroundSize: value as string }),
  hoverBackgroundPosition: (value) => ({ backgroundPosition: value as string }),
  hoverBackgroundRepeat: (value) => ({ backgroundRepeat: value as CSSProperties["backgroundRepeat"] }),
  hoverBackgroundAttachment: (value) => ({ backgroundAttachment: value as CSSProperties["backgroundAttachment"] }),
  hoverTextColor: (value) => ({ color: value as string }),
  hoverColor: (value) => ({ color: value as string }),
  hoverFontFamily: (value) => ({ fontFamily: value as string }),
  hoverFontSize: (value) => ({ fontSize: value as string }),
  hoverFontWeight: (value) => ({ fontWeight: value as CSSProperties["fontWeight"] }),
  hoverFontStyle: (value) => ({ fontStyle: value as CSSProperties["fontStyle"] }),
  hoverLineHeight: (value) => ({ lineHeight: value as string }),
  hoverLetterSpacing: (value) => ({ letterSpacing: value as string }),
  hoverTextAlign: (value) => ({ textAlign: value as CSSProperties["textAlign"] }),
  hoverTextTransform: (value) => ({ textTransform: value as CSSProperties["textTransform"] }),
  hoverTextDecoration: (value) => ({ textDecoration: value as CSSProperties["textDecoration"] }),
  hoverBorderColor: (value) => ({ borderColor: value as string }),
  hoverBorderWidth: (value) => ({ borderWidth: value as string }),
  hoverBorderStyle: (value) => ({ borderStyle: value as CSSProperties["borderStyle"] }),
  hoverBorderRadius: (value) => ({ borderRadius: value as string }),
  hoverBorderTopLeftRadius: (value) => ({ borderTopLeftRadius: value as string }),
  hoverBorderTopRightRadius: (value) => ({ borderTopRightRadius: value as string }),
  hoverBorderBottomLeftRadius: (value) => ({ borderBottomLeftRadius: value as string }),
  hoverBorderBottomRightRadius: (value) => ({ borderBottomRightRadius: value as string }),
  hoverBoxShadow: (value) => ({ boxShadow: value as string }),
  hoverShadow: (value) => ({ boxShadow: value as string }),
  hoverOpacity: (value) => ({ opacity: typeof value === "number" ? value : Number(value) }),
  hoverWidth: (value) => ({ width: value as string }),
  hoverHeight: (value) => ({ height: value as string }),
  hoverMinWidth: (value) => ({ minWidth: value as string }),
  hoverMaxWidth: (value) => ({ maxWidth: value as string }),
  hoverMinHeight: (value) => ({ minHeight: value as string }),
  hoverMaxHeight: (value) => ({ maxHeight: value as string }),
  hoverOverflow: (value) => ({ overflow: value as CSSProperties["overflow"] }),
  hoverPosition: (value) => ({ position: value as CSSProperties["position"] }),
  hoverTop: (value) => ({ top: value as string }),
  hoverRight: (value) => ({ right: value as string }),
  hoverBottom: (value) => ({ bottom: value as string }),
  hoverLeft: (value) => ({ left: value as string }),
  hoverZIndex: (value) => ({ zIndex: value as number | "auto" }),
  hoverScale: (value) => ({ transform: `scale(${value as string | number})` }),
  hoverTransform: (value) => ({ transform: value as string }),
};

const PX_VALUE_KEYS = new Set([
  "fontSize",
  "letterSpacing",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "borderWidth",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "top",
  "right",
  "bottom",
  "left",
  "gap",
]);

const UNITLESS_NUMERIC_KEYS = new Set([
  "lineHeight",
  "fontWeight",
  "opacity",
  "zIndex",
]);

const TYPOGRAPHY_STYLE_KEYS = new Set([
  "color",
  "textColor",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
]);

const RESPONSIVE_KEY_ORDER = ["desktop", "tablet", "mobile"] as const;

const addStyle = (target: CSSProperties, patch: Partial<CSSProperties>) => {
  Object.assign(target, patch);
};

const normalizeCssValue = (key: string, value: unknown): EditorSettingValue | undefined => {
  const normalized = normalizeSettingValue(value);
  if (normalized === undefined) return undefined;

  if (typeof normalized === "number") {
    if (UNITLESS_NUMERIC_KEYS.has(key)) return normalized;
    if (PX_VALUE_KEYS.has(key)) return `${normalized}px`;
    return normalized;
  }

  if (typeof normalized !== "string") return normalized;

  const trimmed = normalized.trim();
  if (!trimmed) return undefined;

  if (UNITLESS_NUMERIC_KEYS.has(key)) return trimmed;
  if (PX_VALUE_KEYS.has(key) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }

  return trimmed;
};

const flattenLegacyStyles = (source: unknown): Record<string, EditorSettingValue> => {
  if (!isPlainObject(source)) return {};

  const settings: Record<string, EditorSettingValue> = {};

  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined) continue;

    if (key === "typography" && isPlainObject(value)) {
      const typography = value;
      const textColor = typography.color ?? typography.textColor;
      if (normalizeSettingValue(textColor) !== undefined) settings.textColor = normalizeSettingValue(textColor)!;
      if (normalizeSettingValue(typography.fontFamily) !== undefined) settings.fontFamily = normalizeSettingValue(typography.fontFamily)!;
      if (normalizeSettingValue(typography.fontSize) !== undefined) settings.fontSize = normalizeSettingValue(typography.fontSize)!;
      if (normalizeSettingValue(typography.fontWeight) !== undefined) settings.fontWeight = normalizeSettingValue(typography.fontWeight)!;
      if (normalizeSettingValue(typography.lineHeight) !== undefined) settings.lineHeight = normalizeSettingValue(typography.lineHeight)!;
      if (normalizeSettingValue(typography.letterSpacing) !== undefined) settings.letterSpacing = normalizeSettingValue(typography.letterSpacing)!;
      if (normalizeSettingValue(typography.textAlign) !== undefined) settings.textAlign = normalizeSettingValue(typography.textAlign)!;
      if (normalizeSettingValue(typography.textTransform) !== undefined) settings.textTransform = normalizeSettingValue(typography.textTransform)!;
      continue;
    }

    if (key === "colors" && isPlainObject(value)) {
      const colors = value;
      if (normalizeSettingValue(colors.background) !== undefined) settings.backgroundColor = normalizeSettingValue(colors.background)!;
      if (normalizeSettingValue(colors.text) !== undefined) settings.textColor = normalizeSettingValue(colors.text)!;
      if (normalizeSettingValue(colors.border) !== undefined) settings.borderColor = normalizeSettingValue(colors.border)!;
      continue;
    }

    if (key === "spacing" && isPlainObject(value)) {
      const spacing = value;
      if (normalizeSettingValue(spacing.top) !== undefined) settings.paddingTop = normalizeSettingValue(spacing.top)!;
      if (normalizeSettingValue(spacing.right) !== undefined) settings.paddingRight = normalizeSettingValue(spacing.right)!;
      if (normalizeSettingValue(spacing.bottom) !== undefined) settings.paddingBottom = normalizeSettingValue(spacing.bottom)!;
      if (normalizeSettingValue(spacing.left) !== undefined) settings.paddingLeft = normalizeSettingValue(spacing.left)!;
      continue;
    }

    if (key === "border" && isPlainObject(value)) {
      const border = value;
      if (normalizeSettingValue(border.width) !== undefined) settings.borderWidth = normalizeSettingValue(border.width)!;
      if (normalizeSettingValue(border.style) !== undefined) settings.borderStyle = normalizeSettingValue(border.style)!;
      if (normalizeSettingValue(border.color) !== undefined) settings.borderColor = normalizeSettingValue(border.color)!;
      if (normalizeSettingValue(border.radius) !== undefined) settings.borderRadius = normalizeSettingValue(border.radius)!;
      continue;
    }

    if (key === "background" && isPlainObject(value)) {
      const background = value;
      if (normalizeSettingValue(background.type) !== undefined) settings.backgroundType = normalizeSettingValue(background.type)!;
      if (normalizeSettingValue(background.color) !== undefined) settings.backgroundColor = normalizeSettingValue(background.color)!;
      if (normalizeSettingValue(background.gradient) !== undefined) settings.backgroundGradient = normalizeSettingValue(background.gradient)!;
      if (normalizeSettingValue(background.image) !== undefined) settings.backgroundImage = normalizeSettingValue(background.image)!;
      if (normalizeSettingValue(background.video) !== undefined) settings.backgroundVideo = normalizeSettingValue(background.video)!;
      if (normalizeSettingValue(background.overlay) !== undefined) settings.backgroundOverlay = normalizeSettingValue(background.overlay)!;
      if (normalizeSettingValue(background.overlayOpacity) !== undefined) settings.backgroundOverlayOpacity = normalizeSettingValue(background.overlayOpacity)!;
      if (normalizeSettingValue(background.position) !== undefined) settings.backgroundPosition = normalizeSettingValue(background.position)!;
      if (normalizeSettingValue(background.size) !== undefined) settings.backgroundSize = normalizeSettingValue(background.size)!;
      if (normalizeSettingValue(background.repeat) !== undefined) settings.backgroundRepeat = normalizeSettingValue(background.repeat)!;
      continue;
    }

    if (key === "effects" && isPlainObject(value)) {
      const effects = value;
      if (normalizeSettingValue(effects.boxShadow) !== undefined) settings.boxShadow = normalizeSettingValue(effects.boxShadow)!;
      if (normalizeSettingValue(effects.opacity) !== undefined) settings.opacity = normalizeSettingValue(effects.opacity)!;
      continue;
    }

    if (key === "position" && isPlainObject(value)) {
      const position = value;
      if (normalizeSettingValue(position.type) !== undefined) settings.position = normalizeSettingValue(position.type)!;
      if (normalizeSettingValue(position.top) !== undefined) settings.top = normalizeSettingValue(position.top)!;
      if (normalizeSettingValue(position.right) !== undefined) settings.right = normalizeSettingValue(position.right)!;
      if (normalizeSettingValue(position.bottom) !== undefined) settings.bottom = normalizeSettingValue(position.bottom)!;
      if (normalizeSettingValue(position.left) !== undefined) settings.left = normalizeSettingValue(position.left)!;
      if (normalizeSettingValue(position.zIndex) !== undefined) settings.zIndex = normalizeSettingValue(position.zIndex)!;
      continue;
    }

    if (key === "responsiveStyles" && isPlainObject(value)) {
      for (const device of RESPONSIVE_KEY_ORDER) {
        const deviceStyles = value[device];
        if (!isPlainObject(deviceStyles)) continue;
        settings[device] = flattenLegacyStyles(deviceStyles) as unknown as EditorSettingValue;
      }
      continue;
    }

    const normalized = normalizeSettingValue(value);
    if (normalized !== undefined) {
      settings[key] = normalized;
    }
  }

  return settings;
};

const flattenObjectToSettings = (source: unknown, prefix = "", target: Record<string, EditorSettingValue> = {}): Record<string, EditorSettingValue> => {
  if (!isPlainObject(source)) return target;

  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined) continue;
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (!prefix && RESPONSIVE_KEY_ORDER.includes(key as (typeof RESPONSIVE_KEY_ORDER)[number]) && isPlainObject(value)) {
      target[nextKey] = flattenLegacyStyles(value) as unknown as EditorSettingValue;
      continue;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      target[nextKey] = value;
      continue;
    }

    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "string" || typeof item === "number" || typeof item === "boolean")) {
        target[nextKey] = value.map((item) => String(item)).join(", ");
      }
      continue;
    }

    if (isPlainObject(value)) {
      flattenObjectToSettings(value, nextKey, target);
    }
  }

  return target;
};

const normalizeEditorTreeSettings = (content: Record<string, unknown>): Record<string, unknown> => {
  const settings: Record<string, unknown> = isPlainObject(content.settings) ? { ...content.settings } : {};

  for (const key of ["layout", "hideTitle", "customCss", "customJs", "padding", "margin", "backgroundColor", "backgroundImage"]) {
    const value = content[key];
    if (value !== undefined) {
      settings[key] = value;
    }
  }

  return settings;
};

const inferChildType = (key: string, parentType: string): string => {
  const normalizedKey = key.replace(/[^a-zA-Z0-9]+/g, "");
  const singularHints: Record<string, string> = {
    slides: "slide",
    slideItems: "slide",
    cards: "card",
    cardItems: "card",
    items: "item",
    listItems: "listItem",
    features: "feature",
    featureCards: "featureCard",
    testimonials: "testimonial",
    banners: "banner",
    categories: "category",
    posts: "post",
    tabs: "tab",
    steps: "step",
    team: "teamMember",
    faqs: "faqItem",
    faq: "faqItem",
    links: "link",
    buttons: "button",
    images: "image",
    gallery: "galleryItem",
    stats: "stat",
    reviews: "review",
  };

  return singularHints[normalizedKey] || `${parentType}${normalizedKey.charAt(0).toUpperCase()}${normalizedKey.slice(1)}`;
};

const convertArrayToChildNodes = (key: string, value: unknown[], parentType: string): EditorNode[] => {
  return value
    .map((item, index) => {
      if (isPlainObject(item)) {
        const childType = inferChildType(key, parentType);
        return {
          id: createId(),
          type: childType,
          settings: {
            ...flattenObjectToSettings(item),
            ...flattenLegacyNodeSettings(item),
          },
          elements: extractLegacyChildren(item, childType),
        } satisfies EditorNode;
      }

      const primitiveValue = normalizeSettingValue(item);
      if (primitiveValue === undefined) return null;

      return {
        id: createId(),
        type: inferChildType(key, parentType),
        settings: {
          value: primitiveValue,
          label: String(primitiveValue),
          index,
        },
        elements: [],
      } satisfies EditorNode;
    })
    .filter(Boolean) as EditorNode[];
};

const extractLegacyChildren = (source: unknown, parentType: string): EditorNode[] => {
  if (!isPlainObject(source)) return [];

  // Mirrors getNestedChildren in src/lib/visual-editor/store.ts: a Section
  // node's real children live under .columns (see createElementFromWidget
  // in widgets.ts, the actual factory used to create every element), not
  // .elements. Without checking .columns here, reopening any page that has
  // a Section with real Column children shows that section as empty in the
  // editor itself — the data is still safely in the database, but the
  // editor fails to surface it, and a merchant who then edits and re-saves
  // could unknowingly overwrite it with nothing.
  const childSources = [
    source.elements,
    source.children,
    source.columns,
  ];

  const children: EditorNode[] = [];
  for (const childSource of childSources) {
    if (!Array.isArray(childSource)) continue;
    for (const child of childSource) {
      children.push(migrateLegacyNode(child, parentType));
    }
  }
  return children;
};

const flattenLegacyNodeSettings = (node: unknown): Record<string, EditorSettingValue> => {
  if (!isPlainObject(node)) return {};

  const settings: Record<string, EditorSettingValue> = {};

  if (isPlainObject(node.settings)) {
    Object.assign(settings, flattenObjectToSettings(node.settings));
  }

  if (isPlainObject(node.styles)) {
    Object.assign(settings, flattenLegacyStyles(node.styles));
  }

  if (isPlainObject(node.styleOverrides)) {
    Object.assign(settings, flattenObjectToSettings(node.styleOverrides));
    Object.assign(settings, flattenLegacyStyles(node.styleOverrides));
  }

  if (isPlainObject(node.content)) {
    Object.assign(settings, flattenObjectToSettings(node.content));
    const props = node.content.props;
    if (isPlainObject(props)) {
      Object.assign(settings, flattenObjectToSettings(props));
    }
  }

  if (isPlainObject(node.props)) {
    Object.assign(settings, flattenObjectToSettings(node.props));
  }

  if (typeof node.customCss === "string") {
    settings.customCss = node.customCss;
  }

  return settings;
};

const migrateLegacyNode = (node: unknown, fallbackType = "node"): EditorNode => {
  if (!isPlainObject(node)) {
    return {
      id: createId(),
      type: fallbackType,
      settings: {},
      elements: [],
    };
  }

  const type = typeof node.type === "string" && node.type.trim() ? node.type : fallbackType;
  const id = typeof node.id === "string" && node.id.trim() ? node.id : createId();

  // Prokip Sales Agent ("prokipAgent*") and Prokip Demo Booking
  // ("prokipBooking*") sections are terminal/leaf content blocks — their
  // React components (ProkipAgentBenefits, ProkipBookingTestimonials, etc.)
  // read array fields like benefits/testimonials/steps directly as flat
  // props, not as a nested children tree.
  //
  // BUG THIS FIXES: this function runs on every single page load,
  // unconditionally, even when content is already in the current format.
  // Below, for any array-of-*objects* field (e.g. benefits: [{title,
  // items}, ...]), it converts each object into a synthetic CHILD EDITOR
  // NODE instead of leaving it as a prop — appendChildArraysFromObject.
  // The bespoke section component never reads element.elements for this
  // data, so it just silently loses that field. The very next save then
  // persists the now-childless version, permanently destroying it — which
  // is why a section can look complete right after creation but end up
  // with pieces (or the whole section, if every field was array-shaped)
  // missing the first time anyone opens the editor and saves, even
  // without touching that section at all.
  // Fix: preserve settings/content verbatim for these two templates,
  // skip the array->children conversion entirely.
  if (type.startsWith("prokipAgent") || type.startsWith("prokipBooking")) {
    const settings = isPlainObject(node.settings) ? { ...node.settings } : {};
    const content = isPlainObject(node.content) ? { ...node.content } : undefined;
    return { id, type, settings, content, elements: [] };
  }
  const settings = flattenLegacyNodeSettings(node);
  const elements = extractLegacyChildren(node, type);
  const content = isPlainObject(node.content) ? node.content : undefined;

  const appendChildArraysFromObject = (source: unknown, sourceType: string) => {
    if (!isPlainObject(source)) return;

    for (const [key, value] of Object.entries(source)) {
      if (Array.isArray(value) && value.every((item) => isPlainObject(item))) {
        elements.push(...convertArrayToChildNodes(key, value, sourceType));
      }
    }
  };

  appendChildArraysFromObject(node.props, type);
  appendChildArraysFromObject(content, type);
  if (content && isPlainObject(content.props)) {
    appendChildArraysFromObject(content.props, type);
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "id" || key === "type" || key === "elements" || key === "children" || key === "columns" || key === "settings" || key === "styles" || key === "styleOverrides" || key === "content" || key === "props") {
      continue;
    }

    if (Array.isArray(value) && value.every((item) => isPlainObject(item))) {
      elements.push(...convertArrayToChildNodes(key, value, type));
      continue;
    }

    const normalized = normalizeSettingValue(value);
    if (normalized !== undefined) {
      settings[key] = normalized;
    }
  }

  return {
    id,
    type,
    settings,
    elements,
  };
};

export function normalizeEditorNode(node: unknown, fallbackType = "node"): EditorNode {
  return migrateLegacyNode(node, fallbackType);
}

export function normalizeEditorNodeTree(nodes: unknown): EditorNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => normalizeEditorNode(node));
}

export function migrateLegacyPageContentToEditorTree(content: unknown): EditorContentTree {
  if (Array.isArray(content)) {
    return { elements: normalizeEditorNodeTree(content), settings: {} };
  }

  if (!isPlainObject(content)) {
    return { elements: [], settings: {} };
  }

  if (Array.isArray(content.elements)) {
    return {
      elements: normalizeEditorNodeTree(content.elements),
      settings: normalizeEditorTreeSettings(content),
    };
  }

  if (Array.isArray(content.blocks)) {
    return {
      elements: normalizeEditorNodeTree(content.blocks),
      settings: normalizeEditorTreeSettings(content),
    };
  }

  if (isPlainObject(content.content) && Array.isArray(content.content.elements)) {
    return {
      elements: normalizeEditorNodeTree(content.content.elements),
      settings: normalizeEditorTreeSettings(content),
    };
  }

  if (isPlainObject(content.block)) {
    return {
      elements: [normalizeEditorNode(content.block)],
      settings: normalizeEditorTreeSettings(content),
    };
  }

  return {
    elements: [],
    settings: normalizeEditorTreeSettings(content),
  };
}

export function resolveNodeStyles(settings: Record<string, unknown> | undefined): CSSProperties {
  const styles: CSSProperties = {};
  if (!settings || typeof settings !== "object") return styles;

  for (const [key, mapper] of Object.entries(STYLE_MAP)) {
    const value = settings[key];
    if (value === undefined || value === null || key.startsWith("hover")) continue;
    const normalized = normalizeCssValue(key, value);
    if (normalized === undefined) continue;
    addStyle(styles, mapper(normalized));
  }

  const paddingTop = toStringValue(settings.paddingTop);
  const paddingRight = toStringValue(settings.paddingRight);
  const paddingBottom = toStringValue(settings.paddingBottom);
  const paddingLeft = toStringValue(settings.paddingLeft);
  if (paddingTop !== undefined) styles.paddingTop = paddingTop;
  if (paddingRight !== undefined) styles.paddingRight = paddingRight;
  if (paddingBottom !== undefined) styles.paddingBottom = paddingBottom;
  if (paddingLeft !== undefined) styles.paddingLeft = paddingLeft;

  const marginTop = toStringValue(settings.marginTop);
  const marginRight = toStringValue(settings.marginRight);
  const marginBottom = toStringValue(settings.marginBottom);
  const marginLeft = toStringValue(settings.marginLeft);
  if (marginTop !== undefined) styles.marginTop = marginTop;
  if (marginRight !== undefined) styles.marginRight = marginRight;
  if (marginBottom !== undefined) styles.marginBottom = marginBottom;
  if (marginLeft !== undefined) styles.marginLeft = marginLeft;

  return styles;
}

export function resolveNodeHoverStyles(settings: Record<string, unknown> | undefined): CSSProperties {
  const styles: CSSProperties = {};
  if (!settings || typeof settings !== "object") return styles;

  for (const [key, mapper] of Object.entries(HOVER_STYLE_MAP)) {
    const value = settings[key];
    if (value === undefined || value === null) continue;
    const normalized = normalizeCssValue(key.replace(/^hover/, "").replace(/^[A-Z]/, (match) => match.toLowerCase()), value);
    if (normalized === undefined) continue;
    addStyle(styles, mapper(normalized));
  }

  return styles;
}

export function buildScopedNodeCss(node: EditorNode): string {
  const base = resolveNodeStyles(node.settings);
  const hover = resolveNodeHoverStyles(node.settings);
  const selectorParts = [`.editor-node-${node.id}`, `[data-editor-node-id="${node.id}"]`];
  const cssId = typeof node.settings.cssId === "string" ? node.settings.cssId.trim() : "";
  const cssClass = typeof node.settings.cssClass === "string" ? node.settings.cssClass.trim() : "";
  const escapeSelector = (value: string) => {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }
    return value.replace(/[^a-zA-Z0-9_-]/g, "-");
  };
  if (cssId) selectorParts.push(`#${escapeSelector(cssId)}`);
  if (cssClass) {
    for (const className of cssClass.split(/\s+/).map((item) => item.trim()).filter(Boolean)) {
      selectorParts.push(`.${escapeSelector(className)}`);
    }
  }
  const selector = selectorParts.join(", ");
  const css: string[] = [];

  const serialize = (styles: CSSProperties, important = false): string =>
    Object.entries(styles)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}: ${value}${important ? " !important" : ""};`)
      .join(" ");

  const baseCss = serialize(base);
  if (baseCss) {
    css.push(`${selector} { ${baseCss} }`);
  }

  const typographyStyles = Object.fromEntries(
    Object.entries(base).filter(([key]) => TYPOGRAPHY_STYLE_KEYS.has(key))
  ) as CSSProperties;
  const typographyCss = serialize(typographyStyles, true);
  if (typographyCss) {
    css.push(`${selector} :is(h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, div) { ${typographyCss} }`);
  }

  const hoverCss = serialize(hover);
  if (hoverCss) {
    const hoverSelector = selectorParts.map((part) => `${part}:hover`).join(", ");
    css.push(`${hoverSelector} { ${hoverCss} }`);
  }

  const responsive = node.settings as Record<string, unknown>;
  for (const device of RESPONSIVE_KEY_ORDER) {
    const deviceSettings = responsive[device];
    if (!isPlainObject(deviceSettings)) continue;
    const deviceCss = serialize(resolveNodeStyles(deviceSettings));
    if (!deviceCss) continue;
    const media = device === "mobile" ? "(max-width: 767px)" : device === "tablet" ? "(min-width: 768px) and (max-width: 1024px)" : "(min-width: 1025px)";
    css.push(`@media ${media} { ${selector} { ${deviceCss} } }`);
  }

  return css.join("\n");
}

export function buildEditorNodeTreeCss(nodes: EditorNode[] | undefined | null): string {
  const css: string[] = [];

  // Same field-name reality as editorNodeToBlock in src/lib/page-content.ts:
  // sections nest under .columns, columns nest under .children — only
  // .elements is uniform across every node type. Without checking all
  // three, CSS for anything inside a Section's columns never gets
  // generated at all.
  const getChildren = (node: any): EditorNode[] => {
    if (Array.isArray(node?.elements)) return node.elements;
    if (Array.isArray(node?.children)) return node.children;
    if (Array.isArray(node?.columns)) return node.columns;
    return [];
  };

  const walk = (items: EditorNode[] | undefined | null) => {
    if (!Array.isArray(items)) return;

    for (const node of items) {
      if (!node?.id) continue;
      css.push(buildScopedNodeCss(node));
      const children = getChildren(node);
      if (children.length > 0) {
        walk(children);
      }
    }
  };

  walk(nodes);
  return css.filter(Boolean).join("\n");
}

export function logNodeStyleResolutionSamples(): void {
  if (process.env.NODE_ENV === "production") return;

  const samples: Array<{ label: string; settings: Record<string, unknown> }> = [
    {
      label: "block",
      settings: {
        backgroundColor: "#ffffff",
        paddingTop: "24px",
        paddingRight: "24px",
        paddingBottom: "24px",
        paddingLeft: "24px",
      },
    },
    {
      label: "child",
      settings: {
        textColor: "#111111",
        fontSize: "18px",
        fontWeight: "700",
        hoverTextColor: "#ff0000",
      },
    },
  ];

  for (const sample of samples) {
    console.log(`[resolveNodeStyles] ${sample.label}`, sample.settings, resolveNodeStyles(sample.settings), resolveNodeHoverStyles(sample.settings));
  }
}
