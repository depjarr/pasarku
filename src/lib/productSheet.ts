"use client";

import { create } from "zustand";

/** Produk yang sedang dibuka di lembar detail produk (null = tertutup). */
export const useProductSheet = create<{ id: string | null; open: (id: string) => void; close: () => void }>()((set) => ({
  id: null,
  open: (id) => set({ id }),
  close: () => set({ id: null }),
}));
