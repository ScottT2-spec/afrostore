import { prisma } from "@/lib/db";
import { RETAIL_ABOUT_BLOCKS, RETAIL_CONTACT_BLOCKS, RETAIL_PROJECTS_BLOCKS, RETAIL_OUR_STORY_BLOCKS, RETAIL_REVIEWS_BLOCKS } from "@/lib/templates/presets/retail-pages";

/**
 * Force reset Retail template pages for all sites using Retail or Decor template
 * This script will:
 * 1. Find all sites using retail or decor template
 * 2. Update their About, Contact, Projects, Our Story, Reviews pages with the latest block presets
 * 3. Force update even if pages already have content
 * 
 * Run with: npx tsx scripts/force-reset-retail-pages.ts
 */

async function forceResetRetailPages() {
  console.log("Starting force reset of Retail template pages...");

  // Find all sites using retail or decor template
  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: {
            slug: {
              in: ["retail", "decor"],
            },
          },
        },
      },
    },
    include: {
      templates: {
        include: {
          template: true,
        },
      },
    },
  });

  console.log(`Found ${sites.length} sites using Retail/Decor template`);

  const pagePresets = {
    about: RETAIL_ABOUT_BLOCKS,
    contact: RETAIL_CONTACT_BLOCKS,
    projects: RETAIL_PROJECTS_BLOCKS,
    "our-story": RETAIL_OUR_STORY_BLOCKS,
    reviews: RETAIL_REVIEWS_BLOCKS,
  };

  let totalUpdated = 0;

  for (const site of sites) {
    console.log(`\nProcessing site: ${site.name} (${site.slug})`);
    
    const activeTemplate = site.templates.find(t => t.isActive);
    const templateSlug = activeTemplate?.template?.slug || "retail";
    
    console.log(`  Active template: ${templateSlug}`);

    for (const [pageSlug, blocks] of Object.entries(pagePresets)) {
      const existingPage = await prisma.page.findFirst({
        where: {
          siteId: site.id,
          slug: pageSlug,
        },
      });

      if (existingPage) {
        console.log(`  Updating page: ${pageSlug}`);
        await prisma.page.update({
          where: { id: existingPage.id },
          data: {
            content: { blocks },
          },
        });
        totalUpdated++;
      } else {
        console.log(`  Creating page: ${pageSlug}`);
        const pageTitles: Record<string, string> = {
          about: "About Us",
          contact: "Contact Us",
          projects: "Projects",
          "our-story": "Our Story",
          reviews: "Reviews",
        };
        
        await prisma.page.create({
          data: {
            siteId: site.id,
            title: pageTitles[pageSlug] || pageSlug,
            slug: pageSlug,
            type: "CUSTOM",
            content: { blocks },
            isPublished: true,
            position: Object.keys(pagePresets).indexOf(pageSlug) + 10,
          },
        });
        totalUpdated++;
      }
    }
  }

  console.log(`\n✅ Force reset complete. Updated ${totalUpdated} pages across ${sites.length} sites.`);
}

forceResetRetailPages()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during force reset:", error);
    process.exit(1);
  });
