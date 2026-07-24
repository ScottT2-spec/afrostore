import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { AIFailover, AICapability } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";

export const maxDuration = 60;

function getProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_KEY_2,
    process.env.GROQ_KEY_3,
    process.env.GROQ_KEY_4,
  ].filter(Boolean) as string[];

  groqKeys.forEach((key, i) => {
    providers.push({
      provider: i === 0 ? "groq" : `groq_${i + 1}`,
      apiKey: key,
      model: "llama-3.3-70b-versatile",
      capabilities: [AICapability.CHAT],
    });
  });

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      capabilities: [AICapability.CHAT],
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20241022",
      capabilities: [AICapability.CHAT],
    });
  }

  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
      capabilities: [AICapability.CHAT],
    });
  }

  return providers;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const { sectionType, content } = await req.json();

    if (!sectionType || !content || typeof content !== "object") {
      return NextResponse.json(
        { error: "sectionType and content are required" },
        { status: 400 }
      );
    }

    const providers = getProviders();
    if (providers.length === 0) {
      return NextResponse.json(
        { error: "No AI providers configured" },
        { status: 503 }
      );
    }

    const ai = new AIFailover({
      providers,
      priorityOrder: ["groq", "groq_2", "groq_3", "groq_4", "openai", "anthropic", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      requestTimeoutMs: 30_000,
    });

    // Build a focused prompt — limit content size to avoid token limits
    const contentStr = JSON.stringify(content, null, 2);
    // If content is too large (>8k chars), truncate nested arrays to first 2 items
    let trimmedContent = content;
    if (contentStr.length > 8000) {
      trimmedContent = Object.fromEntries(
        Object.entries(content).map(([k, v]) => {
          if (Array.isArray(v) && v.length > 2) {
            return [k, v.slice(0, 2)];
          }
          return [k, v];
        })
      );
    }
    const contentJson = JSON.stringify(trimmedContent, null, 2);

    const systemPrompt = `You are a JSON-only API. You improve website copy for African ecommerce businesses.

CRITICAL: Your entire response must be a single valid JSON object. No markdown. No explanation. No text before or after the JSON.

Rules:
- Return ONLY the JSON object with the same keys as the input
- Improve headlines to be punchier and more attention-grabbing
- Make descriptions more compelling and benefit-focused
- Keep the same structure — same keys, same array lengths
- Don't change URLs, image paths, icons, hrefs, or technical values (keep them exactly as-is)
- Don't add new keys or remove existing ones
- Keep text concise — website copy should be scannable
- Tailor language for African businesses and customers
- If a value is a number, boolean, URL, or icon name, keep it unchanged
- NEVER wrap output in code fences or markdown`;

    const userPrompt = `Improve this "${sectionType}" section content. Return the improved version as JSON with the exact same structure:

${contentJson}`;

    const result = await ai.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      capability: AICapability.CHAT,
    });

    // Parse the AI response as JSON — handle various AI formatting quirks
    let improved: Record<string, unknown>;
    try {
      let raw = result.content.trim();

      // Strip markdown code fences (```json ... ``` or ``` ... ```)
      raw = raw.replace(/^```(?:json|JSON)?\s*\n?/, "").replace(/\n?```\s*$/, "");

      // If AI prepended explanation text before the JSON, extract the JSON object
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }

      improved = JSON.parse(raw);
    } catch (parseErr) {
      console.error("AI JSON parse error:", parseErr, "Raw content:", result.content.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      improved,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error("AI improve error:", error?.message || error);
    const msg = error?.message || "Unknown error";
    // Surface rate limit errors clearly
    if (msg.includes("rate") || msg.includes("429") || msg.includes("quota")) {
      return NextResponse.json(
        { error: "AI rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: `AI error: ${msg.slice(0, 120)}` },
      { status: 500 }
    );
  }
}
