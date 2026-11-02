"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { STATUS_LABEL, type OrderDetail, type OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["baru", "diproses", "siap", "selesai"];

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);

  // Pelanggan memantau status lewat polling 5 detik (RLS menutup akses langsung ke tabel orders)
  useEffect(() => {
    let alive = true;
    const load = () => getOrder(id).then((o) => alive && setOrder(o)).catch(() => alive && setOrder(null));
    load();
    const t = setInterval(load, 5000);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  if (order === undefined) return <p className="py-20 text-center text-sm text-arang/60">Memuat pesanan...</p>;
  if (order === null)
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-xl">Pesanan tidak ditemukan</p>
        <Link href="/" className="mt-4 inline-block text-sm text-terakota underline">Kembali ke menu</Link>
      </div>
    );

  const current = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-2xl font-bold text-terakota">Terima kasih, {order.customer_name}</h1>
      <p className="mt-1 text-sm text-arang/70">Simpan halaman ini untuk memantau pesanan Anda.</p>

      <div className="mt-6 rounded-2xl border border-terakota/15 bg-white p-5">
        <p className="text-xs text-arang/60">Status saat ini</p>
        <p className="font-serif text-xl font-bold text-zaitun">{STATUS_LABEL[order.status]}</p>

        {order.status !== "dibatalkan" && (
          <ol className="mt-4 flex gap-1.5" aria-label="Tahapan pesanan">
            {STEPS.map((s, i) => (
              <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= current ? "bg-zaitun" : "bg-arang/10"}`} />
            ))}
          </ol>
        )}
      </div>

      <ul className="mt-4 divide-y divide-terakota/10 rounded-2xl border border-terakota/15 bg-white px-5">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between py-3 text-sm">
            <span>{i.qty}× {i.name}</span>
            <span className="font-semibold">{rupiah(i.qty * i.price)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 font-bold">
          <span>Total</span>
          <span className="text-terakota">{rupiah(order.total)}</span>
        </li>
      </ul>

      <Link href="/" className="mt-6 block h-12 rounded-full border border-terakota text-center text-sm font-semibold leading-[3rem] text-terakota">
        Pesan lagi
      </Link>
    </div>
  );
}
