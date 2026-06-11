import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { updateSettingsSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const settings = await prisma.storeSettings.findUnique({ where: { storeId } });
  return success(settings);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const settings = await prisma.storeSettings.upsert({
    where: { storeId },
    update: parsed.data,
    create: { storeId, ...parsed.data },
  });

  return success(settings);
}
