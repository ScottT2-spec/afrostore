import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { upsertLeadContact } from "@/lib/crm";
import { runAutomationsForTrigger } from "@/lib/automations";

type Params = { params: Promise<{ slug: string; formSlug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/storefront/:slug/forms/:formSlug — get form fields (public)
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, formSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true },
    });
    if (!site) return json({ success: false, error: "Site not found" }, 404);

    const form = await prisma.form.findFirst({
      where: { siteId: site.id, slug: formSlug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        fields: true,
        submitButtonText: true,
        successMessage: true,
      },
    });

    if (!form) return json({ success: false, error: "Form not found" }, 404);
    return json({ success: true, data: form });
  } catch (err) {
    console.error("GET form error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

// Best-effort mapping from a form's dynamic fields to CRM contact fields.
function extractContactFields(
  fields: Array<{ id: string; label: string; type: string }>,
  body: Record<string, unknown>
) {
  const val = (id: string) => {
    const v = body[id];
    return typeof v === "string" ? v.trim() : "";
  };
  const findField = (predicate: (f: { id: string; label: string; type: string }) => boolean) =>
    fields.find(predicate);

  const emailField = findField((f) => f.type === "email");
  const phoneField = findField((f) => f.type === "tel" || /phone/i.test(f.label));
  const companyField = findField((f) => /company|business|organi[sz]ation/i.test(f.label));

  const fullNameField = findField((f) => /^(full\s*name|name)$/i.test(f.label.trim()));
  const firstNameField = findField((f) => /first\s*name/i.test(f.label));
  const lastNameField = findField((f) => /last\s*name|surname/i.test(f.label));

  let firstName = firstNameField ? val(firstNameField.id) : "";
  let lastName = lastNameField ? val(lastNameField.id) : "";
  if (!firstName && !lastName && fullNameField) {
    const parts = val(fullNameField.id).split(/\s+/).filter(Boolean);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  return {
    email: emailField ? val(emailField.id) : "",
    firstName,
    lastName,
    phone: phoneField ? val(phoneField.id) : "",
    company: companyField ? val(companyField.id) : "",
  };
}

// POST /api/storefront/:slug/forms/:formSlug — submit form (public)
export async function POST(req: NextRequest, { params }: Params) {
  const { slug, formSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true, name: true },
    });
    if (!site) return json({ success: false, error: "Site not found" }, 404);

    const form = await prisma.form.findFirst({
      where: { siteId: site.id, slug: formSlug, isActive: true },
    });
    if (!form) return json({ success: false, error: "Form not found" }, 404);

    const rawBody = await req.json();
    // Optional metadata the caller can pass without it being treated as a form field value
    const { _funnelStepId, ...body } = rawBody as Record<string, unknown> & { _funnelStepId?: string };
    const fields = form.fields as Array<{ id: string; label: string; type: string; required?: boolean }>;

    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const value = body[field.id];
        if (value === undefined || value === null || value === "") {
          return json({ success: false, error: `${field.label} is required` }, 400);
        }
      }
    }

    // Validate email fields
    for (const field of fields) {
      if (field.type === "email" && body[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body[field.id] as string)) {
          return json({ success: false, error: `${field.label} must be a valid email` }, 400);
        }
      }
    }

    // Rate limit: max 10 submissions per IP per form per hour
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.formSubmission.count({
      where: { formId: form.id, ip, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 10) {
      return json({ success: false, error: "Too many submissions. Please try again later." }, 429);
    }

    // If a valid funnel step was passed, make sure it actually belongs to this form/site
    let funnelStep = null as Awaited<ReturnType<typeof prisma.funnelStep.findFirst>> | null;
    if (_funnelStepId) {
      funnelStep = await prisma.funnelStep.findFirst({
        where: { id: _funnelStepId, funnel: { siteId: site.id } },
      });
    }

    // Map dynamic form fields onto CRM contact fields and upsert a lead if we found an email
    const contactFields = extractContactFields(fields, body);
    let crmContactId: string | undefined;
    if (contactFields.email) {
      const { contact, isNewContact } = await upsertLeadContact({
        siteId: site.id,
        email: contactFields.email,
        firstName: contactFields.firstName,
        lastName: contactFields.lastName,
        phone: contactFields.phone,
        company: contactFields.company,
        source: funnelStep ? "funnel" : "form",
        tags: ["form", form.slug],
        scoreDelta: funnelStep ? 10 : 5,
        customFields: { formName: form.name, formData: body },
        activity: {
          type: "form_submitted",
          details: { formId: form.id, formName: form.name, funnelStepId: funnelStep?.id },
        },
      });
      crmContactId = contact.id;

      // Same lead-notification/confirmation trigger the quick-capture funnel
      // path already fires — previously this, the main linked-form
      // submission path most funnels actually use, never fired it at all,
      // so most real lead submissions never notified the merchant.
      const automationCtx = {
        recipientEmail: contact.email,
        recipientPhone: contact.phone || undefined,
        recipientName: [contact.firstName, contact.lastName].filter(Boolean).join(" ") || undefined,
        crmContactId: contact.id,
        subject: `New submission from ${site.name}`,
        message: `A form submission (${form.name}) was received from ${contact.email}.`,
        data: { contactId: contact.id, email: contact.email, phone: contact.phone, formId: form.id, formName: form.name, funnelStepId: funnelStep?.id },
      };
      if (isNewContact) {
        runAutomationsForTrigger(site.id, "new_lead", automationCtx).catch((err) => console.error("Automation trigger (new_lead) error:", err));
      }
      runAutomationsForTrigger(site.id, "form_submission", automationCtx).catch((err) => console.error("Automation trigger (form_submission) error:", err));
    }

    // Save submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: body,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        source: req.headers.get("referer") || undefined,
        funnelStepId: funnelStep?.id,
        crmContactId,
      },
    });

    // Increment submission count + funnel conversion (if applicable)
    await Promise.all([
      prisma.form.update({
        where: { id: form.id },
        data: { submissionCount: { increment: 1 } },
      }),
      funnelStep
        ? prisma.funnelStep.update({
            where: { id: funnelStep.id },
            data: { conversionCount: { increment: 1 } },
          })
        : Promise.resolve(),
    ]);

    return json({
      success: true,
      data: {
        id: submission.id,
        message: form.successMessage || "Thank you! Your submission has been received.",
      },
    }, 201);
  } catch (err) {
    console.error("Form submission error:", err);
    const message = err instanceof Error ? err.message : "Failed to submit form";
    return json({ success: false, error: message }, 500);
  }
}
