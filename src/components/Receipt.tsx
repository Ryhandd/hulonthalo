"use client";

import { createPortal } from "react-dom";
import Logo from "./Logo";
import { INFO } from "@/lib/info";
import { rupiah } from "@/lib/format";
import { ORDER_TYPE_LABEL, PAY_LABEL, type OrderType, type PayMethod, type PayStatus } from "@/lib/checkout";

export type ReceiptOrder = {
  id: string;
  customer_name: string;
  created_at: string;
  total: number;
  order_type?: OrderType;
  table_no?: string | null;
  payment_method?: PayMethod;
  payment_status?: PayStatus;
  order_items: { name: string; qty: number; price?: number }[];
};

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso)) + " WITA";

const Row = ({ l, r, bold }: { l: React.ReactNode; r: React.ReactNode; bold?: boolean }) => (
  <div className={`flex justify-between gap-3 ${bold ? "font-bold" : ""}`}><span>{l}</span><span className="text-right">{r}</span></div>
);
const Rule = () => <div className="my-2 border-t border-dashed border-black/60" />;

// Struk 80 mm. Hanya area ".receipt-portal" yang tercetak (lihat @media print di globals.css).
export default function Receipt({ o, onClose }: { o: ReceiptOrder; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  const type = o.order_type ?? "takeaway";
  const method = o.payment_method ?? "cash";
  const paid = o.payment_status === "lunas";
  const sum = o.order_items.reduce((a, i) => a + (i.price ?? 0) * i.qty, 0);
  const total = o.total || sum;

  return createPortal(
    <div className="receipt-portal fixed inset-0 z-[60] overflow-y-auto bg-arang/60 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Struk pesanan">
      <div className="mx-auto w-full max-w-[340px]" onClick={(e) => e.stopPropagation()}>
        <div className="no-print mb-3 flex gap-2">
          <button onClick={() => window.print()} className="h-11 flex-1 rounded-full bg-terakota text-sm font-semibold text-krim shadow-md transition hover:bg-terakota-dark active:scale-95">Cetak</button>
          <button onClick={onClose} className="h-11 flex-1 rounded-full bg-white text-sm font-semibold text-terakota shadow-md transition hover:bg-krim active:scale-95">Tutup</button>
        </div>

        <div className="receipt-sheet bg-white p-4 font-mono text-[12px] leading-snug text-black shadow-xl">
          <div className="flex flex-col items-center text-center">
            <Logo size={44} />
            <p className="mt-1 text-sm font-bold uppercase">{INFO.name}</p>
            <p className="text-[11px]">{INFO.address}</p>
          </div>
          <Rule />
          <Row l="No. Pesanan" r={`#${o.id.slice(-6).toUpperCase()}`} />
          <Row l="Tanggal" r={fmt(o.created_at)} />
          <Row l="Pelanggan" r={o.customer_name} />
          <Row l="Layanan" r={ORDER_TYPE_LABEL[type]} />
          {type === "dinein" && o.table_no && <Row l="Meja" r={o.table_no} />}
          <Rule />
          {o.order_items.map((i, k) => (
            <div key={k} className="mb-1.5">
              <p className="break-words">{i.name}</p>
              <Row l={`${i.qty} x ${rupiah(i.price ?? 0)}`} r={rupiah((i.price ?? 0) * i.qty)} />
            </div>
          ))}
          <Rule />
          <Row l="Subtotal" r={rupiah(sum || total)} />
          <Row l="TOTAL" r={rupiah(total)} bold />
          <Rule />
          <Row l="Pembayaran" r={PAY_LABEL[method]} />
          <Row l="Status" r={paid ? "LUNAS" : method === "cash" ? "BAYAR DI KASIR" : "BELUM BAYAR"} bold />
          <Rule />
          <p className="text-center text-[11px]">Terima kasih atas kunjungan Anda</p>
          <p className="text-center text-[11px]">Kuliner tradisional khas Gorontalo</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
