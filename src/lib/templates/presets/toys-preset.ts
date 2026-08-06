import type { EditorNode } from "@/lib/visual-editor/node-tree";

const IMG = "https://prokip.xtemos.com/wp-content/uploads";

export const TOYS_TEMPLATE_PRESET: EditorNode[] = [
  {
    id: "toys-hero",
    type: "toysHeroSlider",
          settings: {
        autoplaySpeed: 5000,
      },
      elements: [
        {
          id: "toys-hero-slide-1",
          type: "slide",
          settings:           {
            "titleLine1": "Guardian",
            "titleLine2": "Of The Galaxy.",
            "description": "Official Marvel movie action figures.",
            "buttonText": "SHOP NOW",
            "buttonLink": "#",
            "backgroundColor": "#1a1a2e",
            "productImage": "/prokip-logo.png",
            "backgroundImage": "/prokip-logo.png"
          },
          elements: [],
        },
        {
          id: "toys-hero-slide-2",
          type: "slide",
          settings:           {
            "titleLine1": "Star Wars",
            "titleLine2": "Toy Figures.",
            "description": "There are many variations of passages.",
            "buttonText": "SHOP NOW",
            "buttonLink": "#",
            "backgroundColor": "#0f3460",
            "productImage": "/prokip-logo.png",
            "backgroundImage": "/prokip-logo.png"
          },
          elements: [],
        },
        {
          id: "toys-hero-slide-3",
          type: "slide",
          settings:           {
            "titleLine1": "Toy Story",
            "titleLine2": "Action Figures.",
            "description": "There are many variations of passages.",
            "buttonText": "SHOP NOW",
            "buttonLink": "#",
            "backgroundColor": "#e94560",
            "productImage": "/prokip-logo.png",
            "backgroundImage": "/prokip-logo.png"
          },
          elements: [],
        }
      ],
  },
  {
    id: "toys-banners",
    type: "toysBannerCards",
    settings: {
      cards: [
        { label: "Disney", title: "Soft Toys.", image: `${IMG}/2018/10/v-toy-banner-img-1-opt.jpg`, link: "#" },
        { label: "Movies", title: "Hector Toy.", image: `${IMG}/2018/10/v-toy-banner-img-2-opt.jpg`, link: "#" },
        { label: "Lego", title: "Big Sale.", image: `${IMG}/2018/10/v-toy-banner-img-3-opt.jpg`, link: "#" },
      ],
    },
  },
  {
    id: "toys-video-welcome",
    type: "toysVideoWelcome",
    settings: {
      videoThumbnail: `${IMG}/2018/10/v-toy-video-img-opt.jpg`,
      videoUrl: "https://www.youtube.com/watch?v=XHOmBV4js_E",
      subtitle: "Curabitur aliquet quam",
      title: "Welcome to our shop",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.",
    },
  },
  {
    id: "toys-features",
    type: "toysFeaturesBar",
    settings: {
      features: [
        { icon: `${IMG}/2018/02/v-toy-shape-1.svg`, title: "Free Shipping", description: "It is a long established fact that a reader will be." },
        { icon: `${IMG}/2018/02/v-toy-shape-2.svg`, title: "Support 24", description: "Various versions have evolved over." },
        { icon: `${IMG}/2018/02/v-toy-shape-3.svg`, title: "Easy Payment", description: "Quisque velit nisi, pretium ut lacinia in." },
      ],
    },
  },
  {
    id: "toys-age-categories",
    type: "toysAgeCategories",
    settings: {
      subtitle: "Choose your category",
      title: "Kids' Toys by Age",
      categories: [
        { label: "2 Years Old", image: `${IMG}/2018/02/v-toy-categ-img-circle.png`, link: "#" },
        { label: "2-5 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-2.png`, link: "#" },
        { label: "5-8 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-3.png`, link: "#" },
        { label: "8-13 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-4.png`, link: "#" },
        { label: "13-16 Year Olds", image: `${IMG}/2018/02/v-toy-categ-img-circle-5.png`, link: "#" },
      ],
    },
  },
  {
    id: "toys-best-selling",
    type: "toysProductGrid",
    settings: {
      sectionSubtitle: "Our most popular",
      sectionTitle: "Best Selling Toys",
      sectionDescription: "There are many variations of passages of lorem ipsum available.",
      tabs: ["Plush toys", "Action Figures", "Building toys"],
      columns: 4,
      maxProducts: 8,
    },
  },
  {
    id: "toys-limited-offer",
    type: "toysLimitedOffer",
    settings: {
      subtitle: "Don't miss your chance",
      title: "Limited Time Offer",
      description: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of lorem ipsum, you need to be sure.",
      productImage: `${IMG}/2018/02/v-toy-product-left.png`,
      ctaText: "Buy now",
      ctaLink: "#",
    },
  },
  {
    id: "toys-reviews",
    type: "toysTestimonials",
    settings: {
      subtitle: "Check our latest",
      title: "Customer Reviews",
      testimonials: [
        { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: `${IMG}/2018/02/v-toys-testimon-100x100.jpg` },
        { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: `${IMG}/2018/02/v-toy-testimonials-portrait-2-100x100.jpg` },
        { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: `${IMG}/2018/02/v-toy-testimonials-portrait-3-100x100.jpg` },
      ],
    },
  },
  {
    id: "toys-featured",
    type: "toysProductGrid",
    settings: {
      sectionSubtitle: "Our most popular",
      sectionTitle: "Featured Store Items",
      sectionDescription: "There are many variations of passages of lorem ipsum available.",
      columns: 4,
      maxProducts: 8,
      marginBottom: "0",
    },
  },
  {
    id: "toys-newsletter",
    type: "toysNewsletter",
    settings: {
      title: "Join our mailing list to receive any latest updates and promotions",
    },
  },
];
