import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { success, error, validationError } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { email, password, rememberMe } = parsed.data;

    const rl = rateLimit(`login:${email}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return error("Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return error("Invalid email or password", 401);
    }

    if (user.isBanned) {
      return error("Your account has been suspended. Contact support for assistance.", 403);
    }

    const token = await createToken(user.id, rememberMe ? "30d" : "1d");

    const response = success({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      rememberMe: !!rememberMe,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // Persistent cookie when remembered; omitting maxAge makes it a
      // browser-session cookie that clears when the browser closes.
      ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return error("Internal server error", 500);
  }
}
