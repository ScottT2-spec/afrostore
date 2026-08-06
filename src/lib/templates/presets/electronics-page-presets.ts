import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Electronics Template Page Presets
 * Content extracted from Prokip LTD Electronics demo:
 * https://prokip.xtemos.com/demo-electronics/demo/electronics/
 */

export const ELECTRONICS_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  { id: "elec-about-hero", type: "electronicsSectionTitle", settings: { title: "Our success and company history.", showLine: false } },
  { id: "elec-about-hero-desc", type: "electronicsAboutContent", settings: {
    layout: "text-with-heading", subtitle: "XTEMOS IS A CREATIVE DESIGN AGENCY",
    title: "Our success and company history.",
    paragraphs: ["A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart."],
    buttons: [{ text: "SEE PROJECTS", link: "/portfolio" }, { text: "VIEW MORE", link: "#" }],
  }},
  { id: "elec-about-story", type: "electronicsAboutContent", settings: {
    layout: "text-with-heading", subtitle: "PROKIP - BEST ECOMMERCE THEME 2021/22", title: "About Our Online Store",
    paragraphs: [
      "Risus suspendisse a orci penatibus a felis suscipit consectetur vestibulum sodales dui cum ultricies lacus interdum. Per suspendisse adipiscing a suspendisse auctor nibh a et at curae condimentum suspendisse enim a eu scelerisque.",
      "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff.",
      "Dictumst per ante cras suscipit nascetur ullamcorper in nullam fermentum condimentum torquent iaculis reden posuere potenti viverra condimentum dictumst id tellus suspendisse convallis condimentum.",
      "His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table \u2013 Samsa was a travelling salesman.",
      "The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \u201CWhat\u2019s happened to me?\u201D he thought. It wasn\u2019t a dream.",
    ],
    credit: "Developed by Xtemos Studio @ 2022.",
  }},
  { id: "elec-about-stats", type: "electronicsStatsCounters", settings: { counters: [
    { value: 0, label: "SATISFIED CLIENTS" }, { value: 0, label: "FINISHED PROJECTS" },
    { value: 0, label: "TEAM MEMBERS" }, { value: 0, label: "OFFICES" },
    { value: 0, label: "SATISFIED CLIENTS" }, { value: 0, label: "DESIGN WORKS" },
  ]}},
  { id: "elec-about-convert", type: "electronicsAboutContent", settings: {
    layout: "text-with-heading", subtitle: "PROKIP - BEST ECOMMERCE THEME 2021/22",
    title: "We convert your idea Into a reality.",
    paragraphs: ["One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff His room, a proper human room although a little too smalls."],
    buttons: [{ text: "SEE PROJECTS", link: "/portfolio" }, { text: "VIEW MORE", link: "#" }],
  }},
  { id: "elec-about-services", type: "electronicsServicesGrid", settings: {
    subtitle: "PROKIP - BEST ECOMMERCE THEME 2021/22", title: "Let\u2019s Get Creative!",
    services: [
      { icon: "/prokip-logo.png", title: "GRAPHIC DESIGN", description: "Curabitur lacinia tristique velit ut laoreet." },
      { icon: "/prokip-logo.png", title: "WEB DESIGN", description: "By the readable content of a page when its layout." },
      { icon: "/prokip-logo.png", title: "BRANDING", description: "Fact that a reader will be distracted." },
      { icon: "/prokip-logo.png", title: "PHOTOGRAPHY", description: "The point of using Lorem Ipsum is that it has it." },
    ],
  }},
  { id: "elec-about-gallery", type: "electronicsGalleryGrid", settings: { images: [
    "/prokip-logo.png",
    "/prokip-logo.png",
  ]}},
  { id: "elec-about-presentation", type: "electronicsVideoSection", settings: {
    subtitle: "XTEMOS IS A CREATIVE DESIGN AGENCY", title: "Our Presentation",
    description: "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
    videos: [
      { thumbnail: "/prokip-logo.png", youtubeUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y", title: "Our company history and facts" },
      { thumbnail: "/prokip-logo.png", youtubeUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y", title: "Design & development process demonstration" },
    ],
  }},
  { id: "elec-about-quote", type: "electronicsQuoteSection", settings: {
    subtitle: "PROKIP - BEST ECOMMERCE THEME 2021/22",
    quote: "Excellence is not a skill it\u2019s an attitude", attribution: "Ralph Marston",
    description: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine.",
    credit: "Developed by Xtemos Studio @ 2022.",
  }},
  { id: "elec-about-team", type: "electronicsTeamSection", settings: { members: [
    { name: "MARK JANCE", role: "CEO / FOUNDER", image: "/prokip-logo.png", socials: ["facebook", "twitter", "instagram", "linkedin"] },
    { name: "MARK JANCE", role: "CEO / FOUNDER", image: "/prokip-logo.png", socials: ["facebook", "twitter", "instagram", "linkedin"] },
    { name: "MARK JANCE", role: "CEO / FOUNDER", image: "/prokip-logo.png", socials: ["facebook", "twitter", "instagram", "linkedin"] },
    { name: "MARK JANCE", role: "CEO / FOUNDER", image: "/prokip-logo.png", socials: ["facebook", "twitter", "instagram", "linkedin"] },
  ]}},
  { id: "elec-about-offices", type: "electronicsOfficeLocations", settings: {
    subtitle: "GET IN TOUCH WITH US", title: "Get Connected",
    description: "I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single.",
    offices: [
      { city: "NEW YORK", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
      { city: "PARIS", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
      { city: "LONDON", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
      { city: "NORWAY", address: "113 New Avenue, Roadway,\n67 Brewer St, London, United Kingdom", phone: "+23 954 355 255", email: "xtemos@gmail.com" },
    ],
  }},
  { id: "elec-about-news", type: "electronicsPromoBanners", settings: { banners: [
    { image: "/prokip-logo.png", subtitle: "", title: "It is a fact that a reader will be distracted.", description: "Ullamcorper vehicula at ultrices sed interdum et malesuada", buttonText: "Read more", link: "#" },
    { image: "/prokip-logo.png", subtitle: "", title: "By the readable content of a page when looking.", description: "Patibus elementum a dictum ipiscing parturient donec eros.", buttonText: "Read more", link: "#" },
    { image: "/prokip-logo.png", subtitle: "", title: "The point of using Lorem Ipsum is that it has.", description: "Ullamcorper vehicula at ultrices sed interdum ullamcorper .", buttonText: "Read more", link: "#" },
  ]}},
];

export const ELECTRONICS_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  { id: "elec-contact-store", type: "electronicsStoreVisit", settings: {
    subtitle: "OUR STORES", title: "VISIT OUR NEW\nSTORE IN NEW YORK",
    address: "294 Bay Meadows Ave.\nBay Shore, NY 11706", buttonText: "See More About", buttonLink: "#",
  }},
  { id: "elec-contact-faq", type: "electronicsFaqAccordion", settings: {
    subtitle: "INFORMATION QUESTIONS", title: "FREQUENTLY ASKED QUESTIONS",
    items: [
      { question: "Will I receive the same product that I see in the picture?", answer: "Consectetur cras scelerisque dis nec mi vestibulum ullamcorper turpis enim natoque tempus a malesuada suspendisse iaculis adipiscing himenaeos tincidunt. Tellus pharetra dis nostra urna a scelerisque id parturient ullamcorper ullamcorper class ad consectetur tristique et.\n\nHendrerit mollis facilisi odio a montes scelerisque a scelerisque justo a praesent conubia aenean mi tempor." },
      { question: "Where can I view my sales receipt?", answer: "A vel dui a conubia vestibulum class varius vel nunc a gravida ut maecenas quisque a proin condimentum sagittis class at faucibus primis parturient dolor scelerisque himenaeos.\n\nA et ullamcorper vestibulum netus a mauris ac consectetur libero volutpat congue congue turpis a consectetur adipiscing sit. Suspendisse leo fringilla a congue tempus nisi conubia vestibulum a in posuere accumsan." },
      { question: "How can I return an item?", answer: "Sit rhoncus aptent dis scelerisque penatibus a dis tempor accumsan suspendisse mollis a et odio ullamcorper magnis ullamcorper cum ullamcorper duis nulla egestas massa.\n\nVitae amet nostra est leo dignissim justo sodales et ac a conubia bibendum duis ad justo suspendisse a a tellus cubilia vestibulum a dictumst a duis risus. Sociosqu curae consequat nisl litora a eros est consectetur nulla rhoncus a a id felis praesent. Tempus dui integer a cursus id fames parturient." },
      { question: "Will you restock items indicated as \"out of stock?\"", answer: "Scelerisque parturient sagittis nisi in aliquam dui scelerisque non consectetur aptent hac adipiscing ullamcorper pulvinar sit vestibulum purus facilisi hendrerit mus nisl massa ut parturient consectetur cum justo fames torquent.\n\nAc curae aliquet vivamus aptent duis congue urna venenatis ridiculus faucibus tincidunt a lorem rutrum nullam potenti adipiscing. Adipiscing." },
      { question: "Where can I ship my order?", answer: "Ut bibendum a adipiscing purus massa a facilisi congue parturient condimentum urna donec per adipiscing cursus nisl nam tristique parturient id.\n\nAliquam quam at et in ipsum at venenatis a eget dignissim aliquam tincidunt ultrices lacus ad consectetur imperdiet sem suspendisse ante a dapibus potenti. Eu parturient parturient magnis tempus molestie augue quam vulputate hac facilisis est nisl pretium a cursus." },
    ],
  }},
  { id: "elec-contact-form", type: "electronicsContactForm", settings: {
    subtitle: "INFORMATION ABOUT US", title: "CONTACT US FOR ANY QUESTIONS",
    fields: ["name", "email", "phone", "company", "message"],
  }},
  { id: "elec-contact-partners", type: "electronicsPartners", settings: { logos: [
    { name: "Alessi", image: "/prokip-logo.png", url: "#" },
    { name: "Eva Solo", image: "/prokip-logo.png", url: "#" },
    { name: "Flos", image: "/prokip-logo.png", url: "#" },
    { name: "Hay", image: "/prokip-logo.png", url: "#" },
    { name: "Joseph Joseph", image: "/prokip-logo.png", url: "#" },
    { name: "KL\u00d6BER", image: "/prokip-logo.png", url: "#" },
    { name: "Louis Poulsen", image: "/prokip-logo.png", url: "#" },
    { name: "Magisso", image: "/prokip-logo.png", url: "#" },
    { name: "Niche", image: "/prokip-logo.png", url: "#" },
  ]}},
];

export const ELECTRONICS_BLOG_PAGE_BLOCKS: EditorNode[] = [
  { id: "elec-blog-title", type: "electronicsSectionTitle", settings: { title: "Prokip LTD Blog", showLine: false } },
  { id: "elec-blog-posts", type: "electronicsBlogPosts", settings: {
    sectionTitle: "", columns: 2,
    posts: [
      { title: "Seating collection inspiration by modern", date: "23 Jul", category: "Design trends, Furniture", author: "S. Rogers", excerpt: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...", image: "/prokip-logo.png", link: "#" },
      { title: "Minimalist design furniture 2026", date: "23 Jul", category: "Design trends, Furniture", author: "S. Rogers", excerpt: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconi...", image: "/prokip-logo.png", link: "#" },
      { title: "Green interior design inspiration", date: "23 Jul", category: "Design trends, Hand made", author: "S. Rogers", excerpt: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflect...", image: "/prokip-logo.png", link: "#" },
      { title: "Reinterprets the classic bookshelf", date: "23 Jul", category: "Design trends, Inspiration", author: "S. Rogers", excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torqu...", image: "/prokip-logo.png", link: "#" },
      { title: "Creative water features and exterior", date: "23 Jul", category: "Design trends, Inspiration", author: "S. Rogers", excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torqu...", image: "/prokip-logo.png", link: "#" },
    ],
  }},
];

export const ELECTRONICS_SHOP_PAGE_BLOCKS: EditorNode[] = [
  { id: "elec-shop-title", type: "electronicsSectionTitle", settings: { title: "Shop", showLine: false } },
  { id: "elec-shop-products", type: "electronicsProductTabs", settings: {
    sectionTitle: "ALL PRODUCTS", tabs: ["All"], columns: 4, maxProducts: 12,
  }},
];
