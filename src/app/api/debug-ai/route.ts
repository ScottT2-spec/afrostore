import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test 1: Check env vars
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGoogle = !!process.env.GOOGLE_AI_KEY;
    const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
    
    const envCheck = { hasGroq, hasOpenAI, hasAnthropic, hasGoogle, hasDeepSeek };
    
    // Test 2: Try a simple Groq call
    let groqTest = "skipped";
    if (hasGroq) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Return exactly: {\"test\": true}" }],
            max_tokens: 50,
          }),
        });
        const data = await res.json();
        if (data.error) {
          groqTest = `error: ${JSON.stringify(data.error)}`;
        } else {
          groqTest = `ok: ${data.choices?.[0]?.message?.content?.slice(0, 100)}`;
        }
      } catch (e: any) {
        groqTest = `exception: ${e.message}`;
      }
    }
    
    return NextResponse.json({ envCheck, groqTest });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
