/**
 * AI image generation via Google's Gemini API native image models
 * ("Nano Banana"). This is a genuinely different capability from Unsplash:
 * Unsplash searches existing stock photos by keyword, this generates a new,
 * unique image from a text description.
 *
 * IMPORTANT: the older Imagen `:predict` REST endpoint (imagen-4.0-generate-*
 * etc.) was shut down by Google on August 17, 2026. Do not build against it
 * or any code sample referencing it - it will 404. Image generation now
 * goes through the same generateContent endpoint as text, with
 * responseModalities: ["IMAGE"], using one of the "Nano Banana" models.
 *
 * Without GOOGLE_AI_KEY configured, generateAiImage() returns null so
 * callers fall back to Unsplash - same isConfigured() pattern as
 * unsplash-client.ts and isSmsConfigured()/isWhatsAppConfigured().
 */

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

// gemini-3.1-flash-image ("Nano Banana 2") - Google's current documented
// default for price/quality balance at the time this was written. Override
// via env if a future model supersedes it without needing a code change.
const DEFAULT_MODEL = process.env.GOOGLE_AI_IMAGE_MODEL || "gemini-3.1-flash-image";

export function isAiImageGenConfigured(): boolean {
  return !!process.env.GOOGLE_AI_KEY;
}

export interface GeneratedImage {
  /** Raw image bytes - caller is responsible for uploading/persisting these. */
  bytes: Buffer;
  mimeType: string;
}

/**
 * Generates one image from a text prompt. Returns null (never throws) if
 * unconfigured, blocked by Google's safety filters, or the request fails -
 * callers must have a fallback (Unsplash), same contract as
 * searchUnsplashPhotos().
 */
export async function generateAiImage(prompt: string): Promise<GeneratedImage | null> {
  if (!isAiImageGenConfigured()) return null;

  try {
    const res = await fetch(`${GEMINI_API}/${DEFAULT_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GOOGLE_AI_KEY!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });

    if (!res.ok) {
      console.error("Gemini image generation failed:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const json = await res.json();

    const blockReason = json?.promptFeedback?.blockReason;
    if (blockReason) {
      console.error("Gemini blocked image generation:", blockReason, "prompt:", prompt);
      return null;
    }

    const parts = json?.candidates?.[0]?.content?.parts as Array<{ inlineData?: { mimeType: string; data: string } }> | undefined;
    const imagePart = parts?.find((p) => p.inlineData?.data);
    if (!imagePart?.inlineData) {
      console.error("Gemini response had no image data:", JSON.stringify(json).slice(0, 500));
      return null;
    }

    return {
      bytes: Buffer.from(imagePart.inlineData.data, "base64"),
      mimeType: imagePart.inlineData.mimeType || "image/png",
    };
  } catch (err) {
    console.error("Gemini image generation error:", err);
    return null;
  }
}
