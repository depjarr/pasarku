"use client";

import Link from "next/link";
import { useState } from "react";
import { BasketIcon, Cell, ChevronRight, Group, NavBar, SearchIcon, SparklesIcon, XIcon } from "@/components/ios";
import { ProductImage } from "@/components/ProductImage";
import { useCart, useCartLines } from "@/lib/cart";
import { products, rupiah, sections } from "@/lib/data";
import { useHydrated } from "@/lib/useHydrated";

export default function StoreMap() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setDrawer = useCart((s) => s.setDrawer);
  const { count } = useCartLines();
  const [q, setQ] = useState("");

  const inCart = (sectionId: string) =>
    hydrated ? products.filter((p) => p.sectionId === sectionId).reduce((a, p) => a + (items[p.id] ?? 0), 0) : 0;
  const results = q.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 30)
    : [];

  return (
    <main className="pb-tabbar flex-1">
      <NavBar
        title="PasarKu"
        right={
          <button onClick={() => setDrawer(true)} aria-label="Buka keranjang" className="relative grid h-9 w-9 place-items-center text-ios-blue active:opacity-50 xl:hidden">
            <BasketIcon className="h-6 w-6" />
            {hydrated && count > 0 && (
              <span className="absolute right-0 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ios-red px-1 text-[10px] font-semibold text-white">{count}</span>
            )}
          </button>
        }
      >
        <p className="text-[15px] text-secondary">Pilih section, ambil bahan, biar AI yang racik menunya.</p>
        <label className="mt-3 flex h-9 items-center gap-1.5 rounded-[10px] bg-fill px-2 text-secondary">
          <SearchIcon className="h-[18px] w-[18px]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari bahan, mis. tempe, bayam…"
            className="h-full flex-1 bg-transparent text-[17px] text-label outline-none placeholder:text-secondary"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Hapus pencarian" className="grid h-5 w-5 place-items-center rounded-full bg-[#8e8e93] text-white">
              <XIcon className="h-3 w-3" />
            </button>
          )}
        </label>
      </NavBar>

      {q.trim() ? (
        <Group header={`${results.length} hasil`}>
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[15px] text-secondary">Tidak ada bahan bernama “{q}”.</p>
          ) : (
            results.map((p) => (
              <Cell
                key={p.id}
                href={`/section/${p.sectionId}`}
                leading={<div className="grid h-11 w-11 place-items-center rounded-[10px] bg-background"><ProductImage p={p} size={36} className="drop-shadow-none" /></div>}
                trailing={<ChevronRight className="h-4 w-4 text-tertiary" />}
              >
                <p className="truncate text-[17px]">{p.name}</p>
                <p className="text-[13px] text-secondary">
                  {rupiah(p.price)} · {p.unit} · {sections.find((s) => s.id === p.sectionId)?.name}
                </p>
              </Cell>
            ))
          )}
        </Group>
      ) : (
        <>
          <h2 className="px-4 pb-2 pt-6 text-[22px] font-bold md:px-8">Denah Toko</h2>
          <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-3 md:gap-4 md:px-8 xl:grid-cols-3 2xl:grid-cols-4">
            {sections.map((s) => {
              const list = products.filter((p) => p.sectionId === s.id);
              const n = inCart(s.id);
              return (
                <Link
                  key={s.id}
                  href={`/section/${s.id}`}
                  className="group relative overflow-hidden rounded-[16px] bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition active:scale-[0.97]"
                >
                  <div className="wall relative -mx-3 -mt-3 mb-2 px-2 pt-3">
                    <div className="flex justify-around">
                      {list.slice(0, 3).map((p) => <ProductImage key={p.id} p={p} size={40} className="md:!h-[56px] md:!w-[56px]" />)}
                    </div>
                    <div className="shelf-board mt-0.5 h-1.5" />
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <p className="line-clamp-2 text-[15px] font-semibold leading-tight">{s.name}</p>
                  </div>
                  <p className="mt-0.5 text-[12px] text-secondary">{list.length} produk</p>
                  {n > 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">{n}</span>
                  )}
                </Link>
              );
            })}
          </div>

          <Link href="/keranjang" className="mx-4 mt-4 flex md:mx-8 md:mt-6 md:p-5 items-center gap-3 rounded-[16px] bg-gradient-to-br from-[#34c759] to-[#1f9e48] p-4 text-white active:opacity-80">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20">
              <SparklesIcon className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-[17px] font-semibold">Dapur AI</span>
              <span className="block text-[13px] text-white/85">Ubah isi keranjang jadi menu sehat + resep lengkap</span>
            </span>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </Link>
        </>
      )}
    </main>
  );
}
