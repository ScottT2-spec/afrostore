import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { z } from "zod";

type Params = { params: Promise<{ siteId: string }> };

const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  isDefault: z.boolean().optional(),
});

// GET /api/sites/:siteId/locations
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const locations = await prisma.location.findMany({
    where: { siteId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return success({ locations });
}

// POST /api/sites/:siteId/locations
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createLocationSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Invalid input", 400);

  const location = await prisma.$transaction(async (tx) => {
    // Only one default location per site — setting this one as default
    // unsets any previous default rather than ending up with two.
    if (parsed.data.isDefault) {
      await tx.location.updateMany({ where: { siteId, isDefault: true }, data: { isDefault: false } });
    }
    const existingCount = await tx.location.count({ where: { siteId } });
    return tx.location.create({
      data: { ...parsed.data, siteId, isDefault: parsed.data.isDefault ?? existingCount === 0 },
    });
  });

  await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "location", entityId: location.id, after: location });
  return success(location, 201);
}
