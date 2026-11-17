import Image from "next/image";

/** Ikon aplikasi PasarKu (maskot keranjang) — dipakai sebagai logo di header, sidebar, dan layar pembukaan. */
export function AppLogo({ size = 36 }: { size?: number }) {
  return <Image src="/logo.png" alt="" width={size} height={size} className="shrink-0 drop-shadow-sm" style={{ width: size, height: size }} priority />;
}
