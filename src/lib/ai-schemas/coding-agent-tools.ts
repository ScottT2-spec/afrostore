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

export const finishTaskSchema = z.object({
  summary: z.string().min(1).describe("A short, merchant-facing summary of what was built or changed — this is shown to the person who asked for it, not logged internally."),
  filesChanged: z.array(z.string()).describe("Relative paths of every file created, edited, or deleted during this task."),
});

export type ListFilesArgs = z.infer<typeof listFilesSchema>;
export type ReadFileArgs = z.infer<typeof readFileSchema>;
export type WriteFileArgs = z.infer<typeof writeFileSchema>;
export type EditFileArgs = z.infer<typeof editFileSchema>;
export type DeleteFileArgs = z.infer<typeof deleteFileSchema>;
export type RunCommandArgs = z.infer<typeof runCommandSchema>;
export type GetBuildErrorsArgs = z.infer<typeof getBuildErrorsSchema>;
export type TakeScreenshotArgs = z.infer<typeof takeScreenshotSchema>;
export type FinishTaskArgs = z.infer<typeof finishTaskSchema>;
