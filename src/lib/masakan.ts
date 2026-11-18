/** Jenis/asal masakan yang bisa dipilih user sebelum meminta rekomendasi menu. */
export const CUISINES = [
  { id: "indonesia", label: "Indonesia", contoh: "soto, rendang, tumisan, sayur bening" },
  { id: "western", label: "Western", contoh: "steak, pasta, sup krim, salad" },
  { id: "chinese", label: "Chinese", contoh: "capcay, fuyunghai, mapo tahu" },
  { id: "jepang", label: "Jepang", contoh: "teriyaki, katsu, donburi, miso" },
  { id: "korea", label: "Korea", contoh: "bulgogi, japchae, tteokbokki" },
  { id: "thailand", label: "Thailand", contoh: "tom yum, pad krapow, som tam" },
  { id: "india", label: "India", contoh: "kari, dal, tandoori, biryani" },
  { id: "timur-tengah", label: "Timur Tengah", contoh: "kebab, nasi kebuli, hummus" },
] as const;

export type CuisineId = (typeof CUISINES)[number]["id"];
export const CUISINE_IDS = CUISINES.map((c) => c.id) as [CuisineId, ...CuisineId[]];
export const cuisineById = Object.fromEntries(CUISINES.map((c) => [c.id, c])) as Record<CuisineId, (typeof CUISINES)[number]>;

/** Ubah teks asal masakan dari AI menjadi id yang dikenal (mis. "Masakan China" → "chinese"). */
export function normalizeCuisine(raw: string | undefined | null): CuisineId | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  const rules: [CuisineId, RegExp][] = [
    ["indonesia", /indonesia|nusantara|jawa|sunda|padang|betawi|bali|manado|minang/],
    ["western", /western|barat|eropa|itali|amerika|prancis|perancis|inggris|mediterania/],
    ["chinese", /chinese|china|cina|tionghoa|kanton|oriental/],
    ["jepang", /jepang|japan/],
    ["korea", /korea/],
    ["thailand", /thai/],
    ["india", /india/],
    ["timur-tengah", /timur tengah|arab|turki|middle east|persia|lebanon/],
  ];
  return rules.find(([, re]) => re.test(s))?.[0] ?? null;
}
