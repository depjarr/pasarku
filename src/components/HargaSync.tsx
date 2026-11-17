"use client";

import { useEffect } from "react";
import { HARGA_TTL, useHarga, type HargaData } from "@/lib/harga";

/** Mengambil harga pangan terbaru (Panel Harga Badan Pangan Nasional) paling lama tiap 6 jam. Tidak menampilkan apa pun. */
export function HargaSync() {
  useEffect(() => {
    const { updatedAt, set } = useHarga.getState();
    if (Date.now() - updatedAt < HARGA_TTL) return;
    const ctrl = new AbortController();
    fetch("/api/harga", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Omit<HargaData, "updatedAt"> | null) => {
        if (d && Object.keys(d.items ?? {}).length > 0) set({ updatedAt: Date.now(), tanggal: d.tanggal, items: d.items });
      })
      .catch(() => {
        // gagal → tetap pakai harga terakhir / harga perkiraan
      });
    return () => ctrl.abort();
  }, []);
  return null;
}
