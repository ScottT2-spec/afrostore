import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashCustomerPassword,
  createCustomerToken,
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customer-auth";
import { rateLimit, rateLimitedResponse, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/auth/register
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) {
    return NextResponse.json(
      { success: false, error: "Store not found" },
      { status: 404 }
    );
  }

  // IP-keyed since there's no existing account to key against yet — this
  // is what stops a script from mass-creating customer accounts on a store.
  const rl = rateLimit(`storefront-register:${getClientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, password, firstName, lastName, phone } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      {
        success: false,
        error: "Email, password, first name, and last name are required",
      },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Check if customer already exists for this store
  const existing = await prisma.customer.findUnique({
    where: { siteId_email: { siteId: site.id, email: email.toLowerCase().trim() } },
  });

  if (existing) {
    if (existing.passwordHash) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Customer exists from a guest checkout — set their password to upgrade the account
    const passwordHash = await hashCustomerPassword(password);
    const updated = await prisma.customer.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        firstName: existing.firstName || firstName,
        lastName: existing.lastName || lastName,
        phone: phone || existing.phone,
      },
    });

    const token = await createCustomerToken(updated.id, site.id);

    const res = NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        token,
      },
    });

    res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return res;
  }

  // Create new customer
  const passwordHash = await hashCustomerPassword(password);
  const customer = await prisma.customer.create({
    data: {
      siteId: site.id,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      passwordHash,
    },
  });

  const token = await createCustomerToken(customer.id, site.id);

  const res = NextResponse.json(
    {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        token,
      },
    },
    { status: 201 }
  );

  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}
