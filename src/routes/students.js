const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { assertStudentAccess } = require('../services/access');
const { getRounds } = require('../services/progress');
const { unwrap } = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const router = express.Router();
router.use(requireAuth);

// Riwayat tingkat kemampuan satu siswa
router.get('/:id', asyncHandler(async (req, res) => {
  const student = await assertStudentAccess(req.user, req.params.id);
  const [rounds, assessments] = await Promise.all([
    getRounds(req.user.school_id),
    unwrap(supabaseAdmin.from('assessments').select('round_id, subject, level, note, assessed_on, assessed_by')
      .eq('student_id', student.id)),
  ]);
  const assessorIds = [...new Set(assessments.map((a) => a.assessed_by).filter(Boolean))];
  const assessors = assessorIds.length
    ? await unwrap(supabaseAdmin.from('profiles').select('id, full_name').in('id', assessorIds)) : [];
  const nameOf = new Map(assessors.map((a) => [a.id, a.full_name]));

  res.json({
    student: { id: student.id, full_name: student.full_name, active: student.active },
    class: { id: student.class.id, name: student.class.name, grade: student.class.grade },
    rounds,
    assessments: assessments.map((a) => ({ ...a, assessed_by_name: nameOf.get(a.assessed_by) || null })),
  });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const student = await assertStudentAccess(req.user, req.params.id);
  const patch = {};
  if (req.body?.full_name !== undefined) {
    const name = String(req.body.full_name).trim();
    if (!name || name.length > 100) throw new HttpError(400, 'Nama siswa wajib diisi (maksimal 100 karakter)');
    patch.full_name = name;
  }
  if (req.body?.active !== undefined) patch.active = Boolean(req.body.active);
  if (!Object.keys(patch).length) throw new HttpError(400, 'Tidak ada perubahan');
  const updated = await unwrap(supabaseAdmin.from('students').update(patch).eq('id', student.id).select().single());
  res.json({ student: updated });
}));

module.exports = router;
