import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { TShirtsPrintsHeader, TShirtsPrintsFooter } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";

type Props = {
  params: Promise<{ slug: string; blogSlug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, blogSlug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, name: true, slug: true, customDomain: true },
  });

  if (!site) return { title: "Blog Not Found" };

  const blog = await prisma.blog.findFirst({
    where: { siteId: site.id, slug: blogSlug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true, author: true, category: true, publishedAt: true },
  });

  if (!blog) return { title: `Article Not Found | ${site.name}` };

  const description = blog.excerpt || `Read "${blog.title}" on ${site.name}`;
  const storeUrl = site.customDomain ? `https://${site.customDomain}` : `https://afrostore.shop/store/${site.slug}`;
  const blogUrl = `${storeUrl}/blog/${blogSlug}`;

  return {
    title: blog.title,
    description,
    openGraph: {
      type: "article",
      siteName: site.name,
      title: blog.title,
      description,
      url: blogUrl,
      ...(blog.publishedAt ? { publishedTime: blog.publishedAt.toISOString() } : {}),
      ...(blog.author ? { authors: [blog.author] } : {}),
      ...(blog.coverImage ? { images: [{ url: blog.coverImage, width: 1200, height: 630, alt: blog.title }] } : {}),
    },
    twitter: {
      card: blog.coverImage ? "summary_large_image" : "summary",
      title: blog.title,
      description,
      ...(blog.coverImage ? { images: [blog.coverImage] } : {}),
    },
    alternates: { canonical: blogUrl },
  };
}

export default async function BlogPostLayout({ children, params }: Props) {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    include: {
      templates: {
        where: { isActive: true },
        include: { template: true },
      },
    },
  });

  if (!site) return <>{children}</>;

  const activeTemplateSlug = site.templates?.[0]?.template?.slug || null;

  const isHandmadeBagsTemplate =
    activeTemplateSlug === "handmade-bags" ||
    slug === "handmade-bags" ||
    site.slug === "handmade-bags" ||
    site.name?.toLowerCase().includes("handmade") ||
    site.name?.toLowerCase().includes("leather");

  const isTShirtsPrintsTemplate =
    activeTemplateSlug === "t-shirts-prints" ||
    slug === "t-shirts-prints" ||
    site.slug === "t-shirts-prints" ||
    site.name?.toLowerCase().includes("t-shirts");

  const customization = (site as any).customizations || null;
  const socialLinks = [
    ...(customization?.socialLinks?.facebook ? [{ platform: "facebook", url: customization.socialLinks.facebook }] : []),
    ...(customization?.socialLinks?.twitter ? [{ platform: "twitter", url: customization.socialLinks.twitter }] : []),
    ...(customization?.socialLinks?.instagram ? [{ platform: "instagram", url: customization.socialLinks.instagram }] : []),
    ...(customization?.socialLinks?.youtube ? [{ platform: "youtube", url: customization.socialLinks.youtube }] : []),
  ];

  const themeData: ThemeData = {
    id: isHandmadeBagsTemplate ? "handmade-bags-blog-post" : "tshirts-blog-post",
    name: isHandmadeBagsTemplate ? "Handmade Bags Blog Post" : "T-Shirts Blog Post",
    slug: isHandmadeBagsTemplate ? "handmade-bags-blog-post" : "tshirts-blog-post",
    config: {
      colors: {
        primary: customization?.themeSettings?.colors?.primary || (isHandmadeBagsTemplate ? "#c27843" : "#111"),
        secondary: customization?.themeSettings?.colors?.secondary || "#333",
        accent: customization?.themeSettings?.colors?.accent || "#666",
        background: customization?.themeSettings?.colors?.background || "#ffffff",
        text: customization?.themeSettings?.colors?.text || "#242424",
      },
    },
  };

  if (isHandmadeBagsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
          <HandmadeBagsHeader storeName={site.name} storeSlug={slug} logo={site.logo} />
          {children}
          <HandmadeBagsFooter
            storeName={site.name}
            storeSlug={slug}
            logo={site.logo}
            socialLinks={socialLinks}
            description={customization?.about?.description || "Handcrafted leather goods made with passion and precision."}
          />
        </div>
      </ThemeProvider>
    );
  }

  if (isTShirtsPrintsTemplate) {
    return (
      <ThemeProvider theme={themeData}>
        <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
          <TShirtsPrintsHeader storeName={site.name} storeSlug={slug} logo={site.logo} />
          {children}
          <TShirtsPrintsFooter
            storeName={site.name}
            storeSlug={slug}
            logo={site.logo}
            socialLinks={socialLinks}
          />
        </div>
      </ThemeProvider>
    );
  }

  return <>{children}</>;
}
