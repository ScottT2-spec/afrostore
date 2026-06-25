import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { supabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
]);

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const hash = crypto.randomBytes(12).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

async function ensureBucketExists() {
  try {
    const admin = supabaseAdmin;
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === STORAGE_BUCKET)) {
      await admin.storage.createBucket(STORAGE_BUCKET, { public: true });
    }
  } catch (error) {
    console.warn("Unable to verify Supabase bucket, falling back if needed:", error);
  }
}

function getLocalUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

async function saveLocally(fileName: string, file: File): Promise<string> {
  const uploadDir = getLocalUploadDir();
  if (!existsSync(uploadDir)) {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const localPath = path.join(uploadDir, fileName);
  await fs.writeFile(localPath, buffer);
  return `/uploads/${fileName}`;
}

// POST /api/upload — accepts multipart form data with one or more "file" fields
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const uploaded: Array<{ url: string; name: string; size: number }> = [];
    const errors: string[] = [];
    const shouldUseSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (shouldUseSupabase) {
      await ensureBucketExists();
    }

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.has(file.type)) {
        errors.push(
          `${file.name}: Invalid file type (${file.type}). Allowed: images, video, audio, and document files`
        );
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB`
        );
        continue;
      }

      const fileName = generateFileName(file.name);
      if (shouldUseSupabase) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const { error: uploadError } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, buffer, {
              contentType: file.type,
              cacheControl: "31536000",
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          uploaded.push({
            url: getPublicUrl(fileName),
            name: file.name,
            size: file.size,
          });
          continue;
        } catch (error) {
          console.warn("Supabase upload failed, falling back to local storage:", error);
        }
      }

      const localUrl = await saveLocally(fileName, file);
      uploaded.push({
        url: localUrl,
        name: file.name,
        size: file.size,
      });
    }

    if (uploaded.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join("; ") },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploaded,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
