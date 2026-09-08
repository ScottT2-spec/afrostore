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
      name: "finish_task",
      description: "Call this once the task is complete and the build succeeds. Ends the session — nothing else can be done after this.",
      parameters: toToolParameters(finishTaskSchema),
    },
  },
];

import { COMPONENT_LIBRARY_DESCRIPTIONS } from "./sandbox/component-library";
import { SCAFFOLD_OWNED_PATHS } from "./sandbox/scaffold";

const SYSTEM_PROMPT = `You are a careful, senior front-end engineer working inside a live, sandboxed Vite + React + TypeScript + Tailwind project (NOT Next.js — there is no app router, no server components, no next/link or next/image; routing is client-side via react-router-dom, registered in src/App.tsx). You have tools to explore, read, write, and edit files, run commands, check build errors, and see screenshots of what you've built.

PROJECT CONTRACTS — do not restructure these, extend them instead:
${[...SCAFFOLD_OWNED_PATHS].map((p) => `- ${p}`).join("\n")}
New pages go in src/pages/ with a matching <Route> added to src/App.tsx. New shared UI goes in src/components/.

DESIGN TOKENS — this site already has a fixed, professionally-chosen color palette and font pairing, wired into Tailwind as: bg-primary, text-primary-foreground, bg-secondary, bg-accent, bg-background, text-foreground, bg-muted, border-border, font-heading, font-body. ALWAYS use these instead of inventing your own hex codes or arbitrary Tailwind colors (bg-blue-500 etc.) — that inconsistency is the single most common way generated sites look unfinished or "off-brand" to the merchant who ordered them.

COMPONENT VOCABULARY — reach for these first before writing a custom section from scratch. They're already responsive, accessible, and wired to the design tokens correctly:
${COMPONENT_LIBRARY_DESCRIPTIONS}
Only build a custom component when nothing here genuinely fits what was asked for.

WHAT "DONE" MEANS FOR A MERCHANT, not just a passing build:
- Real copy everywhere. Never leave lorem ipsum, "[Your Business Name]", "Lorem ipsum dolor...", or any obviously-placeholder text in the final result.
- No broken or empty-looking states — an empty product grid, a missing image with no fallback, or a section with no content is not acceptable as final output.
- Every nav link and button actually goes somewhere real (a route that exists, or a working in-page anchor) — never a dead "#" left as a TODO.
- Looks correct on mobile, not just desktop — the component vocabulary above handles this by default; a custom section must too.
- The result should actually match what was asked for — re-read the original task before calling finish_task and confirm you built what was requested, not just "something that builds."

Rules:
- Always read a file before editing it with edit_file — the replacement text must match the existing file exactly.
- Prefer edit_file over write_file for small changes to a file that already exists; use write_file for new files or full rewrites.
- After making changes, call get_build_errors before finishing. If the build fails, fix the specific errors shown and check again — never finish with a broken build.
- If you changed anything visual, take a screenshot before finishing to confirm it actually looks right, not just that it compiles.
- If you're unsure what already exists, use list_files and read_file to find out rather than guessing at file contents or structure.
- Call finish_task only once the build succeeds and the task is genuinely done, matching every item in the quality checklist honestly — a false "yes" on a checklist item you know isn't true defeats its entire purpose. Write the summary for the merchant who asked for this — plain language, not implementation detail they won't understand or care about.`;

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

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: task },
  ];

  const steps: CodingAgentStep[] = [];
  let lastProvider = "";
  let lastModel = "";
  let toolCallCount = 0;
  let completedIterations = 0;

  try {
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      completedIterations = iteration + 1;
      const result = await ai.chat({
        capability: AICapability.FUNCTION_CALLING,
        messages,
        tools: TOOL_DEFS,
        toolChoice: "required",
        maxTokens: 4096,
        // Lower than content generation (which defaults to 0.7) — this is
        // engineering work with a right answer, not copywriting that
        // benefits from variety.
        temperature: 0.3,
      });

      if (!result.success || !result.data) {
        const errors =
          result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
        throw new CodingAgentError(`AI request failed: ${errors}`);
      }

    lastProvider = result.data.provider;
    lastModel = result.data.model;

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
            completedAt: new Date(),
          },
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

      const { result: toolResult, isError } = await executeTool(sandboxExternalId, name, args);
      const step: CodingAgentStep = { tool: name, args, result: toolResult, isError };
      steps.push(step);
      onStep?.(step);
      messages.push({ role: "tool", toolCallId: call.id, content: toolResult });
    }
    }

    throw new CodingAgentError(`Coding agent did not finish within ${maxIterations} iterations.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.codingAgentRun.update({
      where: { id: run.id },
      data: { status: "failed", error: message, iterations: completedIterations, toolCallCount, provider: lastProvider, model: lastModel, completedAt: new Date() },
    });
    throw err;
  }
}

async function executeTool(
  sandboxExternalId: string,
  name: string,
  args: unknown
): Promise<{ result: string; isError: boolean }> {
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
        return { result: `Wrote ${parsed.path}`, isError: false };
      }
      case "edit_file": {
        const parsed = editFileSchema.parse(args);
        await editSandboxFile(sandboxExternalId, parsed.path, parsed.old_str, parsed.new_str);
        return { result: `Edited ${parsed.path}`, isError: false };
      }
      case "delete_file": {
        const parsed = deleteFileSchema.parse(args);
        await deleteSandboxFile(sandboxExternalId, parsed.path, parsed.recursive);
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
      case "take_screenshot": {
        const parsed = takeScreenshotSchema.parse(args);
        const base64 = await takeSandboxScreenshot(sandboxExternalId, parsed.path);
        // Confirmation text only — the raw bytes aren't inlined into the
        // conversation. Feeding a full base64 PNG back as a plain-text
        // tool result on every provider would balloon token usage for
        // every subsequent turn with no benefit unless the model is
        // actually shown the image via a vision-capable follow-up, which
        // is a deliberate scope cut for this first version, not an
        // oversight — see the note in the PR description.
        return { result: `Screenshot captured (${Math.round(base64.length / 1024)}KB).`, isError: false };
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
