"use client";

/**
 * Tampilan laptop/PC (≥ 1280px) bergaya aplikasi macOS:
 * sidebar navigasi di kiri dan panel keranjang (inspector) di kanan.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useCart, useCartLines } from "@/lib/cart";
import { products, rupiah, sections } from "@/lib/data";
import { useHydrated } from "@/lib/useHydrated";
import { BasketIcon, PrimaryButton, SparklesIcon, Stepper, StoreIcon } from "./ios";
import { ProductImage } from "./ProductImage";
import { AppLogo } from "./AppLogo";
import { IntroButton } from "./Onboarding";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  return (
    <Suspense fallback={<SidebarView path="/" />}>
      <SidebarWithPath />
    </Suspense>
  );
}

function SidebarWithPath() {
  return <SidebarView path={usePathname()} />;
}

function SidebarView({ path }: { path: string }) {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const { count } = useCartLines();

  const main = [
    { href: "/", label: "Toko", Icon: StoreIcon, active: path === "/" },
    { href: "/keranjang", label: "Keranjang", Icon: BasketIcon, active: path === "/keranjang", badge: hydrated ? count : 0 },
    { href: "/rekomendasi", label: "Menu AI", Icon: SparklesIcon, active: path.startsWith("/rekomendasi") || path.startsWith("/resep") },
  ];

  const item = (active: boolean) =>
    `flex items-center gap-2.5 rounded-[7px] px-2.5 py-[6px] text-[14px] transition ${active ? "bg-black/[0.08] font-semibold" : "hover:bg-black/[0.04]"}`;

  return (
    <aside className="mac-sidebar fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-black/[0.08] xl:flex">
      <div className="flex items-center gap-2 px-5 pb-4 pt-6">
        {/* lampu jendela macOS — dekoratif */}
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
      </div>
      <Link href="/" className="mx-5 mb-5 flex items-center gap-2">
        <AppLogo size={40} />
        <span>
          <span className="block text-[17px] font-bold leading-tight">PasarKu</span>
          <span className="block text-[12px] text-secondary">Supermarket + Dapur AI</span>
        </span>
      </Link>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3">
        <div className="space-y-0.5">
          {main.map(({ href, label, Icon, active, badge }) => (
            <Link key={href} href={href} className={item(active)}>
              <Icon className={`h-[18px] w-[18px] ${active ? "text-ios-blue" : "text-ios-blue/80"}`} />
              <span className="flex-1">{label}</span>
              {!!badge && <span className="rounded-full bg-black/[0.08] px-1.5 text-[12px] font-semibold tabular-nums">{badge}</span>}
            </Link>
          ))}
        </div>

        <p className="mb-1 mt-6 px-2.5 text-[12px] font-semibold text-secondary">Section</p>
        <div className="space-y-0.5">
          {sections.map((s) => {
            const n = hydrated ? products.filter((p) => p.sectionId === s.id).reduce((a, p) => a + (items[p.id] ?? 0), 0) : 0;
            return (
              <Link key={s.id} href={`/section/${s.id}`} className={item(path === `/section/${s.id}`)}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 truncate">{s.name}</span>
                {n > 0 && <span className="text-[12px] tabular-nums text-secondary">{n}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="space-y-0.5 px-3 pb-1">
        <IntroButton withLabel className="w-full rounded-[7px] px-2.5 py-[6px] text-[14px] text-label hover:bg-black/[0.04]" />
        <ThemeToggle withLabel className="w-full rounded-[7px] px-2.5 py-[6px] text-[14px] text-label hover:bg-black/[0.04]" />
      </div>
      <p className="px-5 pb-4 pt-1 text-[11px] leading-snug text-secondary">Menu & resep dibuat oleh AI dari isi keranjang.</p>
    </aside>
  );
}

/** Panel keranjang yang selalu terlihat di kanan (laptop/PC). */
export function CartPanel() {
  const hydrated = useHydrated();
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const { lines, total, count } = useCartLines();
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 right-0 z-30 hidden w-[340px] flex-col border-l border-black/[0.08] bg-white/70 backdrop-blur-xl xl:flex">
      <div className="flex items-baseline justify-between px-5 pb-3 pt-7">
        <h2 className="text-[22px] font-bold">Keranjang</h2>
        <span className="text-[13px] text-secondary">{hydrated ? count : 0} item</span>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-3">
        {!hydrated || lines.length === 0 ? (
          <div className="px-4 pt-16 text-center">
            <BasketIcon className="mx-auto h-12 w-12 text-tertiary" />
            <p className="mt-2 text-[15px] font-semibold">Masih kosong</p>
            <p className="mt-1 text-[13px] text-secondary">Klik “+” pada produk di rak untuk menambahkannya.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 hover:bg-black/[0.03]">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[9px] bg-background">
                  <ProductImage p={l} size={36} className="drop-shadow-none" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{l.name}</p>
                  <p className="text-[12px] text-secondary tabular-nums">{rupiah(l.subtotal)}</p>
                </div>
                <div className="scale-90">
                  <Stepper value={l.qty} onMinus={() => remove(l.id)} onPlus={() => add(l.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-black/[0.08] px-5 pb-6 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[14px] text-secondary">Total</span>
          <span className="text-[22px] font-bold tabular-nums">{rupiah(hydrated ? total : 0)}</span>
        </div>
        <Link href="/keranjang" className="mt-1 block text-[12px] text-ios-blue hover:underline">
          Lihat ringkasan belanja
        </Link>
        <PrimaryButton className="mt-3" disabled={!hydrated || lines.length === 0} onClick={() => router.push("/rekomendasi")}>
          <SparklesIcon className="h-5 w-5" /> Rekomendasi Menu
        </PrimaryButton>
      </div>
    </aside>
  );
}
