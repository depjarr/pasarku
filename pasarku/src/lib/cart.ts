"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productById, type Product } from "./data";

type CartState = {
  items: Record<string, number>; // productId -> qty
  drawerOpen: boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setDrawer: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      drawerOpen: false,
      add: (id) => set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + 1 } })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.items };
          if ((next[id] ?? 0) <= 1) delete next[id];
          else next[id] -= 1;
          return { items: next };
        }),
      clear: () => set({ items: {} }),
      setDrawer: (open) => set({ drawerOpen: open }),
    }),
    { name: "pasarku-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

export type CartLine = Product & { qty: number; subtotal: number };

export function useCartLines() {
  const items = useCart((s) => s.items);
  const lines: CartLine[] = Object.entries(items)
    .filter(([id]) => productById[id])
    .map(([id, qty]) => ({ ...productById[id], qty, subtotal: productById[id].price * qty }));
  const total = lines.reduce((a, l) => a + l.subtotal, 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  return { lines, total, count };
}
