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
