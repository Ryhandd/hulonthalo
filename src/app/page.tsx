import { fetchMenu } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import MenuBrowser from "@/components/MenuBrowser";
import Logo from "@/components/Logo";
import type { Category, MenuItem } from "@/lib/types";

// ISR: halaman menu disegarkan setiap 60 detik
export const revalidate = 60;

export default async function HomePage() {
  let categories: Category[] = [];
  let items: MenuItem[] = [];
  let failed = false;

  if (isSupabaseConfigured) {
    try {
      ({ categories, items } = await fetchMenu());
    } catch {
      failed = true;
    }
  } else {
    failed = true;
  }

  return (
    <>
      <section className="relative mt-4 overflow-hidden rounded-3xl bg-terakota p-5 text-krim shadow-md">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-rempah/25" aria-hidden="true" />
        <div className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-zaitun/40" aria-hidden="true" />
        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              Masakan rumah khas Gorontalo, hangat dari mangkuk.
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-krim/85">
              Pilih menu, kirim pesanan, lalu pantau statusnya.
            </p>
          </div>
          <div className="hidden shrink-0 rounded-full bg-krim p-3 shadow-sm sm:block">
            <Logo size={56} />
          </div>
        </div>
      </section>

      {failed ? (
        <p role="alert" className="mt-5 rounded-2xl bg-terakota/10 p-4 text-sm text-terakota-dark">
          Menu belum bisa dimuat. Pastikan file .env.local sudah diisi dan skema SQL sudah dijalankan di Supabase.
        </p>
      ) : (
        <MenuBrowser categories={categories} items={items} />
      )}
    </>
  );
}
