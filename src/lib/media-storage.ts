import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSupabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";

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
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return null;
  }

  const ext = EXT_BY_MIME[opts.mimeType] || "png";
  const objectPath = `${opts.siteId}/ai-generated/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, opts.bytes, { contentType: opts.mimeType, cacheControl: "31536000", upsert: false });

  if (uploadError) {
    console.error("AI image storage upload error:", uploadError);
    return null;
  }

  const url = getPublicUrl(objectPath);
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
