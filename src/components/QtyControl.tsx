"use client";

import { useCart } from "@/lib/cart";
import { productById } from "@/lib/data";
import { useFly } from "@/lib/fly";

/** Tombol tambah di rak: lingkaran "+" lalu berubah jadi pil −/jumlah/+. */
export function QtyControl({ id, qty }: { id: string; qty: number }) {
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const launch = useFly((s) => s.launch);

  const addAndFly = (e: React.MouseEvent<HTMLButtonElement>) => {
    // kalau tombol ada di rak, terbangkan foto produknya ke keranjang
    const photo = e.currentTarget.closest("[data-product]")?.querySelector("img");
    if (photo) launch(productById[id].img, photo.getBoundingClientRect());
    add(id);
  };

  if (qty === 0) {
    return (
      <button
        onClick={addAndFly}
        aria-label="Tambah ke keranjang"
        className="grid h-8 w-8 place-items-center rounded-full bg-white text-[22px] font-medium leading-none text-brand-ink shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition active:scale-90"
      >
        +
      </button>
    );
  }
  return (
    <div className="flex h-8 items-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
      <button onClick={() => remove(id)} aria-label="Kurangi" className="grid h-8 w-8 place-items-center text-[20px] text-brand-ink active:opacity-40">
        −
      </button>
      <span className="min-w-4 text-center text-[15px] font-semibold tabular-nums">{qty}</span>
      <button onClick={addAndFly} aria-label="Tambah" className="grid h-8 w-8 place-items-center text-[20px] text-brand-ink active:opacity-40">
        +
      </button>
    </div>
  );
}
