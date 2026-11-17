"use client";

/**
 * Layar pembukaan: memperkenalkan PasarKu dan cara memakainya.
 * Muncul otomatis saat pertama kali membuka web, dan bisa dibuka lagi lewat tombol "Cara pakai".
 * HP: layar penuh yang bisa digeser · tablet & laptop: jendela di tengah.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { productById, products, rupiah, sections } from "@/lib/data";
import { AppLogo } from "./AppLogo";
import { BasketArt } from "./Basket";
import { BasketIcon, ChefIcon, FlameIcon, PeopleIcon, SparklesIcon, StoreIcon, XIcon } from "./ios";
import { ProductImage } from "./ProductImage";

const KEY = "pasarku-onboarded";
const EVENT = "pasarku-intro";
// dibuka manual lewat tombol "Cara pakai" — ditandai di <html data-intro="open">
const forced = () => document.documentElement.dataset.intro === "open";

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const isOpen = () => {
  if (forced()) return true;
  try {
    return !localStorage.getItem(KEY);
  } catch {
    return false;
  }
};

/** Buka lagi layar pembukaan (dipakai tombol "Cara pakai"). */
export function openIntro() {
  document.documentElement.dataset.intro = "open";
  window.dispatchEvent(new Event(EVENT));
}

function closeIntro() {
  delete document.documentElement.dataset.intro;
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // penyimpanan diblokir → cukup tutup untuk sesi ini
  }
  window.dispatchEvent(new Event(EVENT));
}

const pic = (id: string) => productById[id]?.img;
const BASKET = ["brokoli", "tomat", "wortel", "tempe", "cabai-merah", "pisang", "bayam", "jagung", "telur", "apel"].map(pic).filter(Boolean) as string[];

const SLIDES = [
  {
    kicker: "Selamat datang",
    title: "PasarKu — pasar segar + dapur AI",
    text: "Supermarket virtual berisi bahan makanan khas Indonesia. Belanja seperti di toko sungguhan, lalu AI meracik menu sehat dari isi keranjangmu.",
    Art: WelcomeArt,
  },
  {
    kicker: "Langkah 1",
    title: "Keliling section toko",
    text: "Pilih section — buah, sayur, daging, ikan, bumbu, dan lainnya. Tiap section punya rak yang bisa diurutkan: termurah, protein tertinggi, atau rendah kalori.",
    Art: SectionsArt,
  },
  {
    kicker: "Langkah 2",
    title: "Masukkan ke keranjang",
    text: "Ketuk “+” untuk memasukkan bahan ke keranjang. Ketuk fotonya untuk melihat gizi per 100 g, tips memilih, dan contoh masakan.",
    Art: CartArt,
  },
  {
    kicker: "Langkah 3",
    title: "Racik menu dengan AI",
    text: "Buka Menu AI, pilih untuk berapa orang. AI memberi beberapa menu lengkap dengan resep langkah demi langkah, info gizi, dan saran bahan yang kurang.",
    Art: AiArt,
  },
] as const;

export function Onboarding() {
  const open = useSyncExternalStore(subscribe, isOpen, () => false);
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const last = index === SLIDES.length - 1;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeIntro();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // reset ke slide pertama setiap kali dibuka
  useEffect(() => {
    if (open) track.current?.scrollTo({ left: 0 });
  }, [open]);

  if (!open) return null;

  function scrollToSlide(i: number) {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }
  function go(step: number) {
    const i = Math.min(SLIDES.length - 1, Math.max(0, index + step));
    scrollToSlide(i);
  }
  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="fixed inset-0 z-[80] md:grid md:place-items-center md:bg-black/40 md:p-6 md:backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kenalan dengan PasarKu"
        className="relative flex h-full w-full flex-col bg-background md:h-auto md:max-h-[92vh] md:w-[720px] md:overflow-hidden md:rounded-[24px] md:shadow-2xl"
      >
        {/* atas: logo + lewati */}
        <div className="flex items-center justify-between px-5 pb-2 pt-[max(env(safe-area-inset-top),16px)] md:pt-5">
          <span className="flex items-center gap-2">
            <AppLogo size={34} />
            <span className="text-[17px] font-bold">PasarKu</span>
          </span>
          {last ? (
            <button onClick={closeIntro} aria-label="Tutup" className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.06] text-secondary active:opacity-60">
              <XIcon className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={closeIntro} className="rounded-full px-3 py-1.5 text-[15px] font-medium text-ios-blue active:opacity-60">
              Lewati
            </button>
          )}
        </div>

        {/* slide yang bisa digeser */}
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden md:flex-none">
          {SLIDES.map(({ kicker, title, text, Art }, i) => (
            <section key={title} aria-hidden={i !== index} className="flex w-full shrink-0 snap-center flex-col overflow-y-auto px-6 md:flex-row md:items-center md:gap-8 md:px-10 md:py-6">
              <div className="grid min-h-[260px] flex-1 place-items-center py-4 md:min-h-[300px] md:flex-none md:basis-[46%]">
                <Art />
              </div>
              <div className="pb-4 md:flex-1 md:pb-0">
                <p className="text-[15px] font-semibold text-brand-ink">{kicker}</p>
                <h2 className="mt-1 text-[28px] font-bold leading-[1.15] tracking-tight md:text-[30px]">{title}</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-secondary">{text}</p>
              </div>
            </section>
          ))}
        </div>

        {/* bawah: titik + tombol */}
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-3 md:flex md:items-center md:justify-between md:px-10 md:pb-7">
          <div className="mb-4 flex justify-center gap-2 md:mb-0" role="tablist" aria-label="Halaman pengenalan">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={i === index}
                aria-label={`Halaman ${i + 1}`}
                onClick={() => scrollToSlide(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[#1f7a3d]" : "w-2 bg-[#8e8e93]/45"}`}
              />
            ))}
          </div>
          <div className="flex gap-3 md:w-[300px]">
            {index > 0 && (
              <button onClick={() => go(-1)} className="h-[50px] flex-1 rounded-[14px] bg-black/[0.06] text-[17px] font-semibold active:opacity-70">
                Kembali
              </button>
            )}
            <button
              onClick={() => (last ? closeIntro() : go(1))}
              className="h-[50px] flex-[2] rounded-[14px] bg-[#1f7a3d] text-[17px] font-semibold text-white shadow-sm active:opacity-80"
            >
              {last ? "Mulai Belanja" : "Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── ilustrasi tiap slide ───────────── */

function WelcomeArt() {
  return (
    <div className="relative w-full max-w-[320px]">
      <div className="absolute inset-x-6 bottom-2 top-8 rounded-[40px] bg-[#e8f5e2]" />
      <BasketArt images={BASKET} className="relative mx-auto w-[260px]" />
      <span className="absolute left-0 top-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-md">{products.length}+ bahan</span>
      <span className="absolute bottom-6 right-0 flex items-center gap-1 rounded-full bg-[#1f7a3d] px-3 py-1.5 text-[13px] font-semibold text-white shadow-md">
        <SparklesIcon className="h-4 w-4" /> Menu AI
      </span>
    </div>
  );
}

function SectionsArt() {
  return (
    <div className="grid w-full max-w-[300px] grid-cols-2 gap-3">
      {sections.slice(0, 4).map((s) => {
        const p = products.find((x) => x.sectionId === s.id);
        return (
          <div key={s.id} className="flex flex-col items-center rounded-[18px] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            {p && <ProductImage p={p} size={64} />}
            <span className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
          </div>
        );
      })}
      <div className="col-span-2 flex items-center justify-center gap-2 text-[12px] text-secondary">
        <StoreIcon className="h-4 w-4" /> + {sections.length - 4} section lainnya
      </div>
    </div>
  );
}

function CartArt() {
  const p = productById["tempe"] ?? products[0];
  return (
    <div className="relative w-full max-w-[300px]">
      <div className="mx-auto w-[190px] rounded-[20px] bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
        <div className="grid place-items-center">
          <ProductImage p={p} size={110} />
        </div>
        <p className="mt-2 text-[15px] font-semibold">{p.name}</p>
        <p className="text-[12px] text-secondary">{p.unit}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[15px] font-bold tabular-nums">{rupiah(p.price)}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1f7a3d] text-[20px] font-medium leading-none text-white ring-4 ring-[#34c759]/25">+</span>
        </div>
      </div>
      <span className="absolute -right-1 top-3 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1f7a3d] shadow-md">
        protein 19 g
      </span>
      <span className="absolute -bottom-5 left-1 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-md">
        <BasketIcon className="h-4 w-4 text-[#1f7a3d]" /> Masuk keranjang
      </span>
    </div>
  );
}

function AiArt() {
  return (
    <div className="w-full max-w-[300px] space-y-3">
      <div className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          <PeopleIcon className="h-5 w-5 text-ios-blue" /> Untuk berapa orang?
        </span>
        <span className="rounded-full bg-[#e8f5e2] px-2.5 py-0.5 text-[14px] font-bold text-[#1f7a3d]">4</span>
      </div>
      <div className="rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-ink">
          <SparklesIcon className="h-4 w-4" /> Rekomendasi AI
        </p>
        <p className="mt-1 text-[17px] font-bold">Tumis Tempe Cabai</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
          <span className="flex items-center gap-1 rounded-full bg-[#fff0f3] px-2 py-0.5 text-[#ff2d55]"><FlameIcon className="h-3.5 w-3.5" /> 320 kkal</span>
          <span className="rounded-full bg-[#eaf8ee] px-2 py-0.5 text-[#1f9e48]">protein 18 g</span>
          <span className="flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#007aff]"><ChefIcon className="h-3.5 w-3.5" /> 9 langkah</span>
        </div>
      </div>
    </div>
  );
}

/** Tombol untuk membuka lagi panduan "Cara pakai". */
export function IntroButton({ withLabel = false, className = "" }: { withLabel?: boolean; className?: string }) {
  return (
    <button onClick={openIntro} aria-label="Cara pakai PasarKu" title="Cara pakai" className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6" />
        <circle cx="12" cy="16.9" r="0.6" fill="currentColor" />
      </svg>
      {withLabel && <span>Cara pakai</span>}
    </button>
  );
}
