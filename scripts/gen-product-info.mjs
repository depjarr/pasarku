/**
 * Membuat data info produk (gizi per 100 g, tips memilih, contoh masakan) untuk semua produk
 * di src/lib/data.ts memakai Gemini, lalu menyimpannya ke src/lib/productInfo.json.
 *
 * Jalankan dari folder proyek:  node --env-file=.env.local scripts/gen-product-info.mjs
 * Produk yang sudah ada datanya dilewati — cukup jalankan ulang setelah menambah produk baru.
 */
import fs from "node:fs";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

const DATA = "src/lib/data.ts";
const OUT = "src/lib/productInfo.json";
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];

const src = fs.readFileSync(DATA, "utf8");
const products = [...src.matchAll(/^\s+\["([a-z0-9-]+)", "([^"]+)", "[^"]+", \d+, "([^"]+)"\]/gm)].map((m) => ({ id: m[1], name: m[2], unit: m[3] }));
const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const todo = products.filter((p) => !existing[p.id]);
console.log(`produk: ${products.length}, sudah ada: ${Object.keys(existing).length}, akan dibuat: ${todo.length}`);

const schema = z.object({
  produk: z.array(
    z.object({
      id: z.string(),
      gizi: z.object({
        basis: z.enum(["100 g", "100 ml"]),
        kalori: z.number().describe("kkal"),
        protein: z.number().describe("gram"),
        karbohidrat: z.number().describe("gram"),
        lemak: z.number().describe("gram"),
        serat: z.number().describe("gram"),
      }),
      tips: z.array(z.string()).describe("2-3 tips singkat memilih bahan yang segar/berkualitas di pasar/supermarket"),
      penyimpanan: z.string().describe("1 kalimat cara menyimpan agar awet"),
      contohMasakan: z.array(z.string()).describe("3 nama masakan rumahan Indonesia yang memakai bahan ini"),
    }),
  ),
});

const SYSTEM =
  "Kamu ahli gizi Indonesia. Untuk tiap bahan, berikan kandungan gizi per 100 g bagian yang dapat dimakan (per 100 ml untuk cairan) " +
  "berdasarkan Tabel Komposisi Pangan Indonesia (TKPI) atau USDA — angka realistis. Bahan mentah kecuali namanya menyebut olahan (mis. teri kering, roti). " +
  "Tips memilih harus praktis (warna, aroma, tekstur). Semua teks Bahasa Indonesia. Isi field id persis seperti input.";

async function run(batch) {
  const prompt = batch.map((p) => `- [${p.id}] ${p.name} (dijual per ${p.unit})`).join("\n");
  for (const name of MODELS) {
    for (let i = 0; i < 2; i++) {
      try {
        const { output } = await generateText({
          model: google(name),
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(90_000),
          output: Output.object({ schema }),
          system: SYSTEM,
          prompt,
        });
        return output.produk;
      } catch (e) {
        console.log(`  ${name} gagal: ${String(e.message).slice(0, 90)}`);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }
  throw new Error("semua model gagal");
}

const BATCH = 15;
for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  console.log(`batch ${i / BATCH + 1}: ${batch.map((p) => p.id).join(", ")}`);
  const rows = await run(batch);
  const ids = new Set(batch.map((p) => p.id));
  for (const r of rows) if (ids.has(r.id)) existing[r.id] = { gizi: r.gizi, tips: r.tips, penyimpanan: r.penyimpanan, contohMasakan: r.contohMasakan };
  fs.writeFileSync(OUT, JSON.stringify(existing, null, 1));
}
const missing = products.filter((p) => !existing[p.id]).map((p) => p.id);
console.log(`selesai. total: ${Object.keys(existing).length}${missing.length ? `, belum ada: ${missing.join(", ")}` : ""}`);
