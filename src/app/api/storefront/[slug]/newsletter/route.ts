import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/newsletter
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

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

    // Check if already subscribed before upserting
    const existing = await prisma.crmContact.findUnique({
      where: { siteId_email: { siteId: site.id, email } },
      select: { tags: true },
    });
    const isNew = !existing || !existing.tags.includes("newsletter");

    // Upsert into CrmContact with source "newsletter"
    await prisma.crmContact.upsert({
      where: { siteId_email: { siteId: site.id, email } },
      create: {
        siteId: site.id,
        email,
        source: "newsletter",
        tags: ["newsletter"],
      },
      update: {
        // If they already exist, just make sure "newsletter" tag is present
        tags: { push: "newsletter" },
        lastActivityAt: new Date(),
      },
    });

    // Send welcome email only to new subscribers (non-blocking)
    if (isNew) {
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
