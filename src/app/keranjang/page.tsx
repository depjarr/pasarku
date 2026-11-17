"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BasketIcon, Cell, Group, NavBar, PrimaryButton, SparklesIcon, Stepper } from "@/components/ios";
import { ProductImage } from "@/components/ProductImage";
import { useCart, useCartLines } from "@/lib/cart";
import { rupiah, sections } from "@/lib/data";
import { useHydrated } from "@/lib/useHydrated";

export default function CartSummary() {
  const hydrated = useHydrated();
  const { lines, total, count } = useCartLines();
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const router = useRouter();

  const grouped = sections.map((s) => ({ s, items: lines.filter((l) => l.sectionId === s.id) })).filter((g) => g.items.length);

  return (
    <main className="pb-tabbar flex-1">
      <NavBar title="Keranjang">
        <p className="text-[15px] text-secondary">{hydrated ? `${count} item dari ${grouped.length} section` : " "}</p>
      </NavBar>

      {hydrated && lines.length === 0 ? (
        <div className="px-8 pt-24 text-center">
          <BasketIcon className="mx-auto h-14 w-14 text-tertiary" />
          <p className="mt-3 text-[20px] font-semibold">Keranjang Kosong</p>
          <p className="mt-1 text-[15px] text-secondary">Bahan yang kamu ambil dari rak akan muncul di sini.</p>
          <Link href="/" className="mt-5 inline-block text-[17px] text-ios-blue">Mulai Belanja</Link>
        </div>
      ) : hydrated ? (
        // HP: satu kolom · Tablet & layar sangat lebar: daftar barang kiri, preferensi + tombol kanan
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_380px] md:items-start xl:block 2xl:grid">
          <div>
          {grouped.map(({ s, items }) => (
            <Group key={s.id} header={s.name}>
              {items.map((l) => (
                <Cell
                  key={l.id}
                  leading={<div className="grid h-11 w-11 place-items-center rounded-[10px] bg-background"><ProductImage p={l} size={36} className="drop-shadow-none" /></div>}
                  trailing={<Stepper value={l.qty} onMinus={() => remove(l.id)} onPlus={() => add(l.id)} />}
                >
                  <p className="truncate text-[15px] font-medium">{l.name}</p>
                  <p className="text-[13px] text-secondary tabular-nums">{rupiah(l.subtotal)}, {l.qty} × {l.unit}</p>
                </Cell>
              ))}
            </Group>
          ))}

          </div>
          <div className="md:pb-4">
          <Group header="Ringkasan" footer="Jumlah orang & tujuan kesehatan dipilih di langkah berikutnya, sebelum AI meracik menu.">
            <Cell trailing={<span className="text-secondary tabular-nums">{rupiah(total)}</span>}>Subtotal</Cell>
            <Cell trailing={<span className="text-brand-ink">Gratis</span>}>Ongkos kirim</Cell>
            <Cell trailing={<span className="font-semibold tabular-nums">{rupiah(total)}</span>}><span className="font-semibold">Total</span></Cell>
          </Group>

          <div className="mx-4 mt-6 md:mx-8">
            <PrimaryButton onClick={() => router.push("/rekomendasi")}>
              <SparklesIcon className="h-5 w-5" /> Rekomendasi Menu Makanan
            </PrimaryButton>
            <p className="mt-2 text-center text-[13px] text-secondary">AI meracik menu + resep lengkap dari bahan di keranjangmu</p>
          </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
