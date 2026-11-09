import { createClient } from "@supabase/supabase-js";

// HANYA untuk kode server (route handler). Service role melewati RLS: jangan pernah diimpor di komponen client.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
