const RELATION_TEXT_KEYS = ["name", "title", "label", "text", "value", "slug", "id"] as const;
const NESTED_PROP_KEYS = new Set([
  "buttons",
  "slides",
  "categories",
  "items",
  "features",
  "products",
  "tabs",
  "testimonials",
  "posts",
  "socialLinks",
  "elements",
  "styleOverrides",
  "resolvedStyles",
  "resolvedClasses",
  "overlayStyles",
  "variants",
  "images",
  "links",
  "actions",
  "options",
  "filters",
  "cards",
  "banners",
]);
const ARRAY_PROP_KEYS = new Set([
  "actions",
  "banners",
  "buttons",
  "cards",
  "bodyText",
  "categories",
  "counters",
  "boxes",
  "elements",
  "features",
  "fields",
  "faqs",
  "filters",
  "hours",
  "images",
  "items",
  "links",
  "linkColumns",
  "members",
  "menuItems",
  "navItems",
  "navPages",
  "offices",
  "options",
  "paragraphs",
  "posts",
  "postItems",
  "productImages",
  "products",
  "reviews",
  "recentPosts",
  "sections",
  "services",
  "slides",
  "steps",
  "tabs",
  "testimonials",
  "team",
  "teamItems",
  "featureItems",
  "catItems",
  "faqItems",
  "ingredients",
  "experts",
  "brands",
  "socials",
  "infoboxes",
  "swatches",
  "variants",
  "videos",
]);

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function toDisplayText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => toDisplayText(item, ""))
      .filter(Boolean)
      .join(", ");
  }
  if (!isPlainObject(value)) return fallback;

  for (const key of RELATION_TEXT_KEYS) {
    const entry = value[key];
    if (typeof entry === "string" && entry.trim()) return entry;
    if (typeof entry === "number") return String(entry);
  }

  if (typeof value.href === "string" && value.href.trim()) return value.href;
  if (typeof value.url === "string" && value.url.trim()) return value.url;

  return fallback;
}

export function normalizeTextArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    const items = value.map((item) => toDisplayText(item, "")).filter(Boolean);
    return items.length > 0 ? items : fallback;
  }
  const text = toDisplayText(value, "");
  return text ? [text] : fallback;
}

export function normalizeObjectArray<T extends Record<string, unknown>>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  if (isPlainObject(value)) return [value as T];
  return fallback;
}

export function normalizeArrayValue<T = unknown>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return fallback;
  return [value as T];
}

export function normalizeSocialLinks(value: unknown): Array<{ platform: string; url: string }> {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!isPlainObject(item)) return null;
        const platform = toDisplayText(item.platform, "").trim();
        const url = toDisplayText(item.url, "").trim();
        if (!platform || !url) return null;
        return { platform, url };
      })
      .filter((item): item is { platform: string; url: string } => Boolean(item));
  }

  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([platform, url]) => {
        const resolvedUrl = toDisplayText(url, "").trim();
        return resolvedUrl ? { platform, url: resolvedUrl } : null;
      })
      .filter((item): item is { platform: string; url: string } => Boolean(item));
  }

  return [];
}

export function normalizeStorefrontTemplateProps(props: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === "socialLinks") {
      normalized[key] = normalizeSocialLinks(value);
      continue;
    }

    if (key === "tabs") {
      normalized[key] = normalizeTextArray(value, []);
      continue;
    }

    if (ARRAY_PROP_KEYS.has(key)) {
      normalized[key] = normalizeArrayValue(value, []);
      continue;
    }

    if (Array.isArray(value) || value == null || typeof value !== "object") {
      normalized[key] = value;
      continue;
    }

    if (NESTED_PROP_KEYS.has(key)) {
      normalized[key] = value;
      continue;
    }

    const textValue = toDisplayText(value, "");
    if (textValue) {
      normalized[key] = textValue;
      continue;
    }

    normalized[key] = value;
  }

  for (const key of ARRAY_PROP_KEYS) {
    if (!(key in normalized)) {
      normalized[key] = [];
    }
  }

  if (!("socialLinks" in normalized)) {
    normalized.socialLinks = [];
  }
  if (!("tabs" in normalized)) {
    normalized.tabs = [];
  }

  return normalized;
}

const TEXT_RESOLVE_FALLBACK_KEYS = ["title", "titleLine1", "titleLine2", "subtitle", "description", "text", "label", "name", "buttonText", "buttonLink", "link", "href"] as const;

function extractNodeSettings(node: unknown): Record<string, unknown> {
  if (!isPlainObject(node)) return {};
  const result: Record<string, unknown> = {};

  for (const key of ["settings", "props", "content"] as const) {
    const value = node[key];
    if (isPlainObject(value)) {
      Object.assign(result, value);
    }
  }

  for (const key of TEXT_RESOLVE_FALLBACK_KEYS) {
    const value = (node as Record<string, unknown>)[key];
    if (value !== undefined && value !== null && result[key] === undefined) {
      result[key] = value;
    }
  }

  return result;
}

export function resolveNestedNodeText(node: unknown, keys: string[], fallback = ""): string {
  const queue: unknown[] = [node];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current) || !isPlainObject(current)) continue;
    visited.add(current);

    const settings = extractNodeSettings(current);
    for (const key of keys) {
      const value = settings[key];
      if (typeof value === "string" && value.trim()) {
        if (value.trim().toLowerCase() === key.toLowerCase()) continue;
        return value;
      }
      if (typeof value === "number") return String(value);
    }

    const nested = [
      current.elements,
      current.children,
      current.slides,
    ];
    for (const entry of nested) {
      if (Array.isArray(entry)) {
        queue.push(...entry);
      }
    }
  }

  return fallback;
}
