import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { normalizeEditorNode, type EditorNode, type EditorContentTree } from "@/lib/visual-editor/node-tree";

export const CHILD_FRAGMENT_TYPES = new Set([
  "slide",
  "feature",
  "banner",
  "category",
  "testimonial",
  "tab",
  "post",
  "link",
  "button",
  "review",
  "step",
  "image",
  "faqItem",
  "teamMember",
  "service",
  "brand",
  "counter",
  "box",
  "paragraph",
  "video",
  "office",
  "ingredient",
  "expert",
  "swatch",
  "variant",
  "infobox",
  "menuItem",
  "navItem",
  "navPage",
  "groceryFooterLinkColumns",
  "groceryFooterLinkColumn",
  "groceryFooterLink",
  "linkColumn",
  "linkItem",
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const createId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `node-${Math.random().toString(36).slice(2, 10)}`;
};

export function isChildFragmentType(type: string): boolean {
  return CHILD_FRAGMENT_TYPES.has(type);
}

export function normalizeTemplateNodeSettings(block: TemplateBlock): Record<string, unknown> {
  const settings: Record<string, unknown> = {};

  if (isPlainObject(block.settings)) {
    Object.assign(settings, block.settings);
  }

  if (isPlainObject(block.props)) {
    Object.assign(settings, block.props);
  }

  return settings;
}

export function templateBlockToEditorNode(block: TemplateBlock): EditorNode {
  if (isEditorNodeLike(block)) {
    return block;
  }

  // Modern template presets declare a clean, already-correct `settings` object
  // (with intentionally nested arrays-of-objects like `testimonials`, `steps`,
  // `problems`, `navLinks`) and no ambiguous legacy `props` field. Those must
  // be preserved exactly as authored — do NOT route them through the legacy
  // heuristic migration below, which aggressively pulls any array-of-objects
  // out of settings and turns it into synthetic child elements. That heuristic
  // exists for genuinely ambiguous old data; it silently destroys well-formed
  // modern presets (e.g. prokip-booking's testimonials/steps/problems arrays
  // would vanish from settings on every save/reload round-trip).
  if (isPlainObject(block.settings) && !isPlainObject((block as unknown as { props?: unknown }).props)) {
    return {
      id: block.id || createId(),
      type: block.type,
      settings: { ...block.settings },
      elements: Array.isArray(block.elements)
        ? block.elements.map((child) => templateBlockToEditorNode(child as TemplateBlock))
        : [],
    };
  }

  const legacyNode = normalizeEditorNode({
    id: block.id || createId(),
    type: block.type,
    props: normalizeTemplateNodeSettings(block),
    elements: Array.isArray(block.elements) ? block.elements.map((child) => ({
      id: child.id || createId(),
      type: child.type,
      props: normalizeTemplateNodeSettings(child),
      elements: Array.isArray(child.elements) ? child.elements : [],
    })) : [],
    styleOverrides: block.styleOverrides || {},
  });

  return legacyNode;
}

export function isEditorNodeLike(value: unknown): value is EditorNode {
  return isPlainObject(value) && typeof value.id === "string" && typeof value.type === "string" && isPlainObject(value.settings) && Array.isArray(value.elements);
}

export function templateBlocksToEditorTree(blocks: Array<TemplateBlock | EditorNode> | unknown): EditorNode[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => templateBlockToEditorNode(block as TemplateBlock));
}

export function buildTemplatePageContent(
  blocks: Array<TemplateBlock | EditorNode> | unknown,
  settings: Record<string, unknown> = {},
): EditorContentTree & Record<string, unknown> {
  return {
    elements: templateBlocksToEditorTree(blocks),
    settings,
  };
}
