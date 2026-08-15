import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Decor (Interior) Template Page Presets
 * Content extracted from Prokip LTD Decor demo:
 * https://prokip.xtemos.com/demo-decor/demo/decor/
 */

export const DECOR_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  { id: "decor-about-hero", type: "interiorAboutContent", settings: {
    layout: "text-with-heading", subtitle: "OUR STORY",
    title: "Thoughtfully designed pieces for every home.",
    paragraphs: ["We started with a simple idea: home decor should be beautiful, well-made, and accessible. Every piece in our collection is chosen for its craftsmanship and its ability to make a house feel like home."],
    buttons: [{ text: "SHOP NOW", link: "/shop" }],
  }},
  { id: "decor-about-story", type: "interiorAboutContent", settings: {
    layout: "text-with-heading", subtitle: "WHAT WE DO", title: "About Our Store",
    paragraphs: [
      "We curate furniture, lighting, and decorative pieces from makers who care about quality as much as we do. Every item is selected personally — nothing goes into our catalog that we wouldn't put in our own homes.",
      "From statement lighting to everyday essentials, our collection is built to help you create a space that feels distinctly yours, without the guesswork.",
      "We work directly with small studios and independent designers wherever we can, so the pieces you bring home have a story behind them.",
    ],
  }},
  { id: "decor-about-stats", type: "interiorStatsCounters", settings: { counters: [
    { value: 500, label: "HAPPY CUSTOMERS" }, { value: 250, label: "PRODUCTS CURATED" },
    { value: 15, label: "PARTNER DESIGNERS" }, { value: 4, label: "YEARS IN BUSINESS" },
  ]}},
  { id: "decor-about-convert", type: "interiorAboutContent", settings: {
    layout: "text-with-heading", subtitle: "OUR APPROACH",
    title: "We help you bring your vision to life.",
    paragraphs: ["Whether you're furnishing a first apartment or refreshing a family home, we're here to help you find pieces that fit your space, your budget, and your style. Browse the collection or reach out — we're always happy to help."],
    buttons: [{ text: "SHOP NOW", link: "/shop" }],
  }},
  { id: "decor-about-services", type: "interiorServicesGrid", settings: {
    subtitle: "HOW WE CAN HELP", title: "What We Offer",
    services: [
      { icon: "🛋️", title: "CURATED COLLECTIONS", description: "Hand-picked furniture and decor, organized to make finding your style easy." },
      { icon: "🚚", title: "RELIABLE DELIVERY", description: "Careful packing and tracked shipping on every order, large or small." },
      { icon: "💬", title: "STYLING ADVICE", description: "Not sure what fits your space? Message us and we'll help you decide." },
      { icon: "↩️", title: "EASY RETURNS", description: "Not quite right? Our return policy makes it simple to send it back." },
    ],
  }},
  { id: "decor-about-gallery", type: "interiorGalleryGrid", settings: { images: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80&auto=format&fit=crop",
  ]}},
  { id: "decor-about-quote", type: "interiorQuoteSection", settings: {
    subtitle: "OUR PHILOSOPHY",
    quote: "Good design isn't about more — it's about the right pieces, in the right place.", attribution: "Our Founders",
    description: "We believe a well-designed home doesn't need to be complicated. It just needs pieces that are made well and chosen with care.",
  }},
  { id: "decor-about-offices", type: "interiorOfficeLocations", settings: {
    subtitle: "GET IN TOUCH WITH US", title: "Get Connected",
    description: "Have a question about an order, or want styling advice? Reach out — we typically reply within a business day.",
    offices: [
      { city: "MAIN STORE", address: "Update this with your store's real address", phone: "Update with your phone number", email: "Update with your contact email" },
    ],
  }},
];

export const DECOR_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  { id: "decor-contact-store", type: "interiorStoreVisit", settings: {
    subtitle: "VISIT US", title: "Come See Us In Person",
    address: "Update this with your store's real address", buttonText: "Get Directions", buttonLink: "#",
  }},
  { id: "decor-contact-faq", type: "interiorFaqAccordion", settings: {
    subtitle: "COMMON QUESTIONS", title: "Frequently Asked Questions",
    items: [
      { question: "Will I receive the exact item shown in the photo?", answer: "Yes — for most items, what you see is what you get. Handmade or natural-material pieces may have slight, natural variation in color or texture, which we'll always note on the product page." },
      { question: "How long does shipping take?", answer: "Standard delivery typically takes 3–7 business days depending on your location. You'll receive a tracking link by email as soon as your order ships." },
      { question: "What is your return policy?", answer: "If something isn't right, you can return most items within 14 days of delivery for a refund or exchange, as long as they're unused and in their original packaging." },
      { question: "Do you restock items marked \"out of stock\"?", answer: "Popular items are usually restocked within a few weeks. Add the item to your wishlist or check back — we don't currently offer restock notifications, but that's on our roadmap." },
      { question: "Can I ship to a different address than my billing address?", answer: "Yes, you can enter a separate shipping address at checkout." },
    ],
  }},
  { id: "decor-contact-form", type: "interiorContactForm", settings: {
    subtitle: "GET IN TOUCH", title: "Have a Question?",
    fields: ["name", "email", "phone", "message"],
  }},
];

export const DECOR_BLOG_PAGE_BLOCKS: EditorNode[] = [
  { id: "decor-blog-title", type: "interiorSectionTitle", settings: { title: "Our Blog" } },
  { id: "decor-blog-posts", type: "interiorBlogPosts", settings: {
    sectionTitle: "", columns: 2,
    posts: [
      { title: "Seating Collection Inspiration for Modern Homes", date: "12 Jan", category: "Design Trends, Furniture", author: "Style Team", excerpt: "From accent chairs to full living-room sets, here's how to choose seating that balances comfort with a room's overall look.", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80&auto=format&fit=crop", link: "#" },
      { title: "Minimalist Furniture Trends We're Loving", date: "28 Jan", category: "Design Trends, Furniture", author: "Style Team", excerpt: "Clean lines, natural materials, and functional pieces — minimalism continues to define modern interiors.", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80&auto=format&fit=crop", link: "#" },
      { title: "Bringing the Outdoors In: Green Interior Design", image: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&q=80&auto=format&fit=crop", date: "9 Feb", category: "Design Trends, Inspiration", author: "Style Team", excerpt: "Plants, natural light, and eco-conscious materials are transforming how we think about home design.", link: "#" },
      { title: "A Fresh Take on the Classic Bookshelf", date: "22 Feb", category: "Design Trends, Inspiration", author: "Style Team", excerpt: "Bookshelves aren't just storage anymore — they're a statement piece. Here's how to style yours.", image: "https://images.unsplash.com/photo-1667312939978-64cf31718a6e?w=800&q=80&auto=format&fit=crop", link: "#" },
    ],
  }},
];

export const DECOR_SHOP_PAGE_BLOCKS: EditorNode[] = [
  { id: "decor-shop-title", type: "interiorSectionTitle", settings: { title: "Shop" } },
  { id: "decor-shop-products", type: "interiorProductGrid", settings: { columns: 4, maxProducts: 12 } },
];
