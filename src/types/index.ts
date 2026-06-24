// ─── Site Types ─────────────────────────────────────────────
export type SiteType = "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: string;
  status: string;
  createdAt: Date;
  sites?: Site[];
  _count?: { sites: number; members: number };
}

export interface Site {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  siteType: SiteType;
  subdomain: string;
  customDomain?: string;
  currency: string;
  country: string;
  businessType: string;
  industry?: string;
  status: "ACTIVE" | "PAUSED" | "SUSPENDED";
  theme: SiteTheme;
  paymentGateways: PaymentGateway[];
  socialLinks: SocialLinks;
  settings: SiteSettings;
  createdAt: Date;
}

export interface SiteTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: string;
}

// ─── Products ───────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  category: string;
  brand?: string;
  variants: ProductVariant[];
  stock: number;
  sku?: string;
  productType: "PHYSICAL" | "DIGITAL" | "SUBSCRIPTION" | "SERVICE";
  status: "active" | "draft" | "archived";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  price?: number;
  stock?: number;
  sku?: string;
}

// ─── Orders ─────────────────────────────────────────────────
export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress?: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "pending" | "confirmed" | "processing"
  | "shipped" | "delivered" | "cancelled" | "refunded";

export type PaymentStatus =
  | "pending" | "paid" | "failed" | "refunded" | "partially_refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  price: number;
  image?: string;
}

// ─── Customers ──────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  deliveryInstructions?: string;
}

// ─── Payments ───────────────────────────────────────────────
export interface PaymentGateway {
  provider: "monnify" | "paystack" | "flutterwave" | "stripe" | "paypal";
  enabled: boolean;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
}

// ─── Settings ───────────────────────────────────────────────
export interface SocialLinks {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SiteSettings {
  allowGuestCheckout: boolean;
  payOnDelivery: boolean;
  bankTransfer: boolean;
  whatsappOrdering: boolean;
  showStockCount: boolean;
  lowDataMode: boolean;
  offlineMode: boolean;
  language: string;
  deliveryZones: DeliveryZone[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  freeAbove?: number;
  estimatedDays: string;
}

// ─── Blogs ──────────────────────────────────────────────────
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: unknown;
  contentHtml?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  createdAt: Date;
}

// ─── Forms ──────────────────────────────────────────────────
export interface Form {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fields: FormField[];
  submitButtonText: string;
  successMessage?: string;
  isActive: boolean;
  submissionCount: number;
}

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select, radio, checkbox
}

// ─── CRM ────────────────────────────────────────────────────
export interface CrmContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  score: number;
  tags: string[];
  lastActivityAt?: Date;
  createdAt: Date;
}

// ─── Funnels ────────────────────────────────────────────────
export interface Funnel {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  steps: FunnelStep[];
  createdAt: Date;
}

export interface FunnelStep {
  id: string;
  name: string;
  type: "LANDING" | "LEAD_FORM" | "THANK_YOU" | "CHECKOUT" | "UPSELL" | "DOWNSELL" | "CONFIRMATION" | "WEBINAR" | "VIDEO";
  position: number;
  conversionCount: number;
  viewCount: number;
}

// ─── Campaigns ──────────────────────────────────────────────
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// ─── Marketplace ────────────────────────────────────────────
export interface Plan {
  id: string;
  name: "free" | "starter" | "business" | "growth" | "agency" | "enterprise";
  maxProducts: number;
  maxSites: number;
  features: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  preview: string;
  category: string;
  industry: string;
  isPremium: boolean;
  isFeatured: boolean;
  tags: string[];
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  author: string;
  version: string;
  isPremium: boolean;
  isInstalled: boolean;
  rating: number;
  installs: number;
}

// ─── Dashboard ──────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionRate: number;
  // Website-specific
  totalPageViews?: number;
  totalFormSubmissions?: number;
  // Landing page-specific
  totalLeads?: number;
  totalFunnelConversions?: number;
}

// ─── AI ─────────────────────────────────────────────────────
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: AIAction[];
}

export interface AIAction {
  type: string;
  label: string;
  data?: Record<string, unknown>;
}

// ─── Builder ────────────────────────────────────────────────
export interface BuilderBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: BuilderBlock[];
}
