import { NextRequest } from "next/server";
import { getStoreContext, success, error, logAudit, requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { generateAiImage, isAiImageGenConfigured } from "@/lib/gemini-image-client";
import { searchUnsplashPhotos } from "@/lib/unsplash-client";
import { persistGeneratedImage } from "@/lib/media-storage";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/ai/generate-image  { prompt: string, name?: string, folder?: string }
// Generates a real, unique AI image from a text prompt (Google's Nano
// Banana models) and persists it the same way a manual upload would - a
// MediaItem row + a real Supabase Storage URL, not a throwaway base64 blob.
//
// If GOOGLE_AI_KEY isn't configured, or generation fails/gets blocked by
// safety filters, this automatically falls back to an Unsplash stock photo
// search using the same prompt as the query - the caller always gets an
// image back (or a clear error if even that fails), never a dead end.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  // AI image generation costs real money per call - same reasoning as the
  // media upload route's rate limit, just tighter given the per-image cost.
  const rl = rateLimit(`ai-image-gen:${ctx.user!.id}`, 20, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const name = typeof body?.name === "string" ? body.name : prompt.slice(0, 60) || "AI generated image";
  const folder = typeof body?.folder === "string" ? body.folder : "/";
  if (!prompt) return error("prompt is required", 400);

  const generated = isAiImageGenConfigured() ? await generateAiImage(prompt) : null;

  if (generated) {
    const mediaItem = await persistGeneratedImage({ siteId, bytes: generated.bytes, mimeType: generated.mimeType, name, folder });
    if (mediaItem) {
      await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "media_item", entityId: mediaItem.id, after: mediaItem });
      return success({ ...mediaItem, source: "ai-generated" }, 201);
    }
    // persistGeneratedImage returning null means storage isn't configured
    // or the upload failed - fall through to Unsplash rather than failing
    // outright, since generation itself succeeded.
  }

  // Fallback: Unsplash stock photo search using the same prompt as the
  // query. Covers: GOOGLE_AI_KEY not set, Gemini blocked/failed the
  // request, or the storage upload step failed above.
  const photos = await searchUnsplashPhotos(prompt, 1);
  if (photos.length > 0) {
    return success({ url: photos[0].url, name, credit: photos[0].credit, source: "unsplash-fallback" });
  }

  return error(
    isAiImageGenConfigured()
      ? "AI image generation and the Unsplash fallback both failed for this prompt."
      : "AI image generation isn't configured (GOOGLE_AI_KEY missing), and no Unsplash results matched this prompt.",
    502
  );
}
