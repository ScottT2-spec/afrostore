import { describe, it, expect } from "vitest";
import { createDeliveryZoneSchema, updateDeliveryZoneSchema } from "@/lib/validators";

describe("delivery zone schemas — only the name is required", () => {
  it("accepts a name alone", () => {
    const r = createDeliveryZoneSchema.safeParse({ name: "Lagos" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ name: "Lagos", areas: [], fee: 0 });
  });
  it("accepts empty areas and blank fee", () => {
    const r = createDeliveryZoneSchema.safeParse({ name: "Lagos", areas: [], fee: "", freeAbove: null, estimatedDays: "" });
    expect(r.success).toBe(true);
    if (r.success) { expect(r.data.fee).toBe(0); expect(r.data.estimatedDays).toBeNull(); }
  });
  it("treats free-above 0 / NaN / blank as not set", () => {
    for (const v of [0, NaN, "", null, -5]) {
      const r = createDeliveryZoneSchema.safeParse({ name: "A", freeAbove: v });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.freeAbove ?? null).toBeNull();
    }
  });
  it("keeps real values", () => {
    const r = createDeliveryZoneSchema.safeParse({ name: "A", areas: [" Ikeja ", "", "Yaba"], fee: 1500, freeAbove: 50000, estimatedDays: " 1-2 days " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ areas: ["Ikeja", "Yaba"], fee: 1500, freeAbove: 50000, estimatedDays: "1-2 days" });
  });
  it("still requires a name", () => {
    expect(createDeliveryZoneSchema.safeParse({ name: "  " }).success).toBe(false);
  });
  it("rejects a negative fee", () => {
    expect(createDeliveryZoneSchema.safeParse({ name: "A", fee: -1 }).success).toBe(false);
  });
  it("update: partial edits work, empty areas allowed, only sent keys change", () => {
    const r = updateDeliveryZoneSchema.safeParse({ areas: [], isActive: false });
    expect(r.success).toBe(true);
    if (r.success) { expect(r.data.areas).toEqual([]); expect(r.data.isActive).toBe(false); expect("fee" in r.data && r.data.fee !== undefined).toBe(false); }
  });
});
