import type { EditorNode } from "@/lib/visual-editor/node-tree";

export const PERFUMES_ABOUT_PRESET: EditorNode[] = [
  {
    id: "perfumes-about-welcome",
    type: "perfumesAboutWelcome",
    settings: {
      title: "Welcome to Our Fragrances",
      text: "At our Fragrances, we believe that scent is more than just an aroma — it's an experience. Inspired by the richness of nature, we craft sophisticated fragrances that bring warmth, elegance, and personality to every moment. Our carefully curated collections blend the finest natural ingredients, creating timeless scents that leave a lasting impression.",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1000&q=80&auto=format&fit=crop",
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
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Natural Ingredients", desc: "We use responsibly sourced, high-quality natural ingredients for an authentic experience." },
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Artisanal Craftsmanship", desc: "Each fragrance is carefully developed by expert perfumers with a deep passion for artistry." },
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Sustainable & Ethical", desc: "We are committed to sustainability, using eco-friendly packaging and ingredients." },
        { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", title: "Luxury Experience", desc: "From elegant bottles to exquisite scents, every fragrance is designed to offer a journey." },
      ],
    },
  },
];
