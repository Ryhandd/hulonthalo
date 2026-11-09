"use client";

import Link from "next/link";

// Error boundary: tampil jika halaman pesanan gagal dirender (menggantikan layar kosong).
export default function OrderError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-sm py-20 text-center">
      <p className="font-serif text-xl font-bold text-terakota">Pesanan tidak dapat ditampilkan</p>
      <p className="mt-2 text-sm text-arang/65">Terjadi kesalahan saat memuat pesanan. Coba lagi sebentar.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="h-11 rounded-full bg-terakota px-6 text-sm font-semibold text-krim transition hover:bg-terakota-dark">Coba lagi</button>
        <Link href="/pesanan" className="flex h-11 items-center rounded-full px-6 text-sm font-semibold text-terakota ring-1 ring-terakota/40">Semua pesanan</Link>
      </div>
    </div>
  );
}
