/**
 * Backfill script: marks pages on existing AI-built sites with
 * `template: "ai"` so the storefront header-detection fix (contact/about/
 * home rendering the hardcoded HandmadeBagsHeader instead of no header)
 * applies retroactively, not just to sites created after this fix.
 *
 * `launchMethod` is a request param, never persisted on Site — there is
 * no direct "this site was AI-built" column to read. The reliable
 * heuristic instead: a site with zero SiteTemplate rows never went
 * through the template-import path (importTemplateToSite always creates
 * one), so any HOME/ABOUT/FAQ/CONTACT/POLICY page on such a site is an
 * AI page by elimination.
 *
 * Run: npx tsx scripts/backfill-ai-page-template.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  const sitesWithNoTemplate = await prisma.site.findMany({
    where: { templates: { none: {} } },
    select: { id: true, name: true, slug: true },
  });

  console.log(`Found ${sitesWithNoTemplate.length} site(s) with no SiteTemplate row (candidates for AI backfill).`);

  let pagesUpdated = 0;
  for (const site of sitesWithNoTemplate) {
    const result = await prisma.page.updateMany({
      where: {
        siteId: site.id,
        type: { in: ["HOME", "ABOUT", "FAQ", "CONTACT", "POLICY"] },
        template: { not: "ai" },
      },
      data: { template: "ai" },
    });
    if (result.count > 0) {
      console.log(`  ${site.name} (${site.slug}): marked ${result.count} page(s)`);
      pagesUpdated += result.count;
    }
  }

  console.log(`Done. ${pagesUpdated} page(s) backfilled across ${sitesWithNoTemplate.length} site(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
