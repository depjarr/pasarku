"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./data";
import { useHydrated } from "./useHydrated";

/** Harga terbaru satu produk dari Panel Harga Badan Pangan Nasional (sudah dikonversi ke kemasan PasarKu). */
export type LivePrice = {
  price: number;
  /** harga komoditas per kg/liter dari panel */
  perUnit: number;
  satuan: string;
  komoditas: string;
  /** perubahan dibanding kemarin, dalam persen (+ naik, − turun) */
  change: number;
};

export type HargaData = { updatedAt: number; tanggal: string; items: Record<string, LivePrice> };

type HargaState = HargaData & { set: (d: HargaData) => void };

/** Disimpan di browser supaya harga tetap tampil saat offline; diperbarui paling lama tiap 6 jam. */
export const useHarga = create<HargaState>()(
  persist(
    (set) => ({ updatedAt: 0, tanggal: "", items: {}, set: (d) => set(d) }),
    { name: "pasarku-harga", partialize: (s) => ({ updatedAt: s.updatedAt, tanggal: s.tanggal, items: s.items }) },
  ),
);

export const HARGA_TTL = 6 * 60 * 60 * 1000;

/** Fungsi harga yang ikut berubah saat harga terbaru datang: harga panel bila ada, selain itu harga perkiraan. */
export function usePriceOf() {
  const hydrated = useHydrated();
  const items = useHarga((s) => s.items);
  return (p: Pick<Product, "id" | "price">) => (hydrated ? items[p.id]?.price : undefined) ?? p.price;
}

/** Info harga terbaru untuk satu produk (undefined = masih harga perkiraan). */
export function useLivePrice(id: string | null | undefined) {
  const hydrated = useHydrated();
  const live = useHarga((s) => (id ? s.items[id] : undefined));
  return hydrated ? live : undefined;
}

/** Harga non-reaktif (dipakai di luar komponen). */
export const priceOf = (p: Pick<Product, "id" | "price">) => useHarga.getState().items[p.id]?.price ?? p.price;
