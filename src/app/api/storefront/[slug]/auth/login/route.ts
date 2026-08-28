import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyCustomerPassword,
  createCustomerToken,
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customer-auth";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/auth/login
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) {
    return NextResponse.json(
      { success: false, error: "Store not found" },
      { status: 404 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Keyed by store + email so one customer getting brute-forced can't be
  // used to lock out others on the same store, and an attacker rotating
  // emails on one IP still gets caught by the IP-keyed check below.
  const rlEmail = rateLimit(`storefront-login:${site.id}:${email.toLowerCase().trim()}`, 5, 15 * 60 * 1000);
  if (!rlEmail.allowed) return rateLimitedResponse(rlEmail.retryAfterMs);
  const rlIp = rateLimit(`storefront-login-ip:${getClientIp(req)}`, 20, 15 * 60 * 1000);
  if (!rlIp.allowed) return rateLimitedResponse(rlIp.retryAfterMs);

  const customer = await prisma.customer.findUnique({
    where: {
      siteId_email: { siteId: site.id, email: email.toLowerCase().trim() },
    },
  });

  if (!customer || !customer.passwordHash) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const valid = await verifyCustomerPassword(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createCustomerToken(customer.id, site.id);

  const res = NextResponse.json({
    success: true,
    data: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      token,
    },
  });

  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}
