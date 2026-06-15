import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role (for uploads, admin ops)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const STORAGE_BUCKET = "uploads";

/**
 * Get the public URL for a file in the uploads bucket
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
