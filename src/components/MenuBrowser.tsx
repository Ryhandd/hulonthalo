"use client";

import { useMemo, useState } from "react";
import type { Category, MenuItem } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function MenuBrowser({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const [active, setActive] = useState<string>("semua");
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    return categories
      .filter((c) => active === "semua" || c.id === active)
      .map((c) => ({
        category: c,
        items: items.filter(
          (i) => i.category_id === c.id && (!term || i.name.toLowerCase().includes(term))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, items, active, q]);

  const chips = [{ id: "semua", name: "Semua" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <section aria-label="Daftar menu">
      <div className="relative mt-5">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-arang/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari menu, misalnya binte"
          aria-label="Cari menu"
          className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-sm shadow-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40"
        />
      </div>

      <div className="sticky top-14 z-20 -mx-4 mt-3 bg-krim/95 px-4 py-2 backdrop-blur">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Kategori menu">
          {chips.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={active === c.id}
              onClick={() => setActive(c.id)}
              className={`h-10 shrink-0 rounded-full px-5 text-sm font-semibold transition ${
                active === c.id
                  ? "bg-terakota text-krim shadow-sm"
                  : "bg-white text-terakota ring-1 ring-terakota/20"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-arang/60">Menu tidak ditemukan. Coba kata kunci lain.</p>
      ) : (
        <div className="space-y-6 pb-6 pt-2">
          {groups.map((g) => (
            <div key={g.category.id}>
              <h2 className="mb-3 text-xl font-bold text-terakota">{g.category.name}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {g.items.map((i) => (
                  <ProductCard key={i.id} item={i} slug={g.category.slug} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
