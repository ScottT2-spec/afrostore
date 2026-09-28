"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { parsePageContent } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { TemplateStoreContextProvider } from "@/components/storefront/TemplateStoreContextProvider";
import { AiStoreHeader, AiStoreFooter } from "@/components/storefront/AiStoreChrome";

/** Storefront API returns socialLinks as {instagram, facebook, ...}; the
 *  shared footer wants [{platform, url}]. Accept either shape. */
function toSocialArray(raw: unknown): Array<{ platform: string; url: string }> {
  if (Array.isArray(raw)) return raw.filter((l) => l && l.platform && l.url);
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw as Record<string, unknown>)
    .filter(([, url]) => typeof url === "string" && url)
    .map(([platform, url]) => ({ platform, url: url as string }));
}

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
  pages,
  session: initialSession,
}: {
  siteId: string;
  files?: Record<string, string>;
  blocks: BuilderBlock[];
  /** The site's pages, so a clicked link can be opened inside the preview. */
  pages?: Array<{ id: string; slug: string; type: string; title?: string }>;
  session?: SandboxSession | null;
}) {
  // In-preview navigation. null = the home blocks passed in via `blocks`.
  // "page" = another block page fetched here; "frame" = a route that isn't
  // block-based (shop, cart, product…) shown in a contained iframe.
  const [view, setView] = useState<
    | null
    | { kind: "page"; slug: string; blocks: BuilderBlock[] | null }
    | { kind: "frame"; path: string }
  >(null);
  // A fresh generation/edit replaces `blocks` — snap back to it.
  useEffect(() => { setView(null); }, [blocks]);

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
    // Shared AI header/footer inputs — same values the live pages pass.
    siteRecordId: string;
    storeName: string;
    logo: string | null;
    description: string | null;
    chromeSocialLinks: Array<{ platform: string; url: string }>;
  } | null>(null);
  useEffect(() => {
    let cancelled = false;
    api.get<{ id: string; name: string; slug: string; currency: string; logo?: string | null; description?: string | null }>(`/api/sites/${siteId}`).then(async (res) => {
      if (cancelled || !res.success || !res.data) return;
      const slug = res.data.slug;
      const currency = res.data.currency || "NGN";
      const chrome = {
        siteRecordId: res.data.id || siteId,
        storeName: res.data.name || "Store",
        logo: res.data.logo ?? null,
        description: res.data.description ?? null,
      };
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
          ...chrome,
          chromeSocialLinks: toSocialArray(sf?.socialLinks),
        });
      } catch {
        // Storefront data is a nice-to-have for parity, not required to
        // show a preview at all — fall back to the minimal context
        // rather than leaving the preview stuck loading.
        if (!cancelled) setStoreContext({ storeSlug: slug, currency, templateSlug: "ai", products: [], categories: [], blogs: [], socialLinks: [], ...chrome, chromeSocialLinks: [] });
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

  const openInPreview = useCallback((e: ReactMouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const raw = a.getAttribute("href");
    if (!raw) { e.preventDefault(); return; }
    if (raw.startsWith("mailto:") || raw.startsWith("tel:")) return;

    // Same-page anchors: scroll inside the preview, never touch the URL.
    if (raw.startsWith("#")) {
      e.preventDefault();
      if (raw.length > 1) document.getElementById(raw.slice(1))?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    let url: URL;
    try { url = new URL(raw, window.location.origin); } catch { e.preventDefault(); return; }

    // Other websites (social icons etc.) open in a new tab — the preview
    // itself never navigates away.
    if (url.origin !== window.location.origin) {
      e.preventDefault();
      window.open(url.href, "_blank", "noopener,noreferrer");
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const slug = storeContext?.storeSlug;
    const m = slug ? url.pathname.match(new RegExp(`^/store/${slug}(?:/(.*))?$`)) : null;
    if (!m) return; // not this store — stay put
    const rest = (m[1] || "").replace(/\/+$/, "");
    if (!rest) { setView(null); return; }

    const first = rest.split("/")[0];
    const target = rest.includes("/") ? undefined : pages?.find((p) => p.slug === first);
    if (target) {
      if (target.type === "HOME") { setView(null); return; }
      setView({ kind: "page", slug: target.slug, blocks: null });
      api.get<{ content: unknown }>(`/api/sites/${siteId}/pages/${target.id}`).then((res) => {
        if (!res.success || !res.data) return;
        const pageBlocks = parsePageContent(res.data.content).blocks as unknown as BuilderBlock[];
        setView((cur) => (cur && cur.kind === "page" && cur.slug === target.slug ? { ...cur, blocks: pageBlocks } : cur));
      });
      return;
    }
    // Shop, cart, product… are real routes, not block pages — show them
    // in a contained frame so links inside stay in the preview too.
    setView({ kind: "frame", path: url.pathname + url.search });
  }, [pages, siteId, storeContext?.storeSlug]);

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
        {/* Same shared header/footer the live AI pages wrap around their
            blocks, so the preview matches what actually goes live. Every
            link click is handled by openInPreview so nothing navigates
            away from the builder. */}
        <div onClickCapture={openInPreview}>
          {view?.kind === "frame" ? (
            <div className="flex flex-col h-full min-h-[600px]">
              <div className="flex items-center gap-3 border-b border-surface-200 bg-white px-3 py-2 text-xs text-surface-500">
                <button type="button" onClick={() => setView(null)} className="font-semibold text-brand-600 hover:underline">← Back to preview</button>
                <span className="truncate">{view.path}</span>
              </div>
              <iframe src={view.path} title="Preview page" className="w-full flex-1 min-h-[600px] border-0" />
            </div>
          ) : (
            <>
              <AiStoreHeader storeName={storeContext.storeName} storeSlug={storeContext.storeSlug} logo={storeContext.logo} siteId={storeContext.siteRecordId} />
              {view?.kind === "page" && !view.blocks ? (
                <div className="flex items-center justify-center min-h-[300px] text-surface-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <RenderBlocks blocks={view?.kind === "page" && view.blocks ? view.blocks : blocks} storeSlug={storeContext.storeSlug} currency={storeContext.currency} />
              )}
              <AiStoreFooter storeName={storeContext.storeName} storeSlug={storeContext.storeSlug} logo={storeContext.logo} description={storeContext.description} socialLinks={storeContext.chromeSocialLinks} />
            </>
          )}
        </div>
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
