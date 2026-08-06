import { prisma } from "@/lib/db";

export interface UpsertLeadInput {
  siteId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  company?: string | null;
  /** e.g. "newsletter", "landing", "form", "funnel" */
  source?: string | null;
  /** Tags to merge in (deduped) alongside any existing tags on the contact. */
  tags?: string[];
  /** Amount to add to the contact's lead score. Ignored if not a positive number. */
  scoreDelta?: number;
  /** Arbitrary extra fields captured from a form (merged into customFields, additive). */
  customFields?: Record<string, unknown> | null;
  /** Activity log entry recorded alongside the upsert. */
  activity: {
    type: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Reliably create-or-update a CrmContact for a given site + email.
 * - Never throws on "already exists" — always succeeds (create or update).
 * - Merges tags (deduped) instead of overwriting.
 * - Merges customFields instead of overwriting.
 * - Always logs a CrmActivity entry so the pipeline has a trail.
 */
export async function upsertLeadContact(input: UpsertLeadInput) {
  const {
    siteId,
    email,
    firstName,
    lastName,
    phone,
    company,
    source,
    tags = [],
    scoreDelta,
    customFields,
    activity,
  } = input;

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.crmContact.findUnique({
    where: { siteId_email: { siteId, email: normalizedEmail } },
  });

  const mergedTags = Array.from(new Set([...(existing?.tags || []), ...tags]));
  const mergedCustomFields =
    customFields && Object.keys(customFields).length > 0
      ? { ...((existing?.customFields as Record<string, unknown>) || {}), ...customFields }
      : undefined;

  const contact = await prisma.crmContact.upsert({
    where: { siteId_email: { siteId, email: normalizedEmail } },
    create: {
      siteId,
      email: normalizedEmail,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      company: company || undefined,
      source: source || undefined,
      status: "NEW",
      score: scoreDelta && scoreDelta > 0 ? scoreDelta : 0,
      tags: mergedTags,
      customFields: mergedCustomFields ? (mergedCustomFields as any) : undefined,
      lastActivityAt: new Date(),
    },
    update: {
      // Only fill in fields that were previously empty — never clobber data a human already edited.
      firstName: !existing?.firstName && firstName ? firstName : undefined,
      lastName: !existing?.lastName && lastName ? lastName : undefined,
      phone: !existing?.phone && phone ? phone : undefined,
      company: !existing?.company && company ? company : undefined,
      tags: mergedTags,
      score: scoreDelta && scoreDelta > 0 ? { increment: scoreDelta } : undefined,
      customFields: mergedCustomFields ? (mergedCustomFields as any) : undefined,
      lastActivityAt: new Date(),
    },
  });

  await prisma.crmActivity.create({
    data: {
      contactId: contact.id,
      type: activity.type,
      details: (activity.details || {}) as any,
    },
  });

  return { contact, isNewContact: !existing };
}
