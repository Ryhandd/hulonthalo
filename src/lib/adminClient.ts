import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Penyimpanan sesi admin: sessionStorage (hanya tab ini, hilang saat tab ditutup),
// sehingga tidak pernah bercampur dengan localStorage klien pelanggan.
const adminStorage = {
  getItem: (k: string) => { try { return typeof window === "undefined" ? null : window.sessionStorage.getItem(k); } catch { return null; } },
  setItem: (k: string, v: string) => { try { if (typeof window !== "undefined") window.sessionStorage.setItem(k, v); } catch {} },
  removeItem: (k: string) => { try { if (typeof window !== "undefined") window.sessionStorage.removeItem(k); } catch {} },
};

// Klien KHUSUS admin: kunci & penyimpanan sesi terpisah. Login/logout di sini
// tidak mengubah sesi pelanggan, begitu pula sebaliknya.
export const adminSupabase = createClient(url ?? "http://localhost:54321", anon ?? "public-anon-key-not-set", {
  auth: {
    storageKey: "hulonthalo-admin-auth",
    storage: adminStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
