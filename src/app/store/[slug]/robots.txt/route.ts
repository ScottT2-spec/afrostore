import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { resolveStoreBaseUrl } from "@/lib/site-url";

type Params = { params: Promise<{ slug: string }> };

// GET /store/:slug/robots.txt — public, no auth.
// Rewritten from the store's real domain/subdomain root ("/robots.txt") by middleware.
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { slug: true, customDomain: true },
  });

  if (!site) {
    return new Response("User-agent: *\nDisallow: /", { headers: { "Content-Type": "text/plain" } });
  }

  const baseUrl = resolveStoreBaseUrl(req, site);

  const body = `User-agent: *
Allow: /
Disallow: /checkout
Disallow: /cart

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
