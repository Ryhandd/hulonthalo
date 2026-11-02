"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useCart } from "@/store/cart";

export default function Navbar() {
  const { count, open } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-terakota/15 bg-krim/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Beranda Rumah Makan Hulonthalo">
          <Logo />
          <span className="font-serif text-lg font-bold leading-none text-terakota">
            Hulonthalo
            <span className="mt-0.5 block font-sans text-[10px] font-medium tracking-wide text-zaitun">
              Rumah Makan Gorontalo
            </span>
          </span>
        </Link>

        <button
          onClick={open}
          className="relative flex h-11 items-center gap-2 rounded-full bg-terakota px-4 text-sm font-semibold text-krim transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rempah"
          aria-label={`Buka keranjang, ${count} item`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 7h12l-1 12H7L6 7z" />
            <path d="M9 7a3 3 0 016 0" />
          </svg>
          Keranjang
          {count > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rempah px-1 text-xs font-bold text-arang">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
