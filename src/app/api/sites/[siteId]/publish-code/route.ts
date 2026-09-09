import { NextRequest } from "next/server";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publishSandboxProject, PublishError } from "@/lib/sandbox/publish";

export const maxDuration = 300;

type Params = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const session = await prisma.sandboxSession.findFirst({
    where: { siteId, status: "ready" },
    orderBy: { updatedAt: "desc" },
  });
  if (!session) return error("No live sandbox found for this site. Generate the site first.", 400);

  try {
    const { buildPath } = await publishSandboxProject(siteId, session.externalId);
    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { slug: true } });
    return success({ published: true, buildPath, liveUrl: `/store/${site?.slug}` });
  } catch (err) {
    if (err instanceof PublishError) return error(err.message, 400);
    console.error("Publish error:", err);
    return error("Publish failed. Please try again.", 500);
  }
}
