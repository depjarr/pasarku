"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChefIcon, ClockIcon, FlameIcon, NavBar, PeopleIcon } from "@/components/ios";
import { RecipeActions } from "@/components/RecipeActions";
import { SuggestionList } from "@/components/Suggestions";
import { WebPhoto } from "@/components/WebPhoto";
import { productById } from "@/lib/data";
import { useCookbook } from "@/lib/cookbook";
import { useRecs } from "@/lib/recs";
import type { Menu, Technique } from "@/lib/schema";
import { useHydrated } from "@/lib/useHydrated";

/** Ilustrasi tiap teknik memasak: ikon + warna latar ubin langkah. */
const TECH: Record<Technique, { label: string; icon: string; bg: string }> = {
  siapkan: { label: "Siapkan", icon: "🧺", bg: "#f3efe4" },
  cuci: { label: "Cuci", icon: "💧", bg: "#e4f1fb" },
  potong: { label: "Potong", icon: "🔪", bg: "#f2ebe3" },
  haluskan: { label: "Haluskan", icon: "🪨", bg: "#efe9e1" },
  marinasi: { label: "Marinasi", icon: "🧂", bg: "#f6efe2" },
  campur: { label: "Campur", icon: "🥣", bg: "#eef3e6" },
  uleni: { label: "Uleni", icon: "👐", bg: "#f6eee4" },
  bentuk: { label: "Bentuk", icon: "🤲", bg: "#f6eee4" },
  isi: { label: "Isi", icon: "🥟", bg: "#f6efe2" },
  rebus: { label: "Rebus", icon: "🍲", bg: "#e6f0f6" },
  kukus: { label: "Kukus", icon: "♨️", bg: "#eaf1f4" },
  goreng: { label: "Goreng", icon: "🍳", bg: "#fbf0dc" },
  tumis: { label: "Tumis", icon: "🥘", bg: "#fbeedd" },
  panggang: { label: "Panggang", icon: "🫓", bg: "#f8e9dc" },
  bakar: { label: "Bakar", icon: "🔥", bg: "#fbe5dc" },
  blender: { label: "Blender", icon: "🌀", bg: "#e9eef8" },
  saring: { label: "Saring", icon: "🫗", bg: "#e8f2f2" },
  diamkan: { label: "Diamkan", icon: "⏲️", bg: "#eeeef3" },
  balur: { label: "Balur", icon: "🥥", bg: "#f1f4ea" },
  tata: { label: "Tata", icon: "🍽️", bg: "#eef4ea" },
  sajikan: { label: "Sajikan", icon: "😋", bg: "#eaf5e6" },
};

const GREEN = "#2f6b2a";

type StoredMenu = Menu & { detailOk?: boolean };

/** Resep dibuka dari hasil AI terakhir (nomor menu) atau dari Rantang Resep (id simpanan). */
export type RecipeSource = { kind: "rec"; index: number } | { kind: "saved"; id: string };

/** Ambil menu sesuai sumbernya + cara menyimpan resep detail kembali ke tempat asalnya. */
function useMenu(source: RecipeSource) {
  const fromRec = useRecs((s) => (source.kind === "rec" ? s.result?.data.menus[source.index] : undefined)) as StoredMenu | undefined;
  const saved = useCookbook((s) => (source.kind === "saved" ? s.items.find((x) => x.id === source.id) : undefined));
  const m = source.kind === "rec" ? fromRec : saved?.menu;

  const save = (resep: Menu["resep"]) => {
    const cook = useCookbook.getState();
    if (source.kind === "saved") {
      const cur = cook.items.find((x) => x.id === source.id);
      if (cur) cook.updateMenu({ id: source.id }, { ...cur.menu, resep, detailOk: true });
      return;
    }
    const { result, setResult } = useRecs.getState();
    if (!result) return;
    const menus = result.data.menus.map((x, i) => (i === source.index ? ({ ...x, resep, detailOk: true } as StoredMenu) : x));
    setResult({ ...result, data: { ...result.data, menus } });
    // salinan di Rantang Resep ikut diperbarui
    cook.updateMenu({ src: `${result.key}#${source.index}` }, menus[source.index]);
  };
  return { m, save, savedAt: saved?.savedAt };
}

/**
 * Saat halaman resep dibuka pertama kali, minta resep DETAIL (8-12 langkah) untuk menu ini
 * ke /api/resep memakai bahan & takaran yang sama, lalu simpan supaya tidak diminta ulang.
 */
function useDetailedRecipe(key: string, m: StoredMenu | undefined, save: (r: Menu["resep"]) => void) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [attempt, setAttempt] = useState(0);
  const needs = !!m && !m.detailOk;

  useEffect(() => {
    if (!needs || !m) return;
    const ctrl = new AbortController();
    Promise.resolve().then(() => setState("loading"));
    fetch("/api/resep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: m.nama,
        jenis: m.jenis,
        deskripsi: m.deskripsi,
        porsi: m.porsi,
        bahan: m.resep.kelompokBahan.flatMap((g) => g.bahan),
      }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Gagal");
        save(json as Menu["resep"]);
        setState("idle");
      })
      .catch((e) => e.name !== "AbortError" && setState("error"));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needs, key, attempt]);

  return { state: needs ? state : "idle", retry: () => setAttempt((a) => a + 1) };
}

export function RecipeView({ source }: { source: RecipeSource }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const { m, save, savedAt } = useMenu(source);
  const key = source.kind === "rec" ? `rec-${source.index}` : source.id;
  const detail = useDetailedRecipe(key, hydrated ? m : undefined, save);
  const back = source.kind === "rec" ? { href: "/rekomendasi", label: "Menu AI" } : { href: "/resep-saya", label: "Rantang" };

  if (!hydrated) return <div className="flex-1" />;
  if (!m)
    return (
      <main className="pb-tabbar flex-1">
        <NavBar title="Resep" large={false} back={back} />
        <div className="px-8 pt-24 text-center">
          <p className="text-[20px] font-semibold">Resep tidak ditemukan</p>
          <p className="mt-1 text-[15px] text-secondary">
            {source.kind === "rec" ? "Minta rekomendasi menu dulu dari keranjangmu." : "Resep ini mungkin sudah dihapus dari rantang."}
          </p>
          <Link href={back.href} className="mt-5 inline-block text-[17px] text-ios-blue">Buka {back.label}</Link>
        </div>
      </main>
    );

  // nomor langkah berlanjut antar tahap
  const startAt = m.resep.tahapan.map((_, ti) => m.resep.tahapan.slice(0, ti).reduce((a, t) => a + t.langkah.length, 0));
  return (
    <main className="pb-tabbar animate-push flex-1 bg-[#eef4ea]">
      <NavBar title={m.nama} large={false} back={back} />

      {/* HP: 1 kolom · Tablet (md): 1 kolom lebih lebar · iPad landscape & layar sangat lebar: bahan kiri, langkah kanan */}
      <div id="resep-isi" className="mx-auto w-full max-w-[1180px] bg-[#eef4ea] pb-4 md:px-4 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start xl:block 2xl:grid">
      <div>
      <Hero m={m} />

      {/* info singkat */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-2">
        {[
          { Icon: PeopleIcon, v: `${m.porsi}`, l: "porsi" },
          { Icon: ClockIcon, v: `${m.waktuMasakMenit}`, l: "menit" },
          { Icon: ChefIcon, v: m.kesulitan, l: "tingkat" },
          { Icon: FlameIcon, v: `${Math.round(m.nutrisiPerPorsi.kalori)}`, l: "kkal/porsi" },
        ].map(({ Icon, v, l }) => (
          <div key={l} className="flex flex-col items-center rounded-[12px] bg-white py-2.5">
            <Icon className="h-5 w-5 text-[#4b8b3b]" />
            <span className="mt-1 text-[15px] font-bold leading-none">{v}</span>
            <span className="mt-0.5 text-[11px] text-secondary">{l}</span>
          </div>
        ))}
      </div>

      {/* bagikan / cetak / simpan gambar */}
      <RecipeActions m={m} targetId="resep-isi" />

      {/* kelompok bahan */}
      {m.resep.kelompokBahan.map((g) => (
        <Panel key={g.nama} title={g.nama}>
          <div className="grid grid-cols-3 gap-x-2 gap-y-3 p-3 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-3">
            {g.bahan.map((b, i) => {
              const p = b.productId ? productById[b.productId] : undefined;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#f6f9f3] ring-1 ring-[#dfe9d8]">
                    {p ? (
                      <img src={p.img} alt="" className="h-[54px] w-[54px] object-contain drop-shadow-[0_3px_3px_rgba(0,0,0,0.15)]" />
                    ) : (
                      <span className="text-[22px] font-bold text-[#9db592]">{b.nama.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] font-semibold leading-tight">{b.nama}</p>
                  <p className="text-[12px] font-medium text-[#4b8b3b]">{b.jumlah}</p>
                  {b.persiapan && <p className="mt-0.5 text-[11px] leading-snug text-secondary">{b.persiapan}</p>}
                  {p && <span className="mt-1 rounded-full bg-[#e3f2dc] px-1.5 text-[10px] font-semibold text-brand-ink">dari keranjang</span>}
                </div>
              );
            })}
          </div>
        </Panel>
      ))}

      {/* saran bahan tambahan dari AI */}
      {m.saranBahan?.length > 0 && (
        <section className="mx-4 mt-4 overflow-hidden rounded-[14px] bg-white ring-1 ring-[#d5e4cd]">
          <div className="flex items-center justify-between bg-[#fff6e0] px-4 py-2.5">
            <h2 className="text-[15px] font-bold text-[#8a5a00]">Bahan yang bikin menu ini lebih lengkap</h2>
          </div>
          <SuggestionList items={m.saranBahan} />
        </section>
      )}

      </div>
      <div>
      {/* status resep detail */}
      {detail.state === "loading" && (
        <div data-noexport className="mx-4 mt-4 flex items-center gap-3 rounded-[14px] bg-white p-3.5 ring-1 ring-[#d5e4cd]">
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-[2.5px] border-[#dcebd4] border-t-[#2f6b2a]" />
          <div>
            <p className="text-[14px] font-semibold">Menyusun langkah memasak yang detail…</p>
            <p className="text-[12px] text-secondary">Takaran, besar api, durasi, dan ciri matang tiap langkah</p>
          </div>
        </div>
      )}
      {detail.state === "error" && (
        <div data-noexport className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-[14px] bg-white p-3.5 ring-1 ring-[#f1d6c9]">
          <p className="text-[13px] text-secondary">Langkah detail belum bisa dibuat (server AI sedang penuh). Menampilkan versi ringkas.</p>
          <button onClick={detail.retry} className="shrink-0 text-[14px] font-semibold text-ios-blue">Coba lagi</button>
        </div>
      )}

      {/* tahapan & langkah */}
      {m.resep.tahapan.map((t, ti) => (
        <Panel key={t.nama} title={t.nama}>
          <div className="grid grid-cols-2 gap-2.5 p-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2">
            {t.langkah.map((s, si) => {
              const stepNo = startAt[ti] + si + 1;
              const tech = TECH[s.teknik as Technique] ?? TECH.siapkan;
              const used = s.bahanTerkait.map((id) => productById[id]).filter(Boolean).slice(0, 2);
              return (
                <div key={stepNo} className="flex flex-col overflow-hidden rounded-[12px] bg-white ring-1 ring-[#dfe9d8]">
                  <div className="relative aspect-[4/3]" style={{ background: tech.bg }}>
                    {/* foto proses langkah ini dari Google Images; cadangan: ikon teknik */}
                    <WebPhoto
                      query={s.kataKunciFoto ?? `${tech.label} ${used.map((p) => p.name).join(" ")}`}
                      className="absolute inset-0"
                      fallback={
                        <span className="absolute inset-0 grid place-items-center text-[46px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.12)]">{tech.icon}</span>
                      }
                    />
                    <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full text-[14px] font-bold text-white shadow" style={{ background: GREEN }}>
                      {stepNo}
                    </span>
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4b6b40] shadow-sm">
                      {tech.label}
                    </span>
                    {used.length > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 flex -space-x-2">
                        {used.map((p) => (
                          <span key={p.id} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-2 ring-white">
                            <img src={p.img} alt={p.name} className="h-7 w-7 object-contain" />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-2.5">
                    <p className="text-[13px] leading-snug">{s.instruksi}</p>
                    {s.catatan && <p className="mt-1 text-[12px] font-medium italic leading-snug text-[#4b8b3b]">{s.catatan}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      ))}

      {/* tanda matang & penyajian */}
      <div className="mx-4 mt-4 grid gap-2.5">
        <Callout icon="✅" title="Tanda Matang" text={m.resep.tandaMatang} />
        <Callout icon="🍽️" title="Penyajian" text={m.resep.penyajian} />
      </div>

      <Nutrition m={m} />

      <div className="mx-4 mt-4 grid gap-2.5">
        <ListCard title="Manfaat untuk tubuh" items={m.manfaat} color="#248a3d" />
        {m.perhatian.length > 0 && <ListCard title="Perlu diperhatikan" items={m.perhatian} color="#c93400" />}
      </div>

      </div>
      </div>

      <p className="mx-6 mt-6 text-center text-[12px] text-secondary">
        Resep dan nilai gizi disusun AI PasarKu dari isi keranjangmu.
        {savedAt && <> Disimpan di rantang {new Date(savedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.</>}
      </p>
      {source.kind === "saved" && (
        <div className="mx-auto mt-4 max-w-[320px] px-4 pb-4">
          <button
            onClick={() => {
              if (!confirm(`Hapus "${m.nama}" dari rantang? Resep ini tidak bisa dikembalikan.`)) return;
              useCookbook.getState().remove(source.id);
              router.replace("/resep-saya");
            }}
            className="h-11 w-full rounded-[12px] bg-white text-[16px] font-semibold text-ios-red active:opacity-60"
          >
            Hapus dari rantang
          </button>
        </div>
      )}
    </main>
  );
}

/** Kepala infografis: judul besar, label tahapan, dan hidangan dikelilingi foto bahan. */
function Hero({ m }: { m: Menu }) {
  const photos = [...new Set(m.resep.kelompokBahan.flatMap((g) => g.bahan.map((b) => b.productId)).filter((id): id is string => !!id && !!productById[id]))].slice(0, 4);
  const spots = ["left-2 top-6", "right-2 top-4", "left-6 bottom-2", "right-5 bottom-3"];
  return (
    <section className="px-5 pt-3 text-center">
      <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#4b8b3b]">Resep Lengkap</p>
      <h1 className="mt-1 text-[30px] font-extrabold uppercase leading-[1.05] tracking-tight" style={{ color: GREEN }}>
        {m.nama}
      </h1>
      <p className="mx-auto mt-2 max-w-[330px] text-[14px] leading-snug text-[#3c3c43]">{m.resep.subjudul}</p>
      <p className="mx-auto mt-2 max-w-[340px] text-[11px] font-bold uppercase leading-relaxed tracking-wide text-[#1d1d1f]">
        {m.resep.sorotan.join("  |  ")}
      </p>

      <div className="relative mx-auto mt-4 h-[200px] max-w-[340px]">
        {/* foto hidangan jadi dari Google Images */}
        <div className="absolute left-1/2 top-1/2 grid h-[176px] w-[176px] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full bg-white shadow-[0_18px_40px_-12px_rgba(47,107,42,0.35)] ring-8 ring-[#dcebd4]">
          <WebPhoto
            query={m.kataKunciFoto ?? m.nama}
            showSource={false}
            className="h-full w-full rounded-full"
            fallback={photos[0] ? <img src={productById[photos[0]].img} alt="" className="h-[110px] w-[110px] object-contain" /> : null}
          />
        </div>
        {photos.map((id, i) => (
          <span key={id} className={`absolute ${spots[i]} grid h-[62px] w-[62px] place-items-center rounded-full bg-white shadow-lg ring-4 ring-[#eef4ea]`}>
            <img src={productById[id].img} alt={productById[id].name} className="h-12 w-12 object-contain" />
          </span>
        ))}
      </div>

      {m.label.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {m.label.map((l) => (
            <span key={l} className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-brand-ink">{l}</span>
          ))}
        </div>
      )}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-4 mt-4 overflow-hidden rounded-[14px] bg-[#f8fbf6] ring-1 ring-[#d5e4cd]">
      <h2 className="px-4 py-2 text-center text-[14px] font-bold uppercase tracking-wide text-white" style={{ background: GREEN }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Callout({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-[14px] bg-white p-3.5 ring-1 ring-[#d5e4cd]">
      <span className="text-[24px] leading-none">{icon}</span>
      <div>
        <p className="text-[13px] font-bold uppercase tracking-wide" style={{ color: GREEN }}>{title}</p>
        <p className="mt-0.5 text-[15px] leading-snug">{text}</p>
      </div>
    </div>
  );
}

function ListCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-[14px] bg-white p-3.5 ring-1 ring-[#d5e4cd]">
      <p className="text-[13px] font-bold uppercase tracking-wide" style={{ color }}>{title}</p>
      <ul className="mt-1.5 space-y-1">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 text-[15px] leading-snug">
            <span style={{ color }}>•</span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Label "Informasi Nilai Gizi" + makro + vitamin & mineral. */
function Nutrition({ m }: { m: Menu }) {
  const n = m.nutrisiPerPorsi;
  const kP = n.protein * 4, kK = n.karbohidrat * 4, kL = n.lemak * 9;
  const kT = kP + kK + kL || 1;
  const macros = [
    { label: "Protein", pct: (kP / kT) * 100, color: "#34c759" },
    { label: "Karbo", pct: (kK / kT) * 100, color: "#ff9500" },
    { label: "Lemak", pct: (kL / kT) * 100, color: "#ff2d55" },
  ];
  const rows: [string, number, string, boolean?][] = [
    ["Protein", n.protein, "g"], ["Karbohidrat", n.karbohidrat, "g"], ["Serat", n.serat, "g", true], ["Gula", n.gula, "g", true],
    ["Lemak total", n.lemak, "g"], ["Lemak jenuh", n.lemakJenuh, "g", true], ["Kolesterol", n.kolesterol, "mg"], ["Natrium", n.natrium, "mg"],
  ];
  return (
    <section className="mx-4 mt-4 rounded-[14px] bg-white p-4 ring-1 ring-[#d5e4cd]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[17px] font-black">Informasi Nilai Gizi</p>
          <p className="text-[12px] text-secondary">per 1 porsi, indeks glikemik {m.indeksGlikemik.toLowerCase()}</p>
        </div>
        <span className="rounded-full bg-[#e3f2dc] px-2.5 py-1 text-[12px] font-bold text-brand-ink">Skor {Math.round(m.skorKesehatan)}/10</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-y-4 border-black py-1">
        <span className="font-black">Energi</span>
        <span className="text-[24px] font-black tabular-nums">{Math.round(n.kalori)} kkal</span>
      </div>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
        {macros.map((x) => <div key={x.label} style={{ width: `${x.pct}%`, background: x.color }} />)}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-secondary">
        {macros.map((x) => (
          <span key={x.label} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: x.color }} />{x.label} {Math.round(x.pct)}%</span>
        ))}
      </div>
      <table className="mt-2 w-full text-[14px]">
        <tbody className="divide-y divide-separator">
          {rows.map(([l, v, u, indent]) => (
            <tr key={l}>
              <td className={`py-1 ${indent ? "pl-4 text-secondary" : "font-semibold"}`}>{l}</td>
              <td className="py-1 text-right tabular-nums">{Math.round(v * 10) / 10} {u}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {m.vitaminMineral.length > 0 && (
        <div className="mt-3 border-t-4 border-black pt-2">
          <p className="text-[12px] font-bold">Vitamin & mineral (% AKG)</p>
          <div className="mt-2 space-y-1.5">
            {m.vitaminMineral.map((v) => (
              <div key={v.nama} className="text-[12px]">
                <div className="flex justify-between"><span>{v.nama}</span><span className="font-bold tabular-nums">{Math.round(v.persenAKG)}%</span></div>
                <div className="mt-0.5 h-1.5 rounded-full bg-fill">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(v.persenAKG, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
