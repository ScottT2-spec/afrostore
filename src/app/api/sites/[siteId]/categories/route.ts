import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug , requireRole } from "@/lib/api-helpers";
import { createCategorySchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const categories = await prisma.category.findMany({
    where: { siteId },
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { position: "asc" },
  });

  return success(categories);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const slug = await ensureUniqueSlug(parsed.data.name, siteId, "category");

  const category = await prisma.category.create({
    data: { siteId, slug, ...parsed.data },
  });

  return success(category, 201);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return error("Category id is required", 400);

  const cat = await prisma.category.findFirst({ where: { id, siteId } });
  if (!cat) return error("Category not found", 404);

  // Prevent a category becoming its own ancestor (directly or via a chain
  // of parents) — nothing else in the app guards against this, and a
  // cycle here crashes the dashboard's recursive tree render (infinite
  // recursion building the child list) and would break storefront
  // category breadcrumbs too.
  if (typeof data.parentId === "string" && data.parentId) {
    if (data.parentId === id) {
      return error("A category cannot be its own parent", 400);
    }
    let walkId: string | null = data.parentId;
    const seen = new Set<string>();
    while (walkId) {
      if (walkId === id) return error("Cannot set parent: this would create a category loop", 400);
      if (seen.has(walkId)) break; // pre-existing cycle in the data — bail out rather than looping forever
      seen.add(walkId);
      const parent: { parentId: string | null } | null = await prisma.category.findUnique({ where: { id: walkId }, select: { parentId: true } });
      walkId = parent?.parentId ?? null;
    }
  }

  // Never trust a client-supplied slug blindly — categories.slug is
  // unique per site, and the dashboard form always sends *some* slug
  // (auto-derived from the name on every keystroke), so without this the
  // update would previously skip validation entirely and could crash
  // with an unhandled Prisma unique-constraint error the moment two
  // categories landed on the same slug (e.g. renaming "Shoes" to a name
  // that collides with another category already named "Shoes").
  if (typeof data.slug === "string") {
    const desired = data.slug.trim() || (data.name as string) || cat.name;
    const slugified = desired.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (slugified && slugified !== cat.slug) {
      data.slug = await ensureUniqueSlug(slugified, siteId, "category", cat.id);
    } else {
      delete data.slug; // unchanged — don't touch it
    }
  } else if (data.name && data.name !== cat.name) {
    data.slug = await ensureUniqueSlug(data.name, siteId, "category", cat.id);
  }

  const updated = await prisma.category.update({
    where: { id },
    data,
    include: { children: true, _count: { select: { products: true } } },
  });

  return success(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return error("Category id is required", 400);

  const cat = await prisma.category.findFirst({ where: { id, siteId } });
  if (!cat) return error("Category not found", 404);

  // Unparent children and unlink products
  await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
  await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id } });

  return success({ deleted: true });
}
