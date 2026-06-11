import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import { createPageSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/stores/:storeId/pages
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const isPublished = url.searchParams.get("isPublished");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { storeId };
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

// POST /api/stores/:storeId/pages
export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const slug = await ensureUniqueSlug(parsed.data.title, storeId, "page");

    const page = await prisma.page.create({
      data: {
        storeId,
        slug,
        ...parsed.data,
      },
    });

    await logAudit({
      storeId,
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