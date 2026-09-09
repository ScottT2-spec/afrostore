import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Called from middleware (Edge runtime, no direct Prisma access) to decide
// whether to route a slug to the AI-published storefront or the normal
// page-builder one. Cheap, indexed lookup, no auth (returns nothing
// sensitive — just a boolean + storage path).
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ codeGen: false });

  const site = await prisma.site.findFirst({
    where: { OR: [{ slug }, { customDomain: slug }] },
    select: { codeGenPublished: true, codeGenBuildPath: true },
  });

  return NextResponse.json({
    codeGen: !!site?.codeGenPublished,
    buildPath: site?.codeGenBuildPath || null,
  });
}
