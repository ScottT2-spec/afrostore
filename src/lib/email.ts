/**
 * AWS SES Email Service for AfroStore.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    : undefined,
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@prokip.com";
const FROM_NAME = process.env.SES_FROM_NAME || "AfroStore";

// ─── Email Verification ──────────────────────────────────────────

interface VerificationEmailData {
  to: string;
  name: string;
  verifyLink: string;
}

export async function sendVerificationEmail(
  data: VerificationEmailData
): Promise<{ success: boolean; error?: string }> {
  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#0F766E;border-radius:16px 16px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#FFFFFF;margin:0;font-size:24px;">AfroStore</h1>
      <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;">Email Verification</p>
    </div>
    <div style="background:#FFFFFF;padding:30px;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#1B2B4B;font-size:16px;margin:0 0 20px;">Dear <strong>${data.name}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Thank you for creating your AfroStore account! Please verify your email address by clicking the button below:
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${data.verifyLink}" style="display:inline-block;background:#0F766E;color:#FFFFFF;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;">
          Verify Email
        </a>
      </div>
      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 10px;">
        This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
      </p>
      <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:20px 0 0;padding-top:15px;border-top:1px solid #E2E8F0;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <span style="color:#475569;word-break:break-all;">${data.verifyLink}</span>
      </p>
    </div>
    <div style="background:#F1F5F9;border-radius:0 0 16px 16px;padding:20px;text-align:center;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#94A3B8;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} AfroStore by Prokip. All rights reserved.</p>
      <p style="color:#94A3B8;font-size:11px;margin:4px 0 0;">This is an automated message. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Dear ${data.name},

Thank you for creating your AfroStore account! Please verify your email address by visiting the link below:

${data.verifyLink}

This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.

— AfroStore`;

  try {
    const command = new SendEmailCommand({
      Source: `${FROM_NAME} <${FROM_EMAIL}>`,
      Destination: { ToAddresses: [data.to] },
      Message: {
        Subject: {
          Data: "Verify Your Email — AfroStore",
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    });

    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Verification email failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── Order Confirmation Email ─────────────────────────────────────

interface OrderItem {
  name: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  total: number;
}

interface OrderConfirmationEmailData {
  to: string;
  customerName: string;
  storeName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  deliveryAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    deliveryInstructions?: string;
  };
}

function fmtCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency + " ";
  return `${symbol}${amount.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function paymentLabel(method: string): string {
  const labels: Record<string, string> = {
    PAYSTACK: "Card Payment (Paystack)",
    MONNIFY: "Bank Transfer / USSD (Monnify)",
    FLUTTERWAVE: "Flutterwave",
    PAY_ON_DELIVERY: "Pay on Delivery",
    COD: "Pay on Delivery",
  };
  return labels[method] || method;
}

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#1B2B4B;font-size:14px;">
          ${item.name}${item.variantName ? ` <span style="color:#94A3B8;">— ${item.variantName}</span>` : ""}<br/>
          <span style="color:#94A3B8;font-size:12px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#1B2B4B;font-size:14px;text-align:right;white-space:nowrap;">
          ${fmtCurrency(item.total, data.currency)}
        </td>
      </tr>`
    )
    .join("");

  const addressText = data.deliveryAddress
    ? [data.deliveryAddress.line1, data.deliveryAddress.city, data.deliveryAddress.state, data.deliveryAddress.country]
        .filter(Boolean)
        .join(", ")
    : "Not provided";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#0F766E;border-radius:16px 16px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#FFFFFF;margin:0;font-size:24px;">${data.storeName}</h1>
      <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;">Order Confirmation</p>
    </div>
    <div style="background:#FFFFFF;padding:30px;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#1B2B4B;font-size:16px;margin:0 0 8px;">Hi <strong>${data.customerName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Thank you for your order! We've received it and it's being processed.
      </p>

      <!-- Order Number -->
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;text-align:center;margin:0 0 24px;">
        <p style="color:#94A3B8;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Order Number</p>
        <p style="color:#0F766E;font-size:22px;font-weight:700;margin:0;">${data.orderNumber}</p>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:0 0 10px;color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Item</th>
            <th style="text-align:right;padding:0 0 10px;color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="margin:0 0 24px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;">
          <table style="width:100%;">
            <tr>
              <td style="color:#475569;font-size:14px;padding:4px 0;">Subtotal</td>
              <td style="color:#1B2B4B;font-size:14px;padding:4px 0;text-align:right;">${fmtCurrency(data.subtotal, data.currency)}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-size:14px;padding:4px 0;">Delivery</td>
              <td style="color:#1B2B4B;font-size:14px;padding:4px 0;text-align:right;">${data.deliveryFee === 0 ? '<span style="color:#16A34A;">Free</span>' : fmtCurrency(data.deliveryFee, data.currency)}</td>
            </tr>
            ${data.discount > 0 ? `<tr>
              <td style="color:#16A34A;font-size:14px;padding:4px 0;">Discount</td>
              <td style="color:#16A34A;font-size:14px;padding:4px 0;text-align:right;">-${fmtCurrency(data.discount, data.currency)}</td>
            </tr>` : ""}
            <tr>
              <td style="color:#1B2B4B;font-size:18px;font-weight:700;padding:12px 0 0;border-top:2px solid #E2E8F0;">Total</td>
              <td style="color:#1B2B4B;font-size:18px;font-weight:700;padding:12px 0 0;border-top:2px solid #E2E8F0;text-align:right;">${fmtCurrency(data.total, data.currency)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Details -->
      <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin:0 0 20px;">
        <table style="width:100%;">
          <tr>
            <td style="color:#94A3B8;font-size:12px;padding:4px 0;vertical-align:top;">Payment</td>
            <td style="color:#1B2B4B;font-size:13px;padding:4px 0;">${paymentLabel(data.paymentMethod)}</td>
          </tr>
          <tr>
            <td style="color:#94A3B8;font-size:12px;padding:4px 0;vertical-align:top;">Delivery to</td>
            <td style="color:#1B2B4B;font-size:13px;padding:4px 0;">${addressText}</td>
          </tr>
        </table>
      </div>

      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">
        If you have any questions about your order, please contact the store directly.
      </p>
    </div>
    <div style="background:#F1F5F9;border-radius:0 0 16px 16px;padding:20px;text-align:center;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#94A3B8;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${data.storeName} — Powered by AfroStore</p>
      <p style="color:#94A3B8;font-size:11px;margin:4px 0 0;">This is an automated message. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const itemsText = data.items
    .map((item) => `• ${item.name}${item.variantName ? ` (${item.variantName})` : ""} x${item.quantity} — ${fmtCurrency(item.total, data.currency)}`)
    .join("\n");

  const textBody = `Hi ${data.customerName},

Thank you for your order! Here are the details:

Order Number: ${data.orderNumber}

Items:
${itemsText}

Subtotal: ${fmtCurrency(data.subtotal, data.currency)}
Delivery: ${data.deliveryFee === 0 ? "Free" : fmtCurrency(data.deliveryFee, data.currency)}${data.discount > 0 ? `\nDiscount: -${fmtCurrency(data.discount, data.currency)}` : ""}
Total: ${fmtCurrency(data.total, data.currency)}

Payment: ${paymentLabel(data.paymentMethod)}
Delivery to: ${addressText}

If you have any questions, please contact the store directly.

— ${data.storeName}`;

  try {
    const command = new SendEmailCommand({
      Source: `${data.storeName} <${FROM_EMAIL}>`,
      Destination: { ToAddresses: [data.to] },
      Message: {
        Subject: {
          Data: `Order Confirmed — ${data.orderNumber}`,
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    });

    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Order confirmation email failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── Password Reset Email ────────────────────────────────────────

interface PasswordResetEmailData {
  to: string;
  name: string;
  resetLink: string;
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData
): Promise<{ success: boolean; error?: string }> {
  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#0F766E;border-radius:16px 16px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#FFFFFF;margin:0;font-size:24px;">AfroStore</h1>
      <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;">Password Reset</p>
    </div>
    <div style="background:#FFFFFF;padding:30px;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#1B2B4B;font-size:16px;margin:0 0 20px;">Dear <strong>${data.name}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px;">
        We received a request to reset your password. Click the button below to set a new password:
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${data.resetLink}" style="display:inline-block;background:#0F766E;color:#FFFFFF;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;">
          Reset Password
        </a>
      </div>
      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 10px;">
        This link expires in <strong>30 minutes</strong>. If you didn't request this, you can safely ignore this email.
      </p>
      <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:20px 0 0;padding-top:15px;border-top:1px solid #E2E8F0;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <span style="color:#475569;word-break:break-all;">${data.resetLink}</span>
      </p>
    </div>
    <div style="background:#F1F5F9;border-radius:0 0 16px 16px;padding:20px;text-align:center;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#94A3B8;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} AfroStore by Prokip. All rights reserved.</p>
      <p style="color:#94A3B8;font-size:11px;margin:4px 0 0;">This is an automated message. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Dear ${data.name},

We received a request to reset your password. Visit the link below to set a new password:

${data.resetLink}

This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.

— AfroStore`;

  try {
    const command = new SendEmailCommand({
      Source: `${FROM_NAME} <${FROM_EMAIL}>`,
      Destination: { ToAddresses: [data.to] },
      Message: {
        Subject: {
          Data: "Reset Your Password — AfroStore",
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    });

    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Password reset email failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── Generic raw send (used by campaign sending) ──────────────────

interface RawEmailData {
  to: string;
  from: string; // "Name <email@domain>"
  subject: string;
  html: string;
  text?: string;
}

export async function sendRawEmail(data: RawEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new SendEmailCommand({
      Source: data.from,
      Destination: { ToAddresses: [data.to] },
      Message: {
        Subject: { Data: data.subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: data.html, Charset: "UTF-8" },
          ...(data.text ? { Text: { Data: data.text, Charset: "UTF-8" } } : {}),
        },
      },
    });
    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Raw email send failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// ─── Newsletter Welcome Email ─────────────────────────────────────

interface NewsletterWelcomeData {
  to: string;
  storeName: string;
  storeUrl: string;
}

export async function sendNewsletterWelcomeEmail(
  data: NewsletterWelcomeData
): Promise<{ success: boolean; error?: string }> {
  const year = new Date().getFullYear();
  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#0F766E;border-radius:16px 16px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#FFFFFF;margin:0;font-size:24px;">${data.storeName}</h1>
      <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;">Welcome to our newsletter!</p>
    </div>
    <div style="background:#FFFFFF;padding:30px;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#1B2B4B;font-size:16px;margin:0 0 20px;">Hi there 👋</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Thanks for subscribing to <strong>${data.storeName}</strong>! You'll be the first to know about new products, exclusive deals, and special promotions.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${data.storeUrl}" style="display:inline-block;background:#0F766E;color:#FFFFFF;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;">
          Visit Our Store
        </a>
      </div>
      <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:20px 0 0;">
        You're receiving this because you subscribed to ${data.storeName}'s newsletter.
      </p>
    </div>
    <div style="text-align:center;padding:20px;">
      <p style="color:#94A3B8;font-size:11px;margin:0;">© ${year} ${data.storeName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Welcome to ${data.storeName}!\n\nThanks for subscribing to our newsletter. You'll be the first to know about new products, exclusive deals, and special promotions.\n\nVisit our store: ${data.storeUrl}\n\n— ${data.storeName}`;

  try {
    const command = new SendEmailCommand({
      Source: `${data.storeName} <${FROM_EMAIL}>`,
      Destination: { ToAddresses: [data.to] },
      Message: {
        Subject: {
          Data: `Welcome to ${data.storeName}! 🎉`,
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    });

    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Newsletter welcome email failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
