import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// GET /store/:slug/sitemap.xml — public, no auth.
// Rewritten from the store's real domain/subdomain root ("/sitemap.xml") by middleware.
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, slug: true, customDomain: true, updatedAt: true },
  });

  if (!site) {
    return new Response("Site not found", { status: 404 });
  }

  const baseUrl = site.customDomain ? `https://${site.customDomain}` : `https://afrostore.shop/store/${site.slug}`;

  const [pages, products, blogs] = await Promise.all([
    prisma.page.findMany({
      where: { siteId: site.id, isPublished: true },
      select: { slug: true, type: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { siteId: site.id, status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blog.findMany({
      where: { siteId: site.id, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const urls: Array<{ loc: string; lastmod: string; priority: string }> = [
    { loc: baseUrl, lastmod: site.updatedAt.toISOString(), priority: "1.0" },
  ];

  for (const p of pages) {
    if (p.type === "HOME") continue; // already represented by baseUrl
    urls.push({ loc: `${baseUrl}/${p.slug}`, lastmod: p.updatedAt.toISOString(), priority: "0.7" });
  }
  for (const p of products) {
    urls.push({ loc: `${baseUrl}/product/${p.slug}`, lastmod: p.updatedAt.toISOString(), priority: "0.8" });
  }
  for (const b of blogs) {
    urls.push({ loc: `${baseUrl}/blog/${b.slug}`, lastmod: b.updatedAt.toISOString(), priority: "0.6" });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
