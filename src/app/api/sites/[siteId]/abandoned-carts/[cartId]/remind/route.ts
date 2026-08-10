import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { sendAbandonedCartReminder } from "@/lib/abandoned-cart";

type Params = { params: Promise<{ siteId: string; cartId: string }> };

// POST — actually send a recovery reminder for this cart (email and/or
// WhatsApp, whichever contact info is on file), then record that it was
// sent. This is the real implementation behind the dashboard's "Send
// Reminder" button - it used to just flip a status flag with nothing
// actually going out.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, cartId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const cart = await prisma.abandonedCart.findUnique({ where: { id: cartId } });
  if (!cart || cart.siteId !== siteId) return error("Cart not found", 404);
  if (cart.status === "RECOVERED") return error("This cart was already recovered", 400);
  if (!cart.email && !cart.phone) return error("This cart has no email or phone on file to send to", 400);

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { name: true, slug: true, customDomain: true, currency: true },
  });
  if (!site) return error("Store not found", 404);

  const { sent, results } = await sendAbandonedCartReminder(cart, site);

  if (!sent) {
    const message = results.map((r) => r.error).filter(Boolean).join("; ") || "No delivery channel succeeded";
    return error(message, 502);
  }

  const updated = await prisma.abandonedCart.update({
    where: { id: cartId },
    data: {
      status: "REMINDED",
      remindersSent: cart.remindersSent + 1,
      lastReminderAt: new Date(),
    },
  });

  return success({ cart: updated, results });
}
