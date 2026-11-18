import { productById } from "./data";
import type { Recommendation } from "./schema";

/**
 * Pembersihan hasil AI sebelum dikirim ke tampilan. AI kadang tidak konsisten, jadi server
 * membereskan kesalahan yang mudah dikenali:
 *  - bahan berjumlah 0 / "habis terpakai" dibuang dari daftar bahan
 *  - foto bahan di langkah hanya untuk bahan yang memang ada di daftar bahan menu itu
 *  - label "Vegan"/"Vegetarian" dihapus kalau masakannya memakai bahan hewani
 */

const ZERO_AMOUNT =
  /^\s*0+([.,]0+)?\s*(g|gr|gram|kg|ml|l|liter|buah|butir|siung|ekor|potong|lembar|sdm|sdt|batang|ikat|bungkus|papan)?\.?\s*$/i;
/** bumbu dapur dasar yang dianggap selalu ada di rumah (boleh dipakai walau tidak dibeli) */
const PANTRY = new Set(["garam", "gula-pasir", "minyak-goreng", "merica", "air"]);
const ANIMAL_SECTIONS = new Set(["daging", "ikan"]);
const ANIMAL_PRODUCTS = new Set(["telur-ayam", "telur-puyuh", "telur-asin", "susu", "susu-full", "keju", "parmesan", "mentega", "madu", "skm", "whipping-cream", "cream-cheese", "cokelat-putih", "karamel", "biskuit", "susu-bubuk", "yogurt", "es-krim", "butter-tawar", "butter-asin"]);
const ANIMAL_WORDS = /\b(ikan|ayam|daging|sapi|kambing|domba|bebek|udang|cumi|kerang|tiram|teri|ebi|terasi|telur|susu|keju|mentega|madu|kaldu ayam|kaldu sapi)\b/i;

export function sanitizeRecommendation(r: Recommendation): Recommendation {
  for (const m of r.menus) {
    const resep = m.resep;

    // 1) buang bahan berjumlah 0 atau "habis"
    for (const g of resep.kelompokBahan) {
      g.bahan = g.bahan.filter((b) => !ZERO_AMOUNT.test(b.jumlah) && !/habis/i.test(`${b.jumlah} ${b.persiapan ?? ""}`));
    }
    resep.kelompokBahan = resep.kelompokBahan.filter((g) => g.bahan.length > 0);

    // 2) bahan terkait di tiap langkah hanya yang benar-benar ada di daftar bahan
    const used = new Set(resep.kelompokBahan.flatMap((g) => g.bahan.map((b) => b.productId)).filter((id): id is string => !!id && !!productById[id]));
    for (const t of resep.tahapan) {
      for (const s of t.langkah) s.bahanTerkait = s.bahanTerkait.filter((id) => used.has(id));
    }

    // 3) label vegan/vegetarian harus akurat
    const hasAnimal =
      [...used].some((id) => ANIMAL_SECTIONS.has(productById[id].sectionId) || ANIMAL_PRODUCTS.has(id)) ||
      resep.kelompokBahan.some((g) => g.bahan.some((b) => ANIMAL_WORDS.test(b.nama)));
    if (hasAnimal) m.label = m.label.filter((l) => !/vegan|vegetarian/i.test(l));
  }
  return r;
}

// kata umum yang tidak dipakai untuk mencocokkan nama menu dengan bahan
const GENERIC = new Set(["ikan", "daging", "segar", "merah", "putih", "hijau", "kuning", "brebes", "negeri", "fillet", "utuh", "manis", "besar", "kecil", "kering", "bubuk", "butir", "potong", "kampung", "dieng", "cilembu", "pandan", "wangi", "madu", "subang", "medan", "mentega", "harum", "bawang", "kacang", "daun", "jamur", "telur", "susu", "minyak", "beras", "roti", "keju"]);

/**
 * Cek kesalahan yang tidak bisa dibersihkan otomatis — dipakai untuk meminta AI memperbaiki jawabannya.
 * Mengembalikan daftar masalah dalam bahasa Indonesia (kosong = lolos).
 */
/** "300 g" → 300, "1 kg" → 1000, "250 ml" → 250, "2 L" → 2000; selain berat/volume → null */
export function toGrams(text: string): number | null {
  const m = text.toLowerCase().replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(kg|gram|gr|g|ml|liter|l)\b/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === "kg" || m[2] === "liter" || m[2] === "l" ? n * 1000 : n;
}

export function validateRecommendation(r: Recommendation, cartItems: Record<string, number>): string[] {
  const issues: string[] = [];
  const cartIds = Object.keys(cartItems);

  // total pemakaian tiap bahan di semua menu tidak boleh melebihi yang dibeli (toleransi 10%)
  const usedGrams: Record<string, number> = {};
  for (const m of r.menus)
    for (const g of m.resep.kelompokBahan)
      for (const b of g.bahan) {
        const grams = b.productId ? toGrams(b.jumlah) : null;
        if (b.productId && grams !== null) usedGrams[b.productId] = (usedGrams[b.productId] ?? 0) + grams;
      }
  for (const [id, used] of Object.entries(usedGrams)) {
    const p = productById[id];
    const perUnit = p ? toGrams(p.unit) : null;
    if (!p || perUnit === null || !cartItems[id]) continue;
    const bought = perUnit * cartItems[id];
    if (used > bought * 1.1)
      issues.push(`Total pemakaian ${p.name} di semua menu ${Math.round(used)} g/ml, padahal yang dibeli hanya ${Math.round(bought)} g/ml. Bagi ulang stoknya (kurangi takaran atau kurangi jumlah menu yang memakainya).`);
  }

  for (const m of r.menus) {
    const used = new Set(m.resep.kelompokBahan.flatMap((g) => g.bahan.map((b) => b.productId)).filter(Boolean));
    const name = m.nama.toLowerCase();

    // bahan dari toko yang TIDAK dibeli user (selain bumbu dapur dasar) tidak boleh dipakai di resep
    const notInCart = [...used].filter((id): id is string => !!id && !!productById[id] && !cartItems[id] && !PANTRY.has(id));
    if (notInCart.length)
      issues.push(
        `Menu "${m.nama}" memakai bahan yang tidak ada di keranjang (${notInCart.map((id) => productById[id].name).join(", ")}). ` +
          "Ganti dengan menu yang hanya memakai bahan keranjang + bumbu dapur dasar; bahan tambahan cukup ditulis di saranBahan.",
      );

    // nama menu menyebut bahan keranjang yang tidak dipakai di menu itu
    for (const id of cartIds) {
      const p = productById[id];
      if (!p || used.has(id)) continue;
      const words = p.name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4 && !GENERIC.has(w));
      const hit = words.find((w) => name.includes(w));
      if (hit) issues.push(`Menu "${m.nama}" memakai kata "${hit}" di namanya, tetapi ${p.name} tidak ada di daftar bahannya (stoknya habis di menu lain). Ganti nama/menunya atau bagi ulang stok bahan.`);
    }

    // resep terlalu singkat
    const steps = m.resep.tahapan.reduce((a, t) => a + t.langkah.length, 0);
    if (steps < 6) issues.push(`Resep "${m.nama}" hanya ${steps} langkah — buat 7-12 langkah yang detail.`);
  }
  return issues;
}

/**
 * Takaran yang melebihi stok keranjang diperkecil secara proporsional di semua menu,
 * supaya total pemakaian = jumlah yang dibeli. Hanya untuk takaran berat/volume (g, kg, ml, L).
 * Mengembalikan daftar bahan yang disesuaikan.
 */
export function scaleToStock(r: Recommendation, cartItems: Record<string, number>): string[] {
  const used: Record<string, number> = {};
  for (const m of r.menus)
    for (const g of m.resep.kelompokBahan)
      for (const b of g.bahan) {
        const v = b.productId ? toGrams(b.jumlah) : null;
        if (b.productId && v !== null) used[b.productId] = (used[b.productId] ?? 0) + v;
      }

  const adjusted: string[] = [];
  for (const [id, total] of Object.entries(used)) {
    const p = productById[id];
    const per = p ? toGrams(p.unit) : null;
    if (!p || per === null || !cartItems[id]) continue;
    const stock = per * cartItems[id];
    if (total <= stock * 1.1) continue;
    const ratio = stock / total;
    const unit = /\b(ml|l|liter)\b/i.test(p.unit) ? "ml" : "g";
    for (const m of r.menus)
      for (const g of m.resep.kelompokBahan)
        for (const b of g.bahan) {
          const v = b.productId === id ? toGrams(b.jumlah) : null;
          if (v === null) continue;
          b.jumlah = `${Math.max(5, Math.round((v * ratio) / 5) * 5)} ${unit}`;
        }
    adjusted.push(p.name);
  }
  return adjusted;
}
