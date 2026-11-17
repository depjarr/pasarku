import raw from "./productInfo.json";

/** Info tambahan tiap produk — dibuat sekali oleh scripts/gen-product-info.mjs (Gemini, berbasis TKPI/USDA). */
export type ProductInfo = {
  gizi: { basis: "100 g" | "100 ml"; kalori: number; protein: number; karbohidrat: number; lemak: number; serat: number };
  tips: string[];
  penyimpanan: string;
  contohMasakan: string[];
};

const infos = raw as Record<string, ProductInfo>;

export const productInfo = (id: string): ProductInfo | undefined => infos[id];
