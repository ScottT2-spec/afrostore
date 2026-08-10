import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmailCampaign, sendSmsCampaign, sendWhatsAppCampaign } from "@/lib/campaign-sender";

/**
 * Vercel Cron target (see vercel.json) — runs once daily (Hobby plan cron
 * limit). Was every 5 minutes originally; that got the deployment rejected
 * by Vercel, same class of issue as the abandoned-carts cron.
 * Finds SCHEDULED campaigns of all three types whose scheduledAt has passed
 * and dispatches them. Each individual send is independently claimed
 * (status DRAFT/SCHEDULED/PAUSED -> SENDING) inside campaign-sender.ts, so
 * this is safe to run concurrently with a manual "Send Now" click.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron sends this header automatically; also accept a manual
  // Authorization: Bearer <CRON_SECRET> for local/manual triggering.
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: { type: string; campaignId: string; success: boolean; error?: string }[] = [];

  const [dueEmail, dueSms, dueWhatsApp] = await Promise.all([
    prisma.emailCampaign.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } }, select: { id: true } }),
    prisma.smsCampaign.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } }, select: { id: true } }),
    prisma.whatsAppCampaign.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } }, select: { id: true } }),
  ]);

  for (const c of dueEmail) {
    const r = await sendEmailCampaign(c.id);
    results.push({ type: "email", campaignId: c.id, success: r.success, error: r.error });
  }
  for (const c of dueSms) {
    const r = await sendSmsCampaign(c.id);
    results.push({ type: "sms", campaignId: c.id, success: r.success, error: r.error });
  }
  for (const c of dueWhatsApp) {
    const r = await sendWhatsAppCampaign(c.id);
    results.push({ type: "whatsapp", campaignId: c.id, success: r.success, error: r.error });
  }

  return NextResponse.json({ success: true, processed: results.length, results });
}
