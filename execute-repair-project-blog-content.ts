import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { RETAIL_PROJECT_DETAIL_BLOCKS } from "./src/lib/templates/presets/retail-pages";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const PROJECT_SLUGS = [
  "project-look-deep-into-nature",
  "project-just-living-is-not-enough",
  "project-adopt-the-pace-of-nature",
  "project-go-along-with-nature",
];

interface TransformResult {
  content: { text: string };
  contentHtml: string;
  coverImage: string;
  loggedUnhandled: string[];
}

function transformBlocksToBlogContent(blocks: any[], projectSlug: string): TransformResult {
  let bodyText = "";
  let htmlContent = "";
  let coverImage = "";
  const loggedUnhandled: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "hero":
        coverImage = block.props.bgImage || "";
        htmlContent += `<h1>${block.props.heading}</h1>`;
        if (block.props.subheading) {
          htmlContent += `<p class="subheading">${block.props.subheading}</p>`;
        }
        break;

      case "heading":
        const level = block.props.level || "h2";
        const headingTag = level.startsWith("h") ? level : "h2";
        htmlContent += `<${headingTag}>${block.props.text}</${headingTag}>`;
        bodyText += `${block.props.text}\n\n`;
        break;

      case "text":
        bodyText += block.props.text + "\n\n";
        htmlContent += `<div class="content">${block.props.text.replace(/\n/g, '<br>')}</div>`;
        break;

      case "gallery":
        if (block.props.images && Array.isArray(block.props.images)) {
          htmlContent += `<div class="gallery">`;
          for (const img of block.props.images) {
            htmlContent += `<img src="${img.src}" alt="${img.alt || ''}" />`;
          }
          htmlContent += `</div>`;
        }
        break;

      case "spacer":
        htmlContent += `<div style="height: ${block.props.height || 40}px;"></div>`;
        break;

      default:
        const warning = `[${projectSlug}] Unhandled block type: ${block.type}`;
        if (!loggedUnhandled.includes(warning)) {
          console.log(warning);
          loggedUnhandled.push(warning);
        }
        break;
    }
  }

  return {
    content: { text: bodyText.trim() },
    contentHtml: htmlContent,
    coverImage: coverImage,
    loggedUnhandled,
  };
}

async function executeRepair() {
  console.log("=== EXECUTING REPAIR ACROSS ALL 8 SITES ===\n");

  // Find all Retail/Decor sites
  const retailSites = await prisma.site.findMany({
    where: {
      status: "ACTIVE",
      templates: {
        some: {
          template: {
            slug: { in: ["retail", "decor"] },
          },
          isActive: true,
        },
      },
    },
  });

  console.log(`Found ${retailSites.length} Retail/Decor sites\n`);

  for (const site of retailSites) {
    console.log(`Processing site: ${site.slug} (${site.id})`);

    for (const projectSlug of PROJECT_SLUGS) {
      // Get the authoritative source content
      const sourceBlocks = RETAIL_PROJECT_DETAIL_BLOCKS[projectSlug];
      if (!sourceBlocks) {
        console.log(`  - ${projectSlug}: No source blocks found (skipping)`);
        continue;
      }

      // Transform the blocks
      const result = transformBlocksToBlogContent(sourceBlocks, projectSlug);

      // Find the blog post
      const blog = await prisma.blog.findUnique({
        where: {
          siteId_slug: {
            siteId: site.id,
            slug: projectSlug,
          },
        },
      });

      if (!blog) {
        console.log(`  - ${projectSlug}: Blog post not found (skipping)`);
        continue;
      }

      // Update the blog post
      await prisma.blog.update({
        where: { id: blog.id },
        data: {
          content: result.content,
          contentHtml: result.contentHtml,
          coverImage: result.coverImage,
        },
      });

      console.log(`  - ${projectSlug}: Updated successfully`);
    }

    console.log(`\n---\n`);
  }

  console.log("REPAIR COMPLETE - All 8 sites updated");
}

executeRepair()
  .then(() => {
    console.log("Repair finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Repair failed:", error);
    process.exit(1);
  });
