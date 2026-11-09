// Konstanta layanan & pembayaran. GANTI nomor rekening / atas nama dengan data asli.
export type OrderType = "dinein" | "takeaway";
export type PayMethod = "qris" | "bank_bca" | "bank_mandiri" | "bank_bni" | "bank_bri" | "cash";
export type PayStatus = "belum_bayar" | "lunas";

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  dinein: "Dine-in",
  takeaway: "Take-away",
};

export const BANKS: { id: PayMethod; name: string; account: string }[] = [
  { id: "bank_bca", name: "BCA", account: "1234567890" }, // (ubah)
  { id: "bank_mandiri", name: "Mandiri", account: "1230004567890" }, // (ubah)
  { id: "bank_bni", name: "BNI", account: "0123456789" }, // (ubah)
  { id: "bank_bri", name: "BRI", account: "012301004567891" }, // (ubah)
];
export const ACCOUNT_HOLDER = "Rumah Makan Hulonthalo"; // (ubah)

export const PAY_LABEL: Record<PayMethod, string> = {
  qris: "QRIS",
  bank_bca: "Transfer BCA",
  bank_mandiri: "Transfer Mandiri",
  bank_bni: "Transfer BNI",
  bank_bri: "Transfer BRI",
  cash: "Tunai / Cash",
};
