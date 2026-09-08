import type { StepDefinition } from "./dag-runner";
import { generateStore, type StoreGeneratorInput } from "@/lib/ai-store-generator";
import { generateAiImage, isAiImageGenConfigured } from "@/lib/gemini-image-client";
import { searchUnsplashPhotos } from "@/lib/unsplash-client";
import { persistGeneratedImage } from "@/lib/media-storage";
import { isSandboxConfigured, createSandboxWithFiles } from "@/lib/sandbox/daytona";

/**
 * The real DAG for AI site generation:
 *
 *              generate-copy
 *             /      |       \
 *   hero-image   about-image   (more images...)
 *             \      |       /
 *            assemble-blocks
 *                    |
 *          create-sandbox (optional)
 *
 * Concurrency buckets, each with its own global limit via the Redis
 * semaphore in concurrency.ts:
 *   "llm"        - text generation calls (generateStore)
 *   "image-gen"  - Gemini image generation calls
 *   "sandbox"    - Daytona sandbox creation, the most expensive resource
 *
 * generate-copy is the one step this doesn't fully own the implementation
 * of - the other agent's structured-JSON work determines its exact output
 * shape. It's wired to the real, already-existing generateStore() function
 * as the closest current equivalent; swap the body of that step once the
 * other agent's function/shape lands, everything downstream (image
 * prompts, block assembly) just needs its output shape kept stable.
 */
export function buildSiteGenerationPipeline(siteId: string): StepDefinition[] {
  return [
    {
      id: "generate-copy",
      dependsOn: [],
      resource: "llm",
      resourceLimit: 15,
      timeoutMs: 45_000,
      maxRetries: 2,
      async run(inputs) {
        const storeInput = inputs.__root as StoreGeneratorInput;
        return generateStore(storeInput);
      },
    },
    {
      id: "hero-image",
      dependsOn: ["generate-copy"],
      resource: "image-gen",
      resourceLimit: 8,
      timeoutMs: 30_000,
      maxRetries: 1,
      optional: true, // a missing hero image shouldn't block the whole site from finishing
      async run(inputs) {
        const storeInput = inputs.__root as StoreGeneratorInput;
        const prompt = `Professional hero banner photo for a business named "${storeInput.storeName}". Clean, modern, high quality, no text overlay.`;
        return generateOneImage(siteId, prompt, storeInput.storeName, "Hero image");
      },
    },
    {
      id: "about-image",
      dependsOn: ["generate-copy"],
      resource: "image-gen",
      resourceLimit: 8,
      timeoutMs: 30_000,
      maxRetries: 1,
      optional: true,
      async run(inputs) {
        const storeInput = inputs.__root as StoreGeneratorInput;
        const prompt = `Warm, authentic photo representing the "About Us" story of a business named "${storeInput.storeName}". No text overlay.`;
        return generateOneImage(siteId, prompt, `${storeInput.storeName} about`, "About image");
      },
    },
    {
      id: "assemble-blocks",
      dependsOn: ["generate-copy", "hero-image", "about-image"],
      resource: "cpu",
      resourceLimit: 50, // pure in-memory assembly, no external API - high limit is fine
      timeoutMs: 10_000,
      async run(inputs) {
        const copy = inputs["generate-copy"] as Awaited<ReturnType<typeof generateStore>>;
        const heroImage = inputs["hero-image"] as { url: string } | null;
        const aboutImage = inputs["about-image"] as { url: string } | null;
        return { ...copy, heroImageUrl: heroImage?.url ?? null, aboutImageUrl: aboutImage?.url ?? null };
      },
    },
    {
      id: "create-sandbox",
      dependsOn: ["assemble-blocks"],
      resource: "sandbox",
      resourceLimit: 5, // sandboxes are the most resource-expensive step - keep this the tightest bucket
      timeoutMs: 120_000,
      maxHoldMs: 240_000,
      maxRetries: 1,
      optional: true, // if Daytona is down/unconfigured, the block-based preview is the fallback, not a failed generation
      async run(inputs) {
        if (!isSandboxConfigured()) return null;
        const assembled = inputs["assemble-blocks"];
        // Placeholder file shape - the real generated-code project structure
        // depends on whatever the other agent's codegen path ultimately
        // produces. This proves the sandbox step's wiring/concurrency/retry
        // behavior end-to-end even before that shape is finalized.
        const files = { "site-data.json": JSON.stringify(assembled, null, 2) };
        return createSandboxWithFiles(files);
      },
    },
  ];
}

async function generateOneImage(
  siteId: string,
  prompt: string,
  fallbackQuery: string,
  name: string
): Promise<{ url: string; source: "ai-generated" | "unsplash-fallback" } | null> {
  if (isAiImageGenConfigured()) {
    const generated = await generateAiImage(prompt);
    if (generated) {
      const mediaItem = await persistGeneratedImage({
        siteId,
        bytes: generated.bytes,
        mimeType: generated.mimeType,
        name,
        folder: "/ai-generated",
      });
      // A real hosted URL, not a base64 blob - this is what actually
      // lands in PipelineStepRun.output, kept small and DB-friendly even
      // at 500k users' worth of generated images.
      if (mediaItem) return { url: mediaItem.url, source: "ai-generated" };
      // persistGeneratedImage returning null means storage isn't
      // configured or the upload failed - fall through to Unsplash below
      // rather than losing the successfully-generated image entirely.
    }
  }
  const photos = await searchUnsplashPhotos(fallbackQuery, 1);
  if (photos.length > 0) return { url: photos[0].url, source: "unsplash-fallback" };
  return null;
}
