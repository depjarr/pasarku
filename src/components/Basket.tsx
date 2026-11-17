"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useRef } from "react";
import { useCart, useCartLines } from "@/lib/cart";
import { useFly, type Flight } from "@/lib/fly";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Keranjang belanja hijau digambar dengan SVG dari sudut pandang 3/4 atas (seperti melihat keranjang
 * di meja kasir), sehingga mulut keranjang terlihat dan barang benar-benar tampak MASUK ke dalamnya.
 *
 * Susunan lapisan (belakang → depan):
 *   1. <BasketBack>  : bibir keranjang, dinding dalam yang gelap, dasar keranjang
 *   2. foto barang   : diletakkan di dalam mulut keranjang
 *   3. <BasketFront> : dinding depan berlubang + bibir depan + pegangan → menutupi bagian bawah barang
 *
 * Koordinat memakai viewBox "0 -30 300 270" (lebar 300, tinggi 270; ruang 30 di atas untuk pegangan).
 */
const VB = { x: 0, y: -30, w: 300, h: 270 };
const pct = (x: number, y: number) => ({ left: `${((x - VB.x) / VB.w) * 100}%`, top: `${((y - VB.y) / VB.h) * 100}%` });

// Titik tengah tiap barang (satuan viewBox). Mulut keranjang: y 48 (belakang) – 118 (depan).
// Barang pertama di tengah depan; berikutnya mengisi kiri-kanan, lalu menumpuk makin ke belakang & tinggi.
const SLOTS = [
  { x: 150, y: 92, r: 4 }, { x: 95, y: 94, r: -10 }, { x: 205, y: 94, r: 10 },
  { x: 122, y: 76, r: -4 }, { x: 180, y: 76, r: 6 }, { x: 66, y: 82, r: -14 }, { x: 234, y: 82, r: 14 },
  { x: 150, y: 62, r: 0 }, { x: 100, y: 58, r: -8 }, { x: 200, y: 58, r: 8 },
  { x: 150, y: 44, r: 3 }, { x: 122, y: 34, r: -10 }, { x: 180, y: 34, r: 10 }, { x: 150, y: 22, r: 0 },
];
const ITEM_W = 30; // lebar foto barang, % dari lebar keranjang

/* mulut keranjang: tepi luar & tepi dalam bibir */
const RIM_OUT = "M46 44 Q38 44 34 52 L8 112 Q5 122 16 122 L284 122 Q295 122 292 112 L266 52 Q262 44 254 44 Z";
const RIM_IN = "M56 54 L244 54 Q250 54 252 60 L276 112 L24 112 L48 60 Q50 54 56 54 Z";
const FRONT_WALL = "M10 120 L290 120 L270 226 Q268 236 256 236 L44 236 Q32 236 30 226 Z";

function BasketBack({ uid }: { uid: string }) {
  return (
    <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-inside`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c4f1b" />
          <stop offset="1" stopColor="#1b7a2e" />
        </linearGradient>
      </defs>
      {/* bayangan keranjang di lantai/meja */}
      <ellipse cx="150" cy="238" rx="128" ry="8" fill="#000" opacity="0.12" />
      {/* rongga dalam: dinding belakang + samping + dasar */}
      <path d={RIM_IN} fill={`url(#${uid}-inside)`} />
      {/* lubang-lubang dinding belakang (terlihat dari dalam) */}
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={70 + i * 16} y={60} width={7} height={22} rx={3.5} fill="#33a34a" opacity={0.45} />
      ))}
      {/* dasar keranjang sedikit lebih terang */}
      <path d="M40 96 L260 96 L276 112 L24 112 Z" fill="#1f8a34" opacity="0.55" />
      {/* gelap di balik dinding depan — terlihat lewat lubang-lubang depan */}
      <path d={FRONT_WALL} fill="#0b4417" />
      {/* bibir keranjang (seluruh lingkar) */}
      <path d={`${RIM_OUT} ${RIM_IN}`} fillRule="evenodd" fill="#37ae4c" />
      <path d="M48 47 L252 47" stroke="#8be09a" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function BasketFront({ uid }: { uid: string }) {
  return (
    <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#36ad4b" />
          <stop offset="1" stopColor="#1f7d33" />
        </linearGradient>
        {/* lubang jeruji dinding depan: putih = tampil, hitam = bolong */}
        <mask id={`${uid}-holes`}>
          <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="#fff" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={30 + i * 17.6} y={138} width={8} height={74} rx={4} fill="#000" />
          ))}
        </mask>
      </defs>
      {/* dinding depan berlubang */}
      <path d={FRONT_WALL} fill={`url(#${uid}-front)`} mask={`url(#${uid}-holes)`} />
      {/* bibir depan (lebih tebal & terang karena paling dekat) */}
      <path d="M6 112 Q4 124 16 126 L284 126 Q296 124 294 112 L290 120 L10 120 Z" fill="#3fbb55" />
      <path d="M10 116 L290 116 L292 126 Q290 132 282 132 L18 132 Q10 132 8 126 Z" fill="#3cb552" />
      <path d="M16 119 L284 119" stroke="#a5ecb1" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* pegangan melengkung di atas keranjang */}
      <path d="M30 112 C 40 -22, 260 -22, 270 112" fill="none" stroke="#2a2a2a" strokeWidth="9" strokeLinecap="round" />
      <path d="M36 104 C 48 -10, 252 -10, 264 104" fill="none" stroke="#5a5a5a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="30" cy="112" r="6" fill="#1d1d1d" />
      <circle cx="270" cy="112" r="6" fill="#1d1d1d" />
    </svg>
  );
}

/** Keranjang penuh belanjaan (statis, tanpa tombol) — dipakai sebagai ilustrasi di beranda. */
export function BasketArt({ images, className = "" }: { images: string[]; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const placed = images
    .slice(0, SLOTS.length)
    .map((img, i) => ({ img, key: `${i}-${img}`, slot: SLOTS[i] }))
    .sort((a, b) => a.slot.y - b.slot.y);
  return (
    <div className={`relative aspect-[300/270] ${className}`}>
      <BasketBack uid={uid} />
      {placed.map((u) => (
        <div
          key={u.key}
          className="absolute"
          style={{ ...pct(u.slot.x, u.slot.y), width: `${ITEM_W}%`, transform: `translate(-50%,-50%) rotate(${u.slot.r}deg)` }}
        >
          <img src={u.img} alt="" className="aspect-square w-full object-contain drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]" />
        </div>
      ))}
      <BasketFront uid={uid} />
    </div>
  );
}

export function Basket() {
  const hydrated = useHydrated();
  const { lines, count } = useCartLines();
  const setDrawer = useCart((s) => s.setDrawer);
  const flights = useFly((s) => s.flights);
  const basketRef = useRef<HTMLButtonElement>(null);
  const uid = useId().replace(/:/g, "");

  if (!hydrated) return null;

  // setiap unit barang = satu foto di keranjang (dibatasi sejumlah slot)
  const units = lines.flatMap((l) => Array.from({ length: l.qty }, (_, i) => ({ key: `${l.id}-${i}`, img: l.img })));
  // barang yang lebih "belakang" (y kecil) digambar lebih dulu supaya tertutup barang di depannya
  const placed = units
    .slice(0, SLOTS.length)
    .map((u, i) => ({ ...u, slot: SLOTS[i] }))
    .sort((a, b) => a.slot.y - b.slot.y);

  return (
    <>
      <button
        ref={basketRef}
        onClick={() => setDrawer(true)}
        aria-label={`Buka keranjang, ${count} item`}
        // HP: di tengah, di atas tab bar · Tablet: pojok kanan bawah · Laptop: pojok kanan area konten (sebelah panel keranjang)
        className="group fixed bottom-[80px] left-1/2 z-20 w-[200px] -translate-x-1/2 transition-transform active:scale-95 md:bottom-[96px] md:left-auto md:right-8 md:w-[240px] md:translate-x-0 xl:bottom-4 xl:right-[364px]"
      >
        <div className="relative aspect-[300/270] drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)]">
          <BasketBack uid={uid} />
          {placed.map((u) => (
            <div
              key={u.key}
              className="absolute"
              style={{ ...pct(u.slot.x, u.slot.y), width: `${ITEM_W}%`, transform: `translate(-50%,-50%) rotate(${u.slot.r}deg)` }}
            >
              <img src={u.img} alt="" className="animate-drop aspect-square w-full object-contain drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]" />
            </div>
          ))}
          <BasketFront uid={uid} />
          {count > 0 && (
            <span className="absolute -right-1 top-[22%] z-10 grid h-8 min-w-8 place-items-center rounded-full bg-foreground px-2 text-sm font-bold text-white shadow-lg ring-2 ring-white">
              {count}
            </span>
          )}
        </div>
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
          {count === 0 ? "Keranjang masih kosong" : "Lihat isi keranjang"}
        </span>
      </button>

      {flights.map((f) => (
        <FlyingItem key={f.key} f={f} target={basketRef} />
      ))}
    </>
  );
}

function FlyingItem({ f, target }: { f: Flight; target: React.RefObject<HTMLButtonElement | null> }) {
  const ref = useRef<HTMLImageElement>(null);
  const done = useFly((s) => s.done);

  useEffect(() => {
    const el = ref.current;
    const t = target.current?.getBoundingClientRect();
    if (!el || !t) return done(f.key);
    // mendarat di tengah mulut keranjang
    const size = t.width * (ITEM_W / 100);
    const dx = t.left + t.width / 2 - (f.from.x + f.from.w / 2);
    const dy = t.top + t.height * ((85 - VB.y) / VB.h) - (f.from.y + f.from.h / 2);
    const s = size / f.from.w;
    // lintasan melengkung: naik dulu, lalu jatuh ke keranjang
    const anim = el.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 140}px) scale(${(1 + s) / 2}) rotate(-12deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(8deg)`, opacity: 1 },
      ],
      { duration: 700, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "forwards" },
    );
    anim.onfinish = () => done(f.key);
    return () => anim.cancel();
  }, [f, target, done]);

  return (
    <img
      ref={ref}
      src={f.img}
      alt=""
      className="pointer-events-none fixed z-50 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]"
      style={{ left: f.from.x, top: f.from.y, width: f.from.w, height: f.from.h }}
    />
  );
}
