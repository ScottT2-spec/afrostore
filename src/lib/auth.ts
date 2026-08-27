import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "prokip-dev-secret-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(userId: string, expiresIn: string = "7d"): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || req.cookies.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Prisma calls here previously ran unguarded. If the DB is unreachable or
  // misconfigured (e.g. DATABASE_URL missing on the deployed environment),
  // this throws — and since callers invoke getAuthUser outside their own
  // try/catch, an uncaught throw here crashes the whole route handler.
  // Next/Vercel then returns its own HTML error page instead of JSON,
  // which breaks every client-side res.json() call with a
  // "JSON Parse error: Unrecognized token '<'" (the '<' of <!DOCTYPE html>).
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (err) {
    console.error("getAuthUser: failed to look up user", err);
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
