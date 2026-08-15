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
            "backgroundImage": "https://images.unsplash.com/photo-1623334044303-241021148842?w=800&q=80&auto=format&fit=crop",
            "productImage": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80&auto=format&fit=crop",
            "smallImage": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&auto=format&fit=crop"
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
            "backgroundImage": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80&auto=format&fit=crop",
            "productImage": "https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=800&q=80&auto=format&fit=crop",
            "smallImage": "https://images.unsplash.com/photo-1534432182912-63863115e106?w=800&q=80&auto=format&fit=crop"
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
            "backgroundImage": "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80&auto=format&fit=crop",
            "productImage": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800&q=80&auto=format&fit=crop",
            "smallImage": "https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=800&q=80&auto=format&fit=crop"
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
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "Cupcakes",
          description: "There are some redeeming factors in favor of greeking text",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "Macaroons",
          description: "Merely the symptom of a worse problem to consideration",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
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
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&auto=format&fit=crop",
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
      backgroundImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80&auto=format&fit=crop",
      products: [],
    },
  },
  {
    id: "bakery-process",
    type: "bakeryProcess",
    settings: {
      sectionTitle: "How We Made Donuts",
      sectionSubtitle: "We Love What We Do",
      image: "https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=800&q=80&auto=format&fit=crop",
      steps: [
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "1. Ingredients",
          description: "Chances are there wasn\u2019t collaboration, communication.",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "2. Stuffing",
          description: "There wasn\u2019t a process agreed upon or specified with.",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "3. Cooking",
          description: "But that\u2019s not all that it takes to get things back on track.",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
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
      backgroundImage: "https://images.unsplash.com/photo-1599819055803-717bba43890f?w=800&q=80&auto=format&fit=crop",
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
      paymentIconsUrl: "https://images.unsplash.com/photo-1623334044303-241021148842?w=800&q=80&auto=format&fit=crop",
    },
  },
];
