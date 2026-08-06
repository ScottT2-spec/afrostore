import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Bakery (Sweets Bakery) Template Preset
 * Recreates the Prokip LTD Sweets Bakery demo layout with editable blocks.
 */
export const BAKERY_TEMPLATE_PRESET: EditorNode[] = [
  {
    id: "bakery-hero",
    type: "bakeryHeroSlider",
          settings: {
        autoplaySpeed: 5000
      },
      elements: [
        {
          id: "bakery-hero-slide-1",
          type: "slide",
          settings:           {
            "subtitle": "Crispy and Delicate",
            "titleLine1": "BELGIAN",
            "titleLine2": "WAFFLES",
            "buttonText": "See Collection",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "productImage": "/prokip-logo.png",
            "smallImage": "/prokip-logo.png"
          },
          elements: [],
        },
        {
          id: "bakery-hero-slide-2",
          type: "slide",
          settings:           {
            "subtitle": "A Tasty and Light Dessert",
            "titleLine1": "ALMOND",
            "titleLine2": "MAFFINS",
            "buttonText": "See Collection",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "productImage": "/prokip-logo.png",
            "smallImage": "/prokip-logo.png"
          },
          elements: [],
        },
        {
          id: "bakery-hero-slide-3",
          type: "slide",
          settings:           {
            "subtitle": "It Is Worth Tasting",
            "titleLine1": "SWEET",
            "titleLine2": "DONUTS",
            "buttonText": "See Collection",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "productImage": "/prokip-logo.png",
            "smallImage": "/prokip-logo.png"
          },
          elements: [],
        }
      ],
  },
  {
    id: "bakery-categories",
    type: "bakeryCategoryInfoBoxes",
    settings: {
      sectionTitle: "Our Fine Home-Made Chocolate",
      sectionSubtitle: "Sweets Bakery",
      items: [
        {
          icon: "/prokip-logo.png",
          title: "Cupcakes",
          description: "There are some redeeming factors in favor of greeking text",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "/prokip-logo.png",
          title: "Macaroons",
          description: "Merely the symptom of a worse problem to consideration",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "/prokip-logo.png",
          title: "Cakes",
          description: "You sculpt information, you chisel away what\u2019s not needed",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "bakery-handmade",
    type: "bakeryHandmade",
    settings: {
      subtitle: "Sweets Bakery",
      title: "Handmade Cakes\nFor Your Every Taste",
      description: "Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers toolbox.",
      image: "/prokip-logo.png",
      buttonText: "See Collection",
      buttonLink: "/shop",
    },
  },
  {
    id: "bakery-products",
    type: "bakeryProductGrid",
    settings: {
      columns: 3,
      maxProducts: 6,
      sectionTitle: "Featured Products",
      sectionSubtitle: "Sweet Accessories",
      backgroundImage: "/prokip-logo.png",
      products: [],
    },
  },
  {
    id: "bakery-process",
    type: "bakeryProcess",
    settings: {
      sectionTitle: "How We Made Donuts",
      sectionSubtitle: "We Love What We Do",
      image: "/prokip-logo.png",
      steps: [
        {
          icon: "/prokip-logo.png",
          title: "1. Ingredients",
          description: "Chances are there wasn\u2019t collaboration, communication.",
        },
        {
          icon: "/prokip-logo.png",
          title: "2. Stuffing",
          description: "There wasn\u2019t a process agreed upon or specified with.",
        },
        {
          icon: "/prokip-logo.png",
          title: "3. Cooking",
          description: "But that\u2019s not all that it takes to get things back on track.",
        },
        {
          icon: "/prokip-logo.png",
          title: "4. Dish Ready",
          description: "The villagers are out there with a vengeance to get that.",
        },
      ],
    },
  },
  {
    id: "bakery-blog",
    type: "bakeryBlogPosts",
    settings: {
      columns: 4,
      sectionTitle: "Our New Articles",
      sectionSubtitle: "Sweets Bakery",
      posts: [],
    },
  },
  {
    id: "bakery-cta",
    type: "bakeryCta",
    settings: {
      title: "Do You Like the Theme?",
      subtitle: "Share With Your Friends!",
      buttonText: "Buy Now",
      buttonLink: "/shop",
      backgroundImage: "/prokip-logo.png",
    },
  },
  {
    id: "bakery-footer", type: "bakeryFooter",
    settings: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        fax: "(099) 453-1357",
      },
      recentPosts: [],
      linkColumns: [
        { title: "OUR STORES", links: [{ label: "New York", url: "#" }, { label: "London SF", url: "#" }, { label: "Edinburgh", url: "#" }, { label: "Los Angeles", url: "#" }, { label: "Chicago", url: "#" }, { label: "Las Vegas", url: "#" }] },
        { title: "USEFUL LINKS", links: [{ label: "Privacy Policy", url: "#" }, { label: "Returns", url: "#" }, { label: "Terms & Conditions", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
        { title: "FOOTER MENU", links: [{ label: "Instagram profile", url: "#" }, { label: "New Collection", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
      ],
      copyrightText: "",
      paymentIconsUrl: "/prokip-logo.png",
    },
  },
];
