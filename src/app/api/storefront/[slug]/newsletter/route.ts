import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import { upsertLeadContact } from "@/lib/crm";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/newsletter
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  // No limit existed here at all — this sends a real welcome email to
  // whatever address is submitted, so unrestricted this is an email-
  // bombing vector against arbitrary third-party inboxes.
  const rl = rateLimit(`newsletter:${getClientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findFirst({
      where: { slug, status: "ACTIVE" },
      select: { id: true, name: true },
    });

    if (!site) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    const existingContact = await prisma.crmContact.findUnique({
      where: { siteId_email: { siteId: site.id, email: email.trim().toLowerCase() } },
      select: { tags: true },
    });
    const isNewSubscriber = !existingContact || !existingContact.tags.includes("newsletter");

    await upsertLeadContact({
      siteId: site.id,
      email,
      source: "newsletter",
      tags: ["newsletter"],
      activity: { type: "newsletter_signup" },
    });

    // Send welcome email only to new subscribers (non-blocking)
    if (isNewSubscriber) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${slug}.prokip.com`;
      sendNewsletterWelcomeEmail({
        to: email,
        storeName: site.name || slug,
        storeUrl: `${baseUrl}/store/${slug}`,
      }).catch((err) => console.error("Newsletter welcome email error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
