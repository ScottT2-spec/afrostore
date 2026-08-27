import type { Metadata } from "next";
import Script from "next/script";
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
      settings: {
        select: {
          googleAnalyticsId: true,
          facebookPixelId: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await resolveStore(slug);

  if (!store) {
    return {
      title: "Store Not Found | Prokip",
      description: "This store does not exist or is no longer active.",
    };
  }

  const homePage = await prisma.page.findFirst({
    where: { siteId: store.id, type: "HOME" },
    select: { metaTitle: true, metaDescription: true },
  });

  const title = homePage?.metaTitle || store.name;
  const description =
    homePage?.metaDescription ||
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

  // Google Analytics (GA4) / Facebook Pixel — settings were fully wired
  // (dashboard field, validated, saved to SiteSettings) but nothing on the
  // live storefront ever read them back. A merchant could enter and save
  // both IDs successfully with zero indication that no tracking was
  // actually happening.
  const gaId = store?.settings?.googleAnalyticsId?.trim() || "";
  const fbPixelId = store?.settings?.facebookPixelId?.trim() || "";

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');`}
          </Script>
        </>
      )}
      {fbPixelId && (
        <Script id="fb-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');`}
        </Script>
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
