import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Kids Template Preset
 * Recreates the Prokip LTD Kids demo layout with editable blocks.
 */
export const KIDS_TEMPLATE_PRESET: EditorNode[] = [
  {
    id: "kids-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Sign up for our newsletter to get 30% off for the week!",
      link: "#newsletter",
    },
  },
  {
    id: "kids-hero",
    type: "kidsHeroSlider",
          settings: {
        autoplaySpeed: 5000,
      minHeight: "1020px"
      },
      elements: [
        {
          id: "kids-hero-slide-1",
          type: "slide",
          settings:           {
            "title": "Made for Little Moments That Matter",
            "description": "Timeless children's fashion crafted with premium fabrics, playful details, and lasting comfort for every stage of childhood.",
            "buttonText": "Discover More",
            "buttonLink": "/shop",
            "backgroundImage": "/uploads/kids_images/Kids-heroback.webp",
            "colorScheme": "dark"
          },
          elements: [],
        },
        {
          id: "kids-hero-slide-2",
          type: "slide",
          settings:           {
            "title": "Everyday Comfort, Everyday Joy",
            "description": "Explore charming collections of clothing and essentials designed to keep little ones happy, comfortable, and ready for every adventure.",
            "buttonText": "View Collection",
            "buttonLink": "/shop",
            "backgroundImage": "/uploads/kids_images/About.webp",
            "colorScheme": "dark"
          },
          elements: [],
        }
      ],
  },
  {
    id: "kids-categories",
    type: "kidsCategoryCards",
    settings: {
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
    settings: {
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
    settings: {
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
    settings: {
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
    settings: {
      columns: 3,
      sectionTitle: {
        title: "Our Articles",
      },
      posts: [
        {
          image: "/uploads/kids_images/Bblog1.webp",
          title: "How to Choose the Perfect Outfit for Your Little One",
          excerpt: "Finding the right clothing for your child doesn't have to be stressful. Here are our top tips for choosing comfortable, stylish outfits that kids actually love wearing.",
          date: { day: "28", month: "Jul" },
          categories: ["Fashion Tips"],
          author: { name: "Scott Antwi" },
          link: "/blog",
          commentCount: 5,
        },
        {
          image: "/uploads/kids_images/Bblog2.webp",
          title: "Top 10 Gift Ideas for Kids This Holiday Season",
          excerpt: "Stuck on what to get the little ones? From educational toys to cozy outfits, we've rounded up the best gifts that will make any child's face light up.",
          date: { day: "25", month: "Jul" },
          categories: ["Gift Guide"],
          author: { name: "Scott Antwi" },
          link: "/blog",
          commentCount: 12,
        },
        {
          image: "/uploads/kids_images/Bblog3.webp",
          title: "Why Organic Fabrics Matter for Children's Clothing",
          excerpt: "Your child's skin is sensitive. Learn why choosing organic, chemical-free fabrics can make a real difference in comfort and health for growing kids.",
          date: { day: "20", month: "Jul" },
          categories: ["Parenting"],
          author: { name: "Scott Antwi" },
          link: "/blog",
          commentCount: 8,
        },
      ],
    },
  },
  {
    id: "kids-instagram",
    type: "kidsInstagram",
    settings: {
      sectionTitle: {
        title: "@Prokip_kids Our instagram",
      },
      items: [],
    },
  },
  {
    id: "kids-newsletter",
    type: "kidsNewsletter",
    settings: {
      title: "Join our mailing list to receive any latest updates and promotions",
      buttonText: "Subscribe",
      backgroundColor: "#faf8f5",
    },
  },
];
