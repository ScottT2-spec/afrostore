import { isLegacyScaffoldBlocks, parsePageContent } from "@/lib/page-content";

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

function hasRenderableContent(page: { content?: unknown }): boolean {
  const content = page.content;
  if (Array.isArray(content)) return content.length > 0;
  if (!content || typeof content !== "object") return false;

  const raw = content as Record<string, unknown>;
  if (Array.isArray(raw.blocks)) return raw.blocks.length > 0;
  return false;
}

function shouldUseDatabaseContent(page: { content?: unknown }): boolean {
  if (!hasRenderableContent(page)) return false;
  const { blocks } = parsePageContent(page.content);
  return !isLegacyScaffoldBlocks(blocks);
}

export function mergeStoredTemplatePages<
  T extends { id?: string; slug: string; title?: string; content?: unknown; type?: string; template?: string | null }
>(databasePages: T[], storedPages: unknown): T[] {
  const normalizedStored = normalizeStoredTemplatePages(storedPages);
  if (normalizedStored.length === 0) return databasePages;

  const storedBySlug = new Map(normalizedStored.map((page) => [page.slug.toLowerCase(), page] as const));
  const mergedPages: T[] = [];
  const consumed = new Set<string>();

  for (const databasePage of databasePages) {
    const storedPage = storedBySlug.get(databasePage.slug.toLowerCase()) || storedBySlug.get((databasePage.title || "").toLowerCase());
    if (!storedPage) {
      mergedPages.push(databasePage);
      continue;
    }

    consumed.add(storedPage.slug.toLowerCase());

    if (shouldUseDatabaseContent(databasePage)) {
      mergedPages.push({
        ...databasePage,
        template: databasePage.template ?? storedPage.template ?? null,
      });
      continue;
    }

    mergedPages.push({
      ...databasePage,
      id: databasePage.id || storedPage.id,
      title: storedPage.title || databasePage.title,
      slug: storedPage.slug || databasePage.slug,
      type: storedPage.type || databasePage.type,
      content: storedPage.content,
      template: storedPage.template ?? databasePage.template ?? null,
    });
  }

  for (const storedPage of normalizedStored) {
    if (consumed.has(storedPage.slug.toLowerCase())) continue;
    mergedPages.push(storedPage as unknown as T);
  }

  return mergedPages;
}
