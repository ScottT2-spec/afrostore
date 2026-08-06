import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Electronics Accessories Template Page Presets
 * Content extracted from Prokip LTD Accessories demo:
 * https://prokip.xtemos.com/accessories/
 */

export const ACCESSORIES_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  { id: "acc-about-hero", type: "accessoriesAboutHero", settings: {
    subtitle: "Some words about us",
    title: "We Help Everyone Enjoy Amazing Products",
    description: "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited.",
    images: [
      "/prokip-logo.png",
      "/prokip-logo.png",
      "/prokip-logo.png",
    ],
    testimonial: {
      text: "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show.",
      avatar: "/prokip-logo.png",
      name: "Brooklyn Simmons",
      company: "BARONE LLC",
    },
  }},
  { id: "acc-about-team", type: "accessoriesTeamSection", settings: {
    subtitle: "Words about us",
    title: "Our Team",
    description: "Convallis ullamcorper aliquet ultrices orci cum vestibulum lobortis erat",
    members: [
      { name: "Jane Cooper", role: "President of Sales", image: "/prokip-logo.png", socials: ["facebook", "twitter"] },
      { name: "Jacob Jones", role: "Sales Analyst", image: "/prokip-logo.png", socials: ["facebook", "twitter", "instagram"] },
      { name: "Kristin Watson", role: "Market Development", image: "/prokip-logo.png", socials: ["facebook", "twitter"] },
      { name: "Darlene Robertson", role: "Social Media Specialist", image: "/prokip-logo.png", socials: ["facebook", "twitter", "instagram"] },
    ],
  }},
  { id: "acc-about-strategy", type: "accessoriesStrategySection", settings: {
    subtitle: "Buyers trust us",
    title: "Our Strategy Is To Provide Our Customers With Quality Products",
    paragraphs: [
      "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited. You begin with a text, you sculpt information, you chisel away what\u2019s not needed, you come.",
      "Then the question arises: where\u2019s the content? Not there yet? That\u2019s not so bad, there\u2019s dummy copy to the rescue. But worse, what if the fish doesn\u2019t fit in the can, the foot\u2019s to big for the boot? Or to small? To short sentences, to many headings, images too large for the proposed design, or too small, or they fit in but it looks iffy for reasons the folks in the meeting can\u2019t quite tell right now, but they\u2019re unhappy, somehow. A client that\u2019s unhappy for a reason is a problem, a client that\u2019s unhappy though.",
    ],
    infoboxes: [
      { icon: "/prokip-logo.png", title: "Fast Delivery", description: "Chances are there wasn\u2019t collaboration and checkpoints, there wasn\u2019t a process." },
      { icon: "/prokip-logo.png", title: "Best Quality", description: "It\u2019s content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum." },
      { icon: "/prokip-logo.png", title: "Free Return", description: "True enough, but that\u2019s not all that it takes to get things back on track out there for a text." },
    ],
  }},
  { id: "acc-about-community", type: "accessoriesCommunityCta", settings: {
    title: "Join Our Community",
    description: "Chances are there wasn\u2019t collaboration, communication, and checkpoints, there wasn\u2019t a process agreed upon or specified with the granularity required. It\u2019s content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum wouldn\u2019t have helped won\u2019t help now it\u2019s like saying you\u2019re a bad designer.",
    tabs: ["Web Designer", "Administrator", "Store Manager", "CEO"],
  }},
];

export const ACCESSORIES_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  { id: "acc-contact-store", type: "accessoriesStoreVisit", settings: {
    subtitle: "Our stores",
    title: "Visit Our New\nStore in New York",
    address: "294 Bay Meadows Ave.\nBay Shore, NY 11706",
    buttonText: "See More About",
    buttonLink: "#",
  }},
  { id: "acc-contact-faq", type: "accessoriesFaqAccordion", settings: {
    subtitle: "Information questions",
    title: "Frequently Asked Questions",
    items: [
      { question: "Will I receive the same product that I see in the picture?", answer: "Consectetur cras scelerisque dis nec mi vestibulum ullamcorper turpis enim natoque tempus a malesuada suspendisse iaculis adipiscing himenaeos tincidunt. Tellus pharetra dis nostra urna a scelerisque id parturient ullamcorper ullamcorper class ad consectetur tristique et.\n\nHendrerit mollis facilisi odio a montes scelerisque a scelerisque justo a praesent conubia aenean mi tempor." },
      { question: "Where can I view my sales receipt?", answer: "A vel dui a conubia vestibulum class varius vel nunc a gravida ut maecenas quisque a proin condimentum sagittis class at faucibus primis parturient dolor scelerisque himenaeos.\n\nA et ullamcorper vestibulum netus a mauris ac consectetur libero volutpat congue congue turpis a consectetur adipiscing sit. Suspendisse leo fringilla a congue tempus nisi conubia vestibulum a in posuere accumsan." },
      { question: "How can I return an item?", answer: "Sit rhoncus aptent dis scelerisque penatibus a dis tempor accumsan suspendisse mollis a et odio ullamcorper magnis ullamcorper cum ullamcorper duis nulla egestas massa.\n\nVitae amet nostra est leo dignissim justo sodales et ac a conubia bibendum duis ad justo suspendisse a a tellus cubilia vestibulum a dictumst a duis risus. Sociosqu curae consequat nisl litora a eros est consectetur nulla rhoncus a a id felis praesent. Tempus dui integer a cursus id fames parturient." },
      { question: "Will you restock items indicated as \u201cout of stock?\u201d", answer: "Scelerisque parturient sagittis nisi in aliquam dui scelerisque non consectetur aptent hac adipiscing ullamcorper pulvinar sit vestibulum purus facilisi hendrerit mus nisl massa ut parturient consectetur cum justo fames torquent.\n\nAc curae aliquet vivamus aptent duis congue urna venenatis ridiculus faucibus tincidunt a lorem rutrum nullam potenti adipiscing. Adipiscing." },
      { question: "Where can I ship my order?", answer: "Ut bibendum a adipiscing purus massa a facilisi congue parturient condimentum urna donec per adipiscing cursus nisl nam tristique parturient id.\n\nAliquam quam at et in ipsum at venenatis a eget dignissim aliquam tincidunt ultrices lacus ad consectetur imperdiet sem suspendisse ante a dapibus potenti. Eu parturient parturient magnis tempus molestie augue quam vulputate hac facilisis est nisl pretium a cursus." },
    ],
  }},
  { id: "acc-contact-form", type: "accessoriesContactForm", settings: {
    subtitle: "Information About Us",
    title: "Contact Us for Any Questions",
    fields: ["name", "email", "phone", "company", "message"],
  }},
];

export const ACCESSORIES_BLOG_PAGE_BLOCKS: EditorNode[] = [
  { id: "acc-blog-header", type: "accessoriesBlogHeader", settings: {
    title: "Blog",
    backgroundImage: "/prokip-logo.png",
  }},
  { id: "acc-blog-posts", type: "accessoriesBlogPosts", settings: {
    columns: 2,
    posts: [
      { title: "Exploring Atlanta\u2019s modern homes", date: "22 Apr", category: "Decoration", author: "Mr. Mackay", excerpt: "Vivamus enim sagittis aptent hac mi dui a per aptent suspendisse cras odio bibendum augue rhoncus laoreet dui praesent sodales sod...", image: "/prokip-logo.png", link: "#" },
      { title: "Green interior design inspiration", date: "22 Apr", category: "Inspiration", author: "Mr. Mackay", excerpt: "A sed a risusat luctus esta anibh rhoncus hendrerit blandit nam rutrum sitmiad hac. Cras a vestibulum a varius adipiscing ut digni...", image: "/prokip-logo.png", link: "#" },
      { title: "Collar brings back coffee brewing ritual", date: "22 Apr", category: "Furniture", author: "Mr. Mackay", excerpt: "Adipiscing hac imperdiet id blandit varius scelerisque at sagittis libero dui dis volutpat vehicula mus sed ut. Lacinia dui rutrum...", image: "/prokip-logo.png", link: "#" },
      { title: "Reinterprets the classic bookshelf", date: "22 Apr", category: "Design trends", author: "Mr. Mackay", excerpt: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torqu...", image: "/prokip-logo.png", link: "#" },
      { title: "Creative water features and exterior", date: "22 Apr", category: "Decoration", author: "Mr. Mackay", excerpt: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...", image: "/prokip-logo.png", link: "#" },
      { title: "Minimalist Japanese-inspired furniture", date: "22 Apr", category: "Inspiration", author: "Mr. Mackay", excerpt: "A sed a risusat luctus esta anibh rhoncus hendrerit blandit nam rutrum sitmiad hac...", image: "/prokip-logo.png", link: "#" },
    ],
  }},
];

export const ACCESSORIES_SHOP_PAGE_BLOCKS: EditorNode[] = [
  { id: "acc-shop-header", type: "accessoriesBlogHeader", settings: {
    title: "Shop",
    backgroundImage: "/prokip-logo.png",
  }},
  { id: "acc-shop-products", type: "accessoriesProductGrid", settings: { columns: 4, maxProducts: 12 } },
];

export const ACCESSORIES_FAQS_PAGE_BLOCKS: EditorNode[] = [
  { id: "acc-faqs-header", type: "accessoriesFaqsHeader", settings: {
    title: "Questions & Answers",
    description: "Write us an e-mail via the form, or just send us an e-mail directly at.",
    contactButtonText: "CONTACT US",
  }},
  { id: "acc-faqs-contact-info", type: "accessoriesFaqsContactInfo", settings: {
    formFields: ["name", "email", "phone", "company", "message"],
    contactInfo: {
      address: "50 East 52nd Street\nBrooklyn, NY 10022\nUnited States",
      phones: ["+1322224332", "+1546232784"],
      emails: ["info@google.com", "support@google.com"],
    },
    footerText: "Do you have questions about how we can help your company? Send us an email and we\u2019ll get in touch shortly.",
  }},
  { id: "acc-faqs-shopping", type: "accessoriesCategorizedFaq", settings: {
    category: "Shopping Information",
    items: [
      { question: "Delivery charges for orders from the Online Shop", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "How long will delivery take?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
      { question: "What exactly happens after ordering?", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "Where can I view my sales receipt?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
      { question: "How do I add a gift receipt to an order?", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "How long do I have to return an order?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
    ],
  }},
  { id: "acc-faqs-payment", type: "accessoriesCategorizedFaq", settings: {
    category: "Payment Information",
    items: [
      { question: "How is the recipient reimbursed?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
      { question: "Can I be reimbursed through the original payment method?", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "Can the country receiving the shipment be different than the country of purchase?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
      { question: "How can I return an item?", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "Will I receive the same product that I see in the picture?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
      { question: "Will you restock items indicated as \u201cout of stock?\u201d", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
    ],
  }},
  { id: "acc-faqs-orders", type: "accessoriesCategorizedFaq", settings: {
    category: "Orders and Returns",
    items: [
      { question: "Delivery charges for orders from the Online Shop?", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "How long will delivery take?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
      { question: "What exactly happens after ordering?", answer: "Torquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus.\n\nAd vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque." },
      { question: "How long does the delivery take and how much does it cost?", answer: "Ad vivamus nullam scelerisque a neque suspendisse consectetur fringilla a suspendisse proin senectus lobortis lacinia sem parturient dapibus ad aliquet maecenas dis neque.\n\nTorquent posuere vel id sagittis urna placerat ridiculus odio vestibulum donec tristique a nisl eros conubia condimentum nunc quisque nibh adipiscing habitasse parturient suspendisse proin a pharetra commodo leo tincidunt lobortis lacinia sem parturient dapibus." },
    ],
  }},
];
