/** Alat masak yang bisa dipilih user sebelum meminta rekomendasi menu. */
export const TOOLS = [
  { id: "wajan", label: "Wajan", bisa: "menumis, menggoreng, oseng" },
  { id: "panci", label: "Panci", bisa: "merebus, sup, kuah, puding" },
  { id: "teflon", label: "Teflon", bisa: "dadar, pancake, menggoreng sedikit minyak" },
  { id: "kukusan", label: "Kukusan", bisa: "mengukus kue, ikan, sayur" },
  { id: "rice-cooker", label: "Rice cooker", bisa: "menanak nasi, nasi liwet, kue sederhana" },
  { id: "grill-pan", label: "Grill pan", bisa: "memanggang daging, ikan, sayur di kompor" },
  { id: "oven", label: "Oven", bisa: "memanggang kue, cookie, roti, lauk" },
  { id: "microwave", label: "Microwave", bisa: "menghangatkan, mug cake, kukus cepat" },
  { id: "toaster", label: "Toaster", bisa: "memanggang roti tawar" },
  { id: "airfryer", label: "Air fryer", bisa: "menggoreng tanpa minyak, memanggang kecil" },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];
export const TOOL_IDS = TOOLS.map((t) => t.id) as [ToolId, ...ToolId[]];
export const toolById = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, (typeof TOOLS)[number]>;

/** Alat yang dianggap ada di hampir semua dapur Indonesia. */
export const DEFAULT_TOOLS: ToolId[] = ["wajan", "panci", "rice-cooker"];

/** Kata yang menandakan sebuah alat dipakai — untuk memeriksa nama menu & langkah resep. */
export const TOOL_WORDS: Partial<Record<ToolId, RegExp>> = {
  teflon: /teflon/i,
  oven: /oven/i,
  microwave: /microwave/i,
  toaster: /toaster|pemanggang roti/i,
  airfryer: /air ?fryer/i,
  "rice-cooker": /rice ?cooker|magic ?com/i,
  "grill-pan": /grill ?pan/i,
  kukusan: /kukusan|dandang/i,
};

/** Ubah daftar label/id alat dari AI menjadi id yang dikenal (mis. "Rice Cooker" → "rice-cooker"). */
export function normalizeTools(list: string[] | undefined | null): ToolId[] {
  const out = new Set<ToolId>();
  for (const raw of list ?? []) {
    const s = raw.toLowerCase().replace(/[\s_]+/g, "-");
    const hit = TOOLS.find((t) => s === t.id || s.includes(t.id) || s.includes(t.label.toLowerCase().replace(/\s+/g, "-")));
    if (hit) out.add(hit.id);
  }
  return [...out];
}
