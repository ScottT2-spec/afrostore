/**
 * Sanitize user-authored HTML (blog posts, etc.) before it's stored or
 * rendered with dangerouslySetInnerHTML. Strips <script>/<style>/<iframe>
 * and other dangerous tags, inline event handlers (onclick, onerror, ...),
 * javascript:/data: URIs, and other common XSS vectors while keeping
 * normal formatting markup (headings, links, images, lists, tables, etc.)
 * intact.
 *
 * Deliberately dependency-free (regex-based) rather than a DOM-parser
 * library (e.g. isomorphic-dompurify/jsdom) - those are known to be
 * fragile to bundle in serverless environments, and a route that fails
 * to import at module load time returns an HTML error page instead of
 * JSON, breaking every client that expects a JSON response.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "small",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span",
]);

const ALLOWED_ATTR = new Set(["href", "src", "alt", "title", "target", "rel", "class", "width", "height"]);

const DANGEROUS_TAGS = ["script", "style", "iframe", "object", "embed", "form", "input", "textarea", "button", "select", "link", "meta", "base", "svg", "math"];

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html;

  // Strip dangerous tags and everything inside them
  for (const tag of DANGEROUS_TAGS) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"), "");
    out = out.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "");
  }

  // Strip HTML comments (can hide payloads in some parsers)
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  // Walk every remaining tag and rebuild it with only allowed tags/attrs
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    const isClosing = match.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (isClosing) return `</${tag}>`;

    const selfClosing = /\/\s*$/.test(rawAttrs);
    const attrs = [];
    const attrRegex = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(rawAttrs))) {
      const name = attrMatch[1].toLowerCase();
      const value = (attrMatch[3] ?? attrMatch[4] ?? attrMatch[2] ?? "").trim();
      if (!ALLOWED_ATTR.has(name)) continue;
      if ((name === "href" || name === "src") && /^\s*(javascript|vbscript|data):/i.test(value)) continue;
      attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }

    return `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}${selfClosing ? " /" : ""}>`;
  });

  out = out.replace(/\son[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=\"#\"");

  return out.trim();
}
