/**
 * Structured AI output — the replacement for "prompt the model to return
 * JSON, then JSON.parse() and hope."
 *
 * Every AI generator in this codebase (store generation, product
 * descriptions, business classification, block content) used to build a
 * giant prompt describing a JSON shape in English, ask the model to
 * "return ONLY valid JSON, no markdown fences," and then run bare
 * `JSON.parse()` on whatever came back into an untyped `Record<string,
 * any>`. Two independent failure modes fell out of that:
 *
 *   1. The model doesn't return valid JSON at all (extra commentary, an
 *      unstripped code fence, a trailing comma) — parse throws.
 *   2. The model returns valid JSON with the WRONG SHAPE (a string where
 *      an array was expected, a missing required field, an extra
 *      hallucinated key) — parse succeeds, and that malformed data then
 *      flows straight into page-building code and `prisma.create()` calls
 *      completely untyped. This is the more dangerous failure because
 *      nothing throws; it just produces broken or nonsensical pages.
 *
 * This module fixes both by using real function calling instead of prompt
 * engineering: the desired shape is defined once as a Zod schema (the
 * TypeScript equivalent of Pydantic), converted automatically into the
 * JSON Schema the model is given as a tool definition, and the tool call
 * is FORCED (toolChoice) rather than hoped for. The result is validated
 * with that same schema at runtime — if it doesn't match, the specific
 * validation errors are fed back to the model as a corrective follow-up
 * message and it gets another attempt, rather than either crashing or
 * silently accepting bad data.
 *
 * The schema is the single source of truth for both what the model is
 * told to produce AND what's accepted afterward — they cannot drift apart
 * the way a hand-written "here's the JSON shape" prompt and hand-written
 * downstream field access always eventually do.
 */

import { z } from "zod";
import type { ZodType } from "zod";
import { AICapability } from "@/lib/failover";
import type { AIFailover, AIMessage, AITool } from "@/lib/failover";

export class AIStructuredOutputError extends Error {
  constructor(
    message: string,
    public readonly issues?: unknown,
    public readonly attempts?: number
  ) {
    super(message);
    this.name = "AIStructuredOutputError";
  }
}

export interface GenerateStructuredOptions<T> {
  ai: AIFailover;
  schema: ZodType<T>;
  /** Function name presented to the model — keep short, no spaces. */
  toolName: string;
  /** What this function does, from the model's point of view. */
  toolDescription: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  /** Retries specifically for schema-validation failures. Default 2. */
  maxRetries?: number;
  /** Preferred provider, passed straight through to the failover engine. */
  preferredProvider?: string;
}

export interface GenerateStructuredResult<T> {
  data: T;
  provider: string;
  model: string;
  /** How many attempts it took, including the first — for logging/evals. */
  attempts: number;
}

/**
 * Converts a Zod schema to the JSON Schema shape every provider's function
 * calling expects, with the couple of adjustments providers actually need
 * in practice (Gemini rejects unknown top-level keys like $schema; nobody
 * needs the $schema meta key inside a function's parameter definition
 * anyway since it's describing itself, not being validated against
 * anything external).
 */
function toToolParameters(schema: ZodType<unknown>): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" }) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return jsonSchema;
}

function summarizeIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 10)
    .map((issue) => `- ${issue.path.length ? issue.path.join(".") : "(root)"}: ${issue.message}`)
    .join("\n");
}

export async function generateStructured<T>(
  opts: GenerateStructuredOptions<T>
): Promise<GenerateStructuredResult<T>> {
  const {
    ai,
    schema,
    toolName,
    toolDescription,
    systemPrompt,
    userPrompt,
    maxTokens = 4096,
    temperature = 0.7,
    maxRetries = 2,
    preferredProvider,
  } = opts;

  const tools: AITool[] = [
    {
      type: "function",
      function: {
        name: toolName,
        description: toolDescription,
        parameters: toToolParameters(schema as ZodType<unknown>),
      },
    },
  ];

  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let lastValidationError: z.ZodError | null = null;
  let lastFailureReason = "unknown";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await ai.chat({
      capability: AICapability.FUNCTION_CALLING,
      messages,
      tools,
      toolChoice: { name: toolName },
      maxTokens,
      temperature,
      preferredProvider,
    });

    if (!result.success || !result.data) {
      const errors =
        result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
      // A transport-level failure (all providers down/rate-limited) isn't
      // something a corrective retry can fix — fail immediately rather
      // than burning the retry budget on requests that can't succeed.
      throw new AIStructuredOutputError(`AI request failed: ${errors}`, undefined, attempt + 1);
    }

    const toolCall = result.data.toolCalls?.[0];

    if (!toolCall) {
      // Forced tool_choice still doesn't guarantee a call on every
      // provider under every condition — treat a plain-text reply the
      // same as a validation failure: tell it exactly what to do instead
      // of silently trying to parse prose as if it were the answer.
      lastFailureReason = "model replied with text instead of calling the function";
      messages.push({ role: "assistant", content: result.data.content || "" });
      messages.push({
        role: "user",
        content: `You must call the "${toolName}" function with the data — do not reply with plain text or explanation. Call the function now.`,
      });
      continue;
    }

    let args: unknown;
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      lastFailureReason = "function arguments were not valid JSON";
      messages.push({ role: "assistant", content: "", toolCalls: [toolCall] });
      messages.push({
        role: "tool",
        toolCallId: toolCall.id,
        content: `Your arguments were not valid JSON. Call ${toolName} again with valid JSON matching the schema.`,
      });
      continue;
    }

    const parsed = schema.safeParse(args);
    if (parsed.success) {
      return {
        data: parsed.data,
        provider: result.data.provider,
        model: result.data.model,
        attempts: attempt + 1,
      };
    }

    lastValidationError = parsed.error;
    lastFailureReason = "schema validation failed";
    const issueSummary = summarizeIssues(parsed.error);

    console.warn(
      `[generateStructured] "${toolName}" validation failed (attempt ${attempt + 1}/${maxRetries + 1}), provider=${result.data.provider}:\n${issueSummary}`
    );

    messages.push({ role: "assistant", content: "", toolCalls: [toolCall] });
    messages.push({
      role: "tool",
      toolCallId: toolCall.id,
      content: `Your response didn't match the required schema. Fix these specific issues and call ${toolName} again with corrected data:\n${issueSummary}`,
    });
  }

  throw new AIStructuredOutputError(
    `AI failed to produce valid "${toolName}" output after ${maxRetries + 1} attempts (last failure: ${lastFailureReason}).`,
    lastValidationError?.issues,
    maxRetries + 1
  );
}
