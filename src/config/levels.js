/**
 * Tingkat kemampuan dasar, diadaptasi dari pendekatan asesmen sederhana ala ASER/TaRL.
 * Tingkat 5 = siswa mencapai kemampuan dasar untuk mata uji tersebut.
 */
const TARGET_LEVEL = 5;

const LEVELS = {
  literasi: [
    { level: 1, name: 'Pemula', desc: 'Belum mengenal sebagian besar huruf' },
    { level: 2, name: 'Huruf', desc: 'Mengenal huruf, belum bisa membaca kata' },
    { level: 3, name: 'Kata', desc: 'Bisa membaca kata sederhana, belum lancar membaca kalimat' },
    { level: 4, name: 'Paragraf', desc: 'Bisa membaca paragraf pendek, belum lancar membaca cerita dengan paham' },
    { level: 5, name: 'Cerita', desc: 'Lancar membaca cerita dan memahami isinya' },
  ],
  numerasi: [
    { level: 1, name: 'Pemula', desc: 'Belum mengenal angka 1–9' },
    { level: 2, name: 'Angka 1–9', desc: 'Mengenal angka satuan, belum mengenal angka puluhan' },
    { level: 3, name: 'Angka 10–99', desc: 'Mengenal angka puluhan, belum bisa pengurangan bersusun' },
    { level: 4, name: 'Pengurangan', desc: 'Bisa pengurangan dua angka dengan meminjam, belum bisa pembagian' },
    { level: 5, name: 'Pembagian', desc: 'Bisa pembagian sederhana; operasi hitung dasar lengkap' },
  ],
};

const SUBJECTS = ['literasi', 'numerasi'];
const SUBJECT_LABEL = { literasi: 'Literasi', numerasi: 'Numerasi' };

// Acuan nasional untuk konteks (ukuran berbeda: AKM, bukan tes diagnostik ini)
const NATIONAL_REFERENCE = {
  source: 'Rapor Pendidikan 2025, Kemendikdasmen (jenjang SD)',
  literasi: 65.66,
  numerasi: 59.45,
  note: 'Persentase murid SD yang mencapai kompetensi minimum pada Asesmen Nasional. Alat ukurnya berbeda dengan tes diagnostik Tilik, jadi gunakan sebagai konteks, bukan pembanding langsung.',
};

const levelInfo = (subject, level) => LEVELS[subject]?.find((l) => l.level === level) || null;

module.exports = { TARGET_LEVEL, LEVELS, SUBJECTS, SUBJECT_LABEL, NATIONAL_REFERENCE, levelInfo };
