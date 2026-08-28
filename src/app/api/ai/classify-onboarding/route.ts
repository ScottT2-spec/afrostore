import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-helpers";
import { AIFailover, AICapability } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

const SITE_TYPES = ["ECOMMERCE", "WEBSITE", "LANDING_PAGE"] as const;
const INDUSTRIES = [
  "fashion", "electronics", "food", "beauty", "health", "real-estate",
  "education", "church", "ngo", "agency", "construction", "auto",
  "art", "sports", "services", "other",
] as const;

function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];
  if (process.env.GROQ_API_KEY) providers.push({ provider: "groq", apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", capabilities: [AICapability.CHAT] });
  if (process.env.GOOGLE_AI_KEY) providers.push({ provider: "google", apiKey: process.env.GOOGLE_AI_KEY, model: "gemini-2.0-flash", capabilities: [AICapability.CHAT] });
  if (process.env.OPENAI_API_KEY) providers.push({ provider: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", capabilities: [AICapability.CHAT] });
  if (process.env.ANTHROPIC_API_KEY) providers.push({ provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-haiku-20241022", capabilities: [AICapability.CHAT] });
  if (process.env.DEEPSEEK_API_KEY) providers.push({ provider: "deepseek", apiKey: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat", capabilities: [AICapability.CHAT] });
  return providers;
}

// POST /api/ai/classify-onboarding — { description } -> { siteType, industry, suggestedName?, suggestedTagline? }
export async function POST(req: NextRequest) {
  try {
    // No auth at all here (runs pre-signup, during onboarding), so this is
    // the one thing standing between the public internet and unlimited
    // paid-provider calls.
    const rl = rateLimit(`classify-onboarding:${getClientIp(req)}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.trim().length < 3) {
      return error("description is required", 400);
    }

    const providers = getAIProviders();
    if (providers.length === 0) {
      return success({ classified: false, reason: "no_ai_configured" });
    }

    const ai = new AIFailover({
      providers,
      priorityOrder: ["groq", "google", "openai", "anthropic", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      healthCheckIntervalMs: 0,
      requestTimeoutMs: 15_000,
    });

    const result = await ai.complete(
      [
        {
          role: "system",
          content: `Classify a short business description for a website/store builder. Respond with ONLY compact JSON, no markdown:
{"siteType":"${SITE_TYPES.join('"|"')}","industry":"${INDUSTRIES.join('"|"')}","suggestedName":"short catchy business name, omit if unclear","suggestedTagline":"one short tagline, omit if unclear"}

Rules:
- "ECOMMERCE" if they're selling physical/digital products.
- "LANDING_PAGE" if it's clearly a single-page launch/waitlist/campaign, not a full site.
- "WEBSITE" for everything else (services, organizations, professionals, portfolios).
- Pick the single closest industry from the list — never invent one; use "other" if nothing fits well.`,
        },
        { role: "user", content: description.slice(0, 500) },
      ],
      { maxTokens: 200, temperature: 0.3 }
    );

    const cleaned = (result.content || "").replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!SITE_TYPES.includes(parsed.siteType) || !INDUSTRIES.includes(parsed.industry)) {
      return success({ classified: false, reason: "invalid_ai_response" });
    }

    return success({
      classified: true,
      siteType: parsed.siteType,
      industry: parsed.industry,
      suggestedName: typeof parsed.suggestedName === "string" ? parsed.suggestedName.slice(0, 60) : undefined,
      suggestedTagline: typeof parsed.suggestedTagline === "string" ? parsed.suggestedTagline.slice(0, 120) : undefined,
    });
  } catch (err) {
    console.error("classify-onboarding error:", err);
    return success({ classified: false, reason: "error" });
  }
}
