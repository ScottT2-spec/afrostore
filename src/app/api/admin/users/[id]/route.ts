import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { id } = await params;
    const body = await req.json();
    const { role, isBanned, bannedReason } = body;

    // Build update data
    const data: Record<string, unknown> = {};

    if (role) {
      if (!["MERCHANT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
        return error("Invalid role", 400);
      }
      data.role = role;
    }

    if (typeof isBanned === "boolean") {
      data.isBanned = isBanned;
      data.bannedAt = isBanned ? new Date() : null;
      data.bannedReason = isBanned ? (bannedReason || null) : null;
    }

    if (Object.keys(data).length === 0) {
      return error("No valid fields to update", 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
      },
    });

    return success(user);
  } catch (err) {
    console.error("Admin update user error:", err);
    return error("Failed to update user", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { id } = await params;

    // Can't delete yourself
    if (id === admin.id) {
      return error("You cannot delete your own account", 400);
    }

    // Check the target user
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!targetUser) {
      return error("User not found", 404);
    }

    // Can't delete SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN") {
      return error("Cannot delete a Super Admin account", 403);
    }

    await prisma.user.delete({ where: { id } });

    return success({ deleted: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return error("Failed to delete user", 500);
  }
}
