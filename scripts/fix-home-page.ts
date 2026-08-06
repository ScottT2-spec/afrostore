/**
 * Fix home page for dewqa site
 * 
 * Run: npx tsx scripts/fix-home-page.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Use the existing home page content from handbag site as reference
const HOME_BLOCKS = [
  {
    id: "hb-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "",
          titleLine1: "Handmade Leather",
          titleLine2: "Bags for Every Journey",
          description: "Discover our collection of handcrafted leather bags made with passion and precision.",
          buttonText: "Shop now",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "hb-features",
    type: "fashionSectionTitle",
    props: {
      subtitle: "WHY CHOOSE US",
      title: "Crafted with Excellence",
      description: "Each bag tells a story of dedication to quality and timeless design.",
      align: "center",
      maxWidth: "65%",
      marginBottom: "60px",
    },
  },
  {
    id: "hb-products",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "featured",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: { subtitle: "", title: "Featured Collection" },
      products: [],
    },
  },
];

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Fixing Home Page for dewqa\n");

  const site = await prisma.site.findFirst({
    where: { slug: "dewqa" },
    select: { id: true, slug: true },
  });

  if (!site) {
    console.log("Site not found");
    return;
  }

  const homePage = await prisma.page.findFirst({
    where: { siteId: site.id, slug: "home" },
    select: { id: true, content: true },
  });

  if (!homePage) {
    console.log("Home page not found, creating...");
    await prisma.page.create({
      data: {
        siteId: site.id,
        title: "Home",
        slug: "home",
        type: "HOME",
        content: HOME_BLOCKS as any,
        isPublished: true,
        position: 0,
      },
    });
    console.log("✅ Created home page");
  } else {
    console.log("Updating home page content...");
    await prisma.page.update({
      where: { id: homePage.id },
      data: { content: HOME_BLOCKS as any },
    });
    console.log("✅ Updated home page");
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
