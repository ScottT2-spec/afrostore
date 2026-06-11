import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./auth";
import { prisma } from "./db";
import { slugify, generateId } from "./utils";

export function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function validationError(errors: unknown) {
  return NextResponse.json(
    { success: false, error: "Validation failed", details: errors },
    { status: 422 }
  );
}

// Get authenticated user + verify store ownership/membership
export async function getStoreContext(req: NextRequest, storeId: string) {
  const user = await getAuthUser(req);
  if (!user) return { user: null, store: null, error: "Unauthorized" };

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { members: true },
  });

  if (!store) return { user, store: null, error: "Store not found" };

  const isOwner = store.ownerId === user.id;
  const isMember = store.members.some((m) => m.userId === user.id);
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    return { user, store: null, error: "Forbidden" };
  }

  return { user, store, error: null };
}

export function generateOrderNumber(): string {
  const prefix = "AF";
  const num = Math.floor(1000 + Math.random() * 9000);
  const suffix = generateId().slice(0, 4).toUpperCase();
  return `${prefix}-${num}${suffix}`;
}

export function generateSubdomain(name: string): string {
  return slugify(name).slice(0, 30) || `store-${generateId().slice(0, 6)}`;
}

export async function ensureUniqueSlug(
  name: string,
  storeId: string,
  model: "product" | "category" | "page"
): Promise<string> {
  let slug = slugify(name);
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    let exists: unknown;

    if (model === "product") {
      exists = await prisma.product.findUnique({
        where: { storeId_slug: { storeId, slug: candidate } },
      });
    } else if (model === "category") {
      exists = await prisma.category.findUnique({
        where: { storeId_slug: { storeId, slug: candidate } },
      });
    } else {
      exists = await prisma.page.findUnique({
        where: { storeId_slug: { storeId, slug: candidate } },
      });
    }

    if (!exists) return candidate;
    counter++;
  }
}

// Audit logging
export async function logAudit(params: {
  storeId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: {
      storeId: params.storeId,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before ? JSON.parse(JSON.stringify(params.before)) : undefined,
      after: params.after ? JSON.parse(JSON.stringify(params.after)) : undefined,
      ip: params.ip,
    },
  });
}
