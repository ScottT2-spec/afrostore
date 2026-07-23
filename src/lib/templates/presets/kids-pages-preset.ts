/**
 * Kids template page block presets
 * These blocks are used to seed the About, Contact, and Blog pages for Kids template sites
 * Content from kids-page-presets.ts
 */

export const KIDS_ABOUT_PAGE_BLOCKS = [
  {
    id: "kids-about-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 30% off for the week!",
      link: "#newsletter",
      backgroundColor: "#10c349",
    },
  },
  {
    id: "kids-about-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids",
    },
  },
  {
    id: "kids-about-hero",
    type: "kidsAboutHero",
    props: {
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
    props: {
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
    props: {
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
    props: {
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
    type: "kidsFooterFull",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids",
    },
  },
];

export const KIDS_CONTACT_PAGE_BLOCKS = [
  {
    id: "kids-contact-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 20% off for the week!",
      link: "#newsletter",
      backgroundColor: "#39a454",
    },
  },
  {
    id: "kids-contact-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids",
    },
  },
  {
    id: "kids-contact-hero",
    type: "kidsContactHero",
    props: {
      address: "413 Waystreet Road, North Carolina, United States",
      showMapLink: true,
    },
  },
  {
    id: "kids-contact-info",
    type: "kidsContactInfo",
    props: {
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
    props: {
      title: "Get in touch",
    },
  },
  {
    id: "kids-contact-hours",
    type: "kidsOpeningHours",
    props: {
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
      storeSlug: "kids",
    },
  },
  {
    id: "kids-contact-footer",
    type: "kidsFooterFull",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids",
    },
  },
];

export const KIDS_BLOG_PAGE_BLOCKS = [
  {
    id: "kids-blog-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 45% off for the week!",
      link: "#newsletter",
      backgroundColor: "#73a97b",
    },
  },
  {
    id: "kids-blog-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids",
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
    type: "kidsFooterFull",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids",
    },
  },
];
