"use client";

import { useSyncExternalStore } from "react";

type Mode = "auto" | "dark" | "light";
const KEY = "pasarku-theme";

/**
 * Skrip kecil yang dijalankan di <head> sebelum halaman tampil (mencegah "kedip" tema terang):
 * pakai pilihan tersimpan, atau ikuti pengaturan sistem (dan ikut berubah saat sistem berubah).
 */
export const themeScript = `(function(){try{var k='${KEY}',r=document.documentElement,m=window.matchMedia('(prefers-color-scheme: dark)');
function a(){var t=localStorage.getItem(k);r.dataset.theme=(t?t==='dark':m.matches)?'dark':'light';}
a();m.addEventListener('change',a);window.addEventListener('pasarku-theme',a);}catch(e){}})();`;

const subscribe = (cb: () => void) => {
  window.addEventListener("pasarku-theme", cb);
  return () => window.removeEventListener("pasarku-theme", cb);
};
const getMode = (): Mode => {
  try {
    return (localStorage.getItem(KEY) as Mode | null) ?? "auto";
  } catch {
    return "auto";
  }
};

const LABEL: Record<Mode, string> = { auto: "Tema: ikuti sistem", dark: "Tema: gelap", light: "Tema: terang" };
const NEXT: Record<Mode, Mode> = { auto: "dark", dark: "light", light: "auto" };

/** Tombol ganti tema: Otomatis → Gelap → Terang. */
export function ThemeToggle({ withLabel = false, className = "" }: { withLabel?: boolean; className?: string }) {
  const mode = useSyncExternalStore(subscribe, getMode, () => "auto" as Mode);

  const cycle = () => {
    const next = NEXT[mode];
    try {
      if (next === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // penyimpanan diblokir → tetap ganti untuk sesi ini
      document.documentElement.dataset.theme = next === "dark" ? "dark" : "light";
    }
    window.dispatchEvent(new Event("pasarku-theme"));
  };

  return (
    <button onClick={cycle} aria-label={LABEL[mode]} title={LABEL[mode]} className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {mode === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : mode === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" />
          </>
        )}
      </svg>
      {withLabel && <span>{mode === "auto" ? "Tema otomatis" : mode === "dark" ? "Tema gelap" : "Tema terang"}</span>}
    </button>
  );
}
