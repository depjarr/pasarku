"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCartLines } from "@/lib/cart";
import { rupiah } from "@/lib/data";
import { useHydrated } from "@/lib/useHydrated";
import { PrimaryButton, Stepper } from "./ios";
import { ProductImage } from "./ProductImage";

/** Keranjang sebagai bottom sheet iOS (geser naik dari bawah, ada grabber). */
export function CartSheet() {
  const hydrated = useHydrated();
  const open = useCart((s) => s.drawerOpen);
  const setDrawer = useCart((s) => s.setDrawer);
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const { lines, total, count } = useCartLines();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setDrawer]);

  if (!hydrated) return null;

  return (
    <>
      <div
        onClick={() => setDrawer(false)}
        className={`fixed inset-0 z-50 bg-black/35 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        role="dialog"
        aria-label="Keranjang"
        aria-hidden={!open}
        // HP: bottom sheet dari bawah · Tablet & laptop: form sheet di tengah layar (gaya iPadOS)
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[86%] max-w-md flex-col rounded-t-[14px] bg-background shadow-2xl transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[78vh] md:w-[540px] md:max-w-none md:-translate-x-1/2 md:rounded-[16px] ${
          open ? "translate-y-0 md:-translate-y-1/2 md:opacity-100" : "translate-y-full md:-translate-y-[45%] md:opacity-0 md:pointer-events-none"
        }`}
      >
        <div className="mx-auto mt-[6px] h-[5px] w-9 shrink-0 rounded-full bg-[#c7c7cc] md:hidden" />
        <div className="flex items-center justify-between px-4 pb-2 pt-2.5">
          <div>
            <h2 className="text-[20px] font-bold">Keranjang</h2>
            <p className="text-[13px] text-secondary">{count} item</p>
          </div>
          <button onClick={() => setDrawer(false)} className="text-[17px] font-semibold text-ios-blue active:opacity-50">
            Selesai
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[17px] font-semibold">Keranjang masih kosong</p>
              <p className="mt-1 text-[15px] text-secondary">Keliling dulu ke section yang kamu mau.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[10px] bg-card">
              {lines.map((l) => (
                <div key={l.id} className="group/cell flex items-center gap-3 pl-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-background">
                    <ProductImage p={l} size={40} className="drop-shadow-none" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2 border-b border-separator py-2.5 pr-3 group-last/cell:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{l.name}</p>
                      <p className="text-[13px] text-secondary">{rupiah(l.subtotal)}</p>
                    </div>
                    <Stepper value={l.qty} onMinus={() => remove(l.id)} onPlus={() => add(l.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-separator bg-background px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 md:pb-5">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[15px] text-secondary">Total</span>
            <span className="text-[22px] font-bold tabular-nums">{rupiah(total)}</span>
          </div>
          <PrimaryButton
            disabled={lines.length === 0}
            onClick={() => {
              setDrawer(false);
              router.push("/keranjang");
            }}
          >
            Lihat Ringkasan Belanja
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
