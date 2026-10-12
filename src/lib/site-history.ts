import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSiteContext, requireRole } from "@/lib/api-helpers";
import { Prisma } from "@/generated/prisma";

/**
 * Site History: whole-site snapshots (every page + the site-wide
 * customization). The first snapshot for a site is its "Original" state.
 * Restoring a snapshot puts the entire site back; the state it replaces is
 * saved first so a restore can itself be undone.
 */

const CUSTOMIZATION_FIELDS = [
  "themeSettings",
  "pageSettings",
  "sectionSettings",
  "blockSettings",
  "navigationSettings",
  "footerSettings",
  "headerSettings",
  "mediaAssets",
  "seoSettings",
  "customCss",
  "customJs",
] as const;

export interface SnapshotPage {
  id: string;
  title: string;
  slug: string;
  type: string;
  content: unknown;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  position: number;
  template: string | null;
}

export interface SiteSnapshot {
  pages: SnapshotPage[];
  customization: Record<string, unknown> | null;
}

export type SiteVersionSource = "ai" | "manual" | "restore";

// Saves from the same person this close together are folded into one history
// entry, so an editor that saves every few seconds doesn't bury the list.
const GROUP_WINDOW_MS = 2 * 60 * 1000;

export async function buildSiteSnapshot(siteId: string): Promise<SiteSnapshot> {
  const [pages, customization] = await Promise.all([
    prisma.page.findMany({
      where: { siteId },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
        position: true,
        template: true,
      },
      orderBy: { position: "asc" },
    }),
    prisma.siteCustomization.findUnique({ where: { siteId } }).catch(() => null),
  ]);

  let customizationSnapshot: Record<string, unknown> | null = null;
  if (customization) {
    customizationSnapshot = {};
    for (const field of CUSTOMIZATION_FIELDS) {
      customizationSnapshot[field] = (customization as Record<string, unknown>)[field] ?? null;
    }
  }

  return { pages: pages as SnapshotPage[], customization: customizationSnapshot };
}

function sameSnapshot(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Call BEFORE the first change a person makes to a site: if the site has no
 * history yet, its current state is saved as the "Original". Never throws —
 * history must not be able to break a save.
 */
export async function captureOriginalIfMissing(siteId: string): Promise<void> {
  try {
    const count = await prisma.siteVersion.count({ where: { siteId } });
    if (count > 0) return;
    const snapshot = await buildSiteSnapshot(siteId);
    if (snapshot.pages.length === 0) return;
    await prisma.siteVersion.create({
      data: {
        siteId,
        source: "ai",
        label: "Original (AI generated)",
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("site-history: captureOriginalIfMissing failed", err);
  }
}

/**
 * Call AFTER a change is saved. Records the site's new state, skipping
 * no-op saves and folding rapid saves by the same person into one entry.
 * Never throws.
 */
export async function recordSiteVersion(
  siteId: string,
  opts: { source: SiteVersionSource; label?: string; userId?: string | null }
): Promise<void> {
  try {
    const snapshot = await buildSiteSnapshot(siteId);
    if (snapshot.pages.length === 0) return;

    const latest = await prisma.siteVersion.findFirst({
      where: { siteId },
      orderBy: { createdAt: "desc" },
    });

    if (latest && sameSnapshot(latest.snapshot, snapshot)) return;

    const userId = opts.userId ?? null;
    const canFold =
      latest &&
      opts.source === "manual" &&
      latest.source === "manual" &&
      latest.createdBy === userId &&
      Date.now() - latest.createdAt.getTime() < GROUP_WINDOW_MS;

    if (canFold && latest) {
      await prisma.siteVersion.update({
        where: { id: latest.id },
        data: { snapshot: snapshot as unknown as Prisma.InputJsonValue, createdAt: new Date() },
      });
      return;
    }

    await prisma.siteVersion.create({
      data: {
        siteId,
        source: opts.source,
        label: opts.label ?? null,
        createdBy: userId,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("site-history: recordSiteVersion failed", err);
  }
}

/** Put the whole site back to a saved version. */
export async function restoreSiteVersion(
  siteId: string,
  versionId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const version = await prisma.siteVersion.findFirst({ where: { id: versionId, siteId } });
  if (!version) return { ok: false, status: 404, message: "Version not found" };

  const target = version.snapshot as unknown as SiteSnapshot;
  if (!target || !Array.isArray(target.pages)) {
    return { ok: false, status: 422, message: "This version can't be restored" };
  }

  // Save where the site is right now, so the restore can be undone.
  await captureOriginalIfMissing(siteId);
  await recordSiteVersion(siteId, { source: "manual", label: "Before restore", userId });

  const current = await prisma.page.findMany({ where: { siteId }, select: { id: true, slug: true } });
  const currentIds = new Set(current.map((p) => p.id));
  const targetIds = new Set(target.pages.map((p) => p.id));

  await prisma.$transaction(async (tx) => {
    // Pages that exist now but didn't then are taken off the site, not
    // deleted: other things (funnels, A/B tests) may still point at them.
    const extra = current.filter((p) => !targetIds.has(p.id)).map((p) => p.id);
    if (extra.length) {
      await tx.page.updateMany({ where: { id: { in: extra }, siteId }, data: { isPublished: false } });
    }

    // Free the slugs first so pages that swapped slugs can't collide.
    for (const p of target.pages) {
      if (currentIds.has(p.id)) {
        await tx.page.update({ where: { id: p.id }, data: { slug: `__restoring_${p.id}` } });
      }
    }

    for (const p of target.pages) {
      const data = {
        title: p.title,
        slug: p.slug,
        type: p.type as Prisma.PageCreateInput["type"],
        content: (p.content ?? Prisma.DbNull) as Prisma.InputJsonValue,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        isPublished: p.isPublished,
        position: p.position,
        template: p.template,
      };
      if (currentIds.has(p.id)) {
        await tx.page.update({ where: { id: p.id }, data });
      } else {
        // A page deleted since then comes back under its old id. If something
        // else now owns its slug, give the restored page a free one.
        const clash = await tx.page.findFirst({ where: { siteId, slug: p.slug } });
        await tx.page.create({
          data: { id: p.id, siteId, ...data, slug: clash ? `${p.slug}-restored` : p.slug },
        });
      }
    }

    if (target.customization) {
      const c = target.customization;
      const fields = Object.fromEntries(
        CUSTOMIZATION_FIELDS.map((f) => {
          const v = c[f];
          const isJson = f !== "customCss" && f !== "customJs";
          return [f, isJson ? ((v ?? Prisma.DbNull) as Prisma.InputJsonValue) : ((v as string | null) ?? null)];
        })
      );
      const existing = await tx.siteCustomization.findUnique({ where: { siteId } });
      if (existing) {
        await tx.siteCustomization.update({
          where: { siteId },
          data: {
            ...fields,
            currentVersion: existing.currentVersion + 1,
            publishedVersion: existing.currentVersion + 1,
            lastPublishedAt: new Date(),
          },
        });
      } else {
        await tx.siteCustomization.create({ data: { siteId, ...fields } });
      }
    }
  });

  await recordSiteVersion(siteId, {
    source: "restore",
    label: `Restored from ${version.createdAt.toISOString()}`,
    userId,
  });

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { slug: true } });
  if (site?.slug) {
    revalidatePath(`/store/${site.slug}`);
    revalidatePath(`/store/${site.slug}/[pageSlug]`, "page");
    revalidatePath(`/api/storefront/${site.slug}`);
  }
  return { ok: true };
}

/**
 * For the storefront data routes: when the request carries
 * ?historyPreview=<versionId> AND the caller is signed in as staff (or
 * better) on that site, return that version's snapshot so the real
 * storefront can render the site as it was. Anyone else gets null and sees
 * the live site, so a guessed id leaks nothing.
 */
export async function loadHistoryPreview(req: NextRequest, siteId: string): Promise<SiteSnapshot | null> {
  const versionId = req.nextUrl.searchParams.get("historyPreview");
  if (!versionId) return null;
  try {
    const ctx = await getSiteContext(req, siteId);
    if (ctx.error || requireRole(ctx, "STAFF")) return null;
    const version = await prisma.siteVersion.findFirst({ where: { id: versionId, siteId } });
    const snap = version?.snapshot as unknown as SiteSnapshot | undefined;
    return snap && Array.isArray(snap.pages) ? snap : null;
  } catch (err) {
    console.error("site-history: loadHistoryPreview failed", err);
    return null;
  }
}
