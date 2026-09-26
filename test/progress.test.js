// Tes unit untuk perhitungan kemajuan belajar. Jalankan: npm test
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeProgress } = require('../src/services/progress');
const { addDays, previousSchoolDays, isWeekend } = require('../src/utils/date');

const rounds = ['Awal', 'Putaran 2', 'Putaran 3', 'Putaran 4'].map((name, i) => ({ id: `r${i + 1}`, name }));
const student = (id) => ({ id, full_name: `Siswa ${id}` });
const results = (subject, map) => Object.entries(map).flatMap(([sid, levels]) => levels
  .map((level, i) => (level === null ? null : { student_id: sid, round_id: `r${i + 1}`, subject, level }))
  .filter(Boolean));

test('persentase capai target dihitung dari hasil terbaru tiap siswa', () => {
  const students = ['a', 'b', 'c', 'd'].map(student);
  const as = results('literasi', { a: [3, 4, 5, 5], b: [2, 3, 4, 5], c: [4, 5, 5, 5], d: [1, 2, 3, 4] });
  const p = computeProgress(students, rounds, as).literasi;
  assert.equal(p.baseline_pct, 0);
  assert.equal(p.current_pct, 75);
  assert.equal(p.baseline_round, 'Awal');
  assert.equal(p.latest_round, 'Putaran 4');
  assert.equal(p.improved, 4);
});

test('siswa yang tidak naik dalam tiga tes terakhir masuk daftar pendampingan', () => {
  const students = ['tetap', 'naik', 'target', 'baru'].map(student);
  const as = results('numerasi', {
    tetap: [2, 2, 2, 2], // tidak naik -> pendampingan
    naik: [1, 1, 2, 3], // masih naik -> bukan pendampingan
    target: [5, 5, 5, 5], // sudah capai target -> bukan pendampingan
    baru: [null, null, 1, 1], // baru dua kali dites -> belum bisa dinilai
  });
  const p = computeProgress(students, rounds, as).numerasi;
  assert.deepEqual(p.stuck.map((s) => s.id), ['tetap']);
});

test('siswa yang belum dites di putaran aktif terdeteksi dan tidak masuk kelompok', () => {
  const students = ['a', 'b', 'c'].map(student);
  const as = results('literasi', { a: [2, 3, 3, 4], b: [3, 3, 4, null] });
  const p = computeProgress(students, rounds, as).literasi;
  assert.deepEqual(p.not_assessed.map((s) => s.id).sort(), ['b', 'c']);
  const grouped = p.groups.flatMap((g) => g.students.map((s) => s.id));
  assert.deepEqual(grouped.sort(), ['a', 'b']);
  assert.equal(p.groups.find((g) => g.level === 4).students.length, 2);
});

test('sebaran tingkat per putaran sesuai jumlah siswa', () => {
  const students = ['a', 'b', 'c'].map(student);
  const as = results('literasi', { a: [1, 2, null, null], b: [1, 5, null, null], c: [3, null, null, null] });
  const p = computeProgress(students, rounds, as).literasi;
  const awal = p.per_round.find((r) => r.name === 'Awal');
  assert.deepEqual(awal.counts, [2, 0, 1, 0, 0]);
  assert.equal(awal.assessed, 3);
  const p2 = p.per_round.find((r) => r.name === 'Putaran 2');
  assert.equal(p2.pct_at_target, 50);
});

test('tanpa hasil tes, persentase kosong (bukan 0)', () => {
  const p = computeProgress([student('a')], rounds, []).numerasi;
  assert.equal(p.current_pct, null);
  assert.equal(p.baseline_pct, null);
  assert.equal(p.not_assessed.length, 1);
});

test('hari sekolah melewati Sabtu dan Minggu', () => {
  // 2026-09-28 adalah hari Senin
  assert.deepEqual(previousSchoolDays('2026-09-28', 3), ['2026-09-28', '2026-09-25', '2026-09-24']);
  assert.equal(isWeekend('2026-09-26'), true);
  assert.equal(addDays('2026-09-30', 2), '2026-10-02');
});
