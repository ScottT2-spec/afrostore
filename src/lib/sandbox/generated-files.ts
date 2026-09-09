import { prisma } from "@/lib/db";

/**
 * Durable storage for AI-generated code, independent of any sandbox
 * container's lifecycle. See the GeneratedFile model comment in
 * schema.prisma for the full reasoning - short version: sandboxes are
 * disposable, this table is not, and every successful file write/edit/
 * delete the coding agent makes updates this table immediately, not just
 * at task completion.
 */

// Defensive ceiling on a single generated file's size. The coding agent
// writes source files - a few KB each, realistically. Something writing
// megabytes into one file is either a runaway loop or a mistake, and
// storing that in Postgres (even TOAST-compressed) at 500k-site scale is
// a real cost, not a hypothetical one - refuse rather than silently
// storing pathological content.
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function persistGeneratedFile(siteId: string, path: string, content: string): Promise<void> {
  const size = Buffer.byteLength(content, "utf-8");
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Refusing to persist ${path}: ${size} bytes exceeds the ${MAX_FILE_SIZE_BYTES}-byte limit for a generated file`);
  }
  await prisma.generatedFile.upsert({
    where: { siteId_path: { siteId, path } },
    create: { siteId, path, content, size },
    update: { content, size },
  });
}

/** `recursive` mirrors the delete_file tool's own semantics - true deletes every persisted file under that path prefix (a directory), false deletes only an exact path match. */
export async function persistGeneratedFileDelete(siteId: string, path: string, recursive: boolean): Promise<void> {
  if (recursive) {
    const prefix = path.endsWith("/") ? path : `${path}/`;
    await prisma.generatedFile.deleteMany({ where: { siteId, path: { startsWith: prefix } } });
    // Also remove an exact match on the path itself, in case it's a file
    // (not a directory) being deleted with recursive:true - some callers
    // pass recursive defensively without knowing which it is.
    await prisma.generatedFile.deleteMany({ where: { siteId, path } });
  } else {
    await prisma.generatedFile.deleteMany({ where: { siteId, path } });
  }
}

/** Fetches every persisted file for a site, in the exact shape a sandbox's file map expects - `{ ...getStandardScaffold(...), ...getGeneratedFiles(siteId) }` reconstructs a sandbox to wherever the agent last left off. */
export async function getGeneratedFiles(siteId: string): Promise<Record<string, string>> {
  const rows = await prisma.generatedFile.findMany({ where: { siteId }, select: { path: true, content: true } });
  const files: Record<string, string> = {};
  for (const row of rows) files[row.path] = row.content;
  return files;
}

export async function hasGeneratedFiles(siteId: string): Promise<boolean> {
  const count = await prisma.generatedFile.count({ where: { siteId } });
  return count > 0;
}
