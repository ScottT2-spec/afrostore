import { z } from "zod";

// ─── AUTH ────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── STORES ─────────────────────────────────────────────────

export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  description: z.string().max(500).optional(),
  businessType: z.string().default("general"),
  country: z.string().default("NG"),
  currency: z.string().default("NGN"),
  themeId: z.string().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  currency: z.string().optional(),
  country: z.string().optional(),
  businessType: z.string().optional(),
});

// ─── PRODUCTS ───────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  trackInventory: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).default([]),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).default(0),
    image: z.string().url().optional().nullable(),
    options: z.record(z.string(), z.string()),
  })).default([]),
});

export const updateProductSchema = createProductSchema.partial();

// ─── ORDERS ─────────────────────────────────────────────────

export const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1, "At least one item is required"),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().default("Nigeria"),
    postalCode: z.string().optional(),
    deliveryInstructions: z.string().optional(),
  }),
  deliveryZoneId: z.string().optional(),
  paymentMethod: z.string(),
  couponCode: z.string().optional(),
  note: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
});

// ─── CUSTOMERS ──────────────────────────────────────────────

export const createCustomerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  note: z.string().optional(),
});

// ─── CATEGORIES ─────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
});

// ─── COUPONS ────────────────────────────────────────────────

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ─── DELIVERY ZONES ─────────────────────────────────────────

export const createDeliveryZoneSchema = z.object({
  name: z.string().min(1).max(100),
  areas: z.array(z.string()).min(1),
  fee: z.number().min(0),
  freeAbove: z.number().positive().optional(),
  estimatedDays: z.string().optional(),
});

// ─── PAYMENT GATEWAYS ───────────────────────────────────────

export const setupPaymentGatewaySchema = z.object({
  provider: z.enum(["MONNIFY", "PAYSTACK", "FLUTTERWAVE"]),
  publicKey: z.string().min(1),
  secretKey: z.string().min(1),
  webhookSecret: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// ─── SETTINGS ───────────────────────────────────────────────

export const updateSettingsSchema = z.object({
  allowGuestCheckout: z.boolean().optional(),
  payOnDelivery: z.boolean().optional(),
  bankTransfer: z.boolean().optional(),
  whatsappOrdering: z.boolean().optional(),
  showStockCount: z.boolean().optional(),
  lowDataMode: z.boolean().optional(),
  language: z.string().optional(),
  whatsappNumber: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  tiktokPixelId: z.string().optional(),
});

// ─── PAGES ──────────────────────────────────────────────────

export const createPageSchema = z.object({
  title: z.string().min(1, "Page title is required").max(200),
  type: z.enum(["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"]).default("CUSTOM"),
  content: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"]).optional(),
  content: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// ─── REVIEWS ────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string().url()).default([]),
});

export const moderateReviewSchema = z.object({
  isApproved: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// ─── MEMBERS ────────────────────────────────────────────────

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]).default("STAFF"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
});

// ─── ANALYTICS ──────────────────────────────────────────────

export const analyticsEventSchema = z.object({
  event: z.string().min(1, "Event type is required"),
  page: z.string().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  device: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
