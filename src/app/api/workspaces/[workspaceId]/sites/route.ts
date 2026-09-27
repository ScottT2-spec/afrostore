import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, createSiteWithUniqueSlug, enforceStoreLimit } from "@/lib/api-helpers";
import { importTemplateToSite } from "@/lib/templates/importer";
import { provisionDefaultLandingFunnel } from "@/lib/landing-funnel";
import { getIndustrySampleData, DEFAULT_SAMPLE_DATA } from "@/lib/ai-sample-data";
import { buildDynamicHomePage } from "@/lib/ai-layout-engine";
import { getRandomIndustryImages } from "@/lib/ai-image-pools";
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

    // This route previously had NO store-limit check at all — a complete
    // bypass of whatever limit /api/sites enforced, which is very likely
    // how a FREE-plan account ended up with 20+ stores.
    const limitError = await enforceStoreLimit(workspaceId);
    if (limitError) return limitError;

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
    country,
    currency,
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

    // Check for duplicate site name within the same workspace
    const existingSiteInWorkspace = await prisma.site.findFirst({
      where: {
        workspaceId,
        name: name.trim(),
      },
    });

    if (existingSiteInWorkspace) {
      return error("A site with this name already exists in this workspace. Please choose a different name.", 409);
    }

    // The wizard doesn't currently ask merchants for a country/currency, so
    // fall back to the admin-configured platform defaults rather than the
    // schema's hardcoded NG/NGN. An explicit value from the client (if the
    // UI adds this step later) always wins.
    let resolvedCountry = country;
    let resolvedCurrency = currency;
    if (!resolvedCountry || !resolvedCurrency) {
      const platformDefaults = await prisma.platformSettings.findUnique({ where: { id: "platform" } });
      resolvedCountry = resolvedCountry || platformDefaults?.defaultCountry || "NG";
      resolvedCurrency = resolvedCurrency || platformDefaults?.defaultCurrency || "NGN";
    }

  // Create site with settings and social links. Uses a retry-on-collision
  // loop instead of "check then create" — Site.slug and Site.subdomain are
  // both globally unique (not scoped per-workspace), so a candidate that
  // looks free within this workspace can still collide with a site in a
  // different workspace, and a plain check-then-create also has a race
  // window between two concurrent requests. Both failure modes previously
  // surfaced as a raw, unhandled Prisma unique-constraint crash.
    const site = await createSiteWithUniqueSlug<any>(name.trim(), (slug) => ({
      workspaceId,
      name: name.trim(),
      slug,
      subdomain: slug.slice(0, 30),
      description: description || null,
      logo: logo || null,
      siteType,
      businessType,
      industry: industry || null,
      customDomain: customDomain || null,
      country: resolvedCountry,
      currency: resolvedCurrency,
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
    }));

    // Re-fetch with the relations the original create's `include` provided —
    // createSiteWithUniqueSlug's create call doesn't take an include, since
    // it may retry the create itself on a collision.
    const siteWithRelations = await prisma.site.findUniqueOrThrow({
      where: { id: site.id },
      include: { settings: true, socialLinks: true },
    });
    Object.assign(site, siteWithRelations);

    // Theme packages always provide their own pages and site data.
    // No default page synthesis is allowed in the import flow.

    let templateResult: unknown = null;

    // ── AI Build (Build with AI) ─────────────────────────────
    if (launchMethod === "quick") {
      try {
        const storeName = name.trim();
        const storeSlug = site.slug;
        const bizType = body.businessType || body.industry || "general";

        // Instant preview uses the SAME generator (buildDynamicHomePage) and
        // the SAME generic BuilderBlock vocabulary that generateStore()'s
        // background job below uses to enrich this exact page moments later
        // with real AI copy. Previously this called a separate generator
        // (buildSmartAiBlocks) with its own LLM prompt, its own image pool,
        // and its own incompatible block format (rendered by a completely
        // different component tree, TemplateBlockRenderer) — so the page a
        // merchant saw the instant their site was created was silently
        // replaced seconds later by an unrelated implementation. Using one
        // generator for both the instant and enriched passes means there's
        // nothing left for them to disagree about: only the CONTENT changes
        // between passes (industry defaults now, real AI copy shortly
        // after), never the format, the renderer, or the header logic tied
        // to it. ai-layout-engine.ts already has solid per-industry defaults
        // (value props, stats, trust badges, product titles) for the case
        // where no AI content has been generated yet, so no LLM call is
        // needed here at all — that's the ONE LLM call generateStore() makes
        // below, not a second, redundant one.
        const homeBlocks = buildDynamicHomePage({}, storeName, storeSlug, bizType, getRandomIndustryImages(bizType));

        // Store as a plain block array — the exact same shape
        // generateStore()'s background job below writes for this same
        // page moments later (ai-store-generator.ts: `content: page.blocks
        // as any`). This used to route through buildTemplatePageContent /
        // templateBlocksToEditorTree, a conversion built for the OLDER
        // bespoke-template block format (nested "settings"/"elements",
        // with a legacy heuristic that aggressively pulls any
        // array-of-objects out into synthetic child elements). Generic
        // AI blocks carry array props like `items` (features/testimonials/
        // faq) that heuristic isn't meant for — round-tripping them
        // through it risked exactly the "header renders, body blank"
        // failure this was already known to cause, for no reason: this
        // content never needed conversion in the first place, since
        // parsePageContent already handles a plain block array directly
        // (the Array.isArray(content) branch), which is what actually
        // renders correctly every time.
        await prisma.page.create({
          data: {
            siteId: site.id,
            title: "Home",
            slug: "home",
            type: "HOME",
            isPublished: true,
            template: "ai",
            content: homeBlocks as unknown as Prisma.InputJsonValue,
            metaTitle: `${storeName} — ${bizType.charAt(0).toUpperCase() + bizType.slice(1)}`,
            metaDescription: description || `${storeName} — your trusted ${bizType} destination.`,
          },
        });

        // ── Seed industry-specific categories & products ──────
        const sampleData = getIndustrySampleData(bizType) || DEFAULT_SAMPLE_DATA;
        const siteCurrency = site.currency || sampleData.currency || "NGN";

        // Decided once, up front: if the merchant gave us enough to work
        // with, AI-generated products replace the static catalog entirely
        // rather than being created alongside it and cleaned up after the
        // fact. The old create-static-then-delete-after-AI-succeeds
        // approach was a race: if the background AI step failed silently,
        // errored partway, or the "best-effort" delete just didn't fire,
        // the static AND the AI products both stayed — a merchant could
        // end up with more than the intended 10 products from one store.
        const productsOfferedList: string[] = Array.isArray(products) ? products.filter(Boolean) : [];
        const servicesOfferedList: string[] = Array.isArray(services) ? services.filter(Boolean) : [];
        const willUseAiProducts = productsOfferedList.length > 0 || servicesOfferedList.length > 0 || (description && description.trim().length > 10);

        const createdCategories = willUseAiProducts
          ? []
          : await Promise.all(
              sampleData.categories.map((cat, i) =>
                prisma.category.create({
                  data: { siteId: site.id, name: cat.name, slug: cat.slug, image: cat.image, description: cat.description, position: i },
                })
              )
            );

        if (!willUseAiProducts) {
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
              template: "ai",
              isPublished: true,
              position: pg.position,
              content: buildTemplatePageContent([], {}) as unknown as Prisma.InputJsonValue,
              metaTitle: pg.metaTitle,
              metaDescription: pg.metaDescription,
            },
          });
        }

        // ── Fire AI page + product generation in background (non-blocking) ──
        // This will populate About/FAQ/Contact/Policies with real AI content,
        // and (when willUseAiProducts) generate the real tailored catalog —
        // the static starter catalog was already skipped above in that case,
        // so there's nothing to clean up here.
        try {
          const { generateStore } = await import("@/lib/ai-store-generator");
          const { classifyBusiness } = await import("@/lib/ai-classify");
          const { generateProducts } = await import("@/lib/ai-product-generator");

          generateStore({
            siteId: site.id,
            storeSlug: storeSlug,
            storeName,
            businessType: bizType,
            description: description || undefined,
            country: site.country || "NG",
            currency: siteCurrency,
            targetAudience: targetAudience || undefined,
            productsOffered: productsOfferedList,
            servicesOffered: servicesOfferedList,
          }).catch((err: unknown) => console.warn("Background AI page generation failed:", err));

          if (willUseAiProducts) {
            (async () => {
              try {
                const classification = await classifyBusiness(`${bizType} ${description || ""}`);
                await generateProducts({
                  siteId: site.id,
                  businessType: bizType,
                  businessName: storeName,
                  description: description || undefined,
                  industry: classification.industry,
                  currency: siteCurrency,
                  count: 10,
                  targetAudience: targetAudience || undefined,
                  productsOffered: productsOfferedList,
                  servicesOffered: servicesOfferedList,
                });
              } catch (err) {
                // Non-fatal, but note: since the static catalog was
                // intentionally skipped for this branch, a failure here
                // means the merchant is left with zero products, not the
                // static fallback. Logged loudly so this is visible, not
                // silently accepted the way it used to be.
                console.error(`AI product generation failed for site ${site.id}, and static catalog was skipped for this branch — merchant may have zero products:`, err);
              }
            })();
          }
        } catch (bgErr) {
          console.error(`Background AI content generation setup failed for site ${site.id}:`, bgErr);
          // Non-fatal — pages exist with empty content, user can edit
        }

        templateResult = { method: "ai", template: "ai-modern", blocksCreated: homeBlocks.length, categories: createdCategories.length, products: willUseAiProducts ? 0 : sampleData.products.length, aiProductsPending: willUseAiProducts };
      } catch (aiErr) {
        // Previously this was swallowed entirely with no logged detail —
        // the site would report success (201) with a blank homepage and
        // there was no way to know why. Now it's logged loudly with full
        // context and surfaced in the response so the actual failure is
        // visible instead of guessed at.
        const message = aiErr instanceof Error ? aiErr.message : String(aiErr);
        const stack = aiErr instanceof Error ? aiErr.stack : undefined;
        console.error(`AI build FAILED for site ${site.id} (${site.slug}), bizType=${body.businessType || body.industry || "general"}:`, message, stack);
        templateResult = { method: "ai", error: message, blocksCreated: 0 };
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

    // ── Landing-page sites get a working lead funnel out of the box ──
    let funnelResult: unknown = null;
    if (siteType === "LANDING_PAGE") {
      try {
        const { funnel } = await provisionDefaultLandingFunnel(site.id, site.name);
        funnelResult = { id: funnel.id, name: funnel.name };
      } catch (funnelErr) {
        console.error("Default landing funnel provisioning error:", funnelErr);
        // Non-fatal — site is still created, user can add a funnel manually
      }
    }

    return success({ ...site, templateResult, funnelResult }, 201);
  } catch (err) {
    console.error("Create site error:", err);
    return error(err instanceof Error ? err.message : "Internal server error", 500);
  }
}
