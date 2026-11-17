import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type AiCandidate = { model: LanguageModel; provider: string; name: string };

/**
 * Daftar model AI yang akan dicoba BERURUTAN. Kalau satu model sedang penuh ("high demand"),
 * kena batas kuota, atau error sementara, route API otomatis pindah ke model berikutnya.
 *
 * Urutan (hanya yang API key-nya diisi di .env.local):
 *   1. Google Gemini — AI_MODEL (kalau diisi) atau gemini-3.5-flash
 *   2. Google Gemini cadangan — gemini-3.5-flash-lite (cepat), lalu gemini-3.8-flash
 *   3. Groq — openai/gpt-oss-120b (mendukung structured output / json_schema)
 *   4. Vercel AI Gateway
 */
export function getModels(): AiCandidate[] {
  const list: AiCandidate[] = [];
  const custom = process.env.AI_MODEL;

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const main = custom && custom.startsWith("gemini") ? custom : "gemini-3.5-flash";
    // flash-lite paling cepat (±10 detik) → dicoba sebelum 3.8-flash yang lebih lambat
    const names = [main, "gemini-3.5-flash-lite", "gemini-3.8-flash"].filter((n, i, a) => a.indexOf(n) === i);
    for (const name of names) list.push({ model: google(name), provider: "Google Gemini", name });
  }
  if (process.env.GROQ_API_KEY) {
    const name = custom && custom.includes("/") && !custom.startsWith("anthropic/") ? custom : "openai/gpt-oss-120b";
    list.push({ model: groq(name), provider: "Groq", name });
  }
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    const name = custom ?? "anthropic/claude-sonnet-5-5";
    list.push({ model: name, provider: "AI Gateway", name });
  }
  return list;
}

/** Error yang layak dicoba ulang dengan model lain (penuh, kuota, gangguan server). */
export function isRetryable(err: unknown) {
  const msg = err instanceof Error ? `${err.message} ${(err as { cause?: unknown }).cause ?? ""}` : String(err);
  return /high demand|overload|unavailable|not available|no longer available|deprecated|503|500|502|504|429|quota|rate.?limit|resource.?exhausted|timeout|not found|404|failed after|did not match|no object generated/i.test(msg);
}
