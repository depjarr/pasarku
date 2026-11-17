"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { Basket } from "@/components/Basket";
import { NavBar, Segmented } from "@/components/ios";
import { ProductImage } from "@/components/ProductImage";
import { QtyControl } from "@/components/QtyControl";
import { useCart } from "@/lib/cart";
import { products, rupiah, sections, type Product } from "@/lib/data";
import { useHydrated } from "@/lib/useHydrated";

export function SectionView({ id }: { id: string }) {
  const section = sections.find((s) => s.id === id);
  if (!section) notFound();
  const [shelf, setShelf] = useState(section.shelves[0]);

  const jump = (name: string) => {
    setShelf(name);
    document.getElementById(`rak-${name}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="wall flex-1 pb-[300px]">
      <NavBar title={section.name} back={{ href: "/", label: "Toko" }}>
        <p className="text-[15px] text-secondary">{section.tagline} · geser rak ke samping</p>
        {section.shelves.length > 1 && (
          <div className="mt-3 md:max-w-[560px]">
            <Segmented options={section.shelves.map((s) => ({ value: s, label: s }))} value={shelf} onChange={jump} />
          </div>
        )}
      </NavBar>

      {section.shelves.map((name) => (
        <Shelf key={name} title={name} items={products.filter((p) => p.sectionId === id && p.shelf === name)} />
      ))}

      <Basket />
    </main>
  );
}

function Shelf({ title, items }: { title: string; items: Product[] }) {
  return (
    <section id={`rak-${title}`} className="mt-6 scroll-mt-14">
      <h2 className="flex items-baseline justify-between px-4 text-[20px] font-bold md:px-8 md:text-[22px]">
        {title}
        <span className="text-[13px] font-normal text-secondary">{items.length} item</span>
      </h2>

      <div className="no-scrollbar mt-1 snap-x snap-mandatory overflow-x-auto scroll-px-4 md:scroll-px-8">
        <div className="flex w-max gap-3 px-4 pt-3 md:gap-5 md:px-8">
          {items.map((p) => (
            <ShelfItem key={p.id} p={p} />
          ))}
        </div>
        {/* papan rak */}
        <div className="shelf-board h-3 w-full min-w-max" />
        <div className="flex w-max gap-3 px-4 pt-2 md:gap-5 md:px-8">
          {items.map((p) => (
            <div key={p.id} className="w-[104px] text-center md:w-[140px]">
              <span className="inline-block rounded-[6px] bg-white px-2 py-0.5 text-[13px] font-semibold tabular-nums shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                {rupiah(p.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShelfItem({ p }: { p: Product }) {
  const hydrated = useHydrated();
  const qty = useCart((s) => s.items[p.id] ?? 0);
  const shown = hydrated ? qty : 0;

  return (
    <div data-product className="relative flex w-[104px] shrink-0 snap-start flex-col items-center md:w-[140px]">
      <div className="relative grid h-[92px] w-[92px] place-items-center md:h-[124px] md:w-[124px]">
        <ProductImage p={p} size={84} className="md:!h-[112px] md:!w-[112px]" />
        <div className="absolute -right-2 bottom-0">
          <QtyControl id={p.id} qty={shown} />
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 min-h-[34px] text-center text-[13px] font-medium leading-tight md:text-[15px]">{p.name}</p>
      <p className="pb-2 text-[11px] text-secondary">{p.unit}</p>
    </div>
  );
}
