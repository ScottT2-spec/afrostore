import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Hardware Template Page Presets
 * Content extracted verbatim from the Prokip LTD Hardware demo sub-pages.
 * Source: https://prokip.xtemos.com/demo-hardware/?opt=hardware
 * Uses ONLY hardware* block types — independent from electronics blocks.
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://prokip.xtemos.com/about-us/demo/hardware/
   ═══════════════════════════════════════════════════════════════ */

export const HARDWARE_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "hw-about-hero",
    type: "hardwareSectionTitle",
    settings: {
      subtitle: "QUALITY TOOLS, TRUSTED SERVICE",
      title: "Our success and company history.",
      description: "From a single storefront to a name contractors and homeowners rely on — here's our story.",
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
      subtitle: "WHY SHOP WITH US",
      title: "About Our Online Store",
      paragraphs: [
        "We started out with a simple goal: make it easy to find reliable, well-priced hardware and tools without the guesswork. From power tools to plumbing fittings, every product we stock is chosen because we'd use it ourselves.",
        "Our team has years of hands-on experience across construction, repair, and DIY projects, so when you have a question, you're talking to someone who's actually used the tools we sell.",
        "We work directly with trusted manufacturers to keep our prices fair without cutting corners on quality — because a tool that breaks on the job costs you more than it saved.",
        "Whether you're a contractor stocking up for the week or a homeowner tackling a weekend project, we're here to help you get it done right the first time.",
        "Thank you for shopping with us. We're always adding new products and improving how we serve you — if there's something you're looking for, let us know.",
      ],
      credit: "",
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
      subtitle: "WHY SHOP WITH US",
      title: "We convert your idea Into a reality.",
      paragraphs: [
        "We opened our doors with a simple mission: give tradespeople and DIYers a hardware store they can actually trust — fair prices, real stock, and staff who know the difference between a socket wrench and a spanner.",
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
      subtitle: "WHY SHOP WITH US",
      title: "Let\u2019s Get Creative!",
      services: [
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "EXPERT ADVICE",
          description: "Not sure which tool fits the job? Our team can help you choose.",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "SAME-DAY DELIVERY",
          description: "Order before 2pm and get it delivered the same day, locally.",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "TOOL RENTAL",
          description: "Need it for one job? Rent instead of buying outright.",
        },
        {
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E",
          title: "WARRANTY SUPPORT",
          description: "Every purchase is backed by manufacturer warranty and our own guarantee.",
        },
      ],
    },
  },
  {
    id: "hw-about-gallery",
    type: "hardwareGalleryGrid",
    settings: {
      images: [
        "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop",
      ],
    },
  },
  {
    id: "hw-about-presentation",
    type: "hardwareVideoSection",
    settings: {
      subtitle: "QUALITY TOOLS, TRUSTED SERVICE",
      title: "Our Presentation",
      description: "Take a quick look at how we source, stock, and ship the tools you rely on every day.",
      videos: [
        {
          thumbnail: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
          youtubeUrl: "http://www.youtube.com/watch?v=TJ1SDXbij8Y",
          title: "Our company history and facts",
        },
        {
          thumbnail: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
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
      subtitle: "WHY SHOP WITH US",
      quote: "Excellence is not a skill it\u2019s an attitude",
      attribution: "Ralph Marston",
      description: "It's a philosophy we apply to every product we stock and every customer we serve.",
      credit: "",
    },
  },
  {
    id: "hw-about-team",
    type: "hardwareTeamSection",
    settings: {
      members: [
        { name: "MARK JANCE", role: "CEO / FOUNDER", image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop", socials: ["facebook", "twitter", "instagram", "linkedin"] },
        { name: "SARAH OKAFOR", role: "OPERATIONS MANAGER", image: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&q=80&auto=format&fit=crop", socials: ["facebook", "twitter", "instagram", "linkedin"] },
        { name: "DAVID ADEYEMI", role: "HEAD OF SALES", image: "https://images.unsplash.com/photo-1643536768014-0756fa85ca4f?w=800&q=80&auto=format&fit=crop", socials: ["facebook", "twitter", "instagram", "linkedin"] },
        { name: "GRACE MENSAH", role: "CUSTOMER SUCCESS LEAD", image: "https://images.unsplash.com/photo-1515940279136-2f419eea8051?w=800&q=80&auto=format&fit=crop", socials: ["facebook", "twitter", "instagram", "linkedin"] },
      ],
    },
  },
  {
    id: "hw-about-offices",
    type: "hardwareOfficeLocations",
    settings: {
      subtitle: "GET IN TOUCH WITH US",
      title: "Get Connected",
      description: "Have a question about an order, a product, or a bulk quote? Reach out — we're happy to help.",
      offices: [
        { city: "MAIN STORE", address: "Update this with your store's address", phone: "Update with your phone number", email: "Update with your store email" },
      ],
    },
  },
  {
    id: "hw-about-news",
    type: "hardwareCoverBanners",
    settings: {
      banners: [
        { image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80&auto=format&fit=crop", title: "Get 15% off all power tools this month.", description: "Limited-time savings on drills, saws, and sanders from top brands.", buttonText: "Shop the sale", link: "#" },
        { image: "https://images.unsplash.com/photo-1547479117-da9abbff3fa0?w=800&q=80&auto=format&fit=crop", title: "Free delivery on orders over $100.", description: "Stock up on supplies for your next project and skip the delivery fee.", buttonText: "Start shopping", link: "#" },
        { image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop", title: "New arrivals: cordless tool sets.", description: "Lightweight, long-lasting battery life, built for all-day jobs.", buttonText: "See what's new", link: "#" },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://prokip.xtemos.com/contact-us/demo/hardware/
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
          answer: "Yes — the images shown match the exact product you'll receive. If a specific color or finish varies slightly by batch, we'll note that clearly on the product page.",
        },
        {
          question: "Where can I view my sales receipt?",
          answer: "A receipt is emailed to you automatically once your order is confirmed. You can also find it anytime under your account's order history.",
        },
        {
          question: "How can I return an item?",
          answer: "Contact us within 14 days of delivery with your order number, and we'll walk you through the return process. Items must be unused and in their original packaging.",
        },
        {
          question: "Will you restock items indicated as \u201Cout of stock?\u201D",
          answer: "Most items are restocked within 1-2 weeks. You can turn on stock alerts on any product page to be notified the moment it's available again.",
        },
        {
          question: "Where can I ship my order?",
          answer: "We ship nationwide. Delivery timelines and costs are calculated at checkout based on your location.",
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
   Source: https://prokip.xtemos.com/blog/demo/hardware/
   ═══════════════════════════════════════════════════════════════ */

export const HARDWARE_BLOG_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "hw-blog-hero",
    type: "hardwareSectionTitle",
    settings: {
      title: "Prokip LTD Blog",
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
          title: "5 power tools every home toolbox needs",
          image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80&auto=format&fit=crop",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Buying Guides", "Power Tools"],
          excerpt: "From a reliable drill to a compact circular saw, here's what actually earns a spot in a well-used home toolbox...",
        },
        {
          title: "How to choose the right paint for outdoor surfaces",
          image: "https://images.unsplash.com/photo-1595303526913-c7037797ebe7?w=800&q=80&auto=format&fit=crop",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Buying Guides", "Paint & Supplies"],
          excerpt: "Weather resistance, finish, and coverage all matter more outdoors. Here's how to pick paint that actually lasts...",
        },
        {
          title: "A beginner's guide to basic plumbing repairs",
          image: "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?w=800&q=80&auto=format&fit=crop",
          date: "July 23",
          author: "S. Rogers",
          categories: ["How-To", "Plumbing"],
          excerpt: "Fixing a leaky faucet or running toilet doesn't always need a plumber. Start with these simple, safe repairs...",
        },
        {
          title: "Cordless vs. corded tools: which should you buy?",
          image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format&fit=crop",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Buying Guides", "Power Tools"],
          excerpt: "Portability versus raw power — we break down which type makes sense for your next project...",
        },
        {
          title: "Organizing your workshop for maximum efficiency",
          image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80&auto=format&fit=crop",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Tips", "Workshop"],
          excerpt: "A well-organized workshop saves time on every job. Here's how to set up storage that actually works...",
        },
        {
          title: "Choosing the right fasteners for your project",
          image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&q=80&auto=format&fit=crop",
          date: "July 23",
          author: "S. Rogers",
          categories: ["Buying Guides", "Fasteners"],
          excerpt: "Screws, bolts, nails, anchors — picking the wrong fastener can cost you the whole project. Here's what to know...",
        },
      ],
    },
  },
];
