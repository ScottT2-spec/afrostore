/**
 * E2E Tests — Media, Pages, and Internal Template Links
 *
 * Covers:
 * - File uploads for the media library
 * - Page background settings persistence
 * - Reserved CRM page linking
 * - Page-content helper edge cases
 */

import {
  describe,
  it,
  beforeAll,
  GET,
  POST,
  createTestUser,
  createTestStore,
  expectSuccess,
  type TestUser,
  type TestStore,
} from "./setup";
import {
  getLinkedPageHref,
  getLinkedPageTemplate,
  parsePageContent,
  serializePageContent,
} from "@/lib/page-content";

export function mediaPagesTests() {
  describe("Page content helpers", () => {
    it("normalizes array content into blocks", async () => {
      const parsed = parsePageContent([{ id: "1", type: "text", props: { text: "Hello" } }]);
      if (parsed.blocks.length !== 1) throw new Error("Expected one block");
      if (parsed.settings.backgroundImage) throw new Error("Unexpected background settings");
    });

    it("preserves settings when content is object-shaped", async () => {
      const parsed = parsePageContent({
        blocks: [{ id: "1", type: "hero", props: { heading: "Hi" } }],
        settings: {
          backgroundImage: "/uploads/test.png",
          backgroundColor: "#ffffff",
          overlayOpacity: 0.3,
        },
      });

      if (parsed.blocks.length !== 1) throw new Error("Expected one block");
      if (parsed.settings.backgroundImage !== "/uploads/test.png") throw new Error("Missing background image");
      if (parsed.settings.overlayOpacity !== 0.3) throw new Error("Missing overlay opacity");
    });

    it("returns empty output for invalid content", async () => {
      const parsed = parsePageContent(null);
      if (parsed.blocks.length !== 0) throw new Error("Expected empty blocks");
    });

    it("serializes page content for persistence", async () => {
      const document = serializePageContent({
        blocks: [{ id: "1", type: "text", props: { text: "Serialized" } }],
        settings: { backgroundColor: "#fafafa" },
      });

      const settings = document.settings as Record<string, unknown>;
      if (!Array.isArray(document.blocks)) throw new Error("Blocks should be an array");
      if (settings.backgroundColor !== "#fafafa") throw new Error("Background color not serialized");
    });

    it("maps Blogs to CRM blogs template", async () => {
      if (getLinkedPageTemplate({ slug: "blogs", title: "Blogs" }) !== "crm:blogs") {
        throw new Error("Blogs page should map to crm:blogs");
      }
    });

    it("routes Blogs links internally", async () => {
      const href = getLinkedPageHref({ slug: "blogs", template: "crm:blogs" }, "demo-store");
      if (href !== "/store/demo-store/blogs") throw new Error("Blogs href should resolve to internal blogs page");
    });
  });

  describe("Media uploads", () => {
    it("uploads an image file", async () => {
      const file = new File([new Uint8Array([137, 80, 78, 71])], "cover.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${await res.text()}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error("Expected upload success");
      const uploadedUrl = json.data?.files?.[0]?.url as string | undefined;
      if (!uploadedUrl) throw new Error("Missing uploaded file URL");
      if (!(uploadedUrl.startsWith("http") || uploadedUrl.startsWith("/uploads/"))) {
        throw new Error("Unexpected upload URL format");
      }
    });

    it("rejects unsupported file types", async () => {
      const file = new File([new Uint8Array([0, 1, 2])], "malware.exe", { type: "application/x-msdownload" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.status !== 400) {
        throw new Error(`Expected 400 for unsupported upload, got ${res.status}`);
      }
    });
  });

  describe("Pages with backgrounds and CRM links", () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: `Media Page Test ${Date.now()}` });
    });

    it("persists page background settings", async () => {
      const createRes = await POST(`/api/sites/${store.id}/pages`, {
        title: "Background Page",
        type: "CUSTOM",
        template: null,
        content: {
          blocks: [{ id: "b1", type: "text", props: { text: "Background content" } }],
          settings: {
            backgroundImage: "/uploads/background.png",
            backgroundColor: "#ffffff",
            backgroundPosition: "center top",
            overlayOpacity: 0.4,
          },
        },
        isPublished: true,
      }, user.token);

      expectSuccess(createRes, 201);
      const page = createRes.body.data as { id: string; slug: string };

      const getRes = await GET(`/api/sites/${store.id}/pages/${page.id}`, user.token);
      expectSuccess(getRes);
      const pageData = getRes.body.data as { content: unknown };
      const parsed = parsePageContent(pageData.content);
      if (parsed.settings.backgroundImage !== "/uploads/background.png") {
        throw new Error("Background image did not persist");
      }
    });

    it("links Blogs to the CRM blogs module", async () => {
      const createRes = await POST(`/api/sites/${store.id}/pages`, {
        title: "Blogs",
        type: "CUSTOM",
        content: { blocks: [] },
        isPublished: false,
      }, user.token);

      expectSuccess(createRes, 201);
      const page = createRes.body.data as { id: string; template?: string | null };
      if (page.template !== "crm:blogs") {
        throw new Error(`Expected crm:blogs template, got ${page.template}`);
      }

      const listRes = await GET(`/api/sites/${store.id}/pages`, user.token);
      expectSuccess(listRes);
      const pages = (listRes.body.data as { pages: Array<{ title: string; template?: string | null }> }).pages;
      const linked = pages.find((item) => item.title === "Blogs");
      if (!linked || linked.template !== "crm:blogs") {
        throw new Error("Blogs page is not linked to the CRM module");
      }
    });

    it("returns published pages with internal template metadata", async () => {
      const pagesRes = await GET(`/api/sites/${store.id}/pages`, user.token);
      expectSuccess(pagesRes);
      const pages = (pagesRes.body.data as { pages: Array<{ title: string; template?: string | null }> }).pages;
      const blogsPage = pages.find((item) => item.title === "Blogs");
      if (!blogsPage) throw new Error("Blogs page missing");
      if (blogsPage.template !== "crm:blogs") throw new Error("Blogs page template missing");
    });
  });
}
