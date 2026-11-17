"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { productById, rupiah, sections } from "@/lib/data";
import { productInfo } from "@/lib/productInfo";
import { useProductSheet } from "@/lib/productSheet";
import { useHydrated } from "@/lib/useHydrated";
import { PrimaryButton, Stepper, XIcon } from "./ios";
import { ProductImage } from "./ProductImage";

const GIZI = [
  { key: "kalori", label: "Kalori", unit: "kkal", color: "#ff2d55" },
  { key: "protein", label: "Protein", unit: "g", color: "#34c759" },
  { key: "karbohidrat", label: "Karbo", unit: "g", color: "#ff9500" },
  { key: "lemak", label: "Lemak", unit: "g", color: "#af52de" },
  { key: "serat", label: "Serat", unit: "g", color: "#007aff" },
] as const;

/** Lembar detail produk: foto, harga, gizi per 100 g, tips memilih, penyimpanan, contoh masakan. */
export function ProductSheet() {
  const hydrated = useHydrated();
  const id = useProductSheet((s) => s.id);
  const close = useProductSheet((s) => s.close);
  const qty = useCart((s) => (id ? s.items[id] ?? 0 : 0));
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, close]);

  if (!hydrated) return null;
  const p = id ? productById[id] : undefined;
  const info = id ? productInfo(id) : undefined;
  const open = !!p;

  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-[60] bg-black/35 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <div
        role="dialog"
        aria-label={p ? `Detail ${p.name}` : "Detail produk"}
        aria-hidden={!open}
        // HP: bottom sheet · tablet & laptop: jendela di tengah
        className={`fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-h-[90%] max-w-md flex-col rounded-t-[16px] bg-background shadow-2xl transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[84vh] md:w-[560px] md:max-w-none md:-translate-x-1/2 md:rounded-[18px] ${
          open ? "translate-y-0 md:-translate-y-1/2 md:opacity-100" : "translate-y-full md:-translate-y-[45%] md:pointer-events-none md:opacity-0"
        }`}
      >
        {p && (
          <>
            <div className="no-scrollbar flex-1 overflow-y-auto">
              {/* foto */}
              <div className="relative grid h-[220px] place-items-center rounded-t-[16px] bg-gradient-to-b from-[#eef6ea] to-background md:rounded-t-[18px]">
                <div className="absolute left-1/2 top-[6px] h-[5px] w-9 -translate-x-1/2 rounded-full bg-black/15 md:hidden" />
                <button onClick={close} aria-label="Tutup" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/[0.06] text-secondary active:opacity-60">
                  <XIcon className="h-4 w-4" />
                </button>
                <ProductImage p={p} size={170} />
              </div>

              <div className="px-5 pb-4">
                <p className="text-[14px] font-medium text-brand-ink">
                  {sections.find((s) => s.id === p.sectionId)?.name}, rak {p.shelf.toLowerCase()}
                </p>
                <h2 className="mt-0.5 text-[24px] font-bold leading-tight">{p.name}</h2>
                <p className="mt-1 text-[15px] text-secondary">
                  <span className="text-[20px] font-bold text-label tabular-nums">{rupiah(p.price)}</span> / {p.unit}
                </p>

                {info ? (
                  <>
                    <h3 className="mt-5 text-[15px] font-semibold">Gizi per {info.gizi.basis}</h3>
                    <div className="mt-2 grid grid-cols-5 gap-1.5">
                      {GIZI.map((g) => (
                        <div key={g.key} className="rounded-[12px] bg-card px-1 py-2.5 text-center">
                          <p className="text-[17px] font-bold tabular-nums" style={{ color: g.color }}>
                            {Math.round(info.gizi[g.key] * 10) / 10}
                          </p>
                          <p className="text-[10px] text-secondary">{g.unit}</p>
                          <p className="mt-0.5 text-[11px] font-medium">{g.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-secondary">Perkiraan berdasarkan Tabel Komposisi Pangan Indonesia / USDA.</p>

                    <h3 className="mt-5 text-[15px] font-semibold">Tips memilih yang segar</h3>
                    <ul className="mt-2 space-y-1.5 rounded-[12px] bg-card p-3.5">
                      {info.tips.map((t, i) => (
                        <li key={i} className="flex gap-2 text-[14px] leading-snug">
                          <span className="text-brand-ink">✓</span>
                          {t}
                        </li>
                      ))}
                    </ul>

                    <h3 className="mt-5 text-[15px] font-semibold">Cara menyimpan</h3>
                    <p className="mt-2 rounded-[12px] bg-card p-3.5 text-[14px] leading-snug">{info.penyimpanan}</p>

                    <h3 className="mt-5 text-[15px] font-semibold">Cocok dimasak jadi</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {info.contohMasakan.map((m) => (
                        <span key={m} className="rounded-full bg-[#e8f5e2] px-3 py-1.5 text-[13px] font-medium text-[#1f4d2c]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-5 rounded-[12px] bg-card p-3.5 text-[14px] text-secondary">Info gizi produk ini belum tersedia.</p>
                )}
              </div>
            </div>

            {/* tombol keranjang */}
            <div className="flex items-center gap-3 border-t border-separator bg-background px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
              {qty > 0 ? (
                <>
                  <div className="flex-1">
                    <p className="text-[13px] text-secondary">Di keranjang</p>
                    <p className="text-[17px] font-bold tabular-nums">{rupiah(p.price * qty)}</p>
                  </div>
                  <Stepper value={qty} onMinus={() => remove(p.id)} onPlus={() => add(p.id)} />
                </>
              ) : (
                <PrimaryButton onClick={() => add(p.id)}>+ Masukkan ke Keranjang</PrimaryButton>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
