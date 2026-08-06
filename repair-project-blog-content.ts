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
        // Spacer blocks don't contribute to content
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

async function dryRunRepair() {
  console.log("=== DRY-RUN MODE: dfregtt site only ===\n");

  const site = await prisma.site.findUnique({
    where: { slug: "dfregtt" },
  });

  if (!site) {
    console.log("Site not found");
    return;
  }

  console.log(`Site: ${site.slug} (${site.id})\n`);

  for (const projectSlug of PROJECT_SLUGS) {
    console.log(`--- ${projectSlug} ---`);

    // Get the authoritative source content
    const sourceBlocks = RETAIL_PROJECT_DETAIL_BLOCKS[projectSlug];
    if (!sourceBlocks) {
      console.log(`ERROR: No source blocks found in retail-pages.ts\n`);
      continue;
    }

    // Transform the blocks
    const result = transformBlocksToBlogContent(sourceBlocks, projectSlug);

    console.log(`Cover Image: ${result.coverImage}`);
    console.log(`\nContent (plain text):`);
    console.log(result.content.text);
    console.log(`\nContentHtml (FULL):`);
    console.log(result.contentHtml);
    console.log(`\nUnhandled block types: ${result.loggedUnhandled.length > 0 ? result.loggedUnhandled.join(", ") : "none"}`);
    console.log(`\n---\n`);
  }

  console.log("DRY-RUN COMPLETE - No changes made to database");
}

dryRunRepair()
  .then(() => {
    console.log("Dry-run finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Dry-run failed:", error);
    process.exit(1);
  });
