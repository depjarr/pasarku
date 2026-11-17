export type Product = {
  id: string;
  name: string;
  img: string; // foto produk (PNG transparan)
  price: number; // Rupiah
  unit: string; // contoh: "500 g", "1 ikat"
  sectionId: string;
  shelf: string;
};

export type Section = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  color: string; // warna aksen papan section
  shelves: string[];
};

export const sections: Section[] = [
  { id: "buah", name: "Buah", emoji: "🍎", tagline: "Segar dari kebun", color: "#e85d4a", shelves: ["Buah Lokal", "Buah Tropis", "Buah Impor"] },
  { id: "sayur", name: "Sayur", emoji: "🥬", tagline: "Hijau & renyah", color: "#3f9b53", shelves: ["Sayur Daun & Herba", "Sayur Buah & Polong", "Umbi, Bawang & Jamur"] },
  { id: "daging", name: "Daging", emoji: "🥩", tagline: "Potongan pilihan", color: "#b8323f", shelves: ["Sapi, Kambing & Domba", "Unggas"] },
  { id: "ikan", name: "Ikan & Seafood", emoji: "🐟", tagline: "Tangkapan hari ini", color: "#2f7fb8", shelves: ["Ikan Segar", "Udang, Cumi & Kerang", "Ikan Kering"] },
  { id: "susu-telur", name: "Tahu, Tempe & Telur", emoji: "🥚", tagline: "Protein harian", color: "#d9a21b", shelves: ["Tahu & Tempe", "Telur & Susu", "Keju & Mentega"] },
  { id: "karbo", name: "Beras & Karbo", emoji: "🍚", tagline: "Sumber energi", color: "#a0703c", shelves: ["Beras & Mi", "Umbi-umbian", "Roti & Pasta"] },
  { id: "bumbu", name: "Bumbu & Rempah", emoji: "🧄", tagline: "Rahasia rasa nusantara", color: "#7a5bb5", shelves: ["Bumbu Segar", "Daun Bumbu", "Rempah Kering"] },
  { id: "sembako", name: "Sembako & Kacang", emoji: "🥜", tagline: "Kebutuhan dapur", color: "#5b7f2e", shelves: ["Gula, Garam, Tepung & Minyak", "Kacang-kacangan", "Kecap & Madu"] },
];

/**
 * Foto bahan makanan asli berlatar transparan:
 * - TheMealDB (https://www.themealdb.com) — ditulis dengan nama bahan bahasa Inggris
 * - /produk/*.png — foto Wikimedia Commons yang latarnya sudah dihapus (kredit di README)
 */
const img = (name: string) => `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}.png`;

type Row = [id: string, name: string, photo: string, price: number, unit: string];
const P = (sectionId: string, shelf: string, rows: Row[]): Product[] =>
  rows.map(([id, name, photo, price, unit]) => ({ id, name, img: photo.startsWith("/") ? photo : img(photo), price, unit, sectionId, shelf }));

export const products: Product[] = [
  // ───────── Buah
  ...P("buah", "Buah Lokal", [
    ["pisang", "Pisang Cavendish", "Banana", 28000, "1 sisir"],
    ["mangga", "Mangga Harum Manis", "Mango", 32000, "1 kg"],
    ["nanas", "Nanas Madu Subang", "Pineapple", 15000, "1 buah"],
    ["jeruk", "Jeruk Medan", "Orange", 30000, "1 kg"],
    ["pepaya", "Pepaya California", "/produk/pepaya.png", 18000, "1 buah"],
    ["semangka", "Semangka Merah", "/produk/semangka.png", 40000, "1 buah (±4 kg)"],
    ["melon", "Melon Golden", "/produk/melon.png", 35000, "1 buah"],
    ["alpukat", "Alpukat Mentega", "Avocado", 40000, "1 kg"],
    ["jambu-biji", "Jambu Biji Merah", "/produk/jambu-biji.png", 20000, "1 kg"],
    ["jeruk-nipis", "Jeruk Nipis", "Lime", 15000, "500 g"],
    ["stroberi", "Stroberi Ciwidey", "Strawberries", 30000, "250 g"],
  ]),
  ...P("buah", "Buah Tropis", [
    ["salak", "Salak Pondoh", "/produk/salak.png", 22000, "1 kg"],
    ["rambutan", "Rambutan Binjai", "/produk/rambutan.png", 25000, "1 kg"],
    ["manggis", "Manggis", "/produk/manggis.png", 40000, "1 kg"],
    ["durian", "Durian Montong", "/produk/durian.png", 240000, "1 buah (±2 kg)"],
    ["buah-naga", "Buah Naga Merah", "/produk/buah-naga.png", 30000, "1 kg"],
    ["kelapa", "Kelapa Tua", "/produk/kelapa.png", 15000, "1 buah"],
  ]),
  ...P("buah", "Buah Impor", [
    ["apel", "Apel Fuji", "Apples", 45000, "1 kg"],
    ["pir", "Pir Hijau", "Pears", 40000, "1 kg"],
    ["anggur", "Anggur Hijau", "/produk/anggur.png", 45000, "500 g"],
    ["lemon", "Lemon", "Lemons", 25000, "3 buah"],
    ["persik", "Persik", "Peaches", 55000, "500 g"],
    ["delima", "Delima", "Pomegranate", 50000, "2 buah"],
    ["jeruk-bali", "Jeruk Bali Merah", "Grapefruit", 30000, "1 buah"],
    ["blueberry", "Blueberry", "Blueberries", 55000, "125 g"],
    ["raspberry", "Raspberry", "Raspberries", 75000, "125 g"],
    ["ceri", "Ceri Merah", "Cherry", 80000, "250 g"],
    ["buah-tin", "Buah Tin", "Figs", 90000, "250 g"],
  ]),

  // ───────── Sayur
  ...P("sayur", "Sayur Daun & Herba", [
    ["bayam", "Bayam Hijau", "Spinach", 5000, "1 ikat"],
    ["sawi-putih", "Sawi Putih", "Chinese Cabbage", 15000, "1 bonggol"],
    ["pakcoy", "Pakcoy", "Pak Choi", 8000, "250 g"],
    ["kol", "Kol / Kubis", "Cabbage", 12000, "1 buah"],
    ["kol-ungu", "Kol Ungu", "Red Cabbage", 20000, "1 buah"],
    ["brokoli", "Brokoli", "Broccoli", 25000, "500 g"],
    ["selada", "Selada Keriting", "Lettuce", 12000, "250 g"],
    ["selada-bulat", "Selada Bulat", "Iceberg Lettuce", 20000, "1 bonggol"],
    ["kale", "Kale", "Kale", 20000, "250 g"],
    ["kemangi", "Kemangi", "Basil", 3000, "1 ikat"],
    ["seledri", "Seledri", "Celery", 3000, "1 ikat"],
    ["daun-ketumbar", "Daun Ketumbar", "Coriander", 5000, "1 ikat"],
    ["daun-mint", "Daun Mint", "Mint", 8000, "1 pak (30 g)"],
    ["peterseli", "Peterseli", "Parsley", 15000, "1 pak (30 g)"],
  ]),
  ...P("sayur", "Sayur Buah & Polong", [
    ["tomat", "Tomat", "Tomato", 10000, "500 g"],
    ["tomat-ceri", "Tomat Ceri", "Cherry Tomatoes", 15000, "250 g"],
    ["timun", "Timun", "Cucumber", 7000, "500 g"],
    ["terong", "Terong Ungu", "Aubergine", 9000, "500 g"],
    ["jagung", "Jagung Manis", "/produk/jagung.png", 10000, "2 tongkol"],
    ["kacang-panjang", "Kacang Panjang", "Chinese Long Beans", 6000, "1 ikat"],
    ["buncis", "Buncis", "Green Beans", 8000, "250 g"],
    ["kacang-polong", "Kacang Polong", "Peas", 18000, "250 g (beku)"],
    ["tauge", "Tauge", "/produk/tauge.png", 4000, "250 g"],
    ["labu", "Labu Kuning", "Pumpkin", 14000, "1 kg"],
    ["labu-siam", "Labu Siam", "/produk/labu-siam.png", 6000, "500 g"],
    ["pare", "Pare", "/produk/pare.png", 10000, "500 g"],
    ["zukini", "Zukini", "Zucchini", 20000, "500 g"],
    ["paprika-merah", "Paprika Merah", "Red Pepper", 15000, "1 buah"],
    ["paprika-hijau", "Paprika Hijau", "Green Pepper", 12000, "1 buah"],
    ["paprika-kuning", "Paprika Kuning", "Yellow Pepper", 16000, "1 buah"],
    ["asparagus", "Asparagus", "Asparagus", 40000, "250 g"],
    ["petai", "Petai", "/produk/petai.png", 15000, "1 papan"],
    ["jengkol", "Jengkol", "/produk/jengkol.png", 25000, "500 g"],
  ]),
  ...P("sayur", "Umbi, Bawang & Jamur", [
    ["wortel", "Wortel", "Carrots", 10000, "500 g"],
    ["lobak", "Lobak Merah", "Radish", 15000, "250 g"],
    ["bawang-bombay", "Bawang Bombay", "Onions", 15000, "500 g"],
    ["bawang-bombay-merah", "Bawang Bombay Merah", "Red Onions", 20000, "500 g"],
    ["bawang-prei", "Bawang Prei", "Leek", 6000, "1 batang"],
    ["jamur-tiram", "Jamur Tiram", "Oyster Mushrooms", 10000, "250 g"],
    ["jamur", "Jamur Kancing", "Mushrooms", 15000, "200 g"],
    ["jamur-shiitake", "Jamur Shiitake", "Shiitake Mushrooms", 30000, "200 g"],
  ]),

  // ───────── Daging
  ...P("daging", "Sapi, Kambing & Domba", [
    ["sapi-has", "Daging Sapi Has Dalam", "Beef Fillet", 85000, "500 g"],
    ["sapi-potong", "Daging Sapi Potong", "Beef", 70000, "500 g"],
    ["sapi-giling", "Daging Sapi Giling", "Minced Beef", 65000, "500 g"],
    ["sandung-lamur", "Sandung Lamur", "Beef Brisket", 75000, "500 g"],
    ["kambing", "Daging Kambing", "Goat Meat", 75000, "500 g"],
    ["domba", "Daging Domba", "Lamb", 90000, "500 g"],
  ]),
  ...P("daging", "Unggas", [
    ["paha-ayam", "Ayam Fillet", "Chicken Thighs", 35000, "500 g"],
    ["ayam-utuh", "Ayam Utuh", "Chicken", 40000, "1 ekor (±1 kg)"],
    ["bebek", "Bebek", "Duck", 85000, "1 ekor (±1,3 kg)"],
  ]),

  // ───────── Ikan & Seafood
  ...P("ikan", "Ikan Segar", [
    ["bandeng", "Ikan Bandeng", "/produk/bandeng.png", 38000, "1 kg"],
    ["kembung", "Ikan Kembung", "Mackerel", 28000, "500 g"],
    ["nila", "Ikan Nila", "/produk/nila.png", 25000, "500 g"],
    ["lele", "Ikan Lele", "/produk/lele.png", 18000, "500 g"],
    ["kakap", "Ikan Kakap Merah", "Red Snapper", 55000, "500 g"],
    ["tongkol", "Ikan Tongkol", "Tuna", 30000, "500 g"],
    ["sarden", "Ikan Lemuru (Sarden)", "Sardines", 15000, "500 g"],
    ["kakap-putih", "Ikan Kakap Putih", "Sea Bass", 50000, "500 g"],
    ["dori", "Ikan Dori Fillet", "White Fish Fillets", 35000, "500 g"],
    ["kod", "Ikan Kod Fillet", "Cod", 150000, "500 g"],
    ["salmon", "Salmon Fillet", "Salmon", 120000, "250 g"],
  ]),
  ...P("ikan", "Udang, Cumi & Kerang", [
    ["udang", "Udang Vaname", "Prawns", 55000, "500 g"],
    ["udang-kupas", "Udang Kupas", "Shrimp", 75000, "500 g"],
    ["cumi", "Cumi-cumi Segar", "/produk/cumi.png", 45000, "500 g"],
    ["kerang", "Kerang Dara", "/produk/kerang.png", 20000, "500 g"],
    ["tiram", "Tiram Segar", "Oysters", 60000, "500 g"],
  ]),

  ...P("ikan", "Ikan Kering", [
    ["teri", "Ikan Teri Kering", "/produk/teri.png", 15000, "100 g"],
  ]),

  // ───────── Tahu, Tempe & Telur
  ...P("susu-telur", "Tahu & Tempe", [
    ["tahu", "Tahu Putih", "/produk/tahu.png", 8000, "5 potong"],
    ["tempe", "Tempe", "/produk/tempe.png", 7000, "1 papan"],
  ]),
  ...P("susu-telur", "Telur & Susu", [
    ["telur-ayam", "Telur Ayam Negeri", "Eggs", 20000, "10 butir"],
    ["telur-puyuh", "Telur Puyuh", "/produk/telur-puyuh.png", 12000, "20 butir"],
    ["telur-asin", "Telur Asin", "/produk/telur-asin.png", 18000, "4 butir"],
    ["susu", "Susu Segar", "Milk", 22000, "1 L"],
    ["susu-full", "Susu Full Cream", "Whole Milk", 40000, "2 L"],
  ]),
  ...P("susu-telur", "Keju & Mentega", [
    ["keju", "Keju Blok", "Cheese", 40000, "250 g"],
    ["parmesan", "Keju Parmesan", "Parmesan", 85000, "150 g"],
    ["mentega", "Mentega", "Melted Butter", 30000, "200 g"],
  ]),

  // ───────── Beras & Karbo
  ...P("karbo", "Beras & Mi", [
    ["beras", "Beras Pandan Wangi", "/produk/beras.png", 80000, "5 kg"],
    ["beras-merah", "Beras Merah & Hitam", "/produk/beras-merah.png", 25000, "1 kg"],
    ["mi-kering", "Mi Telur Kering", "/produk/mi-kering.png", 8000, "200 g"],
    ["bihun", "Bihun Jagung", "/produk/bihun.png", 7000, "175 g"],
  ]),
  ...P("karbo", "Umbi-umbian", [
    ["ubi", "Ubi Cilembu", "Sweet Potatoes", 22000, "1 kg"],
    ["singkong", "Singkong", "Cassava", 8000, "1 kg"],
    ["kentang", "Kentang Dieng", "Potatoes", 20000, "1 kg"],
  ]),
  ...P("karbo", "Roti & Pasta", [
    ["roti-tawar", "Roti Tawar", "Bread", 18000, "1 bungkus"],
    ["roti-sobek", "Roti Sobek", "Bread Rolls", 15000, "1 bungkus"],
    ["roti-bulat", "Roti Kampung", "Crusty Bread", 20000, "1 buah"],
    ["tortilla", "Tortilla", "Tortillas", 30000, "8 lembar"],
    ["spaghetti", "Spaghetti", "Spaghetti", 20000, "500 g"],
  ]),

  // ───────── Bumbu & Rempah
  ...P("bumbu", "Bumbu Segar", [
    ["bawang-merah", "Bawang Merah Brebes", "Shallots", 12000, "250 g"],
    ["bawang-putih", "Bawang Putih", "Garlic", 10000, "250 g"],
    ["cabai-merah", "Cabai Merah", "Red Chilli", 15000, "250 g"],
    ["cabai-hijau", "Cabai Hijau Besar", "Green Chilli", 10000, "250 g"],
    ["jahe", "Jahe", "Ginger", 4000, "100 g"],
    ["kunyit", "Kunyit", "/produk/kunyit.png", 3000, "100 g"],
    ["lengkuas", "Lengkuas", "Galangal", 3000, "100 g"],
  ]),
  ...P("bumbu", "Daun Bumbu", [
    ["serai", "Serai", "Lemongrass", 3000, "1 ikat"],
    ["daun-jeruk", "Daun Jeruk", "Lime Leaves", 2000, "1 ikat"],
    ["daun-salam", "Daun Salam", "Bay Leaf", 2000, "1 ikat"],
    ["daun-bawang", "Daun Bawang", "Spring Onions", 3000, "1 ikat"],
  ]),
  ...P("bumbu", "Rempah Kering", [
    ["merica", "Merica Butir", "/produk/merica.png", 18000, "100 g"],
    ["ketumbar", "Ketumbar", "/produk/ketumbar.png", 6000, "100 g"],
    ["jintan", "Jintan", "Cumin Seeds", 12000, "100 g"],
    ["pala", "Pala Bubuk", "Nutmeg", 15000, "50 g"],
    ["cengkeh", "Cengkeh", "Cloves", 12000, "50 g"],
    ["kayu-manis", "Kayu Manis", "Cinnamon Stick", 8000, "50 g"],
    ["bunga-lawang", "Bunga Lawang", "Star Anise", 12000, "50 g"],
    ["kapulaga", "Kapulaga", "Cardamom", 18000, "50 g"],
    ["cabai-bubuk", "Cabai Bubuk", "Chilli Powder", 12000, "100 g"],
  ]),

  // ───────── Sembako & Kacang
  ...P("sembako", "Gula, Garam, Tepung & Minyak", [
    ["gula-pasir", "Gula Pasir", "/produk/gula-pasir.png", 18000, "1 kg"],
    ["garam", "Garam Dapur", "/produk/garam.png", 5000, "500 g"],
    ["tepung", "Tepung Terigu", "/produk/tepung.png", 13000, "1 kg"],
    ["santan", "Santan Kelapa Segar", "/produk/santan.png", 8000, "250 ml"],
    ["gula-aren", "Gula Aren", "/produk/gula-merah.png", 12000, "250 g"],
    ["minyak-goreng", "Minyak Goreng", "/produk/minyak.png", 19000, "1 L"],
  ]),
  ...P("sembako", "Kacang-kacangan", [
    ["kacang-tanah", "Kacang Tanah", "Peanuts", 18000, "500 g"],
    ["kacang-hijau", "Kacang Hijau", "/produk/kacang-hijau.png", 16000, "500 g"],
    ["kacang-merah", "Kacang Merah", "/produk/kacang-merah.png", 22000, "500 g"],
    ["kacang-mete", "Kacang Mete", "Cashew Nuts", 60000, "250 g"],
    ["almond", "Almond", "Almonds", 55000, "250 g"],
  ]),
  ...P("sembako", "Kecap & Madu", [
    ["kecap", "Kecap Manis", "Dark Soy Sauce", 14000, "275 ml"],
    ["madu", "Madu Murni", "Honey", 55000, "350 g"],
  ]),
];

export const productById = Object.fromEntries(products.map((p) => [p.id, p]));

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
