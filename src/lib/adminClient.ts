import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Klien KHUSUS admin dengan penyimpanan sesi terpisah dari klien pelanggan:
// login pelanggan tidak pernah memberi akses ke panel admin, dan sebaliknya.
export const adminSupabase = createClient(url ?? "http://localhost:54321", anon ?? "public-anon-key-not-set", {
  auth: { storageKey: "hulonthalo-admin-auth", detectSessionInUrl: false },
});
