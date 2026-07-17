import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Bakery (Sweets Bakery) Template Page Presets
 * Content extracted verbatim from the WoodMart Sweets Bakery demo pages.
 * Source: https://woodmart.xtemos.com/demo-sweets-bakery/demo/sweets-bakery/
 *
 * The bakery demo shares WoodMart's generic about/contact/blog page layouts
 * with fashion, so we use fashion block types for shared content sections
 * and bakery block types where bakery-specific components exist.
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://woodmart.xtemos.com/about-us/demo/sweets-bakery/
   ═══════════════════════════════════════════════════════════════ */

export const BAKERY_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "bakery-about-hero",
    type: "fashionSectionTitle",
    props: {
      subtitle: "XTEMOS IS A CREATIVE DESIGN AGENCY",
      title: "Our success and company history.",
      description: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "0px",
    },
  },
  {
    id: "bakery-about-hero-ctas",
    type: "fashionAboutContent",
    props: {
      layout: "ctas-only",
      buttons: [
        { text: "SEE PROJECTS", link: "/portfolio" },
        { text: "VIEW MORE", link: "#" },
      ],
    },
  },
  {
    id: "bakery-about-story",
    type: "fashionAboutContent",
    props: {
      layout: "text-with-badge",
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      title: "About Our Online Store",
      paragraphs: [
        "Risus suspendisse a orci penatibus a felis suscipit consectetur vestibulum sodales dui cum ultricies lacus interdum. Per suspendisse adipiscing a suspendisse auctor nibh a et at curae condimentum suspendisse enim a eu scelerisque.",
        "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff.",
        "Dictumst per ante cras suscipit nascetur ullamcorper in nullam fermentum condimentum torquent iaculis reden posuere potenti viverra condimentum dictumst id tellus suspendisse convallis condimentum.",
        "His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table – Samsa was a travelling salesman.",
        "The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \"What's happened to me?\" he thought. It wasn't a dream.",
      ],
      attribution: "Developed by Xtemos Studio @ 2022.",
    },
  },
  {
    id: "bakery-about-stats",
    type: "fashionStatsCounters",
    props: {
      counters: [
        { value: 0, label: "SATISFIED CLIENTS" },
        { value: 0, label: "FINISHED PROJECTS" },
        { value: 0, label: "TEAM MEMBERS" },
        { value: 0, label: "OFFICES" },
        { value: 0, label: "SATISFIED CLIENTS" },
        { value: 0, label: "DESIGN WORKS" },
      ],
    },
  },
  {
    id: "bakery-about-convert",
    type: "fashionAboutContent",
    props: {
      layout: "text-with-badge",
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      title: "We convert your idea Into a reality.",
      paragraphs: [
        "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff His room, a proper human room although a little too smalls.",
      ],
      buttons: [
        { text: "SEE PROJECTS", link: "/portfolio" },
        { text: "VIEW MORE", link: "#" },
      ],
    },
  },
  {
    id: "bakery-about-services",
    type: "fashionServicesGrid",
    props: {
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      title: "Let's Get Creative!",
      services: [
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/ruler-transparent-70x70.png",
          title: "GRAPHIC DESIGN",
          description: "Curabitur lacinia tristique velit ut laoreet.",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/pen-transparent-70x70.png",
          title: "WEB DESIGN",
          description: "By the readable content of a page when its layout.",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/paint-palette-transparent-70x70.png",
          title: "BRANDING",
          description: "Fact that a reader will be distracted.",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/ruler-2-transparent-70x70.png",
          title: "PHOTOGRAPHY",
          description: "The point of using Lorem Ipsum is that it has it.",
        },
      ],
    },
  },
  {
    id: "bakery-about-gallery",
    type: "fashionGalleryGrid",
    props: {
      images: [
        "https://woodmart.xtemos.com/wp-content/uploads/2017/03/about-us-gallery-photo-2.jpg",
        "https://woodmart.xtemos.com/wp-content/uploads/2017/03/about-us-gallery-photo-1.jpg",
      ],
    },
  },
  {
    id: "bakery-about-video-title",
    type: "fashionSectionTitle",
    props: {
      subtitle: "XTEMOS IS A CREATIVE DESIGN AGENCY",
      title: "Our Presentation",
      description: "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "bakery-about-videos",
    type: "fashionVideoSection",
    props: {
      videos: [
        {
          thumbnail: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/video-placeholder-1.jpg",
          videoUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y",
          title: "Our company history and facts",
          buttonText: "Show more",
        },
        {
          thumbnail: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/video-placeholder-2.jpg",
          videoUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y",
          title: "Design & development process demonstration",
          buttonText: "Show more",
        },
      ],
    },
  },
  {
    id: "bakery-about-quote",
    type: "fashionQuoteSection",
    props: {
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      quote: "''Excellence is not a skill it's an attitude'' - Ralph Marston",
      description: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine.",
      attribution: "Developed by Xtemos Studio @ 2022.",
    },
  },
  {
    id: "bakery-about-team",
    type: "fashionTeamSection",
    props: {
      team: [
        {
          name: "MARK JANCE",
          role: "CEO / FOUNDER",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team26.jpg",
          social: [
            { platform: "Facebook", url: "#" },
            { platform: "X (Twitter)", url: "#" },
            { platform: "Instagram", url: "#" },
            { platform: "Linkedin", url: "#" },
          ],
        },
        {
          name: "MARK JANCE",
          role: "CEO / FOUNDER",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team19.jpg",
          social: [
            { platform: "Facebook", url: "#" },
            { platform: "X (Twitter)", url: "#" },
            { platform: "Instagram", url: "#" },
            { platform: "Linkedin", url: "#" },
          ],
        },
        {
          name: "MARK JANCE",
          role: "CEO / FOUNDER",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team24.jpg",
          social: [
            { platform: "Facebook", url: "#" },
            { platform: "X (Twitter)", url: "#" },
            { platform: "Instagram", url: "#" },
            { platform: "Linkedin", url: "#" },
          ],
        },
        {
          name: "MARK JANCE",
          role: "CEO / FOUNDER",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team21.jpg",
          social: [
            { platform: "Facebook", url: "#" },
            { platform: "X (Twitter)", url: "#" },
            { platform: "Instagram", url: "#" },
            { platform: "Linkedin", url: "#" },
          ],
        },
      ],
    },
  },
  {
    id: "bakery-about-offices",
    type: "fashionOfficeLocations",
    props: {
      subtitle: "GET IN TOUCH WITH US",
      title: "Get Connected",
      description: "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
      offices: [
        {
          city: "NEW YORK",
          address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom",
          phone: "+23 954 355 255",
          email: "xtemos@gmail.com",
        },
        {
          city: "PARIS",
          address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom",
          phone: "+23 954 355 255",
          email: "xtemos@gmail.com",
        },
        {
          city: "LONDON",
          address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom",
          phone: "+23 954 355 255",
          email: "xtemos@gmail.com",
        },
        {
          city: "NORWAY",
          address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom",
          phone: "+23 954 355 255",
          email: "xtemos@gmail.com",
        },
      ],
    },
  },
  {
    id: "bakery-about-news",
    type: "fashionCoverBanners",
    props: {
      banners: [
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/banner-news.jpg",
          title: "It is a fact that a reader will be distracted.",
          subtitle: "Ullamcorper vehicula at ultrices sed interdum et malesuada",
          buttonText: "Read more",
          buttonLink: "#",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/banner-news-3.jpg",
          title: "By the readable content of a page when looking.",
          subtitle: "Patibus elementum a dictum ipiscing parturient donec eros.",
          buttonText: "Read more",
          buttonLink: "#",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/banner-news-2.jpg",
          title: "The point of using Lorem Ipsum is that it has.",
          subtitle: "Ullamcorper vehicula at ultrices sed in",
          buttonText: "Read more",
          buttonLink: "#",
        },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://woodmart.xtemos.com/contact-us/demo/sweets-bakery/
   ═══════════════════════════════════════════════════════════════ */

export const BAKERY_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "bakery-contact-store-visit",
    type: "fashionStoreVisit",
    props: {
      subtitle: "OUR STORES",
      title: "VISIT OUR NEW\nSTORE IN NEW YORK",
      address: "294 Bay Meadows Ave.\nBay Shore, NY 11706",
      buttonText: "See More About",
      buttonLink: "#",
    },
  },
  {
    id: "bakery-contact-faq",
    type: "fashionFaqAccordion",
    props: {
      subtitle: "INFORMATION QUESTIONS",
      title: "FREQUENTLY ASKED QUESTIONS",
      faqs: [
        {
          question: "Will I receive the same product that I see in the picture?",
          answer: "Consectetur cras scelerisque dis nec mi vestibulum ullamcorper turpis enim natoque tempus a malesuada suspendisse iaculis adipiscing himenaeos tincidunt. Tellus pharetra dis nostra urna a scelerisque id parturient ullamcorper ullamcorper class ad consectetur tristique et.\n\nHendrerit mollis facilisi odio a montes scelerisque a scelerisque justo a praesent conubia aenean mi tempor.",
        },
        {
          question: "Where can I view my sales receipt?",
          answer: "A vel dui a conubia vestibulum class varius vel nunc a gravida ut maecenas quisque a proin condimentum sagittis class at faucibus primis parturient dolor scelerisque himenaeos.\n\nA et ullamcorper vestibulum netus a mauris ac consectetur libero volutpat congue congue turpis a consectetur adipiscing sit. Suspendisse leo fringilla a congue tempus nisi conubia vestibulum a in posuere accumsan.",
        },
        {
          question: "How can I return an item?",
          answer: "Sit rhoncus aptent dis scelerisque penatibus a dis tempor accumsan suspendisse mollis a et odio ullamcorper magnis ullamcorper cum ullamcorper duis nulla egestas massa.\n\nVitae amet nostra est leo dignissim justo sodales et ac a conubia bibendum duis ad justo suspendisse a a tellus cubilia vestibulum a dictumst a duis risus. Sociosqu curae consequat nisl litora a eros est consectetur nulla rhoncus a a id felis praesent. Tempus dui integer a cursus id fames parturient.",
        },
        {
          question: "Will you restock items indicated as \"out of stock?\"",
          answer: "Scelerisque parturient sagittis nisi in aliquam dui scelerisque non consectetur aptent hac adipiscing ullamcorper pulvinar sit vestibulum purus facilisi hendrerit mus nisl massa ut parturient consectetur cum justo fames torquent.\n\nAc curae aliquet vivamus aptent duis congue urna venenatis ridiculus faucibus tincidunt a lorem rutrum nullam potenti adipiscing. Adipiscing.",
        },
        {
          question: "Where can I ship my order?",
          answer: "Ut bibendum a adipiscing purus massa a facilisi congue parturient condimentum urna donec per adipiscing cursus nisl nam tristique parturient id.\n\nAliquam quam at et in ipsum at venenatis a eget dignissim aliquam tincidunt ultrices lacus ad consectetur imperdiet sem suspendisse ante a dapibus potenti. Eu parturient parturient magnis tempus molestie augue quam vulputate hac facilisis est nisl pretium a cursus.",
        },
      ],
    },
  },
  {
    id: "bakery-contact-form",
    type: "fashionContactForm",
    props: {
      subtitle: "INFORMATION ABOUT US",
      title: "CONTACT US FOR ANY QUESTIONS",
      fields: ["name", "email", "phone", "company", "message"],
      buttonText: "Submit",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://woodmart.xtemos.com/blog/demo/sweets-bakery/
   ═══════════════════════════════════════════════════════════════ */

export const BAKERY_BLOG_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "bakery-blog-hero",
    type: "bakerySectionTitle",
    props: {
      subtitle: "",
      title: "Woodmart Blog",
      description: "",
      align: "center",
      titleSize: "48px",
    },
  },
  {
    id: "bakery-blog-posts",
    type: "bakeryBlogPosts",
    props: {
      columns: 2,
      sectionTitle: "",
      sectionSubtitle: "",
      posts: [
        {
          id: "bakery-blog-1",
          title: "Seating collection inspiration by modern",
          slug: "seating-collection-inspiration",
          excerpt: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-9.jpg",
          category: "Design trends, Furniture",
          author: "S. Rogers",
          date: "July 23",
        },
        {
          id: "bakery-blog-2",
          title: "Minimalist design furniture 2026",
          slug: "minimalist-design-furniture-2016",
          excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-1.jpg",
          category: "Design trends, Furniture",
          author: "S. Rogers",
          date: "July 23",
        },
        {
          id: "bakery-blog-3",
          title: "Green interior design inspiration",
          slug: "green-interior-design-inspiration",
          excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-7.jpg",
          category: "Design trends, Hand made",
          author: "S. Rogers",
          date: "July 23",
        },
        {
          id: "bakery-blog-4",
          title: "Reinterprets the classic bookshelf",
          slug: "reinterprets-the-classic-bookshelf",
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-3.jpg",
          category: "Design trends, Inspiration",
          author: "S. Rogers",
          date: "July 23",
        },
        {
          id: "bakery-blog-5",
          title: "Creative water features and exterior",
          slug: "creative-water-features-and-exterior",
          excerpt: "",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-13.jpg",
          category: "Design trends",
          author: "S. Rogers",
          date: "July 23",
        },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://woodmart.xtemos.com/shop/demo/sweets-bakery/
   ═══════════════════════════════════════════════════════════════ */

export const BAKERY_SHOP_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "bakery-shop-hero",
    type: "bakerySectionTitle",
    props: {
      subtitle: "",
      title: "Shop",
      description: "",
      align: "center",
      titleSize: "48px",
    },
  },
  {
    id: "bakery-shop-categories",
    type: "bakeryCategoryInfoBoxes",
    props: {
      sectionTitle: "Shop by Category",
      sectionSubtitle: "Sweets Bakery",
      items: [
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-1.svg",
          title: "Cupcakes",
          description: "Browse our selection of handmade cupcakes",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-2.svg",
          title: "Macaroons",
          description: "Discover our delicate French macaroons",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-3.svg",
          title: "Cakes",
          description: "Explore our custom cake collection",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "bakery-shop-products",
    type: "bakeryProductGrid",
    props: {
      columns: 3,
      maxProducts: 12,
      sectionTitle: "All Products",
      sectionSubtitle: "Sweets Bakery",
      products: [],
    },
  },
];
