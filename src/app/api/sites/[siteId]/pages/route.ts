import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import { createPageSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/pages
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const isPublished = url.searchParams.get("isPublished");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (type) where.type = type;
  if (isPublished !== null && isPublished !== undefined) {
    where.isPublished = isPublished === "true";
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where: where as any,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.page.count({ where: where as any }),
  ]);

  return success({
    pages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/pages
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const slug = await ensureUniqueSlug(parsed.data.title, siteId, "page");

    const page = await prisma.page.create({
      data: {
        siteId,
        slug,
        ...parsed.data,
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "page",
      entityId: page.id,
      after: page,
    });

    return success(page, 201);
  } catch (err) {
    console.error("Create page error:", err);
    return error("Internal server error", 500);
  }
}