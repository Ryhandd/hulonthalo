export type Category = { id: string; name: string; slug: string; sort_order: number };

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

export type CartLine = { id: string; name: string; price: number; qty: number };

export type OrderStatus = "baru" | "diproses" | "siap" | "selesai" | "dibatalkan";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  baru: "Pesanan diterima",
  diproses: "Sedang dimasak",
  siap: "Siap diambil",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

import type { OrderType, PayMethod, PayStatus } from "./checkout";

export type OrderDetail = {
  id: string;
  status: OrderStatus;
  total: number;
  customer_name: string;
  created_at: string;
  order_type: OrderType;
  table_no: string | null;
  payment_method: PayMethod;
  payment_status: PayStatus;
  has_proof: boolean;
  items: { name: string; price: number; qty: number }[];
};
