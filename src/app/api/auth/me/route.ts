import { NextRequest } from "next/server";
import { getAuthUser, unauthorized, hashPassword, verifyPassword } from "@/lib/auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return success(user);
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
      const merged = { ...((existing?.profileDetails as Record<string, unknown>) || {}), ...profileDetails };
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
      },
    });

    return success(updated);
  } catch (err) {
    console.error("PATCH /api/auth/me error:", err);
    return error("Failed to update profile", 500);
  }
}
