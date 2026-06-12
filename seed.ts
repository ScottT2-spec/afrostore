import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Admin
  const adminPassword = await hash("Admin@2026", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@afrostore.com" },
    update: {},
    create: {
      email: "admin@afrostore.com",
      passwordHash: adminPassword,
      firstName: "Afrostore",
      lastName: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // 2. Create Merchant
  const merchantPassword = await hash("Merchant@2026", 12);
  const merchant = await prisma.user.upsert({
    where: { email: "merchant@afrostore.com" },
    update: {},
    create: {
      email: "merchant@afrostore.com",
      passwordHash: merchantPassword,
      firstName: "Kwame",
      lastName: "Mensah",
      role: "MERCHANT",
    },
  });
  console.log("✅ Merchant created:", merchant.email);

  // 3. Create Store for merchant
  const store = await prisma.store.upsert({
    where: { slug: "kwame-fashion-hub" },
    update: {},
    create: {
      ownerId: merchant.id,
      name: "Kwame Fashion Hub",
      slug: "kwame-fashion-hub",
      description: "Premium African fashion, accessories, and lifestyle products.",
      subdomain: "kwame-fashion-hub",
      businessType: "fashion",
      country: "GH",
      currency: "GHS",
      status: "ACTIVE",
      plan: "STARTER",
      settings: {
        create: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
          whatsappNumber: "+233200000000",
        },
      },
      socialLinks: { create: { instagram: "kwamefashionhub", tiktok: "kwamefashion" } },
      members: { create: { userId: merchant.id, role: "OWNER" } },
    },
  });
  console.log("✅ Store created:", store.name);

  // 4. Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: "clothing" } },
      update: {},
      create: { storeId: store.id, name: "Clothing", slug: "clothing", description: "Traditional and modern African clothing" },
    }),
    prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: "accessories" } },
      update: {},
      create: { storeId: store.id, name: "Accessories", slug: "accessories", description: "Handcrafted jewelry and accessories" },
    }),
    prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: "footwear" } },
      update: {},
      create: { storeId: store.id, name: "Footwear", slug: "footwear", description: "African-inspired sneakers and sandals" },
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // 5. Create Products
  const products = [
    { name: "Ankara Maxi Dress", slug: "ankara-maxi-dress", price: 150, stock: 25, categoryId: categories[0].id, description: "Beautiful hand-sewn Ankara maxi dress with vibrant patterns.", tags: ["ankara", "dress", "women"], isFeatured: true },
    { name: "Kente Cloth Bow Tie", slug: "kente-cloth-bow-tie", price: 35, stock: 50, categoryId: categories[1].id, description: "Authentic Kente cloth bow tie, perfect for formal occasions.", tags: ["kente", "accessories", "men"] },
    { name: "African Print Sneakers", slug: "african-print-sneakers", price: 89, stock: 30, categoryId: categories[2].id, description: "Comfortable sneakers with bold African print designs.", tags: ["sneakers", "footwear", "unisex"], isFeatured: true },
    { name: "Gold Hoop Earrings", slug: "gold-hoop-earrings", price: 45, stock: 40, categoryId: categories[1].id, description: "Handcrafted gold-plated hoop earrings inspired by Ashanti designs.", tags: ["jewelry", "earrings", "women"] },
    { name: "Dashiki Shirt", slug: "dashiki-shirt", price: 65, stock: 35, categoryId: categories[0].id, description: "Classic West African Dashiki shirt with embroidered neckline.", tags: ["dashiki", "shirt", "men", "unisex"] },
    { name: "Leather Crossbody Bag", slug: "leather-crossbody-bag", price: 120, stock: 15, categoryId: categories[1].id, description: "Genuine leather crossbody bag with African-inspired patterns.", tags: ["bag", "leather", "accessories"], isFeatured: true },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {},
      create: {
        storeId: store.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        currency: "GHS",
        stock: p.stock,
        status: "ACTIVE",
        tags: p.tags,
        isFeatured: p.isFeatured || false,
      },
    });
  }
  console.log("✅ Products created:", products.length);

  // 6. Create some customers
  const customers = [
    { firstName: "Ama", lastName: "Owusu", email: "ama@example.com", phone: "+233240000001" },
    { firstName: "Kofi", lastName: "Asante", email: "kofi@example.com", phone: "+233240000002" },
    { firstName: "Fatima", lastName: "Ibrahim", email: "fatima@example.com", phone: "+233240000003" },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: c.email } },
      update: {},
      create: { storeId: store.id, ...c },
    });
  }
  console.log("✅ Customers created:", customers.length);

  console.log("\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Admin Login:");
  console.log("  Email:    admin@afrostore.com");
  console.log("  Password: Admin@2026");
  console.log("");
  console.log("  Merchant Login:");
  console.log("  Email:    merchant@afrostore.com");
  console.log("  Password: Merchant@2026");
  console.log("  Store:    Kwame Fashion Hub");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
