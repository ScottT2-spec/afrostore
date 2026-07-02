#!/usr/bin/env npx tsx
/**
 * Convert static HTML templates to use {{variable}} placeholders.
 * 
 * Run: npx tsx scripts/convert-templates-to-variables.ts
 * 
 * This script processes each template's index.html / preview.html and replaces
 * hardcoded brand names, titles, descriptions, phone numbers, etc. with
 * {{variable_name}} placeholders.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

// ─── Template metadata: what to replace per template ───

interface TemplateReplacements {
  file: string;
  brandName: string;          // The hardcoded store/brand name to replace
  brandNameAlt?: string[];    // Alternative forms of the brand name
  heroTitle?: string;         // The main hero headline (exact text)
  heroSubtitle?: string;      // Hero sub-paragraph (exact or partial)
  metaDescription?: string;   // Meta description content
  aboutText?: string;         // About section paragraph (partial match for long text)
  copyrightName?: string;     // Name in copyright line (if different from brandName)
  phone?: string;             // Hardcoded phone number
  email?: string;             // Hardcoded email
  address?: string;           // Hardcoded address
}

const STATIC_SITES: TemplateReplacements[] = [
  {
    file: "public/templates/sites/arsha/index.html",
    brandName: "Arsha",
    heroTitle: "Better Solutions For Your Business",
    heroSubtitle: "We are team of talented designers making websites with Bootstrap",
    copyrightName: "Arsha",
  },
  {
    file: "public/templates/sites/clarity/index.html",
    brandName: "Clarity",
    heroTitle: "Transform Your Digital Presence",
    heroSubtitle: "We create innovative digital solutions that drive growth and elevate your brand. From web development to digital marketing, we're your partners in digital transformation.",
    copyrightName: "Clarity",
  },
  {
    file: "public/templates/sites/rival/index.html",
    brandName: "Rival",
    heroTitle: "Elevate Your Brand Through Powerful Digital Craft",
    copyrightName: "Rival",
  },
  {
    file: "public/templates/sites/medicare/index.html",
    brandName: "MediCare",
    heroTitle: "Quality Healthcare, Centered Around Every Patient",
    copyrightName: "MediCare",
  },
  {
    file: "public/templates/sites/travely/index.html",
    brandName: "Travely",
    heroTitle: "Journey Beyond",
    copyrightName: "Travely",
  },
  {
    file: "public/templates/sites/workfolio/index.html",
    brandName: "Workfolio",
    copyrightName: "Workfolio",
  },
  {
    file: "public/templates/sites/strada/index.html",
    brandName: "Strada",
    copyrightName: "Strada",
  },
  {
    file: "public/templates/sites/bistro/index.html",
    brandName: "Bistro",
    brandNameAlt: ["Bistro restaurant"],
  },
  {
    file: "public/templates/sites/nutrio/index.html",
    brandName: "Nutrio",
    brandNameAlt: ["Nutrio restaurant"],
  },
  {
    file: "public/templates/sites/landing-gadget/index.html",
    brandName: "Landing Gadget",
    brandNameAlt: ["WoodMart"],
  },
  {
    file: "public/templates/sites/landing-health/index.html",
    brandName: "Aegis Health",
    heroTitle: "Living Beyond, Living Well",
  },
  {
    file: "public/templates/sites/landing-kids/index.html",
    brandName: "ToyBox Adventure",
    heroTitle: "Spark Their Imagination",
  },
  {
    file: "public/templates/sites/landing-saas-minimal/index.html",
    brandName: "Najaf",
    brandNameAlt: ["Free Framer Template for SaaS", "Free Framer Template"],
  },
  {
    file: "public/templates/sites/landing-tech-saas/index.html",
    brandName: "Pixa Playground",
    brandNameAlt: ["Pixa"],
  },
  {
    file: "public/templates/sites/landing-travel/index.html",
    brandName: "Traveler",
  },
  {
    file: "public/templates/sites/landing-wellness/index.html",
    brandName: "Aurapod",
  },
  {
    file: "public/templates/sites/landing-artsy/index.html",
    brandName: "Gianluca Patti",
  },
  {
    file: "public/templates/sites/landing-dev-portfolio/index.html",
    brandName: "Jamie",
    brandNameAlt: ["Jamie Portfolio"],
  },
];

// E-commerce raw preview templates
const RAW_PREVIEWS: TemplateReplacements[] = [
  { file: "public/templates/jewellery/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/vegetables/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/grocery/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/makeup/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/perfumes/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/cosmetics/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/pottery/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/handmade/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/handmade-bags/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/tshirts/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/fashion-colored/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/fashion/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/pills/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/electronics-acc/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/tools/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/electronics/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/hardware/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/kids/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/toys/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/decor/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/retail/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/wine/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/drinks/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/sweets-bakery/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/food-delivery/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
  { file: "public/templates/event-agency/preview.html", brandName: "Flavor Store", brandNameAlt: ["WoodMart", "FLAVOR", "Flavor"] },
];

const ALL_TEMPLATES = [...STATIC_SITES, ...RAW_PREVIEWS];

// ─── Conversion Logic ───

function convertTemplate(tmpl: TemplateReplacements): { changed: boolean; replacements: number } {
  const filePath = path.resolve(process.cwd(), tmpl.file);
  if (!existsSync(filePath)) {
    console.log(`  ⚠️  SKIP (file not found): ${tmpl.file}`);
    return { changed: false, replacements: 0 };
  }

  let html = readFileSync(filePath, "utf-8");
  const originalHtml = html;
  let replacements = 0;

  // 1. Replace <title> content
  html = html.replace(/<title>([^<]+)<\/title>/i, (_m, title: string) => {
    // Only replace if it contains the brand name or a template-specific title
    const lowerTitle = title.toLowerCase();
    const brandLower = tmpl.brandName.toLowerCase();
    const allNames = [tmpl.brandName, ...(tmpl.brandNameAlt || [])];
    
    if (allNames.some(n => lowerTitle.includes(n.toLowerCase())) || lowerTitle.includes("bootstrap template") || lowerTitle.includes("framer template")) {
      replacements++;
      return `<title>{{meta_title|${tmpl.brandName}}}</title>`;
    }
    return _m;
  });

  // 2. Replace <meta name="description">
  html = html.replace(
    /(<meta\s+name="description"\s+content=")([^"]*)(")/i,
    (_m, pre, _content, post) => {
      replacements++;
      return `${pre}{{meta_description}}${post}`;
    }
  );

  // 3. Replace sitename class elements: <h1 class="sitename">BrandName</h1>
  html = html.replace(
    /(<(?:h1|span|a|div)[^>]*class="[^"]*sitename[^"]*"[^>]*>)([^<]+)(<\/)/gi,
    (_m, open, _text, close) => {
      replacements++;
      return `${open}{{store_name|${tmpl.brandName}}}${close}`;
    }
  );

  // 4. Replace brand name in visible text — careful to only touch text nodes, not attributes/scripts/styles
  const allBrandNames = [tmpl.brandName, ...(tmpl.brandNameAlt || [])];
  
  for (const brand of allBrandNames) {
    if (brand.length < 3) continue; // Skip very short names to avoid false positives
    
    const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const brandRegex = new RegExp(escaped, "g");
    
    // Split out script/style/comment blocks
    const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->)/gi);
    html = parts.map((part, i) => {
      if (i % 2 !== 0) return part; // skip script/style/comment blocks
      
      // Only replace in text content between tags, not in attributes
      return part.replace(/(>)([^<]*?)(<)/g, (m, open, text, close) => {
        if (!brandRegex.test(text)) return m;
        brandRegex.lastIndex = 0;
        
        // Don't replace if already a {{variable}}
        if (text.includes("{{store_name")) return m;
        
        const newText = text.replace(brandRegex, "{{store_name}}");
        if (newText !== text) replacements++;
        return `${open}${newText}${close}`;
      });
    }).join("");
  }

  // 5. Replace hero title if specified
  if (tmpl.heroTitle) {
    const escaped = tmpl.heroTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const heroRegex = new RegExp(`(>\\s*)${escaped}(\\s*<)`, "i");
    html = html.replace(heroRegex, (_m, pre, post) => {
      replacements++;
      return `${pre}{{hero_title|${tmpl.heroTitle}}}${post}`;
    });
  }

  // 6. Replace hero subtitle if specified
  if (tmpl.heroSubtitle) {
    const escaped = tmpl.heroSubtitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const subtitleRegex = new RegExp(escaped, "i");
    
    const parts2 = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->)/gi);
    html = parts2.map((part, i) => {
      if (i % 2 !== 0) return part;
      return part.replace(/(>)([^<]*?)(<)/g, (m, open, text, close) => {
        if (!subtitleRegex.test(text)) return m;
        if (text.includes("{{hero_subtitle")) return m;
        replacements++;
        return `${open}{{hero_subtitle|${text.trim()}}}${close}`;
      });
    }).join("");
  }

  // 7. Replace copyright year patterns: © 2024, © 2025, © 2026, Copyright 2024, etc.
  html = html.replace(
    /(©\s*|Copyright\s+)(\d{4})/gi,
    (_m, prefix, _year) => {
      replacements++;
      return `${prefix}{{copyright_year}}`;
    }
  );

  // 8. Replace copyright name if it hasn't been caught by brand replacement
  // Pattern: © 2024 StoreName or Copyright StoreName
  if (tmpl.copyrightName) {
    const escaped = tmpl.copyrightName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp(`({{copyright_year}}\\s*)${escaped}`, "gi"),
      `$1{{store_name}}`
    );
  }

  // 9. Replace hardcoded phone numbers (common patterns)
  if (tmpl.phone) {
    const escaped = tmpl.phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(escaped, "g"), "{{contact_phone}}");
    replacements++;
  }

  // 10. Replace hardcoded emails
  if (tmpl.email) {
    const escaped = tmpl.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(escaped, "g"), "{{contact_email}}");
    replacements++;
  }

  // 11. Replace WooCommerce currency symbols for e-commerce templates
  html = html.replace(
    /(<span class="woocommerce-Price-currencySymbol">)[^<]*(<\/span>)/g,
    (_m, open, close) => {
      replacements++;
      return `${open}{{currency_symbol}}${close}`;
    }
  );

  // 12. Replace tel: href with variable
  html = html.replace(
    /(href="tel:)[^"]*(")/gi,
    (_m, pre, post) => {
      replacements++;
      return `${pre}{{contact_phone}}${post}`;
    }
  );

  // 13. Replace mailto: href with variable
  html = html.replace(
    /(href="mailto:)[^"]*(")/gi,
    (_m, pre, post) => {
      replacements++;
      return `${pre}{{contact_email}}${post}`;
    }
  );

  const changed = html !== originalHtml;
  if (changed) {
    writeFileSync(filePath, html, "utf-8");
  }

  return { changed, replacements };
}

// ─── Main ───

console.log("🔄 Converting HTML templates to use {{variable}} placeholders...\n");

let totalChanged = 0;
let totalReplacements = 0;

for (const tmpl of ALL_TEMPLATES) {
  console.log(`📄 ${tmpl.file}`);
  const { changed, replacements } = convertTemplate(tmpl);
  if (changed) {
    console.log(`   ✅ ${replacements} replacements made`);
    totalChanged++;
    totalReplacements += replacements;
  } else {
    console.log(`   ⏭️  No changes needed`);
  }
}

console.log(`\n✨ Done! ${totalChanged} files updated with ${totalReplacements} total replacements.`);
