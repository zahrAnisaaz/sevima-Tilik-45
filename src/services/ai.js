/**
 * ASISTEN AI TILIK
 * 1. Menyusun rencana aktivitas untuk satu kelompok belajar sesuai tingkat.
 * 2. Merangkum kemajuan kelas untuk guru.
 *
 * Prinsip: nama siswa tidak dikirim ke AI (diganti kode [S1], [S2], ...);
 * tanpa ANTHROPIC_API_KEY, semua fitur memakai versi bawaan berbasis aturan.
 */
const { getActivities, formatActivity } = require('./activities');
const { levelInfo, SUBJECT_LABEL, TARGET_LEVEL } = require('../config/levels');

const pctText = (v) => `${String(v).replace('.', ',')}%`;
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.AI_MODEL || 'claude-haiku-4-5-20251001';
const isAIEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const SYSTEM = [
  'Kamu adalah asisten untuk guru SD di Indonesia yang menerapkan pembelajaran sesuai tingkat kemampuan (Teaching at the Right Level).',
  'Aturan:',
  '- Gunakan bahasa Indonesia yang sederhana dan praktis untuk guru.',
  '- Aktivitas harus menyenangkan, aktif, memakai bahan murah atau yang tersedia di sekitar sekolah.',
  '- Sesuaikan dengan tingkat kemampuan kelompok, bukan dengan kelas atau usia.',
  '- Jangan memberi label negatif pada siswa. Sebut siswa hanya dengan kodenya, misalnya [S1].',
  '- Jangan memakai format markdown tebal atau judul bertanda #.',
].join('\n');

async function callClaude(userContent, maxTokens = 700) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system: SYSTEM, messages: [{ role: 'user', content: userContent }] }),
    });
    if (!res.ok) throw new Error(`AI API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Rencana aktivitas kelompok ----------
async function activityPlan({ subject, level, grade, groupSize, minutes, context }) {
  const info = levelInfo(subject, level);
  const library = getActivities(subject, level);
  const fallback = {
    mode: 'library',
    text: library.length ? formatActivity(library[0]) : 'Belum ada aktivitas bawaan untuk tingkat ini.',
    alternatives: library.slice(1).map(formatActivity),
  };
  if (!isAIEnabled()) return fallback;

  const prompt = [
    `Susun rencana aktivitas ${minutes} menit untuk satu kelompok belajar ${SUBJECT_LABEL[subject].toLowerCase()}.`,
    `Tingkat kelompok: ${info.name} (${info.desc}).`,
    level < TARGET_LEVEL
      ? `Tujuan: membantu siswa naik ke tingkat berikutnya (${levelInfo(subject, level + 1).name}).`
      : 'Kelompok ini sudah mencapai kemampuan dasar; berikan pengayaan yang menantang.',
    `Jumlah siswa: ${groupSize}. Siswa kelas ${grade} SD.`,
    context ? `Konteks sekolah dari guru: ${String(context).slice(0, 200)}` : '',
    '',
    'Format jawaban (teks biasa):',
    'Baris 1: judul aktivitas dan durasi.',
    'Baris 2: "Tujuan: ..." satu kalimat.',
    'Baris 3: "Bahan: ..."',
    'Lalu 4–6 langkah, setiap baris diawali "- ", sertakan pembagian waktu.',
    'Baris terakhir: "Cek keberhasilan: ..." cara guru tahu siswa siap naik tingkat.',
    'Maksimal 220 kata.',
  ].filter(Boolean).join('\n');

  try {
    return { mode: 'ai', text: await callClaude(prompt, 700), alternatives: library.map(formatActivity) };
  } catch (err) {
    console.error('[AI] rencana aktivitas gagal, memakai pustaka bawaan:', err.message);
    return { ...fallback, note: 'Asisten AI sedang tidak tersedia.' };
  }
}

// ---------- Ringkasan kemajuan kelas ----------
function ruleSummary(cls, subjects) {
  const lines = [];
  for (const [subject, s] of Object.entries(subjects)) {
    const label = SUBJECT_LABEL[subject];
    if (s.current_pct === null) { lines.push(`${label}: belum ada hasil tes.`); continue; }
    const change = s.baseline_pct !== null && s.baseline_round !== s.latest_round
      ? ` (dari ${pctText(s.baseline_pct)} pada tes ${s.baseline_round})` : '';
    lines.push(`${label}: ${pctText(s.current_pct)} siswa sudah mencapai kemampuan dasar${change}. ${s.improved} siswa naik tingkat sejak tes pertama.`);
    const biggest = [...s.groups].filter((g) => g.level < TARGET_LEVEL).sort((x, y) => y.jumlah - x.jumlah)[0];
    if (biggest?.jumlah) {
      lines.push(`- Kelompok terbesar yang belum mencapai target ada di tingkat ${levelInfo(subject, biggest.level).name} (${biggest.jumlah} siswa). Prioritaskan waktu belajar kelompok ini.`);
    }
    if (s.stuck.length) lines.push(`- ${s.stuck.length} siswa belum naik tingkat dalam tiga tes terakhir: ${s.stuck.map((x) => x.code).join(', ')}. Pertimbangkan pendampingan individual.`);
    if (s.belum_dites) lines.push(`- ${s.belum_dites} siswa belum dites pada putaran ini.`);
  }
  return lines.join('\n');
}

async function classSummary(cls, subjects) {
  // Pseudonimisasi: nama siswa diganti kode sebelum dikirim
  const codes = new Map();
  const codeOf = (s) => {
    if (!codes.has(s.id)) codes.set(s.id, { code: `[S${codes.size + 1}]`, name: s.full_name });
    return codes.get(s.id).code;
  };
  const compact = {};
  for (const [subject, s] of Object.entries(subjects)) {
    compact[subject] = {
      putaran: s.per_round.map((r) => ({ nama: r.name, dites: r.assessed, sebaran_tingkat_1_sampai_5: r.counts, persen_capai_target: r.pct_at_target })),
      baseline_pct: s.baseline_pct, current_pct: s.current_pct, baseline_round: s.baseline_round, latest_round: s.latest_round,
      improved: s.improved,
      groups: s.groups.map((g) => ({ level: g.level, jumlah: g.students.length })),
      stuck: s.stuck.map((x) => ({ code: codeOf(x), level: x.level })),
      belum_dites: s.not_assessed.length,
    };
  }
  const restore = (text) => text.replace(/\[S\d+\]/g, (c) => [...codes.values()].find((v) => v.code === c)?.name || c);

  if (!isAIEnabled()) return { mode: 'rules', text: restore(ruleSummary(cls, compact)) };

  const prompt = [
    `Data kemajuan kelas ${cls.grade} SD (kelas ${cls.name}). Tingkat 5 = mencapai kemampuan dasar.`,
    'Tulis ringkasan untuk guru: satu paragraf (maks. 3 kalimat) tentang kemajuan literasi dan numerasi,',
    'lalu baris "Langkah minggu ini:" diikuti 3 baris berawalan "- " berisi rekomendasi konkret',
    '(misalnya kelompok mana yang diprioritaskan, siswa berkode mana yang perlu pendampingan). Maksimal 180 kata.',
    '',
    JSON.stringify(compact),
  ].join('\n');
  try {
    return { mode: 'ai', text: restore(await callClaude(prompt, 600)) };
  } catch (err) {
    console.error('[AI] ringkasan kelas gagal:', err.message);
    return { mode: 'rules', text: restore(ruleSummary(cls, compact)), note: 'Asisten AI sedang tidak tersedia.' };
  }
}

module.exports = { isAIEnabled, activityPlan, classSummary, MODEL };
