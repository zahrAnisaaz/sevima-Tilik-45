/**
 * Pustaka aktivitas bawaan per tingkat. Dipakai saat asisten AI tidak aktif,
 * dan sebagai pilihan alternatif di samping rencana dari AI.
 * Prinsip: bahan murah dan mudah didapat, belajar sambil bermain, kelompok kecil.
 */
const LIBRARY = {
  literasi: {
    1: [
      { title: 'Huruf di sekitar kita', minutes: 30, materials: 'Kartu huruf dari kardus bekas, spidol',
        steps: ['Perkenalkan 3 huruf per pertemuan, mulai dari huruf vokal a, i, u, e, o.', 'Siswa menyebut bunyi huruf lalu mencari benda di kelas yang namanya berawalan huruf itu.', 'Siswa menulis huruf di udara, di pasir, atau di punggung teman.', 'Tutup dengan mengulang huruf dari pertemuan sebelumnya.'] },
      { title: 'Tepuk suku kata nama', minutes: 30, materials: 'Tidak perlu bahan',
        steps: ['Siswa duduk melingkar dan menyebut nama masing-masing sambil bertepuk per suku kata (Bu-nga = dua tepuk).', 'Guru menulis huruf awal setiap nama di papan.', 'Siswa mencocokkan dirinya dengan huruf awal namanya.', 'Ulangi dengan nama benda di sekitar kelas.'] },
    ],
    2: [
      { title: 'Rangkai suku kata', minutes: 40, materials: 'Kartu suku kata (ba, bi, bu, ka, ki, ku, ...)',
        steps: ['Bagikan kartu suku kata ke tiap pasangan siswa.', 'Pasangan menggabungkan dua kartu menjadi kata bermakna (bu + ku = buku).', 'Setiap pasangan membacakan kata temuannya ke kelompok.', 'Tulis kata-kata temuan di papan dan baca bersama.'] },
      { title: 'Memancing kata', minutes: 40, materials: 'Potongan kertas berbentuk ikan berisi suku kata, klip, magnet atau kail sederhana',
        steps: ['Siswa bergiliran memancing dua ikan.', 'Siswa membaca kedua suku kata lalu mencoba menggabungkannya.', 'Kalau menjadi kata bermakna, siswa menyimpannya; kalau tidak, ikan dikembalikan.', 'Siswa dengan kata terbanyak membacakan semua katanya.'] },
    ],
    3: [
      { title: 'Kalimat dari gambar', minutes: 40, materials: 'Gambar sederhana (dari buku bekas atau digambar guru)',
        steps: ['Tunjukkan satu gambar dan tanyakan apa yang terjadi.', 'Tulis kalimat pendek 3–4 kata dari jawaban siswa, lalu baca bersama.', 'Siswa menambah satu kalimat lagi tentang gambar yang sama.', 'Siswa membaca kalimatnya sendiri ke teman sebelah.'] },
      { title: 'Baca berpasangan', minutes: 40, materials: 'Daftar kata dan kalimat pendek',
        steps: ['Pasangkan siswa; satu membaca, satu menyimak.', 'Mulai dari daftar kata, lalu naik ke kalimat pendek.', 'Penyimak membantu jika temannya salah, lalu bertukar peran.', 'Guru berkeliling dan mencatat kata yang sering keliru.'] },
    ],
    4: [
      { title: 'Baca bersama lalu ceritakan ulang', minutes: 45, materials: 'Paragraf pendek bertema kehidupan sehari-hari',
        steps: ['Guru membacakan paragraf dengan jelas sebagai contoh.', 'Siswa membaca bergiliran, satu kalimat per siswa.', 'Setiap siswa menceritakan ulang isi paragraf dengan kata-katanya sendiri.', 'Diskusikan kata-kata baru dan artinya.'] },
      { title: 'Kartu pertanyaan', minutes: 45, materials: 'Kartu bertuliskan siapa, apa, di mana, kapan, mengapa',
        steps: ['Siswa membaca paragraf dalam hati, lalu bersuara.', 'Siswa mengambil kartu pertanyaan secara acak.', 'Siswa menjawab pertanyaan sesuai kartu berdasarkan isi bacaan.', 'Kelompok menilai apakah jawabannya ada di bacaan.'] },
    ],
    5: [
      { title: 'Menulis cerita pendek', minutes: 60, materials: 'Buku tulis',
        steps: ['Siswa menulis 5–7 kalimat tentang pengalaman sehari-hari.', 'Tukar tulisan dengan teman dan saling membacakan.', 'Pembaca mengajukan satu pertanyaan tentang cerita temannya.', 'Penulis memperbaiki cerita berdasarkan pertanyaan itu.'] },
      { title: 'Klub buku mini', minutes: 60, materials: 'Buku cerita anak atau bacaan dari perpustakaan sekolah',
        steps: ['Kelompok memilih satu cerita yang lebih panjang.', 'Setiap siswa membaca satu bagian dengan lancar.', 'Diskusikan pertanyaan "mengapa" dan "bagaimana jika".', 'Siswa membuat akhir cerita versi mereka sendiri.'] },
    ],
  },
  numerasi: {
    1: [
      { title: 'Menghitung benda nyata', minutes: 30, materials: 'Batu kecil, tutup botol, atau lidi; kartu angka 1–9',
        steps: ['Siswa menghitung sejumlah benda sambil menunjuk satu per satu.', 'Siswa mencocokkan jumlah benda dengan kartu angka yang tepat.', 'Guru menyebut angka, siswa mengambil benda sebanyak itu.', 'Ulangi dengan angka yang berbeda secara acak.'] },
      { title: 'Lompat angka', minutes: 30, materials: 'Kapur untuk menggambar kotak angka di lantai atau halaman',
        steps: ['Gambar kotak berisi angka 1–9 secara acak di lantai.', 'Guru menyebut angka, siswa melompat ke kotak yang benar.', 'Siswa bergantian menjadi penyebut angka.', 'Tingkatkan dengan menyebut dua angka berturut-turut.'] },
    ],
    2: [
      { title: 'Ikat lidi puluhan', minutes: 40, materials: 'Lidi atau sedotan, karet gelang',
        steps: ['Siswa menghitung 10 lidi lalu mengikatnya menjadi satu ikat.', 'Bentuk angka dengan ikatan dan lidi lepas (2 ikat + 3 lidi = 23).', 'Siswa menulis dan menyebut angka yang dibentuk.', 'Guru menyebut angka puluhan, siswa membentuknya dengan lidi.'] },
      { title: 'Kartu nilai tempat', minutes: 40, materials: 'Kartu puluhan (10, 20, ... 90) dan kartu satuan (1–9)',
        steps: ['Siswa menyusun kartu puluhan dan satuan menjadi satu angka (40 + 7 = 47).', 'Siswa membaca angka yang terbentuk dengan lantang.', 'Guru menyebut angka, siswa mencari pasangan kartu yang tepat.', 'Bandingkan dua angka: mana yang lebih besar dan mengapa.'] },
    ],
    3: [
      { title: 'Pasar-pasaran', minutes: 45, materials: 'Uang mainan pecahan 10 dan 1, barang dagangan dari benda di kelas',
        steps: ['Sebagian siswa menjadi penjual dengan harga di bawah 100.', 'Pembeli membayar dan penjual menghitung kembalian.', 'Saat kembalian kurang, siswa menukar uang 10 dengan sepuluh uang 1.', 'Siswa menuliskan transaksinya sebagai kalimat pengurangan.'] },
      { title: 'Pinjam seikat', minutes: 45, materials: 'Ikatan lidi puluhan dan lidi lepas',
        steps: ['Bentuk angka pertama dengan ikatan dan lidi lepas.', 'Kurangi dengan angka kedua; jika lidi lepas tidak cukup, buka satu ikatan.', 'Hubungkan langkah membuka ikatan dengan "meminjam" di pengurangan bersusun.', 'Siswa mengerjakan soal bersusun sambil tetap memegang lidi.'] },
    ],
    4: [
      { title: 'Bagi rata', minutes: 45, materials: 'Benda kecil yang bisa dihitung (biji, kancing, batu)',
        steps: ['Kelompok membagi sejumlah benda sama rata ke beberapa piring.', 'Siswa menuliskan hasilnya sebagai kalimat pembagian (12 : 3 = 4).', 'Coba jumlah yang tidak habis dibagi dan bahas sisanya.', 'Siswa membuat soal bagi rata untuk kelompok lain.'] },
      { title: 'Baris dan kolom', minutes: 45, materials: 'Benda kecil atau gambar titik di kertas',
        steps: ['Susun benda menjadi beberapa baris yang sama panjang.', 'Tulis perkalian dari susunan itu (3 baris x 4 = 12).', 'Balik pertanyaannya: 12 benda dibagi 3 baris, berapa per baris?', 'Siswa menemukan hubungan perkalian dan pembagian sendiri.'] },
    ],
    5: [
      { title: 'Soal cerita dari lingkungan', minutes: 60, materials: 'Buku tulis',
        steps: ['Siswa membuat soal cerita dari kehidupan sehari-hari (pasar, panen, jajan).', 'Tukar soal dengan kelompok lain dan selesaikan.', 'Pembuat soal memeriksa jawaban dan menjelaskan caranya.', 'Pilih satu soal paling menarik untuk dibahas bersama.'] },
      { title: 'Ukur dan bandingkan', minutes: 60, materials: 'Penggaris, meteran kain, atau tali',
        steps: ['Siswa mengukur panjang benda di kelas dengan jengkal lalu dengan penggaris.', 'Hitung selisih panjang dua benda.', 'Bagi tali menjadi 2 dan 4 bagian sama panjang untuk mengenal pecahan.', 'Siswa mempresentasikan temuan pengukurannya.'] },
    ],
  },
};

const getActivities = (subject, level) => LIBRARY[subject]?.[level] || [];

function formatActivity(a) {
  return [
    `${a.title} (${a.minutes} menit)`,
    `Bahan: ${a.materials}`,
    ...a.steps.map((s) => `- ${s}`),
  ].join('\n');
}

module.exports = { getActivities, formatActivity, LIBRARY };
