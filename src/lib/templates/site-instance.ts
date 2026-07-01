export interface StoredTemplatePage {
  id: string;
  title: string;
  slug: string;
  type: string;
  content: unknown[];
  metaTitle?: string;
  metaDescription?: string;
  template?: string | null;
}

export function normalizeStoredTemplatePages(value: unknown): StoredTemplatePage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => {
      const title = typeof item.title === "string" ? item.title : `Page ${index + 1}`;
      const slug = typeof item.slug === "string" && item.slug ? item.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return {
        id: typeof item.id === "string" ? item.id : slug,
        title,
        slug,
        type: typeof item.type === "string" ? item.type : "CUSTOM",
        content: Array.isArray(item.content) ? item.content : [],
        metaTitle: typeof item.metaTitle === "string" ? item.metaTitle : undefined,
        metaDescription: typeof item.metaDescription === "string" ? item.metaDescription : undefined,
        template: typeof item.template === "string" ? item.template : null,
      } satisfies StoredTemplatePage;
    });
}

export function findStoredTemplatePage(pages: unknown, slug: string) {
  const normalizedPages = normalizeStoredTemplatePages(pages);
  const lowerSlug = slug.toLowerCase();
  return normalizedPages.find((page) => page.slug.toLowerCase() === lowerSlug || page.type.toLowerCase() === lowerSlug) || null;
}

export function mergeStoredTemplatePages<T extends { slug: string }>(databasePages: T[], storedPages: unknown): T[] {
  if (databasePages.length > 0) return databasePages;
  return normalizeStoredTemplatePages(storedPages) as unknown as T[];
}
