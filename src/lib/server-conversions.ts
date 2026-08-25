/**
 * Server-side conversion forwarding to Meta Conversions API and TikTok
 * Events API.
 *
 * Why this exists alongside the browser pixel calls in storefront-analytics.ts:
 * browser-only tracking silently loses events to ad blockers, Safari's
 * tracking prevention, and network failures. For the events that actually
 * matter for ad spend (Lead, Purchase), the platforms recommend an
 * authoritative server-side event as a backstop.
 *
 * Both calls below reuse the SAME eventId the browser pixel call used
 * (passed in from the client via /api/public/sites/:slug/analytics/track),
 * so Meta/TikTok can deduplicate — otherwise a single lead could be counted
 * twice (once from the browser, once from the server).
 *
 * Every function here is fire-and-forget and never throws: a merchant who
 * hasn't configured an access token just gets skipped, and a failed call to
 * Meta/TikTok must never break the visitor-facing request that triggered it.
 */

interface ConversionUserData {
  email?: string | null;
  phone?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

interface SendConversionParams {
  eventName: "Lead" | "Purchase" | "Contact" | "CompleteRegistration";
  eventId: string;
  eventSourceUrl?: string;
  user?: ConversionUserData;
  customData?: Record<string, unknown>;
  settings: {
    facebookPixelId?: string | null;
    metaAccessToken?: string | null;
    metaTestEventCode?: string | null;
    tiktokPixelId?: string | null;
    tiktokAccessToken?: string | null;
  };
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const TIKTOK_EVENT_NAME: Record<string, string> = {
  Lead: "SubmitForm",
  Purchase: "CompletePayment",
  Contact: "Contact",
  CompleteRegistration: "CompleteRegistration",
};

/** Sends one conversion event to whichever platforms are configured for this site. Never throws. */
export async function sendServerConversionEvents(params: SendConversionParams): Promise<void> {
  const { settings } = params;
  await Promise.allSettled([
    settings.facebookPixelId && settings.metaAccessToken
      ? sendMetaConversion(params)
      : Promise.resolve(),
    settings.tiktokPixelId && settings.tiktokAccessToken
      ? sendTikTokConversion(params)
      : Promise.resolve(),
  ]);
}

async function sendMetaConversion(params: SendConversionParams): Promise<void> {
  const { settings, eventName, eventId, eventSourceUrl, user, customData } = params;
  try {
    const userData: Record<string, string | string[]> = {};
    if (user?.email) userData.em = [await sha256Hex(user.email)];
    if (user?.phone) userData.ph = [await sha256Hex(user.phone.replace(/\D/g, ""))];
    if (user?.ip) userData.client_ip_address = user.ip;
    if (user?.userAgent) userData.client_user_agent = user.userAgent;

    const body = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: "website",
          user_data: userData,
          custom_data: customData || {},
        },
      ],
      ...(settings.metaTestEventCode ? { test_event_code: settings.metaTestEventCode } : {}),
    };

    await fetch(`https://graph.facebook.com/v21.0/${settings.facebookPixelId}/events?access_token=${settings.metaAccessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Never let a Meta API failure break the caller's request.
  }
}

async function sendTikTokConversion(params: SendConversionParams): Promise<void> {
  const { settings, eventName, eventId, eventSourceUrl, user, customData } = params;
  try {
    const userData: Record<string, string> = {};
    if (user?.email) userData.email = await sha256Hex(user.email);
    if (user?.phone) userData.phone_number = await sha256Hex(user.phone.replace(/\D/g, ""));
    if (user?.ip) userData.ip = user.ip;
    if (user?.userAgent) userData.user_agent = user.userAgent;

    const body = {
      event_source: "web",
      event_source_id: settings.tiktokPixelId,
      data: [
        {
          event: TIKTOK_EVENT_NAME[eventName] || eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          user: userData,
          page: eventSourceUrl ? { url: eventSourceUrl } : undefined,
          properties: customData || {},
        },
      ],
    };

    await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": settings.tiktokAccessToken || "" },
      body: JSON.stringify(body),
    });
  } catch {
    // Never let a TikTok API failure break the caller's request.
  }
}
