"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { rupiah } from "@/lib/format";
import { placeOrder } from "@/lib/data";
import { addOrderId, loadProfile, saveProfile } from "@/lib/profile";

const field =
  "h-12 w-full rounded-2xl bg-white px-4 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40";

export default function CartPage() {
  const { lines, total, count, add, dec, remove, clear } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    setName(p.name);
    setPhone(p.phone);
  }, []);

  async function submit() {
    setError(null);
    if (name.trim().length < 2) return setError("Isi nama Anda.");
    if (phone.replace(/\D/g, "").length < 8) return setError("Isi nomor WhatsApp yang valid.");
    setBusy(true);
    try {
      const id = await placeOrder({ name, phone, note, items: lines.map((l) => ({ id: l.id, qty: l.qty })) });
      saveProfile({ name: name.trim(), phone: phone.trim() });
      addOrderId(id);
      clear();
      router.push(`/pesanan/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pesanan gagal dikirim. Coba lagi.");
      setBusy(false);
    }
  }

  if (count === 0)
    return (
      <div className="mx-auto max-w-sm py-20 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-terakota/10 text-terakota">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 016 0" />
          </svg>
        </div>
        <h1 className="mt-5 text-xl font-bold">Keranjang masih kosong</h1>
        <p className="mt-1 text-sm text-arang/60">Pilih menu dulu, lalu kembali ke sini untuk memesan.</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-terakota px-7 text-sm font-semibold text-krim shadow-md active:scale-95">
          Lihat menu
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-xl pb-28 pt-5">
      <h1 className="text-2xl font-bold text-terakota">Keranjang</h1>

      <ul className="mt-4 divide-y divide-terakota/10 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-terakota/10">
        {lines.map((l) => (
          <li key={l.id} className="py-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold leading-snug">{l.name}</p>
              <p className="shrink-0 text-sm font-bold text-terakota">{rupiah(l.price * l.qty)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-arang/55">{rupiah(l.price)} per porsi</span>
              <div className="flex items-center gap-3">
                <button onClick={() => remove(l.id)} className="text-xs text-terakota underline" aria-label={`Hapus ${l.name}`}>Hapus</button>
                <div className="flex items-center gap-0.5 rounded-full bg-zaitun/10 p-1">
                  <button onClick={() => dec(l.id)} aria-label={`Kurangi ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold text-zaitun shadow-sm">−</button>
                  <span className="w-7 text-center text-sm font-bold">{l.qty}</span>
                  <button onClick={() => add(l)} aria-label={`Tambah ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-zaitun text-lg font-bold text-krim">+</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-3 inline-block text-sm font-semibold text-zaitun-dark underline">Tambah menu lagi</Link>

      <h2 className="mb-3 mt-7 text-lg font-bold">Data pemesan</h2>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" autoComplete="name" className={field} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nomor WhatsApp" inputMode="tel" autoComplete="tel" className={field} />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan, misalnya meja 4 atau tanpa sambal"
          rows={3}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40"
        />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-terakota/10">
        <div className="flex justify-between text-sm text-arang/70"><span>{count} item</span><span>{rupiah(total)}</span></div>
        <div className="mt-2 flex items-baseline justify-between border-t border-terakota/10 pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-serif text-2xl font-bold text-terakota">{rupiah(total)}</span>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-2xl bg-terakota/10 px-4 py-3 text-sm text-terakota-dark">{error}</p>}

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-4 pb-3">
        <button
          onClick={submit}
          disabled={busy}
          className="mx-auto flex h-14 w-full max-w-xl items-center justify-between rounded-2xl bg-terakota px-5 text-krim shadow-md transition active:scale-[.98] disabled:opacity-60"
        >
          <span className="text-base font-semibold">{busy ? "Mengirim pesanan..." : "Kirim pesanan"}</span>
          <span className="font-serif text-base font-bold">{rupiah(total)}</span>
        </button>
      </div>
    </div>
  );
}
