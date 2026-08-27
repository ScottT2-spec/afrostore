/**
 * Customer authentication utilities.
 * Separate from merchant auth (src/lib/auth.ts) to avoid collisions.
 * Uses the same JWT secret but different claims (customerId + siteId).
 * Cookie name: "customer_token" (vs merchant "token").
 */
import { NextRequest } from "next/server";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "prokip-dev-secret-change-in-production"
);

const COOKIE_NAME = "customer_token";

export async function hashCustomerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyCustomerPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createCustomerToken(
  customerId: string,
  siteId: string
): Promise<string> {
  return new SignJWT({ customerId, siteId, type: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyCustomerToken(
  token: string
): Promise<{ customerId: string; siteId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "customer") return null;
    return { customerId: payload.customerId as string, siteId: payload.siteId as string };
  } catch {
    return null;
  }
}

export async function getAuthCustomer(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token =
    authHeader?.replace("Bearer ", "") ||
    req.cookies.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyCustomerToken(token);
  if (!payload) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: payload.customerId },
    select: {
      id: true,
      siteId: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      totalOrders: true,
      totalSpent: true,
      createdAt: true,
    },
  });

  if (!customer || customer.siteId !== payload.siteId) return null;

  return customer;
}

export { COOKIE_NAME as CUSTOMER_COOKIE_NAME };
