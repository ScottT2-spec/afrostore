import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/remove-footer
// Removes fashionFooter block from homepage content
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const removeBlockTypeFromNodes = (nodes: any[], type: string): any[] =>
    nodes
      .filter((node) => node?.type !== type)
      .map((node) => {
        if (Array.isArray(node?.elements)) {
          return { ...node, elements: removeBlockTypeFromNodes(node.elements, type) };
        }
        return node;
      });

  try {
    const store = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug },
          { subdomain: slug },
          { customDomain: slug },
        ],
      },
      select: { id: true },
    });

    if (!store) {
      return error("Store not found", 404);
    }

    const homePage = await prisma.page.findFirst({
      where: { siteId: store.id, type: "HOME" },
    });

    if (!homePage) {
      return error("Homepage not found", 404);
    }

    const content = homePage.content as any;
    if (content && Array.isArray(content.elements)) {
      const filteredElements = removeBlockTypeFromNodes(content.elements, "fashionFooter");

      if (filteredElements.length !== content.elements.length) {
        await prisma.page.update({
          where: { id: homePage.id },
          data: {
            content: {
              ...content,
              elements: filteredElements,
            },
          },
        });

        return success({
          message: "Footer block removed from homepage",
          removedCount: content.elements.length - filteredElements.length,
        });
      }

      return success({
        message: "No footer blocks found in homepage content",
      });
    }

    if (content && content.blocks && Array.isArray(content.blocks)) {
      const filteredBlocks = content.blocks.filter((block: any) => block.type !== "fashionFooter");

      if (filteredBlocks.length !== content.blocks.length) {
        await prisma.page.update({
          where: { id: homePage.id },
          data: {
            content: {
              ...content,
              blocks: filteredBlocks,
            },
          },
        });

        return success({
          message: "Footer block removed from homepage",
          removedCount: content.blocks.length - filteredBlocks.length,
        });
      }

      return success({
        message: "No footer blocks found in homepage content",
      });
    }

    return error("Homepage content is not in expected format", 400);
  } catch (err) {
    console.error("Remove footer error:", err);
    return error("Internal server error", 500);
  }
}
