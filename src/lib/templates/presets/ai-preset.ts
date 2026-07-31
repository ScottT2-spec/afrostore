import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * AI Template Preset
 * Allbirds-inspired modern e-commerce layout.
 * Full-bleed imagery, clean typography, editorial feel.
 */
export const AI_TEMPLATE_PRESET: TemplateBlock[] = [
  /* ── 1. Announcement Bar ──────────────────────────────── */
  {
    id: "ai-announcement",
    type: "aiAnnouncementBar",
    props: {
      messages: [
        "Free Shipping on Orders Over $75",
        "New Collection Just Dropped — Shop Now",
        "Sustainable Materials, Exceptional Quality",
        "30-Day Free Returns on All Orders",
      ],
      speed: 30,
      backgroundColor: "#1a1a1a",
      textColor: "#ffffff",
    },
  },

  /* ── 2. Hero Video / Image ────────────────────────────── */
  {
    id: "ai-hero",
    type: "aiHeroVideo",
    props: {
      backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
      backgroundVideo: "",
      buttons: [
        { text: "Shop Men", link: "/collections/men", style: "primary" },
        { text: "Shop Women", link: "/collections/women", style: "primary" },
      ],
      contentPosition: "bottom-right",
      overlayOpacity: 10,
      minHeight: "calc(100vh - 120px)",
    },
  },

  /* ── 3. Category Row ──────────────────────────────────── */
  {
    id: "ai-categories",
    type: "aiCategoryRow",
    props: {
      cards: [
        {
          title: "New Arrivals",
          image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1040&fit=crop",
          overlayOpacity: 15,
          buttons: [
            { text: "Shop Men", link: "/collections/new-men" },
            { text: "Shop Women", link: "/collections/new-women" },
          ],
        },
        {
          title: "Mens",
          image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=1040&fit=crop",
          overlayOpacity: 15,
          buttons: [
            { text: "Shop Now", link: "/collections/men" },
          ],
        },
        {
          title: "Womens",
          image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1040&fit=crop",
          overlayOpacity: 15,
          buttons: [
            { text: "Shop Now", link: "/collections/women" },
          ],
        },
        {
          title: "Bestsellers",
          image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1040&fit=crop",
          overlayOpacity: 15,
          buttons: [
            { text: "Shop Men", link: "/collections/bestsellers-men" },
            { text: "Shop Women", link: "/collections/bestsellers-women" },
          ],
        },
      ],
    },
  },

  /* ── 4. Large Product Carousel (Featured) ─────────────── */
  {
    id: "ai-featured-carousel",
    type: "aiLargeProductCarousel",
    props: {
      tabs: [
        {
          label: "Bestsellers",
          products: [
            {
              title: "Classic Runner",
              description: "Storm Grey (Light Sole)",
              price: "$60",
              compareAtPrice: "$120",
              image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
              link: "/products/classic-runner",
              mensLink: "/products/classic-runner-men",
              womensLink: "/products/classic-runner-women",
            },
            {
              title: "Urban Strider",
              description: "Medium Grey (Blizzard Sole)",
              price: "$62",
              compareAtPrice: "$125",
              image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
              link: "/products/urban-strider",
              mensLink: "/products/urban-strider-men",
              womensLink: "/products/urban-strider-women",
            },
            {
              title: "Comfort Slip-On",
              description: "Natural White (White Sole)",
              price: "$52",
              compareAtPrice: "$105",
              image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop",
              link: "/products/comfort-slip-on",
              mensLink: "/products/comfort-slip-on-men",
              womensLink: "/products/comfort-slip-on-women",
            },
            {
              title: "Mid Select",
              description: "Natural Black (Gum Sole)",
              price: "$65",
              compareAtPrice: "$130",
              image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&h=800&fit=crop",
              link: "/products/mid-select",
              mensLink: "/products/mid-select-men",
              womensLink: "/products/mid-select-women",
            },
            {
              title: "Trail Runner",
              description: "Deep Navy (Navy Sole)",
              price: "$48",
              compareAtPrice: "$120",
              image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
              link: "/products/trail-runner",
              mensLink: "/products/trail-runner-men",
              womensLink: "/products/trail-runner-women",
            },
          ],
        },
      ],
      dotsBackground: "#E7E4D3",
    },
  },

  /* ── 5. Promo Tiles (3-up) ────────────────────────────── */
  {
    id: "ai-promo-tiles",
    type: "aiPromoTiles",
    props: {
      tiles: [
        {
          title: "New Arrivals",
          image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&h=1000&fit=crop",
          buttons: [
            { text: "Shop Men", link: "/collections/new-men" },
            { text: "Shop Women", link: "/collections/new-women" },
          ],
        },
        {
          title: "Essentials",
          image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&h=1000&fit=crop",
          buttons: [
            { text: "Shop Men", link: "/collections/essentials-men" },
            { text: "Shop Women", link: "/collections/essentials-women" },
          ],
        },
        {
          title: "Limited Edition",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&h=1000&fit=crop",
          buttons: [
            { text: "Shop Men", link: "/collections/limited-men" },
            { text: "Shop Women", link: "/collections/limited-women" },
          ],
        },
      ],
    },
  },

  /* ── 6. Product Carousel (Sale/Standard) ──────────────── */
  {
    id: "ai-product-carousel",
    type: "aiProductCarousel",
    props: {
      tabs: [
        {
          label: "Sale",
          products: [
            {
              name: "Canvas Piper",
              colorway: "Deep Navy",
              price: "$45",
              compareAtPrice: "$90",
              image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop",
              link: "/products/canvas-piper",
              badge: "50% OFF",
              swatches: [{ color: "#263144", label: "Deep Navy" }],
            },
            {
              name: "Tree Topper",
              colorway: "Stormy Grey",
              price: "$55",
              compareAtPrice: "$110",
              image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
              link: "/products/tree-topper",
              badge: "50% OFF",
              swatches: [{ color: "#55595B", label: "Stormy Grey" }],
            },
            {
              name: "Comfort Slipper",
              colorway: "Natural White",
              price: "$37",
              compareAtPrice: "$75",
              image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop",
              link: "/products/comfort-slipper",
              badge: "50% OFF",
              swatches: [{ color: "#E7E4D3", label: "Natural White" }],
            },
            {
              name: "Strider Explore",
              colorway: "Rustic Green",
              price: "$65",
              compareAtPrice: "$130",
              image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=600&fit=crop",
              link: "/products/strider-explore",
              swatches: [{ color: "#4B4937", label: "Rustic Green" }],
            },
            {
              name: "Wool Runner",
              colorway: "Sienna Blush",
              price: "$55",
              compareAtPrice: "$110",
              image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop",
              link: "/products/wool-runner",
              swatches: [{ color: "#A46B57", label: "Sienna Blush" }],
            },
            {
              name: "Cruiser Remix",
              colorway: "Natural White",
              price: "$70",
              compareAtPrice: "$140",
              image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=600&fit=crop",
              link: "/products/cruiser-remix",
              swatches: [{ color: "#E7E4D3", label: "Natural White" }],
            },
            {
              name: "Lounger Lift",
              colorway: "Dark Grey",
              price: "$55",
              compareAtPrice: "$110",
              image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop",
              link: "/products/lounger-lift",
              badge: "NEW",
              swatches: [{ color: "#3B3B34", label: "Dark Grey" }],
            },
            {
              name: "Wool Strider",
              colorway: "Dark Grey",
              price: "$62",
              compareAtPrice: "$125",
              image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop",
              link: "/products/wool-strider",
              badge: "50% OFF",
              swatches: [{ color: "#3B3B34", label: "Dark Grey" }],
            },
          ],
        },
      ],
    },
  },

  /* ── 7. Value Props ───────────────────────────────────── */
  {
    id: "ai-value-props",
    type: "aiValueProps",
    props: {
      props: [
        {
          title: "Wear All Day Comfort",
          description: "Lightweight, bouncy, and wildly comfortable. Our products make any outing feel effortless. Slip in, lace up, or slide them on and enjoy the support.",
        },
        {
          title: "Sustainability In Every Step",
          description: "From materials to transport, we're working to reduce our carbon footprint to near zero. Holding ourselves accountable — it's not a 30-year goal, it's now.",
        },
        {
          title: "Materials From The Earth",
          description: "We replace petroleum-based synthetics with natural alternatives wherever we can. They're soft, breathable, and better for the planet — win, win, win.",
        },
      ],
    },
  },

  /* ── 8. Footer ────────────────────────────────────────── */
  {
    id: "ai-footer",
    type: "aiFooter",
    props: {
      showNewsletter: true,
      newsletterHeading: "Subscribe to our emails",
      columns: [
        {
          title: "Help",
          links: [
            { text: "Live Chat", link: "/contact" },
            { text: "FAQ", link: "/faq" },
            { text: "Returns & Exchanges", link: "/returns" },
            { text: "Contact Us", link: "/contact" },
          ],
        },
        {
          title: "Shop",
          links: [
            { text: "Men's", link: "/collections/men" },
            { text: "Women's", link: "/collections/women" },
            { text: "New Arrivals", link: "/collections/new" },
            { text: "Sale", link: "/collections/sale" },
            { text: "Gift Cards", link: "/gift-cards" },
          ],
        },
        {
          title: "Company",
          links: [
            { text: "Our Story", link: "/about" },
            { text: "Sustainability", link: "/sustainability" },
            { text: "Careers", link: "/careers" },
            { text: "Press", link: "/press" },
            { text: "Blog", link: "/blog" },
          ],
        },
      ],
      socialLinks: [
        { platform: "Instagram", url: "#" },
        { platform: "Twitter", url: "#" },
        { platform: "Facebook", url: "#" },
        { platform: "TikTok", url: "#" },
      ],
      copyrightText: "© 2026 Store Name. All rights reserved.",
    },
  },
];
