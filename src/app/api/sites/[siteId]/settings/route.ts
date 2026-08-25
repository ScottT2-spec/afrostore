import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError , requireRole } from "@/lib/api-helpers";
import { updateSettingsSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { CURRENCY_OPTIONS } from "@/lib/utils";

const VALID_CURRENCY_CODES = new Set(CURRENCY_OPTIONS.map((c) => c.code));

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const [settings, site] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { siteId },
      select: {
        allowGuestCheckout: true, payOnDelivery: true, bankTransfer: true, whatsappOrdering: true,
        showStockCount: true, lowDataMode: true, offlineMode: true, language: true, whatsappNumber: true,
        metaTitle: true, metaDescription: true, googleAnalyticsId: true, facebookPixelId: true, tiktokPixelId: true,
        metaAccessToken: true, metaTestEventCode: true, tiktokAccessToken: true, customHeadCode: true, customBodyCode: true,
      },
    }),
    prisma.site.findUnique({ where: { id: siteId }, select: { currency: true, country: true } }),
  ]);
  return success({ ...settings, currency: site?.currency, country: site?.country });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "ADMIN");
  if (roleErr) return roleErr;

  const body = await req.json();

  // currency lives on Site, not SiteSettings — handle it separately
  if (typeof body.currency === "string") {
    if (!VALID_CURRENCY_CODES.has(body.currency)) return error("Invalid currency code", 400);
    await prisma.site.update({ where: { id: siteId }, data: { currency: body.currency } });
  }
  const { currency: _currency, ...settingsBody } = body;

  const parsed = updateSettingsSchema.safeParse(settingsBody);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  // Filter out null values for non-nullable fields (language has a default)
  const { language, ...rest } = parsed.data;
  const updateData = { ...rest, ...(language !== null && language !== undefined ? { language } : {}) };
  const createData = { siteId, ...rest, ...(language ? { language } : {}) };

  const settings = await prisma.siteSettings.upsert({
    where: { siteId },
    update: updateData,
    create: createData,
  });

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { currency: true, country: true } });
  return success({ ...settings, currency: site?.currency, country: site?.country });
}
