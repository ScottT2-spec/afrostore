import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

type Params = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const folder = formData.get("folder") as string || "/";

    if (!file) {
      return error("No file provided", 400);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", siteId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${file.name.replace(/\.[^/.]+$/, "")}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;
    if (file.type.startsWith("image/")) {
      // For now, we'll need to use a library like sharp to get dimensions
      // This is a placeholder - you'd need to install sharp and use it
      // const metadata = await sharp(buffer).metadata();
      // width = metadata.width;
      // height = metadata.height;
    }

    // Create media item record
    const mediaItem = await prisma.mediaItem.create({
      data: {
        siteId,
        name: name || file.name,
        url: `/uploads/${siteId}/${filename}`,
        type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
        mimeType: file.type,
        size: file.size,
        width,
        height,
        folder,
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "media_item",
      entityId: mediaItem.id,
      after: mediaItem,
    });

    return success({ url: mediaItem.url, ...mediaItem }, 201);
  } catch (err) {
    console.error("Upload media error:", err);
    return error("Internal server error", 500);
  }
}
