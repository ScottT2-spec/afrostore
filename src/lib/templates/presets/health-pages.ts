import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Health (Pills) template — default page block content.
 * These blocks are seeded into the DB so pages are editable from day one.
 * Uses the health-specific block components (healthAboutPage, healthContactPage, etc.).
 */

/* ── ABOUT PAGE ─────────────────────────────────────────────── */
export const HEALTH_ABOUT_BLOCKS: EditorNode[] = [
  {
    id: "health-about-page",
    type: "healthAboutPage",
    settings: {
      heroTitle: "About Us",
      heroSubtitle: "Our mission is to make you healthy and happy, for this we use only natural and high-quality ingredients necessary to achieve an extraordinary effect.",
      heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
      storyTitle: "Our Story",
      storyText: "We started with a simple belief: everyone deserves access to clean, effective supplements. Our team of nutritionists and wellness experts carefully selects every ingredient, ensuring that each product meets the highest standards of quality and purity. From sourcing to formulation, we prioritize transparency and trust.",
      storyImage: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800&q=80&auto=format&fit=crop",
      missionTitle: "Our Mission",
      missionText: "Help customers build healthy routines without confusion or hype. We believe in science-backed formulas, honest labeling, and supplements that actually work.",
      features: [
        { icon: "🧪", title: "Tested Formulas", description: "Every product is third-party tested for purity, potency, and safety before it reaches you." },
        { icon: "🌿", title: "Natural Ingredients", description: "We prioritize plant-based, non-GMO ingredients sourced from trusted global suppliers." },
        { icon: "🛡️", title: "Quality Guaranteed", description: "GMP-certified manufacturing ensures consistent quality in every batch we produce." },
        { icon: "💚", title: "Daily Wellness", description: "Designed for everyday use to support energy, sleep, immunity, and overall balance." },
      ],
      teamTitle: "Medical Experts",
      teamSubtitle: "Meet the professionals behind our formulations",
      team: [
        { name: "Dr. Sarah Mitchell", role: "Chief Nutritionist", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format&fit=crop" },
        { name: "Dr. James Carter", role: "Formulation Specialist", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop" },
        { name: "Emily Rodriguez", role: "Wellness Advisor", image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80&auto=format&fit=crop" },
        { name: "Dr. Michael Chen", role: "Quality Assurance", image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80&auto=format&fit=crop" },
      ],
    },
  },
];

/* ── CONTACT PAGE ───────────────────────────────────────────── */
export const HEALTH_CONTACT_BLOCKS: EditorNode[] = [
  {
    id: "health-contact-page",
    type: "healthContactPage",
    settings: {
      heroTitle: "Contact Us",
      heroSubtitle: "Have a question about our products or need help with your order? We're here to help you on your wellness journey.",
      address: "123 Wellness Ave, Portland, OR 97201",
      phone: "(503) 555-0123",
      email: "hello@store.com",
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
      formTitle: "Send Us a Message",
      formSubtitle: "We typically respond within 24 hours",
      faqTitle: "Frequently Asked Questions",
      faqs: [
        { question: "Can you recommend a supplement routine?", answer: "Describe your needs and our wellness team can suggest a simple starting point tailored to your goals." },
        { question: "Do you offer bulk or subscription pricing?", answer: "Yes! We offer discounts on repeat orders and bulk purchases. Contact us for custom pricing." },
        { question: "How do I know which vitamins to take?", answer: "We recommend reading our ingredient guides and speaking with a healthcare professional for personalized advice." },
        { question: "What is your return policy?", answer: "We accept returns within 30 days of purchase for unopened products. Contact us to initiate a return." },
        { question: "Do you ship internationally?", answer: "Currently we ship within the US. International shipping is coming soon — subscribe to our newsletter for updates." },
      ],
    },
  },
];

/* ── BLOG PAGE ──────────────────────────────────────────────── */
export const HEALTH_BLOG_BLOCKS: EditorNode[] = [
  {
    id: "health-blog-page",
    type: "healthBlogPage",
    settings: {
      heroTitle: "Health & Wellness Blog",
      heroSubtitle: "Expert advice on vitamins, supplements, and building a healthier lifestyle.",
      featuredPost: {
        title: "What is fiber and why is it important for health?",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80&auto=format&fit=crop",
        date: "September 5, 2023",
        author: "Wellness Team",
        excerpt: "Fiber is one of the most underrated nutrients. Learn how it supports digestion, heart health, and sustained energy throughout the day.",
        category: "Nutrition",
      },
      posts: [
        { title: "5 ways to celebrate your mom on Mother's Day", image: "https://images.unsplash.com/photo-1608979048467-6194dabc6a3d?w=800&q=80&auto=format&fit=crop", date: "September 4, 2023", author: "Admin", category: "Motivation", excerpt: "Simple, meaningful gestures that go beyond flowers and cards." },
        { title: "Syncing Up for an Integrated Brain", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80&auto=format&fit=crop", date: "September 4, 2023", author: "Admin", category: "Health", excerpt: "How sleep, nutrition, and movement work together for cognitive clarity." },
        { title: "The Complete Guide to Vitamin D", image: "https://images.unsplash.com/photo-1585945037805-5fd82c2e60b1?w=800&q=80&auto=format&fit=crop", date: "August 28, 2023", author: "Dr. Sarah M.", category: "Vitamins", excerpt: "Why vitamin D matters, how much you need, and the best ways to get it." },
        { title: "Understanding Melatonin and Sleep Quality", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop", date: "August 20, 2023", author: "Wellness Team", category: "Sleep", excerpt: "A closer look at how melatonin supplements can support your natural sleep cycle." },
        { title: "Top 5 Supplements for Hair Health", image: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800&q=80&auto=format&fit=crop", date: "August 15, 2023", author: "Admin", category: "Hair", excerpt: "From biotin to collagen — the supplements that actually support healthy hair growth." },
        { title: "Allergy Season: Natural Relief Options", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format&fit=crop", date: "August 10, 2023", author: "Admin", category: "Health", excerpt: "Explore natural approaches to managing seasonal allergies alongside traditional treatments." },
      ],
      categories: ["All", "Health", "Nutrition", "Vitamins", "Sleep", "Motivation"],
    },
  },
];

/* ── INGREDIENTS PAGE ───────────────────────────────────────── */
export const HEALTH_INGREDIENTS_BLOCKS: EditorNode[] = [
  {
    id: "health-ingredients-page",
    type: "healthIngredientsPage",
    settings: {
      heroTitle: "Our Ingredients",
      heroSubtitle: "Transparency is at the heart of everything we do. Learn about the natural ingredients behind our supplements.",
      introTitle: "What Goes Into Our Products",
      introText: "Every ingredient is carefully selected for its proven benefits and sourced from trusted suppliers. We never use artificial fillers, synthetic dyes, or unnecessary additives.",
      ingredients: [
        { name: "Vitamin D3", icon: "☀️", description: "Essential for bone health, immune function, and mood regulation. Sourced from lanolin (sheep's wool) for high bioavailability." },
        { name: "Vitamin K2 (MK-7)", icon: "🌿", description: "Works synergistically with D3 to direct calcium to bones and teeth. Derived from fermented natto for maximum absorption." },
        { name: "Omega-3 (EPA & DHA)", icon: "🐟", description: "Premium fish oil supporting heart, brain, and joint health. Molecularly distilled to remove contaminants." },
        { name: "Melatonin", icon: "🌙", description: "A natural hormone that supports healthy sleep cycles. Our low-dose formula promotes restful sleep without grogginess." },
        { name: "Biotin (B7)", icon: "💇", description: "Supports healthy hair, skin, and nails. Water-soluble B vitamin that aids in keratin production." },
        { name: "Marine Collagen", icon: "✨", description: "Type I collagen peptides from wild-caught fish. Supports skin elasticity, joint comfort, and gut health." },
        { name: "Ashwagandha", icon: "🧘", description: "Adaptogenic herb used for centuries to support stress management, energy, and cognitive clarity." },
        { name: "Zinc Picolinate", icon: "🛡️", description: "Highly absorbable form of zinc supporting immune function, wound healing, and cellular metabolism." },
      ],
      ctaTitle: "Ready to Start Your Wellness Journey?",
      ctaText: "Explore our full range of supplements made with these trusted ingredients.",
      ctaButtonText: "Shop All Products",
      ctaButtonLink: "/shop",
    },
  },
];

/* ── MEDICAL EXPERTS PAGE ─────────────────────────────────────── */
export const HEALTH_MEDICAL_EXPERTS_BLOCKS: EditorNode[] = [
  {
    id: "health-medical-experts-page",
    type: "healthMedicalExpertsPage",
    settings: {
      heroTitle: "Medical Experts",
      heroSubtitle: "Meet the professionals behind our formulations",
      heroImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop",
      introTitle: "Our Team of Professionals",
      introText: "Our formulations are developed by a team of certified nutritionists, doctors, and wellness experts who are passionate about helping you achieve your health goals.",
      experts: [
        { name: "Dr. Sarah Mitchell", role: "Chief Nutritionist", image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80&auto=format&fit=crop", bio: "PhD in Nutritional Science with 15+ years of experience in dietary supplement research and development." },
        { name: "Dr. James Carter", role: "Formulation Specialist", image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80&auto=format&fit=crop", bio: "Board-certified pharmacist specializing in bioavailability and nutrient absorption optimization." },
        { name: "Emily Rodriguez", role: "Wellness Advisor", image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80&auto=format&fit=crop", bio: "Certified holistic health coach focused on integrative wellness approaches and lifestyle medicine." },
        { name: "Dr. Michael Chen", role: "Quality Assurance", image: "https://images.unsplash.com/photo-1608979048467-6194dabc6a3d?w=800&q=80&auto=format&fit=crop", bio: "Expert in GMP compliance and third-party testing protocols ensuring product purity and safety." },
      ],
      ctaTitle: "Need Help Choosing?",
      ctaText: "Our team is here to help you find the right supplements for your needs.",
      ctaButtonText: "Contact Us",
      ctaButtonLink: "/contact",
    },
  },
];

/** Map slug → default blocks for health template pages */
export const HEALTH_PAGE_BLOCKS: Record<string, EditorNode[]> = {
  about: HEALTH_ABOUT_BLOCKS,
  contact: HEALTH_CONTACT_BLOCKS,
  blog: HEALTH_BLOG_BLOCKS,
  ingredients: HEALTH_INGREDIENTS_BLOCKS,
  "medical-experts": HEALTH_MEDICAL_EXPERTS_BLOCKS,
};
