import { NextRequest, NextResponse } from "next/server";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { chatWithAI, getAIStatus } from "@/lib/ai-service";

export const maxDuration = 60;

type Params = { params: Promise<{ storeId: string }> };

// POST /api/stores/:storeId/ai — Chat with AI assistant
export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return error("Message is required", 400);
    }

    if (message.length > 5000) {
      return error("Message too long (max 5000 characters)", 400);
    }

    // Validate conversation history format
    let history: Array<{ role: "user" | "assistant"; content: string }> | undefined;
    if (conversationHistory && Array.isArray(conversationHistory)) {
      history = conversationHistory
        .filter(
          (m: unknown): m is { role: string; content: string } =>
            typeof m === "object" &&
            m !== null &&
            "role" in m &&
            "content" in m &&
            typeof (m as any).role === "string" &&
            typeof (m as any).content === "string" &&
            ((m as any).role === "user" || (m as any).role === "assistant")
        )
        .slice(-10) // Last 10 messages max
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    }

    const response = await chatWithAI({
      storeId,
      message: message.trim(),
      conversationHistory: history,
    });

    return success(response);
  } catch (err) {
    console.error("AI chat error:", err);

    const message = (err as Error).message || "AI service unavailable";

    // Check if it's a configuration error
    if (message.includes("No AI providers configured")) {
      return NextResponse.json(
        {
          success: false,
          error: "AI is not configured. Please set up an AI provider API key.",
          details: "Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_KEY, GROQ_API_KEY, or DEEPSEEK_API_KEY in environment variables.",
        },
        { status: 503 }
      );
    }

    // Check if all providers failed
    if (message.includes("AI request failed")) {
      return NextResponse.json(
        { success: false, error: "AI service temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET /api/stores/:storeId/ai — Get AI status
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const status = getAIStatus();
  return success(status);
}
