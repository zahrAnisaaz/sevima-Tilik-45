/**
 * Perhitungan kemajuan belajar: sebaran tingkat per putaran, persentase siswa yang
 * mencapai kemampuan dasar, kelompok belajar sesuai tingkat, dan siswa yang perlu perhatian.
 */
const { supabaseAdmin } = require('../config/supabase');
const { unwrap } = require('../utils/db');
const { TARGET_LEVEL, SUBJECTS } = require('../config/levels');

const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : null);

async function getRounds(schoolId) {
  return unwrap(supabaseAdmin.from('rounds').select('id, name, started_on, created_at')
    .eq('school_id', schoolId).order('started_on').order('created_at'));
}

const activeRound = (rounds) => (rounds.length ? rounds[rounds.length - 1] : null);

/** Menghitung ringkasan kemajuan untuk sekumpulan siswa. */
function computeProgress(students, rounds, assessments) {
  const roundIndex = new Map(rounds.map((r, i) => [r.id, i]));
  const current = activeRound(rounds);
  const result = {};

  for (const subject of SUBJECTS) {
    const rows = assessments.filter((a) => a.subject === subject);

    // Riwayat tingkat per siswa, urut putaran
    const history = new Map(students.map((s) => [s.id, []]));
    rows.forEach((a) => history.get(a.student_id)?.push({ round_index: roundIndex.get(a.round_id), round_id: a.round_id, level: a.level }));
    history.forEach((h) => h.sort((x, y) => x.round_index - y.round_index));

    // Sebaran tingkat per putaran
    const perRound = rounds.map((r) => {
      const inRound = rows.filter((a) => a.round_id === r.id);
      const counts = [1, 2, 3, 4, 5].map((lv) => inRound.filter((a) => a.level === lv).length);
      const atTarget = inRound.filter((a) => a.level >= TARGET_LEVEL).length;
      return { round_id: r.id, name: r.name, started_on: r.started_on, assessed: inRound.length, counts, at_target: atTarget, pct_at_target: pct(atTarget, inRound.length) };
    }).filter((r) => r.assessed > 0 || r.round_id === current?.id);

    // Tingkat terkini per siswa + kelompok belajar
    const levels = students.map((s) => {
      const h = history.get(s.id);
      const last = h[h.length - 1] || null;
      const first = h[0] || null;
      const prev = h.length >= 2 ? h[h.length - 2] : null;
      const assessedThisRound = !!current && h.some((x) => x.round_id === current.id);
      // Perlu pendampingan: tidak naik tingkat dalam tiga tes terakhir dan belum mencapai target
      const third = h.length >= 3 ? h[h.length - 3] : null;
      const stuck = !!(third && last && last.level <= third.level && last.level < TARGET_LEVEL);
      return {
        student_id: s.id, full_name: s.full_name,
        level: last?.level ?? null, first_level: first?.level ?? null, prev_level: prev?.level ?? null,
        assessed_this_round: assessedThisRound, stuck, rounds_assessed: h.length,
      };
    });

    const groups = [1, 2, 3, 4, 5].map((lv) => ({
      level: lv,
      students: levels.filter((l) => l.level === lv).map((l) => ({ id: l.student_id, full_name: l.full_name })),
    }));

    const assessedStudents = levels.filter((l) => l.level !== null);
    const baseline = perRound.find((r) => r.assessed > 0) || null;
    const latest = [...perRound].reverse().find((r) => r.assessed > 0) || null;

    result[subject] = {
      per_round: perRound,
      groups,
      baseline_pct: baseline?.pct_at_target ?? null,
      baseline_round: baseline?.name ?? null,
      current_pct: pct(assessedStudents.filter((l) => l.level >= TARGET_LEVEL).length, assessedStudents.length),
      latest_round: latest?.name ?? null,
      improved: levels.filter((l) => l.first_level !== null && l.level > l.first_level).length,
      not_assessed: levels.filter((l) => !l.assessed_this_round).map((l) => ({ id: l.student_id, full_name: l.full_name, level: l.level })),
      stuck: levels.filter((l) => l.stuck).map((l) => ({ id: l.student_id, full_name: l.full_name, level: l.level })),
      students: levels,
    };
  }
  return result;
}

async function loadClassData(cls, schoolId) {
  const [students, rounds] = await Promise.all([
    unwrap(supabaseAdmin.from('students').select('id, full_name').eq('class_id', cls.id).eq('active', true).order('full_name')),
    getRounds(schoolId),
  ]);
  const assessments = students.length
    ? await unwrap(supabaseAdmin.from('assessments').select('student_id, round_id, subject, level')
      .in('student_id', students.map((s) => s.id)))
    : [];
  return { students, rounds, assessments };
}

async function classOverview(cls, schoolId) {
  const { students, rounds, assessments } = await loadClassData(cls, schoolId);
  return {
    class: { id: cls.id, name: cls.name, grade: cls.grade, teacher_id: cls.teacher_id },
    active_round: activeRound(rounds),
    total_students: students.length,
    subjects: computeProgress(students, rounds, assessments),
  };
}

module.exports = { getRounds, activeRound, computeProgress, loadClassData, classOverview, pct };

/** Ringkasan beberapa kelas sekaligus (untuk beranda guru dan dashboard kepala sekolah). */
async function summarizeClasses(classes, schoolId) {
  const rounds = await getRounds(schoolId);
  if (!classes.length) return { rounds, classes: [], school: null };
  const students = await unwrap(supabaseAdmin.from('students').select('id, full_name, class_id')
    .in('class_id', classes.map((c) => c.id)).eq('active', true));
  const assessments = students.length
    ? await unwrap(supabaseAdmin.from('assessments').select('student_id, round_id, subject, level')
      .in('student_id', students.map((s) => s.id)))
    : [];

  const brief = (progress) => Object.fromEntries(Object.entries(progress).map(([subject, p]) => [subject, {
    current_pct: p.current_pct, baseline_pct: p.baseline_pct, baseline_round: p.baseline_round,
    assessed_this_round: p.students.filter((s) => s.assessed_this_round).length,
    improved: p.improved, stuck: p.stuck.length,
  }]));

  const perClass = classes.map((c) => {
    const own = students.filter((s) => s.class_id === c.id);
    const ids = new Set(own.map((s) => s.id));
    const progress = computeProgress(own, rounds, assessments.filter((a) => ids.has(a.student_id)));
    return { ...c, total_students: own.length, subjects: brief(progress) };
  });

  const schoolProgress = computeProgress(students, rounds, assessments);
  const school = {
    total_students: students.length,
    subjects: Object.fromEntries(Object.entries(schoolProgress).map(([subject, p]) => [subject, {
      per_round: p.per_round, current_pct: p.current_pct, baseline_pct: p.baseline_pct,
      baseline_round: p.baseline_round, improved: p.improved, stuck: p.stuck.length,
    }])),
  };
  return { rounds, classes: perClass, school };
}

module.exports.summarizeClasses = summarizeClasses;
