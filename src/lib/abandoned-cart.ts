import { prisma } from "@/lib/db";
import { sendRawEmail } from "@/lib/email";
import { sendWhatsAppMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "afrostore.com";

export interface CartItemSnapshot { productId: string; name: string; price: number; quantity: number; image?: string | null }
export interface ReminderSite { name: string; slug: string; customDomain: string | null; currency: string }
export interface ReminderCart { id: string; email: string | null; phone: string | null; items: unknown; totalAmount: number }

export function abandonedCartUrl(site: ReminderSite): string {
  const base = site.customDomain ? `https://${site.customDomain}` : `https://${APP_DOMAIN}/store/${site.slug}`;
  return `${base}/cart`;
}

function buildReminderContent(site: ReminderSite, items: CartItemSnapshot[], total: number) {
  const cartUrl = abandonedCartUrl(site);
  const rows = items.map((i) =>
    `<tr><td style="padding:8px 0;">${i.quantity} × ${i.name}</td><td style="padding:8px 0;text-align:right;">${formatCurrency(i.price * i.quantity, site.currency)}</td></tr>`
  ).join("");
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>You left something behind</h2>
      <p>Your cart at <strong>${site.name}</strong> is still saved — complete your order before it's gone.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
      <p style="font-weight:bold;">Total: ${formatCurrency(total, site.currency)}</p>
      <p><a href="${cartUrl}" style="display:inline-block;background:#111827;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Complete your order</a></p>
    </div>`;
  const text = `You left something in your cart at ${site.name}. Total: ${formatCurrency(total, site.currency)}. Complete your order: ${cartUrl}`;
  return { html, text, cartUrl };
}

/**
 * Sends a cart-recovery reminder over whichever channels we have contact
 * info for (email preferred/reliable, WhatsApp attempted as a bonus - see
 * whatsapp.ts for why it's not guaranteed to deliver to a cold contact).
 * Shared by the reminder cron and the dashboard's manual "Send Reminder"
 * button, so there's exactly one implementation of what a reminder says
 * and how it's sent.
 */
export async function sendAbandonedCartReminder(
  cart: ReminderCart,
  site: ReminderSite
): Promise<{ sent: boolean; results: { channel: string; success: boolean; error?: string }[] }> {
  const items = Array.isArray(cart.items) ? (cart.items as unknown as CartItemSnapshot[]) : [];
  if (items.length === 0 || (!cart.email && !cart.phone)) return { sent: false, results: [] };

  const results: { channel: string; success: boolean; error?: string }[] = [];
  const { html, text, cartUrl } = buildReminderContent(site, items, cart.totalAmount);

  if (cart.email) {
    const fromEmail = process.env.SES_FROM_EMAIL || "noreply@prokip.com";
    const res = await sendRawEmail({
      to: cart.email,
      from: `${site.name} <${fromEmail}>`,
      subject: `You left something at ${site.name}`,
      html,
      text,
    });
    results.push({ channel: "email", success: res.success, error: res.error });
  }

  if (cart.phone && isWhatsAppConfigured()) {
    const res = await sendWhatsAppMessage(cart.phone, text.replace(cartUrl, "").trim() + `\n${cartUrl}`);
    results.push({ channel: "whatsapp", success: res.success, error: res.error });
  }

  return { sent: results.some((r) => r.success), results };
}

/**
 * Marks any active/reminded abandoned cart for this site that matches the
 * given email or phone as RECOVERED. Called right after an order is
 * created (any payment method) - fire-and-forget, must never block or
 * fail checkout.
 */
export async function markAbandonedCartsRecovered(
  siteId: string,
  identity: { email?: string | null; phone?: string | null },
  orderId: string
): Promise<void> {
  const { email, phone } = identity;
  if (!email && !phone) return;

  try {
    const match = await prisma.abandonedCart.findFirst({
      where: {
        siteId,
        status: { in: ["ACTIVE", "REMINDED"] },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (!match) return;

    await prisma.abandonedCart.update({
      where: { id: match.id },
      data: { status: "RECOVERED", recoveredOrderId: orderId, recoveredAt: new Date() },
    });

    // Clean up any other stale duplicate carts for the same customer (e.g.
    // different device/session) so they don't sit around and trigger a
    // confusing "come back and buy this" reminder after they've already
    // purchased. recoveredOrderId is unique, so these can't also point at
    // this order - EXPIRED is the correct terminal state for them.
    await prisma.abandonedCart.updateMany({
      where: {
        siteId,
        status: { in: ["ACTIVE", "REMINDED"] },
        id: { not: match.id },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
      data: { status: "EXPIRED" },
    });
  } catch (err) {
    console.error("markAbandonedCartsRecovered error:", err);
  }
}
