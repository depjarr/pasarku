import Image from "next/image";
import type { Product } from "@/lib/data";

/** Foto produk asli berlatar transparan, dengan bayangan seperti barang di rak. */
export function ProductImage({ p, size, className = "" }: { p: Pick<Product, "img" | "name">; size: number; className?: string }) {
  return (
    <Image
      src={p.img}
      alt={p.name}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={`select-none object-contain drop-shadow-[0_8px_6px_rgba(0,0,0,0.18)] ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
