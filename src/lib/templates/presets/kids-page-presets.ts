import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Kids Template Page Presets
 * Using new rich content block types with EXACT content from hardcoded JSX
 * Content extracted verbatim from page components - no placeholders
 */

export const KIDS_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "kids-about-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Sign up for our newsletter to get 30% off for the week!",
      link: "#newsletter",
      backgroundColor: "#10c349",
    },
  },
  {
    id: "kids-about-header",
    type: "kidsHeader",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-about-hero",
    type: "kidsAboutHero",
    settings: {
      subtitle: "About Us",
      title: "Discover Favorites for Every Little One",
      bodyText: [
        "Our shelves are filled with carefully selected clothing, toys, and accessories that make every day a little brighter. From newborn essentials to playful finds, every item is chosen for its quality, comfort, and lasting value.",
        "Whether you're shopping for your own child or searching for the perfect gift, you'll find something special for every stage of childhood.",
      ],
      images: [
        "/uploads/kids_images/About.webp",
        "/uploads/kids_images/Bblogz.webp",
      ],
      calloutText: "We handpick every item for its quality, safety, and playful charm, ensuring every collection meets the needs of modern parents and curious little explorers.",
      calloutLabel: "Meet the team",
    },
  },
  {
    id: "kids-about-team",
    type: "kidsTeamSection",
    settings: {
      sectionTitle: {
        subtitle: "",
        title: "",
      },
      team: [
        { name: "Sally Coulibaly", role: "Director" },
        { name: "Rebecca Davina", role: "Marketing strategist" },
        { name: "Jarelle Fateh", role: "Product designer" },
        { name: "Khalisto Arielle", role: "CEO" },
      ],
    },
  },
  {
    id: "kids-about-how-we-work",
    type: "kidsTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Why Parents Choose Us",
        title: "What we Do",
      },
      bodyText: [
        "We carefully select every product with children and parents in mind, focusing on quality, comfort, and everyday practicality. From trendy outfits and educational toys to must-have accessories, each item is chosen to bring happiness, value, and confidence to every purchase.",
        "Our goal is to create a simple and enjoyable shopping experience from start to finish. With thoughtfully curated collections, trusted products, and friendly service, we help families find everything their little ones need in one convenient place.",
      ],
      backgroundColor: "#faf8f5",
    },
  },
  {
    id: "kids-about-faq",
    type: "kidsFaqSection",
    settings: {
      sectionTitle: {
        subtitle: "What You'll Find",
        title: "Baby Love",
      },
      subtitle: "Discover a carefully curated collection of children's clothing, toys, accessories, and everyday essentials designed to make growing up more fun.",
      faqs: [
        {
          question: "Are your products safe for children?",
          answer: "Yes. We carefully source products from trusted manufacturers that meet recognized safety and quality standards, giving parents confidence with every purchase.",
        },
        {
          question: "How long does shipping take?",
          answer: "Most orders are processed quickly and shipped within a few business days. Delivery times may vary depending on your location and the shipping option you choose.",
        },
        {
          question: "What's the best size to buy for a baby shower gift?",
          answer: "A great choice is 3–6 months or 6–12 months, as babies often outgrow newborn sizes very quickly. These sizes give parents something practical for the months ahead while ensuring your gift gets plenty of use.",
        },
      ],
    },
  },
  {
    id: "kids-about-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];

export const KIDS_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "kids-contact-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Sign up for our newsletter to get 20% off for the week!",
      link: "#newsletter",
      backgroundColor: "#39a454",
    },
  },
  {
    id: "kids-contact-header",
    type: "kidsHeader",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-contact-hero",
    type: "kidsContactHero",
    settings: {
      address: "413 Waystreet Road, North Carolina, United States",
      showMapLink: true,
    },
  },
  {
    id: "kids-contact-info",
    type: "kidsContactInfo",
    settings: {
      phone: "(097) 330-1233",
      hours: "9:00am - 5:00pm",
      days: "Monday - Friday",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
        youtube: "#",
      },
      showMapLink: true,
    },
  },
  {
    id: "kids-contact-form",
    type: "kidsContactForm",
    settings: {
      title: "Get in touch",
    },
  },
  {
    id: "kids-contact-hours",
    type: "kidsOpeningHours",
    settings: {
      title: "Monday - Friday",
      hours: [
        { label: "Hours", value: "9:00am - 5:00pm" },
        { label: "Support", value: "(064) 332-1233" },
        { label: "Address", value: "North Carolina, MO" },
      ],
      infoText: "Technology made for Good. Prokip Africa.",
      links: [
        { label: "Visit the blog", href: "/blog" },
        { label: "Shop the collection", href: "/shop" },
      ],
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-contact-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];

export const KIDS_BLOG_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "kids-blog-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Sign up for our newsletter to get 45% off for the week!",
      link: "#newsletter",
      backgroundColor: "#73a97b",
    },
  },
  {
    id: "kids-blog-header",
    type: "kidsHeader",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-blog-grid",
    type: "kidsBlogPosts",
    settings: {
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
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];

export const KIDS_SHOP_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "kids-shop-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Sign up for our newsletter to get 30% off for the week!",
      link: "#newsletter",
      backgroundColor: "#d0d85f",
    },
  },
  {
    id: "kids-shop-header",
    type: "kidsHeader",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-shop-hero",
    type: "kidsAboutHero",
    settings: {
      subtitle: "Kids Shop",
      title: "All Products",
      bodyText: [
        "Discover everyday essentials to make your kid shine this season from the Kids collection.",
      ],
      images: [],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "kids-shop-categories",
    type: "kidsCategoryCards",
    settings: {
      sectionTitle: {
        subtitle: "Shop",
        title: "Shop by category",
      },
      categories: [
        { name: "Jumpsuits", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=400&fit=crop", productCount: 12, link: "/shop" },
        { name: "Jumpers", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=400&fit=crop", productCount: 8, link: "/shop" },
        { name: "Toys", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=400&fit=crop", productCount: 15, link: "/shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1566454419290-57a0589c9b17?w=300&h=400&fit=crop", productCount: 10, link: "/shop" },
        { name: "Dresses", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=400&fit=crop", productCount: 9, link: "/shop" },
        { name: "Warm Leggings", image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=300&h=400&fit=crop", productCount: 7, link: "/shop" },
      ],
    },
  },
  {
    id: "kids-shop-grid",
    type: "kidsProductGrid",
    settings: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      sectionTitle: {
        title: "Products",
      },
    },
  },
  {
    id: "kids-shop-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];
