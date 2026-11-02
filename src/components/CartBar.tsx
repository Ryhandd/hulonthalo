"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { rupiah } from "@/lib/format";

// Bilah ringkas di atas navigasi bawah, hanya di halaman Menu
export default function CartBar() {
  const { count, total } = useCart();
  const path = usePathname();
  if (path !== "/" || count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 animate-bar-in px-4 pb-3">
      <Link
        href="/keranjang"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl bg-zaitun px-5 text-krim shadow-md transition active:scale-[.98]"
      >
        <span className="text-sm font-semibold">{count} item di keranjang</span>
        <span className="font-serif text-base font-bold">{rupiah(total)}</span>
      </Link>
    </div>
  );
}
