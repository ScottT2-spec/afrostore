import { AIFailover, AICapability } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";
import { detectIndustry as detectIndustryKeywords } from "@/lib/ai-image-pools";

let aiFailover: AIFailover | null = null;

function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];
  if (process.env.OPENAI_API_KEY) {
    providers.push({ provider: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", capabilities: [AICapability.CHAT] });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({ provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-haiku-20241022", capabilities: [AICapability.CHAT] });
  }
  if (process.env.GOOGLE_AI_KEY) {
    providers.push({ provider: "google", apiKey: process.env.GOOGLE_AI_KEY, model: "gemini-2.0-flash", capabilities: [AICapability.CHAT] });
  }
  const groqKeys = [process.env.GROQ_API_KEY, process.env.GROQ_KEY_2, process.env.GROQ_KEY_3, process.env.GROQ_KEY_4].filter(Boolean) as string[];
  groqKeys.forEach((key, i) => {
    providers.push({ provider: i === 0 ? "groq" : `groq_${i + 1}`, apiKey: key, model: "llama-3.3-70b-versatile", capabilities: [AICapability.CHAT] });
  });
  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({ provider: "deepseek", apiKey: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat", capabilities: [AICapability.CHAT] });
  }
  return providers;
}

function getAI(): AIFailover | null {
  const providers = getAIProviders();
  if (providers.length === 0) return null;
  if (!aiFailover) {
    aiFailover = new AIFailover({
      providers,
      priorityOrder: ["groq", "groq_2", "groq_3", "groq_4", "google", "openai", "anthropic", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      healthCheckIntervalMs: 0,
      requestTimeoutMs: 20_000,
    });
  }
  return aiFailover;
}

export const INDUSTRIES = [
  "fashion", "electronics", "beauty", "food", "health", "real-estate",
  "kids", "grocery", "interior", "education", "automotive", "events",
  "religious", "logistics", "travel", "agency", "services",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const SITE_TYPES = ["ECOMMERCE", "LANDING_PAGE"] as const;

export interface BusinessClassification {
  siteType: (typeof SITE_TYPES)[number];
  industry: Industry;
  suggestedName?: string;
  suggestedTagline?: string;
  confidence: "ai" | "keyword-fallback";
}

/**
 * Classify a free-text business description into a site type + industry,
 * using a real LLM call. Falls back to keyword matching only if no AI
 * provider is configured or the call fails — never throws.
 */
export async function classifyBusiness(input: string): Promise<BusinessClassification> {
  const ai = getAI();

  if (ai && input.trim().length > 0) {
    try {
      const result = await ai.complete(
        [
          {
            role: "system",
            content: `You classify a short business description for an e-commerce site builder. Respond with ONLY compact JSON, no markdown, no explanation:
{"siteType":"ECOMMERCE"|"LANDING_PAGE","industry":"${INDUSTRIES.join('"|"')}","suggestedName":"a short catchy store name (omit if description already includes one)","suggestedTagline":"a short one-line tagline"}
Pick "LANDING_PAGE" only if the description is clearly not about selling physical/digital products (e.g. a service booking page, a portfolio, an event page). Otherwise pick "ECOMMERCE". Pick the single closest industry — never invent a new one.`,
          },
          { role: "user", content: input.slice(0, 500) },
        ],
        { maxTokens: 200, temperature: 0.3 }
      );

      const raw = result.content || "";
      const cleaned = raw.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.industry && INDUSTRIES.includes(parsed.industry)) {
        return {
          siteType: parsed.siteType === "LANDING_PAGE" ? "LANDING_PAGE" : "ECOMMERCE",
          industry: parsed.industry,
          suggestedName: typeof parsed.suggestedName === "string" ? parsed.suggestedName.slice(0, 60) : undefined,
          suggestedTagline: typeof parsed.suggestedTagline === "string" ? parsed.suggestedTagline.slice(0, 120) : undefined,
          confidence: "ai",
        };
      }
    } catch (err) {
      console.error("classifyBusiness AI call failed, falling back to keywords:", err);
    }
  }

  // Fallback: keyword matching (no AI configured, or the call failed)
  const industry = detectIndustryKeywords(input, input) as Industry;
  return { siteType: "ECOMMERCE", industry, confidence: "keyword-fallback" };
}
