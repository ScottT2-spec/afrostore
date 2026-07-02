import type { ThemePackageDefinition } from "@/lib/templates/types";

export const TEMPLATE_IMPORT_SCHEMA_VERSION = "1.0.0";

export interface TemplateImportSourceSpec {
  slug: string;
  name: string;
  category: "Ecommerce" | "Landing Page" | "Business Website";
  referenceUrl: string;
  renderMode: "html" | "headless";
  sourceType: "static" | "js-heavy";
}

export interface ImportedAssetRecord {
  originalUrl: string;
  localPath: string;
  kind: "image" | "font" | "icon" | "script" | "style" | "video" | "document";
  contentType?: string;
}

export interface TemplateImportReport {
  schemaVersion: typeof TEMPLATE_IMPORT_SCHEMA_VERSION;
  source: TemplateImportSourceSpec;
  capturedAt: string;
  package: ThemePackageDefinition;
  assets: ImportedAssetRecord[];
  substitutedAssets: Array<{
    originalUrl: string;
    reason: string;
    substitute: string;
  }>;
  notes: string[];
}

