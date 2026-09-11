import { NextRequest } from "next/server";
import { getStoreContext, success, error, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publishSandboxProject, PublishError } from "@/lib/sandbox/publish";
import { createSandboxWithFiles, getSandboxStatus } from "@/lib/sandbox/daytona";
import { getStandardScaffold } from "@/lib/sandbox/scaffold";
import { getGeneratedFiles } from "@/lib/sandbox/generated-files";
import { getDecryptedSecrets } from "@/lib/sandbox/secrets";

export const maxDuration = 300;

type Params = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  // Same liveness check + recovery as generate-code/route.ts: Daytona
  // auto-stops idle sandboxes (30 min), and nothing updates
  // SandboxSession.status when that happens — the DB can say "ready"
  // for a container that's no longer actually running. Publishing is
  // exactly the kind of action a merchant might take a while after
  // generating (review, think it over, come back later), so this isn't
  // an edge case here, it's the expected case. Recovery mirrors
  // generate-code exactly: a fresh sandbox seeded with this site's
  // persisted GeneratedFile rows, not a blank scaffold.
  let session = await prisma.sandboxSession.findFirst({
    where: { siteId, status: "ready" },
    orderBy: { updatedAt: "desc" },
  });

  if (session) {
    const liveStatus = await getSandboxStatus(session.externalId);
    if (liveStatus !== "ready") session = null;
  }

  if (!session) {
    const persisted = await getGeneratedFiles(siteId);
    if (Object.keys(persisted).length === 0) {
      return error("No generated site found to publish. Generate the site first.", 400);
    }
    session = await prisma.sandboxSession.create({ data: { siteId, status: "creating" } });
    try {
      const scaffold = getStandardScaffold(ctx.site?.businessType || "general", siteId, ctx.site?.slug || siteId);
      const files = { ...scaffold, ...persisted };
      const secretEnvVars = await getDecryptedSecrets(siteId);
      const { externalId, previewUrl } = await createSandboxWithFiles(files, secretEnvVars);
      session = await prisma.sandboxSession.update({
        where: { id: session.id },
        data: { externalId, previewUrl, status: "ready", lastActiveAt: new Date() },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create sandbox";
      await prisma.sandboxSession.update({ where: { id: session.id }, data: { status: "error", errorMessage: message } });
      return error(message, 500);
    }
  }

  try {
    const { buildPath } = await publishSandboxProject(siteId, session.externalId);
    return success({ published: true, buildPath, liveUrl: `/store/${ctx.site?.slug}` });
  } catch (err) {
    if (err instanceof PublishError) return error(err.message, 400);
    console.error("Publish error:", err);
    return error("Publish failed. Please try again.", 500);
  }
}
