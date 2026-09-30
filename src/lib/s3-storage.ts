import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

type Env = Record<string, string | undefined>;

/**
 * S3 settings. The standard AWS names are preferred; the shorter names are
 * accepted too so the app works with whichever the host has set:
 *   access key: AWS_ACCESS_KEY_ID  | AWS_ACCESS_KEY | ACCESS_KEY
 *   secret key: AWS_SECRET_ACCESS_KEY | AWS_SECRET_KEY | SECRET_KEY
 *   bucket:     AWS_S3_BUCKET | S3_BUCKET
 *   region:     AWS_S3_REGION | AWS_REGION | REGION | AWS_SES_REGION (default us-east-1)
 */
export function resolveS3Config(env: Env = process.env) {
  const pick = (...names: string[]) => names.map((n) => env[n]?.trim()).find((v) => v);
  return {
    accessKeyId: pick("AWS_ACCESS_KEY_ID", "AWS_ACCESS_KEY", "ACCESS_KEY"),
    secretAccessKey: pick("AWS_SECRET_ACCESS_KEY", "AWS_SECRET_KEY", "SECRET_KEY"),
    bucket: pick("AWS_S3_BUCKET", "S3_BUCKET"),
    region: pick("AWS_S3_REGION", "AWS_REGION", "REGION", "AWS_SES_REGION") || "us-east-1",
  };
}

const { region, bucket } = resolveS3Config();

// Lazy-init, same pattern as getSupabaseAdmin() — avoids crashing at build
// time when env vars aren't set yet, only throws when actually used.
let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3) {
    if (!bucket) {
      throw new Error("AWS_S3_BUCKET must be set");
    }
    const { accessKeyId, secretAccessKey } = resolveS3Config();
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set");
    }
    _s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
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

/** Deletes every object under a key prefix (e.g. before re-publishing a
 * site's built output, so stale/renamed files from a previous build
 * don't linger forever). No-op if the prefix is empty. */
export async function deletePrefix(prefix: string): Promise<void> {
  const s3 = getS3Client();
  let continuationToken: string | undefined;
  do {
    const listed = await s3.send(
      new ListObjectsV2Command({ Bucket: STORAGE_BUCKET, Prefix: prefix, ContinuationToken: continuationToken })
    );
    const keys = (listed.Contents || []).map((o) => o.Key).filter((k): k is string => !!k);
    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({ Bucket: STORAGE_BUCKET, Delete: { Objects: keys.map((Key) => ({ Key })) } })
      );
    }
    continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (continuationToken);
}
