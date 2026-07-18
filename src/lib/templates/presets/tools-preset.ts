import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Tools Template Homepage Preset
 * Verbatim from: https://woodmart.xtemos.com/demo-tools/demo/tools/
 */

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

export const TOOLS_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "tools-grid-banners",
    type: "toolsGridBanners",
    props: {
      banners: [
        { image: `${IMG}/2020/06/wood-tools-grid-banner-1-opt.jpg`, label: "SPECIAL OFFER", title: "Garden Care\nMachines and Tools", description: "To short sentences, to many headings, images too large for the proposed design.", buttonText: "Read more", buttonLink: "#", size: "large" },
        { image: `${IMG}/2020/06/wood-tools-grid-banner-2-opt.jpg`, label: "PROTECTIVE SUITS", title: "Think About Your Safety", buttonText: "Shop now", buttonLink: "#", size: "medium" },
        { image: `${IMG}/2020/06/wood-tools-grid-banner-3-opt.jpg`, label: "NEW ITEMS", title: "Circular Saw", buttonText: "Shop now", buttonLink: "#", size: "small" },
        { image: `${IMG}/2020/06/wood-tools-grid-banner-4-opt.jpg`, label: "VACUUM CLEANERS", title: "Clean in the work area", description: "It\u2019s like saying you\u2019re a bad designer, use less bold text, don\u2019t use italics in every.", size: "medium" },
      ],
    },
  },
  {
    id: "tools-features",
    type: "toolsFeatureIcons",
    props: {
      features: [
        { icon: `${IMG}/2020/06/svg-wood-tools-payment-1.svg`, title: "Online Payment", description: "Even if your less into design and more into content strategy." },
        { icon: `${IMG}/2020/06/svg-wood-tools-support-1.svg`, title: "Support 24/7", description: "Find some redeeming value with, wait for it, dummy copy, no less." },
      ],
    },
  },
  {
    id: "tools-bestsellers",
    type: "toolsProductGrid",
    props: {
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
    props: {
      backgroundImage: `${IMG}/2020/06/wood-tools-img-saw-1-opt.jpg`,
      label: "NEW CHAIN SAW",
      title: "Powerful Saw X-700",
      description: "Using dummy content or fake information in the Web design process can result in products with unrealistic.",
      buttonText: "View More",
      buttonLink: "#",
      productImage: `${IMG}/2020/07/wood-tools-img-saw-product-1.jpg`,
      products: [
        { name: "Chainsaw X-Cut C85", slug: "chainsaw-chain-x-cut-c85", price: "179.00", image: `${IMG}/2020/06/wood-tools-product-23-opt-430x500.jpg`, description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
        { name: "Engine motor MS180", slug: "engine-motor-ms180", price: "480.00", image: `${IMG}/2020/06/wood-tools-product-22-opt-430x500.jpg`, description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
        { name: "SAE 30 Engine Oil", slug: "sae-30-engine-oil", price: "129.00", image: `${IMG}/2020/06/wood-tools-product-21-opt-430x500.jpg`, description: "A ac scelerisque adipiscing a vel augue vestibulum facilisi id aptent justo sociis neque a inceptos curae." },
      ],
    },
  },
  {
    id: "tools-delivery-banner",
    type: "toolsDeliveryBanner",
    props: {
      image: `${IMG}/2020/06/wood-tools-grid-banner-5.jpg`,
      label: "SPECIAL OFFER",
      title: "Free Delivery from $300",
      description: "To sure calm much most long me mean. Able rent long in do we.",
    },
  },
  {
    id: "tools-related-products",
    type: "toolsProductGrid",
    props: {
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
    props: {},
  },
];
