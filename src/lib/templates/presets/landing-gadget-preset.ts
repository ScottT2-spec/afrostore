import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

export const LANDING_GADGET_PRESET: TemplateBlock[] = [
  /* ── 1. Hero ──────────────────────────────────────────────── */
  {
    id: "gadget-hero",
    type: "gadgetHero",
    props: {
      titleLine1: "Inspiration Of",
      titleLine2: "Beauty In Simplicity.",
      description: "Authorities in our business will tell in no uncertain terms that Lorem Ipsum is that huge, huge no no to forswear forever. Not so fast, I'd say, there are some redeeming factors in favor of greeking text.",
      primaryButtonText: "Buy now",
      primaryButtonLink: "#",
      secondaryButtonText: "View More",
      secondaryButtonLink: "#",
      productImage: `${IMG}/2018/11/landing-pixel-slider-phone-opt.png`,
      backgroundImage: `${IMG}/2018/11/landing-pixel-slider-bg-opt.jpg`,
    },
  },

  /* ── 2. Stats Bar ─────────────────────────────────────────── */
  {
    id: "gadget-stats",
    type: "gadgetStatsBar",
    props: {
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
    props: {
      title: "2 stereo speakers for\nfull immersion.",
      description: "You begin with a text, you sculpt information, you chisel away what's not needed, you come to the point, make things clear, add value, you're a content person, you like words.",
      image: `${IMG}/2018/11/landing-pixel-sound-img-opt.png`,
      imagePosition: "right",
      specs: [
        { icon: `${IMG}/2018/11/landing-pixel-cpu.svg`, title: "Snapdragon 835", description: "Even your less into design." },
        { icon: `${IMG}/2018/11/landing-pixel-ram.svg`, title: "4gb RAM", description: "More content strategy." },
        { icon: `${IMG}/2018/11/landing-pixel-flash.svg`, title: "64/12gb", description: "Many desktop now." },
        { icon: `${IMG}/2018/11/landing-pixel-battary.svg`, title: "3520 Mah", description: "Usually prefer the real." },
      ],
      primaryButtonText: "To Shop",
      secondaryButtonText: "View More",
    },
  },

  /* ── 4. Feature: Display (image left) ─────────────────────── */
  {
    id: "gadget-display",
    type: "gadgetFeatureSplit",
    props: {
      title: "Colors and contrast\nall in the P-OLED display.",
      description: "But worse, what if the fish doesn't fit in the can, the foot's to big for the boot that's not so bad. To short sentences, to many headings, images too large for the proposed design.",
      image: `${IMG}/2018/11/landing-pixel-display-opt.jpg`,
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
    props: {
      title: "The body is made of\nwaterproof materials.",
      description: "When it's about controlling hundreds of articles, product pages for web shops, or user profiles in social networks, all of them potentially with different sizes, formats, rules for.",
      buttonText: "View More",
      backgroundImage: `${IMG}/2018/11/landing-pixel-bg-woterproof-opt.jpg`,
      overlayImage: `${IMG}/2018/11/landing-pixel-woterproof-opt.png`,
    },
  },

  /* ── 6. Photo gallery: Camera find products ───────────────── */
  {
    id: "gadget-photos-1",
    type: "gadgetPhotoGallery",
    props: {
      title: "Point your camera\nfind products online.",
      description: "Using test items of real content and data in designs will help, but there's no guarantee that every oddity will be found and corrected.",
      images: [
        `${IMG}/2018/11/landing-pixel-photo-1-opt.jpg`,
        `${IMG}/2018/11/landing-pixel-photo-2-opt-.jpg`,
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
    props: {
      title: "More power,\nmore impressions.",
      description: "Design is no afterthought, far from it, but it comes in a deserved second. Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers.",
      images: [
        `${IMG}/2018/11/landing-pixel-photo-3-opt.jpg`,
        `${IMG}/2018/11/landing-pixel-photo-4-opt.jpg`,
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
    props: {
      title: "You'll never want\nto use your flash again.",
      description: "Just fill up a page with draft copy about the client's business and they will actually read it and comment on it.",
      stats: [
        { value: "0.1 sec.", label: "For Shutter Release", description: "In faucibus malesuada euismod." },
        { value: "18+", label: "Equipment work", description: "Etiam ut consectetur ipsum." },
        { value: "240 FPS", label: "Frame Frequency", description: "A eu a et parturient platea lobo." },
        { value: "0.5 Ro", label: "Video Recording", description: "Pellentesque interdum odio." },
      ],
      backgroundImage: `${IMG}/2018/11/landing-pixel-camera-bg-opt.jpg`,
      overlayImage: `${IMG}/2018/11/landing-pixel-camera-opt.png`,
    },
  },

  /* ── 9. Security section ──────────────────────────────────── */
  {
    id: "gadget-security",
    type: "gadgetSecurity",
    props: {
      sectionTitle: "Security and protection against thieves.",
      items: [
        { icon: `${IMG}/2018/11/landing-pixel-sequrity-fingerprint-1.svg`, title: "Unlock Fingerprint", description: "Presently it defines a new ipsum provider plugin service that allows for pluggable ipsum." },
        { icon: `${IMG}/2018/11/landing-pixel-sequrity-web-1.svg`, title: "Web Locking", description: "Optionally available are extracts from a speech, corporate nonsense, and a randomised." },
        { icon: `${IMG}/2018/11/landing-pixel-sequrity-os-shild-1.svg`, title: "OS Secure", description: "Try telling a client to ignore draft copy however, and you're up to something you can't win." },
      ],
    },
  },

  /* ── 10. Full-width security image ────────────────────────── */
  {
    id: "gadget-security-image",
    type: "gadgetFullWidthImage",
    props: {
      image: `${IMG}/2018/11/landing-pixel-sequrity-opt-1.jpg`,
      alt: "Security feature showcase",
    },
  },

  /* ── 11. Camera optics / 360° section ─────────────────────── */
  {
    id: "gadget-camera-optics",
    type: "gadgetCameraOptics",
    props: {
      sectionTitle: "Powerful optics and advanced technology in camera.",
      productImage: `${IMG}/2018/11/pixel-3-xl-360-1-opt.jpg`,
      leftSpecs: [
        { icon: `${IMG}/2018/11/landing-pixel-camera-1.svg`, value: "12.2 MP", label: "Camera" },
        { icon: `${IMG}/2018/11/landing-pixel-camera-2.svg`, value: "1.4 μm", label: "Pixel Size" },
        { icon: `${IMG}/2018/11/landing-pixel-camera-3.svg`, value: "f/1.8", label: "Aperture" },
      ],
      rightSpecs: [
        { icon: `${IMG}/2018/11/landing-pixel-camera-4.svg`, value: "6x Zoom", label: "Sapphire Lenses" },
        { icon: `${IMG}/2018/11/landing-pixel-camera-5.svg`, value: "2 LED", label: "Smart Flash" },
        { icon: `${IMG}/2018/11/landing-pixel-camera-6.svg`, value: "2 Laser", label: "Smart Flash" },
      ],
    },
  },

  /* ── 12. Products showcase ────────────────────────────────── */
  {
    id: "gadget-products",
    type: "gadgetProductsShowcase",
    props: {
      products: [
        { name: "Pixel 3", category: "Landing Pixel", price: "$649.00", image: `${IMG}/2018/11/pixel-3-beige-opt.jpg`, link: "#" },
        { name: "Pixel 3 XL", category: "Landing Pixel", price: "$849.00", image: `${IMG}/2018/11/pixel-3-xl-gray-opt.jpg`, link: "#" },
      ],
      bannerImage: `${IMG}/2018/11/landing-pixel-accessories-banner-opt-1.jpg`,
      bannerTitle: "Accessories",
      bannerButtonText: "View More",
    },
  },

  /* ── 13. Newsletter / Subscribe ───────────────────────────── */
  {
    id: "gadget-newsletter",
    type: "gadgetNewsletter",
    props: {
      title: "Subscribe us.",
      description: "A client that's unhappy for a reason is a problem, a client that's unhappy though he or her can't quite put a finger on it is worse.",
      backgroundImage: `${IMG}/2018/11/landing-pixel-subscribe-bg-opt.jpg`,
      buttonText: "Subscribe",
    },
  },

  /* ── 14. Footer ───────────────────────────────────────────── */
  {
    id: "gadget-footer",
    type: "gadgetFooter",
    props: {
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
