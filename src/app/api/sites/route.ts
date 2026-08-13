import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { createStoreSchema } from "@/lib/validators";
import { success, error, validationError, logAudit, createSiteWithUniqueSlug } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";

// GET /api/sites — list user's stores
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const stores = await prisma.site.findMany({
    where: {
      OR: [
        { workspace: { ownerId: user.id } },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      _count: { select: { products: true, orders: true, customers: true } },
      settings: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return success(stores);
}

// POST /api/sites — create new store
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createStoreSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { name, description, businessType, country, currency, logo } = parsed.data;

    // Fall back to the platform-wide defaults (set by admins) for any store
    // that doesn't explicitly choose a country/currency at creation time.
    let resolvedCountry = country;
    let resolvedCurrency = currency;
    if (!resolvedCountry || !resolvedCurrency) {
      const platformDefaults = await prisma.platformSettings.findUnique({ where: { id: "platform" } });
      resolvedCountry = resolvedCountry || platformDefaults?.defaultCountry || "NG";
      resolvedCurrency = resolvedCurrency || platformDefaults?.defaultCurrency || "NGN";
    }

    // Check store limit based on plan (simplified)
    const storeCount = await prisma.site.count({ where: { workspace: { ownerId: user.id } } });
    if (storeCount >= 10) {
      return error("Store limit reached for your plan", 403);
    }

    // Find or create a default workspace for this user
    let workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          ownerId: user.id,
          name: `${user.firstName}'s Workspace`,
          slug: `${slugify(user.firstName)}-${Math.random().toString(36).slice(2, 6)}`,
        },
      });
    }

    // Creates the site with a retry-on-collision loop instead of a
    // check-then-create — a plain existence check followed by a separate
    // create has a real race window (two requests checking at the same
    // moment) and, since Site.slug is globally unique, could also fail if
    // the "available" candidate turns out to already be taken by a site
    // that was created between the check and the create. The subdomain is
    // derived from the same candidate slug on each attempt so it stays in
    // sync and also gets a fresh value on retry (both columns are unique).
    const store = await createSiteWithUniqueSlug<any>(name, (slug) => ({
      workspaceId: workspace!.id,
      name,
      slug,
      description,
      subdomain: slug.slice(0, 30),
      businessType,
      country: resolvedCountry,
      currency: resolvedCurrency,
      logo: logo || undefined,
      settings: {
        create: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
        },
      },
      socialLinks: { create: {} },
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    }));

    const storeWithRelations = await prisma.site.findUniqueOrThrow({
      where: { id: store.id },
      include: {
        settings: true,
        _count: { select: { products: true, orders: true } },
      },
    });

    await logAudit({
      siteId: storeWithRelations.id,
      userId: user.id,
      action: "CREATE",
      entity: "store",
      entityId: storeWithRelations.id,
      after: storeWithRelations,
    });

    return success(storeWithRelations, 201);
  } catch (err) {
    console.error("Create store error:", err);
    return error("Internal server error", 500);
  }
}
