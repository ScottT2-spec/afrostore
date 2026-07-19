import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Toys Template Page Presets
 * Content extracted verbatim from the WoodMart Toys demo sub-pages.
 * Source: https://woodmart.xtemos.com/demo-toys/demo/toys/
 * Uses kids block types (toys template shares kids block components).
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://woodmart.xtemos.com/about-us/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "toys-about-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-about-header",
    type: "kidsHeader",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-about-hero",
    type: "kidsAboutHero",
    props: {
      subtitle: "Xtemos is a creative design agency",
      title: "Our success and company history.",
      bodyText: [
        "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
      ],
      images: [
        "https://woodmart.xtemos.com/wp-content/uploads/2017/03/about-us-gallery-photo-2.jpg",
        "https://woodmart.xtemos.com/wp-content/uploads/2017/03/about-us-gallery-photo-1.jpg",
      ],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "toys-about-story",
    type: "kidsTextSection",
    props: {
      sectionTitle: {
        subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
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
    props: {
      sectionTitle: {
        subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
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
    props: {
      sectionTitle: {
        subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
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
    props: {
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
    props: {
      sectionTitle: {
        subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
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
    props: {
      sectionTitle: {
        subtitle: "",
        title: "",
      },
      team: [
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team26.jpg",
        },
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team19.jpg",
        },
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team24.jpg",
        },
        {
          name: "Mark Jance",
          role: "CEO / Founder",
          photoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team21.jpg",
        },
      ],
    },
  },
  {
    id: "toys-about-footer",
    type: "kidsFooter",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://woodmart.xtemos.com/contact-us/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "toys-contact-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-contact-header",
    type: "kidsHeader",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-contact-hero",
    type: "kidsContactHero",
    props: {
      address: "294 Bay Meadows Ave. Bay Shore, NY 11706",
      showMapLink: true,
    },
  },
  {
    id: "toys-contact-faq",
    type: "kidsFaqSection",
    props: {
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
    props: {
      title: "Contact Us for Any Questions",
    },
  },
  {
    id: "toys-contact-footer",
    type: "kidsFooter",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://woodmart.xtemos.com/blog/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_BLOG_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "toys-blog-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-blog-header",
    type: "kidsHeader",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-blog-hero",
    type: "kidsAboutHero",
    props: {
      subtitle: "Toys Blog",
      title: "Woodmart Blog",
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
    props: {
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
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-9.jpg",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-2",
          title: "Minimalist design furniture 2026",
          slug: "minimalist-design-furniture-2016",
          excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that ...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-1.jpg",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-3",
          title: "Green interior design inspiration",
          slug: "green-interior-design-inspiration",
          excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its ...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-7.jpg",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-4",
          title: "Reinterprets the classic bookshelf",
          slug: "reinterprets-the-classic-bookshelf",
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-3.jpg",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-5",
          title: "Creative water features and exterior",
          slug: "creative-water-features-and-exterior",
          excerpt: "Adipiscing hac imperdiet id blandit varius scelerisque at sagittis libero dui dis volutpat vehicula mus sed ut. Lacinia dui rutrum...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-13.jpg",
          category: "Design trends",
          author: "S. Rogers",
          date: "Jul 23",
        },
        {
          id: "toys-blog-6",
          title: "Sweet seat: functional seat for IT folks",
          slug: "sweet-seat-multifunctional-seat-for-it-folks",
          excerpt: "Discover a world of digital art and modern design at our annual exhibition. Explore unique projects from international creators. T...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-11.jpg",
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
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://woodmart.xtemos.com/shop/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_SHOP_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "toys-shop-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-shop-header",
    type: "kidsHeader",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-shop-hero",
    type: "kidsAboutHero",
    props: {
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
    props: {
      sectionTitle: {
        subtitle: "Explore",
        title: "Shop by category",
      },
      categories: [
        {
          name: "Plush Toys",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/10/v-toy-banner-img-1-opt.jpg",
          productCount: 12,
          link: "/shop",
        },
        {
          name: "Action Figures",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/10/v-toy-banner-img-2-opt.jpg",
          productCount: 8,
          link: "/shop",
        },
        {
          name: "Building Toys",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/10/v-toy-banner-img-3-opt.jpg",
          productCount: 15,
          link: "/shop",
        },
        {
          name: "Clocks",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-9.jpg",
          productCount: 12,
          link: "/shop",
        },
        {
          name: "Lighting",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-1.jpg",
          productCount: 17,
          link: "/shop",
        },
        {
          name: "Accessories",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-7.jpg",
          productCount: 12,
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "toys-shop-grid",
    type: "kidsProductGrid",
    props: {
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
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   FAQS PAGE
   Source: https://woodmart.xtemos.com/faqs/demo/toys/
   ═══════════════════════════════════════════════════════════════ */

export const TOYS_FAQS_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "toys-faqs-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Free shipping on all orders over $50!",
      link: "#shop",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "toys-faqs-header",
    type: "kidsHeader",
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
  {
    id: "toys-faqs-hero",
    type: "kidsAboutHero",
    props: {
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
    props: {
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
    props: {
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
    props: {
      storeName: "Toys Store",
      storeSlug: "toys-store",
    },
  },
];
