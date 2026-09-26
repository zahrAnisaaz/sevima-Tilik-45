// Tes unit untuk pustaka aktivitas dan asisten AI (mode tanpa API key). Jalankan: npm test
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test';
process.env.ANTHROPIC_API_KEY = ''; // paksa mode bawaan agar tes tidak memanggil API

const test = require('node:test');
const assert = require('node:assert/strict');
const { getActivities } = require('../src/services/activities');
const ai = require('../src/services/ai');
const { computeProgress } = require('../src/services/progress');

test('setiap tingkat literasi dan numerasi punya minimal dua aktivitas bawaan', () => {
  for (const subject of ['literasi', 'numerasi']) {
    for (let level = 1; level <= 5; level += 1) {
      const list = getActivities(subject, level);
      assert.ok(list.length >= 2, `${subject} tingkat ${level}`);
      list.forEach((a) => assert.ok(a.title && a.materials && a.steps.length >= 3));
    }
  }
});

test('tanpa API key, rencana aktivitas memakai pustaka bawaan', async () => {
  assert.equal(ai.isAIEnabled(), false);
  const plan = await ai.activityPlan({ subject: 'numerasi', level: 3, grade: 4, groupSize: 5, minutes: 45 });
  assert.equal(plan.mode, 'library');
  assert.match(plan.text, /menit/);
  assert.ok(plan.alternatives.length >= 1);
});

test('ringkasan kelas menyebut siswa yang perlu pendampingan dengan nama aslinya', async () => {
  const rounds = [1, 2, 3].map((i) => ({ id: `r${i}`, name: `Putaran ${i}` }));
  const students = [{ id: 'a', full_name: 'Rizky Ramadhan' }, { id: 'b', full_name: 'Salsa Nabila' }];
  const as = [['a', [2, 2, 2]], ['b', [3, 4, 5]]].flatMap(([sid, levels]) => ['literasi', 'numerasi']
    .flatMap((subject) => levels.map((level, i) => ({ student_id: sid, round_id: `r${i + 1}`, subject, level }))));
  const summary = await ai.classSummary({ name: '5A', grade: 5 }, computeProgress(students, rounds, as));
  assert.equal(summary.mode, 'rules');
  assert.match(summary.text, /Rizky Ramadhan/);
  assert.doesNotMatch(summary.text, /\[S\d+\]/);
  assert.match(summary.text, /50%/);
});
