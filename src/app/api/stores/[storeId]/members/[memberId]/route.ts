import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateMemberRoleSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string; memberId: string }> };

// PATCH /api/stores/:storeId/members/:memberId — update role
export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId, memberId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const store = ctx.store!;
    const isOwner = store.ownerId === ctx.user!.id;
    const callerMember = store.members.find((m) => m.userId === ctx.user!.id);
    const isStoreAdmin = callerMember?.role === "ADMIN";

    if (!isOwner && !isStoreAdmin && ctx.user!.role !== "SUPER_ADMIN") {
      return error("Only store owners and admins can update member roles", 403);
    }

    const member = await prisma.storeMember.findFirst({
      where: { id: memberId, storeId },
    });

    if (!member) return error("Member not found", 404);

    // Cannot change the store owner's role (shouldn't be in members, but guard anyway)
    if (member.userId === store.ownerId) {
      return error("Cannot change the store owner's role", 403);
    }

    // Cannot change your own role
    if (member.userId === ctx.user!.id) {
      return error("Cannot change your own role", 403);
    }

    const before = { role: member.role };

    const updated = await prisma.storeMember.update({
      where: { id: memberId },
      data: { role: parsed.data.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await logAudit({
      storeId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "member",
      entityId: memberId,
      before,
      after: { role: updated.role },
    });

    return success(updated);
  } catch (err) {
    console.error("Update member role error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/stores/:storeId/members/:memberId — remove member
export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId, memberId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const store = ctx.store!;
    const isOwner = store.ownerId === ctx.user!.id;
    const callerMember = store.members.find((m) => m.userId === ctx.user!.id);
    const isStoreAdmin = callerMember?.role === "ADMIN";

    if (!isOwner && !isStoreAdmin && ctx.user!.role !== "SUPER_ADMIN") {
      return error("Only store owners and admins can remove members", 403);
    }

    const member = await prisma.storeMember.findFirst({
      where: { id: memberId, storeId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!member) return error("Member not found", 404);

    // Cannot remove the store owner
    if (member.userId === store.ownerId) {
      return error("Cannot remove the store owner", 403);
    }

    // Cannot remove yourself
    if (member.userId === ctx.user!.id) {
      return error("Cannot remove yourself. Transfer ownership or leave the store instead.", 403);
    }

    await prisma.storeMember.delete({ where: { id: memberId } });

    await logAudit({
      storeId,
      userId: ctx.user!.id,
      action: "DELETE",
      entity: "member",
      entityId: memberId,
      before: { userId: member.userId, email: member.user.email, role: member.role },
    });

    return success({ deleted: true });
  } catch (err) {
    console.error("Remove member error:", err);
    return error("Internal server error", 500);
  }
}
