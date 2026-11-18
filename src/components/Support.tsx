"use client";

/**
 * Ajakan mendukung developer lewat Saweria.
 * - SupportCard: kartu di bawah hasil Menu AI, baru muncul setelah meracik ≥ 2 kali,
 *   dan bisa disembunyikan selama 14 hari.
 * - SupportLink: tautan kecil yang selalu ada (sidebar, beranda, halaman resep).
 */
import { useSyncExternalStore } from "react";
import { XIcon } from "./ios";

export const SAWERIA_URL = "https://saweria.co/kripikcips";

const KEY = "pasarku-dukung";
const EVENT = "pasarku-dukung";
const HIDE_DAYS = 14;
const MIN_RACIK = 2;

type State = { racik: number; hideUntil: number };

const read = (): State => {
  try {
    return { racik: 0, hideUntil: 0, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { racik: 0, hideUntil: 0 };
  }
};
const write = (s: State) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // penyimpanan diblokir → abaikan
  }
  window.dispatchEvent(new Event(EVENT));
};

/** Dipanggil setiap kali AI berhasil meracik menu baru. */
export function countRacik() {
  const s = read();
  write({ ...s, racik: s.racik + 1 });
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const shouldShow = () => {
  const s = read();
  return s.racik >= MIN_RACIK && Date.now() > s.hideUntil;
};

const CoffeeIcon = ({ className = "h-[18px] w-[18px]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
    <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8 3.5c0 1-1 1.5-1 2.5M12 3.5c0 1-1 1.5-1 2.5" />
  </svg>
);

export function SupportCard() {
  const show = useSyncExternalStore(subscribe, shouldShow, () => false);
  if (!show) return null;
  const hide = () => write({ ...read(), hideUntil: Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000 });

  return (
    <section className="mx-4 mt-7 rounded-[16px] bg-[#eaf6e4] p-4 ring-1 ring-[#cfe6c4] md:mx-8 dark:bg-[#1f3a26] dark:ring-[#2f5a3a]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[#1f4d2c] dark:text-[#cfeccf]">
          <CoffeeIcon /> Resepnya membantu?
        </h2>
        <button onClick={hide} aria-label="Tutup ajakan dukungan" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-secondary active:opacity-60">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-[14px] leading-relaxed">
        PasarKu gratis dan dibuat satu orang. Kalau mau, kamu bisa traktir developernya kopi lewat Saweria.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={SAWERIA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#1f7a3d] px-4 py-2 text-[14px] font-semibold text-white active:opacity-80"
        >
          Dukung di Saweria
        </a>
        <button onClick={hide} className="rounded-full px-3 py-2 text-[14px] text-secondary active:opacity-60">
          Nanti saja
        </button>
      </div>
    </section>
  );
}

/** Tautan kecil "Dukung PasarKu" — gaya mengikuti tempatnya (className). */
export function SupportLink({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer" className={className}>
      {children ?? (
        <>
          <CoffeeIcon /> Dukung PasarKu
        </>
      )}
    </a>
  );
}
