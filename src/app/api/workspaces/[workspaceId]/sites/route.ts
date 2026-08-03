import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, generateSubdomain } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { importTemplateToSite } from "@/lib/templates/importer";
import { buildSmartAiBlocks, buildBlockContentPrompt } from "@/lib/ai-block-content-generator";
import { getIndustrySampleData, DEFAULT_SAMPLE_DATA } from "@/lib/ai-sample-data";
import { AIFailover, AICapability } from "@/lib/failover";
import { buildTemplatePageContent } from "@/lib/templates/template-tree";
import type { Prisma } from "@/generated/prisma";

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
        const storeName = name.trim();
        const storeSlug = site.slug;
        const bizType = body.businessType || body.industry || "general";

        // ── Step 1: Try AI content generation (non-blocking fallback) ──
        let aiContent: Record<string, unknown> | undefined;
        try {
          const providers: import("@/lib/failover").AIProviderConfig[] = [];
          if (process.env.GROQ_API_KEY) providers.push({ provider: "groq", apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", capabilities: [AICapability.CHAT] });
          if (process.env.GOOGLE_AI_KEY) providers.push({ provider: "google", apiKey: process.env.GOOGLE_AI_KEY, model: "gemini-2.0-flash", capabilities: [AICapability.CHAT] });
          if (process.env.OPENAI_API_KEY) providers.push({ provider: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", capabilities: [AICapability.CHAT] });
          if (process.env.ANTHROPIC_API_KEY) providers.push({ provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-haiku-20240307", capabilities: [AICapability.CHAT] });

          if (providers.length > 0) {
            const ai = new AIFailover({ providers, priorityOrder: providers.map(p => p.provider), requestTimeoutMs: 25_000 });
            const prompt = buildBlockContentPrompt(storeName, bizType, description || undefined);
            const result = await ai.chat({
              capability: AICapability.CHAT,
              messages: [
                { role: "system" as const, content: "Return ONLY valid JSON. No markdown, no explanation." },
                { role: "user" as const, content: prompt },
              ],
              maxTokens: 4000,
              temperature: 0.7,
            });
            if (result.success && result.data?.content) {
              let cleaned = result.data.content.trim();
              if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
              aiContent = JSON.parse(cleaned);
            }
          }
        } catch (aiErr) {
          console.warn("AI content generation failed, using industry defaults:", aiErr);
          // Non-fatal — we'll use industry-matched defaults
        }

        // ── Step 2: Build smart blocks with AI content + industry images ──
        const aiBlocks = buildSmartAiBlocks({
          storeName,
          storeSlug,
          businessType: bizType,
          description: description || undefined,
          aiContent,
        });

        // Create homepage with AI template blocks
        await prisma.page.create({
          data: {
            siteId: site.id,
            title: "Home",
            slug: "home",
            type: "HOME",
            isPublished: true,
            template: "ai",
            content: buildTemplatePageContent(aiBlocks as unknown as Record<string, unknown>[], {}) as unknown as Prisma.InputJsonValue,
            metaTitle: `${storeName} — ${bizType.charAt(0).toUpperCase() + bizType.slice(1)}`,
            metaDescription: description || `${storeName} — your trusted ${bizType} destination.`,
          },
        });

        // ── Seed industry-specific categories & products ──────
        const sampleData = getIndustrySampleData(bizType) || DEFAULT_SAMPLE_DATA;
        const siteCurrency = site.currency || sampleData.currency || "NGN";

        const createdCategories = await Promise.all(
          sampleData.categories.map((cat, i) =>
            prisma.category.create({
              data: { siteId: site.id, name: cat.name, slug: cat.slug, image: cat.image, description: cat.description, position: i },
            })
          )
        );

        for (const prod of sampleData.products) {
          const product = await prisma.product.create({
            data: {
              siteId: site.id,
              categoryId: createdCategories[prod.catIdx]?.id || createdCategories[0]?.id || null,
              name: prod.name,
              slug: prod.slug,
              description: prod.description,
              price: prod.price,
              compareAtPrice: prod.compareAtPrice || null,
              currency: siteCurrency,
              stock: prod.stock,
              isFeatured: prod.isFeatured,
              status: "ACTIVE",
              tags: [],
            },
          });
          for (let j = 0; j < prod.images.length; j++) {
            await prisma.productImage.create({
              data: { productId: product.id, url: prod.images[j], alt: prod.name, position: j },
            });
          }
        }

        // ── Generate About, FAQ, Contact, Policies pages ─────
        const pageSeeds = [
          {
            title: "About Us", slug: "about", type: "ABOUT" as const, position: 1,
            metaTitle: `About — ${storeName}`,
            metaDescription: `Learn about ${storeName} and our mission.`,
          },
          {
            title: "FAQ", slug: "faq", type: "FAQ" as const, position: 2,
            metaTitle: `FAQ — ${storeName}`,
            metaDescription: `Frequently asked questions about ${storeName}.`,
          },
          {
            title: "Contact Us", slug: "contact", type: "CONTACT" as const, position: 3,
            metaTitle: `Contact — ${storeName}`,
            metaDescription: `Get in touch with ${storeName}.`,
          },
          {
            title: "Policies", slug: "policies", type: "POLICY" as const, position: 4,
            metaTitle: `Policies — ${storeName}`,
            metaDescription: `Shipping, returns, and privacy policies for ${storeName}.`,
          },
        ];

        for (const pg of pageSeeds) {
          await prisma.page.create({
            data: {
              siteId: site.id,
              title: pg.title,
              slug: pg.slug,
              type: pg.type,
              isPublished: true,
              position: pg.position,
              content: buildTemplatePageContent([], {}) as unknown as Prisma.InputJsonValue,
              metaTitle: pg.metaTitle,
              metaDescription: pg.metaDescription,
            },
          });
        }

        // ── Fire AI page generation in background (non-blocking) ──
        // This will populate About/FAQ/Contact/Policies with real AI content
        try {
          const { generateStore } = await import("@/lib/ai-store-generator");
          generateStore({
            siteId: site.id,
            storeSlug: storeSlug,
            storeName,
            businessType: bizType,
            description: description || undefined,
            country: site.country || "NG",
            currency: siteCurrency,
          }).catch((err: unknown) => console.warn("Background AI page generation failed:", err));
        } catch {
          // Non-fatal — pages exist with empty content, user can edit
        }

        templateResult = { method: "ai", template: "ai-modern", blocksCreated: aiBlocks.length, categories: createdCategories.length, products: sampleData.products.length };
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
