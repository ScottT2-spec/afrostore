/**
 * E2E Tests — Lead Funnel Fixes
 *
 * Covers the two functional gaps closed after the payments audit:
 *  1. Generic storefront contact-form submissions now also create/update a
 *     CRM contact (previously they only wrote to a disconnected
 *     ContactMessage inbox, so landing pages built from the default
 *     templates or AI generation silently dropped leads outside the CRM).
 *  2. Funnel step creation from the dashboard can now link a LEAD_FORM step
 *     to a real Form and a LANDING step to a real Page (the backend always
 *     supported this; the UI/API contract test below exercises exactly what
 *     the dashboard now sends).
 */

import { prisma } from "@/lib/db";
import {
  describe, it, beforeAll,
  POST, GET,
  createTestUser, createTestStore,
  expectSuccess, expectError,
  type TestUser, type TestStore,
} from "./setup";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function rawPost(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
}

export function leadFunnelTests() {
  describe("Contact form -> CRM", () => {
    let store: TestStore;

    beforeAll(async () => {
      const user = await createTestUser();
      store = await createTestStore(user.token, { name: `Contact CRM Test ${Date.now()}` });
      // Contact route requires the site to be resolvable by slug and ACTIVE
      await prisma.site.update({ where: { id: store.id }, data: { status: "ACTIVE" } });
    });

    it("creates a CRM contact from a contact-form submission, tagged and sourced correctly", async () => {
      const email = `lead-${Date.now()}@example.com`;
      const res = await rawPost(`/api/storefront/${store.slug}/contact`, {
        name: "Ada Obi",
        email,
        subject: "Pricing question",
        message: "How much does the pro plan cost?",
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);

      const contact = await prisma.crmContact.findUnique({
        where: { siteId_email: { siteId: store.id, email } },
      });
      if (!contact) throw new Error("Contact form submission should have created a CrmContact");
      if (contact.source !== "contact_form") throw new Error(`Expected source contact_form, got ${contact.source}`);
      if (!contact.tags.includes("contact-form")) throw new Error("Expected contact-form tag on the created contact");
      if (contact.firstName !== "Ada") throw new Error(`Expected firstName 'Ada', got ${contact.firstName}`);
      if (contact.lastName !== "Obi") throw new Error(`Expected lastName 'Obi', got ${contact.lastName}`);

      const activity = await prisma.crmActivity.findFirst({
        where: { contactId: contact.id, type: "contact_form_submitted" },
      });
      if (!activity) throw new Error("Expected a contact_form_submitted CrmActivity entry");

      // The original ContactMessage inbox behavior must still work unchanged
      const message = await prisma.contactMessage.findFirst({ where: { siteId: store.id, email } });
      if (!message) throw new Error("Contact message should still be saved to the inbox as before");
    });

    it("still succeeds even if the same email submits twice (upsert, not duplicate-create failure)", async () => {
      const email = `repeat-lead-${Date.now()}@example.com`;
      const first = await rawPost(`/api/storefront/${store.slug}/contact`, {
        name: "Chidi Okafor", email, message: "First message",
      });
      const second = await rawPost(`/api/storefront/${store.slug}/contact`, {
        name: "Chidi Okafor", email, message: "Second message",
      });
      if (first.status !== 200 || second.status !== 200) {
        throw new Error("Both submissions from the same email should succeed");
      }
      const contacts = await prisma.crmContact.count({ where: { siteId: store.id, email } });
      if (contacts !== 1) throw new Error(`Expected exactly 1 CRM contact for repeat submissions, got ${contacts}`);
    });
  });

  describe("Funnel steps — linking to a real Form/Page", () => {
    let user: TestUser;
    let store: TestStore;
    let funnelId: string;
    let formId: string;
    let pageId: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: `Funnel Link Test ${Date.now()}` });

      const funnelRes = await POST(`/api/sites/${store.id}/funnels`, { name: "Test Funnel" }, user.token);
      expectSuccess(funnelRes, 201);
      funnelId = (funnelRes.body.data as any).id;

      const formRes = await POST(`/api/sites/${store.id}/forms`, {
        name: "Ebook Signup",
        fields: [{ id: "email", label: "Email", type: "email", required: true }],
      }, user.token);
      expectSuccess(formRes, 201);
      formId = (formRes.body.data as any).id;

      const pageRes = await POST(`/api/sites/${store.id}/pages`, {
        title: "Ebook Landing",
        slug: `ebook-landing-${Date.now()}`,
      }, user.token);
      expectSuccess(pageRes, 201);
      pageId = (pageRes.body.data as any).id;
    });

    it("creates a LEAD_FORM step linked to a real form", async () => {
      const res = await POST(`/api/sites/${store.id}/funnels/${funnelId}/steps`, {
        name: "Get the Ebook",
        type: "LEAD_FORM",
        formId,
      }, user.token);
      expectSuccess(res, 201);
      const step = res.body.data as any;
      if (step.formId !== formId) throw new Error("Step should be linked to the form we just created");
    });

    it("creates a LANDING step linked to a real page", async () => {
      const res = await POST(`/api/sites/${store.id}/funnels/${funnelId}/steps`, {
        name: "Landing",
        type: "LANDING",
        pageId,
      }, user.token);
      expectSuccess(res, 201);
      const step = res.body.data as any;
      if (step.pageId !== pageId) throw new Error("Step should be linked to the page we just created");
    });

    it("rejects a formId that doesn't belong to this site", async () => {
      const otherUser = await createTestUser();
      const otherStore = await createTestStore(otherUser.token, { name: `Other Store ${Date.now()}` });
      const otherFormRes = await POST(`/api/sites/${otherStore.id}/forms`, {
        name: "Someone else's form",
        fields: [{ id: "email", label: "Email", type: "email", required: true }],
      }, otherUser.token);
      const otherFormId = (otherFormRes.body.data as any).id;

      const res = await POST(`/api/sites/${store.id}/funnels/${funnelId}/steps`, {
        name: "Should fail",
        type: "LEAD_FORM",
        formId: otherFormId,
      }, user.token);
      expectError(res, 422);
    });

    it("lets a step be created without a form/page link (deferred linking is allowed)", async () => {
      const res = await POST(`/api/sites/${store.id}/funnels/${funnelId}/steps`, {
        name: "Thank You",
        type: "THANK_YOU",
      }, user.token);
      expectSuccess(res, 201);
    });
  });
}
