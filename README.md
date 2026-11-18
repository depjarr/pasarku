# PasarKu 🛒

Supermarket virtual: keliling denah toko → masuk ke section (Buah, Sayur, Daging, Ikan, dll) → geser rak & masukkan bahan ke keranjang → ringkasan belanja → **Rekomendasi Menu Makanan** dari AI lengkap dengan nilai gizi (kalori, protein, karbo, lemak, serat, gula, natrium, kolesterol, vitamin/mineral %AKG, indeks glikemik, skor kesehatan).

## Stack
Next.js 16 (App Router) · Tailwind CSS 4 · Zustand (keranjang, disimpan di localStorage) · Vercel AI SDK (structured output dengan Zod) · Google Gemini / Groq

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env.local`, lalu isi **salah satu** API key:
   - **Google Gemini** (disarankan) — `GOOGLE_GENERATIVE_AI_API_KEY`, buat gratis di https://aistudio.google.com/apikey
   - **Groq** — `GROQ_API_KEY`, buat gratis di https://console.groq.com/keys
3. (Opsional) Isi `SERPER_API_KEY` dari https://serper.dev supaya menu & langkah resep tampil dengan foto dari Google Images. Tanpa key, tampil ikon.
4. `npm run dev` → http://localhost:3000

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
  - nila — [Oreochromis niloticus Egypt.jpg](https://commons.wikimedia.org/wiki/File:Oreochromis_niloticus_Egypt.jpg), CC BY 3.0
  - cumi — [Loligo vulgaris.jpg](https://commons.wikimedia.org/wiki/File:Loligo_vulgaris.jpg), CC BY-SA 4.0
  - santan — [Cononut milk.JPG](https://commons.wikimedia.org/wiki/File:Cononut_milk.JPG), CC BY-SA 3.0
  - bihun — [Whole-grain rice vermicelli noodles (Thai).jpg](https://commons.wikimedia.org/wiki/File:Whole-grain_rice_vermicelli_noodles_(Thai).jpg), CC BY-SA 4.0
  - lele — [Clari batra 110829-16971 jtg.JPG](https://commons.wikimedia.org/wiki/File:Clari_batra_110829-16971_jtg.JPG), CC BY-SA 3.0
  - minyak — [2022-05-30 21 06 55 A cup of Wesson vegetable oil in the Mountainville section of Ewing Township, Mercer County, New Jersey.jpg](https://commons.wikimedia.org/wiki/File:2022-05-30_21_06_55_A_cup_of_Wesson_vegetable_oil_in_the_Mountainville_section_of_Ewing_Township,_Mercer_County,_New_Jersey.jpg), CC BY-SA 4.0
  - gula-merah — [20200217 101805 Peasants producing palm sugar and palm liquor near Nyaung U Myanmar anagoria.jpg](https://commons.wikimedia.org/wiki/File:20200217_101805_Peasants_producing_palm_sugar_and_palm_liquor_near_Nyaung_U_Myanmar_anagoria.jpg), CC BY 3.0
  - telur-asin — [07543jfCuisine Breads Foods Fruits Baliuag Bulacanfvf 29.jpg](https://commons.wikimedia.org/wiki/File:07543jfCuisine_Breads_Foods_Fruits_Baliuag_Bulacanfvf_29.jpg), CC0
  - teri — [Dried thai anchovies62.jpg](https://commons.wikimedia.org/wiki/File:Dried_thai_anchovies62.jpg), CC BY-SA 3.0
  - jamur-kuping — [Jelly Ear, Auricularia auricula-judae, UK 2.jpg](https://commons.wikimedia.org/wiki/File:Jelly_Ear,_Auricularia_auricula-judae,_UK_2.jpg), Stu's Images, CC BY-SA 4.0
  - jamur-merang — [HK food 草菇 Volvariella volvacea Straw Mushroom May-2012.JPG](https://commons.wikimedia.org/wiki/File:HK_food_%E8%8D%89%E8%8F%87_Volvariella_volvacea_Straw_Mushroom_May-2012.JPG), Cathiniamoa, CC BY-SA 3.0
  - jamur-kastanye — [2016-01 Agaricus bisporus 07.jpg](https://commons.wikimedia.org/wiki/File:2016-01_Agaricus_bisporus_07.jpg), 0x010C, CC BY-SA 4.0
  - tepung-beras — [Rice flour 2.jpg](https://commons.wikimedia.org/wiki/File:Rice_flour_2.jpg), 경빈마마, CC BY 2.0 kr
  - tepung-ketan — [Glutinous rice flour.jpg](https://commons.wikimedia.org/wiki/File:Glutinous_rice_flour.jpg), Ocomejessian, CC BY-SA 3.0
  - tepung-tapioka — [A plate of Tapioca.jpg](https://commons.wikimedia.org/wiki/File:A_plate_of_Tapioca.jpg), Linason Blessing, CC BY-SA 4.0
  - baking-powder — [Sodium bicarbonate CN brightened.png](https://commons.wikimedia.org/wiki/File:Sodium_bicarbonate_CN_brightened.png), Tszrkx, CC0
  - ragi — [Дрожжи сухие активные - Active dry yeast.JPG](https://commons.wikimedia.org/wiki/File:%D0%94%D1%80%D0%BE%D0%B6%D0%B6%D0%B8_%D1%81%D1%83%D1%85%D0%B8%D0%B5_%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%8B%D0%B5_-_Active_dry_yeast.JPG), Shliphmash, Public domain
  - cokelat-bubuk — [Cocoa-powder-1883108.jpg](https://commons.wikimedia.org/wiki/File:Cocoa-powder-1883108.jpg), thecakeschool, CC0
  - cokelat-batang — [2020-02-23 02 24 15 A Ghirardelli Dark Chocolate Mint Square broken into two pieces in the Parkway Village section of Ewing Township, Mercer County, New Jersey.jpg](https://commons.wikimedia.org/wiki/File:2020-02-23_02_24_15_A_Ghirardelli_Dark_Chocolate_Mint_Square_broken_into_two_pieces_in_the_Parkway_Village_section_of_Ewing_Township,_Mercer_County,_New_Jersey.jpg), Famartin, CC BY-SA 4.0
  - cokelat-putih — [Twix white split (6902053171).jpg](https://commons.wikimedia.org/wiki/File:Twix_white_split_(6902053171).jpg), Bodo, CC BY 2.0
  - gula-halus — [PowderedSugar.png](https://commons.wikimedia.org/wiki/File:PowderedSugar.png), Ɱ, CC BY-SA 4.0
  - karamel — [Caramel-2.jpg](https://commons.wikimedia.org/wiki/File:Caramel-2.jpg), No machine-readable author provided. Rainer Zenz assumed (ba, CC BY-SA 3.0
  - skm — [Tin of condensed milk.jpg](https://commons.wikimedia.org/wiki/File:Tin_of_condensed_milk.jpg), Robin from Rotterdam, Netherlands, CC BY-SA 2.0
  - whipping-cream — [Frozen Whipped Cream Sandwiches.jpg](https://commons.wikimedia.org/wiki/File:Frozen_Whipped_Cream_Sandwiches.jpg), Jo, CC BY 2.0
  - cream-cheese — [2019-10-12 15 31 00 A open carton of Harris Teeter Plain Cream Cheese Spread in the Dulles section of Sterling, Loudoun County, Virginia.jpg](https://commons.wikimedia.org/wiki/File:2019-10-12_15_31_00_A_open_carton_of_Harris_Teeter_Plain_Cream_Cheese_Spread_in_the_Dulles_section_of_Sterling,_Loudoun_County,_Virginia.jpg), Famartin, CC BY-SA 4.0
  - agar — [Sodium bicarbonate.jpg](https://commons.wikimedia.org/wiki/File:Sodium_bicarbonate.jpg), Thavox, Public domain
  - kelapa-kering — [Coconut Cookies (4801683503).jpg](https://commons.wikimedia.org/wiki/File:Coconut_Cookies_(4801683503).jpg), Miia Ranta from Finland, CC BY-SA 2.0
  - biskuit — [Morinaga marie biscuit 2014-2.jpg](https://commons.wikimedia.org/wiki/File:Morinaga_marie_biscuit_2014-2.jpg), Kentin, CC BY-SA 4.0
  - jamur-enoki — [A small but tasty harvest (10843427516).jpg](https://commons.wikimedia.org/wiki/File:A_small_but_tasty_harvest_(10843427516).jpg), Wendell Smith, CC BY 2.0
  - jamur-shimeji — [Mushroom Reference -11.jpg](https://commons.wikimedia.org/wiki/File:Mushroom_Reference_-11.jpg), claralieu, CC BY 2.0
  - daun-pandan — [Pandanus amaryllifolius-2-bsi-yercaud-salem-India.jpg](https://commons.wikimedia.org/wiki/File:Pandanus_amaryllifolius-2-bsi-yercaud-salem-India.jpg), Yercaud-elango, CC BY-SA 4.0
  - beras-ketan — [2014 uncooked Thai glutinous rice.jpg](https://commons.wikimedia.org/wiki/File:2014_uncooked_Thai_glutinous_rice.jpg), Takeaway, CC BY-SA 4.0
  - nangka — [Ripe Jackfruit.jpg](https://commons.wikimedia.org/wiki/File:Ripe_Jackfruit.jpg), Sannidhishetty, CC BY-SA 4.0
  - tepung-maizena — [Cornstarch mixed with water.jpg](https://commons.wikimedia.org/wiki/File:Cornstarch_mixed_with_water.jpg), Picasa author kalaya, CC BY-SA 3.0
  - susu-bubuk — [PowderedMilk.jpg](https://commons.wikimedia.org/wiki/File:PowderedMilk.jpg), CC BY-SA 3.0
  - margarin — [Margarine.jpg](https://commons.wikimedia.org/wiki/File:Margarine.jpg), CC BY-SA 2.0
  - selai — [Az-Strawberry jam, making by e-citizen (moonsun1981).JPG](https://commons.wikimedia.org/wiki/File:Az-Strawberry_jam,_making_by_e-citizen_(moonsun1981).JPG), Moonsun1981, CC BY-SA 3.0
  - gula-semut — [Organic coconut sugar Bansalan4.jpg](https://commons.wikimedia.org/wiki/File:Organic_coconut_sugar_Bansalan4.jpg), CC BY-SA 4.0
  - kolang-kaling — [Kolang kaling (buah atap).jpg](https://commons.wikimedia.org/wiki/File:Kolang_kaling_(buah_atap).jpg), Hzu Hzu, CC BY 4.0
  - nata-de-coco — [09978jfCuisine Breads Fruits Baliuag Landmarks Bulacanfvf 33.jpg](https://commons.wikimedia.org/wiki/File:09978jfCuisine_Breads_Fruits_Baliuag_Landmarks_Bulacanfvf_33.jpg), Judgefloro, CC0
  - cincau — [GrassJellyBlocks.jpg](https://commons.wikimedia.org/wiki/File:GrassJellyBlocks.jpg), Sjschen, CC BY-SA 4.0
  - es-krim — [Bowl ~ Ice cream.jpg](https://commons.wikimedia.org/wiki/File:Bowl_~_Ice_cream.jpg), Mitchellhobbs, CC BY-SA 4.0
  - sagu-mutiara — [Sago 20161224.jpg](https://commons.wikimedia.org/wiki/File:Sago_20161224.jpg), Televido, CC BY-SA 4.0
  - yogurt — [Plain Yogurt.jpg](https://commons.wikimedia.org/wiki/File:Plain_Yogurt.jpg), Alabama Extension, CC0
  - gula-cokelat — [Brown sugar.jpg](https://commons.wikimedia.org/wiki/File:Brown_sugar.jpg), EstherDje, CC BY-SA 4.0 (warna sedikit dihangatkan)
- Gambar keranjang: disediakan pemilik proyek
