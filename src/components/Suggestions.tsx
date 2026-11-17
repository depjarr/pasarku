"use client";

import { useCart } from "@/lib/cart";
import { usePriceOf } from "@/lib/harga";
import { productById, rupiah } from "@/lib/data";
import { useProductSheet } from "@/lib/productSheet";
import { useHydrated } from "@/lib/useHydrated";
import { ProductImage } from "./ProductImage";
import { QtyControl } from "./QtyControl";

export type Suggestion = { productId: string; alasan: string; untuk?: string };

/** Daftar saran "Lengkapi bahan" — tiap baris bisa langsung dimasukkan ke keranjang. */
export function SuggestionList({ items }: { items: Suggestion[] }) {
  const hydrated = useHydrated();
  const cart = useCart((s) => s.items);
  const open = useProductSheet((s) => s.open);
  const priceOf = usePriceOf();

  return (
    <div className="divide-y divide-separator">
      {items.map((s) => {
        const p = productById[s.productId];
        if (!p) return null;
        return (
          <div key={s.productId} className="flex items-center gap-3 px-3 py-2.5">
            <button onClick={() => open(p.id)} aria-label={`Lihat detail ${p.name}`} className="grid h-14 w-14 shrink-0 place-items-center rounded-[12px] bg-[#f4f8f1]">
              <ProductImage p={p} size={46} className="drop-shadow-none" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-tight">{p.name}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-[#3c5a40]">{s.alasan.charAt(0).toUpperCase() + s.alasan.slice(1)}</p>
              <p className="mt-0.5 text-[12px] text-secondary tabular-nums">
                {rupiah(priceOf(p))} per {p.unit}
                {s.untuk && <>, untuk {s.untuk}</>}
              </p>
            </div>
            <QtyControl id={p.id} qty={hydrated ? cart[p.id] ?? 0 : 0} />
          </div>
        );
      })}
    </div>
  );
}
