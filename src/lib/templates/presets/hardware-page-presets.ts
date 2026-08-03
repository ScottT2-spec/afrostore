import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Hardware Template Page Presets
 * Content extracted verbatim from the WoodMart Hardware demo sub-pages.
 * Source: https://woodmart.xtemos.com/demo-hardware/?opt=hardware
 * Uses ONLY hardware* block types — independent from electronics blocks.
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://woodmart.xtemos.com/about-us/demo/hardware/
   ═══════════════════════════════════════════════════════════════ */

export const HARDWARE_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "hw-about-hero",
    type: "hardwareSectionTitle",
    settings: {
      subtitle: "XTEMOS IS A CREATIVE DESIGN AGENCY",
      title: "Our success and company history.",
      description: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "hw-about-hero-ctas",
    type: "hardwareAboutContent",
    settings: {
      buttons: [
        { text: "SEE PROJECTS", link: "/portfolio" },
        { text: "VIEW MORE", link: "#" },
      ],
    },
  },
  {
    id: "hw-about-story",
    type: "hardwareAboutContent",
    settings: {
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      title: "About Our Online Store",
      paragraphs: [
        "Risus suspendisse a orci penatibus a felis suscipit consectetur vestibulum sodales dui cum ultricies lacus interdum. Per suspendisse adipiscing a suspendisse auctor nibh a et at curae condimentum suspendisse enim a eu scelerisque.",
        "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff.",
        "Dictumst per ante cras suscipit nascetur ullamcorper in nullam fermentum condimentum torquent iaculis reden posuere potenti viverra condimentum dictumst id tellus suspendisse convallis condimentum.",
        "His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table \u2013 Samsa was a travelling salesman.",
        "The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \u201CWhat\u2019s happened to me?\u201D he thought. It wasn\u2019t a dream.",
      ],
      credit: "Developed by Xtemos Studio @ 2022.",
    },
  },
  {
    id: "hw-about-stats",
    type: "hardwareStatsCounters",
    settings: {
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
    id: "hw-about-convert",
    type: "hardwareAboutContent",
    settings: {
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
    id: "hw-about-services",
    type: "hardwareServicesGrid",
    settings: {
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      title: "Let\u2019s Get Creative!",
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
    id: "hw-about-gallery",
    type: "hardwareGalleryGrid",
    settings: {
      images: [
        "https://woodmart.xtemos.com/wp-content/uploads/2017/03/about-us-gallery-photo-2.jpg",
        "https://woodmart.xtemos.com/wp-content/uploads/2017/03/about-us-gallery-photo-1.jpg",
      ],
    },
  },
  {
    id: "hw-about-presentation",
    type: "hardwareVideoSection",
    settings: {
      subtitle: "XTEMOS IS A CREATIVE DESIGN AGENCY",
      title: "Our Presentation",
      description: "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
      videos: [
        {
          thumbnail: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/video-placeholder-1.jpg",
          youtubeUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y",
          title: "Our company history and facts",
        },
        {
          thumbnail: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/video-placeholder-2.jpg",
          youtubeUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y",
          title: "Design & development process demonstration",
        },
      ],
    },
  },
  {
    id: "hw-about-quote",
    type: "hardwareQuoteSection",
    settings: {
      subtitle: "WOODMART - BEST ECOMMERCE THEME 2021/22",
      quote: "Excellence is not a skill it\u2019s an attitude",
      attribution: "Ralph Marston",
      description: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine.",
      credit: "Developed by Xtemos Studio @ 2022.",
    },
  },
  {
    id: "hw-about-team",
    type: "hardwareTeamSection",
    settings: {
      members: [
        { name: "MARK JANCE", role: "CEO / FOUNDER", image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team26.jpg", socials: ["facebook", "twitter", "instagram", "linkedin"] },
        { name: "MARK JANCE", role: "CEO / FOUNDER", image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team19.jpg", socials: ["facebook", "twitter", "instagram", "linkedin"] },
        { name: "MARK JANCE", role: "CEO / FOUNDER", image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team24.jpg", socials: ["facebook", "twitter", "instagram", "linkedin"] },
        { name: "MARK JANCE", role: "CEO / FOUNDER", image: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/team21.jpg", socials: ["facebook", "twitter", "instagram", "linkedin"] },
      ],
    },
  },
  {
    id: "hw-about-offices",
    type: "hardwareOfficeLocations",
    settings: {
      subtitle: "GET IN TOUCH WITH US",
      title: "Get Connected",
      description: "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
      offices: [
        { city: "NEW YORK", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
        { city: "PARIS", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
        { city: "LONDON", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
        { city: "NORWAY", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
      ],
    },
  },
  {
    id: "hw-about-news",
    type: "hardwareCoverBanners",
    settings: {
      banners: [
        { image: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/banner-news.jpg", title: "It is a fact that a reader will be distracted.", description: "Ullamcorper vehicula at ultrices sed interdum et malesuada", buttonText: "Read more", link: "#" },
        { image: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/banner-news-3.jpg", title: "By the readable content of a page when looking.", description: "Patibus elementum a dictum ipiscing parturient donec eros.", buttonText: "Read more", link: "#" },
        { image: "https://woodmart.xtemos.com/wp-content/uploads/2017/03/banner-news-2.jpg", title: "The point of using Lorem Ipsum is that it has.", description: "Ullamcorper vehicula at ultrices sed interdum ullamcorper .", buttonText: "Read more", link: "#" },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://woodmart.xtemos.com/contact-us/demo/hardware/
   ═══════════════════════════════════════════════════════════════ */

export const HARDWARE_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "hw-contact-store-visit",
    type: "hardwareStoreVisit",
    settings: {
      subtitle: "OUR STORES",
      title: "VISIT OUR NEW\nSTORE IN NEW YORK",
      address: "294 Bay Meadows Ave.\nBay Shore, NY 11706",
      buttonText: "See More About",
      buttonLink: "#",
    },
  },
  {
    id: "hw-contact-faq",
    type: "hardwareFaqAccordion",
    settings: {
      subtitle: "INFORMATION QUESTIONS",
      title: "FREQUENTLY ASKED QUESTIONS",
      items: [
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
          question: "Will you restock items indicated as \u201Cout of stock?\u201D",
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
    id: "hw-contact-form",
    type: "hardwareContactForm",
    settings: {
      subtitle: "INFORMATION ABOUT US",
      title: "CONTACT US FOR ANY QUESTIONS",
      fields: ["name", "email", "phone", "company", "message"],
      buttonText: "Submit",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://woodmart.xtemos.com/blog/demo/hardware/
   ═══════════════════════════════════════════════════════════════ */

export const HARDWARE_BLOG_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "hw-blog-hero",
    type: "hardwareSectionTitle",
    settings: {
      title: "Woodmart Blog",
      align: "center",
      titleSize: "48px",
    },
  },
  {
    id: "hw-blog-posts",
    type: "hardwareBlogPosts",
    settings: {
      columns: 2,
      posts: [
        {
          title: "Seating collection inspiration by modern",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-9.jpg",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Design trends", "Furniture"],
          excerpt: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...",
        },
        {
          title: "Minimalist design furniture 2026",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-1.jpg",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Design trends", "Furniture"],
          excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that...",
        },
        {
          title: "Green interior design inspiration",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-7.jpg",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Design trends", "Hand made"],
          excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its...",
        },
        {
          title: "Reinterprets the classic bookshelf",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-3.jpg",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Design trends", "Inspiration"],
          excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
        },
        {
          title: "Creative water features and exterior",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-13.jpg",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Design trends", "Inspiration"],
          excerpt: "Adipiscing hac imperdiet id blandit varius scelerisque at sagittis libero dui dis volutpat vehicula mus sed ut. Lacinia dui rutrum...",
        },
        {
          title: "Sweet seat: functional seat for IT folks",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-11.jpg",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Design trends", "Hand made"],
          excerpt: "Discover a world of digital art and modern design at our annual exhibition. Explore unique projects from international creators...",
        },
      ],
    },
  },
];
