import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ recipientId: string }> };

// A 1x1 transparent GIF, served unconditionally — a broken pixel is a
// broken inbox render, so this route must never 404/500 back to the mail
// client no matter what happens with the DB write below it.
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64");

function pixelResponse() {
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// GET /api/track/email/open/:recipientId — no auth, this is embedded in
// an <img> tag in a sent email and hit by the recipient's mail client.
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { recipientId } = await params;

    const recipient = await prisma.emailRecipient.findUnique({
      where: { id: recipientId },
      select: { id: true, openedAt: true, campaignId: true, contactId: true, campaign: { select: { siteId: true } } },
    });

    // Only count the first open per recipient — repeat opens (forwards,
    // image proxy re-fetches, etc.) shouldn't inflate totalOpened.
    if (recipient && !recipient.openedAt) {
      await Promise.all([
        prisma.emailRecipient.update({ where: { id: recipient.id }, data: { openedAt: new Date() } }),
        prisma.emailCampaign.update({ where: { id: recipient.campaignId }, data: { totalOpened: { increment: 1 } } }),
        prisma.analyticsEvent.create({
          data: {
            siteId: recipient.campaign.siteId,
            event: "email_open",
            metadata: { campaignId: recipient.campaignId, recipientId: recipient.id, contactId: recipient.contactId },
          },
        }),
      ]);
    }
  } catch {
    // Never let a tracking failure surface to the mail client.
  }
  return pixelResponse();
}
