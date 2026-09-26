const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { assertStudentAccess } = require('../services/access');
const { getRounds, activeRound } = require('../services/progress');
const { SUBJECTS, levelInfo } = require('../config/levels');
const { todayJakarta } = require('../utils/date');
const { unwrap } = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const router = express.Router();
router.use(requireAuth);

// Menyimpan hasil tes diagnostik pada putaran aktif (menimpa hasil lama di putaran yang sama)
router.post('/', asyncHandler(async (req, res) => {
  const { student_id, subject, level, note } = req.body || {};
  if (!SUBJECTS.includes(subject)) throw new HttpError(400, "subject harus 'literasi' atau 'numerasi'");
  const lv = Number(level);
  if (!Number.isInteger(lv) || lv < 1 || lv > 5) throw new HttpError(400, 'level harus bilangan bulat 1–5');
  if (note != null && (typeof note !== 'string' || note.length > 300)) throw new HttpError(400, 'Catatan maksimal 300 karakter');

  const student = await assertStudentAccess(req.user, student_id);
  if (!student.active) throw new HttpError(400, 'Siswa ini sudah tidak aktif');

  const round = activeRound(await getRounds(req.user.school_id));
  if (!round) throw new HttpError(409, 'Belum ada putaran tes. Minta kepala sekolah memulai putaran tes terlebih dahulu.', 'NO_ROUND');

  const row = await unwrap(supabaseAdmin.from('assessments').upsert({
    student_id: student.id, round_id: round.id, subject, level: lv,
    note: note?.trim() || null, assessed_by: req.user.id, assessed_on: todayJakarta(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'student_id,round_id,subject' }).select().single());

  res.status(201).json({ assessment: row, round, level_info: levelInfo(subject, lv) });
}));

module.exports = router;
