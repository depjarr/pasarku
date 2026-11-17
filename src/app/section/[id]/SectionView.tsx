"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { Basket } from "@/components/Basket";
import { NavBar, Segmented } from "@/components/ios";
import { ProductImage } from "@/components/ProductImage";
import { QtyControl } from "@/components/QtyControl";
import { useCart } from "@/lib/cart";
import { products, rupiah, sections, type Product } from "@/lib/data";
import { productInfo } from "@/lib/productInfo";
import { useHarga, usePriceOf } from "@/lib/harga";
import { useProductSheet } from "@/lib/productSheet";
import { useHydrated } from "@/lib/useHydrated";

type Sort = "default" | "murah" | "protein" | "kalori";
const SORTS: { value: Sort; label: string }[] = [
  { value: "default", label: "Semua" },
  { value: "murah", label: "Termurah" },
  { value: "protein", label: "Protein tertinggi" },
  { value: "kalori", label: "Kalori terendah" },
];

function sortItems(items: Product[], sort: Sort, priceOf: (p: Product) => number) {
  if (sort === "default") return items;
  const g = (p: Product) => productInfo(p.id)?.gizi;
  const arr = [...items];
  if (sort === "murah") arr.sort((a, b) => priceOf(a) - priceOf(b));
  // produk tanpa data gizi diletakkan di belakang
  if (sort === "protein") arr.sort((a, b) => (g(b)?.protein ?? -1) - (g(a)?.protein ?? -1));
  if (sort === "kalori") arr.sort((a, b) => (g(a)?.kalori ?? 1e9) - (g(b)?.kalori ?? 1e9));
  return arr;
}

export function SectionView({ id }: { id: string }) {
  const section = sections.find((s) => s.id === id);
  if (!section) notFound();
  const [shelf, setShelf] = useState(section.shelves[0]);
  const [sort, setSort] = useState<Sort>("default");

  const priceOf = usePriceOf();
  const jump = (name: string) => {
    setShelf(name);
    document.getElementById(`rak-${name}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="wall flex-1 pb-[300px]">
      <NavBar title={section.name} back={{ href: "/", label: "Toko" }}>
        <p className="text-[15px] text-secondary">{section.tagline}. Ketuk produk untuk melihat gizinya.</p>
        {section.shelves.length > 1 && (
          <div className="mt-3 md:max-w-[560px]">
            <Segmented options={section.shelves.map((s) => ({ value: s, label: s }))} value={shelf} onChange={jump} />
          </div>
        )}
        {/* urutkan produk di semua rak */}
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              aria-pressed={sort === s.value}
              className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition ${
                sort === s.value ? "bg-[#1f4d2c] text-white" : "bg-white text-label ring-1 ring-black/[0.06]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </NavBar>

      {section.shelves.map((name) => (
        <Shelf key={name} title={name} sort={sort} items={sortItems(products.filter((p) => p.sectionId === id && p.shelf === name), sort, priceOf)} />
      ))}

      <Basket />
    </main>
  );
}

function Shelf({ title, items, sort }: { title: string; items: Product[]; sort: Sort }) {
  const hydrated = useHydrated();
  const priceOf = usePriceOf();
  const liveItems = useHarga((s) => s.items);
  const liveIds = new Set(hydrated ? Object.keys(liveItems) : []);
  return (
    <section id={`rak-${title}`} className="mt-6 scroll-mt-14">
      <h2 className="flex items-baseline justify-between px-4 text-[20px] font-bold md:px-8 md:text-[22px]">
        {title}
        <span className="text-[13px] font-normal text-secondary">{items.length} item</span>
      </h2>

      <div className="no-scrollbar mt-1 snap-x snap-mandatory overflow-x-auto scroll-px-4 md:scroll-px-8">
        <div className="flex w-max gap-3 px-4 pt-3 md:gap-5 md:px-8">
          {items.map((p) => (
            <ShelfItem key={p.id} p={p} sort={sort} />
          ))}
        </div>
        {/* papan rak */}
        <div className="shelf-board h-3 w-full min-w-max" />
        <div className="flex w-max gap-3 px-4 pt-2 md:gap-5 md:px-8">
          {items.map((p) => (
            <div key={p.id} className="w-[104px] text-center md:w-[140px]">
              <span
                title={liveIds.has(p.id) ? "Harga rata-rata nasional hari ini (Badan Pangan Nasional)" : "Harga perkiraan"}
                className="price-tag inline-flex items-center gap-1 rounded-[6px] bg-white px-2 py-0.5 text-[13px] font-semibold tabular-nums shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              >
                {liveIds.has(p.id) && <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" aria-label="harga hari ini" />}
                {rupiah(priceOf(p))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShelfItem({ p, sort }: { p: Product; sort: Sort }) {
  const hydrated = useHydrated();
  const qty = useCart((s) => s.items[p.id] ?? 0);
  const open = useProductSheet((s) => s.open);
  const shown = hydrated ? qty : 0;
  const gizi = productInfo(p.id)?.gizi;
  // saat diurutkan menurut gizi, tampilkan angkanya di bawah nama
  const badge = gizi && sort === "protein" ? `${Math.round(gizi.protein)} g protein` : gizi && sort === "kalori" ? `${Math.round(gizi.kalori)} kkal` : null;

  return (
    <div data-product className="relative flex w-[104px] shrink-0 snap-start flex-col items-center md:w-[140px]">
      <div className="relative grid h-[92px] w-[92px] place-items-center md:h-[124px] md:w-[124px]">
        <button onClick={() => open(p.id)} aria-label={`Lihat detail ${p.name}`} className="transition active:scale-95">
          <ProductImage p={p} size={84} className="md:!h-[112px] md:!w-[112px]" />
        </button>
        <div className="absolute -right-2 bottom-0">
          <QtyControl id={p.id} qty={shown} />
        </div>
      </div>
      <button onClick={() => open(p.id)} className="mt-1.5 line-clamp-2 min-h-[34px] text-center text-[13px] font-medium leading-tight md:text-[15px]">
        {p.name}
      </button>
      <p className="pb-2 text-[11px] text-secondary">{badge ? <span className="font-semibold text-brand-ink">{badge} / 100 g</span> : p.unit}</p>
    </div>
  );
}
