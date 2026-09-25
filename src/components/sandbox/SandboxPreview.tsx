"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { TemplateStoreContextProvider } from "@/components/storefront/TemplateStoreContextProvider";

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
 * - If Daytona isn't configured, sandbox creation fails, or neither
 *   `session` nor `files` is provided (i.e. this generation produced
 *   structured block JSON, not code), falls back to rendering `blocks`
 *   with the existing block renderer — same visual slot, no dead end
 *   either way.
 *
 * Two ways to get a live sandbox shown, and only one should be used per
 * call site:
 *   - `session`: the caller already created/owns a sandbox (e.g.
 *     /ai/generate-code returns one) — this component just displays and
 *     polls it, it does NOT call the sandbox API to create another one.
 *   - `files`: the caller wants THIS component to create the sandbox
 *     itself from a files map.
 * Passing neither goes straight to the block preview.
 */
export function SandboxPreview({
  siteId,
  files,
  blocks,
  session: initialSession,
}: {
  siteId: string;
  files?: Record<string, string>;
  blocks: BuilderBlock[];
  session?: SandboxSession | null;
}) {
  const [session, setSession] = useState<SandboxSession | null>(initialSession ?? null);
  const [sandboxUnavailable, setSandboxUnavailable] = useState(!files && !initialSession);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Full storefront context (products, categories, blogs, templateSlug,
  // socialLinks) — not just slug/currency. Without this, any block that
  // depends on real store data (product grids, best-sellers, category
  // nav, wishlist/add-to-cart/quick-view buttons) rendered empty or
  // inert in THIS preview while the real live page (which fetches this
  // same endpoint) would show real products and working buttons. That
  // mismatch is exactly "the preview doesn't match what actually goes
  // live" — mirror the live page's own data source and prop shape here
  // instead of a stripped-down partial context.
  const [storeContext, setStoreContext] = useState<{
    storeSlug: string;
    currency: string;
    templateSlug: string | null;
    products: any[];
    categories: any[];
    blogs: any[];
    socialLinks: any[];
  } | null>(null);
  useEffect(() => {
    let cancelled = false;
    api.get<{ slug: string; currency: string }>(`/api/sites/${siteId}`).then(async (res) => {
      if (cancelled || !res.success || !res.data) return;
      const slug = res.data.slug;
      const currency = res.data.currency || "NGN";
      try {
        const sfRes = await fetch(`/api/storefront/${slug}`);
        const sf = sfRes.ok ? await sfRes.json() : null;
        if (cancelled) return;
        setStoreContext({
          storeSlug: slug,
          currency,
          templateSlug: sf?.templateSlug || "ai",
          products: sf?.products || [],
          categories: sf?.categories || [],
          blogs: sf?.blogs || [],
          socialLinks: sf?.socialLinks || [],
        });
      } catch {
        // Storefront data is a nice-to-have for parity, not required to
        // show a preview at all — fall back to the minimal context
        // rather than leaving the preview stuck loading.
        if (!cancelled) setStoreContext({ storeSlug: slug, currency, templateSlug: "ai", products: [], categories: [], blogs: [], socialLinks: [] });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [siteId]);

  // A session passed in from the parent (already created) always wins —
  // sync it in rather than re-deriving from `files`, and skip straight
  // past the creation effect below.
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setSandboxUnavailable(false);
    }
  }, [initialSession]);

  useEffect(() => {
    if (initialSession) return; // caller owns this session — nothing to create
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
  }, [siteId, files, initialSession]);

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

  // Tear down the sandbox when the preview unmounts — but only if THIS
  // component created it (via `files`). A session passed in from the
  // parent is owned by the caller, which may deliberately reuse it
  // across multiple follow-up edit requests (that's the whole point of
  // /ai/generate-code reusing a site's existing sandbox) — destroying it
  // just because this preview briefly unmounted would force a full
  // rebuild on every single chat message.
  useEffect(() => {
    if (initialSession) return;
    return () => {
      if (session?.id && session.status === "ready") {
        api.delete(`/api/sites/${siteId}/sandbox?sessionId=${session.id}`).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, initialSession]);

  if (sandboxUnavailable || (!files && !initialSession)) {
    if (!storeContext) return <RenderBlocks blocks={blocks} />;
    return (
      <TemplateStoreContextProvider
        templateSlug={storeContext.templateSlug}
        products={storeContext.products}
        blogs={storeContext.blogs}
        categories={storeContext.categories}
        currency={storeContext.currency}
        storeSlug={storeContext.storeSlug}
        socialLinks={storeContext.socialLinks}
      >
        <RenderBlocks blocks={blocks} storeSlug={storeContext.storeSlug} currency={storeContext.currency} />
      </TemplateStoreContextProvider>
    );
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
