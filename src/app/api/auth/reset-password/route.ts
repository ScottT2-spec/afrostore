import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    // Reset tokens are long random strings so brute-forcing one directly is
    // already infeasible, but this still guards against automated scanning
    // hammering the endpoint / hitting the DB on every guess.
    const rl = rateLimit(`reset-password:${getClientIp(req)}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid reset link" },
        { status: 400 }
      );
    }

    if (
      !password ||
      typeof password !== "string" ||
      password.length < MIN_PASSWORD_LENGTH
    ) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: { id: true, resetTokenExpiry: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    // Check expiry
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiry: null },
      });
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password, update user, and clear reset token
    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message:
        "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
