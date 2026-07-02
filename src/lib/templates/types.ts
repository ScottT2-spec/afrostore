import type { BuilderBlock } from "@/components/storefront/BlockRenderer";
import type { PageSettings } from "@/lib/page-content";
import type { PageType } from "@/generated/prisma";

export type ThemePackageCategory = "ecommerce" | "landing" | "business";

export interface ThemePackageManifest {
  category: ThemePackageCategory;
  industry: string;
  siteType: "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";
  version: string;
  tags: string[];
}

export interface ThemePackagePage {
  title: string;
  slug: string;
  type: PageType;
  metaTitle?: string;
  metaDescription?: string;
  settings?: PageSettings;
  blocks: BuilderBlock[];
}

export interface ThemePackageMediaAsset {
  name: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
  mimeType?: string;
  alt?: string;
  folder?: string;
}

export interface ThemePackageCollection {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ThemePackageProduct {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  isFeatured?: boolean;
  tags?: string[];
  categorySlug?: string;
  image?: string;
}

export interface ThemePackageDefinition {
  slug?: string;
  name?: string;
  manifest: ThemePackageManifest;
  theme: {
    homepage_layout: string;
    header_style: string;
    footer_style: string;
    product_card_style: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      headerBg?: string;
      headerText?: string;
      footerBg?: string;
      footerText?: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  seo: {
    homeTitle: string;
    homeDescription: string;
    defaultTitle: string;
    defaultDescription: string;
  };
  navigation: Array<{ label: string; href: string }>;
  footer: {
    columns: Array<{ heading: string; links: Array<{ label: string; href: string }> }>;
    copyright: string;
  };
  menus: Array<{ name: string; slug: string; items: Array<{ label: string; href: string }> }>;
  forms: Array<{ name: string; slug: string; fields: Array<{ name: string; label: string; type: string; required?: boolean }> }>;
  media: ThemePackageMediaAsset[];
  homeSections?: BuilderBlock[];
  pages: ThemePackagePage[];
  products: ThemePackageProduct[];
  collections: ThemePackageCollection[];
  blog: Array<{ title: string; slug: string; excerpt?: string }>;
}

export interface ThemeConfig {
  homepage_layout: string;
  header_style: string;
  footer_style: string;
  product_card_style: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    headerBg?: string;
    headerText?: string;
    footerBg?: string;
    footerText?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  branding?: {
    logo?: string;
    favicon?: string;
    storeBanner?: string;
  };
  sections: BuilderBlock[];
}

export interface TemplateDefinition {
  id?: string;
  name: string;
  slug: string;
  category: string;
  manifest?: {
    category: string;
    siteType: "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";
    industry?: string;
    version?: string;
  };
  description: string;
  previewImage: string;
  previewUrl: string;
  recommendationKeywords: string[];
  themeConfig: ThemeConfig;
  package?: ThemePackageDefinition;
  variants?: Array<{
    name: string;
    keywords: string[];
    sections?: string[];
  }>;
  active: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BusinessAnalysisInput {
  businessName?: string;
  business_name?: string;
  businessCategory?: string;
  category?: string;
  industry?: string;
  description?: string;
  products?: string[] | string;
  services?: string[] | string;
  targetAudience?: string;
  target_audience?: string;
  siteType?: string;
}

export interface TemplateRecommendation {
  template: TemplateDefinition;
  score: number;
  matchPercent: number;
  reasons: string[];
}

export interface ClassificationResult {
  industry: string;
  confidence: number;
  recommended_templates: string[];
}

export interface GeneratedTemplatePage {
  title: string;
  slug: string;
  type: "HOME" | "ABOUT" | "CONTACT" | "CUSTOM" | "SERVICES" | "TEAM" | "FAQ" | "LANDING" | "POLICY" | "THANK_YOU";
  content: BuilderBlock[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface TemplateSelectionInput extends BusinessAnalysisInput {
  templateId?: string;
  templateSlug?: string;
  variant?: string;
  aiBuild?: boolean;
  reinstall?: boolean;
  branding?: {
    logo?: string;
    favicon?: string;
    storeBanner?: string;
    colors?: Partial<ThemeConfig["colors"]>;
    fonts?: Partial<ThemeConfig["fonts"]>;
  };
}
