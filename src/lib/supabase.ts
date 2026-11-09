import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

// Klien PELANGGAN. Sesi disimpan di localStorage dengan kunci sendiri,
// terpisah dari klien admin (lihat adminClient.ts).
// Keamanan data dijaga oleh RLS di database.
export const supabase = createClient(
  url ?? "http://localhost:54321",
  anon ?? "public-anon-key-not-set",
  { auth: { storageKey: "hulonthalo-user-auth" } }
);
