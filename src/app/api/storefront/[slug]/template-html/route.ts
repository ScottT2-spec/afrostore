import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { getTemplateHtmlPath, hasTemplateHtml } from "@/lib/templates/template-html-map";
import { findStoredTemplatePage } from "@/lib/templates/site-instance";
import { buildCustomizationBridgeScript, buildCustomizationCss, getResolvedPageSettings, loadSiteCustomizationSafely, type SiteCustomizationDocument } from "@/lib/site-customization";
import { substituteTemplateVariables, buildTemplateVariables } from "@/lib/templates/template-variables";

// Force dynamic — never statically cache this route
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/storefront/:slug/template-html
 * 
 * Serves the template's raw HTML with real store data injected.
 * This preserves the EXACT template layout, CSS, sidebars, footer — everything.
 * Only content (store name, products, prices, images, contact info) is substituted.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    // 1. Resolve the store
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
    });
    if (!site) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 2. Get the active template
    const activeTemplate = await prisma.siteTemplate.findFirst({
      where: { siteId: site.id, isActive: true },
      select: {
        variant: true,
        themeConfig: true,
        pages: true,
        customHtml: true,
        template: { select: { id: true, name: true, slug: true } },
      },
    });
    const customization = await loadSiteCustomizationSafely(
      prisma.siteCustomization.findUnique({
        where: { siteId: site.id },
      })
    );
    const homePage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        isPublished: true,
        OR: [{ type: "HOME" }, { type: "LANDING" }],
      },
      select: { id: true, slug: true, title: true },
    });

    const templateSlug = activeTemplate?.template?.slug;
    if (!templateSlug || !hasTemplateHtml(templateSlug)) {
      return NextResponse.json({ error: "No HTML template available" }, { status: 404 });
    }

    // Check for edit mode
    const isEditMode = req.nextUrl.searchParams.get("afro_edit") === "1";

    // 3. Read the template HTML — use customHtml if merchant has edited it
    const htmlRelPath = getTemplateHtmlPath(templateSlug);
    if (!htmlRelPath) {
      return NextResponse.json({ error: "Template HTML path not found" }, { status: 404 });
    }

    let html: string;
    if (activeTemplate?.customHtml) {
      // Merchant has a saved custom version — use that
      html = activeTemplate.customHtml;
    } else {
      // Use the base template file
      const htmlAbsPath = path.join(process.cwd(), "public", htmlRelPath);
      try {
        html = await readFile(htmlAbsPath, "utf-8");
      } catch {
        return NextResponse.json({ error: "Template HTML file not found" }, { status: 404 });
      }
    }

    // 4. Fetch store data for substitution
    const [settings, socialLinks, products, categories] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { siteId: site.id } }),
      prisma.siteSocialLinks.findUnique({ where: { siteId: site.id } }),
      prisma.product.findMany({
        where: { siteId: site.id, status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 50,
      }),
      prisma.category.findMany({
        where: { siteId: site.id },
        select: { name: true, slug: true },
      }),
    ]);

    const currency = site.currency || "NGN";
    const currencySymbols: Record<string, string> = {
      NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€",
    };
    const currencySymbol = currencySymbols[currency] || currency;
    const whatsappNumber = settings?.whatsappNumber || socialLinks?.whatsapp || "";

    // 4b. Fix relative asset paths — make them absolute so they resolve from the API route
    const templateDir = htmlRelPath.substring(0, htmlRelPath.lastIndexOf("/"));
    // Only fix asset paths if using base template (customHtml already has them fixed)
    if (!activeTemplate?.customHtml) {
      html = fixAssetPaths(html, templateDir);
    }

    // 5. Perform data substitution
    //    Step A: Replace {{variable}} placeholders with real store data (all templates)
    //    Step B: Replace dynamic product/category data (e-commerce templates)
    //    Skip text substitution on custom HTML — merchant edits ARE the content.
    const storeProducts = products.map((p) => ({
      name: p.name,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      imageUrl: p.images[0]?.url || null,
      imageAlt: p.images[0]?.alt || p.name,
      category: p.category?.name || "",
      inStock: p.stock > 0,
      slug: p.slug,
    }));

    if (activeTemplate?.customHtml) {
      // Custom HTML: only inject dynamic product data, don't touch text/names
      html = replaceProducts(html, storeProducts);
    } else {
      // Step A: Template variable substitution ({{store_name}}, {{hero_title}}, etc.)
      const templateVars = buildTemplateVariables({
        storeName: site.name,
        storeDescription: site.description || undefined,
        storeLogo: site.logo || undefined,
        storeSlug: slug,
        whatsappNumber: whatsappNumber || undefined,
        contactPhone: whatsappNumber || undefined,
        socialLinks: {
          instagram: socialLinks?.instagram || undefined,
          facebook: socialLinks?.facebook || undefined,
          twitter: socialLinks?.twitter || undefined,
          tiktok: socialLinks?.tiktok || undefined,
        },
        metaTitle: settings?.metaTitle || undefined,
        metaDescription: settings?.metaDescription || undefined,
      });
      html = substituteTemplateVariables(html, templateVars);

      // Step B: Dynamic data — currency, products, categories, links (keeps the existing logic)
      html = replaceCurrency(html, currencySymbol);
      html = replaceProducts(html, storeProducts);
      html = replaceCategories(html, categories.map((c) => c.name), slug);
      html = fixEmptyNavLinks(html, slug);
      html = replaceFooterLinks(html, slug);
      html = rewriteLinks(html, slug);

      if (whatsappNumber) {
        html = replaceContactInfo(html, whatsappNumber);
      }
    }

    // 6. Inject navigation overlay + cart bridge script
    html = injectStorefrontBridge(html, slug, site.name, currency, currencySymbol, isEditMode);

    // 7. Inject site customization bridge/styles so saved and live drafts render visually
    const fallbackHomePage = homePage || findStoredTemplatePage(activeTemplate?.pages, "home");
    html = injectCustomizationLayers(html, customization, fallbackHomePage ? getResolvedPageSettings(fallbackHomePage, {}, customization) : null);

    // 8. If edit mode, inject the template editor script
    if (isEditMode) {
      html = injectEditorScript(html);
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Template HTML error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ─── Data Types ─── */

interface StoreProduct {
  name: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  imageAlt: string;
  category: string;
  inStock: boolean;
  slug: string;
}

/* ─── Asset Path Fixer ─── */

function fixAssetPaths(html: string, templateDir: string): string {
  // Inject a <base> tag so all relative paths (CSS, JS, images) resolve correctly.
  // This is the most reliable approach — no need to regex-replace every href/src.
  const baseHref = `${templateDir}/`;
  const baseTag = `<base href="${baseHref}">`;

  if (html.includes("<head>")) {
    // Insert right after <head>
    html = html.replace(/<head>/i, `<head>\n${baseTag}`);
  } else if (html.includes("<html")) {
    // No <head> tag — inject after <html...>
    html = html.replace(/(<html[^>]*>)/i, `$1\n<head>${baseTag}</head>`);
  } else {
    // Last resort — prepend
    html = `${baseTag}\n${html}`;
  }

  return html;
}

/* ─── Dynamic Data Substitution (currency, products, categories, links) ─── */

function replaceCurrency(html: string, currencySymbol: string): string {
  // WoodMart uses &#36; for $ — replace with store currency
  // Only replace within price contexts to avoid breaking CSS/JS
  html = html.replace(
    /(<span class="woocommerce-Price-currencySymbol">)[^<]*/g,
    `$1${currencySymbol}`
  );

  return html;
}

function replaceProducts(
  html: string,
  products: StoreProduct[]
): string {
  if (products.length === 0) return html;

  let productIndex = 0;

  // Replace product titles in wd-entities-title blocks
  html = html.replace(
    /(<[^>]*class="wd-entities-title"[^>]*>)\s*<a[^>]*>([^<]+)<\/a>/g,
    (_match, prefix) => {
      if (productIndex >= products.length) {
        // Cycle through products if template has more slots
        productIndex = 0;
      }
      const product = products[productIndex];
      const href = `/store/${product.slug}`;
      productIndex++;
      return `${prefix}<a href="${href}">${product.name}</a>`;
    }
  );

  // Reset index for price replacement
  productIndex = 0;

  // Replace prices - WoodMart pattern: <bdi><span class="woocommerce-Price-currencySymbol">$</span>199.00</bdi>
  html = html.replace(
    /(<bdi>\s*<span class="woocommerce-Price-currencySymbol">[^<]*<\/span>)[\d,.]+(<\/bdi>)/g,
    (_match, prefix, suffix) => {
      if (productIndex >= products.length) productIndex = 0;
      const product = products[productIndex];
      const price = formatPrice(product.price);
      productIndex++;
      return `${prefix}${price}${suffix}`;
    }
  );

  // Replace product images if store has real product images
  const productsWithImages = products.filter((p) => p.imageUrl);
  if (productsWithImages.length > 0) {
    let imgIndex = 0;
    // Replace product images (identified by default-product pattern in src)
    html = html.replace(
      /(<img[^>]*)(src="[^"]*default-product[^"]*")([^>]*)(alt="[^"]*")?/g,
      (_match, before, _oldSrc, after) => {
        if (imgIndex >= productsWithImages.length) imgIndex = 0;
        const product = productsWithImages[imgIndex];
        imgIndex++;
        return `${before}src="${product.imageUrl}"${after}alt="${product.imageAlt}"`;
      }
    );

    // Also fix srcset that references default-product images
    html = html.replace(
      /srcset="[^"]*default-product[^"]*"/g,
      'srcset=""'
    );
  }

  return html;
}

function replaceContactInfo(html: string, phone: string): string {
  // Only replace phone numbers inside safe contexts — NOT inside <script>, <style>, or attributes.
  // Target: visible text that looks like a phone number (tel: links, aria-labels, visible spans).
  
  // 1. Replace tel: href values
  html = html.replace(
    /(href="tel:)[^"]*(")/gi,
    `$1${phone.replace(/[^0-9+]/g, "")}$2`
  );

  // 2. Replace phone numbers inside known contact containers only
  // Match text nodes inside elements with contact-related classes
  html = html.replace(
    /(<(?:a|span|p|div|li)[^>]*class="[^"]*(?:phone|tel|contact|whatsapp)[^"]*"[^>]*>)([^<]+)(<\/)/gi,
    (_match, open, _text, close) => `${open}${phone}${close}`
  );

  return html;
}

/**
 * Fix empty href="" and href="#" links by mapping their visible text to
 * in-page section anchors or store pages. Works across all templates.
 */
function fixEmptyNavLinks(html: string, storeSlug: string): string {
  // Map of common link text -> target (anchor or path)
  const textToTarget: Record<string, string> = {
    // Common sections (scroll to anchor)
    "about": "#about",
    "about us": "#about",
    "about me": "#about",
    "who we are": "#about",
    "our story": "#about",
    "contact": "#contact",
    "contact us": "#contact",
    "get in touch": "#contact",
    "menus": "#menu",
    "menu": "#menu",
    "our menu": "#menu",
    "breakfast menu": "#menu",
    "lunch menu": "#menu",
    "dinner menu": "#menu",
    "dessert menu": "#menu",
    "drinks menu": "#menu",
    "services": "#services",
    "our services": "#services",
    "what we do": "#services",
    "portfolio": "#portfolio",
    "our work": "#portfolio",
    "work": "#portfolio",
    "projects": "#portfolio",
    "gallery": "#gallery",
    "pricing": "#pricing",
    "plans": "#pricing",
    "team": "#team",
    "our team": "#team",
    "staff": "#team",
    "testimonials": "#testimonials",
    "reviews": "#testimonials",
    "faq": "#faq",
    "faqs": "#faq",
    "blog": "#blog",
    "news": "#blog",
    "features": "#features",
    "how it works": "#how-it-works",
    "reservation": "#reservation",
    "reservations": "#reservation",
    "book a table": "#reservation",
    "booking": "#reservation",
    "book now": "#reservation",
    "locations": "#contact",
    "skills": "#skills",
    "experience": "#experience",
    // Pages (navigate to store subpages)
    "shop": `/store/${storeSlug}/shop`,
    "shop now": `/store/${storeSlug}/shop`,
    "order online": `/store/${storeSlug}/shop`,
    "buy now": `/store/${storeSlug}/shop`,
    "all products": `/store/${storeSlug}/shop`,
    "collections": `/store/${storeSlug}/shop`,
    "privacy policy": `/store/${storeSlug}/privacy-policy`,
    "privacy": `/store/${storeSlug}/privacy-policy`,
    "terms": `/store/${storeSlug}/terms`,
    "terms of service": `/store/${storeSlug}/terms`,
  };

  // Fix href="" and href="#" links by matching their text content
  // Use [\s\S]*? for text to handle multiline content inside <a> tags
  html = html.replace(
    /<a([^>]*?)\s+href=["'](?:|#)["']([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, before, after, text) => {
      const trimmed = text.replace(/<[^>]*>/g, '').trim().toLowerCase();
      if (!trimmed) return match; // empty link text, skip
      const target = textToTarget[trimmed];
      if (target) {
        return `<a${before} href="${target}"${after}>${text}</a>`;
      }
      // No match — keep as-is but add a data attribute so bridge script can handle
      return `<a${before} href="#" data-afro-nav="${trimmed}"${after}>${text}</a>`;
    }
  );

  // Ensure sections have IDs matching anchor targets.
  // Strategy: scan all <section> elements, look at their text content for keywords,
  // and assign the corresponding ID if not already present.
  const keywordToId: [RegExp, string][] = [
    [/\b(?:about|who we are|our story|welcomes?\s+you|founded)\b/i, "about"],
    [/\b(?:contact|get in touch|reach\s+us|find\s+us|location)\b/i, "contact"],
    [/\b(?:menu|breakfast|lunch|dinner|dessert|drinks|dishes|cuisine)\b/i, "menu"],
    [/\b(?:services?|what we (?:do|offer))\b/i, "services"],
    [/\b(?:portfolio|our work|projects?|gallery|showcase)\b/i, "portfolio"],
    [/\b(?:pricing|plans?|packages?)\b/i, "pricing"],
    [/\b(?:team|staff|people|meet\s+(?:our|the))\b/i, "team"],
    [/\b(?:faq|frequently|questions)\b/i, "faq"],
    [/\b(?:testimonial|review|what\s+(?:our|people)\s+(?:clients?|say))\b/i, "testimonials"],
    [/\b(?:blog|news|articles?|latest\s+posts?)\b/i, "blog"],
    [/\b(?:features?|why\s+(?:choose|us))\b/i, "features"],
    [/\b(?:skills?|expertise|proficien)\b/i, "skills"],
    [/\b(?:experience|career|timeline|history)\b/i, "experience"],
    [/\b(?:how\s+it\s+works|process|steps?)\b/i, "how-it-works"],
  ];

  const assignedIds = new Set<string>();
  // Collect existing IDs
  const existingIds = html.match(/id="([^"]+)"/g);
  if (existingIds) existingIds.forEach(m => assignedIds.add(m.slice(4, -1)));

  // Match each <section> block and check its content
  html = html.replace(
    /(<section\b)([^>]*>)([\s\S]*?)(<\/section>)/gi,
    (match, tag, attrs, content, close) => {
      if (attrs.includes('id=')) return match; // already has ID
      // Strip HTML tags to get text content for matching
      const text = content.replace(/<[^>]*>/g, ' ').substring(0, 500);
      for (const [pattern, id] of keywordToId) {
        if (assignedIds.has(id)) continue;
        if (pattern.test(text)) {
          assignedIds.add(id);
          return `${tag} id="${id}"${attrs}${content}${close}`;
          }
      }
      return match;
    }
  );

  return html;
}

function replaceFooterLinks(html: string, storeSlug: string): string {
  const shopHref = `/store/${storeSlug}/shop`;

  // Replace footer widget links that point to demo pages
  // Footer toggle/widget links with text like "About Us", "Contact", "FAQ", etc.
  html = html.replace(
    /(<a[^>]*class="[^"]*(?:wp-block-wd-menu-list|footer|widget)[^"]*"[^>]*)href="[^"]*"/g,
    `$1href="${shopHref}"`
  );

  // Replace links inside footer sections (wd-toggle-content, footer-sidebar)
  html = html.replace(
    /(class="[^"]*(?:wd-toggle-content|footer-column|footer-sidebar)[^"]*"[\s\S]*?<a[^>]*)href="(?:https?:\/\/[^"]*|\/[^"]*(?!\.(?:css|js|png|jpg|svg|woff2?))[^"]*)"/g,
    `$1href="${shopHref}"`
  );

  return html;
}

function replaceCategories(html: string, categories: string[], storeSlug: string): string {
  if (categories.length === 0) return html;

  let catIndex = 0;

  // Replace WoodMart category titles in product-category blocks
  html = html.replace(
    /(<div[^>]*class="[^"]*product-category[^"]*"[^>]*>[\s\S]*?<[^>]*class="wd-entities-title"[^>]*>\s*<a[^>]*>)([^<]+)(<\/a>)/g,
    (_match, prefix, _oldName, suffix) => {
      if (catIndex >= categories.length) catIndex = 0;
      const cat = categories[catIndex++];
      return `${prefix}${cat}${suffix}`;
    }
  );

  // Replace category links in sidebar widget lists (WoodMart pattern)
  html = html.replace(
    /(<li[^>]*class="[^"]*cat-item[^"]*"[^>]*>\s*<a[^>]*)href="[^"]*"(>)([^<]+)(<\/a>)/g,
    (_match, before, gt, _oldName, after) => {
      if (catIndex >= categories.length) catIndex = 0;
      const cat = categories[catIndex++];
      return `${before}href="/store/${storeSlug}/shop"${gt}${cat}${after}`;
    }
  );

  // Replace nav menu items that link to product-category pages
  html = html.replace(
    /(<a[^>]*href="[^"]*product-category[^"]*"[^>]*>)([^<]+)(<\/a>)/g,
    (_match, open, _oldName, close) => {
      if (catIndex >= categories.length) catIndex = 0;
      const cat = categories[catIndex++];
      const newOpen = open.replace(/href="[^"]*"/, `href="/store/${storeSlug}/shop"`);
      return `${newOpen}${cat}${close}`;
    }
  );

  return html;
}

function rewriteLinks(html: string, storeSlug: string): string {
  const shopHref = `/store/${storeSlug}/shop`;
  const homeHref = `/store/${storeSlug}`;

  // 1. Rewrite known demo-site full URLs (woodmart, themeforest, etc.)
  const demoDomains = [
    "woodmart.xtemos.com",
    "preview.themeforest.net",
  ];
  const demoPattern = new RegExp(
    `href="https?://(?:${demoDomains.map(d => d.replace(/\./g, "\\.")).join("|")})(/[^"]*)"`,
    "g"
  );
  html = html.replace(demoPattern, (_match, path: string) => {
    return `href="${classifyDemoPath(path, storeSlug)}"`;
  });

  // 2. Rewrite relative demo paths: /demo-<name>/... or /<demo-slug>/...
  //    These appear in cosmetics, electronics, retail, grocery templates
  html = html.replace(
    /href="\/(?:demo-[a-z-]+|[a-z-]+)\/demo\/[a-z-]+\/(\?add-to-cart=\d+)"/g,
    `href="${shopHref}"`
  );
  html = html.replace(
    /href="\/(?:demo-[a-z-]+|[a-z-]+)\/demo\/[a-z-]+\/[^"]*"/g,
    `href="${shopHref}"`
  );

  // 3. Rewrite empty hrefs and placeholder links
  html = html.replace(/href="(?:http:\/\/|https:\/\/)?"/g, `href="${homeHref}"`);

  return html;
}

/** Classify a demo-site URL path and map it to the appropriate store page */
function classifyDemoPath(path: string, storeSlug: string): string {
  const shopHref = `/store/${storeSlug}/shop`;
  const homeHref = `/store/${storeSlug}`;

  // Product pages: /*/product/product-slug/
  if (/\/product\/[^/]+/.test(path)) {
    return shopHref;
  }
  // Category pages: /*/product-category/cat-slug/
  if (/\/product-category\//.test(path)) {
    return shopHref;
  }
  // Shop pages
  if (/\/shop\/?/.test(path)) {
    return shopHref;
  }
  // Collections / catalog
  if (/\/collections?\/?/.test(path)) {
    return shopHref;
  }
  // Wishlist
  if (/\/wishlist\/?/.test(path)) {
    return `/store/${storeSlug}/wishlist`;
  }
  // Cart / checkout
  if (/\/(?:cart|checkout)\/?/.test(path)) {
    return `/checkout`;
  }
  // About page
  if (/\/about/.test(path)) {
    return `/store/${storeSlug}/about`;
  }
  // Contact page
  if (/\/contact/.test(path)) {
    return `/store/${storeSlug}/contact`;
  }
  // Blog
  if (/\/blog/.test(path)) {
    return homeHref;
  }
  // Default — send to shop
  return shopHref;
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/* ─── Bridge Script Injection ─── */

function injectStorefrontBridge(
  html: string,
  storeSlug: string,
  storeName: string,
  currency: string,
  currencySymbol: string,
  isEditMode = false
): string {
  // Inject a small script before </body> that:
  // 1. Communicates with parent frame for cart functionality
  // 2. Intercepts add-to-cart clicks
  // 3. Handles navigation to store pages
  const bridgeScript = `
<script>
(function() {
  var storeSlug = ${JSON.stringify(storeSlug)};
  var storeName = ${JSON.stringify(storeName)};
  var currency = ${JSON.stringify(currency)};
  var currencySymbol = ${JSON.stringify(currencySymbol)};
  var isEditMode = ${JSON.stringify(isEditMode)};
  var shopHref = '/store/' + storeSlug + '/shop';
  var homeHref = '/store/' + storeSlug;

  // Helper: navigate parent frame
  function navigateParent(href) {
    if (isEditMode && href.indexOf('afro_editor=1') === -1) {
      href += (href.indexOf('?') === -1 ? '?' : '&') + 'afro_editor=1';
    }
    window.parent.location.href = href;
  }

  // Helper: classify and redirect a link
  function resolveHref(href) {
    if (!href || href === '' || href === '#' || href === 'http://' || href === 'https://') return null;
    if (href.startsWith('javascript:')) return null;
    if (href.startsWith('#')) return 'anchor'; // let anchor links work normally
    if (href.startsWith('/store/') || href.startsWith('/checkout')) return href;
    if (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('whatsapp:') || href.startsWith('https://wa.me')) return 'passthrough';
    if (href.startsWith('https://maps.') || href.startsWith('https://www.google.com/maps')) return 'external';
    // Social media links — open externally
    if (/https?:\/\/(www\.)?(facebook|instagram|twitter|x|tiktok|youtube|linkedin|pinterest|telegram)\./.test(href)) return 'external';
    // Demo site links that were missed by server-side rewrite
    if (/woodmart\.xtemos\.com|preview\.themeforest\.net/.test(href)) return shopHref;
    // Relative demo paths
    if (/\/demo[-\/]/.test(href) || /\?add-to-cart=/.test(href)) return shopHref;
    // External links
    if (href.startsWith('http')) return 'external';
    // Relative links (non-asset) — redirect to shop
    if (!href.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/i)) return shopHref;
    return null;
  }

  // Intercept all link clicks
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    var resolved = resolveHref(href);

    if (resolved === null) { e.preventDefault(); return; }
    if (resolved === 'anchor') return; // let browser handle
    if (resolved === 'passthrough') return; // tel:, mailto:, whatsapp:
    if (resolved === 'external') { e.preventDefault(); window.open(href, '_blank'); return; }

    // Internal store navigation
    e.preventDefault();
    navigateParent(resolved);
  });

  // Intercept add-to-cart buttons (WoodMart + generic patterns)
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.wd-add-btn, .add_to_cart_button, [class*="add-to-cart"], .wd-action-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Find the product card this button belongs to
    var productCard = btn.closest('.wd-product, .product, .wd-carousel-item');
    if (!productCard) return;
    
    var titleEl = productCard.querySelector('.wd-entities-title a, .woocommerce-loop-product__title, h3 a, h2 a');
    var priceEl = productCard.querySelector('.woocommerce-Price-amount bdi, .price .amount, .price');
    
    var productName = titleEl ? titleEl.textContent.trim() : 'Product';
    var productPrice = priceEl ? priceEl.textContent.replace(/[^\\d.,]/g, '') : '0';
    
    // Send to parent frame
    window.parent.postMessage({
      type: 'afrostore-add-to-cart',
      product: {
        name: productName,
        price: parseFloat(productPrice.replace(/,/g, '')),
        currency: currency,
      }
    }, '*');
    
    // Visual feedback
    var originalText = btn.textContent;
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
    setTimeout(function() { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }, 800);
  });

  // Make product cards clickable — clicking anywhere on a product card navigates to shop
  document.addEventListener('click', function(e) {
    if (e.target.closest('a[href], button, .wd-add-btn, .wd-action-btn')) return;
    var card = e.target.closest('.wd-product, .product');
    if (!card) return;
    var titleLink = card.querySelector('.wd-entities-title a[href]');
    if (titleLink) {
      var href = titleLink.getAttribute('href');
      var resolved = resolveHref(href);
      if (resolved && resolved !== 'anchor' && resolved !== 'passthrough' && resolved !== 'external') {
        navigateParent(resolved);
      }
    }
  });

  // Listen for messages from parent
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'afrostore-get-info') {
      window.parent.postMessage({
        type: 'afrostore-store-info',
        storeName: storeName,
        storeSlug: storeSlug,
      }, '*');
    }
  });

  // Smooth scroll for anchor links
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    var target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close any open mobile menu
      var collapsed = document.getElementById('collapsed-items');
      if (collapsed) collapsed.style.display = 'none';
    }
  });

  // Fallback: data-afro-nav links — try to find a matching section by scanning headings
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[data-afro-nav]');
    if (!link) return;
    e.preventDefault();
    var navText = link.getAttribute('data-afro-nav');
    // Search all headings and section titles for a match
    var headings = document.querySelectorAll('h1, h2, h3, h4, section[class], div[class*="section"]');
    for (var i = 0; i < headings.length; i++) {
      var el = headings[i];
      var text = (el.textContent || '').trim().toLowerCase();
      if (text.indexOf(navText) !== -1 || navText.indexOf(text) !== -1) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  });

  // Notify parent that template is loaded
  window.parent.postMessage({ type: 'afrostore-template-loaded', storeSlug: storeSlug }, '*');
})();
</script>`;

  // Inject before </body>
  if (html.includes("</body>")) {
    html = html.replace("</body>", bridgeScript + "\n</body>");
  } else {
    html += bridgeScript;
  }

  return html;
}

/* ─── Customization Injection ─── */

function injectCustomizationLayers(
  html: string,
  customization: SiteCustomizationDocument | null,
  pageSettings: unknown
): string {
  const customCss = buildCustomizationCss(customization);
  const customizationBridge = buildCustomizationBridgeScript(customization);
  const pageCss = buildPageCustomizationCss(pageSettings);

  if (customCss) {
    const styleTag = `<style id="afro-site-customization-css">${customCss}</style>`;
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${styleTag}\n</head>`);
    } else if (html.includes("<body>")) {
      html = html.replace("<body>", `<body>\n${styleTag}`);
    } else {
      html = `${styleTag}\n${html}`;
    }
  }

  if (pageCss) {
    const styleTag = `<style id="afro-page-customization-css">${pageCss}</style>`;
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${styleTag}\n</head>`);
    } else if (html.includes("<body>")) {
      html = html.replace("<body>", `<body>\n${styleTag}`);
    } else {
      html = `${styleTag}\n${html}`;
    }
  }

  if (html.includes("</body>")) {
    html = html.replace("</body>", customizationBridge + "\n</body>");
  } else {
    html += customizationBridge;
  }

  return html;
}

function buildPageCustomizationCss(settings: unknown): string {
  if (!settings) return "";

  const record = settings as Record<string, unknown>;
  const backgroundImage = typeof record.backgroundImage === "string" ? record.backgroundImage : "";
  const backgroundColor = typeof record.backgroundColor === "string" ? record.backgroundColor : "";
  const backgroundSize = typeof record.backgroundSize === "string" ? record.backgroundSize : "cover";
  const backgroundPosition = typeof record.backgroundPosition === "string" ? record.backgroundPosition : "center center";
  const backgroundRepeat = typeof record.backgroundRepeat === "string" ? record.backgroundRepeat : "no-repeat";
  const backgroundAttachment = typeof record.backgroundAttachment === "string" ? record.backgroundAttachment : "scroll";
  const overlayColor = typeof record.overlayColor === "string" ? record.overlayColor : "#000000";
  const overlayOpacity = typeof record.overlayOpacity === "number" ? record.overlayOpacity : 0.25;

  const rules: string[] = [];
  if (backgroundColor) {
    rules.push(`body{background-color:${backgroundColor};}`);
  }
  if (backgroundImage) {
    const escapedUrl = backgroundImage.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    rules.push(`body{background-image:url("${escapedUrl}");background-size:${backgroundSize};background-position:${backgroundPosition};background-repeat:${backgroundRepeat};background-attachment:${backgroundAttachment};}`);
    rules.push(`body{position:relative;}`);
    rules.push(`body::before{content:'';position:fixed;inset:0;pointer-events:none;background:${overlayColor};opacity:${overlayOpacity};z-index:0;}`);
    rules.push(`body > *{position:relative;z-index:1;}`);
  }

  return rules.join("\n");
}

/* ─── Editor Script Injection ─── */

function injectEditorScript(html: string): string {
  const editorScript = `<script src="/js/template-editor.js"></script>
<script>
  // Auto-start editor when loaded in edit mode
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.parent.postMessage({ type: 'afro-editor-ready' }, '*');
    });
  }
</script>`;

  if (html.includes("</body>")) {
    html = html.replace("</body>", editorScript + "\n</body>");
  } else {
    html += editorScript;
  }

  return html;
}
