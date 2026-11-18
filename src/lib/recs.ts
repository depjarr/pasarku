"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TOOLS, type ToolId } from "./alat";
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
  /** alat masak yang dimiliki user — menu hanya memakai alat ini */
  alat: ToolId[];
  setAlat: (a: ToolId[]) => void;
  /** hasil AI terakhir + "sidik jari" keranjang & preferensi saat diminta */
  result: { key: string; data: Recommendation } | null;
  setResult: (r: { key: string; data: Recommendation } | null) => void;
  /** kunci hasil yang bahannya sudah "dipakai" (keranjang sudah dikosongkan) — agar tidak dikosongkan dua kali */
  consumedKey: string | null;
  setConsumedKey: (k: string | null) => void;
};

/** Preferensi menu & hasil rekomendasi terakhir (agar halaman resep tidak perlu memanggil AI lagi). */
export const useRecs = create<RecsState>()(
  persist(
    (set) => ({
      orang: 2,
      tujuan: "seimbang",
      setOrang: (orang) => set({ orang }),
      setTujuan: (tujuan) => set({ tujuan }),
      alat: DEFAULT_TOOLS,
      setAlat: (alat) => set({ alat }),
      result: null,
      setResult: (result) => set({ result }),
      consumedKey: null,
      setConsumedKey: (consumedKey) => set({ consumedKey }),
    }),
    { name: "pasarku-ai" },
  ),
);

export const recKey = (items: Record<string, number>, orang: number, tujuan: string, alat: string[] = []) =>
  JSON.stringify([Object.entries(items).sort(), orang, tujuan, [...alat].sort()]);
