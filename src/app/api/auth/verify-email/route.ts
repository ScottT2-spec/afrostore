import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`verify-email:${getClientIp(req)}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { emailVerifyToken: token },
      select: { id: true, emailVerifyTokenExpiry: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Check expiry
    if (!user.emailVerifyTokenExpiry || user.emailVerifyTokenExpiry < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: null, emailVerifyTokenExpiry: null },
      });
      return NextResponse.json(
        { error: "This verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
