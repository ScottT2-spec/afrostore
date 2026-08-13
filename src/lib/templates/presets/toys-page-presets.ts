import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Toys Template Page Presets
 * Content extracted verbatim from the Prokip LTD Toys demo sub-pages.
 * Source: https://prokip.xtemos.com/demo-toys/demo/toys/
 * Uses kids block types (toys template shares kids block components).
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://prokip.xtemos.com/about-us/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "toys-about-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-about-header",
    type: "kidsHeader",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-about-hero",
    type: "kidsAboutHero",
    settings: {
      subtitle: "Xtemos is a creative design agency",
      title: "Our success and company history.",
      bodyText: [
        "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
      ],
      images: [
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop",
      ],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "toys-about-story",
    type: "kidsTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Prokip LTD - Best Ecommerce Theme 2021/22",
        title: "About Our Online Store",
      },
      bodyText: [
        "Risus suspendisse a orci penatibus a felis suscipit consectetur vestibulum sodales dui cum ultricies lacus interdum. Per suspendisse adipiscing a suspendisse auctor nibh a et at curae condimentum suspendisse enim a eu scelerisque.",
        "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff.",
        "Dictumst per ante cras suscipit nascetur ullamcorper in nullam fermentum condimentum torquent iaculis reden posuere potenti viverra condimentum dictumst id tellus suspendisse convallis condimentum.",
        "His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table \u2013 Samsa was a travelling salesman.",
        "The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \u201CWhat\u2019s happened to me?\u201D he thought. It wasn\u2019t a dream.",
      ],
      backgroundColor: "#faf8f5",
    },
  },
  {
    id: "toys-about-convert",
    type: "kidsTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Prokip LTD - Best Ecommerce Theme 2021/22",
        title: "We convert your idea Into a reality.",
      },
      bodyText: [
        "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff His room, a proper human room although a little too smalls.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "toys-about-creative",
    type: "kidsTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Prokip LTD - Best Ecommerce Theme 2021/22",
        title: "Let\u2019s Get Creative!",
      },
      bodyText: [
        "Graphic Design \u2014 Curabitur lacinia tristique velit ut laoreet.",
        "Web Design \u2014 By the readable content of a page when its layout.",
        "Branding \u2014 Fact that a reader will be distracted.",
        "Photography \u2014 The point of using Lorem Ipsum is that it has it.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "toys-about-presentation",
    type: "kidsTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Xtemos is a creative design agency",
        title: "Our Presentation",
      },
      bodyText: [
        "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
      ],
      backgroundColor: "#faf8f5",
    },
  },
  {
    id: "toys-about-quote",
    type: "kidsTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Prokip LTD - Best Ecommerce Theme 2021/22",
        title: "\u2018\u2018Excellence is not a skill it\u2019s an attitude\u2019\u2019 - Ralph Marston",
      },
      bodyText: [
        "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "toys-about-team",
    type: "kidsTeamSection",
    settings: {
      sectionTitle: {
        subtitle: "",
        title: "",
      },
      team: [
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
        },
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop",
        },
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80&auto=format&fit=crop",
        },
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80&auto=format&fit=crop",
        },
      ],
    },
  },
  {
    id: "toys-about-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://prokip.xtemos.com/contact-us/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "toys-contact-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-contact-header",
    type: "kidsHeader",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-contact-hero",
    type: "kidsContactHero",
    settings: {
      address: "294 Bay Meadows Ave. Bay Shore, NY 11706",
      showMapLink: true,
    },
  },
  {
    id: "toys-contact-faq",
    type: "kidsFaqSection",
    settings: {
      sectionTitle: {
        subtitle: "Information Questions",
        title: "Frequently Asked Questions",
      },
      subtitle: "",
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
          question: "Will you restock items indicated as \u201Cout of stock?\u201D",
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
    id: "toys-contact-form",
    type: "kidsContactForm",
    settings: {
      title: "Contact Us for Any Questions",
    },
  },
  {
    id: "toys-contact-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://prokip.xtemos.com/blog/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_BLOG_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "toys-blog-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-blog-header",
    type: "kidsHeader",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-blog-hero",
    type: "kidsAboutHero",
    settings: {
      subtitle: "Toys Blog",
      title: "Prokip LTD Blog",
      bodyText: [
        "Browse the latest Toys demo posts for styling tips, playful gift ideas, and practical guides for parents.",
      ],
      images: [],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "toys-blog-grid",
    type: "kidsBlogPosts",
    settings: {
      columns: 3,
      sectionTitle: {
        title: "Latest Articles",
      },
      posts: [
        {
          id: "toys-blog-1",
          title: "Seating collection inspiration by modern",
          slug: "seating-collection-inspiration",
          excerpt: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...",
          image: "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800&q=80&auto=format&fit=crop",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-2",
          title: "Minimalist design furniture 2026",
          slug: "minimalist-design-furniture-2016",
          excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that ...",
          image: "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?w=800&q=80&auto=format&fit=crop",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-3",
          title: "Green interior design inspiration",
          slug: "green-interior-design-inspiration",
          excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its ...",
          image: "https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&q=80&auto=format&fit=crop",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-4",
          title: "Reinterprets the classic bookshelf",
          slug: "reinterprets-the-classic-bookshelf",
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
          image: "https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=800&q=80&auto=format&fit=crop",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-5",
          title: "Creative water features and exterior",
          slug: "creative-water-features-and-exterior",
          excerpt: "Adipiscing hac imperdiet id blandit varius scelerisque at sagittis libero dui dis volutpat vehicula mus sed ut. Lacinia dui rutrum...",
          image: "https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80&auto=format&fit=crop",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-6",
          title: "Sweet seat: functional seat for IT folks",
          slug: "sweet-seat-multifunctional-seat-for-it-folks",
          excerpt: "Discover a world of digital art and modern design at our annual exhibition. Explore unique projects from international creators. T...",
          image: "https://images.unsplash.com/photo-1575881737088-a5a2bbf44e85?w=800&q=80&auto=format&fit=crop",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
      ],
    },
  },
  {
    id: "toys-blog-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://prokip.xtemos.com/shop/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_SHOP_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "toys-shop-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-shop-header",
    type: "kidsHeader",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-shop-hero",
    type: "kidsAboutHero",
    settings: {
      subtitle: "Toys Shop",
      title: "Shop",
      bodyText: [
        "Discover playful toys, action figures, and fun gifts from the Toys collection.",
      ],
      images: [],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "toys-shop-categories",
    type: "kidsCategoryCards",
    settings: {
      sectionTitle: {
        subtitle: "Explore",
        title: "Shop by category",
      },
      categories: [
        {
          name: "Plush Toys",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format&fit=crop",
          productCount: 12,
          link: "/shop",
        },
        {
          name: "Action Figures",
          image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format&fit=crop",
          productCount: 8,
          link: "/shop",
        },
        {
          name: "Building Toys",
          image: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80&auto=format&fit=crop",
          productCount: 15,
          link: "/shop",
        },
        {
          name: "Clocks",
          image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80&auto=format&fit=crop",
          productCount: 12,
          link: "/shop",
        },
        {
          name: "Lighting",
          image: "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800&q=80&auto=format&fit=crop",
          productCount: 17,
          link: "/shop",
        },
        {
          name: "Accessories",
          image: "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?w=800&q=80&auto=format&fit=crop",
          productCount: 12,
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "toys-shop-grid",
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
    id: "toys-shop-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   FAQS PAGE
   Source: https://prokip.xtemos.com/faqs/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_FAQS_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "toys-faqs-announcement",
    type: "kidsAnnouncementBar",
    settings: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-faqs-header",
    type: "kidsHeader",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-faqs-hero",
    type: "kidsAboutHero",
    settings: {
      subtitle: "Help Center",
      title: "FAQs",
      bodyText: [],
      images: [],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "toys-faqs-shopping",
    type: "kidsFaqSection",
    settings: {
      sectionTitle: {
        subtitle: "",
        title: "Shopping Information",
      },
      subtitle: "",
      faqs: [
        {
          question: "Delivery charges for orders from the Online Shop?",
          answer: "A placerat ac vestibulum integer vehicula suspendisse nostra aptent fermentum tempor a magna erat ligula parturient curae sem conubia vestibulum ac inceptos sodales condimentum cursus nunc mi consectetur condimentum. Tristique parturient nulla ullamcorper at ullamcorper non orci iaculis neque augue.",
        },
        {
          question: "How long will delivery take?",
          answer: "Parturient ullamcorper et sagittis faucibus dui eu tortor ac parturient ridiculus vel hac condimentum scelerisque libero class. Pulvinar in dictumst suspendisse ullamcorper cras cum urna eget nibh facilisi eu a vestibulum morbi porttitor platea metus vestibulum. Ante ullamcorper adipiscing.",
        },
        {
          question: "What exactly happens after ordering?",
          answer: "Parturient viverra enim torquent elit sociosqu sociis consectetur pretium suspendisse sem scelerisque risus magna est consectetur ullamcorper nunc. Porta sapien nulla maecenas quis condimentum curabitur suscipit dolor est phasellus dui sociis fringilla a dignissim quisque ullamcorper nec eu eros. Elit consectetur non parturient tempus adipiscing nullam metus.",
        },
        {
          question: "Do I receive an invoice for my order?",
          answer: "Et malesuada fermentum fames dapibus ac accumsan a varius nibh suspendisse bibendum a at fames sed nibh ullamcorper himenaeos litora egestas pulvinar at id egestas sapien mattis et eros. Scelerisque urna a leo parturient lacinia a purus hac.",
        },
        {
          question: "Tellus ridicdiam eleifend id ullamcorper?",
          answer: "Parturient sociosqu in vestibulum vivamus accumsan nam tellus curae a at a dapibus a natoque lacus vestibulum hac elementum morbi morbi maecenas eros lorem in a vestibulum imperdiet in. Adipiscing primis torquent vivamus ut a condimentum neque ac.",
        },
      ],
    },
  },
  {
    id: "toys-faqs-payment",
    type: "kidsFaqSection",
    settings: {
      sectionTitle: {
        subtitle: "",
        title: "Payment Information",
      },
      subtitle: "",
      faqs: [
        {
          question: "When the order payment is taken of my bank account?",
          answer: "Vestibulum a fringilla scelerisque ante nisl id taciti parturient praesent suscipit mi at id vestibulum cum vel purus suspendisse egestas ad aenean a penatibus urna. Dignissim senectus metus sodales euismod.",
        },
        {
          question: "What is wishlist?",
          answer: "Proin vel nunc non curabitur nullam suspendisse potenti lacinia in duis neque tempor a felis sit parturient placerat suspendisse primis. Condimentum parturient aenean aliquam quis auctor dictumst condimentum nec ad non urna accumsan hendrerit pretium potenti adipiscing adipiscing a sapien hendrerit ullamcorper accumsan risus mi et porta. Ac et condimentum potenti condimentum.",
        },
        {
          question: "What should I do if I receive a damaged or wrong product?",
          answer: "A faucibus leo auctor scelerisque sit torquent non ligula maecenas a suspendisse fermentum habitant aliquet consectetur mi ad nisl himenaeos elementum lobortis ornare ac adipiscing leo condimentum consectetur nibh laoreet. Dictum a elit ridiculus odio montes.",
        },
        {
          question: "Can I change or cancel my order?",
          answer: "Enim adipiscing commodo vestibulum condimentum parturient vulputate gravida phasellus scelerisque tellus lobortis scelerisque hac metus tincidunt mi. Vestibulum vestibulum parturient inceptos scelerisque neque a facilisis posuere sem ullamcorper scelerisque ac.",
        },
        {
          question: "What is package tracking in my orders?",
          answer: "Dignissim id a at adipiscing aptent nunc a dui dis quis est arcu parturient conubia lacinia adipiscing pulvinar nullam mi etiam leo molestie at elementum. Quis nam per sem facilisis a a parturient consectetur mauris scelerisque parturient adipiscing pretium ac eget consectetur. Condimentum nascetur sagittis eu himenaeos pharetra natoque bibendum pharetra nec vel a turpis dis phasellus ultrices sapien.",
        },
      ],
    },
  },
  {
    id: "toys-faqs-footer",
    type: "kidsFooter",
    settings: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];
