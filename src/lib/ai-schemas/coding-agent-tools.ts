/**
 * Parameter schemas for the coding agent's tool set. Each schema both
 * defines what the model is told the tool accepts AND validates what it
 * actually sends — same principle as ai-schemas/store-generation.ts, just
 * one schema per tool instead of one schema for a whole generation.
 */

import { z } from "zod";

export const listFilesSchema = z.object({
  path: z.string().describe('Directory path relative to the project root, e.g. "." or "src/components". Use "." to list the project root.'),
});

export const readFileSchema = z.object({
  path: z.string().describe("File path relative to the project root."),
});

export const writeFileSchema = z.object({
  path: z.string().describe("File path relative to the project root. Creates the file (and any missing parent directories) or overwrites it if it already exists."),
  content: z.string().describe("The full content to write to the file."),
});

export const editFileSchema = z.object({
  path: z.string().describe("File path relative to the project root. The file must already exist — use write_file to create a new one."),
  old_str: z.string().min(1).describe("The exact text to replace, including whitespace. Must appear exactly once in the file — read the file first if unsure."),
  new_str: z.string().describe("The text to replace it with. Pass an empty string to delete the matched text."),
});

export const deleteFileSchema = z.object({
  path: z.string().describe("File or directory path relative to the project root."),
  recursive: z.boolean().describe("Must be true to delete a directory. Ignored for a single file."),
});

export const runCommandSchema = z.object({
  command: z.string().min(1).describe('Shell command to run in the project root, e.g. "npm install lucide-react" or "ls -la src/components".'),
});

// No parameters — Zod still needs an object schema even for zero fields,
// since function-calling tool definitions are always an object at the
// top level.
export const getBuildErrorsSchema = z.object({});

export const takeScreenshotSchema = z.object({
  path: z.string().describe('Which route to screenshot, e.g. "/" or "/about". Defaults to the homepage.'),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(1).describe("A clear, specific description of the image to generate — e.g. 'professional hero photo of a modern bakery storefront, warm lighting, no text overlay'. Specific prompts produce far better results than vague ones."),
  name: z.string().min(1).describe("A short, human-readable name for this image (used as the filename/media library entry) — e.g. 'Hero banner' or 'About us photo'."),
});

export const finishTaskSchema = z.object({
  summary: z.string().min(1).describe("A short, merchant-facing summary of what was built or changed — this is shown to the person who asked for it, not logged internally."),
  filesChanged: z.array(z.string()).describe("Relative paths of every file created, edited, or deleted during this task."),
  qualityChecklist: z.object({
    matchesRequest: z.boolean().describe("True only if what you built genuinely matches what was asked for — re-read the original task before answering, don't assume."),
    hasRealCopy: z.boolean().describe("True only if there is NO lorem ipsum, '[Your Business Name]', or other obviously-placeholder text anywhere in what you built or touched."),
    noBrokenStates: z.boolean().describe("True only if there are no empty-looking sections, missing images with no fallback, or dead '#' links left as TODOs."),
    isResponsive: z.boolean().describe("True only if you used the component vocabulary (which is responsive by default) or explicitly verified mobile layout for any custom section you wrote."),
    buildPasses: z.boolean().describe("True only if you called get_build_errors after your last change and it reported success."),
  }).describe("Honest self-assessment against the quality bar in your instructions — a false 'true' here defeats the entire point of this field."),
});

export type ListFilesArgs = z.infer<typeof listFilesSchema>;
export type ReadFileArgs = z.infer<typeof readFileSchema>;
export type WriteFileArgs = z.infer<typeof writeFileSchema>;
export type EditFileArgs = z.infer<typeof editFileSchema>;
export type DeleteFileArgs = z.infer<typeof deleteFileSchema>;
export type GenerateImageArgs = z.infer<typeof generateImageSchema>;
export type RunCommandArgs = z.infer<typeof runCommandSchema>;
export type GetBuildErrorsArgs = z.infer<typeof getBuildErrorsSchema>;
export type TakeScreenshotArgs = z.infer<typeof takeScreenshotSchema>;
export type FinishTaskArgs = z.infer<typeof finishTaskSchema>;
