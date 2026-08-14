import type { EditorNode } from "@/lib/visual-editor/node-tree";

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
            "productImage": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
            "backgroundImage": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop"
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
            "productImage": "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80&auto=format&fit=crop",
            "backgroundImage": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80&auto=format&fit=crop"
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
            "productImage": "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800&q=80&auto=format&fit=crop",
            "backgroundImage": "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?w=800&q=80&auto=format&fit=crop"
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
        { label: "Disney", title: "Soft Toys.", image: "https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&q=80&auto=format&fit=crop", link: "#" },
        { label: "Movies", title: "Hector Toy.", image: "https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=800&q=80&auto=format&fit=crop", link: "#" },
        { label: "Lego", title: "Big Sale.", image: "https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80&auto=format&fit=crop", link: "#" },
      ],
    },
  },
  {
    id: "toys-video-welcome",
    type: "toysVideoWelcome",
    settings: {
      videoThumbnail: "https://images.unsplash.com/photo-1575881737088-a5a2bbf44e85?w=1000&q=80&auto=format&fit=crop",
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
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Free Shipping", description: "It is a long established fact that a reader will be." },
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Support 24", description: "Various versions have evolved over." },
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Easy Payment", description: "Quisque velit nisi, pretium ut lacinia in." },
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
        { label: "2 Years Old", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80&auto=format&fit=crop", link: "#" },
        { label: "2-5 Year Olds", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80&auto=format&fit=crop", link: "#" },
        { label: "5-8 Year Olds", image: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=400&q=80&auto=format&fit=crop", link: "#" },
        { label: "8-13 Year Olds", image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80&auto=format&fit=crop", link: "#" },
        { label: "13-16 Year Olds", image: "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=400&q=80&auto=format&fit=crop", link: "#" },
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
      productImage: "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?w=800&q=80&auto=format&fit=crop",
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
        { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop" },
        { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80&auto=format&fit=crop" },
        { text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.", avatar: "https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=200&q=80&auto=format&fit=crop" },
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
