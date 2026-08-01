import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, validationError } from "@/lib/api-helpers";
import { z } from "zod";

// Lightweight public schema for landing page lead submissions
const publicLeadSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().max(100).optional().default(""),
  lastName: z.string().max(100).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  company: z.string().max(200).optional().default("")
});

type Params = { params: Promise<{ slug: string }> };

// POST /api/public/sites/:slug/crm/contacts — no auth; used by public landing pages
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    // Resolve site by slug
    const site = await prisma.site.findUnique({ where: { slug } });
    if (!site) return error("Site not found", 404);

    const body = await req.json();
    const parsed = publicLeadSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Enforce unique by (siteId,email)
    const existing = await prisma.crmContact.findUnique({
      where: { siteId_email: { siteId: site.id, email: parsed.data.email } },
    });
    if (existing) return error("A contact with this email already exists", 409);

    const contact = await prisma.crmContact.create({
      data: {
        siteId: site.id,
        email: parsed.data.email,
        firstName: parsed.data.firstName || undefined,
        lastName: parsed.data.lastName || undefined,
        phone: parsed.data.phone || undefined,
        company: parsed.data.company || undefined,
        source: "landing",
        status: "NEW",
        tags: ["landing", "public"],
      },
    });

    // Minimal activity log without auth context
    await prisma.crmActivity.create({
      data: {
        contactId: contact.id,
        type: "contact_created",
        details: { source: "landing-public" } as any,
      },
    });

    return success(contact, 201);
  } catch (e) {
    console.error("Public lead submit error:", e);
    return error("Internal server error", 500);
  }
}
