import type { MetadataRoute } from "next";

/** Manifest PWA — membuat PasarKu bisa dipasang ke layar utama HP seperti aplikasi. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PasarKu — Belanja & Dapur AI",
    short_name: "PasarKu",
    description: "Belanja bahan segar, lalu dapatkan rekomendasi menu, resep lengkap, dan info gizi dari AI.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f2f7",
    theme_color: "#1f7a3d",
    categories: ["food", "shopping", "health"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Keranjang", url: "/keranjang", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Menu AI", url: "/rekomendasi", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
