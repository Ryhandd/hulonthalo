import { fetchMenu } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import MenuBrowser from "@/components/MenuBrowser";
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
      <section className="py-8">
        <h1 className="max-w-md text-3xl font-bold leading-tight text-terakota sm:text-4xl">
          Masakan rumah khas Gorontalo, hangat dari mangkuk.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-arang/75">
          Pilih menu, kirim pesanan, dan pantau statusnya dari ponsel Anda.
        </p>
      </section>

      {failed ? (
        <p role="alert" className="rounded-xl bg-terakota/10 p-4 text-sm text-terakota-dark">
          Menu belum bisa dimuat. Pastikan file .env.local sudah diisi dan skema SQL sudah dijalankan di Supabase.
        </p>
      ) : (
        <MenuBrowser categories={categories} items={items} />
      )}
    </>
  );
}
