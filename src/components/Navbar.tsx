"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { INFO, isOpenNow } from "@/lib/info";
import { useAuth } from "@/lib/useAuth";
import { adminSupabase } from "@/lib/adminClient";

// Sesi ADMIN (klien terisolasi). undefined = memuat, null = belum login admin.
function useAdminEmail(active: boolean): string | null | undefined {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    adminSupabase.auth.getSession().then(({ data }) => alive && setEmail(data.session?.user.email ?? null));
    const { data: sub } = adminSupabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [active]);
  return email;
}

export default function Navbar() {
  const path = usePathname();
  const isAdminPage = path.startsWith("/admin");
  const [open, setOpen] = useState<boolean | null>(null);
  const account = useAuth(); // sesi pelanggan: dipakai di halaman publik saja
  const adminEmail = useAdminEmail(isAdminPage); // sesi admin: dipakai di /admin saja

  useEffect(() => {
    const update = () => setOpen(isOpenNow());
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-terakota/10 bg-krim/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2" aria-label="Beranda Rumah Makan Hulonthalo">
          <span className="inline-block transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110"><Logo size={30} /></span>
          <span className="font-serif text-lg font-bold text-terakota transition-colors duration-200 group-hover:text-terakota-dark">Hulonthalo</span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdminPage ? (
            adminEmail !== undefined && (
              <span className="flex h-8 max-w-[200px] items-center gap-1.5 rounded-full bg-zaitun px-3 text-xs font-semibold text-white" title={adminEmail ?? undefined}>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Admin</span>
                <span className="truncate">{adminEmail ?? "Belum masuk"}</span>
              </span>
            )
          ) : (
            <>
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
              {account !== undefined && (
                <Link href="/info" className="flex h-8 items-center rounded-full bg-terakota px-3 text-xs font-semibold text-krim transition hover:bg-terakota-dark active:scale-95">
                  {account ? (account.name.split(" ")[0] || "Akun") : "Masuk / Daftar"}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
