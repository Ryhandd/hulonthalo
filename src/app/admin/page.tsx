"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { adminSupabase as supabase } from "@/lib/adminClient";
import { rupiah } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { STATUS_BADGE } from "@/lib/status";
import Receipt from "@/components/Receipt";
import { ORDER_TYPE_LABEL, PAY_LABEL, type OrderType, type PayMethod, type PayStatus } from "@/lib/checkout";

type AdminOrder = {
  id: string; customer_name: string; phone: string; note: string | null;
  status: OrderStatus; total: number; created_at: string;
  order_type: OrderType; table_no: string | null;
  payment_method: PayMethod; payment_status: PayStatus; proof_url: string | null;
  order_items: { name: string; qty: number; price: number }[];
};

type Customer = {
  key: string; name: string; otherNames: string[]; phone: string;
  orders: AdminOrder[]; spent: number; last: string;
};

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { baru: "diproses", diproses: "siap", siap: "selesai" };
const STATUSES: OrderStatus[] = ["baru", "diproses", "siap", "selesai", "dibatalkan"];

// Nomor HP dinormalkan agar "0897..." dan "62897..." dianggap pelanggan yang sama
const normPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
};
const waLink = (p: string) => `https://wa.me/${normPhone(p)}`;
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Makassar", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const kode = (id: string) => id.slice(0, 8).toUpperCase();
// Tanggal (YYYY-MM-DD) menurut WITA, untuk filter rentang tanggal & omzet harian
const dayKey = (iso: string | Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(new Date(iso));
const payGroup = (m: PayMethod) => (m?.startsWith("bank_") ? "bank" : m ?? "cash");
const orderText = (o: AdminOrder) =>
  [o.customer_name, o.phone, normPhone(o.phone), o.note ?? "", kode(o.id), o.id.slice(-6).toUpperCase(), STATUS_LABEL[o.status], PAY_LABEL[o.payment_method] ?? "", ...o.order_items.map((i) => i.name)].join(" ").toLowerCase();

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="group relative">
      <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-arang/40 transition-colors group-focus-within:text-terakota" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-sm shadow-sm outline-none ring-1 ring-terakota/15 transition hover:ring-terakota/35 focus:ring-2 focus:ring-terakota/40"
      />
    </div>
  );
}

function OrderCard({ o, onStatus, onPaid, compact }: { o: AdminOrder; onStatus?: (id: string, s: OrderStatus) => void; onPaid?: (id: string, v: PayStatus) => void; compact?: boolean }) {
  const next = NEXT[o.status];
  const [receipt, setReceipt] = useState(false);
  const type = o.order_type ?? "takeaway";
  const method = o.payment_method ?? "cash";
  const paid = o.payment_status ?? "belum_bayar";
  return (
    <article className={`rounded-2xl bg-white p-4 ring-1 ring-terakota/15 ${compact ? "" : "shadow-sm transition duration-200 hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {!compact && (
            <>
              <p className="font-semibold">{o.customer_name}</p>
              <a href={waLink(o.phone)} target="_blank" rel="noopener noreferrer" className="text-xs text-zaitun underline">{o.phone}</a>
            </>
          )}
          <p className="text-[11px] text-arang/50">{fmtDate(o.created_at)} · #{kode(o.id)}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
      </div>
      <ul className="mt-3 text-sm text-arang/80">
        {o.order_items.map((i, k) => <li key={k}>{i.qty}× {i.name}</li>)}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="rounded-full bg-zaitun/10 px-2.5 py-0.5 font-semibold text-zaitun-dark">
          {ORDER_TYPE_LABEL[type]}{type === "dinein" && o.table_no ? ` · Meja ${o.table_no}` : ""}
        </span>
        <span className="text-arang/70">{PAY_LABEL[method]} ·{" "}
          <b className={paid === "lunas" ? "text-zaitun-dark" : "text-terakota"}>{paid === "lunas" ? "Lunas" : "Belum bayar"}</b>
        </span>
        {o.proof_url && <a href={o.proof_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-zaitun underline">Lihat bukti</a>}
        {onPaid && o.status !== "dibatalkan" && (
          <button onClick={() => onPaid(o.id, paid === "lunas" ? "belum_bayar" : "lunas")} className="font-semibold text-terakota underline">
            {paid === "lunas" ? "Batalkan lunas" : "Tandai lunas"}
          </button>
        )}
      </div>
      {o.note && <p className="mt-2 text-xs italic text-arang/60">Catatan: {o.note}</p>}

      {onStatus && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Ubah status pesanan">
          {STATUSES.map((st) => (
            <button
              key={st} disabled={st === o.status}
              onClick={() => { if (st !== "dibatalkan" || window.confirm("Batalkan pesanan ini?")) onStatus(o.id, st); }}
              className={`h-8 rounded-full px-3 text-[11px] font-semibold transition ${
                st === o.status ? `${STATUS_BADGE[st]} ring-1 ring-current` : "bg-white text-arang/70 ring-1 ring-terakota/20 hover:bg-terakota/10"
              }`}
            >
              {STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-bold text-terakota">{rupiah(o.total)}</span>
        <div className="flex gap-2">
          <button onClick={() => setReceipt(true)} className="h-9 rounded-full border border-terakota/30 px-4 text-xs font-semibold text-terakota transition hover:bg-terakota/10">Cetak Struk</button>
          {onStatus && next && (
            <button onClick={() => onStatus(o.id, next)} className="h-9 rounded-full bg-terakota px-4 text-xs font-semibold text-krim transition hover:bg-terakota-dark">
              {STATUS_LABEL[next]}
            </button>
          )}
        </div>
      </div>
      {receipt && <Receipt o={o} onClose={() => setReceipt(false)} />}
    </article>
  );
}

function CustomerCard({ c, onStatus, onPaid }: { c: Customer; onStatus: (id: string, s: OrderStatus) => void; onPaid: (id: string, v: PayStatus) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? c.orders.filter((o) => orderText(o).includes(t)) : c.orders;
  }, [c.orders, q]);

  return (
    <article className="rounded-2xl bg-white shadow-sm ring-1 ring-terakota/15 transition duration-200 hover:shadow-md">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-terakota/10 font-serif text-lg font-bold text-terakota">
          {c.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{c.name}</span>
          <span className="block text-xs text-arang/60">{c.phone}</span>
          <span className="mt-1 block text-[11px] text-arang/50">{c.orders.length} pesanan · terakhir {fmtDate(c.last)}</span>
        </span>
        <span className="text-right">
          <span className="block text-sm font-bold text-terakota">{rupiah(c.spent)}</span>
          <svg className={`ml-auto mt-1 text-arang/40 transition-transform ${open ? "rotate-180" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-terakota/10 p-4 pt-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" className="font-semibold text-zaitun underline">Chat WhatsApp</a>
            {c.otherNames.length > 0 && <span className="text-arang/50">Nama lain: {c.otherNames.join(", ")}</span>}
          </div>
          <SearchBox value={q} onChange={setQ} placeholder={`Cari pesanan ${c.name}`} />
          {shown.length === 0 ? (
            <p className="py-4 text-center text-sm text-arang/60">Pesanan tidak ditemukan.</p>
          ) : (
            <div className="space-y-2">
              {shown.map((o) => <OrderCard key={o.id} o={o} compact onStatus={onStatus} onPaid={onPaid} />)}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"pesanan" | "pelanggan">("pesanan");
  const [qOrder, setQOrder] = useState("");
  const [qCust, setQCust] = useState("");
  const [filter, setFilter] = useState<"semua" | OrderStatus>("semua");
  const [payF, setPayF] = useState<"semua" | "qris" | "bank" | "cash">("semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = sedang diperiksa
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Wajib terdaftar di tabel admins (dicek di database lewat fungsi is_admin)
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    let alive = true;
    supabase.rpc("is_admin").then(({ data, error }) => alive && setIsAdmin(!error && data === true));
    return () => { alive = false; };
  }, [session]);

  const load = useCallback(async () => {
    // Ambil semua pesanan bertahap (1000 per halaman) agar omzet tidak terpotong batas baris
    const all: AdminOrder[] = [];
    for (let from = 0; from < 20000; from += 1000) {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(name, qty, price)")
        .order("created_at", { ascending: false })
        .range(from, from + 999);
      if (error) return setMsg(error.message);
      all.push(...((data ?? []) as AdminOrder[]));
      if (!data || data.length < 1000) break;
    }
    setOrders(all);
  }, []);

  // Realtime: muat ulang setiap ada perubahan pada tabel orders
  useEffect(() => {
    if (!session || isAdmin !== true) return;
    load();
    const ch = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session, isAdmin, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      setBusy(false);
      return setMsg(/invalid login/i.test(error.message) ? "Email atau kata sandi salah." : error.message);
    }
    const { data: ok } = await supabase.rpc("is_admin");
    if (ok !== true) {
      await supabase.auth.signOut({ scope: "local" });
      setBusy(false);
      return setMsg("Akun ini bukan admin. Akses panel admin ditolak. Pelanggan silakan masuk lewat halaman Profil.");
    }
    setBusy(false);
  }

  async function setStatus(id: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return setMsg("Gagal memperbarui. Pastikan akun ini terdaftar di tabel admins.");
    setMsg(null);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  async function setPaid(id: string, payment_status: PayStatus) {
    const { error } = await supabase.from("orders").update({ payment_status }).eq("id", id);
    if (error) return setMsg("Gagal memperbarui pembayaran. Pastikan akun ini terdaftar di tabel admins.");
    setMsg(null);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, payment_status } : o)));
  }

  // Pelanggan = dikelompokkan dari nomor HP pada pesanan (aplikasi ini tidak memakai akun pelanggan)
  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) { // orders sudah urut terbaru -> terlama
      const key = normPhone(o.phone) || o.phone;
      let c = map.get(key);
      if (!c) {
        c = { key, name: o.customer_name, otherNames: [], phone: o.phone, orders: [], spent: 0, last: o.created_at };
        map.set(key, c);
      } else if (o.customer_name !== c.name && !c.otherNames.includes(o.customer_name)) {
        c.otherNames.push(o.customer_name);
      }
      c.orders.push(o);
      if (o.status !== "dibatalkan") c.spent += o.total;
    }
    return [...map.values()];
  }, [orders]);

  // Filter dasar (pencarian + metode bayar + rentang tanggal); status diterapkan setelahnya
  const base = useMemo(() => {
    const t = qOrder.trim().toLowerCase();
    return orders.filter((o) => {
      const d = dayKey(o.created_at);
      return (
        (!t || orderText(o).includes(t)) &&
        (payF === "semua" || payGroup(o.payment_method) === payF) &&
        (!dateFrom || d >= dateFrom) &&
        (!dateTo || d <= dateTo)
      );
    });
  }, [orders, qOrder, payF, dateFrom, dateTo]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { semua: base.length };
    for (const st of STATUSES) m[st] = base.filter((o) => o.status === st).length;
    return m;
  }, [base]);

  const shownOrders = useMemo(() => base.filter((o) => filter === "semua" || o.status === filter), [base, filter]);
  const filtered = payF !== "semua" || Boolean(dateFrom) || Boolean(dateTo) || qOrder.trim() !== "" || filter !== "semua";

  const shownCustomers = useMemo(() => {
    const t = qCust.trim().toLowerCase();
    if (!t) return customers;
    return customers.filter((c) =>
      [c.name, ...c.otherNames, c.phone, c.key].join(" ").toLowerCase().includes(t) ||
      c.orders.some((o) => o.order_items.some((i) => i.name.toLowerCase().includes(t)))
    );
  }, [customers, qCust]);

  // Omzet = jumlah total pesanan berstatus "selesai" (pesanan dibatalkan / belum selesai tidak dihitung)
  const sumSelesai = (list: AdminOrder[]) => list.filter((o) => o.status === "selesai").reduce((a, o) => a + (o.total || 0), 0);
  const omzet = useMemo(() => sumSelesai(orders), [orders]);
  const today = dayKey(new Date());
  const todayOrders = useMemo(() => orders.filter((o) => dayKey(o.created_at) === today), [orders, today]);
  const omzetHariIni = useMemo(() => sumSelesai(todayOrders), [todayOrders]);
  const omzetFilter = useMemo(() => sumSelesai(shownOrders), [shownOrders]);

  if (session && isAdmin === null) return <p className="py-20 text-center text-sm text-arang/60">Memeriksa akses...</p>;

  if (session && isAdmin === false)
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <h1 className="text-2xl font-bold text-terakota">Akses ditolak</h1>
        <p className="mt-2 text-sm text-arang/65">Akun ini tidak terdaftar sebagai admin.</p>
        <button onClick={() => supabase.auth.signOut({ scope: "local" })} className="mt-6 h-12 rounded-full bg-terakota px-8 text-sm font-semibold text-krim transition hover:bg-terakota-dark">Keluar</button>
      </div>
    );

  if (!session)
    return (
      <form onSubmit={login} className="mx-auto max-w-sm space-y-3 py-12">
        <h1 className="text-2xl font-bold text-terakota">Masuk admin</h1>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="h-11 w-full rounded-xl border border-terakota/25 bg-white px-4 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi" required className="h-11 w-full rounded-xl border border-terakota/25 bg-white px-4 text-sm" />
        {msg && <p role="alert" className="text-sm text-terakota">{msg}</p>}
        <button disabled={busy} className="h-12 w-full rounded-full bg-terakota font-semibold text-krim transition hover:bg-terakota-dark disabled:opacity-60">{busy ? "Memeriksa..." : "Masuk"}</button>
      </form>
    );

  return (
    <div className="py-6 pb-16">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-terakota">Dasbor admin</h1>
        <button onClick={() => supabase.auth.signOut({ scope: "local" })} className="text-sm text-terakota underline transition-colors hover:text-terakota-dark">Keluar</button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { l: "Pesanan hari ini", v: String(todayOrders.length) },
          { l: "Omzet hari ini (selesai)", v: rupiah(omzetHariIni) },
          { l: "Total omzet (selesai)", v: rupiah(omzet) },
          { l: "Pelanggan", v: String(customers.length) },
        ].map((x) => (
          <div key={x.l} className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-terakota/10">
            <p className="truncate text-base font-bold text-terakota sm:text-lg">{x.v}</p>
            <p className="text-[11px] text-arang/60">{x.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-terakota/10" role="tablist" aria-label="Bagian admin">
        {([["pesanan", `Pesanan (${orders.length})`], ["pelanggan", `Pelanggan (${customers.length})`]] as const).map(([id, label]) => (
          <button
            key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`h-10 rounded-full text-sm font-semibold transition ${tab === id ? "bg-terakota text-krim shadow-sm" : "text-terakota hover:bg-terakota/10"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && <p role="alert" className="mt-3 rounded-lg bg-terakota/10 p-3 text-sm text-terakota-dark">{msg}</p>}

      {tab === "pesanan" ? (
        <section className="mt-4" aria-label="Daftar pesanan">
          <SearchBox value={qOrder} onChange={setQOrder} placeholder="Cari nama, no. HP, menu, atau kode pesanan" />
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Filter status">
            {(["semua", ...STATUSES] as const).map((st) => (
              <button
                key={st} role="tab" aria-selected={filter === st} onClick={() => setFilter(st)}
                className={`h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition ${
                  filter === st ? "bg-terakota text-krim shadow-sm" : "bg-white text-terakota ring-1 ring-terakota/20 hover:bg-terakota/10"
                }`}
              >
                {st === "semua" ? "Semua" : STATUS_LABEL[st]} ({counts[st]})
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select value={payF} onChange={(e) => setPayF(e.target.value as typeof payF)} aria-label="Filter metode pembayaran" className="h-11 rounded-2xl bg-white px-3 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40">
              <option value="semua">Semua pembayaran</option>
              <option value="qris">QRIS</option>
              <option value="bank">Transfer Bank</option>
              <option value="cash">Cash / Tunai</option>
            </select>
            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} aria-label="Dari tanggal" className="h-11 rounded-2xl bg-white px-3 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40" />
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} aria-label="Sampai tanggal" className="h-11 rounded-2xl bg-white px-3 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40" />
            <button onClick={() => { setPayF("semua"); setDateFrom(""); setDateTo(""); setQOrder(""); setFilter("semua"); }} disabled={!filtered} className="h-11 rounded-2xl text-sm font-semibold text-terakota ring-1 ring-terakota/30 transition hover:bg-terakota/10 disabled:opacity-40">Reset filter</button>
          </div>
          <p className="mt-2 text-xs text-arang/60">{shownOrders.length} pesanan · omzet selesai <b className="text-terakota">{rupiah(omzetFilter)}</b></p>
          {shownOrders.length === 0 ? (
            <p className="py-12 text-center text-sm text-arang/60">{orders.length === 0 ? "Belum ada pesanan." : "Pesanan tidak ditemukan."}</p>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {shownOrders.map((o) => <OrderCard key={o.id} o={o} onStatus={setStatus} onPaid={setPaid} />)}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-4" aria-label="Daftar pelanggan">
          <SearchBox value={qCust} onChange={setQCust} placeholder="Cari nama, no. HP, atau menu yang dipesan" />
          <p className="mt-2 text-[11px] leading-relaxed text-arang/50">
            Pelanggan dikenali dari nomor HP pada pesanan. Ketuk untuk melihat dan mencari pesanannya.
          </p>
          {shownCustomers.length === 0 ? (
            <p className="py-12 text-center text-sm text-arang/60">{customers.length === 0 ? "Belum ada pelanggan." : "Pelanggan tidak ditemukan."}</p>
          ) : (
            <div className="mt-3 grid items-start gap-3 md:grid-cols-2">
              {shownCustomers.map((c) => <CustomerCard key={c.key} c={c} onStatus={setStatus} onPaid={setPaid} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
