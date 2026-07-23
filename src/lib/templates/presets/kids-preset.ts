import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Kids Template Preset
 * Recreates the WoodMart Kids demo layout with editable blocks.
 */
export const KIDS_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "kids-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 30% off for the week!",
      link: "#newsletter",
    },
  },
  {
    id: "kids-hero",
    type: "kidsHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "1020px",
      slides: [
        {
          title: "Made for Little Moments That Matter",
          description: "Timeless children's fashion crafted with premium fabrics, playful details, and lasting comfort for every stage of childhood.",
          buttonText: "Discover More",
          buttonLink: "/shop",
          backgroundImage: "/uploads/kids_images/Kids-heroback.webp",
          colorScheme: "dark",
        },
        {
          title: "Everyday Comfort, Everyday Joy",
          description: "Explore charming collections of clothing and essentials designed to keep little ones happy, comfortable, and ready for every adventure.",
          buttonText: "View Collection",
          buttonLink: "/shop",
          backgroundImage: "/uploads/kids_images/About.webp",
          colorScheme: "dark",
}
      ],
    },
  },
  {
    id: "kids-categories",
    type: "kidsCategoryCards",
    props: {
      sectionTitle: {
        subtitle: "Toys and accessories",
        title: "Shop by category",
      },
      categories: [
        { name: "Jumpsuits", image: "/uploads/kids_images/growsuit.webp", productCount: 12, link: "/shop" },
        { name: "Jumpers", image: "/uploads/kids_images/jumper.webp", productCount: 8, link: "/shop" },
        { name: "Toys", image: "/uploads/kids_images/toys.webp", productCount: 15, link: "/shop" },
        { name: "Animals", image: "/uploads/kids_images/animals.webp", productCount: 10, link: "/shop" },
        { name: "Dresses", image: "/uploads/kids_images/dresses.webp", productCount: 9, link: "/shop" },
        { name: "Gifts", image: "/uploads/kids_images/gifts.webp", productCount: 7, link: "/shop" },
      ],
    },
  },
  {
    id: "kids-featured",
    type: "kidsProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "",
        title: "Feature collection",
      },
      products: [],
    },
  },
  {
    id: "kids-bundle",
    type: "kidsBundlePromo",
    props: {
      subtitle: "Buy bundle and get a 30% discount",
      title: "Warm and Comfortable clothes set for your baby",
      description: "Buy this set and save 30%. Discounts and promotions are seasonal.",
      buttonText: "Buy bundle now",
      buttonLink: "/shop",
      productImages: [
        "/uploads/kids_images/gifts.webp",
        "/uploads/kids_images/gift.webp",
        "/uploads/kids_images/About2.webp",
      ],
      backgroundColor: "#87a9be",
    },
  },
  {
    id: "kids-popular",
    type: "kidsProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "bestseller",
      sectionTitle: {
        title: "Popular products",
      },
      products: [],
    },
  },
  {
    id: "kids-blog",
    type: "kidsBlogPosts",
    props: {
      columns: 3,
      sectionTitle: {
        title: "Our Articles",
      },
      posts: [],
    },
  },
  {
    id: "kids-instagram",
    type: "kidsInstagram",
    props: {
      sectionTitle: {
        title: "@Prokip_kids Our instagram",
      },
      items: [],
    },
  },
  {
    id: "kids-newsletter",
    type: "kidsNewsletter",
    props: {
      title: "Join our mailing list to receive any latest updates and promotions",
      buttonText: "Subscribe",
      backgroundColor: "#faf8f5",
    },
  },
];
