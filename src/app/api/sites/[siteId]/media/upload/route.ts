import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { getSupabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";
import crypto from "crypto";
import path from "path";

type Params = { params: Promise<{ siteId: string }> };

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — stays under typical serverless request-body limits
const ALLOWED_MIME_PREFIXES = ["image/", "video/", "audio/", "application/pdf"];

function detectType(mimeType: string): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
}

function generateFileName(siteId: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || "";
  const hash = crypto.randomBytes(10).toString("hex");
  return `${siteId}/${Date.now()}-${hash}${ext}`;
}

// POST /api/sites/:siteId/media/upload — real file upload, backed by Supabase
// Storage (previously wrote to the local filesystem, which does not persist
// or serve files on Vercel's ephemeral/read-only serverless filesystem).
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || file?.name || "Untitled";
    const folder = (formData.get("folder") as string) || "/";

    if (!file) return error("No file provided", 400);
    if (file.size > MAX_SIZE_BYTES) {
      return error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_SIZE_BYTES / 1024 / 1024}MB.`, 400);
    }
    if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
      return error(`Unsupported file type: ${file.type || "unknown"}`, 400);
    }

    const objectPath = generateFileName(siteId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return error("File storage is not configured on this platform (missing Supabase credentials). Contact support.", 503);
    }

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, buffer, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (uploadError) {
      console.error("Supabase media upload error:", uploadError);
      return error(`Upload failed: ${uploadError.message}`, 500);
    }

    const url = getPublicUrl(objectPath);
    const type = detectType(file.type);

    const mediaItem = await prisma.mediaItem.create({
      data: { siteId, name, url, type, mimeType: file.type, size: file.size, folder },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "media_item", entityId: mediaItem.id, after: mediaItem });

    return success(mediaItem, 201);
  } catch (err) {
    console.error("Upload media error:", err);
    return error("Internal server error", 500);
  }
}
