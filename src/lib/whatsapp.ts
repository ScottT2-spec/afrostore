/**
 * WhatsApp provider adapter — Meta's WhatsApp Business Cloud API
 * (https://developers.facebook.com/docs/whatsapp/cloud-api).
 *
 * This is the official, standard integration path (as opposed to unofficial
 * gateways) — requires a WhatsApp Business Account + a registered phone number.
 *
 * Requires env vars:
 *   WHATSAPP_ACCESS_TOKEN     — permanent or long-lived system-user token
 *   WHATSAPP_PHONE_NUMBER_ID  — the Cloud API phone number ID (not the phone number itself)
 *
 * IMPORTANT: Meta requires the recipient to have messaged the business within
 * the last 24 hours (the "session window"), OR the message must use a
 * pre-approved message Template, for outbound marketing/broadcast sends.
 * Free-form text bodies (what this sends) will be rejected by Meta outside
 * that window — that's a WhatsApp platform rule, not something this code can
 * bypass. Campaigns sent this way work reliably for opted-in/recently-active
 * contacts; for cold broadcast, a registered message template is required
 * (not implemented here — flagged as a known limitation).
 */

function apiBase(phoneNumberId: string) {
  return `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
}

export function isWhatsAppConfigured(): boolean {
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

interface SendWhatsAppResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendWhatsAppMessage(to: string, message: string, mediaUrl?: string): Promise<SendWhatsAppResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { success: false, error: "WhatsApp is not configured for this platform. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable it." };
  }

  // Normalize to E.164 without the leading "+" (Cloud API expects digits only)
  const recipient = to.replace(/[^\d]/g, "");

  try {
    const body: Record<string, unknown> = mediaUrl
      ? {
          messaging_product: "whatsapp",
          to: recipient,
          type: "image",
          image: { link: mediaUrl, caption: message },
        }
      : {
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body: message, preview_url: true },
        };

    const res = await fetch(apiBase(phoneNumberId), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json?.error?.message || `WhatsApp API request failed (${res.status})` };
    }
    const messageId = json?.messages?.[0]?.id;
    if (!messageId) {
      return { success: false, error: "WhatsApp API did not return a message id" };
    }
    return { success: true, messageId };
  } catch (err) {
    console.error("WhatsApp send failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error contacting WhatsApp Cloud API" };
  }
}
