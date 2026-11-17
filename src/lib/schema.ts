import { z } from "zod";

/** Teknik memasak — tiap langkah resep memilih satu, dipakai untuk ilustrasi langkah. */
export const techniques = [
  "siapkan", "cuci", "potong", "haluskan", "marinasi", "campur", "uleni", "bentuk", "isi",
  "rebus", "kukus", "goreng", "tumis", "panggang", "bakar", "blender", "saring",
  "diamkan", "balur", "tata", "sajikan",
] as const;
export type Technique = (typeof techniques)[number];

export const recipeSchema = z.object({
  subjudul: z.string().describe("1-2 kalimat menggugah selera, gaya panduan visual, mis. 'bola ketan kenyal berbalut kelapa parut dengan sensasi ledakan gula merah'"),
  sorotan: z
    .array(z.string())
    .describe("3-4 label tahapan inti dalam HURUF KAPITAL, sesuai jenis masakan, mis. ['BAHAN KULIT','PERSIAPAN ISIAN','TEKNIK REBUS (MENGAPUNG)','BALUR KELAPA']"),
  kelompokBahan: z
    .array(
      z.object({
        nama: z.string().describe("nama kelompok sesuai jenis masakan, mis. 'Bahan Kulit', 'Isian', 'Bumbu Halus', 'Bahan Kuah', 'Pelengkap'"),
        bahan: z.array(
          z.object({
            nama: z.string(),
            jumlah: z.string().describe("takaran yang BENAR-BENAR dipakai, harus lebih dari 0, mis. '250 g', '2 butir', '1 sdm'. Jangan pernah menulis 0 atau 'habis'"),
            productId: z.string().nullable().describe("id produk dari daftar keranjang (yang di dalam [kurung]) jika bahan ini dari keranjang; null untuk bahan dapur dasar"),
            persiapan: z.string().nullable().describe("cara menyiapkan bahan, mis. 'sisir halus', 'cincang', 'kukus dengan sedikit garam'; null jika tidak perlu"),
          }),
        ),
      }),
    )
    .describe("2-4 kelompok bahan; HANYA bahan yang benar-benar dipakai di langkah memasak"),
  tahapan: z
    .array(
      z.object({
        nama: z.string().describe("nama tahap sesuai proses masakan, mis. 'Adonan Kulit', 'Membuat Bumbu', 'Teknik Rebus & Balur', 'Menumis', 'Penyajian'"),
        langkah: z.array(
          z.object({
            teknik: z.string().describe("salah satu teknik: " + techniques.join(", ")),
            instruksi: z
              .string()
              .describe(
                "2-3 kalimat instruksi DETAIL seperti di buku resep: sebut bahan & takarannya, ukuran potongan, besar api (kecil/sedang/besar), durasi dalam menit, dan ciri visual yang harus dicapai. Mis. 'Panaskan 3 sdm minyak di wajan dengan api sedang. Masukkan 6 siung bawang merah iris, tumis 2-3 menit sambil diaduk hingga layu dan harum.'",
              ),
            kataKunciFoto: z
              .string()
              .describe("kata kunci pencarian Google Images (Bahasa Indonesia, 3-6 kata) yang menggambarkan PROSES langkah ini secara visual, mis. 'mengiris daging sapi tipis', 'menumis bawang merah cabai di wajan'"),
            bahanTerkait: z.array(z.string()).describe("productId bahan keranjang yang dipakai pada langkah ini (boleh kosong)"),
            catatan: z.string().nullable().describe("tips singkat atau tanda keberhasilan langkah ini, mis. 'Awalnya akan tenggelam'; null jika tidak ada"),
          }),
        ),
      }),
    )
    .describe("3-4 tahap sesuai proses masakan, total 7-12 langkah. Setiap bahan di kelompokBahan harus muncul di minimal satu langkah"),
  tandaMatang: z.string().describe("ciri masakan sudah matang/berhasil, mis. 'Klepon mengapung di permukaan'"),
  penyajian: z.string().describe("saran penyajian, mis. 'Sajikan hangat di atas daun pisang'"),
});

export const recommendationSchema = z.object({
  ringkasan: z.string().describe("1-2 kalimat ringkasan rencana makan dari bahan belanjaan"),
  menus: z
    .array(
      z.object({
        nama: z.string(),
        emoji: z.string().describe("1 emoji yang mewakili masakan"),
        kataKunciFoto: z
          .string()
          .describe("kata kunci pencarian Google Images (Bahasa Indonesia, 2-5 kata) untuk foto hidangan jadi ini; WAJIB memuat nama bahan utamanya (mis. ikan tongkol, daging sapi, tempe), pakai nama masakan umum yang mudah ditemukan, mis. 'oseng daging sapi pedas', 'sop daging sapi kunyit'"),
        jenis: z.string().describe("jenis masakan, mis. 'Jajanan Pasar', 'Tumisan', 'Sup', 'Gorengan', 'Salad', 'Minuman'"),
        waktuMakan: z.enum(["Sarapan", "Makan Siang", "Makan Malam", "Camilan"]),
        deskripsi: z.string().describe("1 kalimat menggugah selera"),
        porsi: z.number().int().describe("jumlah porsi yang dihasilkan"),
        waktuMasakMenit: z.number().int(),
        kesulitan: z.enum(["Mudah", "Sedang", "Sulit"]),
        resep: recipeSchema,
        nutrisiPerPorsi: z.object({
          kalori: z.number().describe("kkal"),
          protein: z.number().describe("gram"),
          karbohidrat: z.number().describe("gram"),
          lemak: z.number().describe("gram"),
          lemakJenuh: z.number().describe("gram"),
          serat: z.number().describe("gram"),
          gula: z.number().describe("gram"),
          natrium: z.number().describe("miligram"),
          kolesterol: z.number().describe("miligram"),
        }),
        vitaminMineral: z
          .array(z.object({ nama: z.string(), persenAKG: z.number().describe("persen Angka Kecukupan Gizi harian per porsi") }))
          .describe("3-5 vitamin/mineral paling menonjol"),
        indeksGlikemik: z.enum(["Rendah", "Sedang", "Tinggi"]),
        skorKesehatan: z.number().describe("1-10"),
        label: z
          .array(z.string())
          .describe("label gizi yang AKURAT, mis. 'Tinggi Protein', 'Rendah Gula', 'Kaya Serat'. 'Vegan' hanya jika tanpa daging/ikan/seafood/telur/susu/madu; 'Vegetarian' hanya jika tanpa daging/ikan/seafood"),
        manfaat: z.array(z.string()).describe("2-3 manfaat kesehatan"),
        perhatian: z.array(z.string()).describe("alergen atau catatan untuk kondisi tertentu (diabetes, hipertensi, dll). Boleh kosong."),
        saranBahan: z
          .array(z.object({ productId: z.string().describe("id produk persis dari KATALOG TOKO"), alasan: z.string().describe("1 kalimat singkat kenapa bahan ini melengkapi menu, mis. 'tambah protein nabati'") }))
          .describe("1-3 bahan dari KATALOG TOKO yang BELUM ada di keranjang, yang membuat menu ini lebih lengkap/bergizi/enak"),
      }),
    )
    .describe("3-5 menu dengan jenis masakan yang bervariasi"),
  sisaBahan: z.array(z.object({ nama: z.string(), saran: z.string() })).describe("bahan keranjang yang tidak terpakai/bersisa & saran pakainya"),
  tipsGizi: z.array(z.string()).describe("2-4 tips gizi umum berdasarkan keseluruhan belanjaan"),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
export type Menu = Recommendation["menus"][number];
