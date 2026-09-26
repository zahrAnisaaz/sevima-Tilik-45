# Proses Pengembangan Tilik dengan Bantuan AI

Dokumen ini mencatat bagaimana tim memakai asisten AI (Claude) selama membangun Tilik: dari riset masalah, memilih ide, berganti arah, sampai menulis dan menguji kode. Tujuannya agar juri bisa melihat **apa yang dikerjakan AI, apa yang diputuskan tim, dan bagaimana hasilnya diperiksa**.

## Ringkasan alur

```
Riset masalah SDG 4 ─► Ideasi 4 konsep ─► Prototipe v1–v2 (kesejahteraan siswa)
        ─► Evaluasi terhadap kriteria hackathon ─► Pivot ke "Ajar Sesuai Tingkat" (v3)
        ─► Pembangunan bertahap (riwayat commit repo ini) ─► Pengujian ─► Perbaikan dari uji lapangan
```

## Tahap demi tahap

| Tahap | Yang dikerjakan AI | Keputusan dan peran tim |
|---|---|---|
| 1. Riset masalah | Mencari jurnal dan artikel tentang tantangan SDG 4 di Indonesia (kesenjangan akses, kualitas pembelajaran, implementasi Kurikulum Merdeka) | Menentukan bahwa solusinya berbentuk website/aplikasi |
| 2. Ideasi | Mengusulkan 4 konsep aplikasi, lalu 4 konsep yang lebih "segar" setelah tim menilai ide pertama terlalu umum | Menolak ide *adaptive learning* karena sudah banyak dipakai; memilih ide deteksi dini hambatan non-akademik |
| 3. Prototipe v1–v2 | Membangun backend lalu full stack "Tilik" versi kesejahteraan siswa (check-in harian, sinyal perlu dukungan, dashboard guru) | Mengarahkan positioning agar tidak menjadi "aplikasi kesehatan mental"; memilih mempertahankan nama **Tilik** dan tidak memakai nama "EduPulse" setelah AI menemukan nama itu sudah dipakai produk lain |
| 4. Evaluasi | Menilai kecocokan tiap kriteria penjurian secara jujur, termasuk risikonya: tema rawan dianggap SDG 3 dan data perasaan anak di bawah umur bersifat sensitif | Memutuskan **berganti arah** ke tema yang lebih kuat di SDG 4 |
| 5. Pivot ke v3 | Mencari data terbaru (Rapor Pendidikan 2025) dan bukti ilmiah (evaluasi TaRL oleh J-PAL), lalu mengusulkan "Ajar Sesuai Tingkat" | Menyetujui tema baru yang langsung menyasar indikator SDG 4.1.1 |
| 6. Pembangunan v3 | Menulis skema database, API, logika kemajuan, pustaka aktivitas, asisten AI, dan frontend. Urutannya terlihat di riwayat commit repo ini | Meminta setiap proses tercatat sebagai commit terpisah agar terlihat di repo |
| 7. Pengujian | Menguji logika perhitungan dengan data contoh, menulis tes unit (`npm test`), dan memeriksa semua halaman lewat tangkapan layar browser otomatis dengan server tiruan (tampilan laptop dan HP) | Menjalankan aplikasi di laptop dengan Supabase sungguhan |
| 8. Perbaikan dari uji lapangan | Mendiagnosis error `Invalid path specified in request URL` saat `npm run seed`, lalu menambahkan normalisasi `SUPABASE_URL` dan pesan petunjuk | Menemukan error tersebut saat menjalankan seed di Windows |

## Prinsip yang dipegang saat memakai AI

- **AI tidak mengambil keputusan produk.** Pilihan ide, nama, arah tema, dan pivot diputuskan tim setelah membaca pertimbangan dari AI.
- **Klaim harus bersumber.** Angka di aplikasi dan pitch diambil dari sumber yang bisa dicek (Rapor Pendidikan 2025, J-PAL). Angka nasional ditampilkan sebagai konteks, bukan pembanding langsung, karena alat ukurnya berbeda.
- **Kode diuji, bukan dipercaya begitu saja.** Logika inti punya tes unit, dan bug yang ditemukan saat pengujian (misalnya ringkasan kelas membaca format data yang salah) diperbaiki sebelum dirilis.
- **Privasi dirancang sejak awal.** Siswa tidak perlu akun, dan fitur AI di dalam produk tidak pernah menerima nama siswa (diganti kode `[S1]`, `[S2]`, lalu dikembalikan di server).

## Tentang riwayat commit

Riwayat commit di repo ini menyusun ulang pembangunan versi 3 secara bertahap, dari inisialisasi proyek sampai dokumentasi, dengan satu commit per langkah logis. Waktu commit mencerminkan kapan repo disusun, bukan kapan setiap bagian pertama kali ditulis. Kode prototipe v1–v2 tidak disertakan karena arah produknya sudah diganti; prosesnya dicatat di tabel di atas.

## Daftar periksa tim sebelum submit

- [ ] `npm test` lulus di laptop tim
- [ ] `schema.sql` dan `npm run seed` berhasil di project Supabase yang dipakai untuk demo
- [ ] Alur demo dicoba minimal sekali dari awal sampai akhir (masuk, lihat kelas, tes satu siswa, dashboard kepala sekolah)
- [ ] Soal tes diagnostik ditinjau oleh minimal satu guru SD
- [ ] Jika asisten AI diaktifkan, `ANTHROPIC_API_KEY` diuji sebelum presentasi
- [ ] Catatan tambahan tim tentang bagian yang diperiksa atau diubah secara manual:
  - …
