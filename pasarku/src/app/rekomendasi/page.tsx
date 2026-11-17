"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChefIcon, ChevronRight, ClockIcon, FlameIcon, Group, NavBar, PeopleIcon, PrimaryButton, SparklesIcon } from "@/components/ios";
import { useCart } from "@/lib/cart";
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

  const hasItems = Object.keys(items).length > 0;
  const key = recKey(items, orang, tujuan);
  const data = result?.key === key ? result.data : null;

  useEffect(() => {
    if (!hydrated || !hasItems || data) return;
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
      })
      .catch((e) => e.name !== "AbortError" && setError(e.message));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, key, attempt, !!data]);

  const retry = () => {
    setError(null);
    setResult(null);
    setAttempt((a) => a + 1);
  };

  return (
    <main className="pb-tabbar flex-1">
      <NavBar
        title="Menu untukmu"
        right={
          data && (
            <button onClick={retry} className="text-[17px] text-ios-blue active:opacity-50">
              Racik Ulang
            </button>
          )
        }
      >
        <p className="text-[15px] text-secondary">
          {orang} orang · {goals.find((g) => g.id === tujuan)?.label}
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
      ) : !data ? (
        <Loading />
      ) : (
        <Content data={data} />
      )}
    </main>
  );
}

function Content({ data }: { data: Recommendation }) {
  return (
    <>
      <p className="mx-4 mt-3 rounded-[12px] bg-card p-4 text-[15px] leading-relaxed md:mx-8">{data.ringkasan}</p>

      <NutritionRings menus={data.menus} />

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
      <div className="relative flex h-[120px] items-center gap-3 bg-gradient-to-br from-[#eaf6e4] to-[#d6ecd0] px-4">
        <span className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full bg-white text-[48px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]">{m.emoji}</span>
        <div className="flex -space-x-3">
          {photos.map((id) => (
            <span key={id} className="grid h-12 w-12 place-items-center rounded-full bg-white shadow ring-2 ring-[#eaf6e4]">
              <img src={productById[id].img} alt={productById[id].name} className="h-9 w-9 object-contain" />
            </span>
          ))}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-brand-ink">Skor {score}/10</span>
      </div>
      <div className="flex items-center gap-2 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-ink">{m.jenis} · {m.waktuMakan}</p>
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

function Loading() {
  return (
    <div className="px-4 pt-4 md:px-8">
      <div className="flex items-center gap-3 rounded-[12px] bg-card p-4">
        <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-fill border-t-[#8e8e93]" />
        <div>
          <p className="text-[15px] font-semibold">AI sedang meracik menu…</p>
          <p className="text-[13px] text-secondary">Menyusun resep, menghitung kalori, protein & vitamin</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-[220px] rounded-[16px]" />)}
      </div>
    </div>
  );
}
