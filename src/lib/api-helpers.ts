import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./auth";
import { prisma } from "./db";
import { slugify, generateId } from "./utils";

/**
 * Recursively convert Prisma Decimal objects to plain numbers in API responses.
 */
function serializeDecimals(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && obj !== null && 'toNumber' in obj && typeof (obj as any).toNumber === 'function') {
    return (obj as any).toNumber();
  }
  if (Array.isArray(obj)) return obj.map(serializeDecimals);
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDecimals(value);
    }
    return result;
  }
  return obj;
}

export function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data: serializeDecimals(data) }, { status });
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

/**
 * Generate a collision-resistant order number.
 * Format: AF-{timestamp36}-{random4}  →  e.g. "AF-LZ4K8W-9F3A"
 * 
 * The timestamp component (base-36 encoded ms since epoch) ensures
 * uniqueness across time, while the random suffix handles concurrent
 * orders within the same millisecond. This gives effectively unlimited
 * unique order numbers without DB sequence dependency.
 * 
 * The caller should still handle the (astronomically unlikely) unique
 * constraint violation with a single retry.
 */
export function generateOrderNumber(): string {
  const prefix = "AF";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
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
