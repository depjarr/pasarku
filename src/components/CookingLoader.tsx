"use client";

/**
 * Layar menunggu AI: bahan dari keranjang jatuh satu per satu ke wajan di atas kompor,
 * lalu tahapan kerja AI dicentang bergantian. Isinya selalu mengikuti keranjang pengguna.
 */
import { useEffect, useState } from "react";
import { useCartLines } from "@/lib/cart";
import { CheckIcon } from "./ios";

// posisi bahan di dalam wajan (koordinat viewBox 320×210)
const SLOTS = [
  { x: 96, y: 100, r: -8 },
  { x: 138, y: 96, r: 6 },
  { x: 182, y: 97, r: -4 },
  { x: 224, y: 101, r: 10 },
  { x: 118, y: 110, r: 4 },
  { x: 162, y: 112, r: -10 },
  { x: 204, y: 111, r: 6 },
];
const ITEM = 46;

export function CookingLoader({ orang, tujuan }: { orang: number; tujuan: string }) {
  const { lines } = useCartLines();
  const items = lines.slice(0, SLOTS.length);
  const [sec, setSec] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const names = lines.map((l) => l.name.toLowerCase());
  const first = names.slice(0, 2).join(" dan ");
  const stages = [
    { at: 0, text: `Membaca ${lines.length} bahan di keranjang` },
    { at: 3, text: `Mencari masakan rumahan dari ${first || "bahanmu"}` },
    { at: 8, text: `Menakar bahan untuk ${orang} orang, tanpa melebihi stok` },
    { at: 14, text: `Menghitung kalori dan protein per porsi (${tujuan.toLowerCase()})` },
    { at: 20, text: "Menulis langkah memasak, dari persiapan sampai penyajian" },
  ];
  const current = stages.reduce((idx, s, i) => (sec >= s.at ? i : idx), 0);

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-2 md:pt-6" role="status" aria-live="polite">
      {/* adegan dapur */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#f6efe3] dark:bg-[#2a2420]">
        <svg viewBox="0 0 320 210" className="block w-full" aria-hidden>
          {/* uap */}
          <g className="cook-steam" fill="none" stroke="#b9ab97" strokeWidth="3" strokeLinecap="round">
            <path d="M128 40c-8-10 8-16 0-28" />
            <path d="M162 34c-8-10 8-16 0-28" style={{ animationDelay: "0.6s" }} />
            <path d="M196 40c-8-10 8-16 0-28" style={{ animationDelay: "1.2s" }} />
          </g>

          {/* api kompor */}
          <g className="cook-flame">
            {[110, 135, 160, 185, 210].map((x, i) => (
              <path key={x} d={`M${x} 196c-7-8-5-16 0-24 5 8 7 16 0 24Z`} fill={i % 2 ? "#ff9f0a" : "#ff6b2c"} style={{ animationDelay: `${i * 0.13}s` }} />
            ))}
          </g>
          <rect x="70" y="194" width="180" height="8" rx="4" fill="#5b5047" />

          {/* bagian dalam wajan */}
          <ellipse cx="160" cy="96" rx="124" ry="30" fill="#4b423b" />
          <ellipse cx="160" cy="100" rx="104" ry="20" fill="#3d3530" />

          {/* bahan dari keranjang */}
          {items.map((l, i) => {
            const s = SLOTS[i];
            return (
              <g key={l.id} className="cook-drop" style={{ animationDelay: `${0.25 + i * 0.45}s, ${3.6 + i * 0.22}s` }}>
                <image
                  href={l.img}
                  x={s.x - ITEM / 2}
                  y={s.y - ITEM / 2}
                  width={ITEM}
                  height={ITEM}
                  transform={`rotate(${s.r} ${s.x} ${s.y})`}
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            );
          })}

          {/* badan wajan depan + gagang */}
          <path d="M36 96c8 52 58 82 124 82s116-30 124-82c-20 18-66 30-124 30S56 114 36 96Z" fill="#2f2924" />
          <path d="M44 106c14 40 58 62 116 62s102-22 116-62" fill="none" stroke="#6d6158" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M36 96c-14-2-26 2-30 10 6 6 18 6 32 0" fill="#2f2924" />
          <path d="M284 96c14-2 26 2 30 10-6 6-18 6-32 0" fill="#2f2924" />
        </svg>

        <p className="absolute left-4 top-3 text-[13px] font-medium text-[#7a6a58] tabular-nums dark:text-[#bcae9c]">{sec} detik</p>
      </div>

      {/* tahapan kerja AI */}
      <h2 className="mt-5 px-1 text-[22px] font-bold leading-tight">Dapur AI sedang memasak idenya</h2>
      <p className="mt-1 px-1 text-[15px] text-secondary">
        {sec < 40
          ? "Biasanya selesai dalam 15 sampai 40 detik. Jangan tutup halaman ini."
          : "Server AI sedang ramai, jadi PasarKu mencoba model cadangan. Bisa sampai 2 menit."}
      </p>

      <ol className="mt-4 space-y-0.5 rounded-[14px] bg-card p-2">
        {stages.map((s, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li key={s.text} className={`flex items-start gap-3 rounded-[10px] px-2.5 py-2 transition-colors ${now ? "bg-[#eaf6e4] dark:bg-[#1f3a26]" : ""}`}>
              <span
                className={`mt-[1px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${
                  done ? "bg-[#1f7a3d] text-white" : now ? "border-2 border-[#1f7a3d]" : "border-2 border-separator"
                }`}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : now ? <span className="cook-pulse h-2 w-2 rounded-full bg-[#1f7a3d]" /> : null}
              </span>
              <span className={`text-[15px] leading-snug ${done ? "text-secondary" : now ? "font-semibold" : "text-tertiary"}`}>{s.text}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
