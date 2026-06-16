import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) return NextResponse.json({ error: "no GROQ_API_KEY" }, { status: 500 });

    // Test with a simplified version of the store generation prompt
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional ecommerce content generator. Return ONLY valid JSON. No markdown fences, no explanation, no text before or after the JSON." },
          { role: "user", content: `Generate content for an African ecommerce store called "Test Store" (general business type, Nigeria, NGN).

Return ONLY valid JSON with this structure:
{
  "brand": { "tagline": "...", "heroHeading": "...", "heroSubheading": "...", "ctaText": "..." },
  "about": { "headline": "...", "story": "2 paragraphs", "values": [{"title":"...","desc":"..."},{"title":"...","desc":"..."},{"title":"...","desc":"..."}] },
  "faq": { "items": [{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}] },
  "policies": { "shipping": "...", "returns": "...", "privacy": "..." },
  "contact": { "headline": "...", "subtitle": "..." },
  "seo": { "homeTitle":"...","homeDesc":"...","aboutTitle":"...","aboutDesc":"...","faqTitle":"...","faqDesc":"...","contactTitle":"...","contactDesc":"..." },
  "testimonials": [{"name":"...","text":"...","role":"..."},{"name":"...","text":"...","role":"..."}],
  "features": [{"title":"...","desc":"..."},{"title":"...","desc":"..."},{"title":"...","desc":"..."}]
}` },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    
    if (data.error) {
      return NextResponse.json({ step: "groq_call", error: data.error }, { status: 500 });
    }

    const content = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason;
    const tokens = data.usage;

    // Try parsing
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e: any) {
      return NextResponse.json({
        step: "json_parse",
        error: e.message,
        finishReason,
        tokens,
        contentLength: content.length,
        contentStart: content.slice(0, 200),
        contentEnd: content.slice(-200),
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      finishReason,
      tokens,
      parsedKeys: Object.keys(parsed),
    });
  } catch (e: any) {
    return NextResponse.json({ step: "exception", error: e.message, stack: e.stack?.slice(0, 500) }, { status: 500 });
  }
}
