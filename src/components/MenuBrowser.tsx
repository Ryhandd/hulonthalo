"use client";

import { useMemo, useState } from "react";
import type { Category, MenuItem } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function MenuBrowser({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const [active, setActive] = useState<string>("semua");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (active === "semua" || i.category_id === active) &&
        (!term || i.name.toLowerCase().includes(term))
    );
  }, [items, active, q]);

  const tabs = [{ id: "semua", name: "Semua" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <section aria-label="Daftar menu">
      <div className="sticky top-16 z-20 -mx-4 bg-krim px-4 pb-3 pt-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari menu, misalnya binte"
          aria-label="Cari menu"
          className="h-11 w-full rounded-full border border-terakota/25 bg-white px-5 text-sm outline-none focus:border-terakota focus:ring-2 focus:ring-terakota/20"
        />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
                active === t.id ? "bg-terakota text-krim" : "border border-terakota/25 bg-white text-terakota"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-arang/60">Menu tidak ditemukan. Coba kata kunci lain.</p>
      ) : (
        <div className="grid gap-3 pb-28 md:grid-cols-2">
          {visible.map((i) => (
            <ProductCard key={i.id} item={i} />
          ))}
        </div>
      )}
    </section>
  );
}
