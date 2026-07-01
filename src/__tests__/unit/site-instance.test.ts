import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { findStoredTemplatePage, mergeStoredTemplatePages, normalizeStoredTemplatePages } from "@/lib/templates/site-instance";

describe("site instance registry", () => {
  it("normalizes stored template pages with stable slugs", () => {
    const pages = normalizeStoredTemplatePages([
      { title: "Home", type: "HOME", content: [{ id: "a", type: "hero", props: {} }] },
      { title: "About Us", type: "ABOUT", content: [] },
    ]);

    assert.equal(pages.length, 2);
    assert.equal(pages[0].slug, "home");
    assert.equal(pages[1].slug, "about-us");
    assert.equal(pages[0].id, "home");
  });

  it("finds pages from the stored registry when the database row is missing", () => {
    const page = findStoredTemplatePage(
      [
        { title: "Contact", slug: "contact", type: "CONTACT", content: [], metaTitle: "Contact" },
      ],
      "contact",
    );

    assert.ok(page);
    assert.equal(page?.title, "Contact");
    assert.equal(page?.type, "CONTACT");
  });

  it("falls back to the stored registry when no database pages exist", () => {
    const pages = mergeStoredTemplatePages<{ slug: string }>([], [
      { title: "Home", slug: "home", type: "HOME", content: [] },
    ]);

    assert.equal(pages.length, 1);
    assert.equal(pages[0].slug, "home");
  });

  it("prefers stored template content when database pages are blank", () => {
    const merged = mergeStoredTemplatePages(
      [
        {
          id: "db-home",
          title: "Home",
          slug: "home",
          type: "HOME",
          content: [],
        },
      ],
      [
        {
          id: "template-home",
          title: "Home",
          slug: "home",
          type: "HOME",
          content: [{ id: "hero-1", type: "hero", props: { heading: "Template Hero" } }],
        },
      ],
    );

    assert.equal(merged.length, 1);
    assert.deepEqual(merged[0].content, [{ id: "hero-1", type: "hero", props: { heading: "Template Hero" } }]);
  });

  it("keeps database content when a page already has real content", () => {
    const merged = mergeStoredTemplatePages(
      [
        {
          id: "db-home",
          title: "Home",
          slug: "home",
          type: "HOME",
          content: [{ id: "hero-1", type: "hero", props: { heading: "Live Content" } }],
        },
      ],
      [
        {
          id: "template-home",
          title: "Home",
          slug: "home",
          type: "HOME",
          content: [{ id: "hero-1", type: "hero", props: { heading: "Template Hero" } }],
        },
      ],
    );

    assert.equal(merged.length, 1);
    assert.deepEqual(merged[0].content, [{ id: "hero-1", type: "hero", props: { heading: "Live Content" } }]);
  });
});
