"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { rupiah } from "@/lib/format";
import { useCart } from "@/store/cart";

export default function ProductCard({ item }: { item: MenuItem }) {
  const { add, dec, qtyOf } = useCart();
  const qty = qtyOf(item.id);

  return (
    <article className="flex gap-3 rounded-2xl border border-terakota/15 bg-white p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-rempah/20 sm:h-28 sm:w-28">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill sizes="112px" className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-serif text-3xl text-terakota/50" aria-hidden="true">
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-serif text-base font-bold leading-snug text-arang">{item.name}</h3>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-arang/70">{item.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-terakota">{rupiah(item.price)}</span>

          {!item.is_available ? (
            <span className="rounded-full bg-arang/10 px-3 py-1 text-xs font-semibold text-arang/60">Habis</span>
          ) : qty === 0 ? (
            <button
              onClick={() => add(item)}
              className="h-10 rounded-full bg-zaitun px-5 text-sm font-semibold text-krim transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zaitun"
            >
              Tambah
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-zaitun/10 p-1">
              <button onClick={() => dec(item.id)} aria-label={`Kurangi ${item.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold text-zaitun active:scale-95">−</button>
              <span className="w-6 text-center text-sm font-bold" aria-live="polite">{qty}</span>
              <button onClick={() => add(item)} aria-label={`Tambah ${item.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-zaitun text-lg font-bold text-krim active:scale-95">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
