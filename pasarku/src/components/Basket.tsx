"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { useCart, useCartLines } from "@/lib/cart";
import { useFly, type Flight } from "@/lib/fly";
import { useHydrated } from "@/lib/useHydrated";

// Posisi tumpukan barang di dalam keranjang (persen dari kotak keranjang, titik tengah barang).
// Gambar keranjang 449×375: bibir depan di y≈125 (33%). Barang berada di antara dinding belakang
// (SVG di bawah) dan dinding depan (PNG), jadi bagian bawahnya tertutup jeruji depan dan bagian
// atasnya menyembul dari dalam keranjang. Barang pertama di tengah, berikutnya menumpuk makin tinggi.
const SLOTS = [
  { x: 50, y: 42, r: 3 }, { x: 28, y: 42, r: -10 }, { x: 72, y: 42, r: 10 },
  { x: 19, y: 36, r: -16 }, { x: 39, y: 36, r: -4 }, { x: 61, y: 36, r: 6 }, { x: 81, y: 36, r: 16 },
  { x: 31, y: 30, r: 8 }, { x: 50, y: 29, r: -2 }, { x: 69, y: 30, r: -8 },
  { x: 41, y: 23, r: -10 }, { x: 59, y: 23, r: 10 }, { x: 50, y: 17, r: 2 }, { x: 34, y: 18, r: -14 },
];

/** Bagian dalam keranjang: dinding belakang, bibir belakang, dan bayangan isi — digambar di belakang barang. */
function BasketInside() {
  return (
    <svg viewBox="0 0 449 375" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="basket-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b4416" />
          <stop offset="1" stopColor="#156b26" />
        </linearGradient>
      </defs>
      {/* bayangan gelap di dalam badan keranjang — terlihat lewat celah jeruji depan */}
      <path d="M24 134 L425 134 L392 352 L57 352 Z" fill="#0b4416" opacity="0.38" />
      {/* lubang/rongga keranjang di atas bibir depan */}
      <path d="M48 100 L401 100 L426 134 L23 134 Z" fill="url(#basket-in)" />
      {/* jeruji dinding belakang */}
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={66 + i * 22} y={106} width={8} height={24} rx={3} fill="#2c9b3e" opacity={0.55} />
      ))}
      {/* bibir belakang keranjang */}
      <rect x={44} y={94} width={361} height={11} rx={5} fill="#35a847" />
      <rect x={52} y={95} width={345} height={2.5} rx={1} fill="#7fd48a" opacity={0.7} />
    </svg>
  );
}

export function Basket() {
  const hydrated = useHydrated();
  const { lines, count } = useCartLines();
  const setDrawer = useCart((s) => s.setDrawer);
  const flights = useFly((s) => s.flights);
  const basketRef = useRef<HTMLButtonElement>(null);

  if (!hydrated) return null;

  // setiap unit barang = satu foto di keranjang (dibatasi sejumlah slot)
  const units = lines.flatMap((l) => Array.from({ length: l.qty }, (_, i) => ({ key: `${l.id}-${i}`, img: l.img, name: l.name })));
  const shown = units.slice(0, SLOTS.length);

  return (
    <>
      <button
        ref={basketRef}
        onClick={() => setDrawer(true)}
        aria-label={`Buka keranjang, ${count} item`}
        // HP: di tengah, di atas tab bar · Tablet: pojok kanan bawah · Laptop: pojok kanan area konten (sebelah panel keranjang)
        className="group fixed bottom-[84px] left-1/2 z-20 w-[190px] -translate-x-1/2 transition-transform active:scale-95 md:bottom-[100px] md:left-auto md:right-8 md:w-[230px] md:translate-x-0 xl:bottom-6 xl:right-[364px]"
      >
        <div className="relative aspect-[449/375]">
          {/* 1) dinding belakang & rongga keranjang */}
          <BasketInside />
          {/* 2) barang di dalam keranjang */}
          {shown.map((u, i) => (
            <div
              key={u.key}
              className="absolute w-[32%]"
              style={{ left: `${SLOTS[i].x}%`, top: `${SLOTS[i].y}%`, transform: `translate(-50%,-50%) rotate(${SLOTS[i].r}deg)` }}
            >
              <img src={u.img} alt="" className="animate-drop aspect-square w-full object-contain drop-shadow-[0_4px_3px_rgba(0,0,0,0.25)]" />
            </div>
          ))}
          {/* 3) dinding depan keranjang (jeruji) menutupi bagian bawah barang */}
          <img src="/keranjang-hijau.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.25)]" />
          {count > 0 && (
            <span className="absolute right-[6%] top-[30%] grid h-8 min-w-8 place-items-center rounded-full bg-foreground px-2 text-sm font-bold text-white shadow-lg ring-2 ring-white">
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
    const size = t.width * 0.3;
    const dx = t.left + t.width / 2 - (f.from.x + f.from.w / 2);
    const dy = t.top + t.height * 0.3 - (f.from.y + f.from.h / 2);
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
