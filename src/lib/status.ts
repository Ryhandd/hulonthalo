import type { OrderStatus } from "./types";

export const ACTIVE_STATUSES: OrderStatus[] = ["baru", "diproses", "siap"];

export const STATUS_BADGE: Record<OrderStatus, string> = {
  baru: "bg-rempah/25 text-[#8a6410]",
  diproses: "bg-terakota/15 text-terakota-dark",
  siap: "bg-zaitun/15 text-zaitun-dark",
  selesai: "bg-arang/10 text-arang/70",
  dibatalkan: "bg-red-100 text-red-700",
};
