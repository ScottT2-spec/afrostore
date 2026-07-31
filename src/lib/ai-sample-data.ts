/**
 * Industry-specific sample categories and products
 * Used when AI-building a store to seed relevant content
 */

export interface SampleCategory {
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface SampleProduct {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  catIdx: number;
  isFeatured: boolean;
  stock: number;
  images: string[];
}

interface IndustrySampleData {
  categories: SampleCategory[];
  products: SampleProduct[];
  currency: string;
}

const INDUSTRY_DATA: Record<string, IndustrySampleData> = {
  "real-estate": {
    currency: "USD",
    categories: [
      { name: "Houses for Sale", slug: "houses-for-sale", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop", description: "Beautiful homes available for purchase" },
      { name: "Apartments", slug: "apartments", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop", description: "Modern apartments and condos" },
      { name: "Commercial", slug: "commercial", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop", description: "Office spaces and commercial properties" },
      { name: "Land", slug: "land", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop", description: "Land plots and undeveloped property" },
      { name: "Rentals", slug: "rentals", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop", description: "Properties available for rent" },
    ],
    products: [
      { name: "Modern 4-Bedroom Villa", slug: "modern-villa", price: 450000, compareAtPrice: 520000, description: "Stunning 4-bedroom villa with pool, garden, and modern finishes. Open-plan kitchen, 3 bathrooms, double garage. Prime location with ocean views.", catIdx: 0, isFeatured: true, stock: 1, images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=600&fit=crop"] },
      { name: "3-Bed Family Home", slug: "family-home", price: 285000, compareAtPrice: 320000, description: "Spacious 3-bedroom family home in a quiet neighborhood. Recently renovated kitchen, large backyard, close to schools.", catIdx: 0, isFeatured: true, stock: 1, images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=600&fit=crop"] },
      { name: "Luxury Penthouse Suite", slug: "luxury-penthouse", price: 780000, description: "Breathtaking penthouse with panoramic city views. 3 bedrooms, private terrace, concierge service, premium amenities.", catIdx: 1, isFeatured: true, stock: 1, images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=600&fit=crop"] },
      { name: "Studio Apartment Downtown", slug: "studio-downtown", price: 95000, compareAtPrice: 110000, description: "Compact studio in the heart of downtown. Perfect for young professionals. Walking distance to transit and restaurants.", catIdx: 1, isFeatured: false, stock: 3, images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=600&fit=crop"] },
      { name: "2-Bed Modern Apartment", slug: "modern-apartment", price: 175000, compareAtPrice: 195000, description: "Contemporary 2-bedroom apartment with floor-to-ceiling windows, gym access, and underground parking.", catIdx: 1, isFeatured: true, stock: 2, images: ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=600&fit=crop"] },
      { name: "Prime Office Space", slug: "prime-office", price: 320000, description: "350 sqm open-plan office in business district. Meeting rooms, fiber internet, 24/7 security.", catIdx: 2, isFeatured: false, stock: 1, images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop"] },
      { name: "Retail Shop Unit", slug: "retail-shop", price: 145000, compareAtPrice: 165000, description: "Street-facing retail unit in busy shopping area. 80 sqm with storage room and restroom.", catIdx: 2, isFeatured: false, stock: 2, images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"] },
      { name: "Residential Plot 500 sqm", slug: "residential-plot", price: 65000, compareAtPrice: 80000, description: "Ready-to-build residential plot in developing area. All utilities available. Title deed included.", catIdx: 3, isFeatured: true, stock: 5, images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=600&fit=crop"] },
      { name: "3-Bed Rental Home", slug: "rental-home", price: 1800, description: "Monthly rental. Furnished 3-bedroom home with garden, parking, and Wi-Fi. Pets welcome.", catIdx: 4, isFeatured: false, stock: 1, images: ["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=600&fit=crop"] },
      { name: "1-Bed City Rental", slug: "city-rental", price: 950, description: "Monthly rental. Cozy 1-bedroom apartment in the city center. Fully furnished, bills included.", catIdx: 4, isFeatured: false, stock: 4, images: ["https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&h=600&fit=crop"] },
    ],
  },
  "restaurant": {
    currency: "USD",
    categories: [
      { name: "Starters", slug: "starters", image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=400&fit=crop", description: "Appetizers and small bites" },
      { name: "Main Courses", slug: "main-courses", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop", description: "Signature dishes and entrées" },
      { name: "Desserts", slug: "desserts", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop", description: "Sweet treats and desserts" },
      { name: "Beverages", slug: "beverages", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", description: "Drinks, cocktails & smoothies" },
      { name: "Specials", slug: "specials", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop", description: "Chef's specials and seasonal dishes" },
    ],
    products: [
      { name: "Truffle Mushroom Bruschetta", slug: "truffle-bruschetta", price: 1400, compareAtPrice: 1800, description: "Crispy sourdough topped with sautéed wild mushrooms, truffle oil, and aged parmesan.", catIdx: 0, isFeatured: true, stock: 50, images: ["https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=600&fit=crop"] },
      { name: "Grilled Salmon Fillet", slug: "grilled-salmon", price: 2800, description: "Atlantic salmon with lemon butter sauce, roasted vegetables, and herb rice.", catIdx: 1, isFeatured: true, stock: 30, images: ["https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=600&fit=crop"] },
      { name: "Wagyu Beef Burger", slug: "wagyu-burger", price: 2200, compareAtPrice: 2600, description: "Premium wagyu patty with caramelized onions, aged cheddar, and house-made brioche bun.", catIdx: 1, isFeatured: true, stock: 40, images: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop"] },
      { name: "Margherita Wood-Fired Pizza", slug: "margherita-pizza", price: 1600, description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil on hand-stretched dough.", catIdx: 1, isFeatured: true, stock: 50, images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop"] },
      { name: "Pasta Carbonara", slug: "pasta-carbonara", price: 1800, compareAtPrice: 2100, description: "Housemade spaghetti with guanciale, pecorino romano, egg yolk, and black pepper.", catIdx: 1, isFeatured: false, stock: 40, images: ["https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=600&fit=crop"] },
      { name: "Tiramisu", slug: "tiramisu", price: 1200, description: "Classic Italian tiramisu with mascarpone, espresso-soaked ladyfingers, and cocoa.", catIdx: 2, isFeatured: true, stock: 25, images: ["https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=600&fit=crop"] },
      { name: "Chocolate Lava Cake", slug: "lava-cake", price: 1400, compareAtPrice: 1600, description: "Warm chocolate cake with molten center, served with vanilla ice cream.", catIdx: 2, isFeatured: false, stock: 20, images: ["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=600&fit=crop"] },
      { name: "Mango Passion Smoothie", slug: "mango-smoothie", price: 800, description: "Fresh mango, passion fruit, banana, and coconut milk blended to perfection.", catIdx: 3, isFeatured: false, stock: 100, images: ["https://images.unsplash.com/photo-1546173159-315724a31696?w=600&h=600&fit=crop"] },
      { name: "Craft Espresso Martini", slug: "espresso-martini", price: 1500, description: "Vodka, fresh espresso, coffee liqueur, and vanilla syrup shaken over ice.", catIdx: 3, isFeatured: true, stock: 80, images: ["https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=600&fit=crop"] },
      { name: "Chef's Tasting Menu", slug: "tasting-menu", price: 6500, compareAtPrice: 8000, description: "7-course tasting menu featuring seasonal ingredients. Wine pairing available.", catIdx: 4, isFeatured: true, stock: 10, images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop"] },
    ],
  },
  "technology": {
    currency: "USD",
    categories: [
      { name: "Laptops & Computers", slug: "laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", description: "Laptops, desktops, and workstations" },
      { name: "Smartphones", slug: "smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop", description: "Latest smartphones and mobile devices" },
      { name: "Audio & Wearables", slug: "audio-wearables", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", description: "Headphones, earbuds, smartwatches" },
      { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop", description: "Cables, cases, chargers & more" },
    ],
    products: [
      { name: "Pro Laptop 16\" M4", slug: "pro-laptop-16", price: 249900, compareAtPrice: 299900, description: "16-inch Retina display, M4 Pro chip, 32GB RAM, 1TB SSD. The ultimate creative workstation.", catIdx: 0, isFeatured: true, stock: 15, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"] },
      { name: "Ultra Slim Laptop 14\"", slug: "ultra-slim-14", price: 129900, compareAtPrice: 149900, description: "Ultralight 14-inch laptop, 16GB RAM, 512GB SSD, all-day battery life.", catIdx: 0, isFeatured: true, stock: 25, images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"] },
      { name: "Flagship Phone Pro", slug: "flagship-phone", price: 119900, description: "6.7-inch AMOLED, 200MP camera, 5G, 5000mAh battery, 256GB storage.", catIdx: 1, isFeatured: true, stock: 30, images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"] },
      { name: "Budget Phone SE", slug: "budget-phone", price: 29900, compareAtPrice: 39900, description: "5G capable, 128GB, dual camera, OLED display. Best value in its class.", catIdx: 1, isFeatured: false, stock: 60, images: ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=600&fit=crop"] },
      { name: "Noise-Cancelling Headphones", slug: "nc-headphones", price: 34900, compareAtPrice: 44900, description: "Premium ANC, 40-hour battery, spatial audio, multipoint Bluetooth 5.3.", catIdx: 2, isFeatured: true, stock: 40, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"] },
      { name: "Smart Watch Ultra", slug: "smart-watch", price: 44900, description: "GPS, heart rate, SpO2, sleep tracking, 14-day battery, titanium case.", catIdx: 2, isFeatured: true, stock: 20, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"] },
      { name: "Wireless Earbuds Pro", slug: "wireless-earbuds", price: 19900, compareAtPrice: 24900, description: "Active noise cancellation, transparency mode, 30-hour total battery.", catIdx: 2, isFeatured: false, stock: 50, images: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop"] },
      { name: "100W GaN Charger", slug: "gan-charger", price: 4900, compareAtPrice: 6900, description: "Compact 100W GaN charger with 3 ports. Charges laptop + phone simultaneously.", catIdx: 3, isFeatured: false, stock: 100, images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop"] },
    ],
  },
};

// ─── Resolve industry key ───────────────────────────────────

function resolveIndustryKey(businessType: string): string {
  const bt = businessType.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  if (bt.includes("real estate") || bt.includes("property") || bt.includes("housing") || bt.includes("apartment") || bt.includes("rental")) return "real-estate";
  if (bt.includes("restaurant") || bt.includes("food") || bt.includes("cafe") || bt.includes("bakery") || bt.includes("catering") || bt.includes("cook") || bt.includes("kitchen")) return "restaurant";
  if (bt.includes("tech") || bt.includes("software") || bt.includes("saas") || bt.includes("app") || bt.includes("digital") || bt.includes("computer") || bt.includes("electronic") || bt.includes("gadget") || bt.includes("phone")) return "technology";
  return "default";
}

// ─── Export ─────────────────────────────────────────────────

export function getIndustrySampleData(businessType: string): IndustrySampleData | null {
  const key = resolveIndustryKey(businessType);
  return INDUSTRY_DATA[key] || null;
}

// Default fallback (generic marketplace)
export const DEFAULT_SAMPLE_DATA: IndustrySampleData = {
  currency: "NGN",
  categories: [
    { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop", description: "Phones, laptops, gadgets & accessories" },
    { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop", description: "Clothing, shoes & accessories" },
    { name: "Home & Kitchen", slug: "home-kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop", description: "Furniture, appliances & décor" },
    { name: "Health & Beauty", slug: "health-beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop", description: "Skincare, makeup & wellness" },
  ],
  products: [
    { name: "Wireless Headphones", slug: "wireless-headphones", price: 24999, compareAtPrice: 45000, description: "Premium wireless headphones with active noise cancellation and 40-hour battery life.", catIdx: 0, isFeatured: true, stock: 48, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"] },
    { name: "Smart Watch Pro", slug: "smart-watch-pro", price: 35500, compareAtPrice: 55000, description: "Advanced smartwatch with heart rate monitoring, GPS tracking, and 7-day battery.", catIdx: 0, isFeatured: true, stock: 32, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"] },
    { name: "Leather Crossbody Bag", slug: "leather-crossbody", price: 18500, compareAtPrice: 32000, description: "Genuine leather crossbody bag with adjustable strap and multiple compartments.", catIdx: 1, isFeatured: true, stock: 25, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop"] },
    { name: "Running Sneakers", slug: "running-sneakers", price: 15700, compareAtPrice: 28000, description: "Lightweight running shoes with cushioned sole and breathable mesh upper.", catIdx: 1, isFeatured: true, stock: 40, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"] },
    { name: "Stainless Steel Cookware Set", slug: "cookware-set", price: 28000, compareAtPrice: 48000, description: "6-piece premium stainless steel cookware set.", catIdx: 2, isFeatured: true, stock: 18, images: ["https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&h=600&fit=crop"] },
    { name: "Vitamin C Serum", slug: "vitamin-c-serum", price: 6800, compareAtPrice: 12000, description: "30ml organic vitamin C face serum with hyaluronic acid.", catIdx: 3, isFeatured: true, stock: 70, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop"] },
  ],
};
