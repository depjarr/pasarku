"use client";

import { useState } from "react";
import type { Menu } from "@/lib/schema";

/** Teks resep untuk dibagikan (WhatsApp / aplikasi lain). */
function recipeText(m: Menu) {
  const bahan = m.resep.kelompokBahan
    .map((g) => `*${g.nama}*\n${g.bahan.map((b) => `• ${b.nama} — ${b.jumlah}${b.persiapan ? ` (${b.persiapan})` : ""}`).join("\n")}`)
    .join("\n\n");
  let no = 0;
  const langkah = m.resep.tahapan
    .map((t) => `*${t.nama}*\n${t.langkah.map((s) => `${++no}. ${s.instruksi}`).join("\n")}`)
    .join("\n\n");
  return (
    `🍳 *${m.nama}*\n${m.resep.subjudul}\n\n` +
    `👥 ${m.porsi} porsi · ⏱️ ${m.waktuMasakMenit} menit · 🔥 ${Math.round(m.nutrisiPerPorsi.kalori)} kkal/porsi\n\n` +
    `${bahan}\n\n${langkah}\n\n✅ Tanda matang: ${m.resep.tandaMatang}\n🍽️ ${m.resep.penyajian}\n\n— Resep dari PasarKu (Dapur AI)`
  );
}

const Btn = ({ onClick, children, busy }: { onClick: () => void; children: React.ReactNode; busy?: boolean }) => (
  <button
    onClick={onClick}
    disabled={busy}
    className="flex flex-1 flex-col items-center gap-1 rounded-[12px] bg-white py-2.5 text-[12px] font-semibold text-[#1f4d2c] ring-1 ring-[#d5e4cd] transition active:scale-95 disabled:opacity-50"
  >
    {children}
  </button>
);

const Ico = ({ d }: { d: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

/**
 * Tombol aksi resep: bagikan (WhatsApp/share sheet), cetak/simpan PDF, simpan sebagai gambar PNG.
 * `targetId` = id elemen resep yang akan dijadikan gambar.
 */
export function RecipeActions({ m, targetId }: { m: Menu; targetId: string }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const share = async () => {
    const text = recipeText(m);
    if (navigator.share) {
      try {
        await navigator.share({ title: m.nama, text });
        return;
      } catch {
        // dibatalkan pengguna → buka WhatsApp sebagai cadangan
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const saveImage = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    setNote(null);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#eef4ea",
        // elemen bertanda data-noexport (tombol, banner) tidak ikut; foto dari situs lain yang menolak diunduh diganti kotak kosong
        filter: (node) => !(node instanceof HTMLElement && node.dataset.noexport !== undefined),
        imagePlaceholder: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `resep-${m.nama.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
      setNote("Gambar resep tersimpan.");
    } catch {
      setNote("Gagal membuat gambar. Coba Cetak / PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-noexport className="mx-4 mt-3 print:hidden">
      <div className="flex gap-2">
        <Btn onClick={share}>
          <Ico d={<><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></>} />
          Bagikan
        </Btn>
        <Btn onClick={() => window.print()}>
          <Ico d={<><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>} />
          Cetak / PDF
        </Btn>
        <Btn onClick={saveImage} busy={busy}>
          <Ico d={<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>} />
          {busy ? "Membuat…" : "Simpan Gambar"}
        </Btn>
      </div>
      {note && <p className="mt-1.5 text-center text-[12px] text-secondary">{note}</p>}
    </div>
  );
}
