import { config } from "dotenv";
config();
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get all Kids template sites
  const kidsSites = await prisma.site.findMany({
    where: {
      status: 'ACTIVE',
      templates: {
        some: {
          template: {
            slug: {
              contains: 'kids'
            }
          }
        }
      }
    },
    include: {
      pages: true
    }
  });

  console.log(`Found ${kidsSites.length} Kids template sites`);

  // Correct Kids blog page blocks
  const correctBlogBlocks = {
    blocks: [
      {
        id: "kids-blog-announcement",
        type: "kidsAnnouncementBar",
        props: {
          text: "Sign up for our newsletter to get 10% off for the week!",
          link: "#newsletter",
          backgroundColor: "#f5857c",
        },
      },
      {
        id: "kids-blog-header",
        type: "kidsHeader",
        props: {
          storeName: "Kids Store",
          storeSlug: "kids-store",
        },
      },
      {
        id: "kids-blog-hero",
        type: "kidsAboutHero",
        props: {
          subtitle: "Kids Blog",
          title: "Ideas, stories, and cheerful inspiration",
          bodyText: [
            "Browse the latest Kids demo posts for styling tips, playful gift ideas, and practical guides for parents.",
          ],
          images: [],
          calloutText: "",
          calloutLabel: "",
        },
      },
      {
        id: "kids-blog-grid",
        type: "kidsBlogPosts",
        props: {
          columns: 3,
          sectionTitle: {
            title: "Latest Articles",
          },
          posts: [],
        },
      },
      {
        id: "kids-blog-footer",
        type: "kidsFooter",
        props: {
          storeName: "Kids Store",
          storeSlug: "kids-store",
        },
      },
    ]
  };

  for (const site of kidsSites) {
    const blogPage = site.pages.find((p: any) => p.slug === 'blog');
    
    if (blogPage) {
      console.log(`\nUpdating blog page for site: ${site.slug}`);
      
      // Check if current blocks are incorrect (homepage blocks instead of blog blocks)
      const currentContent = typeof blogPage.content === 'string' ? JSON.parse(blogPage.content) : blogPage.content;
      const hasIncorrectBlocks = currentContent.blocks?.some((b: any) => 
        b.type === 'kidsHeroSlider' || 
        b.type === 'kidsCategoryCards' || 
        b.type === 'kidsProductGrid'
      );
      
      if (hasIncorrectBlocks) {
        console.log(`  - Found incorrect blocks, updating to Kids blog blocks`);
        
        await prisma.page.update({
          where: { id: blogPage.id },
          data: {
            content: JSON.stringify(correctBlogBlocks)
          }
        });
        
        console.log(`  - Updated successfully`);
      } else {
        console.log(`  - Blocks already correct, skipping`);
      }
    } else {
      console.log(`\nNo blog page found for site: ${site.slug}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
