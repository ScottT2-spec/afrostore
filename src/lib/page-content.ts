import type { BuilderBlock as StorefrontBuilderBlock } from "@/components/storefront/BlockRenderer";
import type { EditorNode } from "@/lib/visual-editor/node-tree";
import { buildEditorNodeTreeCss } from "@/lib/visual-editor/node-tree";
import { templateBlocksToEditorTree } from "@/lib/templates/template-tree";

export interface PageSettings {
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: string | null;
  backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  backgroundAttachment?: "scroll" | "fixed";
  overlayColor?: string | null;
  overlayOpacity?: number | null;
}

export interface PageContentDocument {
  blocks: StorefrontBuilderBlock[];
  elements?: EditorNode[];
  settings: PageSettings;
}

export interface BuilderBlock {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  styleOverrides?: Record<string, unknown>;
  elements?: BuilderBlock[];
}

const EMPTY_PAGE_CONTENT: PageContentDocument = {
  blocks: [],
  settings: {},
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

function normalizeBlocks(value: unknown): BuilderBlock[] {
  if (!Array.isArray(value)) return [];
  return value as BuilderBlock[];
}

function normalizeElements(value: unknown): EditorNode[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value as EditorNode[];
}

function normalizeElementsFromBlocks(value: unknown): EditorNode[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const nodes = templateBlocksToEditorTree(value);
  return nodes.length > 0 ? nodes : undefined;
}

// Section elements nest their content under `.columns`, column elements
// under `.children` — only leaf/generic nodes use a plain `.elements`
// array (see createElementFromWidget in src/lib/visual-editor/widgets.ts,
// the actual factory that creates every element in the editor). This
// mirrors getNestedChildren in src/lib/visual-editor/store.ts. Without
// checking all three, a Section's columns — and everything inside them —
// silently vanish the moment a page gets converted for live rendering,
// even though the data was saved correctly; Sections-with-Columns is the
// single most common structural pattern in any real page.
function getEditorNodeChildren(node: EditorNode): EditorNode[] {
  const anyNode = node as any;
  if (Array.isArray(anyNode.elements)) return anyNode.elements;
  if (Array.isArray(anyNode.children)) return anyNode.children;
  if (Array.isArray(anyNode.columns)) return anyNode.columns;
  return [];
}

function editorNodeToBlock(node: EditorNode): BuilderBlock {
  // The editor writes to two different places depending on which UI path
  // made the edit: the 5 hand-built content editors (heading/paragraph/
  // text/button/image) write to both node.settings and node.content
  // together, but the generic key/value editor used for every other
  // widget type (icon, cta, social-share, etc. — anything without a
  // purpose-built editor) writes only to node.content, or to
  // node.content.props for a few fields. editorNodeToBlock previously
  // only read node.settings, so edits made through the generic editor —
  // the only editing path available for the majority of widget types —
  // never made it into what actually renders live.
  const anyNode = node as any;
  const merged = {
    ...(node.settings || {}),
    ...(anyNode.content || {}),
    ...(anyNode.content?.props || {}),
  };
  return {
    id: node.id,
    type: node.type,
    props: merged,
    styleOverrides: merged,
    elements: getEditorNodeChildren(node).map(editorNodeToBlock),
  };
}

function normalizeSettings(value: unknown): PageSettings {
  if (!value || typeof value !== "object") return {};
  const settings = value as Record<string, unknown>;
  return {
    backgroundColor: typeof settings.backgroundColor === "string" ? settings.backgroundColor : undefined,
    backgroundImage: typeof settings.backgroundImage === "string" ? settings.backgroundImage : undefined,
    backgroundSize:
      settings.backgroundSize === "cover" || settings.backgroundSize === "contain" || settings.backgroundSize === "auto"
        ? settings.backgroundSize
        : undefined,
    backgroundPosition: typeof settings.backgroundPosition === "string" ? settings.backgroundPosition : undefined,
    backgroundRepeat:
      settings.backgroundRepeat === "no-repeat" ||
      settings.backgroundRepeat === "repeat" ||
      settings.backgroundRepeat === "repeat-x" ||
      settings.backgroundRepeat === "repeat-y"
        ? settings.backgroundRepeat
        : undefined,
    backgroundAttachment: settings.backgroundAttachment === "scroll" || settings.backgroundAttachment === "fixed" ? settings.backgroundAttachment : undefined,
    overlayColor: typeof settings.overlayColor === "string" ? settings.overlayColor : undefined,
    overlayOpacity: typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : undefined,
  };
}

export function parsePageContent(content: unknown): PageContentDocument {
  if (Array.isArray(content)) {
    return {
      ...EMPTY_PAGE_CONTENT,
      blocks: normalizeBlocks(content),
      elements: normalizeElementsFromBlocks(content),
    };
  }

  if (!content || typeof content !== "object") {
    return { ...EMPTY_PAGE_CONTENT };
  }

  const raw = content as Record<string, unknown>;
  const settings = normalizeSettings(raw.settings || raw.pageSettings || raw.background || raw.pageBackground);
  const nestedContent = isPlainObject(raw.content) ? raw.content : undefined;
  const elements = normalizeElements(raw.elements || nestedContent?.elements);

  if (Array.isArray(elements) && elements.length > 0) {
    return { blocks: elements.map(editorNodeToBlock), elements, settings };
  }

  if (Array.isArray(raw.blocks)) {
    return {
      blocks: normalizeBlocks(raw.blocks),
      elements: normalizeElementsFromBlocks(raw.blocks),
      settings,
    };
  }

  return { ...EMPTY_PAGE_CONTENT, settings };
}

export function buildPageContentNodeCss(content: unknown): string {
  const parsed = parsePageContent(content);
  const elements =
    Array.isArray(parsed.elements) && parsed.elements.length > 0
      ? parsed.elements
      : normalizeElementsFromBlocks(parsed.blocks) || [];
  if (elements.length === 0) return "";
  return buildEditorNodeTreeCss(elements);
}

export function serializePageContent(document: PageContentDocument): Record<string, unknown> {
  if (Array.isArray(document.elements) && document.elements.length > 0) {
    return {
      elements: document.elements,
      blocks: Array.isArray(document.blocks) && document.blocks.length > 0 ? document.blocks : document.elements.map(editorNodeToBlock),
      settings: document.settings || {},
    };
  }

  return {
    blocks: document.blocks,
    settings: document.settings || {},
  };
}

const PACKAGE_BLOCK_TYPES = new Set([
  "imageHeroBanner",
  "staticProductGrid",
  "linkCards",
  "imageCategoryCards",
  "promoSplit",
  "imageBrands",
  "featured_products",
]);

const LEGACY_SCAFFOLD_TYPES = new Set([
  "columns",
  "collections",
  "categories",
  "new_arrivals",
  "best_sellers",
  "brands",
]);

export function isLegacyScaffoldBlocks(blocks: BuilderBlock[]): boolean {
  if (blocks.length === 0) return false;

  const types = new Set(blocks.map((block) => block.type));
  let legacyCount = 0;
  let packageCount = 0;

  for (const type of types) {
    if (LEGACY_SCAFFOLD_TYPES.has(type)) legacyCount += 1;
    if (PACKAGE_BLOCK_TYPES.has(type)) packageCount += 1;
  }

  return legacyCount >= 3 && packageCount === 0;
}

export function pickRicherPageDocument(primary: PageContentDocument, secondary: PageContentDocument): PageContentDocument {
  if (primary.blocks.length === 0) return secondary;
  if (secondary.blocks.length === 0) return primary;

  if (isLegacyScaffoldBlocks(primary.blocks) && !isLegacyScaffoldBlocks(secondary.blocks)) {
    return secondary;
  }

  if (secondary.blocks.length > primary.blocks.length) {
    return { blocks: secondary.blocks, settings: { ...primary.settings, ...secondary.settings } };
  }

  const primaryPackageCount = primary.blocks.filter((block) => PACKAGE_BLOCK_TYPES.has(block.type)).length;
  const secondaryPackageCount = secondary.blocks.filter((block) => PACKAGE_BLOCK_TYPES.has(block.type)).length;

  if (secondaryPackageCount > primaryPackageCount) {
    return { blocks: secondary.blocks, settings: { ...primary.settings, ...secondary.settings } };
  }

  return primary;
}

export function pickRicherPageDocumentWithMeta(
  primary: PageContentDocument,
  secondary: PageContentDocument,
): { document: PageContentDocument; usedSecondary: boolean } {
  const document = pickRicherPageDocument(primary, secondary);
  const usedSecondary =
    secondary.blocks.length > 0 &&
    document.blocks.length === secondary.blocks.length &&
    document.blocks.every((block, index) => block.id === secondary.blocks[index]?.id);

  return { document, usedSecondary };
}

export function normalizePageContentRaw(content: unknown): unknown {
  if (Array.isArray(content)) {
    return { blocks: content, settings: {} };
  }
  return content;
}

export function getLinkedPageHref(page: { slug: string; template?: string | null }, storeSlug: string): string {
  if ((page.template || "").toLowerCase() === "crm:blogs" || page.slug.toLowerCase() === "blogs") {
    return `/store/${storeSlug}/blogs`;
  }

  return `/store/${storeSlug}/${page.slug}`;
}

export function getLinkedPageTemplate(page: { slug: string; title?: string }): string | null {
  const slug = page.slug.toLowerCase();
  const title = (page.title || "").trim().toLowerCase();
  if (slug === "blogs" || title === "blogs" || title === "blog") {
    return "crm:blogs";
  }
  return null;
}

export function getLinkedPageBadge(page: { slug: string; template?: string | null }): string | null {
  if ((page.template || "").toLowerCase() === "crm:blogs" || page.slug.toLowerCase() === "blogs") {
    return "CRM Blogs";
  }

  return null;
}
