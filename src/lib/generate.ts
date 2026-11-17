import { generateText, Output } from "ai";
import { z } from "zod";
import { getModels, isRetryable, type AiCandidate } from "./ai";

/** Batas waktu tiap model; kalau lewat, pindah ke model cadangan berikutnya. */
const PER_MODEL_TIMEOUT_MS = 40_000;

export class AiFailure extends Error {
  constructor(
    public failed: string[],
    public lastMessage: string,
    public noModel = false,
  ) {
    super(lastMessage);
  }
}

/** Membuat fungsi "tanya AI" untuk satu model, dengan output terstruktur sesuai skema Zod. */
export function makeAsk<T>(ai: AiCandidate, schema: z.ZodType<T>, system: string) {
  const groqSchema = ai.provider === "Groq" ? JSON.stringify(z.toJSONSchema(schema)) : "";
  return async (prompt: string): Promise<T> => {
    const { output } = await generateText({
      model: ai.model,
      maxRetries: 0, // tidak perlu coba ulang model yang sama — langsung pindah ke cadangan
      maxOutputTokens: 16000, // resep lengkap cukup panjang; batas bawaan Groq terlalu kecil
      abortSignal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS), // model yang lama tidak menjawab dilewati
      // Groq: mode JSON biasa — validasi skema dilakukan AI SDK (Zod), bukan server Groq yang terlalu ketat
      providerOptions: { groq: { structuredOutputs: false } },
      output: Output.object({ schema }),
      // Groq (mode JSON biasa) perlu kata "JSON" dan skemanya di instruksi
      system: groqSchema ? `${system}\nBalas HANYA dengan JSON valid yang mengikuti JSON Schema berikut:\n${groqSchema}` : system,
      prompt,
    });
    return output as T;
  };
}

/**
 * Jalankan `run` dengan model AI satu per satu sampai berhasil.
 * Urutan: semua Gemini → (jeda 3 detik) 2 Gemini teratas sekali lagi → penyedia lain (Groq, Gateway).
 */
export async function withFallback<R>(run: (ai: AiCandidate) => Promise<R>): Promise<{ result: R; model: string; failed: string[] }> {
  const models = getModels();
  if (models.length === 0) throw new AiFailure([], "no-model", true);

  const gemini = models.filter((m) => m.provider === "Google Gemini");
  const others = models.filter((m) => m.provider !== "Google Gemini");
  const attempts = [...gemini.map((m) => ({ m, wait: false })), ...gemini.slice(0, 2).map((m) => ({ m, wait: true })), ...others.map((m) => ({ m, wait: false }))];

  const failed: string[] = [];
  let lastMessage = "";
  for (const { m: ai, wait } of attempts) {
    if (wait) await new Promise((r) => setTimeout(r, 3000));
    const t0 = Date.now();
    try {
      const result = await run(ai);
      return { result, model: `${ai.provider} / ${ai.name}`, failed };
    } catch (err) {
      lastMessage = err instanceof Error ? err.message : String(err);
      failed.push(`${ai.name} (${Math.round((Date.now() - t0) / 1000)}s): ${lastMessage.slice(0, 120)}`);
      console.error(`[ai] ${ai.provider} (${ai.name}) gagal:`, lastMessage.slice(0, 200));
      if (!isRetryable(err)) break; // mis. API key salah → tidak perlu mencoba model lain
    }
  }
  throw new AiFailure(failed, lastMessage);
}

/** Respons error yang ramah untuk pengguna (detail teknis hanya saat development). */
export function aiErrorResponse(err: unknown, what: string) {
  if (err instanceof AiFailure && err.noModel) {
    return Response.json(
      { error: "AI belum dikonfigurasi. Isi GOOGLE_GENERATIVE_AI_API_KEY (Gemini) atau GROQ_API_KEY di file .env.local, lalu restart server." },
      { status: 503 },
    );
  }
  const msg = err instanceof Error ? err.message : "";
  const hint = /api key|unauthor|401|403|permission/i.test(msg)
    ? " API key ditolak — cek lagi key di .env.local."
    : /high demand|overload|quota|rate|429|limit|503/i.test(msg)
      ? " Server AI sedang penuh atau kuota gratis habis — tunggu sebentar lalu coba lagi."
      : " Coba lagi sebentar.";
  const detail = process.env.NODE_ENV === "development" && err instanceof AiFailure ? ` [detail: ${err.failed.join(" | ").slice(0, 900)}]` : "";
  return Response.json({ error: `Gagal ${what}.${hint}${detail}` }, { status: 502 });
}

/** Header respons berisi model yang dipakai (hanya karakter ASCII). */
export const aiHeaders = (model: string, failed: string[], extra: Record<string, string> = {}) => ({
  "x-ai-model": model,
  "x-ai-skipped": failed.join(" | ").replace(/[^\x20-\x7E]/g, ""),
  ...extra,
});
