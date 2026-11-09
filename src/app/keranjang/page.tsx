"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { rupiah } from "@/lib/format";
import { placeOrder, uploadProof } from "@/lib/data";
import { addOrderId, loadProfile, saveProfile } from "@/lib/profile";
import { ACCOUNT_HOLDER, BANKS, type OrderType, type PayMethod } from "@/lib/checkout";
import { useAuth } from "@/lib/useAuth";
import QrSim from "@/components/QrSim";

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
  const [orderType, setOrderType] = useState<OrderType>("dinein");
  const [tableNo, setTableNo] = useState("");
  const [pay, setPay] = useState<PayMethod>("qris");
  const [proof, setProof] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const account = useAuth();
  const isBank = pay.startsWith("bank_");
  const bank = BANKS.find((b) => b.id === pay);

  useEffect(() => {
    const p = loadProfile();
    setName(p.name);
    setPhone(p.phone);
  }, []);

  // Pengguna yang login: isi otomatis dari akun
  useEffect(() => {
    if (!account) return;
    if (account.name) setName((v) => v || account.name);
    if (account.phone) setPhone((v) => v || account.phone);
  }, [account]);

  async function copyAccount(no: string) {
    try {
      await navigator.clipboard.writeText(no);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Tidak bisa menyalin otomatis. Salin nomor rekening secara manual.");
    }
  }

  async function submit() {
    setError(null);
    if (name.trim().length < 2) return setError("Isi nama Anda.");
    if (phone.replace(/\D/g, "").length < 8) return setError("Isi nomor WhatsApp yang valid.");
    if (orderType === "dinein" && !tableNo.trim()) return setError("Isi nomor meja untuk Dine-in.");
    setBusy(true);
    try {
      const id = await placeOrder({
        name, phone, note, orderType, tableNo: tableNo.trim(), paymentMethod: pay,
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
      });
      saveProfile({ name: name.trim(), phone: phone.trim() });
      addOrderId(id);
      if (isBank && proof) await uploadProof(id, proof).catch(() => {}); // bisa diulang dari halaman pesanan
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
        <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-terakota px-7 text-sm font-semibold text-krim shadow-md transition hover:-translate-y-0.5 hover:bg-terakota-dark hover:shadow-lg active:scale-95">
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
                <button onClick={() => remove(l.id)} className="text-xs text-terakota underline transition-colors hover:text-terakota-dark hover:no-underline" aria-label={`Hapus ${l.name}`}>Hapus</button>
                <div className="flex items-center gap-0.5 rounded-full bg-zaitun/10 p-1">
                  <button onClick={() => dec(l.id)} aria-label={`Kurangi ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold text-zaitun shadow-sm transition hover:bg-zaitun/15">−</button>
                  <span className="w-7 text-center text-sm font-bold">{l.qty}</span>
                  <button onClick={() => add(l)} aria-label={`Tambah ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-zaitun text-lg font-bold text-krim transition hover:scale-110 hover:bg-zaitun-dark">+</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-3 inline-block text-sm font-semibold text-zaitun-dark underline transition-colors hover:text-terakota">Tambah menu lagi</Link>

      <h2 className="mb-3 mt-7 text-lg font-bold">Data pemesan</h2>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" autoComplete="name" className={field} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nomor WhatsApp" inputMode="tel" autoComplete="tel" className={field} />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan, misalnya tanpa sambal"
          rows={3}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40"
        />
      </div>

      <h2 className="mb-3 mt-7 text-lg font-bold">Jenis pesanan</h2>
      <div role="radiogroup" aria-label="Jenis pesanan" className="grid grid-cols-2 gap-3">
        {([["dinein", "🍽️", "Dine-in", "Makan di tempat"], ["takeaway", "🛍️", "Take-away", "Bungkus / ambil sendiri"]] as const).map(([v, icon, label, sub]) => (
          <button key={v} type="button" role="radio" aria-checked={orderType === v} onClick={() => setOrderType(v)}
            className={`rounded-2xl p-4 text-left shadow-sm ring-1 transition active:scale-[.98] ${orderType === v ? "bg-terakota text-krim ring-terakota" : "bg-white ring-terakota/15 hover:ring-terakota/40"}`}>
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <span className="mt-1 block text-sm font-bold">{label}</span>
            <span className={`block text-[11px] ${orderType === v ? "text-krim/85" : "text-arang/55"}`}>{sub}</span>
          </button>
        ))}
      </div>
      {orderType === "dinein" && (
        <input value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder="Nomor meja, contoh: 4" inputMode="numeric" maxLength={10} aria-label="Nomor meja" className={`${field} mt-3`} />
      )}

      <h2 className="mb-3 mt-7 text-lg font-bold">Metode pembayaran</h2>
      <div className="space-y-2" role="radiogroup" aria-label="Metode pembayaran">
        {([["qris", "📱", "QRIS", "Scan dengan e-wallet atau m-banking"], ["bank_bca", "🏦", "Transfer Bank", "BCA, Mandiri, BNI, BRI"], ["cash", "💵", "Cash / Tunai", "Bayar langsung di kasir"]] as const).map(([v, icon, label, sub]) => {
          const on = v === "bank_bca" ? isBank : pay === v;
          return (
            <button key={v} type="button" role="radio" aria-checked={on} onClick={() => setPay(v === "bank_bca" && isBank ? pay : v)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left shadow-sm ring-1 transition active:scale-[.99] ${on ? "bg-white ring-2 ring-terakota" : "bg-white ring-terakota/15 hover:ring-terakota/40"}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-terakota/10 text-xl" aria-hidden="true">{icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{label}</span>
                <span className="block text-xs text-arang/55">{sub}</span>
              </span>
              <span className={`grid h-5 w-5 place-items-center rounded-full ring-2 ${on ? "ring-terakota" : "ring-arang/20"}`} aria-hidden="true">
                {on && <span className="h-2.5 w-2.5 rounded-full bg-terakota" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-terakota/10">
        {pay === "qris" && (
          <div className="text-center">
            <p className="text-sm font-semibold">Scan untuk membayar {rupiah(total)}</p>
            <div className="mt-3 inline-block rounded-2xl p-2 ring-1 ring-terakota/15"><QrSim seed={`hulonthalo-${total}-${count}`} /></div>
            <p className="mt-2 text-xs text-arang/55">Simulasi QRIS. Pesanan dikonfirmasi kasir setelah pembayaran diterima.</p>
          </div>
        )}
        {isBank && bank && (
          <div>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Pilih bank">
              {BANKS.map((b) => (
                <button key={b.id} type="button" role="radio" aria-checked={pay === b.id} onClick={() => setPay(b.id)}
                  className={`h-10 rounded-full text-xs font-bold transition ${pay === b.id ? "bg-zaitun text-krim" : "bg-zaitun/10 text-zaitun-dark hover:bg-zaitun/20"}`}>
                  {b.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-krim p-3">
              <div className="min-w-0">
                <p className="text-[11px] text-arang/55">Rekening {bank.name} a.n. {ACCOUNT_HOLDER}</p>
                <p className="font-serif text-xl font-bold tracking-wide">{bank.account}</p>
              </div>
              <button type="button" onClick={() => copyAccount(bank.account)} className="h-9 shrink-0 rounded-full bg-terakota px-4 text-xs font-semibold text-krim transition hover:bg-terakota-dark active:scale-95">
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <p className="mt-3 text-xs text-arang/65">Transfer tepat <b>{rupiah(total)}</b>, lalu unggah bukti transfer (opsional, bisa menyusul dari halaman pesanan).</p>
            <label className="mt-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-terakota/40 px-4 text-sm font-semibold text-terakota transition hover:bg-terakota/5">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
              <span className="truncate">{proof ? `✓ ${proof.name}` : "Unggah bukti transfer"}</span>
            </label>
          </div>
        )}
        {pay === "cash" && (
          <p className="text-sm text-arang/75">
            {orderType === "dinein" ? "Bayar tunai di kasir setelah selesai makan atau saat pesanan diantar ke meja." : "Bayar tunai di kasir saat mengambil pesanan."}
          </p>
        )}
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
          className="mx-auto flex h-14 w-full max-w-xl items-center justify-between rounded-2xl bg-terakota px-5 text-krim shadow-md transition duration-150 hover:bg-terakota-dark hover:shadow-lg active:scale-[.98] disabled:opacity-60 disabled:hover:bg-terakota"
        >
          <span className="text-base font-semibold">{busy ? "Mengirim pesanan..." : "Kirim pesanan"}</span>
          <span className="font-serif text-base font-bold">{rupiah(total)}</span>
        </button>
      </div>
    </div>
  );
}
