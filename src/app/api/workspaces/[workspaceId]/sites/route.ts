import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, generateSubdomain } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { importTemplateToSite } from "@/lib/templates/importer";

// GET /api/workspaces/[workspaceId]/sites — list sites in workspace
export async function GET(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return error("Workspace not found", 404);

  const isOwner = workspace.ownerId === user.id;
  const isMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });
  if (!isOwner && !isMember) return error("Not authorized", 403);

  const sites = await prisma.site.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { products: true, orders: true, pages: true, blogs: true, funnels: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return success(sites);
}

// POST /api/workspaces/[workspaceId]/sites — create a new site (7-step wizard)
export async function POST(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    const { workspaceId } = await params;

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return error("Workspace not found", 404);

    const isOwner = workspace.ownerId === user.id;
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    const canCreate = isOwner || (member && ["OWNER", "ADMIN", "MANAGER"].includes(member.role));
    if (!canCreate) return error("Not authorized to create sites", 403);

    const body = await req.json();
    const {
    // Step 1: Site type
    siteType = "ECOMMERCE",
    // Step 2: Industry
    industry,
    // Step 3: Launch method (handled client-side)
    launchMethod,
    templateId,
    templateSlug,
    variant,
    products,
    services,
    targetAudience,
    branding,
    // Step 4: Business info
    name,
    description,
    logo,
    socialLinks,
    phone,
    businessType = "general",
    // Step 5: Auto-generate (handled after creation)
    // Step 6: Payment (handled after creation)
    // Step 7: Domain
    customDomain,
  } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return error("Site name is required (min 2 characters)", 422);
    }

    if (!["ECOMMERCE", "WEBSITE", "LANDING_PAGE"].includes(siteType)) {
      return error("Invalid site type. Must be ECOMMERCE, WEBSITE, or LANDING_PAGE", 422);
    }

  // Generate unique slug & subdomain
    let slug = slugify(name.trim());
    let counter = 0;
    while (true) {
      const candidate = counter === 0 ? slug : `${slug}-${counter}`;
      const existing = await prisma.site.findUnique({ where: { slug: candidate } });
      if (!existing) { slug = candidate; break; }
      counter++;
    }

    let subdomain = generateSubdomain(name.trim());
    counter = 0;
    while (true) {
      const candidate = counter === 0 ? subdomain : `${subdomain}-${counter}`;
      const existing = await prisma.site.findUnique({ where: { subdomain: candidate } });
      if (!existing) { subdomain = candidate; break; }
      counter++;
    }

  // Create site with settings and social links
    const site = await prisma.site.create({
      data: {
      workspaceId,
      name: name.trim(),
      slug,
      subdomain,
      description: description || null,
      logo: logo || null,
      siteType,
      businessType,
      industry: industry || null,
      customDomain: customDomain || null,
      settings: {
        create: {
          whatsappNumber: phone || null,
          metaTitle: name.trim(),
          metaDescription: description || null,
        },
      },
      socialLinks: socialLinks ? {
        create: {
          whatsapp: socialLinks.whatsapp || null,
          instagram: socialLinks.instagram || null,
          facebook: socialLinks.facebook || null,
          twitter: socialLinks.twitter || null,
          tiktok: socialLinks.tiktok || null,
          linkedin: socialLinks.linkedin || null,
          youtube: socialLinks.youtube || null,
        },
      } : undefined,
    },
      include: {
        settings: true,
        socialLinks: true,
      },
    });

    // Theme packages always provide their own pages and site data.
    // No default page synthesis is allowed in the import flow.

    let templateResult: unknown = null;

    // ── AI Build (Build with AI) ─────────────────────────────
    if (launchMethod === "quick") {
      try {
        // Generate Jumia-style marketplace blocks for the homepage
        const storeName = name.trim();
        const storeSlug = site.slug;

        const jumiaBlocks = [
          { id: "jb-topbar", type: "jumiaTopBar", props: { storeSlug, message: `Free delivery on orders from ${storeName}` } },
          { id: "jb-header", type: "jumiaHeader", props: { storeName, storeSlug, logo: logo || null } },
          { id: "jb-hero", type: "jumiaHeroBanner", props: { storeSlug, slides: [
            { image: "", title: `Welcome to ${storeName}`, subtitle: "Discover amazing deals today", bgColor: "#F68B1E" },
            { image: "", title: "New Arrivals Just Dropped", subtitle: "Shop the latest products", bgColor: "#CC0000" },
            { image: "", title: "Free Delivery Available", subtitle: "On qualifying orders", bgColor: "#282828" },
          ] } },
          { id: "jb-iconbar", type: "jumiaCategoryIconBar", props: { storeSlug } },
          { id: "jb-flash", type: "jumiaFlashDeals", props: { title: "Flash Sales", storeSlug } },
          { id: "jb-categories", type: "jumiaCategoryGrid", props: { title: "Top Categories", storeSlug } },
          { id: "jb-products1", type: "jumiaProductGrid", props: { title: "Popular Products", storeSlug } },
          { id: "jb-promo", type: "jumiaPromoBanners", props: { storeSlug } },
          { id: "jb-deals", type: "jumiaCategoryDealRow", props: { title: "Top Deals", subtitle: "Limited time offers", storeSlug } },
          { id: "jb-products2", type: "jumiaProductGrid", props: { title: "Recommended For You", storeSlug } },
          { id: "jb-topdeals", type: "jumiaTopDeals", props: { title: "Best Sellers", subtitle: "Most popular items", storeSlug } },
          { id: "jb-features", type: "jumiaFeaturesBar", props: {} },
          { id: "jb-newsletter", type: "jumiaNewsletter", props: { storeName } },
          { id: "jb-footer", type: "jumiaFooter", props: { storeName, storeSlug } },
        ];

        // Create homepage with Jumia blocks
        await prisma.page.create({
          data: {
            siteId: site.id,
            title: "Home",
            slug: "home",
            isPublished: true,
            template: "jumia",
            content: { blocks: jumiaBlocks, settings: {} },
            metaTitle: `${storeName} — Shop Online`,
            metaDescription: description || `Shop the best products at ${storeName}. Great deals, fast delivery.`,
          },
        });

        templateResult = { method: "ai", template: "jumia-marketplace", blocksCreated: jumiaBlocks.length };
      } catch (aiErr) {
        console.error("AI build error:", aiErr);
        // Non-fatal — site is still created
      }
    }

    // ── Template Import ──────────────────────────────────────
    const shouldUseTemplate = launchMethod === "template" || !!templateId || !!templateSlug;

    if (launchMethod === "template" && !templateId && !templateSlug) {
      return error("Template selection is required for template-based site creation", 422);
    }

    if (shouldUseTemplate) {
      try {
        templateResult = await importTemplateToSite(site.id, {
          templateId: templateId || null,
          templateSlug: templateSlug || null,
          variant: variant || null,
        });
      } catch (importErr) {
        console.error("Template import error:", importErr);
        // Non-fatal — site is still created, just without template content
      }
    }

    return success({ ...site, templateResult }, 201);
  } catch (err) {
    console.error("Create site error:", err);
    return error(err instanceof Error ? err.message : "Internal server error", 500);
  }
}
