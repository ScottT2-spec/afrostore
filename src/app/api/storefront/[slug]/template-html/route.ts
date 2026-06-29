import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { getTemplateHtmlPath, hasTemplateHtml } from "@/lib/templates/template-html-map";

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
      include: {
        template: { select: { id: true, name: true, slug: true } },
      },
    });

    const templateSlug = activeTemplate?.template?.slug;
    if (!templateSlug || !hasTemplateHtml(templateSlug)) {
      return NextResponse.json({ error: "No HTML template available" }, { status: 404 });
    }

    // 3. Read the template HTML
    const htmlRelPath = getTemplateHtmlPath(templateSlug);
    if (!htmlRelPath) {
      return NextResponse.json({ error: "Template HTML path not found" }, { status: 404 });
    }

    const htmlAbsPath = path.join(process.cwd(), "public", htmlRelPath);
    let html: string;
    try {
      html = await readFile(htmlAbsPath, "utf-8");
    } catch {
      return NextResponse.json({ error: "Template HTML file not found" }, { status: 404 });
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

    // 5. Perform data substitution
    html = substituteStoreData(html, {
      storeName: site.name,
      storeDescription: site.description || "",
      storeLogo: site.logo || "",
      currency,
      currencySymbol,
      whatsappNumber,
      storeSlug: slug,
      products: products.map((p) => ({
        name: p.name,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        imageUrl: p.images[0]?.url || null,
        imageAlt: p.images[0]?.alt || p.name,
        category: p.category?.name || "",
        inStock: p.stock > 0,
        slug: p.slug,
      })),
      categories: categories.map((c) => c.name),
    });

    // 6. Inject navigation overlay + cart bridge script
    html = injectStorefrontBridge(html, slug, site.name, currency, currencySymbol);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
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

interface SubstitutionData {
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  currency: string;
  currencySymbol: string;
  whatsappNumber: string;
  storeSlug: string;
  products: StoreProduct[];
  categories: string[];
}

/* ─── Substitution Engine ─── */

function substituteStoreData(html: string, data: SubstitutionData): string {
  // Replace store/brand name in common patterns
  // WoodMart templates often have the brand name in titles, headers, footer
  html = replaceStoreName(html, data.storeName);

  // Replace currency symbols (WoodMart uses &#36; for $)
  html = replaceCurrency(html, data.currencySymbol);

  // Replace product data (names, prices, images)
  html = replaceProducts(html, data.products, data.currencySymbol);

  // Replace contact info
  if (data.whatsappNumber) {
    html = replaceContactInfo(html, data.whatsappNumber);
  }

  // Fix internal links to point to our store
  html = rewriteLinks(html, data.storeSlug);

  return html;
}

function replaceStoreName(html: string, storeName: string): string {
  // Common brand name patterns in WoodMart templates
  const brandPatterns = [
    /WoodMart/gi,
    /Flavor\s*Store/gi,
    /Fashion\s*Store/gi,
    /FLAVOR/g,
  ];

  // Replace the page <title>
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${storeName}</title>`);

  // Replace common header brand text patterns
  // Look for text inside logo/brand areas
  html = html.replace(
    /(<(?:span|a|div|h\d)[^>]*class="[^"]*(?:site-title|brand-name|logo-text|wd-logo-text)[^"]*"[^>]*>)([^<]+)(<\/)/gi,
    `$1${storeName}$3`
  );

  // Replace copyright text
  html = html.replace(
    /(©\s*\d{4}\s*)([^<.]+)/gi,
    `$1${storeName}`
  );

  return html;
}

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
  products: StoreProduct[],
  currencySymbol: string
): string {
  if (products.length === 0) return html;

  let productIndex = 0;

  // Replace product titles in wd-entities-title blocks
  html = html.replace(
    /(<[^>]*class="wd-entities-title"[^>]*>)\s*<a[^>]*>([^<]+)<\/a>/g,
    (match, prefix, _oldName) => {
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
    (match, prefix, suffix) => {
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
      (match, before, _oldSrc, after, _oldAlt) => {
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
  // Replace phone numbers in common patterns
  html = html.replace(
    /(\+?\d[\d\s\-().]{7,})/g,
    (match) => {
      // Only replace if it looks like a phone number (not a product ID or price)
      if (match.replace(/\D/g, "").length >= 8) {
        return phone;
      }
      return match;
    }
  );

  return html;
}

function rewriteLinks(html: string, storeSlug: string): string {
  // Rewrite WoodMart demo links to point to our store
  html = html.replace(
    /href="https?:\/\/woodmart\.xtemos\.com[^"]*"/g,
    `href="/store/${storeSlug}/shop"`
  );

  // Rewrite any remaining external shop links
  html = html.replace(
    /href="https?:\/\/[^"]*\/shop[^"]*"/g,
    `href="/store/${storeSlug}/shop"`
  );

  return html;
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
  currencySymbol: string
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

  // Intercept all link clicks — navigate parent frame instead
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:')) return;
    
    e.preventDefault();
    
    // If it's a store link, navigate parent
    if (href.startsWith('/store/')) {
      window.parent.location.href = href;
    } else if (href.startsWith('/')) {
      window.parent.location.href = href;
    }
    // External links — open in new tab
    else if (href.startsWith('http')) {
      window.open(href, '_blank');
    }
  });

  // Intercept add-to-cart buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.wd-add-btn, .add_to_cart_button, [class*="add-to-cart"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Find the product card this button belongs to
    var productCard = btn.closest('.wd-product, .product');
    if (!productCard) return;
    
    var titleEl = productCard.querySelector('.wd-entities-title a, .woocommerce-loop-product__title');
    var priceEl = productCard.querySelector('.woocommerce-Price-amount bdi');
    
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
    btn.style.opacity = '0.5';
    setTimeout(function() { btn.style.opacity = '1'; }, 500);
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
