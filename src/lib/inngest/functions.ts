/**
 * Inngest Background Functions
 *
 * Define background jobs here. They run asynchronously outside the request cycle.
 * Add new functions to the `allFunctions` export array.
 */
import { inngest } from "./client";
import { sendPasswordResetEmail } from "@/lib/email";

// ─── Send Password Reset Email (background) ────────────────

const sendPasswordReset = inngest.createFunction(
  { id: "send-password-reset-email", retries: 3 },
  { event: "auth/password-reset.requested" },
  async ({ event }) => {
    const { to, name, resetLink } = event.data;
    const result = await sendPasswordResetEmail({ to, name, resetLink });
    if (!result.success) {
      throw new Error(`Email failed: ${result.error}`);
    }
    return { sent: true, to };
  }
);

// ─── Export all functions for the serve handler ─────────────

export const allFunctions = [sendPasswordReset];
