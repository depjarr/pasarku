import type { Product } from "./data";

/** Ejaan sehari-hari / sinonim → kata yang dipakai di nama produk. */
const ALIASES: Record<string, string> = {
  cabe: "cabai",
  lombok: "cabai",
  coklat: "cokelat",
  telor: "telur",
  terigu: "tepung",
  bombai: "bombay",
  brambang: "bawang merah",
  bawput: "bawang putih",
  bamer: "bawang merah",
  santen: "santan",
  margarine: "margarin",
  yoghurt: "yogurt",
  yougurt: "yogurt",
  icecream: "es krim",
  eskrim: "es krim",
  agar2: "agar-agar",
  agaragar: "agar-agar",
  kanji: "tapioka",
  aci: "tapioka",
  pete: "petai",
  sledri: "seledri",
  saledri: "seledri",
  salada: "selada",
  worter: "wortel",
  brocoli: "brokoli",
  mie: "mi",
  indomie: "mi",
  nasi: "beras",
};

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Ubah teks pencarian menjadi kata-kata kunci (dengan ejaan baku). */
export function searchTerms(q: string): string[] {
  return strip(q)
    .split(" ")
    .filter(Boolean)
    .map((w) => ALIASES[w] ?? ALIASES[w.replace(/-/g, "")] ?? w);
}

/** true bila semua kata kunci ada di nama produk. */
export function matchProduct(p: Pick<Product, "name">, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const hay = strip(p.name);
  // kata pendek (mis. "mi") harus utuh supaya tidak cocok dengan "kismis"
  return terms.every((t) => (t.length <= 2 ? new RegExp(`(^|[\s-])${t}($|[\s-])`).test(hay) : hay.includes(t)));
}
