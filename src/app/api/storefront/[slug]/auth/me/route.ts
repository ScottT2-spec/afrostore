import { NextRequest, NextResponse } from "next/server";
import { getAuthCustomer, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";

// GET /api/storefront/:slug/auth/me
export async function GET(req: NextRequest) {
  const customer = await getAuthCustomer(req);

  if (!customer) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      totalOrders: customer.totalOrders,
      totalSpent: Number(customer.totalSpent),
    },
  });
}

// DELETE /api/storefront/:slug/auth/me — logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
