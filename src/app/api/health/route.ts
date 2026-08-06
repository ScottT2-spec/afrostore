import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/monitoring";

/**
 * Health check endpoint for uptime monitoring services.
 * GET /api/health → { status: "ok", timestamp, uptime }
 */
export async function GET() {
  return NextResponse.json(getHealthStatus());
}
