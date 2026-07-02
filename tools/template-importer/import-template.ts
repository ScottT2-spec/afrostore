import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { TemplateImportSourceSpec, TemplateImportReport, ImportedAssetRecord } from "./schema";
import { TEMPLATE_IMPORT_SCHEMA_VERSION } from "./schema";
import { landingGadgetImportedPackage } from "../../src/lib/templates/imported/landing-gadget";
import { getInternalTemplateBySlug } from "../../src/lib/templates/packages";

type FetchLike = typeof fetch;

async function fetchWithTimeout(fetchImpl: FetchLike, url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
  try {
    return await fetchImpl(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toAbsoluteUrl(url: string, baseUrl: string) {
  return new URL(url, baseUrl).toString();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function extractUrlsFromCss(css: string): string[] {
  const matches = [...css.matchAll(/url\((['"]?)(.*?)\1\)/gi)];
  return matches.map((match) => match[2]).filter(Boolean);
}

function extractStylesheetHrefs(html: string): string[] {
  const matches = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)];
  return matches.map((match) => match[1]).filter(Boolean);
}

function extractAssetCandidates(html: string): string[] {
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<source[^>]+src=["']([^"']+)["']/gi,
    /<source[^>]+srcset=["']([^"']+)["']/gi,
    /<script[^>]+src=["']([^"']+)["']/gi,
    /<link[^>]+href=["']([^"']+)["']/gi,
    /style=["'][^"']*background-image:\s*url\((['"]?)(.*?)\1\)/gi,
  ];
  const candidates: string[] = [];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      candidates.push(match[1] || match[2] || "");
    }
  }
  return unique(candidates.filter(Boolean));
}

async function readText(fetchImpl: FetchLike, url: string) {
  const response = await fetchWithTimeout(fetchImpl, url, 20_000);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function packageForSource(source: TemplateImportSourceSpec) {
  if (source.slug === "landing-gadget") return landingGadgetImportedPackage;
  const internal = getInternalTemplateBySlug(source.slug);
  if (internal?.package) return internal.package;
  return {
    manifest: {
      category: source.category === "Landing Page" ? "landing" : source.category === "Business Website" ? "business" : "ecommerce",
      industry: source.name,
      siteType: source.category === "Landing Page" ? "LANDING_PAGE" : source.category === "Business Website" ? "WEBSITE" : "ECOMMERCE",
      version: TEMPLATE_IMPORT_SCHEMA_VERSION,
      tags: [source.slug, source.name.toLowerCase()],
    },
    theme: {
      homepage_layout: source.category === "Landing Page" ? "landing-imported" : source.category === "Business Website" ? "business-imported" : "commerce-imported",
      header_style: "imported",
      footer_style: "imported",
      product_card_style: "imported",
      colors: {
        primary: "#111827",
        secondary: "#0F172A",
        accent: "#D97706",
        background: "#ffffff",
        text: "#111827",
      },
      fonts: { heading: "Inter", body: "Inter" },
    },
    seo: {
      homeTitle: source.name,
      homeDescription: source.referenceUrl,
      defaultTitle: source.name,
      defaultDescription: source.referenceUrl,
    },
    navigation: [],
    footer: { columns: [], copyright: source.name },
    menus: [],
    forms: [],
    media: [],
    pages: [],
    products: [],
    collections: [],
    blog: [],
  };
}

async function downloadAsset(fetchImpl: FetchLike, assetUrl: string, destinationDir: string, baseUrl: string): Promise<ImportedAssetRecord | null> {
  try {
    const absoluteUrl = toAbsoluteUrl(assetUrl, baseUrl);
    const response = await fetchWithTimeout(fetchImpl, absoluteUrl, 10_000);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    const body = Buffer.from(await response.arrayBuffer());
    const assetPath = new URL(absoluteUrl).pathname;
    const fileName = path.basename(assetPath) || `asset-${Date.now()}`;
    const localPath = path.join(destinationDir, fileName);
    await fs.mkdir(destinationDir, { recursive: true });
    await fs.writeFile(localPath, body);

    const kind: ImportedAssetRecord["kind"] =
      contentType.includes("font") ? "font" :
      contentType.includes("image") ? "image" :
      contentType.includes("javascript") ? "script" :
      contentType.includes("css") ? "style" :
      contentType.includes("video") ? "video" :
      contentType.includes("pdf") ? "document" : "image";

    return { originalUrl: absoluteUrl, localPath, kind, contentType };
  } catch {
    return null;
  }
}

export async function importTemplateFromReference(source: TemplateImportSourceSpec, options: { fetchImpl?: FetchLike; outputDir?: string } = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const outputDir = options.outputDir || path.resolve(process.cwd(), "tmp", "template-imports", source.slug);
  const referenceHtml = await readText(fetchImpl, source.referenceUrl);
  const stylesheetHrefs = extractStylesheetHrefs(referenceHtml).map((href) => toAbsoluteUrl(href, source.referenceUrl));
  const stylesheetCss = await Promise.all(stylesheetHrefs.map(async (href) => readText(fetchImpl, href).catch(() => "")));

  const cssAssetUrls = stylesheetCss.flatMap((css) => extractUrlsFromCss(css));
  const htmlAssetUrls = extractAssetCandidates(referenceHtml);
  const allAssetUrls = unique([...htmlAssetUrls, ...cssAssetUrls]);

  const assets: ImportedAssetRecord[] = [];
  for (const assetUrl of allAssetUrls) {
    const asset = await downloadAsset(fetchImpl, assetUrl, path.join(outputDir, "assets"), source.referenceUrl);
    if (asset) assets.push(asset);
  }

  const packageStub = packageForSource(source);

  const substitutedAssets: TemplateImportReport["substitutedAssets"] = [];
  const report: TemplateImportReport = {
    schemaVersion: TEMPLATE_IMPORT_SCHEMA_VERSION,
    source,
    capturedAt: new Date().toISOString(),
    package: packageStub as unknown as TemplateImportReport["package"],
    assets,
    substitutedAssets,
    notes: [
      `Fetched ${stylesheetHrefs.length} stylesheet(s) and ${assets.length} asset(s) from the reference URL.`,
      "DOM-to-package extraction is intentionally schema-first so the generated package maps into the existing editable site model.",
    ],
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(path.join(outputDir, "source.html"), referenceHtml, "utf8");
  await fs.writeFile(path.join(outputDir, "styles.json"), JSON.stringify({ stylesheetHrefs, stylesheetCount: stylesheetHrefs.length }, null, 2), "utf8");

  return report;
}

export async function importFromCli() {
  const [, , specFile] = process.argv;
  if (!specFile) {
    throw new Error("Usage: tsx tools/template-importer/import-template.ts <spec.json>");
  }
  const specUrl = pathToFileURL(path.resolve(specFile));
  const source = JSON.parse(await fs.readFile(specUrl, "utf8")) as TemplateImportSourceSpec;
  const report = await importTemplateFromReference(source);
  console.log(JSON.stringify(report, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").toString()) {
  importFromCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
