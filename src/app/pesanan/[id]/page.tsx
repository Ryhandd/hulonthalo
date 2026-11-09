"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrder, uploadProof } from "@/lib/data";
import { ORDER_TYPE_LABEL, PAY_LABEL } from "@/lib/checkout";
import { rupiah } from "@/lib/format";
import { addOrderId } from "@/lib/profile";
import { STATUS_BADGE } from "@/lib/status";
import { STATUS_LABEL, type OrderDetail, type OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["baru", "diproses", "siap", "selesai"];
const SHORT: Record<OrderStatus, string> = {
  baru: "Diterima", diproses: "Dimasak", siap: "Siap", selesai: "Selesai", dibatalkan: "Batal",
};

// Data dari database bisa kurang lengkap (mis. fungsi get_order versi lama): beri nilai bawaan agar tidak crash.
function normalize(o: OrderDetail): OrderDetail {
  return {
    ...o,
    status: (o.status in STATUS_LABEL ? o.status : "baru") as OrderStatus,
    total: Number(o.total) || 0,
    customer_name: o.customer_name ?? "",
    order_type: o.order_type === "dinein" ? "dinein" : "takeaway",
    table_no: o.table_no ?? null,
    payment_method: o.payment_method && o.payment_method in PAY_LABEL ? o.payment_method : "cash",
    payment_status: o.payment_status === "lunas" ? "lunas" : "belum_bayar",
    has_proof: Boolean(o.has_proof),
    items: Array.isArray(o.items) ? o.items : [],
  };
}

export default function OrderPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [upBusy, setUpBusy] = useState(false);
  const [upMsg, setUpMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setOrder(null); return; }
    addOrderId(id); // pastikan pesanan tersimpan di riwayat perangkat ini
    let alive = true;
    const load = () => getOrder(id).then((o) => alive && setOrder(o ? normalize(o) : null)).catch(() => alive && setOrder(null));
    load();
    const t = setInterval(load, 5000);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  if (order === undefined) return <p className="py-20 text-center text-sm text-arang/60">Memuat pesanan...</p>;
  if (order === null)
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-xl font-bold">Pesanan tidak ditemukan</p>
        <Link href="/pesanan" className="mt-4 inline-block text-sm text-terakota underline">Kembali ke daftar pesanan</Link>
      </div>
    );

  const current = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-md pt-4">
      <Link href="/pesanan" className="inline-flex h-10 items-center gap-1 text-sm font-semibold text-terakota">
        <span aria-hidden="true">‹</span> Semua pesanan
      </Link>

      <h1 className="mt-1 text-2xl font-bold text-terakota">Terima kasih, {order.customer_name}</h1>
      <p className="mt-1 text-sm text-arang/65">Pesanan #{String(order.id ?? id).slice(-6).toUpperCase()}. Status diperbarui otomatis.</p>

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-terakota/10">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${(STATUS_BADGE[order.status] ?? "")}`}>
          {STATUS_LABEL[order.status]}
        </span>

        {order.status !== "dibatalkan" && (
          <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Tahapan pesanan">
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <div className={`h-2 rounded-full transition-colors ${i <= current ? "bg-zaitun" : "bg-arang/10"}`} />
                <p className={`mt-2 text-[11px] ${i <= current ? "font-semibold text-zaitun-dark" : "text-arang/40"}`}>{SHORT[s]}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 text-sm shadow-sm ring-1 ring-terakota/10">
        <div className="flex justify-between gap-3 py-1">
          <span className="text-arang/60">Layanan</span>
          <span className="font-semibold">{ORDER_TYPE_LABEL[order.order_type]}{order.order_type === "dinein" && order.table_no ? ` · Meja ${order.table_no}` : ""}</span>
        </div>
        <div className="flex justify-between gap-3 py-1">
          <span className="text-arang/60">Pembayaran</span>
          <span className="font-semibold">{PAY_LABEL[order.payment_method]}</span>
        </div>
        <div className="flex justify-between gap-3 py-1">
          <span className="text-arang/60">Status bayar</span>
          <span className={`font-semibold ${order.payment_status === "lunas" ? "text-zaitun-dark" : "text-terakota"}`}>
            {order.payment_status === "lunas" ? "Lunas" : order.payment_method === "cash" ? "Bayar di kasir" : "Menunggu pembayaran"}
          </span>
        </div>
        {order.payment_method.startsWith("bank_") && order.payment_status === "belum_bayar" && (
          <div className="mt-3 border-t border-terakota/10 pt-3">
            {order.has_proof ? (
              <p className="text-xs text-zaitun-dark">Bukti transfer sudah diunggah. Menunggu konfirmasi kasir.</p>
            ) : (
              <label className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-dashed border-terakota/40 text-sm font-semibold text-terakota hover:bg-terakota/5">
                <input
                  type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={upBusy}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUpBusy(true); setUpMsg(null);
                    try { await uploadProof(order.id, f); setUpMsg("Bukti terunggah."); }
                    catch (err) { setUpMsg(err instanceof Error ? err.message : "Gagal mengunggah."); }
                    setUpBusy(false);
                  }}
                />
                {upBusy ? "Mengunggah..." : "Unggah bukti transfer"}
              </label>
            )}
            {upMsg && <p role="status" className="mt-2 text-xs text-arang/70">{upMsg}</p>}
          </div>
        )}
      </div>

      <ul className="mt-4 divide-y divide-terakota/10 rounded-2xl bg-white px-5 shadow-sm ring-1 ring-terakota/10">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-3 py-3 text-sm">
            <span>{i.qty}× {i.name}</span>
            <span className="shrink-0 font-semibold">{rupiah(i.qty * i.price)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 font-bold">
          <span>Total</span>
          <span className="font-serif text-lg text-terakota">{rupiah(order.total)}</span>
        </li>
      </ul>

      <Link href="/" className="mt-6 flex h-12 items-center justify-center rounded-full bg-terakota text-sm font-semibold text-krim shadow-md">
        Pesan lagi
      </Link>
    </div>
  );
}
