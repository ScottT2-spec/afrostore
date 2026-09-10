/**
 * Approximate USD pricing per 1M tokens, by provider+model.
 *
 * HONESTY NOTE: these are a snapshot at the time this was written and
 * WILL go stale as providers change pricing - this is for relative cost
 * comparison and rough budgeting, not an invoice-accurate figure. Verify
 * against each provider's current pricing page before treating any
 * number this produces as exact. Unknown models return null rather than
 * a guessed price - a missing number is honest, a wrong one isn't.
 */

interface ModelPricing {
  /** USD per 1M input tokens (normal, non-cached). */
  input: number;
  /** USD per 1M output tokens. */
  output: number;
  /** USD per 1M tokens written to a prompt cache - Anthropic bills this ~1.25x normal input. Omit for providers without prompt caching. */
  cacheWrite?: number;
  /** USD per 1M tokens read from a prompt cache - Anthropic bills this ~0.1x normal input, which is the entire point of caching. Omit for providers without prompt caching. */
  cacheRead?: number;
}

const PRICING: Record<string, ModelPricing> = {
  "anthropic:claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.3 },
  "anthropic:claude-3-haiku-20240307": { input: 0.25, output: 1.25, cacheWrite: 0.3, cacheRead: 0.03 },
  "openai:gpt-4o": { input: 2.5, output: 10.0 },
  "openai:gpt-4o-mini": { input: 0.15, output: 0.6 },
  "google:gemini-2.0-flash": { input: 0.1, output: 0.4 },
};

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  cacheWriteTokens?: number;
  cacheReadTokens?: number;
}

/** Returns an estimated USD cost, or null if this provider+model isn't in the table - never guesses. */
export function estimateCostUsd(provider: string, model: string, usage: TokenUsage): number | null {
  const pricing = PRICING[`${provider}:${model}`];
  if (!pricing) return null;

  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  const cacheWriteCost = pricing.cacheWrite && usage.cacheWriteTokens
    ? (usage.cacheWriteTokens / 1_000_000) * pricing.cacheWrite
    : 0;
  const cacheReadCost = pricing.cacheRead && usage.cacheReadTokens
    ? (usage.cacheReadTokens / 1_000_000) * pricing.cacheRead
    : 0;

  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}
