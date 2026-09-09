import crypto from "crypto";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/s3-storage";

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Uploads raw image bytes to Supabase Storage and creates the matching
 * MediaItem record - the same persistence path a manual upload uses.
 *
 * This exists as its own function specifically so generated image bytes
 * never get stored as base64 anywhere else (e.g. in a pipeline step's
 * JSON output column) - every caller gets back a small, DB-friendly
 * MediaItem row with a real hosted URL instead.
 *
 * Returns null (never throws) if storage isn't configured or the upload
 * fails - callers should fall back to Unsplash, same as generation
 * failures.
 */
export async function persistGeneratedImage(opts: {
  siteId: string;
  bytes: Buffer;
  mimeType: string;
  name: string;
  folder?: string;
}) {
  const ext = EXT_BY_MIME[opts.mimeType] || "png";
  const objectPath = `${opts.siteId}/ai-generated/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

  let url: string;
  try {
    url = await uploadFile(objectPath, opts.bytes, opts.mimeType);
  } catch (uploadError) {
    console.error("AI image storage upload error:", uploadError);
    return null;
  }

  return prisma.mediaItem.create({
    data: {
      siteId: opts.siteId,
      name: opts.name,
      url,
      type: "IMAGE",
      mimeType: opts.mimeType,
      size: opts.bytes.length,
      folder: opts.folder ?? "/",
    },
  });
}
