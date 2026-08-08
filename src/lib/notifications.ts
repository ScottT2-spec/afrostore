import { prisma } from "@/lib/db";

export type SiteNotificationType =
  | "ORDER"
  | "PAYMENT"
  | "LOW_STOCK"
  | "REVIEW"
  | "LEAD"
  | "CAMPAIGN"
  | "SYSTEM"
  | "SECURITY"
  | "MESSAGE";

interface CreateSiteNotificationInput {
  siteId: string;
  type: SiteNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Fire-and-forget notification creation for the merchant dashboard's
 * "Notifications" inbox (SiteNotification model). Never throws — a
 * notification failing to save should never break the request that
 * triggered it (order placed, message received, etc).
 */
export async function createSiteNotification(input: CreateSiteNotificationInput): Promise<void> {
  try {
    await prisma.siteNotification.create({
      data: {
        siteId: input.siteId,
        type: input.type,
        title: input.title.slice(0, 200),
        message: input.message.slice(0, 1000),
        data: input.data as any,
      },
    });
  } catch (err) {
    console.error(`createSiteNotification (${input.type}) error:`, err);
  }
}
