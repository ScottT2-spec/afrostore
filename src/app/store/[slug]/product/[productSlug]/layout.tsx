import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { resolveStoreBaseUrlFromHeaders } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string; productSlug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, name: true, slug: true, customDomain: true, currency: true },
  });

  if (!site) return { title: "Product Not Found" };

  const product = await prisma.product.findFirst({
    where: { siteId: site.id, slug: productSlug, status: "ACTIVE" },
    select: { name: true, description: true, price: true, currency: true, metaTitle: true, metaDescription: true, images: { select: { url: true, alt: true }, take: 1, orderBy: { position: "asc" } } },
  });

  if (!product) return { title: `Product Not Found | ${site.name}` };

  const currency = product.currency || site.currency || "USD";
  const price = Number(product.price);
  const title = product.metaTitle || product.name;
  const description = product.metaDescription
    ? product.metaDescription.slice(0, 160)
    : product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} for ${currency} ${price.toFixed(2)} at ${site.name}`;
  const storeUrl = await resolveStoreBaseUrlFromHeaders(site);
  const productUrl = `${storeUrl}/product/${productSlug}`;
  const ogImage = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url: productUrl,
      ...(ogImage ? { images: [{ url: ogImage, width: 800, height: 800, alt: product.images[0]?.alt || title }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${title} | ${site.name}`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: { canonical: productUrl },
  };
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
