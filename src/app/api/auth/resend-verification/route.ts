import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Always return generic success to prevent enumeration
    const successResponse = NextResponse.json({
      message: "If an account exists with this email, a verification link will be sent.",
    });

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, firstName: true, emailVerified: true, emailVerifyTokenExpiry: true },
    });

    // If user doesn't exist or already verified, return generic success
    if (!user || user.emailVerified) return successResponse;

    // Rate limit: if token was issued less than 1 hour ago, reject
    if (
      user.emailVerifyTokenExpiry &&
      user.emailVerifyTokenExpiry.getTime() > Date.now() + 23 * 60 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Please wait before requesting another verification email." },
        { status: 429 }
      );
    }

    // Generate new token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyTokenExpiry },
    });

    // Build verify link and send email
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `https://${req.headers.get("host")}`;
    const verifyLink = `${baseUrl}/auth/verify-email?token=${emailVerifyToken}`;

    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.firstName,
      verifyLink,
    });

    if (!emailResult.success) {
      console.error(
        `Resend verification email failed for ${normalizedEmail}:`,
        emailResult.error
      );
    }

    return successResponse;
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
