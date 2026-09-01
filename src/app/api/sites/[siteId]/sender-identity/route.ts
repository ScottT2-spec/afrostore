import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { requestSenderVerification, refreshSenderStatus } from "@/lib/ses-identity";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/sender-identity?email=hello@store.com
// Refreshes + returns verification status for a merchant's custom "from" address.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const email = new URL(req.url).searchParams.get("email");
  if (!email) return error("email query param is required", 400);

  const existing = await prisma.senderIdentity.findUnique({ where: { siteId_email: { siteId, email } } });
  if (!existing) return success({ status: "unverified" });

  const status = await refreshSenderStatus(siteId, email);
  return success({ status });
}

// POST /api/sites/:siteId/sender-identity  { email }
// Kicks off SES verification — AWS emails a confirmation link to that address.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json().catch(() => ({}));
  const email = body?.email;
  if (!email || typeof email !== "string") return error("email is required", 400);

  try {
    await requestSenderVerification(siteId, email);
    return success({ status: "pending", message: `Verification email sent to ${email}. Ask the merchant to click the link from AWS.` });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Failed to start verification", 500);
  }
}
