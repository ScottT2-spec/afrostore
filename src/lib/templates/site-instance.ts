type PageLike = {
  slug?: string | null;
  id?: string | null;
  content?: unknown;
  template?: unknown;
};

const isPageLike = (value: unknown): value is PageLike => {
  return Boolean(value) && typeof value === "object";
};

const getPageKey = (page: PageLike | null | undefined): string | null => {
  if (!page) return null;
  if (typeof page.slug === "string" && page.slug.trim()) return page.slug;
  if (typeof page.id === "string" && page.id.trim()) return page.id;
  return null;
};

export function mergeStoredTemplatePages<T extends PageLike>(pages: T[], templatePages?: unknown): T[] {
  const storedPages = Array.isArray(pages) ? pages.filter(isPageLike) : [];
  const normalizedTemplatePages = normalizeStoredTemplatePages(templatePages);
  if (normalizedTemplatePages.length === 0) return pages;

  const seen = new Set<string>();
  const merged: PageLike[] = [];

  for (const page of storedPages) {
    const key = getPageKey(page);
    if (key) seen.add(key);
    merged.push(page);
  }

  for (const templatePage of normalizedTemplatePages) {
    if (!isPageLike(templatePage)) continue;
    const key = getPageKey(templatePage);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    merged.push(templatePage);
  }

  return merged as T[];
}

export function findStoredTemplatePage(templatePages: unknown, slug: string): PageLike | null {
  if (!Array.isArray(templatePages)) return null;
  return ((templatePages as unknown[]).find((page) => isPageLike(page) && getPageKey(page) === slug) as PageLike | null) || null;
}

export function normalizeStoredTemplatePages(pages: unknown): unknown[] {
  if (!Array.isArray(pages)) return [];
  return pages.filter(Boolean);
}
