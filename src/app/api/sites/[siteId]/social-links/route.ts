import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/social-links — upsert (create-or-update), and
// only overwrite fields that were actually sent so this can't accidentally
// blank out a link the merchant set some other way.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "ADMIN");
  if (roleErr) return roleErr;

  const body = await req.json();
  const fields: Record<string, string> = {};
  for (const key of ["instagram", "facebook", "tiktok", "twitter", "whatsapp", "linkedin"] as const) {
    const v = typeof body[key] === "string" ? body[key].trim() : "";
    if (v) fields[key] = v;
  }
  if (Object.keys(fields).length === 0) return success({ updated: false });

  const saved = await prisma.siteSocialLinks.upsert({
    where: { siteId },
    create: { siteId, ...fields },
    update: fields,
  });

  return success(saved);
}
