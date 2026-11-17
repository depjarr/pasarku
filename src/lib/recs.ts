"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recommendation } from "./schema";

export type Goal = "seimbang" | "diet" | "otot" | "keluarga";

export const goals: { id: Goal; label: string; desc: string }[] = [
  { id: "seimbang", label: "Gizi seimbang", desc: "Porsi lengkap untuk orang dewasa sehat" },
  { id: "diet", label: "Turun berat badan", desc: "Rendah kalori, tinggi serat" },
  { id: "otot", label: "Tinggi protein", desc: "Untuk membentuk otot" },
  { id: "keluarga", label: "Ramah anak & keluarga", desc: "Tidak pedas, mudah dikunyah" },
];

type RecsState = {
  orang: number;
  tujuan: Goal;
  setOrang: (n: number) => void;
  setTujuan: (g: Goal) => void;
  /** hasil AI terakhir + "sidik jari" keranjang & preferensi saat diminta */
  result: { key: string; data: Recommendation } | null;
  setResult: (r: { key: string; data: Recommendation } | null) => void;
};

/** Preferensi menu & hasil rekomendasi terakhir (agar halaman resep tidak perlu memanggil AI lagi). */
export const useRecs = create<RecsState>()(
  persist(
    (set) => ({
      orang: 2,
      tujuan: "seimbang",
      setOrang: (orang) => set({ orang }),
      setTujuan: (tujuan) => set({ tujuan }),
      result: null,
      setResult: (result) => set({ result }),
    }),
    { name: "pasarku-ai" },
  ),
);

export const recKey = (items: Record<string, number>, orang: number, tujuan: string) =>
  JSON.stringify([Object.entries(items).sort(), orang, tujuan]);
