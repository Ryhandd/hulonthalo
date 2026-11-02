"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrder } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { loadOrderIds } from "@/lib/profile";
import { ACTIVE_STATUSES, STATUS_BADGE } from "@/lib/status";
import { STATUS_LABEL, type OrderDetail } from "@/lib/types";

function OrderCard({ o }: { o: OrderDetail }) {
  const active = ACTIVE_STATUSES.includes(o.status);
  const first = o.items.slice(0, 2).map((i) => `${i.qty}× ${i.name}`).join(", ");
  const more = o.items.length - 2;
  const when = new Date(o.created_at).toLocaleString("id-ID", {
    timeZone: "Asia/Makassar", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <Link href={`/pesanan/${o.id}`} className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-terakota/10 transition active:scale-[.99]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold">Pesanan #{o.id.slice(-6).toUpperCase()}</p>
          <p className="text-xs text-arang/55">{when} WITA</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[o.status]}`}>
          {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {STATUS_LABEL[o.status]}
        </span>
      </div>
      <p className="mt-3 line-clamp-1 text-sm text-arang/75">{first}{more > 0 ? ` dan ${more} lainnya` : ""}</p>
      <p className="mt-1 text-sm font-bold text-terakota">{rupiah(o.total)}</p>
    </Link>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDetail[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const ids = loadOrderIds();
      if (ids.length === 0) return alive && setOrders([]);
      try {
        const res = await Promise.all(ids.map((id) => getOrder(id).catch(() => null)));
        if (alive) setOrders(res.filter((o): o is OrderDetail => o !== null));
      } catch {
        if (alive) setOrders((prev) => prev ?? []);
      }
    };
    load();
    const t = setInterval(load, 10_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (orders === null) return <p className="py-20 text-center text-sm text-arang/60">Memuat pesanan...</p>;

  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const history = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="mx-auto max-w-xl pt-5">
      <h1 className="text-2xl font-bold text-terakota">Pesanan</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-terakota/10 text-terakota">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5" /><path d="M12 12v9" />
            </svg>
          </div>
          <p className="mt-5 font-serif text-lg font-bold">Belum ada pesanan</p>
          <p className="mt-1 text-sm text-arang/60">Pesanan yang Anda kirim dari perangkat ini akan muncul di sini.</p>
          <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-terakota px-7 text-sm font-semibold text-krim shadow-md">Pesan sekarang</Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mt-4">
              <h2 className="mb-3 text-base font-bold">Sedang berjalan</h2>
              <div className="space-y-3">{active.map((o) => <OrderCard key={o.id} o={o} />)}</div>
            </section>
          )}
          {history.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-base font-bold">Riwayat</h2>
              <div className="space-y-3">{history.map((o) => <OrderCard key={o.id} o={o} />)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
