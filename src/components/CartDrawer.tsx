"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { rupiah } from "@/lib/format";
import { placeOrder } from "@/lib/data";

export default function CartDrawer() {
  const { lines, total, count, isOpen, close, add, dec, remove, clear } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kunci scroll halaman saat drawer terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  async function submit() {
    setError(null);
    if (name.trim().length < 2) return setError("Isi nama Anda.");
    if (phone.replace(/\D/g, "").length < 8) return setError("Isi nomor WhatsApp yang valid.");
    setBusy(true);
    try {
      const id = await placeOrder({
        name, phone, note,
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
      });
      clear();
      close();
      router.push(`/pesanan/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pesanan gagal dikirim. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Keranjang pesanan">
      <button className="absolute inset-0 bg-arang/50" onClick={close} aria-label="Tutup keranjang" />

      {/* Mobile: bottom sheet. Desktop: panel kanan */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-krim shadow-xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[420px] md:rounded-none">
        <div className="flex items-center justify-between border-b border-terakota/15 px-5 py-4">
          <h2 className="font-serif text-xl font-bold text-terakota">Pesanan Anda</h2>
          <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full text-2xl text-arang/60" aria-label="Tutup">×</button>
        </div>

        {count === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-serif text-lg text-arang">Keranjang masih kosong</p>
            <p className="mt-1 text-sm text-arang/60">Pilih menu dulu, lalu kembali ke sini.</p>
            <button onClick={close} className="mt-6 h-11 rounded-full bg-terakota px-6 text-sm font-semibold text-krim">Lihat menu</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-terakota/10 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-arang/60">{rupiah(l.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-zaitun/10 p-1">
                    <button onClick={() => dec(l.id)} aria-label={`Kurangi ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-white font-bold text-zaitun">−</button>
                    <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                    <button onClick={() => add(l)} aria-label={`Tambah ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-zaitun font-bold text-krim">+</button>
                  </div>
                  <button onClick={() => remove(l.id)} className="text-xs text-terakota underline" aria-label={`Hapus ${l.name}`}>Hapus</button>
                </li>
              ))}

              <li className="space-y-2.5 py-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" autoComplete="name"
                  className="h-11 w-full rounded-xl border border-terakota/25 bg-white px-4 text-sm outline-none focus:border-terakota" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nomor WhatsApp" inputMode="tel" autoComplete="tel"
                  className="h-11 w-full rounded-xl border border-terakota/25 bg-white px-4 text-sm outline-none focus:border-terakota" />
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan, misalnya meja 4 atau tanpa sambal" rows={2}
                  className="w-full rounded-xl border border-terakota/25 bg-white px-4 py-3 text-sm outline-none focus:border-terakota" />
              </li>
            </ul>

            <div className="border-t border-terakota/15 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              {error && <p role="alert" className="mb-3 rounded-lg bg-terakota/10 px-3 py-2 text-sm text-terakota-dark">{error}</p>}
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm text-arang/70">Total</span>
                <span className="font-serif text-2xl font-bold text-terakota">{rupiah(total)}</span>
              </div>
              <button onClick={submit} disabled={busy}
                className="h-12 w-full rounded-full bg-terakota text-base font-semibold text-krim transition active:scale-[.98] disabled:opacity-60">
                {busy ? "Mengirim pesanan..." : "Kirim pesanan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
