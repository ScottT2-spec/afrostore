import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit , requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { uploadFile } from "@/lib/s3-storage";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
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
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  // Same reasoning as the general /api/upload route — cap per user so a
  // compromised/careless staff account can't run up storage costs.
  const rl = rateLimit(`media-upload:${ctx.user!.id}`, 30, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

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

    let url: string;
    try {
      url = await uploadFile(objectPath, buffer, file.type);
    } catch (uploadError) {
      console.error("S3 media upload error:", uploadError);
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed";
      if (message.includes("must be set")) {
        return error("File storage is not configured on this platform (missing AWS S3 credentials). Contact support.", 503);
      }
      return error(`Upload failed: ${message}`, 500);
    }

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
