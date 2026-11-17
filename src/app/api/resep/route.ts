import { z } from "zod";
import { productById } from "@/lib/data";
import { aiErrorResponse, aiHeaders, makeAsk, withFallback } from "@/lib/generate";
import { recipeSchema } from "@/lib/schema";

/**
 * Resep DETAIL untuk satu menu (dipanggil saat halaman resep dibuka).
 * Bahan & takaran sudah ditentukan oleh rekomendasi menu — di sini AI fokus menulis
 * langkah memasak yang lengkap (8-12 langkah) dengan takaran yang SAMA persis.
 */
export const maxDuration = 120;

const bodySchema = z.object({
  nama: z.string().max(120),
  jenis: z.string().max(60),
  deskripsi: z.string().max(400),
  porsi: z.number().int().min(1).max(40),
  bahan: z
    .array(z.object({ nama: z.string().max(80), jumlah: z.string().max(40), productId: z.string().nullable(), persiapan: z.string().nullable() }))
    .min(1)
    .max(30),
});

const SYSTEM =
  "Kamu koki rumahan Indonesia yang menulis resep untuk buku masak. Tulis resep LENGKAP dan DETAIL untuk satu menu. " +
  "WAJIB memakai bahan & takaran yang diberikan PERSIS (jangan ubah jumlahnya, jangan tambah bahan dari keranjang lain); " +
  "boleh menambah bahan dapur dasar (air, garam, gula, merica, minyak) dengan productId=null. " +
  "Kelompokkan bahan sesuai jenis masakan (mis. Bahan Utama, Bumbu Halus, Bumbu Iris, Bahan Kuah, Pelengkap). " +
  "Tulis 8-12 langkah dalam 3-4 tahap yang mengikuti urutan memasak sebenarnya: persiapan & membersihkan bahan (ikan/daging dibersihkan, dilumuri jeruk nipis & garam bila perlu), " +
  "membuat bumbu, memasak inti, koreksi rasa, penyajian. Tiap langkah 2-3 kalimat: takaran yang dipakai, ukuran potongan, besar api, durasi dalam menit, dan ciri visual yang harus dicapai. " +
  "Setiap bahan harus dipakai di minimal satu langkah. Isi bahanTerkait dengan productId bahan keranjang yang dipakai di langkah itu. " +
  "kataKunciFoto tiap langkah: kata kunci Google Images yang menggambarkan proses langkah itu dengan bahan aslinya (mis. 'membersihkan ikan tongkol'). " +
  "Semua teks dalam Bahasa Indonesia.";

const stepCount = (r: z.infer<typeof recipeSchema>) => r.tahapan.reduce((a, t) => a + t.langkah.length, 0);

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Data menu tidak valid." }, { status: 400 });
  const m = parsed.data;

  const bahan = m.bahan
    .map((b) => `- ${b.productId && productById[b.productId] ? `[${b.productId}] ` : ""}${b.nama}: ${b.jumlah}${b.persiapan ? ` (${b.persiapan})` : ""}`)
    .join("\n");
  const prompt = `Menu: ${m.nama} (${m.jenis}, ${m.porsi} porsi)\nDeskripsi: ${m.deskripsi}\n\nBahan & takaran (format: [id] nama: jumlah):\n${bahan}`;
  const validIds = new Set(m.bahan.map((b) => b.productId).filter((id): id is string => !!id && !!productById[id]));

  try {
    const { result, model, failed } = await withFallback(async (ai) => {
      const ask = makeAsk(ai, recipeSchema, SYSTEM);
      let r = await ask(prompt);
      // resep terlalu singkat → minta sekali lagi
      if (stepCount(r) < 8) {
        try {
          const again = await ask(`${prompt}\n\nResep sebelumnya hanya ${stepCount(r)} langkah. Tulis ulang dengan 8-12 langkah yang detail.`);
          if (stepCount(again) > stepCount(r)) r = again;
        } catch {
          // pakai jawaban pertama
        }
      }
      // bahan terkait hanya id yang memang bahan menu ini
      for (const t of r.tahapan) for (const s of t.langkah) s.bahanTerkait = s.bahanTerkait.filter((id) => validIds.has(id));
      return r;
    });
    return Response.json(result, { headers: aiHeaders(model, failed, { "x-ai-steps": String(stepCount(result)) }) });
  } catch (err) {
    return aiErrorResponse(err, "menyusun resep detail");
  }
}
