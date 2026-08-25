/**
 * Rewrites a campaign email's HTML at send time so opens and clicks become
 * measurable — closing the PRD's EMAIL_OPEN / EMAIL_CLICK requirement.
 *
 * Every EmailRecipient row already has openedAt/clickedAt columns and every
 * EmailCampaign already has totalOpened/totalClicked counters (and the
 * dashboard already displays them) — they were just never written to
 * because nothing ever generated a tracking pixel or rewrote links. This is
 * the piece that was missing, not a new tracking model.
 */

/** Resolves the app's own base URL the same way signup's verification email does. */
export function getAppBaseUrl(requestHost?: string | null): string {
  return process.env.NEXT_PUBLIC_BASE_URL || `https://${requestHost || "afrostore-xi.vercel.app"}`;
}

const HREF_RE = /href\s*=\s*(["'])(.*?)\1/gi;

/**
 * Wraps every http(s) link in the email with a click-tracking redirect, and
 * appends a 1x1 tracking pixel. Both are keyed by recipientId, which is how
 * the tracking endpoints know which EmailRecipient/EmailCampaign to credit.
 */
export function rewriteEmailHtmlForTracking(html: string, recipientId: string, baseUrl: string): string {
  if (!html) return html;

  const rewritten = html.replace(HREF_RE, (match, quote, url) => {
    // Don't wrap mailto:, tel:, anchors, or anything already pointing at our
    // own tracking endpoint (defensive against double-wrapping on resend).
    if (!/^https?:\/\//i.test(url) || url.includes("/api/track/email/click/")) return match;
    const trackedUrl = `${baseUrl}/api/track/email/click/${recipientId}?url=${encodeURIComponent(url)}`;
    return `href=${quote}${trackedUrl}${quote}`;
  });

  const pixel = `<img src="${baseUrl}/api/track/email/open/${recipientId}" width="1" height="1" alt="" style="display:none" />`;
  if (/<\/body>/i.test(rewritten)) {
    return rewritten.replace(/<\/body>/i, `${pixel}</body>`);
  }
  return `${rewritten}${pixel}`;
}
