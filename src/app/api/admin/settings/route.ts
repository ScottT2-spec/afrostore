import { NextRequest } from "next/server";
import { z } from "zod";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error, validationError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

const SETTINGS_ID = "platform";

// smtpPass is intentionally never sent back to the client in plaintext —
// GET reports only whether one is set, and PUT leaves it untouched unless
// a new non-empty value is supplied.
function serialize(row: Awaited<ReturnType<typeof getOrCreate>>) {
  const { smtpPass, ...rest } = row;
  return { ...rest, smtpPassSet: !!smtpPass && smtpPass.length > 0 };
}

async function getOrCreate() {
  const existing = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.platformSettings.create({ data: { id: SETTINGS_ID } });
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const settings = await getOrCreate();
    return success(serialize(settings));
  } catch (err) {
    console.error("Admin settings GET error:", err);
    return error("Failed to load platform settings");
  }
}

const updateSchema = z.object({
  siteName: z.string().min(1).max(120).optional(),
  siteUrl: z.string().url().optional(),
  supportEmail: z.string().email().optional(),
  defaultCurrency: z.enum(["NGN", "KES", "GHS", "ZAR", "USD"]).optional(),
  defaultCountry: z.enum(["NG", "KE", "GH", "ZA"]).optional(),
  maintenanceMode: z.boolean().optional(),
  allowSignups: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  maxStoresPerUser: z.number().int().min(1).max(1000).optional(),
  platformFeePercent: z.number().min(0).max(100).optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.string().max(10).optional(),
  smtpUser: z.string().max(255).optional(),
  smtpPass: z.string().max(255).optional(), // empty string / omitted = leave unchanged
  sendFromEmail: z.union([z.literal(""), z.string().email()]).optional(),
  sendFromName: z.string().max(120).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { smtpPass, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest, updatedById: admin.id };
    // Only touch the stored password when a real new value was sent.
    if (smtpPass) data.smtpPass = smtpPass;

    await getOrCreate(); // ensure row exists before update
    const settings = await prisma.platformSettings.update({
      where: { id: SETTINGS_ID },
      data,
    });

    return success(serialize(settings));
  } catch (err) {
    console.error("Admin settings PUT error:", err);
    return error("Failed to save platform settings");
  }
}
