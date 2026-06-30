import type { BuilderBlock } from "@/components/storefront/BlockRenderer";

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
  description: string;
  previewImage: string;
  previewUrl: string;
  recommendationKeywords: string[];
  themeConfig: ThemeConfig;
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
  branding?: {
    logo?: string;
    favicon?: string;
    storeBanner?: string;
    colors?: Partial<ThemeConfig["colors"]>;
    fonts?: Partial<ThemeConfig["fonts"]>;
  };
}
