import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartSheet } from "@/components/CartSheet";
import { CartPanel, Sidebar } from "@/components/desktop";
import { TabBar } from "@/components/ios";

// SF Pro dipakai otomatis di perangkat Apple; Inter sebagai cadangan di perangkat lain.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PasarKu — Belanja & Rekomendasi Menu AI",
  description: "Supermarket virtual: keliling section, isi keranjang, dapatkan rekomendasi menu sehat dan resep lengkap dari AI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f2f7",
};

/**
 * Tiga tampilan:
 * - HP (< 768px)        : gaya iPhone — tab bar penuh di bawah, keranjang = bottom sheet
 * - Tablet (768–1279px) : gaya iPadOS — tab bar pil melayang, keranjang = jendela di tengah
 * - Laptop (≥ 1280px)   : gaya aplikasi Mac — sidebar kiri, panel keranjang kanan
 */
// suppressHydrationWarning: ekstensi browser (mis. Grammarly) menambah atribut ke <html>/<body>
// sebelum React aktif — tanpa ini muncul error hydration palsu.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans" suppressHydrationWarning>
        <Sidebar />
        <div id="app-scroll" className="flex min-h-dvh flex-col xl:pl-[260px] xl:pr-[340px]">
          {children}
        </div>
        <CartPanel />
        <TabBar />
        <CartSheet />
      </body>
    </html>
  );
}
