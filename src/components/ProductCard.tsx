"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { rupiah } from "@/lib/format";
import { useCart } from "@/store/cart";
import CategoryIcon from "./CategoryIcon";
import { fotoMenu } from "@/lib/menuImages";

export default function ProductCard({ item, slug }: { item: MenuItem; slug?: string }) {
  const { add, dec, qtyOf } = useCart();
  const qty = qtyOf(item.id);
  const soldOut = !item.is_available;
  const foto = fotoMenu(item.name, item.image_url);

  return (
    <article className={`group flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terakota/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:ring-terakota/30 ${soldOut ? "opacity-70" : ""}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-serif text-[15px] font-bold leading-snug text-arang transition-colors duration-200 group-hover:text-terakota">{item.name}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-arang/60">{item.description}</p>
        )}
        <p className="mt-auto origin-left pt-3 text-sm font-bold text-terakota transition-transform duration-200 group-hover:scale-110">{rupiah(item.price)}</p>
      </div>

      <div className="relative w-28 shrink-0 pb-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-rempah/30 to-terakota/15">
          {foto ? (
            <>
              <Image src={foto} alt={item.name} fill sizes="112px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-arang/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
            </>
          ) : (
            <div className="grid h-full w-full place-items-center text-terakota/55 transition-transform duration-300 group-hover:scale-110 group-hover:text-terakota/80">
              <CategoryIcon slug={slug} />
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          {soldOut ? (
            <span className="rounded-full bg-arang/80 px-3 py-1.5 text-xs font-semibold text-krim shadow-md">Habis</span>
          ) : qty === 0 ? (
            <button
              onClick={() => add(item)}
              aria-label={`Tambah ${item.name}`}
              className="flex h-9 items-center gap-1 rounded-full bg-zaitun px-4 text-sm font-semibold text-krim shadow-md transition duration-150 hover:-translate-y-0.5 hover:bg-zaitun-dark hover:shadow-lg active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zaitun"
            >
              <span className="text-lg leading-none">+</span> Tambah
            </button>
          ) : (
            <div className="flex h-9 items-center gap-0.5 rounded-full bg-white p-1 shadow-md ring-1 ring-zaitun/30">
              <button onClick={() => dec(item.id)} aria-label={`Kurangi ${item.name}`} className="grid h-7 w-7 place-items-center rounded-full text-lg font-bold text-zaitun transition hover:bg-zaitun/15 active:bg-zaitun/10">−</button>
              <span key={qty} className="inline-block w-6 animate-pop text-center text-sm font-bold" aria-live="polite">{qty}</span>
              <button onClick={() => add(item)} aria-label={`Tambah ${item.name}`} className="grid h-7 w-7 place-items-center rounded-full bg-zaitun text-lg font-bold text-krim transition hover:bg-zaitun-dark hover:scale-110 active:scale-95">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
