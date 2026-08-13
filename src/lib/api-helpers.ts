import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./auth";
import { prisma } from "./db";
import { slugify, generateId } from "./utils";

/**
 * Recursively convert Prisma Decimal objects to plain numbers in API responses.
 */
function serializeDecimals(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
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

/**
 * Use in API route catch blocks instead of a hardcoded "Internal server error"
 * string. Logs the full error server-side and returns the real message (plus
 * the Prisma error code when present, e.g. P2021 = table does not exist) so
 * the client-side error display actually shows what broke instead of a dead end.
 */
export function serverError(err: unknown, context?: string) {
  if (context) console.error(`${context}:`, err);
  else console.error(err);

  const message = err instanceof Error ? err.message : String(err);
  const code = typeof err === "object" && err !== null && "code" in err ? (err as { code?: string }).code : undefined;

  return NextResponse.json(
    { success: false, error: message || "Internal server error", code },
    { status: 500 }
  );
}

// Get authenticated user + verify site ownership/membership
export async function getSiteContext(req: NextRequest, siteId: string) {
  const user = await getAuthUser(req);
  if (!user) return { user: null, site: null, error: "Unauthorized" };

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { members: true, workspace: true },
  });

  if (!site) return { user, site: null, error: "Site not found" };

  // Check access: site owner (workspace owner), site member, workspace member, or platform admin
  const isWorkspaceOwner = site.workspace.ownerId === user.id;
  const isSiteMember = site.members.some((m) => m.userId === user.id);
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isWorkspaceOwner && !isSiteMember && !isAdmin) {
    return { user, site: null, error: "Forbidden" };
  }

  return { user, site, error: null };
}

// Backward compat alias
export const getStoreContext = getSiteContext;

/**
 * Effective role of the caller on a site, as returned by getSiteContext.
 * OWNER and platform ADMIN/SUPER_ADMIN always outrank any SiteMember row.
 * Higher index = more privileged.
 *
 * SiteMemberRole (the Prisma enum) actually has 9 values — OWNER, ADMIN,
 * MANAGER, EDITOR, MARKETER, SUPPORT, DEVELOPER, STAFF, VIEWER — but the
 * Team page UI only ever assigns ADMIN/STAFF/VIEWER, so the other 5 are
 * unused today. They're mapped here anyway rather than left out: an
 * unmapped role must never silently bypass requireRole. Without an entry,
 * ROLE_RANK[role] is undefined, and `undefined < <number>` is always false
 * in JS — meaning an unrecognized role would pass every permission check
 * instead of failing it. MANAGER ranks with ADMIN (broad operational
 * authority); EDITOR/MARKETER/SUPPORT/DEVELOPER rank with STAFF.
 */
const ROLE_RANK = {
  VIEWER: 0,
  SUPPORT: 1,
  MARKETER: 1,
  EDITOR: 1,
  DEVELOPER: 1,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 2,
  OWNER: 3,
} as const;
export type EffectiveRole = keyof typeof ROLE_RANK;

export function getEffectiveRole(
  ctx: Awaited<ReturnType<typeof getSiteContext>>
): EffectiveRole | null {
  if (!ctx.site || !ctx.user) return null;
  if (ctx.site.workspace.ownerId === ctx.user.id) return "OWNER";
  if (ctx.user.role === "ADMIN" || ctx.user.role === "SUPER_ADMIN") return "OWNER"; // platform admin, treat as full access
  const member = ctx.site.members.find((m) => m.userId === ctx.user!.id);
  if (!member) return null;
  // Defensive fallback: any role value not in ROLE_RANK (shouldn't happen,
  // but the enum is broader than what the UI assigns) is treated as the
  // least-privileged tier rather than silently passing every check.
  return (member.role in ROLE_RANK ? member.role : "VIEWER") as EffectiveRole;
}

/**
 * Enforce a minimum role for a route. getSiteContext/getStoreContext only
 * proves site membership — it does NOT check the member's role (STAFF vs
 * VIEWER vs ADMIN), so any route handling something sensitive (payment
 * credentials, site settings, financials) must call this explicitly.
 *
 * Returns an error() response to short-circuit with if the caller doesn't
 * meet the bar, or null if they're cleared to proceed.
 */
export function requireRole(
  ctx: Awaited<ReturnType<typeof getSiteContext>>,
  minRole: EffectiveRole
) {
  const role = getEffectiveRole(ctx);
  if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
    return error(`This action requires ${minRole === "ADMIN" ? "an admin" : minRole.toLowerCase()} role or higher`, 403);
  }
  return null;
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

/**
 * Create a Site with a guaranteed-unique slug, retrying on an actual
 * collision instead of only checking beforehand. Site.slug is a globally
 * unique column (not scoped per-workspace), and a plain "check if it
 * exists, then create" has two real failure modes that both crash with a
 * raw Prisma P2002 error: two requests racing between the check and the
 * create, and a "unique" candidate slug that turns out to already be
 * taken by a site in a completely different workspace (easy to miss if
 * the existence check was scoped to the current workspace instead of
 * checked globally). buildData receives the candidate slug and returns
 * the full create payload for that attempt.
 */
export async function createSiteWithUniqueSlug<T>(
  baseName: string,
  buildData: (slug: string) => Parameters<typeof prisma.site.create>[0]["data"],
  maxAttempts = 5
): Promise<T> {
  const base = slugify(baseName) || `store-${generateId().slice(0, 6)}`;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateSlug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      return (await prisma.site.create({ data: buildData(candidateSlug) })) as T;
    } catch (err: any) {
      lastErr = err;
      if (err?.code === "P2002") continue; // slug or subdomain collision — try a new suffix
      throw err;
    }
  }
  throw lastErr;
}

export async function ensureUniqueSlug(
  name: string,
  siteId: string,
  model: "product" | "category" | "page",
  excludeId?: string
): Promise<string> {
  let slug = slugify(name);
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    let exists: unknown;

    if (model === "product") {
      exists = excludeId
        ? await prisma.product.findFirst({ where: { siteId, slug: candidate, id: { not: excludeId } } })
        : await prisma.product.findUnique({
            where: { siteId_slug: { siteId, slug: candidate } },
          });
    } else if (model === "category") {
      exists = excludeId
        ? await prisma.category.findFirst({ where: { siteId, slug: candidate, id: { not: excludeId } } })
        : await prisma.category.findUnique({
            where: { siteId_slug: { siteId, slug: candidate } },
          });
    } else {
      exists = excludeId
        ? await prisma.page.findFirst({ where: { siteId, slug: candidate, id: { not: excludeId } } })
        : await prisma.page.findUnique({
            where: { siteId_slug: { siteId, slug: candidate } },
          });
    }

    if (!exists) return candidate;
    counter++;
  }
}

// Audit logging
export async function logAudit(params: {
  siteId: string;
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
      siteId: params.siteId,
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
