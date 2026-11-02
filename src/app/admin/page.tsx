"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

type AdminOrder = {
  id: string; customer_name: string; phone: string; note: string | null;
  status: OrderStatus; total: number; created_at: string;
  order_items: { name: string; qty: number }[];
};

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { baru: "diproses", diproses: "siap", siap: "selesai" };

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(name, qty)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return setMsg(error.message);
    setOrders((data ?? []) as AdminOrder[]);
  }, []);

  // Realtime: muat ulang setiap ada perubahan pada tabel orders
  useEffect(() => {
    if (!session) return;
    load();
    const ch = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? "Email atau kata sandi salah." : null);
  }

  async function setStatus(id: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setMsg("Gagal memperbarui. Pastikan akun ini terdaftar di tabel admins.");
  }

  if (!session)
    return (
      <form onSubmit={login} className="mx-auto max-w-sm space-y-3 py-12">
        <h1 className="text-2xl font-bold text-terakota">Masuk admin</h1>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="h-11 w-full rounded-xl border border-terakota/25 bg-white px-4 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi" required className="h-11 w-full rounded-xl border border-terakota/25 bg-white px-4 text-sm" />
        {msg && <p role="alert" className="text-sm text-terakota">{msg}</p>}
        <button className="h-12 w-full rounded-full bg-terakota font-semibold text-krim">Masuk</button>
      </form>
    );

  return (
    <div className="py-6 pb-16">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-terakota">Pesanan masuk</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-terakota underline">Keluar</button>
      </div>
      {msg && <p role="alert" className="mb-3 rounded-lg bg-terakota/10 p-3 text-sm text-terakota-dark">{msg}</p>}
      {orders.length === 0 && <p className="py-12 text-center text-sm text-arang/60">Belum ada pesanan.</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {orders.map((o) => {
          const next = NEXT[o.status];
          return (
            <article key={o.id} className="rounded-2xl border border-terakota/15 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.customer_name}</p>
                  <a href={`https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0/, "62")}`} className="text-xs text-zaitun underline">{o.phone}</a>
                </div>
                <span className="rounded-full bg-zaitun/10 px-3 py-1 text-xs font-semibold text-zaitun">{STATUS_LABEL[o.status]}</span>
              </div>
              <ul className="mt-3 text-sm text-arang/80">
                {o.order_items.map((i, k) => <li key={k}>{i.qty}× {i.name}</li>)}
              </ul>
              {o.note && <p className="mt-2 text-xs italic text-arang/60">Catatan: {o.note}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-terakota">{rupiah(o.total)}</span>
                <div className="flex gap-2">
                  {o.status !== "dibatalkan" && o.status !== "selesai" && (
                    <button onClick={() => setStatus(o.id, "dibatalkan")} className="h-9 rounded-full border border-terakota/30 px-4 text-xs text-terakota">Batalkan</button>
                  )}
                  {next && (
                    <button onClick={() => setStatus(o.id, next)} className="h-9 rounded-full bg-terakota px-4 text-xs font-semibold text-krim">
                      {STATUS_LABEL[next]}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
