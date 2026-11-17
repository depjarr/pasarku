import { generateText, Output } from "ai";
import { z } from "zod";
import { productById } from "@/lib/data";
import { recommendationSchema } from "@/lib/schema";

export const maxDuration = 120;

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

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Data keranjang tidak valid." }, { status: 400 });

  const { items, orang, tujuan } = parsed.data;
  const list = Object.entries(items)
    .filter(([id]) => productById[id])
    .map(([id, qty]) => `- [${id}] ${productById[id].name}: ${qty} × ${productById[id].unit}`);
  if (list.length === 0) return Response.json({ error: "Keranjang kosong." }, { status: 400 });

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return Response.json(
      { error: "AI belum dikonfigurasi. Isi AI_GATEWAY_API_KEY di file .env.local lalu restart server." },
      { status: 503 },
    );
  }

  try {
    const { output } = await generateText({
      model: process.env.AI_MODEL ?? "anthropic/claude-sonnet-5-5",
      output: Output.object({ schema: recommendationSchema }),
      system:
        "Kamu ahli gizi dan koki rumahan Indonesia. Susun rekomendasi menu realistis dari bahan belanjaan user. " +
        "Utamakan bahan dari keranjang; boleh menambah bahan dapur dasar (garam, gula, air, merica) dengan productId=null. " +
        "Untuk bahan dari keranjang, isi productId persis dengan id di dalam [kurung]. " +
        "Takaran harus masuk akal terhadap jumlah yang dibeli, dan total pemakaian satu bahan di semua menu tidak boleh melebihi yang dibeli. " +
        "Setiap menu wajib punya resep lengkap yang prosesnya SESUAI JENIS MASAKANNYA: kelompokkan bahan dan tahapan " +
        "mengikuti cara masakan itu dibuat (mis. jajanan pasar: adonan kulit → isian → rebus → balur; tumisan: siapkan bumbu → tumis → masukkan bahan → koreksi rasa; " +
        "sup: rebus kaldu → masukkan sayur → bumbui; gorengan: marinasi → balur tepung → goreng). " +
        "Pilih 'teknik' yang paling tepat untuk tiap langkah dan tulis tanda matang yang bisa diamati. " +
        "Estimasi nutrisi per porsi berdasarkan data komposisi pangan (TKPI/USDA) — angka realistis, bukan bulat asal. " +
        "Semua teks dalam Bahasa Indonesia.",
      prompt:
        `Bahan di keranjang (format: [id] nama: jumlah):\n${list.join("\n")}\n\n` +
        `Dimasak untuk ${orang} orang. Tujuan: ${goalText[tujuan]}.\n` +
        "Buat 3-5 menu dengan jenis masakan dan waktu makan yang bervariasi.",
    });
    return Response.json(output);
  } catch (err) {
    console.error("[rekomendasi]", err);
    return Response.json({ error: "Gagal mendapatkan rekomendasi dari AI. Coba lagi sebentar." }, { status: 502 });
  }
}
