import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import StorefrontPopups from "@/components/storefront/StorefrontPopups";
import ReferralTracker from "@/components/storefront/ReferralTracker";
import AbandonedCartTracker from "@/components/storefront/AbandonedCartTracker";
import { resolveStoreBaseUrlFromHeaders } from "@/lib/site-url";
import { buildCustomizationCss, loadSiteCustomizationSafely } from "@/lib/site-customization";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

/**
 * Resolve a store by slug, subdomain, or custom domain.
 */
async function resolveStore(slug: string) {
  return prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { slug },
        { subdomain: slug },
        { customDomain: slug },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      coverImage: true,
      subdomain: true,
      customDomain: true,
      businessType: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await resolveStore(slug);

  if (!store) {
    return {
      title: "Store Not Found | AfroStore",
      description: "This store does not exist or is no longer active.",
    };
  }

  const title = store.name;
  const description =
    store.description ||
    `Shop at ${store.name} — discover amazing products and deals.`;
  const storeUrl = await resolveStoreBaseUrlFromHeaders(store);

  // Use cover image → logo → fallback for OG image
  const ogImage = store.coverImage || store.logo || undefined;

  // A merchant-set canonical URL override (Editor → SEO tab) previously had
  // no effect at all — buildCustomizationCss/the SEO settings were saved
  // but nothing on the live site ever read them back.
  const customization = await loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId: store.id } }));
  const canonicalOverride = (customization?.seoSettings?.canonicalUrl as string | undefined)?.trim();

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [store.name, store.businessType || "online store", "shop", "buy online"].filter(Boolean),
    metadataBase: new URL(storeUrl),
    openGraph: {
      type: "website",
      siteName: store.name,
      title,
      description,
      url: storeUrl,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: store.name }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalOverride || storeUrl,
    },
  };
}

export default async function StoreLayout({ params, children }: Props) {
  const { slug } = await params;
  const store = await resolveStore(slug);

  // JSON-LD structured data for search engines
  const jsonLd = store
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: store.name,
        description: store.description || `Shop at ${store.name}`,
        url: await resolveStoreBaseUrlFromHeaders(store),
        ...(store.logo ? { logo: store.logo, image: store.coverImage || store.logo } : {}),
      }
    : null;

  // Site-wide Custom CSS / Custom JavaScript (Editor → Code tab) — same gap
  // as the canonical URL above: captured and saved, but buildCustomizationCss
  // had zero call sites anywhere and customJs was never injected at all.
  const customization = store
    ? await loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId: store.id } }))
    : null;
  const customCss = customization ? buildCustomizationCss(customization) : "";
  const customJs = customization?.customJs?.trim() || "";

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {customCss && <style data-site-custom-css dangerouslySetInnerHTML={{ __html: customCss }} />}
      {children}
      {store && <StorefrontPopups slug={slug} />}
      {store && <ReferralTracker siteId={store.id} />}
      {store && <AbandonedCartTracker slug={slug} siteId={store.id} />}
      {/* Custom JS is an intentional power-user escape hatch, gated behind
          STAFF+ role to edit — not sanitized/stripped, since the entire
          point is running merchant-authored script (analytics snippets,
          chat widgets, etc.), same threat model as the Code tab itself. */}
      {customJs && <script data-site-custom-js dangerouslySetInnerHTML={{ __html: customJs }} />}
    </>
  );
}
