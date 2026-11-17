/**
 * Harga pangan terbaru dari Panel Harga Badan Pangan Nasional (rata-rata nasional, tingkat konsumen).
 * GET /api/harga → { tanggal, sumber, items: { [productId]: { price, perUnit, satuan, komoditas, change } } }
 *
 * Disimpan di memori server & CDN selama 6 jam supaya tidak membebani server pemerintah.
 * Bila server ini tidak bisa menjangkau panel (mis. diblokir dari luar Indonesia), browser
 * mengambil langsung dari panel sebagai cadangan (lihat components/HargaSync.tsx).
 */
import { fetchPanelPrices } from "@/lib/hargaPanel";

// lebih dekat ke Indonesia bila region bisa dipilih
export const preferredRegion = "sin1";

let cache: { at: number; body: unknown } | null = null;
const TTL = 6 * 60 * 60 * 1000;
const headers = { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" };

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) return Response.json(cache.body, { headers });

  try {
    const items = await fetchPanelPrices(AbortSignal.timeout(12_000));
    const body = { tanggal: new Date().toISOString(), sumber: "Panel Harga Badan Pangan Nasional", items };
    cache = { at: Date.now(), body };
    return Response.json(body, { headers });
  } catch (err) {
    console.warn("[harga] gagal mengambil panel harga:", err instanceof Error ? err.message : err);
    if (cache) return Response.json(cache.body, { headers });
    // tanpa cache CDN, supaya percobaan berikutnya tidak tertahan jawaban gagal
    return Response.json({ tanggal: "", sumber: "", items: {} }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
