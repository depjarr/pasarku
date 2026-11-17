/**
 * Cari foto di Google Images lewat Serper.dev (https://serper.dev — API hasil pencarian Google).
 * GET /api/foto?q=tumis daging sapi pedas → { photos: [{ url, thumb, source, link }] }
 *
 * Butuh SERPER_API_KEY di .env.local. Tanpa key → { photos: [] } dan tampilan memakai ikon cadangan.
 * Hasil disimpan di memori server supaya kata kunci yang sama tidak menghabiskan kuota lagi.
 */

type Photo = { url: string; thumb: string; source: string; link: string };
type SerperImage = { imageUrl?: string; thumbnailUrl?: string; domain?: string; source?: string; link?: string; imageWidth?: number; imageHeight?: number };

const cache = new Map<string, Photo[]>();

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 120);
  if (!q) return Response.json({ photos: [] }, { status: 400 });

  const key = process.env.SERPER_API_KEY;
  if (!key) return Response.json({ photos: [], reason: "no-key" });

  const ck = q.toLowerCase();
  const hit = cache.get(ck);
  if (hit) return Response.json({ photos: hit }, { headers: { "Cache-Control": "public, max-age=86400" } });

  try {
    const r = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({ q, gl: "id", hl: "id", num: 10 }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      console.error("[foto] Serper", r.status, (await r.text()).slice(0, 200));
      return Response.json({ photos: [], reason: `serper-${r.status}` });
    }
    const data = (await r.json()) as { images?: SerperImage[] };
    const photos: Photo[] = (data.images ?? [])
      .filter((i) => i.imageUrl && i.thumbnailUrl)
      // tautan gambar media sosial (Instagram/Facebook/TikTok) biasanya tidak bisa ditampilkan di situs lain
      .filter((i) => !/lookaside\.|fbsbx|fbcdn|tiktok|x\.com|twimg|cdninstagram/i.test(i.imageUrl!))
      // buang gambar terlalu kecil atau terlalu memanjang (banner, infografis panjang)
      .filter((i) => !i.imageWidth || !i.imageHeight || (i.imageWidth >= 250 && i.imageWidth / i.imageHeight < 2.2 && i.imageHeight / i.imageWidth < 2.2))
      .slice(0, 5)
      .map((i) => ({ url: i.imageUrl!, thumb: i.thumbnailUrl!, source: i.domain ?? i.source ?? "", link: i.link ?? "" }));
    cache.set(ck, photos);
    return Response.json({ photos }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("[foto]", err instanceof Error ? err.message : err);
    return Response.json({ photos: [], reason: "error" });
  }
}
