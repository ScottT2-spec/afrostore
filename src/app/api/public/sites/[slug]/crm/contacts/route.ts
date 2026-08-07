import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, validationError } from "@/lib/api-helpers";
import { upsertLeadContact } from "@/lib/crm";
import { runAutomationsForTrigger } from "@/lib/automations";
import { z } from "zod";

// Lightweight public schema for landing page lead submissions
const publicLeadSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().max(100).optional().default(""),
  lastName: z.string().max(100).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  company: z.string().max(200).optional().default(""),
  /** Where this lead came from, e.g. "landing", "funnel", a template slug, or a campaign name. */
  source: z.string().max(100).optional(),
  /** Extra tags to attach (deduped with any existing tags on the contact). */
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  /** Optional funnel step this submission belongs to, so views/conversions can be tracked. */
  funnelStepId: z.string().optional(),
  /** Arbitrary extra fields captured by the form (stored in customFields). */
  customFields: z.record(z.string(), z.unknown()).optional(),
});

type Params = { params: Promise<{ slug: string }> };

// POST /api/public/sites/:slug/crm/contacts — no auth; used by public landing pages
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    // Resolve site by slug (fall back to subdomain/customDomain like other public routes)
    const site = await prisma.site.findFirst({
      where: { OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    });
    if (!site) return error("Site not found", 404);

    const body = await req.json();
    const parsed = publicLeadSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // If tied to a funnel step, make sure it really belongs to this site before trusting it
    let funnelStep = null as Awaited<ReturnType<typeof prisma.funnelStep.findFirst>> | null;
    if (parsed.data.funnelStepId) {
      funnelStep = await prisma.funnelStep.findFirst({
        where: { id: parsed.data.funnelStepId, funnel: { siteId: site.id } },
      });
    }

    const source = parsed.data.source || (funnelStep ? "funnel" : "landing");
    const tags = Array.from(new Set(["landing", "public", ...parsed.data.tags]));

    const { contact, isNewContact } = await upsertLeadContact({
      siteId: site.id,
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      company: parsed.data.company,
      source,
      tags,
      scoreDelta: funnelStep ? 10 : 5,
      customFields: parsed.data.customFields,
      activity: {
        type: "lead_captured",
        details: { source, funnelStepId: parsed.data.funnelStepId },
      },
    });

    // Track funnel conversion + notify the CRM record of the step it came through
    if (funnelStep) {
      await prisma.funnelStep.update({
        where: { id: funnelStep.id },
        data: { conversionCount: { increment: 1 } },
      });
    }

    // Fire "new_lead" for brand-new contacts, "form_submission" for every
    // submission (repeat submitters included) — fire-and-forget.
    const automationCtx = {
      recipientEmail: contact.email,
      recipientPhone: contact.phone || undefined,
      recipientName: [contact.firstName, contact.lastName].filter(Boolean).join(" ") || undefined,
      crmContactId: contact.id,
      subject: `New submission from ${site.name}`,
      message: `A ${source} form was submitted by ${contact.email}.`,
      data: { contactId: contact.id, email: contact.email, phone: contact.phone, source, funnelStepId: parsed.data.funnelStepId },
    };
    if (isNewContact) {
      runAutomationsForTrigger(site.id, "new_lead", automationCtx).catch((err) => console.error("Automation trigger (new_lead) error:", err));
    }
    runAutomationsForTrigger(site.id, "form_submission", automationCtx).catch((err) => console.error("Automation trigger (form_submission) error:", err));

    return success({ ...contact, isNewContact }, 201);
  } catch (e) {
    console.error("Public lead submit error:", e);
    return error("Internal server error", 500);
  }
}
