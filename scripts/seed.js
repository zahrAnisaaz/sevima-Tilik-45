/**
 * Data demo untuk presentasi. Jalankan SEKALI di database kosong: npm run seed
 * Kata sandi semua akun demo: tilik12345
 *
 * Isi demo:
 *   - SD Demo Tilik, kelas 4A (Bu Rina) dan 5A (Pak Dimas), masing-masing 14 siswa
 *   - 4 putaran tes: Awal, Putaran 2, Putaran 3 (tiap 2 minggu), dan Putaran 4 (sedang berjalan)
 *   - Sebagian besar siswa naik tingkat bertahap; beberapa siswa tertahan
 *     (muncul di "Perlu pendampingan")
 */
require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');
const { todayJakarta, addDays } = require('../src/utils/date');
const { unwrap } = require('../src/utils/db');

const PASSWORD = 'tilik12345';

// Pembangkit acak dengan seed tetap, agar data demo selalu sama
function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}
const rand = rng(20260926);
const pickWeighted = (weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i += 1) { r -= weights[i]; if (r < 0) return i + 1; }
  return weights.length;
};

async function createUser(email, full_name, role, school_id) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true, user_metadata: { full_name },
  });
  if (error) throw new Error(`Gagal membuat ${email}: ${error.message}`);
  await unwrap(supabaseAdmin.from('profiles').insert({ id: data.user.id, full_name, role, school_id }));
  return { id: data.user.id, full_name };
}

const NAMES_4A = ['Aditya Pratama', 'Aisyah Putri', 'Bayu Saputra', 'Citra Lestari', 'Dimas Arya', 'Eka Wulandari',
  'Fajar Nugroho', 'Gita Maharani', 'Hana Safitri', 'Irfan Maulana', 'Joko Susilo', 'Kirana Dewi', 'Lukman Hakim', 'Maya Anggraini'];
const NAMES_5A = ['Nadia Rahma', 'Oki Setiawan', 'Putri Ayu', 'Rizky Ramadhan', 'Salsa Nabila', 'Taufik Hidayat',
  'Umi Kalsum', 'Vino Pratama', 'Wulan Sari', 'Yoga Permana', 'Zahra Aulia', 'Andi Firmansyah', 'Bella Oktaviani', 'Cahyo Wibowo'];

// Sebaran tingkat awal (bobot tingkat 1..5) — numerasi sengaja lebih rendah, sesuai tren nasional
const START = {
  '4A': { literasi: [1, 3, 4, 3, 2], numerasi: [2, 4, 4, 2, 1] },
  '5A': { literasi: [1, 2, 3, 4, 4], numerasi: [1, 3, 4, 3, 2] },
};
// Siswa yang sengaja tertahan (indeks dalam daftar nama) per mata uji
const STUCK = {
  '4A': { literasi: [2], numerasi: [6, 10] },
  '5A': { literasi: [3], numerasi: [3, 9] },
};

async function main() {
  console.log('🌱 Membuat data demo Tilik — Ajar Sesuai Tingkat...');
  const school = await unwrap(supabaseAdmin.from('schools').insert({ name: 'SD Demo Tilik' }).select().single());

  await createUser('kepsek@tilik.demo', 'Bu Ratna', 'admin', school.id);
  const rina = await createUser('guru4a@tilik.demo', 'Bu Rina', 'teacher', school.id);
  const dimas = await createUser('guru5a@tilik.demo', 'Pak Dimas', 'teacher', school.id);

  const today = todayJakarta();
  const rounds = await unwrap(supabaseAdmin.from('rounds').insert([
    { school_id: school.id, name: 'Awal', started_on: addDays(today, -42) },
    { school_id: school.id, name: 'Putaran 2', started_on: addDays(today, -28) },
    { school_id: school.id, name: 'Putaran 3', started_on: addDays(today, -14) },
    { school_id: school.id, name: 'Putaran 4', started_on: addDays(today, -1) },
  ]).select());
  rounds.sort((a, b) => (a.started_on < b.started_on ? -1 : 1));

  const setup = [
    { name: '4A', grade: 4, teacher: rina, names: NAMES_4A },
    { name: '5A', grade: 5, teacher: dimas, names: NAMES_5A },
  ];

  for (const c of setup) {
    const cls = await unwrap(supabaseAdmin.from('classes').insert({
      school_id: school.id, name: c.name, grade: c.grade, teacher_id: c.teacher.id,
    }).select().single());
    const students = await unwrap(supabaseAdmin.from('students').insert(
      c.names.map((full_name) => ({ full_name, class_id: cls.id, school_id: school.id })),
    ).select());
    students.sort((a, b) => c.names.indexOf(a.full_name) - c.names.indexOf(b.full_name));

    const rows = [];
    for (const subject of ['literasi', 'numerasi']) {
      students.forEach((st, idx) => {
        const stuck = STUCK[c.name][subject].includes(idx);
        let level = stuck ? Math.min(pickWeighted(START[c.name][subject]), 2) : pickWeighted(START[c.name][subject]);
        rounds.forEach((round, r) => {
          if (r > 0 && !stuck && level < 5 && rand() < 0.6) level += 1;
          // Putaran 4 baru berjalan: baru sekitar separuh siswa yang dites
          if (r === rounds.length - 1 && idx >= Math.ceil(students.length / 2)) return;
          rows.push({
            student_id: st.id, round_id: round.id, subject, level,
            assessed_by: c.teacher.id, assessed_on: addDays(round.started_on, 1 + (idx % 3)),
          });
        });
      });
    }
    await unwrap(supabaseAdmin.from('assessments').insert(rows));
    console.log(`  • Kelas ${c.name}: ${students.length} siswa, ${rows.length} hasil tes`);
  }

  console.log('\n✅ Selesai! Akun demo (kata sandi: tilik12345):');
  console.log('   kepsek@tilik.demo → Kepala sekolah (dashboard sekolah, kelola kelas & putaran)');
  console.log('   guru4a@tilik.demo → Wali kelas 4A');
  console.log('   guru5a@tilik.demo → Wali kelas 5A');
  console.log('\n💡 Tips demo: masuk sebagai guru4a, buka kelas 4A, lalu tekan "Mulai tes" untuk siswa yang belum dites di Putaran 4.');
}

main().catch((err) => {
  console.error('❌ Seed gagal:', err.message || err);
  if (/Invalid path/i.test(err.message || '')) console.error('   Periksa SUPABASE_URL di .env: harus persis https://xxxx.supabase.co');
  process.exit(1);
});
