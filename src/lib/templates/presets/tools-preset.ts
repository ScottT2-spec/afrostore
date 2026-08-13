import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Tools Template Homepage Preset
 * Verbatim from: https://prokip.xtemos.com/demo-tools/demo/tools/
 */

export const TOOLS_TEMPLATE_PRESET: EditorNode[] = [
  {
    id: "tools-grid-banners",
    type: "toolsGridBanners",
    settings: {
      banners: [
        { image: "https://images.unsplash.com/photo-1567361809214-b97d828071d9?w=1000&q=80&auto=format&fit=crop", label: "SPECIAL OFFER", title: "Garden Care\nMachines and Tools", description: "To short sentences, to many headings, images too large for the proposed design.", buttonText: "Read more", buttonLink: "#", size: "large" },
        { image: "https://images.unsplash.com/photo-1590635023142-73c3d34f2805?w=800&q=80&auto=format&fit=crop", label: "PROTECTIVE SUITS", title: "Think About Your Safety", buttonText: "Shop now", buttonLink: "#", size: "medium" },
        { image: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&q=80&auto=format&fit=crop", label: "NEW ITEMS", title: "Circular Saw", buttonText: "Shop now", buttonLink: "#", size: "small" },
        { image: "https://images.unsplash.com/photo-1683115098516-9b8d5c643b5b?w=800&q=80&auto=format&fit=crop", label: "VACUUM CLEANERS", title: "Clean in the work area", description: "It\u2019s like saying you\u2019re a bad designer, use less bold text, don\u2019t use italics in every.", size: "medium" },
      ],
    },
  },
  {
    id: "tools-features",
    type: "toolsFeatureIcons",
    settings: {
      features: [
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Online Payment", description: "Even if your less into design and more into content strategy." },
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Support 24/7", description: "Find some redeeming value with, wait for it, dummy copy, no less." },
      ],
    },
  },
  {
    id: "tools-bestsellers",
    type: "toolsProductGrid",
    settings: {
      sectionTitle: "Bestseller Product",
      sectionDescription: "A client that\u2019s unhappy for a reason is a problem, a client.",
      sectionButtonText: "Show All products",
      sectionButtonLink: "/shop",
      columns: 4,
      maxProducts: 8,
    },
  },
  {
    id: "tools-chainsaw-feature",
    type: "toolsFeatureSection",
    settings: {
      backgroundImage: "https://images.unsplash.com/photo-1683115099413-5b7d85c2950c?w=1200&q=80&auto=format&fit=crop",
      label: "NEW CHAIN SAW",
      title: "Powerful Saw X-700",
      description: "Using dummy content or fake information in the Web design process can result in products with unrealistic.",
      buttonText: "View More",
      buttonLink: "#",
      productImage: "https://images.unsplash.com/photo-1546827209-a218e99fdbe9?w=800&q=80&auto=format&fit=crop",
      products: [
        { name: "Chainsaw X-Cut C85", slug: "chainsaw-chain-x-cut-c85", price: "179.00", image: "https://images.unsplash.com/photo-1606676539940-12768ce0e762?w=800&q=80&auto=format&fit=crop", description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
        { name: "Engine motor MS180", slug: "engine-motor-ms180", price: "480.00", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=800&q=80&auto=format&fit=crop", description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
        { name: "SAE 30 Engine Oil", slug: "sae-30-engine-oil", price: "129.00", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80&auto=format&fit=crop", description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
      ],
    },
  },
  {
    id: "tools-delivery-banner",
    type: "toolsDeliveryBanner",
    settings: {
      image: "https://images.unsplash.com/photo-1540103711724-ebf833bde8d1?w=1200&q=80&auto=format&fit=crop",
      label: "SPECIAL OFFER",
      title: "Free Delivery from $300",
      description: "To sure calm much most long me mean. Able rent long in do we.",
    },
  },
  {
    id: "tools-related-products",
    type: "toolsProductGrid",
    settings: {
      sectionTitle: "Related Products",
      sectionDescription: "Accept that it\u2019s sometimes okay to focus just on the content.",
      sectionButtonText: "Show All products",
      sectionButtonLink: "/shop",
      columns: 4,
      maxProducts: 4,
    },
  },
  {
    id: "tools-prefooter",
    type: "toolsPreFooter",
    settings: {},
  },
];
