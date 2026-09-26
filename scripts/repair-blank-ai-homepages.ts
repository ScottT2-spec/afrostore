/**
 * Repair script: finds AI-built sites whose HOME page has zero
 * renderable blocks — a blank live homepage with the header still
 * showing — and regenerates that page with the now-fixed generator
 * (buildDynamicHomePage, same one used at creation + background
 * enrichment since the consolidation fix). This does NOT prevent the
 * bug (already fixed for new sites); it repairs sites that were
 * created before the fix and are stuck with broken content in the DB.
 *
 * Run: npx tsx scripts/repair-blank-ai-homepages.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { parsePageContent } from "../src/lib/page-content";
import { buildTemplatePageContent } from "../src/lib/templates/template-tree";
import { buildDynamicHomePage } from "../src/lib/ai-layout-engine";
import { getRandomIndustryImages } from "../src/lib/ai-image-pools";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL environment variable is not set");
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  const homePages = await prisma.page.findMany({
    where: { type: "HOME", template: "ai" },
    include: { site: { select: { id: true, name: true, slug: true, businessType: true } } },
  });

  console.log(`Checking ${homePages.length} AI-built home page(s)...`);

  let repaired = 0;
  for (const page of homePages) {
    const blocks = parsePageContent(page.content).blocks;
    if (blocks.length > 0) continue; // not broken, skip

    const site = page.site;
    const industry = site.businessType || "general";
    const homeBlocks = buildDynamicHomePage({}, site.name, site.slug, industry, getRandomIndustryImages(industry));

    await prisma.page.update({
      where: { id: page.id },
      data: { content: buildTemplatePageContent(homeBlocks as unknown as Record<string, unknown>[], {}) as any },
    });

    console.log(`  Repaired: ${site.name} (${site.slug})`);
    repaired++;
  }

  console.log(`Done. ${repaired} blank home page(s) repaired out of ${homePages.length} checked.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
