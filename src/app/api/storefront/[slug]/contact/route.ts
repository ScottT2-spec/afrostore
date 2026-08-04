import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { upsertLeadContact } from "@/lib/crm";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/contact
// Public endpoint — anyone can submit a contact message to a store
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Find store by slug
    const site = await prisma.site.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!site || site.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // Rate limit: max 5 messages per email per store per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.contactMessage.count({
      where: {
        siteId: site.id,
        email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        { success: false, error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    // Save the message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        siteId: site.id,
        name: name.slice(0, 200),
        email: email.slice(0, 320),
        subject: subject ? subject.slice(0, 500) : null,
        message: message.slice(0, 5000),
      },
    });

    // Every contact-form submission is a lead worth tracking — feed it into
    // the CRM pipeline too (same helper the newsletter/form/funnel routes use).
    // This is wrapped separately so a CRM hiccup never turns an otherwise-
    // successful "message received" into a failure for the visitor.
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      await upsertLeadContact({
        siteId: site.id,
        email,
        firstName,
        lastName: rest.join(" ") || undefined,
        source: "contact_form",
        tags: ["contact-form"],
        scoreDelta: 5,
        customFields: subject ? { subject } : undefined,
        activity: {
          type: "contact_form_submitted",
          details: { contactMessageId: contactMessage.id, subject },
        },
      });
    } catch (crmErr) {
      console.error("Contact form -> CRM upsert error:", crmErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
