import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getTemplateSiteType, templateMatchesSiteType } from "@/lib/templates/site-type";
import { INTERNAL_TEMPLATES } from "@/lib/templates/catalog";

describe("template site type helper", () => {
  it("classifies templates from manifest categories", () => {
    assert.equal(getTemplateSiteType({ category: "Restaurant", slug: "restaurant-pro" }), "ECOMMERCE");
    assert.equal(getTemplateSiteType({ category: "Landing Page", slug: "landing-saas-minimal" }), "LANDING_PAGE");
    assert.equal(getTemplateSiteType({ category: "Business", slug: "clarity" }), "WEBSITE");
  });

  it("matches templates to the requested site type", () => {
    assert.equal(templateMatchesSiteType({ category: "Fashion", slug: "fashion-luxe" }, "ECOMMERCE"), true);
    assert.equal(templateMatchesSiteType({ category: "Business", slug: "clarity" }, "ECOMMERCE"), false);
    assert.equal(templateMatchesSiteType({ category: "Landing Page", slug: "landing-dev-portfolio" }, "LANDING_PAGE"), true);
  });

  it("derives manifest site types for internal templates", () => {
    const restaurant = INTERNAL_TEMPLATES.find((template) => template.slug === "restaurant-pro");
    const landing = INTERNAL_TEMPLATES.find((template) => template.slug === "landing-saas-minimal");
    const business = INTERNAL_TEMPLATES.find((template) => template.slug === "clarity");

    assert.equal(restaurant?.manifest?.siteType, "ECOMMERCE");
    assert.equal(landing?.manifest?.siteType, "LANDING_PAGE");
    assert.equal(business?.manifest?.siteType, "WEBSITE");
  });
});
