import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug } from "@/lib/api-helpers";
import { createCategorySchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const categories = await prisma.category.findMany({
    where: { storeId },
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { position: "asc" },
  });

  return success(categories);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const slug = await ensureUniqueSlug(parsed.data.name, storeId, "category");

  const category = await prisma.category.create({
    data: { storeId, slug, ...parsed.data },
  });

  return success(category, 201);
}
