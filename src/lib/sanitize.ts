import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize user-authored HTML (blog posts, etc.) before it's stored or
 * rendered with dangerouslySetInnerHTML. Strips <script> tags, inline
 * event handlers (onclick, onerror, ...), javascript: URIs, and other
 * XSS vectors while keeping normal formatting markup (headings, links,
 * images, lists, tables, etc.) intact.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "small",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "width", "height"],
    ALLOW_DATA_ATTR: false,
  });
}
