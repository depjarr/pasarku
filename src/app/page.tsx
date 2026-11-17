"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { BasketArt } from "@/components/Basket";
import { BasketIcon, Cell, ChevronRight, Group, SearchIcon, SparklesIcon, XIcon } from "@/components/ios";
import { ProductImage } from "@/components/ProductImage";
import { QtyControl } from "@/components/QtyControl";
import { useCart, useCartLines } from "@/lib/cart";
import { productById, products, rupiah, sections, type Product } from "@/lib/data";
import { AppLogo } from "@/components/AppLogo";
import { WebPhoto } from "@/components/WebPhoto";
import { useCookbook } from "@/lib/cookbook";
import { useLivePrice, usePriceOf } from "@/lib/harga";
import { IntroButton } from "@/components/Onboarding";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useProductSheet } from "@/lib/productSheet";
import { useHydrated } from "@/lib/useHydrated";

/* ───────────── konten beranda ───────────── */

// 3 produk yang mewakili tiap section (untuk ubin kategori)
const SECTION_PICS: Record<string, string[]> = {
  buah: ["pisang", "apel", "anggur"],
  sayur: ["brokoli", "wortel", "tomat"],
  daging: ["sapi-has", "ayam-utuh", "sapi-giling"],
  ikan: ["salmon", "udang", "kembung"],
  "susu-telur": ["telur-ayam", "tahu", "susu"],
  karbo: ["beras", "roti-tawar", "kentang"],
  bumbu: ["bawang-merah", "cabai-merah", "jahe"],
  sembako: ["gula-pasir", "kacang-merah", "madu"],
};

// isi keranjang di hero
const HERO_BASKET = ["brokoli", "paprika-merah", "pisang", "anggur", "tomat", "apel", "wortel", "roti-bulat", "susu", "jagung", "jeruk", "alpukat", "nanas", "selada"];

// buah & sayur yang sedang musim di Indonesia (akhir tahun: musim rambutan, durian, manggis, mangga)
const IN_SEASON = ["rambutan", "durian", "manggis", "mangga", "salak", "buah-naga", "alpukat", "petai"];

const img = (id: string) => productById[id]?.img;

const SparkI = (p: { className?: string }) => <SparklesIcon className={p.className ?? "h-5 w-5"} />;

/* ───────────── halaman ───────────── */

export default function Home() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setDrawer = useCart((s) => s.setDrawer);
  const { count } = useCartLines();
  const [q, setQ] = useState("");
  const openProduct = useProductSheet((s) => s.open);
  const priceOf = usePriceOf();

  const inCart = (sectionId: string) =>
    hydrated ? products.filter((p) => p.sectionId === sectionId).reduce((a, p) => a + (items[p.id] ?? 0), 0) : 0;
  const results = q.trim() ? products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 30) : [];

  const search = (
    <label className="flex h-11 items-center gap-2 rounded-[12px] bg-white px-3 text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04]">
      <SearchIcon className="h-[18px] w-[18px]" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari bahan, mis. tempe, bayam…"
        className="h-full flex-1 bg-transparent text-[16px] text-label outline-none placeholder:text-secondary"
      />
      {q && (
        <button onClick={() => setQ("")} aria-label="Hapus pencarian" className="grid h-5 w-5 place-items-center rounded-full bg-[#8e8e93] text-white">
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </label>
  );

  return (
    <main className="pb-tabbar flex-1">
      {/* ───── header HP & tablet ───── */}
      <header className="sticky top-0 z-30 bg-background/90 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl md:px-8 xl:hidden">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo size={40} />
            <span className="leading-tight">
              <span className="block text-[18px] font-bold">PasarKu</span>
              <span className="block text-[11px] text-secondary">Pasar segar & dapur AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
          <IntroButton className="grid h-10 w-10 place-items-center rounded-full bg-white text-label shadow-sm ring-1 ring-black/[0.04] active:opacity-60" />
          <ThemeToggle className="grid h-10 w-10 place-items-center rounded-full bg-white text-label shadow-sm ring-1 ring-black/[0.04] active:opacity-60" />
          <button onClick={() => setDrawer(true)} aria-label="Buka keranjang" className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] active:opacity-60">
            <BasketIcon className="h-[22px] w-[22px] text-label" />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ios-red px-1 text-[11px] font-semibold text-white">{count}</span>
            )}
          </button>
          </div>
        </div>
        {search}
      </header>

      {/* ───── header laptop ───── */}
      <div className="hidden px-10 pt-7 xl:block">{search}</div>

      {q.trim() ? (
        <Group header={`${results.length} hasil untuk “${q}”`}>
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[15px] text-secondary">Tidak ada bahan bernama “{q}”.</p>
          ) : (
            results.map((p) => (
              <Cell
                key={p.id}
                onClick={() => openProduct(p.id)}
                leading={<div className="grid h-11 w-11 place-items-center rounded-[10px] bg-background"><ProductImage p={p} size={36} className="drop-shadow-none" /></div>}
                trailing={<ChevronRight className="h-4 w-4 text-tertiary" />}
              >
                <p className="truncate text-[17px]">{p.name}</p>
                <p className="text-[13px] text-secondary">{rupiah(priceOf(p))} per {p.unit}, di {sections.find((s) => s.id === p.sectionId)?.name}</p>
              </Cell>
            ))
          )}
        </Group>
      ) : (
        <>
          <HeroMobile />
          <HeroDesktop />

          {/* ───── kategori ───── */}
          <SectionTitle id="kategori" title="Belanja per Kategori" />
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-4 md:gap-4 md:px-8 xl:grid-cols-8 xl:gap-3 xl:px-10">
            {sections.map((s) => {
              const n = inCart(s.id);
              return (
                <Link key={s.id} href={`/section/${s.id}`} className="group flex flex-col items-center text-center">
                  <span className="relative grid aspect-square w-full place-items-center rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] transition group-hover:-translate-y-0.5 group-hover:shadow-md group-active:scale-95">
                    <span className="relative h-[72%] w-[72%]">
                      {SECTION_PICS[s.id].map((id, i) => (
                        <img
                          key={id}
                          src={img(id)}
                          alt=""
                          className="absolute object-contain drop-shadow-[0_3px_3px_rgba(0,0,0,0.15)]"
                          style={[
                            { left: "0%", top: "18%", width: "60%", height: "60%" },
                            { right: "0%", top: "0%", width: "58%", height: "58%" },
                            { left: "22%", bottom: "-4%", width: "62%", height: "62%" },
                          ][i]}
                        />
                      ))}
                    </span>
                    {n > 0 && <span className="absolute right-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">{n}</span>}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-tight md:text-[14px]">{s.name}</span>
                </Link>
              );
            })}
          </div>

          {/* ───── banner promo (tablet & laptop) ───── */}
          <div className="hidden gap-4 px-8 pt-8 md:grid md:grid-cols-[1.5fr_1fr] xl:px-10">
            <Link href="/section/buah" className="relative overflow-hidden rounded-[22px] bg-[#1f4d2c] p-6 text-white">
              <p className="text-[14px] font-semibold text-[#a7e0b0]">Lagi musim</p>
              <p className="mt-1 text-[28px] font-extrabold leading-tight">Buah tropis<br />akhir tahun</p>
              <p className="mt-2 max-w-[220px] text-[13px] text-white/80">Rambutan, durian, manggis & mangga lagi manis-manisnya.</p>
              <span className="mt-4 inline-block rounded-full bg-[#34c759] px-4 py-2 text-[13px] font-bold">Belanja Buah</span>
              <div className="absolute -bottom-2 right-2 flex items-end">
                {["durian", "rambutan", "manggis", "mangga"].map((id, i) => (
                  <img key={id} src={img(id)} alt="" className="object-contain drop-shadow-lg" style={{ width: [130, 96, 90, 104][i], marginLeft: i ? -26 : 0 }} />
                ))}
              </div>
            </Link>
            <Link href="/keranjang" className="relative overflow-hidden rounded-[22px] bg-[#e8f5e2] p-6">
              <p className="text-[22px] font-extrabold leading-tight text-[#1f4d2c]">Masak apa<br />hari ini?</p>
              <p className="mt-2 max-w-[200px] text-[13px] text-[#3c5a40]">Dapur AI meracik menu, resep langkah demi langkah & info gizinya.</p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1f4d2c] px-4 py-2 text-[13px] font-bold text-white"><SparkI className="h-4 w-4" /> Coba Dapur AI</span>
              <SparklesIcon className="absolute -bottom-4 -right-4 h-36 w-36 text-[#34c759]/25" />
            </Link>
          </div>

          {/* ───── produk musiman ───── */}
          <SectionTitle title="Lagi Musim" link={{ href: "/section/buah", label: "Lihat semua" }} />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 md:grid md:grid-cols-4 md:overflow-visible md:px-8 xl:px-10">
            {IN_SEASON.map((id) => productById[id] && <ProductCard key={id} p={productById[id]} />)}
          </div>

          {/* ───── masak lagi dari rantang / cara pakai ───── */}
          <FromRantang />

          <Footer />
        </>
      )}
    </main>
  );
}

/* ───────────── hero HP & tablet ───────────── */

function HeroMobile() {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-2 md:hidden">
      {/* kartu promo utama */}
      <Link href="#kategori" className="relative flex h-[176px] w-[88%] shrink-0 snap-center overflow-hidden rounded-[22px] bg-[#1f4d2c] p-5 text-white">
        <div className="relative z-10 max-w-[54%]">
          <p className="text-[13px] font-semibold text-[#a7e0b0]">Segar setiap hari</p>
          <p className="mt-1 text-[19px] font-extrabold leading-[1.15]">Bahan segar,<br />masak lebih sehat</p>
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[13px] font-bold text-[#1f4d2c]">Mulai Belanja</span>
        </div>
        <BasketArt images={HERO_BASKET.map(img).filter(Boolean) as string[]} className="absolute -bottom-3 -right-5 w-[190px]" />
      </Link>
      {/* kartu Dapur AI */}
      <Link href="/keranjang" className="relative flex h-[176px] w-[88%] shrink-0 snap-center overflow-hidden rounded-[22px] bg-[#c7f07a] p-5">
        <div className="relative z-10 max-w-[62%]">
          <p className="text-[13px] font-semibold text-[#2d5a1a]">Dapur AI</p>
          <p className="mt-1 text-[19px] font-extrabold leading-[1.15] text-[#1f3d12]">Keranjang jadi menu & resep lengkap</p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#1f4d2c] px-4 py-1.5 text-[13px] font-bold text-white"><SparkI className="h-4 w-4" /> Coba</span>
        </div>
        <SparklesIcon className="absolute -bottom-6 -right-6 h-40 w-40 text-[#1f4d2c]/15" />
      </Link>
    </div>
  );
}

/* ───────────── hero laptop (gaya situs belanja) ───────────── */

function HeroDesktop() {
  return (
    <section className="mx-8 mt-2 hidden overflow-hidden rounded-[28px] bg-[#eef6e9] md:block xl:mx-10 xl:mt-6">
      <div className="grid grid-cols-[1.05fr_1fr] items-center gap-4 px-8 pt-8 xl:px-10 xl:pt-10">
        <div>
          <p className="text-[15px] font-semibold text-[#2f8a45]">Segar setiap hari</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.05] tracking-tight xl:text-[44px]">
            Belanja ke pasar,<br />
            pulang bawa resep.
          </h1>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-[#3c3c43]">
            Belanja sayur, buah, daging, ikan & bumbu segar — lalu biarkan Dapur AI meracik menu, resep, dan info gizinya untukmu.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="#kategori" className="whitespace-nowrap rounded-[12px] bg-[#1f4d2c] px-5 py-3 text-[14px] font-bold text-white hover:brightness-110">
              Mulai Belanja
            </Link>
            <Link href="/keranjang" className="flex items-center gap-1.5 whitespace-nowrap rounded-[12px] border border-[#1f4d2c]/25 bg-white px-5 py-3 text-[14px] font-bold text-[#1f4d2c] hover:bg-[#f6fbf3]">
              <SparkI className="h-4 w-4" /> Coba Dapur AI
            </Link>
          </div>
        </div>
        <div className="relative">
          <PriceTag id="cabai-merah" />
          <BasketArt images={HERO_BASKET.map(img).filter(Boolean) as string[]} className="ml-auto w-[300px] max-w-full xl:w-[380px]" />
        </div>
      </div>
      <div className="h-6" />
    </section>
  );
}

/* ───────────── komponen kecil ───────────── */

/** Label harga kertas ala lapak pasar, menggantung di samping keranjang. */
function PriceTag({ id }: { id: string }) {
  const p = productById[id];
  const live = useLivePrice(id);
  if (!p) return null;
  return (
    <div className="absolute left-0 top-0 z-10 origin-top -rotate-6">
      <svg viewBox="0 0 40 30" className="mx-auto h-[30px] w-[40px]" aria-hidden>
        <path d="M20 0 C18 10 22 18 20 30" stroke="#9a8a5a" strokeWidth="1.6" fill="none" />
      </svg>
      <div className="relative rounded-[10px] bg-[#fff8dc] px-4 pb-3 pt-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4)] ring-1 ring-[#e7d9a2]">
        <span className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#eef6e9] ring-1 ring-[#d4c58c]" />
        <p className="text-[12px] font-medium text-[#8a6a1a]">{live ? "Harga hari ini" : "Harga perkiraan"}</p>
        <p className="text-[15px] font-bold text-[#3a2a05]">{p.name}</p>
        <p className="text-[22px] font-extrabold leading-tight tabular-nums text-[#c8321e]">{rupiah(live?.price ?? p.price)}</p>
        <p className="text-[12px] text-[#6b5a2a]">per {p.unit}</p>
      </div>
    </div>
  );
}

/** Beranda bagian bawah: resep terakhir dari rantang, atau cara pakai singkat kalau rantang masih kosong. */
function FromRantang() {
  const hydrated = useHydrated();
  const items = useCookbook((s) => s.items);
  const recent = hydrated ? items.slice(0, 4) : [];

  if (recent.length > 0)
    return (
      <>
        <SectionTitle title="Masak lagi dari rantang" link={{ href: "/resep-saya", label: "Buka rantang" }} />
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 md:grid md:grid-cols-4 md:overflow-visible md:px-8 xl:px-10">
          {recent.map((r) => (
            <Link key={r.id} href={`/resep-saya/${r.id}`} className="w-[200px] shrink-0 overflow-hidden rounded-[16px] bg-white active:opacity-70 md:w-auto">
              <div className="relative h-[110px] bg-[#eef4ea]">
                <WebPhoto query={r.menu.kataKunciFoto ?? r.menu.nama} className="h-full w-full" fallback={null} />
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-[15px] font-semibold leading-tight">{r.menu.nama}</p>
                <p className="mt-1 text-[12px] text-secondary">{r.menu.porsi} porsi, {r.menu.waktuMasakMenit} menit</p>
              </div>
            </Link>
          ))}
        </div>
      </>
    );

  const steps = [
    { title: "Pilih bahan", text: "Keliling section dan masukkan bahan ke keranjang." },
    { title: "Racik di Menu AI", text: "Tentukan untuk berapa orang, AI menyusun menu dan resepnya." },
    { title: "Simpan di rantang", text: "Semua resep tersimpan otomatis untuk dimasak lagi." },
  ];
  return (
    <>
      <SectionTitle title="Cara belanja di PasarKu" />
      <ol className="mx-4 grid gap-2 md:mx-8 md:grid-cols-3 xl:mx-10">
        {steps.map((st, i) => (
          <li key={st.title} className="flex gap-3 rounded-[16px] bg-white p-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1f4d2c] text-[14px] font-bold text-white">{i + 1}</span>
            <span>
              <span className="block text-[15px] font-semibold">{st.title}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-secondary">{st.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function SectionTitle({ title, id, link }: { title: string; id?: string; link?: { href: string; label: string } }) {
  return (
    <div id={id} className="flex scroll-mt-32 items-end justify-between px-4 pb-3 pt-8 md:px-8 xl:px-10">
      <h2 className="text-[20px] font-bold md:text-[22px]">{title}</h2>
      {link && (
        <Link href={link.href} className="text-[14px] font-semibold text-[#2f8a45]">
          {link.label}
        </Link>
      )}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const hydrated = useHydrated();
  const live = useLivePrice(p.id);
  const open = useProductSheet((s) => s.open);
  const qty = useCart((s) => s.items[p.id] ?? 0);
  return (
    <div className="w-[150px] shrink-0 rounded-[18px] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:w-auto">
      <button onClick={() => open(p.id)} aria-label={`Lihat detail ${p.name}`} className="relative grid aspect-square w-full place-items-center rounded-[14px] bg-[#f4f8f1] active:scale-[0.98]">
        <span className="absolute left-2 top-2 rounded-full bg-[#2f8a45] px-2 py-0.5 text-[11px] font-semibold text-white">Musim</span>
        <ProductImage p={p} size={96} className="md:!h-[120px] md:!w-[120px]" />
      </button>
      <p className="mt-2 line-clamp-1 text-[14px] font-semibold">{p.name}</p>
      <p className="text-[12px] text-secondary">{p.unit}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[15px] font-bold tabular-nums">{rupiah(live?.price ?? p.price)}</span>
        <QtyControl id={p.id} qty={hydrated ? qty : 0} />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mx-10 mb-4 mt-10 hidden rounded-[24px] bg-[#1f4d2c] px-8 py-8 text-white xl:block">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-8">
        <div>
          <p className="flex items-center gap-2 text-[20px] font-bold">
            <AppLogo size={36} />
            PasarKu
          </p>
          <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-white/75">
            Supermarket virtual dengan Dapur AI: belanja bahan segar lalu dapatkan rekomendasi menu, resep lengkap, dan info gizi.
          </p>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#a7e0b0]">Kategori</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-white/80">
            {sections.slice(0, 5).map((s) => (
              <li key={s.id}><Link href={`/section/${s.id}`} className="hover:text-white">{s.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#a7e0b0]">Fitur</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-white/80">
            <li><Link href="/keranjang" className="hover:text-white">Keranjang</Link></li>
            <li><Link href="/rekomendasi" className="hover:text-white">Rekomendasi Menu AI</Link></li>
            <li><Link href="/resep-saya" className="hover:text-white">Rantang Resep</Link></li>
          </ul>
        </div>
      </div>
      <p className="mt-8 border-t border-white/15 pt-4 text-[11px] text-white/55">
        © 2026 PasarKu, proyek portofolio. Foto bahan: TheMealDB & Wikimedia Commons. Harga bahan pokok (beras, bawang, cabai, daging, telur, gula, minyak, ikan) mengikuti Panel Harga Badan Pangan Nasional; bahan lain memakai harga perkiraan supermarket Indonesia.
      </p>
    </footer>
  );
}
