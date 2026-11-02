"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { INFO, isOpenNow } from "@/lib/info";
import { loadProfile, saveProfile } from "@/lib/profile";

const field =
  "h-12 w-full rounded-2xl bg-krim px-4 text-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40";
const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-terakota/10";

export default function InfoPage() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOpen(isOpenNow());
    const p = loadProfile();
    setName(p.name);
    setPhone(p.phone);
  }, []);

  const wa = process.env.NEXT_PUBLIC_WA_NUMBER;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(INFO.address)}`;

  return (
    <div className="mx-auto max-w-xl space-y-4 pt-5">
      <section className="relative overflow-hidden rounded-3xl bg-terakota p-5 text-krim shadow-md">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-rempah/25" aria-hidden="true" />
        <div className="relative flex items-center gap-4">
          <div className="shrink-0 rounded-full bg-krim p-3"><Logo size={48} /></div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{INFO.name}</h1>
            <p className="mt-0.5 text-xs text-krim/85">{INFO.tagline}</p>
            {open !== null && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-krim/20 px-3 py-1 text-xs font-semibold">
                <span className={`h-2 w-2 rounded-full ${open ? "bg-green-300" : "bg-krim/50"}`} />
                {open ? "Buka sekarang" : "Sedang tutup"}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className={card}>
        <p className="text-sm leading-relaxed text-arang/80">{INFO.about}</p>
        <ul className="mt-3 space-y-2">
          {INFO.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rempah" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Jam operasional</h2>
        <ul className="mt-2 divide-y divide-terakota/10">
          {INFO.hours.map((h) => (
            <li key={h.label} className="flex justify-between py-2.5 text-sm">
              <span className="text-arang/70">{h.label}</span>
              <span className="font-semibold">{h.time}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Alamat</h2>
        <p className="mt-1 text-sm text-arang/75">{INFO.address}</p>
        <div className="mt-4 flex gap-2">
          <a href={maps} target="_blank" rel="noopener noreferrer" className="flex h-11 flex-1 items-center justify-center rounded-full bg-zaitun text-sm font-semibold text-krim shadow-sm transition hover:-translate-y-0.5 hover:bg-zaitun-dark hover:shadow-md active:scale-95">
            Buka peta
          </a>
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex h-11 flex-1 items-center justify-center rounded-full bg-white text-sm font-semibold text-zaitun-dark ring-1 ring-zaitun/40 transition hover:-translate-y-0.5 hover:bg-zaitun/10 hover:shadow-md active:scale-95">
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Profil Anda</h2>
        <p className="mt-1 text-xs text-arang/55">Tersimpan di perangkat ini dan terisi otomatis saat memesan.</p>
        <div className="mt-3 space-y-3">
          <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} placeholder="Nama" autoComplete="name" className={field} />
          <input value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} placeholder="Nomor WhatsApp" inputMode="tel" autoComplete="tel" className={field} />
          <button
            onClick={() => { saveProfile({ name: name.trim(), phone: phone.trim() }); setSaved(true); }}
            className="h-12 w-full rounded-full bg-terakota text-sm font-semibold text-krim shadow-sm transition hover:bg-terakota-dark hover:shadow-md active:scale-[.98]"
          >
            {saved ? "Tersimpan" : "Simpan profil"}
          </button>
        </div>
      </section>

      <p className="pb-2 text-center">
        <Link href="/admin" className="text-xs text-arang/45 underline transition-colors hover:text-terakota">Masuk admin</Link>
      </p>
    </div>
  );
}
