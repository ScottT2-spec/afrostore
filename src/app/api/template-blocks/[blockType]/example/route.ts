import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { success, error } from "@/lib/api-helpers";
import { parsePageContent } from "@/lib/page-content";
import type { EditorNode } from "@/lib/visual-editor/node-tree";

type Params = { params: Promise<{ blockType: string }> };

// Only allow fetching example content for block types that are actually
// registered on the storefront - prevents this becoming an arbitrary
// "search page content" endpoint.
const BLOCK_TYPE_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/;

function findNodeByType(nodes: EditorNode[] | undefined, type: string): EditorNode | null {
  if (!Array.isArray(nodes)) return null;
  for (const node of nodes) {
    if (!node) continue;
    if ((node as any).type === type) return node;

    const nested =
      findNodeByType((node as any).elements, type) ||
      findNodeByType((node as any).children, type) ||
      findNodeByType((node as any).columns, type);
    if (nested) return nested;
  }
  return null;
}

// GET /api/template-blocks/:blockType/example
// Finds a real, already-in-use instance of this block type from any
// existing page and returns its settings/content, so a newly inserted
// section starts from production-quality data instead of a guessed
// placeholder shape.
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { blockType } = await params;
  if (!blockType || !BLOCK_TYPE_PATTERN.test(blockType)) {
    return error("Invalid block type", 400);
  }

  try {
    // Cheap text pre-filter at the DB level (content cast to text) to
    // avoid pulling every page in the workspace into memory - Postgres
    // handles a LIKE scan over a bounded LIMIT fine here. This can
    // return false positives (e.g. the string appearing in an unrelated
    // field), so the real match is confirmed by walking the parsed tree
    // below rather than trusting this filter alone.
    const candidates = await prisma.$queryRaw<Array<{ id: string; content: unknown }>>`
      SELECT id, content FROM pages
      WHERE content::text LIKE ${"%\"type\":\"" + blockType + "\"%"}
      LIMIT 25
    `;

    for (const page of candidates) {
      const parsed = parsePageContent(page.content);
      const match = findNodeByType(parsed.elements, blockType);
      if (match) {
        return success({
          found: true,
          settings: (match as any).settings || {},
          content: (match as any).content || {},
        });
      }
    }

    return success({ found: false, settings: {}, content: {} });
  } catch (err) {
    console.error("Error fetching template block example:", err);
    return error("Failed to fetch example content", 500);
  }
}
