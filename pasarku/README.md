# PasarKu 🛒

Supermarket virtual: keliling denah toko → masuk ke section (Buah, Sayur, Daging, Ikan, dll) → geser rak & masukkan bahan ke keranjang → ringkasan belanja → **Rekomendasi Menu Makanan** dari AI lengkap dengan nilai gizi (kalori, protein, karbo, lemak, serat, gula, natrium, kolesterol, vitamin/mineral %AKG, indeks glikemik, skor kesehatan).

## Stack
Next.js 16 (App Router) · Tailwind CSS 4 · Zustand (keranjang, disimpan di localStorage) · Vercel AI SDK + AI Gateway (structured output dengan Zod)

## Menjalankan
1. `npm install`
2. Isi `AI_GATEWAY_API_KEY` di `.env.local` (buat key di https://vercel.com/ai-gateway)
3. `npm run dev` → http://localhost:3000

## Kredit foto
- Sebagian besar foto bahan: [TheMealDB](https://www.themealdb.com)
- Foto di `public/produk/` diambil dari Wikimedia Commons lalu latarnya dihapus:
  - Tempe — [Tempeh 002.jpg](https://commons.wikimedia.org/wiki/File:Tempeh_002.jpg), CC0
  - Tahu — [Tofu Vegan Soja Sojaprodukt.JPG](https://commons.wikimedia.org/wiki/File:Tofu_Vegan_Soja_Sojaprodukt.JPG), CC BY-SA 3.0
  - Mi kering — [Mama instant noodle block.jpg](https://commons.wikimedia.org/wiki/File:Mama_instant_noodle_block.jpg), CC BY-SA 3.0
  - Beras — [Uncooked ST25 rice on bamboo surface.jpg](https://commons.wikimedia.org/wiki/File:Uncooked_ST25_rice_on_bamboo_surface.jpg), CC BY-SA 4.0
  - Beras merah — [Uncooked brown, red and black rice.jpg](https://commons.wikimedia.org/wiki/File:Uncooked_brown,_red_and_black_rice.jpg), CC BY-SA 4.0
  - gula-pasir — [Bowl of white sugar without background.jpg](https://commons.wikimedia.org/wiki/File:Bowl_of_white_sugar_without_background.jpg), CC BY 3.0
  - garam — [Comparison of Table Salt with Kitchen Salt.png](https://commons.wikimedia.org/wiki/File:Comparison_of_Table_Salt_with_Kitchen_Salt.png), CC BY-SA 4.0
  - tepung — [All-Purpose Flour (4107895947).jpg](https://commons.wikimedia.org/wiki/File:All-Purpose_Flour_(4107895947).jpg), CC BY-SA 2.0
  - kacang-hijau — [Mung beans (Vigna radiata).jpg](https://commons.wikimedia.org/wiki/File:Mung_beans_(Vigna_radiata).jpg), CC BY-SA 4.0
  - kacang-merah — [Chitra Rajma.jpg](https://commons.wikimedia.org/wiki/File:Chitra_Rajma.jpg), CC BY-SA 4.0
  - merica — [Tellicherry Black Peppercorns.jpg](https://commons.wikimedia.org/wiki/File:Tellicherry_Black_Peppercorns.jpg), CC0
  - ketumbar — [Whole coriander seeds to make Du'ah (dukkah).JPG](https://commons.wikimedia.org/wiki/File:Whole_coriander_seeds_to_make_Du'ah_(dukkah).JPG), CC BY-SA 4.0
  - kunyit — [Curcuma longa roots.jpg](https://commons.wikimedia.org/wiki/File:Curcuma_longa_roots.jpg), CC BY-SA 3.0
  - tauge — [Moyashi-Mung-bean-sprouts.jpg](https://commons.wikimedia.org/wiki/File:Moyashi-Mung-bean-sprouts.jpg), CC BY-SA 4.0
  - jagung — [White Corn on the Cob with husk (27000745034).jpg](https://commons.wikimedia.org/wiki/File:White_Corn_on_the_Cob_with_husk_(27000745034).jpg), CC BY-SA 2.0
  - kelapa — [Kokosnuss-Coconut.jpg](https://commons.wikimedia.org/wiki/File:Kokosnuss-Coconut.jpg), Public domain
  - pepaya — [Papaya - longitudinal section.jpg](https://commons.wikimedia.org/wiki/File:Papaya_-_longitudinal_section.jpg), CC BY-SA 4.0
  - salak — [Salak (Salacca zalacca), 2015-05-17.jpg](https://commons.wikimedia.org/wiki/File:Salak_(Salacca_zalacca),_2015-05-17.jpg), CC BY-SA 4.0
  - jengkol — [Jering Archidendron pauciflorum.JPG](https://commons.wikimedia.org/wiki/File:Jering_Archidendron_pauciflorum.JPG), CC BY-SA 3.0
  - durian — [Durian Fruit in Yunnan.jpg](https://commons.wikimedia.org/wiki/File:Durian_Fruit_in_Yunnan.jpg), CC BY-SA 2.0
  - manggis — [Mangosteens - whole and opened.jpg](https://commons.wikimedia.org/wiki/File:Mangosteens_-_whole_and_opened.jpg), CC BY-SA 4.0
  - jambu-biji — [Goiaba vermelha.jpg](https://commons.wikimedia.org/wiki/File:Goiaba_vermelha.jpg), CC BY-SA 4.0
  - anggur — [Grapes (2).jpg](https://commons.wikimedia.org/wiki/File:Grapes_(2).jpg), Public domain
  - buah-naga — [Webysther 20150409032418 - Pitaya.jpg](https://commons.wikimedia.org/wiki/File:Webysther_20150409032418_-_Pitaya.jpg), CC BY-SA 4.0
  - bandeng — [Milkfish (Chanos chanos).jpg](https://commons.wikimedia.org/wiki/File:Milkfish_(Chanos_chanos).jpg), CC BY-SA 4.0
  - telur-puyuh — [Quail eggs (Перепелиные яйца).jpg](https://commons.wikimedia.org/wiki/File:Quail_eggs_(%D0%9F%D0%B5%D1%80%D0%B5%D0%BF%D0%B5%D0%BB%D0%B8%D0%BD%D1%8B%D0%B5_%D1%8F%D0%B9%D1%86%D0%B0).jpg), CC BY-SA 4.0
  - pare — [Bittergourd.jpg](https://commons.wikimedia.org/wiki/File:Bittergourd.jpg), CC BY 3.0
  - labu-siam — [Chayote - 02.jpg](https://commons.wikimedia.org/wiki/File:Chayote_-_02.jpg), CC BY-SA 4.0
  - petai — [Parkia speciosa.JPG](https://commons.wikimedia.org/wiki/File:Parkia_speciosa.JPG), CC BY 2.5
  - rambutan — [Nephelium lappaceum201907mx.jpg](https://commons.wikimedia.org/wiki/File:Nephelium_lappaceum201907mx.jpg), CC BY-SA 4.0
  - semangka — [Slice of Watermelon from Wilson Farm, Lexington MA.jpg](https://commons.wikimedia.org/wiki/File:Slice_of_Watermelon_from_Wilson_Farm,_Lexington_MA.jpg), CC BY-SA 3.0
  - melon — [2023-08-25 - Halved melon - mould encroaching from one end - DSN5354-1.jpg](https://commons.wikimedia.org/wiki/File:2023-08-25_-_Halved_melon_-_mould_encroaching_from_one_end_-_DSN5354-1.jpg), CC BY-SA 4.0
  - kerang — [Cardiidae - A. tuberculata (Europe); D. muricata (America).jpg](https://commons.wikimedia.org/wiki/File:Cardiidae_-_A._tuberculata_(Europe);_D._muricata_(America).jpg), CC BY-SA 4.0
- Gambar keranjang: disediakan pemilik proyek
