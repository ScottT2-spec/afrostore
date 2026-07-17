import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, generateSubdomain } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { importTemplateToSite } from "@/lib/templates/importer";
import { buildSmartAiBlocks, buildBlockContentPrompt } from "@/lib/ai-block-content-generator";
import { AIFailover, AICapability } from "@/lib/failover";

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
            content: { blocks: aiBlocks as unknown as Record<string, unknown>[], settings: {} },
            metaTitle: `${storeName} — ${bizType.charAt(0).toUpperCase() + bizType.slice(1)}`,
            metaDescription: description || `${storeName} — your trusted ${bizType} destination.`,
          },
        });

        // ── Seed sample categories ────────────────────────────
        const sampleCategories = [
          { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop", description: "Phones, laptops, gadgets & accessories" },
          { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop", description: "Clothing, shoes & accessories" },
          { name: "Home & Kitchen", slug: "home-kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop", description: "Furniture, appliances & décor" },
          { name: "Health & Beauty", slug: "health-beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop", description: "Skincare, makeup & wellness" },
          { name: "Sports & Outdoors", slug: "sports", image: "https://images.unsplash.com/photo-1461896836934-bd45ba9c5f3a?w=400&h=400&fit=crop", description: "Fitness, sports gear & outdoor equipment" },
          { name: "Baby & Kids", slug: "baby-kids", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop", description: "Toys, clothing & essentials" },
        ];

        const createdCategories = await Promise.all(
          sampleCategories.map((cat, i) =>
            prisma.category.create({
              data: { siteId: site.id, name: cat.name, slug: cat.slug, image: cat.image, description: cat.description, position: i },
            })
          )
        );

        // ── Seed sample products ─────────────────────────────
        const sampleProducts = [
          { name: "Wireless Noise Cancelling Headphones", slug: "wireless-headphones", price: 24999, compareAtPrice: 45000, description: "Premium wireless headphones with active noise cancellation, 40-hour battery life, and crystal-clear sound quality.", catIdx: 0, isFeatured: true, stock: 48, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop"] },
          { name: "Smart Watch Pro Series", slug: "smart-watch-pro", price: 35500, compareAtPrice: 55000, description: "Advanced smartwatch with heart rate monitoring, GPS tracking, and 7-day battery life.", catIdx: 0, isFeatured: true, stock: 32, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"] },
          { name: "Bluetooth Portable Speaker", slug: "bluetooth-speaker", price: 12800, compareAtPrice: 22000, description: "Waterproof portable speaker with deep bass and 12-hour playtime.", catIdx: 0, isFeatured: false, stock: 65, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop"] },
          { name: "USB-C Fast Charging Cable 2m", slug: "usb-c-cable", price: 2500, compareAtPrice: 5000, description: "Braided nylon USB-C cable with 100W fast charging support.", catIdx: 0, isFeatured: false, stock: 150, images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop"] },
          { name: "Classic Leather Crossbody Bag", slug: "leather-crossbody", price: 18500, compareAtPrice: 32000, description: "Genuine leather crossbody bag with adjustable strap and multiple compartments.", catIdx: 1, isFeatured: true, stock: 25, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop"] },
          { name: "Men's Casual Slim Fit Shirt", slug: "slim-fit-shirt", price: 8900, compareAtPrice: 15000, description: "Premium cotton slim fit shirt, available in multiple colors.", catIdx: 1, isFeatured: false, stock: 80, images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop"] },
          { name: "Women's Running Sneakers", slug: "running-sneakers", price: 15700, compareAtPrice: 28000, description: "Lightweight running shoes with cushioned sole and breathable mesh upper.", catIdx: 1, isFeatured: true, stock: 40, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"] },
          { name: "Stainless Steel Cookware Set", slug: "cookware-set", price: 28000, compareAtPrice: 48000, description: "6-piece premium stainless steel cookware set with tempered glass lids.", catIdx: 2, isFeatured: true, stock: 18, images: ["https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&h=600&fit=crop"] },
          { name: "LED Desk Lamp with USB Port", slug: "led-desk-lamp", price: 7500, compareAtPrice: 14000, description: "Adjustable LED desk lamp with 3 color modes and built-in USB charging port.", catIdx: 2, isFeatured: false, stock: 55, images: ["https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop"] },
          { name: "Organic Vitamin C Serum", slug: "vitamin-c-serum", price: 6800, compareAtPrice: 12000, description: "30ml organic vitamin C face serum with hyaluronic acid for glowing skin.", catIdx: 3, isFeatured: true, stock: 70, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop"] },
          { name: "Resistance Bands Set", slug: "resistance-bands", price: 4500, compareAtPrice: 8500, description: "Set of 5 resistance bands with different strength levels for home workouts.", catIdx: 4, isFeatured: false, stock: 90, images: ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop"] },
          { name: "Kids Educational Tablet", slug: "kids-tablet", price: 22000, compareAtPrice: 38000, description: "7-inch kids tablet with parental controls, learning apps, and protective case.", catIdx: 5, isFeatured: true, stock: 30, images: ["https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600&h=600&fit=crop"] },
        ];

        for (const prod of sampleProducts) {
          const product = await prisma.product.create({
            data: {
              siteId: site.id,
              categoryId: createdCategories[prod.catIdx]?.id || null,
              name: prod.name,
              slug: prod.slug,
              description: prod.description,
              price: prod.price,
              compareAtPrice: prod.compareAtPrice,
              currency: "NGN",
              stock: prod.stock,
              isFeatured: prod.isFeatured,
              status: "ACTIVE",
              isPublished: true,
              tags: [],
            },
          });
          // Create product images
          for (let j = 0; j < prod.images.length; j++) {
            await prisma.productImage.create({
              data: { productId: product.id, url: prod.images[j], alt: prod.name, position: j },
            });
          }
        }

        templateResult = { method: "ai", template: "ai-modern", blocksCreated: aiBlocks.length };
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
