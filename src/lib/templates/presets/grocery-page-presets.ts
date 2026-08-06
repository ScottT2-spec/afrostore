import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Grocery Template Page Presets
 * Content extracted verbatim from the Prokip LTD Grocery demo sub-pages.
 * Source: https://prokip.xtemos.com/demo-grocery/demo/grocery/
 * Uses grocery block types registered in GroceryTemplateBlocks.tsx.
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://prokip.xtemos.com/about-us/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "grocery-about-hero",
    type: "groceryAboutHero",
    settings: {
      subtitle: "Xtemos is a creative design agency",
      title: "Our success and company history.",
      bodyText: [
        "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
      ],
      images: [
        "/prokip-logo.png",
        "/prokip-logo.png",
      ],
      ctaText: "Learn More",
      ctaLink: "#",
    },
  },
  {
    id: "grocery-about-story",
    type: "groceryTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Prokip LTD - Best Ecommerce Theme 2021/22",
        title: "About Our Online Store",
      },
      bodyText: [
        "Risus suspendisse a orci penatibus a felis suscipit a parturient enim a adipiscing a vestibulum sed magna a urna eget vestibulum a metus. Scelerisque ut a viverra nisl semper a porttitor purus pretium ullamcorper a hac a adipiscing amet interdum a adipiscing nulla.",
        "A mus posuere a et a adipiscing suspendisse integer sit a mollis sem id pretium netus a nam vestibulum vestibulum a a snc mi accumsan. Ullamcorper vestibulum a scelerisque quisque a dignissim suscipit a vestibulum a mollis sagittis a discimus.",
        "Condimentum a scelerisque id parturient ullamcorper a penatibus a ultrices a a adipiscing vestibulum rhoncus nam vestibulum. Ullamcorper vestibulum a scelerisque quisque a dignissim a vestibulum a mollis sagittis.",
        "Adipiscing suspendisse integer sit a mollis sem id pretium netus a nam vestibulum vestibulum a mi accumsan. Parturient condimentum a scelerisque id parturient ullamcorper a penatibus ultrices adipiscing vestibulum rhoncus nam vestibulum.",
        "A mus posuere a et a adipiscing suspendisse integer sit a mollis sem id pretium netus a nam vestibulum vestibulum a snc mi accumsan ullamcorper vestibulum a scelerisque quisque a dignissim.",
      ],
      backgroundColor: "#f9f9f9",
    },
  },
  {
    id: "grocery-about-convert",
    type: "groceryTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Prokip LTD - Best Ecommerce Theme 2021/22",
        title: "We convert your idea Into a reality.",
      },
      bodyText: [
        "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "grocery-about-team",
    type: "groceryTeamSection",
    settings: {
      sectionTitle: {
        subtitle: "The Team",
        title: "Our Creative Team",
      },
      team: [
        { name: "Mark Jance", role: "CEO / Founder", photoUrl: "/prokip-logo.png" },
        { name: "Mark Jance", role: "CEO / Founder", photoUrl: "/prokip-logo.png" },
        { name: "Mark Jance", role: "CEO / Founder", photoUrl: "/prokip-logo.png" },
        { name: "Mark Jance", role: "CEO / Founder", photoUrl: "/prokip-logo.png" },
      ],
    },
  },
  {
    id: "grocery-about-newsletter",
    type: "groceryNewsletter",
    settings: {
      title: "Hey you, sign up and connect to Prokip LTD!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-about-footer",
    type: "groceryFooter",
    settings: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://prokip.xtemos.com/contact-us/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "grocery-contact-hero",
    type: "groceryContactHero",
    settings: {
      subtitle: "Our Stores",
      title: "Visit Our New Store In New York",
      address: "294 Bay Meadows Ave. Bay Shore, NY 11706",
    },
  },
  {
    id: "grocery-contact-faq",
    type: "groceryFaqSection",
    settings: {
      sectionTitle: {
        subtitle: "Information Questions",
        title: "Frequently Asked Questions",
      },
      faqs: [
        {
          question: "Will I receive the same product that I see in the picture?",
          answer: "Consectetur cras scelerisque dis nec mi vestibulum ullamcorper turpis enim natoque tempus a malesuada suspendisse iaculis adipiscing himenaeos tincidunt. Tellus pharetra dis nostra urna a scelerisque id parturient ullamcorper ullamcorper class ad consectetur tristique et. Hendrerit mollis facilisi odio a montes scelerisque a scelerisque justo a praesent conubia aenean mi tempor.",
        },
        {
          question: "Where can I view my sales receipt?",
          answer: "A vel dui a conubia vestibulum class varius vel nunc a gravida ut maecenas quisque a proin condimentum sagittis class at faucibus primis parturient dolor scelerisque himenaeos. A et ullamcorper vestibulum netus a mauris ac consectetur libero volutpat congue congue turpis a consectetur adipiscing sit. Suspendisse leo fringilla a congue tempus nisi conubia vestibulum a in posuere accumsan.",
        },
        {
          question: "How can I return an item?",
          answer: "Sit rhoncus aptent dis scelerisque penatibus a dis tempor accumsan suspendisse mollis a et odio ullamcorper magnis ullamcorper cum ullamcorper duis nulla egestas massa. Vitae amet nostra est leo dignissim justo sodales et ac a conubia bibendum duis ad justo suspendisse a a tellus cubilia vestibulum a dictumst a duis risus. Sociosqu curae consequat nisl litora a eros est consectetur nulla rhoncus a a id felis praesent. Tempus dui integer a cursus id fames parturient.",
        },
        {
          question: "Will you restock items indicated as \u2018out of stock?\u2019",
          answer: "Scelerisque parturient sagittis nisi in aliquam dui scelerisque non consectetur aptent hac adipiscing ullamcorper pulvinar sit vestibulum purus facilisi hendrerit mus nisl massa ut parturient consectetur cum justo fames torquent. Ac curae aliquet vivamus aptent duis congue urna venenatis ridiculus faucibus tincidunt a lorem rutrum nullam potenti adipiscing. Adipiscing.",
        },
        {
          question: "Where can I ship my order?",
          answer: "Ut bibendum a adipiscing purus massa a facilisi congue parturient condimentum urna donec per adipiscing cursus nisl nam tristique parturient id. Aliquam quam at et in ipsum at venenatis a eget dignissim aliquam tincidunt ultrices lacus ad consectetur imperdiet sem suspendisse ante a dapibus potenti. Eu parturient parturient magnis tempus molestie augue quam vulputate hac facilisis est nisl pretium a cursus.",
        },
      ],
    },
  },
  {
    id: "grocery-contact-form",
    type: "groceryContactForm",
    settings: {
      title: "Contact Us For Any Questions",
    },
  },
  {
    id: "grocery-contact-footer",
    type: "groceryFooter",
    settings: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://prokip.xtemos.com/blog/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_BLOG_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "grocery-blog-grid",
    type: "groceryBlogGrid",
    settings: {
      sectionTitle: "Prokip LTD Blog",
      posts: [
        {
          id: 1,
          title: "Seating collection inspiration by modern",
          slug: "seating-collection-inspiration",
          image: "/prokip-logo.png",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
          excerpt: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...",
        },
        {
          id: 2,
          title: "Minimalist design furniture 2026",
          slug: "minimalist-design-furniture",
          image: "/prokip-logo.png",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
          excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that ...",
        },
        {
          id: 3,
          title: "Green interior design inspiration",
          slug: "green-interior-design",
          image: "/prokip-logo.png",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
          excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its ...",
        },
        {
          id: 4,
          title: "Reinterprets the classic bookshelf",
          slug: "reinterprets-classic-bookshelf",
          image: "/prokip-logo.png",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
        },
        {
          id: 5,
          title: "Creative water features and exterior",
          slug: "creative-water-features",
          image: "/prokip-logo.png",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
          excerpt: "Adipiscing hac imperdiet id blandit varius scelerisque at sagittis libero dui dis volutpat vehicula mus sed ut. Lacinia dui rutrum...",
        },
        {
          id: 6,
          title: "Sweet seat: functional seat for IT folks",
          slug: "sweet-seat-functional",
          image: "/prokip-logo.png",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
          excerpt: "Discover a world of digital art and modern design at our annual exhibition. Explore unique projects from international creators. T...",
        },
      ],
    },
  },
  {
    id: "grocery-blog-newsletter",
    type: "groceryNewsletter",
    settings: {
      title: "Hey you, sign up and connect to Prokip LTD!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-blog-footer",
    type: "groceryFooter",
    settings: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://prokip.xtemos.com/shop/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_SHOP_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "grocery-shop-title",
    type: "grocerySectionTitle",
    settings: {
      subtitle: "",
      title: "Shop",
      align: "center",
    },
  },
  {
    id: "grocery-shop-categories",
    type: "groceryCategoryGrid",
    settings: {
      sectionTitle: "Popular Categories",
      categories: [
        { name: "Fruits", slug: "fruits", image: "/prokip-logo.png", productCount: 12 },
        { name: "Vegetables", slug: "vegetables", image: "/prokip-logo.png", productCount: 15 },
        { name: "Dairy", slug: "dairy", image: "/prokip-logo.png", productCount: 8 },
        { name: "Bakery", slug: "bakery", image: "/prokip-logo.png", productCount: 10 },
      ],
      columns: 4,
    },
  },
  {
    id: "grocery-shop-products",
    type: "groceryProductGrid",
    settings: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      sectionTitle: {
        title: "All Products",
      },
    },
  },
  {
    id: "grocery-shop-newsletter",
    type: "groceryNewsletter",
    settings: {
      title: "Hey you, sign up and connect to Prokip LTD!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-shop-footer",
    type: "groceryFooter",
    settings: {},
  },
];
