/**
 * Membuat ikon aplikasi PasarKu dari satu gambar SVG (maskot keranjang pasar).
 * Jalankan: node scripts/gen-icons.mjs
 * Hasil: public/icon-192.png, public/icon-512.png, public/icon-maskable-512.png,
 *        public/logo.png (logo di dalam aplikasi), src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

// maskot di kanvas 1024×1024
const art = `
  <defs>
    <radialGradient id="bg" cx="30%" cy="18%" r="95%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="#e9f8de"/>
      <stop offset="1" stop-color="#bfe8a6"/>
    </radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2fae4e"/>
      <stop offset="1" stop-color="#11682c"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4cc066"/>
      <stop offset="1" stop-color="#1f7a3d"/>
    </linearGradient>
    <linearGradient id="chili" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff7a52"/>
      <stop offset="0.5" stop-color="#ff3b26"/>
      <stop offset="1" stop-color="#c81e14"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9df06a"/>
      <stop offset="1" stop-color="#2f9a3a"/>
    </linearGradient>
    <radialGradient id="tomato" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#ffb199"/>
      <stop offset="0.4" stop-color="#ff5a3c"/>
      <stop offset="1" stop-color="#d42a1c"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="28"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <clipPath id="bodyClip"><path d="M222 520 H802 L748 846 Q740 884 700 884 H324 Q284 884 276 846 Z"/></clipPath>
  </defs>

  <rect width="1024" height="1024" fill="url(#bg)"/>
  <!-- cahaya lembut di belakang maskot -->
  <ellipse cx="512" cy="430" rx="330" ry="260" fill="#fff7c2" opacity="0.55" filter="url(#soft)"/>
  <!-- bayangan di lantai -->
  <ellipse cx="512" cy="906" rx="280" ry="40" fill="#2f7a2a" opacity="0.45" filter="url(#soft)"/>

  <!-- isi keranjang: daun, cabai, tomat -->
  <path d="M600 520 C590 380 650 270 760 230 C770 330 720 450 640 528 Z" fill="url(#leaf)"/>
  <path d="M612 516 C640 420 690 330 752 250" stroke="#2a7d33" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.55"/>
  <path d="M352 540 C330 420 380 300 470 236 C488 226 506 238 500 258 C470 340 452 430 470 540 Z" fill="url(#chili)"/>
  <path d="M470 236 C478 214 470 190 452 176 C470 168 498 176 506 196 C512 212 504 230 492 238 Z" fill="#2f9a3a"/>
  <path d="M398 470 C392 400 412 330 452 282" stroke="#ffffff" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.45"/>
  <circle cx="556" cy="480" r="88" fill="url(#tomato)"/>
  <ellipse cx="528" cy="446" rx="26" ry="16" fill="#ffffff" opacity="0.6" transform="rotate(-30 528 446)"/>
  <path d="M556 396 l-22 -18 l26 6 l4 -24 l10 24 l24 -8 l-18 20 Z" fill="#2f9a3a"/>

  <!-- pegangan keranjang -->
  <path d="M272 540 C272 300 752 300 752 540" fill="none" stroke="#145a2a" stroke-width="46" stroke-linecap="round"/>
  <path d="M272 540 C272 300 752 300 752 540" fill="none" stroke="#3fb15a" stroke-width="22" stroke-linecap="round"/>

  <!-- badan keranjang -->
  <path d="M222 520 H802 L748 846 Q740 884 700 884 H324 Q284 884 276 846 Z" fill="url(#body)"/>
  <g fill="#0b4a1e" opacity="0.55">
    ${[330, 398, 466, 534, 602, 670].map((x) => `<rect x="${x - 4}" y="806" width="44" height="40" rx="14"/>`).join("")}
  </g>
  <!-- kilau kaca di badan -->
  <path d="M262 560 Q290 700 320 820" stroke="#ffffff" stroke-width="22" stroke-linecap="round" opacity="0.28" fill="none"/>
  <!-- bibir keranjang -->
  <rect x="196" y="500" width="632" height="74" rx="37" fill="url(#rim)"/>
  <rect x="226" y="510" width="420" height="18" rx="9" fill="#ffffff" opacity="0.4"/>

  <!-- wajah -->
  <ellipse cx="416" cy="676" rx="56" ry="70" fill="#06190c"/>
  <ellipse cx="608" cy="676" rx="56" ry="70" fill="#06190c"/>
  <ellipse cx="434" cy="648" rx="20" ry="26" fill="#ffffff"/>
  <ellipse cx="626" cy="648" rx="20" ry="26" fill="#ffffff"/>
  <circle cx="400" cy="708" r="9" fill="#ffffff" opacity="0.8"/>
  <circle cx="592" cy="708" r="9" fill="#ffffff" opacity="0.8"/>
  <ellipse cx="340" cy="752" rx="38" ry="22" fill="#ff7d9c" opacity="0.9"/>
  <ellipse cx="684" cy="752" rx="38" ry="22" fill="#ff7d9c" opacity="0.9"/>
  <path d="M484 748 Q512 776 540 748" stroke="#06190c" stroke-width="14" fill="none" stroke-linecap="round"/>

  <!-- kilau AI -->
  <g fill="#ffcf3a">
    <path d="M812 300 Q820 352 864 360 Q820 368 812 420 Q804 368 760 360 Q804 352 812 300 Z" filter="url(#glow)" opacity="0.9"/>
    <path d="M812 300 Q820 352 864 360 Q820 368 812 420 Q804 368 760 360 Q804 352 812 300 Z"/>
    <path d="M226 300 Q230 326 252 330 Q230 334 226 360 Q222 334 200 330 Q222 326 226 300 Z" opacity="0.9"/>
  </g>
`;

/** full = kotak penuh (iOS & maskable memotong sendiri); rounded = sudut membulat transparan */
function svg({ rounded = false, pad = 0 } = {}) {
  const s = 1024 - pad * 2;
  const inner = `<g transform="translate(${pad} ${pad}) scale(${s / 1024})">${art}</g>`;
  const body = rounded
    ? `<defs><clipPath id="sq"><rect width="1024" height="1024" rx="230"/></clipPath></defs><g clip-path="url(#sq)">${inner}</g>`
    : inner;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${body}</svg>`);
}

const out = async (buf, size, file) => {
  await sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  console.log("✓", file);
};

await out(svg({ rounded: true }), 512, "public/icon-512.png");
await out(svg({ rounded: true }), 192, "public/icon-192.png");
await out(svg({ rounded: true }), 256, "public/logo.png");
await out(svg({ rounded: true }), 512, "src/app/icon.png");
// Android maskable: isi dikecilkan agar aman dari potongan bentuk ikon
await out(svg({ pad: 0 }), 512, "public/icon-maskable-512.png");
await out(svg(), 180, "src/app/apple-icon.png");

// favicon.ico (PNG 48px di dalam wadah ICO)
const png = await sharp(svg({ rounded: true })).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6); header.writeUInt8(48, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
writeFileSync("src/app/favicon.ico", Buffer.concat([header, png]));
console.log("✓ src/app/favicon.ico");

// pratinjau besar untuk dicek
await out(svg({ rounded: true }), 1024, process.env.PREVIEW ?? "icon-preview.png");
