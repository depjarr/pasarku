"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon, ChefIcon, ChevronRight, ClockIcon, FlameIcon, Group, NavBar, PeopleIcon, PrimaryButton, SparklesIcon } from "@/components/ios";
import { useCart, useCartLines } from "@/lib/cart";
import { CookingLoader } from "@/components/CookingLoader";
import { SuggestionList } from "@/components/Suggestions";
import { WebPhoto } from "@/components/WebPhoto";
import { useCookbook } from "@/lib/cookbook";
import { productById } from "@/lib/data";
import { goals, recKey, useRecs } from "@/lib/recs";
import type { Menu, Recommendation } from "@/lib/schema";
import { useHydrated } from "@/lib/useHydrated";

export default function RecommendationPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const { orang, tujuan, result, setResult } = useRecs();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // AI baru dipanggil setelah user memilih jumlah orang & tujuan di layar persiapan
  const [confirmed, setConfirmed] = useState(false);

  const hasItems = Object.keys(items).length > 0;
  const key = recKey(items, orang, tujuan);
  // hasil terakhir tetap ditampilkan walau keranjang berubah (mis. setelah menambah saran bahan) — ditandai "stale"
  const data = result?.data ?? null;
  const stale = !!result && result.key !== key;

  useEffect(() => {
    if (!hydrated || !hasItems || data || !confirmed) return;
    const ctrl = new AbortController();
    fetch("/api/rekomendasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, orang, tujuan }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Terjadi kesalahan.");
        setResult({ key, data: json as Recommendation });
        // otomatis masuk Rantang Resep
        useCookbook.getState().addFromRecommendation(key, json as Recommendation, orang, tujuan);
      })
      .catch((e) => e.name !== "AbortError" && setError(e.message));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, key, attempt, !!data, confirmed]);

  const retry = () => {
    setError(null);
    setResult(null);
    setAttempt((a) => a + 1);
  };
  // "Racik Ulang": kembali ke layar pilih jumlah orang
  const restart = () => {
    setError(null);
    setResult(null);
    setConfirmed(false);
  };

  return (
    <main className="pb-tabbar flex-1">
      <NavBar
        title="Menu untukmu"
        right={
          data && (
            <button onClick={restart} className="text-[17px] text-ios-blue active:opacity-50">
              Racik Ulang
            </button>
          )
        }
      >
        <p className="text-[15px] text-secondary">
          Untuk {orang} orang, fokus {goals.find((g) => g.id === tujuan)?.label.toLowerCase()}
        </p>
      </NavBar>

      {!hydrated ? null : !hasItems ? (
        <Empty title="Belum ada bahan" text="Isi keranjang dulu, lalu AI akan meracik menu dan resepnya." href="/" cta="Mulai Belanja" />
      ) : error ? (
        <div className="px-8 pt-20 text-center">
          <p className="text-[20px] font-semibold">Gagal meracik menu</p>
          <p className="mt-1 text-[15px] text-secondary">{error}</p>
          <div className="mx-auto mt-5 max-w-[220px]">
            <PrimaryButton onClick={retry}>Coba Lagi</PrimaryButton>
          </div>
        </div>
      ) : !data && !confirmed ? (
        <PortionPicker onConfirm={() => setConfirmed(true)} />
      ) : !data ? (
        <CookingLoader orang={orang} tujuan={goals.find((g) => g.id === tujuan)?.label ?? ""} />
      ) : (
        <>
          {stale && (
            <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-[12px] bg-[#fff6e0] p-3.5 md:mx-8">
              <p className="text-[13px] leading-snug text-[#6b4a00]">Isi keranjang berubah sejak menu ini diracik.</p>
              <button onClick={restart} className="shrink-0 rounded-full bg-[#1f4d2c] px-3.5 py-1.5 text-[13px] font-semibold text-white">Racik ulang</button>
            </div>
          )}
          <Content data={data} />
        </>
      )}
    </main>
  );
}

function Content({ data }: { data: Recommendation }) {
  return (
    <>
      <p className="mx-4 mt-2 max-w-[62ch] border-l-[3px] border-[#1f7a3d] pl-4 text-[17px] leading-relaxed md:mx-8">{data.ringkasan}</p>

      <NutritionRings menus={data.menus} />
      <AllSuggestions data={data} />

      <h2 className="px-4 pb-2 pt-7 text-[22px] font-bold md:px-8">{data.menus.length} Menu & Resep</h2>
      <div className="grid gap-3 px-4 md:grid-cols-2 md:gap-4 md:px-8 xl:grid-cols-1 2xl:grid-cols-2">
        {data.menus.map((m, i) => (
          <MenuCard key={i} m={m} i={i} />
        ))}
      </div>

      {data.sisaBahan.length > 0 && (
        <Group header="Sisa bahan">
          {data.sisaBahan.map((s, i) => (
            <div key={i} className="border-b border-separator px-4 py-2.5 last:border-b-0">
              <p className="text-[15px] font-medium">{s.nama}</p>
              <p className="text-[13px] text-secondary">{s.saran}</p>
            </div>
          ))}
        </Group>
      )}

      <Group header="Tips gizi" footer="Nilai gizi adalah estimasi AI, bukan pengganti saran ahli gizi atau dokter.">
        {data.tipsGizi.map((t, i) => (
          <div key={i} className="flex gap-3 border-b border-separator px-4 py-2.5 last:border-b-0">
            <span className="text-brand-ink">●</span>
            <p className="text-[15px]">{t}</p>
          </div>
        ))}
      </Group>
    </>
  );
}

/** Ringkasan gizi gaya cincin Apple Health: total 1 porsi semua menu dibanding AKG harian. */
function NutritionRings({ menus }: { menus: Menu[] }) {
  const sum = (k: keyof Menu["nutrisiPerPorsi"]) => Math.round(menus.reduce((a, m) => a + m.nutrisiPerPorsi[k], 0));
  const rings = [
    { label: "Kalori", v: sum("kalori"), u: "kkal", ref: 2150, color: "#ff2d55" },
    { label: "Protein", v: sum("protein"), u: "g", ref: 60, color: "#34c759" },
    { label: "Karbo", v: sum("karbohidrat"), u: "g", ref: 325, color: "#ff9500" },
    { label: "Serat", v: sum("serat"), u: "g", ref: 30, color: "#007aff" },
  ];
  return (
    <Group header="Total gizi semua menu (1 porsi)" footer="Dibanding Angka Kecukupan Gizi harian orang dewasa.">
      <div className="grid grid-cols-4 gap-1 px-2 py-4">
        {rings.map((r) => {
          const pct = Math.round((r.v / r.ref) * 100);
          const c = 2 * Math.PI * 22;
          return (
            <div key={r.label} className="flex flex-col items-center">
              <div className="relative h-[60px] w-[60px]">
                <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke={r.color} strokeOpacity={0.18} strokeWidth="7" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke={r.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(Math.min(pct, 100) / 100) * c} ${c}`} />
                </svg>
                <span className="absolute inset-0 grid place-items-center text-[12px] font-semibold tabular-nums">{pct}%</span>
              </div>
              <p className="mt-1 text-[12px] font-semibold" style={{ color: r.color }}>{r.label}</p>
              <p className="text-[11px] text-secondary tabular-nums">{r.v} {r.u}</p>
            </div>
          );
        })}
      </div>
    </Group>
  );
}

function MenuCard({ m, i }: { m: Menu; i: number }) {
  const photos = [...new Set(m.resep.kelompokBahan.flatMap((g) => g.bahan.map((b) => b.productId)).filter((id): id is string => !!id && !!productById[id]))].slice(0, 4);
  const score = Math.max(1, Math.min(10, Math.round(m.skorKesehatan)));
  return (
    <Link href={`/resep/${i}`} className="block overflow-hidden rounded-[16px] bg-card transition active:scale-[0.98]">
      {/* foto hidangan dari Google Images; cadangan: bahan-bahan dari keranjang di atas piring */}
      <div className="relative h-[160px] bg-gradient-to-br from-[#eaf6e4] to-[#d6ecd0]">
        <WebPhoto
          query={m.kataKunciFoto ?? m.nama}
          className="h-full w-full"
          fallback={
            <div className="grid h-full place-items-center">
              <span className="grid h-[104px] w-[104px] place-items-center rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
                {photos[0] && <img src={productById[photos[0]].img} alt="" className="h-[72px] w-[72px] object-contain" />}
              </span>
            </div>
          }
        />
        <div className="absolute bottom-2 right-2 flex -space-x-2.5">
          {photos.map((id) => (
            <span key={id} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow ring-2 ring-white">
              <img src={productById[id].img} alt={productById[id].name} className="h-7 w-7 object-contain" />
            </span>
          ))}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-brand-ink">Skor {score}/10</span>
      </div>
      <div className="flex items-center gap-2 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-brand-ink">{m.waktuMakan.charAt(0).toUpperCase() + m.waktuMakan.slice(1).toLowerCase()}, {m.jenis.toLowerCase()}</p>
          <h3 className="text-[19px] font-bold leading-tight">{m.nama}</h3>
          <p className="mt-0.5 line-clamp-2 text-[14px] text-secondary">{m.deskripsi}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-secondary">
            <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" />{m.waktuMasakMenit} mnt</span>
            <span className="flex items-center gap-1"><FlameIcon className="h-4 w-4" />{Math.round(m.nutrisiPerPorsi.kalori)} kkal</span>
            <span className="flex items-center gap-1"><PeopleIcon className="h-4 w-4" />{m.porsi} porsi</span>
            <span className="flex items-center gap-1"><ChefIcon className="h-4 w-4" />{m.kesulitan}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-tertiary" />
      </div>
    </Link>
  );
}

function Empty({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="px-8 pt-24 text-center">
      <SparklesIcon className="mx-auto h-14 w-14 text-tertiary" />
      <p className="mt-3 text-[20px] font-semibold">{title}</p>
      <p className="mt-1 text-[15px] text-secondary">{text}</p>
      <Link href={href} className="mt-5 inline-block text-[17px] text-ios-blue">{cta}</Link>
    </div>
  );
}

/** Layar persiapan sebelum AI meracik: pilih jumlah orang & tujuan kesehatan. */
function PortionPicker({ onConfirm }: { onConfirm: () => void }) {
  const { orang, tujuan, setOrang, setTujuan } = useRecs();
  const { lines, count } = useCartLines();
  const quick = [1, 2, 3, 4, 5, 6, 8, 10];

  return (
    <div className="mx-auto mt-3 w-full max-w-[560px] px-4 md:mt-6">
      <div className="overflow-hidden rounded-[20px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {/* bahan di keranjang */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-[#eaf6e4] to-[#d6ecd0] px-5 py-4">
          <div className="flex -space-x-3">
            {lines.slice(0, 5).map((l) => (
              <span key={l.id} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-2 ring-[#eaf6e4]">
                <img src={l.img} alt={l.name} className="h-8 w-8 object-contain" />
              </span>
            ))}
          </div>
          <p className="text-[13px] font-medium text-brand-ink">{count} bahan siap diracik</p>
        </div>

        <div className="px-5 pb-5 pt-5">
          <h2 className="text-[22px] font-bold leading-tight">Masak untuk berapa orang?</h2>
          <p className="mt-1 text-[14px] text-secondary">AI menyesuaikan jumlah porsi dan takaran bahan.</p>

          {/* penghitung besar */}
          <div className="mt-5 flex items-center justify-center gap-6">
            <button
              onClick={() => setOrang(Math.max(1, orang - 1))}
              disabled={orang <= 1}
              aria-label="Kurangi orang"
              className="grid h-14 w-14 place-items-center rounded-full bg-fill text-[28px] font-medium text-brand-ink transition active:scale-90 disabled:opacity-30"
            >
              −
            </button>
            <div className="w-28 text-center">
              <span className="block text-[52px] font-bold leading-none tabular-nums">{orang}</span>
              <span className="text-[14px] text-secondary">orang</span>
            </div>
            <button
              onClick={() => setOrang(Math.min(10, orang + 1))}
              disabled={orang >= 10}
              aria-label="Tambah orang"
              className="grid h-14 w-14 place-items-center rounded-full bg-fill text-[28px] font-medium text-brand-ink transition active:scale-90 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {quick.map((n) => (
              <button
                key={n}
                onClick={() => setOrang(n)}
                className={`h-9 min-w-11 rounded-full px-3 text-[15px] font-semibold transition ${
                  orang === n ? "bg-brand text-white" : "bg-fill text-label"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <h3 className="mt-6 text-[15px] font-semibold">Tujuan kesehatan</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {goals.map((g) => (
              <button
                key={g.id}
                onClick={() => setTujuan(g.id)}
                className={`rounded-[14px] border p-3 text-left transition ${
                  tujuan === g.id ? "border-brand bg-[#eaf6e4]" : "border-separator bg-white"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold">{g.label}</span>
                  {tujuan === g.id && <CheckIcon className="h-4 w-4 text-brand-ink" />}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-secondary">{g.desc}</span>
              </button>
            ))}
          </div>

          <PrimaryButton className="mt-6" onClick={onConfirm}>
            <SparklesIcon className="h-5 w-5" /> Racik Menu untuk {orang} Orang
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}


/** Gabungan saran "Lengkapi bahan" dari semua menu (tanpa duplikat). */
function AllSuggestions({ data }: { data: Recommendation }) {
  const seen = new Set<string>();
  const items = data.menus.flatMap((m) =>
    (m.saranBahan ?? []).filter((s) => !seen.has(s.productId) && seen.add(s.productId)).map((s) => ({ ...s, untuk: m.nama })),
  );
  if (items.length === 0) return null;
  return (
    <Group header="Lengkapi belanjaanmu" footer="Saran AI supaya menu lebih lengkap & bergizi. Ketuk + untuk memasukkan ke keranjang.">
      <SuggestionList items={items.slice(0, 6)} />
    </Group>
  );
}
