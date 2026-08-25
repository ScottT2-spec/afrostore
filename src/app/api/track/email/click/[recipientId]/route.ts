import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ recipientId: string }> };

// GET /api/track/email/click/:recipientId?url=<encoded destination>
// No auth — every link in a sent campaign email is rewritten to point here
// first, so a click can be recorded before the recipient is redirected on
// to the real destination.
export async function GET(req: NextRequest, { params }: Params) {
  const { recipientId } = await params;
  const rawUrl = req.nextUrl.searchParams.get("url");

  // A missing/invalid destination shouldn't dead-end the recipient — send
  // them somewhere reasonable rather than a bare error page.
  let destination: string;
  try {
    destination = rawUrl ? new URL(rawUrl).toString() : new URL("/", req.nextUrl.origin).toString();
  } catch {
    destination = new URL("/", req.nextUrl.origin).toString();
  }

  try {
    const recipient = await prisma.emailRecipient.findUnique({
      where: { id: recipientId },
      select: { id: true, openedAt: true, clickedAt: true, campaignId: true, contactId: true, campaign: { select: { siteId: true } } },
    });

    if (recipient) {
      const updates: Promise<unknown>[] = [];
      // Count the first click per recipient. A click implies the email was
      // opened, so if openedAt was somehow never set (some mail clients
      // block remote images and never fire the open pixel), credit the
      // open here too rather than under-counting opens for image-blocking
      // clients.
      if (!recipient.clickedAt) {
        updates.push(prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: { clickedAt: new Date(), ...(recipient.openedAt ? {} : { openedAt: new Date() }) },
        }));
        updates.push(prisma.emailCampaign.update({
          where: { id: recipient.campaignId },
          data: { totalClicked: { increment: 1 }, ...(recipient.openedAt ? {} : { totalOpened: { increment: 1 } }) },
        }));
        updates.push(prisma.analyticsEvent.create({
          data: {
            siteId: recipient.campaign.siteId,
            event: "email_click",
            metadata: { campaignId: recipient.campaignId, recipientId: recipient.id, contactId: recipient.contactId, url: destination },
          },
        }));
        await Promise.all(updates);
      }
    }
  } catch {
    // Never let a tracking failure block the recipient's click-through.
  }

  return NextResponse.redirect(destination, { status: 302 });
}
