"use client";

import { create } from "zustand";

export type Flight = { key: number; img: string; from: { x: number; y: number; w: number; h: number } };

/** Item yang sedang "terbang" dari rak ke keranjang. */
export const useFly = create<{
  flights: Flight[];
  launch: (img: string, rect: DOMRect) => void;
  done: (key: number) => void;
}>()((set) => ({
  flights: [],
  launch: (img, r) =>
    set((s) => ({ flights: [...s.flights, { key: Date.now() + Math.random(), img, from: { x: r.left, y: r.top, w: r.width, h: r.height } }] })),
  done: (key) => set((s) => ({ flights: s.flights.filter((f) => f.key !== key) })),
}));
