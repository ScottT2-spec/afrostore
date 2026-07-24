import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const RESET_TOKEN_EXPIRY_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const rl = rateLimit(`forgot:${normalizedEmail}`, 3, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) return successResponse;

    // Generate secure token and set expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    // Save token and expiry on user record
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Build reset link
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `https://${req.headers.get("host")}`;
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.firstName,
      resetLink,
    });

    if (!emailResult.success) {
      console.error(
        `Password reset email failed for ${normalizedEmail}:`,
        emailResult.error
      );
    }

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
