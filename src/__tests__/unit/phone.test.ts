import { describe, it, expect } from "vitest";
import { normalizePhone, toE164, resolveCountry, whatsappDigits } from "@/lib/phone";

describe("normalizePhone — every way of typing the same Nigerian number resolves to one form", () => {
  const same = [
    "08012345678", "0801 234 5678", "0801-234-5678", "(0801) 234 5678", "0801.234.5678",
    "8012345678", "801 234 5678",
    "+2348012345678", "+234 801 234 5678", "+234 (0)801 234 5678", "+234 0801 234 5678", "+234-801-234-5678",
    "2348012345678", "234 801 234 5678", "2340801 234 5678",
    "002348012345678", "00234 801 234 5678", "  +234 801 234 5678  ", "Call 0801 234 5678",
  ];
  for (const input of same) {
    it(JSON.stringify(input), () => {
      expect(toE164(input, "Nigeria")).toBe("+2348012345678");
    });
  }
  it("defaults to Nigeria when no country is known", () => {
    expect(toE164("0801 234 5678")).toBe("+2348012345678");
    expect(toE164("0801 234 5678", "Somewhere Unknown")).toBe("+2348012345678");
  });
});

describe("other countries", () => {
  it("uses the site's country for local numbers", () => {
    expect(toE164("024 123 4567", "Ghana")).toBe("+233241234567");
    expect(toE164("0712 345 678", "Nairobi, Kenya")).toBe("+254712345678");
    expect(toE164("082 123 4567", "ZA")).toBe("+27821234567");
  });
  it("respects an explicit foreign +code regardless of site country", () => {
    expect(toE164("+254 712 345 678", "Nigeria")).toBe("+254712345678");
    expect(toE164("+44 7911 123456", "Nigeria")).toBe("+447911123456");
  });
  it("recognises a foreign number typed without the +", () => {
    expect(toE164("447911123456", "Nigeria")).toBe("+447911123456");
  });
});

describe("output shape", () => {
  it("returns digits for wa.me and a readable display string", () => {
    const r = normalizePhone("0801 234 5678", "Nigeria");
    expect(r).toMatchObject({ ok: true, e164: "+2348012345678", digits: "2348012345678", display: "+234 801 234 5678", iso: "NG" });
    expect(whatsappDigits("0801 234 5678")).toBe("2348012345678");
  });
});

describe("rejects what can't be a phone number", () => {
  for (const bad of ["", "   ", "abc", "12345", "080123", "+234 801 234", "0801 234 5678 999999", null, undefined, 42]) {
    it(JSON.stringify(bad) ?? String(bad), () => {
      expect(normalizePhone(bad as any, "Nigeria").ok).toBe(false);
    });
  }
});

describe("resolveCountry", () => {
  it("matches names, ISO codes and city-plus-country text", () => {
    expect(resolveCountry("Lagos, Nigeria")?.iso).toBe("NG");
    expect(resolveCountry("NG")?.iso).toBe("NG");
    expect(resolveCountry("south africa")?.iso).toBe("ZA");
    expect(resolveCountry("Sierra Leone")?.iso).toBe("SL");
  });
  it("doesn't confuse Niger with Nigeria", () => {
    expect(resolveCountry("Nigeria")?.iso).toBe("NG");
    expect(resolveCountry("Niger")?.iso).toBe("NE");
  });
  it("returns null for nothing recognisable", () => {
    expect(resolveCountry("Lagos")).toBeNull();
    expect(resolveCountry("")).toBeNull();
  });
});
