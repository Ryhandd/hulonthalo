"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { CartLine, MenuItem } from "@/lib/types";

type Action =
  | { type: "add"; item: Pick<MenuItem, "id" | "name" | "price"> }
  | { type: "dec"; id: string }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

function reducer(state: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case "hydrate":
      return a.lines;
    case "add": {
      const found = state.find((l) => l.id === a.item.id);
      if (found) return state.map((l) => (l.id === a.item.id ? { ...l, qty: Math.min(l.qty + 1, 50) } : l));
      return [...state, { id: a.item.id, name: a.item.name, price: a.item.price, qty: 1 }];
    }
    case "dec":
      return state.flatMap((l) => (l.id !== a.id ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []));
    case "remove":
      return state.filter((l) => l.id !== a.id);
    case "clear":
      return [];
  }
}

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Pick<MenuItem, "id" | "name" | "price">) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  qtyOf: (id: string) => number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "hulonthalo-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [isOpen, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Muat keranjang dari localStorage setelah mount (hindari mismatch hydration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", lines: JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.qty * l.price, 0),
      isOpen,
      open,
      close,
      add: (item) => dispatch({ type: "add", item }),
      dec: (id) => dispatch({ type: "dec", id }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
    }),
    [lines, isOpen, open, close]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return c;
}
