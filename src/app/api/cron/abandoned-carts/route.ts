import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendAbandonedCartReminder } from "@/lib/abandoned-cart";

// Vercel Cron target (see vercel.json) — runs once daily at 03:00 UTC.
//
// NOTE: this used to be scheduled every 15 minutes, but Vercel's Hobby
// plan only allows a cron to fire once per day — anything more frequent
// gets the whole deployment rejected at build time (same issue as the
// send-campaigns cron before it was fixed). Once daily is what Hobby
// allows; upgrading to Pro would let this run more often for tighter
// reminder timing.
//
// FIRST_REMINDER_AFTER_MS/SECOND_REMINDER_AFTER_MS below are MINIMUM idle
// thresholds, not exact schedules, so a daily run still works correctly —
// it just means a cart can wait anywhere from 1 to ~25 hours for its first
// reminder instead of a tight ~1 hour window. BATCH_SIZE keeps a single
// invocation well under the function timeout even with a full day's worth
// of carts to catch up on.
const BATCH_SIZE = 200;
const FIRST_REMINDER_AFTER_MS = 60 * 60 * 1000; // 1 hour of inactivity
const SECOND_REMINDER_AFTER_MS = 23 * 60 * 60 * 1000; // ~24h after the first
const EXPIRE_AFTER_MS = 14 * 24 * 60 * 60 * 1000; // 14 days, never recovered

// Give this run extra headroom since it only fires once a day and may have
// a larger backlog to work through than a frequent-cron design would.
export const maxDuration = 60;

const siteSelect = { name: true, slug: true, customDomain: true, currency: true, status: true } as const;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const summary = { firstReminders: 0, secondReminders: 0, expired: 0, errors: [] as string[] };

  const dueFirst = await prisma.abandonedCart.findMany({
    where: {
      status: "ACTIVE",
      remindersSent: 0,
      updatedAt: { lte: new Date(now - FIRST_REMINDER_AFTER_MS) },
      OR: [{ email: { not: null } }, { phone: { not: null } }],
    },
    include: { site: { select: siteSelect } },
    take: BATCH_SIZE,
    orderBy: { updatedAt: "asc" },
  });

  for (const cart of dueFirst) {
    if (cart.site.status !== "ACTIVE") continue;
    try {
      const { sent, results } = await sendAbandonedCartReminder(cart, cart.site);
      if (sent) {
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { status: "REMINDED", remindersSent: 1, lastReminderAt: new Date() },
        });
        summary.firstReminders++;
      } else if (results.length > 0) {
        summary.errors.push(`cart ${cart.id}: ${results.map((r) => r.error).filter(Boolean).join("; ")}`);
      }
    } catch (err) {
      console.error(`Abandoned cart reminder failed (cart=${cart.id}):`, err);
      summary.errors.push(`cart ${cart.id}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  const dueSecond = await prisma.abandonedCart.findMany({
    where: {
      status: "REMINDED",
      remindersSent: 1,
      lastReminderAt: { lte: new Date(now - SECOND_REMINDER_AFTER_MS) },
      OR: [{ email: { not: null } }, { phone: { not: null } }],
    },
    include: { site: { select: siteSelect } },
    take: BATCH_SIZE,
    orderBy: { lastReminderAt: "asc" },
  });

  for (const cart of dueSecond) {
    if (cart.site.status !== "ACTIVE") continue;
    try {
      const { sent, results } = await sendAbandonedCartReminder(cart, cart.site);
      if (sent) {
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { remindersSent: 2, lastReminderAt: new Date() },
        });
        summary.secondReminders++;
      } else if (results.length > 0) {
        summary.errors.push(`cart ${cart.id}: ${results.map((r) => r.error).filter(Boolean).join("; ")}`);
      }
    } catch (err) {
      console.error(`Abandoned cart final reminder failed (cart=${cart.id}):`, err);
      summary.errors.push(`cart ${cart.id}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  const expired = await prisma.abandonedCart.updateMany({
    where: {
      status: { in: ["ACTIVE", "REMINDED"] },
      createdAt: { lte: new Date(now - EXPIRE_AFTER_MS) },
    },
    data: { status: "EXPIRED" },
  });
  summary.expired = expired.count;

  return NextResponse.json({ success: true, data: summary });
}
