/**
 * Pure helpers the site-generation agent uses to READ and CHANGE the content
 * of page blocks. No database, no framework imports — everything here takes
 * plain objects and returns plain objects so it can be unit tested.
 *
 * Blocks are {id, type, props}. Every visible thing lives somewhere inside
 * `props`, sometimes nested (items[2].title). All edits are by dotted path
 * ("heading", "items.2.title") and are applied atomically: if any single edit
 * fails, nothing is saved.
 */

export type EditOp = {
  op: "set" | "remove" | "insert";
  path: string;
  value?: unknown;
  index?: number;
  /** Set true ONLY to deliberately add a brand-new field that the section doesn't have yet. */
  createIfMissing?: boolean;
};

export type EditChange = { op: EditOp["op"]; path: string; before?: unknown; after?: unknown; note?: string };

export type TextHit = { pageSlug: string; sectionIndex: number; blockType: string; path: string; value: string };

const UNSAFE_PATH_KEYS = new Set(["__proto__", "constructor", "prototype"]);
export const MAX_PROPS_BYTES = 400_000;

/** Fields a merchant can legitimately ask to ADD to any section (style/media fields the renderer honors even when absent). */
const AUTO_CREATE_KEY = /(color|italic|bold|underline|size|weight|align|font|image|background|opacity|overlay|radius|padding|height|width)$|^(bg|background)/i;

export function parsePath(path: string): string[] | null {
  const parts = path.split(".").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0 || parts.some((p) => UNSAFE_PATH_KEYS.has(p))) return null;
  return parts;
}

export function flattenProps(value: unknown, prefix = "", out: Array<[string, unknown]> = []): Array<[string, unknown]> {
  if (Array.isArray(value)) {
    if (value.length === 0 && prefix) out.push([prefix, []]);
    value.forEach((v, i) => flattenProps(v, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0 && prefix) out.push([prefix, {}]);
    for (const [k, v] of entries) flattenProps(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (prefix) {
    out.push([prefix, value]);
  }
  return out;
}

export function formatFlat(props: Record<string, unknown>, maxValueLen: number): string {
  const rows = flattenProps(props).map(([path, v]) => {
    const raw = typeof v === "string" ? v : JSON.stringify(v);
    const shown = raw.length > maxValueLen ? raw.slice(0, maxValueLen) + "\u2026" : raw;
    return `  ${path} = ${typeof v === "string" ? JSON.stringify(shown) : shown}`;
  });
  return rows.length ? rows.join("\n") : "  (no fields)";
}

function getAt(root: unknown, parts: string[]): unknown {
  let cur: any = root;
  for (const k of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = Array.isArray(cur) ? cur[Number(k)] : cur[k];
  }
  return cur;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Existing paths whose last segment resembles the one the caller asked for — so a typo like "headline" points at "heading" instead of silently creating a dead field. */
export function suggestPaths(props: Record<string, unknown>, wanted: string, max = 5): string[] {
  const want = (wanted.split(".").pop() || wanted).toLowerCase();
  const scored: Array<{ path: string; score: number }> = [];
  for (const [path] of flattenProps(props)) {
    const last = (path.split(".").pop() || path).toLowerCase();
    let score = levenshtein(want, last);
    if (last.includes(want) || want.includes(last)) score = Math.min(score, 1);
    if (score <= 3) scored.push({ path, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.path.length - b.path.length).slice(0, max).map((s) => s.path);
}

/** Top-level field names, for telling the model what a section actually has. */
function topLevelKeys(props: Record<string, unknown>): string[] {
  return Object.keys(props).slice(0, 40);
}

/** Walk to the container that holds the last path segment. Creates missing plain objects only when explicitly allowed. */
function walkToParent(root: Record<string, unknown>, parts: string[], createMissing: boolean): { parent: any; key: string } | string {
  let cur: any = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    let next = Array.isArray(cur) ? cur[Number(k)] : cur?.[k];
    if (next === undefined || next === null) {
      if (!createMissing || Array.isArray(cur)) return `"${parts.slice(0, i + 1).join(".")}" doesn't exist`;
      next = {};
      cur[k] = next;
    }
    if (typeof next !== "object") return `"${parts.slice(0, i + 1).join(".")}" is a plain value, not something with fields inside it`;
    cur = next;
  }
  return { parent: cur, key: parts[parts.length - 1] };
}

/** Tool schemas advertise `value` as text (some providers can't take "any"), so models send true/false/JSON as text. Turn it back into the right type. */
export function coerceEditValue(value: unknown, before: unknown, key: string, forInsert = false): unknown {
  if (typeof value !== "string") return value;
  const t = value.trim();
  const looksJson = (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
  if (looksJson && (forInsert || typeof before === "object")) {
    try { return JSON.parse(t); } catch { /* keep as text */ }
  }
  if (/^(true|false)$/i.test(t) && (typeof before === "boolean" || (before === undefined && /(italic|bold|underline|enabled|show|hide|visible)/i.test(key)))) return t.toLowerCase() === "true";
  if (typeof before === "number" && t !== "" && !Number.isNaN(Number(t))) return Number(t);
  return value;
}

export function applySectionEdits(
  props: Record<string, unknown>,
  edits: EditOp[],
): { props: Record<string, unknown>; changes: EditChange[]; error?: string } {
  const next = JSON.parse(JSON.stringify(props)) as Record<string, unknown>;
  const changes: EditChange[] = [];
  const fail = (error: string) => ({ props, changes: [], error });

  for (let n = 0; n < edits.length; n++) {
    let e = edits[n];
    const label = `edit ${n + 1} (${e.op} "${e.path}")`;
    const parts = parsePath(e.path);
    if (!parts) return fail(`${label}: invalid path.`);

    if (e.op === "insert") {
      const target = getAt(next, parts);
      if (!Array.isArray(target)) {
        const lists = flattenProps(next).filter(([, v]) => Array.isArray(v)).map(([p]) => p);
        return fail(`${label}: "${e.path}" is not a list.${lists.length ? ` Lists on this section: ${lists.join(", ")}.` : " This section has no lists."}`);
      }
      const at = e.index === undefined ? target.length : e.index;
      if (at > target.length) return fail(`${label}: index ${at} is past the end (list has ${target.length} items).`);
      const item = coerceEditValue(e.value, undefined, parts[parts.length - 1], true);
      target.splice(at, 0, item);
      changes.push({ op: "insert", path: `${e.path}.${at}`, after: item });
      continue;
    }

    const lastKey = parts[parts.length - 1];
    const before = getAt(next, parts);
    if (e.op === "set") e = { ...e, value: coerceEditValue(e.value, before, lastKey) };

    // A `set` on a field the section doesn't have is almost always a typo or a
    // guessed name ("headline" for "heading"). It would "succeed" and change
    // nothing the visitor sees. Refuse it and say what DOES exist.
    if (e.op === "set" && before === undefined && !e.createIfMissing && !AUTO_CREATE_KEY.test(lastKey)) {
      const parentParts = parts.slice(0, -1);
      const parentVal = parentParts.length ? getAt(next, parentParts) : next;
      const isListItemSlot = Array.isArray(parentVal) && Number.isInteger(Number(lastKey));
      if (!isListItemSlot) {
        const close = suggestPaths(next, e.path);
        const hint = close.length ? ` Did you mean: ${close.join(", ")}?` : "";
        return fail(
          `${label}: this section has no field "${e.path}".${hint} Fields at the top level: ${topLevelKeys(next).join(", ") || "(none)"}. ` +
            `Call get_section for exact paths. Only if you truly want to ADD a new field, resend this edit with createIfMissing: true.`,
        );
      }
    }

    const createMissing = e.op === "set" && (!!e.createIfMissing || AUTO_CREATE_KEY.test(lastKey));
    const loc = walkToParent(next, parts, createMissing);
    if (typeof loc === "string") return fail(`${label}: ${loc}.`);
    const { parent, key } = loc;

    if (Array.isArray(parent)) {
      const i = Number(key);
      if (!Number.isInteger(i) || i < 0) return fail(`${label}: "${key}" isn't a valid list position.`);
      if (e.op === "remove") {
        if (i >= parent.length) return fail(`${label}: list only has ${parent.length} items.`);
        parent.splice(i, 1);
        changes.push({ op: "remove", path: e.path, before });
      } else {
        if (i > parent.length) return fail(`${label}: list only has ${parent.length} items \u2014 use insert to add one.`);
        parent[i] = e.value;
        changes.push({ op: "set", path: e.path, before, after: e.value, note: JSON.stringify(before) === JSON.stringify(e.value) ? "already had this value" : undefined });
      }
    } else if (e.op === "remove") {
      if (!(key in parent)) return fail(`${label}: "${e.path}" doesn't exist.`);
      delete parent[key];
      changes.push({ op: "remove", path: e.path, before });
    } else {
      parent[key] = e.value;
      changes.push({ op: "set", path: e.path, before, after: e.value, note: JSON.stringify(before) === JSON.stringify(e.value) ? "already had this value" : undefined });
    }
  }
  if (JSON.stringify(next).length > MAX_PROPS_BYTES) return fail("Edits would make this section too large.");
  return { props: next, changes };
}

/** One-line before \u2192 after for each change, so the model (and the merchant) can verify what really happened. */
export function describeChanges(changes: EditChange[], maxLen = 70): string {
  const show = (v: unknown) => {
    const raw = typeof v === "string" ? v : JSON.stringify(v);
    const s = raw === undefined ? "(nothing)" : raw;
    return JSON.stringify(s.length > maxLen ? s.slice(0, maxLen) + "\u2026" : s);
  };
  return changes
    .map((c) =>
      c.op === "set" ? `set ${c.path}: ${show(c.before)} \u2192 ${show(c.after)}${c.note ? ` (${c.note})` : ""}`
      : c.op === "remove" ? `removed ${c.path} (was ${show(c.before)})`
      : `inserted ${c.path}: ${show(c.after)}`)
    .join("\n");
}

// ---- Text search / replace -------------------------------------------------

/** Straighten curly quotes, non-breaking spaces and runs of whitespace so "Don\u2019t  miss" matches "Don't miss". */
export function normalizeText(s: string, matchCase = false): string {
  const n = s
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201F]/g, '"')
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return matchCase ? n : n.toLowerCase();
}

/** Values that are links/paths/colors/data, not visible words. A find/replace on "shop" must never rewrite "/shop". */
function looksLikeNonText(v: string): boolean {
  return /^(https?:|\/|#|mailto:|tel:|data:|wa\.me|www\.)/i.test(v.trim()) || /^#[0-9a-f]{3,8}$/i.test(v.trim());
}

const NEVER_TEXT_KEYS = new Set(["id", "type", "icon", "layout", "variant", "template"]);

export function findTextInBlocks(
  pageSlug: string,
  blocks: Array<{ type?: string; props?: Record<string, unknown> }>,
  query: string,
  opts: { matchCase?: boolean } = {},
): TextHit[] {
  const q = normalizeText(query, opts.matchCase);
  if (!q) return [];
  const hits: TextHit[] = [];
  blocks.forEach((b, i) => {
    for (const [path, v] of flattenProps(b.props || {})) {
      if (typeof v !== "string") continue;
      if (NEVER_TEXT_KEYS.has(path.split(".").pop() || "")) continue;
      if (normalizeText(v, opts.matchCase).includes(q)) hits.push({ pageSlug, sectionIndex: i, blockType: b.type || "unknown", path, value: v });
    }
  });
  return hits;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Regex that matches `find` literally but tolerates curly/straight quotes and any whitespace run. */
function buildTolerantRegex(find: string, matchCase: boolean): RegExp {
  const src = escapeRegExp(normalizeText(find, true))
    .replace(/'/g, "['\u2018\u2019\u201B]")
    .replace(/"/g, '["\u201C\u201D\u201F]')
    .replace(/ /g, "[\\s\u00A0]+");
  return new RegExp(src, matchCase ? "g" : "gi");
}

export function replaceTextInProps(
  props: Record<string, unknown>,
  find: string,
  replace: string,
  opts: { matchCase?: boolean; wholeValue?: boolean } = {},
): { props: Record<string, unknown>; changes: Array<{ path: string; before: string; after: string }> } {
  const next = JSON.parse(JSON.stringify(props)) as Record<string, unknown>;
  const changes: Array<{ path: string; before: string; after: string }> = [];
  const findIsNonText = looksLikeNonText(find);
  const re = buildTolerantRegex(find, !!opts.matchCase);
  const target = normalizeText(find, !!opts.matchCase);

  const visit = (node: any, prefix: string) => {
    const keys = Array.isArray(node) ? node.map((_, i) => String(i)) : Object.keys(node);
    for (const k of keys) {
      const v = node[k as any];
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") {
        if (NEVER_TEXT_KEYS.has(k)) continue;
        if (!findIsNonText && looksLikeNonText(v)) continue;
        let after: string | null = null;
        if (opts.wholeValue) {
          if (normalizeText(v, !!opts.matchCase) === target) after = replace;
        } else {
          re.lastIndex = 0;
          if (re.test(v)) {
            re.lastIndex = 0;
            after = v.replace(re, () => replace);
          }
        }
        if (after !== null && after !== v) {
          node[k as any] = after;
          changes.push({ path, before: v, after });
        }
      } else if (v && typeof v === "object") {
        visit(v, path);
      }
    }
  };
  visit(next, "");
  return { props: next, changes };
}
