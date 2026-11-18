"use client";

import { useEffect } from "react";
import { HARGA_TTL, useHarga, type LivePrice } from "@/lib/harga";
import { fetchPanelPrices } from "@/lib/hargaPanel";

/**
 * Mengambil harga pangan terbaru (Panel Harga Badan Pangan Nasional) paling lama tiap 6 jam.
 * Urutan: langsung dari panel di browser (cepat, dan panel bisa diakses dari Indonesia)
 * → bila gagal, lewat server PasarKu (/api/harga).
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
        return save(await fetchPanelPrices(AbortSignal.any([ctrl.signal, AbortSignal.timeout(8_000)])));
      } catch (e) {
        if (ctrl.signal.aborted) return;
        console.warn("[harga] panel tidak terjangkau dari browser:", (e as Error).message);
      }
      try {
        const r = await fetch("/api/harga", { signal: ctrl.signal });
        const d = (await r.json()) as { tanggal?: string; items?: Record<string, LivePrice> };
        if (r.ok && d.items) save(d.items, d.tanggal);
      } catch {
        // server juga gagal → tetap pakai harga yang ada
      }
    })();

    return () => ctrl.abort();
  }, []);
  return null;
}
