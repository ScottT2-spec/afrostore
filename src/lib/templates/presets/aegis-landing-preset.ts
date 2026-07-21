import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

export const AEGIS_LANDING_PRESET: TemplateBlock[] = [
  {
    id: "aegis-header",
    type: "aegisHeader",
    props: {
      brandName: "Aegis Health",
      navLinks: [
        { label: "Our Mission", href: "#", active: true },
        { label: "Get Tested", href: "#" },
        { label: "Programs", href: "#" },
        { label: "Impact", href: "#" },
        { label: "Join Us", href: "#" },
      ],
      portalText: "Patient Portal",
      ctaText: "Donate",
    },
  },
  {
    id: "aegis-hero",
    type: "aegisHero",
    props: {
      titleLine1: "Living Beyond,",
      titleLine2: "Living Well.",
      description: "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
      primaryButtonText: "Get Tested Today",
      primaryButtonLink: "#",
      secondaryButtonText: "View Care Programs",
      secondaryButtonLink: "#",
      backgroundImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=900&fit=crop",
      stats: [
        { value: "15k+", label: "Tests Provided", style: "light" },
        { value: "200+", label: "Clinics Supported", style: "primary" },
        { value: "98%", label: "Retention in Care", style: "secondary" },
        { value: "Global", label: "Advocacy Impact", style: "surface" },
      ],
    },
  },
  {
    id: "aegis-services",
    type: "aegisServices",
    props: {
      subtitle: "Our Approach",
      title: "Innovative Care,\nPersonalized Journeys",
      description: "Healthcare is never one-size-fits-all. We combine cutting-edge biomedical research with a deeply human touch to ensure every individual thrives.",
      linkText: "Explore our medical protocols",
      linkHref: "#",
      cards: [
        { icon: "biotech", title: "Advanced Screening", description: "Rapid, confidential testing using the latest generation diagnostic technology for immediate peace of mind.", accent: true },
        { icon: "diversity_3", title: "Peer Support", description: "Connecting you with a community that understands the journey, fostering resilience through shared experience.", accent: false },
        { icon: "policy", title: "Advocacy", description: "Fighting for policy changes and removing the stigma surrounding HIV/AIDS at local and national levels.", accent: false },
        { icon: "medication", title: "ART Access", description: "Ensuring uninterrupted access to life-saving Antiretroviral Therapy for all community members.", accent: true },
      ],
    },
  },
  {
    id: "aegis-stories",
    type: "aegisStories",
    props: {
      sectionTitle: "Stories of Resilience",
      storyImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=500&fit=crop",
      storyBadge: "Advocate Story",
      storyQuote: "\"My diagnosis was a beginning, not an end.\"",
      storyAuthor: "— Marcus, 12 years thriving with Aegis support.",
      testimonialQuote: "\"The team at Aegis didn't just give me medicine; they gave me my dignity back. They saw the person, not the patient.\"",
      testimonialName: "Elena Rodriguez",
      testimonialRole: "Community Member since 2018",
      testimonialAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
  },
  {
    id: "aegis-cta",
    type: "aegisCTA",
    props: {
      title: "Take the first step towards clarity.",
      description: "Confidential, free, and compassionate testing is available at all our partner clinics. No appointment necessary for initial screening.",
      primaryButtonText: "Find a Clinic Near You",
      primaryButtonLink: "#",
      secondaryButtonText: "Speak with a Specialist",
      secondaryButtonLink: "#",
    },
  },
  {
    id: "aegis-footer",
    type: "aegisFooter",
    props: {
      brandName: "Aegis Health",
      tagline: "Dedicated to a world where health is a right, and every life is celebrated.",
      columns: [
        { title: "Resources", links: [{ label: "Testing Centers", href: "#" }, { label: "Patient Education", href: "#" }, { label: "PrEP & PEP Info", href: "#" }] },
        { title: "Quick Links", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }, { label: "Newsletter Signup", href: "#" }, { label: "Contact Us", href: "#" }] },
      ],
      socialIcons: [
        { icon: "share", href: "#" },
        { icon: "mail", href: "#" },
      ],
      copyright: "© 2024 Aegis Health.",
    },
  },
];
