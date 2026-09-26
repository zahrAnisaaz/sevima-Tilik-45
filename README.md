# 🌱 Tilik — Ajar Sesuai Tingkat

*Diagnostik literasi & numerasi dasar dan pengelompokan belajar sesuai tingkat kemampuan untuk SD kelas 3–6.*

**Tilik** (bahasa Jawa: *menengok*) membantu guru menengok kemampuan siswa yang sebenarnya, bukan sekadar kelasnya. Guru melakukan tes singkat satu per satu (1–3 menit per siswa), aplikasi menentukan tingkat kemampuan, mengelompokkan siswa sesuai tingkat, menyarankan aktivitas untuk tiap kelompok, dan memantau kemajuan setiap dua minggu.

---

## Kaitan dengan SDG 4

| Target / indikator | Kaitan |
|---|---|
| **4.1.1** Proporsi anak yang mencapai kemampuan minimum membaca dan matematika | Inti produk: mengukur dan menaikkan persentase siswa yang mencapai kemampuan dasar literasi dan numerasi |
| **4.5** Kesetaraan akses pendidikan | Siswa yang tertinggal mendapat pembelajaran sesuai tingkatnya, bukan dibiarkan tertinggal dari materi kelas |
| **4.c** Dukungan untuk guru | Guru dibantu membaca data kemampuan siswa dan menyusun aktivitas yang tepat |

## Masalah (data nyata)

- Menurut **Rapor Pendidikan 2025** (Kemendikdasmen, dirilis Juni 2026), pada jenjang SD baru **65,66%** murid mencapai kompetensi minimum **literasi** dan **59,45%** untuk **numerasi**. Artinya sekitar 4 dari 10 siswa SD belum menguasai numerasi dasar.
- Dalam satu kelas, kemampuan siswa sangat beragam, tetapi pembelajaran umumnya mengikuti materi kelas yang sama untuk semua siswa. Siswa yang belum menguasai dasar makin tertinggal.

## Solusi berbasis bukti: Teaching at the Right Level (TaRL)

- Serangkaian evaluasi acak (RCT) oleh peneliti **J-PAL** selama sekitar 15 tahun menunjukkan TaRL menghasilkan sebagian peningkatan belajar terbesar di antara program pendidikan yang dievaluasi secara ketat. Kuncinya: mengelompokkan siswa berdasarkan tingkat kemampuan, bukan usia atau kelas.
- Evaluasi yang sama menemukan bahwa **pelatihan guru atau bahan ajar saja tidak cukup**. Hasil belajar naik ketika guru dipandu tujuan yang jelas, **dibantu memahami data kemampuan anak**, dan didampingi secara berkelanjutan. Tilik dibuat untuk bagian ini: membuat data kemampuan siswa mudah dikumpulkan, dipahami, dan ditindaklanjuti.
- Pendekatan ini sejalan dengan **pembelajaran berdiferensiasi** dalam Kurikulum Merdeka.

Sumber: J-PAL, *Teaching at the Right Level to improve learning*; Kompas/Antara, *Rapor Pendidikan 2025* (Juni 2026).

---

## Tingkat kemampuan

| Tingkat | Literasi | Numerasi |
|---|---|---|
| 1 | Pemula: belum mengenal sebagian besar huruf | Pemula: belum mengenal angka 1–9 |
| 2 | Huruf: mengenal huruf, belum bisa membaca kata | Angka 1–9: belum mengenal angka puluhan |
| 3 | Kata: bisa membaca kata, belum lancar kalimat | Angka 10–99: belum bisa pengurangan bersusun |
| 4 | Paragraf: bisa membaca paragraf, belum lancar cerita dengan paham | Pengurangan: bisa pengurangan dengan meminjam, belum pembagian |
| **5** | **Cerita: lancar membaca cerita dan memahami isinya** | **Pembagian: operasi hitung dasar lengkap** |

Tingkat 5 = **mencapai kemampuan dasar**.

### Cara kerja tes terpandu

Tes dimulai dari soal tingkat menengah, lalu naik atau turun sesuai jawaban, sehingga tidak semua soal perlu dikerjakan (gaya tes ASER):

```
Literasi:  Paragraf ──bisa──► Cerita + 2 pertanyaan ──bisa──► 5 Cerita
              │                        └──belum──► 4 Paragraf
              └──belum──► Kata ──bisa──► 3 Kata
                           └──belum──► Huruf ──bisa──► 2 Huruf / belum ──► 1 Pemula

Numerasi:  Pengurangan ──bisa──► Pembagian ──bisa──► 5 / belum ──► 4
              └──belum──► Angka 10–99 ──bisa──► 3
                           └──belum──► Angka 1–9 ──bisa──► 2 / belum ──► 1
```

Guru hanya menekan **Bisa** atau **Belum bisa**. Soal disusun sendiri untuk aplikasi ini dan tersedia dalam dua variasi agar tidak dihafal antarputaran.

---

## Fitur

**Guru kelas**
- Tes diagnostik terpandu per siswa, dengan petunjuk dan kunci jawaban untuk guru serta tampilan besar untuk dibaca siswa. Setelah disimpan, aplikasi otomatis pindah ke siswa berikutnya yang belum dites.
- Halaman kelas: persentase siswa yang mencapai kemampuan dasar, grafik sebaran tingkat per putaran tes, dan jumlah siswa yang naik tingkat.
- **Kelompok belajar sesuai tingkat** dengan tombol **Rencana aktivitas** per kelompok (dari asisten AI atau pustaka bawaan).
- Daftar **perlu pendampingan** (tidak naik tingkat dalam tiga tes terakhir) dan **belum dites** di putaran aktif.
- Riwayat perkembangan tiap siswa dan pengelolaan daftar siswa.

**Kepala sekolah**
- Dashboard sekolah per mata uji, perbandingan antarkelas, dan konteks angka nasional Rapor Pendidikan.
- Memulai putaran tes baru (dianjurkan tiap ±2 minggu), membuat kelas, menetapkan guru kelas, dan membuat akun guru.

**Asisten AI (opsional)**
- Menyusun rencana aktivitas untuk kelompok tertentu, bisa disesuaikan dengan konteks sekolah (misalnya sekolah pesisir).
- Merangkum kemajuan kelas dan menyarankan prioritas minggu ini.
- **Tidak ada nama siswa yang dikirim ke AI** (diganti kode `[S1]`, dikembalikan di server). Tanpa API key, semua fitur memakai aturan dan pustaka aktivitas bawaan, sehingga demo tetap berjalan.

---

## Teknologi

Node.js 18+, Express, Supabase (PostgreSQL + Auth), frontend HTML/CSS/JS tanpa build step, Anthropic Claude API (opsional).

```
tilik/
├── supabase/schema.sql         # skema database (jalankan sekali)
├── scripts/seed.js             # data demo
├── test/                       # tes unit (npm test)
├── docs/proses-pengembangan.md # catatan pemanfaatan AI selama pengembangan
├── public/                     # frontend (index.html, styles.css, app.js)
└── src/
    ├── index.js                # server Express (API + frontend)
    ├── config/levels.js        # definisi tingkat & acuan nasional
    ├── services/
    │   ├── progress.js         # ⭐ perhitungan kemajuan & kelompok
    │   ├── activities.js       # pustaka aktivitas per tingkat
    │   ├── ai.js               # asisten AI dengan pseudonimisasi
    │   └── access.js           # hak akses guru vs kepala sekolah
    └── routes/                 # auth, meta, classes, students, assessments, activities, admin
```

## Cara menjalankan

1. Buat project di [supabase.com](https://supabase.com).
2. **SQL Editor** → tempel isi `supabase/schema.sql` → **Run**. Jika sebelumnya pernah menjalankan skema versi lama, buat project baru agar tabelnya bersih.
3. Salin `.env.example` menjadi `.env`, isi:
   - `SUPABASE_URL` persis `https://xxxx.supabase.co` (tanpa garis miring di akhir)
   - `SUPABASE_ANON_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` (atau *publishable* dan *secret key* pada project baru)
   - *(opsional)* `ANTHROPIC_API_KEY`
4. Jalankan:
   ```
   npm install
   npm test          # tes unit logika inti (opsional)
   npm run seed
   npm run dev
   ```
   Buka `http://localhost:3000`.

### Akun demo (kata sandi `tilik12345`)

| Email | Peran |
|---|---|
| `guru4a@tilik.demo` | Guru kelas 4A (Bu Rina) |
| `guru5a@tilik.demo` | Guru kelas 5A (Pak Dimas) |
| `kepsek@tilik.demo` | Kepala sekolah (Bu Ratna) |

Data demo berisi 2 kelas × 14 siswa dan 4 putaran tes. Putaran 4 sedang berjalan dan baru separuh siswa yang dites, sehingga alur tes bisa langsung didemokan.

**Alur demo (±3 menit):** masuk sebagai `guru4a` → buka kelas 4A dan tunjukkan kenaikan persentase dari tes Awal → tunjukkan kelompok belajar dan minta rencana aktivitas → tekan **Mulai tes**, tes satu siswa secara langsung → masuk sebagai `kepsek` untuk menunjukkan gambaran sekolah dan konteks nasional.

---

## API ringkas

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/login` | Masuk |
| GET | `/api/meta` | Definisi tingkat, putaran aktif, status AI |
| GET | `/api/classes` | Kelas yang bisa diakses + ringkasan |
| GET | `/api/classes/:id` | Kemajuan, kelompok, perlu pendampingan, belum dites |
| POST | `/api/classes/:id/students` | `{ names }` satu nama per baris |
| POST | `/api/classes/:id/ai-summary` | Ringkasan asisten |
| POST | `/api/assessments` | `{ student_id, subject, level, note? }` disimpan di putaran aktif |
| GET/PATCH | `/api/students/:id` | Riwayat siswa / ubah nama atau status aktif |
| POST | `/api/activities/plan` | `{ class_id, subject, level, minutes, context? }` |
| GET | `/api/admin/overview` | Dashboard kepala sekolah |
| GET/POST/PATCH | `/api/admin/classes`, `/api/admin/teachers`, `/api/admin/rounds` | Pengelolaan |

## Proses pengembangan

Tilik dibangun dengan bantuan asisten AI. Keputusan produk, riset yang dipakai, cara pengujian, dan perbaikan dari uji coba dicatat di [`docs/proses-pengembangan.md`](docs/proses-pengembangan.md). Riwayat commit repo ini menunjukkan urutan pembangunannya tahap demi tahap (`git log --oneline`).

## Batasan yang perlu disampaikan saat pitch

- Tes diagnostik Tilik adalah **alat bantu kelas**, bukan pengganti Asesmen Nasional. Angka Rapor Pendidikan ditampilkan sebagai konteks, bukan pembanding langsung.
- Soal tes perlu divalidasi bersama guru SD sebelum dipakai luas.
- Hasil tes lisan dipengaruhi cara guru menilai; karena itu setiap langkah menyertakan kriteria "dianggap bisa jika" yang sama untuk semua guru.
- Aplikasi tidak menggantikan guru: aplikasi membantu guru melihat siapa butuh apa, dan guru yang mengajar.
