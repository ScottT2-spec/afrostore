import {
  SESClient,
  VerifyEmailIdentityCommand,
  GetIdentityVerificationAttributesCommand,
} from "@aws-sdk/client-ses";
import { prisma } from "./db";

function getSesClient() {
  return new SESClient({
    region: process.env.AWS_SES_REGION || "us-east-1",
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined,
  });
}

/**
 * Kicks off SES verification for a merchant's custom "from" email.
 * AWS sends a confirmation link straight to that inbox; once clicked,
 * SES accepts sends with that address as Source.
 */
export async function requestSenderVerification(siteId: string, email: string) {
  const ses = getSesClient();
  await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));

  await prisma.senderIdentity.upsert({
    where: { siteId_email: { siteId, email } },
    create: { siteId, email, status: "pending" },
    update: { status: "pending", requestedAt: new Date(), verifiedAt: null },
  });
}

/** Polls SES and syncs verification status into our DB. Returns the current status. */
export async function refreshSenderStatus(siteId: string, email: string): Promise<string> {
  const ses = getSesClient();
  const res = await ses.send(
    new GetIdentityVerificationAttributesCommand({ Identities: [email] })
  );
  const sesStatus = res.VerificationAttributes?.[email]?.VerificationStatus; // Pending | Success | Failed

  const status = sesStatus === "Success" ? "verified" : sesStatus === "Failed" ? "failed" : "pending";

  await prisma.senderIdentity.upsert({
    where: { siteId_email: { siteId, email } },
    create: { siteId, email, status, verifiedAt: status === "verified" ? new Date() : null },
    update: { status, verifiedAt: status === "verified" ? new Date() : null },
  });

  return status;
}

/** Fast DB-only check used right before a campaign send — no AWS round trip. */
export async function isSenderVerified(siteId: string, email: string): Promise<boolean> {
  const identity = await prisma.senderIdentity.findUnique({
    where: { siteId_email: { siteId, email } },
  });
  return identity?.status === "verified";
}
