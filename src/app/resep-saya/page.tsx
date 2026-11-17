"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, ClockIcon, FlameIcon, NavBar, PeopleIcon } from "@/components/ios";
import { WebPhoto } from "@/components/WebPhoto";
import { TIERS, tierOf, useCookbook, type SavedRecipe, type TierId } from "@/lib/cookbook";
import { productById } from "@/lib/data";
import { useRecs } from "@/lib/recs";
import { useHydrated } from "@/lib/useHydrated";

/** Rantang Resep: semua resep yang pernah diracik AI, dikelompokkan per susun (waktu makan). */
export default function RantangPage() {
  const hydrated = useHydrated();
  const items = useCookbook((s) => s.items);
  const [open, setOpen] = useState<TierId | null>(null);

  // hasil rekomendasi lama (sebelum fitur ini ada) ikut dimasukkan sekali
  useEffect(() => {
    const { result, orang, tujuan } = useRecs.getState();
    if (result) useCookbook.getState().addFromRecommendation(result.key, result.data, orang, tujuan);
  }, []);

  const list = hydrated ? items : [];
  const shown = open ? list.filter((r) => tierOf(r.menu) === open) : list;
  const count = (t: TierId) => list.filter((r) => tierOf(r.menu) === t).length;

  return (
    <main className="pb-tabbar flex-1">
      <NavBar title="Rantang Resep">
        <p className="text-[15px] text-secondary">
          {list.length > 0 ? `${list.length} resep dari belanjaanmu, tersimpan otomatis` : "Resep dari Menu AI tersimpan otomatis di sini"}
        </p>
      </NavBar>

      <div className="px-4 pt-3 md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:gap-8 md:px-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="md:sticky md:top-16">
          <Rantang open={open} onToggle={(t) => setOpen((o) => (o === t ? null : t))} count={count} />
          <p className="mt-3 text-center text-[13px] text-secondary">
            {open ? "Ketuk susun yang sama untuk menutupnya lagi." : "Ketuk satu susun untuk membuka resepnya."}
          </p>
        </div>

        <section className="mt-6 md:mt-0">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-[22px] font-bold">{open ? TIERS.find((t) => t.id === open)?.label : "Semua resep"}</h2>
            {open && (
              <button onClick={() => setOpen(null)} className="text-[15px] text-ios-blue active:opacity-50">
                Tampilkan semua
              </button>
            )}
          </div>

          {!hydrated ? null : list.length === 0 ? (
            <div className="rounded-[18px] bg-card px-6 py-10 text-center">
              <p className="text-[17px] font-semibold">Rantangmu masih kosong</p>
              <p className="mx-auto mt-1 max-w-[34ch] text-[15px] text-secondary">
                Isi keranjang lalu racik menu di Menu AI. Setiap resep yang dibuat AI langsung masuk ke rantang ini.
              </p>
              <Link href="/rekomendasi" className="mt-4 inline-block rounded-full bg-[#1f7a3d] px-5 py-2.5 text-[15px] font-semibold text-white active:opacity-80">
                Buka Menu AI
              </Link>
            </div>
          ) : shown.length === 0 ? (
            <p className="rounded-[18px] bg-card px-6 py-8 text-center text-[15px] text-secondary">Belum ada resep di susun ini.</p>
          ) : (
            <div className="grid gap-3 xl:grid-cols-1 2xl:grid-cols-2">
              {shown.map((r) => (
                <RecipeRow key={r.id} r={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ───────────── rantang enamel bersusun ───────────── */

function Rantang({ open, onToggle, count }: { open: TierId | null; onToggle: (t: TierId) => void; count: (t: TierId) => number }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px] pt-10">
      {/* pegangan & rangka besi */}
      <svg viewBox="0 0 300 60" className="absolute inset-x-0 top-0 h-[60px] w-full" aria-hidden>
        <path d="M60 58 V30 Q60 8 150 8 Q240 8 240 30 V58" fill="none" stroke="#a9b0b6" strokeWidth="9" strokeLinecap="round" />
        <path d="M60 58 V30 Q60 8 150 8 Q240 8 240 30 V58" fill="none" stroke="#e3e8ec" strokeWidth="3" strokeLinecap="round" />
        <rect x="128" y="2" width="44" height="14" rx="7" fill="#7d858c" />
      </svg>
      <div className="pointer-events-none absolute bottom-3 left-[18%] top-[52px] w-[7px] rounded-full bg-gradient-to-r from-[#8e969d] to-[#d9dee2]" aria-hidden />
      <div className="pointer-events-none absolute bottom-3 right-[18%] top-[52px] w-[7px] rounded-full bg-gradient-to-r from-[#8e969d] to-[#d9dee2]" aria-hidden />

      {/* tutup */}
      <div className="relative mx-auto h-[26px] w-[86%] rounded-t-[60px] rounded-b-[8px] bg-gradient-to-b from-[#ffe6a6] to-[#f2a93b] shadow-[inset_0_-3px_0_rgba(0,0,0,0.08)]" />

      {/* susun */}
      <div className="relative mt-1 space-y-1.5">
        {TIERS.map((t) => {
          const n = count(t.id);
          const isOpen = open === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              aria-pressed={isOpen}
              className={`relative mx-auto flex h-[66px] w-[92%] items-center justify-between overflow-hidden rounded-[16px] px-5 text-left text-white shadow-[0_6px_14px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.3,0.8,0.3,1)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ios-blue ${
                isOpen ? "translate-x-5 -rotate-1" : open ? "opacity-80" : ""
              }`}
              style={{
                background: `radial-gradient(circle at 10px 10px, rgba(255,255,255,0.28) 0 3px, transparent 4px) 0 0 / 34px 34px, linear-gradient(180deg, ${t.lid} 0 7px, ${t.color} 7px)`,
              }}
            >
              {/* bunga kecil khas rantang enamel */}
              <svg viewBox="0 0 40 40" className="pointer-events-none absolute right-14 top-1/2 h-[54px] w-[54px] -translate-y-1/2 opacity-35" aria-hidden>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="20" cy="9" rx="6" ry="9" fill="#fff" transform={`rotate(${a} 20 20)`} />
                ))}
                <circle cx="20" cy="20" r="5" fill="#ffe27a" />
              </svg>
              <span className="relative">
                <span className="block text-[17px] font-bold leading-tight drop-shadow-sm">{t.label}</span>
                <span className="block text-[13px] text-white/85">{n === 0 ? "kosong" : `${n} resep`}</span>
              </span>
              <span className={`relative grid h-8 w-8 place-items-center rounded-full bg-white/25 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
      {/* alas */}
      <div className="mx-auto mt-1.5 h-[10px] w-[80%] rounded-b-[14px] bg-[#c9ced3]" />
    </div>
  );
}

/* ───────────── satu resep di daftar ───────────── */

function RecipeRow({ r }: { r: SavedRecipe }) {
  const m = r.menu;
  const tier = TIERS.find((t) => t.id === tierOf(m))!;
  const photos = [...new Set(m.resep.kelompokBahan.flatMap((g) => g.bahan.map((b) => b.productId)).filter((id): id is string => !!id && !!productById[id]))].slice(0, 4);
  const date = new Date(r.savedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  return (
    <Link href={`/resep-saya/${r.id}`} className="flex gap-3 overflow-hidden rounded-[16px] bg-card p-2.5 pr-3 active:opacity-70">
      <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[12px] bg-[#eef4ea]">
        <WebPhoto
          query={m.kataKunciFoto ?? m.nama}
          className="h-full w-full"
          fallback={photos[0] ? <img src={productById[photos[0]].img} alt="" className="m-auto h-full w-full object-contain p-3" /> : null}
        />
        <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: tier.color }} />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-[13px] font-medium" style={{ color: tier.color }}>
          {tier.label}, {m.jenis.toLowerCase()}
        </p>
        <h3 className="truncate text-[17px] font-bold leading-tight">{m.nama}</h3>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-secondary">
          <span className="flex items-center gap-1"><PeopleIcon className="h-4 w-4" />{m.porsi} porsi</span>
          <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" />{m.waktuMasakMenit} mnt</span>
          <span className="flex items-center gap-1"><FlameIcon className="h-4 w-4" />{Math.round(m.nutrisiPerPorsi.kalori)} kkal</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex -space-x-2">
            {photos.map((id) => (
              <span key={id} className="grid h-7 w-7 place-items-center rounded-full bg-white ring-2 ring-card">
                <img src={productById[id].img} alt={productById[id].name} className="h-5 w-5 object-contain" />
              </span>
            ))}
          </div>
          <span className="text-[12px] text-tertiary">{date}</span>
        </div>
      </div>
    </Link>
  );
}
