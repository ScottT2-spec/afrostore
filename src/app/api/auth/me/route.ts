import { NextRequest } from "next/server";
import { getAuthUser, unauthorized, hashPassword, verifyPassword } from "@/lib/auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { encryptField, decryptField, maskValue, isEncrypted } from "@/lib/field-crypto";

// Fields sensitive enough to encrypt at rest and never round-trip to the
// client in plaintext after the first save — only a masked version
// (e.g. "••••1234") is ever returned. To change one, the user types a new
// value; leaving the masked placeholder untouched means "no change".
const SENSITIVE_DETAIL_FIELDS = new Set([
  "bankAccountNumber", "bankIdentifierCode", "taxPayerId", "idProofNumber",
]);

function maskSensitiveDetails(details: Record<string, unknown> | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (typeof value !== "string" || !value) continue;
    if (SENSITIVE_DETAIL_FIELDS.has(key)) {
      const plain = isEncrypted(value) ? decryptField(value) : value;
      out[key] = maskValue(plain);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const full = await prisma.user.findUnique({ where: { id: user.id }, select: { profileDetails: true } });
  const profileDetails = maskSensitiveDetails((full?.profileDetails as Record<string, unknown>) || null);

  return success({ ...user, profileDetails });
}

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  avatar: z.string().trim().url().nullable().optional(),
  profileDetails: z.record(z.string(), z.string().max(2000).nullable()).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(200).optional(),
});

// PATCH /api/auth/me — update the logged-in user's own profile, and/or change password
export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorized();

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return error(parsed.error.issues[0]?.message || "Invalid input", 400);

    const { firstName, lastName, phone, avatar, profileDetails, currentPassword, newPassword } = parsed.data;

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (avatar !== undefined) data.avatar = avatar;
    if (profileDetails !== undefined) {
      const existing = await prisma.user.findUnique({ where: { id: authUser.id }, select: { profileDetails: true } });
      const existingDetails = (existing?.profileDetails as Record<string, string>) || {};
      const merged: Record<string, string | null> = { ...existingDetails };

      for (const [key, value] of Object.entries(profileDetails)) {
        if (value === null || value === undefined) {
          merged[key] = value;
          continue;
        }
        if (SENSITIVE_DETAIL_FIELDS.has(key)) {
          // A masked placeholder (starts with the mask dot) sent back
          // unchanged means "don't update this field" — keep the existing
          // encrypted value rather than encrypting the mask itself.
          if (value.startsWith("•")) continue;
          merged[key] = value ? encryptField(value) : value;
        } else {
          merged[key] = value;
        }
      }
      data.profileDetails = merged;
    }

    // Password change requires the current password, verified against the stored hash
    if (newPassword) {
      if (!currentPassword) return error("Current password is required to set a new password", 400);

      const dbUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { passwordHash: true },
      });
      if (!dbUser?.passwordHash) return error("This account has no password set", 400);

      const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
      if (!valid) return error("Current password is incorrect", 400);

      data.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(data).length === 0) return error("Nothing to update", 400);

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        profileDetails: true,
      },
    });

    return success({ ...updated, profileDetails: maskSensitiveDetails(updated.profileDetails as Record<string, unknown>) });
  } catch (err) {
    console.error("PATCH /api/auth/me error:", err);
    return error("Failed to update profile", 500);
  }
}
