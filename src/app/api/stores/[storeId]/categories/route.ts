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

export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return error("Category id is required", 400);

  const cat = await prisma.category.findFirst({ where: { id, storeId } });
  if (!cat) return error("Category not found", 404);

  if (data.name && data.name !== cat.name && !data.slug) {
    data.slug = await ensureUniqueSlug(data.name, storeId, "category");
  }

  const updated = await prisma.category.update({
    where: { id },
    data,
    include: { children: true, _count: { select: { products: true } } },
  });

  return success(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return error("Category id is required", 400);

  const cat = await prisma.category.findFirst({ where: { id, storeId } });
  if (!cat) return error("Category not found", 404);

  // Unparent children and unlink products
  await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
  await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id } });

  return success({ deleted: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return error("Category id is required", 400);

  const category = await prisma.category.findFirst({ where: { id, storeId } });
  if (!category) return error("Category not found", 404);

  const updated = await prisma.category.update({
    where: { id },
    data,
  });

  return success(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return error("Category id is required", 400);

  const category = await prisma.category.findFirst({ where: { id, storeId } });
  if (!category) return error("Category not found", 404);

  await prisma.category.delete({ where: { id } });
  return success({ deleted: true });
}
