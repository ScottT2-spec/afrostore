"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

interface SandboxSession {
  id: string;
  status: "creating" | "ready" | "error" | "stopped";
  previewUrl: string | null;
  errorMessage: string | null;
}

/**
 * Live preview for AI-generated sites.
 *
 * - If a Daytona sandbox session exists/gets created for this site, shows
 *   its real live-running dev server in an iframe (the Lovable-style path,
 *   for actual generated code).
 * - If Daytona isn't configured, sandbox creation fails, or `files` isn't
 *   provided (i.e. this generation produced structured block JSON, not
 *   code), falls back to rendering `blocks` with the existing block
 *   renderer - same visual slot, no dead end either way.
 *
 * `files` is optional on purpose: pass it only when there's an actual
 * generated-code project to run; omit it to go straight to the block
 * preview without ever calling the sandbox API.
 */
export function SandboxPreview({
  siteId,
  files,
  blocks,
}: {
  siteId: string;
  files?: Record<string, string>;
  blocks: TemplateBlock[];
}) {
  const [session, setSession] = useState<SandboxSession | null>(null);
  const [sandboxUnavailable, setSandboxUnavailable] = useState(!files);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!files) {
      setSandboxUnavailable(true);
      return;
    }

    let cancelled = false;

    async function start() {
      const created = await api.post<{ session: SandboxSession }>(`/api/sites/${siteId}/sandbox`, { files });
      if (cancelled) return;
      if (!created.success || !created.data) {
        // Covers: Daytona not configured (501), creation failure, network
        // error - all of these should silently fall back, not show a
        // broken preview.
        setSandboxUnavailable(true);
        return;
      }
      setSession(created.data.session);
    }
    start();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, files]);

  useEffect(() => {
    if (!session || session.status === "ready" || session.status === "error" || session.status === "stopped") {
      if (pollRef.current) clearInterval(pollRef.current);
      if (session?.status === "error") setSandboxUnavailable(true);
      return;
    }
    pollRef.current = setInterval(async () => {
      const res = await api.get<{ session: SandboxSession | null }>(`/api/sites/${siteId}/sandbox`);
      if (res.success && res.data?.session) setSession(res.data.session);
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session, siteId]);

  // Tear down the sandbox when the preview unmounts - idle sandboxes still
  // cost compute even self-hosted, and Daytona's own auto-stop timer is a
  // backstop, not a substitute for cleaning up promptly.
  useEffect(() => {
    return () => {
      if (session?.id && session.status === "ready") {
        api.delete(`/api/sites/${siteId}/sandbox?sessionId=${session.id}`).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  if (sandboxUnavailable || !files) {
    return <RenderTemplateBlocks blocks={blocks} />;
  }

  if (!session || session.status === "creating") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3 text-surface-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Starting live preview…</p>
      </div>
    );
  }

  if (session.status === "ready" && session.previewUrl) {
    return (
      <iframe
        src={session.previewUrl}
        className="w-full h-full min-h-[600px] border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Live sandbox preview"
      />
    );
  }

  // status === "error" already flips sandboxUnavailable above, so this is
  // a brief transitional frame before that fallback renders.
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3 text-surface-500">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">Loading preview…</p>
    </div>
  );
}
