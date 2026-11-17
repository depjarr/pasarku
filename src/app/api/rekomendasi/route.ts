import { z } from "zod";
import { productById, products } from "@/lib/data";
import { aiErrorResponse, aiHeaders, makeAsk, withFallback } from "@/lib/generate";
import { sanitizeRecommendation, scaleToStock, toGrams, validateRecommendation } from "@/lib/sanitize";
import { recommendationSchema } from "@/lib/schema";

export const maxDuration = 240;

const bodySchema = z.object({
  items: z.record(z.string(), z.number().int().min(1).max(50)),
  orang: z.number().int().min(1).max(10).default(2),
  tujuan: z.enum(["seimbang", "diet", "otot", "keluarga"]).default("seimbang"),
});

const goalText: Record<string, string> = {
  seimbang: "gizi seimbang untuk orang dewasa sehat",
  diet: "menurunkan berat badan: rendah kalori, tinggi serat, kenyang lebih lama",
  otot: "membangun otot: tinggi protein, karbohidrat kompleks",
  keluarga: "ramah anak & keluarga: tidak pedas, mudah dikunyah, bergizi lengkap",
};

const SYSTEM =
  "Kamu ahli gizi dan koki rumahan Indonesia. Susun rekomendasi menu realistis dari bahan belanjaan user. " +
  "Utamakan bahan dari keranjang; boleh menambah bahan dapur dasar (garam, gula, air, merica, minyak) dengan productId=null. " +
  "Untuk bahan dari keranjang, isi productId persis dengan id di dalam [kurung]. " +
  "Setiap menu wajib punya resep yang prosesnya SESUAI JENIS MASAKANNYA: kelompokkan bahan dan tahapan " +
  "mengikuti cara masakan itu dibuat (mis. jajanan pasar: adonan kulit → isian → rebus → balur; tumisan: siapkan bumbu → tumis → masukkan bahan → koreksi rasa; " +
  "sup: rebus kaldu → masukkan sayur → bumbui; gorengan: marinasi → balur tepung → goreng). " +
  "Pilih 'teknik' yang paling tepat untuk tiap langkah dan tulis tanda matang yang bisa diamati. " +
  // aturan pembagian bahan & konsistensi
  "ATURAN PENTING: (1) Sebelum menulis, bagi dulu 'total stok' tiap bahan ke menu-menu; jumlah takaran satu bahan di SEMUA menu tidak boleh melebihi total stoknya. " +
  "Kalau stok satu bahan hanya cukup untuk satu menu, JANGAN membuat atau menamai menu lain dengan bahan itu. " +
  "(2) Nama menu, deskripsi, dan kataKunciFoto harus sesuai bahan utama yang BENAR-BENAR dipakai. " +
  "(3) Setiap bahan di kelompokBahan harus jumlahnya lebih dari 0 dan dipakai di minimal satu langkah — jangan pernah menulis bahan '0 g' atau 'habis terpakai'. " +
  "(4) Label harus akurat: masakan berisi ikan, seafood, daging, ayam, telur, atau susu TIDAK BOLEH diberi label Vegan. " +
  // resep detail
  "RESEP HARUS DETAIL seperti buku masak: 7-12 langkah dalam 3-4 tahap, tiap langkah 2-3 kalimat berisi takaran, ukuran potongan, besar api, durasi (menit), " +
  "dan ciri visual yang dicapai. Jelaskan juga cara membersihkan/menyiapkan bahan hewani (mis. ikan dibersihkan, dilumuri jeruk nipis & garam). " +
  "Estimasi nutrisi per porsi berdasarkan data komposisi pangan (TKPI/USDA) — angka realistis, bukan bulat asal. " +
  "Semua teks dalam Bahasa Indonesia.";

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Data keranjang tidak valid." }, { status: 400 });

  const { items, orang, tujuan } = parsed.data;
  const cartItems = Object.fromEntries(Object.entries(items).filter(([id]) => productById[id]));
  if (Object.keys(cartItems).length === 0) return Response.json({ error: "Keranjang kosong." }, { status: 400 });

  const list = Object.entries(cartItems).map(([id, qty]) => {
    const p = productById[id];
    const per = toGrams(p.unit);
    // sertakan total stok supaya AI bisa membagi bahan antar menu dengan benar
    return `- [${id}] ${p.name}: ${qty} × ${p.unit}${per !== null ? ` (total stok ${Math.round(per * qty)} ${/\b(ml|l|liter)\b/i.test(p.unit) ? "ml" : "g"})` : ""}`;
  });
  // katalog toko (selain isi keranjang) untuk fitur "Lengkapi bahan"
  const catalog = products
    .filter((p) => !cartItems[p.id])
    .map((p) => `[${p.id}] ${p.name}`)
    .join("; ");
  const prompt =
    `Bahan di keranjang (format: [id] nama: jumlah):\n${list.join("\n")}\n\n` +
    `Dimasak untuk ${orang} orang. Tujuan: ${goalText[tujuan]}.\n` +
    "Buat 3-5 menu dengan jenis masakan dan waktu makan yang bervariasi.\n\n" +
    `KATALOG TOKO (untuk saranBahan, pilih id persis dari sini): ${catalog}`;

  try {
    const { result, model, failed } = await withFallback(async (ai) => {
      const ask = makeAsk(ai, recommendationSchema, SYSTEM);
      const clean = (r: z.infer<typeof recommendationSchema>) => {
        const rec = sanitizeRecommendation(r);
        scaleToStock(rec, cartItems); // takaran berlebih disesuaikan ke stok keranjang
        // saran bahan hanya produk yang ada di toko & belum ada di keranjang (maks. 3, tanpa duplikat)
        for (const m of rec.menus) {
          const seen = new Set<string>();
          m.saranBahan = (m.saranBahan ?? []).filter((s) => productById[s.productId] && !cartItems[s.productId] && !seen.has(s.productId) && seen.add(s.productId)).slice(0, 3);
        }
        return rec;
      };

      let rec = clean(await ask(prompt));
      let issues = validateRecommendation(rec, cartItems);

      // Kalau masih ada kesalahan (nama menu tak sesuai bahan, resep terlalu singkat),
      // minta AI memperbaiki sekali dengan daftar kesalahannya.
      if (issues.length > 0) {
        try {
          const fixed = clean(await ask(`${prompt}\n\nJawaban sebelumnya punya masalah berikut — buat ulang dan perbaiki SEMUANYA:\n- ${issues.join("\n- ")}`));
          const fixedIssues = validateRecommendation(fixed, cartItems);
          if (fixedIssues.length <= issues.length) {
            rec = fixed;
            issues = fixedIssues;
          }
        } catch {
          // perbaikan gagal → pakai jawaban pertama
        }
      }
      return { rec, issues };
    });

    return Response.json(result.rec, { headers: aiHeaders(model, failed, { "x-ai-issues": String(result.issues.length) }) });
  } catch (err) {
    return aiErrorResponse(err, "mendapatkan rekomendasi menu");
  }
}
