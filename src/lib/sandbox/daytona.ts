import { Daytona } from "@daytonaio/sdk";

/**
 * Wraps the Daytona SDK for our self-hosted instance.
 *
 * Config comes from env vars pointing at whatever server you run Daytona's
 * control plane on - this library only talks to it, it doesn't provision it:
 *   DAYTONA_API_URL - your self-hosted Daytona server's API endpoint
 *   DAYTONA_API_KEY - API key generated from that instance
 *
 * If those aren't set, isSandboxConfigured() returns false and callers
 * should fall back to the block-renderer preview instead of attempting a
 * sandbox session - same pattern as isSmsConfigured()/isWhatsAppConfigured().
 */

export function isSandboxConfigured(): boolean {
  return !!(process.env.DAYTONA_API_URL && process.env.DAYTONA_API_KEY);
}

function getClient() {
  return new Daytona({
    apiUrl: process.env.DAYTONA_API_URL,
    apiKey: process.env.DAYTONA_API_KEY,
  });
}

export interface CreatedSandbox {
  externalId: string;
  previewUrl: string;
}

/**
 * Creates a sandbox, writes the generated site's files into it, and starts
 * a dev server. Returns the sandbox's own ID plus the URL that serves its
 * live preview - that URL is what the live-preview iframe points at.
 *
 * `files` is a flat map of relative path -> file content, e.g.
 *   { "app/page.tsx": "...", "package.json": "..." }
 * This mirrors how the AI-generated-code path would hand off a project;
 * the block-based fallback never calls this at all.
 */
export async function createSandboxWithFiles(files: Record<string, string>): Promise<CreatedSandbox> {
  const daytona = getClient();
  const sandbox = await daytona.create({
    image: "node:22",
    envVars: { NODE_ENV: "development" },
    autoStopInterval: 30, // minutes of inactivity before Daytona auto-stops it, keeps idle sessions from running (and costing compute) forever
  });

  for (const [path, content] of Object.entries(files)) {
    const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    if (dir) await sandbox.fs.createFolder(dir, "755");
    await sandbox.fs.uploadFile(Buffer.from(content, "utf-8"), path);
  }

  await sandbox.process.executeCommand("npm install");
  // Fire-and-forget: the dev server needs to keep running after this call
  // returns, so it's started detached rather than awaited.
  await sandbox.process.executeCommand("nohup npm run dev -- --port 3000 > /tmp/dev.log 2>&1 &");

  const previewUrl = await sandbox.getPreviewLink(3000);

  return { externalId: sandbox.id, previewUrl: previewUrl.url };
}

export async function getSandboxStatus(externalId: string): Promise<"ready" | "starting" | "error" | "stopped"> {
  const daytona = getClient();
  try {
    const sandbox = await daytona.get(externalId);
    const state = sandbox.state; // Daytona's own lifecycle state string
    if (state === "started") return "ready";
    if (state === "stopped" || state === "destroyed" || state === "destroying" || state === "archived") return "stopped";
    if (state === "error" || state === "build_failed") return "error";
    // creating, starting, restoring, pending_build, building_snapshot,
    // pulling_snapshot, resizing, snapshotting, forking, and other
    // transient states all just mean "not ready yet, keep polling".
    return "starting";
  } catch {
    return "error";
  }
}

export async function stopSandbox(externalId: string): Promise<void> {
  const daytona = getClient();
  const sandbox = await daytona.get(externalId);
  await daytona.delete(sandbox);
}
