import { describe, it, expect, vi } from "vitest";

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {}, PutObjectCommand: class {}, ListObjectsV2Command: class {}, DeleteObjectsCommand: class {},
}));

import { resolveS3Config } from "@/lib/s3-storage";

describe("resolveS3Config", () => {
  it("reads the standard AWS names", () => {
    expect(resolveS3Config({ AWS_ACCESS_KEY_ID: "id", AWS_SECRET_ACCESS_KEY: "sec", AWS_S3_BUCKET: "b", AWS_S3_REGION: "eu-west-1" }))
      .toEqual({ accessKeyId: "id", secretAccessKey: "sec", bucket: "b", region: "eu-west-1" });
  });
  it("accepts the short names", () => {
    expect(resolveS3Config({ ACCESS_KEY: "id", SECRET_KEY: "sec", S3_BUCKET: "b", REGION: "af-south-1" }))
      .toEqual({ accessKeyId: "id", secretAccessKey: "sec", bucket: "b", region: "af-south-1" });
  });
  it("accepts AWS_ACCESS_KEY / AWS_SECRET_KEY / AWS_REGION", () => {
    const c = resolveS3Config({ AWS_ACCESS_KEY: "id", AWS_SECRET_KEY: "sec", AWS_REGION: "us-west-2" });
    expect(c).toMatchObject({ accessKeyId: "id", secretAccessKey: "sec", region: "us-west-2" });
  });
  it("the standard names win when both are set", () => {
    const c = resolveS3Config({ AWS_ACCESS_KEY_ID: "std", ACCESS_KEY: "short", AWS_S3_BUCKET: "std-b", S3_BUCKET: "short-b" });
    expect(c.accessKeyId).toBe("std");
    expect(c.bucket).toBe("std-b");
  });
  it("ignores blank values, falls back to the SES region, then us-east-1", () => {
    expect(resolveS3Config({ AWS_S3_REGION: "  ", AWS_SES_REGION: "eu-central-1" }).region).toBe("eu-central-1");
    expect(resolveS3Config({}).region).toBe("us-east-1");
    expect(resolveS3Config({ AWS_ACCESS_KEY_ID: "" , ACCESS_KEY: "id" }).accessKeyId).toBe("id");
  });
});
