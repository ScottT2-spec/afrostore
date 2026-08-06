import type { EditorNode } from "@/lib/visual-editor/node-tree";

const IMG = "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png";

export const LANDING_GADGET_PRESET: EditorNode[] = [
  /* ── 1. Hero ──────────────────────────────────────────────── */
  {
    id: "gadget-hero",
    type: "gadgetHero",
    settings: {
      titleLine1: "Inspiration Of",
      titleLine2: "Beauty In Simplicity.",
      description: "Authorities in our business will tell in no uncertain terms that Lorem Ipsum is that huge, huge no no to forswear forever. Not so fast, I'd say, there are some redeeming factors in favor of greeking text.",
      primaryButtonText: "Buy now",
      primaryButtonLink: "#",
      secondaryButtonText: "View More",
      secondaryButtonLink: "#",
      productImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      backgroundImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
    },
  },

  /* ── 2. Stats Bar ─────────────────────────────────────────── */
  {
    id: "gadget-stats",
    type: "gadgetStatsBar",
    settings: {
      items: [
        { number: "48", title: "Hours Life", description: "It's unreal, uncanny, makes you wonder if something is wrong, it." },
        { number: "2X", title: "More Powerful", description: "Usually, we prefer the real thing, wine without sulfur based pres." },
        { number: "12.2", title: "MP Camera", description: "Real butter, not margarine, and so we'd like our layouts designs." },
      ],
    },
  },

  /* ── 3. Feature: Sound (image right) ──────────────────────── */
  {
    id: "gadget-sound",
    type: "gadgetFeatureSplit",
    settings: {
      title: "2 stereo speakers for\nfull immersion.",
      description: "You begin with a text, you sculpt information, you chisel away what's not needed, you come to the point, make things clear, add value, you're a content person, you like words.",
      image: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      imagePosition: "right",
      specs: [
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "Snapdragon 835", description: "Even your less into design." },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "4gb RAM", description: "More content strategy." },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "64/12gb", description: "Many desktop now." },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "3520 Mah", description: "Usually prefer the real." },
      ],
      primaryButtonText: "To Shop",
      secondaryButtonText: "View More",
    },
  },

  /* ── 4. Feature: Display (image left) ─────────────────────── */
  {
    id: "gadget-display",
    type: "gadgetFeatureSplit",
    settings: {
      title: "Colors and contrast\nall in the P-OLED display.",
      description: "But worse, what if the fish doesn't fit in the can, the foot's to big for the boot that's not so bad. To short sentences, to many headings, images too large for the proposed design.",
      image: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      imagePosition: "left",
      specs: [
        { title: "18:9", description: "Screen Ratio — To short sentences shows." },
        { title: "QHD+", description: "Full Resolution — Authorities in our business." },
      ],
      primaryButtonText: "READ MORE",
      secondaryButtonText: "ADD TO CART",
    },
  },

  /* ── 5. Waterproof dark section ───────────────────────────── */
  {
    id: "gadget-waterproof",
    type: "gadgetDarkFeature",
    settings: {
      title: "The body is made of\nwaterproof materials.",
      description: "When it's about controlling hundreds of articles, product pages for web shops, or user profiles in social networks, all of them potentially with different sizes, formats, rules for.",
      buttonText: "View More",
      backgroundImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      overlayImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
    },
  },

  /* ── 6. Photo gallery: Camera find products ───────────────── */
  {
    id: "gadget-photos-1",
    type: "gadgetPhotoGallery",
    settings: {
      title: "Point your camera\nfind products online.",
      description: "Using test items of real content and data in designs will help, but there's no guarantee that every oddity will be found and corrected.",
      images: [
        "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
        "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      ],
      primaryButtonText: "To Shop",
      secondaryButtonText: "View More",
      imagePosition: "left",
    },
  },

  /* ── 7. Photo gallery: More power ─────────────────────────── */
  {
    id: "gadget-photos-2",
    type: "gadgetPhotoGallery",
    settings: {
      title: "More power,\nmore impressions.",
      description: "Design is no afterthought, far from it, but it comes in a deserved second. Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers.",
      images: [
        "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
        "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      ],
      primaryButtonText: "Buy now",
      secondaryButtonText: "View More",
      imagePosition: "right",
    },
  },

  /* ── 8. Camera dark feature with stats ─────────────────────── */
  {
    id: "gadget-camera-dark",
    type: "gadgetCameraDark",
    settings: {
      title: "You'll never want\nto use your flash again.",
      description: "Just fill up a page with draft copy about the client's business and they will actually read it and comment on it.",
      stats: [
        { value: "0.1 sec.", label: "For Shutter Release", description: "In faucibus malesuada euismod." },
        { value: "18+", label: "Equipment work", description: "Etiam ut consectetur ipsum." },
        { value: "240 FPS", label: "Frame Frequency", description: "A eu a et parturient platea lobo." },
        { value: "0.5 Ro", label: "Video Recording", description: "Pellentesque interdum odio." },
      ],
      backgroundImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      overlayImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
    },
  },

  /* ── 9. Security section ──────────────────────────────────── */
  {
    id: "gadget-security",
    type: "gadgetSecurity",
    settings: {
      sectionTitle: "Security and protection against thieves.",
      items: [
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "Unlock Fingerprint", description: "Presently it defines a new ipsum provider plugin service that allows for pluggable ipsum." },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "Web Locking", description: "Optionally available are extracts from a speech, corporate nonsense, and a randomised." },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", title: "OS Secure", description: "Try telling a client to ignore draft copy however, and you're up to something you can't win." },
      ],
    },
  },

  /* ── 10. Full-width security image ────────────────────────── */
  {
    id: "gadget-security-image",
    type: "gadgetFullWidthImage",
    settings: {
      image: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      alt: "Security feature showcase",
    },
  },

  /* ── 11. Camera optics / 360° section ─────────────────────── */
  {
    id: "gadget-camera-optics",
    type: "gadgetCameraOptics",
    settings: {
      sectionTitle: "Powerful optics and advanced technology in camera.",
      productImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      leftSpecs: [
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", value: "12.2 MP", label: "Camera" },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", value: "1.4 μm", label: "Pixel Size" },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", value: "f/1.8", label: "Aperture" },
      ],
      rightSpecs: [
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", value: "6x Zoom", label: "Sapphire Lenses" },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", value: "2 LED", label: "Smart Flash" },
        { icon: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", value: "2 Laser", label: "Smart Flash" },
      ],
    },
  },

  /* ── 12. Products showcase ────────────────────────────────── */
  {
    id: "gadget-products",
    type: "gadgetProductsShowcase",
    settings: {
      products: [
        { name: "Pixel 3", category: "Landing Pixel", price: "$649.00", image: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", link: "#" },
        { name: "Pixel 3 XL", category: "Landing Pixel", price: "$849.00", image: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png", link: "#" },
      ],
      bannerImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      bannerTitle: "Accessories",
      bannerButtonText: "View More",
    },
  },

  /* ── 13. Newsletter / Subscribe ───────────────────────────── */
  {
    id: "gadget-newsletter",
    type: "gadgetNewsletter",
    settings: {
      title: "Subscribe us.",
      description: "A client that's unhappy for a reason is a problem, a client that's unhappy though he or her can't quite put a finger on it is worse.",
      backgroundImage: "/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png",
      buttonText: "Subscribe",
    },
  },

  /* ── 14. Footer ───────────────────────────────────────────── */
  {
    id: "gadget-footer",
    type: "gadgetFooter",
    settings: {
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Returns", href: "#" },
        { label: "Term & Conditions", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Latest News", href: "#" },
        { label: "Our Sitemap", href: "#" },
      ],
      copyright: "2024 PREMIUM E-COMMERCE SOLUTIONS.",
      brandName: "STORE",
    },
  },
];
