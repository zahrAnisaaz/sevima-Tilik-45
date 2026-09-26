const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getAccessibleClasses } = require('../services/access');
const { summarizeClasses } = require('../services/progress');
const { NATIONAL_REFERENCE } = require('../config/levels');
const { todayJakarta } = require('../utils/date');
const { unwrap } = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

// Dashboard kepala sekolah
router.get('/overview', asyncHandler(async (req, res) => {
  const classes = await getAccessibleClasses(req.user);
  const summary = await summarizeClasses(classes, req.user.school_id);
  const teachers = await unwrap(supabaseAdmin.from('profiles').select('id, full_name').eq('school_id', req.user.school_id));
  const nameOf = new Map(teachers.map((t) => [t.id, t.full_name]));
  res.json({
    rounds: summary.rounds,
    school: summary.school,
    classes: summary.classes.map((c) => ({ ...c, teacher_name: nameOf.get(c.teacher_id) || null })),
    national_reference: NATIONAL_REFERENCE,
  });
}));

// ---------- Kelas ----------
async function assertTeacher(teacherId, schoolId) {
  const t = await unwrap(supabaseAdmin.from('profiles').select('id, role, school_id').eq('id', teacherId).maybeSingle());
  if (!t || t.school_id !== schoolId) throw new HttpError(400, 'Guru tidak ditemukan di sekolah ini');
}

router.get('/classes', asyncHandler(async (req, res) => {
  const [classes, students] = await Promise.all([
    unwrap(supabaseAdmin.from('classes').select('*').eq('school_id', req.user.school_id).order('grade').order('name')),
    unwrap(supabaseAdmin.from('students').select('class_id').eq('school_id', req.user.school_id).eq('active', true)),
  ]);
  res.json({ classes: classes.map((c) => ({ ...c, total_students: students.filter((s) => s.class_id === c.id).length })) });
}));

router.post('/classes', asyncHandler(async (req, res) => {
  const { name, grade, teacher_id } = req.body || {};
  const g = Number(grade);
  if (!name || !String(name).trim()) throw new HttpError(400, 'Nama kelas wajib diisi');
  if (!Number.isInteger(g) || g < 1 || g > 6) throw new HttpError(400, 'Kelas (tingkat) harus 1–6');
  if (teacher_id) await assertTeacher(teacher_id, req.user.school_id);
  const cls = await unwrap(supabaseAdmin.from('classes').insert({
    school_id: req.user.school_id, name: String(name).trim(), grade: g, teacher_id: teacher_id || null,
  }).select().single());
  res.status(201).json({ class: cls });
}));

router.patch('/classes/:id', asyncHandler(async (req, res) => {
  const cls = await unwrap(supabaseAdmin.from('classes').select('id, school_id').eq('id', req.params.id).maybeSingle());
  if (!cls || cls.school_id !== req.user.school_id) throw new HttpError(404, 'Kelas tidak ditemukan');
  const { name, grade, teacher_id } = req.body || {};
  const patch = {};
  if (name !== undefined) {
    if (!String(name).trim()) throw new HttpError(400, 'Nama kelas tidak boleh kosong');
    patch.name = String(name).trim();
  }
  if (grade !== undefined) {
    const g = Number(grade);
    if (!Number.isInteger(g) || g < 1 || g > 6) throw new HttpError(400, 'Kelas (tingkat) harus 1–6');
    patch.grade = g;
  }
  if (teacher_id !== undefined) {
    if (teacher_id) await assertTeacher(teacher_id, req.user.school_id);
    patch.teacher_id = teacher_id || null;
  }
  const updated = await unwrap(supabaseAdmin.from('classes').update(patch).eq('id', cls.id).select().single());
  res.json({ class: updated });
}));

// ---------- Guru ----------
router.get('/teachers', asyncHandler(async (req, res) => {
  const teachers = await unwrap(supabaseAdmin.from('profiles').select('id, full_name, role, created_at')
    .eq('school_id', req.user.school_id).order('full_name'));
  res.json({ teachers });
}));

router.post('/teachers', asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body || {};
  if (!email || !password || String(password).length < 8 || !String(full_name || '').trim()) {
    throw new HttpError(400, 'Nama, email, dan kata sandi (minimal 8 karakter) wajib diisi');
  }
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: String(email).trim(), password, email_confirm: true, user_metadata: { full_name: String(full_name).trim() },
  });
  if (error) throw new HttpError(400, error.message);
  const { error: pErr } = await supabaseAdmin.from('profiles').insert({
    id: created.user.id, full_name: String(full_name).trim(), role: 'teacher', school_id: req.user.school_id,
  });
  if (pErr) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    throw pErr;
  }
  res.status(201).json({ teacher: { id: created.user.id, full_name: String(full_name).trim(), email } });
}));

// ---------- Putaran tes ----------
router.get('/rounds', asyncHandler(async (req, res) => {
  const rounds = await unwrap(supabaseAdmin.from('rounds').select('*').eq('school_id', req.user.school_id)
    .order('started_on', { ascending: false }).order('created_at', { ascending: false }));
  res.json({ rounds });
}));

router.post('/rounds', asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name || name.length > 60) throw new HttpError(400, 'Nama putaran wajib diisi (maksimal 60 karakter)');
  const round = await unwrap(supabaseAdmin.from('rounds').insert({
    school_id: req.user.school_id, name, started_on: todayJakarta(),
  }).select().single());
  res.status(201).json({ round });
}));

module.exports = router;
