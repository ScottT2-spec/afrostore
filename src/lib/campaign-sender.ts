/**
 * Campaign sending orchestration.
 *
 * Shared by the "Send Now" API routes and the scheduled-campaign cron job.
 * Handles, for all three channels:
 *   1. Atomically claiming the campaign (DRAFT/SCHEDULED/PAUSED -> SENDING)
 *      so two concurrent triggers (e.g. a manual "Send Now" click racing the
 *      cron job) can't double-send.
 *   2. Resolving the audience (all CRM contacts, or a tag-filtered subset)
 *      into recipient rows, once.
 *   3. Sending to each pending recipient, with a small delay between sends
 *      to stay under provider rate limits, recording per-recipient
 *      success/failure.
 *   4. Rolling the campaign back to DRAFT with a lastError if literally
 *      nothing could be sent (no audience, or provider totally down) so it
 *      stays editable/retryable rather than silently "succeeding" at zero.
 */

import { prisma } from "@/lib/db";
import { sendRawEmail } from "@/lib/email";
import { sendSms, isSmsConfigured } from "@/lib/sms";
import { sendWhatsAppMessage, isWhatsAppConfigured } from "@/lib/whatsapp";

const SEND_DELAY_MS = 120; // stay well under provider rate limits for modest list sizes

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveAudience(siteId: string, audienceType: string, audienceTag: string | null | undefined) {
  const where: Record<string, unknown> = { siteId };
  if (audienceType === "TAG" && audienceTag) {
    where.tags = { has: audienceTag };
  }
  return prisma.crmContact.findMany({
    where: where as any,
    select: { id: true, email: true, phone: true },
  });
}

// ─── Email ──────────────────────────────────────────────────────

export async function sendEmailCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  const claim = await prisma.emailCampaign.updateMany({
    where: { id: campaignId, status: { in: ["DRAFT", "SCHEDULED", "PAUSED"] } },
    data: { status: "SENDING", lastError: null },
  });
  if (claim.count === 0) {
    return { success: false, error: "Campaign is not in a sendable state (already sending/sent, or not found)" };
  }

  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { success: false, error: "Campaign not found" };

  try {
    let recipients = await prisma.emailRecipient.findMany({ where: { campaignId, status: "pending" } });

    if (recipients.length === 0) {
      const existingCount = await prisma.emailRecipient.count({ where: { campaignId } });
      if (existingCount === 0) {
        const contacts = await resolveAudience(campaign.siteId, campaign.audienceType, campaign.audienceTag);
        const withEmail = contacts.filter((c: { email: string }) => !!c.email);
        if (withEmail.length > 0) {
          await prisma.emailRecipient.createMany({
            data: withEmail.map((c: { id: string; email: string }) => ({ campaignId, contactId: c.id, email: c.email, status: "pending" })),
          });
        }
        recipients = await prisma.emailRecipient.findMany({ where: { campaignId, status: "pending" } });
      }
    }

    if (recipients.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT", lastError: "No recipients matched this audience — nothing was sent." },
      });
      return { success: false, error: "No recipients matched this audience" };
    }

    const fromName = campaign.fromName || "Store";
    const fromEmail = campaign.fromEmail || process.env.SES_FROM_EMAIL || "noreply@prokip.com";
    const from = `${fromName} <${fromEmail}>`;
    const html = campaign.contentHtml || "";

    let sent = 0;
    let lastFailureError: string | undefined;

    for (const recipient of recipients) {
      const result = await sendRawEmail({ to: recipient.email, from, subject: campaign.subject, html });
      if (result.success) {
        sent++;
        await prisma.emailRecipient.update({ where: { id: recipient.id }, data: { status: "sent", sentAt: new Date() } });
      } else {
        lastFailureError = result.error;
        await prisma.emailRecipient.update({ where: { id: recipient.id }, data: { status: "failed", error: result.error } });
      }
      await sleep(SEND_DELAY_MS);
    }

    if (sent === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT", lastError: lastFailureError || "All sends failed." },
      });
      return { success: false, error: lastFailureError || "All sends failed" };
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        totalSent: { increment: sent },
        lastError: sent < recipients.length ? `${recipients.length - sent} of ${recipients.length} recipients failed. Last error: ${lastFailureError}` : null,
      },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: "DRAFT", lastError: message } });
    return { success: false, error: message };
  }
}

// ─── SMS ────────────────────────────────────────────────────────

export async function sendSmsCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  const claim = await prisma.smsCampaign.updateMany({
    where: { id: campaignId, status: { in: ["DRAFT", "SCHEDULED", "PAUSED"] } },
    data: { status: "SENDING", lastError: null },
  });
  if (claim.count === 0) {
    return { success: false, error: "Campaign is not in a sendable state (already sending/sent, or not found)" };
  }

  const campaign = await prisma.smsCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { success: false, error: "Campaign not found" };

  if (!isSmsConfigured()) {
    await prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: "DRAFT", lastError: "SMS is not configured for this platform. Set TERMII_API_KEY to enable it." },
    });
    return { success: false, error: "SMS is not configured for this platform" };
  }

  try {
    let recipients = await prisma.smsRecipient.findMany({ where: { campaignId, status: "pending" } });

    if (recipients.length === 0) {
      const existingCount = await prisma.smsRecipient.count({ where: { campaignId } });
      if (existingCount === 0) {
        const contacts = await resolveAudience(campaign.siteId, campaign.audienceType, campaign.audienceTag);
        const withPhone = contacts.filter((c: { phone: string | null }) => !!c.phone);
        if (withPhone.length > 0) {
          await prisma.smsRecipient.createMany({
            data: withPhone.map((c: { id: string; phone: string | null }) => ({ campaignId, contactId: c.id, phone: c.phone as string, status: "pending" })),
          });
        }
        recipients = await prisma.smsRecipient.findMany({ where: { campaignId, status: "pending" } });
      }
    }

    if (recipients.length === 0) {
      await prisma.smsCampaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT", lastError: "No recipients with a phone number matched this audience — nothing was sent." },
      });
      return { success: false, error: "No recipients matched this audience" };
    }

    let sent = 0;
    let lastFailureError: string | undefined;

    for (const recipient of recipients) {
      const result = await sendSms(recipient.phone, campaign.message);
      if (result.success) {
        sent++;
        await prisma.smsRecipient.update({ where: { id: recipient.id }, data: { status: "sent", sentAt: new Date() } });
      } else {
        lastFailureError = result.error;
        await prisma.smsRecipient.update({ where: { id: recipient.id }, data: { status: "failed", error: result.error } });
      }
      await sleep(SEND_DELAY_MS);
    }

    if (sent === 0) {
      await prisma.smsCampaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT", lastError: lastFailureError || "All sends failed." },
      });
      return { success: false, error: lastFailureError || "All sends failed" };
    }

    await prisma.smsCampaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        totalSent: { increment: sent },
        lastError: sent < recipients.length ? `${recipients.length - sent} of ${recipients.length} recipients failed. Last error: ${lastFailureError}` : null,
      },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.smsCampaign.update({ where: { id: campaignId }, data: { status: "DRAFT", lastError: message } });
    return { success: false, error: message };
  }
}

// ─── WhatsApp ───────────────────────────────────────────────────

export async function sendWhatsAppCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  const claim = await prisma.whatsAppCampaign.updateMany({
    where: { id: campaignId, status: { in: ["DRAFT", "SCHEDULED", "PAUSED"] } },
    data: { status: "SENDING", lastError: null },
  });
  if (claim.count === 0) {
    return { success: false, error: "Campaign is not in a sendable state (already sending/sent, or not found)" };
  }

  const campaign = await prisma.whatsAppCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { success: false, error: "Campaign not found" };

  if (!isWhatsAppConfigured()) {
    await prisma.whatsAppCampaign.update({
      where: { id: campaignId },
      data: { status: "DRAFT", lastError: "WhatsApp is not configured for this platform. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable it." },
    });
    return { success: false, error: "WhatsApp is not configured for this platform" };
  }

  try {
    let recipients = await prisma.whatsAppRecipient.findMany({ where: { campaignId, status: "pending" } });

    if (recipients.length === 0) {
      const existingCount = await prisma.whatsAppRecipient.count({ where: { campaignId } });
      if (existingCount === 0) {
        const contacts = await resolveAudience(campaign.siteId, campaign.audienceType, campaign.audienceTag);
        const withPhone = contacts.filter((c: { phone: string | null }) => !!c.phone);
        if (withPhone.length > 0) {
          await prisma.whatsAppRecipient.createMany({
            data: withPhone.map((c: { id: string; phone: string | null }) => ({ campaignId, contactId: c.id, phone: c.phone as string, status: "pending" })),
          });
        }
        recipients = await prisma.whatsAppRecipient.findMany({ where: { campaignId, status: "pending" } });
      }
    }

    if (recipients.length === 0) {
      await prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT", lastError: "No recipients with a phone number matched this audience — nothing was sent." },
      });
      return { success: false, error: "No recipients matched this audience" };
    }

    let sent = 0;
    let lastFailureError: string | undefined;

    for (const recipient of recipients) {
      const result = await sendWhatsAppMessage(recipient.phone, campaign.message, campaign.mediaUrl || undefined);
      if (result.success) {
        sent++;
        await prisma.whatsAppRecipient.update({ where: { id: recipient.id }, data: { status: "sent", sentAt: new Date() } });
      } else {
        lastFailureError = result.error;
        await prisma.whatsAppRecipient.update({ where: { id: recipient.id }, data: { status: "failed", error: result.error } });
      }
      await sleep(SEND_DELAY_MS);
    }

    if (sent === 0) {
      await prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT", lastError: lastFailureError || "All sends failed." },
      });
      return { success: false, error: lastFailureError || "All sends failed" };
    }

    await prisma.whatsAppCampaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        totalSent: { increment: sent },
        lastError: sent < recipients.length ? `${recipients.length - sent} of ${recipients.length} recipients failed. Last error: ${lastFailureError}` : null,
      },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.whatsAppCampaign.update({ where: { id: campaignId }, data: { status: "DRAFT", lastError: message } });
    return { success: false, error: message };
  }
}

export async function sendCampaign(type: "email" | "sms" | "whatsapp", campaignId: string) {
  if (type === "email") return sendEmailCampaign(campaignId);
  if (type === "sms") return sendSmsCampaign(campaignId);
  return sendWhatsAppCampaign(campaignId);
}
