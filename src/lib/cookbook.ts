"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal } from "./recs";
import type { Menu, Recommendation } from "./schema";

export type SavedMenu = Menu & { detailOk?: boolean };

export type SavedRecipe = {
  id: string;
  /** asal resep: kunci keranjang + nomor menu — mencegah resep yang sama tersimpan dua kali */
  src: string;
  savedAt: number;
  orang: number;
  tujuan: Goal;
  menu: SavedMenu;
};

/** Susun rantang: tiap susun = satu waktu makan. Urut dari atas ke bawah. */
export const TIERS = [
  { id: "Sarapan", label: "Sarapan", color: "#f2a93b", lid: "#ffd27a" },
  { id: "Makan Siang", label: "Makan siang", color: "#e2553f", lid: "#ff8b6e" },
  { id: "Makan Malam", label: "Makan malam", color: "#2f8f4e", lid: "#5cc178" },
  { id: "Camilan", label: "Camilan", color: "#3a7bd5", lid: "#7fb0f0" },
] as const;
export type TierId = (typeof TIERS)[number]["id"];

const MAX = 80;

type CookbookState = {
  items: SavedRecipe[];
  /** simpan semua menu dari satu hasil rekomendasi */
  addFromRecommendation: (key: string, data: Recommendation, orang: number, tujuan: Goal) => void;
  /** perbarui isi resep (mis. setelah resep detail selesai dibuat) */
  updateMenu: (match: { id?: string; src?: string }, menu: SavedMenu) => void;
  remove: (id: string) => void;
};

/** Rantang Resep: koleksi semua resep yang pernah diracik AI dari keranjang. Tersimpan di browser. */
export const useCookbook = create<CookbookState>()(
  persist(
    (set) => ({
      items: [],
      addFromRecommendation: (key, data, orang, tujuan) =>
        set((s) => {
          const now = Date.now();
          const fresh = data.menus
            .map((menu, i) => ({ id: `${now.toString(36)}-${i}`, src: `${key}#${i}`, savedAt: now, orang, tujuan, menu }))
            .filter((r) => !s.items.some((x) => x.src === r.src));
          return { items: [...fresh, ...s.items].slice(0, MAX) };
        }),
      updateMenu: (match, menu) =>
        set((s) => ({
          items: s.items.map((x) => ((match.id && x.id === match.id) || (match.src && x.src === match.src) ? { ...x, menu } : x)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
    }),
    { name: "pasarku-resep" },
  ),
);

export const tierOf = (m: Menu): TierId => (TIERS.some((t) => t.id === m.waktuMakan) ? (m.waktuMakan as TierId) : "Makan Siang");
