import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Perfumes Template Page Presets
 * Using new rich content block types with EXACT content from hardcoded JSX
 * Content extracted verbatim from existing perfumes preset files - no placeholders
 */

export const PERFUMES_HOME_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "perfumes-hero",
    type: "perfumesHeroSlider",
          settings: {
        autoplaySpeed: 6000,
      minHeight: "100vh"
      },
      elements: [
        {
          id: "perfumes-hero-slide-1",
          type: "slide",
          settings:           {
            "title": "Opus Essence",
            "bottleImage": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80&auto=format&fit=crop",
            "backgroundColor": "#1a1a2e",
            "buttonText": "Buy now",
            "buttonLink": "/shop",
            "buttonStyle": "primary"
          },
          elements: [],
        },
        {
          id: "perfumes-hero-slide-2",
          type: "slide",
          settings:           {
            "title": "New Fragrance in the Opus Essence",
            "bottleImage": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80&auto=format&fit=crop",
            "backgroundColor": "#2d1b4e",
            "buttonText": "Buy now",
            "buttonLink": "/shop",
            "buttonStyle": "primary"
          },
          elements: [],
        },
        {
          id: "perfumes-hero-slide-3",
          type: "slide",
          settings:           {
            "title": "Deep Fragrance With a Refined Intensity",
            "bottleImage": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80&auto=format&fit=crop",
            "backgroundColor": "#0d1b2a",
            "buttonText": "Buy now",
            "buttonLink": "/shop",
            "buttonStyle": "black"
          },
          elements: [],
        }
      ],
  },
  {
    id: "perfumes-new-in",
    type: "perfumesProductGrid",
    settings: {
      columns: 3,
      maxProducts: 6,
      sectionTitle: "New In",
      filter: "new-arrival",
      products: [],
    },
  },
  {
    id: "perfumes-olfactory",
    type: "perfumesOlfactoryTags",
    settings: {
      title: "Shop by Olfactory Family",
      tags: [
        { name: "Floral", link: "/shop" },
        { name: "Woody", link: "/shop" },
        { name: "Amber", link: "/shop" },
        { name: "Chypre", link: "/shop" },
        { name: "Leather", link: "/shop" },
        { name: "Aldehyde", link: "/shop" },
        { name: "Spicy", link: "/shop" },
      ],
    },
  },
  {
    id: "perfumes-marquee",
    type: "perfumesMarquee",
    settings: {
      items: ["Ember Glow", "Golden Veil", "Midnight Azure", "Nocturne Essence", "Étheria"],
      speed: "45s",
    },
  },
  {
    id: "perfumes-featured-banners",
    type: "perfumesFeaturedBanners",
    settings: {
      banners: [
        {
          title: "Light Fragrance with a Silky Touch",
          subtitle: "A collection of delicate, weightless fragrances",
          description: "A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and gentle citruses.",
          backgroundImage: "https://images.unsplash.com/photo-1458538977777-0549b2370168?w=800&q=80&auto=format&fit=crop",
          link: "/shop",
        },
        {
          title: "Deep Fragrance With a Refined Intensity",
          subtitle: "A collection of fresh, luminous scents",
          description: "A collection of fresh, luminous scents inspired by the mystery of nightfall. Crisp citruses, airy florals, and cool musks.",
          backgroundImage: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80&auto=format&fit=crop",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "perfumes-tabbed",
    type: "perfumesTabbedProducts",
    settings: {
      title: "Promotional Offers",
      tabs: [
        { label: "All" },
        { label: "For Her", filterTag: "for-her" },
        { label: "For Him", filterTag: "for-him" },
      ],
      columns: 3,
      maxProducts: 6,
      products: [],
    },
  },
  {
    id: "perfumes-collection-banners",
    type: "perfumesCollectionBanners",
    settings: {
      sectionTitle: "Velours Noir SALE Collection",
      banners: [
        {
          title: "Get up to 20% off",
          image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80&auto=format&fit=crop",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "perfumes-blog",
    type: "perfumesBlogArticles",
    settings: {
      sectionTitle: "Journal Articles",
      columns: 5,
      posts: [],
    },
  },
  {
    id: "perfumes-instagram",
    type: "perfumesInstagram",
    settings: {
      handle: "@xtemos.studio",
      handleLink: "https://www.instagram.com/",
      items: [],
    },
  },
  {
    id: "perfumes-footer",
    type: "perfumesFooter",
    settings: {
      storeName: "Perfumes",
      storeSlug: "perfumes",
      description: "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle.",
    },
  },
];

export const PERFUMES_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "perfumes-about-welcome",
    type: "perfumesAboutWelcome",
    settings: {
      title: "Welcome to Our Fragrances",
      text: "At our Fragrances, we believe that scent is more than just an aroma — it's an experience. Inspired by the richness of nature, we craft sophisticated fragrances that bring warmth, elegance, and personality to every moment. Our carefully curated collections blend the finest natural ingredients, creating timeless scents that leave a lasting impression.",
      image: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=800&q=80&auto=format&fit=crop",
    },
  },
  {
    id: "perfumes-about-marquee",
    type: "perfumesAboutMarquee",
    settings: {
      items: ["Ethereal", "Sensory", "Signature"],
    },
  },
  {
    id: "perfumes-about-story",
    type: "perfumesAboutStory",
    settings: {
      title: "Our Story",
      text: "The journey of our Fragrances began in a small family workshop in Provence, France. Founded by master perfumer Louis Beaumont in 1987, our brand was born from a passion for nature's raw beauty and the art of perfumery. Inspired by the rich scents of wood, earth, and blooming florals, Louis spent years perfecting his craft, blending rare ingredients to create signature fragrances. What started as a modest venture quickly grew into an internationally recognized brand, known for its commitment to quality, sustainability, and innovation. Today, our Fragrances continues this legacy, offering exquisite scents that transport you to a world of timeless elegance.",
      faqItems: [
        { q: "What makes our fragrances unique?", a: "Each fragrance is meticulously crafted using the finest natural ingredients sourced from around the world. Our master perfumers combine traditional techniques with innovative approaches to create scents that are truly one of a kind." },
        { q: "Are your products cruelty-free?", a: "Yes, all our products are 100% cruelty-free. We never test on animals and we work only with suppliers who share our commitment to ethical practices." },
        { q: "How long do your fragrances last?", a: "Our Eau de Parfum formulations are designed to last 8-12 hours on skin. For best results, apply to pulse points and moisturized skin." },
        { q: "Do you offer sample sizes?", a: "Yes! We offer 2ml sample sizes for most of our fragrances so you can discover your perfect scent before committing to a full bottle." },
        { q: "How should I store my perfume?", a: "Store your fragrances in a cool, dry place away from direct sunlight and heat. Keep the bottle tightly closed when not in use to preserve the scent." },
      ],
    },
  },
  {
    id: "perfumes-about-why",
    type: "perfumesWhyChooseUs",
    settings: {
      title: "Why Choose Us?",
      items: [
        { icon: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?w=800&q=80&auto=format&fit=crop", title: "Natural Ingredients", desc: "We use responsibly sourced, high-quality natural ingredients for an authentic experience." },
        { icon: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80&auto=format&fit=crop", title: "Artisanal Craftsmanship", desc: "Each fragrance is carefully developed by expert perfumers with a deep passion for artistry." },
        { icon: "https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?w=800&q=80&auto=format&fit=crop", title: "Sustainable & Ethical", desc: "We are committed to sustainability, using eco-friendly packaging and ingredients." },
        { icon: "https://images.unsplash.com/photo-1595425959632-34f2822322ce?w=800&q=80&auto=format&fit=crop", title: "Luxury Experience", desc: "From elegant bottles to exquisite scents, every fragrance is designed to offer a journey." },
      ],
    },
  },
];

export const PERFUMES_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "perfumes-contact-hero",
    type: "perfumesContactHero",
    settings: {
      title: "Contact Us",
    },
  },
  {
    id: "perfumes-contact-info",
    type: "perfumesContactInfo",
    settings: {
      items: [
        { label: "Our Address", value: "123 Perfume Lane, Paris, France" },
        { label: "Phone Number", value: "+33 1 23 45 67 89" },
        { label: "Business Hours", value: "Monday – Friday: 9 AM – 6 PM<br />Saturday–Sunday: Closed" },
        { label: "Follow Us", value: "", type: "social" },
      ],
    },
  },
  {
    id: "perfumes-contact-form",
    type: "perfumesContactForm",
    settings: {
      title: "Get In Touch",
      description: "We'd love to hear from you! Whether you have a question, need assistance, or simply want to learn more about our fragrances, reach out to us. Fill in the form below, and we'll get back to you as soon as possible.",
    },
  },
  {
    id: "perfumes-branded-stores",
    type: "perfumesBrandedStores",
    settings: {
      title: "Our Branded Stores",
      stores: [
        { name: "Paris Store", phone: "+33 1 23 45 67 89", address: "1 Bd Saint-Germain, 75005 Paris" },
        { name: "Brussels Store", phone: "+33 1 23 45 67 89", address: "Rue du Grand Cerf 2, 1000 Bruxelles, Belgium" },
        { name: "London Store", phone: "+33 1 23 45 67 89", address: "229-247 Regent St., London W1B 2EG, United Kingdom" },
      ],
    },
  },
];

export const PERFUMES_FRAGRANCES_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "perfumes-fragrances-hero",
    type: "perfumesPageHero",
    settings: {
      title: "Fragrances",
      subtitle: "Discover Our Collections",
      backgroundImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80&auto=format&fit=crop",
    },
  },
  {
    id: "perfumes-collections-grid",
    type: "perfumesCollectionsGrid",
    settings: {
      title: "Collections",
      collections: [
        { 
          name: "Étheria", 
          slug: "etheria", 
          description: "A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and dewy accords.",
          image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80&auto=format&fit=crop"
        },
        { 
          name: "Celeste Aura", 
          slug: "celeste-aura", 
          description: "Elegant fragrances blending vibrant citrus, shimmering aldehydes, and refined light woods creating an aura of inner glow.",
          image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80&auto=format&fit=crop"
        },
        { 
          name: "Opus Essence", 
          slug: "opus-essence", 
          description: "Rich, complex compositions. Deep florals, precious woods, and warm ambers create a multidimensional fragrance experience.",
          image: "https://images.unsplash.com/photo-1458538977777-0549b2370168?w=800&q=80&auto=format&fit=crop"
        },
        { 
          name: "Velours Noir", 
          slug: "velours-noir", 
          description: "Dark, velvety fragrances with depth and mystery. Smoky oud, leather accords, and black vanilla.",
          image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80&auto=format&fit=crop"
        },
        { 
          name: "Nocturne Essence", 
          slug: "nocturne-essence", 
          description: "Fragrances inspired by nightfall. Cool musks, aromatic herbs, and dark spices capture twilight elegance.",
          image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80&auto=format&fit=crop"
        },
        { 
          name: "Elysian Bloom", 
          slug: "elysian-bloom", 
          description: "Fresh, green fragrances celebrating nature. Dewy petals, crisp leaves, and earthy vetiver.",
          image: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=800&q=80&auto=format&fit=crop"
        },
      ],
    },
  },
  {
    id: "perfumes-featured-products",
    type: "perfumesFeaturedProducts",
    settings: {
      title: "Featured Fragrances",
      subtitle: "Our most beloved scents",
      maxProducts: 6,
    },
  },
];

export const PERFUMES_JOURNAL_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "perfumes-journal-hero",
    type: "perfumesPageHero",
    settings: {
      title: "Journal",
      subtitle: "Explore Our Stories",
      backgroundImage: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?w=800&q=80&auto=format&fit=crop",
    },
  },
  {
    id: "perfumes-journal-grid",
    type: "perfumesJournalGrid",
    settings: {
      title: "Journal Articles",
      subtitle: "Discover the art of fragrance",
      columns: 3,
      maxPosts: 6,
    },
  },
  {
    id: "perfumes-featured-posts",
    type: "perfumesFeaturedPosts",
    settings: {
      title: "Latest Stories",
      subtitle: "Discover the art of fragrance",
      maxPosts: 3,
    },
  },
];

export const PERFUMES_REVIEWS_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "perfumes-reviews-hero",
    type: "perfumesReviewsHero",
    settings: {
      title: "Reviews",
    },
  },
  {
    id: "perfumes-reviews-grid",
    type: "perfumesReviewsGrid",
    settings: {
      columns: 3,
    },
  },
];
