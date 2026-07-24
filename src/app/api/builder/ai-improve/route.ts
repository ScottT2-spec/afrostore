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

    // Build a focused prompt
    const contentJson = JSON.stringify(content, null, 2);

    const systemPrompt = `You are a professional copywriter for African ecommerce businesses. Your job is to improve website section content to be more compelling, conversion-focused, and engaging.

Rules:
- Return ONLY valid JSON with the same keys as the input
- Improve headlines to be punchier and more attention-grabbing
- Make descriptions more compelling and benefit-focused
- Keep the same structure — same keys, same array lengths
- Don't change URLs, image paths, icons, hrefs, or technical values
- Don't add new keys or remove existing ones
- Keep text concise — website copy should be scannable
- Tailor language for African businesses and customers
- If a value is a number, boolean, URL, or icon name, keep it as-is
- Return raw JSON only — no markdown, no code fences, no explanation`;

    const userPrompt = `Improve this "${sectionType}" section content. Return the improved version as JSON with the exact same structure:

${contentJson}`;

    const result = await ai.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      capability: AICapability.CHAT,
    });

    // Parse the AI response as JSON
    let improved: Record<string, unknown>;
    try {
      // Strip markdown code fences if present
      let raw = result.content.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      improved = JSON.parse(raw);
    } catch {
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
  } catch (error) {
    console.error("AI improve error:", error);
    return NextResponse.json(
      { error: "Failed to improve section. Please try again." },
      { status: 500 }
    );
  }
}
