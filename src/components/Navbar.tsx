"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { INFO, isOpenNow } from "@/lib/info";

export default function Navbar() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpenNow());
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-terakota/10 bg-krim/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Beranda Rumah Makan Hulonthalo">
          <Logo size={30} />
          <span className="font-serif text-lg font-bold text-terakota">Hulonthalo</span>
        </Link>

        {open !== null && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              open ? "bg-zaitun/15 text-zaitun-dark" : "bg-arang/10 text-arang/60"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${open ? "bg-zaitun" : "bg-arang/40"}`} />
            {open ? "Buka" : `Tutup, buka ${String(INFO.openHour).padStart(2, "0")}.00`}
          </span>
        )}
      </div>
    </header>
  );
}
