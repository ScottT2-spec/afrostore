import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { resolveStoreBaseUrlFromHeaders } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string; pageSlug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, pageSlug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, name: true, slug: true, customDomain: true, logo: true, description: true },
  });

  if (!site) return { title: "Store Not Found" };

  const page = await prisma.page.findFirst({
    where: { siteId: site.id, slug: pageSlug, isPublished: true },
    select: { title: true, metaTitle: true, metaDescription: true },
  });

  if (!page) return { title: `Page Not Found | ${site.name}` };

  const title = page.metaTitle || `${page.title} | ${site.name}`;
  const description = page.metaDescription || site.description || `${page.title} — ${site.name}`;
  const storeUrl = await resolveStoreBaseUrlFromHeaders(site);
  const pageUrl = `${storeUrl}/${pageSlug}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: pageUrl,
      ...(site.logo ? { images: [{ url: site.logo, width: 512, height: 512, alt: site.name }] } : {}),
    },
    twitter: {
      card: site.logo ? "summary_large_image" : "summary",
      title,
      description,
      ...(site.logo ? { images: [site.logo] } : {}),
    },
    alternates: { canonical: pageUrl },
  };
}

export default function StorePageLayout({ children }: Props) {
  return <>{children}</>;
}
