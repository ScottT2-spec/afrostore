import { prisma } from "@/lib/db";
import { decryptField } from "@/lib/field-crypto";

/**
 * Fetches and decrypts every secret configured for a site, in the shape
 * createSandboxWithFiles() expects as env vars. Extracted to one place
 * rather than duplicated per caller (sandbox creation, coding-agent
 * sandbox creation, and anywhere else that spins one up) - decryption
 * logic is exactly the kind of thing that shouldn't drift between copies
 * if it ever needs to change (e.g. key rotation handling).
 */
export async function getDecryptedSecrets(siteId: string): Promise<Record<string, string>> {
  const secrets = await prisma.sandboxSecret.findMany({ where: { siteId } });
  const out: Record<string, string> = {};
  for (const s of secrets) {
    try {
      out[s.key] = decryptField(s.encryptedValue);
    } catch {
      // A secret that fails to decrypt (e.g. PROFILE_ENCRYPTION_KEY was
      // rotated) is skipped rather than crashing sandbox creation for it -
      // the generated code just won't have that one env var set.
    }
  }
  return out;
}
