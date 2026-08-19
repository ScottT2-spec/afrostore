import crypto from "crypto";

// Field-level encryption for sensitive profile data (bank account numbers,
// tax IDs, government ID numbers) so a database dump/backup leak doesn't
// expose them in plaintext. Uses AES-256-GCM (authenticated — tampering
// with ciphertext is detected, not just silently decrypted wrong).
//
// Requires PROFILE_ENCRYPTION_KEY: a 64-character hex string (32 bytes).
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// This must be set in the deployment environment (Vercel env vars) — if
// it's missing, encryption/decryption fails loudly rather than silently
// storing plaintext.

const ENC_PREFIX = "enc:v1:";

function getKey(): Buffer {
  const hex = process.env.PROFILE_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "PROFILE_ENCRYPTION_KEY is not set (or not a 64-char hex string). " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" " +
      "and set it as an env var before storing sensitive profile fields."
    );
  }
  return Buffer.from(hex, "hex");
}

export function encryptField(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // iv (12 bytes) + authTag (16 bytes) + ciphertext, all base64
  return ENC_PREFIX + Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptField(stored: string): string {
  if (!stored.startsWith(ENC_PREFIX)) return stored; // not encrypted (legacy/plaintext) — return as-is
  const key = getKey();
  const raw = Buffer.from(stored.slice(ENC_PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

export function isEncrypted(stored: string): boolean {
  return stored.startsWith(ENC_PREFIX);
}

// Masks a decrypted value for display — shows only the last 4 characters
// (or fewer if the value is short), so the real value never needs to be
// sent back to the client just to render the field.
export function maskValue(plaintext: string): string {
  if (!plaintext) return "";
  const visible = plaintext.slice(-4);
  const hiddenLength = Math.max(plaintext.length - 4, 4);
  return "•".repeat(hiddenLength) + visible;
}
