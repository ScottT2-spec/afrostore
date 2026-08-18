/**
 * AI Product Generator
 *
 * Generates a starter catalog of realistic sample products (name,
 * description, price, category) for a newly AI-built store, with real
 * photos sourced from Unsplash where configured, falling back to the
 * curated industry image pools otherwise. Every AI-built store used to
 * launch with a fully-written site and an empty product grid — this
 * closes that gap.
 */

import { prisma } from "@/lib/db";
import { AIFailover, AICapability } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";
import { slugify } from "@/lib/utils";
import { searchUnsplashPhotos, isUnsplashConfigured } from "@/lib/unsplash-client";
import { getIndustryPool } from "@/lib/ai-image-pools";

let aiFailover: AIFailover | null = null;

function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];
  const groqKeys = [process.env.GROQ_API_KEY, process.env.GROQ_KEY_2, process.env.GROQ_KEY_3, process.env.GROQ_KEY_4].filter(Boolean) as string[];
  groqKeys.forEach((key, i) => providers.push({ provider: i === 0 ? "groq" : `groq_${i + 1}`, apiKey: key, model: "llama-3.3-70b-versatile", capabilities: [AICapability.CHAT] }));
  if (process.env.GOOGLE_AI_KEY) providers.push({ provider: "google", apiKey: process.env.GOOGLE_AI_KEY, model: "gemini-2.0-flash", capabilities: [AICapability.CHAT] });
  if (process.env.OPENAI_API_KEY) providers.push({ provider: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", capabilities: [AICapability.CHAT] });
  if (process.env.ANTHROPIC_API_KEY) providers.push({ provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-haiku-20241022", capabilities: [AICapability.CHAT] });
  if (process.env.DEEPSEEK_API_KEY) providers.push({ provider: "deepseek", apiKey: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat", capabilities: [AICapability.CHAT] });
  return providers;
}

function getAI(): AIFailover {
  if (!aiFailover) {
    const providers = getAIProviders();
    if (providers.length === 0) throw new Error("No AI providers configured");
    aiFailover = new AIFailover({
      providers,
      priorityOrder: ["groq", "groq_2", "groq_3", "groq_4", "google", "openai", "anthropic", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      healthCheckIntervalMs: 0,
      requestTimeoutMs: 60_000,
    });
  }
  return aiFailover;
}

interface GeneratedProductDraft {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  tags: string[];
}

export interface ProductGeneratorInput {
  siteId: string;
  businessType: string;
  businessName: string;
  description?: string;
  industry: string;
  currency: string;
  count?: number; // default 12
}

export interface ProductGeneratorResult {
  productsCreated: number;
  categoriesCreated: number;
}

/** Ask the AI for a realistic starter catalog (no images yet — those come after). */
async function generateProductDrafts(input: ProductGeneratorInput): Promise<GeneratedProductDraft[]> {
  const count = input.count ?? 12;
  const ai = getAI();

  const result = await ai.complete(
    [
      {
        role: "system",
        content: `You write realistic starter product catalogs for new e-commerce stores. Respond with ONLY a JSON array, no markdown, no commentary. Each item:
{"name":"product name","description":"1-2 sentence sales description","price":number,"compareAtPrice":number or omit,"category":"short category name","tags":["tag1","tag2"]}

Rules:
- Prices realistic for the currency given, no currency symbol, numbers only.
- compareAtPrice only when it makes sense as a "was" price (must be higher than price) — omit otherwise, don't add it to every item.
- 3-5 distinct categories across the set, grouping related products together.
- Names and descriptions must fit the specific business described — not generic filler.
- Exactly ${count} products.`,
      },
      {
        role: "user",
        content: `Business: ${input.businessName}\nType: ${input.businessType}\n${input.description ? `Description: ${input.description}\n` : ""}Currency: ${input.currency}\nGenerate ${count} products.`,
      },
    ],
    { maxTokens: 3000, temperature: 0.8 }
  );

  const cleaned = (result.content || "").replace(/```json\n?|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("AI did not return a product array");

  return parsed
    .filter((p) => p && typeof p.name === "string" && typeof p.price === "number")
    .slice(0, count)
    .map((p) => ({
      name: String(p.name).slice(0, 150),
      description: String(p.description || "").slice(0, 1000),
      price: Math.max(0.01, Number(p.price)),
      compareAtPrice: typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price ? p.compareAtPrice : undefined,
      category: String(p.category || "General").slice(0, 60),
      tags: Array.isArray(p.tags) ? p.tags.slice(0, 5).map(String) : [],
    }));
}

/** Find a real product photo — Unsplash search first, curated pool fallback. */
async function getProductImage(query: string, industry: string, fallbackPool: string[], usedFallbacks: Set<string>): Promise<string> {
  if (isUnsplashConfigured()) {
    const results = await searchUnsplashPhotos(query, 3, "squarish");
    if (results.length > 0) return results[0].url;
  }
  // Fallback: cycle through the curated pool without repeating until exhausted
  const unused = fallbackPool.filter((url) => !usedFallbacks.has(url));
  const pick = (unused.length > 0 ? unused : fallbackPool)[Math.floor(Math.random() * (unused.length > 0 ? unused.length : fallbackPool.length))];
  usedFallbacks.add(pick);
  return pick;
}

/**
 * Generate and persist a starter catalog for a newly AI-built store.
 * Safe to call even if AI product generation fails partway — never leaves
 * the site worse off than having zero products (same as before this existed).
 */
export async function generateProducts(input: ProductGeneratorInput): Promise<ProductGeneratorResult> {
  const drafts = await generateProductDrafts(input);
  if (drafts.length === 0) return { productsCreated: 0, categoriesCreated: 0 };

  // Create categories first (dedup by name)
  const categoryNames = Array.from(new Set(drafts.map((d) => d.category)));
  const categoryMap = new Map<string, string>(); // name -> id

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { siteId_slug: { siteId: input.siteId, slug } },
      create: { siteId: input.siteId, name, slug, position: i },
      update: {},
    });
    categoryMap.set(name, category.id);
  }

  const fallbackPool = getIndustryPool(input.industry).showcase;
  const usedFallbacks = new Set<string>();

  let created = 0;
  for (const draft of drafts) {
    try {
      const slug = `${slugify(draft.name)}-${Math.random().toString(36).slice(2, 6)}`;
      const imageUrl = await getProductImage(`${draft.name} ${input.businessType}`, input.industry, fallbackPool, usedFallbacks);

      await prisma.product.create({
        data: {
          siteId: input.siteId,
          categoryId: categoryMap.get(draft.category) || null,
          name: draft.name,
          slug,
          description: draft.description,
          price: draft.price,
          compareAtPrice: draft.compareAtPrice ?? null,
          currency: input.currency,
          stock: 25,
          status: "ACTIVE",
          tags: draft.tags,
          images: { create: [{ url: imageUrl, alt: draft.name, position: 0 }] },
        },
      });
      created++;
    } catch (err) {
      console.error(`Failed to create AI-generated product "${draft.name}":`, err);
      // Keep going — a partial catalog is far better than none
    }
  }

  return { productsCreated: created, categoriesCreated: categoryMap.size };
}
