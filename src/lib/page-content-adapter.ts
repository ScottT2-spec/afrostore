/**
 * One reader/writer for page content, so the AI's tools work on a page
 * whether it was last saved by the AI builder or by the visual editor.
 *
 * Shapes found in `pages.content` (mirrors parsePageContent in page-content.ts,
 * which is what the live storefront uses):
 *  - array of { id, type, props }                         → "blocks" (AI generator)
 *  - { blocks: [...] , settings }                          → "blocks"
 *  - { elements: EditorNode[], settings } (also under
 *    content.elements; may carry a derived `blocks` copy)  → "editor" (visual editor)
 *
 * The AI's tools read a page as a list of { id, type, props }. For an editor
 * element, `props` is EXACTLY what the storefront renders for it
 * (settings, overridden by content, overridden by content.props), and its child
 * elements are reachable as props.elements[i] (each { id, type, props, elements }),
 * so any text/color/image anywhere in the tree is editable by dotted path.
 *
 * Writes go back in the page's ORIGINAL shape, and each changed field is put in
 * the layer that actually wins at render time, so a change can never "save
 * successfully" yet leave the live page unchanged.
 */
import { randomUUID } from "node:crypto";
import { editorNodeToBlock, getEditorNodeChildren } from "@/lib/page-content";
import type { EditorNode } from "@/lib/visual-editor/node-tree";

export interface AIBlock {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
  [key: string]: unknown;
}

export type PageContentFormat = "blocks" | "editor" | "unsupported";

export interface PageBlocksView {
  format: PageContentFormat;
  blocks: AIBlock[];
}

type AnyObj = Record<string, unknown>;
const isObj = (v: unknown): v is AnyObj => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

type Shape =
  | { kind: "blocks"; blocks: AIBlock[]; wrap: (b: AIBlock[]) => unknown }
  | { kind: "editor"; elements: EditorNode[]; wrap: (els: EditorNode[]) => unknown }
  | { kind: "unsupported" };

function detectShape(content: unknown): Shape {
  if (Array.isArray(content)) return { kind: "blocks", blocks: content as AIBlock[], wrap: (b) => b };
  if (!isObj(content)) return { kind: "unsupported" };

  const nested = isObj(content.content) ? content.content : undefined;
  const topEls = Array.isArray(content.elements) ? (content.elements as EditorNode[]) : undefined;
  const nestedEls = nested && Array.isArray(nested.elements) ? (nested.elements as EditorNode[]) : undefined;
  const els = topEls && topEls.length > 0 ? topEls : nestedEls && nestedEls.length > 0 ? nestedEls : undefined;

  if (els) {
    const inNested = !(topEls && topEls.length > 0);
    return {
      kind: "editor",
      elements: els,
      wrap: (next) => {
        if (inNested) return { ...content, content: { ...(nested as AnyObj), elements: next } };
        const out: AnyObj = { ...content, elements: next };
        // `blocks` is a derived copy some writers store alongside elements; keep it in step.
        if (Array.isArray(content.blocks)) out.blocks = next.map(editorNodeToBlock);
        return out;
      },
    };
  }
  if (Array.isArray(content.blocks)) {
    return { kind: "blocks", blocks: content.blocks as AIBlock[], wrap: (b) => ({ ...content, blocks: b }) };
  }
  if (topEls || nestedEls) {
    // An editor page with no elements yet.
    return { kind: "editor", elements: [], wrap: (next) => (topEls ? { ...content, elements: next } : { ...content, content: { ...(nested as AnyObj), elements: next } }) };
  }
  return { kind: "unsupported" };
}

/** The view the AI works with for one editor element: merged props + child elements as props.elements. */
function nodeToAIBlock(node: EditorNode): AIBlock {
  const merged = { ...((editorNodeToBlock(node).props as AnyObj) || {}) };
  // The storefront spreads content.props into the merged props, so the `props`
  // object itself would show every field twice. Hide the duplicate.
  const nodeContent = (node as unknown as AnyObj).content;
  if (isObj(nodeContent) && isObj(nodeContent.props) && same(merged.props, nodeContent.props)) delete merged.props;
  const kids = getEditorNodeChildren(node);
  if (kids.length > 0) merged.elements = kids.map(nodeToAIBlock);
  return { id: node.id, type: node.type, props: merged };
}

function nodeFromAIBlock(b: AIBlock): EditorNode {
  const { elements, ...rest } = (isObj(b.props) ? b.props : {}) as AnyObj;
  return {
    id: typeof b.id === "string" && b.id ? b.id : randomUUID(),
    type: typeof b.type === "string" && b.type ? b.type : "unknown",
    settings: rest,
    elements: Array.isArray(elements) ? (elements as AIBlock[]).map(nodeFromAIBlock) : [],
  };
}

/** Apply what changed between the view we gave the AI (before) and what it produced (after) to the original node. */
function applyToNode(orig: EditorNode, after: AIBlock): EditorNode {
  const before = nodeToAIBlock(orig);
  const { elements: bKids, ...bp } = (before.props || {}) as AnyObj;
  const { elements: aKids, ...ap } = (isObj(after.props) ? after.props : {}) as AnyObj;
  const node = { ...(orig as unknown as AnyObj) } as AnyObj;

  const settings: AnyObj = isObj(node.settings) ? { ...node.settings } : {};
  const content: AnyObj | undefined = isObj(node.content) ? { ...node.content } : undefined;
  const cprops: AnyObj | undefined = content && isObj(content.props) ? { ...content.props } : undefined;

  for (const k of new Set([...Object.keys(bp), ...Object.keys(ap)])) {
    if (same(bp[k], ap[k])) continue;
    if (k in ap && ap[k] !== undefined) {
      // Write to the highest layer that already holds the key (content.props > content > settings): that one wins at render.
      if (cprops && k in cprops) cprops[k] = ap[k];
      else if (content && k !== "props" && k in content) content[k] = ap[k];
      else if (content && k === "props") content.props = ap[k];
      else settings[k] = ap[k];
    } else {
      if (cprops) delete cprops[k];
      if (content && k !== "props") delete content[k];
      delete settings[k];
    }
  }
  if (content) {
    if (cprops) content.props = cprops;
    node.content = content;
  }
  node.settings = settings;

  if (Array.isArray(aKids) && !same(bKids, aKids)) {
    const kids = getEditorNodeChildren(orig);
    const byId = new Map<string, EditorNode>();
    for (const c of kids) if (c && typeof c.id === "string") byId.set(c.id, c);
    const next = (aKids as AIBlock[]).map((c, i) => {
      const o = (typeof c.id === "string" && byId.get(c.id)) || (!c.id ? kids[i] : undefined);
      return o ? applyToNode(o, c) : nodeFromAIBlock(c);
    });
    const key = Array.isArray(node.elements) ? "elements" : Array.isArray(node.children) ? "children" : Array.isArray(node.columns) ? "columns" : "elements";
    node[key] = next;
  } else if (Array.isArray(bKids) && !Array.isArray(aKids)) {
    // The AI removed the whole children list.
    const key = Array.isArray(node.elements) ? "elements" : Array.isArray(node.children) ? "children" : "columns";
    node[key] = [];
  }
  return node as unknown as EditorNode;
}

/** Uniform { id, type, props } list for any page content shape. Editor elements are returned as detached copies. */
export function readPageBlocks(content: unknown): PageBlocksView {
  const shape = detectShape(content);
  if (shape.kind === "blocks") return { format: "blocks", blocks: shape.blocks };
  if (shape.kind === "editor") return { format: "editor", blocks: structuredClone(shape.elements.map(nodeToAIBlock)) };
  return { format: "unsupported", blocks: [] };
}

/** Turn edited blocks back into content in the SAME shape the page was read from. */
export function writePageBlocks(original: unknown, blocks: AIBlock[]): unknown {
  const shape = detectShape(original);
  if (shape.kind === "blocks") return shape.wrap(blocks);
  if (shape.kind === "editor") {
    const byId = new Map<string, EditorNode>();
    for (const e of shape.elements) if (e && typeof e.id === "string") byId.set(e.id, e);
    const next = blocks.map((b, i) => {
      const o = (typeof b.id === "string" && byId.get(b.id)) || (!b.id ? shape.elements[i] : undefined);
      return o ? applyToNode(o, b) : nodeFromAIBlock(b);
    });
    return shape.wrap(next);
  }
  return blocks;
}
