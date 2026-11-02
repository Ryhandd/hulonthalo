"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";

const I = {
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
};

const TABS = [
  {
    href: "/", label: "Menu", match: (p: string) => p === "/",
    icon: <svg {...I}><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-6h4v6" /></svg>,
  },
  {
    href: "/keranjang", label: "Keranjang", match: (p: string) => p.startsWith("/keranjang"),
    icon: <svg {...I}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 016 0" /></svg>,
  },
  {
    href: "/pesanan", label: "Pesanan", match: (p: string) => p.startsWith("/pesanan"),
    icon: <svg {...I}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5" /><path d="M12 12v9" /></svg>,
  },
  {
    href: "/info", label: "Info", match: (p: string) => p.startsWith("/info"),
    icon: <svg {...I}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>,
  },
];

export default function BottomNav() {
  const path = usePathname();
  const { count } = useCart();
  if (path.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-terakota/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(43,33,27,0.06)] backdrop-blur"
    >
      <ul className="mx-auto grid h-16 max-w-5xl grid-cols-4">
        {TABS.map((t) => {
          const active = t.match(path);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-terakota" : "text-arang/50"
                }`}
              >
                <span className={`relative grid h-8 w-14 place-items-center rounded-full transition-colors ${active ? "bg-terakota/10" : ""}`}>
                  {t.icon}
                  {t.href === "/keranjang" && count > 0 && (
                    <span className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-terakota px-1 text-[10px] font-bold text-krim">
                      {count}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] ${active ? "font-bold" : "font-medium"}`}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
