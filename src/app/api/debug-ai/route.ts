import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateStore } from "@/lib/ai-store-generator";

export const maxDuration = 60;

export async function GET() {
  try {
    // Get a real store to test with
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, businessType: true, country: true, currency: true },
    });

    if (!store) {
      return NextResponse.json({ error: "No stores found" }, { status: 404 });
    }

    // Test the full generation flow
    const result = await generateStore({
      storeId: store.id,
      storeSlug: store.slug,
      storeName: store.name,
      businessType: store.businessType || "general",
      country: store.country || "NG",
      currency: store.currency || "NGN",
    });

    return NextResponse.json({ success: true, pages: result.pages, provider: result.provider, model: result.model });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message, 
      stack: e.stack?.slice(0, 1000),
      name: e.constructor?.name,
    }, { status: 500 });
  }
}
