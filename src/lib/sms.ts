/**
 * SMS provider adapter — Termii (https://termii.com).
 *
 * Termii is used because it's the standard SMS gateway for Nigerian/African
 * businesses (the target market for this platform) — simple REST API, no SDK
 * needed, supports Sender ID registration for branded sends.
 *
 * Requires env vars:
 *   TERMII_API_KEY   — from the Termii dashboard
 *   TERMII_SENDER_ID — a registered Sender ID (falls back to "N-Alert", Termii's
 *                      shared/default sender ID, if not set — works out of the
 *                      box for testing but isn't a custom brand name)
 *
 * If TERMII_API_KEY isn't set, isSmsConfigured() returns false and
 * sendSms() returns a clear "not configured" error instead of attempting
 * a request — callers should check this before looping over recipients.
 */

const TERMII_BASE_URL = "https://api.ng.termii.com/api/sms/send";

export function isSmsConfigured(): boolean {
  return !!process.env.TERMII_API_KEY;
}

interface SendSmsResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendSms(to: string, message: string): Promise<SendSmsResult> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    return { success: false, error: "SMS is not configured for this platform. Set TERMII_API_KEY to enable it." };
  }

  try {
    const res = await fetch(TERMII_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        from: process.env.TERMII_SENDER_ID || "N-Alert",
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: apiKey,
      }),
    });
    const json = await res.json();

    // Termii returns { message_id, message, balance, user } on success,
    // or { code, message } on failure — no consistent top-level "success" flag.
    if (!res.ok || json.code === "ivalid_request" || (json.code && json.code !== "ok")) {
      return { success: false, error: json.message || `Termii request failed (${res.status})` };
    }
    if (!json.message_id) {
      return { success: false, error: json.message || "Termii did not return a message id" };
    }
    return { success: true, messageId: json.message_id };
  } catch (err) {
    console.error("Termii SMS send failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error contacting Termii" };
  }
}
