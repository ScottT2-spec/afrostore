/**
 * Phone-number normalization — the single place that decides what a
 * merchant's typed phone/WhatsApp number becomes.
 *
 * However someone types it ("0801 234 5678", "+234 (0)801-234-5678",
 * "2348012345678", "00234 801 234 5678", "801 234 5678"), the system only
 * ever stores ONE form: E.164 — "+" then country code then national
 * number, digits only, no spaces ("+2348012345678"). Everything downstream
 * derives from that: wa.me links use the digits, tel: links use the E.164,
 * pages show the formatted `display` string.
 *
 * Pure functions, no imports — safe to use in the browser (live form
 * hints) and on the server (the value that actually gets saved).
 */

interface Country {
  iso: string;
  /** Calling code, digits only, no "+". */
  cc: string;
  /** Allowed national-number length (digits after the country code, without the trunk "0"). */
  len: [number, number];
  /** Lower-case names/aliases the country can be recognised by in free text. */
  names: string[];
}

// Africa first (the platform's market), plus a few major others.
const COUNTRIES: Country[] = [
  { iso: "NG", cc: "234", len: [10, 10], names: ["nigeria"] },
  { iso: "GH", cc: "233", len: [9, 9], names: ["ghana"] },
  { iso: "KE", cc: "254", len: [9, 9], names: ["kenya"] },
  { iso: "ZA", cc: "27", len: [9, 9], names: ["south africa"] },
  { iso: "UG", cc: "256", len: [9, 9], names: ["uganda"] },
  { iso: "TZ", cc: "255", len: [9, 9], names: ["tanzania"] },
  { iso: "RW", cc: "250", len: [9, 9], names: ["rwanda"] },
  { iso: "ZM", cc: "260", len: [9, 9], names: ["zambia"] },
  { iso: "ZW", cc: "263", len: [9, 9], names: ["zimbabwe"] },
  { iso: "CM", cc: "237", len: [9, 9], names: ["cameroon"] },
  { iso: "SN", cc: "221", len: [9, 9], names: ["senegal"] },
  { iso: "CI", cc: "225", len: [10, 10], names: ["ivory coast", "cote d'ivoire", "côte d'ivoire", "cote divoire"] },
  { iso: "ET", cc: "251", len: [9, 9], names: ["ethiopia"] },
  { iso: "EG", cc: "20", len: [9, 10], names: ["egypt"] },
  { iso: "MA", cc: "212", len: [9, 9], names: ["morocco"] },
  { iso: "DZ", cc: "213", len: [9, 9], names: ["algeria"] },
  { iso: "TN", cc: "216", len: [8, 8], names: ["tunisia"] },
  { iso: "BW", cc: "267", len: [7, 8], names: ["botswana"] },
  { iso: "NA", cc: "264", len: [8, 9], names: ["namibia"] },
  { iso: "MW", cc: "265", len: [9, 9], names: ["malawi"] },
  { iso: "MZ", cc: "258", len: [9, 9], names: ["mozambique"] },
  { iso: "AO", cc: "244", len: [9, 9], names: ["angola"] },
  { iso: "BJ", cc: "229", len: [8, 10], names: ["benin"] },
  { iso: "TG", cc: "228", len: [8, 8], names: ["togo"] },
  { iso: "ML", cc: "223", len: [8, 8], names: ["mali"] },
  { iso: "BF", cc: "226", len: [8, 8], names: ["burkina faso"] },
  { iso: "NE", cc: "227", len: [8, 8], names: ["niger"] },
  { iso: "SL", cc: "232", len: [8, 8], names: ["sierra leone"] },
  { iso: "LR", cc: "231", len: [7, 9], names: ["liberia"] },
  { iso: "GM", cc: "220", len: [7, 7], names: ["gambia", "the gambia"] },
  { iso: "GN", cc: "224", len: [9, 9], names: ["guinea"] },
  { iso: "CD", cc: "243", len: [9, 9], names: ["dr congo", "democratic republic of the congo", "congo"] },
  { iso: "SD", cc: "249", len: [9, 9], names: ["sudan"] },
  { iso: "SO", cc: "252", len: [7, 9], names: ["somalia"] },
  { iso: "MU", cc: "230", len: [7, 8], names: ["mauritius"] },
  { iso: "GB", cc: "44", len: [10, 10], names: ["united kingdom", "great britain", "england", "uk"] },
  { iso: "US", cc: "1", len: [10, 10], names: ["united states", "usa", "america"] },
  { iso: "CA", cc: "1", len: [10, 10], names: ["canada"] },
  { iso: "IN", cc: "91", len: [10, 10], names: ["india"] },
  { iso: "AE", cc: "971", len: [8, 9], names: ["united arab emirates", "uae", "dubai"] },
];

/** The platform's home market — used when the site's country can't be worked out. */
export const DEFAULT_COUNTRY_ISO = "NG";

const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso, c]));
// Longest names first so "sierra leone"/"south africa" win over shorter substrings,
// and "nigeria" is tried before "niger".
const NAME_INDEX = COUNTRIES.flatMap((c) => c.names.map((n) => ({ n, c }))).sort((a, b) => b.n.length - a.n.length);

/**
 * Resolve a free-text country hint — "Nigeria", "NG", "Lagos, Nigeria",
 * "ghana" — to a country. Returns null when nothing matches.
 */
export function resolveCountry(hint?: string | null): Country | null {
  if (!hint) return null;
  const text = hint.trim().toLowerCase();
  if (!text) return null;
  const iso = BY_ISO.get(text.toUpperCase());
  if (iso) return iso;
  for (const { n, c } of NAME_INDEX) {
    const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(text)) return c;
  }
  return null;
}

export type NormalizedPhone =
  | {
      ok: true;
      /** Canonical stored form, e.g. "+2348012345678". */
      e164: string;
      /** Digits only, no "+", e.g. "2348012345678" — what wa.me links want. */
      digits: string;
      /** Human-readable, e.g. "+234 801 234 5678". */
      display: string;
      /** ISO code when the country was recognised, else null. */
      iso: string | null;
    }
  | { ok: false; reason: string };

const inRange = (n: number, [min, max]: [number, number]) => n >= min && n <= max;

function format(cc: string, national: string): string {
  const groups: string[] = [];
  let rest = national;
  if (rest.length === 10) { groups.push(rest.slice(0, 3), rest.slice(3, 6), rest.slice(6)); rest = ""; }
  else if (rest.length === 9) { groups.push(rest.slice(0, 3), rest.slice(3, 6), rest.slice(6)); rest = ""; }
  else if (rest.length === 8) { groups.push(rest.slice(0, 4), rest.slice(4)); rest = ""; }
  while (rest.length) { groups.push(rest.slice(0, 3)); rest = rest.slice(3); }
  return `+${cc} ${groups.join(" ")}`;
}

function build(country: Country | null, cc: string, national: string): NormalizedPhone {
  const digits = cc + national;
  return { ok: true, e164: `+${digits}`, digits, display: country ? format(cc, national) : `+${digits}`, iso: country?.iso ?? null };
}

function fromInternational(digits: string): NormalizedPhone {
  // Match the longest calling code that fits (3, 2, then 1 digits).
  for (const len of [3, 2, 1]) {
    const cc = digits.slice(0, len);
    const candidates = COUNTRIES.filter((c) => c.cc === cc);
    if (candidates.length === 0) continue;
    let national = digits.slice(cc.length);
    const country = candidates[0];
    // "+234 (0)801…" / "+2340801…" — a trunk 0 typed after the country code.
    if (national.startsWith("0") && !inRange(national.length, country.len)) national = national.slice(1);
    if (!inRange(national.length, country.len)) {
      return { ok: false, reason: `That doesn't look like a valid ${country.iso} number — check the digits.` };
    }
    return build(country, cc, national);
  }
  // Country not in our table — accept any plausible E.164 length rather than reject a real number.
  if (digits.length >= 8 && digits.length <= 15) return build(null, "", digits);
  return { ok: false, reason: "That number has too few or too many digits." };
}

/**
 * Normalize whatever the merchant typed into the canonical form.
 * @param raw     the typed value, any format
 * @param country hint for numbers typed without a country code — the site's
 *                country, or free text like "Lagos, Nigeria". Falls back to
 *                Nigeria (the platform's home market) when unrecognised.
 */
export function normalizePhone(raw: unknown, country?: string | null): NormalizedPhone {
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, reason: "Enter a phone number." };

  const text = raw.trim();
  let digits = text.replace(/\D/g, "");
  if (digits.length < 7) return { ok: false, reason: "That number has too few digits." };

  const explicitPlus = /^[\s(]*\+/.test(text);
  let international = explicitPlus;
  if (!international && digits.startsWith("00")) { digits = digits.slice(2); international = true; }
  if (international) return fromInternational(digits);

  const home = resolveCountry(country) ?? BY_ISO.get(DEFAULT_COUNTRY_ISO)!;

  // 08012345678 — local format with the trunk 0.
  if (digits.startsWith("0") && inRange(digits.length - 1, home.len)) return build(home, home.cc, digits.slice(1));

  // 8012345678 — national number typed without the 0.
  if (inRange(digits.length, home.len)) return build(home, home.cc, digits);

  // 2348012345678 — country code typed without the "+".
  if (digits.startsWith(home.cc)) {
    let national = digits.slice(home.cc.length);
    if (national.startsWith("0") && !inRange(national.length, home.len)) national = national.slice(1);
    if (inRange(national.length, home.len)) return build(home, home.cc, national);
  }

  // A different country's number typed without "+" (e.g. 447911123456).
  if (digits.length >= 10) {
    const guess = fromInternational(digits);
    if (guess.ok) return guess;
  }

  return { ok: false, reason: `That doesn't look like a valid ${home.iso} phone number — check the digits.` };
}

/** Canonical E.164 string, or null when the input can't be resolved. */
export function toE164(raw: unknown, country?: string | null): string | null {
  const r = normalizePhone(raw, country);
  return r.ok ? r.e164 : null;
}

/** Digits-only form for wa.me links. Accepts anything, returns "" when invalid. */
export function whatsappDigits(raw: unknown, country?: string | null): string {
  const r = normalizePhone(raw, country);
  return r.ok ? r.digits : "";
}
