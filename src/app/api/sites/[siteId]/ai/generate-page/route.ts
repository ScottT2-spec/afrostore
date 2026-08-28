import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit , requireRole } from "@/lib/api-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { unauthorized } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai-service";
import { buildTemplatePageContent } from "@/lib/templates/template-tree";
import { classifyBusiness } from "@/lib/ai-classify";
import { searchUnsplashPhotos, isUnsplashConfigured } from "@/lib/unsplash-client";
import { getIndustryPool } from "@/lib/ai-image-pools";
import type { BlockType } from "@/lib/builder/types";

export const maxDuration = 120;

type Params = { params: Promise<{ siteId: string }> };

const VALID_BLOCKS: BlockType[] = [
  "heading", "text", "image", "button", "hero", "spacer", "divider", "columns",
  "productGrid", "testimonial", "testimonials", "features", "faq", "contactForm",
  "contactInfo", "video", "countdown", "trustBadges", "stats", "newsletter",
  "banner", "imageText", "gallery", "team", "brands",
];

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  // Each call here hits a paid external AI provider, so this guards
  // against runaway cost from a retry loop or a compromised/careless
  // staff account, not just abuse.
  const rl = rateLimit(`ai-generate:${ctx.user!.id}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  try {
    const { prompt, pageType } = await req.json();
    if (!prompt) return error("Prompt is required", 400);

    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { name: true, siteType: true, businessType: true, description: true } });
    if (!site) return error("Site not found", 404);

    const systemPrompt = `You are an expert page builder. Generate a page layout as a JSON array of builder blocks.

Available block types: ${VALID_BLOCKS.join(", ")}

Block format: { "id": "unique-id", "type": "blockType", "props": { ... } }

Common props by type:
- heading: { text, level: "h1"|"h2"|"h3", align, color }
- text: { text, align, color, fontSize }
- image: { src: "https://placehold.co/800x400", alt, width }
- button: { text, href, variant: "primary"|"secondary"|"outline" }
- hero: { title, subtitle, ctaText, ctaHref, backgroundImage, overlay }
- features: { title, items: [{ icon, title, description }] }
- testimonials: { title, items: [{ name, role, quote, avatar }] }
- faq: { title, items: [{ question, answer }] }
- stats: { items: [{ value, label }] }
- newsletter: { title, subtitle, buttonText }
- productGrid: { title, columns: 3|4, limit: 8 }
- gallery: { images: [{ src, alt }] }
- team: { title, members: [{ name, role, image, bio }] }
- contactForm: { title, fields: ["name", "email", "message"] }
- banner: { text, ctaText, ctaHref, backgroundColor }

Site: "${site.name}" (${site.siteType})
${pageType ? `Page type: ${pageType}` : ""}

Return ONLY a valid JSON array of blocks. No markdown, no explanation.
Generate 6-12 blocks for a complete, professional page.
For any image src, use the literal placeholder "AI_IMAGE:<short 2-4 word search query describing what should be there>" (e.g. "AI_IMAGE:cozy coffee shop interior") — do NOT invent a real URL, it will be replaced with a real photo automatically.

User request: ${prompt}`;

    const aiResult = await chatWithAI({ siteId, message: systemPrompt });

    if (!aiResult.content) return error("AI failed to generate page", 500);

    let blocks;
    try {
      const cleaned = aiResult.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      blocks = JSON.parse(cleaned);
      if (!Array.isArray(blocks)) throw new Error("Not an array");
      blocks = blocks.filter((b: Record<string, unknown>) => typeof b.type === "string" && VALID_BLOCKS.includes(b.type as BlockType));
    } catch {
      return error("AI returned invalid page structure. Try again.", 422);
    }

    // Resolve every "AI_IMAGE:<query>" placeholder to a real photo — Unsplash
    // search first, falling back to the industry's curated pool so a page
    // never ends up with a broken image or a gray placehold.co box.
    let fallbackPool: string[] = [];
    try {
      const classification = await classifyBusiness(`${site.businessType || site.siteType} ${site.description || ""} ${prompt}`);
      fallbackPool = getIndustryPool(classification.industry).showcase;
    } catch {
      fallbackPool = getIndustryPool("services").showcase;
    }
    let fallbackIdx = 0;

    async function resolveImagePlaceholder(value: string): Promise<string> {
      const match = /^AI_IMAGE:(.+)$/.exec(value);
      if (!match) return value;
      const query = match[1].trim();
      if (isUnsplashConfigured()) {
        const results = await searchUnsplashPhotos(query, 1, "landscape");
        if (results.length > 0) return results[0].url;
      }
      const pick = fallbackPool[fallbackIdx % fallbackPool.length];
      fallbackIdx++;
      return pick;
    }

    async function resolveImagesDeep(node: any): Promise<void> {
      if (!node || typeof node !== "object") return;
      for (const key of Object.keys(node)) {
        const val = node[key];
        if (typeof val === "string" && val.startsWith("AI_IMAGE:")) {
          node[key] = await resolveImagePlaceholder(val);
        } else if (Array.isArray(val)) {
          for (const item of val) await resolveImagesDeep(item);
        } else if (val && typeof val === "object") {
          await resolveImagesDeep(val);
        }
      }
    }
    for (const block of blocks) await resolveImagesDeep(block);

    const slug = `ai-${Date.now()}`;
    const page = await prisma.page.create({
      data: {
        siteId, title: `AI Generated: ${prompt.slice(0, 50)}`, slug,
        content: buildTemplatePageContent(blocks) as any, isPublished: false, metaTitle: prompt.slice(0, 60),
      },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ai_page", entityId: page.id, after: { prompt, blockCount: blocks.length } });
    return success({ page: { id: page.id, title: page.title, slug: page.slug }, blocks, blockCount: blocks.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI page generate error:", err);
    return error(msg, 500);
  }
}
