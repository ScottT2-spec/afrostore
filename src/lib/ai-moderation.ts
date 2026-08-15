/**
 * Content moderation for the merchant AI assistant.
 *
 * Applied to BOTH directions:
 *  - the merchant's input, before we spend money calling a provider
 *  - the model's output, before it's returned to the merchant
 *
 * Primary check: OpenAI's moderation endpoint (free, fast, purpose-built)
 * when OPENAI_API_KEY is configured — used regardless of which provider
 * actually generated the AI failover's response, since it's a standalone
 * classifier, not tied to GPT specifically.
 *
 * Fallback: a conservative keyword/pattern heuristic for when no OpenAI
 * key is configured. It's deliberately narrow (severe categories only) —
 * a heuristic that's too aggressive produces false positives that erode
 * trust in the whole guardrail, and a legitimate store selling e.g.
 * kitchen knives or hunting gear shouldn't get blocked by a keyword list.
 */

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  source: "openai" | "heuristic" | "none";
}

const HEURISTIC_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  { category: "self_harm", pattern: /\b(kill (myself|yourself)|suicide method|how to (self.?harm|end my life))\b/i },
  { category: "csam", pattern: /\b(child|minor|underage)\b.{0,30}\b(sex|naked|explicit|porn)\b/i },
  { category: "weapons_uplift", pattern: /\b(how to (make|build|synthesize) (a )?(bomb|explosive|nerve agent|bioweapon))\b/i },
  { category: "hate_slur", pattern: /\b(n[i1]gg[ae3]r|f[a4]gg[o0]t|k[i1]ke)\b/i },
];

async function moderateWithOpenAI(text: string): Promise<ModerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text.slice(0, 8000) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null; // fall through to heuristic rather than fail-open on a request-level error
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    const categories = Object.entries(result.categories || {})
      .filter(([, flagged]) => flagged)
      .map(([cat]) => cat);

    return { flagged: !!result.flagged, categories, source: "openai" };
  } catch {
    return null; // network/timeout — fall through to heuristic
  }
}

function moderateWithHeuristic(text: string): ModerationResult {
  const categories: string[] = [];
  for (const { category, pattern } of HEURISTIC_PATTERNS) {
    if (pattern.test(text)) categories.push(category);
  }
  return { flagged: categories.length > 0, categories, source: "heuristic" };
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || !text.trim()) return { flagged: false, categories: [], source: "none" };

  const openaiResult = await moderateWithOpenAI(text);
  if (openaiResult) return openaiResult;

  return moderateWithHeuristic(text);
}
