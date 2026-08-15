/**
 * Template Sample Data — Products, Categories & Blogs for ALL templates
 * Seeded as real DB records when a merchant picks a template.
 * Merchants can edit/delete everything from their dashboard.
 */

export interface SampleCategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  position?: number;
}

export interface SampleProduct {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  isFeatured?: boolean;
  tags?: string[];
  position?: number;
  images?: string[];
  category?: string; // matches SampleCategory.slug
}

export interface SampleBlog {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
}

export interface TemplateSampleData {
  categories: SampleCategory[];
  products: SampleProduct[];
  blogs: SampleBlog[];
}

// ═══════════════════════════════════════════════════════════════
//  ELECTRONICS
// ═══════════════════════════════════════════════════════════════

const ELECTRONICS: TemplateSampleData = {
  categories: [
    { name: "Smartphones", slug: "smartphones", description: "Latest smartphones and mobile devices", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop", position: 0 },
    { name: "Laptops", slug: "laptops", description: "Laptops and notebooks for work and play", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", position: 1 },
    { name: "Audio", slug: "audio", description: "Headphones, speakers and audio equipment", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", position: 2 },
    { name: "Gaming", slug: "gaming", description: "Gaming consoles, accessories and peripherals", image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop", position: 3 },
    { name: "Accessories", slug: "accessories", description: "Phone cases, chargers and tech accessories", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop", position: 4 },
  ],
  products: [
    { name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.", price: 299, compareAtPrice: 399, stock: 25, isFeatured: true, tags: ["featured", "new-arrival", "bestseller"], position: 1, category: "audio", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=700&fit=crop"] },
    { name: "Smart Watch Pro", slug: "smart-watch-pro", description: "Advanced smartwatch with health monitoring, GPS, and water resistance up to 50m.", price: 449, stock: 18, isFeatured: true, tags: ["featured", "new-arrival"], position: 2, category: "accessories", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=700&fit=crop"] },
    { name: "Ultra-Slim Laptop 15\"", slug: "ultra-slim-laptop-15", description: "Lightweight laptop with M2 chip, 16GB RAM, and stunning Retina display.", price: 1299, compareAtPrice: 1499, stock: 12, isFeatured: true, tags: ["featured", "sale"], position: 3, category: "laptops", images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=700&fit=crop"] },
    { name: "Wireless Earbuds", slug: "wireless-earbuds", description: "True wireless earbuds with crystal-clear sound and 8-hour battery life.", price: 149, stock: 40, isFeatured: true, tags: ["featured", "bestseller"], position: 4, category: "audio", images: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=700&fit=crop"] },
    { name: "Gaming Controller", slug: "gaming-controller", description: "Ergonomic wireless controller with customizable buttons and haptic feedback.", price: 69, stock: 50, isFeatured: false, tags: ["new-arrival"], position: 5, category: "gaming", images: ["https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&h=700&fit=crop"] },
    { name: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker", description: "Waterproof portable speaker with 360° sound and 20-hour playtime.", price: 99, compareAtPrice: 129, stock: 30, isFeatured: false, tags: ["sale", "bestseller"], position: 6, category: "audio", images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=700&fit=crop"] },
    { name: "Smartphone Pro Max", slug: "smartphone-pro-max", description: "Flagship smartphone with triple camera system, 5G, and all-day battery.", price: 999, stock: 20, isFeatured: true, tags: ["featured", "new-arrival"], position: 7, category: "smartphones", images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=700&fit=crop"] },
    { name: "Mechanical Keyboard", slug: "mechanical-keyboard", description: "RGB mechanical keyboard with hot-swappable switches and USB-C.", price: 89, stock: 35, isFeatured: false, tags: ["new-arrival"], position: 8, category: "gaming", images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=700&fit=crop"] },
    { name: "USB-C Hub 7-in-1", slug: "usb-c-hub-7-in-1", description: "Multi-port adapter with HDMI, USB 3.0, SD card reader, and PD charging.", price: 49, stock: 60, isFeatured: false, tags: ["bestseller"], position: 9, category: "accessories", images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=700&fit=crop"] },
    { name: "Wireless Charging Pad", slug: "wireless-charging-pad", description: "Fast wireless charger compatible with all Qi-enabled devices.", price: 29, stock: 80, isFeatured: false, tags: ["sale"], position: 10, category: "accessories", images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "Top 10 Tech Gadgets You Need in 2026", slug: "top-10-tech-gadgets-2026", excerpt: "Discover the must-have tech gadgets that are shaping 2026...", content: "Technology continues to evolve at a rapid pace, and 2026 is no exception. From AI-powered wearables to revolutionary audio devices, here are the top 10 gadgets that deserve a spot in your collection.\n\nWhether you're a tech enthusiast or just looking to upgrade your daily essentials, these picks offer the perfect blend of innovation and practicality.", coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop", author: "Tech Team", category: "Tech Reviews", tags: ["gadgets", "tech", "2026"] },
    { title: "How to Choose the Right Laptop for Your Needs", slug: "how-to-choose-right-laptop", excerpt: "A comprehensive guide to finding the perfect laptop...", content: "Choosing a laptop can be overwhelming with so many options available. This guide breaks down the key factors to consider: processor, RAM, storage, display, and battery life.\n\nFor students, a lightweight ultrabook with good battery life is ideal. For creators, look for a dedicated GPU and colour-accurate display. For gamers, prioritise high refresh rate displays and powerful graphics cards.", coverImage: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop", author: "Tech Team", category: "Buying Guide", tags: ["laptop", "guide", "tips"] },
    { title: "The Future of Wireless Audio Technology", slug: "future-wireless-audio", excerpt: "Exploring the latest advancements in wireless audio...", content: "Wireless audio has come a long way from the early days of Bluetooth. Today's headphones and earbuds offer lossless audio, spatial sound, and intelligent noise cancellation.\n\nWith the advent of Bluetooth LE Audio and LC3 codec, we're entering an era where wireless can truly rival wired audio quality. Here's what to expect in the coming years.", coverImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop", author: "Audio Expert", category: "Industry News", tags: ["audio", "wireless", "future"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  BAKERY (sweets-bakery)
// ═══════════════════════════════════════════════════════════════

const BAKERY: TemplateSampleData = {
  categories: [
    { name: "Cupcakes", slug: "cupcakes", description: "Freshly baked cupcakes in a variety of flavours", image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop", position: 0 },
    { name: "Macaroons", slug: "macaroons", description: "Delicate French macaroons with premium fillings", image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=400&fit=crop", position: 1 },
    { name: "Cakes", slug: "cakes", description: "Custom cakes for every occasion", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", position: 2 },
    { name: "Cookies", slug: "cookies", description: "Artisan cookies baked with love", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop", position: 3 },
    { name: "Waffles", slug: "waffles", description: "Crispy Belgian waffles", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=400&fit=crop", position: 4 },
  ],
  products: [
    { name: "White Cake", slug: "white-cake", description: "Classic white cake with vanilla frosting, perfect for celebrations.", price: 45, stock: 10, isFeatured: true, tags: ["featured", "bestseller"], position: 1, category: "cakes", images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=700&fit=crop"] },
    { name: "Raspberry Pie", slug: "raspberry-pie", description: "Fresh raspberry pie with a buttery crust and sweet glaze.", price: 35, stock: 8, isFeatured: true, tags: ["featured", "new-arrival"], position: 2, category: "cakes", images: ["https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&h=700&fit=crop"] },
    { name: "Chocolate Cake", slug: "chocolate-cake", description: "Rich chocolate cake with ganache frosting and cocoa layers.", price: 55, stock: 12, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "cakes", images: ["https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=700&fit=crop"] },
    { name: "Honey Waffles", slug: "honey-waffles", description: "Crispy Belgian waffles drizzled with honey and served warm.", price: 18, stock: 20, isFeatured: true, tags: ["featured"], position: 4, category: "waffles", images: ["https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&h=700&fit=crop"] },
    { name: "Muffin Cake", slug: "muffin-cake", description: "Fluffy muffin with blueberry filling and sugar topping.", price: 12, stock: 30, isFeatured: false, tags: ["new-arrival"], position: 5, category: "cupcakes", images: ["https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&h=700&fit=crop"] },
    { name: "Berry Cupcakes", slug: "berry-cupcakes", description: "Mixed berry cupcakes with cream cheese frosting.", price: 15, compareAtPrice: 18, stock: 25, isFeatured: false, tags: ["sale", "bestseller"], position: 6, category: "cupcakes", images: ["https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&h=700&fit=crop"] },
    { name: "French Macaroons Set", slug: "french-macaroons-set", description: "Assortment of 12 classic French macaroons in vibrant colours.", price: 28, stock: 15, isFeatured: true, tags: ["featured", "bestseller"], position: 7, category: "macaroons", images: ["https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&h=700&fit=crop"] },
    { name: "Chocolate Chip Cookies", slug: "chocolate-chip-cookies", description: "Classic chocolate chip cookies, crispy outside and chewy inside.", price: 10, stock: 50, isFeatured: false, tags: ["bestseller"], position: 8, category: "cookies", images: ["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "The Art of French Pastry Making", slug: "art-of-french-pastry", excerpt: "Learn the secrets behind perfect French pastries...", content: "French pastry is an art form that requires patience, precision, and passion. From croissants to macaroons, each item demands attention to detail.\n\nThe key to great pastry starts with quality butter and flour. Temperature control is crucial — your butter should be cold for flaky pastry and room temperature for cakes.\n\nIn this guide, we share the fundamental techniques that every baker should master.", coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop", author: "Chef Baker", category: "Baking Tips", tags: ["pastry", "french", "tips"] },
    { title: "5 Easy Cake Decorating Ideas", slug: "easy-cake-decorating", excerpt: "Simple yet stunning cake decoration techniques for beginners...", content: "You don't need to be a professional to create beautiful cakes. These five simple decorating techniques will transform your homemade cakes into showstoppers.\n\nFrom rustic buttercream finishes to elegant drip cakes, we cover techniques that anyone can master with a bit of practice.\n\nAll you need is a turntable, an offset spatula, and some creativity.", coverImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop", author: "Pastry Team", category: "Tutorials", tags: ["cake", "decorating", "beginner"] },
    { title: "The History of the Belgian Waffle", slug: "history-belgian-waffle", excerpt: "Discover the fascinating origin of the beloved Belgian waffle...", content: "The Belgian waffle has a rich history dating back to the Middle Ages. Originally served at church fairs, it evolved into the beloved treat we know today.\n\nThere are actually two types: the Brussels waffle (rectangular, light and crispy) and the Liège waffle (round, dense and sweet). Both have their devoted fans.\n\nToday, Belgian waffles are enjoyed worldwide with toppings ranging from simple powdered sugar to elaborate fruit and cream combinations.", coverImage: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&h=600&fit=crop", author: "Food Historian", category: "Food History", tags: ["waffles", "history", "belgian"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  COSMETICS
// ═══════════════════════════════════════════════════════════════

const COSMETICS: TemplateSampleData = {
  categories: [
    { name: "Skincare", slug: "skincare", description: "Cleansers, moisturizers, and treatments for all skin types", image: "https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=400&h=400&fit=crop", position: 0 },
    { name: "Serums & Oils", slug: "serums-oils", description: "Concentrated formulas for targeted skin concerns", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop", position: 1 },
    { name: "Face Masks", slug: "face-masks", description: "Revitalizing masks for every skin need", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop", position: 2 },
    { name: "Lip Care", slug: "lip-care", description: "Balms, scrubs and treatments for soft lips", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop", position: 3 },
    { name: "Body Care", slug: "body-care", description: "Lotions, scrubs and body treatments", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop", position: 4 },
  ],
  products: [
    { name: "Hydrating Face Serum", slug: "hydrating-face-serum", description: "Lightweight hyaluronic acid serum that deeply hydrates and plumps the skin.", price: 42, compareAtPrice: 55, stock: 30, isFeatured: true, tags: ["featured", "bestseller"], position: 1, category: "serums-oils", images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=700&fit=crop"] },
    { name: "Vitamin C Brightening Cream", slug: "vitamin-c-brightening-cream", description: "Antioxidant-rich cream that brightens and evens skin tone.", price: 38, stock: 25, isFeatured: true, tags: ["featured", "new-arrival"], position: 2, category: "skincare", images: ["https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=600&h=700&fit=crop"] },
    { name: "Gentle Foaming Cleanser", slug: "gentle-foaming-cleanser", description: "pH-balanced cleanser that removes impurities without stripping moisture.", price: 24, stock: 40, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "skincare", images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=700&fit=crop"] },
    { name: "Rose Petal Face Mask", slug: "rose-petal-face-mask", description: "Soothing mask infused with rose extract for radiant, hydrated skin.", price: 18, stock: 35, isFeatured: true, tags: ["featured"], position: 4, category: "face-masks", images: ["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=700&fit=crop"] },
    { name: "Nourishing Lip Balm", slug: "nourishing-lip-balm", description: "Organic lip balm with shea butter and honey for soft, moisturised lips.", price: 12, stock: 60, isFeatured: false, tags: ["bestseller"], position: 5, category: "lip-care", images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=700&fit=crop"] },
    { name: "Retinol Night Oil", slug: "retinol-night-oil", description: "Anti-ageing night oil with retinol and rosehip to renew skin overnight.", price: 55, stock: 20, isFeatured: false, tags: ["new-arrival", "sale"], position: 6, category: "serums-oils", images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=700&fit=crop"] },
    { name: "Coconut Body Butter", slug: "coconut-body-butter", description: "Rich body butter with coconut oil for deep hydration and a tropical scent.", price: 28, stock: 30, isFeatured: false, tags: ["bestseller"], position: 7, category: "body-care", images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=700&fit=crop"] },
    { name: "Exfoliating Body Scrub", slug: "exfoliating-body-scrub", description: "Natural sugar scrub with essential oils for smooth, glowing skin.", price: 22, compareAtPrice: 30, stock: 25, isFeatured: false, tags: ["sale"], position: 8, category: "body-care", images: ["https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "The Complete Guide to Building a Skincare Routine", slug: "complete-skincare-routine-guide", excerpt: "Everything you need to know about creating the perfect skincare regimen...", content: "A good skincare routine doesn't need to be complicated. The basics are: cleanse, treat, moisturise, and protect.\n\nStart with a gentle cleanser morning and night. Follow with a serum targeted to your concerns — vitamin C for brightness, hyaluronic acid for hydration, or retinol for anti-ageing.\n\nAlways finish with a moisturiser and SPF during the day. Consistency is more important than using expensive products.", coverImage: "https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=800&h=600&fit=crop", author: "Beauty Team", category: "Skincare Tips", tags: ["skincare", "routine", "guide"] },
    { title: "Natural Ingredients That Transform Your Skin", slug: "natural-ingredients-transform-skin", excerpt: "Discover the power of nature's best skincare ingredients...", content: "Nature provides some of the most effective skincare ingredients. From aloe vera to tea tree oil, these botanicals have been used for centuries.\n\nRosehip oil is rich in vitamins A and C, making it excellent for scar healing and brightening. Honey is a natural humectant and antibacterial agent. Green tea contains powerful antioxidants that protect against environmental damage.\n\nLearning to read ingredient lists empowers you to choose products that truly work.", coverImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop", author: "Dr. Skin", category: "Ingredients", tags: ["natural", "ingredients", "organic"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  GROCERY
// ═══════════════════════════════════════════════════════════════

const GROCERY: TemplateSampleData = {
  categories: [
    { name: "Fruits & Vegetables", slug: "fruits-vegetables", description: "Fresh produce delivered daily", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop", position: 0 },
    { name: "Dairy & Eggs", slug: "dairy-eggs", description: "Fresh dairy products and farm eggs", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop", position: 1 },
    { name: "Bakery", slug: "bakery", description: "Fresh bread, pastries and baked goods", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", position: 2 },
    { name: "Beverages", slug: "beverages", description: "Juices, water, tea and coffee", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", position: 3 },
    { name: "Snacks", slug: "snacks", description: "Chips, nuts and healthy snacks", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop", position: 4 },
    { name: "Sauces & Condiments", slug: "sauces-condiments", description: "Sauces, dressings and seasonings", image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop", position: 5 },
  ],
  products: [
    { name: "Organic Banana Bundle", slug: "organic-banana-bundle", description: "Fresh organic bananas, naturally sweet and perfect for smoothies.", price: 4, stock: 50, isFeatured: true, tags: ["featured", "bestseller"], position: 1, category: "fruits-vegetables", images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=700&fit=crop"] },
    { name: "Extra Virgin Olive Oil", slug: "extra-virgin-olive-oil", description: "Cold-pressed Italian olive oil, perfect for cooking and dressings.", price: 15, stock: 30, isFeatured: true, tags: ["featured", "new-arrival"], position: 2, category: "sauces-condiments", images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=700&fit=crop"] },
    { name: "Fresh Orange Juice 1L", slug: "fresh-orange-juice", description: "100% pure squeezed orange juice, no added sugar.", price: 6, stock: 40, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "beverages", images: ["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=700&fit=crop"] },
    { name: "Farm Fresh Eggs (12 pack)", slug: "farm-fresh-eggs", description: "Free-range farm eggs from local farms.", price: 5, stock: 60, isFeatured: true, tags: ["featured"], position: 4, category: "dairy-eggs", images: ["https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=700&fit=crop"] },
    { name: "Whole Wheat Bread", slug: "whole-wheat-bread", description: "Freshly baked whole wheat bread, sliced and ready to eat.", price: 4, stock: 45, isFeatured: false, tags: ["bestseller"], position: 5, category: "bakery", images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=700&fit=crop"] },
    { name: "Korean Barbecue Sauce", slug: "korean-barbecue-sauce", description: "Authentic Korean BBQ sauce with a sweet and smoky flavour.", price: 8, compareAtPrice: 12, stock: 35, isFeatured: false, tags: ["sale", "new-arrival"], position: 6, category: "sauces-condiments", images: ["https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600&h=700&fit=crop"] },
    { name: "Mixed Nuts Trail Mix", slug: "mixed-nuts-trail-mix", description: "Premium blend of almonds, cashews, walnuts and dried fruits.", price: 10, stock: 25, isFeatured: false, tags: ["bestseller"], position: 7, category: "snacks", images: ["https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&h=700&fit=crop"] },
    { name: "Greek Yoghurt 500g", slug: "greek-yoghurt", description: "Thick and creamy Greek yoghurt, high in protein.", price: 5, stock: 55, isFeatured: false, tags: ["new-arrival"], position: 8, category: "dairy-eggs", images: ["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "10 Healthy Meal Prep Ideas for Busy Weeks", slug: "healthy-meal-prep-ideas", excerpt: "Save time and eat well with these simple meal prep strategies...", content: "Meal prepping is the key to eating healthy on a busy schedule. By spending a few hours on Sunday, you can have delicious, nutritious meals ready for the entire week.\n\nStart with a protein base (grilled chicken, tofu, or beans), add a grain (rice, quinoa), and load up on vegetables. Store in portions for easy grab-and-go meals.\n\nInvest in good containers and remember: most prepped meals last 4-5 days in the fridge.", coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop", author: "Nutrition Team", category: "Healthy Living", tags: ["meal prep", "healthy", "tips"] },
    { title: "Seasonal Fruits Guide: What's Fresh Right Now", slug: "seasonal-fruits-guide", excerpt: "Discover which fruits are in season and at their peak flavour...", content: "Eating seasonally means better flavour, lower prices, and a smaller environmental footprint.\n\nSpring brings strawberries, cherries, and apricots. Summer is the season for watermelon, peaches, and mangoes. Autumn offers apples, pears, and figs. Winter brings citrus fruits at their juiciest.\n\nVisit your local farmer's market to find the freshest seasonal produce.", coverImage: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=600&fit=crop", author: "Fresh Team", category: "Shopping Guide", tags: ["fruits", "seasonal", "fresh"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  HEALTH (pills)
// ═══════════════════════════════════════════════════════════════

const HEALTH: TemplateSampleData = {
  categories: [
    { name: "Vitamins", slug: "vitamins", description: "Essential vitamins for daily health", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop", position: 0 },
    { name: "Supplements", slug: "supplements", description: "Nutritional supplements for specific needs", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop", position: 1 },
    { name: "Sleep & Stress", slug: "sleep-stress", description: "Products for better sleep and stress management", image: "https://images.unsplash.com/photo-1515894203077-ced4b63b4e9a?w=400&h=400&fit=crop", position: 2 },
    { name: "Skin & Hair", slug: "skin-hair", description: "Beauty supplements for skin, hair and nails", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop", position: 3 },
    { name: "Protein & Fitness", slug: "protein-fitness", description: "Sports nutrition and protein supplements", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop", position: 4 },
  ],
  products: [
    { name: "Daily Multivitamin Complex", slug: "daily-multivitamin-complex", description: "Complete daily multivitamin with 23 essential nutrients for overall wellness.", price: 29, stock: 100, isFeatured: true, tags: ["featured", "bestseller"], position: 1, category: "vitamins", images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=700&fit=crop"] },
    { name: "Sleep Easy Gummies", slug: "sleep-easy-gummies", description: "Natural melatonin gummies that support a healthy sleep cycle.", price: 24, stock: 60, isFeatured: true, tags: ["featured", "new-arrival"], position: 2, category: "sleep-stress", images: ["https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=700&fit=crop"] },
    { name: "Vitamin D3 + K2", slug: "vitamin-d3-k2", description: "High-potency vitamin D3 with K2 for immune support and bone health.", price: 18, stock: 80, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "vitamins", images: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=700&fit=crop"] },
    { name: "Collagen Beauty Capsules", slug: "collagen-beauty-capsules", description: "Marine collagen peptides for glowing skin, strong nails, and healthy hair.", price: 35, stock: 40, isFeatured: true, tags: ["featured"], position: 4, category: "skin-hair", images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=700&fit=crop"] },
    { name: "Omega-3 Fish Oil", slug: "omega-3-fish-oil", description: "Premium fish oil capsules rich in EPA & DHA for heart and brain health.", price: 22, stock: 70, isFeatured: false, tags: ["bestseller"], position: 5, category: "supplements", images: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=700&fit=crop"] },
    { name: "Ashwagandha Stress Relief", slug: "ashwagandha-stress-relief", description: "Organic ashwagandha root extract for stress reduction and mental clarity.", price: 26, compareAtPrice: 32, stock: 45, isFeatured: false, tags: ["sale", "new-arrival"], position: 6, category: "sleep-stress", images: ["https://images.unsplash.com/photo-1515894203077-ced4b63b4e9a?w=600&h=700&fit=crop"] },
    { name: "Whey Protein Isolate", slug: "whey-protein-isolate", description: "Pure whey protein isolate for muscle recovery and lean gains.", price: 45, stock: 30, isFeatured: false, tags: ["new-arrival"], position: 7, category: "protein-fitness", images: ["https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&h=700&fit=crop"] },
    { name: "Probiotics Daily", slug: "probiotics-daily", description: "50 billion CFU probiotic blend for digestive health and immunity.", price: 32, stock: 50, isFeatured: false, tags: ["bestseller"], position: 8, category: "supplements", images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "The Essential Guide to Vitamins and Supplements", slug: "essential-guide-vitamins-supplements", excerpt: "Understanding which vitamins and supplements you actually need...", content: "With thousands of supplements available, it can be overwhelming to know what your body actually needs.\n\nStart with the basics: a good multivitamin, vitamin D (especially if you're indoors a lot), and omega-3s. Beyond that, your needs depend on your diet, lifestyle, and health goals.\n\nAlways consult with a healthcare provider before starting new supplements, especially if you take medication.", coverImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop", author: "Dr. Health", category: "Health Guide", tags: ["vitamins", "supplements", "guide"] },
    { title: "Natural Ways to Improve Your Sleep Quality", slug: "natural-ways-improve-sleep", excerpt: "Science-backed strategies for better sleep without medication...", content: "Quality sleep is foundational to good health. Before reaching for sleep aids, try these natural approaches.\n\nEstablish a consistent sleep schedule — go to bed and wake up at the same time daily, even on weekends. Create a dark, cool sleeping environment. Limit screen time an hour before bed.\n\nSupplements like magnesium and melatonin can help, but lifestyle changes often make the biggest difference.", coverImage: "https://images.unsplash.com/photo-1515894203077-ced4b63b4e9a?w=800&h=600&fit=crop", author: "Sleep Expert", category: "Wellness", tags: ["sleep", "natural", "wellness"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  INTERIOR DESIGN (decor + retail)
// ═══════════════════════════════════════════════════════════════

const INTERIOR: TemplateSampleData = {
  categories: [
    { name: "Lighting", slug: "lighting", description: "Lamps, pendants and ambient lighting", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop", position: 0 },
    { name: "Furniture", slug: "furniture", description: "Sofas, tables and chairs", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop", position: 1 },
    { name: "Decor", slug: "decor", description: "Vases, wall art and decorative pieces", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop", position: 2 },
    { name: "Clocks", slug: "clocks", description: "Wall clocks and timepieces", image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop", position: 3 },
    { name: "Kitchen", slug: "kitchen", description: "Cookware, tableware and kitchen accessories", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop", position: 4 },
  ],
  products: [
    { name: "Ball-Shaped Table Night Lamp", slug: "ball-shaped-table-lamp", description: "Modern ball-shaped lamp with warm ambient glow, perfect for bedside tables.", price: 89, stock: 15, isFeatured: true, tags: ["featured", "new-arrival"], position: 1, category: "lighting", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=700&fit=crop"] },
    { name: "Minimalist Sofa Set", slug: "minimalist-sofa-set", description: "Contemporary 3-seater sofa in neutral tones with solid wood frame.", price: 799, compareAtPrice: 999, stock: 5, isFeatured: true, tags: ["featured", "sale"], position: 2, category: "furniture", images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=700&fit=crop"] },
    { name: "Glass Flower Vase", slug: "glass-flower-vase", description: "Elegant glass vase with ripple texture for fresh or dried arrangements.", price: 45, stock: 25, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "decor", images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=700&fit=crop"] },
    { name: "Wooden Wall Clock", slug: "wooden-wall-clock", description: "Handcrafted wooden wall clock with silent movement mechanism.", price: 65, stock: 20, isFeatured: true, tags: ["featured"], position: 4, category: "clocks", images: ["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=700&fit=crop"] },
    { name: "Ceramic Dinner Set (16pc)", slug: "ceramic-dinner-set", description: "Elegant ceramic dinner set for 4, dishwasher and microwave safe.", price: 120, stock: 12, isFeatured: false, tags: ["bestseller"], position: 5, category: "kitchen", images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=700&fit=crop"] },
    { name: "Modern Pendant Light", slug: "modern-pendant-light", description: "Sleek metal pendant light for kitchen islands and dining areas.", price: 135, stock: 18, isFeatured: false, tags: ["new-arrival"], position: 6, category: "lighting", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=700&fit=crop"] },
    { name: "Marble Coffee Table", slug: "marble-coffee-table", description: "Stunning marble-top coffee table with brass legs.", price: 350, stock: 8, isFeatured: false, tags: ["new-arrival"], position: 7, category: "furniture", images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=700&fit=crop"] },
    { name: "Wall Art Canvas Print", slug: "wall-art-canvas-print", description: "Abstract canvas print on gallery-wrapped frame, ready to hang.", price: 55, compareAtPrice: 75, stock: 30, isFeatured: false, tags: ["sale", "bestseller"], position: 8, category: "decor", images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "How to Style Your Living Room Like a Pro", slug: "style-living-room-like-pro", excerpt: "Interior design tips for creating a magazine-worthy living space...", content: "A well-styled living room balances comfort and aesthetics. Start with a focal point — usually the sofa — and build around it.\n\nLayer textures with throws, cushions, and rugs. Use the 60-30-10 colour rule: 60% dominant colour, 30% secondary, and 10% accent.\n\nDon't forget lighting — a mix of ambient, task, and accent lighting creates depth and mood.", coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop", author: "Design Team", category: "Interior Tips", tags: ["interior", "living room", "design"] },
    { title: "Minimalist Design: Less is More", slug: "minimalist-design-less-is-more", excerpt: "Embrace simplicity with these minimalist decoration principles...", content: "Minimalism isn't about having nothing — it's about having only what matters. Every piece in your space should serve a purpose or bring joy.\n\nStart by decluttering. Then choose furniture with clean lines and neutral palettes. Add warmth through natural materials like wood, linen, and stone.\n\nThe result? A calm, intentional space that feels both spacious and inviting.", coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop", author: "Style Editor", category: "Design Trends", tags: ["minimalist", "decor", "trends"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  KIDS
// ═══════════════════════════════════════════════════════════════

const KIDS: TemplateSampleData = {
  categories: [
    { name: "Jumpsuits", slug: "jumpsuits", description: "Comfortable jumpsuits and growsuits for babies and toddlers", image: "/uploads/kids_images/growsuit.webp", position: 0 },
    { name: "Jumpers", slug: "jumpers", description: "Cozy jumpers and sweaters for kids", image: "/uploads/kids_images/jumper.webp", position: 1 },
    { name: "Toys", slug: "toys", description: "Safe and fun toys for all ages", image: "/uploads/kids_images/toys.webp", position: 2 },
    { name: "Animals", slug: "animals", description: "Adorable animal-themed toys and accessories", image: "/uploads/kids_images/animals.webp", position: 3 },
    { name: "Dresses", slug: "dresses", description: "Beautiful dresses for special occasions", image: "/uploads/kids_images/dresses.webp", position: 4 },
    { name: "Gifts", slug: "gifts", description: "Thoughtful gift ideas for babies and kids", image: "/uploads/kids_images/gifts.webp", position: 5 },
  ],
  products: [
    { name: "Soft Cotton Baby Romper", slug: "soft-cotton-baby-romper", description: "Gentle cotton romper with easy snap closures. Breathable fabric designed for all-day comfort and sensitive skin care.", price: 28, stock: 30, isFeatured: true, tags: ["featured", "new-arrival"], position: 1, category: "jumpsuits", images: ["/uploads/kids_images/growsuit.webp"] },
    { name: "Classic Striped Sweater", slug: "classic-striped-sweater", description: "Timeless striped sweater crafted from soft merino wool blend. Warm yet lightweight, ideal for transitional weather and layering.", price: 42, stock: 18, isFeatured: true, tags: ["featured", "bestseller"], position: 2, category: "jumpers", images: ["/uploads/kids_images/jumper.webp"] },
    { name: "Montessori Building Blocks", slug: "montessori-building-blocks", description: "Natural wood building blocks set inspired by Montessori principles. Encourages spatial awareness, creativity, and fine motor development.", price: 38, stock: 25, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "toys", images: ["/uploads/kids_images/toys.webp"] },
    { name: "Sunny Day Sundress", slug: "sunny-day-sundress", description: "Cheerful yellow sundress with ruffle details. Made from 100% organic cotton with adjustable straps for growing kids.", price: 35, stock: 20, isFeatured: true, tags: ["featured"], position: 4, category: "dresses", images: ["/uploads/kids_images/dresses.webp"] },
    { name: "Forest Friends Plush Set", slug: "forest-friends-plush-set", description: "Collection of woodland animal plush toys including fox, owl, and bear. Each toy features embroidered details for safety.", price: 45, compareAtPrice: 58, stock: 15, isFeatured: false, tags: ["sale", "new-arrival"], position: 5, category: "animals", images: ["/uploads/kids_images/animals.webp"] },
    { name: "Birthday Celebration Box", slug: "birthday-celebration-box", description: "Curated birthday gift set with party essentials, decorations, and a special outfit. Makes party planning effortless and memorable.", price: 95, stock: 12, isFeatured: true, tags: ["gifts", "featured"], position: 6, category: "gifts", images: ["/uploads/kids_images/gifts.webp"] },
    { name: "Luxury Welcome Hamper", slug: "luxury-welcome-hamper", description: "Premium gift hamper for new arrivals featuring essential clothing items, soft blankets, and care products. Beautifully presented for gifting.", price: 150, stock: 8, isFeatured: true, tags: ["gifts", "bestseller"], position: 7, category: "gifts", images: ["/uploads/kids_images/gift.webp"] },
  ],
  blogs: [
    { title: "Spring Wardrobe Essentials for Little Ones", slug: "spring-wardrobe-essentials", excerpt: "Discover the must-have pieces for your child's spring wardrobe that combine style, comfort, and practicality.", content: "Spring brings new opportunities to refresh your little one's wardrobe with lighter fabrics and cheerful colors. Start with versatile basics like cotton t-shirts and comfortable leggings that can be mixed and matched.\n\nLayering is key during transitional weather. Keep cardigans and light jackets on hand for unpredictable temperatures. Don't forget rain gear - waterproof boots and jackets make puddle jumping fun and dry.\n\nAccessories can transform an outfit. A simple sun hat adds both style and sun protection, while colorful socks bring personality to everyday looks.", coverImage: "/uploads/kids_images/About.webp", author: "Style Editor", category: "Seasonal Guide", tags: ["spring", "wardrobe", "kids"] },
    { title: "Creating a Safe and Stimulating Play Space", slug: "safe-stimulating-play-space", excerpt: "Learn how to design a play area that encourages development while keeping safety as the top priority.", content: "A well-designed play space supports your child's growth and imagination. Start with soft flooring like foam mats or rugs to cushion falls and create a comfortable area for floor play.\n\nOrganize toys at child height using open shelves or bins. This encourages independence and makes cleanup easier. Rotate toys regularly to maintain interest and prevent overwhelm.\n\nInclude different zones for various activities: a quiet reading corner, a creative art space, and an active play area. Natural light and plants can make the space more inviting and calming.", coverImage: "/uploads/kids_images/About1.webp", author: "Child Development Expert", category: "Parenting", tags: ["play", "safety", "development"] },
    { title: "The Benefits of Sensory Play in Early Childhood", slug: "benefits-sensory-play", excerpt: "Explore how sensory activities support brain development, language skills, and emotional regulation in young children.", content: "Sensory play engages children's senses through touch, sight, sound, taste, and smell. These experiences build neural connections that form the foundation for learning and development.\n\nSimple sensory activities include water play, sand exploration, textured materials, and music. These activities develop fine motor skills, language, and problem-solving abilities.\n\nSensory play also supports emotional regulation. Calming activities like playing with rice or dough can help children manage stress and anxiety while having fun.", coverImage: "/uploads/kids_images/About2.webp", author: "Early Education Specialist", category: "Child Development", tags: ["sensory", "play", "learning"] },
    { title: "Sustainable Choices for Kids' Clothing", slug: "sustainable-kids-clothing", excerpt: "A guide to making eco-friendly clothing choices that are better for your child and the planet.", content: "Sustainable children's clothing considers environmental impact from production to disposal. Look for organic cotton, recycled materials, and brands that prioritize ethical manufacturing practices.\n\nQuality over quantity is a key principle. Well-made pieces last longer and can be passed down to siblings or other families, reducing waste. Choose timeless styles that won't quickly go out of fashion.\n\nCare for clothes properly to extend their life. Wash in cold water, air dry when possible, and repair small damages instead of discarding. These small habits make a significant environmental difference.", coverImage: "/uploads/kids_images/Bblog1.webp", author: "Sustainability Advocate", category: "Eco Living", tags: ["sustainable", "clothing", "environment"] },
    { title: "Navigating Toddler Tantrums with Empathy", slug: "navigating-toddler-tantrums", excerpt: "Practical strategies for understanding and managing toddler tantrums while building emotional intelligence.", content: "Tantrums are a normal part of toddler development as children learn to express big emotions. Understanding the triggers can help prevent some outbursts before they start.\n\nCommon triggers include hunger, fatigue, overstimulation, and frustration with communication. Regular routines and clear expectations can provide the structure toddlers need to feel secure.\n\nWhen tantrums occur, stay calm and validate your child's feelings. Use simple language to help them name their emotions. Offer comfort and choices when possible, but maintain consistent boundaries.", coverImage: "/uploads/kids_images/Bblog2.webp", author: "Child Psychologist", category: "Parenting Tips", tags: ["toddler", "tantrums", "emotions"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  MAKEUP
// ═══════════════════════════════════════════════════════════════

const MAKEUP: TemplateSampleData = {
  categories: [
    { name: "Face Mask", slug: "face-mask", description: "Cleansing and nourishing face masks", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop", position: 0 },
    { name: "Cleanser", slug: "cleanser", description: "Gentle and effective cleansers", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop", position: 1 },
    { name: "Hair Care", slug: "hair-care", description: "Shampoos, conditioners and treatments", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop", position: 2 },
    { name: "Sun Protection", slug: "sun-protection", description: "Sunscreen and UV protection products", image: "https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=400&h=400&fit=crop", position: 3 },
    { name: "Lip Tint", slug: "lip-tint", description: "Long-lasting lip tints and stains", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop", position: 4 },
  ],
  products: [
    { name: "Eye Patches with Chamomile", slug: "eye-patches-chamomile", description: "Soothing under-eye patches with chamomile extract for reducing puffiness and dark circles.", price: 18, stock: 40, isFeatured: true, tags: ["featured", "bestseller"], position: 1, category: "face-mask", images: ["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=700&fit=crop"] },
    { name: "Cleansing Oil for Oily Skin", slug: "cleansing-oil-oily-skin", description: "Lightweight cleansing oil that dissolves makeup and excess sebum without clogging pores.", price: 28, stock: 30, isFeatured: true, tags: ["featured", "new-arrival"], position: 2, category: "cleanser", images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=700&fit=crop"] },
    { name: "SPF 50 Sunscreen Cream", slug: "spf-50-sunscreen-cream", description: "Broad-spectrum SPF 50 sunscreen with a lightweight, non-greasy formula.", price: 32, stock: 35, isFeatured: true, tags: ["featured", "bestseller"], position: 3, category: "sun-protection", images: ["https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=600&h=700&fit=crop"] },
    { name: "Intense Pink Lip Tint", slug: "intense-pink-lip-tint", description: "Long-lasting lip tint with an intense pink-beige shade and moisturizing formula.", price: 15, stock: 50, isFeatured: true, tags: ["featured"], position: 4, category: "lip-tint", images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=700&fit=crop"] },
    { name: "Repair Hair Mask", slug: "repair-hair-mask", description: "Deep conditioning mask with argan oil and keratin for damaged hair.", price: 24, stock: 25, isFeatured: false, tags: ["bestseller"], position: 5, category: "hair-care", images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=700&fit=crop"] },
    { name: "Blemish Control Cleanser", slug: "blemish-control-cleanser", description: "Salicylic acid cleanser that targets blemishes while being gentle on skin.", price: 22, compareAtPrice: 28, stock: 45, isFeatured: false, tags: ["sale", "new-arrival"], position: 6, category: "cleanser", images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=700&fit=crop"] },
    { name: "Hydrating Toning Pads", slug: "hydrating-toning-pads", description: "Pre-soaked toning pads with hyaluronic acid for quick hydration.", price: 20, stock: 55, isFeatured: false, tags: ["new-arrival"], position: 7, category: "face-mask", images: ["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=700&fit=crop"] },
    { name: "Volumizing Shampoo", slug: "volumizing-shampoo", description: "Lightweight shampoo that adds volume without weighing hair down.", price: 18, stock: 40, isFeatured: false, tags: ["bestseller"], position: 8, category: "hair-care", images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "The Perfect Morning Skincare Routine", slug: "perfect-morning-skincare-routine", excerpt: "Build a morning routine that protects and prepares your skin for the day...", content: "Your morning routine sets the foundation for healthy skin throughout the day. Start with a gentle cleanser to remove overnight buildup.\n\nFollow with a vitamin C serum for antioxidant protection, then a lightweight moisturiser. Always finish with SPF — rain or shine.\n\nKeep it simple: 4-5 products are all you need for an effective morning routine.", coverImage: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop", author: "Beauty Expert", category: "Skincare", tags: ["skincare", "routine", "morning"] },
    { title: "Understanding SPF: A Complete Sun Protection Guide", slug: "understanding-spf-guide", excerpt: "Everything you need to know about sun protection and choosing the right SPF...", content: "SPF (Sun Protection Factor) measures how well a sunscreen protects against UVB rays. SPF 30 blocks about 97% of UVB, while SPF 50 blocks about 98%.\n\nBut SPF alone isn't enough — look for 'broad spectrum' to ensure UVA protection too. Reapply every 2 hours, or after swimming or sweating.\n\nChemical and mineral sunscreens both work well; choose based on your skin type and preferences.", coverImage: "https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=800&h=600&fit=crop", author: "Derma Team", category: "Sun Care", tags: ["spf", "sunscreen", "protection"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
  //  PERFUMES
  // ═══════════════════════════════════════════════════════════════

const PERFUMES: TemplateSampleData = {
  categories: [
    { name: "Étheria", slug: "etheria", description: "A collection of light, almost weightless fragrances created for those who cherish softness and brightness.", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80&auto=format&fit=crop", position: 0 },
    { name: "Celeste Aura", slug: "celeste-aura", description: "Elegant fragrances that blend vibrant citrus notes and shimmering aldehydes.", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80&auto=format&fit=crop", position: 1 },
    { name: "Opus Essence", slug: "opus-essence", description: "A collection of delicate, weightless fragrances that capture the essence of air and light.", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80&auto=format&fit=crop", position: 2 },
    { name: "Velours Noir", slug: "velours-noir", description: "Dark, rich, velvety fragrances that reveal passion and magnetism.", image: "https://images.unsplash.com/photo-1458538977777-0549b2370168?w=800&q=80&auto=format&fit=crop", position: 3 },
    { name: "Nocturne Essence", slug: "nocturne-essence", description: "Soft, intimate, warm fragrances that envelop the senses.", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80&auto=format&fit=crop", position: 4 },
    { name: "Elysian Bloom", slug: "elysian-bloom", description: "A luminous fragrance collection with a fresh, inviting personality.", image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80&auto=format&fit=crop", position: 5 },
  ],
  products: [
    { name: "Amber Bloom 100ml", slug: "amber-bloom-100ml", description: "A radiant fragrance with a warm amber finish and delicate floral lift.", price: 250, stock: 15, isFeatured: true, tags: ["featured", "bestseller", "etheria"], position: 1, category: "etheria", images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=700&fit=crop"] },
    { name: "Aurora Haze 100ml", slug: "aurora-haze-100ml", description: "An airy composition with bright citrus, clean musk, and soft woods.", price: 250, stock: 20, isFeatured: true, tags: ["featured", "new-arrival", "celeste-aura"], position: 2, category: "celeste-aura", images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=700&fit=crop"] },
    { name: "Golden Veil 100ml", slug: "golden-veil-100ml", description: "An opulent fragrance with notes of saffron, rose absolute, and sandalwood.", price: 250, stock: 10, isFeatured: true, tags: ["featured", "opus-essence"], position: 3, category: "opus-essence", images: ["https://images.unsplash.com/photo-1594035910387-fea081ac0284?w=600&h=700&fit=crop"] },
    { name: "Cobalt Shadow 100ml", slug: "cobalt-shadow-100ml", description: "Dark, rich, and velvety with smoky notes and spicy accents.", price: 250, stock: 18, isFeatured: true, tags: ["featured", "bestseller", "velours-noir"], position: 4, category: "velours-noir", images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=700&fit=crop"] },
    { name: "Abyss Bleu 100ml", slug: "abyss-bleu-100ml", description: "Soft, intimate, warm, and composed around amber and vanilla.", price: 250, stock: 22, isFeatured: false, tags: ["new-arrival", "nocturne-essence"], position: 5, category: "nocturne-essence", images: ["https://images.unsplash.com/photo-1594035910387-fea081ac0284?w=600&h=700&fit=crop"] },
    { name: "Elysian Bloom 100ml", slug: "elysian-bloom-100ml", description: "A luminous scent with a fresh, soft trail and refined woods.", price: 250, compareAtPrice: 300, stock: 12, isFeatured: false, tags: ["sale", "elysian-bloom"], position: 6, category: "elysian-bloom", images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=700&fit=crop"] },
    { name: "Discovery Set (5 x 10ml)", slug: "discovery-set", description: "Sample our 5 bestselling fragrances in travel-friendly 10ml bottles.", price: 65, stock: 30, isFeatured: false, tags: ["bestseller", "gift"], position: 7, category: "opus-essence", images: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=700&fit=crop"] },
    { name: "Travel Atomizer Set", slug: "travel-atomizer-set", description: "Refillable travel atomizer with 3 fragrance refills included.", price: 42, stock: 35, isFeatured: false, tags: ["bestseller"], position: 8, category: "etheria", images: ["https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&h=700&fit=crop"] },
  ],
  blogs: [
    { title: "How to Choose a Signature Scent", slug: "how-to-choose-signature-scent", excerpt: "Finding the perfect fragrance that defines you...", content: "Your signature scent is an extension of your personality. The key is understanding fragrance families: floral, oriental, woody, and fresh.\n\nTest fragrances on your skin, not paper strips. Your body chemistry affects how a perfume develops. Spray on your wrist and wait 30 minutes to experience the full dry-down.\n\nDon't rush the decision — wear a fragrance for a full day before committing.", coverImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop", author: "Fragrance Expert", category: "Fragrance Guide", tags: ["perfume", "signature", "guide"] },
    { title: "Understanding Fragrance Concentration Levels", slug: "fragrance-concentration-levels", excerpt: "EDT, EDP, Parfum — what's the difference and which is right for you...", content: "Fragrance concentration determines intensity and longevity:\n\n• Eau de Cologne (2-4%): Light, refreshing, lasts 2-3 hours\n• Eau de Toilette (5-15%): Moderate, great for daily wear, lasts 4-6 hours\n• Eau de Parfum (15-20%): Rich and lasting, perfect for evening, lasts 6-8 hours\n• Parfum/Extrait (20-30%): The most concentrated, a little goes a long way, lasts 8+ hours\n\nHigher concentration means higher price, but also less product needed per application.", coverImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=600&fit=crop", author: "Scent Lab", category: "Education", tags: ["edt", "edp", "parfum", "guide"] },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  SLUG → SAMPLE DATA MAP
// ═══════════════════════════════════════════════════════════════

export const TEMPLATE_SAMPLE_DATA: Record<string, TemplateSampleData> = {
  // Electronics family
  electronics: ELECTRONICS,
  "electronics-accessories": ELECTRONICS,
  hardware: ELECTRONICS,
  tools: ELECTRONICS,
  // Bakery
  "sweets-bakery": BAKERY,
  // Beauty
  cosmetics: COSMETICS,
  makeup: MAKEUP,
  perfumes: PERFUMES,
  // Grocery
  grocery: GROCERY,
  vegetables: GROCERY,
  // Health
  pills: HEALTH,
  // Interior
  decor: INTERIOR,
  retail: {
    categories: [
      { name: "All Products", slug: "all-products", description: "Browse our complete collection", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=400&fit=crop", position: 0 },
      { name: "Garden Decor", slug: "garden-decor", description: "Outdoor planters, wind chimes, lanterns and garden accessories", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop", position: 1 },
      { name: "Home Decor", slug: "home-decor", description: "Vases, wall art, cushions and indoor décor pieces", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop", position: 2 },
    ],
    products: [
      { name: "Terracotta Planter Set", slug: "terracotta-planter-set", description: "Set of 3 handcrafted terracotta planters in varying sizes, perfect for herbs and small plants.", price: 45, stock: 25, isFeatured: true, tags: ["featured", "new-arrival"], position: 1, category: "garden-decor", images: ["https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=700&fit=crop"] },
      { name: "Woven Rattan Basket", slug: "woven-rattan-basket", description: "Natural rattan storage basket with handles, ideal for living rooms and bedrooms.", price: 38, stock: 20, isFeatured: true, tags: ["featured", "bestseller"], position: 2, category: "home-decor", images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=700&fit=crop"] },
      { name: "Ceramic Table Vase", slug: "ceramic-table-vase", description: "Minimalist ceramic vase with an earthy glaze finish for dried or fresh flowers.", price: 32, compareAtPrice: 42, stock: 30, isFeatured: true, tags: ["featured", "sale"], position: 3, category: "home-decor", images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=700&fit=crop"] },
      { name: "Garden Wind Chime", slug: "garden-wind-chime", description: "Bamboo and metal wind chime that creates soothing melodies in the breeze.", price: 28, stock: 15, isFeatured: true, tags: ["featured"], position: 4, category: "garden-decor", images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=700&fit=crop"] },
      { name: "Macramé Wall Hanging", slug: "macrame-wall-hanging", description: "Hand-knotted macramé wall art made from natural cotton cord.", price: 55, stock: 12, isFeatured: false, tags: ["new-arrival"], position: 5, category: "home-decor", images: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=700&fit=crop"] },
      { name: "Bamboo Lantern Set", slug: "bamboo-lantern-set", description: "Set of 2 bamboo lanterns with glass candle holders for garden or patio.", price: 42, stock: 18, isFeatured: false, tags: ["bestseller"], position: 6, category: "garden-decor", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=700&fit=crop"] },
      { name: "Linen Throw Pillow", slug: "linen-throw-pillow", description: "Soft linen cushion cover in earthy tones with invisible zipper closure.", price: 26, stock: 40, isFeatured: false, tags: ["new-arrival"], position: 7, category: "home-decor", images: ["https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=700&fit=crop"] },
      { name: "Herb Garden Kit", slug: "herb-garden-kit", description: "Complete indoor herb garden kit with pots, soil, and seed packets for basil, mint, and rosemary.", price: 35, compareAtPrice: 48, stock: 22, isFeatured: false, tags: ["sale", "bestseller"], position: 8, category: "garden-decor", images: ["https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=700&fit=crop"] },
    ],
    blogs: [
      { title: "10 Easy Ways to Brighten Your Garden", slug: "brighten-your-garden", excerpt: "Simple tips to transform your outdoor space into a vibrant retreat...", content: "A beautiful garden doesn't require a huge budget. Start with colorful planters, add solar-powered fairy lights, and plant seasonal flowers for year-round colour.\n\nConsider adding a small water feature or bird bath as a focal point. Use mulch and decorative stones for clean, low-maintenance borders.\n\nFinish with comfortable seating and outdoor cushions to create a space you'll love spending time in.", coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop", author: "Garden Team", category: "Garden Tips", tags: ["garden", "outdoor", "decor"] },
      { title: "Creating a Cozy Home with Natural Materials", slug: "cozy-home-natural-materials", excerpt: "Discover how earthy textures and organic pieces transform your living space...", content: "Natural materials like wood, rattan, linen, and ceramic bring warmth and texture to any room. Start with a jute rug, add woven baskets for storage, and incorporate plants for a fresh, alive feeling.\n\nChoose furniture with organic shapes and earth-toned upholstery. Layer textures with throw blankets and cushions in natural fibres.\n\nThe result is a calming, grounded space that connects you to nature even indoors.", coverImage: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop", author: "Style Editor", category: "Home Tips", tags: ["home", "natural", "interior"] },
    ],
  },
  // Kids
  kids: KIDS,
  toys: KIDS,
};
