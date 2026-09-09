import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_S3_REGION || process.env.AWS_SES_REGION || "us-east-1";
const bucket = process.env.AWS_S3_BUCKET;

// Lazy-init, same pattern as getSupabaseAdmin() — avoids crashing at build
// time when env vars aren't set yet, only throws when actually used.
let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3) {
    if (!bucket) {
      throw new Error("AWS_S3_BUCKET must be set");
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set");
    }
    _s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _s3;
}

export const STORAGE_BUCKET = bucket || "uploads";

/** Uploads a file to S3 at the given key and returns its public URL. Bucket must allow public read on these keys (or sit behind a public CDN/CloudFront). */
export async function uploadFile(filePath: string, body: Buffer, contentType: string): Promise<string> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: filePath,
      Body: body,
      ContentType: contentType,
    })
  );
  return getPublicUrl(filePath);
}

/** Get the public URL for a file already in the bucket. */
export function getPublicUrl(filePath: string): string {
  const cdnBase = process.env.AWS_S3_PUBLIC_URL?.replace(/\/$/, "");
  if (cdnBase) return `${cdnBase}/${filePath}`;
  return `https://${STORAGE_BUCKET}.s3.${region}.amazonaws.com/${filePath}`;
}
