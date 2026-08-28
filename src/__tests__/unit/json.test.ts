import { describe, expect, it } from "vitest";
import { asRecord } from "../../lib/json.js";

describe("asRecord", () => {
  it("returns an empty object for nullish and non-objects", () => {
    expect(asRecord(null)).toEqual({});
    expect(asRecord(undefined)).toEqual({});
    expect(asRecord("test")).toEqual({});
    expect(asRecord([1, 2, 3])).toEqual({});
  });

  it("preserves plain objects", () => {
    const input = { layout: "storefront", enabled: true };
    expect(asRecord(input)).toEqual(input);
  });
});
