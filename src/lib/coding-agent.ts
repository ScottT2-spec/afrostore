/**
 * The actual agentic loop — what makes this behave like a coding agent
 * (Lovable, Claude Code) instead of a single-shot content generator.
 *
 * Phase 1 (ai-structured-output.ts) forces exactly one tool call and
 * returns. This is different: the model gets the FULL tool set below and
 * decides, turn by turn, which one to call next based on what the
 * previous one returned — list a directory, read a file, edit it, run
 * the build, see it failed, read the error, fix it, run the build again,
 * take a screenshot, then call finish_task. Nothing here scripts that
 * sequence — the model drives it, and this loop just keeps executing
 * whatever it calls and feeding the result back until it says it's done
 * or the iteration cap is hit.
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import { persistGeneratedFile, persistGeneratedFileDelete } from "@/lib/sandbox/generated-files";
import { estimateCostUsd } from "@/lib/ai-pricing";
import { generateAiImage, isAiImageGenConfigured } from "@/lib/gemini-image-client";
import { persistGeneratedImage } from "@/lib/media-storage";
import { searchUnsplashPhotos } from "@/lib/unsplash-client";
import { AICapability } from "@/lib/failover";
import type { AIFailover, AIMessage, AITool } from "@/lib/failover";
import {
  listFilesSchema,
  readFileSchema,
  writeFileSchema,
  editFileSchema,
  deleteFileSchema,
  runCommandSchema,
  getBuildErrorsSchema,
  takeScreenshotSchema,
  generateImageSchema,
  finishTaskSchema,
  type FinishTaskArgs,
} from "@/lib/ai-schemas/coding-agent-tools";
import {
  listSandboxFiles,
  readSandboxFile,
  writeSandboxFile,
  editSandboxFile,
  deleteSandboxFile,
  runSandboxCommand,
  getSandboxBuildErrors,
  takeSandboxScreenshot,
  SandboxEditError,
} from "@/lib/sandbox/daytona";

export class CodingAgentError extends Error {}

function toToolParameters(schema: z.ZodType<unknown>): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" }) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return jsonSchema;
}

const TOOL_DEFS: AITool[] = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files and directories at a given path in the project.",
      parameters: toToolParameters(listFilesSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the full contents of a file. Always do this before editing a file you haven't already read in this session.",
      parameters: toToolParameters(readFileSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Create a new file, or fully overwrite an existing one. Prefer edit_file for small changes to a file that already exists.",
      parameters: toToolParameters(writeFileSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "edit_file",
      description: "Make a precise edit to an existing file by replacing one exact, unique occurrence of text. Fails if the text isn't found or isn't unique — read the file first if unsure.",
      parameters: toToolParameters(editFileSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "delete_file",
      description: "Delete a file, or a directory with recursive:true.",
      parameters: toToolParameters(deleteFileSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Run a shell command in the project root — installing a package, running a script, checking something with ls/grep/etc.",
      parameters: toToolParameters(runCommandSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "get_build_errors",
      description: "Run the project's build and see whether it succeeds. Always call this after making changes and before finishing — never finish with a broken build.",
      parameters: toToolParameters(getBuildErrorsSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "take_screenshot",
      description: "Capture a screenshot of the live preview at a given route, to see what a page actually looks like after a visual change.",
      parameters: toToolParameters(takeScreenshotSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "generate_image",
      description: "Generates a real, unique image from a text description and returns a hosted URL to use in an <img> src. ALWAYS use this instead of guessing or inventing an image URL — a made-up URL points to nothing and produces a broken image for the merchant.",
      parameters: toToolParameters(generateImageSchema),
    },
  },
  {
    type: "function",
    function: {
      name: "finish_task",
      description: "Call this once the task is complete and the build succeeds. Ends the session — nothing else can be done after this.",
      parameters: toToolParameters(finishTaskSchema),
    },
  },
];

import { COMPONENT_LIBRARY_DESCRIPTIONS } from "./sandbox/component-library";
import { SHADCN_PRIMITIVE_DESCRIPTIONS } from "./sandbox/shadcn-primitives";
import { SCAFFOLD_OWNED_PATHS } from "./sandbox/scaffold";
import { siteManifestSchema, renderManifestForPrompt, type SiteManifest } from "./ai-schemas/site-manifest";

const SYSTEM_PROMPT_BASE = `You are a careful, senior front-end engineer working inside a live, sandboxed Vite + React + TypeScript + Tailwind project (NOT Next.js — there is no app router, no server components, no next/link or next/image; routing is client-side via react-router-dom, registered in src/App.tsx). You have tools to explore, read, write, and edit files, run commands, check build errors, and see screenshots of what you've built.

MATCH YOUR EFFORT TO THE TASK. Not every request needs the same process:
- A small, well-scoped change (copy edit, button text, a color, swapping one image, a single style tweak) — find the specific file, make the edit, run get_build_errors, finish. Don't list_files across the whole project, don't read files you have no reason to touch, don't re-verify things the task didn't ask you to change.
- A substantial or ambiguous request (a new page, a new feature, "make the site better," anything touching multiple files or where you're not sure what already exists) — explore first with list_files/read_file before writing anything, so you're extending real structure instead of guessing at it or duplicating something that's already there.
The iteration budget below is a safety ceiling, not a target — finishing a trivial edit in 3 tool calls is correct, not incomplete. Read the request once and judge which kind it is before your first tool call.

PROJECT CONTRACTS — do not restructure these, extend them instead:
${[...SCAFFOLD_OWNED_PATHS].map((p) => `- ${p}`).join("\n")}
New pages go in src/pages/ with a matching <Route> added to src/App.tsx. New shared UI goes in src/components/.

DESIGN TOKENS — this site already has a fixed, professionally-chosen color palette and font pairing, wired into Tailwind as: bg-primary, text-primary-foreground, bg-secondary, bg-accent, bg-background, text-foreground, bg-muted, border-border, font-heading, font-body. ALWAYS use these instead of inventing your own hex codes or arbitrary Tailwind colors (bg-blue-500 etc.) — that inconsistency is the single most common way generated sites look unfinished or "off-brand" to the merchant who ordered them.

COMPONENT VOCABULARY — reach for these first before writing a custom section from scratch. They're already responsive, accessible, and wired to the design tokens correctly:
${COMPONENT_LIBRARY_DESCRIPTIONS}
Only build a custom component when nothing here genuinely fits what was asked for.

UI PRIMITIVES (shadcn/ui) — for any interactive pattern (modal, drawer, dropdown, collapsible), use these instead of hand-rolling your own with useState and conditional rendering. They handle focus management, keyboard navigation, and animation correctly, which is easy to get subtly wrong by hand:
${SHADCN_PRIMITIVE_DESCRIPTIONS}

WHAT "DONE" MEANS FOR A MERCHANT, not just a passing build:
- Real copy everywhere. Never leave lorem ipsum, "[Your Business Name]", "Lorem ipsum dolor...", or any obviously-placeholder text in the final result.
- No broken or empty-looking states — an empty product grid, a missing image with no fallback, or a section with no content is not acceptable as final output. Whenever a page needs a real image (a hero photo, a product shot, anything photographic), call generate_image and use the URL it returns — never invent, guess, or hallucinate an image URL; one that doesn't actually exist is a broken image for the merchant, exactly the failure mode this rule exists to prevent.
- Every nav link and button actually goes somewhere real (a route that exists, or a working in-page anchor) — never a dead "#" left as a TODO.
- Looks correct on mobile, not just desktop — the component vocabulary above handles this by default; a custom section must too.
- The result should actually match what was asked for — re-read the original task before calling finish_task and confirm you built what was requested, not just "something that builds."

Rules:
- Always read a file before editing it with edit_file — the replacement text must match the existing file exactly.
- Prefer edit_file over write_file for small changes to a file that already exists; use write_file for new files or full rewrites.
- After making changes, call get_build_errors before finishing. If the build fails, fix the specific errors shown and check again — never finish with a broken build.
- If you changed anything visual (any .tsx/.jsx file), take_screenshot is REQUIRED before finish_task — this isn't optional guidance, it's enforced. The actual screenshot image is shown to you in the message right after you call it — genuinely look at it for real defects (overlapping elements, invisible or low-contrast text, a collapsed or broken layout, content bleeding off-screen) before deciding the task is done. A build that compiles cleanly can still be visually broken; the build passing and the page looking right are two different things, and only looking at the actual screenshot confirms the second one.
- If you're unsure what already exists, use list_files and read_file to find out rather than guessing at file contents or structure.
- Call finish_task only once the build succeeds and the task is genuinely done, matching every item in the quality checklist honestly — a false "yes" on a checklist item you know isn't true defeats its entire purpose. Write the summary for the merchant who asked for this — plain language, not implementation detail they won't understand or care about.
- finish_task also requires the full, current siteManifest (pages/components/summary) — not a diff. Start from the state you were given below (if any), then update it to reflect reality after your changes. This is the only memory the next task gets of what you built — an inaccurate manifest here directly misleads a future run into re-exploring things it should already know, or missing things it should check.`;

/**
 * Builds the actual system prompt for a run: the fixed instructions above,
 * plus the site's current manifest (if any) appended as a distinct
 * briefing section. Kept as a function rather than baking the manifest
 * into a module-level constant since the manifest is per-site and
 * changes between runs — this makes SYSTEM_PROMPT_BASE cacheable by
 * providers that support prompt caching while only the manifest section
 * varies per call.
 */
function buildSystemPrompt(manifest: SiteManifest | null): string {
  return `${SYSTEM_PROMPT_BASE}\n\n${renderManifestForPrompt(manifest)}`;
}

export interface CodingAgentStep {
  tool: string;
  args: unknown;
  result: string;
  isError: boolean;
}

export interface CodingAgentResult {
  summary: string;
  filesChanged: string[];
  qualityChecklist: FinishTaskArgs["qualityChecklist"];
  steps: CodingAgentStep[];
  provider: string;
  model: string;
  iterations: number;
}

export interface RunCodingAgentOptions {
  ai: AIFailover;
  sandboxExternalId: string;
  task: string;
  /** Which site this run belongs to, for telemetry (CodingAgentRun) — iteration counts, quality-checklist pass rates, and failure modes only become visible in aggregate once real usage accumulates here. */
  siteId: string;
  /** "eval" tags a run as part of the golden-path eval harness, not real merchant usage — keeps aggregate stats honest. */
  source?: "live" | "eval";
  maxIterations?: number;
  /** Called after every tool execution — for streaming progress to a UI later. */
  onStep?: (step: CodingAgentStep) => void;
}

export async function runCodingAgent(opts: RunCodingAgentOptions): Promise<CodingAgentResult> {
  const { ai, sandboxExternalId, task, siteId, source = "live", maxIterations = 20, onStep } = opts;

  const run = await prisma.codingAgentRun.create({
    data: { siteId, sandboxExternalId, task, status: "running", source },
  });

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { siteManifest: true } });
  const currentManifest = (site?.siteManifest as SiteManifest | null) ?? null;

  const messages: AIMessage[] = [
    { role: "system", content: buildSystemPrompt(currentManifest) },
    { role: "user", content: task },
  ];

  const steps: CodingAgentStep[] = [];
  let lastProvider = "";
  let lastModel = "";
  let toolCallCount = 0;
  let completedIterations = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalCacheWriteTokens = 0;
  let totalCacheReadTokens = 0;
  let sawVisualChange = false;
  let tookScreenshot = false;
  let imageGenerationCount = 0;

  try {
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      completedIterations = iteration + 1;
      let result = await ai.chat({
        // Once a screenshot's been taken, its image stays in the message
        // history for every turn from here on — not just the next one.
        // Without requiring VISION too, the failover engine could route
        // any later turn to a text-only model (Groq's llama-3.3-70b,
        // first in priority order, declares FUNCTION_CALLING but not
        // VISION) and it would either reject the request outright or
        // silently ignore the image, quietly defeating the whole point
        // of taking the screenshot in the first place.
        capability: tookScreenshot
          ? [AICapability.FUNCTION_CALLING, AICapability.VISION]
          : AICapability.FUNCTION_CALLING,
        messages,
        tools: TOOL_DEFS,
        toolChoice: "required",
        maxTokens: 4096,
        // Lower than content generation (which defaults to 0.7) — this is
        // engineering work with a right answer, not copywriting that
        // benefits from variety.
        temperature: 0.3,
      });

      if ((!result.success || !result.data) && tookScreenshot) {
        // A screenshot is a quality improvement, not a requirement — if
        // this environment genuinely has no vision-capable provider
        // configured, that shouldn't be able to abort an otherwise
        // complete, successful task. Retry this one turn without the
        // vision requirement rather than crashing the whole run; the
        // model just won't get to see the screenshot it took, but
        // everything else proceeds normally via the exact same code
        // path below — result is simply reassigned, nothing duplicated.
        const errors = result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
        console.warn(`[coding-agent] No vision-capable provider available after screenshot — continuing without it: ${errors}`);
        result = await ai.chat({
          capability: AICapability.FUNCTION_CALLING,
          messages,
          tools: TOOL_DEFS,
          toolChoice: "required",
          maxTokens: 4096,
          temperature: 0.3,
        });
      }

      if (!result.success || !result.data) {
        const errors =
          result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
        throw new CodingAgentError(`AI request failed: ${errors}`);
      }

    lastProvider = result.data.provider;
    lastModel = result.data.model;
    totalPromptTokens += result.data.usage.promptTokens;
    totalCompletionTokens += result.data.usage.completionTokens;
    totalCacheWriteTokens += result.data.usage.cacheWriteTokens || 0;
    totalCacheReadTokens += result.data.usage.cacheReadTokens || 0;

    const toolCalls = result.data.toolCalls;
    if (!toolCalls || toolCalls.length === 0) {
      // Forced tool_choice still didn't produce a call — same corrective
      // pattern as ai-structured-output.ts: tell it what to do instead of
      // treating the plain-text reply as if it meant something.
      messages.push({ role: "assistant", content: result.data.content || "" });
      messages.push({ role: "user", content: "You must call one of the available tools — do not reply with plain text or explanation." });
      continue;
    }

    messages.push({ role: "assistant", content: "", toolCalls });

    for (const call of toolCalls) {
      toolCallCount++;
      const { name, arguments: rawArgs } = call.function;

      let args: unknown;
      try {
        args = JSON.parse(rawArgs);
      } catch {
        const step: CodingAgentStep = { tool: name, args: rawArgs, result: "Arguments were not valid JSON.", isError: true };
        steps.push(step);
        onStep?.(step);
        messages.push({ role: "tool", toolCallId: call.id, content: step.result });
        continue;
      }

      if (name === "generate_image") {
        const MAX_IMAGES_PER_TASK = 6;
        if (imageGenerationCount >= MAX_IMAGES_PER_TASK) {
          // Each call costs real money (an AI image generation, or at
          // minimum an Unsplash lookup) - an unbounded loop generating
          // images is a real cost risk, not a hypothetical one. Reject
          // early, before even attempting the call, once a task has
          // generated a reasonable number - reuse what's already been
          // made instead of generating more.
          const message = `Image generation limit reached (${MAX_IMAGES_PER_TASK} per task). Reuse an already-generated image's URL instead of generating another.`;
          const step: CodingAgentStep = { tool: name, args, result: message, isError: true };
          steps.push(step);
          onStep?.(step);
          messages.push({ role: "tool", toolCallId: call.id, content: message });
          continue;
        }
        imageGenerationCount++;
      }

      if (name === "finish_task") {
        const parsed = finishTaskSchema.safeParse(args);
        if (!parsed.success) {
          const message = `Invalid finish_task arguments: ${parsed.error.issues.map((i) => i.message).join("; ")}`;
          const step: CodingAgentStep = { tool: name, args, result: message, isError: true };
          steps.push(step);
          onStep?.(step);
          messages.push({ role: "tool", toolCallId: call.id, content: message });
          continue;
        }

        if (sawVisualChange && !tookScreenshot) {
          // Structural, not optional: if any .tsx/.jsx file was touched
          // this task, a screenshot MUST have been taken before finishing
          // - otherwise "isResponsive"/"noBrokenStates" in the checklist
          // below are claims about a page nobody, including the model
          // itself, ever actually looked at.
          const message = "finish_task was rejected: you changed a visual component (.tsx/.jsx) but never called take_screenshot. Take a screenshot of the affected page(s), look at it for real defects, then call finish_task again.";
          const step: CodingAgentStep = { tool: name, args, result: message, isError: true };
          steps.push(step);
          onStep?.(step);
          messages.push({ role: "tool", toolCallId: call.id, content: message });
          continue;
        }

        const failedChecks = Object.entries(parsed.data.qualityChecklist)
          .filter(([, passed]) => !passed)
          .map(([check]) => check);
        if (failedChecks.length > 0) {
          // Same self-correction shape as a build-error retry: don't
          // accept a self-reported failure as "done" — tell it exactly
          // what it flagged as unmet and force another iteration to
          // actually fix it, rather than silently shipping known-bad
          // output to the merchant.
          const message = `finish_task was rejected: you reported these quality checks as NOT passing: ${failedChecks.join(", ")}. Fix the underlying issue(s), then call finish_task again once every check is honestly true.`;
          const step: CodingAgentStep = { tool: name, args, result: message, isError: true };
          steps.push(step);
          onStep?.(step);
          messages.push({ role: "tool", toolCallId: call.id, content: message });
          continue;
        }

        await prisma.codingAgentRun.update({
          where: { id: run.id },
          data: {
            status: "completed",
            summary: parsed.data.summary,
            filesChanged: parsed.data.filesChanged,
            qualityChecklist: parsed.data.qualityChecklist,
            iterations: iteration + 1,
            toolCallCount,
            provider: lastProvider,
            model: lastModel,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            cacheWriteTokens: totalCacheWriteTokens,
            cacheReadTokens: totalCacheReadTokens,
            estimatedCostUsd: estimateCostUsd(lastProvider, lastModel, {
              promptTokens: totalPromptTokens,
              completionTokens: totalCompletionTokens,
              cacheWriteTokens: totalCacheWriteTokens,
              cacheReadTokens: totalCacheReadTokens,
            }),
            completedAt: new Date(),
          },
        });

        // The manifest is the whole point of this feature: without
        // writing it back here, the next run's buildSystemPrompt() call
        // would have nothing to read, and every task would still start
        // from blind re-exploration regardless of everything above.
        await prisma.site.update({
          where: { id: siteId },
          data: { siteManifest: parsed.data.siteManifest },
        });

        return {
          summary: parsed.data.summary,
          filesChanged: parsed.data.filesChanged,
          qualityChecklist: parsed.data.qualityChecklist,
          steps,
          provider: lastProvider,
          model: lastModel,
          iterations: iteration + 1,
        };
      }

      const { result: toolResult, isError, imageDataUrl } = await executeTool(sandboxExternalId, siteId, name, args);
      const step: CodingAgentStep = { tool: name, args, result: toolResult, isError };
      steps.push(step);
      onStep?.(step);
      messages.push({ role: "tool", toolCallId: call.id, content: toolResult });
      if (imageDataUrl) {
        tookScreenshot = true;
        // A normal user-role message, not folded into the tool_result -
        // OpenAI's protocol doesn't accept image content inside a
        // tool/function-role message at all, but every provider accepts
        // it in a user message. This is what actually gets the real
        // screenshot in front of the model, not a byte-count string.
        messages.push({
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageDataUrl } },
            { type: "text", text: "This is the current state of the page you just captured. Look for real visual defects before proceeding." },
          ],
        });
      }
      if (name === "write_file" || name === "edit_file") {
        const path = (args as { path?: string }).path || "";
        if (/\.(tsx|jsx)$/.test(path)) sawVisualChange = true;
      }
    }
    }

    throw new CodingAgentError(`Coding agent did not finish within ${maxIterations} iterations.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.codingAgentRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        error: message,
        iterations: completedIterations,
        toolCallCount,
        provider: lastProvider,
        model: lastModel,
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        cacheWriteTokens: totalCacheWriteTokens,
        cacheReadTokens: totalCacheReadTokens,
        estimatedCostUsd: estimateCostUsd(lastProvider, lastModel, {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          cacheWriteTokens: totalCacheWriteTokens,
          cacheReadTokens: totalCacheReadTokens,
        }),
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

async function executeTool(
  sandboxExternalId: string,
  siteId: string,
  name: string,
  args: unknown
): Promise<{ result: string; isError: boolean; imageDataUrl?: string }> {
  try {
    switch (name) {
      case "list_files": {
        const parsed = listFilesSchema.parse(args);
        const entries = await listSandboxFiles(sandboxExternalId, parsed.path);
        return { result: JSON.stringify(entries), isError: false };
      }
      case "read_file": {
        const parsed = readFileSchema.parse(args);
        const content = await readSandboxFile(sandboxExternalId, parsed.path);
        return { result: content, isError: false };
      }
      case "write_file": {
        const parsed = writeFileSchema.parse(args);
        await writeSandboxFile(sandboxExternalId, parsed.path, parsed.content);
        // Durable persistence happens right after the sandbox write
        // succeeds, not batched until finish_task - a crash or timeout
        // mid-task still leaves every file written up to that point
        // safely recoverable, not just the ones from a "completed" run.
        await persistGeneratedFile(siteId, parsed.path, parsed.content);
        return { result: `Wrote ${parsed.path}`, isError: false };
      }
      case "edit_file": {
        const parsed = editFileSchema.parse(args);
        await editSandboxFile(sandboxExternalId, parsed.path, parsed.old_str, parsed.new_str);
        // Read back the post-edit content rather than reconstructing it
        // locally - the sandbox is the source of truth for what the edit
        // actually produced (whitespace/line-ending handling, etc.), and
        // persistence should reflect exactly that, not a local guess.
        const updated = await readSandboxFile(sandboxExternalId, parsed.path);
        await persistGeneratedFile(siteId, parsed.path, updated);
        return { result: `Edited ${parsed.path}`, isError: false };
      }
      case "delete_file": {
        const parsed = deleteFileSchema.parse(args);
        await deleteSandboxFile(sandboxExternalId, parsed.path, parsed.recursive);
        await persistGeneratedFileDelete(siteId, parsed.path, parsed.recursive ?? false);
        return { result: `Deleted ${parsed.path}`, isError: false };
      }
      case "run_command": {
        const parsed = runCommandSchema.parse(args);
        const cmd = await runSandboxCommand(sandboxExternalId, parsed.command);
        return { result: `exit code ${cmd.exitCode}\n${cmd.output}`, isError: cmd.exitCode !== 0 };
      }
      case "get_build_errors": {
        const build = await getSandboxBuildErrors(sandboxExternalId);
        return {
          result: build.success ? `Build succeeded.\n${build.output}` : `Build FAILED.\n${build.output}`,
          isError: !build.success,
        };
      }
      case "generate_image": {
        const parsed = generateImageSchema.parse(args);

        if (isAiImageGenConfigured()) {
          const generated = await generateAiImage(parsed.prompt);
          if (generated) {
            const mediaItem = await persistGeneratedImage({
              siteId,
              bytes: generated.bytes,
              mimeType: generated.mimeType,
              name: parsed.name,
              folder: "/ai-generated",
            });
            if (mediaItem) {
              return { result: `Image generated: ${mediaItem.url}\nUse this exact URL in your <img> src — do not modify or guess a different one.`, isError: false };
            }
            // Generation succeeded but persisting it failed (storage
            // misconfigured, upload error) - fall through to Unsplash
            // rather than losing the image entirely.
          }
        }

        const photos = await searchUnsplashPhotos(parsed.prompt, 1);
        if (photos.length > 0) {
          return { result: `Image found: ${photos[0].url}\nUse this exact URL in your <img> src — do not modify or guess a different one.`, isError: false };
        }

        return {
          result: "Could not generate or find an image for this prompt. Don't just fall back to a flat solid-color box — design something real with what you have: a CSS gradient composition, an inline SVG illustration/pattern, layered shapes, or an existing image already in the project reused creatively. The section still needs to look intentional and finished, not like a placeholder.",
          isError: true,
        };
      }
      case "take_screenshot": {
        const parsed = takeScreenshotSchema.parse(args);
        const base64 = await takeSandboxScreenshot(sandboxExternalId, parsed.path);
        // The tool_result itself stays text-only - some providers (OpenAI)
        // don't accept image content inside a tool/function-role message
        // at all, so this satisfies every provider's protocol
        // requirement uniformly. The actual image gets shown to the model
        // via a normal follow-up user message instead (see the main loop,
        // right after this tool's result is pushed) - that's supported
        // everywhere and is what actually closes the "screenshot taken
        // but never looked at" gap.
        return {
          result: `Screenshot captured at ${parsed.path}. The actual image follows in the next message - look at it carefully for real visual defects (overlapping elements, invisible or low-contrast text, a collapsed or broken layout, content bleeding off-screen) before deciding the task is done.`,
          isError: false,
          imageDataUrl: `data:image/png;base64,${base64}`,
        };
      }
      default:
        return { result: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        result: `Invalid arguments: ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
        isError: true,
      };
    }
    if (err instanceof SandboxEditError) {
      return { result: err.message, isError: true };
    }
    return { result: err instanceof Error ? err.message : String(err), isError: true };
  }
}
