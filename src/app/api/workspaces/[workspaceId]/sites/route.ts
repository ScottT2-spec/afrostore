import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, generateSubdomain } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";

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
    // Step 4: Business info
    name,
    description,
    logo,
    socialLinks,
    phone,
    email: businessEmail,
    location,
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

  // Create default pages based on site type
  const defaultPages = getDefaultPages(siteType, name.trim());
  if (defaultPages.length > 0) {
    await prisma.page.createMany({
      data: defaultPages.map((p, i) => ({
        siteId: site.id,
        title: p.title,
        slug: p.slug,
        type: p.type,
        content: p.content,
        isPublished: true,
        position: i,
      })),
    });
  }

  return success(site, 201);
}

function getDefaultPages(siteType: string, siteName: string) {
  const common = [
    {
      title: "Home",
      slug: "home",
      type: "HOME" as const,
      content: {
        blocks: [
          {
            id: "hero-1",
            type: "hero",
            props: {
              title: `Welcome to ${siteName}`,
              subtitle: siteType === "ECOMMERCE"
                ? "Discover amazing products at great prices"
                : siteType === "WEBSITE"
                ? "We help businesses grow and succeed"
                : "Take your business to the next level",
              ctaText: siteType === "ECOMMERCE" ? "Shop Now" : "Get Started",
              ctaLink: siteType === "ECOMMERCE" ? "/shop" : "#contact",
            },
          },
        ],
      },
    },
  ];

  if (siteType === "ECOMMERCE") {
    return [
      ...common,
      { title: "About Us", slug: "about", type: "ABOUT" as const, content: { blocks: [] } },
      { title: "Contact", slug: "contact", type: "CONTACT" as const, content: { blocks: [] } },
      { title: "FAQ", slug: "faq", type: "FAQ" as const, content: { blocks: [] } },
      { title: "Privacy Policy", slug: "privacy-policy", type: "POLICY" as const, content: { blocks: [] } },
      { title: "Return Policy", slug: "return-policy", type: "POLICY" as const, content: { blocks: [] } },
    ];
  }

  if (siteType === "WEBSITE") {
    return [
      ...common,
      { title: "About Us", slug: "about", type: "ABOUT" as const, content: { blocks: [] } },
      { title: "Services", slug: "services", type: "SERVICES" as const, content: { blocks: [] } },
      { title: "Team", slug: "team", type: "TEAM" as const, content: { blocks: [] } },
      { title: "Contact", slug: "contact", type: "CONTACT" as const, content: { blocks: [] } },
      { title: "FAQ", slug: "faq", type: "FAQ" as const, content: { blocks: [] } },
    ];
  }

  // LANDING_PAGE
  return [
    {
      title: "Landing Page",
      slug: "landing",
      type: "LANDING" as const,
      content: {
        blocks: [
          {
            id: "hero-1",
            type: "hero",
            props: {
              title: siteName,
              subtitle: "Convert visitors into customers",
              ctaText: "Get Started",
              ctaLink: "#form",
            },
          },
          {
            id: "form-1",
            type: "lead-form",
            props: { title: "Get in Touch", fields: ["name", "email", "phone"] },
          },
        ],
      },
    },
    { title: "Thank You", slug: "thank-you", type: "THANK_YOU" as const, content: { blocks: [] } },
  ];
}
