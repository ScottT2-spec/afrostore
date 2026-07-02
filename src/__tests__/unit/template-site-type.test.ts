import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getTemplateSiteType, templateMatchesSiteType } from "@/lib/templates/site-type";
import { getInternalTemplateBySlug } from "@/lib/templates/catalog";

describe("template site type helper", () => {
  it("classifies package categories", () => {
    assert.equal(getTemplateSiteType({ category: "Ecommerce", slug: "fashion" }), "ECOMMERCE");
    assert.equal(getTemplateSiteType({ category: "Landing Page", slug: "landing-saas-minimal" }), "LANDING_PAGE");
    assert.equal(getTemplateSiteType({ category: "Business Website", slug: "clarity" }), "WEBSITE");
  });

  it("matches templates to the requested site type", () => {
    assert.equal(templateMatchesSiteType({ category: "Ecommerce", slug: "fashion" }, "ECOMMERCE"), true);
    assert.equal(templateMatchesSiteType({ category: "Business Website", slug: "clarity" }, "ECOMMERCE"), false);
    assert.equal(templateMatchesSiteType({ category: "Landing Page", slug: "landing-dev-portfolio" }, "LANDING_PAGE"), true);
  });

  it("exposes package manifests for internal templates", () => {
    const fashion = getInternalTemplateBySlug("fashion");
    const landing = getInternalTemplateBySlug("landing-saas-minimal");
    const business = getInternalTemplateBySlug("clarity");

    assert.equal(fashion?.manifest?.siteType, "ECOMMERCE");
    assert.equal(landing?.manifest?.siteType, "LANDING_PAGE");
    assert.equal(business?.manifest?.siteType, "WEBSITE");
  });
});

