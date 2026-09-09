import { prisma } from "@/lib/db";
import { getSupabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { runSandboxCommand, listSandboxFiles, readSandboxFile } from "@/lib/sandbox/daytona";

const MIME_BY_EXT: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  txt: "text/plain; charset=utf-8",
  map: "application/json",
};

function extOf(path: string): string {
  const i = path.lastIndexOf(".");
  return i === -1 ? "" : path.slice(i + 1).toLowerCase();
}

async function walkDist(externalId: string, dir: string, out: string[]) {
  const entries = await listSandboxFiles(externalId, dir);
  for (const e of entries) {
    const full = `${dir}/${e.name}`;
    if (e.isDir) {
      await walkDist(externalId, full, out);
    } else {
      out.push(full);
    }
  }
}

export class PublishError extends Error {}

/**
 * Builds the sandbox's current project and uploads the static output as
 * this site's published storefront. Text-only file reads throughout
 * (readSandboxFile decodes as utf-8) — safe here because the AI is
 * instructed to only ever reference remote (Unsplash) image URLs, never
 * bundle local binary assets, so a Vite build for this kind of project
 * never produces binary output under dist/.
 */
export async function publishSandboxProject(siteId: string, externalId: string): Promise<{ buildPath: string }> {
  const build = await runSandboxCommand(externalId, "npm run build", undefined, 300);
  if (build.exitCode !== 0) {
    throw new PublishError(`Build failed:\n${build.output.slice(-4000)}`);
  }

  const distFiles: string[] = [];
  await walkDist(externalId, "dist", distFiles);
  if (distFiles.length === 0) {
    throw new PublishError("Build succeeded but produced no output files in dist/.");
  }
  if (!distFiles.some((f) => f.endsWith("dist/index.html"))) {
    throw new PublishError("Build output has no index.html — cannot serve as a site.");
  }

  const supabase = getSupabaseAdmin();
  const buildPath = `sites/${siteId}/published`;

  // Wipe whatever was there before a previous publish, so removed pages/
  // renamed assets don't linger and get served after a newer publish.
  const { data: existing } = await supabase.storage.from(STORAGE_BUCKET).list(buildPath, { limit: 1000 });
  if (existing && existing.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(existing.map((f) => `${buildPath}/${f.name}`));
  }

  for (const filePath of distFiles) {
    const relative = filePath.slice("dist/".length);
    const content = await readSandboxFile(externalId, filePath);
    const mime = MIME_BY_EXT[extOf(relative)] || "application/octet-stream";
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${buildPath}/${relative}`, Buffer.from(content, "utf-8"), {
        contentType: mime,
        cacheControl: relative === "index.html" ? "no-cache" : "31536000",
        upsert: true,
      });
    if (error) throw new PublishError(`Failed to upload ${relative}: ${error.message}`);
  }

  await prisma.site.update({
    where: { id: siteId },
    data: { codeGenPublished: true, codeGenPublishedAt: new Date(), codeGenBuildPath: buildPath },
  });

  return { buildPath };
}
