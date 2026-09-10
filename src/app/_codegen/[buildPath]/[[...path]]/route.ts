import { NextRequest, NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/s3-storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ buildPath: string; path?: string[] }> };

// GET /_codegen/[buildPath]/[...path] — internal serving route middleware
// rewrites published-site requests to (see middleware.ts). buildPath is
// the site's S3 storage prefix (sites/{id}/published), already
// resolved by middleware via /api/internal/site-mode so this route never
// needs its own DB lookup.
//
// SPA-aware: an exact file under dist/ (an asset, favicon, etc.) is
// served as-is; anything else falls back to index.html so client-side
// React Router can handle the route.
export async function GET(req: NextRequest, { params }: Params) {
  const { buildPath, path } = await params;
  const decodedBuildPath = decodeURIComponent(buildPath);
  const relative = (path || []).join("/");

  const tryFetch = async (rel: string) => {
    const res = await fetch(getPublicUrl(`${decodedBuildPath}/${rel}`), { cache: "no-store" });
    return res.ok ? res : null;
  };

  // Only treat it as a real asset request if it looks like one (has a file
  // extension) — everything else, including a bare path with no extension
  // like "/about", is an SPA route and should fall through to index.html.
  const looksLikeAsset = /\.[a-zA-Z0-9]+$/.test(relative);
  const assetRes = relative && looksLikeAsset ? await tryFetch(relative) : null;

  const finalRes = assetRes || (await tryFetch("index.html"));
  if (!finalRes) return new NextResponse("Not found", { status: 404 });

  const body = await finalRes.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": finalRes.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": assetRes ? "public, max-age=31536000, immutable" : "no-cache",
    },
  });
}
