import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "Template HTML fallback has been removed. Use the imported theme package renderer." },
    { status: 410 },
  );
}

