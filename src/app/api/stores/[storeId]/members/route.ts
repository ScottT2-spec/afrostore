import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { addMemberSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/stores/:storeId/members
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const members = await prisma.storeMember.findMany({
    where: { storeId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Also include the store owner
  const store = ctx.store!;
  const owner = await prisma.user.findUnique({
    where: { id: store.ownerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
    },
  });

  return success({
    owner: owner ? { ...owner, memberRole: "OWNER" as const } : null,
    members: members.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    })),
  });
}

// POST /api/stores/:storeId/members
export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  // Only owner or ADMIN members can add members
  const store = ctx.store!;
  const isOwner = store.ownerId === ctx.user!.id;
  const callerMember = store.members.find((m) => m.userId === ctx.user!.id);
  const isStoreAdmin = callerMember?.role === "ADMIN";

  if (!isOwner && !isStoreAdmin && ctx.user!.role !== "SUPER_ADMIN") {
    return error("Only store owners and admins can add members", 403);
  }

  try {
    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Look up user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!targetUser) {
      return error("User not found. They must sign up first.", 404);
    }

    // Cannot add the owner as a member
    if (targetUser.id === store.ownerId) {
      return error("This user is already the store owner", 409);
    }

    // Check if already a member
    const existing = await prisma.storeMember.findUnique({
      where: { storeId_userId: { storeId, userId: targetUser.id } },
    });

    if (existing) {
      return error("This user is already a member of the store", 409);
    }

    const member = await prisma.storeMember.create({
      data: {
        storeId,
        userId: targetUser.id,
        role: parsed.data.role,
      },
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
      action: "CREATE",
      entity: "member",
      entityId: member.id,
      after: { userId: targetUser.id, email: targetUser.email, role: parsed.data.role },
    });

    return success(member, 201);
  } catch (err) {
    console.error("Add member error:", err);
    return error("Internal server error", 500);
  }
}
