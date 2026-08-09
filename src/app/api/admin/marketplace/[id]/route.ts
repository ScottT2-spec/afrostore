import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error, validationError } from "@/lib/api-helpers";
import { adminReviewMarketplaceItemSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/marketplace/:id — approve, reject, or suspend a submission
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { id } = await params;
    const body = await req.json();
    const parsed = adminReviewMarketplaceItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    if (parsed.data.status === "REJECTED" && !parsed.data.rejectionReason?.trim()) {
      return error("A rejection reason is required so the submitter knows what to fix", 400);
    }

    const existing = await prisma.marketplaceItem.findUnique({ where: { id } });
    if (!existing) return error("Marketplace item not found", 404);

    const item = await prisma.marketplaceItem.update({
      where: { id },
      data: {
        status: parsed.data.status,
        rejectionReason: parsed.data.status === "REJECTED" ? parsed.data.rejectionReason!.trim() : null,
      },
    });

    return success(item);
  } catch (err) {
    console.error("Admin marketplace review error:", err);
    return error("Internal server error", 500);
  }
}
