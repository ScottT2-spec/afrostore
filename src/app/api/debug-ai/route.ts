import { NextResponse } from "next/server";
import { generateStore } from "@/lib/ai-store-generator";
import { prisma } from "@/lib/db";

export const maxDuration = 60;

export async function GET() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, businessType: true, country: true, currency: true },
    });
    if (!store) return NextResponse.json({ error: "no stores" }, { status: 404 });

    const result = await generateStore({
      storeId: store.id,
      storeSlug: store.slug,
      storeName: store.name,
      businessType: store.businessType || "general",
      country: store.country || "NG",
      currency: store.currency || "NGN",
    });

    return NextResponse.json({ success: true, pages: result.pages.length, provider: result.provider });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.slice(0, 800) }, { status: 500 });
  }
}
