/**
 * Persisted, atomic AI spend-cap enforcement.
 *
 * The failover engine's getTotalCost() is in-memory only — it resets on
 * every serverless cold start and isn't shared across concurrent function
 * instances, so it can't actually stop spend from running away. These
 * counters live in Postgres instead, checked before every AI call and
 * incremented after every successful one.
 *
 * Two independent caps:
 *  - per-site daily cap (Site.aiDailySpendCapUsd, falls back to
 *    AI_DEFAULT_DAILY_SPEND_CAP_USD env var)
 *  - platform-wide daily cap (AI_PLATFORM_DAILY_SPEND_CAP_USD env var) —
 *    catches the case where many merchants each stay under their own cap
 *    but combined spend is still unsustainable.
 *
 * Both checks happen before spending money; the increment happens after,
 * using Prisma's upsert (compiles to a native Postgres ON CONFLICT DO
 * UPDATE), so concurrent requests can't race past each other undercounted.
 */

import { prisma } from "@/lib/db";

const DEFAULT_SITE_DAILY_CAP_USD = Number(process.env.AI_DEFAULT_DAILY_SPEND_CAP_USD || 5);
const PLATFORM_DAILY_CAP_USD = Number(process.env.AI_PLATFORM_DAILY_SPEND_CAP_USD || 200);

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export interface SpendCapCheck {
  allowed: boolean;
  reason?: string;
}

export async function checkSpendCap(siteId: string): Promise<SpendCapCheck> {
  const date = todayUtc();

  const [site, siteUsage, platformUsage] = await Promise.all([
    prisma.site.findUnique({ where: { id: siteId }, select: { aiDailySpendCapUsd: true } }),
    prisma.aiUsageDaily.findUnique({ where: { siteId_date: { siteId, date } } }),
    prisma.aiPlatformUsageDaily.findUnique({ where: { date } }),
  ]);

  const siteCap = site?.aiDailySpendCapUsd ? Number(site.aiDailySpendCapUsd) : DEFAULT_SITE_DAILY_CAP_USD;
  const siteSpent = siteUsage ? Number(siteUsage.costUsd) : 0;
  const platformSpent = platformUsage ? Number(platformUsage.costUsd) : 0;

  if (siteSpent >= siteCap) {
    await recordBlockedRequest(siteId, date);
    return { allowed: false, reason: `Daily AI spend limit reached for this store ($${siteCap.toFixed(2)}/day). It resets at midnight UTC.` };
  }

  if (platformSpent >= PLATFORM_DAILY_CAP_USD) {
    await recordBlockedRequest(siteId, date);
    return { allowed: false, reason: "The platform-wide daily AI budget has been reached. Please try again later." };
  }

  return { allowed: true };
}

async function recordBlockedRequest(siteId: string, date: string): Promise<void> {
  await prisma.aiUsageDaily.upsert({
    where: { siteId_date: { siteId, date } },
    create: { siteId, date, blockedRequests: 1 },
    update: { blockedRequests: { increment: 1 } },
  }).catch(() => {});
}

export async function recordAiUsage(
  siteId: string,
  usage: { inputTokens: number; outputTokens: number; costUsd: number }
): Promise<void> {
  const date = todayUtc();

  await Promise.all([
    prisma.aiUsageDaily.upsert({
      where: { siteId_date: { siteId, date } },
      create: {
        siteId, date,
        requests: 1,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.costUsd,
      },
      update: {
        requests: { increment: 1 },
        inputTokens: { increment: usage.inputTokens },
        outputTokens: { increment: usage.outputTokens },
        costUsd: { increment: usage.costUsd },
      },
    }),
    prisma.aiPlatformUsageDaily.upsert({
      where: { date },
      create: { date, requests: 1, costUsd: usage.costUsd },
      update: { requests: { increment: 1 }, costUsd: { increment: usage.costUsd } },
    }),
  ]).catch((err) => console.error("Failed to record AI usage:", err));
}
