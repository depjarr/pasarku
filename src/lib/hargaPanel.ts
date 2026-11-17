/**
 * Panel Harga Badan Pangan Nasional → harga produk PasarKu.
 * Dipakai di server (/api/harga) dan di browser (cadangan bila server diblokir).
 * Harga panel per kg/liter dikonversi ke kemasan PasarKu lalu dibulatkan ke Rp 500 terdekat.
 */

export const PANEL_URL =
  "https://api-panelhargav2.badanpangan.go.id/api/front/harga-pangan-informasi?province_id=&city_id=&level_harga_id=3";

/** productId PasarKu → id komoditas panel + jumlah kg/liter dalam satu kemasan PasarKu */
const MAP: Record<string, { komoditas: number; qty: number }> = {
  beras: { komoditas: 27, qty: 5 }, // Beras Premium, 5 kg
  "bawang-merah": { komoditas: 30, qty: 0.25 },
  "bawang-putih": { komoditas: 31, qty: 0.25 }, // Bawang Putih Bonggol
  "cabai-merah": { komoditas: 32, qty: 0.25 }, // Cabai Merah Keriting
  "sapi-potong": { komoditas: 34, qty: 0.5 }, // Daging Sapi Murni
  "ayam-utuh": { komoditas: 35, qty: 1 }, // Daging Ayam Ras, ±1 kg
  "telur-ayam": { komoditas: 36, qty: 0.6 }, // 10 butir ≈ 0,6 kg
  "gula-pasir": { komoditas: 37, qty: 1 },
  "minyak-goreng": { komoditas: 38, qty: 1 }, // Minyak Goreng Kemasan, 1 L
  tepung: { komoditas: 108, qty: 1 }, // Tepung Terigu Kemasan
  kembung: { komoditas: 104, qty: 0.5 },
  tongkol: { komoditas: 105, qty: 0.5 },
  bandeng: { komoditas: 106, qty: 1 },
  garam: { komoditas: 107, qty: 0.5 },
};

type PanelItem = { id: number; name: string; satuan: string; today: number; gap_percentage?: number; gap_change?: string };
export type PanelPrice = { price: number; perUnit: number; satuan: string; komoditas: string; change: number };

const round500 = (n: number) => Math.max(500, Math.round(n / 500) * 500);

/** Ambil data panel lalu ubah ke harga per produk PasarKu. Melempar error bila gagal / data kosong. */
export async function fetchPanelPrices(signal?: AbortSignal): Promise<Record<string, PanelPrice>> {
  const r = await fetch(PANEL_URL, { headers: { Accept: "application/json" }, signal, cache: "no-store" });
  if (!r.ok) throw new Error(`panel ${r.status}`);
  const json = (await r.json()) as { data?: PanelItem[] };
  const byId = new Map((json.data ?? []).map((x) => [x.id, x]));

  const items: Record<string, PanelPrice> = {};
  for (const [productId, m] of Object.entries(MAP)) {
    const k = byId.get(m.komoditas);
    if (!k || !(k.today > 0)) continue;
    const pct = Number(k.gap_percentage ?? 0);
    items[productId] = {
      price: round500(k.today * m.qty),
      perUnit: k.today,
      satuan: /liter/i.test(k.satuan) ? "liter" : "kg",
      komoditas: k.name,
      change: k.gap_change === "down" ? -Math.abs(pct) : Math.abs(pct),
    };
  }
  if (Object.keys(items).length === 0) throw new Error("data kosong");
  return items;
}
