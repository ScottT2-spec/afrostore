/**
 * Automation engine.
 *
 * The dashboard at /dashboard/automations lets a merchant create automations
 * (trigger -> one or more actions) and stores them via the CRUD routes under
 * /api/sites/[siteId]/automations. Until now nothing ever *ran* them — this
 * module is what's called from the real trigger points (order creation,
 * payment webhooks, CRM contact creation, ...) to find matching active
 * automations, execute their actions in order, and write an AutomationLog
 * so the "Recent Executions" panel in the UI has something to show.
 *
 * Usage from a trigger point:
 *   await runAutomationsForTrigger(siteId, "new_order", { order, site });
 *
 * This is intentionally fire-and-forget friendly: callers should NOT await
 * this in the hot path of a user-facing request when it can be avoided —
 * wrap it in `.catch(...)` the same way sendOrderConfirmationEmail already
 * is, so a slow webhook or bad SMTP config never blocks checkout.
 */

import { prisma } from "@/lib/db";
import { sendRawEmail } from "@/lib/email";
import { sendSms, isSmsConfigured } from "@/lib/sms";
import { sendWhatsAppMessage, isWhatsAppConfigured } from "@/lib/whatsapp";

export type AutomationTriggerType =
  | "new_order"
  | "new_lead"
  | "abandoned_cart"
  | "payment_success"
  | "form_submission"
  | "product_purchase"
  | "visitor_activity"
  | "schedule";

export type AutomationActionType =
  | "send_email"
  | "send_sms"
  | "send_whatsapp"
  | "create_task"
  | "assign_user"
  | "add_crm_tag"
  | "ai_response"
  | "webhook"
  | "delay";

interface AutomationAction {
  type: AutomationActionType;
  config?: Record<string, unknown>;
}

/**
 * Context passed in from the trigger point. Only the fields relevant to the
 * trigger need to be populated — action handlers below check for what they
 * need and skip gracefully (recording a failed log entry) if it's missing.
 */
export interface AutomationTriggerContext {
  siteId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  crmContactId?: string;
  subject?: string;
  message?: string;
  // Raw payload for webhook forwarding / template interpolation / logs.
  data: Record<string, unknown>;
}

function matchesConditions(conditions: Record<string, unknown> | undefined, data: Record<string, unknown>): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;
  // Simple equality match on top-level fields of the trigger payload —
  // e.g. { minTotal: 50000 } is intentionally not handled here since each
  // trigger's condition shape can differ; this covers the common
  // field-equals case (e.g. { status: "vip" }) and can be extended per
  // trigger type as more condition UIs are added to the editor.
  return Object.entries(conditions).every(([key, value]) => data[key] === value);
}

function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
    const value = path.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, data);
    return value === undefined || value === null ? "" : String(value);
  });
}

async function runAction(
  action: AutomationAction,
  ctx: AutomationTriggerContext
): Promise<{ ok: boolean; detail: string }> {
  const cfg = action.config || {};

  switch (action.type) {
    case "send_email": {
      const to = (cfg.to as string) || ctx.recipientEmail;
      if (!to) return { ok: false, detail: "No recipient email available" };
      const subject = interpolate((cfg.subject as string) || ctx.subject || "Notification", ctx.data);
      const html = interpolate((cfg.body as string) || ctx.message || "", ctx.data);
      const res = await sendRawEmail({ to, from: (cfg.from as string) || "noreply@prokip.com", subject, html });
      return res.success ? { ok: true, detail: `Email sent to ${to}` } : { ok: false, detail: res.error || "Email send failed" };
    }

    case "send_sms": {
      if (!isSmsConfigured()) return { ok: false, detail: "SMS provider not configured" };
      const to = (cfg.to as string) || ctx.recipientPhone;
      if (!to) return { ok: false, detail: "No recipient phone available" };
      const body = interpolate((cfg.message as string) || ctx.message || "", ctx.data);
      const res = await sendSms(to, body);
      return res.success ? { ok: true, detail: `SMS sent to ${to}` } : { ok: false, detail: res.error || "SMS send failed" };
    }

    case "send_whatsapp": {
      if (!isWhatsAppConfigured()) return { ok: false, detail: "WhatsApp provider not configured" };
      const to = (cfg.to as string) || ctx.recipientPhone;
      if (!to) return { ok: false, detail: "No recipient phone available" };
      const body = interpolate((cfg.message as string) || ctx.message || "", ctx.data);
      const res = await sendWhatsAppMessage(to, body, cfg.mediaUrl as string | undefined);
      return res.success ? { ok: true, detail: `WhatsApp sent to ${to}` } : { ok: false, detail: res.error || "WhatsApp send failed" };
    }

    case "add_crm_tag": {
      const tag = cfg.tag as string;
      if (!tag) return { ok: false, detail: "No tag specified in action config" };
      if (!ctx.crmContactId) return { ok: false, detail: "No CRM contact associated with this trigger" };
      await prisma.crmContact.update({
        where: { id: ctx.crmContactId },
        data: { tags: { push: tag } },
      });
      return { ok: true, detail: `Tagged contact with "${tag}"` };
    }

    case "create_task": {
      // There's no dedicated Task model yet — record it as a CRM activity
      // so it's visible on the contact timeline, same place other
      // touchpoints show up.
      const title = interpolate((cfg.title as string) || "Follow up", ctx.data);
      if (!ctx.crmContactId) return { ok: false, detail: "No CRM contact associated with this trigger" };
      await prisma.crmActivity.create({
        data: { contactId: ctx.crmContactId, type: "task", details: { title, ...cfg } as any },
      });
      return { ok: true, detail: `Task "${title}" created` };
    }

    case "webhook": {
      const url = cfg.url as string;
      if (!url) return { ok: false, detail: "No webhook URL specified in action config" };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: ctx.data }),
      });
      return res.ok
        ? { ok: true, detail: `Webhook delivered (${res.status})` }
        : { ok: false, detail: `Webhook responded ${res.status}` };
    }

    case "delay": {
      // A real queued delay needs a durable scheduler (e.g. an Inngest
      // step.sleep) so the wait survives server restarts — sleeping inline
      // here would block the request. Flagged as not-yet-implemented
      // rather than silently pretending to wait.
      return { ok: false, detail: "Delay action requires the scheduled-job runner and isn't wired up yet" };
    }

    case "assign_user": {
      return { ok: false, detail: "Team assignment isn't wired up yet — no assignee field exists on CRM contacts" };
    }

    case "ai_response": {
      return { ok: false, detail: "AI response action isn't wired up yet" };
    }

    default:
      return { ok: false, detail: `Unknown action type: ${action.type}` };
  }
}

/**
 * Find every active automation on a site matching this trigger type, run
 * their actions in order, and write an AutomationLog + bump
 * triggerCount/lastTriggeredAt. Safe to call even if nothing matches.
 */
export async function runAutomationsForTrigger(
  siteId: string,
  triggerType: AutomationTriggerType,
  ctx: Omit<AutomationTriggerContext, "siteId">
): Promise<void> {
  const fullCtx: AutomationTriggerContext = { siteId, ...ctx };

  const automations = await prisma.automation.findMany({
    where: { siteId, isActive: true },
  });

  const matching = automations.filter((a: { trigger: unknown }) => {
    const trigger = a.trigger as { type: string; conditions?: Record<string, unknown> };
    return trigger.type === triggerType && matchesConditions(trigger.conditions, fullCtx.data);
  });

  for (const automation of matching) {
    const actions = (automation.actions as unknown as AutomationAction[]) || [];
    const results: Array<{ type: string; ok: boolean; detail: string }> = [];
    let hadFailure = false;

    for (const action of actions) {
      try {
        const res = await runAction(action, fullCtx);
        results.push({ type: action.type, ...res });
        if (!res.ok) hadFailure = true;
      } catch (err) {
        hadFailure = true;
        results.push({ type: action.type, ok: false, detail: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    await prisma.$transaction([
      prisma.automationLog.create({
        data: {
          automationId: automation.id,
          status: hadFailure ? (results.some((r) => r.ok) ? "partial" : "failed") : "success",
          triggerData: fullCtx.data as any,
          result: results as any,
          error: hadFailure ? results.filter((r) => !r.ok).map((r) => `${r.type}: ${r.detail}`).join("; ") : null,
        },
      }),
      prisma.automation.update({
        where: { id: automation.id },
        data: { triggerCount: { increment: 1 }, lastTriggeredAt: new Date() },
      }),
    ]);
  }
}
