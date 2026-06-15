import { NextRequest } from "next/server";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/stores/:storeId/messages
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const where = {
    storeId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return success({ data: messages, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

// PATCH /api/stores/:storeId/messages  (bulk mark as read)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { ids, isRead } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return error("Provide an array of message ids", 400);
  }

  await prisma.contactMessage.updateMany({
    where: { storeId, id: { in: ids } },
    data: { isRead: isRead !== false },
  });

  return success({ updated: ids.length });
}

// DELETE /api/stores/:storeId/messages
export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    await prisma.contactMessage.deleteMany({ where: { storeId, id } });
  }

  return success({ deleted: true });
}
