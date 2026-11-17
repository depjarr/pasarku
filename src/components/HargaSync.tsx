"use client";

import { useEffect } from "react";
import { HARGA_TTL, useHarga, type LivePrice } from "@/lib/harga";
import { fetchPanelPrices } from "@/lib/hargaPanel";

/**
 * Mengambil harga pangan terbaru (Panel Harga Badan Pangan Nasional) paling lama tiap 6 jam.
 * Urutan: lewat server PasarKu (tersimpan di CDN) → bila gagal, langsung dari panel di browser.
 * Tidak menampilkan apa pun; bila semuanya gagal, harga terakhir / harga perkiraan tetap dipakai.
 */
export function HargaSync() {
  useEffect(() => {
    const { updatedAt, set } = useHarga.getState();
    if (Date.now() - updatedAt < HARGA_TTL) return;
    const ctrl = new AbortController();

    const save = (items: Record<string, LivePrice>, tanggal = new Date().toISOString()) => {
      if (Object.keys(items).length > 0) set({ updatedAt: Date.now(), tanggal, items });
    };

    (async () => {
      try {
        const r = await fetch("/api/harga", { signal: ctrl.signal });
        const d = (await r.json()) as { tanggal?: string; items?: Record<string, LivePrice> };
        if (r.ok && d.items && Object.keys(d.items).length > 0) return save(d.items, d.tanggal);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
      try {
        save(await fetchPanelPrices(AbortSignal.any([ctrl.signal, AbortSignal.timeout(12_000)])));
      } catch {
        // panel juga tidak terjangkau → tetap pakai harga yang ada
      }
    })();

    return () => ctrl.abort();
  }, []);
  return null;
}
